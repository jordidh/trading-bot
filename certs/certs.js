"use strict";

/**
 * Module dependencies
 */
var fs = require('fs')
var path = require('path')

/**
 * Package Functions
 */
var keyPath = path.join(__dirname, '/certs/key-20210222-094930.pem')
var certPath = path.join(__dirname, '/certs/cert-20210222-094930.crt')

var hskey = fs.readFileSync(keyPath)
var hscert = fs.readFileSync(certPath)

var certificates = {
    key: hskey,
    cert: hscert
};

var certs = {};
certs.ssl = certificates

module.exports = certs