"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";

import { GalleryMasonry } from "@/components/gallery-masonry";

type GalleryShuffleProps = {
  imagePaths: string[];
};

function shuffleArray<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function GalleryShuffle({ imagePaths }: GalleryShuffleProps) {
  const [orderedPaths, setOrderedPaths] = useState(imagePaths);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleIteration, setShuffleIteration] = useState(0);
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOrderedPaths(imagePaths);
  }, [imagePaths]);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  const handleShuffle = () => {
    setOrderedPaths((prev) => shuffleArray(prev));
    setShuffleIteration((prev) => prev + 1);
    setIsShuffling(false);

    requestAnimationFrame(() => {
      setIsShuffling(true);
    });

    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
    }

    spinTimeoutRef.current = setTimeout(() => {
      setIsShuffling(false);
    }, 550);
  };

  return (
    <div>
      <div className="-mt-4 mb-4 sm:mb-6 flex justify-center">
        <button
          type="button"
          onClick={handleShuffle}
          className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 font-mono text-sm lowercase tracking-wide text-zinc-500 transition-colors hover:cursor-pointer hover:text-zinc-300"
          aria-label="Shuffle gallery photos"
        >
          <span>shuffle</span>
          <RefreshCcw className={`h-4 w-4 ${isShuffling ? "animate-spin" : ""}`} />
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={shuffleIteration}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <GalleryMasonry imagePaths={orderedPaths} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
