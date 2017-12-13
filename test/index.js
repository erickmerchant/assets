const path = require('path')
const test = require('tape')
const mockery = require('mockery')

test('test src/action - no watch', function (t) {
  const resultSymbol = Symbol('result')
  const args = {
    foo: './foo/index.foo',
    destination: 'dist'
  }
  const config = {
    input: './foo/index.foo',
    output: path.join(args.destination, 'bundle.foo')
  }

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  t.plan(4)

  mockery.registerMock('mkdirp', function (dir, cb) {
    t.equals(dir, args.destination)

    cb()
  })

  const types = {
    foo: function (a, c) {
      t.deepEquals(a, args)

      t.deepEquals(c, config)

      return function () {
        return resultSymbol
      }
    }
  }

  require('../')(types)(args).then(function (results) {
    t.ok(results.includes(resultSymbol))

    mockery.disable()
  })
})

test('test src/action - watch', function (t) {
  const resultSymbol = Symbol('result')
  const args = {
    foo: './foo/index.foo',
    destination: 'dist',
    watch: true
  }

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  t.plan(4)

  mockery.registerMock('mkdirp', function (dir, cb) {
    cb()
  })

  mockery.registerMock('chokidar', {
    watch: function (files, settings) {
      t.equals(files, 'foo/**/*.foo')

      t.deepEquals(settings, {ignoreInitial: true})

      return {
        on: function (name, cb) {
          t.equals(name, 'all')

          t.equals(cb(), resultSymbol)
        }
      }
    }
  })

  const types = {
    foo: function (a, c) {
      return function () {
        return resultSymbol
      }
    }
  }

  require('../')(types)(args)
})