#!/usr/bin/env node
const command = require('sergeant')
const chalk = require('chalk')
const chokidar = require('chokidar')
const path = require('path')
const thenify = require('thenify')
const mkdirp = thenify(require('mkdirp'))
const fsReadFile = thenify(require('fs').readFile)
const fsWriteFile = thenify(require('fs').writeFile)
const stat = thenify(require('fs').stat)
const createWriteStream = require('fs').createWriteStream
const postcss = require('postcss')
const browserify = require('browserify')
const exorcist = require('exorcist')
const babelify = require('babelify')
const yoyoify = require('yo-yoify')
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

  option('target', {
    description: 'what browsers to target',
    default: ['last 2 versions', '> 5%'],
    multiple: true
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

    return mkdirp(path.join(process.cwd(), args.destination)).then(function () {
      return Promise.all([css(args), js(args)])
    })
  }
})(process.argv.slice(2))

function css (args) {
  const cssPath = path.join(process.cwd(), 'css/app.css')

  stat(cssPath).then(function () {
    return fsReadFile(cssPath, 'utf-8')
    .then(function (css) {
      let plugins = [
        require('postcss-import')(),
        require('postcss-cssnext')({browsers: args.target}),
        require('postcss-copy')({
          src: 'css',
          dest: args.destination,
          relativePath (dirname, fileMeta, result, options) {
            return path.join(process.cwd(), args.destination)
          }
        })
      ]

      if (!args.noMin) {
        plugins.push(require('cssnano')({autoprefixer: false}))
      }

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
          console.log(chalk.green('\u2714') + ' saved ' + path.join(args.destination, 'app.css'))
        })
      })
    })
  })
  .catch(function () {
    return Promise.resolve(true)
  })
}

function js (args) {
  const jsPath = path.join(process.cwd(), 'js/app.js')

  return stat(jsPath).then(function () {
    var bundleFs = createWriteStream(path.join(process.cwd(), args.destination, 'app.js'))
    var options = {
      debug: true,
      plugin: [collapser]
    }

    var bundle = browserify(options)

    bundle.add(jsPath)

    const presets = [[require('babel-preset-env'), {
      targets: {
        browsers: args.target
      }
    }]]

    if (!args.noMin) {
      presets.push(require('babel-preset-babili'))
    }

    bundle.transform(yoyoify, {global: true})

    bundle.transform(babelify.configure({
      presets
    }), {global: true})

    bundle
    .bundle()
    .pipe(exorcist(path.join(process.cwd(), args.destination, 'app.js.map'), '/app.js.map'))
    .pipe(bundleFs)

    return new Promise(function (resolve, reject) {
      bundleFs.once('finish', resolve)
      bundleFs.once('error', reject)
    })
    .then(function () {
      console.log(chalk.green('\u2714') + ' saved ' + path.join(args.destination, 'app.js'))
    })
  })
  .catch(function () {
    return Promise.resolve(true)
  })
}
