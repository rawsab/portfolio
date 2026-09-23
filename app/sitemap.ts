import type { MetadataRoute } from "next";

const SITE_URL = "https://rawsab.com";

function getCaseStudyPaths() {
  // Case studies are temporarily inaccessible — re-enable with the page flag.
  return [] as string[];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
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
