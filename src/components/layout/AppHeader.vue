<template>
  <header role="banner" class="custom-header">
    <svg viewBox="0 0 500 80" preserveAspectRatio="none" aria-hidden="true" class="header-curve">
      <path d="M0,0 L500,0 L500,50 Q250,80 0,50 Z" fill="#002855"></path>
    </svg>
    <div class="logo-container">
      <!-- Usamos router-link para navegar a la página principal -->
      <router-link to="/">
        <img class="cursor-pointer logo-img" src="https://placehold.co/150x40/transparent/white?text=LOGO" alt="Logo" />
      </router-link>
    </div>
  </header>
</template>

<script>
import { useRouter } from 'vue-router'; // Importar useRouter si se necesita lógica de navegación programática

export default {
  name: 'AppHeader',
  setup() {
    const router = useRouter(); // Opcional: si necesitas navegar programáticamente

    // Puedes añadir un método para navegar si el router-link no es suficiente
    const goToHome = () => {
      router.push('/');
    };

    return {
      goToHome // Exportar si se usa en el template
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
</style>
