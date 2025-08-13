"use client";

import { useState } from 'react';

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  profile_image?: string;
  phone?: string;
  bio?: string;
  dark_league_points?: number;
  profile_image_url?: string;
  phone_number?: string;
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLoginSuccess = async (user: User) => {
    console.log("Login successful:", user);
    console.log("🔍 User data structure:", {
      phone: user.phone,
      phone_number: user.phone_number,
      profile_image: user.profile_image,
      profile_image_url: user.profile_image_url
    });

    // Fetch user's Dark League Points balance
    try {
      console.log('🔍 Fetching DLP for user:', user.user_id);
      const response = await fetch(`/api/users/${user.user_id}/balance?currency=DLP`);
      if (response.ok) {
        const balanceData = await response.json();
        console.log('💰 DLP Balance response:', balanceData);
        user.dark_league_points = parseInt(balanceData.amount) || 0;
        console.log('✅ Set user DLP to:', user.dark_league_points);
      } else {
        console.log('❌ DLP fetch failed with status:', response.status);
        user.dark_league_points = 0;
      }
    } catch (error) {
      console.log("❌ Could not fetch Dark League Points:", error);
      user.dark_league_points = 0;
    }

    setIsLoggedIn(true);
    setCurrentUser(user);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleProfileUpdate = async (updatedUser: User) => {
    console.log("🔄 Profile updated:", updatedUser);
    
    // Refresh Dark League Points balance
    if (updatedUser.user_id) {
      try {
        const response = await fetch(`/api/users/${updatedUser.user_id}/balance?currency=DLP`);
        if (response.ok) {
          const balanceData = await response.json();
          updatedUser.dark_league_points = parseInt(balanceData.amount) || 0;
        }
      } catch (error) {
        console.log("Could not refresh Dark League Points:", error);
      }
    }
    
    setCurrentUser(updatedUser);
  };

  return {
    currentUser,
    isLoggedIn,
    showLogin,
    setShowLogin,
    showProfile,
    setShowProfile,
    handleLoginSuccess,
    handleLogout,
    handleProfileUpdate
  };
}
