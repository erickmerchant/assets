const path = require('path')
const assert = require('assert')
const commonDir = require('common-dir')

module.exports = function (deps) {
  assert.equal(typeof deps.makeDir, 'function')

  assert.equal(typeof deps.watch, 'function')

  assert.equal(typeof deps.types, 'object')

  return function ({option, parameter}) {
    parameter('source', {
      description: 'your source files',
      default: { value: ['./css/index.css', './js/index.js'] },
      multiple: true
    })

    parameter('destination', {
      description: 'where to save to',
      default: { value: '.' },
      required: true
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
          const input = args.source.filter((source) => path.extname(source) === '.' + ext)

          if (input.length) {
            if (args.destination.endsWith('/')) {
              args.destination += 'bundle'
            }

            const config = {
              input,
              output: path.join(args.destination + '.' + ext)
            }

            return deps.watch(args.watch, commonDir(input), deps.types[ext](args, config))
          }

          return Promise.resolve(true)
        }))
      })
    }
  }
}
