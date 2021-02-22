"use strict";

/**
 * Module dependencies
 */
var nconf = require('nconf')

/**
 * Package Functions
 */
exports.GetBalance = async function () {
    const KrakenClient = require('kraken-api')
    const kraken = new KrakenClient(nconf.get("EXCHANGE_KRAKEN").API_KEY, nconf.get("EXCHANGE_KRAKEN").API_SECRET)
    return JSON.stringify((await kraken.api('Balance')).result)
};

