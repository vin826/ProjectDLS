import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = id;

    console.log('🗑️ Deleting tournament:', tournamentId);

    // Check if tournament exists
    const tournament = await prisma.tournaments.findUnique({
      where: { tournament_id: tournamentId }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Delete related data in correct order to avoid foreign key constraints
    
    // 1. Delete tournament brackets
    await prisma.tournamentBrackets.deleteMany({
      where: { tournament_id: tournamentId }
    });
    console.log('✅ Deleted tournament brackets');

    // 2. Delete tournament results
    await prisma.tournamentResults.deleteMany({
      where: { tournament_id: tournamentId }
    });
    console.log('✅ Deleted tournament results');

    // 3. Delete tournament registrations (and their payment transactions)
    const registrations = await prisma.tournamentRegistrations.findMany({
      where: { tournament_id: tournamentId },
      include: { payment_transaction: true }
    });

    // Delete payment transactions first if they exist
    for (const registration of registrations) {
      if (registration.payment_transaction_id) {
        await prisma.transactions.delete({
          where: { transaction_id: registration.payment_transaction_id }
        });
      }
    }

    // Delete registrations
    await prisma.tournamentRegistrations.deleteMany({
      where: { tournament_id: tournamentId }
    });
    console.log('✅ Deleted tournament registrations and payments');

    // 4. Finally delete the tournament
    await prisma.tournaments.delete({
      where: { tournament_id: tournamentId }
    });
    console.log('✅ Deleted tournament');

    return NextResponse.json({ 
      message: 'Tournament deleted successfully',
      deleted_tournament_id: tournamentId
    });

  } catch (error) {
    console.error('❌ Error deleting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = id;

    const tournament = await prisma.tournaments.findUnique({
      where: { tournament_id: tournamentId },
      include: {
        currency: true,
        card: true,
        registrations: {
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                email: true
              }
            }
          }
        },
        brackets: {
          include: {
            player1: { select: { user_id: true, name: true } },
            player2: { select: { user_id: true, name: true } },
            winner: { select: { user_id: true, name: true } }
          }
        }
      }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Transform BigInt fields to strings for JSON serialization
    const transformedTournament = {
      ...tournament,
      entry_fee_amount: tournament.entry_fee_amount.toString(),
      registration_count: tournament.registrations?.length || 0,
      currency_symbol: tournament.currency?.symbol || 'USD'
    };

    return NextResponse.json(transformedTournament);

  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}
