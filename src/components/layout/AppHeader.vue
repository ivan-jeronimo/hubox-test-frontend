<template>
  <header role="banner" class="custom-header">
    <svg viewBox="0 0 500 80" preserveAspectRatio="none" aria-hidden="true" class="header-curve">
      <path d="M0,0 L500,0 L500,50 Q250,80 0,50 Z" fill="#002855"></path>
    </svg>
    <div class="logo-container">
      <router-link to="/">
        <img class="cursor-pointer logo-img" src="https://placehold.co/150x40/transparent/white?text=Hubox-Test" alt="Logo Hubox-Test" />
      </router-link>
    </div>

    <!-- Botón de Cerrar Sesión -->
    <div v-if="authStore.isAuthenticated" class="logout-container">
      <button @click="handleLogout" class="logout-button">Cerrar Sesión</button>
    </div>
  </header>
</template>

<script>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth'; // Importar el store de autenticación

export default {
  name: 'AppHeader',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore(); // Usar el store de autenticación

    const handleLogout = async () => {
      try {
        await authStore.logout();
        // Después de cerrar sesión, redirigir a la página de inicio
        router.push({ name: 'home' });
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        // Aunque el logout del store ya limpia el estado, aquí podríamos mostrar un mensaje al usuario
        alert('Hubo un problema al cerrar la sesión. Por favor, intente de nuevo.');
      }
    };

    return {
      authStore, // Hacer el store disponible en el template
      handleLogout
    };
  }
};
</script>

<style scoped>
.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background-color: transparent;
  z-index: 1000;
  pointer-events: none; /* Para que la parte transparente no bloquee clics debajo */
}

.header-curve {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  pointer-events: auto; /* Restaurar eventos en la zona pintada si fuera necesario */
}

.logo-container {
  position: absolute;
  top: 15px;
  left: 5%;
  z-index: 10;
  pointer-events: auto;
}

.logo-img {
  height: 40px;
}

.logout-container {
  position: absolute;
  top: 15px;
  right: 5%; /* Posicionar a la derecha */
  z-index: 10;
  pointer-events: auto;
}

.logout-button {
  background-color: #dc3545; /* Rojo para cerrar sesión */
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  font-size: 0.9rem;
}

.logout-button:hover {
  background-color: #c82333;
}
</style>
