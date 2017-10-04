const unassertify = require('unassertify')
const babelify = require('babelify')
const presetEnv = require('babel-preset-env')
const babili = require('babel-preset-minify')
const yoyoify = require('babel-plugin-yo-yoify')

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

    plugins.push([
      yoyoify, {
        appendChildModule: 'bel/appendChild'
      }
    ])
  }

  transforms.push(babelify.configure({
    presets,
    plugins,
    env: 'production'
  }))

  return transforms
}
