import type { MetadataRoute } from "next";
import { isBlogEnabled } from "@/lib/flags";

const SITE_URL = "https://rawsab.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      ...(isBlogEnabled() ? {} : { disallow: ["/blog"] }),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
