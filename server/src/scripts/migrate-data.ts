import { PrismaClient } from '../generated/prisma';
import sqlite3 from 'sqlite3';
import path from 'path';

async function migrateData() {
  const prisma = new PrismaClient();
  
  // Connect to old SQLite database
  const oldDbPath = path.join(__dirname, '../../cooperativas.db');
  const oldDb = new sqlite3.Database(oldDbPath);
  
  console.log('🚀 Starting data migration...');
  console.log(`📂 Old DB: ${oldDbPath}`);
  console.log(`📂 New DB: ${process.env.DATABASE_URL}`);

  try {
    // Helper function to query old database
    const queryOldDb = (sql: string): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        oldDb.all(sql, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    };

    // Helper function to safely convert to integer
    const safeInt = (value: any): number | undefined => {
      if (value === null || value === undefined || value === '') return undefined;
      const parsed = parseInt(String(value).replace(/[^0-9]/g, ''));
      return isNaN(parsed) ? undefined : parsed;
    };

    // Helper function to safely convert to float
    const safeFloat = (value: any): number | undefined => {
      if (value === null || value === undefined || value === '') return undefined;
      const parsed = parseFloat(String(value));
      return isNaN(parsed) ? undefined : parsed;
    };

    // Helper function to clean string
    const cleanString = (value: any): string | undefined => {
      if (value === null || value === undefined) return undefined;
      const cleaned = String(value).trim().replace(/[\r\n]/g, '');
      return cleaned === '' ? undefined : cleaned;
    };

    // 1. Migrate Cooperatives first (no dependencies)
    console.log('📋 Migrating cooperatives...');
    const cooperatives = await queryOldDb('SELECT * FROM cooperatives ORDER BY id');
    console.log(`   Found ${cooperatives.length} cooperatives`);
    
    // Add test cooperatives with IDs 1 and 2 if they don't exist
    const testCooperatives = [
      {
        id: 1,
        code: 9999,
        name: 'Test Cooperative 1',
        cuit: '20-12345678-9',
        address: 'Test Address 1',
        city: 'Test City',
        province: 'Test Province',
        phone: '123-456-7890',
        email: 'test1@coop.com',
        status: 'active'
      },
      {
        id: 2,
        code: 9998,
        name: 'Test Cooperative 2',
        cuit: '20-87654321-9',
        address: 'Test Address 2',
        city: 'Test City',
        province: 'Test Province',
        phone: '098-765-4321',
        email: 'test2@coop.com',
        status: 'active'
      }
    ];

    for (const testCoop of testCooperatives) {
      try {
        await prisma.cooperative.upsert({
          where: { id: testCoop.id },
          update: {},
          create: {
            id: testCoop.id,
            code: testCoop.code,
            cuit: testCoop.cuit,
            name: testCoop.name,
            votes: null,
            substitutes: null,
            car: null,
            carName: null,
            verificationCode: null,
            address: testCoop.address,
            phone: testCoop.phone,
            email: testCoop.email,
            president: null,
            secretary: null,
            treasurer: null,
            status: testCoop.status,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`   ✅ Created test cooperative ${testCoop.id}: ${testCoop.name}`);
      } catch (error) {
        console.warn(`⚠️  Failed to create test cooperative ${testCoop.id}: ${error}`);
      }
    }
    
    for (const coop of cooperatives) {
      try {
        const code = safeInt(coop.code);
        if (!code) {
          console.warn(`⚠️  Skipping cooperative ${coop.id}: invalid code "${coop.code}"`);
          continue;
        }
        
        await prisma.cooperative.upsert({
          where: { id: coop.id },
          update: {},
          create: {
            id: coop.id,
            code: code,
            cuit: cleanString(coop.cuit) || '',
            name: cleanString(coop.name) || '',
            votes: safeInt(coop.votes),
            substitutes: safeInt(coop.substitutes),
            car: safeInt(coop.car),
            carName: cleanString(coop.car_name),
            verificationCode: cleanString(coop.verification_code),
            address: cleanString(coop.address),
            phone: cleanString(coop.phone),
            email: cleanString(coop.email),
            president: cleanString(coop.president),
            secretary: cleanString(coop.secretary),
            treasurer: cleanString(coop.treasurer),
            status: cleanString(coop.status) || 'active',
            createdAt: coop.created_at ? new Date(coop.created_at) : new Date(),
            updatedAt: coop.updated_at ? new Date(coop.updated_at) : new Date()
          }
        });
      } catch (error) {
        console.warn(`⚠️  Skipping cooperative ${coop.id}: ${error}`);
      }
    }
    console.log('✅ Cooperatives migrated successfully');

    // 2. Create test users for missing supplier references
    console.log('👤 Creating test users...');
    const testUsers = [
      {
        id: 5,
        username: 'test-supplier-5',
        email: 'supplier5@test.com',
        password: 'hashed_password',
        role: 'supplier',
        cooperativeId: 1, // Reference to test cooperative 1
        fullName: 'Test Supplier 5',
        companyName: 'Test Supplier Company',
        cuit: '20-11111111-1'
      }
    ];

    for (const testUser of testUsers) {
      try {
        await prisma.user.upsert({
          where: { id: testUser.id },
          update: {},
          create: {
            id: testUser.id,
            username: testUser.username,
            email: testUser.email,
            password: testUser.password,
            role: testUser.role,
            cooperativeId: testUser.cooperativeId,
            fullName: testUser.fullName,
            companyName: testUser.companyName,
            cuit: testUser.cuit,
            createdAt: new Date()
          }
        });
        console.log(`   ✅ Created test user ${testUser.id}: ${testUser.fullName}`);
      } catch (error) {
        console.warn(`⚠️  Failed to create test user ${testUser.id}: ${error}`);
      }
    }

    // 3. Migrate Users (depends on cooperatives)
    console.log('👥 Migrating users...');
    const users = await queryOldDb('SELECT * FROM users ORDER BY id');
    console.log(`   Found ${users.length} users`);
    
    for (const user of users) {
      try {
        const cooperativeId = safeInt(user.cooperative_id);
        
        // Skip users with invalid cooperative references
        if (cooperativeId && cooperativeId !== 0) {
          const coopExists = await prisma.cooperative.findUnique({
            where: { id: cooperativeId }
          });
          if (!coopExists) {
            console.warn(`⚠️  Skipping user ${user.id}: cooperative ${cooperativeId} doesn't exist`);
            continue;
          }
        }
        
        await prisma.user.upsert({
          where: { id: user.id },
          update: {},
          create: {
            id: user.id,
            username: cleanString(user.username) || '',
            email: cleanString(user.email) || '',
            password: cleanString(user.password) || '',
            role: cleanString(user.role) || 'user',
            cooperativeId: cooperativeId,
            fullName: cleanString(user.full_name),
            companyName: cleanString(user.company_name),
            cuit: cleanString(user.cuit),
            createdAt: user.created_at ? new Date(user.created_at) : new Date()
          }
        });
      } catch (error) {
        console.warn(`⚠️  Skipping user ${user.id}: ${error}`);
      }
    }
    console.log('✅ Users migrated successfully');

    // 4. Migrate Invoices (depends on cooperatives and users)
    console.log('📄 Migrating invoices...');
    const invoices = await queryOldDb('SELECT * FROM invoices ORDER BY id');
    console.log(`   Found ${invoices.length} invoices`);
    
    for (const invoice of invoices) {
      try {
        const cooperativeId = safeInt(invoice.cooperative_id);
        const supplierId = safeInt(invoice.supplier_id);
        
        if (!cooperativeId) {
          console.warn(`⚠️  Skipping invoice ${invoice.id}: missing cooperativeId`);
          continue;
        }
        
        // Check if cooperative exists
        const coopExists = await prisma.cooperative.findUnique({
          where: { id: cooperativeId }
        });
        if (!coopExists) {
          console.warn(`⚠️  Skipping invoice ${invoice.id}: cooperative ${cooperativeId} doesn't exist`);
          continue;
        }
        
        // Check if supplier exists (if provided)
        if (supplierId) {
          const supplierExists = await prisma.user.findUnique({
            where: { id: supplierId }
          });
          if (!supplierExists) {
            console.warn(`⚠️  Skipping invoice ${invoice.id}: supplier ${supplierId} doesn't exist`);
            continue;
          }
        }
        
        await prisma.invoice.upsert({
          where: { id: invoice.id },
          update: {},
          create: {
            id: invoice.id,
            invoiceNumber: cleanString(invoice.invoice_number) || '',
            issueDate: new Date(invoice.issue_date),
            issuerCuit: cleanString(invoice.issuer_cuit) || '',
            receiverCuit: cleanString(invoice.receiver_cuit) || '',
            cooperativeId: cooperativeId,
            supplierId: supplierId,
            subtotal: safeFloat(invoice.subtotal),
            ivaAmount: safeFloat(invoice.iva_amount),
            totalAmount: safeFloat(invoice.total_amount) || 0,
            status: cleanString(invoice.status) || 'pendiente_validacion',
            filePath: cleanString(invoice.file_path),
            originalFilename: cleanString(invoice.original_filename),
            rejectionReason: cleanString(invoice.rejection_reason),
            createdAt: invoice.created_at ? new Date(invoice.created_at) : new Date(),
            updatedAt: invoice.updated_at ? new Date(invoice.updated_at) : new Date(),
            validatedAt: invoice.validated_at ? new Date(invoice.validated_at) : null,
            sentAt: invoice.sent_at ? new Date(invoice.sent_at) : null,
            respondedAt: invoice.responded_at ? new Date(invoice.responded_at) : null
          }
        });
      } catch (error) {
        console.warn(`⚠️  Skipping invoice ${invoice.id}: ${error}`);
      }
    }
    console.log('✅ Invoices migrated successfully');

    // 5. Migrate Invoice Items (if table exists)
    try {
      console.log('📝 Migrating invoice items...');
      const invoiceItems = await queryOldDb('SELECT * FROM invoice_items ORDER BY id');
      console.log(`   Found ${invoiceItems.length} invoice items`);
      
      for (const item of invoiceItems) {
        try {
          const invoiceId = safeInt(item.invoice_id);
          if (!invoiceId) {
            console.warn(`⚠️  Skipping invoice item ${item.id}: missing invoiceId`);
            continue;
          }
          
          // Check if invoice exists
          const invoiceExists = await prisma.invoice.findUnique({
            where: { id: invoiceId }
          });
          if (!invoiceExists) {
            console.warn(`⚠️  Skipping invoice item ${item.id}: invoice ${invoiceId} doesn't exist`);
            continue;
          }
          
          await prisma.invoiceItem.upsert({
            where: { id: item.id },
            update: {},
            create: {
              id: item.id,
              invoiceId: invoiceId,
              description: cleanString(item.description) || '',
              quantity: safeFloat(item.quantity) || 1,
              unitPrice: safeFloat(item.unit_price) || 0,
              totalPrice: safeFloat(item.total_price) || 0,
              createdAt: item.created_at ? new Date(item.created_at) : new Date()
            }
          });
        } catch (error) {
          console.warn(`⚠️  Skipping invoice item ${item.id}: ${error}`);
        }
      }
      console.log('✅ Invoice items migrated successfully');
    } catch (error) {
      console.log('⚠️  Invoice items table not found, skipping...');
    }

    // 6. Migrate Invoice Attachments (if table exists)
    try {
      console.log('📎 Migrating invoice attachments...');
      const attachments = await queryOldDb('SELECT * FROM invoice_attachments ORDER BY id');
      console.log(`   Found ${attachments.length} attachments`);
      
      for (const attachment of attachments) {
        try {
          const invoiceId = safeInt(attachment.invoice_id);
          if (!invoiceId) {
            console.warn(`⚠️  Skipping attachment ${attachment.id}: missing invoiceId`);
            continue;
          }
          
          // Check if invoice exists
          const invoiceExists = await prisma.invoice.findUnique({
            where: { id: invoiceId }
          });
          if (!invoiceExists) {
            console.warn(`⚠️  Skipping attachment ${attachment.id}: invoice ${invoiceId} doesn't exist`);
            continue;
          }
          
          await prisma.invoiceAttachment.upsert({
            where: { id: attachment.id },
            update: {},
            create: {
              id: attachment.id,
              invoiceId: invoiceId,
              filePath: cleanString(attachment.file_path) || '',
              originalFilename: cleanString(attachment.original_filename) || '',
              fileSize: safeInt(attachment.file_size) || 0,
              mimeType: cleanString(attachment.mime_type) || '',
              description: cleanString(attachment.description),
              createdAt: attachment.created_at ? new Date(attachment.created_at) : new Date()
            }
          });
        } catch (error) {
          console.warn(`⚠️  Skipping attachment ${attachment.id}: ${error}`);
        }
      }
      console.log('✅ Invoice attachments migrated successfully');
    } catch (error) {
      console.log('⚠️  Invoice attachments table not found, skipping...');
    }

    // 7. Migrate Pending Changes (if table exists)
    try {
      console.log('🔄 Migrating pending changes...');
      const pendingChanges = await queryOldDb('SELECT * FROM pending_changes ORDER BY id');
      console.log(`   Found ${pendingChanges.length} pending changes`);
      
      for (const change of pendingChanges) {
        await prisma.pendingChange.upsert({
          where: { id: change.id },
          update: {},
          create: {
            id: change.id,
            cooperativeId: change.cooperative_id,
            userId: change.user_id,
            changes: change.changes,
            status: change.status || 'pending',
            createdAt: change.created_at ? new Date(change.created_at) : new Date(),
            reviewedBy: change.reviewed_by,
            reviewedAt: change.reviewed_at ? new Date(change.reviewed_at) : null
          }
        });
      }
      console.log('✅ Pending changes migrated successfully');
    } catch (error) {
      console.log('⚠️  Pending changes table not found, skipping...');
    }

    // Summary
    console.log('\n🎉 Migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${await prisma.user.count()}`);
    console.log(`   🏢 Cooperatives: ${await prisma.cooperative.count()}`);
    console.log(`   📄 Invoices: ${await prisma.invoice.count()}`);
    console.log(`   📝 Invoice Items: ${await prisma.invoiceItem.count()}`);
    console.log(`   📎 Attachments: ${await prisma.invoiceAttachment.count()}`);
    console.log(`   🔄 Pending Changes: ${await prisma.pendingChange.count()}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    oldDb.close();
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('🏁 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export default migrateData;