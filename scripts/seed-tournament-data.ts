import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTournamentData() {
  try {
    // Get existing tournaments
    const tournaments = await prisma.tournaments.findMany({
      take: 2 // Just seed data for first 2 tournaments
    });

    if (tournaments.length === 0) {
      console.log('No tournaments found, skipping tournament data seeding');
      return;
    }

    // Get some users for the tournament
    const users = await prisma.user.findMany({
      take: 8 // Get 8 users for bracket
    });

    if (users.length < 4) {
      console.log('Need at least 4 users for tournament seeding');
      return;
    }

    for (const tournament of tournaments) {
      console.log(`Seeding data for tournament: ${tournament.name}`);

      // Create tournament results (for completed tournaments)
      if (tournament.status === 'COMPLETED') {
        const results = [
          { user_id: users[0].user_id, placement: 1, prize_amount: '1000' },
          { user_id: users[1].user_id, placement: 2, prize_amount: '500' },
          { user_id: users[2].user_id, placement: 3, prize_amount: '250' },
          { user_id: users[3].user_id, placement: 4, prize_amount: '100' },
        ];

        for (const result of results) {
          await prisma.tournamentResults.upsert({
            where: {
              tournament_id_user_id: {
                tournament_id: tournament.tournament_id,
                user_id: result.user_id
              }
            },
            update: {},
            create: {
              tournament_id: tournament.tournament_id,
              user_id: result.user_id,
              placement: result.placement,
              prize_amount: result.prize_amount
            }
          });
        }
      }

      // Create bracket matches (for all tournaments)
      const bracketMatches = [
        // Round 1 (Semi-finals)
        {
          round_number: 1,
          match_number: 1,
          player1_id: users[0].user_id,
          player2_id: users[1].user_id,
          winner_id: tournament.status === 'COMPLETED' ? users[0].user_id : null,
          player1_score: tournament.status === 'COMPLETED' ? 3 : 0,
          player2_score: tournament.status === 'COMPLETED' ? 1 : 0,
          status: tournament.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'
        },
        {
          round_number: 1,
          match_number: 2,
          player1_id: users[2].user_id,
          player2_id: users[3].user_id,
          winner_id: tournament.status === 'COMPLETED' ? users[2].user_id : null,
          player1_score: tournament.status === 'COMPLETED' ? 3 : 0,
          player2_score: tournament.status === 'COMPLETED' ? 2 : 0,
          status: tournament.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'
        },
        // Round 2 (Final)
        {
          round_number: 2,
          match_number: 1,
          player1_id: tournament.status === 'COMPLETED' ? users[0].user_id : null,
          player2_id: tournament.status === 'COMPLETED' ? users[2].user_id : null,
          winner_id: tournament.status === 'COMPLETED' ? users[0].user_id : null,
          player1_score: tournament.status === 'COMPLETED' ? 3 : 0,
          player2_score: tournament.status === 'COMPLETED' ? 1 : 0,
          status: tournament.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'
        }
      ];

      for (const match of bracketMatches) {
        await prisma.tournamentBrackets.create({
          data: {
            tournament_id: tournament.tournament_id,
            round_number: match.round_number,
            match_number: match.match_number,
            player1_id: match.player1_id,
            player2_id: match.player2_id,
            winner_id: match.winner_id,
            player1_score: match.player1_score,
            player2_score: match.player2_score,
            status: match.status as any
          }
        });
      }
    }

    console.log('Tournament data seeded successfully!');
  } catch (error) {
    console.error('Error seeding tournament data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTournamentData();
