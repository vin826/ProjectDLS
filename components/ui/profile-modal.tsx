"use client";

import { useState, useRef, useEffect } from "react";
import { X, User, Mail, Shield, Phone, Calendar, Edit2, Save, Camera } from "lucide-react";
import UppyImageUpload from "./uppy-image-upload";

interface User{
  user_id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  profile_image?: string;
  profile_image_url?: string;
  phone?: string;
  phone_number?: string;
  bio?: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onProfileUpdate?: (updatedUser: User) => void;
}

export default function ProfileModal({ isOpen, onClose, user, onProfileUpdate }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [editData, setEditData] = useState({
    user_id: user?.user_id || '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || user?.phone_number || '',
    bio: user?.bio || '',
    profile_image: user?.profile_image_url || user?.profile_image || '' 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update editData when user prop changes
  useEffect(() => {
    if (user) {
       console.log('🔍 Full user object:', user);
    console.log('📱 Phone check:', {
      phone: user.phone,
      phone_number: user.phone_number,
      result: user.phone || user.phone_number || ''
    });
    console.log('🖼️ Image check:', {
      profile_image: user.profile_image,
      profile_image_url: user.profile_image_url,
      result: user.profile_image_url || user.profile_image || ''
    });
    
      setEditData({
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone || user.phone_number || '',
        bio: user.bio || '',
        profile_image: user.profile_image || user.profile_image_url || ''
      });
    }
  }, [user]);

   if (!isOpen || !user) return null

  // Handle successful Uppy upload
  const handleUploadSuccess = (imageUrl: string) => {
    console.log('✅ Image uploaded successfully via Uppy:', imageUrl);
    
    // Update local state
    setEditData({ ...editData, profile_image: imageUrl });
    
    // Update parent component immediately
    if (onProfileUpdate) {
      const updatedUser = {
        ...user,
        profile_image_url: imageUrl,
        profile_image: imageUrl
      };
      onProfileUpdate(updatedUser);
    }
    
    // Close uploader
    setShowUploader(false);
    alert('🎉 Profile image updated successfully!');
  };

  // Handle Uppy upload errors
  const handleUploadError = (error: string) => {
    console.error('❌ Uppy upload error:', error);
    alert(`Upload failed: ${error}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${user.user_id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editData.name,
          email: editData.email,
          phone_number: editData.phone,
          bio: editData.bio,
          profile_image: editData.profile_image
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Profile updated successfully:', result);
        
        if (onProfileUpdate && result.user) {
          onProfileUpdate(result.user);
        }
        
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        console.error('Failed to update profile:', error);
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone || user.phone_number || '',
      bio: user.bio || '',
      profile_image: user.profile_image_url || user.profile_image || ''
    });
    setIsEditing(false);
    setShowUploader(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        
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
              {editData.profile_image ? (
                <img 
                  src={editData.profile_image} 
                  alt="Profile" 
                  className="h-24 w-24 rounded-full object-cover shadow-lg"
                  onError={(e) => {
                    console.error('Image failed to load:', editData.profile_image);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-24 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Camera button to show Uppy uploader */}
              {isEditing && (
                <button
                  onClick={() => setShowUploader(!showUploader)}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                >
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

          {/* Uppy Upload Section */}
          {showUploader && isEditing && (
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                Upload New Profile Image
              </h3>
              <UppyImageUpload 
                userId={user.user_id}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
          )}

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
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}