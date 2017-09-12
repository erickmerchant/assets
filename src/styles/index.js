const error = require('sergeant/error')
const chalk = require('chalk')
const console = require('console')
const path = require('path')
const thenify = require('thenify')
const readFile = thenify(require('fs').readFile)
const writeFile = thenify(require('fs').writeFile)
const stat = thenify(require('fs').stat)
const postcss = require('postcss')
const plugins = require('./plugins')

module.exports = function (args, config) {
  return function () {
    return stat(config.input).then(function () {
      return readFile(config.input, 'utf-8')
      .then(function (css) {
        return postcss(plugins(args)).process(css, {
          from: config.input,
          to: '/' + path.basename(config.output),
          map: { inline: false, annotation: path.basename(config.output + '.map') }
        }).then(function (output) {
          let map = JSON.parse(output.map)

          map.sources = map.sources.map((source) => path.relative(process.cwd(), '/' + source))

          return Promise.all([
            writeFile(config.output, output.css),
            writeFile(config.output + '.map', JSON.stringify(map))
          ])
          .then(function () {
            console.log(chalk.green('\u2714') + ' saved ' + config.output)
          })
        })
      })
      .catch(error)
    })
    .catch(function () {
      return Promise.resolve(true)
    })
  }
}
