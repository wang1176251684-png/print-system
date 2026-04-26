const Redis = require('ioredis')

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  retryStrategy: (times) => {
    // 重试策略，避免无限重试
    return Math.min(times * 100, 3000)
  }
})

// 处理 Redis 错误
redis.on('error', (error) => {
  console.error('Redis 连接错误:', error)
})

module.exports = redis