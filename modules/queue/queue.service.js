const redis = require('../../config/redis')

// 内存存储作为 Redis 的备选方案
let memoryQueue = []

exports.addJob = async (job) => {
  try {
    await redis.lpush('print:queue', JSON.stringify(job))
  } catch (error) {
    console.warn('Redis 不可用，使用内存存储:', error.message)
    memoryQueue.unshift(job)
  }
}

exports.getJob = async () => {
  try {
    const job = await redis.rpop('print:queue')
    return job ? JSON.parse(job) : null
  } catch (error) {
    console.warn('Redis 不可用，使用内存存储:', error.message)
    return memoryQueue.pop()
  }
}

exports.getQueueLength = async () => {
  try {
    return await redis.llen('print:queue')
  } catch (error) {
    console.warn('Redis 不可用，使用内存存储:', error.message)
    return memoryQueue.length
  }
}