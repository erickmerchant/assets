
module.exports = function (args, config) {
  const error = require('sergeant/error')
  const to2 = require('to2')
  const path = require('path')
  const browserify = require('browserify')
  const transforms = require('./transforms')
  const plugins = require('./plugins')
  const exorcist = require('exorcist')
  const minify = require('minify-stream')

  return function () {
    let codeData = ''
    let mapData = ''

    return new Promise(function (resolve, reject) {
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

      let mapStream = to2((data, enc, cb) => {
        mapData += data.toString()

        cb()
      }, (cb) => {
        cb()
      })

      mapStream.once('error', reject)

      let codeStream = to2((data, enc, cb) => {
        codeData += data.toString()

        cb()
      }, (cb) => {
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
