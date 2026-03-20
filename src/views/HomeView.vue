<template>
  <div class="main-layout">
    <AppHeader />

    <main id="main-content" role="main" class="main-container grid surface-ground mx-auto">
      <!-- Sección Izquierda: Imagen (Desktop y Mobile) -->
      <div class="image-section col-12 lg:col-5 flex justify-content-center pl-0 pr-0" aria-hidden="true">
        <div class="circle-image-container">
          <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&h=500&fit=crop&crop=faces" alt="Pareja con teléfono" role="presentation" class="circle-image section-desktop">
          <img src="https://placehold.co/400x300/e0e0e0/002855?text=Imagen+Mobile" alt="Pareja con teléfono" role="presentation" class="circle-image section-mobile" style="display: none;">
        </div>
      </div>

      <!-- Sección Derecha: Contenido y Flujo de Registro -->
      <div class="right-panel col-12 lg:col-7 flex align-items-center justify-content-start h-full pl-0 pr-0">
        <div class="container-data">

          <div class="home-title-container text-center">
            <h1 class="cb-text got-bold center">Registro Nacional de Usuarios</h1>
          </div>

          <div class="home-subtitle-container text-center px-2">
            <p class="cb-text got-book columbia-blue center mx-auto">
              Por disposición oficial es obligatorio registrar tus datos personales.
            </p>
          </div>

          <!-- Integración del flujo dinámico de Vue -->
          <div class="dynamic-flow-container">
            <!-- Pantalla Landing Original -->
            <div v-if="step === 'landing'" class="home-container-buttons mx-auto">
              <button type="button" class="continue-btn mx-auto btn-blue" @click="step = 'register'">
                Registrarme
              </button>
              <!-- Eliminado el botón "Consulta tus registros" -->
            </div>

            <!-- Componente Formulario de Registro -->
            <div v-else-if="step === 'register'" class="form-wrapper">
              <RegisterForm
                @register-success="handleRegisterSuccess"
                @cancel="step = 'landing'"
              />
            </div>

            <!-- Componente Verificación OTP -->
            <div v-else-if="step === 'otp'" class="form-wrapper">
              <OtpVerification
                :email="userData.email"
                :firstName="userData.firstName"
                @verification-success="handleVerificationSuccess"
              />
            </div>
          </div>

        </div>

        <!-- Se ha sacado la barra legal fuera de container-data para no afectar su centrado -->
        <div class="legal-bar">
          <button type="button" class="pill-btn">Aviso de privacidad</button>
          <button type="button" class="pill-btn">Términos y condiciones</button>
        </div>

      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/apiService';
import AppHeader from '../components/layout/AppHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import RegisterForm from '../components/auth/RegisterForm.vue';
import OtpVerification from '../components/auth/OtpVerification.vue';

export default {
  name: 'HomeView',
  components: {
    AppHeader,
    AppFooter,
    RegisterForm,
    OtpVerification
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const step = ref('landing');

    const userData = reactive({
      firstName: '',
      email: ''
    });

    const handleRegisterSuccess = (data) => {
      userData.firstName = data.name;
      userData.email = data.email;
      step.value = 'otp';
    };

    const handleVerificationSuccess = async (data) => {
      console.log('Token recibido:', data.accessToken);

      authStore.setAuth(null, data.accessToken);

      try {
        const userProfile = await apiService.user.getProfile();
        console.log('Perfil de usuario obtenido:', userProfile);
        authStore.setUser(userProfile);

        router.push({ name: 'profile' });
      } catch (error) {
        console.error("Error al obtener el perfil del usuario después de la verificación:", error);
        authStore.logout();
        alert('Error al cargar el perfil. Por favor, intente de nuevo.');
        router.push({ name: 'home' });
      }
    };

    return {
      step,
      userData,
      handleRegisterSuccess,
      handleVerificationSuccess
    };
  }
};
</script>

<style scoped>
/* ========================================================= */
/* ESTILOS DE COMPONENTE */
/* ========================================================= */

.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.main-container {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  background: transparent;
  padding: 0% 5% 0% 2%;
  margin: 0 auto;
  padding-top: calc(80px + env(safe-area-inset-top, 0));
  padding-bottom: env(safe-area-inset-bottom, 20px);
  width: 100%;
  max-width: 1400px;
}

/* Clases de utilidad */
.mx-auto {
  margin-left: auto !important;
  margin-right: auto !important;
}

.circle-image-container {
  max-width: 100%;
  display: flex;
  justify-content: center;
}

.circle-image {
  max-width: 100%;
  height: auto;
  border-radius: 50%;
  object-fit: cover;
}

/*
  En vez de flex-start que empujaba todo hacia arriba,
  usamos align-items-center para que todo vuelva al centro
*/
.image-section {
  display: flex;
  align-items: center !important;
  padding-top: 0 !important;
}

.section-desktop {
  width: 100%;
  max-width: 380px;
  aspect-ratio: 1 / 1;
  box-shadow: 0 10px 30px rgba(0, 40, 85, 0.2);
}

.right-panel {
  position: relative;
  /* Centrar su contenido internamente */
  display: flex;
  align-items: center !important;
  padding-top: 0 !important;
}

.container-data {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}

.home-title-container {
  margin-top: 0;
}

.home-title-container h1 {
  font-size: 2rem;
  color: #002855;
  margin-bottom: 1rem;
  margin-top: 0;
}

.home-subtitle-container p {
  font-size: 1rem;
  color: #555;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.home-container-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.continue-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: bold;
  border-radius: 25px;
  cursor: pointer;
  border: 2px solid #002855;
  transition: all 0.3s ease;
}

.btn-blue {
  background-color: #002855;
  color: white;
}

.btn-blue:hover {
  background-color: #001a3b;
}

.btn-white {
  background-color: white;
  color: #002855;
}

.btn-white:hover {
  background-color: #f0f0f0;
}

.dynamic-flow-container {
  min-height: 200px;
}

.form-wrapper {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 1.5rem;
  width: 100%;
}

.legal-bar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pill-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
}

/* En Desktop, el legal-bar se posiciona al fondo de right-panel
   para no afectar el centrado vertical de container-data */
@media screen and (min-width: 992px) {
  .legal-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    margin-top: 0;
    padding-bottom: 1rem;
  }
}

/* Responsive móvil */
@media (max-width: 991px) {
  .section-desktop {
    display: none;
  }
  .section-mobile {
    display: block !important;
    border-radius: 12px;
  }
  .container-data {
    margin: 0 auto;
    /* Evitar que toque el borde inferior si hay contenido */
    margin-bottom: 4rem;
  }
  .main-container {
    padding-top: calc(80px + env(safe-area-inset-top, 0));
    align-items: flex-start; /* En móvil sí es mejor que empiece arriba para scroll natural */
  }
  .image-section {
    padding-bottom: 2rem;
  }
}
</style>
