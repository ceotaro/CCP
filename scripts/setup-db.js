const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Setting up database...');
    
    // Check if we're in production and using PostgreSQL
    if (process.env.DATABASE_PROVIDER === 'postgresql') {
      console.log('📊 Using PostgreSQL - checking for enum types...');
      
      // Create enum types if they don't exist (for PostgreSQL)
      await prisma.$executeRaw`
        DO $$ BEGIN
          CREATE TYPE "UserRole" AS ENUM ('admin', 'merchant', 'user');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `;
      
      await prisma.$executeRaw`
        DO $$ BEGIN
          CREATE TYPE "TransactionType" AS ENUM ('transfer', 'issue', 'burn');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `;
      
      console.log('✅ Enum types created/verified');
    }
    
    // Test connection
    await prisma.user.findFirst();
    console.log('✅ Database connection successful');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    
    if (error.message.includes('does not exist')) {
      console.log('💡 Run the schema migration with: npm run prisma:deploy');
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };