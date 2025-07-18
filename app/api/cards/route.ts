import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all cards
export async function GET() {
  try {
    console.log('Attempting to fetch cards...');
    const cards = await prisma.card.findMany({
      select: {
        card_id: true,
        category: true,
        title: true,
        src: true,
        content: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

// POST create new card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, title, src, content } = body;

    // Validate required fields
    if (!category || !title || !src || !content) {
      return NextResponse.json(
        { error: 'All fields (category, title, src, content) are required' },
        { status: 400 }
      );
    }

    const card = await prisma.card.create({
      data: {
        category,
        title,
        src,
        content,
        created_at: new Date(),
      },
      select: {
        card_id: true,
        category: true,
        title: true,
        src: true,
        content: true,
        created_at: true,
      }
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}