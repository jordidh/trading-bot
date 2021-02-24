/**
 * Module dependencies
 */
var express = require('express')
var app = new express()

require('./app/express')(app)
require('./app/routes')(app)
require('./app/ngrok')
require('./app/telegram/telegram')

module.exports = app