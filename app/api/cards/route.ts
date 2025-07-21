import { NextRequest } from 'next/server';
import { CardController } from '@/controllers/CardController';

export async function GET() {
  return CardController.getCards();
}

export async function POST(request: NextRequest) {
  return CardController.createCard(request);
}