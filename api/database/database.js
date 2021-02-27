"use strict";

/**
 * Module dependencies
 */
var nconf = require('nconf')
const logger = require('../logger')
const sqlite = require("./sqlite3-await-async")
var moment = require('moment');
const { ConsoleTransportOptions } = require('winston/lib/winston/transports');

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
        if (telegram_id == nconf.get("TELEGRAM").USER_ID) {
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
        // Tabla logs
        await this.run(`CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME NOT NULL,
            log text NOT NULL            
        )`)

        // Tabla ngrok
        await this.run(`CREATE TABLE IF NOT EXISTS ngrok (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            local text,
            http text,
            https text
        )`)

        // Tabla status
        await this.run(`CREATE TABLE IF NOT EXISTS status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text,
            status bool,
            updated DATETIME
        )`)

        // Consultaremos la tabla status
        var sql = `select count(*) as count from status`
        if ((await this.query(sql)).count == 0) {
            // Insertaremos los datos necesarios
            await this.run(`INSERT INTO status (name,status,updated) VALUES ('BOT', true, '` + moment().format("DD/MM/YYYY HH:mm:ss") + `')`)
        }
    } catch (err) {
        logger.error(err)
        return null
    }
}

exports.arrayGetUserLogs = async function () {
    try {
        var array = []
        var data = []

        var sql = `select date, log from logs`
        var array = (await this.all(sql))

        if (array && array.length > 0) {
            return JSON.stringify(array)
        } else {
            return `❌ LOGS NO ENCONTRADOS!`
        }
    } catch (err) {
        logger.error(err)
        return err
    }
}

exports.GetStatusBot = async function () {
    try {
        var sql = `select * from status where name LIKE 'BOT'`
        return (await this.query(sql))
    } catch (err) {
        logger.error(err)
        return err
    }
}

exports.UpdateStatusBot = async function (status) {
    try {
        var updated = moment().format("DD/MM/YYYY HH:mm:ss")
        var sql = `update status set status = ` + status + `, updated = '` + updated + `' where name LIKE 'BOT'`
        await this.run(sql)
        return updated
    } catch (err) {
        logger.error(err)
        return err
    }
}