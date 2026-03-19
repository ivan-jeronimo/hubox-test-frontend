<template>
  <div class="fade-in">
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

      <div class="button-group">
        <button
          type="submit"
          class="continue-btn btn-blue"
          :disabled="!isValid || isLoading"
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
import { reactive, ref, computed } from 'vue';
import { apiService } from '../../services/apiService'; // Importar el objeto apiService

export default {
  name: 'RegisterForm',
  emits: ['register-success', 'cancel'],
  setup(props, { emit }) {
    const form = reactive({ name: '', email: '' });
    const isLoading = ref(false);
    const error = ref('');

    const isValid = computed(() => {
      return form.name.trim() !== '' && form.email.trim() !== '';
    });

    const submitRegister = async () => {
      isLoading.value = true;
      error.value = '';

      try {
        // Usar apiService.auth.registerStart con el payload completo
        await apiService.auth.registerStart(form);
        emit('register-success', { name: form.name, email: form.email });
      } catch (err) {
        console.error("Error al registrar:", err);
        error.value = err.message || 'Ocurrió un error al procesar la solicitud.';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      form,
      isLoading,
      error,
      isValid,
      submitRegister
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
  border-color: #002855;
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
