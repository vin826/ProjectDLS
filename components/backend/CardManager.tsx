"use client";

import { useData } from "@/contexts/DataContext";
import { useState } from "react";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";

export default function CardManager() {
  const { cards, setCards, loading } = useData();
  
  // Ensure cards is always an array, even if empty
  const safeCards = Array.isArray(cards) ? cards : [];

  const [newCard, setNewCard] = useState({
    category: "",
    title: "",
    src: "",
    content: "",
    button_text: "",
    button_link: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCard = async () => {
    if (newCard.category && newCard.title && newCard.src && newCard.content) {
      try {
        setIsSubmitting(true);
        const response = await fetch('/api/cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCard),
        });
        
        if (response.ok) {
          const createdCard = await response.json();
          setCards([...safeCards, createdCard]);
          setNewCard({ category: "", title: "", src: "", content: "", button_text: "", button_link: "" });
        } else {
          console.error('Failed to add card');
        }
      } catch (error) {
        console.error('Error adding card:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteCard = async (card_id: number) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/cards/${card_id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCards(safeCards.filter(card => card.card_id !== card_id));
      } else {
        console.error('Failed to delete card');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCard = (card_id: number) => {
    const card = safeCards.find(c => c.card_id === card_id);
    if (card) {
      setNewCard({ 
        category: card.category, 
        title: card.title, 
        src: card.src, 
        content: card.content,
        button_text: card.button_text || "",
        button_link: card.button_link || "",
        
      });
      setEditingId(card_id);
    }
  };

  const handleUpdateCard = async () => {
    if (editingId && newCard.category && newCard.title && newCard.src && newCard.content) {
      try {
        setIsSubmitting(true);
        const response = await fetch(`/api/cards/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCard),
        });
        
        if (response.ok) {
          const updatedCard = await response.json();
          setCards(safeCards.map(card => card.card_id === editingId ? updatedCard : card));
          setNewCard({ category: "", title: "", src: "", content: "", button_text: "", button_link: "" });
          setEditingId(null);
        } else {
          console.error('Failed to update card');
        }
      } catch (error) {
        console.error('Error updating card:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const categories = [
    "Valorant",
    "Mobile Legends",  
    "Call of Duty: Mobile",
    "Tekken 8",
    "Dota 2",
    "Minecraft",
    "Genshin Impact",
    "PUBG Mobile",
    "Event",
  ];

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading cards...</p>
      </div>
    );
  }

   return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          {editingId ? "Edit Tournament" : "Add New Tournament"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select
            value={newCard.category}
            onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Card Title"
            value={newCard.title}
            onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>
        
        <input
          type="url"
          placeholder="Image URL (Unsplash recommended)"
          value={newCard.src}
          onChange={(e) => setNewCard({ ...newCard, src: e.target.value })}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white mb-4"
        />
        
        <textarea
          placeholder="Card Content Description"
          value={newCard.content}
          onChange={(e) => setNewCard({ ...newCard, content: e.target.value })}
          rows={4}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white mb-4"
        />

        {/* Button Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Button Text (e.g., Learn More, Get Started)"
            value={newCard.button_text}
            onChange={(e) => setNewCard({ ...newCard, button_text: e.target.value })}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />

          <input
            type="url"
            placeholder="Button Link (optional)"
            value={newCard.button_link}
            onChange={(e) => setNewCard({ ...newCard, button_link: e.target.value })}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={editingId ? handleUpdateCard : handleAddCard}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <IconPlus className="h-4 w-4" />
            {editingId ? "Update Card" : "Add Card"}
          </button>
          
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setNewCard({ category: "", title: "", src: "", content: "", button_text: "", button_link: "" });
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Current Events ({safeCards.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeCards.map((card) => (
            <div key={card.card_id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <img
                src={card.src}
                alt={card.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <div className="mb-2">
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                  {card.category}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                {card.content}
              </p>
              
              {/* Show button info if exists */}
              {card.button_text && (
                <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Button: </span>
                  <span className="text-blue-600 dark:text-blue-400">{card.button_text}</span>
                  {card.button_link && (
                    <div className="text-gray-500 dark:text-gray-400 truncate">
                      Link: {card.button_link}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCard(card.card_id)}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                 <IconEdit className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCard(card.card_id)}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <IconTrash className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Add Suggestions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          💡 Quick Add Suggestions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <button
            onClick={() => setNewCard({
              category: "Design",
              title: "Beautiful UI Components",
              src: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=3540&auto=format&fit=crop",
              content: "Create stunning user interfaces with modern design principles and beautiful components that users love to interact with.",
              button_text: "Learn More",
              button_link: "https://example.com/design"
            })}
            className="text-left p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            + Design Card
          </button>
          <button
            onClick={() => setNewCard({
              category: "Business",
              title: "Scale Your Startup",
              src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3540&auto=format&fit=crop",
              content: "Learn proven strategies to scale your startup from idea to successful business with practical tips from industry experts.",
              button_text: "Get Started",
              button_link: "https://example.com/business"
            })}
            className="text-left p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            + Business Card
          </button>
        </div>
      </div>
    </div>
  );
}