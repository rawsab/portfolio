"use client";

import { useState } from 'react';
import ImageModal from './image-modal';

interface ImageWithCaptionProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}

export default function ImageWithCaption({ 
  src, 
  alt, 
  caption, 
  className = "" 
}: ImageWithCaptionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="my-8">
        <img 
          src={src} 
          alt={alt}
          className={`w-full mb-6 rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${className}`}
          draggable="false"
          onClick={handleImageClick}
        />
        {caption && (
          <span className="text-center text-sm text-zinc-500 block">
            {caption}
          </span>
        )}
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        src={src}
        alt={alt}
        caption={caption}
      />
    </>
  );
}
