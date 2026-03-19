import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Antes de montar la app, intentar hidratar el store de autenticación
const authStore = useAuthStore();
// Llamar a la función con el nombre correcto
authStore.hydrateFromLocalStorage();

app.use(router);
app.mount('#app');
