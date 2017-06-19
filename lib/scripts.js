const chokidar = require('chokidar')
const chalk = require('chalk')
const console = require('console')
const path = require('path')
const thenify = require('thenify')
const stat = thenify(require('fs').stat)
const writeFile = thenify(require('fs').writeFile)
const createWriteStream = require('fs').createWriteStream
const browserify = require('browserify')
const unassertify = require('unassertify')
const bundleCollapser = require('bundle-collapser/plugin')
const babelify = require('babelify')
const presetEnv = require('babel-preset-env')
const babili = require('babel-preset-babili')
const yoyoify = require('babel-plugin-yo-yoify')
const babel = require('babel-core')

module.exports = function (args) {
  if (args.watch) {
    chokidar.watch(path.join(path.dirname(args.js), '**/*.js'), {ignoreInitial: true}).on('all', function () {
      return run().catch(console.error)
    })
  }

  return run

  function run () {
    return stat(args.js).then(function () {
      const bundleFs = createWriteStream(path.join(process.cwd(), args.destination, `${args.name}.js`))
      const options = {
        debug: true,
        plugin: [bundleCollapser]
      }

      const bundle = browserify(options)

      bundle.add(args.js)

      bundle.transform(unassertify, {global: true})

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
      .pipe(bundleFs)

      return new Promise(function (resolve, reject) {
        bundleFs.once('finish', function () {
          babel.transformFile(path.join(process.cwd(), args.destination, `${args.name}.js`), { presets: [ babili ], sourceMaps: true, sourceType: 'script' }, function (err, result) {
            if (err) {
              reject(err)
            } else {
              const js = result.code.toString() + `\n//# sourceMappingURL=/${args.name}.js.map`
              const map = JSON.stringify(result.map)

              Promise.all([
                writeFile(path.join(process.cwd(), args.destination, `${args.name}.js`), js),
                writeFile(path.join(process.cwd(), args.destination, `${args.name}.js.map`), map)
              ])
              .then(resolve, reject)
            }
          })
        })
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
