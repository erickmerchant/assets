#!/usr/bin/env node
const command = require('sergeant')
const fs = require('fs')
const thenify = require('thenify')
const writeFile = thenify(fs.writeFile)
const mkdirp = thenify(require('mkdirp'))
const watch = require('@erickmerchant/conditional-watch')
const action = require('./')

command('assets', 'generate css using postcss, and js using browserify and babel', action({
  out: process.stdout,
  makeDir: mkdirp,
  writeFile,
  watch,
  types: {
    js: require('./src/js'),
    css: require('./src/css')
  }
}))(process.argv.slice(2))
