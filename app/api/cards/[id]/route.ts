import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update card
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { category, title, src, content } = body;
    const cardId = parseInt(params.id);

    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      );
    }

    // Check if card exists
    const existingCard = await prisma.card.findUnique({
      where: { card_id: cardId }
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (category) updateData.category = category;
    if (title) updateData.title = title;
    if (src) updateData.src = src;
    if (content) updateData.content = content;

    const updatedCard = await prisma.card.update({
      where: { card_id: cardId },
      data: updateData,
      select: {
        id: true,
        category: true,
        title: true,
        src: true,
        content: true,
        created_at: true,
      }
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

// DELETE card
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cardId = parseInt(params.id);

    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Invalid card ID' },
        { status: 400 }
      );
    }

    // Check if card exists
    const existingCard = await prisma.card.findUnique({
      where: {card_id: cardId }
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    await prisma.card.delete({
      where: { card_id: cardId }
    });

    return NextResponse.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}