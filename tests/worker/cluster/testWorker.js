'use strict'
const { ClusterWorker } = require('../../../lib/index')
const { isMaster } = require('cluster')

function test (data) {
  for (let i = 0; i <= 50; i++) {
    const o = {
      a: i
    }
    JSON.stringify(o)
  }
  return isMaster
}

module.exports = new ClusterWorker(test, { maxInactiveTime: 500 })
