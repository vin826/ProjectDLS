"use client";

import { useState } from "react";
import { X, User, Mail, Shield, Phone, Calendar, Edit2, Save, Camera } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
  } | null;
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: ''
  });

  if (!isOpen || !user) return null;

  const handleSave = () => {
    // Here you would typically save to your database
    console.log('Saving profile data:', editData);
    setIsEditing(false);
    // You can add API call here later
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      email: user.email,
      phone: '',
      bio: ''
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl transform transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Profile' : 'My Profile'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="h-24 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                  <Camera size={16} />
                </button>
              )}
            </div>
            
            {/* Role Badge */}
            <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${
              user.role === 'ADMIN' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            }`}>
              <Shield size={12} className="inline mr-1" />
              {user.role}
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User size={16} className="inline mr-2" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {user.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {user.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone size={16} className="inline mr-2" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  placeholder="Enter phone number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {editData.phone || 'Not provided'}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Edit2 size={16} className="inline mr-2" />
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({...editData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                />
              ) : (
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white min-h-[80px]">
                  {editData.bio || 'No bio provided yet.'}
                </p>
              )}
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Member Since
              </label>
              <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-xs text-gray-500">Cards Created</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">5</p>
              <p className="text-xs text-gray-500">Slides Made</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">3</p>
              <p className="text-xs text-gray-500">Days Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}