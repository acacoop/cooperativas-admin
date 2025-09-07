const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./cooperativas.db');

// Función para leer y procesar el CSV
function initializeDatabase() {
  console.log('Inicializando base de datos...');

  // Crear usuarios de prueba
  const users = [
    { username: 'admin_aca', email: 'admin@aca.com', password: 'admin123', role: 'admin_aca', cooperative_id: null },
    { username: 'operador_aca', email: 'operador@aca.com', password: 'operador123', role: 'operador_aca', cooperative_id: null },
    { username: 'admin_coop_1', email: 'admin@coop1.com', password: 'coop123', role: 'admin_coop', cooperative_id: 2 },
    { username: 'admin_coop_2', email: 'admin@coop2.com', password: 'coop123', role: 'admin_coop', cooperative_id: 3 }
  ];

  db.serialize(async () => {
    // Insertar usuarios
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      db.run(
        'INSERT OR REPLACE INTO users (username, email, password, role, cooperative_id) VALUES (?, ?, ?, ?, ?)',
        [user.username, user.email, hashedPassword, user.role, user.cooperative_id],
        function(err) {
          if (err) {
            console.error('Error insertando usuario:', err);
          } else {
            console.log(`Usuario ${user.username} creado`);
          }
        }
      );
    }

    // Leer el CSV y cargar cooperativas
    const csvPath = path.join(__dirname, '..', 'Data', 'cooperatives_con_car_codigos.csv');
    
    if (fs.existsSync(csvPath)) {
      const csvData = fs.readFileSync(csvPath, 'utf8');
      const lines = csvData.split('\n').slice(1); // Omitir header

      lines.forEach((line, index) => {
        if (line.trim()) {
          // Parsear CSV teniendo en cuenta comillas y semicolons
          const parts = line.split(';');
          if (parts.length >= 2) {
            const [dataFields, verificationCode] = parts;
            const fields = dataFields.split(',');
            
            if (fields.length >= 7) {
              const code = fields[0];
              const cuit = fields[1];
              const name = fields[2].replace(/"/g, '');
              const votes = fields[3];
              const substitutes = fields[4];
              const car = fields[5];
              const carName = fields[6].replace(/"/g, '');

              db.run(
                `INSERT OR REPLACE INTO cooperatives 
                (code, cuit, name, votes, substitutes, car, car_name, verification_code) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [code, cuit, name, votes, substitutes, car, carName, verificationCode],
                function(err) {
                  if (err) {
                    console.error(`Error insertando cooperativa ${name}:`, err);
                  } else {
                    console.log(`Cooperativa ${name} cargada`);
                  }
                }
              );
            }
          }
        }
      });
    } else {
      console.log('Archivo CSV no encontrado, creando cooperativas de ejemplo...');
      
      // Crear algunas cooperativas de ejemplo si no existe el CSV
      const exampleCoops = [
        { code: 1, cuit: '30123456789', name: 'Cooperativa Ejemplo 1', votes: 5, substitutes: 3, car: 1, car_name: 'Región Norte' },
        { code: 2, cuit: '30987654321', name: 'Cooperativa Ejemplo 2', votes: 3, substitutes: 2, car: 2, car_name: 'Región Sur' }
      ];

      exampleCoops.forEach(coop => {
        db.run(
          `INSERT OR REPLACE INTO cooperatives 
          (code, cuit, name, votes, substitutes, car, car_name) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [coop.code, coop.cuit, coop.name, coop.votes, coop.substitutes, coop.car, coop.car_name],
          function(err) {
            if (err) {
              console.error(`Error insertando cooperativa ${coop.name}:`, err);
            } else {
              console.log(`Cooperativa ${coop.name} creada`);
            }
          }
        );
      });
    }
  });

  console.log('Base de datos inicializada');
}

// Ejecutar inicialización
initializeDatabase();
