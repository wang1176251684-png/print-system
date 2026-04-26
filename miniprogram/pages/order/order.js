const { request } = require('../../utils/request')

Page({
  data: {
    pages: 0,
    copies: 1,
    duplex: false,
    color: false,
    price: 0,
    priceConfig: {}
  },

  async onLoad(options) {
    const config = await request('/price/config', 'GET')
    this.setData({ priceConfig: config })

    // 假设后端已返回页数
    this.setData({ pages: options.pages || 1 })

    this.calc()
  },

  calc() {
    const { pages, copies, duplex, color, priceConfig } = this.data

    let unit = color ? priceConfig.colorPrice : priceConfig.singlePrice
    let total = pages * copies * unit

    if (duplex) {
      total *= priceConfig.duplexDiscount
    }

    this.setData({
      price: total.toFixed(2)
    })
  },

  // 处理份数变化
  onCopiesChange(e) {
    this.setData({ copies: parseInt(e.detail.value) || 1 })
    this.calc()
  },

  // 处理双面打印切换
  onDuplexChange(e) {
    this.setData({ duplex: e.detail.value })
    this.calc()
  },

  // 处理彩色打印切换
  onColorChange(e) {
    this.setData({ color: e.detail.value })
    this.calc()
  },

  // 下单确认
  async confirmOrder() {
    // 这里可以添加下单逻辑，调用后端接口生成订单
    wx.showToast({ title: '下单成功' })
  }
})