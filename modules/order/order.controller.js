const service = require('./order.service')

exports.createOrder = async (req, res) => {
  try {
    console.log('收到订单创建请求:', req.body)
    const result = await service.create(req.body)
    console.log('订单创建成功:', result)
    res.json({ order_no: result })
  } catch (error) {
    console.error('创建订单失败:', error)
    res.status(500).json({ error: '创建订单失败' })
  }
}

exports.getOrder = async (req, res) => {
  try {
    const order = await service.getOrder(req.params.order_no)
    if (order) {
      res.json(order)
    } else {
      res.status(404).json({ error: '订单不存在' })
    }
  } catch (error) {
    console.error('获取订单失败:', error)
    res.status(500).json({ error: '获取订单失败' })
  }
}

exports.getOrders = async (req, res) => {
  try {
    const orders = await service.getOrders()
    res.json(orders)
  } catch (error) {
    console.error('获取订单列表失败:', error)
    res.status(500).json({ error: '获取订单列表失败' })
  }
}

exports.completeOrder = async (req, res) => {
  try {
    const { order_no } = req.params
    await service.completeOrder(order_no)
    res.json({ success: true, message: '订单完成成功' })
  } catch (error) {
    console.error('订单完成失败:', error)
    res.status(500).json({ error: '订单完成失败' })
  }
}