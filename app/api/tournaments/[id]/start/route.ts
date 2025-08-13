import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = id;
    
    const { playerOrder } = await request.json();

    console.log('🚀 Starting tournament with player order:', playerOrder);

    // Check if tournament exists
    const tournament = await prisma.tournaments.findUnique({
      where: { tournament_id: tournamentId }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Check if brackets already exist
    const existingBrackets = await prisma.tournamentBrackets.findMany({
      where: { tournament_id: tournamentId }
    });

    if (existingBrackets.length > 0) {
      return NextResponse.json(
        { 
          error: 'Tournament has already been started',
          details: `Found ${existingBrackets.length} existing matches.`
        },
        { status: 400 }
      );
    }

    if (playerOrder.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 players to start tournament' },
        { status: 400 }
      );
    }

    // Generate brackets based on tournament format
    const matches = [];
    const players = playerOrder;

    switch (tournament.format) {
      case 'SINGLE_ELIMINATION':
        const singleElimMatches = generateSingleEliminationBracket(tournamentId, players);
        matches.push(...singleElimMatches);
        break;
      
      case 'DOUBLE_ELIMINATION':
        // For now, treat as single elimination
        const doubleElimMatches = generateSingleEliminationBracket(tournamentId, players);
        matches.push(...doubleElimMatches);
        break;
      
      case 'ROUND_ROBIN':
        const roundRobinMatches = generateRoundRobinBracket(tournamentId, players);
        matches.push(...roundRobinMatches);
        break;
      
      default:
        // Default to single elimination
        const defaultMatches = generateSingleEliminationBracket(tournamentId, players);
        matches.push(...defaultMatches);
        break;
    }

    // Insert all matches
    await prisma.tournamentBrackets.createMany({
      data: matches
    });

    // Update tournament status to ONGOING
    await prisma.tournaments.update({
      where: { tournament_id: tournamentId },
      data: {
        status: 'ONGOING',
        updated_at: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Tournament started successfully',
      matches_created: matches.length
    });

  } catch (error) {
    console.error('Error starting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to start tournament' },
      { status: 500 }
    );
  }
}

function generateSingleEliminationBracket(tournamentId: string, players: string[]) {
  const matches = [];
  let currentRound = 1;
  let matchNumber = 1;

  // Generate first round matches
  for (let i = 0; i < players.length - 1; i += 2) {
    const player1 = players[i];
    const player2 = players[i + 1] || null;

    matches.push({
      tournament_id: tournamentId,
      round_number: currentRound,
      match_number: matchNumber,
      player1_id: player1,
      player2_id: player2,
      winner_id: null,
      player1_score: 0,
      player2_score: 0,
      status: 'PENDING' as const,
      created_at: new Date(),
      updated_at: new Date()
    });
    matchNumber++;
  }

  // Generate subsequent rounds (empty matches that will be filled as winners advance)
  let remainingPlayers = Math.ceil(players.length / 2);
  currentRound++;

  while (remainingPlayers > 1) {
    matchNumber = 1;
    const matchesInRound = Math.ceil(remainingPlayers / 2);
    
    for (let i = 0; i < matchesInRound; i++) {
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

    remainingPlayers = matchesInRound;
    currentRound++;
  }

  return matches;
}

function generateRoundRobinBracket(tournamentId: string, players: string[]) {
  const matches = [];
  let matchNumber = 1;
  const roundNumber = 1; // Round robin is typically one "round" with all matches

  // Generate all possible pairings
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        tournament_id: tournamentId,
        round_number: roundNumber,
        match_number: matchNumber,
        player1_id: players[i],
        player2_id: players[j],
        winner_id: null,
        player1_score: 0,
        player2_score: 0,
        status: 'PENDING' as const,
        created_at: new Date(),
        updated_at: new Date()
      });
      matchNumber++;
    }
  }

  return matches;
}
