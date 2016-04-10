let _module = ({
    _, shelljs, bluebird
}) => {
    if (_.any([_, bluebird, shelljs], _.isUndefined)) {
        return undefined
    }

    let execAsync = (cmd) => {
        return new bluebird((resolve) => {
            shelljs.exec(cmd, {async: true}, (code, stdout) => {
                resolve({code, stdout})
            })
        })
    }

    return {
        readHelp: () => {
            return execAsync('cat ../docs/usage.md')
        }
    }
}
module.exports = _module
