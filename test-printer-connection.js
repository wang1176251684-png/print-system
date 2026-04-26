const ipp = require('ipp')

// 打印机IP地址
const PRINTER_IP = '192.168.43.56'

// 创建打印机客户端
function createPrinterClient(printerIp) {
  return ipp.Printer(`http://${printerIp}:631/ipp/print`)
}

// 检查打印机状态
function checkPrinterStatus(printerIp) {
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

// 测试连接
async function testConnection() {
  console.log(`正在测试与打印机 ${PRINTER_IP} 的连接...`)
  
  try {
    const status = await checkPrinterStatus(PRINTER_IP)
    
    if (status.status === 1) {
      console.log('✅ 打印机连接成功！')
      console.log('打印机属性:', status.attributes)
    } else {
      console.log('❌ 打印机连接失败:', status.error)
    }
  } catch (error) {
    console.error('测试连接时出错:', error)
  }
}

// 运行测试
testConnection()
