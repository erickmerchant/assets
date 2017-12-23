const path = require('path')
const assert = require('assert')
const commonDir = require('common-dir')
const error = require('sergeant/error')
const chalk = require('chalk')

module.exports = function (deps) {
  assert.equal(typeof deps.out, 'object')

  assert.equal(typeof deps.out.write, 'function')

  assert.equal(typeof deps.makeDir, 'function')

  assert.equal(typeof deps.writeFile, 'function')

  assert.equal(typeof deps.watch, 'function')

  assert.equal(typeof deps.types, 'object')

  return function ({option, parameter}) {
    parameter('source', {
      description: 'your source files',
      required: true,
      multiple: true
    })

    parameter('destination', {
      description: 'what to save',
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
      if (args.destination.endsWith('/')) {
        args.destination += 'bundle'
      }

      return deps.makeDir(path.dirname(args.destination)).then(function () {
        return Promise.all(Object.keys(deps.types).map(function (ext) {
          const input = args.source.filter((source) => path.extname(source) === '.' + ext)

          if (input.length) {
            const config = {
              input,
              output: path.join(args.destination + '.' + ext),
              electron: args.electron,
              noMin: args.noMin,
              browsers: args.browsers
            }

            let handler = deps.types[ext](config)

            return deps.watch(args.watch, commonDir(input), function () {
              handler().then((result) => {
                if (result != null) {
                  deps.writeFile(config.output, result.code).then(() => {
                    deps.out.write(chalk.green('\u2714') + ' saved ' + config.output + '\n')
                  })

                  deps.writeFile(config.output + '.map', result.map).then(() => {
                    deps.out.write(chalk.green('\u2714') + ' saved ' + config.output + '.map' + '\n')
                  })
                }
              })
              .catch(error)
            })
          }

          return Promise.resolve(true)
        }))
      })
    }
  }
}
