"use client";

import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconSettings } from "@tabler/icons-react";
import { User } from "@/hooks/use-auth";
import DarkLeaguePoints from "./dark-league-points";
import { Dispatch, SetStateAction } from "react";

interface AppSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  links: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
    onClick?: () => void;
  }>;
  isLoggedIn: boolean;
  currentUser: User | null;
  setShowProfile: (show: boolean) => void;
}

export default function AppSidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  links, 
  isLoggedIn, 
  currentUser, 
  setShowProfile 
}: AppSidebarProps) {
  return (
    <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
              Dark League Studios   
            </span>
          </div>
          
          {/* Navigation Links */}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <div key={idx} onClick={link.onClick}>
                <SidebarLink link={link} />
              </div>
            ))}
          </div>
          
          {/* Dark League Points Display - Desktop Sidebar */}
          {isLoggedIn && currentUser && (
            <DarkLeaguePoints user={currentUser} variant="sidebar" className="mt-6" />
          )}
        </div>
        
        {/* User Status at Bottom - Make it clickable */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <div 
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
            onClick={() => isLoggedIn && setShowProfile(true)}
          >
            {/* User Avatar */}
            <div className="relative">
              {isLoggedIn && currentUser?.profile_image && !currentUser.profile_image.startsWith('blob:') ? (
                <img 
                  src={currentUser.profile_image} 
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {isLoggedIn && currentUser ? currentUser.name.charAt(0).toUpperCase() : 'G'}
                  </span>
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${isLoggedIn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                {isLoggedIn && currentUser ? currentUser.name : 'Guest User'}
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {isLoggedIn && currentUser ? currentUser.role : 'Not logged in'}
              </p>
            </div>
            
            {/* Click indicator */}
            {isLoggedIn && (
              <IconSettings className="h-4 w-4 text-neutral-400" />
            )}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
