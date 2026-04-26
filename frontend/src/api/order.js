import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export default {
  // 创建订单
  create(order) {
    return api.post('/order/create', order)
      .then(response => response.data)
  },
  
  // 获取订单列表
  list() {
    return api.get('/orders')
      .then(response => response.data)
  },
  
  // 获取订单详情
  get(orderNo) {
    return api.get(`/order/${orderNo}`)
      .then(response => response.data)
  }
}