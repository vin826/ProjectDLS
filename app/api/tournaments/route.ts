import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tournaments = await prisma.tournaments.findMany({
      include: {
        currency: {
          select: {
            name: true,
            symbol: true
          }
        },
        registrations: true,
        card: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Transform the data to handle BigInt serialization
    const transformedTournaments = tournaments.map(tournament => ({
      tournament_id: tournament.tournament_id,
      name: tournament.name,
      description: tournament.description,
      format: tournament.format,
      status: tournament.status,
      start_date: tournament.start_date.toISOString(),
      end_date: tournament.end_date.toISOString(),
      entry_fee_amount: tournament.entry_fee_amount.toString(),
      max_participants: tournament.max_participants,
      currency_symbol: tournament.currency.symbol,
      registration_count: tournament.registrations.length,
      card_id: tournament.card_id,
      card_title: tournament.card?.title,
      created_at: tournament.created_at.toISOString(),
      updated_at: tournament.updated_at.toISOString()
    }));

    return NextResponse.json(transformedTournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      name,
      description,
      format,
      start_date,
      end_date,
      entry_fee_amount,
      max_participants,
      card_id
    } = data;

    // Get default currency (DLP or USD)
    const currency = await prisma.currencies.findFirst({
      where: {
        OR: [
          { symbol: 'DLP' },
          { symbol: 'USD' }
        ]
      }
    });

    if (!currency) {
      return NextResponse.json(
        { error: 'No valid currency found' },
        { status: 400 }
      );
    }

    // Get a user to be the creator (you might want to get this from session)
    const creator = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!creator) {
      return NextResponse.json(
        { error: 'No admin user found to create tournament' },
        { status: 400 }
      );
    }

    const tournament = await prisma.tournaments.create({
      data: {
        name,
        description,
        format,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        entry_fee_amount: parseFloat(entry_fee_amount),
        entry_fee_currency_id: currency.currency_id,
        max_participants,
        status: 'UPCOMING',
        created_by: creator.user_id,
        card_id: card_id ? parseInt(card_id) : null,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      tournament_id: tournament.tournament_id,
      name: tournament.name,
      description: tournament.description,
      format: tournament.format,
      status: tournament.status,
      start_date: tournament.start_date.toISOString(),
      end_date: tournament.end_date.toISOString(),
      entry_fee_amount: tournament.entry_fee_amount.toString(),
      max_participants: tournament.max_participants,
      card_id: tournament.card_id,
      created_at: tournament.created_at.toISOString()
    });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}
