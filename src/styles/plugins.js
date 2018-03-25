const cssimport = require('postcss-import')
const presetEnv = require('postcss-preset-env')

const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

module.exports = function (config) {
  const plugins = [
    cssimport(),
    presetEnv({
      browsers: config.browsers,
      stage: 0,
      features: {
        'css-variables': {
          preserve: false
        }
      }
    }),
    autoprefixer({browsers: config.browsers})
  ]

  if (!config.noMin) {
    plugins.push(cssnano({autoprefixer: false}))
  }

  return plugins
}
