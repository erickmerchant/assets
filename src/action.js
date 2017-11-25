const path = require('path')
const thenify = require('thenify')
const mkdirp = thenify(require('mkdirp'))
const chokidar = require('chokidar')

module.exports = function (types) {
  return function (args) {
    if (args.electron) {
      args.noMin = true
    }

    return mkdirp(args.destination).then(function () {
      return Promise.all(Object.keys(types).map(function (ext) {
        const config = {
          input: args[ext],
          output: path.join(args.destination, 'bundle.' + ext)
        }

        const run = types[ext](args, config)

        if (args.watch) {
          chokidar.watch(path.join(path.dirname(args[ext]), '**/*.' + ext), {ignoreInitial: true}).on('all', function () {
            return run()
          })
        }

        return run()
      }))
    })
  }
}
