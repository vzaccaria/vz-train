/* eslint quotes: [0], strict: [0] */
const {
    _, $d, $o, $fs, $b, $s
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
    _, shelljs, bluebird, superagent, moment
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
        help, bot, test
    }
}

const main = () => {
    readLocal('docs/usage.md').then(it => {
        const {
            help, bot, test
        } = getOptions(it);
        if (help) {
            console.log(it)
        } else if (test) {
            _module.trainStatus('S01301', 'S01700', '25529').then((v) => {
                console.log(v)
            })
        } else if (bot) {
            let {
                onCommand
            } = registerBot()
            onCommand('echo', ({
                argument, bot, msg
            }) => {
                let fromId = msg.from.id
                bot.sendMessage(fromId, argument)
            })
            onCommand("dimmi chi e'", ({
                argument, bot, msg
            }) => {
                let fromId = msg.from.id
                if (argument === "Chiara") {
                    bot.sendMessage(fromId, "Il tuo *amore*!")
                } else {
                    bot.sendMessage(fromId, "mah, non saprei")
                }
            })
        }
    })
}


module.exports = _.assign({
    main
}, _module)
