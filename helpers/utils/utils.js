"use strict";

/**
 * Module dependencies
 */
var path = require('path')
var nconf = require('nconf')
const logger = require('../../api/logger')
var database = require('../../api/database')

/**
 * Custom Functions
 */
// Carga fichero config/config.json
exports.LoadConfig = async function () {
    // Config file
    nconf.file('config', path.join(__dirname, '../../config/config.json'));
    nconf.load();
    return nconf
};

// Saludo al usuario registrado
exports.telegram_greetings = async function () {
    try {
        var myDate = new Date();
        var hours = myDate.getHours();

        var wellcome;

        if (hours < 12)
            wellcome = 'Buenos días';
        else if (hours >= 12 && hours <= 18)
            wellcome = 'Buenas tardes';
        else if (hours >= 18 && hours <= 24)
            wellcome = 'Buenas noches';
        return wellcome
    } catch (err) {
        logger.error(err)
        return null
    }
}



