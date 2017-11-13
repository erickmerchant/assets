const cssimport = require('postcss-import')
const systemFont = require('postcss-font-family-system-ui')
const customProperties = require('postcss-custom-properties')
const customMedia = require('postcss-custom-media')
const mediaMinMax = require('postcss-media-minmax')

const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

module.exports = function (args) {
  const plugins = [
    cssimport(),
    systemFont(),
    customProperties(),
    customMedia(),
    mediaMinMax(),
    autoprefixer({browsers: args.browsers})
  ]

  if (!args.noMin) {
    plugins.push(cssnano({autoprefixer: false}))
  }

  return plugins
}
