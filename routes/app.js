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

/**
 * Funció que rep l'ordre de vendre o comprar una criptomoneda
 * Informa per telegram de la recepció de l'ordre
 * Laidea es que s'envii des del TrandingView
 * @param {*} req : req.body ha de contenir { "action": "BUY"/"SELL", "pair": "XBTEUR" }  
 *                  action: comprar o vendre
 *                  pair: el que es comprarà i amb quina modeda separat per un "/"
 * @param {*} res 
 */
exports.Post = async function (req, res) {
    // Validem les dades rebudes
    if (typeof req.body === "undefined") {
        return res.status(400).json({ message: "request body can not be undefined" });
    }
    if (req.body === null) {
        return res.status(400).json({ message: "request body can not be null" });
    }
    if (Object.keys(req.body).length <= 0) {
        return res.status(400).json({ message: "request body can not be empty" });
    }
    if (!req.body.hasOwnProperty(action)) {
        return res.status(400).json({ message: "request body must have property \"action\"" });
    }
    if (req.body.action != "BUY" && req.body.action != "SELL") {
        return res.status(400).json({ message: "request body property \"action\" only accepts values \"BUY\" or \"SELL\"" });
    }
    if (!req.body.hasOwnProperty(pair)) {
        return res.status(400).json({ message: "request body must have property \"pair\"" });
    }

    try {
        if (req.body.action === "BUY") {
            // Si estem comprant hem de saber si tenim prous fons al kraken i quina és la juguesca màxima
            var fundsAvailable = 0;
            // TODO: recuperem els fons disponibles, el màxim per jugar i el % de l'exchange
            var exchangePercentage = 1;  // tant per cent dels fons que s'ha de guardar per cobrir la comissió del exchange
            var maxFundsToBuyAllowed = 0;

            // Calculem la juquesca, que serà el màxim definit menys un 1% (el que es queda kraken)
            fundsAvailable -= exchangePercentage / fundsAvailable;
            // Ajustem al màxim configurat per cada juguesca
            fundsAvailable = (fundsAvailable > maxFundsToBuyAllowed ? maxFundsToBuyAllowed : fundsAvailable);

            // Consultem el ticker (el preu actual de la crypto), per indicar al kraken la quantitat de crypto que volem
            var volumeToBuy = await kraken.getVolumeFromFunds(req.body.pair, fundsAvailable);
            if (volumeToBuy < 0) {
                return res.status(500).json({ message: "error getting volume from funds" });
            }

            // Creem l'ordre de compra
            var orderAdded = kraken.addOrder(req.body.pair, volumeToBuy, "buy");
            if (orderAdded.error && orderAdded.error.length > 0) {
                return res.status(500).json({ message: "error adding order: " + orderAdded.error[0] });
            }

            return res.status(200).json({ message: "buy order added successfully" });
        } else { // SELL
            // TODO

            return res.status(500).json({ message: "not implemented" });
        }        
    } catch(e) {
        logger.error(e);
        return res.status(500).json({ message: "exception: " + e.message });
    }
};