const chokidar = require('chokidar')
const chalk = require('chalk')
const path = require('path')
const thenify = require('thenify')
const stat = thenify(require('fs').stat)
const createWriteStream = require('fs').createWriteStream
const browserify = require('browserify')

module.exports = function (args) {
  if (args.watch) {
    chokidar.watch(path.join(path.dirname(args.js), '**/*.js'), {ignoreInitial: true}).on('all', function () {
      run().catch(console.error)
    })
  }

  return run

  function run () {
    return stat(args.js).then(function () {
      const bundleFs = createWriteStream(path.join(process.cwd(), args.destination, `${args.name}.js`))
      const options = {
        debug: true,
        plugin: [require('bundle-collapser/plugin')]
      }

      const bundle = browserify(options)

      bundle.add(args.js)

      const presets = [
        ['env', {
          targets: {
            browsers: args.browsers
          }
        }]
      ]

      if (!args.noMin) {
        presets.push('babili')
      }

      bundle.transform(require('babelify').configure({
        presets,
        plugins: [require('babel-plugin-yo-yoify')]
      }), {global: true})

      bundle
      .bundle()
      .pipe(require('exorcist')(path.join(process.cwd(), args.destination, `${args.name}.js.map`), `/${args.name}.js.map`))
      .pipe(bundleFs)

      return new Promise(function (resolve, reject) {
        bundleFs.once('finish', resolve)
        bundleFs.once('error', reject)
      })
      .then(function () {
        console.log(chalk.green('\u2714') + ' saved ' + path.join(args.destination, `${args.name}.js`))
      })
    })
    .catch(function () {
      return Promise.resolve(true)
    })
  }
}
