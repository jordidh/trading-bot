/**
 * Module dependencies
 */
var express = require('express')
var app = new express()

require('./app/express')(app)
require('./app/routes')(app)

// Descomentar només si s'executa des d'un servidor que no té IP pública fixa
require('./app/ngrok')

require('./app/telegram/telegram')

module.exports = app