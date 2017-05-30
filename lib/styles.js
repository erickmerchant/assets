const chokidar = require('chokidar')
const chalk = require('chalk')
const path = require('path')
const thenify = require('thenify')
const readFile = thenify(require('fs').readFile)
const writeFile = thenify(require('fs').writeFile)
const stat = thenify(require('fs').stat)
const postcss = require('postcss')

module.exports = function (args) {
  if (args.watch) {
    chokidar.watch(path.join(path.dirname(args.css), '**/*.css'), {ignoreInitial: true}).on('all', function () {
      run().catch(console.error)
    })
  }

  return run

  function run () {
    return stat(args.css).then(function () {
      return readFile(args.css, 'utf-8')
      .then(function (css) {
        let plugins = [
          require('postcss-import')(),
          require('postcss-cssnext')({browsers: args.browsers})
        ]

        if (!args.noMin) {
          plugins.push(require('cssnano')({autoprefixer: false}))
        }

        return postcss(plugins).process(css, {
          from: args.css,
          to: `/${args.name}.css`,
          map: { inline: false, annotation: `/${args.name}.css.map` }
        }).then(function (output) {
          let map = JSON.parse(output.map)

          map.sources = map.sources.map((source) => path.relative(process.cwd(), '/' + source))

          return Promise.all([
            writeFile(path.join(process.cwd(), args.destination, `${args.name}.css`), output.css),
            writeFile(path.join(process.cwd(), args.destination, `${args.name}.css.map`), JSON.stringify(map))
          ])
          .then(function () {
            console.log(chalk.green('\u2714') + ' saved ' + path.join(args.destination, `${args.name}.css`))
          })
        })
      })
    })
    .catch(function () {
      return Promise.resolve(true)
    })
  }
}
