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

module.exports = app;