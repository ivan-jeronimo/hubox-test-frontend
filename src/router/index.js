import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ProfileView from '../views/ProfileView.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 1. Hidratar el store desde localStorage si aún no se ha hecho
  // Esto se hace siempre para cargar rápidamente el token y user (si existen)
  // y permitir que la UI se renderice con datos provisionales.
  // La hidratación solo debe ocurrir una vez al inicio de la aplicación.
  // Si authCheckCompleted es false, significa que es la primera vez que se ejecuta el beforeEach
  // o que la sesión se cerró y se necesita re-hidratar.
  if (!authStore.authCheckCompleted && !authStore.token) { // Solo hidratar si no se ha verificado y no hay token
    authStore.hydrateFromLocalStorage();
  }

  // 2. Verificar la autenticación con el backend si hay un token y no se ha verificado
  // o si el user está vacío (para el caso de recarga o token expirado)
  // Esta verificación se hace en segundo plano y actualiza el estado real de autenticación.
  // No bloqueamos la navegación aquí, a menos que la ruta sea protegida.
  if (authStore.token && !authStore.authCheckCompleted) {
    // Llamar a checkAuth, que hará la petición a la API.
    // Si la ruta actual es protegida, esperamos la verificación.
    // Si no es protegida, podemos dejar que la verificación se haga en segundo plano.
    if (to.meta.requiresAuth) {
      await authStore.checkAuth(); // Esperar la verificación para rutas protegidas
    } else {
      // Para rutas no protegidas, iniciar la verificación en segundo plano
      // y no esperar, para no bloquear la UI.
      authStore.checkAuth(); 
    }
  }

  // 3. Lógica de redirección basada en el estado REAL de autenticación
  // Si el usuario está autenticado y trata de ir a la página de inicio, redirigir a /profile
  if (authStore.isAuthenticated && to.name === 'home') {
    next({ name: 'profile' });
  } 
  // Si la ruta requiere autenticación
  else if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      next(); // El usuario está autenticado, permitir acceso
    } else {
      // El usuario no está autenticado, redirigir a la página de inicio
      console.warn('Acceso denegado: Se requiere autenticación para acceder a esta ruta.');
      next({ name: 'home' });
    }
  } 
  // Para todas las demás rutas no protegidas o si no hay token
  else {
    next();
  }
});

export default router;
