import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTournaments() {
  try {
    console.log('Checking tournaments in database...');
    const tournaments = await prisma.tournaments.findMany({
      select: {
        tournament_id: true,
        name: true,
        card_id: true,
        status: true,
      }
    });

    console.log('Found tournaments:');
    tournaments.forEach(tournament => {
      console.log(`- Name: "${tournament.name}", Card ID: ${tournament.card_id}, Status: ${tournament.status}`);
    });

    if (tournaments.length === 0) {
      console.log('No tournaments found in database!');
    }

    // Also check if tournaments have card_id assigned
    console.log('\nTournaments by card:');
    for (let i = 1; i <= 6; i++) {
      const cardTournaments = tournaments.filter(t => t.card_id === i);
      console.log(`Card ${i}: ${cardTournaments.length} tournaments`);
    }

  } catch (error) {
    console.error('Error checking tournaments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTournaments();
