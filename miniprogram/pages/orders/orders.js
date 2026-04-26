const { getOrders } = require('../../utils/request');

Page({
  data: {
    orders: [],
    activeTab: '全部',
    loading: false
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  // 加载订单列表
  async loadOrders() {
    this.setData({ loading: true });
    wx.showLoading({ title: '加载中...' });

    try {
      const orders = await getOrders();
      // 适配后端返回的订单数据格式
      const formattedOrders = orders.map(order => ({
        orderId: order.order_no,
        status: order.status === 0 ? '待打印' : order.status === 1 ? '打印中' : '已完成',
        createTime: order.create_time,
        files: [{ name: order.file_name }],
        printSettings: {
          copies: order.copies
        },
        estimatedPrice: (order.page_count * order.copies * 0.3).toFixed(2) // 简单计算价格
      }));
      this.setData({ orders: formattedOrders });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      console.error('加载订单失败:', error);
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderId=${orderId}`
    });
  },

  // 再来一单
  placeNewOrder() {
    wx.navigateTo({ url: '/pages/index/index' });
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  }
});