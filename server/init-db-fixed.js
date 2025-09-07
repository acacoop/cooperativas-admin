const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./cooperativas.db');

console.log('🚀 Inicializando base de datos...');

// Función para ejecutar una consulta y esperar a que termine
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

// Función principal asíncrona
async function initializeDatabase() {
  try {
    console.log('📝 Creando tablas...');
    
    // Crear tabla de usuarios
    await runQuery(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin_aca', 'operador_aca', 'admin_coop')),
      cooperative_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    console.log('✅ Tabla users creada');

    // Crear tabla de cooperativas
    await runQuery(`CREATE TABLE IF NOT EXISTS cooperatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code INTEGER UNIQUE NOT NULL,
      cuit TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      votes INTEGER,
      substitutes INTEGER,
      car INTEGER,
      car_name TEXT,
      verification_code TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      president TEXT,
      secretary TEXT,
      treasurer TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    console.log('✅ Tabla cooperatives creada');

    // Crear tabla de cambios pendientes
    await runQuery(`CREATE TABLE IF NOT EXISTS pending_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cooperative_id INTEGER,
      user_id INTEGER,
      changes TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_by INTEGER,
      reviewed_at DATETIME,
      FOREIGN KEY (cooperative_id) REFERENCES cooperatives (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (reviewed_by) REFERENCES users (id)
    )`);
    
    console.log('✅ Tabla pending_changes creada');

    console.log('👥 Creando usuarios de prueba...');
    
    // Crear usuarios de prueba
    const users = [
      { username: 'admin_aca', email: 'admin@aca.com', password: 'admin123', role: 'admin_aca', cooperative_id: null },
      { username: 'operador_aca', email: 'operador@aca.com', password: 'operador123', role: 'operador_aca', cooperative_id: null },
      { username: 'admin_coop_1', email: 'admin@coop1.com', password: 'coop123', role: 'admin_coop', cooperative_id: 2 },
      { username: 'admin_coop_2', email: 'admin@coop2.com', password: 'coop123', role: 'admin_coop', cooperative_id: 3 }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      try {
        await runQuery(
          'INSERT OR REPLACE INTO users (username, email, password, role, cooperative_id) VALUES (?, ?, ?, ?, ?)',
          [user.username, user.email, hashedPassword, user.role, user.cooperative_id]
        );
        console.log(`✅ Usuario ${user.username} creado`);
      } catch (error) {
        console.log(`⚠️  Usuario ${user.username} ya existe`);
      }
    }

    console.log('🏢 Cargando cooperativas desde CSV...');

    // Leer el CSV y cargar cooperativas
    const csvPath = path.join(__dirname, '..', 'Data', 'cooperatives_con_car_codigos.csv');
    
    if (fs.existsSync(csvPath)) {
      const csvData = fs.readFileSync(csvPath, 'utf8');
      const lines = csvData.split('\n').slice(1); // Omitir header
      let count = 0;

      for (const line of lines) {
        if (line.trim()) {
          try {
            // Parsear CSV más cuidadosamente
            const parts = line.split(';');
            if (parts.length >= 1) {
              const dataFields = parts[0];
              const verificationCode = parts[1] ? parts[1].trim() : '';
              
              // Parsear los campos de datos
              const matches = dataFields.match(/^(\d+),([^,]+),([^,]+(?:,[^,]*)*),(\d+),(\d+),(\d+),(.+)$/);
              
              if (matches) {
                const code = parseInt(matches[1]);
                const cuit = matches[2];
                let name = matches[3];
                const votes = parseInt(matches[4]);
                const substitutes = parseInt(matches[5]);
                const car = parseInt(matches[6]);
                let carName = matches[7];
                
                // Limpiar comillas
                name = name.replace(/"/g, '').trim();
                carName = carName.replace(/"/g, '').trim();

                await runQuery(
                  `INSERT OR REPLACE INTO cooperatives 
                  (code, cuit, name, votes, substitutes, car, car_name, verification_code) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                  [code, cuit, name, votes, substitutes, car, carName, verificationCode]
                );
                
                count++;
                if (count % 10 === 0) {
                  console.log(`📊 Cargadas ${count} cooperativas...`);
                }
              }
            }
          } catch (error) {
            console.error(`❌ Error procesando línea: ${line.substring(0, 50)}...`);
          }
        }
      }
      
      console.log(`✅ ${count} cooperativas cargadas exitosamente`);
    } else {
      console.log('⚠️  Archivo CSV no encontrado, creando cooperativas de ejemplo...');
      
      // Crear algunas cooperativas de ejemplo
      const exampleCoops = [
        { code: 1, cuit: '30123456789', name: 'Cooperativa Ejemplo 1', votes: 5, substitutes: 3, car: 1, car_name: 'Región Norte' },
        { code: 2, cuit: '30987654321', name: 'Cooperativa Ejemplo 2', votes: 3, substitutes: 2, car: 2, car_name: 'Región Sur' },
        { code: 3, cuit: '30555666777', name: 'Cooperativa Ejemplo 3', votes: 4, substitutes: 4, car: 3, car_name: 'Región Centro' }
      ];

      for (const coop of exampleCoops) {
        await runQuery(
          `INSERT OR REPLACE INTO cooperatives 
          (code, cuit, name, votes, substitutes, car, car_name) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [coop.code, coop.cuit, coop.name, coop.votes, coop.substitutes, coop.car, coop.car_name]
        );
        console.log(`✅ Cooperativa ${coop.name} creada`);
      }
    }

    console.log('🎉 ¡Base de datos inicializada exitosamente!');
    console.log('');
    console.log('👤 Usuarios creados:');
    console.log('  - admin_aca / admin123 (Admin ACA)');
    console.log('  - operador_aca / operador123 (Operador ACA)');
    console.log('  - admin_coop_1 / coop123 (Admin Cooperativa)');
    console.log('');
    console.log('🚀 Ya puedes ejecutar el servidor con: node index.js');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  } finally {
    db.close();
  }
}

// Ejecutar inicialización
initializeDatabase();
