"use strict";

/**
 * Module dependencies
 */
var logger = require('./logger')

/**
 * Package Functions
 */

 /**
  * 
  * @param {*} kraken : objecte de l'exchange kraken amb les funcions per cridar a les seves api
  * @param {*} action : buy o sell
  * @param {*} pair : cripto i moneda, p.e. XBTEUR
  * 
  * Retorna un objecte del tipus: { "error" : [], "result" : { "descr" : action + " " + volume + " " + pair + " @ market", "txid" : [ "OAVY7T-MV5VK-KHDF5X" ] } }
  */
 exports.addOrder = async function(kraken, action, pair) {
    try {
        if (action === "buy") {
            // Si estem comprant hem de saber si tenim prous fons al kraken i quina és la juguesca màxima
            let fundsAvailable = 10;
            // TODO: recuperem els fons disponibles, el màxim per jugar i el % de l'exchange
            let exchangePercentage = 1;  // tant per cent dels fons que s'ha de guardar per cobrir la comissió del exchange
            let maxLimitFundsToBuy = 200;

            // Calculem la juquesca, que serà el màxim definit menys un 1% (el que es queda kraken)
            fundsAvailable -= exchangePercentage / fundsAvailable;
            // Ajustem al màxim configurat per cada juguesca
            fundsAvailable = (fundsAvailable > maxLimitFundsToBuy ? maxLimitFundsToBuy : fundsAvailable);

            // Consultem el ticker (el preu actual de la crypto), per indicar al kraken la quantitat de crypto que volem
            let ticker = await kraken.getTicker(pair);
            if (ticker && ticker.error && Array.isArray(ticker.error) && ticker.error.length > 0) {
                return { "error" : [ "error getting ticker " + ticker.error[0] ], "result" : { } }
            }

            let volumeToBuy = fundsAvailable / parseFloat(ticker.result[Object.keys(ticker.result)[0]].a[0]);

            // Creem l'ordre de compra
            var orderAdded = kraken.addOrder(pair, volumeToBuy.toFixed(8), "buy");
            if (orderAdded.error && orderAdded.error.length > 0) {
                return { "error" : [ "error adding order: " + orderAdded.error[0] ], "result" : { } }
            }

            return orderAdded;
        } else { // sell
            // TODO

            return { "error" : [ "not implemented" ], "result" : { } }
        }        
    } catch(e) {
        logger.error(e);
        return { "error" : [ "exception: " + e.message ], "result" : { } }
    }
}