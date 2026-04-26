Page({
  data: {
    files: []
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
        this.addFiles(res.tempFiles);
      }
    });
  },

  // 从手机本地选择文件
  chooseFromLocal() {
    wx.chooseMessageFile({
      count: 10,
      type: 'all',
      success: (res) => {
        this.addFiles(res.tempFiles);
      }
    });
  },

  // 添加文件到列表
  addFiles(tempFiles) {
    const newFiles = tempFiles.map(file => ({
      name: file.name,
      size: file.size,
      formattedSize: (file.size / 1024 / 1024).toFixed(2),
      path: file.path,
      pages: Math.floor(Math.random() * 50) + 1 // 模拟页数，实际应该由后端返回
    }));

    this.setData({
      files: [...this.data.files, ...newFiles]
    });
  },

  // 移除文件
  removeFile(index) {
    const files = [...this.data.files];
    files.splice(index, 1);
    this.setData({ files });
  },

  // 完成选择
  completeSelection() {
    if (this.data.files.length === 0) {
      wx.showToast({ title: '请选择文件', icon: 'none' });
      return;
    }

    // 返回上一页并传递文件信息
    wx.navigateBack({
      delta: 1,
      success: () => {
        const eventChannel = this.getOpenerEventChannel();
        if (eventChannel) {
          eventChannel.emit('filesSelected', { files: this.data.files });
        }
      }
    });
  },

  // 继续添加文件
  continueAdding() {
    // 可以打开更多文件选择选项
  }
});