const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Connection successful!');
    
    // Test cards query
    const cards = await prisma.card.findMany();
    console.log(`✅ Found ${cards.length} cards in database`);
    
    // Test users query
    const users = await prisma.user.findMany();
    console.log(`✅ Found ${users.length} users in database`);
    
    console.log('🎉 Database is fully accessible!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
