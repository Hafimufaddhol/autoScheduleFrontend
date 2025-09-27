import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'flowbite'
import './assets/style.css'
import '@fortawesome/fontawesome-free/css/all.min.css'


import App from './App.vue'
import router from './router'
import { useAuth } from './composables/useAuth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const auth = useAuth()
auth.initializeAuth() // cek localStorage saat reload

app.mount('#app')
