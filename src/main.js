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
authStore.hydrateFromLocalStorage();

app.use(router);
app.mount('#app');

// Definir la función global que reCAPTCHA llamará cuando esté listo
// Esto debe estar en el ámbito global (window) para que el script de Google la encuentre.
window.vueRecaptchaInit = () => {
  if (typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.ready === 'function') {
    window.grecaptcha.ready(() => {
      console.log("reCAPTCHA v3 API está lista globalmente.");
      // No hay widget visible que renderizar para reCAPTCHA v3.
      // Solo estamos listos para ejecutar grecaptcha.execute() cuando sea necesario.
    });
  } else {
    console.warn("window.grecaptcha.ready no está disponible. Asegúrate de que el script de reCAPTCHA v3 esté cargado correctamente en index.html.");
  }
};
