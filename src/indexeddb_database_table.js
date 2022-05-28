Scoped.define("module:IndexedDBDatabaseTable", [
    "data:Databases.DatabaseTable",
    "base:Promise",
    "base:Iterators.ArrayIterator",
    "base:Tokens",
    "base:Objs",
    "base:Types",
    "data:Queries"
], function(DatabaseTable, Promise, ArrayIterator, Tokens, Objs, Types, Queries, scoped) {

    var RESERVED_KEYS = ["weak"];

    return DatabaseTable.extend({
        scoped: scoped
    }, function(inherited) {
        return {

            table: function(mode, options) {
                return this._database._getTable(this._table_name, mode, options);
            },

            primary_key: function() {
                return "id";
            },

            _insertRow: function(row) {
                if (!row[this.primary_key()]) row[this.primary_key()] = Tokens.generate_token();
                var promise = Promise.create();
                this.table("readwrite").success(function(table) {
                    var request = table.add(row);
                    request.onsuccess = function() {
                        promise.asyncSuccess(row);
                    };
                    request.onerror = function() {
                        promise.asyncError();
                    };
                });
                return promise;
            },

            _removeRow: function(query) {
                var promise = Promise.create();
                this.table("readwrite").success(function(table) {
                    var request = table["delete"](query[this.primary_key()]);
                    request.onsuccess = function() {
                        return promise.asyncSuccess();
                    };
                    request.onerror = function() {
                        return promise.asyncError();
                    };
                }.bind(this));
                return promise;
            },

            _findOne: function(query) {
                if (!query[this.primary_key()]) return inherited._findOne.call(this, query);
                var promise = Promise.create();
                this.table().success(function(table) {
                    var request = table.get(query[this.primary_key()]);
                    request.onsuccess = function(event) {
                        promise.asyncSuccess(request.result);
                    };
                    request.onerror = function() {
                        promise.asyncError();
                    };
                }.bind(this));
                return promise;
            },

            _updateRow: function(query, row) {
                var promise = Promise.create();
                this.table("readwrite").success(function(table) {
                    var getRequest = table.get(query[this.primary_key()]);
                    getRequest.onsuccess = function() {
                        Objs.extend(row, getRequest.result);
                        var updateRequest = table.put(row);
                        updateRequest.onsuccess = function() {
                            promise.asyncSuccess(row);
                        };
                        updateRequest.onerror = function() {
                            promise.asyncError();
                        };
                    };
                    getRequest.onerror = function() {
                        promise.asyncError();
                    };
                }.bind(this));
                return promise;
            },

            _encode: function(data) {
                data = Objs.map(data, function(value) {
                    return value && (Types.is_object(value) || Types.is_array(value)) ? this._encode(value) : value;
                }, this);
                RESERVED_KEYS.forEach(function(key) {
                    if (key in data) {
                        data[key + "_reserved"] = data[key];
                        delete data[key];
                    }
                });
                return data;
            },

            _decode: function(data) {
                data = Objs.map(data, function(value) {
                    return value && (Types.is_object(value) || Types.is_array(value)) ? this._decode(value) : value;
                }, this);
                RESERVED_KEYS.forEach(function(key) {
                    if ((key + "_reserved") in data) {
                        data[key] = data[key + "_reserved"];
                        delete data[key + "_reserved"];
                    }
                });
                return data;
            },

            _clear: function() {
                var promise = Promise.create();
                this.table("readwrite").success(function(table) {
                    var request = table.clear();
                    request.onsuccess = function() {
                        promise.asyncSuccess();
                    };
                    request.onerror = function() {
                        promise.asyncError();
                    };
                });
                return promise;
            },

            _find: function(query, options) {
                var promise = Promise.create();
                var originalQuery = query;
                query = query || {};

                if (!query || Types.is_empty(query)) {
                    this.table().success(function(table) {
                        var request = table.getAll();
                        request.onsuccess = function(event) {
                            promise.asyncSuccess(new ArrayIterator(event.target.result));
                        };
                        request.onerror = function() {
                            promise.asyncError();
                        };
                    });
                    return promise;
                }

                var splt = Objs.splitObject(query, function(value) {
                    return Queries.is_simple_atom(value) && !Types.is_boolean(value);
                });
                var result = this.table();
                var canAnd = false;
                if (!Types.is_empty(splt[0])) {
                    // TODO
                    // result = result.where(splt[0]);
                    canAnd = true;
                }
                query = splt[1];
                if (!Types.is_empty(query)) {
                    if (canAnd) {
                        // TODO
                        // result = result.and(function(row) {
                        //     return Queries.evaluate(query, row);
                        // });
                    } else {
                        // TODO
                        // result = result.filter(function(row) {
                        //     return Queries.evaluate(query, row);
                        // });
                    }
                }
                options = options || {};
                // TODO
                // if (options.skip)
                //     result = result.offset(options.skip);
                // if (options.limit)
                //     result = result.limit(options.limit);
                // var promise = options.sort && result.sortBy ? result.sortBy(Objs.ithKey(options.sort)) : result.toArray();
                // return Promise.fromNativePromise(promise).mapSuccess(function(cols) {
                //     if (!Types.is_empty(query) && !canAnd) {
                //         cols = cols.filter(function(row) {
                //             return Queries.evaluate(query, row);
                //         });
                //     }
                //     return new ArrayIterator(cols);
                // }, this).error(function(e) {
                //     console.warn(e, originalQuery, options);
                // });
            }

        };
    });
});