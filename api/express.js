"use strict";

/**
 * Module dependencies
 */
var path = require('path');
var compression = require('compression');
var bodyParser = require('body-parser');
var cors = require('cors');
var nconf = require('nconf');

/**
 * Package Functions
 */
module.exports = function (app) {

  // Carga fichero config.json
  nconf.file('config', path.join(__dirname, '../config/config.json'));
  nconf.load();

  // Módulo Express
  app.use(compression());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.use(cors());

  // Middleware Express
  app.use(function (req, res, next) {
    next();
  });
}