const tinyify = require('tinyify')

module.exports = function (config) {
  const plugins = []

  if (!config.noMin) {
    plugins.push(tinyify)
  }

  return plugins
}
