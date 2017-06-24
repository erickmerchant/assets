#!/usr/bin/env node
const command = require('sergeant')
const action = require('./lib/action')

command('assets', 'generate css using postcss, and js using browserify and babel', function ({parameter, option, command}) {
  parameter('source', {
    description: 'where is your code',
    required: true
  })

  parameter('destination', {
    description: 'where to save to',
    required: true
  })

  option('no-min', {
    description: 'do not minify',
    type: Boolean
  })

  option('watch', {
    description: 'watch for changes',
    type: Boolean,
    aliases: ['w']
  })

  option('browsers', {
    description: 'what browsers to target',
    default: ['last 2 versions', '> 5%'],
    multiple: true
  })

  return action
})(process.argv.slice(2))
