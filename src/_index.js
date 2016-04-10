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
    return {
        help
    }
}

const main = () => {
    readLocal('docs/usage.md').then(it => {
        const {
            help
        } = getOptions(it);
        if (help) {
            console.log(it)
        } else {
            _module.trainStatus('S01301', 'S01700', '25529').then((v) => {
                console.log(v)
            })
        }
    })
}


module.exports = _.assign({
    main
}, _module)
