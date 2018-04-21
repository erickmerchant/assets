
module.exports = function (config) {
  const error = require('sergeant/error')
  const to2 = require('to2')
  const path = require('path')
  const browserify = require('browserify')
  const exorcist = require('exorcist')
  const tinyify = require('tinyify')
  const babelify = require('babelify')
  const presetEnv = require('babel-preset-env')
  const babili = require('babel-preset-minify')
  const html = require('nanohtml')

  return function () {
    let codeData = ''
    let mapData = ''

    return new Promise(function (resolve, reject) {
      const options = {
        debug: true
      }

      if (config.electron) {
        options.node = true
        options.bundleExternal = false
      }

      let bundle = browserify(options)

      for (let input of config.input) {
        bundle.add(input)
      }

      if (!config.noMin) {
        bundle.plugin(tinyify)
      }

      const presets = [
        [presetEnv, {
          targets: {
            browsers: config.browsers
          }
        }]
      ]

      const plugins = []

      if (!config.noMin) {
        presets.push(babili)
      }

      bundle.transform(babelify.configure({
        presets,
        plugins
      }), {global: true})

      if (!config.noMin) {
        bundle.transform(html, {global: true})
      }

      bundle = bundle
        .bundle(function (err) {
          if (err) reject(err)
        })

      let mapStream = to2(function (data, enc, cb) {
        mapData += data.toString()

        cb()
      }, function (cb) {
        cb()
      })

      mapStream.once('error', reject)

      let codeStream = to2(function (data, enc, cb) {
        codeData += data.toString()

        cb()
      }, function (cb) {
        cb()

        resolve()
      })

      codeStream.once('error', reject)

      bundle.pipe(exorcist(
        mapStream,
        path.basename(config.output + '.map'),
        '',
        process.cwd()
      ))
        .pipe(codeStream)
    })
      .then(function () {
        return Promise.resolve({
          code: codeData,
          map: mapData
        })
      })
      .catch(error)
  }
}
