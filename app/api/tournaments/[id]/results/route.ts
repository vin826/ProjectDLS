import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = id;

    const results = await prisma.tournamentResults.findMany({
      where: { tournament_id: tournamentId },
      include: {
        user: {
          select: {
            user_id: true,
            name: true
          }
        },
        prize_currency: {
          select: {
            symbol: true
          }
        }
      },
      orderBy: {
        placement: 'asc'
      }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching tournament results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament results' },
      { status: 500 }
    );
  }
}
