import db from '../config/database';
import bcrypt from 'bcryptjs';
import { User } from '../types';

async function initUsers(): Promise<void> {
  try {
    console.log('🔧 Iniciando creación de usuarios de prueba...\n');

    // Verificar si ya existen usuarios
    const existingUsers = await db.all<User>('SELECT * FROM users');
    
    if (existingUsers.length > 0) {
      console.log('✅ Ya existen usuarios en la base de datos:');
      existingUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`);
      });
      console.log('\n⚠️  Si deseas recrear los usuarios, elimina la base de datos primero.');
      return;
    }

    // Usuarios de prueba
    const testUsers: Partial<User>[] = [
      {
        username: 'admin_aca',
        email: 'admin@aca.com.ar',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin_aca',
        full_name: 'Administrador ACA'
      },
      {
        username: 'operador_aca',
        email: 'operador@aca.com.ar',
        password: await bcrypt.hash('operador123', 10),
        role: 'operador_aca',
        full_name: 'Operador ACA'
      },
      {
        username: 'admin_coop_1',
        email: 'admin@cooperativa1.com.ar',
        password: await bcrypt.hash('coop123', 10),
        role: 'admin_coop',
        cooperative_id: 1,
        full_name: 'Admin Cooperativa 1'
      },
      {
        username: 'proveedor_test',
        email: 'proveedor@test.com',
        password: await bcrypt.hash('proveedor123', 10),
        role: 'proveedor',
        company_name: 'Proveedor de Prueba S.A.',
        cuit: '20-12345678-9',
        full_name: 'Juan Proveedor'
      }
    ];

    console.log('📝 Creando usuarios...\n');
    
    for (const user of testUsers) {
      try {
        const result = await db.run(
          `INSERT INTO users (username, email, password, role, cooperative_id, full_name, company_name, cuit)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.username,
            user.email,
            user.password,
            user.role,
            user.cooperative_id || null,
            user.full_name || null,
            user.company_name || null,
            user.cuit || null
          ]
        );
        console.log(`✅ Usuario creado: ${user.username} (ID: ${result.lastID})`);
      } catch (error: any) {
        console.error(`❌ Error creando usuario ${user.username}:`, error.message);
      }
    }

    console.log('\n✨ Proceso completado!\n');
    console.log('📋 Usuarios de prueba creados:');
    console.log('   1. admin_aca / admin123 (Administrador ACA)');
    console.log('   2. operador_aca / operador123 (Operador ACA)');
    console.log('   3. admin_coop_1 / coop123 (Admin Cooperativa)');
    console.log('   4. proveedor_test / proveedor123 (Proveedor)\n');

  } catch (error) {
    console.error('❌ Error en el proceso de inicialización:', error);
  }
}

// Ejecutar el script
initUsers().then(() => {
  console.log('🎉 Script finalizado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
