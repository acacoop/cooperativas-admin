const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./cooperativas.db');

async function assignInvoicesToCooperative() {
  console.log('🔍 Verificando datos del usuario admin_coop_1...');

  db.serialize(() => {
    // Primero verificar datos del usuario admin_coop_1
    db.get('SELECT id, username, company_name, cooperative_id FROM users WHERE username = ?', ['admin_coop_1'], (err, user) => {
      if (err) {
        console.error('Error consultando usuario:', err);
        return;
      }
      
      if (!user) {
        console.log('❌ Usuario admin_coop_1 no encontrado');
        return;
      }

      console.log('✅ Usuario encontrado:', user);
      
      // Ahora buscar información de la cooperativa
      if (user.cooperative_id) {
        db.get('SELECT * FROM cooperatives WHERE id = ?', [user.cooperative_id], (err, coop) => {
          if (err) {
            console.error('Error consultando cooperativa:', err);
            return;
          }
          
          if (coop) {
            console.log('✅ Cooperativa encontrada:', {
              id: coop.id,
              nombre: coop.nombre,
              cuit: coop.cuit
            });
            
            // Crear facturas específicas para esta cooperativa
            createInvoicesForCooperative(user.id, user.cooperative_id, coop.cuit);
          } else {
            console.log('❌ Cooperativa no encontrada para cooperative_id:', user.cooperative_id);
          }
        });
      } else {
        console.log('❌ Usuario admin_coop_1 no tiene cooperative_id asignado');
      }
    });
  });
}

function createInvoicesForCooperative(userId, cooperativeId, cooperativeCuit) {
  console.log('\n📄 Creando facturas para la cooperativa...');
  
  // Obtener el ID del proveedor
  db.get('SELECT id FROM users WHERE username = ?', ['proveedor_test'], (err, supplier) => {
    if (err || !supplier) {
      console.error('❌ No se encontró el usuario proveedor_test');
      return;
    }

    const supplierId = supplier.id;
    
    const newInvoices = [
      {
        invoice_number: 'FC-0002-00000201',
        issue_date: '2025-09-06',
        issuer_cuit: '20-12345678-9',
        receiver_cuit: cooperativeCuit,
        cooperative_id: cooperativeId,
        supplier_id: supplierId,
        subtotal: 25000.00,
        iva_amount: 5250.00,
        total_amount: 30250.00,
        status: 'enviada',
        file_path: '/uploads/invoices/coop_sample1.pdf',
        original_filename: 'factura_cooperativa_201.pdf',
        validated_at: '2025-09-06 08:00:00',
        sent_at: '2025-09-06 08:05:00'
      },
      {
        invoice_number: 'FC-0002-00000202',
        issue_date: '2025-09-07',
        issuer_cuit: '20-12345678-9',
        receiver_cuit: cooperativeCuit,
        cooperative_id: cooperativeId,
        supplier_id: supplierId,
        subtotal: 18000.00,
        iva_amount: 3780.00,
        total_amount: 21780.00,
        status: 'enviada',
        file_path: '/uploads/invoices/coop_sample2.pdf',
        original_filename: 'factura_cooperativa_202.pdf',
        validated_at: '2025-09-07 09:00:00',
        sent_at: '2025-09-07 09:05:00'
      },
      {
        invoice_number: 'FC-0002-00000203',
        issue_date: '2025-09-05',
        issuer_cuit: '20-12345678-9',
        receiver_cuit: cooperativeCuit,
        cooperative_id: cooperativeId,
        supplier_id: supplierId,
        subtotal: 12000.00,
        iva_amount: 2520.00,
        total_amount: 14520.00,
        status: 'aceptada',
        file_path: '/uploads/invoices/coop_sample3.pdf',
        original_filename: 'factura_cooperativa_203.pdf',
        validated_at: '2025-09-05 15:00:00',
        sent_at: '2025-09-05 15:05:00',
        responded_at: '2025-09-06 10:00:00'
      },
      {
        invoice_number: 'FC-0002-00000204',
        issue_date: '2025-09-04',
        issuer_cuit: '20-12345678-9',
        receiver_cuit: cooperativeCuit,
        cooperative_id: cooperativeId,
        supplier_id: supplierId,
        subtotal: 8500.00,
        iva_amount: 1785.00,
        total_amount: 10285.00,
        status: 'rechazada',
        file_path: '/uploads/invoices/coop_sample4.pdf',
        original_filename: 'factura_cooperativa_204.pdf',
        validated_at: '2025-09-04 12:00:00',
        sent_at: '2025-09-04 12:05:00',
        responded_at: '2025-09-05 11:00:00',
        rejection_reason: 'Los productos no coinciden con la orden de compra. Por favor verificar y corregir.'
      },
      {
        invoice_number: 'FC-0002-00000205',
        issue_date: '2025-09-07',
        issuer_cuit: '20-12345678-9',
        receiver_cuit: cooperativeCuit,
        cooperative_id: cooperativeId,
        supplier_id: supplierId,
        subtotal: 8500.00,
        iva_amount: 1785.00,
        total_amount: 10285.00,
        status: 'corregida',
        file_path: '/uploads/invoices/coop_sample5.pdf',
        original_filename: 'factura_cooperativa_205_corregida.pdf',
        validated_at: '2025-09-07 14:00:00',
        sent_at: '2025-09-07 14:05:00'
      }
    ];

    // Insertar cada factura
    let completed = 0;
    newInvoices.forEach((invoice, index) => {
      db.run(`
        INSERT INTO invoices (
          invoice_number, issue_date, issuer_cuit, receiver_cuit,
          cooperative_id, supplier_id, subtotal, iva_amount, total_amount,
          status, file_path, original_filename, validated_at, sent_at, 
          responded_at, rejection_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        invoice.responded_at || null,
        invoice.rejection_reason || null
      ], function(err) {
        if (err) {
          console.error(`❌ Error insertando factura ${invoice.invoice_number}:`, err);
        } else {
          console.log(`✅ Factura ${invoice.invoice_number} creada (${invoice.status})`);
          
          // Insertar items de ejemplo
          const itemDescription = invoice.status === 'corregida' ? 
            'Producto corregido según observaciones' : 
            `Producto para cooperativa - ${invoice.invoice_number}`;
            
          db.run(`
            INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)
          `, [this.lastID, itemDescription, 1, invoice.subtotal, invoice.subtotal]);
        }
        
        completed++;
        if (completed === newInvoices.length) {
          console.log('\n🎉 ¡Facturas asignadas exitosamente!');
          console.log('\n📊 Resumen para admin_coop_1:');
          console.log('• 2 facturas ENVIADAS (necesitan respuesta)');
          console.log('• 1 factura ACEPTADA');
          console.log('• 1 factura RECHAZADA');
          console.log('• 1 factura CORREGIDA (necesita nueva respuesta)');
          console.log('\n✨ Ahora puedes probar los filtros como admin_coop_1');
          
          setTimeout(() => {
            db.close();
          }, 1000);
        }
      });
    });
  });
}

assignInvoicesToCooperative();
