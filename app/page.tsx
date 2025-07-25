"use client";
//import Carousel from "@/components/ui/carousel";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {  Card } from "@/components/ui/apple-cards-carousel";
import { IconHome, IconArrowLeft, IconInfoCircle, IconSettings, IconDatabase, IconUser } from "@tabler/icons-react";
import { useState } from "react";
import BackendDashboard from "@/components/backend/BackendDashboard";
import FrontendView from "@/components/frontend/FrontendView";
import { useData } from "@/contexts/DataContext";
import MobileLoginModal from "@/components/ui/mobile-login-modal";
import ProfileModal from "@/components/ui/profile-modal";



export default function CarouselDemo() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'frontend' | 'backend'>('frontend');
  const [showProfile, setShowProfile] = useState(false); 
  const [currentUser, setCurrentUser] = useState<{user_id: string; name: string; email: string; role: 'ADMIN' | 'USER'; profile_image?: string; phone?: string; bio?: string; } | null>(null); // Add this line

  const [showLogin, setShowLogin] = useState(false); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status
  const { cards, slides } = useData();

  
  // Add safety checks
  if (!cards || !Array.isArray(cards)) {
    return <div>Loading...</div>;
  }

  if (!slides || !Array.isArray(slides)) {
    return <div>Loading...</div>;
  }

  // Convert cards to Apple Carousel format
  const appleCarouselItems = cards.map((card, index) => (
    <Card key={card.card_id} card={card} index={index} />
  ));

  // Handle login success
  const handleLoginSuccess = (user: {user_id: string; name: string; email: string; role: 'ADMIN' | 'USER'; profile_image?: string; phone?: string; bio?: string; profile_image_url?: string; phone_number?: string;}) => {
    console.log("Login successful:", user);
    console.log("🔍 User data structure:", {
    phone: user.phone,
    phone_number: user.phone_number, // Check if this exists
    profile_image: user.profile_image,
    profile_image_url: user.profile_image_url // Check if this exists
  });

    setIsLoggedIn(true);
    setCurrentUser(user);     
    setShowLogin(false);
  };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView('frontend'); // Go back to frontend view
  };

  const links = [
    {
      label: "Home",
      href: "#",  
      icon: <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
      onClick: () => setCurrentView('frontend')
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
    
     // Only show Database link if logged in
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

  return (
    <div className="flex h-screen">
      {/* Login Modal */}
      <MobileLoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)}
        user={currentUser}
        onProfileUpdate={(updatedUser) => {
        console.log("🔄 Profile updated:", updatedUser);
        setCurrentUser(updatedUser);
  }}
      />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <span className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
                Carousel App
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
          </div>
          
         {/* User Status at Bottom - Make it clickable */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <div 
              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              onClick={() => isLoggedIn && setShowProfile(true)}
            >
              {/* User Avatar */}
              <div className="relative">
                {isLoggedIn && currentUser?.profile_image && !currentUser.profile_image.startsWith('blob:') ?  (
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

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header - only show on mobile or when sidebar is closed */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 md:hidden sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              ☰ Menu
            </button>
            
            {/* Mobile Login Button */}
            {!isLoggedIn && (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <IconUser size={16} />
                Login
              </button>
            )}
            
             {/* Mobile User Status - Also clickable */}
            {isLoggedIn && (
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setShowProfile(true)}
              >
                {currentUser?.profile_image ? (
                  <img 
                    src={currentUser.profile_image} 
                    alt={currentUser.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentUser ? currentUser.name : 'User'}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content based on current view */}
        {currentView === 'frontend' ? (
          <FrontendView
            slideData={slides.map(slide => ({
              title: slide.title,
              button: slide.button,
              src: slide.src
            }))}
            cards={cards.map((card, index) => (
              <Card key={card.card_id} card={card} index={index} />
            ))}
          />
        ) : (
          // Only show backend if logged in
          isLoggedIn ? (
            <BackendDashboard />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <IconUser size={64} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Access Denied
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please log in to access the dashboard
                </p>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login Now
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}