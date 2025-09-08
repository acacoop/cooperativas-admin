import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import db from '../config/database';
import { User } from '../types';

async function initializeInvoicesSystem(): Promise<void> {
  console.log('Inicializando sistema de facturas...');

  try {
    // Create invoices table
    await db.run(`
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
    `);
    console.log('✅ Tabla invoices creada');

    // Create invoice items table
    await db.run(`
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
    `);
    console.log('✅ Tabla invoice_items creada');

    // Create test supplier user
    const supplierPassword = await bcrypt.hash('proveedor123', 10);
    
    const testSupplier: Partial<User> = {
      username: 'proveedor_test',
      email: 'proveedor@test.com',
      password: supplierPassword,
      role: 'proveedor',
      full_name: 'Juan Pérez',
      company_name: 'Proveedores Test S.A.',
      cuit: '20123456789'
    };

    await db.run(
      `INSERT OR REPLACE INTO users (username, email, password, role, cooperative_id, full_name, company_name, cuit) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testSupplier.username,
        testSupplier.email,
        testSupplier.password,
        testSupplier.role,
        null,
        testSupplier.full_name,
        testSupplier.company_name,
        testSupplier.cuit
      ]
    );
    console.log('✅ Usuario proveedor creado: proveedor_test / proveedor123');

    // Add additional columns to users if they don't exist
    try {
      await db.run(`ALTER TABLE users ADD COLUMN full_name TEXT`);
    } catch (err: any) {
      if (!err.message.includes('duplicate column')) {
        throw err;
      }
    }

    try {
      await db.run(`ALTER TABLE users ADD COLUMN company_name TEXT`);
    } catch (err: any) {
      if (!err.message.includes('duplicate column')) {
        throw err;
      }
    }

    try {
      await db.run(`ALTER TABLE users ADD COLUMN cuit TEXT`);
    } catch (err: any) {
      if (!err.message.includes('duplicate column')) {
        throw err;
      }
    }

    // Create directory for invoice files
    const uploadsDir = path.join(__dirname, '../../uploads/invoices');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Directorio de uploads creado:', uploadsDir);
    }

    console.log('\n🎉 Sistema de facturas inicializado correctamente!');
    console.log('\n👥 Credenciales de prueba:');
    console.log('📦 Proveedor: proveedor_test / proveedor123');
    console.log('🏢 Cooperativa: admin_coop_1 / coop123');
    console.log('⚙️  Admin ACA: admin_aca / admin123');

  } catch (error) {
    console.error('Error durante la inicialización:', error);
    throw error;
  }
}

// Execute initialization
if (require.main === module) {
  initializeInvoicesSystem()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

export { initializeInvoicesSystem };
