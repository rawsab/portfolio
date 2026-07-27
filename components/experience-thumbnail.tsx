"use client";

import Image from "next/image";
import { useState } from "react";

type ExperienceThumbnailProps = {
  company: string;
  thumbnail?: string;
  videoThumbnail?: string;
};

export function ExperienceThumbnail({
  company,
  thumbnail,
  videoThumbnail,
}: ExperienceThumbnailProps) {
  const [hovered, setHovered] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const hasMedia = Boolean(thumbnail || videoThumbnail);

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-colors group-hover:border-zinc-600"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt={`${company} thumbnail`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          priority={false}
        />
      ) : null}

      {videoThumbnail ? (
        <video
          src={videoThumbnail}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-150 ease-out ${
            videoReady && !hovered ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          onCanPlay={() => setVideoReady(true)}
        />
      ) : null}

      {!hasMedia ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="px-4 text-center text-sm font-medium tracking-wide text-zinc-500 transition-colors group-hover:text-zinc-300">
            {company}
          </span>
        </div>
      ) : null}
    </div>
  );
}
