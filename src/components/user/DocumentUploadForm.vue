<template>
  <div class="document-upload-inner">
    <h2>Carga de Documentos Oficiales</h2>
    <p class="instruction-text">Aquí podrás subir tus documentos (DNI, Pasaporte, etc.) para la validación de tu identidad (KYC).</p>

    <div v-if="loadingInitialData" class="loading-message">Cargando tipos de documentos y documentos subidos...</div>
    <p v-if="initialError" class="error-message">{{ initialError }}</p>

    <div v-if="!loadingInitialData && !initialError" class="document-sections-container">
      <!-- Sección para Certificado de CURP -->
      <div class="document-section">
        <h3>Certificado de CURP</h3>
        <div class="document-preview-area">
          <template v-if="documentsState.CURP_CERTIFICATE.uploadedDoc">
            <a :href="documentsState.CURP_CERTIFICATE.uploadedDoc.fileUrl" target="_blank" rel="noopener noreferrer">
              <img v-if="isImage(documentsState.CURP_CERTIFICATE.uploadedDoc.mimeType)"
                   :src="documentsState.CURP_CERTIFICATE.uploadedDoc.fileUrl"
                   alt="CURP Preview" class="uploaded-image-preview">
              <span v-else class="uploaded-file-icon">📄 PDF Subido</span>
            </a>
            <span :class="['status-badge', documentsState.CURP_CERTIFICATE.uploadedDoc.status]">
              {{ documentsState.CURP_CERTIFICATE.uploadedDoc.status }}
            </span>
          </template>
          <img v-else src="https://placehold.co/150x100/e0e0e0/002855?text=CURP" alt="CURP Placeholder" class="placeholder-image">
        </div>

        <div class="upload-area-small">
          <label :for="`file-CURP_CERTIFICATE`" class="upload-button">
            {{ documentsState.CURP_CERTIFICATE.uploadedDoc ? 'Reemplazar' : (documentsState.CURP_CERTIFICATE.selectedFile ? documentsState.CURP_CERTIFICATE.selectedFile.name : 'Seleccionar Archivo') }}
          </label>
          <input type="file" :id="`file-CURP_CERTIFICATE`" @change="handleFileUpload($event, 'CURP_CERTIFICATE')" accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
          <button
              @click="uploadDocument('CURP_CERTIFICATE')"
              :disabled="!documentsState.CURP_CERTIFICATE.selectedFile || documentsState.CURP_CERTIFICATE.isUploading"
              class="continue-btn btn-blue upload-action-btn-small"
          >
            {{ documentsState.CURP_CERTIFICATE.isUploading ? 'Subiendo...' : 'Subir CURP' }}
          </button>
        </div>
        <p v-if="documentsState.CURP_CERTIFICATE.uploadError" class="error-message">{{ documentsState.CURP_CERTIFICATE.uploadError }}</p>
        <p v-if="documentsState.CURP_CERTIFICATE.uploadSuccess" class="success-message">{{ documentsState.CURP_CERTIFICATE.uploadSuccess }}</p>
      </div>

      <!-- Sección para Credencial de Elector (INE) - Frente -->
      <div class="document-section-inline-wrapper">
        <div class="document-section document-section-inline">
          <h3>INE - Frente</h3>
          <div class="document-preview-area">
            <template v-if="documentsState.INE_FRONT.uploadedDoc">
              <a :href="documentsState.INE_FRONT.uploadedDoc.fileUrl" target="_blank" rel="noopener noreferrer">
                <img :src="documentsState.INE_FRONT.uploadedDoc.fileUrl" alt="INE Frente Preview" class="uploaded-image-preview">
              </a>
              <span :class="['status-badge', documentsState.INE_FRONT.uploadedDoc.status]">
                {{ documentsState.INE_FRONT.uploadedDoc.status }}
              </span>
            </template>
            <img v-else src="https://placehold.co/150x100/e0e0e0/002855?text=INE+Frente" alt="INE Frente Placeholder" class="placeholder-image">
          </div>

          <div class="upload-area-small">
            <label :for="`file-INE_FRONT`" class="upload-button">
              {{ documentsState.INE_FRONT.uploadedDoc ? 'Reemplazar' : (documentsState.INE_FRONT.selectedFile ? documentsState.INE_FRONT.selectedFile.name : 'Seleccionar Archivo') }}
            </label>
            <input type="file" :id="`file-INE_FRONT`" @change="handleFileUpload($event, 'INE_FRONT')" accept=".jpg,.jpeg,.png" style="display: none;">
            <button
                @click="uploadDocument('INE_FRONT')"
                :disabled="!documentsState.INE_FRONT.selectedFile || documentsState.INE_FRONT.isUploading"
                class="continue-btn btn-blue upload-action-btn-small"
            >
              {{ documentsState.INE_FRONT.isUploading ? 'Subiendo...' : 'Subir Frente' }}
            </button>
          </div>
          <p v-if="documentsState.INE_FRONT.uploadError" class="error-message">{{ documentsState.INE_FRONT.uploadError }}</p>
          <p v-if="documentsState.INE_FRONT.uploadSuccess" class="success-message">{{ documentsState.INE_FRONT.uploadSuccess }}</p>
        </div>


        <!-- Sección para Credencial de Elector (INE) - Reverso -->
        <div class="document-section document-section-inline">
          <h3>INE - Reverso</h3>
          <div class="document-preview-area">
            <template v-if="documentsState.INE_BACK.uploadedDoc">
              <a :href="documentsState.INE_BACK.uploadedDoc.fileUrl" target="_blank" rel="noopener noreferrer">
                <img :src="documentsState.INE_BACK.uploadedDoc.fileUrl" alt="INE Reverso Preview" class="uploaded-image-preview">
              </a>
              <span :class="['status-badge', documentsState.INE_BACK.uploadedDoc.status]">
                {{ documentsState.INE_BACK.uploadedDoc.status }}
              </span>
            </template>
            <img v-else src="https://placehold.co/150x100/e0e0e0/002855?text=INE+Reverso" alt="INE Reverso Placeholder" class="placeholder-image">
          </div>

          <div class="upload-area-small">
            <label :for="`file-INE_BACK`" class="upload-button">
              {{ documentsState.INE_BACK.uploadedDoc ? 'Reemplazar' : (documentsState.INE_BACK.selectedFile ? documentsState.INE_BACK.selectedFile.name : 'Seleccionar Archivo') }}
            </label>
            <input type="file" :id="`file-INE_BACK`" @change="handleFileUpload($event, 'INE_BACK')" accept=".jpg,.jpeg,.png" style="display: none;">
            <button
                @click="uploadDocument('INE_BACK')"
                :disabled="!documentsState.INE_BACK.selectedFile || documentsState.INE_BACK.isUploading"
                class="continue-btn btn-blue upload-action-btn-small"
            >
              {{ documentsState.INE_BACK.isUploading ? 'Subiendo...' : 'Subir Reverso' }}
            </button>
          </div>
          <p v-if="documentsState.INE_BACK.uploadError" class="error-message">{{ documentsState.INE_BACK.uploadError }}</p>
          <p v-if="documentsState.INE_BACK.uploadSuccess" class="success-message">{{ documentsState.INE_BACK.uploadSuccess }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import { apiService } from '../../services/apiService';

export default {
  name: 'DocumentUploadForm',
  setup() {
    const loadingInitialData = ref(true);
    const initialError = ref('');

    const apiDocumentTypeIds = reactive({});

    const documentsState = reactive({
      CURP_CERTIFICATE: {
        id: null,
        name: 'Certificado de CURP',
        code: 'CURP_CERTIFICATE',
        selectedFile: null,
        isUploading: false,
        uploadError: '',
        uploadSuccess: '',
        uploadedDoc: null,
        allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        accept: '.pdf,.jpg,.jpeg,.png'
      },
      INE_FRONT: {
        id: null,
        name: 'Credencial de Elector (INE) - Frente',
        code: 'INE_FRONT',
        selectedFile: null,
        isUploading: false,
        uploadError: '',
        uploadSuccess: '',
        uploadedDoc: null,
        allowedFileTypes: ['image/jpeg', 'image/png'],
        accept: '.jpg,.jpeg,.png'
      },
      INE_BACK: {
        id: null,
        name: 'Credencial de Elector (INE) - Reverso',
        code: 'INE_BACK',
        selectedFile: null,
        isUploading: false,
        uploadError: '',
        uploadSuccess: '',
        uploadedDoc: null,
        allowedFileTypes: ['image/jpeg', 'image/png'],
        accept: '.jpg,.jpeg,.png'
      },
    });

    const MAX_FILE_SIZE_MB = 5;

    const loadDocumentTypes = async () => {
      try {
        const response = await apiService.documents.getAvailableDocumentTypes();
        response.forEach(docType => {
          if (documentsState[docType.code]) {
            documentsState[docType.code].id = docType.id;
            apiDocumentTypeIds[docType.code] = docType.id;
          }
        });
      } catch (error) {
        console.error("Error al obtener tipos de documentos:", error);
        initialError.value = error.message || 'No se pudieron cargar los tipos de documentos.';
      }
    };

    const loadUploadedDocuments = async () => {
      try {
        const response = await apiService.documents.getUserDocuments();
        response.forEach(uploadedDoc => {
          if (documentsState[uploadedDoc.documentType.code]) {
            documentsState[uploadedDoc.documentType.code].uploadedDoc = uploadedDoc;
          }
        });
      } catch (error) {
        console.error("Error al obtener documentos subidos:", error);
        initialError.value = initialError.value ? initialError.value + "; " + error.message : error.message || 'No se pudieron cargar los documentos subidos.';
      }
    };

    onMounted(async () => {
      loadingInitialData.value = true;
      initialError.value = '';
      await loadDocumentTypes();
      await loadUploadedDocuments();
      loadingInitialData.value = false;
    });

    const handleFileUpload = (event, docCode) => {
      const docTypeState = documentsState[docCode];
      docTypeState.uploadError = '';
      docTypeState.uploadSuccess = '';
      const file = event.target.files[0];

      if (file) {
        if (!docTypeState.allowedFileTypes.includes(file.type)) {
          docTypeState.uploadError = `Tipo de archivo no permitido: ${file.name}. Solo se aceptan ${docTypeState.allowedFileTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}.`;
          docTypeState.selectedFile = null;
          return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          docTypeState.uploadError = `El archivo ${file.name} excede el tamaño máximo de ${MAX_FILE_SIZE_MB} MB.`;
          docTypeState.selectedFile = null;
          return;
        }
        docTypeState.selectedFile = file;
      } else {
        docTypeState.selectedFile = null;
      }
      event.target.value = '';
    };

    const uploadDocument = async (docCode) => {
      const docTypeState = documentsState[docCode];
      docTypeState.isUploading = true;
      docTypeState.uploadError = '';
      docTypeState.uploadSuccess = '';

      if (!docTypeState.selectedFile) {
        docTypeState.uploadError = 'Por favor, selecciona un archivo.';
        docTypeState.isUploading = false;
        return;
      }
      if (!docTypeState.id) {
        docTypeState.uploadError = 'Error: ID de tipo de documento no encontrado.';
        docTypeState.isUploading = false;
        return;
      }

      const formData = new FormData();
      formData.append('documentTypeId', docTypeState.id);
      formData.append('file', docTypeState.selectedFile);

      try {
        await apiService.documents.uploadDocument(formData);
        docTypeState.uploadSuccess = 'Documento subido exitosamente para revisión.';

        docTypeState.selectedFile = null;
        await loadUploadedDocuments();
      } catch (err) {
        console.error(`Error al subir ${docCode}:`, err);
        docTypeState.uploadError = err.message || 'Ocurrió un error al subir el documento.';
      } finally {
        docTypeState.isUploading = false;
      }
    };

    const isImage = (mimeType) => {
      return mimeType && mimeType.startsWith('image/');
    };

    return {
      loadingInitialData,
      initialError,
      documentsState,
      handleFileUpload,
      uploadDocument,
      isImage
    };
  }
};
</script>

<style scoped>
.document-upload-inner {
  margin-top: 0;
  text-align: center;
}

h2 {
  font-size: 1.5rem;
  color: #002855;
  margin-bottom: 1.5rem;
  margin-top: 0;
}

.instruction-text {
  color: #555;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  margin-top: 0;
}

.loading-message, .initial-error {
  padding: 1rem;
  background-color: #e0f7fa;
  color: #007bff;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
.initial-error {
  background-color: #f9dede;
  color: #d9534f;
}

.document-sections-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 2rem;
}

.document-section {
  flex: 1 1 100%;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.document-section-inline-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  width: 100%;
  justify-content: center;
}

.document-section-inline {
  flex: 1 1 calc(50% - 0.75rem);
  min-width: 280px;
}

@media (max-width: 768px) {
  .document-section-inline {
    flex: 1 1 100%;
  }
}


.document-section h3 {
  font-size: 1.2rem;
  color: #002855;
  margin-bottom: 1rem;
}

.document-preview-area {
  width: 100%;
  height: 150px;
  background-color: #e9ecef;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  position: relative;
}

.placeholder-image, .uploaded-image-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.uploaded-file-icon {
  font-size: 1rem;
  color: #002855;
  font-weight: bold;
}

.status-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 0.3rem 0.6rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: bold;
  color: white;
  text-transform: capitalize;
  z-index: 10;
}
.status-badge.pending { background-color: #ffc107; color: #333; }
.status-badge.approved { background-color: #28a745; }
.status-badge.rejected { background-color: #dc3545; }


.form-group {
  width: 100%;
  margin-bottom: 1rem;
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

.upload-area-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;
}

.upload-button {
  background-color: #002855;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  width: 100%;
  text-align: center;
  font-size: 0.9rem;
}

.upload-button:hover {
  background-color: #001a3b;
}

.upload-action-btn-small {
  width: 100%;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  border-radius: 20px;
}

.error-message {
  color: #d9534f;
  background-color: #f9dede;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
  width: 100%;
}

.success-message {
  color: #28a745;
  background-color: #d4edda;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
  width: 100%;
}
</style>