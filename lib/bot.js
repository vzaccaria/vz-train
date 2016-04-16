'use strict';

var TelegramBot = require('node-telegram-bot-api');
var Rx = require('rx');

var _module = function _module() {

    return {

        registerBot: function registerBot() {
            var token = process.env.TELEGRAM_TOKEN;
            // Setup polling way
            var bot = new TelegramBot(token, {
                polling: true
            });

            var onCustomCommand = function onCustomCommand(text, whatToDo) {
                var re = new RegExp('/' + text + '_(.+)');
                bot.onText(re, function (msg, match) {
                    var argument = match[1];
                    whatToDo({ argument: argument, bot: bot, msg: msg });
                });
            };

            var onCommandWithArg = function onCommandWithArg(text, whatToDo) {
                var re = new RegExp('/' + text + ' (.+)');
                bot.onText(re, function (msg, match) {
                    var argument = match[1];
                    whatToDo({ argument: argument, bot: bot, msg: msg });
                });
            };

            var onCommand = function onCommand(text, whatToDo) {
                var re = new RegExp('/' + text);
                bot.onText(re, function (msg, match) {
                    whatToDo({ bot: bot, msg: msg });
                });
            };

            return { bot: bot, onCommand: onCommand, onCommandWithArg: onCommandWithArg, onCustomCommand: onCustomCommand };
        }
    };
};

module.exports = _module();