"use strict";

/**
 * Module dependencies
 */
const logger = require('../api/logger');
const moment = require('moment');
const { v1: uuidv1 } = require('uuid');
const kraken = require('../api/exchanges/kraken/apis');
const krakenMoked = require('../api/exchanges/kraken/apisMocked');
const tradingControl = require('../api/tradingControl');
//const TeleBot = require('telebot')
//const telegramCommands = require('../api/telegram/commands');
var telegram = require('../api/telegram/telegram');
const config = require('../config/config');
var BotPersistentData = require('../api/database/botPersistentData');

const TEST_INTERNAL_VALUES = true;
const EXECUTE_ORDER = false;

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
 * @param {*} req : req.body ha de contenir { "action": "buy"/"sell", "pair": "XBT/EUR", "token": "" }  
 *                  action: comprar o vendre
 *                  pair: el que es comprarà i amb quina modeda separat per un "/"
 *                  token: APP_TOKEN configurat en el fitxer config/config.json que permetrà accedir a l'aplicació
 * @param {*} res 
 * 
 * Retorna un objecte del tipus: { "error" : [], "result" : { "descr" : action + " " + volume + " " + pair + " @ market", "txid" : [ "OAVY7T-MV5VK-KHDF5X" ] } }
 */
exports.Post = async function (req, res) {

    let postId = uuidv1();

    // Enviem missatge al telegram de l'usuari per indicar que hem rebut un post
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    logger.info(postId + `: Rebut POST des de ` + ip + ` amb les dades ` + JSON.stringify(req.body));
    await telegram.sendMessage(config.TELEGRAM.USER_ID, 
        `Rebut POST des de ` + ip + ` amb les dades ` + JSON.stringify(req.body)
    );

    // Validem les dades rebudes
    if (typeof req.body === "undefined") {
        logger.info(postId + ": request body can not be undefined");
        await telegram.sendMessage(config.TELEGRAM.USER_ID, "request body can not be undefined");
        return res.status(400).json({ error: [ "request body can not be undefined" ] });
    }
    if (req.body === null) {
        logger.info(postId + ": request body can not be null");
        await telegram.sendMessage(config.TELEGRAM.USER_ID, "request body can not be null");
        return res.status(400).json({ error: [ "request body can not be null" ] });
    }
    if (Object.keys(req.body).length <= 0) {
        logger.info(postId + ": request body can not be empty");
        await telegram.sendMessage(config.TELEGRAM.USER_ID, "request body can not be empty");
        return res.status(400).json({ error: [ "request body can not be empty" ] });
    }
    if (!req.body.hasOwnProperty("token")) {
        logger.info(postId + ": request body must have property \"token\"");
        await telegram.sendMessage(config.TELEGRAM.USER_ID, "request body must have property \"token\"");
        return res.status(400).json({ error: [ "request body must have property \"token\"" ] });
    }
    if (req.body.token != config.APP_TOKEN) {
        logger.info(postId + ": Token invalid");
        await telegram.sendMessage(config.TELEGRAM.USER_ID, "Token invalid");
        return res.status(400).json({ error: [ "Token invalid" ] });
    }
    if (!req.body.hasOwnProperty("action")) {
        logger.info(postId + ": request body must have property \"action\"");
        await telegram.sendMessage(config.TELEGRAM.USER_ID, "request body must have property \"action\"");
        return res.status(400).json({ error: [ "request body must have property \"action\"" ] });
    }
    if (req.body.action != "buy" && req.body.action != "sell") {
        logger.info(postId + ": request body property \"action\" only accepts values \"buy\" or \"sell\"");
        await telegram.sendMessage(config.TELEGRAM.USER_ID, "request body property \"action\" only accepts values \"buy\" or \"sell\"");
        return res.status(400).json({ error: [ "request body property \"action\" only accepts values \"buy\" or \"sell\"" ] });
    }
    if (!req.body.hasOwnProperty("pair")) {
        logger.info(postId + ": request body must have property \"pair\"");
        await telegram.sendMessage(config.TELEGRAM.USER_ID, "request body must have property \"pair\"");
        return res.status(400).json({ error: [ "request body must have property \"pair\"" ] });
    }

    // Recuperem o creem una instància del bot
    let botData = new BotPersistentData().getInstance();
    // Obtenim l'estat del bot (si està actiu o inactiu)
    if (botData.Active === false) {
        logger.info(postId + ": bot inactive");
        await telegram.sendMessage(config.TELEGRAM.USER_ID, "bot inactive");
        return res.status(400).json({ error: [ "bot inactive" ] });
    }

    // Creem l'ordre
    let addOrderResult = {};
    // Si estem testejant l'api cridem a la versió mokejada de kraken
    if (req.body.test && req.body.test === "mock-kraken") {
        // Establim el balance i el ticker per poder vendre i calcular el benefici posteriorment
        // El balance ens indica la quantitat que estem venent (hauria de ser el mateix que la ordre de compra d'aquesta crypto)
        krakenMoked.setBalance(req.body.testBalance);
        // El ticker ens indica el preu a que estem venent
        krakenMoked.setCryptoValue(req.body.testCryptoValue);
        // Compra per testejar
        addOrderResult = await tradingControl.addOrder(krakenMoked, req.body.action, req.body.pair, EXECUTE_ORDER);
    } else {
        // Compra real
        addOrderResult = await tradingControl.addOrder(kraken, req.body.action, req.body.pair, EXECUTE_ORDER);
    }

    // En el moment de vendre busquem l'anterior ordre de compre pel mateix price i calculem el benefici
    if (req.body.action === "sell") {
        // Convertim el pair al format en que es guarda a l'ordre (p.e. de XBT/EUR a XBTEUR)
        let pairObject = await tradingControl.convertPair(req.body.pair);
        // Recuperem l'última ordred de comprea del pair
        // Si estem testejant l'api cridem a la versió mokegem la ordre recuperada
        let buyOrder = {};
        if (req.body.test && req.body.test === "mock-kraken") {
            // Establim l'orde de compra per testejar
            buyOrder = req.body.testBuyOrder;
        } else {
            buyOrder = await botData.GetLastBuyOrderWithPair(pairObject.pairSimple);
        }
        // Calculem el profit
        let profit = await tradingControl.calculateProfit(buyOrder, addOrderResult.result);
        if (profit.result === -1) {
            logger.error("Error calculant profits: " + profit.error[0] + " - " + JSON.stringify(buyOrder) + " - " + JSON.stringify(addOrderResult.result));
            // Guardem l'error de càlcul de profit a dins de l'estructura de la ordre que retornem
            addOrderResult.error.push(profit.error[0]);
        }
        // Guardem el profit a la ordre, per guardar-ho en el log
        addOrderResult.result.profit = profit.result;
    }

    // Retornem el resultat
    if (addOrderResult.error && Array.isArray(addOrderResult) && addOrderResult.length > 0) {
        logger.error(postId + ": Ordre creada amb error " + JSON.stringify(addOrderResult));
        // Guardem el log  la BD
        await botData.AddLog(JSON.stringify(addOrderResult));
        // Enviem error a telegram
        await telegram.sendMessage(config.TELEGRAM.USER_ID, "Ordre creada amb error " + JSON.stringify(addOrderResult));
        res.status(500).json(addOrderResult);
    } else {
        logger.info(postId + ": Ordre creada correctament " + JSON.stringify(addOrderResult));
        // Guardem log a la BD
        await botData.AddLog(JSON.stringify(addOrderResult));
        // Enviem confirmació a telegram
        await telegram.sendMessage(config.TELEGRAM.USER_ID, "Ordre creada amb dades " + JSON.stringify(addOrderResult));
        res.status(200).json(addOrderResult);
    }
};