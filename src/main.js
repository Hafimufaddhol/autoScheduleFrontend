import { createApp } from 'vue'
import 'flowbite'
import './assets/style.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useAuthStore } from './stores/auth'

async function bootstrap() {
	const app = createApp(App)
	app.use(pinia)
	app.use(router)

	const authStore = useAuthStore(pinia)
	try {
		await authStore.init()
	} catch (err) {
		console.error('[auth] initialization failed', err)
	}

	app.mount('#app')
}

bootstrap()
