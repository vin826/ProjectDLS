import { prisma } from '../lib/prisma';

async function seedDarkLeaguePoints() {
  try {
    console.log('🚀 Setting up Dark League Points...');
    
    // Create Dark League Points currency if it doesn't exist
    let dlpCurrency = await prisma.currencies.findFirst({
      where: { symbol: 'DLP' }
    });
    
    if (!dlpCurrency) {
      dlpCurrency = await prisma.currencies.create({
        data: {
          name: 'Dark League Points',
          symbol: 'DLP',
          exchange_rate: 1.0,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Created Dark League Points currency');
    } else {
      console.log('✅ Dark League Points currency already exists');
    }
    
    // Get all users
    const users = await prisma.user.findMany({
      select: { user_id: true, name: true }
    });
    
    console.log(`👥 Found ${users.length} users`);
    
    // Add random Dark League Points to each user (between 100-1000)
    for (const user of users) {
      const existingBalance = await prisma.userCurrencyBalances.findFirst({
        where: {
          user_id: user.user_id,
          currency_id: dlpCurrency.currency_id
        }
      });
      
      if (!existingBalance) {
        const randomPoints = Math.floor(Math.random() * 900) + 100; // 100-1000 points
        
        await prisma.userCurrencyBalances.create({
          data: {
            user_id: user.user_id,
            currency_id: dlpCurrency.currency_id,
            amount: randomPoints,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        
        console.log(`💰 Added ${randomPoints} DLP to ${user.name}`);
      } else {
        console.log(`💰 ${user.name} already has ${existingBalance.amount} DLP`);
      }
    }
    
    console.log('🎉 Dark League Points setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up Dark League Points:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDarkLeaguePoints();
