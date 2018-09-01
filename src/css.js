const error = require('sergeant/error')
const promisify = require('util').promisify
const fs = require('fs')
const readFile = promisify(fs.readFile)
const postcss = require('postcss')
const cssimport = require('postcss-import')
const presetEnv = require('postcss-preset-env')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

module.exports = function (config) {
  readFile(config.input, 'utf-8')
    .then(function (css) {
      const plugins = [
        cssimport(),
        presetEnv({
          browsers: config.browsers,
          stage: 0,
          features: {
            'custom-properties': {
              preserve: false
            }
          }
        }),
        autoprefixer({ browsers: config.browsers })
      ]

      if (!config.noMin) {
        plugins.push(cssnano({ autoprefixer: false }))
      }

      return postcss(plugins).process(css, {
        from: config.input,
        to: config.output,
        map: { inline: false }
      })
    })
    .then(function (parsed) {
      config.code.end(parsed.css)

      config.map.end(String(parsed.map))
    })
    .catch(error)
}
