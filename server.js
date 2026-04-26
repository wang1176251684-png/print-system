const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// 确保上传目录存在
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

let orders = []; // 简化：用内存存

// ✅ 上传订单
app.post('/upload', upload.single('file'), (req, res) => {
  const order = {
    id: uuidv4(),
    file: req.file.path,
    filename: req.file.originalname,
    copies: parseInt(req.body.copies) || 1,
    duplex: req.body.duplex === 'true',
    color: req.body.color === 'true',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  orders.push(order);

  res.json({ success: true, order });
});

// ✅ 获取待打印订单（给打印程序用）
app.get('/orders', (req, res) => {
  const pending = orders.filter(o => o.status === 'pending');
  res.json(pending);
});

// ✅ 更新订单状态
app.post('/done/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (order) {
    order.status = 'done';
    order.doneAt = new Date().toISOString();
  }
  res.json({ success: true });
});

// ✅ 静态文件访问
app.use('/uploads', express.static(uploadDir));

// 测试打印机连接
app.post('/test-printer', (req, res) => {
  const { printerIp } = req.body;
  
  if (!printerIp) {
    return res.json({ status: 0, error: '缺少打印机IP地址' });
  }

  // 模拟打印机连接测试
  res.json({ 
    status: 1, 
    attributes: {
      'printer-info': 'Deli M1022W',
      'printer-state': 'idle',
      'printer-state-reasons': ['none'],
      'operations-supported': ['Print-Job', 'Get-Printer-Attributes']
    }
  });
});

// 测试打印功能
app.post('/print-test', (req, res) => {
  const printerIp = req.body.printerIp || '192.168.43.56'; // 默认使用测试打印机IP
  
  if (!printerIp) {
    return res.json({ success: false, error: '缺少打印机IP地址' });
  }

  // 模拟打印任务发送
  res.json({ success: true, jobId: Math.floor(Math.random() * 1000) });
});

// 提供测试页面
app.get('/printer-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'printer-test.html'));
});

app.listen(3002, () => {
  console.log('Server running on http://localhost:3002');
});