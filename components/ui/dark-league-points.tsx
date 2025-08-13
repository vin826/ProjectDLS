"use client";

import { User } from "@/hooks/use-auth";

interface DarkLeaguePointsProps {
  user: User;
  variant?: 'sidebar' | 'header' | 'compact';
  className?: string;
}

export default function DarkLeaguePoints({ user, variant = 'header', className = '' }: DarkLeaguePointsProps) {
  const dlpAmount = user.dark_league_points || 0;

  console.log(`🎮 Rendering ${variant} DLP:`, { 
    user: user?.name, 
    dlp: dlpAmount 
  });

  if (variant === 'sidebar') {
    return (
      <div className={`bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 text-white ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-purple-800 text-xs font-bold">★</span>
            </div>
            <span className="text-sm font-medium">Dark League Points</span>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold">{dlpAmount}</span>
          <span className="text-sm ml-1 opacity-90">DLP</span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-purple-800 text-xs font-bold">★</span>
          </div>
          <span className="text-sm font-bold">{dlpAmount} DLP</span>
        </div>
      </div>
    );
  }

  // Default header variant
  return (
    <div className={`flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-lg xs:px-2.5 xs:py-1.5 sm:px-3 sm:py-2 ${className}`}>
      <div className="w-3 h-3 bg-yellow-400 rounded-full xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4"></div>
      <span className="text-xs font-bold xs:text-sm sm:text-sm">
        {dlpAmount} DLP
      </span>
    </div>
  );
}
