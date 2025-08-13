import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupTournaments() {
  try {
    console.log('🧹 Starting tournament cleanup...');

    // Get all tournaments with their card associations
    const tournaments = await prisma.tournaments.findMany({
      include: {
        card: true,
        registrations: { include: { user: true } },
        brackets: true,
        results: true
      }
    });

    console.log(`📊 Found ${tournaments.length} tournaments to check`);

    const tournamentsToDelete = [];

    for (const tournament of tournaments) {
      const shouldDelete = 
        // Tournament has a card_id but the card doesn't exist
        (tournament.card_id && !tournament.card) ||
        // Tournament references a card that no longer exists in the database
        (tournament.card_id && tournament.card === null);

      if (shouldDelete) {
        tournamentsToDelete.push(tournament);
        console.log(`❌ Tournament "${tournament.name}" references missing card (ID: ${tournament.card_id})`);
      }
    }

    if (tournamentsToDelete.length === 0) {
      console.log('✅ No tournaments with invalid card references found');
      return;
    }

    console.log(`🗑️ Found ${tournamentsToDelete.length} tournaments to delete:`);
    tournamentsToDelete.forEach(t => {
      console.log(`   - ${t.name} (Card ID: ${t.card_id})`);
    });

    // Delete tournaments with missing card references
    for (const tournament of tournamentsToDelete) {
      console.log(`🗑️ Deleting tournament: ${tournament.name}`);

      // Delete in correct order to avoid foreign key constraints
      
      // 1. Delete brackets
      if (tournament.brackets.length > 0) {
        await prisma.tournamentBrackets.deleteMany({
          where: { tournament_id: tournament.tournament_id }
        });
        console.log(`   ✅ Deleted ${tournament.brackets.length} brackets`);
      }

      // 2. Delete results
      if (tournament.results.length > 0) {
        await prisma.tournamentResults.deleteMany({
          where: { tournament_id: tournament.tournament_id }
        });
        console.log(`   ✅ Deleted ${tournament.results.length} results`);
      }

      // 3. Delete registrations and their payment transactions
      if (tournament.registrations.length > 0) {
        const registrations = await prisma.tournamentRegistrations.findMany({
          where: { tournament_id: tournament.tournament_id },
          include: { payment_transaction: true }
        });

        // Delete payment transactions first
        for (const reg of registrations) {
          if (reg.payment_transaction_id) {
            await prisma.transactions.delete({
              where: { transaction_id: reg.payment_transaction_id }
            });
          }
        }

        await prisma.tournamentRegistrations.deleteMany({
          where: { tournament_id: tournament.tournament_id }
        });
        console.log(`   ✅ Deleted ${tournament.registrations.length} registrations`);
      }

      // 4. Delete the tournament
      await prisma.tournaments.delete({
        where: { tournament_id: tournament.tournament_id }
      });
      console.log(`   ✅ Deleted tournament: ${tournament.name}`);
    }

    console.log(`🎯 Successfully deleted ${tournamentsToDelete.length} tournaments with invalid card references`);

    // Show remaining tournaments
    const remainingTournaments = await prisma.tournaments.findMany({
      include: { card: true }
    });
    
    console.log(`📊 Remaining tournaments: ${remainingTournaments.length}`);
    remainingTournaments.forEach(t => {
      console.log(`   ✅ ${t.name} ${t.card ? `(Card: ${t.card.title})` : '(No card)'}`);
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTournaments();
