import { PrismaClient } from '../generated/prisma';

async function createDefaultCategoriesAndCostCenters() {
  const prisma = new PrismaClient();

  try {
    console.log('🚀 Creating default categories and cost centers...');

    // Get all cooperatives
    const cooperatives = await prisma.cooperative.findMany();
    console.log(`   Found ${cooperatives.length} cooperatives`);

    // Default cost centers
    const defaultCostCenters = [
      { name: 'Administración', description: 'Gastos administrativos generales' },
      { name: 'Finanzas', description: 'Departamento de finanzas y contabilidad' },
      { name: 'Tecnología', description: 'Sistemas y tecnología de la información' },
      { name: 'Operaciones', description: 'Operaciones y producción' },
      { name: 'Recursos Humanos', description: 'Gestión de personal y RRHH' },
      { name: 'Mantenimiento', description: 'Mantenimiento de instalaciones y equipos' }
    ];

    // Default invoice categories
    const defaultCategories = [
      { name: 'Combustible', description: 'Gastos en combustible y carburantes', color: '#ff6b6b' },
      { name: 'Materiales', description: 'Compra de materiales y suministros', color: '#4ecdc4' },
      { name: 'Alimentos', description: 'Productos alimenticios y bebidas', color: '#45b7d1' },
      { name: 'Servicios Generales', description: 'Servicios diversos y generales', color: '#96ceb4' },
      { name: 'Equipos', description: 'Compra y alquiler de equipos', color: '#feca57' },
      { name: 'Servicios Profesionales', description: 'Consultoría, asesoría y servicios profesionales', color: '#ff9ff3' },
      { name: 'Mantenimiento', description: 'Servicios de mantenimiento y reparaciones', color: '#54a0ff' },
      { name: 'Seguros', description: 'Pólizas de seguro y coberturas', color: '#5f27cd' }
    ];

    for (const cooperative of cooperatives) {
      console.log(`   Processing cooperative: ${cooperative.name}`);

      // Create cost centers
      for (const costCenter of defaultCostCenters) {
        try {
          await prisma.costCenter.upsert({
            where: {
              cooperativeId_name: {
                cooperativeId: cooperative.id,
                name: costCenter.name
              }
            },
            update: {},
            create: {
              cooperativeId: cooperative.id,
              name: costCenter.name,
              description: costCenter.description,
              isActive: true
            }
          });
        } catch (error) {
          console.warn(`     ⚠️  Cost center "${costCenter.name}" already exists or error: ${error}`);
        }
      }

      // Create invoice categories
      for (const category of defaultCategories) {
        try {
          await prisma.invoiceCategory.upsert({
            where: {
              cooperativeId_name: {
                cooperativeId: cooperative.id,
                name: category.name
              }
            },
            update: {},
            create: {
              cooperativeId: cooperative.id,
              name: category.name,
              description: category.description,
              color: category.color,
              isActive: true
            }
          });
        } catch (error) {
          console.warn(`     ⚠️  Category "${category.name}" already exists or error: ${error}`);
        }
      }

      console.log(`     ✅ Created defaults for ${cooperative.name}`);
    }

    console.log('🎉 Default categories and cost centers created successfully!');

  } catch (error) {
    console.error('❌ Error creating defaults:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDefaultCategoriesAndCostCenters().catch(console.error);