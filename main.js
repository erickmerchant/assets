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

command('assets', 'generate css using postcss, and js using browserify and babel', function ({parameter, option, command}) {
  parameter('destination', {
    description: 'where to save to',
    required: true
  })

  option('name', {
    description: 'name of outputted files without extension',
    default: 'bundle'
  })

  option('css', {
    description: 'the css entry',
    default: path.join(process.cwd(), 'css/index.css')
  })

  option('js', {
    description: 'the js entry',
    default: path.join(process.cwd(), 'js/index.js')
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

  option('browsers', {
    description: 'what browsers to target',
    default: ['last 2 versions', '> 5%'],
    multiple: true
  })

  return function (args) {
    if (args.watch) {
      chokidar.watch(path.join(path.dirname(args.css), '**/*.css'), {ignoreInitial: true}).on('all', function () {
        css(args).catch(console.error)
      })

      chokidar.watch(path.join(path.dirname(args.js), '**/*.js'), {ignoreInitial: true}).on('all', function () {
        js(args).catch(console.error)
      })
    }

    return mkdirp(path.join(process.cwd(), args.destination)).then(function () {
      return Promise.all([css(args), js(args)])
    })
  }
})(process.argv.slice(2))

function css (args) {
  return stat(args.css).then(function () {
    return fsReadFile(args.css, 'utf-8')
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
          fsWriteFile(path.join(process.cwd(), args.destination, `${args.name}.css`), output.css),
          fsWriteFile(path.join(process.cwd(), args.destination, `${args.name}.css.map`), JSON.stringify(map))
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

function js (args) {
  return stat(args.js).then(function () {
    var bundleFs = createWriteStream(path.join(process.cwd(), args.destination, `${args.name}.js`))
    var options = {
      debug: true,
      plugin: [require('bundle-collapser/plugin')]
    }

    var bundle = browserify(options)

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
