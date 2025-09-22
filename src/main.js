import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import Lab1 from './components/Lab1.vue'
import Lab2 from './components/Lab2.vue'
import Lab3 from './components/Lab3.vue'
import Lab4 from './components/Lab4.vue'
import Lab5 from './components/Lab5.vue'

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: 'Start',
      path: '/',
      component: Lab1
    },
    {
      name: 'Lab2',
      path: '/Lab2',
      component: Lab2
    },
    {
      name: 'Lab3',
      path: '/Lab3',
      component: Lab3
    },
    {
      name: 'Lab4',
      path: '/Lab4',
      component: Lab4
    },
    {
      name: 'Lab5',
      path: '/Lab5',
      component: Lab5
    }




  ]
})

app.use(router)
app.mount('#app')
