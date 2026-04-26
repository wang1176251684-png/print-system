import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export default {
  // 获取打印机列表
  list() {
    return api.get('/printer/list')
      .then(response => response.data)
  },
  
  // 更新打印机状态
  updateStatus(printerId, status) {
    return api.post('/printer/status', { printerId, status })
      .then(response => response.data)
  }
}