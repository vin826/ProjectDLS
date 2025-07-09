"use client";
import { useState } from "react";
import SlideManager from "./SlideManager";
import CardManager from "./CardManager";
import UserForm from "./UserForm";
import UserTable from "./UserTable";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function BackendDashboard() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User" },
  ]);

  const [activeTab, setActiveTab] = useState<'slides' | 'cards' | 'users'>('users');

  const addUser = (newUser: Omit<User, 'id'>) => {
    setUsers([...users, { 
      id: users.length + 1, 
      ...newUser 
    }]);
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          Backend Dashboard
        </h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('slides')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'slides'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Manage Slides
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'cards'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Manage Cards
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Manage Users
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'slides' ? <SlideManager /> : activeTab === 'cards' ? <CardManager /> : (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                Backend Dashboard
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                Manage your application data and users
              </p>
            </div>

            <UserForm onAddUser={addUser} />
            <UserTable users={users} onDeleteUser={deleteUser} />
          </div>
        )}
      </div>
    </div>
  );
}