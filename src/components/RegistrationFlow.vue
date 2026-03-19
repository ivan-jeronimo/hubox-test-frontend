<template>
  <div class="registration-container">
    <h1>Registro Nacional de Usuarios</h1>

    <!-- Paso 1: Pantalla Principal -->
    <div v-if="step === 'landing'">
      <button class="btn-primary" @click="step = 'register'">Registrarse</button>
    </div>

    <!-- Paso 2: Formulario de Registro -->
    <div v-else-if="step === 'register'" class="fade-in">
      <form @submit.prevent="submitRegister">
        <div class="form-group">
          <label for="name">Nombre Principal:</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Ej. Juan Perez"
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
        <button
          type="submit"
          class="btn-primary"
          :disabled="!isRegisterFormValid || isLoading"
        >
          {{ isLoading ? 'Enviando...' : 'Enviar' }}
        </button>
        <button
          type="button"
          class="btn-secondary mt-2"
          @click="step = 'landing'"
        >
          Cancelar
        </button>
      </form>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>

    <!-- Paso 3: Verificación de Código OTP -->
    <div v-else-if="step === 'otp'" class="fade-in">
      <p class="instruction-text">Hemos enviado un código de verificación a <strong>{{ form.email }}</strong>.</p>

      <form @submit.prevent="submitOtp">
        <div class="form-group">
          <label for="otp">Código de 6 dígitos:</label>
          <input
            id="otp"
            v-model="otpCode"
            type="text"
            maxlength="6"
            pattern="\d{6}"
            placeholder="123456"
            title="Debe ingresar 6 números"
            required
          />
        </div>
        <button
          type="submit"
          class="btn-primary"
          :disabled="otpCode.length !== 6 || isLoading"
        >
          {{ isLoading ? 'Verificando...' : 'Verificar Código' }}
        </button>
      </form>

      <div class="resend-section">
        <p v-if="resendTimer > 0" class="timer-text">
          Podrás reenviar el correo en {{ resendTimer }} segundos.
        </p>
        <button
          v-else
          class="btn-text"
          @click="resendEmail"
          :disabled="isLoading"
        >
          Reenviar correo
        </button>
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onUnmounted } from 'vue';

export default {
  name: 'RegistrationFlow',
  setup() {
    // Estado principal
    const step = ref('landing'); // Posibles estados: 'landing', 'register', 'otp'

    // Datos del formulario
    const form = reactive({
      name: '',
      email: ''
    });
    const otpCode = ref('');

    // Estados de UI
    const isLoading = ref(false);
    const error = ref('');
    const successMessage = ref('');

    // Temporizador
    const resendTimer = ref(0);
    let timerInterval = null;

    // Computed properties
    const isRegisterFormValid = computed(() => {
      return form.name.trim() !== '' && form.email.trim() !== '';
    });

    // Funciones de utilidad
    const startResendTimer = () => {
      resendTimer.value = 30;
      if (timerInterval) clearInterval(timerInterval);

      timerInterval = setInterval(() => {
        if (resendTimer.value > 0) {
          resendTimer.value--;
        } else {
          clearInterval(timerInterval);
        }
      }, 1000);
    };

    onUnmounted(() => {
      if (timerInterval) clearInterval(timerInterval);
    });

    // Métodos de API
    const submitRegister = async () => {
      isLoading.value = true;
      error.value = '';
      successMessage.value = '';

      try {
        const response = await fetch('http://localhost:8000/api/auth/register-start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(form)
        });

        const data = await response.json();

        if (response.ok) {
          step.value = 'otp';
          startResendTimer();
        } else {
          error.value = data.message || 'Ocurrió un error al procesar la solicitud.';
        }
      } catch (err) {
        // Fallback en caso de que la API no esté levantada, útil para pruebas locales
        console.error("Error de conexión:", err);
        error.value = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } finally {
        isLoading.value = false;
      }
    };

    const submitOtp = async () => {
      isLoading.value = true;
      error.value = '';
      successMessage.value = '';

      try {
        const response = await fetch('http://localhost:8000/api/auth/verify-email-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: form.email,
            code: otpCode.value
          })
        });

        const data = await response.json();

        if (response.ok) {
          successMessage.value = '¡Cuenta verificada exitosamente!';
          // Aquí posteriormente se puede guardar data.access_token en localStorage o cookies
          console.log('Token de acceso:', data.access_token);
        } else {
          error.value = data.message || 'Código inválido o expirado.';
        }
      } catch (err) {
        console.error("Error de conexión:", err);
        error.value = 'No se pudo conectar con el servidor.';
      } finally {
        isLoading.value = false;
      }
    };

    const resendEmail = async () => {
      // Reutilizamos la lógica de registro para reenviar el código
      await submitRegister();
      if (!error.value) {
        successMessage.value = 'Nuevo código enviado exitosamente.';
        setTimeout(() => successMessage.value = '', 3000);
      }
    };

    return {
      step,
      form,
      otpCode,
      isLoading,
      error,
      successMessage,
      resendTimer,
      isRegisterFormValid,
      submitRegister,
      submitOtp,
      resendEmail
    };
  }
};
</script>

<style scoped>
.registration-container {
  max-width: 450px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-align: center;
}

h1 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 2rem;
}

.instruction-text {
  color: #555;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

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

input {
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
  border-color: #007bff;
}

.btn-primary, .btn-secondary {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #a0c4ff;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e2e2e2;
}

.btn-text {
  background: none;
  border: none;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0;
}

.btn-text:hover:not(:disabled) {
  color: #0056b3;
}

.btn-text:disabled {
  color: #aaa;
  cursor: not-allowed;
  text-decoration: none;
}

.mt-2 {
  margin-top: 0.5rem;
}

.resend-section {
  margin-top: 1.5rem;
}

.timer-text {
  color: #666;
  font-size: 0.9rem;
}

.error-message {
  color: #d9534f;
  background-color: #f9dede;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.success-message {
  color: #28a745;
  background-color: #d4edda;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
