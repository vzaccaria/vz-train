/*eslint quotes: [0] */

"use strict"

let chai = require('chai')
chai.use(require('chai-as-promised'))
let should = chai.should()
let expect = chai.expect
let _ = require('lodash')
let moment = require('moment')
require('babel-polyfill')

let debug = require('debug')
let bluebird = require('bluebird')
let shelljs = require('shelljs')
let fs = require('fs')
let mm = require('mm')
let superagent = require('superagent')
mm.restore()


superagent = require('superagent-promise')(superagent, bluebird);
require('./mock-config')({mm, superagent, bluebird})

var z = require('zaccaria-cli')
var promise = z.$b

/**
 * Promised version of shelljs exec
 * @param  {string} cmd The command to be executed
 * @return {promise}     A promise for the command output
 */
function exec(cmd) {
    "use strict"
    return new promise((resolve, reject) => {
        require('shelljs').exec(cmd, {
            async: true,
            silent: true
        }, (code, output) => {
            if (code !== 0) {
                reject(output)
            } else {
                resolve(output)
            }
        })
    })
}


/*global describe, it, before, beforeEach, after, afterEach */

describe('#command', () => {
    "use strict"
    it('should show help', () => {
        var usage = fs.readFileSync(`${__dirname}/../docs/usage.md`, 'utf8')
        return exec(`${__dirname}/../lib/index.js -h`).should.eventually.contain(usage)
    })
})

describe('#module', () => {
    let record = {}
    let _module = require('./module');
    _module = _module({
        debug, _, shelljs, bluebird, superagent, moment
    })
    "use strict"
    it('should try to read help on readHelp', () => {

        record = {}
        mm(shelljs, 'exec', (c, opts, cb) => {
            record.commandExecuted = c;
            cb(0, 'file contents')
        })

        return _module.readHelp().then((v) => {

            expect(record).to.contain({
                commandExecuted: "cat ../docs/usage.md"
            })
            expect(v).to.deep.equal({code: 0, stdout: 'file contents'});
        })
    })
    it('#trainStatus should be exposed', () => {
        expect(_module.trainStatus).to.exist
    })
    it('#trainStatus should return expected data on request', () => {
        return _module.trainStatus('S01301', 'S01700', '25527').then((v) => {
            expect(v.ritardo).to.be.equal(3)
            expect(v.binarioArrivo).to.be.equal(8)
            console.log(v);
        })
    })


})
