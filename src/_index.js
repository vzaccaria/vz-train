/* eslint quotes: [0], strict: [0] */
const {
    _,
    $d,
    $o,
    $fs,
    $b,
    $s
    // $r.stdin() -> Promise  ;; to read from stdin
} = require('zaccaria-cli')

const shelljs = $s
const bluebird = $b
let superagent = require('superagent')
superagent = require('superagent-promise')(superagent, bluebird);

let moment = require('moment')
const path = require('path')
const debug = require('debug')
let {
    registerBot
} = require('./bot')



let _module = require('./module');

_module = _module({
    _,
    shelljs,
    bluebird,
    superagent,
    moment
})


let readLocal = f => {
    const curdir = path.dirname($fs.realpathSync(__filename));
    const filepath = path.join(curdir, `../${f}`)
    return $fs.readFileAsync(filepath, 'utf8')
}


const getOptions = doc => {
    "use strict"
    const o = $d(doc)
    const help = $o('-h', '--help', false, o)
    const bot = o.bot
    const test = o.test
    return {
        help,
        bot,
        test
    }
}

function tronca(i) {
    return _.trunc(i, {
        length: 4,
        omission: ''
    })
}

function formatStazione(stazione, ora) {
    let s = stazione;
    if (!ora.isValid()) {
        return `(**, **)`
    } else {
        return `(${s}, ${ora.format('HH:mm')})`
    }
}

function formatInfo(i) {
    let binarioArrivo = "**"
    let SUR = "**"
    if (!_.isNaN(i.binarioArrivo)) {
        binarioArrivo = i.binarioArrivo
    }
    if (i.stazioneUltimoRilevamento !== "--") {
        SUR = i.stazioneUltimoRilevamento
    }
    let rile = formatStazione(SUR, i.oraUltimoRilevamentoMoment)
    let dst = formatStazione(i.destinazione, i.arrivoTeoricoMoment)
    return `<strong>${i.ritardo}m</strong> B${binarioArrivo} @${rile}`
        //`, @${tronca(stazioneUltimoRilevamento)}, Dst: ${tronca(i.destinazione)} [${i.dovrebbeArrivareAlle}]`
}

function registerCommands({
    onCommand,
    onCommandWithArg,
    onCustomCommand
}) {
    onCommandWithArg('echo', ({
        argument,
        bot,
        msg
    }) => {
        let fromId = msg.from.id
        bot.sendMessage(fromId, argument)
    })
    onCommand("lista", ({
        argument,
        bot,
        msg
    }) => {
        let fromId = msg.from.id
        _module.getList().then(l => {
            let m = _.map(l, (v) => `/treno_${v.nome}: ${formatInfo(v)}`).join("\n")
            m = "Treni di cui sono informato\n" + m
            bot.sendMessage(fromId, m, {
                parse_mode: 'HTML'
            })
        })
    })
    onCustomCommand('treno', ({
        argument,
        bot,
        msg
    }) => {
        let fromId = msg.from.id
        _module.checkStatus(argument).then(l => {
            let m = _.map(l, formatInfo).join("\n");
            bot.sendMessage(fromId, m, {
                parse_mode: 'HTML'
            })
        })
    })
    _module.addToWatchList('S01301', 'S01700', '25509', 'mattina_7e13')
    _module.addToWatchList('S01301', 'S01700', '25511', 'mattina_8e13')
    _module.addToWatchList('S01301', 'S01700', '25513', 'mattina_9e13')
    _module.addToWatchList('S01301', 'S01700', '25527', 'pome_1710')
    _module.addToWatchList('S01301', 'S01700', '25529', 'pome_1810')
    _module.addToWatchList('S01301', 'S01700', '25531', 'pome_1910')
    _module.addToWatchList('S01301', 'S01700', '25533', 'pome_2010')
}

const main = () => {
    readLocal('docs/usage.md').then(it => {
        const {
            help,
            bot,
            test
        } = getOptions(it);
        if (help) {
            console.log(it)
        } else if (test) {
            _module.trainStatus('S01301', 'S01700', '25529').then((v) => {})
        } else if (bot) {
            registerCommands(registerBot())
        }
    })
}


module.exports = _.assign({
    main
}, _module)
