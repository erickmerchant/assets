const assert = require('assert')

module.exports = function (state) {
  assert.strictEqual(typeof state, 'object')

  return `<h1 class="foo">${state.heading}</h1>`
}
