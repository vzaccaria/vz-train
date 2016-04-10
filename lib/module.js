'use strict';

var _module = function _module(_ref) {
    var _ = _ref._;
    var shelljs = _ref.shelljs;
    var bluebird = _ref.bluebird;

    if (_.any([_, bluebird, shelljs], _.isUndefined)) {
        return undefined;
    }

    var execAsync = function execAsync(cmd) {
        return new bluebird(function (resolve) {
            shelljs.exec(cmd, { async: true }, function (code, stdout) {
                resolve({ code: code, stdout: stdout });
            });
        });
    };

    return {
        readHelp: function readHelp() {
            return execAsync('cat ../docs/usage.md');
        }
    };
};
module.exports = _module;