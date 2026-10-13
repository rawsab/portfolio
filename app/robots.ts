import type { MetadataRoute } from "next";
import { isBlogEnabled } from "@/lib/flags";

const SITE_URL = "https://rawsab.com";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/case-studies/", "/gallery"];
  if (!isBlogEnabled()) {
    disallow.push("/blog");
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
