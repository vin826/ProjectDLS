import { NextRequest } from 'next/server';
import { CardController } from '@/controllers/CardController';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cardId = parseInt(id);
  if (isNaN(cardId)) {
    return new Response(JSON.stringify({ error: 'Invalid card ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return CardController.updateCard(request, cardId);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cardId = parseInt(id);
  if (isNaN(cardId)) {
    return new Response(JSON.stringify({ error: 'Invalid card ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return CardController.deleteCard(cardId);
}