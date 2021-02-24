"use strict";

/**
 * Module dependencies
 */
var nconf = require('nconf')
const ngrok = require('ngrok')
var logger = require('./logger')
var database = require('../api/database')

/**
 * Package Functions
 */
exports.ngrok_start = async function () {
    try {
        await ngrok.connect({
            proto: 'http', // http|tcp|tls, defaults to http
            addr: nconf.get("APP_PORT_HTTP"), // port or network address, defaults to 80
            //auth: 'user:pwd', // http basic authentication for tunnel
            //subdomain: '?', // reserved tunnel name https://?.ngrok.io
            authtoken: nconf.get("NGROK_AUTHTOKEN"), // your authtoken from ngrok.com
            region: 'eu', // one of ngrok regions (us, eu, au, ap, sa, jp, in), defaults to us               
            onStatusChange: status => { }, // 'closed' - connection is lost, 'connected' - reconnected
            onLogEvent: data => { }, // returns stdout messages from ngrok process
        })
    } catch (err) {
        logger.error(err)
        await ngrok.disconnect()
        await ngrok.kill()
    }

    const { tunnels } = JSON.parse(await ngrok.getApi().get('api/tunnels'))
    if (tunnels.length > 0 && tunnels.length == 2) {
        // Cada vez que el servidor se inicie se borrará la tabla ngrok
        await database.run(`DELETE FROM ngrok`)
        // Insertaremos los datos relativos al tunnel ngrok
        await database.run(`INSERT INTO ngrok (local,https,http) VALUES('` + tunnels[0].config.addr + `', '` + tunnels[0].public_url + `', '` + tunnels[1].public_url + `')`)
    }

    logger.info({ message: 'SERVIDOR NGROK OK!' })
}

// Lanzador 
this.ngrok_start()

