
"use strict";

/**
 * Module dependencies
 */
var path = require('path')
var images = require('../../helpers/telegram/images')
var utils = require('../../helpers/utils/utils')
var bot = require('../../api/telegram')
var database = require('../database')

exports.sendGIF = async function (id) {
    bot.sendDocument(id, 'https://ethel-dialogflow.s3-eu-west-1.amazonaws.com/telegrambotkraken/bitcoingoingup.gif', {
        fileName: 'bitcoin.gif',
        serverDownload: true
    });
};

exports.sendBroadcastNewNgrokServer = async function () {
    var array = []
    array = (await database.all(`SELECT telegram_id as telegram_id from users`))
    if (array && array.length > 0) {
        for (var i = 0; i < array.length; i++) {
            await bot.sendMessage(array[i].telegram_id, 'Notificación de cambio de url en Bot de TradingView' + '\n' + await utils.getTradingViewWebhook())
            await bot.sendDocument(array[i].telegram_id, path.join(__dirname, images.ngrok[0]), {
                fileName: 'bitcoin.gif',
                serverDownload: true
            })
        }
    }
};