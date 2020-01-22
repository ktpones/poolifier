'use strict'
const { ThreadWorker } = require('../lib/workers')

function yourFunction (data) {
  for (let i = 0; i <= 1000; i++) {
    const o = {
      a: i
    }
    JSON.stringify(o)
  }
  // console.log('This is the main thread ' + isMainThread)
  return { ok: 1 }
}

class MyWorker extends ThreadWorker {
  constructor () {
    super(yourFunction)
  }
}
module.exports = new MyWorker()
