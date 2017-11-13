const browserPackFlat = require('browser-pack-flat/plugin')
const commonShakeify = require('common-shakeify')

module.exports = function (args) {
  const plugins = []

  if (!args.noMin) {
    plugins.push(browserPackFlat)

    plugins.push(commonShakeify)
  }

  return plugins
}
