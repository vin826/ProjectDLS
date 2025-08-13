import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = id;

    console.log('🏆 Generating brackets for tournament:', tournamentId);

    // Check if tournament exists
    const tournament = await prisma.tournaments.findUnique({
      where: { tournament_id: tournamentId },
      include: {
        registrations: {
          include: {
            user: true
          }
        }
      }
    });

    if (!tournament) {
      console.log('❌ Tournament not found:', tournamentId);
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    console.log('✅ Tournament found:', tournament.name);
    console.log('📊 Registrations:', tournament.registrations?.length || 0);

    // Check if brackets already exist
    const existingBrackets = await prisma.tournamentBrackets.findMany({
      where: { tournament_id: tournamentId }
    });

    if (existingBrackets.length > 0) {
      console.log('⚠️ Brackets already exist for this tournament:', existingBrackets.length, 'matches found');
      return NextResponse.json(
        { 
          error: 'Brackets already exist for this tournament',
          details: `Found ${existingBrackets.length} existing matches. Use the bracket editor to modify existing brackets.`
        },
        { status: 400 }
      );
    }

    // Get registered users
    const registeredUsers = tournament.registrations
      ?.filter(reg => reg.status === 'CONFIRMED')
      .map(reg => reg.user) || [];

    console.log('👥 Confirmed registered users:', registeredUsers.length);

    // If no registrations exist, create some test registrations with existing users
    if (registeredUsers.length === 0) {
      console.log('🧪 No registrations found, creating test registrations...');
      
      // Get first 2 users from the database
      const users = await prisma.user.findMany({
        take: 4
      });

      if (users.length >= 2) {
        console.log('👤 Creating registrations for users:', users.map(u => u.name).join(', '));
        
        // Create registrations for these users
        await prisma.tournamentRegistrations.createMany({
          data: users.slice(0, 4).map(user => ({
            user_id: user.user_id,
            tournament_id: tournamentId,
            registration_date: new Date(),
            status: 'CONFIRMED' as const,
            created_at: new Date(),
            updated_at: new Date()
          }))
        });

        // Refetch tournament with new registrations
        const updatedTournament = await prisma.tournaments.findUnique({
          where: { tournament_id: tournamentId },
          include: {
            registrations: {
              include: {
                user: true
              }
            }
          }
        });

        registeredUsers.push(...(updatedTournament?.registrations
          ?.filter(reg => reg.status === 'CONFIRMED')
          .map(reg => reg.user) || []));
        
        console.log('✅ Created test registrations. Total confirmed users:', registeredUsers.length);
      }
    }

    if (registeredUsers.length < 2) {
      console.log('⚠️ Not enough registered users. Need at least 2, have:', registeredUsers.length);
      return NextResponse.json(
        { error: `Need at least 2 registered users to generate brackets. Currently have: ${registeredUsers.length}` },
        { status: 400 }
      );
    }

    // For now, let's create a simple single elimination bracket
    // In a real implementation, you'd want more sophisticated bracket generation
    const matches = [];
    let currentRound = 1;
    let players = [...registeredUsers];

    // Shuffle players for random seeding
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    // Generate first round matches
    let matchNumber = 1;
    for (let i = 0; i < players.length - 1; i += 2) {
      const player1 = players[i];
      const player2 = players[i + 1] || null;

        matches.push({
          tournament_id: tournamentId,
          round_number: currentRound,
          match_number: matchNumber,
          player1_id: player1.user_id,
          player2_id: player2?.user_id || null,
          winner_id: null,
          player1_score: 0,
          player2_score: 0,
          status: 'PENDING' as const,
          created_at: new Date(),
          updated_at: new Date()
        });      matchNumber++;
    }

    // Generate subsequent rounds (empty for now)
    let remainingPlayers = Math.ceil(players.length / 2);
    currentRound++;

    while (remainingPlayers > 1) {
      matchNumber = 1;
      for (let i = 0; i < Math.ceil(remainingPlayers / 2); i++) {
        matches.push({
          tournament_id: tournamentId,
          round_number: currentRound,
          match_number: matchNumber,
          player1_id: null,
          player2_id: null,
          winner_id: null,
          player1_score: 0,
          player2_score: 0,
          status: 'PENDING' as const,
          created_at: new Date(),
          updated_at: new Date()
        });
        matchNumber++;
      }

      remainingPlayers = Math.ceil(remainingPlayers / 2);
      currentRound++;
    }

    // Insert all matches
    await prisma.tournamentBrackets.createMany({
      data: matches
    });

    // Update tournament status
    await prisma.tournaments.update({
      where: { tournament_id: tournamentId },
      data: {
        status: 'ONGOING',
        updated_at: new Date()
      }
    });

    return NextResponse.json({ message: 'Brackets generated successfully' });
  } catch (error) {
    console.error('Error generating brackets:', error);
    return NextResponse.json(
      { error: 'Failed to generate brackets' },
      { status: 500 }
    );
  }
}
