<template>
  <div class="profile-form-inner">
    <h2>Datos Personales</h2>
    <form @submit.prevent="submitProfile">
      <!-- Campos de solo lectura para nombre y email -->
      <div class="form-group">
        <label for="firstName">Nombre:</label>
        <input
          id="firstName"
          :value="initialUserData.firstName"
          type="text"
          readonly
          class="form-input readonly-input"
        />
      </div>
      <div class="form-group">
        <label for="paternalSurname">Apellido Paterno:</label>
        <input
          id="paternalSurname"
          v-model="form.paternalSurname"
          type="text"
          placeholder="Ej. García"
          maxlength="50"
          class="form-input"
          required
        />
      </div>
      <div class="form-group">
        <label for="maternalSurname">Apellido Materno:</label>
        <input
          id="maternalSurname"
          v-model="form.maternalSurname"
          type="text"
          placeholder="Ej. López (Opcional)"
          maxlength="50"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="email">Correo Electrónico:</label>
        <input
          id="email"
          :value="initialUserData.email"
          type="email"
          readonly
          class="form-input readonly-input"
        />
      </div>

      <!-- Campos editables -->
      <div class="form-group">
        <label for="phone">Teléfono:</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          placeholder="+525512345678"
          maxlength="20"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="curp">CURP:</label>
        <input
          id="curp"
          v-model="form.curp"
          type="text"
          placeholder="ABCD123456GHIJKLMN01"
          maxlength="18"
          class="form-input"
          :class="{ 'is-invalid': !isCurpValid && form.curp.length > 0 }"
        />
        <p v-if="!isCurpValid && form.curp.length > 0" class="validation-error">
          Formato de CURP inválido (ej. ABCD123456GHIJKLMN01)
        </p>
      </div>
      <div class="form-group">
        <label for="date_of_birth">Fecha de Nacimiento:</label>
        <input
          id="date_of_birth"
          v-model="form.date_of_birth"
          type="date"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="address">Dirección:</label>
        <textarea
          id="address"
          v-model="form.address"
          placeholder="Calle Falsa 123, Colonia Centro, Ciudad de México"
          maxlength="255"
          class="form-input"
        ></textarea>
      </div>

      <div class="button-group">
        <button
          type="submit"
          class="continue-btn btn-blue"
          :disabled="isLoading || !isFormValid"
        >
          {{ isLoading ? 'Guardando...' : 'Guardar Perfil' }}
        </button>
      </div>
    </form>
    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
  </div>
</template>

<script>
import { reactive, ref, watchEffect, computed } from 'vue'; // Importar computed
import { apiService } from '../../services/apiService';
import { useAuthStore } from '../../stores/auth';

export default {
  name: 'ProfileForm',
  props: {
    initialUserData: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const authStore = useAuthStore();
    const form = reactive({
      paternalSurname: '',
      maternalSurname: '',
      phone: '',
      curp: '',
      date_of_birth: '',
      address: ''
    });
    const isLoading = ref(false);
    const error = ref('');
    const successMessage = ref('');

    // Expresión regular para validar CURP (18 caracteres alfanuméricos, formato estándar)
    // Fuente: https://regexr.com/3c0s3 (adaptada para ser más permisiva con letras y números)
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]{2}$/i;

    // Propiedad computada para validar el CURP
    const isCurpValid = computed(() => {
      // Si el campo está vacío, se considera válido (es opcional)
      if (!form.curp) return true;
      return curpRegex.test(form.curp);
    });

    // Propiedad computada para validar todo el formulario antes de enviar
    const isFormValid = computed(() => {
      // Apellido Paterno es requerido
      if (!form.paternalSurname.trim()) return false;
      // CURP debe ser válido si está presente
      if (form.curp && !isCurpValid.value) return false;
      // Aquí se pueden añadir más validaciones para otros campos si son requeridos
      return true;
    });

    watchEffect(() => {
      if (props.initialUserData) {
        form.paternalSurname = props.initialUserData.paternalSurname || '';
        form.maternalSurname = props.initialUserData.maternalSurname || '';

        form.phone = props.initialUserData.phone || '';
        form.curp = props.initialUserData.curp || '';
        form.date_of_birth = props.initialUserData.dateOfBirth ? new Date(props.initialUserData.dateOfBirth).toISOString().split('T')[0] : '';
        form.address = props.initialUserData.address || '';
      }
    });

    const submitProfile = async () => {
      isLoading.value = true;
      error.value = '';
      successMessage.value = '';

      // Si el formulario no es válido, detener el envío
      if (!isFormValid.value) {
        error.value = 'Por favor, corrige los errores en el formulario.';
        isLoading.value = false;
        return;
      }

      const payload = Object.fromEntries(
        Object.entries(form).filter(([, value]) => value !== '')
      );

      try {
        // Primero, enviar la actualización del perfil
        await apiService.user.updateProfile(payload);
        successMessage.value = 'Perfil de usuario actualizado exitosamente.';

        // Luego, obtener los datos actualizados del usuario
        const updatedUser = await apiService.user.getProfile();
        authStore.setUser(updatedUser); // Actualizar el store con los datos frescos

      } catch (err) {
        console.error("Error al actualizar perfil:", err);
        error.value = err.message || 'Ocurrió un error al actualizar el perfil.';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      form,
      isLoading,
      error,
      successMessage,
      isCurpValid, // Exportar para usar en el template
      isFormValid, // Exportar para deshabilitar el botón
      submitProfile
    };
  }
};
</script>

<style scoped>
/* Este componente ya no tiene estilos de caja, solo el contenido del formulario */
.profile-form-inner {
  margin-top: 0; /* Asegurarse de que no haya margen superior extra */
}

h2 {
  font-size: 1.5rem;
  color: #002855;
  margin-bottom: 1.5rem;
  text-align: center;
  margin-top: 0; /* Asegurar que no haya margen superior por defecto */
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #444;
}

/* Estilo base para todos los inputs y textareas con la clase form-input */
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s, background-color 0.2s;
  color: #333; /* Aseguramos un color de texto oscuro */
  background-color: #ffffff; /* Aseguramos un fondo blanco */
}

.form-input:focus {
  outline: none;
  border-color: #002855;
}

/* Estilo para inputs inválidos */
.form-input.is-invalid {
  border-color: #dc3545; /* Rojo */
}

/* Estilo específico para inputs de solo lectura */
.readonly-input {
  background-color: #f8f9fa; /* Gris muy claro */
  border-color: #e0e0e0; /* Borde ligeramente más claro */
  color: #666; /* Texto un poco más tenue */
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
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

.validation-error {
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}
</style>
