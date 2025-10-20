import db from '../config/database';

async function addCooperativeActivationSystem(): Promise<void> {
  try {
    console.log('🔧 Agregando sistema de activación de cooperativas...\n');

    // Agregar columnas a la tabla cooperatives
    console.log('📝 Actualizando tabla cooperatives...');
    
    const tableInfo = await db.all<any>(`PRAGMA table_info(cooperatives)`);
    const columnNames = tableInfo.map((col: any) => col.name);
    
    if (!columnNames.includes('invoice_system_active')) {
      await db.run(`ALTER TABLE cooperatives ADD COLUMN invoice_system_active INTEGER DEFAULT 0`);
      console.log('✅ Columna invoice_system_active agregada');
    } else {
      console.log('⚠️  Columna invoice_system_active ya existe');
    }
    
    if (!columnNames.includes('activated_at')) {
      await db.run(`ALTER TABLE cooperatives ADD COLUMN activated_at DATETIME`);
      console.log('✅ Columna activated_at agregada');
    } else {
      console.log('⚠️  Columna activated_at ya existe');
    }
    
    if (!columnNames.includes('activated_by')) {
      await db.run(`ALTER TABLE cooperatives ADD COLUMN activated_by INTEGER`);
      console.log('✅ Columna activated_by agregada (referencia a users.id)');
    } else {
      console.log('⚠️  Columna activated_by ya existe');
    }

    if (!columnNames.includes('admin_user_id')) {
      await db.run(`ALTER TABLE cooperatives ADD COLUMN admin_user_id INTEGER`);
      console.log('✅ Columna admin_user_id agregada (referencia al admin de la coop)');
    } else {
      console.log('⚠️  Columna admin_user_id ya existe');
    }
    
    console.log('');

    console.log('✨ Proceso completado!\n');
    console.log('📋 Nuevas columnas en cooperatives:');
    console.log('   1. invoice_system_active - Indica si la coop está activa en el sistema de facturas');
    console.log('   2. activated_at - Fecha de activación');
    console.log('   3. activated_by - ID del admin ACA que activó la cooperativa');
    console.log('   4. admin_user_id - ID del usuario administrador de la cooperativa\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

addCooperativeActivationSystem()
  .then(() => {
    console.log('🎉 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
