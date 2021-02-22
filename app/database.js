"use strict";

/**
 * Module dependencies
 */
var nconf = require('nconf')
const logger = require('./logger')
const sqlite = require("../custom/sqlite3-await-async/sqlite3-await-async")

/**
 * Package Functions
 */

// Usado para realizar consultas que nos devuelvan 1 valor o fila
exports.query = async function (sql) {
    let data = null
    try {
        await sqlite.open('./database/trading.db')
        data = await sqlite.get(sql)
        await sqlite.close()
        return data
    } catch (err) {
        logger.error(err)
        return null
    }
};

// Devuelve todos los datos de la consulta sql
exports.all = async function (sql) {
    let data = null
    try {
        await sqlite.open('./database/trading.db')
        data = await sqlite.all(sql)
        await sqlite.close()
        return data
    } catch (err) {
        logger.error(err)
        return null
    }
};

// Usado para realizar inserts, updates y deletes
exports.run = async function (sql) {
    let data = null
    try {
        await sqlite.open('./database/trading.db')
        data = await sqlite.run(sql)
        await sqlite.close()
        return data
    } catch (err) {
        logger.error(err)
        return null
    }
};

/**
 * Custom Functions
 */
exports.boolCheckTelegramUser = async function (telegram_id) {
    try {
        if (telegram_id == nconf.get("TELEGRAM").TELEGRAM_USER_ID) {
            return true
        } else {
            return false
        }
    } catch (err) {
        logger.error(err)
        return null
    }
}

exports.CheckDatabaseTables = async function () {
    try {
        await this.run(`CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME NOT NULL,
            data text NOT NULL            
        )`)
    } catch (err) {
        logger.error(err)
        return null
    }
}

exports.arrayGetUserLogs = async function () {
    try {
        var array = []
        var data = []

        var sql = `select date, data from logs`
        var array = (await this.all(sql))   

        if (array && array.length > 0) {
            return JSON.stringify(array)
        } else {
            return `❌ No dispone de logs!`
        }
    } catch (err) {
        logger.error(err)
        return err
    }
};