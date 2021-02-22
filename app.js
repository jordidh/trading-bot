/**
 * Module dependencies
 */
var express = require('express')
var app = new express()
var database = require('./app/database')

require('./app/express')(app)
require('./app/routes')(app)
//require('./app/ngrok')
require('./app/telegram/telegram')

database.CheckDatabaseTables()

module.exports = app