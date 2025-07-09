"use client";
import Carousel from "@/components/ui/carousel";
import { CarouselApp, Card } from "@/components/ui/apple-cards-carousel";

interface SlideData {
  title: string;
  button: string;
  src: string;
}

interface FrontendViewProps {
  slideData: SlideData[];
  cards: React.ReactElement[];
}

export default function FrontendView({ slideData, cards }: FrontendViewProps) {
  return (
    <>
      {/* Carousel content */}
      <div className="flex justify-center items-center bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="relative overflow-hidden w-full h-full py-20">
          <Carousel slides={slideData} />
        </div>          
      </div>

      {/* Apple Cards Carousel */}
      <div className="w-full py-20 bg-white dark:bg-gray-800">
        <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
          E A sports. It's in the game.
        </h2>
        <CarouselApp items={cards} />
      </div>
    </>
  );
}