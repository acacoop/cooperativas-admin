import db from '../config/database';

async function addCooperativeManagementTables(): Promise<void> {
  try {
    console.log('🔧 Agregando tablas de gestión de cooperativas...\n');

    // Tabla de roles de usuarios de cooperativas
    console.log('📝 Creando tabla cooperative_user_roles...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS cooperative_user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        cooperative_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'aprobador', 'visualizador')),
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id),
        UNIQUE(user_id, cooperative_id)
      )
    `);
    console.log('✅ Tabla cooperative_user_roles creada\n');

    // Tabla de proveedores autorizados por cooperativa
    console.log('📝 Creando tabla cooperative_suppliers...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS cooperative_suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cooperative_id INTEGER NOT NULL,
        supplier_id INTEGER NOT NULL,
        status TEXT DEFAULT 'activo' CHECK(status IN ('activo', 'inactivo', 'suspendido')),
        contact_name TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id),
        UNIQUE(cooperative_id, supplier_id)
      )
    `);
    console.log('✅ Tabla cooperative_suppliers creada\n');

    // Tabla de invitaciones a usuarios
    console.log('📝 Creando tabla user_invitations...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS user_invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cooperative_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'aprobador', 'visualizador')),
        token TEXT UNIQUE NOT NULL,
        invited_by INTEGER NOT NULL,
        status TEXT DEFAULT 'pendiente' CHECK(status IN ('pendiente', 'aceptada', 'rechazada', 'expirada')),
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        accepted_at DATETIME,
        FOREIGN KEY (cooperative_id) REFERENCES cooperatives(id) ON DELETE CASCADE,
        FOREIGN KEY (invited_by) REFERENCES users(id)
      )
    `);
    console.log('✅ Tabla user_invitations creada\n');

    // Agregar columnas a la tabla users si no existen
    console.log('📝 Actualizando tabla users...');
    
    // Verificar columnas existentes
    const tableInfo = await db.all<any>(`PRAGMA table_info(users)`);
    const columnNames = tableInfo.map((col: any) => col.name);
    
    if (!columnNames.includes('cooperative_role')) {
      await db.run(`ALTER TABLE users ADD COLUMN cooperative_role TEXT`);
      console.log('✅ Columna cooperative_role agregada a users');
    } else {
      console.log('⚠️  Columna cooperative_role ya existe');
    }
    
    if (!columnNames.includes('is_verified')) {
      await db.run(`ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0`);
      console.log('✅ Columna is_verified agregada a users');
    } else {
      console.log('⚠️  Columna is_verified ya existe');
    }
    console.log('');

    console.log('✨ Proceso completado!\n');
    console.log('📋 Nuevas tablas creadas:');
    console.log('   1. cooperative_user_roles - Gestión de roles de usuarios por cooperativa');
    console.log('   2. cooperative_suppliers - Proveedores autorizados por cooperativa');
    console.log('   3. user_invitations - Sistema de invitaciones\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

addCooperativeManagementTables()
  .then(() => {
    console.log('🎉 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
