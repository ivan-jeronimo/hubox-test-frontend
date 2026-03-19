<template>
  <div class="fade-in">
    <p class="instruction-text">Hemos enviado un código de verificación a <strong>{{ email }}</strong>.</p>

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

      <div class="button-group">
        <button
          type="submit"
          class="continue-btn btn-blue"
          :disabled="otpCode.length !== 6 || isLoading"
        >
          {{ isLoading ? 'Verificando...' : 'Verificar Código' }}
        </button>
      </div>
    </form>

    <div class="resend-section">
      <p v-if="resendTimer > 0" class="timer-text">
        Podrás reenviar el correo en {{ resendTimer }} segundos.
      </p>
      <button
        v-else
        class="btn-text"
        @click="resendEmail"
        :disabled="isResending"
      >
        {{ isResending ? 'Reenviando...' : 'Reenviar correo' }}
      </button>
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { apiService } from '../../services/apiService'; // Importar el objeto apiService

export default {
  name: 'OtpVerification',
  props: {
    email: {
      type: String,
      required: true
    },
    firstName: { // Cambiado de 'name' a 'firstName'
      type: String,
      required: true
    }
  },
  emits: ['verification-success'],
  setup(props, { emit }) {
    const otpCode = ref('');
    const isLoading = ref(false);
    const isResending = ref(false);
    const error = ref('');
    const successMessage = ref('');

    const resendTimer = ref(0);
    let timerInterval = null;

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

    onMounted(() => {
      startResendTimer();
    });

    onUnmounted(() => {
      if (timerInterval) clearInterval(timerInterval);
    });

    const submitOtp = async () => {
      isLoading.value = true;
      error.value = '';
      successMessage.value = '';

      try {
        // Usar apiService.auth.verifyEmailCode
        const data = await apiService.auth.verifyEmailCode({
          email: props.email,
          code: otpCode.value
        });
        successMessage.value = '¡Cuenta verificada exitosamente!';
        emit('verification-success', data);
      } catch (err) {
        console.error("Error de verificación OTP:", err);
        error.value = err.message || 'Código inválido o expirado.';
      } finally {
        isLoading.value = false;
      }
    };

    const resendEmail = async () => {
      isResending.value = true;
      error.value = '';
      successMessage.value = '';

      try {
        // Usar apiService.auth.registerStart para reenviar
        await apiService.auth.registerStart({ firstName: props.firstName, email: props.email }); // Enviar firstName
        successMessage.value = 'Nuevo código enviado exitosamente.';
        startResendTimer();
        setTimeout(() => successMessage.value = '', 3000);
      } catch (err) {
        console.error("Error al reenviar correo:", err);
        error.value = err.message || 'Error al reenviar el correo.';
      } finally {
        isResending.value = false;
      }
    };

    return {
      otpCode,
      isLoading,
      isResending,
      error,
      successMessage,
      resendTimer,
      submitOtp,
      resendEmail
    };
  }
};
</script>

<style scoped>
.instruction-text {
  color: #555;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  text-align: center;
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
  font-size: 1.2rem;
  box-sizing: border-box;
  text-align: center;
  letter-spacing: 0.5rem;
  transition: border-color 0.2s;
  color: #333; /* Aseguramos un color de texto oscuro */
  background-color: #ffffff; /* Aseguramos un fondo blanco */
}

input:focus {
  outline: none;
  border-color: #002855;
}

/* Estilos de botones consistentes */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
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

.btn-text {
  background: none;
  border: none;
  color: #002855;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0;
}

.btn-text:hover:not(:disabled) {
  color: #001a3b;
}

.btn-text:disabled {
  color: #aaa;
  cursor: not-allowed;
  text-decoration: none;
}

.resend-section {
  margin-top: 1.5rem;
  text-align: center;
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
  text-align: center;
}

.success-message {
  color: #28a745;
  background-color: #d4edda;
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
