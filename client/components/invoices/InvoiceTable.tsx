import { Invoice, InvoiceStatus } from '@/types';
import Link from 'next/link';
import styles from './InvoiceTable.module.css';

interface InvoiceTableProps {
  invoices: Invoice[];
  variant: 'supplier' | 'cooperative';
  onDownload?: (id: number) => void;
}

export const InvoiceTable = ({ invoices, variant, onDownload }: InvoiceTableProps) => {
  
  const getStatusBadgeClass = (status: InvoiceStatus): string => {
    const statusClasses: Record<InvoiceStatus, string> = {
      'pendiente_validacion': styles.statusPending,
      'enviada': styles.statusSent,
      'aceptada': styles.statusAccepted,
      'rechazada': styles.statusRejected,
      'corregida': styles.statusCorrected
    };
    return statusClasses[status] || styles.statusDefault;
  };

  const getStatusText = (status: InvoiceStatus): string => {
    const statusText: Record<InvoiceStatus, string> = {
      'pendiente_validacion': '⏳ Pendiente',
      'enviada': '📤 Enviada',
      'aceptada': '✅ Aceptada',
      'rechazada': '❌ Rechazada',
      'corregida': '🔄 Corregida'
    };
    return statusText[status] || status;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>N° Factura</th>
              <th>Fecha</th>
              <th>CUIT Emisor</th>
              <th>CUIT Receptor</th>
              <th className={styles.alignRight}>Subtotal</th>
              <th className={styles.alignRight}>IVA</th>
              <th className={styles.alignRight}>Total</th>
              <th className={styles.alignCenter}>Estado</th>
              <th className={styles.alignCenter}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.emptyState}>
                  <div className={styles.emptyContent}>
                    <span className={styles.emptyIcon}>📄</span>
                    <p>No hay facturas para mostrar</p>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className={styles.tableRow}>
                  <td className={styles.invoiceNumber}>
                    {invoice.invoice_number}
                  </td>
                  <td>{formatDate(invoice.issue_date)}</td>
                  <td className={styles.cuitCell}>{invoice.issuer_cuit}</td>
                  <td className={styles.cuitCell}>{invoice.receiver_cuit}</td>
                  <td className={styles.alignRight}>
                    {formatCurrency(invoice.subtotal || 0)}
                  </td>
                  <td className={styles.alignRight}>
                    {formatCurrency(invoice.iva_amount || 0)}
                  </td>
                  <td className={`${styles.alignRight} ${styles.totalCell}`}>
                    {formatCurrency(invoice.total_amount)}
                  </td>
                  <td className={styles.alignCenter}>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(invoice.status as InvoiceStatus)}`}>
                      {getStatusText(invoice.status as InvoiceStatus)}
                    </span>
                  </td>
                  <td className={styles.alignCenter}>
                    <div className={styles.actionsCell}>
                      {variant === 'supplier' && (
                        <>
                          {invoice.status === 'pendiente_validacion' && invoice.id && (
                            <Link 
                              href={`/proveedor/facturas/${invoice.id}/validar`}
                              className={styles.btnValidate}
                              title="Validar y Enviar"
                            >
                              ✏️
                            </Link>
                          )}
                          
                          {invoice.status === 'rechazada' && invoice.id && (
                            <Link 
                              href={`/proveedor/facturas/${invoice.id}/corregir`}
                              className={styles.btnCorrect}
                              title="Corregir y Reenviar"
                            >
                              🔄
                            </Link>
                          )}
                        </>
                      )}

                      {variant === 'cooperative' && (
                        <>
                          {invoice.status === 'enviada' && invoice.id && (
                            <Link 
                              href={`/cooperativa/facturas/${invoice.id}`}
                              className={styles.btnReview}
                              title="Revisar factura"
                            >
                              👁️
                            </Link>
                          )}
                        </>
                      )}

                      {invoice.id && (
                        <button 
                          onClick={() => onDownload && onDownload(invoice.id!)}
                          className={styles.btnDownload}
                          title="Descargar PDF"
                        >
                          📥
                        </button>
                      )}

                      {invoice.id && (
                        <Link 
                          href={variant === 'supplier' 
                            ? `/proveedor/facturas/${invoice.id}` 
                            : `/cooperativa/facturas/${invoice.id}`
                          }
                          className={styles.btnDetails}
                          title="Ver detalles"
                        >
                          🔍
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen en el footer */}
      {invoices.length > 0 && (
        <div className={styles.tableFooter}>
          <div className={styles.footerInfo}>
            <span className={styles.footerLabel}>Total de facturas:</span>
            <span className={styles.footerValue}>{invoices.length}</span>
          </div>
          <div className={styles.footerInfo}>
            <span className={styles.footerLabel}>Suma total:</span>
            <span className={styles.footerValue}>
              {formatCurrency(
                invoices.reduce((sum, inv) => sum + inv.total_amount, 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
