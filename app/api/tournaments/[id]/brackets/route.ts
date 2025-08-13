import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = id;

    const brackets = await prisma.tournamentBrackets.findMany({
      where: { tournament_id: tournamentId },
      include: {
        player1: {
          select: {
            user_id: true,
            name: true
          }
        },
        player2: {
          select: {
            user_id: true,
            name: true
          }
        },
        winner: {
          select: {
            user_id: true,
            name: true
          }
        }
      },
      orderBy: [
        { round_number: 'asc' },
        { match_number: 'asc' }
      ]
    });

    return NextResponse.json(brackets);
  } catch (error) {
    console.error('Error fetching tournament brackets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament brackets' },
      { status: 500 }
    );
  }
}
