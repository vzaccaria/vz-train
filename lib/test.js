/*eslint quotes: [0] */

"use strict";

var chai = require('chai');
chai.use(require('chai-as-promised'));
var should = chai.should();
var expect = chai.expect;
var _ = require('lodash');
var moment = require('moment');
require('babel-polyfill');

var debug = require('debug');
var bluebird = require('bluebird');
var shelljs = require('shelljs');
var fs = require('fs');
var mm = require('mm');
var superagent = require('superagent');
mm.restore();

superagent = require('superagent-promise')(superagent, bluebird);
require('./mock-config')({ mm: mm, superagent: superagent, bluebird: bluebird });

var z = require('zaccaria-cli');
var promise = z.$b;

/**
 * Promised version of shelljs exec
 * @param  {string} cmd The command to be executed
 * @return {promise}     A promise for the command output
 */
function exec(cmd) {
    "use strict";

    return new promise(function (resolve, reject) {
        require('shelljs').exec(cmd, {
            async: true,
            silent: true
        }, function (code, output) {
            if (code !== 0) {
                reject(output);
            } else {
                resolve(output);
            }
        });
    });
}

/*global describe, it, before, beforeEach, after, afterEach */

describe('#command', function () {
    "use strict";

    it('should show help', function () {
        var usage = fs.readFileSync(__dirname + '/../docs/usage.md', 'utf8');
        return exec(__dirname + '/../lib/index.js -h').should.eventually.contain(usage);
    });
});

describe('#module', function () {
    var record = {};
    var _module = require('./module');
    _module = _module({
        debug: debug, _: _, shelljs: shelljs, bluebird: bluebird, superagent: superagent, moment: moment
    });
    "use strict";
    it('should try to read help on readHelp', function () {

        record = {};
        mm(shelljs, 'exec', function (c, opts, cb) {
            record.commandExecuted = c;
            cb(0, 'file contents');
        });

        return _module.readHelp().then(function (v) {

            expect(record).to.contain({
                commandExecuted: "cat ../docs/usage.md"
            });
            expect(v).to.deep.equal({ code: 0, stdout: 'file contents' });
        });
    });
    it('#trainStatus should be exposed', function () {
        expect(_module.trainStatus).to.exist;
    });
    it('#trainStatus should return expected data on request', function () {
        return _module.trainStatus('S01301', 'S01700', '25527').then(function (v) {
            expect(v.ritardo).to.be.equal(3);
            expect(v.binarioArrivo).to.be.equal(8);
        });
    });
});