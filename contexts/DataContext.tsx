"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface DataContextType {
  cards: CardData[];
  slides: SlideData[];
  setCards: (cards: CardData[]) => void;
  addCard: (card: Omit<CardData, 'card_id'>) => void;
  updateCard: (card_id: number, card: Omit<CardData, 'card_id'>) => void;
  deleteCard: (card_id: number) => void;
  addSlide: (slide: Omit<SlideData, 'id'>) => void;
  updateSlide: (id: number, slide: Omit<SlideData, 'id'>) => void;
  deleteSlide: (id: number) => void;
}

interface CardData {
  card_id: number;
  category: string;
  title: string;
  src: string;
  content: string;
}

interface SlideData {
  id: number;
  title: string;
  button: string;
  src: string;
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
  const [cards, setCards] = useState<CardData[]>([
    {
      card_id: 1,
      category: "Artificial Intelligence",
      title: "You can do more with AI.",
      src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      content: "AI is revolutionizing how we work and live. From smart assistants to predictive analytics, artificial intelligence is making our daily tasks more efficient and opening up new possibilities we never imagined before.",
    },
    {
      card_id: 2,
      category: "Productivity",
      title: "Enhance your productivity.",
      src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      content: "Boost your productivity with smart tools and techniques. Learn how to manage your time better, organize your workspace, and use technology to streamline your workflow for maximum efficiency.",
    },
    {
      card_id: 3,
      category: "Technology",
      title: "Latest Tech Innovations",
      src: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      content: "Discover the cutting-edge technologies that are shaping our future. From quantum computing to blockchain, explore innovations that will transform industries and change how we interact with the digital world.",
    },
  ]);

  const [slides, setSlides] = useState<SlideData[]>([
    {
      id: 1,
      title: "Mystic Mountains",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1494806812796-244fe51b774d?q=80&w=3534&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 2,
      title: "Urban Dreams",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 3,
      title: "Neon Nights",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1590041794748-2d8eb73a571c?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 4,
      title: "Desert Whispers",
      button: "Explore Component",
      src: "https://images.unsplash.com/photo-1679420437432-80cfbf88986c?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ]);

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

  // Slide functions
  const addSlide = (slide: Omit<SlideData, 'id'>) => {
    const newSlide: SlideData = {
      id: Date.now(),
      ...slide,
    };
    setSlides(prev => [...prev, newSlide]);
  };

  const updateSlide = (id: number, slide: Omit<SlideData, 'id'>) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, ...slide } : s));
  };

  const deleteSlide = (id: number) => {
    setSlides(prev => prev.filter(s => s.id !== id));
  };

  return (
    <DataContext.Provider value={{
      cards,
      slides,
      setCards, // Add this line
      addCard,
      updateCard,
      deleteCard,
      addSlide,
      updateSlide,
      deleteSlide,
    }}>
      {children}
    </DataContext.Provider>
  );
};