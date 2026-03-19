<template>
  <div id="app">
    <!-- router-view renderizará el componente de la ruta actual -->
    <router-view />
  </div>
</template>

<script>
// Ya no importamos HomeView directamente aquí, el router se encarga
export default {
  name: 'App',
  // components: { HomeView } // Ya no es necesario
};
</script>

<style>
/* Estilos globales básicos y resets */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

*, ::before, ::after {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
