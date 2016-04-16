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

    let checkStatus = (nome) => {
        return _refreshWatchList().then((it) => _.filter(it, (v) => {
            return (v.nome === nome)
        }))
    }

    let addToWatchList = (sp, sa, tn, name) => {
        watchList[name] = {
            numero: tn,
            partenza: sp,
            arrivo: sa,
            treno: tn,
            nome: name
        }
    }

    let _refreshWatchList = () => {
        return bluebird.all(_.map(watchList, (v, k) => {
            return trainStatus(v)
        }))
    }

    let trainStatus = (v) => {
        let sp = v.partenza;
        let sa = v.arrivo;
        let tn = v.treno
        let nome = v.nome
        // for testing purposes, only get is stubbed
        return superagent.get(andamentoTreno(sp, tn)).then((v) => {
            let data = v.body
            const ris = _.pick(_.find(data.fermate, (t) => t.id === sa),
                [   'ritardo',
                    'arrivo_teorico',
                    'binarioEffettivoArrivoDescrizione',
                    'arrivoReale'
                    ])

            ris.binarioArrivo = parseInt(ris.binarioEffettivoArrivoDescrizione)
            delete ris.binarioEffettivoArrivoDescrizione

            ris.arrivoTeorico = ris.arrivo_teorico
            delete ris.arrivo_teorico
            data.dovrebbeArrivareAlle = data.compOrarioArrivo

            data = _.pick(data, ["orarioPartenza", "orarioArrivo", "stazioneUltimoRilevamento", 'destinazione',
                    'origine', 'dovrebbeArrivareAlle'])
            data = _.assign(ris, data)

            _.map(['arrivoTeorico', 'orarioPartenza', 'orarioArrivo', 'arrivoReale'], (e) => {
                data[`${e}Humanized`] = moment(data[e]).format("DD/MM/YY HH:mm")
                data[`${e}Moment`] = moment(data[e])
            })
            data["numero"] = tn
            data["nome"] = nome
            return _.assign(ris, data)
        })
    }


    return {
        readHelp: () => {
            return execAsync('cat ../docs/usage.md')
        },
        getList: () => {
            return _refreshWatchList()
        },
        trainStatus: trainStatus,
        checkStatus: checkStatus,
        addToWatchList: addToWatchList

    }
}
module.exports = _module
