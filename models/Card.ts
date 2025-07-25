import { prisma } from '@/lib/prisma';

export interface CreateCardData {
  category: string;
  title: string;
  src: string;
  content: string;
  button_text?: string;
  button_link?: string;
  created_by?: string;

}

export interface UpdateCardData {
  category?: string;
  title?: string;
  src?: string;
  content?: string;
  button_text?: string;
  button_link?: string;
}

export class CardModel {
  static async findAll() {
    return await prisma.card.findMany({
      select: {
        card_id: true,
        category: true,
        title: true,
        src: true,
        button_link: true,
        button_text: true,
        content: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  static async findById(card_id: number) {
    return await prisma.card.findUnique({
      where: { card_id },
      select: {
        card_id: true,
        category: true,
        title: true,
        src: true,
        content: true,
        button_text: true,
        button_link: true,
        created_at: true,
      }
    });
  }

  static async create(cardData: CreateCardData) {
    return await prisma.card.create({
      data: {
        ...cardData,
        created_at: new Date(),
      },
      select: {
        card_id: true,
        category: true,
        title: true,
        src: true,
        content: true,
        button_text: true,
        button_link: true,
        created_at: true,
      }
    });
  }

  static async update(card_id: number, cardData: UpdateCardData) {
    return await prisma.card.update({
      where: { card_id },
      data: cardData,
      select: {
        card_id: true,
        category: true,
        title: true,
        src: true,
        content: true,
        button_text: true,
        button_link: true,
        created_at: true,
        
      }
    });
  }

  static async delete(card_id: number) {
    return await prisma.card.delete({
      where: { card_id }
    });
  }
}