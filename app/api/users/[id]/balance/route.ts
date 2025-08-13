import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const currencySymbol = searchParams.get('currency') || 'DLP'; // Default to Dark League Points
    
    console.log('🔍 Balance API called:', { userId: id, currency: currencySymbol });
    
    // First, find or create the currency
    let currency = await prisma.currencies.findFirst({
      where: { symbol: currencySymbol }
    });
    
    if (!currency) {
      // Create Dark League Points currency if it doesn't exist
      currency = await prisma.currencies.create({
        data: {
          name: 'Dark League Points',
          symbol: 'DLP',
          exchange_rate: 1.0,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Created new currency:', currency);
    }
    
    // Find user's balance for this currency
    const balance = await prisma.userCurrencyBalances.findFirst({
      where: {
        user_id: id,
        currency_id: currency.currency_id
      }
    });
    
    console.log('💰 Found balance:', balance);
    
    const response = {
      amount: balance?.amount?.toString() || '0',
      currency: currency.symbol,
      currency_name: currency.name
    };
    
    console.log('📤 Returning balance response:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Error fetching user balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user balance' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { amount, currency = 'DLP' } = await request.json();
    
    // Find the currency
    const currencyRecord = await prisma.currencies.findFirst({
      where: { symbol: currency }
    });
    
    if (!currencyRecord) {
      return NextResponse.json(
        { error: 'Currency not found' },
        { status: 404 }
      );
    }
    
    // Update or create user balance
    const existingBalance = await prisma.userCurrencyBalances.findFirst({
      where: {
        user_id: id,
        currency_id: currencyRecord.currency_id
      }
    });
    
    let balance;
    if (existingBalance) {
      balance = await prisma.userCurrencyBalances.update({
        where: {
          balance_id: existingBalance.balance_id
        },
        data: {
          amount: amount,
          updated_at: new Date()
        }
      });
    } else {
      balance = await prisma.userCurrencyBalances.create({
        data: {
          user_id: id,
          currency_id: currencyRecord.currency_id,
          amount: amount,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      balance: balance.amount.toString()
    });
    
  } catch (error) {
    console.error('Error updating user balance:', error);
    return NextResponse.json(
      { error: 'Failed to update user balance' },
      { status: 500 }
    );
  }
}
