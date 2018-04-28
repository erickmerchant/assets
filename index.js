const path = require('path')
const assert = require('assert')
const commonDir = require('common-dir')
const error = require('sergeant/error')
const chalk = require('chalk')
const pkg = require(path.join(process.cwd(), 'package.json'))

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
      description: 'do not minify'
    })

    option('electron', {
      description: 'build for electron'
    })

    option('watch', {
      description: 'watch for changes',
      aliases: ['w']
    })

    option('browsers', {
      description: 'what browser to target',
      type: function browser (value) {
        if (value == null) return pkg.browserslist || ['last 2 versions', '> 5%']

        return value
      },
      multiple: true
    })

    return function (args) {
      if (args.destination.endsWith('/')) {
        args.destination += 'bundle'
      }

      return deps.makeDir(path.dirname(args.destination)).then(function () {
        return Promise.all(Object.keys(deps.types).map(function (ext) {
          const input = args.source.filter((source) => path.extname(source) === '.' + ext)

          if (!input.length) {
            return Promise.resolve(true)
          }

          const sourceDir = commonDir(input)

          return deps.watch(args.watch, sourceDir, function () {
            if (input.length) {
              const config = {
                input,
                output: path.join(args.destination + '.' + ext),
                electron: args.electron,
                noMin: args.noMin,
                browsers: args.browsers
              }

              let handler = deps.types[ext](config)

              return handler().then(function (result) {
                if (result != null) {
                  return Promise.all([
                    deps.writeFile(config.output, result.code).then(function () {
                      deps.out.write(chalk.green('\u2714') + ' saved ' + config.output + '\n')
                    }),
                    deps.writeFile(config.output + '.map', result.map).then(function () {
                      deps.out.write(chalk.green('\u2714') + ' saved ' + config.output + '.map' + '\n')
                    })
                  ])
                }

                return Promise.resolve(true)
              })
                .catch(error)
            }

            return Promise.resolve(true)
          })
        }))
      })
    }
  }
}
