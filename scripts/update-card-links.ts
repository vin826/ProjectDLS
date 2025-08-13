import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCardButtonLinks() {
  try {
    console.log('Updating card button links...');

    // Update cards 4, 5, 6 to point to cards that actually have tournaments
    // Or create tournaments for them
    
    // First, let's see current button links
    const cards = await prisma.card.findMany({
      select: {
        card_id: true,
        title: true,
        button_text: true,
        button_link: true,
      }
    });

    console.log('Current card button links:');
    cards.forEach(card => {
      console.log(`- Card ${card.card_id} (${card.title}): ${card.button_text} -> ${card.button_link}`);
    });

    // Update cards 4, 5, 6 to point to existing tournament pages or create some tournaments
    // For now, let's create tournaments for cards 4, 5, 6

    console.log('\nCreating tournaments for cards 4, 5, 6...');

    // Get a currency for the tournaments
    const currency = await prisma.currencies.findFirst();
    if (!currency) {
      console.log('No currency found, please create one first');
      return;
    }

    // Get a user to create the tournaments
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found, please create one first');
      return;
    }

    const tournamentsData = [
      {
        card_id: 4,
        name: "Valorant Championship Series",
        description: "Compete in the ultimate Valorant tournament",
        format: "SINGLE_ELIMINATION" as const,
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        entry_fee_amount: 50,
        max_participants: 32,
        status: "UPCOMING" as const,
        created_by: user.user_id,
      },
      {
        card_id: 5,
        name: "Fortnite Battle Royale Cup",
        description: "Solo tournament for the best Fortnite players",
        format: "SINGLE_ELIMINATION" as const,
        start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        end_date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000), // 17 days from now
        entry_fee_amount: 25,
        max_participants: 64,
        status: "UPCOMING" as const,
        created_by: user.user_id,
      },
      {
        card_id: 6,
        name: "CS2 Pro League Finals",
        description: "Professional Counter-Strike 2 tournament",
        format: "DOUBLE_ELIMINATION" as const,
        start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        entry_fee_amount: 100,
        max_participants: 16,
        status: "UPCOMING" as const,
        created_by: user.user_id,
      }
    ];

    for (const tournamentData of tournamentsData) {
      await prisma.tournaments.create({
        data: {
          ...tournamentData,
          entry_fee_currency_id: currency.currency_id,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      console.log(`Created tournament for card ${tournamentData.card_id}: ${tournamentData.name}`);
    }

    // Update button links for all cards to point to their tournament pages
    await prisma.card.updateMany({
      where: { card_id: { in: [4, 5, 6] } },
      data: {
        button_text: "View Tournaments",
        button_link: "/cards/{id}/tournaments" // This will be dynamically replaced
      }
    });

    // Update specific cards with proper links
    await prisma.card.update({
      where: { card_id: 4 },
      data: {
        button_text: "View Tournaments",
        button_link: "/cards/4/tournaments"
      }
    });

    await prisma.card.update({
      where: { card_id: 5 },
      data: {
        button_text: "View Tournaments", 
        button_link: "/cards/5/tournaments"
      }
    });

    await prisma.card.update({
      where: { card_id: 6 },
      data: {
        button_text: "View Tournaments",
        button_link: "/cards/6/tournaments"
      }
    });

    console.log('Updated card button links successfully!');

  } catch (error) {
    console.error('Error updating card button links:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCardButtonLinks();
