const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const WebSocket = require('ws')
const { calcPrice, getConfig } = require('./pricing')

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// 创建上传目录
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads')
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage })

// 订单存储
let orders = []
let printers = [
  { id: 'Printer-1', status: 'online', task: null, queue: 0 },
  { id: 'Printer-2', status: 'online', task: null, queue: 0 },
  { id: 'Printer-3', status: 'offline', task: null, queue: 0 }
]

// 获取价格配置
app.get('/price/config', (req, res) => {
  res.json(getConfig())
})

// 修改价格（店员端用）
app.post('/price/update', (req, res) => {
  // 简单的权限控制
  const password = req.headers.authorization
  if (password !== 'admin123') {
    return res.status(403).json({ error: 'No permission' })
  }

  fs.writeFileSync('./config.json', JSON.stringify(req.body))
  res.json({ success: true })
})

// 计算价格（用于后端校验）
app.post('/price/calc', (req, res) => {
  const { pages, copies, duplex, color } = req.body
  const price = calcPrice(pages, copies, duplex, color)
  res.json({ price })
})

// 文件上传
app.post('/upload', upload.array('files'), (req, res) => {
  const uploadedFiles = req.files.map(file => ({
    name: file.originalname,
    size: file.size,
    path: file.path,
    pages: Math.floor(Math.random() * 50) + 1 // 模拟页数，实际应该解析PDF
  }))
  res.json({ files: uploadedFiles })
})

// 创建订单
app.post('/order/create', (req, res) => {
  const { files, printSettings, remarks } = req.body
  const orderId = 'A-' + Math.floor(Math.random() * 9000) + 1000
  const totalPages = files.reduce((sum, file) => sum + file.pages, 0)
  const price = calcPrice(totalPages, printSettings.copies, printSettings.duplex === '双面', printSettings.color === '彩色')
  
  const order = {
    orderId,
    files,
    printSettings,
    remarks: remarks || '',
    price,
    status: '等待中',
    createTime: new Date().toISOString()
  }
  
  orders.unshift(order)
  
  // 通知WebSocket客户端
  broadcast({ type: 'new_order', data: order })
  
  res.json({ order })
})

// 获取订单列表
app.get('/orders', (req, res) => {
  res.json({ orders })
})

// 获取打印机状态
app.get('/printers', (req, res) => {
  res.json({ printers })
})

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// WebSocket 服务器
const wss = new WebSocket.Server({ server })
let clients = []

wss.on('connection', (ws) => {
  clients.push(ws)
  
  ws.on('message', (message) => {
    const data = JSON.parse(message)
    if (data.type === 'register' && data.role === 'admin') {
      // 发送初始数据
      ws.send(JSON.stringify({ type: 'initial_data', data: { orders, printers } }))
    }
  })
  
  ws.on('close', () => {
    clients = clients.filter(client => client !== ws)
  })
})

// 广播消息
function broadcast(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

// 模拟打印机状态更新
setInterval(() => {
  printers.forEach(printer => {
    if (Math.random() > 0.95) {
      printer.status = printer.status === 'online' ? 'offline' : 'online'
      broadcast({ type: 'printer_update', data: printer })
    }
  })
}, 10000)