import fs from "node:fs";
import path from "node:path";

import { BottomBlurOverlay } from "@/components/bottom-blur-overlay";
import { CursorFollower } from "@/components/cursor-follower";
import { FadeInSection } from "@/components/fade-in-section";
import { Footer } from "@/components/footer";
import { GalleryMasonry } from "@/components/gallery-masonry";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteHeader } from "@/components/site-header";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

function shuffleArray<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function getGalleryImagePaths() {
  const galleryDir = path.join(process.cwd(), "public", "gallery", "photos");

  if (!fs.existsSync(galleryDir)) {
    return [];
  }

  return shuffleArray(
    fs.readdirSync(galleryDir).filter((fileName) => IMAGE_EXTENSIONS.includes(path.extname(fileName).toLowerCase())),
  ).map((fileName) => `/gallery/photos/${encodeURIComponent(fileName)}`);
}

export default function GalleryPage() {
  const imagePaths = getGalleryImagePaths();

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <SiteHeader brandHref="/" />
        <main className="max-w-site mx-auto w-full flex-1 px-8 py-12 text-zinc-300">
          <FadeInSection delay={0.05}>
            <GalleryMasonry imagePaths={imagePaths} />
          </FadeInSection>
        </main>
        <FadeInSection delay={0.25}>
          <Footer />
        </FadeInSection>
      </div>
      <BottomBlurOverlay />
      <CursorFollower />
    </>
  );
}
