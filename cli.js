#!/usr/bin/env node
const command = require('sergeant')
const thenify = require('thenify')
const mkdirp = thenify(require('mkdirp'))
const watch = require('@erickmerchant/conditional-watch')
const action = require('./')

command('assets', 'generate css using postcss, and js using browserify and babel', action({
  makeDir: mkdirp,
  watch,
  types: {
    js: require('./src/scripts/'),
    css: require('./src/styles/')
  }
}))(process.argv.slice(2))
