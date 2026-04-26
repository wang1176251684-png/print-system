const { createOrder, getOrder, getOrders: getOrdersFromDb, updateOrderStatus } = require('./order.model')
const queueService = require('../queue/queue.service')

exports.create = async (data) => {
  const order_no = 'OD' + Date.now()

  await createOrder({ ...data, order_no })

  // 推入队列
  await queueService.addJob({
    order_no,
    priority: 0
  })

  return order_no
}

exports.getOrder = async (order_no) => {
  return getOrder(order_no)
}

exports.getOrders = async () => {
  return getOrdersFromDb()
}

exports.completeOrder = async (order_no) => {
  return updateOrderStatus(order_no, 1)
}