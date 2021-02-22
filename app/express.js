"use strict";

/**
 * Module dependencies
 */
var express = require('express')
var flash = require('express-flash')
var path = require('path')
var compression = require('compression')
var methodOverride = require('method-override')
var bodyParser = require('body-parser')
var expressValidator = require('express-validator')
var cookieParser = require('cookie-parser')
var helmet = require('helmet')
var cors = require('cors')
var cons = require('consolidate')
var passport = require('passport')
var utils = require('../helpers/utils/utils')

/**
 * Express
 */
module.exports = async function (app) {

  var nconf = await utils.LoadConfig()

  // Express
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(compression());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // support encoded bodies.
  app.use(cookieParser()); // Read cookies (needed for auth)
  app.use(expressValidator());
  app.use(methodOverride('_method'));
  app.use(flash()); // Connect-flash for flash messages stored in session
  app.use(passport.initialize());
  app.use(passport.session()); // Persistent login sessions
  app.use(cors());

  // cookieParser to expose cookies to req.cookies
  app.use(cookieParser());

  // View engine nunjucks
  cons.requires.nunjucks = require('nunjucks') // consolidate
  var env = cons.requires.nunjucks.configure('public/views', {
    autoescape: true,
    express: app
  });

  // Setup view engine nunjucks
  app.set('view engine', 'html');
  app.set('views', path.join(__dirname, 'public/views'));

  // Use helmet to secure express headers
  // app.use(helmet()); // Default
  const SIX_MONTHS = 15778476000;
  app.use(helmet.frameguard());
  //app.use(helmet.xssFilter());
  //app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(helmet.hsts({
    maxAge: 10886400000, // Must be at least 18 weeks to be approved by Google
    //includeSubdomains: true, // Must be enabled to be approved by Google
    preload: true,
    force: true
  }));
  app.disable('x-powered-by');
  helmet.hidePoweredBy({
    setTo: nconf.get("APP")
  });

  /**
   * Middleware express
   */
  app.use(function (req, res, next) {
    next();
  });
}