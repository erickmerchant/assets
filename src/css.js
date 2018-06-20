const error = require('sergeant/error')
const path = require('path')
const promisify = require('util').promisify
const fs = require('fs')
const readFile = promisify(fs.readFile)
const postcss = require('postcss')
const cssimport = require('postcss-import')
const presetEnv = require('postcss-preset-env')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

module.exports = function (config) {
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
                'custom-properties': {
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
              if (config.input.length > 1) {
                return postcss.parse(output.css, {
                  from: input,
                  to: config.output,
                  map: {
                    prev: output.map
                  }
                })
              }

              return output
            })
        })
    }))
      .then(function (parsed) {
        if (config.input.length > 1) {
          return parsed.reduce((acc, curr) => acc.append(curr)).toResult({
            to: config.output,
            map: {
              inline: false,
              annotation: path.basename(config.output + '.map')
            }
          })
        }

        return parsed[0]
      })
      .then(function (parsed) {
        let map = JSON.parse(parsed.map)

        map.sources = map.sources.map((source) => path.join(path.dirname(config.output), source))

        return {
          code: parsed.css,
          map: JSON.stringify(map)
        }
      })
      .catch(error)
  }
}
