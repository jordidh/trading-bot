/**
 * Module dependencies
 */
var express = require('express');
var app = new express();

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
    await botData.CheckDatabaseTables();
    // Carreguem l'estat del bot (activat o desactivat)
    await botData.GetStatusBot();
}
// Executem la funció de càrrega de dades
loadBotData();

// Mostrem les dades carregades del bot
console.log("Bot status = " + botData.Active);

module.exports = app;