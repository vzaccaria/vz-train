'use strict';

var andamentoTreno = function andamentoTreno(sp, tn) {
    return 'http://www.viaggiatreno.it/viaggiatrenonew/resteasy/viaggiatreno/andamentoTreno/' + sp + '/' + tn;
};

var _module = function _module(_ref) {
    var _ = _ref._;
    var shelljs = _ref.shelljs;
    var bluebird = _ref.bluebird;
    var superagent = _ref.superagent;
    var moment = _ref.moment;

    var m = [_, bluebird, shelljs, superagent, moment];
    if (_.any(m, _.isUndefined)) {
        throw 'some modules undefined ' + _.map(m, _.isUndefined) + '}';
    }

    var execAsync = function execAsync(cmd) {
        return new bluebird(function (resolve) {
            shelljs.exec(cmd, {
                async: true
            }, function (code, stdout) {
                resolve({
                    code: code, stdout: stdout
                });
            });
        });
    };

    var trainStatus = function trainStatus(sp, sa, tn) {
        // for testing purposes, only get is stubbed
        return superagent.get(andamentoTreno(sp, tn)).then(function (v) {
            var data = v.body;
            var ris = _.pick(_.find(data.fermate, function (t) {
                return t.id === sa;
            }), ['ritardo', 'arrivo_teorico', 'binarioEffettivoArrivoDescrizione', 'arrivoReale']);

            ris.binarioArrivo = parseInt(ris.binarioEffettivoArrivoDescrizione);
            delete ris.binarioEffettivoArrivoDescrizione;

            ris.arrivoTeorico = ris.arrivo_teorico;
            delete ris.arrivo_teorico;

            data = _.pick(data, ["orarioPartenza", "orarioArrivo", "stazioneUltimoRilevamento"]);
            data = _.assign(ris, data);

            _.map(['arrivoTeorico', 'orarioPartenza', 'orarioArrivo', 'arrivoReale'], function (e) {
                data[e + 'Humanized'] = moment(data[e]).format("DD/MM/YY HH:mm");
            });
            return _.assign(ris, data);
        });
    };

    return {
        readHelp: function readHelp() {
            return execAsync('cat ../docs/usage.md');
        },
        trainStatus: trainStatus

    };
};
module.exports = _module;