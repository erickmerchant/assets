const path = require('path')
const assert = require('assert')
const commonDir = require('common-dir')
const streamPromise = require('stream-to-promise')
const chalk = require('chalk')

module.exports = (deps) => {
  assert.strictEqual(typeof deps.out, 'object')

  assert.strictEqual(typeof deps.out.write, 'function')

  assert.strictEqual(typeof deps.makeDir, 'function')

  assert.strictEqual(typeof deps.createWriteStream, 'function')

  assert.strictEqual(typeof deps.watch, 'function')

  assert.strictEqual(typeof deps.types, 'object')

  return (args) => Promise.all(args.source.map(async (source) => {
    const ext = path.extname(source).substr(1)

    if (deps.types[ext] == null) {
      return null
    }

    const rootDir = commonDir([args.destination, path.dirname(source)].map(dir => path.resolve(dir)))

    const destinationDir = path.join(args.destination, path.dirname(path.resolve(source)).substr(rootDir.length))

    await deps.makeDir(destinationDir)

    const cache = {}

    return deps.watch(args.watch, path.dirname(source), (_, file) => {
      const start = process.hrtime()

      if (file) {
        delete cache[path.resolve(file)]
      }

      const config = {
        input: source,
        output: path.join(destinationDir, path.basename(source)),
        noMin: args.noMin,
        browsers: args.browser,
        cache
      }

      const promises = []
      const outputs = {
        code: config.output,
        map: config.output + '.map'
      }

      for (const key of Object.keys(outputs)) {
        config[key] = deps.createWriteStream(outputs[key])

        const promise = streamPromise(config[key])

        promise.then(() => {
          const end = process.hrtime(start)

          deps.out.write(`${chalk.gray('[assets]')} saved ${outputs[key]} in ${end[0] + (end[1] / 1e9)}s\n`)
        })

        promises.push(promise)
      }

      deps.types[ext](config)

      return Promise.all(promises)
    })
  }))
}
