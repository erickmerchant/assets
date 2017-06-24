const thenify = require('thenify')
const mkdirp = thenify(require('mkdirp'))

module.exports = function (args) {
  return mkdirp(args.destination).then(function () {
    const scripts = require('./scripts')(args)
    const styles = require('./styles')(args)

    return Promise.all([styles(), scripts()])
  })
}
