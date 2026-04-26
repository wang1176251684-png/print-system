const db = require('../../config/db')
const { getAvailablePrinter, getPrinterById, updatePrinterStatus, updatePrinterQueueSize, getAllPrinters } = require('./printer.model')
const ipp = require('ipp')
const fs = require('fs')

// 创建打印机客户端
function createPrinterClient(printerIp) {
  return ipp.Printer(`http://${printerIp}:631/ipp/print`)
}

exports.getAvailablePrinter = async () => {
  return getAvailablePrinter()
}

exports.updatePrinterStatus = async (printerId, status) => {
  return updatePrinterStatus(printerId, status)
}

exports.updatePrinterQueueSize = async (printerId, queueSize) => {
  return updatePrinterQueueSize(printerId, queueSize)
}

exports.getAllPrinters = async () => {
  return getAllPrinters()
}

exports.getPrinterById = async (printerId) => {
  return getPrinterById(printerId)
}

exports.assignJobToPrinter = async (printerId, orderNo) => {
  // 这里可以实现具体的打印机任务分配逻辑
  console.log(`分配订单 ${orderNo} 到打印机 ${printerId}`)
  // 实际应用中可能需要与打印机硬件通信
  return true
}

// 发送打印任务到M1022W
exports.printJob = async (printerId, orderNo, fileUrl) => {
  // 获取打印机信息
  const printer = await exports.getPrinterById(printerId)
  
  if (!printer) {
    throw new Error('打印机不存在')
  }

  // 创建打印任务
  const printerClient = createPrinterClient(printer.ip_address)
  const printJob = {
    'operation-attributes-tag': {
      'requesting-user-name': 'print-system',
      'job-name': `Order ${orderNo}`,
      'document-format': 'application/pdf'
    },
    data: Buffer.from(fs.readFileSync(fileUrl))
  }

  // 发送打印任务
  return new Promise((resolve, reject) => {
    printerClient.execute('Print-Job', printJob, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}

// 检查打印机状态
exports.checkPrinterStatus = async (printerIp) => {
  const printerClient = createPrinterClient(printerIp)
  const operation = {
    'operation-attributes-tag': {
      'requesting-user-name': 'print-system'
    }
  }

  return new Promise((resolve, reject) => {
    printerClient.execute('Get-Printer-Attributes', operation, (err, res) => {
      if (err) {
        resolve({ status: 0, error: err.message }) // 0表示离线
      } else {
        resolve({ status: 1, attributes: res['printer-attributes-tag'] }) // 1表示在线
      }
    })
  })
}