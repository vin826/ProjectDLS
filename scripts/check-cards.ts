import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCards() {
  try {
    console.log('Checking cards in database...');
    const cards = await prisma.card.findMany({
      select: {
        card_id: true,
        title: true,
        category: true,
      }
    });

    console.log('Found cards:');
    cards.forEach(card => {
      console.log(`- ID: ${card.card_id}, Title: "${card.title}", Category: "${card.category}"`);
    });

    if (cards.length === 0) {
      console.log('No cards found in database!');
    }

  } catch (error) {
    console.error('Error checking cards:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCards();
