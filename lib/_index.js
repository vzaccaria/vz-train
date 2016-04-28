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
    _: _,
    shelljs: shelljs,
    bluebird: bluebird,
    superagent: superagent,
    moment: moment
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
        help: help,
        bot: bot,
        test: test
    };
};

function tronca(i) {
    return _.trunc(i, {
        length: 4,
        omission: ''
    });
}

function formatStazione(stazione, ora) {
    var s = stazione;
    if (!ora.isValid()) {
        return '(**, **)';
    } else {
        return '(' + s + ', ' + ora.format('HH:mm') + ')';
    }
}

function formatInfo(i) {
    var binarioArrivo = "**";
    var SUR = "**";
    if (!_.isNaN(i.binarioArrivo)) {
        binarioArrivo = i.binarioArrivo;
    }
    if (i.stazioneUltimoRilevamento !== "--") {
        SUR = i.stazioneUltimoRilevamento;
    }
    var rile = formatStazione(SUR, i.oraUltimoRilevamentoMoment);
    var dst = formatStazione(i.destinazione, i.arrivoTeoricoMoment);
    return '<strong>' + i.ritardo + 'm</strong> B' + binarioArrivo + ' @' + rile;
    //`, @${tronca(stazioneUltimoRilevamento)}, Dst: ${tronca(i.destinazione)} [${i.dovrebbeArrivareAlle}]`
}

function registerCommands(_ref) {
    var onCommand = _ref.onCommand;
    var onCommandWithArg = _ref.onCommandWithArg;
    var onCustomCommand = _ref.onCustomCommand;

    onCommandWithArg('echo', function (_ref2) {
        var argument = _ref2.argument;
        var bot = _ref2.bot;
        var msg = _ref2.msg;

        var fromId = msg.from.id;
        bot.sendMessage(fromId, argument);
    });
    onCommand("lista", function (_ref3) {
        var argument = _ref3.argument;
        var bot = _ref3.bot;
        var msg = _ref3.msg;

        var fromId = msg.from.id;
        _module.getList().then(function (l) {
            var m = _.map(l, function (v) {
                return '/treno_' + v.nome + ': ' + formatInfo(v);
            }).join("\n");
            m = "Treni di cui sono informato\n" + m;
            bot.sendMessage(fromId, m, {
                parse_mode: 'HTML'
            });
        });
    });
    onCustomCommand('treno', function (_ref4) {
        var argument = _ref4.argument;
        var bot = _ref4.bot;
        var msg = _ref4.msg;

        var fromId = msg.from.id;
        _module.checkStatus(argument).then(function (l) {
            var m = _.map(l, formatInfo).join("\n");
            bot.sendMessage(fromId, m, {
                parse_mode: 'HTML'
            });
        });
    });
    _module.addToWatchList('S01301', 'S01700', '25509', 'mattina_7e13');
    _module.addToWatchList('S01301', 'S01700', '25511', 'mattina_8e13');
    _module.addToWatchList('S01301', 'S01700', '25513', 'mattina_9e13');
    _module.addToWatchList('S01301', 'S01700', '25527', 'pome_1710');
    _module.addToWatchList('S01301', 'S01700', '25529', 'pome_1810');
    _module.addToWatchList('S01301', 'S01700', '25531', 'pome_1910');
    _module.addToWatchList('S01301', 'S01700', '25533', 'pome_2010');
}

var main = function main() {
    readLocal('docs/usage.md').then(function (it) {
        var _getOptions = getOptions(it);

        var help = _getOptions.help;
        var bot = _getOptions.bot;
        var test = _getOptions.test;

        if (help) {
            console.log(it);
        } else if (test) {
            _module.trainStatus('S01301', 'S01700', '25529').then(function (v) {});
        } else if (bot) {
            registerCommands(registerBot());
        }
    });
};

module.exports = _.assign({
    main: main
}, _module);