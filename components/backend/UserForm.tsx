"use client";
import { useState } from "react";

interface UserFormProps {
  onAddUser: (user: {
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    phone_number?: string;
    password: string;
  }) => void;
}

export default function UserForm({ onAddUser }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER' as 'ADMIN' | 'USER',
    phone_number: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      ...formData,
      phone_number: formData.phone_number || undefined
    });
    setFormData({
      name: '',
      email: '',
      role: 'USER',
      phone_number: '',
      password: ''
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Add New User
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          required
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value as 'ADMIN' | 'USER'})}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <input
          type="tel"
          placeholder="Phone Number (optional)"
          value={formData.phone_number}
          onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white md:col-span-2"
          required
        />
        <button
          type="submit"
          className="md:col-span-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add User
        </button>
      </form>
    </div>
  );
}