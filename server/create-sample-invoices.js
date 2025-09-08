const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./cooperativas.db');

async function createSampleInvoices() {
  console.log('Creando facturas de ejemplo...');

  const sampleInvoices = [
    {
      invoice_number: 'FC-0001-00000123',
      issue_date: '2025-09-01',
      issuer_cuit: '20-12345678-9',
      receiver_cuit: '30-12345678-4', // CUIT de la primera cooperativa
      cooperative_id: 1,
      supplier_id: 1, // ID del proveedor que creamos
      subtotal: 10000.00,
      iva_amount: 2100.00,
      total_amount: 12100.00,
      status: 'pendiente_validacion',
      file_path: '/uploads/invoices/sample1.pdf',
      original_filename: 'factura_123.pdf'
    },
    {
      invoice_number: 'FC-0001-00000124',
      issue_date: '2025-09-05',
      issuer_cuit: '20-12345678-9',
      receiver_cuit: '30-12345678-4',
      cooperative_id: 1,
      supplier_id: 1,
      subtotal: 15000.00,
      iva_amount: 3150.00,
      total_amount: 18150.00,
      status: 'enviada',
      file_path: '/uploads/invoices/sample2.pdf',
      original_filename: 'factura_124.pdf',
      validated_at: '2025-09-05 10:00:00',
      sent_at: '2025-09-05 10:05:00'
    },
    {
      invoice_number: 'FC-0001-00000125',
      issue_date: '2025-09-03',
      issuer_cuit: '20-12345678-9',
      receiver_cuit: '30-12345678-4',
      cooperative_id: 1,
      supplier_id: 1,
      subtotal: 8000.00,
      iva_amount: 1680.00,
      total_amount: 9680.00,
      status: 'aceptada',
      file_path: '/uploads/invoices/sample3.pdf',
      original_filename: 'factura_125.pdf',
      validated_at: '2025-09-03 14:00:00',
      sent_at: '2025-09-03 14:05:00',
      responded_at: '2025-09-04 09:00:00'
    }
  ];

  db.serialize(() => {
    // Obtener el ID del proveedor
    db.get('SELECT id FROM users WHERE username = ?', ['proveedor_test'], (err, user) => {
      if (err || !user) {
        console.error('No se encontró el usuario proveedor');
        return;
      }

      const supplierId = user.id;

      // Insertar facturas
      sampleInvoices.forEach((invoice, index) => {
        invoice.supplier_id = supplierId;

        db.run(`
          INSERT INTO invoices (
            invoice_number, issue_date, issuer_cuit, receiver_cuit,
            cooperative_id, supplier_id, subtotal, iva_amount, total_amount,
            status, file_path, original_filename, validated_at, sent_at, responded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          invoice.invoice_number,
          invoice.issue_date,
          invoice.issuer_cuit,
          invoice.receiver_cuit,
          invoice.cooperative_id,
          invoice.supplier_id,
          invoice.subtotal,
          invoice.iva_amount,
          invoice.total_amount,
          invoice.status,
          invoice.file_path,
          invoice.original_filename,
          invoice.validated_at || null,
          invoice.sent_at || null,
          invoice.responded_at || null
        ], function(err) {
          if (err) {
            console.error(`Error insertando factura ${invoice.invoice_number}:`, err);
          } else {
            console.log(`✅ Factura ${invoice.invoice_number} creada (ID: ${this.lastID})`);
            
            // Insertar items de ejemplo para cada factura
            const items = [
              {
                description: `Producto ejemplo ${index + 1}`,
                quantity: 2,
                unit_price: invoice.subtotal / 2,
                total_price: invoice.subtotal
              }
            ];

            items.forEach(item => {
              db.run(`
                INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
                VALUES (?, ?, ?, ?, ?)
              `, [this.lastID, item.description, item.quantity, item.unit_price, item.total_price]);
            });
          }
        });
      });

      console.log('\n🎉 Facturas de ejemplo creadas exitosamente!');
      console.log('\n📋 Resumen:');
      console.log('• 1 factura pendiente de validación (proveedor debe validar)');
      console.log('• 1 factura enviada (cooperativa debe responder)');
      console.log('• 1 factura aceptada (proceso completado)');
      console.log('\n🧪 Para probar:');
      console.log('1. Login como proveedor_test → ver "Mis Facturas"');
      console.log('2. Login como admin_coop_1 → ver "Facturas Recibidas"');
    });
  });

  setTimeout(() => {
    db.close();
  }, 2000);
}

createSampleInvoices();
