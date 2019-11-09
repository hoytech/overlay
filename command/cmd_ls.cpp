#include <vector>
#include <iostream>

#include <docopt/docopt.h>
#include <uWS/uWS.h>
#include <tao/json.hpp>

#include "overlay.h"
#include "db.h"


static const char *overlayDbPath = "./overlay.db/";


namespace overlay {


static const char USAGE[] =
R"(
    Usage:
      ls
      ls <path>

    Options:
      -h --help             Show this screen.
      --version             Show version.
)";


static void run(const std::string &zoneHash, const std::string &zonePath) {
    overlay::db::environment env;

    ::mkdir(overlayDbPath, 0777);
    env.open(std::string(overlayDbPath));

    auto txn = env.txn_ro();

    if (zoneHash.size() == 0) {
        generic_foreach(env, txn, env.dbi_zoneById, [&](std::string_view k, std::string_view v){
            std::cout << to_hex(v, true) << std::endl;
            return true;
        });
    } else {
        std::string_view zoneIdSv;
        if (!env.dbi_zoneByHash.get(txn, zoneHash, zoneIdSv)) throw overlay::error("unable to find zone");

        std::string prefix = std::string(zoneIdSv);
        prefix += zonePath;

        generic_foreach(env, txn, env.dbi_zone, [&](std::string_view k, std::string_view v){
            if (k.substr(0, prefix.size()) != prefix) return false;

            std::cout << k.substr(8) << std::endl;

            return true;
        }, false, prefix);
    }
}


void cmd_ls(const std::vector<std::string> &subArgs) {
    std::map<std::string, docopt::value> args = docopt::docopt(USAGE, subArgs, true, "");

    try {
        std::string zoneHash, zonePath;

        if (args["<path>"]) {
            std::string path = args["<path>"].asString();

            std::size_t sep = path.find('/');
            if (sep != std::string_view::npos) {
                zoneHash = from_hex(path.substr(0, sep));
                zonePath = path.substr(sep);
            } else {
                zoneHash = from_hex(path);
            }
        }

        run(zoneHash, zonePath);
    } catch (std::exception &e) {
        std::cerr << "Fatal error: " << e.what() << std::endl;
        std::exit(1);
    }
}

}
