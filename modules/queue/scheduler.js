const queueService = require('./queue.service')
const printerService = require('../printer/printer.service')
const orderService = require('../order/order.service')
const ws = require('../websocket/ws.server')

try {
  const run = async () => {
    console.log('调度器已启动')
    
    while (true) {
      try {
        const job = await queueService.getJob()

        if (!job) {
          await new Promise(r => setTimeout(r, 500))
          continue
        }

        console.log(`获取到任务: ${job.order_no}`)

        const printer = await printerService.getAvailablePrinter()

        if (!printer) {
          console.log('无可用打印机，任务重新入队')
          // 重新入队
          await queueService.addJob(job)
          await new Promise(r => setTimeout(r, 1000))
          continue
        }

        console.log(`分配订单 ${job.order_no} → 打印机 ${printer.id}`)

        // 更新订单状态为打印中
        const order = await orderService.getOrder(job.order_no)
        if (order) {
          const { updateOrderStatus } = require('../order/order.model')
          await updateOrderStatus(job.order_no, 1) // 1 表示打印中
        }

        // 分配任务到打印机
        await printerService.assignJobToPrinter(printer.id, job.order_no)

        // 发送打印任务到M1022W
        try {
          const order = await orderService.getOrder(job.order_no)
          if (order && order.file_url) {
            await printerService.printJob(printer.id, job.order_no, order.file_url)
            console.log(`打印任务已发送到打印机 ${printer.id}`)
          }
        } catch (error) {
          console.error('打印任务失败:', error)
        }

        // 更新打印机队列大小
        await printerService.updatePrinterQueueSize(printer.id, printer.queue_size + 1)

        // 通知 WebSocket 客户端
        ws.broadcast({
          type: 'order_assigned',
          data: {
            order_no: job.order_no,
            printer_id: printer.id
          }
        })

        // 模拟打印完成
        setTimeout(async () => {
          try {
            // 更新订单状态为已完成
            const { updateOrderStatus } = require('../order/order.model')
            await updateOrderStatus(job.order_no, 2) // 2 表示已完成

            // 更新打印机队列大小
            await printerService.updatePrinterQueueSize(printer.id, printer.queue_size)

            // 通知 WebSocket 客户端
            ws.broadcast({
              type: 'order_completed',
              data: {
                order_no: job.order_no
              }
            })

            console.log(`订单 ${job.order_no} 打印完成`)
          } catch (error) {
            console.error('更新订单状态失败:', error)
          }
        }, 5000) // 模拟 5 秒打印时间

        // 短暂延迟，避免过于频繁的调度
        await new Promise(r => setTimeout(r, 1000))
      } catch (error) {
        console.error('调度器错误:', error)
        // 出错后短暂暂停，避免无限循环
        await new Promise(r => setTimeout(r, 2000))
      }
    }
  }

  module.exports = { run }
} catch (error) {
  console.error('调度器初始化失败:', error)
  module.exports = { run: () => console.error('调度器未初始化') }
}