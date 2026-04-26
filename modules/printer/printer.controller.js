const service = require('./printer.service')

exports.getPrinters = async (req, res) => {
  try {
    const printers = await service.getAllPrinters()
    res.json(printers)
  } catch (error) {
    console.error('获取打印机列表失败:', error)
    res.status(500).json({ error: '获取打印机列表失败' })
  }
}

exports.updatePrinterStatus = async (req, res) => {
  try {
    const { printerId, status } = req.body
    await service.updatePrinterStatus(printerId, status)
    res.json({ success: true })
  } catch (error) {
    console.error('更新打印机状态失败:', error)
    res.status(500).json({ error: '更新打印机状态失败' })
  }
}