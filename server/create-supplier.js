const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./cooperativas.db');

async function createSupplierUser() {
  console.log('Creando usuario proveedor...');

  // Agregar columnas si no existen
  db.run('ALTER TABLE users ADD COLUMN full_name TEXT', () => {});
  db.run('ALTER TABLE users ADD COLUMN company_name TEXT', () => {});
  db.run('ALTER TABLE users ADD COLUMN cuit TEXT', () => {});

  // Crear usuario proveedor
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
        console.log('✅ Usuario proveedor creado exitosamente!');
        console.log('👤 Username: proveedor_test');
        console.log('🔑 Password: proveedor123');
        console.log('🏢 Empresa: Proveedores Test S.A.');
        console.log('🆔 CUIT: 20123456789');
      }
      db.close();
    }
  );
}

createSupplierUser();
