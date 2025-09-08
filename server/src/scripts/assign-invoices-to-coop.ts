import db from '../config/database';
import { Invoice } from '../types';

async function assignInvoicesToCoop(): Promise<void> {
  try {
    const invoices = await db.all<Invoice>('SELECT * FROM invoices WHERE cooperative_id IS NULL');
    
    for (const invoice of invoices) {
      const cooperative = await db.get<{ id: number }>(
        'SELECT id FROM cooperatives WHERE cuit = ?',
        [invoice.receiver_cuit]
      );

      if (cooperative) {
        await db.run(
          'UPDATE invoices SET cooperative_id = ? WHERE id = ?',
          [cooperative.id, invoice.id]
        );
        console.log(`Assigned invoice ${invoice.invoice_number} to cooperative ${cooperative.id}`);
      } else {
        console.log(`No cooperative found for CUIT ${invoice.receiver_cuit}`);
      }
    }

    console.log('Invoice assignment completed');
  } catch (error) {
    console.error('Error assigning invoices:', error);
  }
}

assignInvoicesToCoop();
