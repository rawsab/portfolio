import type { MetadataRoute } from "next";

const SITE_URL = "https://rawsab.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/case-studies/", "/blog", "/gallery"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
