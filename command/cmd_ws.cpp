#include <vector>

#include <uWS/uWS.h>
#include <tao/json.hpp>

#include "overlay.h"
#include "db.h"


static const char *overlayDbPath = "./overlay.db/";
static const char *bindHost = "0.0.0.0";
static const int bindPort = 9777;


namespace overlay {

class WebsocketServer {
  public:
    void run() {
        ::mkdir(overlayDbPath, 0777);
        env.open(std::string(overlayDbPath));

        hubGroup = hub.createGroup<uWS::SERVER>(uWS::PERMESSAGE_DEFLATE | uWS::SLIDING_DEFLATE_WINDOW);

        hubGroup->onConnection([this](uWS::WebSocket<uWS::SERVER> *ws, uWS::HttpRequest req) {
            onConnection(ws, req);
        });

        hubGroup->onDisconnection([this](uWS::WebSocket<uWS::SERVER> *ws, int code, char *message, size_t length) {
            onDisconnection(ws, code, message, length);
        });

        hubGroup->onMessage([this](uWS::WebSocket<uWS::SERVER> *ws, char *message, size_t length, uWS::OpCode opCode) {
            onMessage(ws, message, length, opCode);
        });

        if (!hub.listen(bindHost, bindPort, nullptr, uS::REUSE_PORT, hubGroup)) throw overlay::error("unable to listen on port ", bindPort);

        std::cout << "Started websocket server" << std::endl;
        std::cout << "  db = " << overlayDbPath << std::endl;
        std::cout << "  listen = " << bindHost << ":" << bindPort << std::endl;

        hub.run();
    }

  private:
    class Connection {
      public:
        Connection(uWS::WebSocket<uWS::SERVER> *p, uint64_t id)
            : websocket(p), connectionId(id) { }
        Connection(const Connection &) = delete;
        Connection(Connection &&) = delete;

        uWS::WebSocket<uWS::SERVER> *websocket;
        uint64_t connectionId;
    };

    // Websocket thread

    void onConnection(uWS::WebSocket<uWS::SERVER> *ws, uWS::HttpRequest req) {
        uint64_t connId = nextConnId++;
        Connection *c = new Connection(ws, connId);
        ws->setUserData((void*)c);
        connIdToConnection.emplace(connId, c);
    }

    void onDisconnection(uWS::WebSocket<uWS::SERVER> *ws, int code, char *message, size_t length) {
        Connection *c = (Connection*)ws->getUserData();
        uint64_t connectionId = c->connectionId;

        connIdToConnection.erase(connectionId);
        delete c;
    }

    void onMessage(uWS::WebSocket<uWS::SERVER> *ws, char *message, size_t length, uWS::OpCode opCode) {
        auto &c = *(Connection*)ws->getUserData();
        tao::json::value body;
        tao::json::value reply = tao::json::empty_object;

        try {
            std::string_view msg(message, length);

            body = tao::json::from_string(msg);
            if (body.optional<uint64_t>("id")) reply["id"] = body.as<uint64_t>("id");

            processMsg(body, reply);
        } catch (std::exception &e) {
            reply["error"] = std::string("Error: ") + e.what();
        }

        std::string replyStr = tao::json::to_string(reply);
        c.websocket->send(replyStr.data(), replyStr.size(), uWS::OpCode::TEXT);
    }

    std::string processMsg(tao::json::value &body, tao::json::value &reply) {
        std::string cmd = body.as<std::string>("cmd");

        if (cmd == "add-zone") {
            auto txn = env.txn_rw();

            uint64_t zoneId = overlay::db::get_next_integer_key(txn, env.dbi_zoneById);
            std::string zoneIdStr = std::string(lmdb::to_sv<uint64_t>(zoneId));

            if (body.optional<std::string_view>("base")) {
                std::string base = from_hex(body.as<std::string_view>("base"));

                std::string_view baseZoneIdSv;
                if (!env.dbi_zoneByHash.get(txn, base, baseZoneIdSv)) throw overlay::error("unable to find base zone");

                generic_foreach(env, txn, env.dbi_zone, [&](std::string_view k, std::string_view v){
                    if (k.substr(0, 8) != baseZoneIdSv) return false;

                    std::string newKey = zoneIdStr + std::string(k.substr(8));
                    env.dbi_zone.put(txn, newKey, v);

                    return true;
                }, false, baseZoneIdSv);
            }

            for (auto &item : body.at("items").get_array()) {
                std::string key = item.as<std::string>("key");
                // FIXME: remove duplicate and trailing "/" chars
                key = zoneIdStr + key;

                std::string val = tao::json::to_string(item.at("val"));

                if (item.find("del")) {
                    env.dbi_zone.del(txn, key, val);
                }

                env.dbi_zone.put(txn, key, val);
            }

            std::string zoneHash = computeZoneHash(txn, zoneIdStr);

            std::string_view junkVal;

            if (env.dbi_zoneByHash.get(txn, zoneHash, junkVal)) {
                std::cout << "ZONE ALREADY EXISTS IN DB" << std::endl;
                txn.abort();
            } else {
                env.dbi_zoneById.put(txn, zoneIdStr, zoneHash);
                env.dbi_zoneByHash.put(txn, zoneHash, zoneIdStr);
                txn.commit();
            }

            reply["zoneHash"] = to_hex(zoneHash, true);
        } else if (cmd == "get-zone") {
            auto txn = env.txn_ro();

            tao::json::value items = tao::json::empty_array;

            std::string zoneHash = from_hex(body.as<std::string_view>("zoneHash"));

            std::string_view zoneIdSv;
            if (!env.dbi_zoneByHash.get(txn, zoneHash, zoneIdSv)) throw overlay::error("unable to find zone");

            std::string prefix = std::string(zoneIdSv);
            if (body.find("prefix")) prefix += body.as<std::string>("prefix");

            generic_foreach(env, txn, env.dbi_zone, [&](std::string_view k, std::string_view v){
                if (k.substr(0, prefix.size()) != prefix) return false;

                items.get_array().emplace_back(tao::json::value::array({ k.substr(8), tao::json::from_string(v), }));

                return true;
            }, false, prefix);

            reply["items"] = items;
        } else {
            throw overlay::error("unknown command: ", cmd);
        }

        return tao::json::to_string(reply);
    }


    std::string computeZoneHash(lmdb::txn &txn, const std::string &zoneIdStr) {
        // FIXME: compute merkle cache
        //std::vector<std::string> levels;
        //levels.push_back("");

        std::string nodeHashes;

        generic_foreach(env, txn, env.dbi_zone, [&](std::string_view k, std::string_view v){
            if (k.substr(0, 8) != zoneIdStr) return false;

            std::string keyHash = keccak256(k.substr(8));
            std::string valHash = keccak256(v);

            std::string nodeHash = keccak256("\x01" + keyHash + valHash);

            nodeHashes += nodeHash;

            return true;
        }, false, zoneIdStr);

        return keccak256(nodeHashes);
    }


    overlay::db::environment env;

    // Websocket thread

    uWS::Hub hub;
    uWS::Group<uWS::SERVER> *hubGroup;

    std::unordered_map<uint64_t, Connection*> connIdToConnection;
    uint64_t nextConnId = 1;
};

void cmd_ws() {
    WebsocketServer w;

    try {
        w.run();
    } catch (std::exception &e) {
        std::cerr << "Fatal error: " << e.what() << std::endl;
        std::exit(1);
    }
}

}
