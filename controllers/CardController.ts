import { NextRequest, NextResponse } from 'next/server';
import { CardModel } from '@/models/Card';

export class CardController {
  static async getCards() {
    try {
      console.log('Attempting to fetch cards...');
      const cards = await CardModel.findAll();
      return NextResponse.json(cards);
    } catch (error) {
      console.error('Error fetching cards:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      );
    }
  }

  static async createCard(request: NextRequest) {
    try {
      const body = await request.json();
      const { category, title, src, content,button_text,button_link} = body;

      // Validate required fields
      if (!category || !title || !src || !content ) {
        return NextResponse.json(
          { error: 'All fields (category, title, src, content, buttonText, buttonLink) are required' },
          { status: 400 }
        );
      }

      const card = await CardModel.create({
        category,
        title,
        src,
        content,
        button_text,
        button_link

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

  static async updateCard(request: NextRequest, card_id: number) {
    try {
      const body = await request.json();
      const { category, title, src, content, button_text, button_link } = body;

      // Check if card exists
      const existingCard = await CardModel.findById(card_id);
      if (!existingCard) {
        return NextResponse.json(
          { error: 'Card not found' },
          { status: 404 }
        );
      }

      const updatedCard = await CardModel.update(card_id, {
        category,
        title,
        src,
        content,
        button_text,
        button_link
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

  static async deleteCard(card_id: number) {
    try {
      const existingCard = await CardModel.findById(card_id);
      if (!existingCard) {
        return NextResponse.json(
          { error: 'Card not found' },
          { status: 404 }
        );
      }

      await CardModel.delete(card_id);
      return NextResponse.json({ message: 'Card deleted successfully' });
    } catch (error) {
      console.error('Error deleting card:', error);
      return NextResponse.json(
        { error: 'Failed to delete card' },
        { status: 500 }
      );
    }
  }
}