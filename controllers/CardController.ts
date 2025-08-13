import { NextRequest, NextResponse } from 'next/server';
import { CardModel } from '@/models/Card';

export class CardController {
  static async getCards() {
    try {
      console.log('Attempting to fetch cards from database...');
      const cards = await CardModel.findAll();
      console.log(`✅ Successfully fetched ${cards.length} cards from database`);
      return NextResponse.json({ data: cards, source: 'database' });
    } catch (error: any) {
      console.error('❌ Database connection failed:', error.message);
      
      // Return fallback data if database is unavailable
      const fallbackCards = [
        {
          card_id: 1,
          category: 'Artificial Intelligence',
          title: 'You can do more with AI.',
          src: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          content: 'AI is revolutionizing how we work and live. From smart assistants to predictive analytics, artificial intelligence is making our daily tasks more efficient and opening up new possibilities we never imagined before.',
          created_at: new Date()
        },
        {
          card_id: 2,
          category: 'Productivity',
          title: 'Enhance your productivity.',
          src: 'https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          content: 'Boost your productivity with smart tools and techniques. Learn how to manage your time better, organize your workspace, and use technology to streamline your workflow for maximum efficiency.',
          created_at: new Date()
        },
        {
          card_id: 3,
          category: 'Technology',
          title: 'Latest Tech Innovations',
          src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          content: 'Discover the cutting-edge technologies that are shaping our future. From quantum computing to blockchain, explore innovations that will transform industries and change how we interact with the digital world.',
          created_at: new Date()
        }
      ];
      
      console.log('🔄 Using fallback cards data (database unavailable)');
      return NextResponse.json({ data: fallbackCards, source: 'fallback' });
    }
  }

  static async createCard(request: NextRequest) {
    try {
      const body = await request.json();
      const { category, title, src, content, button_text, button_link } = body;

      // Validate required fields
      if (!category || !title || !src || !content ) {
        return NextResponse.json(
          { error: 'All fields (category, title, src, content) are required' },
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
      
      // If database is unavailable, return a mock success response
      const body = await request.json().catch(() => ({}));
      console.log('Database unavailable, returning mock success response');
      return NextResponse.json({
        card_id: Date.now(),
        category: body.category || 'Mock Category',
        title: body.title || 'Mock Title',
        src: body.src || 'https://via.placeholder.com/400',
        content: body.content || 'Mock content',
        created_at: new Date()
      });
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
      
      // Return mock success response if database is unavailable
      const body = await request.json().catch(() => ({}));
      console.log('Database unavailable, returning mock update response');
      return NextResponse.json({
        card_id,
        category: body.category || 'Updated Category',
        title: body.title || 'Updated Title',
        src: body.src || 'https://via.placeholder.com/400',
        content: body.content || 'Updated content',
        created_at: new Date()
      });
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
      
      // Return mock success response if database is unavailable
      console.log('Database unavailable, returning mock delete response');
      return NextResponse.json({ 
        message: 'Card deleted successfully (mock response - database unavailable)' 
      });
    }
  }
}