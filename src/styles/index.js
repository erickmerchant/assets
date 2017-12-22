const error = require('sergeant/error')
const chalk = require('chalk')
const console = require('console')
const path = require('path')
const thenify = require('thenify')
const readFile = thenify(require('fs').readFile)
const writeFile = thenify(require('fs').writeFile)
const postcss = require('postcss')
const Concat = require('concat-with-sourcemaps')
const plugins = require('./plugins')

module.exports = function (args, config) {
  return function () {
    const concat = new Concat(true, config.output, '\n')

    return Promise.all(config.input.map(function (input) {
      return readFile(input, 'utf-8')
      .then(function (css) {
        return postcss(plugins(args)).process(css, {
          from: input,
          to: '/' + path.basename(config.output),
          map: { inline: false, annotation: path.basename(config.output + '.map') }
        }).then(function (output) {
          let map = JSON.parse(output.map)

          map.sources = map.sources.map((source) => path.relative(process.cwd(), '/' + source))

          concat.add(input, output.css, JSON.stringify(map))

          return true
        })
      })
    }))
    .then(function () {
      return Promise.all([
        writeFile(config.output, concat.content),
        writeFile(config.output + '.map', concat.sourceMap)
      ])
      .then(function () {
        console.log(chalk.green('\u2714') + ' saved ' + config.output)
      })
    })
    .catch(error)
  }
}
