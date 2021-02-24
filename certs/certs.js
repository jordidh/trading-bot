"use strict";

/**
 * Module dependencies
 */
var fs = require('fs');
var path = require('path');
var nconf = require('nconf');

/**
 * Package Functions
 */
var keyPath = path.join(__dirname, nconf.get("APP_CERT_KEY"));
var certPath = path.join(__dirname, nconf.get("APP_CERT_CERT"));

var hskey = fs.readFileSync(keyPath);
var hscert = fs.readFileSync(certPath);

var certificates = {
    key: hskey,
    cert: hscert
};

var certs = {};
certs.ssl = certificates

module.exports = certs