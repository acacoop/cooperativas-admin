const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./cooperativas.db');

async function fixUserTable() {
  console.log('Arreglando tabla de usuarios...');

  db.serialize(async () => {
    // Primero, crear nueva tabla con la estructura correcta
    db.run(`CREATE TABLE IF NOT EXISTS users_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin_aca', 'operador_aca', 'admin_coop', 'proveedor')),
      cooperative_id INTEGER,
      full_name TEXT,
      company_name TEXT,
      cuit TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, function(err) {
      if (err) {
        console.error('Error creando nueva tabla:', err);
        return;
      }
      console.log('Nueva tabla creada');

      // Copiar datos existentes
      db.run(`INSERT INTO users_new (id, username, email, password, role, cooperative_id, created_at)
               SELECT id, username, email, password, role, cooperative_id, created_at FROM users`, function(err) {
        if (err) {
          console.error('Error copiando datos:', err);
          return;
        }
        console.log('Datos copiados');

        // Eliminar tabla vieja y renombrar
        db.run('DROP TABLE users', function(err) {
          if (err) {
            console.error('Error eliminando tabla vieja:', err);
            return;
          }
          console.log('Tabla vieja eliminada');

          db.run('ALTER TABLE users_new RENAME TO users', async function(err) {
            if (err) {
              console.error('Error renombrando tabla:', err);
              return;
            }
            console.log('Tabla renombrada');

            // Ahora crear el usuario proveedor
            const supplierPassword = await bcrypt.hash('proveedor123', 10);
            
            db.run(
              `INSERT INTO users (username, email, password, role, cooperative_id, full_name, company_name, cuit) 
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
                  console.log('\n✅ Usuario proveedor creado exitosamente!');
                  console.log('👤 Username: proveedor_test');
                  console.log('🔑 Password: proveedor123');
                  console.log('🏢 Empresa: Proveedores Test S.A.');
                  console.log('🆔 CUIT: 20123456789');
                }
                db.close();
              }
            );
          });
        });
      });
    });
  });
}

fixUserTable();
