
module.exports = function (config) {
  const error = require('sergeant/error')
  const to2 = require('to2')
  const path = require('path')
  const browserify = require('browserify')
  const babelify = require('babelify')
  const shakeify = require('common-shakeify')
  const packFlat = require('browser-pack-flat')
  const presetEnv = require('babel-preset-env')
  const html = require('nanohtml')
  const unassert = require('babel-plugin-unassert')
  const inlineVars = require('babel-plugin-transform-inline-environment-variables')
  const minify = require('minify-stream')
  const exorcist = require('exorcist')

  return function () {
    let codeData = []
    let mapData = []

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

      const presets = [
        [presetEnv, {
          targets: {
            browsers: config.browsers
          }
        }]
      ]

      const plugins = [ html, inlineVars ]

      if (!config.noMin) {
        plugins.push(unassert)
      }

      bundle.transform(babelify.configure({
        presets,
        plugins
      }), {global: true})

      if (!config.noMin) {
        bundle.plugin(packFlat)

        bundle.plugin(shakeify)
      }

      bundle = bundle
        .bundle(function (err) {
          if (err) reject(err)
        })

      if (!config.noMin) {
        bundle = bundle.pipe(minify({
          toplevel: true,
          safari10: true,
          output: {
            ascii_only: true
          }
        }))
      }

      let mapStream = to2(function (data, enc, cb) {
        mapData.push(data)

        cb()
      })

      mapStream.once('error', reject)

      let codeStream = to2(function (data, enc, cb) {
        codeData.push(data)

        cb()
      }, function (cb) {
        resolve()

        cb()
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
        return {
          code: codeData.join(''),
          map: mapData.join('')
        }
      })
      .catch(error)
  }
}
