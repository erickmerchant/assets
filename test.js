const test = require('tape')
const execa = require('execa')
const promisify = require('util').promisify
const fs = require('fs')
const readFile = promisify(fs.readFile)
const stream = require('stream')
const streamPromise = require('stream-to-promise')
const out = new stream.Writable()

out._write = () => {}

test('index.js - make directory and watch', (t) => {
  t.plan(7)

  require('./')({
    out,
    async makeDir (directory) {
      t.equal(directory, 'assets')

      return true
    },
    createWriteStream (file) {
      const writable = new stream.Writable()

      writable._write = () => {
        t.ok(file.startsWith('bundle.txt'))
      }

      return writable
    },
    watch (watch, directory, fn) {
      t.equal(watch, false)

      t.equal(directory, '.')

      return fn()
    },
    types: {
      txt (config) {
        t.deepEqual(config.input, 'a.txt')
        t.deepEqual(config.output, 'assets/a.txt')
        t.deepEqual(config.noMin, false)
        t.deepEqual(config.browsers, ['last 2 versions', '> 5%'])
      }
    }
  })({
    destination: '.',
    source: ['a.txt'],
    watch: false,
    noMin: false,
    browser: ['last 2 versions', '> 5%']
  })
})

test('index.js - directory destination, watch true, null result', (t) => {
  t.plan(4)

  require('./')({
    out,
    async makeDir (directory) {
      t.equal(directory, 'assets')

      return true
    },
    createWriteStream (file) {
      const writable = new stream.Writable()

      writable._write = () => {
        t.ok(false)
      }

      return writable
    },
    watch (watch, directory, fn) {
      t.equal(watch, true)

      t.equal(directory, '.')

      return fn()
    },
    types: {
      txt (config) {
        t.ok(true)
      }
    }
  })({
    destination: '.',
    source: ['a.txt'],
    watch: true,
    noMin: false,
    browser: ['last 2 versions', '> 5%']
  })
})

test('index.js - no input', async (t) => {
  t.plan(1)

  await require('./')({
    out,
    async makeDir (directory) {
      t.ok(false)

      return true
    },
    createWriteStream (file) {
      const writable = new stream.Writable()

      writable._write = () => {
        t.ok(false)
      }

      return writable
    },
    watch (watch, directory, fn) {
      t.ok(false)

      return fn()
    },
    types: {
      txt (config) {
        t.ok(false)
      }
    }
  })({
    destination: '.',
    source: ['a.foo'],
    watch: false
  })

  t.ok(true)
})

test('js - min', async (t) => {
  t.plan(2)

  const [fixtureCode, fixtureMap] = await Promise.all([
    readFile('./fixtures/build-min/js/index.js', 'utf-8'),
    readFile('./fixtures/build-min/js/index.js.map', 'utf-8')
  ])

  const code = new stream.Writable()

  const codeResult = []

  code._write = (chunk, encoding, cb) => {
    codeResult.push(Buffer.from(chunk, encoding))

    cb()
  }

  const map = new stream.Writable()

  const mapResult = []

  map._write = (chunk, encoding, cb) => {
    mapResult.push(Buffer.from(chunk, encoding))

    cb()
  }

  require('./src/js')({
    input: 'fixtures/js/index.js',
    output: 'fixtures/build-min/js/index.js',
    noMin: false,
    browsers: ['Chrome <= 47'],
    code,
    map,
    cache: {}
  })

  await streamPromise(code)

  await streamPromise(map)

  t.equal(fixtureCode, codeResult.join(''))

  t.equal(fixtureMap, mapResult.join(''))
})

test('js - no-min', async (t) => {
  t.plan(2)

  const [fixtureCode, fixtureMap] = await Promise.all([
    readFile('./fixtures/build-no-min/js/index.js', 'utf-8'),
    readFile('./fixtures/build-no-min/js/index.js.map', 'utf-8')
  ])

  const code = new stream.Writable()

  const codeResult = []

  code._write = (chunk, encoding, cb) => {
    codeResult.push(Buffer.from(chunk, encoding))

    cb()
  }

  const map = new stream.Writable()

  const mapResult = []

  map._write = (chunk, encoding, cb) => {
    mapResult.push(Buffer.from(chunk, encoding))

    cb()
  }

  require('./src/js')({
    input: 'fixtures/js/index.js',
    output: 'fixtures/build-no-min/js/index.js',
    noMin: true,
    browsers: ['Chrome <= 47'],
    code,
    map,
    cache: {}
  })

  await streamPromise(code)

  await streamPromise(map)

  t.equal(fixtureCode, codeResult.join(''))

  t.equal(fixtureMap, mapResult.join(''))
})

test('css - min', async (t) => {
  t.plan(2)

  const [fixtureCode, fixtureMap] = await Promise.all([
    readFile('./fixtures/build-min/css/index.css', 'utf-8'),
    readFile('./fixtures/build-min/css/index.css.map', 'utf-8')
  ])

  const code = new stream.Writable()

  const codeResult = []

  code._write = (chunk, encoding, cb) => {
    codeResult.push(Buffer.from(chunk, encoding))

    cb()
  }

  const map = new stream.Writable()

  const mapResult = []

  map._write = (chunk, encoding, cb) => {
    mapResult.push(Buffer.from(chunk, encoding))

    cb()
  }

  require('./src/css')({
    input: 'fixtures/css/index.css',
    output: 'fixtures/build-min/css/index.css',
    noMin: false,
    browsers: ['Chrome <= 47'],
    code,
    map
  })

  await streamPromise(code)

  await streamPromise(map)

  t.equal(fixtureCode, codeResult.join(''))

  t.equal(fixtureMap, mapResult.join(''))
})

test('css - no-min', async (t) => {
  t.plan(2)

  const [fixtureCode, fixtureMap] = await Promise.all([
    readFile('./fixtures/build-no-min/css/index.css', 'utf-8'),
    readFile('./fixtures/build-no-min/css/index.css.map', 'utf-8')
  ])

  const code = new stream.Writable()

  const codeResult = []

  code._write = (chunk, encoding, cb) => {
    codeResult.push(Buffer.from(chunk, encoding))

    cb()
  }

  const map = new stream.Writable()

  const mapResult = []

  map._write = (chunk, encoding, cb) => {
    mapResult.push(Buffer.from(chunk, encoding))

    cb()
  }

  require('./src/css')({
    input: 'fixtures/css/index.css',
    output: 'fixtures/build-no-min/css/index.css',
    noMin: true,
    browsers: ['Chrome <= 47'],
    code,
    map
  })

  await streamPromise(code)

  await streamPromise(map)

  t.equal(fixtureCode, codeResult.join(''))

  t.equal(fixtureMap, mapResult.join(''))
})

test('cli.js', async (t) => {
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
