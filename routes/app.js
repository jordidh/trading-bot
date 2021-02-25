"use strict";

/**
 * Module dependencies
 */
var path = require('path')
var nconf = require('nconf')
const logger = require('../api/logger')
var database = require('../api/database/database')
const moment = require('moment');
const kraken = require('../api/exchanges/kraken/apis')

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