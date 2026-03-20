<template>
  <div class="main-layout">
    <AppHeader />

    <main id="main-content" role="main" class="main-container grid surface-ground mx-auto">
      <div class="profile-content col-12">
        <h1 class="text-center">Mi Perfil de Usuario</h1>
        <p class="text-center">Completa tus datos básicos y sube tus documentos para validar tu información.</p>

        <!-- Contenido condicional: solo se muestra si el usuario está autenticado -->
        <div v-if="authStore.isAuthenticated && authStore.user">
          <!-- Pestañas de navegación -->
          <div class="tabs-navigation">
            <button
              :class="{ 'tab-button': true, 'active': activeTab === 'personal' }"
              @click="activeTab = 'personal'"
            >
              Datos Personales
            </button>
            <button
              :class="{ 'tab-button': true, 'active': activeTab === 'documents' }"
              @click="activeTab = 'documents'"
            >
              Documentos Oficiales
            </button>
          </div>

          <!-- Contenido de las pestañas -->
          <div class="tab-panel-content">
            <ProfileForm
              v-if="activeTab === 'personal'"
              :initialUserData="authStore.user"
            />
            <DocumentUploadForm
              v-if="activeTab === 'documents'"
            />
          </div>
        </div>

        <!-- Mensaje alternativo si el usuario no está autenticado -->
        <div v-else class="text-center pa-4">
          <p>Por favor, inicia sesión para ver tu perfil.</p>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import AppHeader from '../components/layout/AppHeader.vue';
import AppFooter from '../components/layout/AppFooter.vue';
import ProfileForm from '../components/user/ProfileForm.vue';
import DocumentUploadForm from '../components/user/DocumentUploadForm.vue';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/apiService';

export default {
  name: 'ProfileView',
  components: {
    AppHeader,
    AppFooter,
    ProfileForm,
    DocumentUploadForm
  },
  setup() {
    const authStore = useAuthStore();
    const activeTab = ref('personal');

    onMounted(async () => {
      const storedTab = localStorage.getItem('profileActiveTab');
      if (storedTab) {
        activeTab.value = storedTab;
      }

      const isUserEmpty = !authStore.user || (typeof authStore.user === 'object' && Object.keys(authStore.user).length === 0);

      if (authStore.isAuthenticated && isUserEmpty) {
        try {
          const userProfile = await apiService.user.getProfile();
          authStore.setUser(userProfile);
        } catch (error) {
          console.error("Error al cargar el perfil del usuario:", error);
        }
      }
    });

    watch(activeTab, (newValue) => {
      localStorage.setItem('profileActiveTab', newValue);
    });

    return {
      authStore,
      activeTab
    };
  }
};
</script>

<style scoped>
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

.profile-content {
  max-width: 800px;
  margin: 2rem auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding-top: 2rem;
}

h1 {
  font-size: 2rem;
  color: #002855;
  margin-bottom: 1rem;
  padding: 0 2rem;
}

p {
  font-size: 1rem;
  color: #555;
  margin-bottom: 2rem;
  padding: 0 2rem;
}

.text-center {
  text-align: center;
}

.tabs-navigation {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 0;
  border-bottom: 2px solid #e0e0e0;
  padding: 0 2rem;
}

.tab-button {
  background-color: transparent;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  transition: color 0.3s ease, border-bottom-color 0.3s ease;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: #002855;
}

.tab-button.active {
  color: #002855;
  border-bottom-color: #002855;
}

.tab-panel-content {
  padding: 2rem;
}

.pa-4 {
  padding: 1.5rem;
}
</style>
