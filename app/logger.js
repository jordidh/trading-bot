"use strict";

/**
 * Package Functions
 */
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

/**
 * Custom Functions
 */

const custom_format_logger = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} - ${message}`;
});

const custom_format_console = printf(({ level, message, label, timestamp }) => {
    return `${level}: ${timestamp} - ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'DD-MM-YYYY HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
        custom_format_logger
    ),
    transports: [
        //new transports.File({ filename: './logs/errors.log', level: 'error', handleExceptions: true }),
        //new transports.File({ filename: './logs/logs.log' })
    ]
});


if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.timestamp({
                format: 'DD-MM-YYYY HH:mm:ss'
            }),
            format.simple(),
            custom_format_console
        )
    }));
}

module.exports = logger