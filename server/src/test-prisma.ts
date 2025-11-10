import { PrismaClient } from './generated/prisma';

async function testPrisma() {
  const prisma = new PrismaClient();
  
  console.log('Prisma client created successfully!');
  
  // Test basic connection
  try {
    await prisma.$connect();
    console.log('Database connected successfully!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
    
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();