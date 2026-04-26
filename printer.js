const axios = require('axios');
const printer = require('pdf-to-printer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SERVER = "http://localhost:3001";
const DOWNLOAD_DIR = "./downloads";

// 确保下载目录存在
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// 测试打印功能
const testPrint = async () => {
  console.log('测试打印机连接...');
  try {
    // 创建测试文件
    const testFile = path.join(DOWNLOAD_DIR, 'test-print.txt');
    fs.writeFileSync(testFile, '这是一个测试打印文件\n测试打印机连接是否正常\n' + new Date().toISOString());
    
    // 打印测试文件
    console.log('开始打印测试文件...');
    await printer.print(testFile, {
      printer: "Deli M1022W",
      pages: '1-'
    });
    console.log('测试打印成功！');
  } catch (printError) {
    console.error(`测试打印失败: ${printError.message}`);
  }
};

// 每5秒轮询
setInterval(async () => {
  try {
    console.log('正在检查待打印订单...');
    const res = await axios.get(`${SERVER}/orders`);
    const orders = res.data;

    if (orders.length === 0) {
      console.log('暂无待打印订单');
      return;
    }

    for (let order of orders) {
      console.log(`处理订单: ${order.order_no}`);
      
      // 构建文件URL
      const fileUrl = `${SERVER}${order.file_url}`;
      const fileExt = path.extname(order.file_name);
      const filePath = path.join(DOWNLOAD_DIR, `${order.order_no}${fileExt}`);

      // 下载文件
      console.log(`下载文件: ${fileUrl}`);
      const response = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise(resolve => writer.on('finish', resolve));
      console.log(`文件下载完成: ${filePath}`);

      // 🖨 打印
        console.log(`开始打印: ${order.order_no}`);
        try {
          // 根据文件类型选择打印方式
          const fileExt = path.extname(filePath).toLowerCase();
          console.log(`文件类型: ${fileExt}`);
          
          if (fileExt === '.pdf') {
            // PDF文件直接使用pdf-to-printer打印
            console.log('使用pdf-to-printer打印PDF文件');
            await printer.print(filePath, {
              printer: "Deli M1022W",
              pages: '1-' 
            });
          } else if ([ '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.gif', '.bmp' ].includes(fileExt)) {
            // Office文档和图片使用系统默认应用打印
            // 在Windows系统中使用cmd /c start命令
            console.log('使用系统默认应用打印Office文档或图片');
            // 使用异步执行，避免卡住
            const { exec } = require('child_process');
            exec(`start /min "" "${filePath}" /p`, (error, stdout, stderr) => {
              if (error) {
                console.error(`打印命令执行失败: ${error.message}`);
              } else {
                console.log('打印命令执行成功');
              }
            });
            // 等待2秒，确保打印命令有足够的时间执行
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            // 其他文件类型尝试使用默认打印机
            console.log('使用默认打印机打印其他文件类型');
            await printer.print(filePath, {
              printer: "Deli M1022W",
              pages: '1-' 
            });
          }
          
          console.log(`打印完成: ${order.order_no}`);

          // 回传状态
          await axios.post(`${SERVER}/order/complete/${order.order_no}`);
          console.log(`状态更新完成: ${order.order_no}`);
        } catch (printError) {
          console.error(`打印失败: ${printError.message}`);
        }
    }

  } catch (err) {
    console.error("轮询错误:", err.message);
  }
}, 5000);

// 启动时执行测试打印
testPrint();

console.log('本地打印程序已启动，每5秒检查一次订单...');