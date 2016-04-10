let andamentoTreno = (sp, tn) => `http://www.viaggiatreno.it/viaggiatrenonew/resteasy/viaggiatreno/andamentoTreno/${sp}/${tn}`

let _module = ({
    _, shelljs, bluebird, superagent, moment
}) => {
    let m = [ _, bluebird, shelljs, superagent, moment ]
    if (_.any(m, _.isUndefined)) {
        throw `some modules undefined ${_.map(m, _.isUndefined)}}`
    }


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
            })
            return _.assign(ris, data)
        })
    }

    return {
        readHelp: () => {
            return execAsync('cat ../docs/usage.md')
        },
        trainStatus: trainStatus

    }
}
module.exports = _module
