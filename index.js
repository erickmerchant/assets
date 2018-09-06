const path = require('path')
const assert = require('assert')
const commonDir = require('common-dir')
const streamPromise = require('stream-to-promise')
const chalk = require('chalk')

module.exports = function (deps) {
  assert.strictEqual(typeof deps.out, 'object')

  assert.strictEqual(typeof deps.out.write, 'function')

  assert.strictEqual(typeof deps.makeDir, 'function')

  assert.strictEqual(typeof deps.createWriteStream, 'function')

  assert.strictEqual(typeof deps.watch, 'function')

  assert.strictEqual(typeof deps.types, 'object')

  return function (args) {
    return Promise.all(args.source.map(function (source) {
      const ext = path.extname(source).substr(1)

      if (deps.types[ext] == null) {
        return Promise.resolve(null)
      }

      const sourceDir = commonDir([args.destination, path.dirname(source)].map(dir => path.resolve(dir)))

      const destinationDir = path.join(args.destination, path.dirname(path.resolve(source)).substr(sourceDir.length))

      return deps.makeDir(destinationDir).then(function () {
        return deps.watch(args.watch, path.dirname(source), function () {
          const config = {
            input: source,
            output: path.join(destinationDir, path.basename(source)),
            electron: args.electron,
            noMin: args.noMin,
            browsers: args.browser
          }

          const promises = []
          const outputs = {
            code: config.output,
            map: config.output + '.map'
          }

          for (const key of Object.keys(outputs)) {
            config[key] = deps.createWriteStream(outputs[key])

            const promise = streamPromise(config.code)

            promise.then(() => {
              deps.out.write(`${chalk.gray('[assets]')} saved ${outputs[key]}\n`)
            })

            promises.push(promise)
          }

          deps.types[ext](config)

          return Promise.all(promises)
        })
      })
    }))
  }
}
