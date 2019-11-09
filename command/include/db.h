#pragma once

#include <string_view>

#include "lmdbxx/lmdb++.h"

#include "overlay.h"


namespace overlay { namespace db {


class environment {
  public:
    environment() {}
    environment(const environment &) = delete;
    environment &operator=(environment const &) = delete;
    environment(environment &&) = delete;
    environment &operator=(environment &&) = delete;

    void open(std::string dir) {
        lmdb_env.set_max_dbs(64);
        lmdb_env.set_mapsize(1UL * 1024UL * 1024UL * 1024UL * 1024UL);

        lmdb_env.open(dir.c_str(), MDB_CREATE, 0664);

        auto txn = txn_rw();


        // TABLES

        dbi_zoneById = lmdb::dbi::open(txn, "zoneById", MDB_CREATE | MDB_INTEGERKEY);
        dbi_zoneByHash = lmdb::dbi::open(txn, "zoneByHash", MDB_CREATE);
        dbi_merkleCache = lmdb::dbi::open(txn, "merkleProof", MDB_CREATE | MDB_INTEGERKEY);
        dbi_zone = lmdb::dbi::open(txn, "zone", MDB_CREATE | MDB_DUPSORT);


        txn.commit();
    }

    void copy_fd(int fd) {
        lmdb::env_copy_fd(lmdb_env, fd, MDB_CP_COMPACT);
    }

    lmdb::txn txn_rw(MDB_txn* parentTxn = nullptr) {
        return lmdb::txn::begin(lmdb_env, parentTxn, 0);
    }

    lmdb::txn txn_ro(MDB_txn* parentTxn = nullptr) {
        return lmdb::txn::begin(lmdb_env, parentTxn, MDB_RDONLY);
    }

    lmdb::env lmdb_env = lmdb::env::create();



    // TABLES

    lmdb::dbi dbi_zoneById;
    lmdb::dbi dbi_zoneByHash;
    lmdb::dbi dbi_merkleCache;
    lmdb::dbi dbi_zone;
};




inline uint64_t get_largest_integer_key_or_zero(lmdb::cursor &cursor) {
    uint64_t id;

    std::string_view k, v;

    if (cursor.get(k, v, MDB_LAST)) {
        id = lmdb::from_sv<uint64_t>(k);
    } else {
        id = 0;
    }

    return id;
}

inline uint64_t get_largest_integer_key_or_zero(lmdb::txn &txn, lmdb::dbi &dbi) {
    auto cursor = lmdb::cursor::open(txn, dbi);
    return get_largest_integer_key_or_zero(cursor);
}

inline uint64_t get_next_integer_key(lmdb::txn &txn, lmdb::dbi &dbi) {
    return get_largest_integer_key_or_zero(txn, dbi) + 1;
}



inline void generic_foreach(environment &env, lmdb::txn &txn, lmdb::dbi &dbi, std::function<bool(std::string_view, std::string_view)> cb, bool reverse = false, std::optional<std::string_view> startingPoint = std::nullopt, std::function<void()> onStartingPointNotFound = [](){}) {
    auto cursor = lmdb::cursor::open(txn, dbi);

    std::string_view k, v;

    if (startingPoint) {
        k = *startingPoint;
        cursor.get(k, v, MDB_SET_RANGE);
    } else {
        if (!cursor.get(k, v, reverse ? MDB_LAST : MDB_FIRST)) return;
    }

    do {
        if (!cb(k, v)) return;
    } while (cursor.get(k, v, reverse ? MDB_PREV : MDB_NEXT));
}



}}
