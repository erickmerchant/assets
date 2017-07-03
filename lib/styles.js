const chokidar = require('chokidar')
const chalk = require('chalk')
const console = require('console')
const path = require('path')
const thenify = require('thenify')
const readFile = thenify(require('fs').readFile)
const writeFile = thenify(require('fs').writeFile)
const stat = thenify(require('fs').stat)
const postcss = require('postcss')
const cssimport = require('postcss-import')
const systemFont = require('postcss-font-family-system-ui')
const anyLink = require('postcss-pseudo-class-any-link')
const customSelectors = require('postcss-custom-selectors')
const customProperties = require('postcss-custom-properties')
const customMedia = require('postcss-custom-media')
const mediaMinMax = require('postcss-media-minmax')
const colorGray = require('postcss-color-gray')
const colorFunction = require('postcss-color-function')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

module.exports = function (args) {
  const inputFile = path.join(args.source, 'css/index.css')
  const outputFile = path.join(args.destination, 'bundle.css')
  const outputMap = path.join(args.destination, 'bundle.css.map')

  if (args.watch) {
    chokidar.watch(path.join(args.source, 'css/**/*.css'), {ignoreInitial: true}).on('all', function () {
      return run().catch(console.error)
    })
  }

  return run

  function run () {
    return stat(inputFile).then(function () {
      return readFile(inputFile, 'utf-8')
      .then(function (css) {
        let plugins = [
          cssimport(),
          systemFont(),
          anyLink(),
          customSelectors(),
          customProperties(),
          customMedia(),
          mediaMinMax(),
          colorGray(),
          colorFunction(),
          autoprefixer({browsers: args.browsers})
        ]

        if (!args.noMin) {
          plugins.push(cssnano({autoprefixer: false}))
        }

        return postcss(plugins).process(css, {
          from: inputFile,
          to: '/bundle.css',
          map: { inline: false, annotation: '/bundle.css.map' }
        }).then(function (output) {
          let map = JSON.parse(output.map)

          map.sources = map.sources.map((source) => path.relative(process.cwd(), '/' + source))

          return Promise.all([
            writeFile(outputFile, output.css),
            writeFile(outputMap, JSON.stringify(map))
          ])
          .then(function () {
            console.log(chalk.green('\u2714') + ' saved ' + outputFile)
          })
        })
      })
    })
    .catch(function () {
      return Promise.resolve(true)
    })
  }
}
