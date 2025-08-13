"use client";

import { IconHome, IconArrowLeft, IconInfoCircle, IconSettings, IconDatabase, IconUser, IconCards } from "@tabler/icons-react";
import { User } from "@/hooks/use-auth";

interface NavigationProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  currentView: 'frontend' | 'backend';
  setCurrentView: (view: 'frontend' | 'backend') => void;
  setFrontendView: (view: 'home' | 'cards') => void;
  handleLogout: () => void;
  setShowLogin: (show: boolean) => void;
}

export function useNavigation({
  isLoggedIn,
  currentUser,
  currentView,
  setCurrentView,
  setFrontendView,
  handleLogout,
  setShowLogin
}: NavigationProps) {
  const links = [
    {
      label: "Home",
      href: "#",  
      icon: <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => {
        setCurrentView('frontend');
        setFrontendView('home');
      }
    },
    {
      label: "Cards",
      href: "#",
      icon: <IconCards className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => {
        setCurrentView('frontend');
        setFrontendView('cards');
      }
    },
    {
      label: "About",
      href: "#",
      icon: <IconInfoCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Contact",
      href: "#",
      icon: <IconInfoCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Settings",
      href: "#",
      icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    
    // Only show Database link if logged in as admin
    ...(isLoggedIn && currentUser?.role === 'ADMIN' ? [{
      label: "Database",
      href: "#",
      icon: <IconDatabase className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('backend')
    }] : []),
    
    // Show Login or Logout based on status
    {
      label: isLoggedIn ? "Logout" : "Login",
      href: "#",
      icon: isLoggedIn ? 
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" /> :
        <IconUser className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: isLoggedIn ? handleLogout : () => setShowLogin(true)
    },
  ];

  return { links };
}
