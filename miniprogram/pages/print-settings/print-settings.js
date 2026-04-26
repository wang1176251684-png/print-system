const { createOrder } = require('../../utils/request');

Page({
  data: {
    files: [],
    printSettings: {
      color: '黑白',
      duplex: '单面',
      copies: 1,
      pageRange: '全部'
    },
    remarks: '',
    estimatedPrice: 0,
    submitting: false
  },

  onLoad(options) {
    // 接收从首页传递的文件信息
    if (options.files) {
      this.setData({
        files: JSON.parse(options.files)
      });
    }
    this.calculatePrice();

    // 设置事件监听器接收备注信息
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on('remarksSaved', (data) => {
        this.setData({ remarks: data.remarks });
      });
    }
  },

  // 跳转到备注页面
  goToRemarks() {
    wx.navigateTo({
      url: `/pages/remarks/remarks?remarks=${this.data.remarks}`
    });
  },

  // 选择颜色
  selectColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      'printSettings.color': color
    });
    this.calculatePrice();
  },

  // 选择单双面
  selectDuplex(e) {
    const duplex = e.currentTarget.dataset.duplex;
    this.setData({
      'printSettings.duplex': duplex
    });
    this.calculatePrice();
  },

  // 选择纸张大小
  selectPaperSize(e) {
    const size = e.currentTarget.dataset.size;
    this.setData({
      'printSettings.paperSize': size
    });
    this.calculatePrice();
  },

  // 调整份数
  changeCopies(e) {
    const action = e.currentTarget.dataset.action;
    let copies = this.data.printSettings.copies;
    
    if (action === 'increase') {
      copies++;
    } else if (action === 'decrease' && copies > 1) {
      copies--;
    }
    
    this.setData({
      'printSettings.copies': copies
    });
    this.calculatePrice();
  },

  // 选择页面范围
  selectPageRange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      'printSettings.pageRange': range
    });
    this.calculatePrice();
  },

  // 计算价格
  calculatePrice() {
    // 简单计算，实际应该调用后端接口
    const totalPages = this.data.files.reduce((sum, file) => sum + file.pages, 0);
    const pricePerPage = this.data.printSettings.color === '彩色' ? 0.6 : 0.3;
    const discount = this.data.printSettings.duplex === '双面' ? 0.8 : 1;
    const estimatedPrice = (totalPages * pricePerPage * discount * this.data.printSettings.copies).toFixed(2);

    this.setData({ estimatedPrice });
  },

  // 确认打印
  async confirmPrint() {
    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    try {
      // 创建订单时包含备注信息
      const result = await createOrder(this.data.files, this.data.printSettings, this.data.remarks);
      const orderNo = result.order_no;

      // 显示取件码
      wx.showModal({
        title: '下单成功',
        content: `取件码：${orderNo}\n请凭取件码取件`,
        showCancel: false,
        success: () => {
          wx.navigateTo({ url: '/pages/orders/orders' });
        }
      });
    } catch (error) {
      wx.showToast({ title: '下单失败', icon: 'none' });
      console.error('下单失败:', error);
    } finally {
      this.setData({ submitting: false });
      wx.hideLoading();
    }
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  }
});