"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type GalleryMasonryProps = {
  imagePaths: string[];
};

export function GalleryMasonry({ imagePaths }: GalleryMasonryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedImage) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImage]);

  if (!imagePaths.length) {
    return (
      <p className="font-mono text-sm text-zinc-500">
        Drop photos into <code>public/gallery/photos</code> and they will appear here.
      </p>
    );
  }

  return (
    <>
      <div className="columns-3 gap-3 sm:gap-4">
        {imagePaths.map((src) => (
          <button
            key={src}
            type="button"
            onClick={() => setSelectedImage(src)}
            className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-md border border-zinc-800/70 bg-zinc-950/40"
            aria-label="Open image"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" draggable={false} className="block h-auto w-full" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-200 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative max-h-[90vh] max-w-[92vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white p-1 text-zinc-900 transition-colors hover:bg-zinc-200 hover:cursor-pointer"
                aria-label="Close image modal"
              >
                <X className="h-5 w-5" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt=""
                draggable={false}
                className="max-h-[90vh] max-w-[92vw] rounded-md object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
