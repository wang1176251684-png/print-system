<template>
  <div class="dashboard">
    <h2>打印监控面板</h2>
    <LoadChart />
  </div>
</template>

<script setup>
import LoadChart from '../components/LoadChart.vue'
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}
</style>