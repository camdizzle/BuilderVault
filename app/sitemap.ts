import type { MetadataRoute } from "next";
import { patternCollections } from "@/lib/patterns/collections";
import { getAllPatterns } from "@/lib/patterns/patterns";

const baseUrl = "https://buildervault.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/alm",
    "/collections",
    "/contact",
    "/dashboard",
    "/dataverse",
    "/disclaimer",
    "/favorites",
    "/patterns",
    "/power-apps",
    "/power-automate",
    "/pricing",
    "/privacy",
    "/sharepoint",
    "/terms"
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: baseUrl + route,
      lastModified: new Date("2026-05-13")
    })),
    ...patternCollections.map((collection) => ({
      url: baseUrl + "/collections/" + collection.slug,
      lastModified: new Date("2026-05-13")
    })),
    ...getAllPatterns().map((pattern) => ({
      url: baseUrl + "/patterns/" + pattern.slug,
      lastModified: new Date(pattern.updatedAt)
    }))
  ];
}
