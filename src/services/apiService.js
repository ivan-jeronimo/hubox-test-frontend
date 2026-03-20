import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

api.interceptors.request.use(
  (config) => {
    config.startTime = Date.now();
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    // Si el Content-Type no es multipart/form-data, establecer application/json
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  async (response) => {
    const startTime = response.config.startTime || Date.now();
    const elapsedTime = Date.now() - startTime;

    const minDelay = 200; 
    if (elapsedTime < minDelay) {
      await delay(minDelay - elapsedTime);
    }

    if (response.data && response.data.success === false) {
      let errorMessage = response.data.message || 'Ocurrió un error en la operación.';
      if (response.data.errors) {
        const validationErrors = Object.values(response.data.errors).flat().join('; ');
        if (validationErrors) {
          errorMessage += ` Detalles: ${validationErrors}`;
        }
      }
      return Promise.reject(new Error(errorMessage));
    }

    return response.data.data;
  },
  (error) => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    if (status === 401) {
      console.warn("🔐 Token expirado o no autorizado. Cerrando sesión. Redirigiendo al login...");
      const authStore = useAuthStore();
      authStore.logout();

      if (window.location.pathname !== '/') {
        window.location.href = "/"; 
      }
    }

    let errorMessage = responseData?.message || error.message || 'Error de conexión con el servidor.';
    if (responseData?.errors) {
      const validationErrors = Object.values(responseData.errors).flat().join('; ');
      if (validationErrors) {
        errorMessage += ` Detalles: ${validationErrors}`;
      }
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export const apiService = {
  auth: {
    async registerStart(payload) {
      return api.post('/auth/register-start', payload);
    },

    async verifyEmailCode(payload) {
      return api.post('/auth/verify-email-code', payload);
    },

    async logout() {
      return api.post('/auth/logout');
    }
  },

  user: {
    async updateProfile(payload) {
      return api.put('/user/profile', payload);
    },

    async getProfile() {
      return api.get('/user');
    }
  },

  documents: {
    async getAvailableDocumentTypes() {
      return api.get('/document-types');
    },

    async uploadDocument(formData) {
      return api.post('/user/documents', formData);
    },

    async getUserDocuments() {
      return api.get('/user/documents');
    }
  }
};
