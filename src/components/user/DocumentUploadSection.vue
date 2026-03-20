<template>
  <div :class="['document-section', { 'document-section-inline': isInline }]">
    <h3>{{ docTypeData.name }}</h3>
    <DocumentUploadSectionSkeleton v-if="isLoading" />
    <div v-else class="document-section-content">
      <div class="document-preview-area">
        <template v-if="docTypeData.uploadedDoc">
          <a :href="docTypeData.uploadedDoc.fileUrl" target="_blank" rel="noopener noreferrer">
            <img v-if="isImage(docTypeData.uploadedDoc.mimeType)"
                 :src="docTypeData.uploadedDoc.fileUrl"
                 :alt="`${docTypeData.name} Preview`" class="uploaded-image-preview">
            <div v-else class="uploaded-file-info">
              <span class="file-icon">📄</span>
              <p class="file-name">{{ docTypeData.uploadedDoc.fileName }}</p>
            </div>
          </a>
          <span :class="['status-badge', docTypeData.uploadedDoc.status]">
            {{ translatedStatus(docTypeData.uploadedDoc.status) }}
          </span>
        </template>
        <img v-else :src="placeholderImage" :alt="`${docTypeData.name} Placeholder`" class="placeholder-image">
      </div>

      <div v-if="isUploadAllowed" class="upload-area-small">
        <label :for="`file-${docTypeData.code}`" class="upload-button">
          {{ docTypeData.uploadedDoc ? 'Reemplazar' : (docTypeData.selectedFile ? docTypeData.selectedFile.name : 'Seleccionar Archivo') }}
        </label>
        <input type="file" :id="`file-${docTypeData.code}`" @change="handleFileUpload" :accept="docTypeData.accept" style="display: none;">
        <button
            @click="uploadDocument"
            :disabled="!docTypeData.selectedFile || docTypeData.isUploading"
            class="continue-btn btn-blue upload-action-btn-small"
        >
          {{ docTypeData.isUploading ? 'Subiendo...' : `Subir ${docTypeData.name.split(' ')[0]}` }}
        </button>
      </div>
      <div v-else class="upload-disabled-message">
        <p>No se puede reemplazar un documento que está '{{ translatedStatus(docTypeData.uploadedDoc.status) }}'.</p>
      </div>

      <p v-if="docTypeData.uploadError" class="error-message">{{ docTypeData.uploadError }}</p>
      <p v-if="docTypeData.uploadSuccess" class="success-message">{{ docTypeData.uploadSuccess }}</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import DocumentUploadSectionSkeleton from './DocumentUploadSectionSkeleton.vue';

export default {
  name: 'DocumentUploadSection',
  components: {
    DocumentUploadSectionSkeleton
  },
  props: {
    docTypeData: {
      type: Object,
      required: true
    },
    isInline: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['file-selected', 'upload-requested'],
  setup(props, { emit }) {
    const placeholderImage = computed(() => {
      switch (props.docTypeData.code) {
        case 'CURP_CERTIFICATE': return 'https://placehold.co/150x100/e0e0e0/002855?text=CURP';
        case 'INE_FRONT': return 'https://placehold.co/150x100/e0e0e0/002855?text=INE+Frente';
        case 'INE_BACK': return 'https://placehold.co/150x100/e0e0e0/002855?text=INE+Reverso';
        default: return 'https://placehold.co/150x100/e0e0e0/002855?text=Documento';
      }
    });

    const isUploadAllowed = computed(() => {
      if (!props.docTypeData.uploadedDoc) {
        return true; // No hay documento, se permite subir.
      }
      return props.docTypeData.uploadedDoc.status === 'rejected';
    });

    const statusTranslations = {
      approved: 'Aprobado',
      pending: 'Pendiente',
      rejected: 'Rechazado'
    };

    const translatedStatus = (status) => {
      return statusTranslations[status] || status;
    };

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      emit('file-selected', { code: props.docTypeData.code, file });
      event.target.value = '';
    };

    const uploadDocument = () => {
      emit('upload-requested', props.docTypeData.code);
    };

    const isImage = (mimeType) => {
      return mimeType && mimeType.startsWith('image/');
    };

    return {
      placeholderImage,
      isUploadAllowed,
      translatedStatus,
      handleFileUpload,
      uploadDocument,
      isImage
    };
  }
};
</script>

<style scoped>
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

.document-section-inline {
  flex: 1 1 calc(50% - 0.75rem);
  min-width: 280px;
}

@media (max-width: 768px) {
  .document-section-inline {
    flex: 1 1 100%;
  }
}

h3 {
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

.uploaded-file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  text-align: center;
  color: #002855;
}

.file-icon {
  font-size: 3rem;
  line-height: 1;
  margin-bottom: 5px;
}

.file-name {
  font-size: 0.9rem;
  font-weight: bold;
  word-break: break-all;
  margin: 0;
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

.upload-disabled-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  color: #6c757d;
  font-size: 0.9rem;
  width: 100%;
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
