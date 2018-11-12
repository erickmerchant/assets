const error = require('sergeant/error')
const path = require('path')
const browserify = require('browserify')
const babelify = require('babelify')
const shakeify = require('common-shakeify')
const packFlat = require('browser-pack-flat')
const presetEnv = require('@babel/preset-env')
const unassert = require('unassertify')
const minify = require('minify-stream')
const exorcist = require('exorcist')
const through = require('through2')

module.exports = (config) => {
  const options = {
    debug: true,
    cache: config.cache,
    packageCache: {}
  }

  let bundle = browserify(config.input, options)

  bundle.pipeline.get('deps').push(through.obj(function (row, enc, next) {
    config.cache[row.file] = {
      source: row.source,
      deps: Object.assign({}, row.deps)
    }
    this.push(row)
    next()
  }))

  const presets = [
    [presetEnv, {
      useBuiltIns: 'entry',
      targets: {
        browsers: config.browsers
      }
    }]
  ]

  bundle.transform(babelify.configure({
    presets,
    plugins: []
  }), { global: true })

  if (!config.noMin) {
    bundle.transform(unassert, { global: true })
  }

  if (!config.noMin) {
    bundle.plugin(packFlat)

    bundle.plugin(shakeify)
  }

  bundle = bundle.bundle()

  bundle.on('error', error)

  if (!config.noMin) {
    bundle = bundle.pipe(minify({
      toplevel: true,
      compress: { passes: 3 },
      safari10: true,
      output: {
        ascii_only: true
      }
    }))
  }

  bundle.pipe(exorcist(
    config.map,
    path.basename(config.output + '.map'),
    '',
    path.dirname(config.input)
  ))
    .pipe(config.code)
}
