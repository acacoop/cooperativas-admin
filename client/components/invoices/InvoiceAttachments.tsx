import { useState } from 'react';
import { InvoiceAttachment } from '@/types';
import api from '@/utils/api';
import styles from './InvoiceAttachments.module.css';

interface InvoiceAttachmentsProps {
  invoiceId: number;
  attachments: InvoiceAttachment[];
  canUpload?: boolean;
  onAttachmentsChange?: () => void;
}

export const InvoiceAttachments = ({ 
  invoiceId, 
  attachments, 
  canUpload = false,
  onAttachmentsChange 
}: InvoiceAttachmentsProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setDescriptions(filesArray.map(() => ''));
      setError('');
    }
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = value;
    setDescriptions(newDescriptions);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Seleccione al menos un archivo');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });
      formData.append('descriptions', JSON.stringify(descriptions));

      await api.uploadAttachments(invoiceId, formData);
      
      // Reset
      setSelectedFiles([]);
      setDescriptions([]);
      
      // Notify parent
      if (onAttachmentsChange) {
        onAttachmentsChange();
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al subir adjuntos');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachmentId: number) => {
    try {
      const { blob, filename } = await api.downloadAttachment(invoiceId, attachmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      alert('Error al descargar el adjunto');
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (!confirm('¿Está seguro de eliminar este adjunto?')) {
      return;
    }

    try {
      await api.deleteAttachment(invoiceId, attachmentId);
      if (onAttachmentsChange) {
        onAttachmentsChange();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al eliminar adjunto');
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (mimeType?: string): string => {
    if (!mimeType) return '📎';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
    return '📎';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          📎 Documentación Adicional
          {attachments.length > 0 && (
            <span className={styles.count}>({attachments.length})</span>
          )}
        </h3>
      </div>

      {/* Lista de adjuntos existentes */}
      {attachments.length > 0 ? (
        <div className={styles.attachmentsList}>
          {attachments.map((attachment) => (
            <div key={attachment.id} className={styles.attachmentCard}>
              <div className={styles.attachmentIcon}>
                {getFileIcon(attachment.mime_type)}
              </div>
              <div className={styles.attachmentInfo}>
                <div className={styles.attachmentName}>
                  {attachment.original_filename}
                </div>
                {attachment.description && (
                  <div className={styles.attachmentDescription}>
                    {attachment.description}
                  </div>
                )}
                <div className={styles.attachmentMeta}>
                  <span>{formatFileSize(attachment.file_size)}</span>
                  {attachment.created_at && (
                    <span>
                      • {new Date(attachment.created_at).toLocaleDateString('es-AR')}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.attachmentActions}>
                <button
                  onClick={() => handleDownload(attachment.id!)}
                  className={styles.btnDownload}
                  title="Descargar"
                >
                  📥
                </button>
                {canUpload && (
                  <button
                    onClick={() => handleDelete(attachment.id!)}
                    className={styles.btnDelete}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📭</span>
          <p>No hay documentos adicionales adjuntos</p>
        </div>
      )}

      {/* Formulario de upload (solo para proveedores) */}
      {canUpload && (
        <div className={styles.uploadSection}>
          <div className={styles.uploadHeader}>
            <h4>➕ Agregar Documentos</h4>
            <p className={styles.uploadHint}>
              Puede adjuntar remitos, órdenes de compra, albaranes, etc.
            </p>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.fileInput}>
            <input
              type="file"
              id={`attachments-${invoiceId}`}
              multiple
              onChange={handleFileSelect}
              className={styles.hiddenInput}
              disabled={uploading}
            />
            <label htmlFor={`attachments-${invoiceId}`} className={styles.fileLabel}>
              {selectedFiles.length === 0 ? (
                <>📎 Seleccionar Archivos</>
              ) : (
                <>{selectedFiles.length} archivo(s) seleccionado(s)</>
              )}
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className={styles.selectedFiles}>
              {selectedFiles.map((file, index) => (
                <div key={index} className={styles.selectedFile}>
                  <div className={styles.selectedFileInfo}>
                    <span className={styles.selectedFileIcon}>
                      {getFileIcon(file.type)}
                    </span>
                    <span className={styles.selectedFileName}>
                      {file.name}
                    </span>
                    <span className={styles.selectedFileSize}>
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Descripción (opcional)"
                    value={descriptions[index] || ''}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    className={styles.descriptionInput}
                    disabled={uploading}
                  />
                </div>
              ))}

              <button
                onClick={handleUpload}
                disabled={uploading}
                className={styles.btnUpload}
              >
                {uploading ? (
                  <>
                    <span className="spinner-aca"></span>
                    Subiendo...
                  </>
                ) : (
                  <>📤 Subir Documentos</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceAttachments;
