"use strict";

/**
 * Module dependencies
 */
var path = require('path')
var nconf = require('nconf')
const logger = require('../app/logger')
var database = require('../app/database')
const moment = require('moment');
const kraken = require('../app/exchanges/kraken/apis')

/**
 * Package Functions
 */

exports.Get = async function (req, res) {
    res.status(200).send('OK')
};

exports.Post = async function (req, res) {
    // Entrada de datos desde el servidor de señales de TradingView
    if (req.body && Object.keys(req.body).length > 0) {
        // Validaremos la estructura del json
        // await kraken.AddOrder(req.body.action, req.body.pair)
    }
    // Petición de salida
    res.sendStatus(200).end()
};