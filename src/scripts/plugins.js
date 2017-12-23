const browserPackFlat = require('browser-pack-flat/plugin')
const commonShakeify = require('common-shakeify')

module.exports = function (config) {
  const plugins = []

  if (!config.noMin) {
    plugins.push(browserPackFlat)

    plugins.push(commonShakeify)
  }

  return plugins
}
