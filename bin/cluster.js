'use strict';

/**
 * Module dependencies.
 */
var cluster = require('cluster')
var numCPUs = require('os').cpus().length
const logger = require('../api/logger')

/**
 * Package Functions
 */
if (cluster.isMaster) {
    cluster.setupMaster({
        exec: 'bin/www'
    });
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork().process
        logger.into('Creating process for cpu ' + i)
    }
    /*cluster.on('listening', function (worker, address) {
         logger.into('Worker id: ' + worker.id + ' listening at: ' + JSON.stringify(address))
    });    
    Object.keys(cluster.workers).forEach(function (id) {
         logger.into('Creating process for cpu ' + i)
          logger.into('Worker id: ' + id + ' with pid: ' + cluster.workers[id].process.pid)
    });*/
    cluster.on('exit', function (worker, code, signal) {
        logger.into('Worker []' + worker.process.pid + '] died: Respawning...')
        cluster.fork().process
    });
}