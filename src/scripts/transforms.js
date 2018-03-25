const babelify = require('babelify')
const presetEnv = require('babel-preset-env')
const babili = require('babel-preset-minify')
const html = require('nanohtml')

module.exports = function (config) {
  const transforms = []

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

  transforms.push(babelify.configure({
    presets,
    plugins
  }))

  if (!config.noMin) {
    transforms.push(html)
  }

  return transforms
}
