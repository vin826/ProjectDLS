import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournamentId = id;
    const { userId } = await request.json();

    console.log('📝 Tournament registration request:', { tournamentId, userId });

    // Validate tournament exists and is accepting registrations
    const tournament = await prisma.tournaments.findUnique({
      where: { tournament_id: tournamentId },
      include: {
        registrations: true,
        currency: true
      }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    if (tournament.status !== 'UPCOMING') {
      return NextResponse.json(
        { error: 'Tournament is not accepting registrations' },
        { status: 400 }
      );
    }

    if (tournament.registrations.length >= tournament.max_participants) {
      return NextResponse.json(
        { error: 'Tournament is full' },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const existingRegistration = await prisma.tournamentRegistrations.findFirst({
      where: {
        tournament_id: tournamentId,
        user_id: userId
      }
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'User is already registered for this tournament' },
        { status: 400 }
      );
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { user_id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle payment for paid tournaments
    let paymentTransactionId = null;

    if (tournament.entry_fee_amount.toNumber() > 0) {
      // Create a payment transaction
      const paymentTransaction = await prisma.transactions.create({
        data: {
          user_id: userId,
          currency_id: tournament.entry_fee_currency_id,
          type: 'FEE',
          amount: tournament.entry_fee_amount,
          status: 'COMPLETED', // For now, assume immediate payment
          description: `Tournament entry fee for ${tournament.name}`,
          related_entity_id: tournamentId,
          created_at: new Date()
        }
      });
      paymentTransactionId = paymentTransaction.transaction_id;

      // Deduct amount from user balance (if they have sufficient balance)
      const userBalance = await prisma.userCurrencyBalances.findFirst({
        where: {
          user_id: userId,
          currency_id: tournament.entry_fee_currency_id
        }
      });

      if (!userBalance || userBalance.amount.toNumber() < tournament.entry_fee_amount.toNumber()) {
        // For demo purposes, create/update balance to cover the fee
        if (userBalance) {
          await prisma.userCurrencyBalances.update({
            where: { balance_id: userBalance.balance_id },
            data: {
              amount: { decrement: tournament.entry_fee_amount },
              updated_at: new Date()
            }
          });
        } else {
          // Create initial balance (demo purposes - in real app this would fail)
          await prisma.userCurrencyBalances.create({
            data: {
              user_id: userId,
              currency_id: tournament.entry_fee_currency_id,
              amount: 0, // Start with 0 after payment
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }
      } else {
        // Deduct from existing balance
        await prisma.userCurrencyBalances.update({
          where: { balance_id: userBalance.balance_id },
          data: {
            amount: { decrement: tournament.entry_fee_amount },
            updated_at: new Date()
          }
        });
      }
    }

    // Create the registration
    const registration = await prisma.tournamentRegistrations.create({
      data: {
        user_id: userId,
        tournament_id: tournamentId,
        payment_transaction_id: paymentTransactionId,
        registration_date: new Date(),
        status: 'CONFIRMED',
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('✅ Registration successful:', registration.registration_id);

    return NextResponse.json({
      message: 'Registration successful',
      registration_id: registration.registration_id,
      user: registration.user
    });

  } catch (error) {
    console.error('❌ Error registering for tournament:', error);
    return NextResponse.json(
      { error: 'Failed to register for tournament' },
      { status: 500 }
    );
  }
}
