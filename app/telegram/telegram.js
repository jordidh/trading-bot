"use strict";

/**
 * Module dependencies
 */
var nconf = require('nconf')
var logger = require('../logger')
const TeleBot = require('telebot')
var utils = require('../../helpers/utils/utils')
var database = require('../database')
var kraken = require('../exchanges/kraken')

/**
 * Package Functions
 */
const BUTTONS = {
    start: {
        label: '🏁 INICIO!',
        command: '/start'
    },
    balance: {
        label: '💱 BALANCE CONTABLE',
        command: '/menu_balance'
    },
    logs: {
        label: '📊 LOGS',
        command: '/menu_logs'
    },
    buy: {
        label: '📉 COMPRAR',
        command: '/menu_buy'
    },
    sell: {
        label: '📈 VENDER',
        command: '/menu_sell'
    }
};

const TEXT = {
    wellcome: {
        label: `, Bienvenido al menú principal de Bot!`
    },
}

const bot = new TeleBot({
    token: nconf.get("TELEGRAM").TOKEN,
    usePlugins: ['askUser', 'namedButtons'],
    pluginConfig: {
        namedButtons: {
            buttons: BUTTONS
        }
    }
});

/**
 * Commands
 */

// Start
bot.on(BUTTONS.start.command, async (msg) => {
    let id = msg.from.id
    let first_name = msg.from.first_name
    // Validación usuario
    if (await database.boolCheckTelegramUser(id)) {
        // Menú Principal
        let replyMarkup = bot.keyboard([
            [BUTTONS.balance.label],
            [BUTTONS.buy.label, BUTTONS.sell.label],
            [BUTTONS.logs.label]
        ], { resize: true });
        return bot.sendMessage(id, `👋 ` + await utils.telegram_greetings() + ` ` + first_name + TEXT.wellcome.label, { replyMarkup })
    }
});

// Balance
bot.on(BUTTONS.balance.command, async (msg) => {
    let id = msg.from.id
    let first_name = msg.from.first_name
    let parseMode = 'html';
    // Validación usuario
    if (await database.boolCheckTelegramUser(id)) {
        // Muestra logs usuario
        var balance = await kraken.GetBalance()
        // Menú Principal
        let replyMarkup = bot.keyboard([
            [BUTTONS.balance.label],
            [BUTTONS.buy.label, BUTTONS.sell.label],
            [BUTTONS.logs.label]
        ], { resize: true });
        return bot.sendMessage(id, balance, { replyMarkup, parseMode })
    }
});

// Logs
bot.on(BUTTONS.logs.command, async (msg) => {
    let id = msg.from.id
    let first_name = msg.from.first_name
    // Validación usuario
    if (await database.boolCheckTelegramUser(id)) {
        // Muestra logs usuario
        var logs = await database.arrayGetUserLogs(id)
        // Menú Principal
        let replyMarkup = bot.keyboard([
            [BUTTONS.balance.label],
            [BUTTONS.buy.label, BUTTONS.sell.label],
            [BUTTONS.logs.label]
        ], { resize: true });
        return bot.sendMessage(id, logs, { replyMarkup })
    }
});

bot.start();
logger.info({ message: 'SERVIDOR BOT TELEGRAM OK!' })

module.exports = bot
