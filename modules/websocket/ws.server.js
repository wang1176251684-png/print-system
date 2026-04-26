const WebSocket = require('ws')

let wss

exports.init = (server) => {
  wss = new WebSocket.Server({ server })

  wss.on('connection', ws => {
    console.log('客户端连接')
    
    // 发送连接成功消息
    ws.send(JSON.stringify({
      type: 'connected',
      message: '连接成功'
    }))

    // 处理客户端消息
    ws.on('message', message => {
      try {
        const data = JSON.parse(message)
        console.log('收到客户端消息:', data)
        
        // 处理不同类型的消息
        if (data.type === 'register') {
          // 客户端注册
          console.log(`客户端注册为: ${data.role}`)
        }
      } catch (error) {
        console.error('解析消息失败:', error)
      }
    })

    // 处理连接关闭
    ws.on('close', () => {
      console.log('客户端断开连接')
    })

    // 处理错误
    ws.on('error', error => {
      console.error('WebSocket 错误:', error)
    })
  })

  console.log('WebSocket 服务器已启动')
}

exports.broadcast = (data) => {
  if (!wss) {
    console.warn('WebSocket 服务器未初始化')
    return
  }

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data))
      } catch (error) {
        console.error('广播消息失败:', error)
      }
    }
  })
}

exports.sendToClient = (client, data) => {
  if (client && client.readyState === WebSocket.OPEN) {
    try {
      client.send(JSON.stringify(data))
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }
}