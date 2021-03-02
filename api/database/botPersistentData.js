//const sqlite3 = require('sqlite3').verbose();
const sqlite = require("./sqlite3-await-async")

/**
 * Classe per guardar dades del bot de forma persistent
 * Es fa servir una BD SqLite
 * 
 * Es fa servir de la següent manera:
 * var BotPersistentData = require('./botPersistentData');
 * var botData = new BotPersistentData().getInstance();
 * botData.active = true;
 * let isActive = botData.active;
 */
class BotPersistentData {

    constructor() {
        this.active = false;
    }

    get Active() {
        return this.active;
    }

    setActive = async function(value) {
        // Canvia el valor en memòria i ho guarda a la BD
        await SetStatusBot(value);
        this.active = value;
    }

    CheckDatabaseTables = async function() {
        try {
            console.log("Database checking ...");

            // Tabla logs
            let sqlRes = await sqlite.run(`CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATETIME NOT NULL,
                log text NOT NULL            
            )`);
    
            // Tabla ngrok
            sqlRes = await sqlite.run(`CREATE TABLE IF NOT EXISTS ngrok (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                local text,
                http text,
                https text
            )`);
    
            // Tabla status
            sqlRes = await sqlite.run(`CREATE TABLE IF NOT EXISTS status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name text,
                status bool,
                updated DATETIME
            )`);
    
            // Consultaremos la tabla status
            sqlRes = await sqlite.get(`select count(*) as count from status`);
            //console.log(sqlRes);
            if (sqlRes.count == 0) {
                // Creem els registres necessaris per l'aplicació
                console.log("Insertem a la taula status les dades inicials");
                await sqlite.run(`INSERT INTO status (name,status,updated) VALUES ('BOT', true, '` + moment().format("DD/MM/YYYY HH:mm:ss") + `')`);
            }

            console.log("Database checked successfully");
        } catch (err) {
            console.error("Database checked with errors ", err);
            return null;
        }
    }

    /**
     * Retorna el registre que conté l'estat del BOT, ex: [ { id: 1, name: 'BOT', status: 1, updated: '23/02/2021 23:53:06' } ]
     */
    GetStatusBot = async function () {
        try {
            let result = await sqlite.all(`select * from status where name LIKE 'BOT'`);
            //console.log(result);
            this.active = (result[0].status === 1);
            //console.log("this.active=" + this.active);
            return result;
        } catch (err) {
            console.error(err);
            return err;
        }
    }

    /**
     * 
     * @param {*} value true/false
     */
    SetStatusBot = async function (value) {
        try {
            let result = await sqlite.run(`update status set status = ` + value + ` where name LIKE 'BOT'`);
            this.active = value;
            return (result);
        } catch (err) {
            console.error(err);
            return err;
        }
    }
}

class Singleton {

  constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new BotPersistentData();
        }
    }

    getInstance() {
        return Singleton.instance;
    }
}

module.exports = Singleton;