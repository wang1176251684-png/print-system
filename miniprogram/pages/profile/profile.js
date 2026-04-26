Page({
  data: {
    userInfo: {
      avatar: 'https://via.placeholder.com/100',
      name: '微信用户',
      phone: '138****5678'
    }
  },

  onLoad() {
    // 初始化页面
  },

  // 进入订单页面
  goToOrders() {
    wx.navigateTo({ url: '/pages/orders/orders' });
  },

  // 进入管理员页面（店员用）
  goToAdmin() {
    wx.navigateTo({ url: '/pages/admin/admin' });
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服电话：138-0000-0000',
      showCancel: false
    });
  },

  // 关于我们
  aboutUs() {
    wx.showModal({
      title: '关于我们',
      content: '青工智行打印店\n专业高效·品质打印',
      showCancel: false
    });
  },

  // 返回首页
  navigateToHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});