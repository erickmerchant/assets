const thenify = require('thenify')
const mkdirp = thenify(require('mkdirp'))
const path = require('path')

module.exports = function (args) {
  return mkdirp(path.join(process.cwd(), args.destination)).then(function () {
    const scripts = require('./scripts')(args)
    const styles = require('./styles')(args)

    return Promise.all([styles(), scripts()])
  })
}
