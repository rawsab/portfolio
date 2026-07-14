"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export type GalleryImage = {
  src: string;
  alt: string;
};

type GalleryMasonryProps = {
  images: GalleryImage[];
};

export function GalleryMasonry({ images }: GalleryMasonryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [isModalImageLoading, setIsModalImageLoading] = useState(false);

  const markImageLoaded = (src: string) => {
    setLoadedImages((prev) => (prev[src] ? prev : { ...prev, [src]: true }));
  };
  const handleGridImageRef = (src: string) => (img: HTMLImageElement | null) => {
    if (img?.complete) {
      markImageLoaded(src);
    }
  };
  const handleModalImageRef = (img: HTMLImageElement | null) => {
    if (img?.complete) {
      setIsModalImageLoading(false);
    }
  };

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

  useEffect(() => {
    setIsModalImageLoading(Boolean(selectedImage));
  }, [selectedImage]);

  if (!images.length) {
    return (
      <p className="font-mono text-sm text-zinc-500">
        Drop photos into <code>public/gallery/photos</code> and they will appear here.
      </p>
    );
  }

  return (
    <>
      <div className="columns-3 gap-3 sm:gap-4">
        {images.map((image) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setSelectedImage(image)}
            className="mb-4 block w-full break-inside-avoid overflow-hidden rounded-md border border-zinc-800/70 bg-zinc-950/40"
            aria-label={image.alt || "Open image"}
          >
            <div className="relative w-full">
              {!loadedImages[image.src] && (
                <div
                  className="aspect-[4/5] w-full animate-pulse rounded-md bg-zinc-800/50"
                  aria-hidden="true"
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={handleGridImageRef(image.src)}
                src={image.src}
                alt={image.alt}
                loading="lazy"
                draggable={false}
                onLoad={() => markImageLoaded(image.src)}
                onError={() => markImageLoaded(image.src)}
                className={`block h-auto w-full transition-opacity duration-300 ${loadedImages[image.src] ? "opacity-100" : "opacity-0 absolute inset-0"}`}
              />
            </div>
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
              {isModalImageLoading && (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-md bg-zinc-800/60"
                  aria-hidden="true"
                >
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300/40 border-t-zinc-100" />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={handleModalImageRef}
                src={selectedImage.src}
                alt={selectedImage.alt}
                draggable={false}
                onLoad={() => setIsModalImageLoading(false)}
                onError={() => setIsModalImageLoading(false)}
                className={`max-h-[90vh] max-w-[92vw] rounded-md object-contain transition-opacity duration-200 ${
                  isModalImageLoading ? "opacity-0" : "opacity-100"
                }`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
