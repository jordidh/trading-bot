/**
 * Created by jordi on 27/02/21.
 */
var path = require("path");
var extend = require("util")._extend;

var development = require("./env/development");
var test = require("./env/test");
var production = require("./env/production");
//var staging = require("./env/staging");

var defaults = {
    root: path.normalize(__dirname + '/..')
};

module.exports = {
    development: extend(development,defaults),
    test: extend(test,defaults),
    production: extend(production,defaults)
    //staging: extend(staging,defaults)
}[process.env.NODE_ENV || "development"]