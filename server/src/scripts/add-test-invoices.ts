import db from '../config/database';

async function addTestInvoices(): Promise<void> {
  try {
    console.log('🔧 Agregando facturas de prueba...\n');

    // Obtener el ID del proveedor de prueba
    const proveedor = await db.get('SELECT id FROM users WHERE username = ?', ['proveedor_test']) as any;
    
    if (!proveedor) {
      console.error('❌ No se encontró el usuario proveedor_test.');
      return;
    }

    const providerId = proveedor.id;
    console.log(`✅ Proveedor encontrado (ID: ${providerId})\n`);

    // Verificar facturas existentes
    const existingInvoices = await db.all('SELECT COUNT(*) as count FROM invoices WHERE supplier_id = ?', [providerId]) as any;
    console.log(`📊 Facturas existentes del proveedor: ${existingInvoices[0]?.count || 0}\n`);

    // Facturas de prueba
    const testInvoices = [
      {
        invoice_number: `FC-${Date.now()}-001`,
        issue_date: '2025-09-15',
        issuer_cuit: '20-12345678-9',
        receiver_cuit: '30-98765432-1',
        cooperative_id: 1,
        subtotal: 100000.00,
        iva_amount: 21000.00,
        total_amount: 121000.00,
        status: 'pendiente_validacion',
        file_path: '/uploads/invoices/test1.pdf'
      },
      {
        invoice_number: `FC-${Date.now()}-002`,
        issue_date: '2025-09-20',
        issuer_cuit: '20-12345678-9',
        receiver_cuit: '30-98765432-1',
        cooperative_id: 1,
        subtotal: 50000.00,
        iva_amount: 10500.00,
        total_amount: 60500.00,
        status: 'aceptada',
        file_path: '/uploads/invoices/test2.pdf'
      },
      {
        invoice_number: `FC-${Date.now()}-003`,
        issue_date: '2025-09-25',
        issuer_cuit: '20-12345678-9',
        receiver_cuit: '30-98765432-1',
        cooperative_id: 1,
        subtotal: 75000.00,
        iva_amount: 15750.00,
        total_amount: 90750.00,
        status: 'pendiente_validacion',
        file_path: '/uploads/invoices/test3.pdf'
      }
    ];

    console.log('📝 Creando facturas...\n');
    
    for (const invoice of testInvoices) {
      try {
        const result = await db.run(
          `INSERT INTO invoices (
            invoice_number, issue_date, issuer_cuit, receiver_cuit,
            cooperative_id, supplier_id, subtotal, iva_amount,
            total_amount, status, file_path
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoice.invoice_number,
            invoice.issue_date,
            invoice.issuer_cuit,
            invoice.receiver_cuit,
            invoice.cooperative_id,
            providerId,
            invoice.subtotal,
            invoice.iva_amount,
            invoice.total_amount,
            invoice.status,
            invoice.file_path
          ]
        );
        
        const invoiceId = result?.lastID || 0;
        console.log(`✅ Factura creada: ${invoice.invoice_number} (ID: ${invoiceId}) - ${invoice.status}`);

        // Agregar un ítem de ejemplo
        if (invoiceId > 0) {
          await db.run(
            `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
             VALUES (?, ?, ?, ?, ?)`,
            [invoiceId, 'Producto de ejemplo', 10, invoice.subtotal / 10, invoice.subtotal]
          );
          console.log(`   └─ Item agregado\n`);
        }

      } catch (error: any) {
        console.error(`❌ Error creando factura ${invoice.invoice_number}:`, error.message);
      }
    }

    console.log('✨ Proceso completado!\n');
    console.log('💡 Ahora puedes:');
    console.log('   1. Iniciar sesión como proveedor_test / proveedor123');
    console.log('   2. Ir a la sección de Facturas');
    console.log('   3. Ver el detalle de cualquier factura');
    console.log('   4. Probar subir adjuntos (PDFs, imágenes, etc.)\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addTestInvoices()
  .then(() => {
    console.log('🎉 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
