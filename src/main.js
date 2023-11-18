import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// import { createPinia } from 'pinia'
import { createPinia } from '@/pinia'
import { localCache } from '@/plugins'

const app = createApp(App)

const pinia = createPinia()

pinia.use(localCache)

app.use(pinia)

app.mount('#app')
