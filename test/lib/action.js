const path = require('path')
const test = require('tape')
const mockery = require('mockery')

test('test lib/action', function (t) {
  const scriptsSymbol = Symbol('scripts')
  const stylesSymbol = Symbol('styles')
  const args = {
    css: 'index.css',
    js: 'index.js',
    destination: 'build'
  }

  mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false
  })

  t.plan(5)

  mockery.registerMock('mkdirp', function (dir, cb) {
    t.equals(dir, path.join(process.cwd(), args.destination))

    cb()
  })

  mockery.registerMock('./scripts', function (a) {
    t.equals(a, args)

    return function () {
      return scriptsSymbol
    }
  })

  mockery.registerMock('./styles', function (a) {
    t.equals(a, args)

    return function () {
      return stylesSymbol
    }
  })

  require('../../lib/action')(args).then(function (results) {
    t.ok(results.includes(stylesSymbol))

    t.ok(results.includes(scriptsSymbol))

    mockery.disable()
  })
})
