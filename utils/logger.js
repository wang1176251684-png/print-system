exports.log = (msg) => {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

exports.error = (msg, error) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${msg}`)
  if (error) {
    console.error(error)
  }
}

exports.info = (msg) => {
  console.log(`[${new Date().toISOString()}] INFO: ${msg}`)
}

exports.warn = (msg) => {
  console.warn(`[${new Date().toISOString()}] WARN: ${msg}`)
}