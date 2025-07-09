"use client";
import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserFormProps {
  onAddUser: (user: Omit<User, 'id'>) => void;
}

export default function UserForm({ onAddUser }: UserFormProps) {
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "User" });

  const handleSubmit = () => {
    if (newUser.name && newUser.email) {
      onAddUser(newUser);
      setNewUser({ name: "", email: "", role: "User" });
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 mb-8 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">
        Add New User
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
          className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
        >
          Add User
        </button>
      </div>
    </div>
  );
}