const error = require('sergeant/error')
const chalk = require('chalk')
const console = require('console')
const path = require('path')
const thenify = require('thenify')
const stat = thenify(require('fs').stat)
const createWriteStream = require('fs').createWriteStream
const browserify = require('browserify')
const transforms = require('./transforms')
const exorcist = require('exorcist')
const bundleCollapser = require('bundle-collapser/plugin')

module.exports = function (args, config) {
  return function () {
    return stat(config.input).then(function () {
      return new Promise(function (resolve, reject) {
        const bundleFs = createWriteStream(config.output)
        const options = {
          debug: true
        }

        if (args.electron) {
          options.bare = true
        }

        if (!args.noMin) {
          options.plugin = [bundleCollapser]
        }

        const bundle = browserify(options)

        if (args.electron) {
          bundle.external('electron')
        }

        bundle.add(config.input)

        transforms(args).forEach(function (transform) {
          bundle.transform(transform, {global: true})
        })

        bundle
        .bundle(function (err) {
          if (err) reject(err)
        })
        .pipe(exorcist(
          config.output + '.map',
          path.basename(config.output + '.map'),
          '',
          path.join(process.cwd(), args.source)
        ))
        .pipe(bundleFs)

        bundleFs.once('finish', resolve)

        bundleFs.once('error', reject)
      })
      .then(function () {
        console.log(chalk.green('\u2714') + ' saved ' + config.output)
      })
      .catch(error)
    })
    .catch(function () {
      return Promise.resolve(true)
    })
  }
}
