import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: ["/*?*"],
      userAgent: "*"
    },
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
