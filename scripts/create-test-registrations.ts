import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestRegistrations() {
  try {
    console.log('🎮 Creating test tournament registrations...');

    // Get all tournaments
    const tournaments = await prisma.tournaments.findMany({
      where: {
        status: 'UPCOMING'
      },
      take: 2 // Just work with first 2 tournaments
    });

    if (tournaments.length === 0) {
      console.log('❌ No upcoming tournaments found');
      return;
    }

    // Get some users to register
    const users = await prisma.user.findMany({
      take: 8 // Get up to 8 users for testing
    });

    if (users.length < 2) {
      console.log('❌ Need at least 2 users in database');
      return;
    }

    console.log(`👥 Found ${users.length} users and ${tournaments.length} tournaments`);

    for (const tournament of tournaments) {
      console.log(`🏆 Processing tournament: ${tournament.name}`);
      
      // Check existing registrations
      const existing = await prisma.tournamentRegistrations.findMany({
        where: { tournament_id: tournament.tournament_id }
      });
      
      if (existing.length > 0) {
        console.log(`✅ Tournament already has ${existing.length} registrations, skipping...`);
        continue;
      }

      // Register 4-6 random users for each tournament
      const numToRegister = Math.min(users.length, Math.floor(Math.random() * 3) + 4);
      const selectedUsers = users.slice(0, numToRegister);

      console.log(`📝 Registering ${selectedUsers.length} users: ${selectedUsers.map(u => u.name).join(', ')}`);

      // Create registrations
      await prisma.tournamentRegistrations.createMany({
        data: selectedUsers.map(user => ({
          user_id: user.user_id,
          tournament_id: tournament.tournament_id,
          registration_date: new Date(),
          status: 'CONFIRMED',
          created_at: new Date(),
          updated_at: new Date()
        }))
      });

      console.log(`✅ Created ${selectedUsers.length} registrations for ${tournament.name}`);
    }

    console.log('🎯 Test registrations created successfully!');

  } catch (error) {
    console.error('❌ Error creating test registrations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestRegistrations();
