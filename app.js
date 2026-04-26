const express = require('express')
const http = require('http')
const cors = require('cors')

const orderController = require('./modules/order/order.controller')
const printerController = require('./modules/printer/printer.controller')
const scheduler = require('./modules/queue/scheduler')
const ws = require('./modules/websocket/ws.server')
const logger = require('./utils/logger')

const app = express()
app.use(express.json())
app.use(cors()) // 启用 CORS

// 路由
app.post('/order/create', orderController.createOrder)
app.get('/order/:order_no', orderController.getOrder)
app.get('/orders', orderController.getOrders)
app.post('/order/complete/:order_no', orderController.completeOrder)
app.get('/printer/list', printerController.getPrinters)
app.post('/printer/status', printerController.updatePrinterStatus)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 打印机测试接口
const ipp = require('ipp')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

// 配置文件上传
const upload = multer({
  dest: path.join(__dirname, 'uploads')
})

// 测试打印机连接
app.post('/test-printer', (req, res) => {
  const { printerIp } = req.body
  
  if (!printerIp) {
    return res.json({ status: 0, error: '缺少打印机IP地址' })
  }

  const printer = ipp.Printer(`http://${printerIp}:631/ipp/print`)
  const operation = {
    'operation-attributes-tag': {
      'requesting-user-name': 'print-system'
    }
  }

  printer.execute('Get-Printer-Attributes', operation, (err, result) => {
    if (err) {
      res.json({ status: 0, error: err.message })
    } else {
      res.json({ status: 1, attributes: result['printer-attributes-tag'] })
    }
  })
})

// 测试打印功能
app.post('/print-test', upload.single('file'), (req, res) => {
  const printerIp = req.body.printerIp || '192.168.43.56' // 默认使用测试打印机IP
  
  if (!printerIp) {
    return res.json({ success: false, error: '缺少打印机IP地址' })
  }

  if (!req.file) {
    // 如果没有上传文件，使用测试文件
    const testFile = path.join(__dirname, 'test-print.txt')
    
    // 创建测试文件
    fs.writeFileSync(testFile, '这是一个测试打印文件\n测试打印机连接是否正常\n' + new Date().toISOString())

    const printer = ipp.Printer(`http://${printerIp}:631/ipp/print`)
    const printJob = {
      'operation-attributes-tag': {
        'requesting-user-name': 'print-system',
        'job-name': 'Test Print Job',
        'document-format': 'text/plain'
      },
      data: fs.readFileSync(testFile)
    }

    printer.execute('Print-Job', printJob, (err, result) => {
      if (err) {
        res.json({ success: false, error: err.message })
      } else {
        res.json({ success: true, jobId: result['job-attributes-tag']['job-id'] })
      }
    })
  } else {
    // 使用上传的文件
    const printer = ipp.Printer(`http://${printerIp}:631/ipp/print`)
    
    // 根据文件扩展名设置文档格式
    let documentFormat = 'application/octet-stream'
    const fileExt = path.extname(req.file.originalname).toLowerCase()
    if (fileExt === '.txt') {
      documentFormat = 'text/plain'
    } else if (fileExt === '.pdf') {
      documentFormat = 'application/pdf'
    } else if (fileExt === '.jpg' || fileExt === '.jpeg') {
      documentFormat = 'image/jpeg'
    } else if (fileExt === '.png') {
      documentFormat = 'image/png'
    }
    
    console.log(`打印文件: ${req.file.originalname}, 格式: ${documentFormat}`)
    
    const printJob = {
      'operation-attributes-tag': {
        'requesting-user-name': 'print-system',
        'job-name': 'Uploaded File Print Job',
        'document-format': documentFormat
      },
      data: fs.readFileSync(req.file.path)
    }

    printer.execute('Print-Job', printJob, (err, result) => {
      // 无论成功失败，都删除临时文件
      fs.unlinkSync(req.file.path)
      
      if (err) {
        res.json({ success: false, error: err.message })
      } else {
        res.json({ success: true, jobId: result['job-attributes-tag']['job-id'] })
      }
    })
  }
})

// 获取打印队列
app.post('/get-queue', (req, res) => {
  const { printerIp } = req.body
  
  if (!printerIp) {
    return res.json({ success: false, error: '缺少打印机IP地址' })
  }

  const printer = ipp.Printer(`http://${printerIp}:631/ipp/print`)
  const operation = {
    'operation-attributes-tag': {
      'requesting-user-name': 'print-system',
      'which-jobs': 'not-completed'
    }
  }

  printer.execute('Get-Jobs', operation, (err, result) => {
    if (err) {
      // 打印机离线时返回空队列，而不是错误
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        res.json({ success: true, queue: [], message: '打印机离线，返回空队列' })
      } else {
        res.json({ success: false, error: err.message })
      }
    } else {
      res.json({ success: true, queue: result['job-attributes-tag'] || [] })
    }
  })
})

// 支持的文件类型
const supportedFileTypes = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/bmp': '.bmp'
};

// 文件上传接口
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择文件' })
  }
  
  // 验证文件类型
  if (!supportedFileTypes[req.file.mimetype]) {
    // 清理临时文件
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: '不支持的文件类型，请上传PDF、Word、Excel、PPT或图片文件' })
  }
  
  const filePath = '/uploads/' + req.file.filename
  res.json({ 
    success: true, 
    filePath: filePath, 
    fileName: req.file.originalname 
  })
})

// 提供静态文件访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 提供测试页面
app.get('/printer-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'printer-test.html'))
})

const server = http.createServer(app)

// WebSocket
ws.init(server)

// 启动调度器
try {
  scheduler.run()
  logger.info('调度器启动成功')
} catch (error) {
  logger.error('调度器启动失败', error)
}

const PORT = 3001
server.listen(PORT, () => {
  logger.info(`服务启动: http://localhost:${PORT}`)
})

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常', error)
})

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (error) => {
  logger.error('未处理的 Promise 拒绝', error)
})