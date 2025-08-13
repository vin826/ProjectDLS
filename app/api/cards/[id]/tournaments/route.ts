import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cardId = parseInt(id);
    
    console.log('API Route - Card ID:', cardId);
    
    if (isNaN(cardId)) {
      console.log('Invalid card ID:', id);
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      );
    }

    // Get card details
    console.log('Fetching card with ID:', cardId);
    const card = await prisma.card.findUnique({
      where: { card_id: cardId }
    });

    console.log('Card found:', card ? `${card.title} (ID: ${card.card_id})` : 'null');

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Try to get tournaments using the new Prisma schema
    console.log('Fetching tournaments for card:', cardId);
    let tournaments = [];
    
    try {
      tournaments = await prisma.tournaments.findMany({
        where: { card_id: cardId },
        include: {
          currency: {
            select: {
              name: true,
              symbol: true
            }
          },
          registrations: true
        },
        orderBy: {
          start_date: 'asc'
        }
      });

      // Transform the data to match expected format
      const transformedTournaments = tournaments.map(tournament => ({
        ...tournament,
        currency_name: tournament.currency.name,
        currency_symbol: tournament.currency.symbol,
        registration_count: tournament.registrations.length,
        entry_fee_amount: tournament.entry_fee_amount.toString(),
        // Convert any other potential BigInt fields
        tournament_id: tournament.tournament_id,
        name: tournament.name,
        description: tournament.description,
        format: tournament.format,
        status: tournament.status,
        max_participants: tournament.max_participants,
        start_date: tournament.start_date.toISOString(),
        end_date: tournament.end_date.toISOString(),
        created_at: tournament.created_at.toISOString(),
        updated_at: tournament.updated_at.toISOString()
      }));

      console.log(`Found ${tournaments.length} tournaments for card ${cardId}`);

      return NextResponse.json({
        card,
        tournaments: transformedTournaments
      });
    } catch (tournamentError) {
      console.error('Error fetching tournaments with Prisma:', tournamentError);
      
      // Fallback to raw query if Prisma method fails
      try {
        console.log('Trying raw query fallback...');
        const rawTournaments = await prisma.$queryRaw`
          SELECT 
            t.tournament_id::text,
            t.name,
            t.description,
            t.format,
            t.status,
            t.max_participants,
            t.entry_fee_amount::text,
            t.start_date,
            t.end_date,
            t.created_at,
            t.updated_at,
            c.name as currency_name,
            c.symbol as currency_symbol,
            COUNT(tr.registration_id)::int as registration_count
          FROM "Tournaments" t
          LEFT JOIN "Currencies" c ON t.entry_fee_currency_id = c.currency_id
          LEFT JOIN "TournamentRegistrations" tr ON t.tournament_id = tr.tournament_id
          WHERE t.card_id = ${cardId}
          GROUP BY t.tournament_id, t.name, t.description, t.format, t.status, t.max_participants, t.entry_fee_amount, t.start_date, t.end_date, t.created_at, t.updated_at, c.currency_id, c.name, c.symbol
          ORDER BY t.start_date ASC
        `;

        console.log(`Raw query found ${(rawTournaments as any[]).length} tournaments`);

        return NextResponse.json({
          card,
          tournaments: rawTournaments || []
        });
      } catch (rawError) {
        console.error('Raw query also failed:', rawError);
        throw rawError;
      }
    }

  } catch (error) {
    console.error('Error fetching card tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}
