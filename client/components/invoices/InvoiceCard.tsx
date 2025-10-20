import { JSX, useState } from 'react';
import Link from 'next/link';
import { Invoice } from '@/types';
import api from '@/utils/api';
import styles from './InvoiceCard.module.css';

interface StatusBadgeConfig {
  color: string;
  text: string;
  desc: string;
}

interface InvoiceCardProps {
  invoice: Invoice;
  onResponse?: (id: number, action: 'aceptar' | 'rechazar', rejectionReason?: string) => Promise<void>;
  getStatusBadge: (status: string) => JSX.Element;
  variant?: 'cooperative' | 'supplier';
  actions?: React.ReactNode;
}

export function InvoiceCard({ 
  invoice, 
  onResponse, 
  getStatusBadge, 
  variant = 'cooperative',
  actions 
}: InvoiceCardProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [responding, setResponding] = useState(false);

  const handleAccept = async () => {
    if (!onResponse) return;
    setResponding(true);
    await onResponse(invoice.id!, 'aceptar');
    setResponding(false);
  };

  const handleReject = async () => {
    if (!onResponse) return;
    if (!rejectionReason.trim()) {
      alert('Debe especificar un motivo para el rechazo');
      return;
    }
    
    setResponding(true);
    await onResponse(invoice.id!, 'rechazar', rejectionReason);
    setResponding(false);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  const handleDownload = async () => {
    try {
      const { blob, filename } = await api.downloadInvoice(invoice.id!);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      alert(error.response?.data?.error || 'Error al descargar la factura');
    }
  };

  const canRespond = invoice.status === 'enviada' || invoice.status === 'corregida';

  return (
    <div className="card-aca">
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.title}>
              Factura #{invoice.invoice_number}
              {invoice.attachments && invoice.attachments.length > 0 && (
                <span className={styles.attachmentBadge} title={`${invoice.attachments.length} documento(s) adicional(es)`}>
                  📎 {invoice.attachments.length}
                </span>
              )}
            </h3>
            {getStatusBadge(invoice.status)}
          </div>

          <div className={`${styles.infoGrid} ${variant === 'supplier' ? styles.supplierGrid : styles.cooperativeGrid}`}>
            <div className={styles.infoGroup}>
              <label className={styles.label}>Fecha</label>
              <p className={styles.value}>
                {new Date(invoice.issue_date).toLocaleDateString()}
              </p>
            </div>
            <div className={styles.infoGroup}>
              <label className={styles.label}>
                {variant === 'supplier' ? 'Cooperativa' : 'Proveedor'}
              </label>
              <p className={styles.value}>
                {variant === 'supplier' 
                  ? (invoice.cooperative_name || 'No identificada')
                  : (invoice.supplier_name || 'No especificado')
                }
              </p>
            </div>
            {variant === 'cooperative' && (
              <div className={styles.infoGroup}>
                <label className={styles.label}>CUIT Emisor</label>
                <p className={styles.value}>{invoice.issuer_cuit}</p>
              </div>
            )}
            <div className={styles.infoGroup}>
              <label className={styles.label}>Total</label>
              <p className={styles.totalValue}>
                ${parseFloat(invoice.total_amount.toString()).toLocaleString()}
              </p>
            </div>
          </div>

          {invoice.status === 'corregida' && (
            <div className={styles.correctedAlert}>
              <h4 className={styles.correctedTitle}>📝 Factura corregida:</h4>
              <p className={styles.correctedText}>
                El proveedor ha corregido y reenviado esta factura tras su rechazo anterior.
              </p>
            </div>
          )}

          {/* Motivo de rechazo para variante de proveedor */}
          {variant === 'supplier' && invoice.status === 'rechazada' && invoice.rejection_reason && (
            <div className={styles.rejectForm}>
              <h4 className={styles.rejectTitle}>Motivo del rechazo:</h4>
              <p className={styles.correctedText}>{invoice.rejection_reason}</p>
            </div>
          )}

          {showRejectForm && (
            <div className={styles.rejectForm}>
              <h4 className={styles.rejectTitle}>Motivo del rechazo:</h4>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Describa el motivo del rechazo..."
                className={styles.rejectInput}
                rows={3}
              />
              <div className={styles.rejectActions}>
                <button
                  onClick={handleReject}
                  disabled={responding}
                  className="btn-aca text-sm bg-red-600 hover:bg-red-700"
                >
                  {responding ? 'Rechazando...' : 'Confirmar Rechazo'}
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="btn-aca text-sm bg-gray-600 hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            {actions ? (
              // Use custom actions for supplier variant
              actions
            ) : (
              // Default cooperative actions
              <>
                {canRespond && (
                  <>
                    <button
                      onClick={handleAccept}
                      disabled={responding}
                      className="btn-aca text-sm bg-green-600 hover:bg-green-700"
                    >
                      {responding ? 'Procesando...' : '✅ Aceptar'}
                    </button>
                    
                    <button
                      onClick={() => setShowRejectForm(!showRejectForm)}
                      className="btn-aca text-sm bg-red-600 hover:bg-red-700"
                    >
                      ❌ Rechazar
                    </button>
                  </>
                )}

                <button
                  onClick={handleDownload}
                  className={styles.downloadButton}
                >
                  📥 Descargar PDF
                </button>

                <Link
                  href={`/cooperativa/facturas/${invoice.id}/`}
                  className={styles.detailsButton}
                >
                  👁️ Ver Detalle
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
