const error = require('sergeant/error')
const chalk = require('chalk')
const console = require('console')
const fs = require('fs')
const path = require('path')
const createWriteStream = fs.createWriteStream
const browserify = require('browserify')
const transforms = require('./transforms')
const plugins = require('./plugins')
const exorcist = require('exorcist')
const minify = require('minify-stream')

module.exports = function (args, config) {
  return function () {
    return new Promise(function (resolve, reject) {
      const bundleFs = createWriteStream(config.output)
      const options = {
        debug: true
      }

      if (args.electron) {
        options.bare = true
      }

      let bundle = browserify(options)

      if (args.electron) {
        bundle.external('electron')
      }

      config.input.forEach(function (input) {
        bundle.add(input)
      })

      transforms(args).forEach(function (transform) {
        bundle.transform(transform, {global: true})
      })

      plugins(args).forEach(function (plugin) {
        bundle.plugin(plugin)
      })

      bundle = bundle
      .bundle(function (err) {
        if (err) reject(err)
      })

      if (!args.noMin) {
        bundle = bundle.pipe(minify())
      }

      bundle.pipe(exorcist(
        config.output + '.map',
        path.basename(config.output + '.map'),
        '',
        process.cwd()
      ))
      .pipe(bundleFs)

      bundleFs.once('finish', resolve)

      bundleFs.once('error', reject)
    })
    .then(function () {
      console.log(chalk.green('\u2714') + ' saved ' + config.output)
    })
    .catch(error)
  }
}
