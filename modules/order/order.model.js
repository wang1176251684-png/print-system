// 使用内存存储模拟数据库
let orders = []

exports.createOrder = async (data) => {
  const order = {
    id: orders.length + 1,
    order_no: data.order_no,
    file_name: data.file_name,
    file_url: data.file_url,
    page_count: data.page_count,
    copies: data.copies,
    status: 0,
    create_time: new Date()
  }
  orders.push(order)
  return order
}

exports.getOrder = async (order_no) => {
  return orders.find(order => order.order_no === order_no)
}

exports.getOrders = async () => {
  return orders.filter(order => order.status === 0)
}

exports.updateOrderStatus = async (order_no, status) => {
  const order = orders.find(order => order.order_no === order_no)
  if (order) {
    order.status = status
  }
}