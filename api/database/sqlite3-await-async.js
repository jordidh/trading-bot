/**
 * Module dependencies
 */
const sqlite3 = require('sqlite3').verbose();
const DATABASE_PATH = './database/trading.db';

// Exports
var db = new sqlite3.Database(DATABASE_PATH, (err) => {
    if (err) {
        console.error("Error in SQLite DB opening ", err);
        return;
    }
});

exports.db = db;


// any query: insert/delete/update
exports.run = function (query) {
    return new Promise(function (resolve, reject) {
        db.run(query,
            function (err) {
                if (err) reject(err.message)
                else resolve(true)
            });
    });
}

// first row read
exports.get = function (query, params) {
    return new Promise(function (resolve, reject) {
        db.get(query, params, function (err, row) {
            if (err) reject("Read error: " + err.message)
            else {
                resolve(row)
            }
        });
    });
}

// set of rows read
exports.all = function (query, params) {
    return new Promise(function (resolve, reject) {
        //if (params == undefined) params = []
        db.all(query, params, function (err, rows) {
            if (err) {
                reject("Read error: " + err.message)
            } else {
                resolve(rows);
            }
        });
    });
}

// each row returned one by one 
exports.each = function (query, params, action) {
    return new Promise(function (resolve, reject) {
        db.serialize(function () {
            db.each(query, params, function (err, row) {
                if (err) reject("Read error: " + err.message)
                else {
                    if (row) {
                        action(row)
                    }
                }
            });
            db.get("", function (err, row) {
                resolve(true)
            });
        });
    });
}
