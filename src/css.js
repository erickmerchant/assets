
module.exports = function (config) {
  const error = require('sergeant/error')
  const path = require('path')
  const thenify = require('thenify')
  const readFile = thenify(require('fs').readFile)
  const postcss = require('postcss')
  const cssimport = require('postcss-import')
  const presetEnv = require('postcss-preset-env')
  const autoprefixer = require('autoprefixer')
  const cssnano = require('cssnano')

  return function () {
    return Promise.all(config.input.map(function (input) {
      return readFile(input, 'utf-8')
        .then(function (css) {
          const plugins = [
            cssimport(),
            presetEnv({
              browsers: config.browsers,
              stage: 0,
              features: {
                'css-variables': {
                  preserve: false
                }
              }
            }),
            autoprefixer({browsers: config.browsers})
          ]

          if (!config.noMin) {
            plugins.push(cssnano({autoprefixer: false}))
          }

          return postcss(plugins).process(css, {
            from: input,
            to: config.output,
            map: { inline: false }
          })
            .then(function (output) {
              return postcss.parse(output.css, {
                from: input,
                to: config.output,
                map: {
                  prev: output.map
                }
              })
            })
        })
    }))
      .then(function (parsed) {
        parsed = parsed.reduce((acc, curr) => acc.append(curr)).toResult({
          to: '/' + path.basename(config.output),
          map: {
            inline: false,
            annotation: path.basename(config.output + '.map')
          }
        })

        let map = JSON.parse(parsed.map)

        map.sources = map.sources.map((source) => path.relative(process.cwd(), '/' + source))

        return {
          code: parsed.css,
          map: JSON.stringify(map)
        }
      })
      .catch(error)
  }
}