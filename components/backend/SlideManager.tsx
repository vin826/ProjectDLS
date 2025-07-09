"use client";
import { useState } from "react";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";

interface SlideData {
  id: number;
  title: string;
  button: string;
  src: string;
}

export default function SlideManager() {
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
  ]);

  const [newSlide, setNewSlide] = useState({
    title: "",
    button: "",
    src: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAddSlide = () => {
    if (newSlide.title && newSlide.button && newSlide.src) {
      const slide: SlideData = {
        id: Date.now(),
        ...newSlide,
      };
      setSlides([...slides, slide]);
      setNewSlide({ title: "", button: "", src: "" });
    }
  };

  const handleDeleteSlide = (id: number) => {
    setSlides(slides.filter(slide => slide.id !== id));
  };

  const handleEditSlide = (id: number) => {
    const slide = slides.find(s => s.id === id);
    if (slide) {
      setNewSlide({ title: slide.title, button: slide.button, src: slide.src });
      setEditingId(id);
    }
  };

  const handleUpdateSlide = () => {
    if (editingId && newSlide.title && newSlide.button && newSlide.src) {
      setSlides(slides.map(slide => 
        slide.id === editingId 
          ? { ...slide, ...newSlide }
          : slide
      ));
      setNewSlide({ title: "", button: "", src: "" });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          {editingId ? "Edit Slide" : "Add New Slide"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Slide Title"
            value={newSlide.title}
            onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <input
            type="text"
            placeholder="Button Text"
            value={newSlide.button}
            onChange={(e) => setNewSlide({ ...newSlide, button: e.target.value })}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>
        
        <input
          type="url"
          placeholder="Image URL"
          value={newSlide.src}
          onChange={(e) => setNewSlide({ ...newSlide, src: e.target.value })}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white mb-4"
        />
        
        <div className="flex gap-2">
          <button
            onClick={editingId ? handleUpdateSlide : handleAddSlide}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <IconPlus className="h-4 w-4" />
            {editingId ? "Update Slide" : "Add Slide"}
          </button>
          
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setNewSlide({ title: "", button: "", src: "" });
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Slides List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Current Slides ({slides.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide) => (
            <div key={slide.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <img
                src={slide.src}
                alt={slide.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                {slide.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Button: {slide.button}
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditSlide(slide.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                >
                  <IconEdit className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteSlide(slide.id)}
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
    </div>
  );
}