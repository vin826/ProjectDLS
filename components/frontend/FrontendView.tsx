"use client";
import { CarouselApp } from "@/components/ui/apple-cards-carousel";
import HomePage from "./HomePage";
import SimpleHomePage from "./SimpleHomePage";

interface FrontendViewProps {
  cards: React.ReactElement[];
  view?: 'home' | 'cards';
}

export default function FrontendView({ cards, view = 'cards' }: FrontendViewProps) {
  if (view === 'home') {
    // Try the 3D version first, fallback to simple version if there are issues
    try {
      return <HomePage />;
    } catch (error) {
      console.warn('3D HomePage failed, using simple version:', error);
      return <SimpleHomePage />;
    }
  }

  return (
    <>
      {/* Apple Cards Carousel - Minimal on very small screens */}
      <div className="w-full py-1 bg-white dark:bg-gray-800 xs:py-2 sm:py-4 md:py-8 lg:py-12 xl:py-16 2xl:py-20">
        <div className="max-w-7xl mx-auto px-0.5 xs:px-1 sm:px-3 md:px-4 lg:px-6 xl:px-8">
          <h2 className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 font-sans mb-0.5 px-1 xs:text-sm xs:mb-1 xs:px-1 sm:text-xl sm:mb-2 sm:px-0 md:text-2xl md:mb-2.5 lg:text-3xl lg:mb-3 xl:text-4xl xl:mb-4 2xl:text-5xl">
            Discover Amazing Content
          </h2>
          <p className="hidden xs:block text-xs mb-2 text-neutral-600 dark:text-neutral-400 px-1 xs:text-sm xs:mb-3 sm:text-base sm:mb-4 sm:px-0 md:text-lg md:mb-6 lg:mb-8">
            Explore our collection of interactive cards
          </p>
        </div>
        <CarouselApp items={cards} />
      </div>
    </>
  );
}