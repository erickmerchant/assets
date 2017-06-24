const chokidar = require('chokidar')
const chalk = require('chalk')
const console = require('console')
const path = require('path')
const thenify = require('thenify')
const stat = thenify(require('fs').stat)
const createWriteStream = require('fs').createWriteStream
const browserify = require('browserify')
const exorcist = require('exorcist')
const bundleCollapser = require('bundle-collapser/plugin')
const unassertify = require('unassertify')
const babelify = require('babelify')
const presetEnv = require('babel-preset-env')
const babili = require('babel-preset-babili')
const yoyoify = require('babel-plugin-yo-yoify')

module.exports = function (args) {
  const inputFile = path.join(args.source, 'js/index.js')
  const outputFile = path.join(args.destination, 'bundle.js')
  const outputMap = path.join(args.destination, 'bundle.js.map')

  if (args.watch) {
    chokidar.watch(path.join(args.source, 'js/**/*.js'), {ignoreInitial: true}).on('all', function () {
      return run().catch(console.error)
    })
  }

  return run

  function run () {
    return stat(inputFile).then(function () {
      const bundleFs = createWriteStream(outputFile)
      const options = {
        debug: true
      }

      if (!args.noMin) {
        options.plugin = [bundleCollapser]
      }

      const bundle = browserify(options)

      bundle.add(inputFile)

      if (!args.noMin) {
        bundle.transform(unassertify, {global: true})
      }

      const presets = [
        [presetEnv, {
          targets: {
            browsers: args.browsers
          }
        }]
      ]

      if (!args.noMin) {
        presets.push(babili)
      }

      bundle.transform(babelify.configure({
        presets,
        plugins: [yoyoify],
        env: 'production'
      }), {global: true})

      bundle
      .bundle()
      .pipe(exorcist(
        outputMap,
        '/bundle.js.map',
        '',
        path.join(process.cwd(), args.source)
      ))
      .pipe(bundleFs)

      return new Promise(function (resolve, reject) {
        bundleFs.once('finish', resolve)

        bundleFs.once('error', reject)
      })
      .then(function () {
        console.log(chalk.green('\u2714') + ' saved ' + outputFile)
      })
    })
    .catch(function () {
      return Promise.resolve(true)
    })
  }
}
