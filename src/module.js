let andamentoTreno = (sp, tn) => `http://www.viaggiatreno.it/viaggiatrenonew/resteasy/viaggiatreno/andamentoTreno/${sp}/${tn}`

let _module = ({
    _, shelljs, bluebird, superagent, moment
}) => {
    let m = [_, bluebird, shelljs, superagent, moment]
    if (_.any(m, _.isUndefined)) {
        throw `some modules undefined ${_.map(m, _.isUndefined)}}`
    }

    let watchList = {}

    let execAsync = (cmd) => {
        return new bluebird((resolve) => {
            shelljs.exec(cmd, {
                async: true
            }, (code, stdout) => {
                resolve({
                    code, stdout
                })
            })
        })
    }

    let checkStatus = (tn, cb) => {
        if (_.isUndefined(watchList[tn])) {
            cb(1, {
                message: "sorry, train does not exist"
            })
        } else {
            cb(1, watchList[tn]);
        }
    }

    let _refreshData = (sp, sa, tn) => {
        trainStatus(sp, sa, tn).then((dati) => {
            watchList[tn] = {
                numero: tn,
                partenza: sp,
                arrivo: sa,
                treno: tn,
                ultimiDati: dati,
                aggiornato: moment()
            }
        })
    }


    let trainStatus = (sp, sa, tn) => {
        // for testing purposes, only get is stubbed
        return superagent.get(andamentoTreno(sp, tn)).then((v) => {
            let data = v.body
            const ris = _.pick(_.find(data.fermate, (t) => t.id === sa), ['ritardo', 'arrivo_teorico', 'binarioEffettivoArrivoDescrizione', 'arrivoReale'])

            ris.binarioArrivo = parseInt(ris.binarioEffettivoArrivoDescrizione)
            delete ris.binarioEffettivoArrivoDescrizione

            ris.arrivoTeorico = ris.arrivo_teorico
            delete ris.arrivo_teorico

            data = _.pick(data, ["orarioPartenza", "orarioArrivo", "stazioneUltimoRilevamento"])
            data = _.assign(ris, data)

            _.map(['arrivoTeorico', 'orarioPartenza', 'orarioArrivo', 'arrivoReale'], (e) => {
                data[`${e}Humanized`] = moment(data[e]).format("DD/MM/YY HH:mm")
                data[`${e}Moment`] = moment(data[e])
            })
            return _.assign(ris, data)
        })
    }

    return {
        readHelp: () => {
            return execAsync('cat ../docs/usage.md')
        },
        trainStatus: trainStatus,
        checkStatus: checkStatus,
        addToWatchList: _refreshData

    }
}
module.exports = _module
