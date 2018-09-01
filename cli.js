#!/usr/bin/env node
const command = require('sergeant')
const fs = require('fs')
const createWriteStream = fs.createWriteStream
const makeDir = require('make-dir')
const path = require('path')
const watch = require('@erickmerchant/conditional-watch')
const action = require('./')
const js = require('./src/js')
const css = require('./src/css')
const pkg = require(path.join(process.cwd(), 'package.json'))

command('assets', 'generate css using postcss, and js using browserify and babel', ({ option, parameter }) => {
  parameter('source', {
    description: 'your source files',
    required: true,
    multiple: true
  })

  parameter('destination', {
    description: 'what to save',
    required: true
  })

  option('no-min', {
    description: 'do not minify'
  })

  option('electron', {
    description: 'build for electron'
  })

  option('watch', {
    description: 'watch for changes',
    alias: 'w'
  })

  option('browser', {
    description: 'what browser to target',
    type (value) {
      if (value == null) return pkg.browserslist || ['last 2 versions', '> 5%']

      return value
    },
    multiple: true
  })

  return (args) => action({
    out: process.stdout,
    makeDir,
    createWriteStream,
    watch,
    types: {
      js,
      css
    }
  })(args)
})(process.argv.slice(2))
