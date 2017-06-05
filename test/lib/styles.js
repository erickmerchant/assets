const test = require('tape')
const mockery = require('mockery')
const path = require('path')
const chalk = require('chalk')

test('test lib/styles - no watch min', function (t) {
  const css = Symbol('css')

  const cssImport = Symbol('cssImport')

  const cssnext = Symbol('cssnext')

  const cssnano = Symbol('cssnano')

  const browsers = Symbol('browsers')

  const written = []

  const args = {
    destination: 'build',
    name: 'app',
    css: 'entry.css',
    noMin: false,
    watch: false,
    browsers
  }

  const output = {
    css: '* { color: red }',
    map: JSON.stringify({
      sources: [
        path.join(process.cwd(), 'index.css')
      ]
    })
  }

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  mockery.registerMock('chokidar', {})

  mockery.registerMock('fs', {
    stat: function (file, cb) {
      t.equals(file, args.css)

      cb()
    },
    readFile: function (file, encoding, cb) {
      t.equals(file, args.css)

      t.equals(encoding, 'utf-8')

      cb(null, css)
    },
    writeFile: function (file, data, cb) {
      written.push([file, data])

      cb()
    }
  })

  mockery.registerMock('postcss', function (plugins) {
    t.deepEquals(plugins, [
      cssImport,
      cssnext,
      cssnano
    ])

    return {
      process: function (data, options) {
        t.equals(data, css)

        t.deepEquals(options, {
          from: args.css,
          to: `/${args.name}.css`,
          map: { inline: false, annotation: `/${args.name}.css.map` }
        })

        return Promise.resolve(output)
      }
    }
  })

  mockery.registerMock('postcss-import', function () { return cssImport })

  mockery.registerMock('postcss-cssnext', function (options) {
    t.deepEquals(options, {browsers: args.browsers})

    return cssnext
  })

  mockery.registerMock('cssnano', function (options) {
    t.deepEquals(options, {autoprefixer: false})

    return cssnano
  })

  mockery.registerMock('console', {
    log: function (message) {
      t.equals(message, chalk.green('\u2714') + ' saved ' + path.join(args.destination, `${args.name}.css`))
    }
  })

  t.plan(10)

  require('../../lib/styles')(args)().then(function () {
    t.deepEquals(written, [
      [ path.join(process.cwd(), args.destination, `${args.name}.css`), output.css ],
      [ path.join(process.cwd(), args.destination, `${args.name}.css.map`), JSON.stringify({ sources: [ 'index.css' ] }) ]
    ])

    mockery.disable()
  })
})

test('test lib/styles - watch no min', function (t) {
  const css = Symbol('css')

  const cssImport = Symbol('cssImport')

  const cssnext = Symbol('cssnext')

  const cssnano = Symbol('cssnano')

  const browsers = Symbol('browsers')

  const written = []

  const args = {
    destination: 'build',
    name: 'app',
    css: 'entry.css',
    noMin: true,
    watch: true,
    browsers
  }

  const output = {
    css: '* { color: red }',
    map: JSON.stringify({
      sources: [
        path.join(process.cwd(), 'index.css')
      ]
    })
  }

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  mockery.registerMock('chokidar', {
    watch: function (file, options) {
      t.equals(file, path.join(path.dirname(args.css), '**/*.css'))
      t.deepEquals(options, {ignoreInitial: true})

      return {
        on: function (event, cb) {
          t.equals(event, 'all')

          cb().then(function () {
            t.deepEquals(written, [
              [ path.join(process.cwd(), args.destination, `${args.name}.css`), output.css ],
              [ path.join(process.cwd(), args.destination, `${args.name}.css.map`), JSON.stringify({ sources: [ 'index.css' ] }) ]
            ])

            mockery.disable()
          })
        }
      }
    }
  })

  mockery.registerMock('fs', {
    stat: function (file, cb) {
      t.equals(file, args.css)

      cb()
    },
    readFile: function (file, encoding, cb) {
      t.equals(file, args.css)

      t.equals(encoding, 'utf-8')

      cb(null, css)
    },
    writeFile: function (file, data, cb) {
      written.push([file, data])

      cb()
    }
  })

  mockery.registerMock('postcss', function (plugins) {
    t.deepEquals(plugins, [
      cssImport,
      cssnext
    ])

    return {
      process: function (data, options) {
        t.equals(data, css)

        t.deepEquals(options, {
          from: args.css,
          to: `/${args.name}.css`,
          map: { inline: false, annotation: `/${args.name}.css.map` }
        })

        return Promise.resolve(output)
      }
    }
  })

  mockery.registerMock('postcss-import', function () { return cssImport })

  mockery.registerMock('postcss-cssnext', function (options) {
    t.deepEquals(options, {browsers: args.browsers})

    return cssnext
  })

  mockery.registerMock('cssnano', function (options) {
    return cssnano
  })

  mockery.registerMock('console', {
    log: function (message) {
      t.equals(message, chalk.green('\u2714') + ' saved ' + path.join(args.destination, `${args.name}.css`))
    }
  })

  t.plan(12)

  require('../../lib/styles')(args)
})

test('test lib/styles - no watch min', function (t) {
  const css = Symbol('css')

  const cssImport = Symbol('cssImport')

  const cssnext = Symbol('cssnext')

  const cssnano = Symbol('cssnano')

  const browsers = Symbol('browsers')

  const written = []

  const args = {
    destination: 'build',
    name: 'app',
    css: 'entry.css',
    noMin: false,
    watch: false,
    browsers
  }

  const output = {
    css: '* { color: red }',
    map: JSON.stringify({
      sources: [
        path.join(process.cwd(), 'index.css')
      ]
    })
  }

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  mockery.registerMock('chokidar', {})

  mockery.registerMock('fs', {
    stat: function (file, cb) {
      t.equals(file, args.css)

      cb()
    },
    readFile: function (file, encoding, cb) {
      t.equals(file, args.css)

      t.equals(encoding, 'utf-8')

      cb(null, css)
    },
    writeFile: function (file, data, cb) {
      cb(new Error('test error'))
    }
  })

  mockery.registerMock('postcss', function (plugins) {
    t.deepEquals(plugins, [
      cssImport,
      cssnext,
      cssnano
    ])

    return {
      process: function (data, options) {
        t.equals(data, css)

        t.deepEquals(options, {
          from: args.css,
          to: `/${args.name}.css`,
          map: { inline: false, annotation: `/${args.name}.css.map` }
        })

        return Promise.resolve(output)
      }
    }
  })

  mockery.registerMock('postcss-import', function () { return cssImport })

  mockery.registerMock('postcss-cssnext', function (options) {
    t.deepEquals(options, {browsers: args.browsers})

    return cssnext
  })

  mockery.registerMock('cssnano', function (options) {
    t.deepEquals(options, {autoprefixer: false})

    return cssnano
  })

  t.plan(9)

  require('../../lib/styles')(args)().then(function () {
    t.deepEquals(written, [])

    mockery.disable()
  })
})
