const { uploadFiles } = require('../../utils/request');

Page({
  data: {
    files: [],
    printSettings: {
      color: '黑白',
      duplex: '单面',
      paperSize: 'A4',
      copies: 1
    },
    estimatedPrice: 0,
    uploading: false
  },

  onLoad() {
    // 初始化页面
  },

  // 从微信聊天选择文件
  chooseFromWeChat() {
    wx.chooseMessageFile({
      count: 10,
      type: 'all',
      success: (res) => {
        this.uploadFiles(res.tempFiles);
      }
    });
  },

  // 从手机本地选择文件
  chooseFromLocal() {
    wx.chooseMessageFile({
      count: 10,
      type: 'all',
      success: (res) => {
        this.uploadFiles(res.tempFiles);
      }
    });
  },

  // 上传文件
  async uploadFiles(tempFiles) {
    this.setData({ uploading: true });
    wx.showLoading({ title: '上传中...' });

    try {
      const result = await uploadFiles(tempFiles);
      // 为每个文件添加 formattedSize 属性
      const filesWithFormat = result.files.map(file => ({
        ...file,
        formattedSize: (file.size / 1024 / 1024).toFixed(2)
      }));
      this.setData({
        files: [...this.data.files, ...filesWithFormat]
      });
      this.calculatePrice();
    } catch (error) {
      wx.showToast({ title: '上传失败', icon: 'none' });
      console.error('上传失败:', error);
    } finally {
      this.setData({ uploading: false });
      wx.hideLoading();
    }
  },

  // 移除文件
  removeFile(e) {
    const index = e.currentTarget.dataset.index;
    const files = [...this.data.files];
    files.splice(index, 1);
    this.setData({ files });
    this.calculatePrice();
  },

  // 清空文件
  clearFiles() {
    this.setData({ files: [] });
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

  // 进入打印设置页面
  goToPrintSettings() {
    if (this.data.files.length === 0) {
      wx.showToast({ title: '请先选择文件', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: '/pages/print-settings/print-settings?files=' + JSON.stringify(this.data.files)
    });
  },

  // 进入订单页面
  goToOrders() {
    wx.navigateTo({ url: '/pages/orders/orders' });
  },

  // 进入个人中心
  goToProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  // 返回首页
  navigateToHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});