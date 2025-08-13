"use client";
import React, { createContext, useContext, useState, useEffect,  ReactNode } from "react";

interface DataContextType {
  cards: CardData[];
  setCards: (cards: CardData[]) => void;
  addCard: (card: Omit<CardData, 'card_id'>) => void;
  updateCard: (card_id: number, card: Omit<CardData, 'card_id'>) => void;
  deleteCard: (card_id: number) => void;
  loading: boolean;
}

interface CardData {
  card_id: number;
  category: string;
  title: string;
  src: string;
  content: string;
  
  button_text?: string;
  button_link?: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from database when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch cards from database
      const cardsResponse = await fetch('/api/cards');
      if (cardsResponse.ok) {
        const response = await cardsResponse.json();
        // Handle both new format {data: [...], source: 'database'} and old format [...]
        const cardsData = response.data || response;
        setCards(cardsData);
        console.log(`Cards loaded from: ${response.source || 'unknown'}`);
      } else {
        // Fallback to hardcoded data if API fails
        console.error('Failed to fetch cards, using fallback data');
        setCards([
        {
          card_id: 1, // Add this
          category: 'Artificial Intelligence',
          title: 'You can do more with AI.',
          src: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          content: 'AI is revolutionizing how we work and live. From smart assistants to predictive analytics, artificial intelligence is making our daily tasks more efficient and opening up new possibilities we never imagined before.',
          button_text: 'View Tournaments', // Update this
          button_link: '/cards/1/tournaments' // Update this
        },
        {
          card_id: 2, // Add this
          category: 'Productivity',
          title: 'Enhance your productivity.',
          src: 'https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          content: 'Boost your productivity with smart tools and techniques. Learn how to manage your time better, organize your workspace, and use technology to streamline your workflow for maximum efficiency.',
          button_text: 'View Tournaments', // Update this
          button_link: '/cards/2/tournaments' // Update this
        },
        {
          card_id: 3, // Add this
          category: 'Technology',
          title: 'Latest Tech Innovations',
          src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          content: 'Discover the cutting-edge technologies that are shaping our future. From quantum computing to blockchain, explore innovations that will transform industries and change how we interact with the digital world.',
          button_text: 'View Tournaments', // Update this
          button_link: '/cards/3/tournaments' // Update this
        }
      ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use fallback data on error
      setCards([
        {
          card_id: 1,
          category: 'Artificial Intelligence',
          title: 'You can do more with AI.',
          src: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          content: 'AI is revolutionizing how we work and live. From smart assistants to predictive analytics, artificial intelligence is making our daily tasks more efficient and opening up new possibilities we never imagined before.'
        },
        {
          card_id: 2,
          category: 'Productivity',
          title: 'Enhance your productivity.',
          src: 'https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          content: 'Boost your productivity with smart tools and techniques. Learn how to manage your time better, organize your workspace, and use technology to streamline your workflow for maximum efficiency.'
        },
        {
          card_id: 3,
          category: 'Technology',
          title: 'Latest Tech Innovations',
          src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          content: 'Discover the cutting-edge technologies that are shaping our future. From quantum computing to blockchain, explore innovations that will transform industries and change how we interact with the digital world.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Card functions
  const addCard = (card: Omit<CardData, 'card_id'>) => {
    const newCard: CardData = {
      card_id: Date.now(),
      ...card,
    };
    setCards(prev => [...prev, newCard]);
  };

  const updateCard = (card_id: number, card: Omit<CardData, 'card_id'>) => {
    setCards(prev => prev.map(c => c.card_id === card_id ? { ...c, ...card } : c));
  };

  const deleteCard = (card_id: number) => {
    setCards(prev => prev.filter(c => c.card_id !== card_id));
  };

  return (
    <DataContext.Provider value={{
      cards,
      setCards,
      addCard,
      updateCard,
      deleteCard,
      loading,
    }}>
      {children}
    </DataContext.Provider>
  );
};