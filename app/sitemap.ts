import type { MetadataRoute } from "next";
import { patternCollections } from "@/lib/patterns/collections";
import { getAllPatterns } from "@/lib/patterns/patterns";

const baseUrl = "https://buildervault.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/collections",
    "/contact",
    "/dashboard",
    "/disclaimer",
    "/favorites",
    "/patterns",
    "/pricing",
    "/privacy",
    "/reports/new",
    "/terms"
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date("2026-05-10")
    })),
    ...patternCollections.map((collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      lastModified: new Date("2026-05-10")
    })),
    ...getAllPatterns().map((pattern) => ({
      url: `${baseUrl}/patterns/${pattern.slug}`,
      lastModified: new Date(pattern.updatedAt)
    }))
  ];
}
