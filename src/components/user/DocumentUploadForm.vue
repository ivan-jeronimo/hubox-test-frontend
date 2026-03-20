<template>
  <div class="document-upload-inner">
    <h2>Carga de Documentos Oficiales</h2>
    <p class="instruction-text">Aquí podrás subir tus documentos (DNI, Pasaporte, etc.) para la validación de tu identidad (KYC).</p>

    <p v-if="initialError" class="error-message">{{ initialError }}</p>

    <div class="document-sections-container">
      <!-- Sección para Certificado de CURP -->
      <DocumentUploadSection
        :docTypeData="documentsState.CURP_CERTIFICATE"
        :is-loading="loadingInitialData"
        @file-selected="handleFileSelected"
        @upload-requested="uploadDocument"
      />

      <!-- Sección para Credencial de Elector (INE) - Frente y Reverso -->
      <div class="document-section-inline-wrapper">
        <!-- INE - Frente -->
        <DocumentUploadSection
          :docTypeData="documentsState.INE_FRONT"
          :is-loading="loadingInitialData"
          :is-inline="true"
          @file-selected="handleFileSelected"
          @upload-requested="uploadDocument"
        />

        <!-- INE - Reverso -->
        <DocumentUploadSection
          :docTypeData="documentsState.INE_BACK"
          :is-loading="loadingInitialData"
          :is-inline="true"
          @file-selected="handleFileSelected"
          @upload-requested="uploadDocument"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import { apiService } from '../../services/apiService';
import DocumentUploadSection from './DocumentUploadSection.vue'; // Importar el nuevo componente de sección

export default {
  name: 'DocumentUploadForm',
  components: {
    DocumentUploadSection, // Registrar el componente de sección
  },
  setup() {
    const loadingInitialData = ref(true);
    const initialError = ref('');

    const apiDocumentTypeIds = reactive({}); // Para mapear códigos a IDs de la API

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

    // Función para cargar los tipos de documentos de la API
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

    // Función para cargar los documentos ya subidos por el usuario
    const loadUploadedDocuments = async () => {
      try {
        const response = await apiService.documents.getUserDocuments();
        // Limpiar uploadedDoc de todos los estados antes de rellenar
        Object.values(documentsState).forEach(state => {
          state.uploadedDoc = null;
        });
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

    const handleFileSelected = ({ code, file }) => {
      const docTypeState = documentsState[code];
      docTypeState.uploadError = '';
      docTypeState.uploadSuccess = '';

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
        await loadUploadedDocuments(); // Recargar la lista completa para actualizar el estado
      } catch (err) {
        console.error(`Error al subir ${docCode}:`, err);
        docTypeState.uploadError = err.message || 'Ocurrió un error al subir el documento.';
      } finally {
        docTypeState.isUploading = false;
      }
    };

    return {
      loadingInitialData,
      initialError,
      documentsState,
      handleFileSelected, // Renombrado para el evento
      uploadDocument,
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
  text-align: center; /* Añadido para centrar el texto */
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

.document-section-inline-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  width: 100%; /* Ocupa todo el ancho para contener los dos INE */
  justify-content: center;
}

/* Media Queries para Responsividad */

/* Para tabletas */
@media (max-width: 768px) {
  h2 {
    font-size: 1.3rem;
  }
}

/* Para móviles */
@media (max-width: 480px) {
  h2 {
    font-size: 1.2rem;
  }
}
</style>
