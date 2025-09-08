const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./cooperativas.db');

async function initializeInvoicesSystem() {
  console.log('Inicializando sistema de facturas...');

  db.serialize(async () => {
    // Crear tabla de facturas
    db.run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT NOT NULL,
        issue_date DATE NOT NULL,
        issuer_cuit TEXT NOT NULL,
        receiver_cuit TEXT NOT NULL,
        cooperative_id INTEGER,
        supplier_id INTEGER,
        subtotal DECIMAL(12,2),
        iva_amount DECIMAL(12,2),
        total_amount DECIMAL(12,2) NOT NULL,
        status TEXT DEFAULT 'pendiente_validacion',
        file_path TEXT,
        original_filename TEXT,
        rejection_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        validated_at DATETIME,
        sent_at DATETIME,
        responded_at DATETIME,
        FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id),
        FOREIGN KEY (supplier_id) REFERENCES users(id)
      )
    `, function(err) {
      if (err) {
        console.error('Error creando tabla invoices:', err);
      } else {
        console.log('Tabla invoices creada');
      }
    });

    // Crear tabla de items de factura
    db.run(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `, function(err) {
      if (err) {
        console.error('Error creando tabla invoice_items:', err);
      } else {
        console.log('Tabla invoice_items creada');
      }
    });

    // Crear usuario proveedor de prueba
    const supplierPassword = await bcrypt.hash('proveedor123', 10);
    
    db.run(
      `INSERT OR REPLACE INTO users (username, email, password, role, cooperative_id, full_name, company_name, cuit) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'proveedor_test', 
        'proveedor@test.com', 
        supplierPassword, 
        'proveedor', 
        null,
        'Juan Pérez',
        'Proveedores Test S.A.',
        '20123456789'
      ],
      function(err) {
        if (err) {
          console.error('Error creando usuario proveedor:', err);
        } else {
          console.log('Usuario proveedor creado: proveedor_test / proveedor123');
        }
      }
    );

    // Agregar columnas adicionales a users si no existen
    db.run(`ALTER TABLE users ADD COLUMN full_name TEXT`, function(err) {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error agregando columna full_name:', err);
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN company_name TEXT`, function(err) {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error agregando columna company_name:', err);
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN cuit TEXT`, function(err) {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error agregando columna cuit:', err);
      }
    });

    // Crear directorio para archivos de facturas
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'uploads', 'invoices');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Directorio de uploads creado:', uploadsDir);
    }

    console.log('\n🎉 Sistema de facturas inicializado correctamente!');
    console.log('\n👥 Credenciales de prueba:');
    console.log('📦 Proveedor: proveedor_test / proveedor123');
    console.log('🏢 Cooperativa: admin_coop_1 / coop123');
    console.log('⚙️  Admin ACA: admin_aca / admin123');
  });
}

// Ejecutar inicialización
initializeInvoicesSystem();

module.exports = { initializeInvoicesSystem };
