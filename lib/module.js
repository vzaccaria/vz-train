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

    var watchList = {};
    var uRivMap = {};

    var addToURivMap = function addToURivMap(nome, stazione, val) {
        var k = nome + '-' + stazione;
        uRivMap[k] = val;
    };

    var execAsync = function execAsync(cmd) {
        return new bluebird(function (resolve) {
            shelljs.exec(cmd, {
                async: true
            }, function (code, stdout) {
                resolve({
                    code: code,
                    stdout: stdout
                });
            });
        });
    };

    var checkStatus = function checkStatus(nome) {
        var c = _.filter(watchList, function (v) {
            return v.nome === nome;
        });
        c = _.map(c, trainStatus);
        return bluebird.all(c);
    };

    var addToWatchList = function addToWatchList(sp, sa, tn, name) {
        watchList[name] = {
            numero: tn,
            partenza: sp,
            arrivo: sa,
            treno: tn,
            nome: name
        };
    };

    var _refreshWatchList = function _refreshWatchList() {
        return bluebird.all(_.map(watchList, function (v) {
            return trainStatus(v);
        }));
    };

    var getRitardo = function getRitardo(nome, stazioneUltimoRilevamento, oraUltimoRilevamentoMoment) {
        if (stazioneUltimoRilevamento === '--') return 0;

        var k = nome + '-' + stazioneUltimoRilevamento;
        var o = oraUltimoRilevamentoMoment;

        var diff = function diff(o2, o1) {
            var m2 = o2.m + o2.h * 60;
            var m1 = o1.m + o1.h * 60;
            return m2 - m1;
        };

        var isAfter = function isAfter(o2, o1) {
            return diff(o2, o1) > 0;
        };

        var ou = {
            m: o.minutes(),
            h: o.hours()
        };

        if (!_.includes(_.keys(uRivMap), k)) {
            uRivMap[k] = ou;
            return 0;
        } else {
            var r = uRivMap[k];
            if (isAfter(r, ou)) {
                uRivMap[k] = ou;
            }
            return diff(ou, r);
        }
    };

    var trainStatus = function trainStatus(v) {
        var sp = v.partenza;
        var sa = v.arrivo;
        var tn = v.treno;
        var nome = v.nome;
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
            data.dovrebbeArrivareAlle = data.compOrarioArrivo;
            data = _.pick(data, ["orarioPartenza", "orarioArrivo", "stazioneUltimoRilevamento", 'destinazione', 'origine', 'dovrebbeArrivareAlle', 'oraUltimoRilevamento']);
            data = _.assign(ris, data);

            _.map(['arrivoTeorico', 'orarioPartenza', 'orarioArrivo', 'arrivoReale', 'oraUltimoRilevamento'], function (e) {
                data[e + 'Humanized'] = moment(data[e]).format("DD/MM/YY HH:mm");
                data[e + 'Moment'] = moment(data[e]);
            });
            data["numero"] = tn;
            data["nome"] = nome;
            data["ritardo"] = getRitardo(nome, data['stazioneUltimoRilevamento'], data['oraUltimoRilevamentoMoment']);
            return _.assign(ris, data);
        });
    };

    return {
        readHelp: function readHelp() {
            return execAsync('cat ../docs/usage.md');
        },
        getList: function getList() {
            return _refreshWatchList();
        },
        trainStatus: trainStatus,
        checkStatus: checkStatus,
        addToWatchList: addToWatchList,
        addToURivMap: addToURivMap,
        getURivMap: function getURivMap() {
            return uRivMap;
        }
    };
};
module.exports = _module;