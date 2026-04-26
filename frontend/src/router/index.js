import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Orders from '../views/Orders.vue'

const routes = [
  {
    path: '/',
    component: Dashboard
  },
  {
    path: '/orders',
    component: Orders
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router