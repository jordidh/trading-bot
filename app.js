/**
 * Module dependencies
 */
var express = require('express');
var app = new express();
var logger = require('./api/logger');

require('./api/express')(app);
require('./api/routes')(app);

// Descomentar només si s'executa des d'un servidor que no té IP pública fixa
//require('./api/ngrok');

require('./api/telegram/telegram');

var BotPersistentData = require('./api/database/botPersistentData');

// Recuperem o creem una instància del bot
let botData = new BotPersistentData().getInstance();
// Funció que carrega totes les dades del bot
let loadBotData = async function() {
    logger.info("Checking database ...");
    let checkResult = await botData.CheckDatabaseTables();
    if (checkResult.error && checkResult.error.length > 0) {
        logger.error(checkResult.error[0]);
    } else {
        logger.info("Checking database = " + checkResult.result[0]);
    }
    // Carreguem l'estat del bot (activat o desactivat)
    logger.info("Loading bot data from database ...");
    let getStatusResult = await botData.GetStatusBot();
    if (getStatusResult && getStatusResult.error.length > 0) {
        logger.error(getStatusResult.error[0]);
    } else {
        logger.info("Loading bot data from database = " + JSON.stringify(getStatusResult.result));
    }
}
// Executem la funció de càrrega de dades
loadBotData();

// Mostrem les dades carregades del bot
logger.info("Bot status = " + botData.Active);

module.exports = app;