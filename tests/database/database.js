QUnit.test("indexeddb database store", function(assert) {
    var done = assert.async();
	var db = new BetaJS.Data.Databases.IndexedDB.IndexedDBDatabase("betajs-indexeddb-a", {
	    "tests": ["id"]
    });
    db.getTable("tests").clear().success(function() {
        db.getTable("tests").insertRow({x: 5}).success(function(object) {
            assert.ok(!!object.id);
            assert.equal(typeof object.id, "string");
            assert.equal(object.x, 5);
            db.getTable("tests").updateById(object.id, {y: 6}).success(function() {
                db.getTable("tests").count().success(function(result) {
                    db.getTable("tests").findById(object.id).success(function(result) {
                        assert.equal(result.x, 5);
                        assert.equal(result.y, 6);
                        db.getTable("tests").removeById(object.id).success(function() {
                            db.getTable("tests").findById(object.id).success(function(result) {
                                assert.equal(result, null);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});



QUnit.test("indexeddb database $elemMatch test", function(assert) {
    var done = assert.async();
    var db = new BetaJS.Data.Databases.IndexedDB.IndexedDBDatabase("betajs-indexeddb-a", {
        "tests": ["id"]
    });
    db.getTable("tests").clear().success(function() {
        db.getTable("tests").insertRow({foo: ["bar", "baz"]}).success(function(object) {
            assert.ok(!!object.id);
            assert.equal(typeof object.id, "string");
            assert.deepEqual(object.foo, ["bar", "baz"]);
            db.getTable("tests").findOne({
                foo: {$elemMatch: {$eq: "bar"}}
            }).success(function(result) {
                assert.ok(!!result);
                assert.equal(result.id, object.id);
                done();
            });
        });
    });
});

QUnit.test("indexeddb database $and test", function(assert) {
    var done = assert.async();
    var db = new BetaJS.Data.Databases.IndexedDB.IndexedDBDatabase("betajs-indexeddb-a", {
        "tests": ["id"]
    });
    db.getTable("tests").clear().success(function() {
        db.getTable("tests").insertRow({foo: "barbaz"}).success(function(object) {
            db.getTable("tests").findOne({
                $and: [{
                    foo: {$regex: /arb/}
                }, {
                    foo: {$regex: /rba/}
                }]
            }).success(function(result) {
                assert.equal(result.id, object.id);
                done();
            });
        });
    });
});
