let andamentoTreno = (sp, tn) => `http://www.viaggiatreno.it/viaggiatrenonew/resteasy/viaggiatreno/andamentoTreno/${sp}/${tn}`;

let _module = ({
    _,
    shelljs,
    bluebird,
    superagent,
    moment
}) => {
    let m = [_, bluebird, shelljs, superagent, moment];
    if (_.any(m, _.isUndefined)) {
        throw `some modules undefined ${_.map(m, _.isUndefined)}}`;
    }

    let watchList = {};
    let uRivMap = {

    };

    let addToURivMap = (nome, stazione, val) => {
        let k = `${nome}-${stazione}`;
        uRivMap[k] = val;
    };

    let execAsync = (cmd) => {
        return new bluebird((resolve) => {
            shelljs.exec(cmd, {
                async: true
            }, (code, stdout) => {
                resolve({
                    code,
                    stdout
                });
            });
        });
    };

    let checkStatus = (nome) => {
        let c = _.filter(watchList, (v) => v.nome === nome);
        c = _.map(c, trainStatus);
        return bluebird.all(c);
    };

    let addToWatchList = (sp, sa, tn, name) => {
        watchList[name] = {
            numero: tn,
            partenza: sp,
            arrivo: sa,
            treno: tn,
            nome: name
        };
    };

    let _refreshWatchList = () => {
        return bluebird.all(_.map(watchList, (v) => {
            return trainStatus(v);
        }));
    };


    let getRitardo = (nome, stazioneUltimoRilevamento, oraUltimoRilevamentoMoment) => {
        if(stazioneUltimoRilevamento === '--') return 0;

        let k = `${nome}-${stazioneUltimoRilevamento}`;
        let o = oraUltimoRilevamentoMoment;

        let diff = (o2, o1) => {
            let m2 = o2.m + o2.h * 60;
            let m1 = o1.m + o1.h * 60;
            return (m2 - m1);
        };

        let isAfter = (o2, o1) => {
            return (diff(o2, o1) > 0);
        };

        let ou = {
            m: o.minutes(),
            h: o.hours()
        };

        if (!_.includes(_.keys(uRivMap), k)) {
            uRivMap[k] = ou;
            return 0;
        } else {
            let r = uRivMap[k];
            if (isAfter(r, ou)) {
                uRivMap[k] = ou;
            }
            return diff(ou, r);
        }
    };

    let trainStatus = (v) => {
        let sp = v.partenza;
        let sa = v.arrivo;
        let tn = v.treno;
        let nome = v.nome;
        // for testing purposes, only get is stubbed
        return superagent.get(andamentoTreno(sp, tn)).then((v) => {
            let data = v.body;
            const ris = _.pick(_.find(data.fermate, (t) => t.id === sa), ['ritardo',
                'arrivo_teorico',
                'binarioEffettivoArrivoDescrizione',
                'arrivoReale'
            ]);

            ris.binarioArrivo = parseInt(ris.binarioEffettivoArrivoDescrizione);
            delete ris.binarioEffettivoArrivoDescrizione;
            ris.arrivoTeorico = ris.arrivo_teorico;
            delete ris.arrivo_teorico;
            data.dovrebbeArrivareAlle = data.compOrarioArrivo;
            data = _.pick(data, ["orarioPartenza", "orarioArrivo", "stazioneUltimoRilevamento", 'destinazione', 'origine', 'dovrebbeArrivareAlle', 'oraUltimoRilevamento']);
            data = _.assign(ris, data);

            _.map(['arrivoTeorico', 'orarioPartenza', 'orarioArrivo', 'arrivoReale', 'oraUltimoRilevamento'], (e) => {
                data[`${e}Humanized`] = moment(data[e]).format("DD/MM/YY HH:mm");
                data[`${e}Moment`] = moment(data[e]);
            });
            data["numero"] = tn;
            data["nome"] = nome;
            data["ritardo"] = getRitardo(nome, data['stazioneUltimoRilevamento'], data['oraUltimoRilevamentoMoment']);
            return _.assign(ris, data);
        });
    };


    return {
        readHelp: () => {
            return execAsync('cat ../docs/usage.md');
        },
        getList: () => {
            return _refreshWatchList();
        },
        trainStatus: trainStatus,
        checkStatus: checkStatus,
        addToWatchList: addToWatchList,
        addToURivMap: addToURivMap,
        getURivMap: () => uRivMap
    };
};
module.exports = _module;
