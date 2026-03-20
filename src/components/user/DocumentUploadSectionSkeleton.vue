<template>
  <div class="document-section-skeleton-inner">
    <div class="skeleton-preview-area"></div>
    <div class="skeleton-line skeleton-button"></div>
    <div class="skeleton-line skeleton-button-small"></div>
  </div>
</template>

<script>
export default {
  name: 'DocumentUploadSectionSkeleton',
};
</script>

<style scoped>
.document-section-skeleton-inner {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem; /* Espacio entre elementos del skeleton */
}

.skeleton-preview-area {
  width: 100%;
  height: 150px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.skeleton-line {
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-button {
  width: 100%;
  height: 38px; /* Altura similar al botón de seleccionar archivo */
}

.skeleton-button-small {
  width: 100%;
  height: 38px; /* Altura similar al botón de subir */
}

/* Animación de pulso */
@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 0.5; }
  100% { opacity: 0.8; }
}

.document-section-skeleton-inner > div {
  animation: pulse 1.5s infinite ease-in-out;
}
</style>
