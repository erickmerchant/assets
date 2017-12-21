const path = require('path')

module.exports = function (deps) {
  return function ({option, parameter}) {
    option('css', {
      description: 'where is your css',
      default: { value: './css/index.css' }
    })

    option('js', {
      description: 'where is your js',
      default: { value: './js/index.js' }
    })

    parameter('destination', {
      description: 'where to save to',
      default: { value: '.' }
    })

    option('no-min', {
      description: 'do not minify',
      type: Boolean
    })

    option('electron', {
      description: 'build for electron',
      type: Boolean
    })

    option('watch', {
      description: 'watch for changes',
      type: Boolean,
      aliases: ['w']
    })

    option('browsers', {
      description: 'what browsers to target',
      default: { value: ['last 2 versions', '> 5%'] },
      multiple: true
    })

    return function (args) {
      return deps.makeDir(args.destination).then(function () {
        return Promise.all(Object.keys(deps.types).map(function (ext) {
          const config = {
            input: args[ext],
            output: path.join(args.destination, 'bundle.' + ext)
          }

          return deps.watch(args.watch, path.join(path.dirname(args[ext]), '**/*.' + ext), deps.types[ext](args, config))
        }))
      })
    }
  }
}
