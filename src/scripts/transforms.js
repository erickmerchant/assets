const unassertify = require('unassertify')
const babelify = require('babelify')
const presetEnv = require('babel-preset-env')
const babili = require('babel-preset-minify')
const yoYoify = require('yo-yoify')

module.exports = function (config) {
  const transforms = []

  if (!config.noMin) {
    transforms.push(unassertify)
  }

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
    transforms.push(yoYoify)
  }

  return transforms
}
