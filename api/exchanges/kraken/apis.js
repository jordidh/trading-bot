"use strict";

/**
 * Module dependencies
 */
var nconf = require('nconf')
const logger = require('../../logger')
const KrakenClient = require('kraken-api')
const krakenAPI = new KrakenClient(nconf.get("EXCHANGE_KRAKEN").API_KEY, nconf.get("EXCHANGE_KRAKEN").API_SECRET)
const constants = require('./constants');
const { constant } = require('async');

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
                    current_price = parseFloat((convertPriceData(priceData, pair)).askPrice).toFixed(2)
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
        logger.error(err.message)
        return err.message
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
        var msg = await krakenAPI.api('AddOrder',
            {
                pair: pair,
                type: action,
                ordertype: 'market',
                volume: volume
            });
        console.log(msg);
        return msg;
    } catch (err) {
        console.log(err);
        return { "error" : [ err.message ], "result" : {} };
    }
}

/**
 * Funció per convertir els fons que es volen invertir a volum de cripto
 * Es necessari abans de cridar a la funció addOrder
 * La crida a kraken és del tipus: https://api.kraken.com/0/public/Ticker?pair=XBTEUR
 * Amb el que retorna la crida, per aconseguir el volum de crypto, 
 * s'agafa el valor de la crypto y es divideix pels fons a invertir
 * Veure https://www.kraken.com/features/api
 * @param {*} pair  : crypto + moneda  Ex: 'XBTEUR'
 * @param {*} funds : fons que es volen invertir (s'aconsella restar-li un 1% abans de passar-ho a la funció per descomptar la comissió del exchange)
 * 
 * Retorna -1 si hi ha error i el volum (un número >= 0) si va bé
 */
exports.getVolumeFromFunds = async function (pair, funds) {
    try {
        // Càlcul del volum de cripto que es vol comprar
        // Kraken retorna un objecte:
        //{
        //    "error": [],
        //    "result": {
        //        "XXBTZEUR": {
        //            a: [ '41193.40000', '1', '1.000' ],
        //            b: [ '41193.30000', '2', '2.000' ],
        //            c: [ '41194.30000', '0.10000000' ],
        //            v: [ '4019.56938193', '5793.50042560' ],
        //            p: [ '41371.13767', '41107.71138' ],
        //            t: [ 43719, 64168 ],
        //            l: [ '39912.00000', '39610.80000' ],
        //            h: [ '42515.10000', '42515.10000' ],
        //            o: '40907.50000'                  
        //        }
        //    }
        //}
        // Ens quedem amb result.XXBTZEUR.a[0] on a = ask array(<price>, <whole lot volume>, <lot volume>),
        // Nota: XXBTZEUR = X + crypto + Z + moneda
        var cryptoValue = await krakenAPI.api('Ticker', { pair: pair });
        console.log("kraken Ticker = " + cryptoValue);
        var volume = funds / parseFloat(cryptoValue.result[Object.keys(arr.result)[0]].a[0]);
        console.log("volume = " + volume);
        return volume;
    } catch (err) {
        console.log(err);
        return -1;
    }
}

exports.getAllCoins = async function () {
    var data = constants.coinname
    let array = []
    if (Object.entries(data).length > 0) {
        for (var i = 0; i < Object.entries(data).length; i++) {
            let coin = Object.entries(data)[i][0]
            let description = Object.entries(data)[i][1]
            var object = {}
            object.coin = coin
            object.description = description
            array.push(object)
        }
    }
    return array
}

/**
 * Local Functions
 */

function convertPriceData(priceData, ticker) {
    let aData = priceData.result[ticker];
    let data = {
        askPrice: parseFloat(aData.a[0]),
        bidPrice: parseFloat(aData.b[0]),
        lastTradeClosedPrice: parseFloat(aData.c[0]),
        volumeToday: parseFloat(aData.v[0]),
        volume24H: parseFloat(aData.v[1]),
        volumeWeightedAveragePriceToday: parseFloat(aData.p[0]),
        volumeWeightedAveragePrice24H: parseFloat(aData.p[1]),
        numberOfTradesToday: parseFloat(aData.t[0]),
        numberOfTrades24H: parseFloat(aData.t[1]),
        lowPrice: parseFloat(aData.l[0]),
        highPrice: parseFloat(aData.h[0]),
        openPrice: parseFloat(aData.o),
        percentageIncrease: (parseFloat(aData.c[0]) - parseFloat(aData.o)) / parseFloat(aData.o) * 100
    };
    return data
}

function getCoinName(asset) {
    switch (asset) {
        case 'ZEUR':
            return constants.coinname.ZEUR;
        case 'XXBT':
            return constants.coinname.XBT;
        case 'XETH':
            return constants.coinname.ETH;
        case 'REP':
            return constants.coinname.REP;
        case 'REPV2':
            return constants.coinname.REPV2;
        case 'BAT':
            return constants.coinname.BAT;
        case 'BCH':
            return constants.coinname.BCH;
        case 'ADA':
            return constants.coinname.ADA;
        case 'ATOM':
            return constants.coinname.ATOM;
        case 'DASH':
            return constants.coinname.DASH;
        case 'EOS':
            return constants.coinname.EOS;
        case 'ETC':
            return constants.coinname.ETC;
        case 'GNO':
            return constants.coinname.GNO;
        case 'ICX':
            return constants.coinname.ICX;
        case 'LTC':
            return constants.coinname.LTC;
        case 'XMR':
            return constants.coinname.XMR;
        case 'QTUM':
            return constants.coinname.QTUM;
        case 'XRP':
            return constants.coinname.XRP;
        case 'XLM':
            return constants.coinname.XLM;
        case 'USDT':
            return constants.coinname.USDT;
        case 'XTZ':
            return constants.coinname.XTZ;
        case 'WAVES':
            return constants.coinname.WAVES;
        case 'ZEC':
            return constants.coinname.ZEC;
        case 'KSM':
            return constants.coinname.KSM;
        case 'GRT':
            return constants.coinname.GRT;
    }
};

function getTicker(asset) {
    switch (asset) {
        case 'ZEURT':
            return constants.pairs.ZEUR;
        case 'XXBT':
            return constants.pairs.XBT;
        case 'XETH':
            return constants.pairs.ETH;
        case 'REP':
            return constants.pairs.REP;
        case 'REPV2':
            return constants.pairs.REP;
        case 'BAT':
            return constants.pairs.BAT;
        case 'BCH':
            return constants.pairs.BCH;
        case 'ADA':
            return constants.pairs.ADA;
        case 'ATOM':
            return constants.pairs.ATOM;
        case 'DASH':
            return constants.pairs.DASH;
        case 'EOS':
            return constants.pairs.EOS;
        case 'ETC':
            return constants.pairs.ETC;
        case 'GNO':
            return constants.pairs.GNO;
        case 'ICX':
            return constants.pairs.ICX;
        case 'LTC':
            return constants.pairs.LTC;
        case 'XMR':
            return constants.pairs.XMR;
        case 'QTUM':
            return constants.pairs.QTUM;
        case 'XRP':
            return constants.pairs.XRP;
        case 'XLM':
            return constants.pairs.XLM;
        case 'USDT':
            return constants.pairs.USDT;
        case 'XTZ':
            return constants.pairs.XTZ;
        case 'WAVES':
            return constants.pairs.WAVES;
        case 'ZEC':
            return constants.pairs.ZEC;
        case 'KSM':
            return constants.pairs.KSM;
        case 'GRT':
            return constants.pairs.GRT;
    }
}