import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const matchId = id;
    const data = await request.json();

    const {
      player1_id,
      player2_id,
      winner_id,
      player1_score,
      player2_score,
      status
    } = data;

    const updatedMatch = await prisma.tournamentBrackets.update({
      where: { bracket_id: matchId },
      data: {
        player1_id: player1_id || null,
        player2_id: player2_id || null,
        winner_id: winner_id || null,
        player1_score: player1_score ? parseInt(player1_score) : 0,
        player2_score: player2_score ? parseInt(player2_score) : 0,
        status: status as any,
        updated_at: new Date(),
        ...(status === 'COMPLETED' ? { completed_time: new Date() } : {})
      }
    });

    // If match is completed, advance winner to next round
    if (status === 'COMPLETED' && winner_id) {
      await advanceWinnerToNextRound(updatedMatch);
    }

    return NextResponse.json({
      message: 'Match updated successfully',
      match: {
        bracket_id: updatedMatch.bracket_id,
        tournament_id: updatedMatch.tournament_id,
        round_number: updatedMatch.round_number,
        match_number: updatedMatch.match_number,
        player1_id: updatedMatch.player1_id,
        player2_id: updatedMatch.player2_id,
        winner_id: updatedMatch.winner_id,
        player1_score: updatedMatch.player1_score,
        player2_score: updatedMatch.player2_score,
        status: updatedMatch.status,
        updated_at: updatedMatch.updated_at.toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}

async function advanceWinnerToNextRound(completedMatch: any) {
  try {
    const nextRound = completedMatch.round_number + 1;
    const nextMatchNumber = Math.ceil(completedMatch.match_number / 2);

    // Find the next round match
    const nextMatch = await prisma.tournamentBrackets.findFirst({
      where: {
        tournament_id: completedMatch.tournament_id,
        round_number: nextRound,
        match_number: nextMatchNumber
      }
    });

    if (nextMatch) {
      // Determine which slot to fill in the next match
      const isFirstSlot = completedMatch.match_number % 2 === 1;
      
      await prisma.tournamentBrackets.update({
        where: { bracket_id: nextMatch.bracket_id },
        data: {
          [isFirstSlot ? 'player1_id' : 'player2_id']: completedMatch.winner_id,
          updated_at: new Date()
        }
      });
    }
  } catch (error) {
    console.error('Error advancing winner to next round:', error);
  }
}
