Scoped.define("module:IndexedDBDatabase", [
    "data:Databases.Database",
    "base:Promise",
    "module:IndexedDBDatabaseTable",
    "base:Objs",
    "base:Types"
], function(Database, Promise, IndexedDBDatabaseTable, Objs, Types, scoped) {
    return Database.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            constructor: function(db, tables) {
                inherited.constructor.call(this);
                this._db = db;
                this._config = tables || {};
                this._indexeddb = null;
            },

            destroy: function() {
                this._unbind();
                inherited.destroy.call(this);
            },

            _unbind: function() {
                if (this._indexeddb) {
                    this._indexeddb.close();
                    this._indexeddb = null;
                }
            },

            _bind: function() {
                if (this._indexeddb) return Promise.value();

                var promise = Promise.create();
                var request = window.indexedDB.open(this._db);

                request.onerror = function(event) {
                    promise.asyncError(event);
                };

                request.onsuccess = function(event) {
                    this._indexeddb = event.target.result;
                    promise.asyncSuccess();
                }.bind(this);

                request.onupgradeneeded = function(event) {
                    this._indexeddb = event.target.result;
                    // TODO if object is string split on comma and create indexes
                    // TODO check how its done on dexie
                    Objs.iter(this._config, function(value, key) {
                        // TODO create indexes?
                        this._indexeddb.createObjectStore(key, {
                            keyPath: value[0]
                        });
                    }.bind(this));
                }.bind(this);

                return promise;
            },

            _tableClass: function() {
                return IndexedDBDatabaseTable;
            },

            _getTransaction: function(tableName, mode, options) {
                return this._bind().mapSuccess(function() {
                    return this._indexeddb.transaction(tableName, mode, options);
                }.bind(this));
            },

            _getTable: function(tableName, mode, options) {
                return this._getTransaction(tableName, mode, options).mapSuccess(function(transaction) {
                    return transaction.objectStore(tableName);
                });
            },

            deleteDatabase: function() {
                this._unbind();

                var promise = Promise.create();
                var request = window.indexedDB.deleteDatabase(this._db);

                request.onerror = function(event) {
                    promise.asyncError(event);
                };

                request.onsuccess = function(event) {
                    promise.asyncSuccess(event.result);
                };

                return promise;
            }

        };

    });
});