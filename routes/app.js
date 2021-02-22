"use strict";

/**
 * Module dependencies
 */
var path = require('path')
var nconf = require('nconf')
const logger = require('../app/logger')
var database = require('../app/database')
const moment = require('moment')

/**
 * Package Functions
 */

exports.Get = async function (req, res, next) {
    res.status(200).send('OK!')
};

exports.Post = async function (req, res, next) {
    // Entrada de datos desde el servidor de señales de TradingView
    console.log(req.body)
    // 
    res.status(200).end()
};