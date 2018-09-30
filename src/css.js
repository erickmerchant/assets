const error = require('sergeant/error')
const streamPromise = require('stream-to-promise')
const fs = require('fs')
const createReadStream = fs.createReadStream
const postcss = require('postcss')
const cssimport = require('postcss-import')
const presetEnv = require('postcss-preset-env')
const cssnano = require('cssnano')

module.exports = async (config) => {
  try {
    const css = await streamPromise(createReadStream(config.input, 'utf-8'))

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
      })
    ]

    if (!config.noMin) {
      plugins.push(cssnano({ autoprefixer: false }))
    }

    const parsed = await postcss(plugins).process(css, {
      from: config.input,
      to: config.output,
      map: { inline: false }
    })

    config.code.end(parsed.css)

    config.map.end(String(parsed.map))
  } catch (err) {
    error(err)
  }
}
