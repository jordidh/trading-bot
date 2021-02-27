"use strict";

/**
 * Module dependencies
 */
var config = require('../config/config');

/**
 * Package Functions
 */

 /**
  * 
  * @param {*} kraken : objecte de l'exchange kraken amb les funcions per cridar a les seves api
  * @param {*} action : buy o sell
  * @param {*} pair : cripto i moneda, p.e. XBTEUR
  * @param {*} test : si es true fa totes les accions excepte crear l'ordre i enlloc de retornar
  *                   el resultat de crear l'ordre retorna els valors previs, ex:
  *                   { "error" : [], "result" : {
  *                       "funds": X,
  *                       "fundsMinusCommission": X,
  *                       "fundsToBuy": X,
  *                       "exchangePercentage": X,
  *                       "maxLimitFundsToBuy": X,
  *                       "volume" : X
  *                   } }
  * Si el paràmetre test === false: retorna { "error" : [], "result" : { "descr" : action + " " + volume + " " + pair + " @ market", "txid" : [ "OAVY7T-MV5VK-KHDF5X" ] } }
  * Si el paràmetre test === true: retorna { "error" : [], "result" : { "funds": X, "fundsMinusCommission": X, "fundsToBuy": X, "exchangePercentage": X, "maxLimitFundsToBuy": X, "volume" : X } }
  */
 exports.addOrder = async function(kraken, action, pair, test) {
    try {
        // Recuperem la moneda en que volem els fins per invertir
        let currency = config.EXCHANGE_KRAKEN.FUNDS_CURRENCY;
        // tant per cent dels fons que s'ha de guardar per cobrir la comissió del exchange
        let exchangePercentage = config.EXCHANGE_KRAKEN.COMMISSION_PERCENTAGE;
        // Màxim número de fons que invertirem en cada jugada
        let maxFundsToBuy = config.EXCHANGE_KRAKEN.MAX_FUNDS_TO_BUY;

        if (action === "buy") {
            // Si estem comprant hem de saber si tenim prous fons al kraken i quina és la juguesca màxima
            let balance = await kraken.getFunds(currency);
            if (balance.error && Array.isArray(balance.error) && balance.error.length > 0) {
                return { "error" : [ "error adding order getting funds: " + balance.error[0] ], "result" : { } }
            }

            // Si no tenim fons retornem tot a 0
            if (balance.result.funds === 0) {
                return { 
                    "error" : [ "no funds to buy" ], 
                    "result" : {
                            "funds": 0,
                            "fundsMinusCommission": 0,
                            "fundsToBuy": 0,
                            "exchangePercentage": exchangePercentage,
                            "maxLimitFundsToBuy": maxFundsToBuy,
                            "volume" : 0
                    } 
                }
            }

            // Calculem la juquesca, que serà el màxim definit menys un 1% (el que es queda kraken)
            let fundsMinusCommission = balance.result.funds - (exchangePercentage / balance.result.funds);
            // Ajustem al màxim configurat per cada juguesca
            let fundsToBuy = (fundsMinusCommission > maxFundsToBuy ? maxFundsToBuy : fundsMinusCommission);

            // Consultem el ticker (el preu actual de la crypto), per indicar al kraken la quantitat de crypto que volem
            let ticker = await kraken.getTicker(pair);
            if (ticker && ticker.error && Array.isArray(ticker.error) && ticker.error.length > 0) {
                return { "error" : [ "error getting ticker " + ticker.error[0] ], "result" : { } }
            }

            let volumeToBuy = fundsToBuy / parseFloat(ticker.result[Object.keys(ticker.result)[0]].a[0]);

            // Si estem testejant sortim sense finalitzar la creació de l'ordre
            if (test === true) {
                return { 
                    "error" : [], 
                    "result" : {
                            "funds": balance.result.funds,
                            "fundsMinusCommission": fundsMinusCommission,
                            "fundsToBuy": fundsToBuy,
                            "exchangePercentage": exchangePercentage,
                            "maxLimitFundsToBuy": maxFundsToBuy,
                            "volume" : volumeToBuy
                    } 
                }
            }

            // Creem l'ordre de compra
            let orderAdded = kraken.addOrder(pair, volumeToBuy.toFixed(8), "buy");
            if (orderAdded.error && orderAdded.error.length > 0) {
                return { "error" : [ "error adding order: " + orderAdded.error[0] ], "result" : { } }
            }

            return orderAdded;
        } else { // sell
            // Si estem venent mirem que tinguem vendre el que estem indicant
            let balance = await kraken.getFunds(pair);
            if (balance.error && Array.isArray(balance.error) && balance.error.length > 0) {
                return { "error" : [ "error adding order getting funds: " + balance.error[0] ], "result" : { } }
            }

            // Si no tenim fons del que volem vendre retornem error
            if (balance.result.funds === 0) {
                return { "error" : [ "error, no funds to sell from " + pair ], "result" : { } }
            }

            let fundsToSell = balance.result.funds;

            // Consultem el ticker (el preu actual de la crypto), per indicar al kraken la quantitat de crypto que volem
            let ticker = await kraken.getTicker(pair);
            if (ticker && ticker.error && Array.isArray(ticker.error) && ticker.error.length > 0) {
                return { "error" : [ "error getting ticker " + ticker.error[0] ], "result" : { } }
            }

            let volumeToSell = fundsToSell / parseFloat(ticker.result[Object.keys(ticker.result)[0]].a[0]);

            // Si estem testejant sortim sense finalitzar la creació de l'ordre
            if (test === true) {
                return { 
                    "error" : [], 
                    "result" : {
                            "funds": balance.result.funds,
                            "fundsToSell": fundsToSell,
                            "exchangePercentage": exchangePercentage,
                            "volume" : volumeToSell
                    } 
                }
            }

            // Creem l'ordre de venda
            let orderAdded = kraken.addOrder(pair, volumeToSell.toFixed(8), "sell");
            if (orderAdded.error && orderAdded.error.length > 0) {
                return { "error" : [ "error adding order: " + orderAdded.error[0] ], "result" : { } }
            }

            return orderAdded;
        }        
    } catch(e) {
        return { "error" : [ "exception: " + e.message ], "result" : { } }
    }
}