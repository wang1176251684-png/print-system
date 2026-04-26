// 本地服务器地址
const SERVER_URL = 'http://127.0.0.1:3001';

/**
 * 网络请求工具
 * @param {string} url - 请求路径
 * @param {string} method - 请求方法
 * @param {object} data - 请求数据
 * @param {object} header - 请求头
 * @returns {Promise} - 返回Promise对象
 */
function request(url, method = 'GET', data = {}, header = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: SERVER_URL + url,
      method,
      data,
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 文件上传
 * @param {Array} files - 文件列表
 * @returns {Promise} - 返回Promise对象
 */
function uploadFiles(files) {
  return new Promise((resolve, reject) => {
    if (files.length === 0) {
      resolve({ files: [] });
      return;
    }

    // 只上传第一个文件，因为后端接口只支持单个文件上传
    const file = files[0];
    wx.uploadFile({
      url: SERVER_URL + '/upload',
      filePath: file.path,
      name: 'file',
      success: (res) => {
        if (res.statusCode === 200) {
          const result = JSON.parse(res.data);
          if (result.success) {
            resolve({ 
              files: [{ 
                name: result.fileName, 
                path: result.filePath, 
                size: file.size, 
                pages: Math.floor(Math.random() * 50) + 1 // 模拟页数
              }] 
            });
          } else {
            reject(result.error);
          }
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 创建订单
 * @param {Array} files - 文件列表
 * @param {object} printSettings - 打印设置
 * @param {string} remarks - 备注信息
 * @returns {Promise} - 返回Promise对象
 */
function createOrder(files, printSettings, remarks = '') {
  if (files.length === 0) {
    return Promise.reject('请选择文件');
  }
  
  const file = files[0];
  return request('/order/create', 'POST', {
    file_name: file.name,
    file_url: file.path,
    page_count: file.pages,
    copies: printSettings.copies
  });
}

/**
 * 获取订单列表
 * @returns {Promise} - 返回Promise对象
 */
function getOrders() {
  return request('/orders', 'GET');
}

/**
 * 获取打印机状态
 * @returns {Promise} - 返回Promise对象
 */
function getPrinters() {
  return request('/printer/list', 'GET');
}

module.exports = { 
  request,
  uploadFiles,
  createOrder,
  getOrders,
  getPrinters
};