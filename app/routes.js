"use strict";

/**
 * Module dependencies
 */
var nconf = require('nconf')
var path = require('path');

/**
 * Custom Routes
 */
var routes = require('../routes/app');

/**
 * Package Functions
 */
module.exports = function (app) {
    
    app.get('/', routes.Get)
    app.post('/', routes.Post)

    /*
     * Errors Express
     */

    // Catch 404 and forward to error handler
    app.use(function (req, res, next) {
        var err = new Error('404 Not Found')
        err.status = 404
        next(err)
    });

    // Development error handler
    // Will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            //res.status(err.status || 500)
            res.status(404).send('404 Not Found')
            /*res.render('error/error', {
                message: (err.message),
                error: err
            });*/
        });
    }

    // Production error handler
    // No stacktraces leaked to user
    app.use(function (err, req, res, next) {
        //res.status(err.status || 500)
        res.status(404).send('404 Not Found')
        /*res.render('error/error', {
            message: (err.message),
            error: {}
        });*/
    });
}