const ws = new WebSocket('ws://localhost:3001')

ws.onopen = () => {
  console.log('WebSocket 连接成功')
}

ws.onmessage = (msg) => {
  console.log('实时消息:', msg.data)
}

ws.onerror = (error) => {
  console.error('WebSocket 错误:', error)
}

ws.onclose = () => {
  console.log('WebSocket 连接关闭')
}

export default ws