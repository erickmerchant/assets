const unassertify = require('unassertify')
const babelify = require('babelify')
const presetEnv = require('babel-preset-env')
const babili = require('babel-preset-babili')
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

  if (!args.noMin) {
    presets.push(babili)
  }

  transforms.push(babelify.configure({
    presets,
    plugins: [yoyoify],
    env: 'production'
  }))

  return transforms
}
