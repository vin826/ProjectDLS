"use client";
//import Carousel from "@/components/ui/carousel";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {  Card } from "@/components/ui/apple-cards-carousel";
import { IconHome, IconArrowLeft, IconInfoCircle, IconSettings, IconDatabase } from "@tabler/icons-react";
import { useState } from "react";
import BackendDashboard from "@/components/backend/BackendDashboard";
import FrontendView from "@/components/frontend/FrontendView";
import { useData } from "@/contexts/DataContext";

export default function CarouselDemo() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'frontend' | 'backend'>('frontend');
  const { cards, slides } = useData();

  // Convert cards to Apple Carousel format
  const appleCarouselItems = cards.map((card, index) => (
    <Card key={card.id} card={card} index={index} />
  ));

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
    {
      label: "Database",
      href: "#",
      icon: <IconDatabase className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('backend')
    },
    {
      label: "Logout",
      href: "#",
      icon: <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div key={idx} onClick={link.onClick}>
                  <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header - only show on mobile or when sidebar is closed */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 md:hidden sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            ☰ Menu
          </button>
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
              <Card key={card.id} card={card} index={index} />
            ))}
          />
        ) : (
          <BackendDashboard />
        )}
      </div>
    </div>
  );
}