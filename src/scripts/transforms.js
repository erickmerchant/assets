const unassertify = require('unassertify')
const babelify = require('babelify')
const presetEnv = require('babel-preset-env')
const babili = require('babel-preset-minify')
const yoYoify = require('yo-yoify')

module.exports = function (args) {
  const transforms = []

  if (!args.noMin) {
    transforms.push(unassertify)
  }

  const presets = [
    [presetEnv, {
      targets: {
        browsers: args.browsers
      }
    }]
  ]

  const plugins = []

  if (!args.noMin) {
    presets.push(babili)
  }

  transforms.push(babelify.configure({
    presets,
    plugins
  }))

  if (!args.noMin) {
    transforms.push(yoYoify)
  }

  return transforms
}
