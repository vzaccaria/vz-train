let TelegramBot = require('node-telegram-bot-api');
var Rx = require('rx')

let _module = () => {

    return {

        registerBot: () => {
            let token = process.env.TELEGRAM_TOKEN
                // Setup polling way
            let bot = new TelegramBot(token, {
                polling: true
            });

            let onCustomCommand = function(text, whatToDo) {
                let re = new RegExp(`\/${text}_(.+)`);
                bot.onText(re, function(msg, match) {
                    let argument = match[1]
                    whatToDo({argument, bot, msg})
                })

            }

            let onCommandWithArg = function(text, whatToDo) {
                let re = new RegExp(`\/${text} (.+)`);
                bot.onText(re, function(msg, match) {
                    let argument = match[1]
                    whatToDo({argument, bot, msg})
                })
            }

            let onCommand = function(text, whatToDo) {
                let re = new RegExp(`\/${text}`);
                bot.onText(re, function(msg, match) {
                    whatToDo({bot, msg})
                })
            }

            return { bot, onCommand, onCommandWithArg, onCustomCommand }
        }
    }
}

module.exports = _module()
