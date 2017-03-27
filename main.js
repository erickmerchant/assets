#!/usr/bin/env node
const command = require('sergeant')
const chalk = require('chalk')
const chokidar = require('chokidar')
const thenify = require('thenify')
const fs = require('fs')
const path = require('path')
const mkdirp = thenify(require('mkdirp'))
const fsReadFile = thenify(fs.readFile)
const fsWriteFile = thenify(fs.writeFile)
const postcss = require('postcss')
const browserify = require('browserify')
const minifyify = require('minifyify')
const babelify = require('babelify')
const collapser = require('bundle-collapser/plugin')

command('assets', 'generate css using postcss, and js using browserify', function ({parameter, option, command}) {
  parameter('destination', {
    description: 'where to save to',
    required: true
  })

  option('no-min', {
    description: 'do not minify',
    type: Boolean
  })

  option('watch', {
    description: 'watch for changes',
    type: Boolean,
    aliases: ['w']
  })

  return function (args) {
    if (args.watch) {
      chokidar.watch(path.join(process.cwd(), 'css/**/*.css'), {ignoreInitial: true}).on('all', function () {
        css(args).catch(console.error)
      })

      chokidar.watch(path.join(process.cwd(), 'js/**/*.js'), {ignoreInitial: true}).on('all', function () {
        js(args).catch(console.error)
      })
    }

    return Promise.all([css(args), js(args)])
  }
})(process.argv.slice(2))

function css (args) {
  if (!fs.existsSync(path.join(process.cwd(), 'css/app.css'))) {
    return Promise.resolve(true)
  }

  return fsReadFile(path.join(process.cwd(), 'css/app.css'), 'utf-8')
  .then(function (css) {
    let plugins = [
      require('postcss-import')(),
      require('postcss-inherit'),
      require('postcss-custom-media')(),
      require('postcss-custom-properties')(),
      require('postcss-calc')(),
      require('autoprefixer'),
      require('postcss-copy')({
        src: 'css',
        dest: args.destination,
        relativePath (dirname, fileMeta, result, options) {
          return path.join(process.cwd(), args.destination)
        }
      })
    ]

    if (!args.noMin) {
      plugins.push(require('cssnano')())
    }

    return mkdirp(path.parse(path.join(process.cwd(), args.destination, '/app.css')).dir).then(function () {
      return postcss(plugins).process(css, {
        from: path.join(process.cwd(), 'css/app.css'),
        to: '/app.css',
        map: { inline: false, annotation: '/app.css.map' }
      }).then(function (output) {
        let map = JSON.parse(output.map)

        map.sources = map.sources.map((source) => path.relative(process.cwd(), '/' + source))

        return Promise.all([
          fsWriteFile(path.join(process.cwd(), args.destination, 'app.css'), output.css),
          fsWriteFile(path.join(process.cwd(), args.destination, 'app.css.map'), JSON.stringify(map))
        ])
        .then(function () {
          console.log(chalk.green(path.join(args.destination, 'app.css') + ' saved'))
        })
      })
    })
  })
}

function js (args) {
  if (!fs.existsSync(path.join(process.cwd(), 'js/app.js'))) {
    return Promise.resolve(true)
  }

  var bundleFs = fs.createWriteStream(path.join(process.cwd(), args.destination, 'app.js'))
  var options = {
    debug: true,
    plugin: [collapser]
  }

  var bundle = browserify(options)

  bundle.add(path.join(process.cwd(), 'js/app.js'))

  if (!args.noMin) {
    bundle.plugin(minifyify, { map: '/app.js.map', output: path.join(process.cwd(), args.destination, 'app.js.map') })
  }

  bundle.transform(babelify, { presets: [ 'es2015' ] })
  bundle.bundle().pipe(bundleFs)

  return new Promise(function (resolve, reject) {
    bundleFs.once('finish', resolve)
    bundleFs.once('error', reject)
  })
  .then(function () {
    console.log(chalk.green(path.join(args.destination, 'app.js') + ' saved'))
  })
}
