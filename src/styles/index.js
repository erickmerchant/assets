
module.exports = function (config) {
  const error = require('sergeant/error')
  const path = require('path')
  const thenify = require('thenify')
  const readFile = thenify(require('fs').readFile)
  const postcss = require('postcss')
  const Concat = require('concat-with-sourcemaps')
  const plugins = require('./plugins')

  return function () {
    const concat = new Concat(true, config.output, '\n')

    return Promise.all(config.input.map(function (input) {
      return readFile(input, 'utf-8')
      .then(function (css) {
        return postcss(plugins(config)).process(css, {
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
      return Promise.resolve({
        code: concat.content.toString(),
        map: concat.sourceMap.toString()
      })
    })
    .catch(error)
  }
}
