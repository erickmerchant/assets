#!/usr/bin/env node
const command = require('sergeant')
const fs = require('fs')
const promisify = require('util').promisify
const writeFile = promisify(fs.writeFile)
const makeDir = require('make-dir')
const watch = require('@erickmerchant/conditional-watch')
const action = require('./')

command('assets', 'generate css using postcss, and js using browserify and babel', action({
  out: process.stdout,
  makeDir,
  writeFile,
  watch,
  types: {
    js: require('./src/js'),
    css: require('./src/css')
  }
}))(process.argv.slice(2))
