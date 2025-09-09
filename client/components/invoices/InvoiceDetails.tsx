import { Invoice, InvoiceStatus } from '@/types';
import { Card } from '../ui';
import styles from './InvoiceDetails.module.css';

interface InvoiceDetailsProps {
  invoice: Invoice;
}

export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  return (
    <Card title="📄 Datos de la Factura">
      <div className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <label className={styles.label}>Número de Factura</label>
          <p className={styles.value}>{invoice.invoice_number}</p>
        </div>
        <div className={styles.detailItem}>
          <label className={styles.label}>Fecha de Emisión</label>
          <p className={styles.value}>
            {new Date(invoice.issue_date).toLocaleDateString()}
          </p>
        </div>
        <div className={styles.detailItem}>
          <label className={styles.label}>CUIT Emisor</label>
          <p className={styles.value}>{invoice.issuer_cuit}</p>
        </div>
        <div className={styles.detailItem}>
          <label className={styles.label}>CUIT Receptor</label>
          <p className={styles.value}>{invoice.receiver_cuit}</p>
        </div>
      </div>
    </Card>
  );
}
