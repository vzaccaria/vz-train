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

            let onCommand = function(text, whatToDo) {
                let re = new RegExp(`\/${text} (.+)`);
                bot.onText(re, function(msg, match) {
                    console.log(JSON.stringify({msg, match}, 0, 4));
                    let argument = match[1]
                    whatToDo({argument, bot, msg})
                })
            }

            return { bot, onCommand }
        }
    }
}

module.exports = _module()
