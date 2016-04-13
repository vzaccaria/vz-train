'use strict';

/* eslint quotes: [0], strict: [0] */

var _require =
// $r.stdin() -> Promise  ;; to read from stdin
require('zaccaria-cli');

var _ = _require._;
var $d = _require.$d;
var $o = _require.$o;
var $fs = _require.$fs;
var $b = _require.$b;
var $s = _require.$s;


var shelljs = $s;
var bluebird = $b;
var superagent = require('superagent');
superagent = require('superagent-promise')(superagent, bluebird);

var moment = require('moment');
var path = require('path');
var debug = require('debug');

var _require2 = require('./bot');

var registerBot = _require2.registerBot;


var _module = require('./module');

_module = _module({
    _: _, shelljs: shelljs, bluebird: bluebird, superagent: superagent, moment: moment
});

var readLocal = function readLocal(f) {
    var curdir = path.dirname($fs.realpathSync(__filename));
    var filepath = path.join(curdir, '../' + f);
    return $fs.readFileAsync(filepath, 'utf8');
};

var getOptions = function getOptions(doc) {
    "use strict";

    var o = $d(doc);
    var help = $o('-h', '--help', false, o);
    var bot = o.bot;
    var test = o.test;
    return {
        help: help, bot: bot, test: test
    };
};

var main = function main() {
    readLocal('docs/usage.md').then(function (it) {
        var _getOptions = getOptions(it);

        var help = _getOptions.help;
        var bot = _getOptions.bot;
        var test = _getOptions.test;

        if (help) {
            console.log(it);
        } else if (test) {
            _module.trainStatus('S01301', 'S01700', '25529').then(function (v) {
                console.log(v);
            });
        } else if (bot) {
            var _registerBot = registerBot();

            var onCommand = _registerBot.onCommand;

            onCommand('echo', function (_ref) {
                var argument = _ref.argument;
                var bot = _ref.bot;
                var msg = _ref.msg;

                var fromId = msg.from.id;
                bot.sendMessage(fromId, argument);
            });
            onCommand("dimmi chi e'", function (_ref2) {
                var argument = _ref2.argument;
                var bot = _ref2.bot;
                var msg = _ref2.msg;

                var fromId = msg.from.id;
                if (argument === "Chiara") {
                    bot.sendMessage(fromId, "Il tuo *amore*!");
                } else {
                    bot.sendMessage(fromId, "mah, non saprei");
                }
            });
        }
    });
};

module.exports = _.assign({
    main: main
}, _module);