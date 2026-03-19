<template>
  <footer class="footer-container">
    <div class="footer-btn-container">
      <button type="submit" class="btn-copyright">
        ©2026 TechCorp Global S.A de C.V.
      </button>
    </div>

    <div class="footer-btn-container">
      <button type="button" class="cursor-pointer btn-help">
        Ayuda
      </button>
    </div>

    <div class="footer-btn-container">
      <a href="#" target="_blank" rel="noopener noreferrer">
        <img src="https://placehold.co/100x40/transparent/002855?text=Accesibilidad" alt="logo de accesibilidad" class="cursor-pointer block img-accesibilidad">
      </a>
    </div>

    <div class="footer-btn-container">
      <img class="block cursor-pointer footer-image-logo" src="https://placehold.co/150x40/transparent/002855?text=TechCorp" alt="menuLogo">
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
};
</script>

<style scoped>
.footer-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.footer-btn-container {
  display: flex;
  flex: 1;
  padding: 0.5rem;
  text-align: center;
  justify-content: center;
  align-items: center;
  min-width: 150px;
}

button {
  background: none;
  border: none;
  font-size: 0.85rem;
  color: #555;
}

.cursor-pointer {
  cursor: pointer;
}

.btn-help:hover {
  text-decoration: underline;
}

.img-accesibilidad, .footer-image-logo {
  max-height: 40px;
  max-width: 100%;
}
</style>
