const fs = require('fs')

function getConfig() {
  return JSON.parse(fs.readFileSync('./config.json'))
}

function calcPrice(pages, copies, duplex, color) {
  const config = getConfig()

  let unit = color ? config.colorPrice : config.singlePrice
  let total = pages * copies * unit

  if (duplex) {
    total *= config.duplexDiscount
  }

  return Number(total.toFixed(2))
}

module.exports = { calcPrice, getConfig }