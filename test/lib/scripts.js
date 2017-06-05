const test = require('tape')
const mockery = require('mockery')
const path = require('path')
const chalk = require('chalk')

test('test lib/scripts - no watch min', function (t) {
  const bundleCollapser = Symbol('bundle-collapser/plugin')

  const presetEnv = Symbol('babel-preset-env')

  const yoyoify = Symbol('yo-yoify')

  const browsers = Symbol('browsers')

  const babelify = Symbol('babelify')

  const exorcist = Symbol('exorcist')

  const babili = Symbol('babili')

  const args = {
    destination: 'build',
    name: 'app',
    js: 'entry.js',
    noMin: false,
    watch: false,
    browsers
  }

  const bundleFs = {
    once: function (event, resolve) {
      if (event === 'finish') {
        resolve()
      }
    }
  }

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  mockery.registerMock('chokidar', {})

  mockery.registerMock('fs', {
    stat: function (file, cb) {
      t.equals(file, args.js)

      cb()
    },
    createWriteStream: function (file) {
      t.equals(file, path.join(process.cwd(), args.destination, `${args.name}.js`))

      return bundleFs
    }
  })

  mockery.registerMock('browserify', function (options) {
    t.deepEquals(options, {
      debug: true,
      plugin: [bundleCollapser]
    })

    return {
      add: function (file) {
        t.equals(file, args.js)
      },
      transform: function (transform, options) {
        t.equals(transform, babelify)

        t.deepEquals(options, { global: true })
      },
      bundle: function () {
        return {
          pipe: function (piped) {
            t.equals(piped, exorcist)

            return {
              pipe: function (piped) {
                t.equals(piped, bundleFs)
              }
            }
          }
        }
      }
    }
  })

  mockery.registerMock('bundle-collapser/plugin', bundleCollapser)

  mockery.registerMock('babel-preset-babili', babili)

  mockery.registerMock('babelify', {
    configure: function (options) {
      t.deepEquals(options, {
        presets: [
          [
            presetEnv, {
              targets: {
                browsers: args.browsers
              }
            }
          ],
          babili
        ],
        plugins: [yoyoify],
        env: 'production'
      })

      return babelify
    }
  })

  mockery.registerMock('babel-preset-env', presetEnv)

  mockery.registerMock('babel-plugin-yo-yoify', yoyoify)

  mockery.registerMock('exorcist', function (file, map) {
    t.equals(file, path.join(process.cwd(), args.destination, `${args.name}.js.map`))

    t.equals(map, `/${args.name}.js.map`)

    return exorcist
  })

  mockery.registerMock('console', {
    log: function (message) {
      t.equals(message, chalk.green('\u2714') + ' saved ' + path.join(args.destination, `${args.name}.js`))
    }
  })

  t.plan(12)

  require('../../lib/scripts')(args)().then(function () {
    mockery.disable()
  })
})

test('test lib/scripts - watch no min', function (t) {
  const bundleCollapser = Symbol('bundle-collapser/plugin')

  const presetEnv = Symbol('babel-preset-env')

  const yoyoify = Symbol('yo-yoify')

  const browsers = Symbol('browsers')

  const babelify = Symbol('babelify')

  const exorcist = Symbol('exorcist')

  const babili = Symbol('babili')

  const args = {
    destination: 'build',
    name: 'app',
    js: 'entry.js',
    noMin: true,
    watch: true,
    browsers
  }

  const bundleFs = {
    once: function (event, resolve) {
      if (event === 'finish') {
        resolve()
      }
    }
  }

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  mockery.registerMock('chokidar', {
    watch: function (file, options) {
      t.equals(file, path.join(path.dirname(args.js), '**/*.js'))
      t.deepEquals(options, {ignoreInitial: true})

      return {
        on: function (event, cb) {
          t.equals(event, 'all')

          cb().then(function () {
            mockery.disable()
          })
        }
      }
    }
  })

  mockery.registerMock('fs', {
    stat: function (file, cb) {
      t.equals(file, args.js)

      cb()
    },
    createWriteStream: function (file) {
      t.equals(file, path.join(process.cwd(), args.destination, `${args.name}.js`))

      return bundleFs
    }
  })

  mockery.registerMock('browserify', function (options) {
    t.deepEquals(options, {
      debug: true,
      plugin: [bundleCollapser]
    })

    return {
      add: function (file) {
        t.equals(file, args.js)
      },
      transform: function (transform, options) {
        t.equals(transform, babelify)

        t.deepEquals(options, { global: true })
      },
      bundle: function () {
        return {
          pipe: function (piped) {
            t.equals(piped, exorcist)

            return {
              pipe: function (piped) {
                t.equals(piped, bundleFs)
              }
            }
          }
        }
      }
    }
  })

  mockery.registerMock('bundle-collapser/plugin', bundleCollapser)

  mockery.registerMock('babel-preset-babili', babili)

  mockery.registerMock('babelify', {
    configure: function (options) {
      t.deepEquals(options, {
        presets: [
          [
            presetEnv, {
              targets: {
                browsers: args.browsers
              }
            }
          ]
        ],
        plugins: [yoyoify],
        env: 'production'
      })

      return babelify
    }
  })

  mockery.registerMock('babel-preset-env', presetEnv)

  mockery.registerMock('babel-plugin-yo-yoify', yoyoify)

  mockery.registerMock('exorcist', function (file, map) {
    t.equals(file, path.join(process.cwd(), args.destination, `${args.name}.js.map`))

    t.equals(map, `/${args.name}.js.map`)

    return exorcist
  })

  mockery.registerMock('console', {
    log: function (message) {
      t.equals(message, chalk.green('\u2714') + ' saved ' + path.join(args.destination, `${args.name}.js`))
    }
  })

  t.plan(15)

  require('../../lib/scripts')(args)
})

test('test lib/scripts - error', function (t) {
  const bundleCollapser = Symbol('bundle-collapser/plugin')

  const presetEnv = Symbol('babel-preset-env')

  const yoyoify = Symbol('yo-yoify')

  const browsers = Symbol('browsers')

  const babelify = Symbol('babelify')

  const exorcist = Symbol('exorcist')

  const babili = Symbol('babili')

  const args = {
    destination: 'build',
    name: 'app',
    js: 'entry.js',
    noMin: false,
    watch: false,
    browsers
  }

  const bundleFs = {
    once: function (event, reject) {
      if (event === 'error') {
        reject()
      }
    }
  }

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  mockery.registerMock('chokidar', {})

  mockery.registerMock('fs', {
    stat: function (file, cb) {
      t.equals(file, args.js)

      cb()
    },
    createWriteStream: function (file) {
      t.equals(file, path.join(process.cwd(), args.destination, `${args.name}.js`))

      return bundleFs
    }
  })

  mockery.registerMock('browserify', function (options) {
    t.deepEquals(options, {
      debug: true,
      plugin: [bundleCollapser]
    })

    return {
      add: function (file) {
        t.equals(file, args.js)
      },
      transform: function (transform, options) {
        t.equals(transform, babelify)

        t.deepEquals(options, { global: true })
      },
      bundle: function () {
        return {
          pipe: function (piped) {
            t.equals(piped, exorcist)

            return {
              pipe: function (piped) {
                t.equals(piped, bundleFs)
              }
            }
          }
        }
      }
    }
  })

  mockery.registerMock('bundle-collapser/plugin', bundleCollapser)

  mockery.registerMock('babel-preset-babili', babili)

  mockery.registerMock('babelify', {
    configure: function (options) {
      t.deepEquals(options, {
        presets: [
          [
            presetEnv, {
              targets: {
                browsers: args.browsers
              }
            }
          ],
          babili
        ],
        plugins: [yoyoify],
        env: 'production'
      })

      return babelify
    }
  })

  mockery.registerMock('babel-preset-env', presetEnv)

  mockery.registerMock('babel-plugin-yo-yoify', yoyoify)

  mockery.registerMock('exorcist', function (file, map) {
    t.equals(file, path.join(process.cwd(), args.destination, `${args.name}.js.map`))

    t.equals(map, `/${args.name}.js.map`)

    return exorcist
  })

  t.plan(11)

  require('../../lib/scripts')(args)().then(function () {
    mockery.disable()
  })
})
