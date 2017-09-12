const cssimport = require('postcss-import')
const systemFont = require('postcss-font-family-system-ui')
const anyLink = require('postcss-pseudo-class-any-link')
const customSelectors = require('postcss-custom-selectors')
const customProperties = require('postcss-custom-properties')
const customMedia = require('postcss-custom-media')
const mediaMinMax = require('postcss-media-minmax')
const colorGray = require('postcss-color-gray')
const colorFunction = require('postcss-color-function')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

module.exports = function (args) {
  const plugins = [
    cssimport(),
    systemFont(),
    anyLink(),
    customSelectors(),
    customProperties(),
    customMedia(),
    mediaMinMax(),
    colorGray(),
    colorFunction(),
    autoprefixer({browsers: args.browsers})
  ]

  if (!args.noMin) {
    plugins.push(cssnano({autoprefixer: false}))
  }

  return plugins
}
