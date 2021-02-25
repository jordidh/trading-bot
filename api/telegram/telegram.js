"use strict";

/**
 * Module dependencies
 */
var nconf = require('nconf')
var logger = require('../logger')
const TeleBot = require('telebot')
var database = require('../database/database')
var kraken = require('../exchanges/kraken/apis')

/**
 * Package Functions
 */
const BUTTONS = {
    start: {
        label: '🏁 INICIO!',
        command: '/start'
    },
    balance: {
        label: '💰 BALANCE',
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
    },
    bot: {
        label: '⚙️ BOT',
        command: '/menu_trading_bot'
    },
    bot_activate: {
        label: '/menu_trading_bot_activate'
    },
    bot_deactivate: {
        label: '/menu_trading_bot_deactivate'
    }
};

const TEXT = {
    wellcome: {
        label: `,\n\nBienvenido al menú principal de Bot!`
    },
    activate_bot: {
        label: `🟢 ACTIVAR BOT`
    },
    activate_bot_description: {
        label: `En este estado el Bot realizará operaciones de forma automática cuando reciba señales de TradingView`
    },
    deactivate_bot: {
        label: `🔴 DESACTIVAR BOT`
    },
    deactivate_bot_description: {
        label: `En este estado el Bot NO realizará ninguna operación de forma automática cuando reciba señales de TradingView`
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
    let parseMode = 'html';
    // Validación usuario
    if (await database.boolCheckTelegramUser(id)) {
        // Menú Principal
        let replyMarkup = bot.keyboard([
            [BUTTONS.buy.label, BUTTONS.sell.label],
            [BUTTONS.logs.label, BUTTONS.bot.label],
            [BUTTONS.balance.label]
        ], { resize: true });
        return bot.sendMessage(id, `<b>` + `👋 Hola ` + first_name + TEXT.wellcome.label + `</b>`, { replyMarkup, parseMode })
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
        var data = await kraken.getBalance()
        // Menú Principal
        let replyMarkup = bot.keyboard([
            [BUTTONS.buy.label, BUTTONS.sell.label],
            [BUTTONS.logs.label, BUTTONS.bot.label],
            [BUTTONS.balance.label]
        ], { resize: true });
        return bot.sendMessage(id, `<b>` + data + `</b>`, { replyMarkup, parseMode })
        console.log(data)
    }
})

// Logs
bot.on(BUTTONS.logs.command, async (msg) => {
    let id = msg.from.id
    let first_name = msg.from.first_name
    let parseMode = 'html';
    // Validación usuario
    if (await database.boolCheckTelegramUser(id)) {
        // Muestra logs usuario
        var logs = await database.arrayGetUserLogs(id)
        // Menú Principal
        let replyMarkup = bot.keyboard([
            [BUTTONS.buy.label, BUTTONS.sell.label],
            [BUTTONS.logs.label, BUTTONS.bot.label],
            [BUTTONS.balance.label]
        ], { resize: true });
        return bot.sendMessage(id, `<b>` + logs + `</b>`, { replyMarkup, parseMode })
    }
});

// Bot
bot.on(BUTTONS.bot.command, async (msg) => {
    let id = msg.from.id
    let first_name = msg.from.first_name
    let parseMode = 'html'
    let replyMarkup
    // Validación usuario
    if (await database.boolCheckTelegramUser(id)) {
        // Comprobaremos el estado del Bot
        var status = await database.GetStatusBot()
        if (status.status === 1) {
            replyMarkup = bot.inlineKeyboard([
                [bot.inlineButton(TEXT.deactivate_bot.label, { callback: BUTTONS.bot_deactivate.label })]
            ]);
            return bot.sendMessage(id, `<b> 🟢 ESTADO BOT: ACTIVADO \nACCESO: ` + status.updated + '\n\n' + TEXT.activate_bot_description.label + `</b>`, { replyMarkup, parseMode });
        } else {
            replyMarkup = bot.inlineKeyboard([
                [bot.inlineButton(TEXT.activate_bot.label, { callback: BUTTONS.bot_activate.label })]
            ]);
            return bot.sendMessage(id, `<b> 🔴 ESTADO BOT: DESACTIVADO \nACCESO: ` + status.updated + '\n\n' + TEXT.deactivate_bot_description.label + `</b>`, { replyMarkup, parseMode });
        }
    }
})

// buy
bot.on(BUTTONS.buy.command, async (msg) => {
    let id = msg.from.id
    let first_name = msg.from.first_name
    let parseMode = 'html'
    let replyMarkup
    // Validación usuario
    if (await database.boolCheckTelegramUser(id)) {
        var data = await kraken.getAllCoins()
        if (data) {
            var buy = '['
            for (var i = 0; i < data.length; i++) {
                buy += `bot.inlineButton( '` + data[i].coin + `', { callback: '' }),`
            }
            buy += ']'

            replyMarkup = bot.inlineKeyboard([
                [bot.inlineButton('1', { callback: '/1' })],
                [bot.inlineButton('2', { callback: '/2' })]
            ]);
        }
        return bot.sendMessage(id, `BUY`, { replyMarkup, parseMode });
    }
})

// All callbackQuery Bot
bot.on('callbackQuery', async (msg) => {
    let id = msg.from.id
    let first_name = msg.from.first_name
    let parseMode = 'html';
    // Validación usuario
    if (await database.boolCheckTelegramUser(id)) {
        let updated = null
        // Actualizaremos el estado del Bot
        switch (msg.data) {
            case BUTTONS.bot_activate.label:
                updated = await database.UpdateStatusBot(true)
                return bot.sendMessage(id, `<b> 🟢 ESTADO BOT: ACTIVADO \nACCESO: ` + updated + '\n\n' + TEXT.activate_bot_description.label + `</b>`, { parseMode, parseMode })
            case BUTTONS.bot_deactivate.label:
                updated = await database.UpdateStatusBot(false)
                return bot.sendMessage(id, `<b> 🔴 ESTADO BOT: DESACTIVADO \nACCESO: ` + updated + '\n\n' + TEXT.deactivate_bot_description.label + `</b>`, { parseMode, parseMode })
        }
    }
})


bot.start();
logger.info({ message: 'SERVIDOR BOT TELEGRAM OK!' })

module.exports = bot
