import { InvoiceItem } from '@/types';
import { Card } from '../ui';
import styles from './InvoiceItemDetails.module.css';

interface InvoiceItemDetailsProps {
  items: InvoiceItem[];
}

export function InvoiceItemDetails({ items }: InvoiceItemDetailsProps) {
  return (
    <Card title="🛒 Items de la Factura">
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.headerCell}>Descripción</th>
              <th className={styles.headerCell} align="right">Cantidad</th>
              <th className={styles.headerCell} align="right">Precio Unit.</th>
              <th className={styles.headerCell} align="right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.tableCell}>{item.description}</td>
                <td className={styles.tableCell} align="right">{item.quantity}</td>
                <td className={styles.tableCell} align="right">
                  ${item.unit_price.toLocaleString()}
                </td>
                <td className={styles.totalCell} align="right">
                  ${item.total_price.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
