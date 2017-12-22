const test = require('tape')
// const chalk = require('chalk')
const execa = require('execa')
const stream = require('stream')
const out = new stream.Writable()

out._write = () => { }

const noopDeps = {
  makeDir () {},
  watch () {},
  types: {}
}
const noopDefiners = {
  parameter: () => {},
  option: () => {}
}

test('index.js - options and parameters', function (t) {
  t.plan(15)

  const parameters = {}
  const options = {}

  require('./index')(noopDeps)({
    parameter: (name, args) => {
      parameters[name] = args
    },
    option: (name, args) => {
      options[name] = args
    }
  })

  t.ok(parameters.source)

  t.deepEqual(parameters.source.default.value, ['./css/index.css', './js/index.js'])

  t.equal(parameters.source.multiple, true)

  t.ok(parameters.destination)

  t.equal(parameters.destination.default.value, './bundle')

  t.ok(options['no-min'])

  t.equal(options['no-min'].type, Boolean)

  t.ok(options.electron)

  t.equal(options.electron.type, Boolean)

  t.ok(options.watch)

  t.equal(options.watch.type, Boolean)

  t.deepEqual(options.watch.aliases, ['w'])

  t.ok(options.browsers)

  t.equal(options.browsers.multiple, true)

  t.deepEqual(options.browsers.default.value, ['last 2 versions', '> 5%'])
})

test('index.js - make directory and watch', function (t) {
  t.plan(4)

  require('./')({
    makeDir (directory) {
      t.equal(directory, '.')

      return Promise.resolve(true)
    },
    watch (watch, directory, fn) {
      t.equal(watch, false)

      t.equal(directory, './')

      return fn()
    },
    types: {
      txt (args, config) {
        return () => {
          t.deepEqual(config, {
            input: ['./a.txt', './b.txt', './c.txt'],
            output: 'bundle.txt'
          })

          return Promise.resolve(true)
        }
      }
    }
  })(noopDefiners)({
    destination: './bundle',
    source: ['./a.txt', './b.txt', './c.txt'],
    watch: false
  })
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
