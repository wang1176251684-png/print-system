<template>
  <div class="load-chart">
    <h3>打印机负载情况</h3>
    <div class="printer-list">
      <PrinterCard 
        v-for="printer in printers" 
        :key="printer.id" 
        :printer="printer" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PrinterCard from './PrinterCard.vue'
import api from '../api/printer'

const printers = ref([])

onMounted(async () => {
  try {
    printers.value = await api.list()
  } catch (error) {
    console.error('获取打印机列表失败:', error)
  }
})
</script>

<style scoped>
.load-chart {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-bottom: 16px;
  color: #333;
}

.printer-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
</style>