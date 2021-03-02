"use strict";

/**
 * Module dependencies
 */
var config = require('../../config/config');
var logger = require('../logger');
const TeleBot = require('telebot');
var kraken = require('../exchanges/kraken/apis');
let tradingControl = require('../tradingControl');
var BotPersistentData = require('../database/botPersistentData');

const TEST_MODE = true;
const REAL_MODE = false;

/**
 * Package Functions
 */
const BUTTONS = {
    start: {
        label: '🏁 INICI!',
        command: '/start'
    },
    info: {
        label: '🏁 INFO!',
        command: '/info'
    },
    balance: {
        label: '💰 BALANCE',
        command: '/balance'
    },
    logs: {
        label: '📊 LOGS',
        command: '/logs'
    },
    buy: {
        label: '📉 COMPRA',
        command: '/buy'
    },
    sell: {
        label: '📈 VEN',
        command: '/sell'
    },
    buy_test: {
        label: '📉 COMPRA TEST',
        command: '/buytest'
    },
    sell_test: {
        label: '📈 VEN TEST',
        command: '/selltest'
    },
    bot: {
        label: '⚙️ BOT',
        command: '/bot'
    },
    bot_activate: {
        label: '🟢 ACTIVA EL BOT',
        command: '/activate'
    },
    bot_deactivate: {
        label: '🔴 DESACTIVA EL BOT',
        command: '/deactivate'
    }
};

const TEXT = {
    info: {
        label: `, Comandes disponibles:\n\n` + 
               `<b>\/balance</b>` +
               `<b>\/buy [pair]</b>, Ex: /buy XBT/EUR, /buy XBT/USD, /buy ETH/EUR, /buy ADA/EUR, /buy USDT/EUR\n` +
               `<b>\/buytest [pair]</b>, Ex: /buytest XBT/EUR\n` +
               `<b>\/sell [pair]</b>, Ex: /sell XBT/EUR\n` +
               `<b>\/selltest [pair]</b>, Ex: /selltest XBT/EUR\n` +
               `\n` +
               `<b>/activate</b>, s'activa la compra/venda automàtica amb POST\n` +
               `<b>/deactivate</b>, es desactiva la compra/venda automàtica amb POST\n` +
               `<b>/bot</b>, es mostra l'estat actual del bot: si està actiu o no\n`+
               `\n` +
               `<b>/logs [num_last_logs]</b>, retorna els últims logs (compres i vendes)\n`
    },
    activate_bot: {
        label: `🟢 ACTIVA EL BOT`
    },
    activate_bot_description: {
        label: `En este estado el Bot realizará operaciones cuando reciba señales de TradingView, si es podran fer operacions de forma manual`
    },
    deactivate_bot: {
        label: `🔴 DESACTIVA EL BOT`
    },
    deactivate_bot_description: {
        label: `En este estado el Bot NO realizará ninguna operación cuando reciba señales de TradingView, si es podran fer operacions de forma manual`
    },
}

const bot = new TeleBot({
    token: config.TELEGRAM.TOKEN,
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
    if (id === Number(config.TELEGRAM.USER_ID)) {
        // Menú Principal
        let replyMarkup = bot.keyboard([
            [BUTTONS.info.label, BUTTONS.bot.label],
            [BUTTONS.balance.label]
        ], { resize: true });
        return bot.sendMessage(id, `<b>` + `👋 Hola ` + first_name+ `</b>` + TEXT.info.label, { replyMarkup, parseMode })
    }
});

// Info
bot.on(BUTTONS.info.command, async (msg) => {
    let id = msg.from.id
    let first_name = msg.from.first_name
    let parseMode = 'html';

    // Validación usuario
    if (id === Number(config.TELEGRAM.USER_ID)) {
        // Menú Principal
        let replyMarkup = bot.keyboard([
            [BUTTONS.info.label, BUTTONS.bot.label],
            [BUTTONS.balance.label]
        ], { resize: true });
        return bot.sendMessage(id, `<b>` + `👋 Hola ` + first_name+ `</b>` + TEXT.info.label, { replyMarkup, parseMode })
    }
});

// Activate
bot.on(BUTTONS.bot_activate.command, async (msg) => {
    let id = msg.from.id
    //let first_name = msg.from.first_name
    let parseMode = 'html';

    // Validación usuario
    if (id === Number(config.TELEGRAM.USER_ID)) {
        // Recuperem o creem una instància del bot
        let botData = new BotPersistentData().getInstance();
        // Obtenim l'estat del bot (si està actiu o inactiu)
        await botData.SetStatusBot(true);

        let replyMarkup = bot.keyboard([
            [BUTTONS.info.label, BUTTONS.bot.label],
            [BUTTONS.balance.label],
            [BUTTONS.bot_deactivate.label]
        ], { resize: true });
        return bot.sendMessage(id, `<b> 🟢 BOT STATUS: ACTIVATED` + '\n\n' + TEXT.activate_bot_description.label + `</b>`, { replyMarkup, parseMode })
    }
});

// Deactivate
bot.on(BUTTONS.bot_deactivate.command, async (msg) => {
    let id = msg.from.id
    //let first_name = msg.from.first_name
    let parseMode = 'html';

    // Validación usuario
    if (id === Number(config.TELEGRAM.USER_ID)) {
        // Recuperem o creem una instància del bot
        let botData = new BotPersistentData().getInstance();
        // Obtenim l'estat del bot (si està actiu o inactiu)
        await botData.SetStatusBot(false);

        let replyMarkup = bot.keyboard([
            [BUTTONS.info.label, BUTTONS.bot.label],
            [BUTTONS.balance.label],
            [BUTTONS.bot_activate.label]
        ], { resize: true });
        return bot.sendMessage(id, `<b> 🔴 BOT STATUS: DEACTIVATED` + '\n\n' + TEXT.deactivate_bot_description.label + `</b>`, { replyMarkup, parseMode })
    }
});

// Balance
bot.on(BUTTONS.balance.command, async (msg) => {
    let id = msg.from.id
    let first_name = msg.from.first_name
    let parseMode = 'html';
    // Validación usuario
    if (id === Number(config.TELEGRAM.USER_ID)) {
        // Muestra logs usuario
        var balance = await kraken.getBalance();
        // Menú Principal
        let replyMarkup = bot.keyboard([
            [BUTTONS.info.label, BUTTONS.bot.label],
            [BUTTONS.balance.label]
        ], { resize: true });
        return bot.sendMessage(id, JSON.stringify(balance, null, "  "), { replyMarkup, parseMode });
    }
})

// Logs: recuperem els últims logs de compra i venda
bot.on(BUTTONS.logs.command, async (msg) => {
    let id = msg.from.id
    //let first_name = msg.from.first_name
    let parseMode = 'html';
    // Validación usuario
    if (id === Number(config.TELEGRAM.USER_ID)) {
        let msgWords = msg.text.split(' ');  // Ex: '/logs 20'
        // Si hi ha un error en el missatge rebut sortim
        if (msgWords.length != 2) {
            return bot.sendMessage(id, 
                "Error, la crida a la comanda " + BUTTONS.logs.command + " ha de tenir un paràmetre amb el número de logs que es volen consultar",
                { parseMode, parseMode }
            );
        }

        console.log("1");

        if (isNaN(msgWords[1]) || isNaN(parseInt(msgWords[1])) ) {
            return bot.sendMessage(id, 
                "Error, el sogon paràmetre no és un numèric",
                { parseMode, parseMode }
            );
        }

        console.log("2");

        // Recuperem o creem una instància del bot
        let botData = new BotPersistentData().getInstance();
        let logs = await botData.GetLastLogs(parseInt(msgWords[1]));

        console.log("logs:", logs);

        //var logs = await database.arrayGetUserLogs(id)
        // Menú Principal
        let replyMarkup = bot.keyboard([
            [BUTTONS.info.label, BUTTONS.bot.label],
            [BUTTONS.balance.label]
        ], { resize: true });

        let logsFormated = "No logs found";
        if (logs && Array.isArray(logs) && logs.length > 0) {
            logsFormated = logs;
        }

        return bot.sendMessage(id, `<b>` + logsFormated + `</b>`, { replyMarkup, parseMode });
    }
});

// Bot
bot.on(BUTTONS.bot.command, async (msg) => {
    let id = msg.from.id
    let first_name = msg.from.first_name
    let parseMode = 'html'
    //let replyMarkup
    // Validación usuario
    if (id === Number(config.TELEGRAM.USER_ID)) {
        // Recuperem o creem una instància del bot
        let botData = new BotPersistentData().getInstance();
        //console.log("botData.Active=" + botData.Active);
        if (botData.Active === true) {
            let replyMarkup = bot.keyboard([
                [BUTTONS.info.label, BUTTONS.bot.label],
                [BUTTONS.balance.label],
                [BUTTONS.bot_deactivate.label]
            ], { resize: true });
            return bot.sendMessage(id, `<b> 🟢 BOT STATUS: ACTIVATED` + '\n\n' + TEXT.activate_bot_description.label + `</b>`, { replyMarkup, parseMode });
        } else {
            let replyMarkup = bot.keyboard([
                [BUTTONS.info.label, BUTTONS.bot.label],
                [BUTTONS.balance.label],
                [BUTTONS.bot_activate.label]
            ], { resize: true });
            return bot.sendMessage(id, `<b> 🔴 BOT STATUS: DEACTIVATED` + '\n\n' + TEXT.deactivate_bot_description.label + `</b>`, { replyMarkup, parseMode });
        }
    }
})

// buy
bot.on(BUTTONS.buy.command, async (msg) => {
    let id = msg.from.id;
    
    // Validació usuari
    if (id === Number(config.TELEGRAM.USER_ID)) {
        // Encara que el bot estigui desactivat permetem fer compres de forma manual
        // Recuperem o creem una instància del bot
        //let botData = new BotPersistentData().getInstance();
        // Obtenim l'estat del bot (si està actiu o inactiu)
        //if (botData.Active === false) {
        //    return bot.sendMessage(id, "bot inactive", { parseMode, parseMode });
        //}

        // Recuperem la informació del missatge rebut
        let msgLanguageCode = msg.from.language_code; //ca
        let msgWords = msg.text.split(' ');  // Ex: '/buy_test XEUR'
        let parseMode = 'html';

        // Si hi ha un error en el missatge rebut sortim
        if (msgWords.length != 2) {
            return bot.sendMessage(id, 
                "Error, la crida a la comanda " + BUTTONS.buy.command + " ha de tenir un paràmetre amb el pair, ex: buy XBTEUR",
                { parseMode, parseMode }
            );
        }

        // Tot correcte, creem l'ordre
        let pair = msgWords[1]; //"XBTEUR"
        let response = await tradingControl.addOrder(kraken, "buy", pair, REAL_MODE);

        // Recuperem o creem una instància del bot
        let botData = new BotPersistentData().getInstance();
        await botData.addLog(JSON.stringify(response));

        return bot.sendMessage(id, JSON.stringify(response, null, "  "), { parseMode, parseMode });
    }
})

// buy test mode
bot.on(BUTTONS.buy_test.command, async (msg) => {
    let id = msg.from.id;
    
    // Validació usuari
    if (id === Number(config.TELEGRAM.USER_ID)) {
        // Recuperem la informació del missatge rebut
        let msgLanguageCode = msg.from.language_code; //ca
        let msgWords = msg.text.split(' ');  // Ex: '/buy_test XEUR'
        let parseMode = 'html';

        // Si hi ha un error en el missatge rebut sortim
        if (msgWords.length != 2) {
            return bot.sendMessage(id, 
                "Error, la crida a la comanda " + BUTTONS.buy_test.command + " ha de tenir un paràmetre amb el pair, ex: buy_test XBTEUR",
                { parseMode, parseMode }
            );
        }

        // Tot correcte, creem l'ordre
        let pair = msgWords[1]; //"XBTEUR"
        let response = await tradingControl.addOrder(kraken, "buy", pair, TEST_MODE);
        return bot.sendMessage(id, 
            `result = ` + JSON.stringify(response, null, "  "),
            { parseMode, parseMode }
        );
    }
});

// sell
bot.on(BUTTONS.sell.command, async (msg) => {
    let id = msg.from.id;
    
    // Validació usuari
    if (id === Number(config.TELEGRAM.USER_ID)) {

        // Encara que el bot estigui desactivat permetem fer compres de forma manual
        // Recuperem o creem una instància del bot
        //let botData = new BotPersistentData().getInstance();
        // Obtenim l'estat del bot (si està actiu o inactiu)
        //if (botData.Active === false) {
        //    return bot.sendMessage(id, "bot inactive", { parseMode, parseMode });
        //}

        // Recuperem la informació del missatge rebut
        let msgLanguageCode = msg.from.language_code; //ca
        let msgWords = msg.text.split(' ');  // Ex: '/buy_test XEUR'
        let parseMode = 'html';

        // Si hi ha un error en el missatge rebut sortim
        if (msgWords.length != 2) {
            return bot.sendMessage(id, 
                "Error, la crida a la comanda " + BUTTONS.sell.command + " ha de tenir un paràmetre amb el pair, ex: buy XBTEUR",
                { parseMode, parseMode }
            );
        }

        // Tot correcte, creem l'ordre
        let pair = msgWords[1]; //"XBTEUR"
        let response = await tradingControl.addOrder(kraken, "sell", pair, REAL_MODE);

        // Recuperem o creem una instància del bot
        let botData = new BotPersistentData().getInstance();
        await botData.addLog(JSON.stringify(response));

        return bot.sendMessage(id, JSON.stringify(response, null, "  "), { parseMode, parseMode });
    }
})

// sell test mode
bot.on(BUTTONS.sell_test.command, async (msg) => {
    let id = msg.from.id;
    
    // Validació usuari
    if (id === Number(config.TELEGRAM.USER_ID)) {
        // Recuperem la informació del missatge rebut
        let msgLanguageCode = msg.from.language_code; //ca
        let msgWords = msg.text.split(' ');  // Ex: '/buy_test XEUR'
        let parseMode = 'html';

        // Si hi ha un error en el missatge rebut sortim
        if (msgWords.length != 2) {
            return bot.sendMessage(id, 
                "Error, la crida a la comanda " + BUTTONS.sell_test.command + " ha de tenir un paràmetre amb el pair, ex: buy_test XBTEUR",
                { parseMode, parseMode }
            );
        }

        // Tot correcte, creem l'ordre
        let pair = msgWords[1]; //"XBTEUR"
        let response = await tradingControl.addOrder(kraken, "sell", pair, TEST_MODE);
        return bot.sendMessage(id, 
            `result = ` + JSON.stringify(response, null, "  "),
            { parseMode, parseMode }
        );
    }
});

/*
// All callbackQuery Bot
bot.on('callbackQuery', async (msg) => {
    let id = msg.from.id
    let first_name = msg.from.first_name
    let parseMode = 'html';
    // Validación usuario
    if (id === Number(config.TELEGRAM.USER_ID)) {
        let updated = null;
        // Recuperem o creem una instància del bot
        let botData = new BotPersistentData().getInstance();

        console.log("Telegram command=" + msg.data);

        // Actualizaremos el estado del Bot
        switch (msg.data) {
            case BUTTONS.bot_activate.label:
                // Obtenim l'estat del bot (si està actiu o inactiu)
                await botData.SetStatusBot(true);
                return bot.sendMessage(id, `<b> 🟢 BOT STATUS: ACTIVATED` + '\n\n' + TEXT.activate_bot_description.label + `</b>`, { parseMode, parseMode })
            case BUTTONS.bot_deactivate.label:
                // Obtenim l'estat del bot (si està actiu o inactiu)
                await botData.SetStatusBot(false);
                return bot.sendMessage(id, `<b> 🔴 BOT STATUS: DEACTIVATED` + '\n\n' + TEXT.deactivate_bot_description.label + `</b>`, { parseMode, parseMode })
        }
    }
})
*/

bot.start();
logger.info({ message: 'SERVIDOR BOT TELEGRAM OK!' })

module.exports = bot
