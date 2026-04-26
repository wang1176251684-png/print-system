Page({
  data: {
    remarks: ''
  },

  onLoad(options) {
    // 接收从打印设置页面传递的备注信息
    if (options.remarks) {
      this.setData({ remarks: options.remarks });
    }
  },

  // 输入备注
  inputRemarks(e) {
    this.setData({ remarks: e.detail.value });
  },

  // 保存备注
  saveRemarks() {
    // 返回上一页并传递备注信息
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('remarksSaved', { remarks: this.data.remarks });
    }
    wx.navigateBack();
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  }
});