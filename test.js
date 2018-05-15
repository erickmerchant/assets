const test = require('tape')
const execa = require('execa')
const promisify = require('util').promisify
const fs = require('fs')
const readFile = promisify(fs.readFile)
const stream = require('stream')
const out = new stream.Writable()

out._write = () => {}

const noopDeps = {
  out,
  makeDir () {},
  writeFile () {},
  watch () {},
  types: {}
}
const noopDefiners = {
  parameter () {},
  option () {}
}

test('index.js - options and parameters', function (t) {
  t.plan(13)

  const parameters = {}
  const options = {}

  require('./index')(noopDeps)({
    parameter (name, args) {
      parameters[name] = args
    },
    option (name, args) {
      options[name] = args
    }
  })

  t.ok(parameters.source)

  t.deepEqual(parameters.source.required, true)

  t.equal(parameters.source.multiple, true)

  t.ok(parameters.destination)

  t.equal(parameters.destination.required, true)

  t.ok(options['no-min'])

  t.ok(options.electron)

  t.ok(options.watch)

  t.deepEqual(options.watch.aliases, ['w'])

  t.ok(options.browsers)

  t.equal(options.browsers.multiple, true)

  t.equal(typeof options.browsers.type, 'function')

  t.deepEqual(options.browsers.type(), ['last 2 versions', '> 5%'])
})

test('index.js - make directory and watch', function (t) {
  t.plan(6)

  require('./')({
    out,
    makeDir (directory) {
      t.equal(directory, '.')

      return Promise.resolve(true)
    },
    writeFile (file, content) {
      t.ok(file.startsWith('bundle.txt'))

      return Promise.resolve(true)
    },
    watch (watch, directory, fn) {
      t.equal(watch, false)

      t.equal(directory, './')

      return fn()
    },
    types: {
      txt (config) {
        return function () {
          t.deepEqual(config, {
            input: ['./a.txt', './b.txt', './c.txt'],
            output: 'bundle.txt',
            electron: false,
            noMin: false,
            browsers: ['last 2 versions', '> 5%']
          })

          return Promise.resolve(true)
        }
      }
    }
  })(noopDefiners)({
    destination: './bundle',
    source: ['./a.txt', './b.txt', './c.txt'],
    watch: false,
    electron: false,
    noMin: false,
    browsers: ['last 2 versions', '> 5%']
  })
})

test('index.js - directory destination, watch true, null result', function (t) {
  t.plan(4)

  require('./')({
    out,
    makeDir (directory) {
      t.equal(directory, '.')

      return Promise.resolve(true)
    },
    writeFile (file, content) {
      t.ok(false)

      return Promise.resolve(true)
    },
    watch (watch, directory, fn) {
      t.equal(watch, true)

      t.equal(directory, './')

      return fn()
    },
    types: {
      txt (config) {
        return function () {
          t.deepEqual(config, {
            input: ['./a.txt'],
            output: 'bundle.txt',
            electron: false,
            noMin: false,
            browsers: ['last 2 versions', '> 5%']
          })

          return Promise.resolve(null)
        }
      }
    }
  })(noopDefiners)({
    destination: './',
    source: ['./a.txt'],
    watch: true,
    electron: false,
    noMin: false,
    browsers: ['last 2 versions', '> 5%']
  })
})

test('index.js - no input', function (t) {
  t.plan(1)

  require('./')({
    out,
    makeDir (directory) {
      t.equal(directory, '.')

      return Promise.resolve(true)
    },
    writeFile (file, content) {
      t.ok(false)

      return Promise.resolve(true)
    },
    watch (watch, directory, fn) {
      t.ok(false)

      return fn()
    },
    types: {
      txt (config) {
        return function () {
          t.ok(false)

          return Promise.resolve(true)
        }
      }
    }
  })(noopDefiners)({
    destination: './bundle',
    source: ['./a.foo', './b.foo', './c.foo'],
    watch: false
  })
})

test('js - min', async function (t) {
  t.plan(2)

  const [fixtureCode, fixtureMap] = await Promise.all([
    readFile('./fixtures/build-min/bundle.js', 'utf-8'),
    readFile('./fixtures/build-min/bundle.js.map', 'utf-8')
  ])

  const result = await require('./src/js')({
    input: ['fixtures/js/index.js'],
    output: 'fixtures/build-min/bundle.js',
    electron: false,
    noMin: false,
    browsers: ['Chrome <= 47']
  })()

  t.equal(fixtureCode, result.code)
  t.equal(fixtureMap, result.map)
})

test('js - no-min', async function (t) {
  t.plan(2)

  const [fixtureCode, fixtureMap] = await Promise.all([
    readFile('./fixtures/build-no-min/bundle.js', 'utf-8'),
    readFile('./fixtures/build-no-min/bundle.js.map', 'utf-8')
  ])

  const result = await require('./src/js')({
    input: ['fixtures/js/index.js'],
    output: 'fixtures/build-no-min/bundle.js',
    electron: false,
    noMin: true,
    browsers: ['Chrome <= 47']
  })()

  t.equal(fixtureCode, result.code)
  t.equal(fixtureMap, result.map)
})

test('js - electron', async function (t) {
  t.plan(2)

  const [fixtureCode, fixtureMap] = await Promise.all([
    readFile('./fixtures/build-electron/bundle.js', 'utf-8'),
    readFile('./fixtures/build-electron/bundle.js.map', 'utf-8')
  ])

  const result = await require('./src/js')({
    input: ['fixtures/js/electron.js'],
    output: 'fixtures/build-electron/bundle.js',
    electron: true,
    noMin: false,
    browsers: ['Chrome <= 47']
  })()

  t.equal(fixtureCode, result.code)
  t.equal(fixtureMap, result.map)
})

test('css - min', async function (t) {
  t.plan(2)

  const [fixtureCode, fixtureMap] = await Promise.all([
    readFile('./fixtures/build-min/bundle.css', 'utf-8'),
    readFile('./fixtures/build-min/bundle.css.map', 'utf-8')
  ])

  const result = await require('./src/css')({
    input: ['fixtures/css/index.css'],
    output: 'fixtures/build-min/bundle.css',
    electron: false,
    noMin: false,
    browsers: ['Chrome <= 47']
  })()

  t.equal(fixtureCode, result.code)
  t.equal(fixtureMap, result.map)
})

test('css - no-min', async function (t) {
  t.plan(2)

  const [fixtureCode, fixtureMap] = await Promise.all([
    readFile('./fixtures/build-no-min/bundle.css', 'utf-8'),
    readFile('./fixtures/build-no-min/bundle.css.map', 'utf-8')
  ])

  const result = await require('./src/css')({
    input: ['fixtures/css/index.css'],
    output: 'fixtures/build-no-min/bundle.css',
    electron: false,
    noMin: true,
    browsers: ['Chrome <= 47']
  })()

  t.equal(fixtureCode, result.code)
  t.equal(fixtureMap, result.map)
})

test('cli.js', async function (t) {
  t.plan(4)

  try {
    await execa('node', ['./cli.js', '-h'])
  } catch (e) {
    t.ok(e)

    t.equal(e.stderr.includes('Usage'), true)

    t.equal(e.stderr.includes('Options'), true)

    t.equal(e.stderr.includes('Parameters'), true)
  }
})
