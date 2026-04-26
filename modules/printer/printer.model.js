const db = require('../../config/db')

exports.getAvailablePrinter = async () => {
  const [rows] = await db.execute(
    'SELECT * FROM printers WHERE status = 1 ORDER BY queue_size ASC LIMIT 1'
  )
  return rows[0]
}

exports.getPrinterById = async (printerId) => {
  const [rows] = await db.execute(
    'SELECT * FROM printers WHERE id = ?',
    [printerId]
  )
  return rows[0]
}

exports.updatePrinterStatus = async (printerId, status) => {
  await db.execute(
    'UPDATE printers SET status = ? WHERE id = ?',
    [status, printerId]
  )
}

exports.updatePrinterQueueSize = async (printerId, queueSize) => {
  await db.execute(
    'UPDATE printers SET queue_size = ? WHERE id = ?',
    [queueSize, printerId]
  )
}

exports.getAllPrinters = async () => {
  const [rows] = await db.execute('SELECT * FROM printers')
  return rows
}