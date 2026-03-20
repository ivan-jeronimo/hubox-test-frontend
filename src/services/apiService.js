import axios from 'axios';
import { useAuthStore } from '../stores/auth'; // Importar el store de autenticación

// Define la URL base de la API. En Vite, se accede a las variables de entorno con import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Instancia base de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    // 'Content-Type': 'application/json', // Se elimina para que Axios lo maneje automáticamente con FormData
  },
});

// Función de utilidad para simular un delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 🔹 Interceptor de solicitud
api.interceptors.request.use(
  (config) => {
    config.startTime = Date.now(); // Registrar tiempo de inicio
    
    const authStore = useAuthStore(); // Obtener la instancia del store
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Interceptor de respuesta
api.interceptors.response.use(
  async (response) => {
    const startTime = response.config.startTime || Date.now();
    const elapsedTime = Date.now() - startTime;

    // Simular un delay mínimo de 200ms para evitar flashes de carga rápidos
    const minDelay = 200; 
    if (elapsedTime < minDelay) {
      await delay(minDelay - elapsedTime);
    }

    // Manejo del formato estandarizado de respuesta (success, message, data, errors)
    // Si la respuesta HTTP es 2xx, pero el cuerpo JSON indica success: false
    if (response.data && response.data.success === false) {
      let errorMessage = response.data.message || 'Ocurrió un error en la operación.';
      if (response.data.errors) {
        const validationErrors = Object.values(response.data.errors).flat().join('; ');
        if (validationErrors) {
          errorMessage += ` Detalles: ${validationErrors}`;
        }
      }
      // Lanzar un error para que sea capturado por el catch
      return Promise.reject(new Error(errorMessage));
    }

    // Si success es true, devolver solo el campo 'data'
    return response.data.data;
  },
  (error) => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    // Manejo de token expirado (401)
    if (status === 401) {
      console.warn("🔐 Token expirado o no autorizado. Cerrando sesión. Redirigiendo al login...");
      const authStore = useAuthStore(); // Obtener la instancia del store
      authStore.logout(); // Llamar a la acción logout del store

      // Redirección segura a la página de inicio
      if (window.location.pathname !== '/') {
        window.location.href = "/"; 
      }
    }

    // Construir mensaje de error más detallado
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

// Exportar un objeto que contenga la instancia de Axios y los módulos específicos
export const apiService = {
  // Módulo de autenticación
  auth: {
    /**
     * Inicia el flujo de registro o recuperación de cuenta.
     * @param {Object} payload - Objeto que contiene { firstName, email }
     * @returns {Promise<Object>}
     */
    async registerStart(payload) {
      return api.post('/auth/register-start', payload);
    },

    /**
     * Verifica el código OTP y devuelve el token JWT.
     * @param {Object} payload - Objeto que contiene { email, code }
     * @returns {Promise<Object>}
     */
    async verifyEmailCode(payload) {
      return api.post('/auth/verify-email-code', payload);
    },
  },

  // Módulo de usuario
  user: {
    /**
     * Actualiza la información del perfil del usuario.
     * @param {Object} payload - Objeto con los campos a actualizar (phone, curp, date_of_birth, address).
     * @returns {Promise<Object>}
     */
    async updateProfile(payload) {
      return api.put('/user/profile', payload);
    },

    /**
     * Obtiene la información del perfil del usuario autenticado.
     * @returns {Promise<Object>}
     */
    async getProfile() {
      return api.get('/user');
    }
  },

  // Nuevo módulo para documentos
  documents: {
    /**
     * Obtiene la lista de tipos de documentos disponibles.
     * @returns {Promise<Array>} - Un array de objetos de tipo de documento.
     */
    async getAvailableDocumentTypes() {
      return api.get('/document-types');
    },

    /**
     * Sube un documento oficial.
     * @param {FormData} formData - Objeto FormData que contiene documentTypeId, documentNumber y file.
     * @returns {Promise<Object>}
     */
    async uploadDocument(formData) {
      // Axios automáticamente establece Content-Type a multipart/form-data cuando detecta FormData
      return api.post('/user/documents', formData);
    },

    /**
     * Obtiene la lista de documentos subidos por el usuario.
     * @returns {Promise<Array>} - Un array de objetos de documentos subidos.
     */
    async getUserDocuments() {
      return api.get('/user/documents');
    }
  }
};
