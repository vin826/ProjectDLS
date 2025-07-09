"use client";
import { useState } from "react";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import { useData } from "@/contexts/DataContext";

export default function CardManager() {
  const { cards, addCard, updateCard, deleteCard } = useData();
  
  const [newCard, setNewCard] = useState({
    category: "",
    title: "",
    src: "",
    content: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAddCard = () => {
    if (newCard.category && newCard.title && newCard.src && newCard.content) {
      addCard(newCard);
      setNewCard({ category: "", title: "", src: "", content: "" });
    }
  };

  const handleDeleteCard = (id: number) => {
    deleteCard(id);
  };

  const handleEditCard = (id: number) => {
    const card = cards.find(c => c.id === id);
    if (card) {
      setNewCard({ 
        category: card.category, 
        title: card.title, 
        src: card.src, 
        content: card.content 
      });
      setEditingId(id);
    }
  };

  const handleUpdateCard = () => {
    if (editingId && newCard.category && newCard.title && newCard.src && newCard.content) {
      updateCard(editingId, newCard);
      setNewCard({ category: "", title: "", src: "", content: "" });
      setEditingId(null);
    }
  };

  const categories = [
    "Artificial Intelligence",
    "Productivity", 
    "Technology",
    "Design",
    "Business",
    "Education",
    "Health",
    "Entertainment",
    "Sports",
    "Travel"
  ];

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          {editingId ? "Edit Apple Card" : "Add New Apple Card"}
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
        
        <div className="flex gap-2">
          <button
            onClick={editingId ? handleUpdateCard : handleAddCard}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <IconPlus className="h-4 w-4" />
            {editingId ? "Update Card" : "Add Card"}
          </button>
          
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setNewCard({ category: "", title: "", src: "", content: "" });
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
          Current Apple Cards ({cards.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
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
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCard(card.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                >
                  <IconEdit className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
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
              content: "Create stunning user interfaces with modern design principles and beautiful components that users love to interact with."
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
              content: "Learn proven strategies to scale your startup from idea to successful business with practical tips from industry experts."
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