"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Image, { ImageProps } from "next/image";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { CardModel } from '@/models/Card';

const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  fill,
  ...rest
}: ImageProps) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        "transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      fill={fill}
      sizes={fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined}
      alt={alt ? alt : "Background of a beautiful view"}
      {...rest}
    />
  );
};


interface CarouselProps {
  items: React.ReactElement[];
  initialScroll?: number;
}



export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});



export const CarouselApp = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Add touch/swipe state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [initialScrollLeft, setInitialScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const[handleClose, setHandleClose] = useState(() => () => {});


  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll,handleClose],);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  // Touch/Mouse event handlers for swiping
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setInitialScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setHasMoved(false); // Reset movement tracking
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setInitialScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply by 2 for faster scrolling

    if (Math.abs(walk) > 5) {
      setHasMoved(true);
      e.preventDefault();
      carouselRef.current.scrollLeft = initialScrollLeft - walk;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !carouselRef.current) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;

    if (Math.abs(walk) > 5) {
      setHasMoved(true);
      carouselRef.current.scrollLeft = initialScrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setHasMoved(false), 100);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(() => setHasMoved(false), 100);
  };
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const screenWidth = window.innerWidth;
      const cardWidth = screenWidth <= 344 ? 120 : screenWidth <= 768 ? 160 : 384; // Much smaller for very narrow screens
      const gap = screenWidth <= 344 ? 2 : isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return window && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
        className={cn(
            "flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-2 [scrollbar-width:none] xs:py-3 sm:py-4 md:py-6 lg:py-10 xl:py-20",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          ref={carouselRef}
          onScroll={checkScrollability}

          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          // Touch events
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          // Prevent text selection while dragging
          style={{ userSelect: isDragging && hasMoved ? 'none' : 'auto', WebkitOverflowScrolling: 'touch' }}
        >
        
          <div
            className={cn(
              "absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l",
            )}
          ></div>

          <div
            className={cn(
              "flex flex-row justify-start carousel-container",
              "mx-auto max-w-7xl", // remove max-w-4xl if you want the carousel to span the full width of its container
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                }}
                  
                viewport ={{ once: true}}
                layout
                key={"card" + index}
                className="flex-shrink-0"
                style={{ pointerEvents: (isDragging && hasMoved) ? 'none' : 'auto' }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        {/* Navigation buttons - hide on mobile, show on tablet+ */}
        <div className="hidden sm:flex mr-4 md:mr-10 justify-end gap-2">
          <button
            className="relative z-40 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition-colors"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-4 w-4 md:h-6 md:w-6 text-gray-500" />
          </button>
          <button
            className="relative z-40 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition-colors"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-4 w-4 md:h-6 md:w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: CardModel; // Use CardModel instead of Card
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose, currentIndex } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  const handleButtonClick = (e: React.MouseEvent, link?: string) => {
    e.stopPropagation(); // Prevent card from opening when button is clicked
    if (link) {
      // Check if this is a tournament link and we have a card_id
      if (link.includes('/tournaments') && card.card_id) {
        // Navigate to the tournaments page with the card_id
        window.location.href = `/cards/${card.card_id}/tournaments`;
      } else {
        window.open(link, '_blank'); // Open other links in new tab
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-2 h-fit w-full max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-5xl rounded-2xl bg-white p-2 font-sans xs:my-3 xs:p-3 sm:my-4 sm:p-4 sm:rounded-3xl md:my-6 md:p-6 lg:my-10 lg:p-10 dark:bg-neutral-900 max-h-[90svh] overflow-y-auto"
            >
              <button
                className="sticky top-2 right-0 ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-black dark:bg-white sm:top-4 sm:h-8 sm:w-8"
                onClick={handleClose}
              >
                <IconX className="h-4 w-4 text-neutral-100 dark:text-neutral-900 sm:h-6 sm:w-6" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-sm font-medium text-black dark:text-white sm:text-base"
              >
                {card.category}
              </motion.p>
              <motion.p
                layoutId={layout ? `title-${card.title}` : undefined}
                className="mt-1 text-lg font-semibold text-neutral-700 xs:mt-2 xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl dark:text-white"
              >
                {card.title}
              </motion.p>
              <div className="py-2 xs:py-3 sm:py-4 md:py-6 lg:py-10 card-content-body">{card.content}</div>
              
              {/* Add button in modal too */}
              {card.button_text && (
                <button
                  onClick={(e) => {e.stopPropagation(); handleButtonClick(e, card.button_link)}}
                  className="mt-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-xs xs:mt-2 xs:px-4 xs:py-2 xs:text-sm sm:mt-4 sm:px-6 sm:py-3 sm:rounded-lg sm:text-base"
                >
                  {card.button_text}
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <motion.div
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="relative z-10 flex flex-col items-start justify-between overflow-hidden rounded-md bg-gray-100 dark:bg-neutral-900 cursor-pointer flex-shrink-0 card-responsive"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/50 via-transparent to-transparent" />
        
        {/* Top content */}
        <div className="relative z-40 card-content-top">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-left font-sans font-medium text-white card-category-text"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="mt-0.5 max-w-full sm:max-w-xs text-left font-sans font-semibold [text-wrap:balance] text-white card-title-text"
          >
            {card.title}
          </motion.p>
        </div>

        {/* Bottom button */}
        {card.button_text && (
          <div className="relative z-40 w-full card-content-bottom">
            <button
              onClick={(e) => handleButtonClick(e, card.button_link)}
              className="w-full bg-white/20 backdrop-blur-sm text-white rounded-md hover:bg-white/30 transition-all duration-200 font-medium border border-white/30 card-button-text"
            >
              {card.button_text}
            </button>
          </div>
        )}
        
        <BlurImage
          src={card.src}
          alt={card.title}
          fill
          className="absolute inset-0 z-10 object-cover"
        />
      </motion.div>
    </>
  );
};

