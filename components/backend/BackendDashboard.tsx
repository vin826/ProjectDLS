"use client";
import { useState, useEffect } from "react";
import SlideManager from "./SlideManager";
import CardManager from "./CardManager";
import UserForm from "./UserForm";
import UserTable from "./UserTable";

interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  phone_number?: bigint;
  created_at: Date;
}

// Add this new interface for the form data
interface UserFormData {
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  phone_number?: string;
  password: string;
}

export default function BackendDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'slides' | 'cards' | 'users'>('users');

  // Load users from database when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update this function to handle the type conversion
  const addUser = async (newUser: UserFormData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (response.ok) {
        const createdUser = await response.json();
        setUsers([...users, createdUser]);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const deleteUser = async (user_id: string) => {
    try {
      const response = await fetch(`/api/users/${user_id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUsers(users.filter(user => user.user_id !== user_id));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

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
                User Management
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg">
                Manage your application users ({users.length} total)
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