import fs from "node:fs";
import path from "node:path";

import type { MetadataRoute } from "next";

const SITE_URL = "https://rawsab.com";
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

function getGalleryImageUrls() {
  const galleryDir = path.join(process.cwd(), "public", "gallery", "photos");

  if (!fs.existsSync(galleryDir)) {
    return [];
  }

  return fs
    .readdirSync(galleryDir)
    .filter((fileName) => IMAGE_EXTENSIONS.includes(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((fileName) => `${SITE_URL}/gallery/photos/${encodeURIComponent(fileName)}`);
}

function getCaseStudyPaths() {
  // Case studies are temporarily inaccessible — re-enable with the page flag.
  return [] as string[];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const galleryImages = getGalleryImageUrls();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      images: galleryImages,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const caseStudyEntries: MetadataRoute.Sitemap = getCaseStudyPaths().map((slug) => ({
    url: `${SITE_URL}/case-studies/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...caseStudyEntries];
}
