<template>
  <div class="card">
    <p>{{ printer.name }}</p>
    <p>状态: {{ printer.status }}</p>
    <p>队列大小: {{ printer.queueSize }}</p>
  </div>
</template>

<script setup>
const props = defineProps(['printer'])
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

p {
  margin: 8px 0;
  color: #333;
}
</style>