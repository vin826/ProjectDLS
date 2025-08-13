"use client";

import { IconUser } from "@tabler/icons-react";
import { User } from "@/hooks/use-auth";
import DarkLeaguePoints from "./dark-league-points";

interface AppHeaderProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  setSidebarOpen: (open: boolean) => void;
  setShowLogin: (show: boolean) => void;
  setShowProfile: (show: boolean) => void;
}

export default function AppHeader({ 
  isLoggedIn, 
  currentUser, 
  setSidebarOpen, 
  setShowLogin, 
  setShowProfile 
}: AppHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-2 sticky top-0 z-10 xs:p-3 sm:p-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 xs:p-1.5 sm:p-2 md:hidden"
        >
          <span className="text-xs xs:text-sm sm:text-base">☰ Menu</span>
        </button>
        
        {/* Desktop Title */}
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Tournaments</h1>
        </div>
        
        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4">
          {/* Dark League Points Display */}
          {isLoggedIn && currentUser && (
            <DarkLeaguePoints user={currentUser} variant="header" />
          )}
          
          {/* Mobile Login Button */}
          {!isLoggedIn && (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors xs:gap-1.5 xs:px-2.5 xs:py-1.5 xs:rounded-lg xs:text-sm sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
            >
              <IconUser size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
              Login
            </button>
          )}
          
          {/* Mobile User Status - Also clickable */}
          {isLoggedIn && currentUser && (
            <div 
              className="flex items-center gap-1 cursor-pointer xs:gap-1.5 sm:gap-2"
              onClick={() => setShowProfile(true)}
            >
              {currentUser?.profile_image ? (
                <img 
                  src={currentUser.profile_image} 
                  alt={currentUser.name}
                  className="h-4 w-4 rounded-full object-cover xs:h-5 xs:w-5 sm:h-6 sm:w-6"
                />
              ) : (
                <div className="h-4 w-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center xs:h-5 xs:w-5 sm:h-6 sm:w-6">
                  <span className="text-white text-xs font-medium xs:text-xs">
                    {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400 xs:text-xs sm:text-sm">
                {currentUser ? currentUser.name.split(' ')[0] : 'User'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
