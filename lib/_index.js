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

var _require2 = require('./trenord');

var setupTrenordTrains = _require2.setupTrenordTrains;


var moment = require('moment');
var path = require('path');
var debug = require('debug');

var _require3 = require('./bot');

var registerBot = _require3.registerBot;


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

// function tronca(i) {
//     return _.trunc(i, {
//         length: 4,
//         omission: ''
//     });
// }

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
    return '<strong>' + i.ritardo + 'm</strong> // ' + binarioArrivo + ' @' + rile;
    //`, @${tronca(stazioneUltimoRilevamento)}, Dst: ${tronca(i.destinazione)} [${i.dovrebbeArrivareAlle}]`
}

function getListaAutobus() {
    var data = [{
        msg: "Dal 9/6 al 31/7 e dal 29/8 al 4/9",
        lista: [{
            corsa: "314 -> ST",
            valori: ["6:55", "7:25", "7:55", "8:20", "8:50"]
        }]
    }, {
        msg: "dal 1/8 al 28/8",
        lista: [{
            corsa: "314 -> ST",
            valori: ["7:45"]
        }]
    }];
    var m = "";
    _.map(data, function (e) {
        m = m + ('\n\n' + e.msg + ':\n  ') + _.map(e.lista, function (v) {
            return '<strong>' + v.corsa + '</strong>: ' + v.valori.join(', ');
        }).join('\n  ');
    }).join('\n ');
    return m;
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

    onCommand("ultimi", function (_ref4) {
        var argument = _ref4.argument;
        var bot = _ref4.bot;
        var msg = _ref4.msg;

        var fromId = msg.from.id;
        var l = _module.getURivMap();
        bot.sendMessage(fromId, JSON.stringify(l, 0, 4));
    });

    onCommand('st', function (_ref5) {
        var argument = _ref5.argument;
        var bot = _ref5.bot;
        var msg = _ref5.msg;

        var fromId = msg.from.id;
        var m = "Autobus di cui sono informato\n" + getListaAutobus();
        bot.sendMessage(fromId, m, {
            parse_mode: 'HTML'
        });
    });
    onCustomCommand('treno', function (_ref6) {
        var argument = _ref6.argument;
        var bot = _ref6.bot;
        var msg = _ref6.msg;

        var fromId = msg.from.id;
        _module.checkStatus(argument).then(function (l) {
            var m = _.map(l, formatInfo).join("\n");
            bot.sendMessage(fromId, m, {
                parse_mode: 'HTML'
            });
        });
    });
    setupTrenordTrains(_module);
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
    main: main, getListaAutobus: getListaAutobus
}, _module);