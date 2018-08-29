const path = require('path')
const assert = require('assert')
const commonDir = require('common-dir')
const error = require('sergeant/error')
const chalk = require('chalk')

module.exports = function (deps) {
  assert.strictEqual(typeof deps.out, 'object')

  assert.strictEqual(typeof deps.out.write, 'function')

  assert.strictEqual(typeof deps.makeDir, 'function')

  assert.strictEqual(typeof deps.writeFile, 'function')

  assert.strictEqual(typeof deps.watch, 'function')

  assert.strictEqual(typeof deps.types, 'object')

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
              browsers: args.browser
            }

            let handler = deps.types[ext](config)

            return handler().then(function (result) {
              if (result != null) {
                return Promise.all([
                  deps.writeFile(config.output, result.code).then(function () {
                    deps.out.write(`${chalk.gray('[assets]')} saved ${config.output}\n`)
                  }),
                  deps.writeFile(config.output + '.map', result.map).then(function () {
                    deps.out.write(`${chalk.gray('[assets]')} saved ${config.output}.map\n`)
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
