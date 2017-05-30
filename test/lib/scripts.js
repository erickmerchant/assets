const test = require('tape')
// const mockery = require('mockery')

test('test lib/scripts', function (t) {
  require('../../lib/scripts')

  t.plan(1)

  t.ok(true)
})
