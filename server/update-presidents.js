const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./cooperativas.db');

console.log('🔄 Actualizando presidentes de cooperativas...');

// Lista de nombres de presidentes de ejemplo
const presidents = [
  'Juan Carlos Pérez',
  'María Elena González',
  'Roberto Miguel Torres',
  'Ana Beatriz Martín',
  'Carlos Eduardo Ruiz',
  'Laura Inés Fernández',
  'Miguel Ángel Castro',
  'Patricia Rosa López',
  'Fernando Luis Díaz',
  'Carmen Isabel Morales',
  'Alejandro Raúl Herrera',
  'Silvia Beatriz Romero',
  'Jorge Alberto Silva',
  'Mónica Cristina Vargas',
  'Ricardo Daniel Méndez',
  'Elena Marta Jiménez',
  'Osvaldo José Sánchez',
  'Teresa Noemí Ramos',
  'Andrés Nicolás Guerrero',
  'Gloria Estela Medina',
  'Francisco Javier Cruz',
  'Alicia Rosa Aguilar',
  'Héctor Manuel Flores',
  'Susana Liliana Vega',
  'Pablo Ernesto Molina',
  'Isabel María Núñez',
  'Daniel Alberto Peña',
  'Graciela Nora Ríos',
  'Raúl Enrique Cabrera',
  'Marta Elvira Reyes'
];

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

// Función para obtener cooperativas
function getCooperatives() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, code, name FROM cooperatives ORDER BY code', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function updatePresidents() {
  try {
    const cooperatives = await getCooperatives();
    console.log(`📊 Encontradas ${cooperatives.length} cooperativas`);
    
    let count = 0;
    for (const coop of cooperatives) {
      const president = presidents[count % presidents.length];
      
      await runQuery(
        'UPDATE cooperatives SET president = ? WHERE id = ?',
        [president, coop.id]
      );
      
      console.log(`✅ Cooperativa ${coop.code} - ${coop.name.substring(0, 30)}... - Presidente: ${president}`);
      count++;
    }
    
    console.log(`🎉 ${count} presidentes actualizados exitosamente`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

updatePresidents();
