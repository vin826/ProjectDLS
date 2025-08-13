"use client";

import { Card } from "@/components/ui/apple-cards-carousel";
import { IconUser } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import BackendDashboard from "@/components/backend/BackendDashboard";
import FrontendView from "@/components/frontend/FrontendView";
import { useData } from "@/contexts/DataContext";
import MobileLoginModal from "@/components/ui/mobile-login-modal";
import ProfileModal from "@/components/ui/profile-modal";
import AppHeader from "@/components/ui/app-header";
import AppSidebar from "@/components/ui/app-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useNavigation } from "@/hooks/use-navigation";

export default function CarouselDemo() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'frontend' | 'backend'>('frontend');
  const [frontendView, setFrontendView] = useState<'home' | 'cards'>('cards');
  const { cards, loading } = useData();
  
  const {
    currentUser,
    isLoggedIn,
    showLogin,
    setShowLogin,
    showProfile,
    setShowProfile,
    handleLoginSuccess,
    handleLogout,
    handleProfileUpdate
  } = useAuth();

  // Automatically redirect to frontend when user logs out or loses admin privileges
  useEffect(() => {
    if (!isLoggedIn || (currentUser && currentUser.role !== 'ADMIN')) {
      if (currentView === 'backend') {
        setCurrentView('frontend');
      }
    }
  }, [isLoggedIn, currentUser, currentView]);

  const { links } = useNavigation({
    isLoggedIn,
    currentUser,
    currentView,
    setCurrentView,
    setFrontendView,
    handleLogout,
    setShowLogin
  });

  // Add safety checks - only show loading if actually loading, not if cards array is empty
  if (loading) {
    return <div>Loading...</div>;
  }

  // Ensure cards is always an array, even if empty
  const safeCards = Array.isArray(cards) ? cards : [];
  
  // Debug logging for mobile visibility issues
  console.log("🔍 CarouselDemo Debug:", {
    cardsLength: safeCards.length,
    loading,
    currentView,
    frontendView,
    cards: safeCards.slice(0, 2) // First 2 cards for debugging
  });

  return (
  <div className="flex flex-col md:flex-row min-h-[100svh] w-full overflow-x-hidden">
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
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Sidebar */}
      <AppSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        links={links}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        setShowProfile={setShowProfile}
      />

      {/* Main content area */}
  <div className="flex-1 min-w-0 min-h-0 overflow-y-auto relative">
        {/* Header */}
        <AppHeader
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          setSidebarOpen={setSidebarOpen}
          setShowLogin={setShowLogin}
          setShowProfile={setShowProfile}
        />

        {/* Content based on current view */}
        {currentView === 'frontend' ? (
          <FrontendView
            view={frontendView}
            cards={safeCards.map((card, index) => (
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