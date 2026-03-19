<template>
  <div class="document-upload-inner">
    <h2>Carga de Documentos Oficiales</h2>
    <p class="instruction-text">Aquí podrás subir tus documentos (DNI, Pasaporte, etc.) para la validación de tu identidad (KYC).</p>

    <div class="form-group">
      <label for="documentType">Tipo de Documento:</label>
      <select id="documentType" v-model="selectedDocumentTypeId" class="form-input">
        <option value="" disabled>Selecciona un tipo de documento</option>
        <option v-for="docType in documentTypes" :key="docType.id" :value="docType.id">
          {{ docType.name }}
        </option>
      </select>
      <p v-if="documentTypesError" class="error-message">{{ documentTypesError }}</p>
    </div>

    <div class="upload-area">
      <label for="document-input" class="upload-button">
        Seleccionar Archivo
      </label>
      <input type="file" id="document-input" @change="handleFileUpload" multiple accept=".pdf,.jpg,.jpeg,.png" style="display: none;">

      <div v-if="selectedFiles.length > 0" class="file-list">
        <h3>Archivos seleccionados:</h3>
        <ul>
          <li v-for="(file, index) in selectedFiles" :key="index">
            {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)
            <button @click="removeFile(index)" class="remove-file-btn">x</button>
          </li>
        </ul>
      </div>

      <p v-if="uploadError" class="error-message">{{ uploadError }}</p>
      <p v-if="uploadSuccess" class="success-message">{{ uploadSuccess }}</p>

      <button
        @click="uploadDocuments"
        :disabled="selectedFiles.length === 0 || !selectedDocumentTypeId || isUploading"
        class="continue-btn btn-blue upload-action-btn"
      >
        {{ isUploading ? 'Subiendo...' : 'Subir Documentos' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { apiService } from '../../services/apiService'; // Importar apiService

export default {
  name: 'DocumentUploadForm',
  setup() {
    const documentTypes = ref([]);
    const selectedDocumentTypeId = ref('');
    const documentTypesError = ref('');

    const selectedFiles = ref([]);
    const isUploading = ref(false);
    const uploadError = ref('');
    const uploadSuccess = ref('');

    // Cargar tipos de documentos al montar el componente
    onMounted(async () => {
      try {
        const response = await apiService.documents.getAvailableDocumentTypes();
        documentTypes.value = response;
      } catch (error) {
        console.error("Error al obtener tipos de documentos:", error);
        documentTypesError.value = error.message || 'No se pudieron cargar los tipos de documentos.';
      }
    });

    const handleFileUpload = (event) => {
      uploadError.value = '';
      uploadSuccess.value = '';
      const files = event.target.files;
      if (files.length > 0) {
        selectedFiles.value = [...selectedFiles.value, ...Array.from(files)];
      }
    };

    const removeFile = (index) => {
      selectedFiles.value.splice(index, 1);
    };

    const uploadDocuments = async () => {
      isUploading.value = true;
      uploadError.value = '';
      uploadSuccess.value = '';

      if (!selectedDocumentTypeId.value) {
        uploadError.value = 'Por favor, selecciona un tipo de documento.';
        isUploading.value = false;
        return;
      }
      if (selectedFiles.value.length === 0) {
        uploadError.value = 'Por favor, selecciona al menos un archivo.';
        isUploading.value = false;
        return;
      }

      console.log('Subiendo documentos:', selectedFiles.value, 'para tipo:', selectedDocumentTypeId.value);

      try {
        // Aquí se haría la llamada real a apiService.documents.uploadDocument(selectedDocumentTypeId.value, selectedFiles.value);
        // Por ahora, simularemos una llamada a la API
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simular carga

        uploadSuccess.value = 'Documentos subidos exitosamente. Pendientes de revisión.';
        selectedFiles.value = []; // Limpiar archivos después de subir
        selectedDocumentTypeId.value = ''; // Resetear selección
      } catch (err) {
        console.error("Error al subir documentos:", err);
        uploadError.value = err.message || 'Ocurrió un error al subir los documentos.';
      } finally {
        isUploading.value = false;
      }
    };

    return {
      documentTypes,
      selectedDocumentTypeId,
      documentTypesError,
      selectedFiles,
      isUploading,
      uploadError,
      uploadSuccess,
      handleFileUpload,
      removeFile,
      uploadDocuments
    };
  }
};
</script>

<style scoped>
/* Este componente ya no tiene estilos de caja, solo el contenido del formulario */
.document-upload-inner {
  margin-top: 0; /* Asegurarse de que no haya margen superior extra */
  text-align: center;
}

h2 {
  font-size: 1.5rem;
  color: #002855;
  margin-bottom: 1.5rem;
  margin-top: 0; /* Asegurar que no haya margen superior por defecto */
}

.instruction-text {
  color: #555;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  margin-top: 0; /* Asegurar que no haya margen superior por defecto */
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

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s, background-color 0.2s;
  color: #333;
  background-color: #ffffff;
}

.form-input:focus {
  outline: none;
  border-color: #002855;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-button {
  background-color: #002855;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background-color: #001a3b;
}

.file-list {
  margin-top: 1rem;
  width: 100%;
  text-align: left;
}

.file-list h3 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.file-list ul {
  list-style: none;
  padding: 0;
}

.file-list li {
  background-color: #f0f0f0;
  border: 1px solid #e0e0e0;
  padding: 0.5rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #333;
}

.remove-file-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.remove-file-btn:hover {
  background-color: #c82333;
}

.upload-action-btn {
  margin-top: 1.5rem;
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
</style>
