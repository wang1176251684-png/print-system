<template>
  <div class="orders">
    <h2>订单列表</h2>
    <el-table :data="orders">
      <el-table-column prop="orderNo" label="订单号" />
      <el-table-column prop="status" label="状态" />
      <el-table-column prop="createTime" label="创建时间" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api/order'

const orders = ref([])

onMounted(async () => {
  try {
    orders.value = await api.list()
  } catch (error) {
    console.error('获取订单列表失败:', error)
  }
})
</script>

<style scoped>
.orders {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}
</style>