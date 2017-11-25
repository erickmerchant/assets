#!/usr/bin/env node
const command = require('sergeant')
const action = require('./src/action')({
  js: require('./src/scripts/'),
  css: require('./src/styles/')
})

command('assets', 'generate css using postcss, and js using browserify and babel', function ({parameter, option, command}) {
  option('css', {
    description: 'where is your css',
    default: './css/index.css'
  })

  option('js', {
    description: 'where is your js',
    default: './js/index.js'
  })

  parameter('destination', {
    description: 'where to save to',
    default: '.'
  })

  option('no-min', {
    description: 'do not minify',
    type: Boolean
  })

  option('electron', {
    description: 'build for electron. (implies --no-min)',
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
