import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = id;

    // Get tournament registrations with user details
    const registrations = await prisma.tournamentRegistrations.findMany({
      where: { 
        tournament_id: tournamentId,
        status: 'CONFIRMED' // Only get confirmed registrations
      },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            email: true,
            created_at: true
          }
        }
      },
      orderBy: {
        registration_date: 'asc'
      }
    });

    // Transform the data to make it easier to work with
    const players = registrations.map(reg => ({
      user_id: reg.user.user_id,
      name: reg.user.name,
      email: reg.user.email,
      registration_date: reg.registration_date,
      registration_id: reg.registration_id
    }));

    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching tournament registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament registrations' },
      { status: 500 }
    );
  }
}
