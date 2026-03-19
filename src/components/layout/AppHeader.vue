<template>
  <header role="banner" class="custom-header">
    <svg viewBox="0 0 500 80" preserveAspectRatio="none" aria-hidden="true" class="header-curve">
      <!-- El path ahora dibuja el área superior (azul) y deja vacío el resto -->
      <path d="M0,0 L500,0 L500,50 Q250,80 0,50 Z" fill="#002855"></path>
    </svg>
    <div class="logo-container">
      <img class="cursor-pointer logo-img" src="https://placehold.co/150x40/transparent/white?text=LOGO" alt="Logo" />
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader'
};
</script>

<style scoped>
.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  /* Eliminamos el background-color sólido del header para que sea transparente */
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
