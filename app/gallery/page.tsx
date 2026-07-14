import fs from "node:fs";
import path from "node:path";

import { BottomBlurOverlay } from "@/components/bottom-blur-overlay";
import { CursorFollower } from "@/components/cursor-follower";
import { FadeInSection } from "@/components/fade-in-section";
import { Footer } from "@/components/footer";
import { GalleryShuffle } from "@/components/gallery-shuffle";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteHeader } from "@/components/site-header";
import galleryAlts from "@/data/gallery-alts.json";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

function getGalleryImages() {
  const galleryDir = path.join(process.cwd(), "public", "gallery", "photos");

  if (!fs.existsSync(galleryDir)) {
    return [];
  }

  return fs
    .readdirSync(galleryDir)
    .filter((fileName) => IMAGE_EXTENSIONS.includes(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((fileName) => ({
      src: `/gallery/photos/${encodeURIComponent(fileName)}`,
      alt: galleryAlts[fileName as keyof typeof galleryAlts] ?? "",
    }));
}

export default function GalleryPage() {
  const images = getGalleryImages();

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <SiteHeader brandHref="/" />
        <main className="max-w-site mx-auto w-full flex-1 px-8 py-12 text-zinc-300">
          <FadeInSection delay={0.05}>
            <GalleryShuffle images={images} />
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
