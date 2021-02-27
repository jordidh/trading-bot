"use strict";

/**
 * Public properties
 */
var m_balance = {
    "error" : [],
    "result" : {
        "ZUSD" : [3415.8014],
        "ZEUR" : [155.5649],
        "XXBT" : [149.9688412800],
        "XXRP" : [499889.51600000]
    }
};
exports.setBalance = function(value) {
    m_balance = value;
}

var m_cryptoValue = {
    "error": [],
    "result": {
        "XXBTZEUR": {
            a: [ '41193.40000', '1', '1.000' ],
            b: [ '41193.30000', '2', '2.000' ],
            c: [ '41194.30000', '0.10000000' ],
            v: [ '4019.56938193', '5793.50042560' ],
            p: [ '41371.13767', '41107.71138' ],
            t: [ 43719, 64168 ],
            l: [ '39912.00000', '39610.80000' ],
            h: [ '42515.10000', '42515.10000' ],
            o: '40907.50000'                  
        }
    }
};
exports.setCryptoValue = function(value) {
    m_cryptoValue = value;
}


/**
 * Get account balance
 * URL: https://api.kraken.com/0/private/Balance
 * Result: array of asset names and balance amount
 */
exports.getBalance = async function () {
    try {
        let data = (await krakenAPI.api('Balance'))
        if (Object.entries(data.result).length > 0) {
            let result = ''
            let sum = []
            for (var i = 0; i < Object.entries(data.result).length; i++) {
                let asset = Object.entries(data.result)[i][0]
                let asset_balance = parseFloat(Object.entries(data.result)[i][1]).toFixed(2)
                let pair = getTicker(asset)
                let current_price = null
                if (pair) {
                    //console.log("Ticker = " + pair)
                    let priceData = await krakenAPI.api('Ticker', { pair: pair })
                    current_price = parseFloat(Object.entries(priceData.result)[i][1]).toFixed(2)
                    //console.log("Price = " + current_price)
                }
                let coinname = getCoinName(asset)
                //console.log("coiname = " + coinname)
                let balance = parseFloat(current_price ? (current_price * asset_balance) : asset_balance).toFixed(2)
                //console.log("balance = " + balance)
                sum.push(balance)
                result += coinname + '(' + asset + ')' + ': ' + balance + '€ ' + (current_price ? ' (' + current_price + '€)' : '') + '\n'
            }
            // Total balance
            let total = sum.map(c => parseFloat(c)).reduce((a, b) => a + b, 0).toFixed(2)
            result += '\nTotal balance: ' + total + ' €'
            return result
        } else {
            return `❌ BALANCE NO ENCONTRADO!`
        }
    }
    catch (err) {
        return err.message
    }
}

/**
 * Get account funds in a specific currency
 * URL: https://api.kraken.com/0/private/Balance
 * Result: { 
 *   "error" : [ float of funds available ],
 *   "result" : { .. }
 *   "funds": 0
 * }
 * @param {*} currency : "ZEUR" / "ZUSD"
 */
exports.getFunds = async function (currency) {
    try {
        // Si s'ha retornat un error
        if (m_balance && m_balance.error && Array.isArray(m_balance.error) && m_balance.error.length > 0) {
            return { 
                "error" : [ m_balance.error[0] ], 
                "result" : { 
                    "funds" : 0
                }
            };
        }

        // Si no hi ha fons
        if (typeof m_balance === "undefined" || m_balance === null || 
            typeof m_balance.result === "undefined" || m_balance.result === null ||
            Object.entries(m_balance.result).length === 0) {

            return { 
                "error" : [ ], 
                "result" : { 
                    "funds" : 0
                }
            };
        }

        // Recuperem els fons
        let funds = 0;
        for (var i = 0; i < Object.entries(m_balance.result).length; i++) {
            let asset = Object.entries(m_balance.result)[i][0];
            if (asset === currency) {
                funds = parseFloat(Object.entries(m_balance.result)[i][1]).toFixed(2);
            }
        }

        return { 
            "error" : [ ], 
            "result" : {
                "funds" : parseFloat(funds)
            }
        };
    }
    catch (err) {
        return { 
            "error" : [ "Exception getting funds " + err.message ], 
            "result" : {
                "funds" : 0
            }
        };
    }
}

/**
 * Funció per crear ordres de compra o venda
 * Veure https://www.kraken.com/features/api
 * @param {*} pair : crypto + moneda  Ex: 'XBTEUR'
 * @param {*} volume : volum que es vol comprar (es calcula amb els fons disponibles menys un 1% i dividit pel valor actual de la crypto)
 * @param {*} action : 'buy' / 'sell'
 * 
 * Retorna un objecte json amb l'estructura: { "error": [], "result": {}}
 */
exports.addOrder = async function (pair, volume, action) {
    try {
        // Compra de la cripto
        // Retorna una cosa del tipus:
        // Array ( [error] => Array ( )
        //         [result] => Array (
        //              [descr] => Array ( [order] => buy 2.00000000 XBTEUR @ market )
        //              [txid] => Array ( [0] => OAVY7T-MV5VK-KHDF5X )
        //         )
        //    )
        var msg = {
            "error" : [],
            "result" : {
                "descr" : [ { "order" : action + " " + volume + " " + pair + " @ market" } ],
                "txid" : [ "OAVY7T-MV5VK-KHDF5X" ]
            }
        };
        console.log(msg);
        return msg;
    } catch (err) {
        console.log(err);
        return { "error" : [ err.message ], "result" : {} };
    }
}

/**
 * Funció que obté el valor d'una crypto
 * La crida a kraken és del tipus: https://api.kraken.com/0/public/Ticker?pair=XBTEUR
 * Veure https://www.kraken.com/features/api
 * @param {*} pair  : crypto + moneda  Ex: 'XBTEUR'
 * 
 * Retorna un JSON del tipus: { "error" : [], "result" : {} }
 */
exports.getTicker = async function (pair) {
    try {
        return m_cryptoValue;
    } catch (err) {
        console.log(err);
        return { "error" : [ err.message ] };
    }
}