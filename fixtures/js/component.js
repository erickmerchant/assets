const assert = require('assert')
const html = require('nanohtml')

module.exports = function (state) {
  assert.equal(typeof state, 'object')

  return html`<h1 class="foo">${state.heading}</h1>`
}
