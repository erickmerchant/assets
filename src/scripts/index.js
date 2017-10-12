const error = require('sergeant/error')
const chalk = require('chalk')
const console = require('console')
const fs = require('fs')
const path = require('path')
const thenify = require('thenify')
const stat = thenify(fs.stat)
const readFile = thenify(fs.readFile)
const writeFile = thenify(fs.writeFile)
const createWriteStream = fs.createWriteStream
const browserPackFlat = require('browser-pack-flat/plugin')
const commonShakeify = require('common-shakeify')
const browserify = require('browserify')
const transforms = require('./transforms')
const exorcist = require('exorcist')
const uglify = require('uglify-es')

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

        const bundle = browserify(options)

        if (args.electron) {
          bundle.external('electron')
        }

        bundle.add(config.input)

        transforms(args).forEach(function (transform) {
          bundle.transform(transform, {global: true})
        })

        if (!args.noMin) {
          bundle.plugin(browserPackFlat)

          bundle.plugin(commonShakeify)
        }

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

        bundleFs.once('finish', function () {
          if (!args.noMin) {
            Promise.all([
              readFile(config.output, 'utf8'),
              readFile(config.output + '.map', 'utf8')
            ])
              .then(function ([code, map]) {
                const minified = uglify.minify(code, {
                  compress: true,
                  mangle: true,
                  sourceMap: {
                    content: map,
                    url: path.basename(config.output + '.map')
                  }
                })

                return Promise.all([
                  writeFile(config.output, minified.code),
                  writeFile(config.output + '.map', minified.map)
                ])
              })
              .then(resolve, reject)
          } else {
            resolve()
          }
        })

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
