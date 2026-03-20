<template>
  <div class="fade-in">
    <form @submit.prevent="submitRegister">
      <div class="form-group">
        <label for="firstName">Nombre Principal:</label>
        <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            placeholder="Ej. Juan Pablo"
            required
        />
      </div>
      <div class="form-group">
        <label for="email">Correo Electrónico:</label>
        <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="ejemplo@correo.com"
            required
        />
      </div>

      <!-- Checkbox de Términos y Condiciones -->
      <div class="form-group checkbox-group">
        <input
            type="checkbox"
            id="termsAccepted"
            v-model="termsAccepted"
            required
        />
        <label for="termsAccepted" class="checkbox-label">
          Acepto los <a href="#" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
        </label>
      </div>

      <!-- reCAPTCHA v3 no tiene un widget visible, solo un mensaje de validación si falla -->
      <div class="form-group recaptcha-group">
        <p v-if="formSubmitted && !recaptchaToken" class="validation-error">
          La verificación de reCAPTCHA ha fallado.
        </p>
      </div>

      <div class="button-group">
        <button
            type="submit"
            class="continue-btn btn-blue"
            :disabled="!isFormReadyToSubmit || isLoading"
        >
          {{ isLoading ? 'Enviando...' : 'Enviar' }}
        </button>
        <button
            type="button"
            class="continue-btn btn-white"
            @click="$emit('cancel')"
        >
          Cancelar
        </button>
      </div>
    </form>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script>
import { reactive, ref, computed, onUnmounted } from 'vue';
import { apiService } from '../../services/apiService';

export default {
  name: 'RegisterForm',
  emits: ['register-success', 'cancel'],
  setup(props, { emit }) {
    const form = reactive({ firstName: '', email: '' });
    const termsAccepted = ref(false);
    const isLoading = ref(false);
    const error = ref('');
    const formSubmitted = ref(false);

    // reCAPTCHA v3
    const recaptchaToken = ref(null);

    const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    if (!RECAPTCHA_SITE_KEY) {
      console.error("VITE_RECAPTCHA_SITE_KEY no está definida en el archivo .env");
      error.value = "Error de configuración: Clave de reCAPTCHA no encontrada.";
    }

    onUnmounted(() => {
      recaptchaToken.value = null;
    });

    const isFormReadyToSubmit = computed(() => {
      return (
          form.firstName.trim() !== '' &&
          form.email.trim() !== '' &&
          termsAccepted.value
      );
    });

    const submitRegister = async () => {
      error.value = '';
      if (!isFormReadyToSubmit.value) {
        error.value = 'Por favor, completa el nombre, correo y acepta los términos.';
        return;
      }

      isLoading.value = true;
      formSubmitted.value = true;

      try {
        // Ejecutar reCAPTCHA v3 para obtener un token
        const token = await new Promise((resolve, reject) => {
          if (typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function') {
            window.grecaptcha.ready(() => {
              window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'REGISTER' })
                  .then(resolve)
                  .catch(reject);
            });
          } else {
            reject(new Error("reCAPTCHA API no está disponible para ejecución."));
          }
        });

        recaptchaToken.value = token;

        if (!recaptchaToken.value) {
          error.value = 'No se pudo obtener el token de reCAPTCHA. Por favor, inténtalo de nuevo.';
          isLoading.value = false;
          return;
        }

        await apiService.auth.registerStart({
          firstName: form.firstName,
          email: form.email,
          recaptchaToken: recaptchaToken.value,
          action: 'REGISTER'
        });
        emit('register-success', { name: form.firstName, email: form.email });
      } catch (err) {
        console.error("Error al registrar:", err);
        error.value = err.message || 'Ocurrió un error al procesar la solicitud.';
        recaptchaToken.value = null;
      } finally {
        isLoading.value = false;
      }
    };

    return {
      form,
      termsAccepted,
      isLoading,
      error,
      isFormReadyToSubmit,
      submitRegister,
      recaptchaToken,
      formSubmitted,
    };
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #444;
}

input[type="text"],
input[type="email"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #002855;
}

/* Estilos para el checkbox */
.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: -0.5rem;
  margin-bottom: 1.5rem;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.checkbox-group .checkbox-label {
  display: inline;
  margin-bottom: 0;
  font-weight: normal;
  color: #555;
}

.checkbox-group .checkbox-label a {
  color: #002855;
  text-decoration: underline;
}

.checkbox-group .checkbox-label a:hover {
  text-decoration: none;
}

/* Estilos para reCAPTCHA v3 (no hay widget visible) */
.recaptcha-group {
  margin-bottom: 1.5rem;
}

.validation-error {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  text-align: center;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
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

.btn-blue:hover:not(:disabled) {
  background-color: #001a3b;
}

.btn-blue:disabled {
  background-color: #a0c4ff;
  border-color: #a0c4ff;
  cursor: not-allowed;
}

.btn-white {
  background-color: white;
  color: #002855;
}

.btn-white:hover {
  background-color: #f0f0f0;
}

.error-message {
  color: #d9534f;
  background-color: #f9dede;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
