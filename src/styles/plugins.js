const cssimport = require('postcss-import')
const systemFont = require('postcss-font-family-system-ui')
const customProperties = require('postcss-custom-properties')
const customMedia = require('postcss-custom-media')
const mediaMinMax = require('postcss-media-minmax')

const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

module.exports = function (config) {
  const plugins = [
    cssimport(),
    systemFont(),
    customProperties({preserve: false}),
    customMedia(),
    mediaMinMax(),
    autoprefixer({browsers: config.browsers})
  ]

  if (!config.noMin) {
    plugins.push(cssnano({autoprefixer: false}))
  }

  return plugins
}
