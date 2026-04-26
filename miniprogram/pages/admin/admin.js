const { request } = require('../../utils/request')

Page({
  data: {
    singlePrice: 0,
    colorPrice: 0,
    duplexDiscount: 1,
    password: ''
  },

  async onLoad() {
    const config = await request('/price/config', 'GET')
    this.setData(config)
  },

  // 处理单页价格变化
  onSinglePriceChange(e) {
    this.setData({ singlePrice: parseFloat(e.detail.value) || 0 })
  },

  // 处理彩色价格变化
  onColorPriceChange(e) {
    this.setData({ colorPrice: parseFloat(e.detail.value) || 0 })
  },

  // 处理双面折扣变化
  onDuplexDiscountChange(e) {
    this.setData({ duplexDiscount: parseFloat(e.detail.value) || 1 })
  },

  // 处理密码输入
  onPasswordChange(e) {
    this.setData({ password: e.detail.value })
  },

  // 保存价格配置
  async save() {
    try {
      await request('/price/update', 'POST', {
        singlePrice: this.data.singlePrice,
        colorPrice: this.data.colorPrice,
        duplexDiscount: this.data.duplexDiscount
      }, {
        'authorization': this.data.password
      })

      wx.showToast({ title: '修改成功' })
    } catch (error) {
      wx.showToast({ title: '修改失败，请检查密码', icon: 'none' })
    }
  }
})