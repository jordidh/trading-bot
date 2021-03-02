"use strict";

/**
 * Module dependencies
 */
var config = require('../config/config');
var tradingControl = require('./tradingControl');

/**
 * Package Functions
 */

 /**
  * 
  * @param {*} kraken : objecte de l'exchange kraken amb les funcions per cridar a les seves api
  * @param {*} action : buy o sell
  * @param {*} pair : cripto i moneda separats per un "/" p.e. XBT/EUR
  * @param {*} test : si es true fa totes les accions excepte crear l'ordre i enlloc de retornar
  *                   el resultat de crear l'ordre retorna els valors previs, ex:
  *                   { "error" : [], "result" : {
  *                       "funds": X,
  *                       "fundsMinusCommission": X,
  *                       "fundsToBuy": X,
  *                       "exchangePercentage": X,
  *                       "maxLimitFundsToBuy": X,
  *                       "volume" : X,
  *                       "price" : X
  *                   } }
  * @return
  * Si el paràmetre test === false: retorna { 
  *     "error" : [], 
  *     "result" : { 
  *         "descr" : action + " " + volume + " " + pair + " @ market", 
  *         "txid" : [ "OAVY7T-MV5VK-KHDF5X" ],
  *         "price" : X
  *     } 
  * }
  * Si el paràmetre test === true: retorna { 
  *     "error" : [], 
  *     "result" : { "funds": X, "fundsMinusCommission": X, "fundsToBuy": X, "exchangePercentage": X, "maxLimitFundsToBuy": X, "volume" : X, "price" : X } 
  * }
  */
 exports.addOrder = async function(kraken, action, pair, test) {
    try {
        // Recuperem la moneda en que volem els fins per invertir
        let currency = config.EXCHANGE_KRAKEN.FUNDS_CURRENCY;
        // tant per cent dels fons que s'ha de guardar per cobrir la comissió del exchange
        let exchangePercentage = config.EXCHANGE_KRAKEN.COMMISSION_PERCENTAGE;
        // Màxim número de fons que invertirem en cada jugada
        let maxFundsToBuy = config.EXCHANGE_KRAKEN.MAX_FUNDS_TO_BUY;

        let pairObject = await tradingControl.convertPair(pair);

        if (action === "buy") {
            // Si estem comprant hem de saber si tenim prous fons al kraken i quina és la juguesca màxima
            // Per obtenir els fons el currency ha de'star en format ZEUR, XXBT, ...
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
                            "volume" : 0,
                            "price" : 0
                    } 
                }
            }

            // Calculem la juquesca, que serà el màxim definit menys un 1% (el que es queda kraken)
            let fundsMinusCommission = balance.result.funds - (balance.result.funds * exchangePercentage / 100);
            // Ajustem al màxim configurat per cada juguesca
            let fundsToBuy = (fundsMinusCommission > maxFundsToBuy ? maxFundsToBuy : fundsMinusCommission);

            // Consultem el ticker (el preu actual de la crypto), per indicar al kraken la quantitat de crypto que volem
            let ticker = await kraken.getTicker(pairObject.result.pairSimple);
            if (ticker && ticker.error && Array.isArray(ticker.error) && ticker.error.length > 0) {
                return { "error" : [ "error getting ticker " + ticker.error[0] ], "result" : { } }
            }

            let priceToBuy = parseFloat(ticker.result[Object.keys(ticker.result)[0]].a[0]);
            let volumeToBuy = fundsToBuy / priceToBuy;

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
                            "volume" : volumeToBuy,
                            "price" : priceToBuy
                    } 
                }
            }

            // Creem l'ordre de compra
            let orderAdded = await kraken.addOrder(pairObject.result.pairSimple, volumeToBuy.toFixed(9), "buy");
            if (orderAdded.error && orderAdded.error.length > 0) {
                return { "error" : [ "error adding order: " + orderAdded.error[0] ], "result" : { } }
            }

            // Afegim el price al reusultat retornat per kraken
            console.log(orderAdded);
            orderAdded.result.price = priceToBuy;

            return orderAdded;

        } else { // sell

            // Si estem venent mirem que tinguem vendre el que estem indicant
            // A la funció getFunds hem de passar la cripto amb una X davant, ex: XXBT. Atenció, no sempre, p.e. amb ADA no es posa
            let balance = await kraken.getFunds(pairObject.result.cryptoX);
            if (balance.error && Array.isArray(balance.error) && balance.error.length > 0) {
                return { "error" : [ "error adding order getting funds: " + balance.error[0] ], "result" : { } }
            }

            // Si no tenim fons del que volem vendre retornem error
            if (balance.result.funds === 0) {
                return { "error" : [ "error, no funds to sell from " + pair ], "result" : { } }
            }

            let fundsToSell = balance.result.funds;

            // Consultem el ticker (el preu actual de la crypto), per indicar al kraken la quantitat de crypto que volem
            let ticker = await kraken.getTicker(pairObject.result.pairSimple);
            if (ticker && ticker.error && Array.isArray(ticker.error) && ticker.error.length > 0) {
                return { "error" : [ "error getting ticker " + ticker.error[0] ], "result" : { } }
            }

            let priceToSell = parseFloat(ticker.result[Object.keys(ticker.result)[0]].a[0]);

            // Si estem testejant sortim sense finalitzar la creació de l'ordre
            if (test === true) {
                return { 
                    "error" : [], 
                    "result" : {
                            "funds": balance.result.funds,
                            "fundsToSell": fundsToSell,
                            "price": priceToSell
                    } 
                }
            }

            // Creem l'ordre de venda
            // Atenció: el nom del pair ha de ser XBTEUR i no XXBT
            let orderAdded = await kraken.addOrder(pairObject.result.pairSimple, fundsToSell.toFixed(9), "sell");
            if (orderAdded.error && orderAdded.error.length > 0) {
                return { "error" : [ "error adding order: " + orderAdded.error[0] ], "result" : { } }
            }

            // Afegim el price al reusultat retornat per kraken
            console.log(orderAdded);
            orderAdded.result.price = priceToSell;

            return orderAdded;
        }        
    } catch(e) {
        return { "error" : [ "exception: " + e.message ], "result" : { } }
    }
}

/**
 * A partir d'un pair en pormat XBT/EUR retorna un objecte amb les diferents variants:
 * {
 *   "error" : []
 *   "result": {
 *     "crypto" : "XBT",
 *     "cryptoX" : "XXBT",
 *     "currency" : "EUR",
 *     "currencyZ" : "ZEUR",
 *     "pairOriginal" : "XBT/EUR",
 *     "pairSimple" : "XBTEUR",
 *     "pairFull" : "XXBTZEUR"
 *   }
 * }
 * @param {*} pair 
 */
exports.convertPair = async function(pair) {
    // Validem que tingui el separador "/"
    let words = pair.split("/");
    
    if (words.length != 2) {
        return {
            "error" : [ "Parameter \"pair\" has not the correct format <crypto>/<currency>: " + pair ],
            "result" : {}
        };
    }

    // Construim l'objecte
    return {
        "error" : [],
        "result" : {
            "crypto" : words[0],
            "cryptoX" : "X" + words[0],
            "currency" : words[1],
            "currencyZ" : "Z" + words[1],
            "pairOriginal" : pair,
            "pairSimple" : words[0] + words[1],
            "pairFull" : "X" + words[0] + "Z" + words[1]
        }
    }
}