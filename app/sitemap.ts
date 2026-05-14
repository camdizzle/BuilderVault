import type { MetadataRoute } from "next";
import { patternCollections } from "@/lib/patterns/collections";
import { getAllPatterns } from "@/lib/patterns/patterns";

const baseUrl = "https://buildervault.app";

const seoHubRoutes = [
  "/alm/governance",
  "/alm/solutions",
  "/dataverse/security-roles",
  "/dataverse/table-design",
  "/power-apps/delegation",
  "/power-apps/forms",
  "/power-apps/patch",
  "/power-automate/adaptive-cards",
  "/power-automate/approvals",
  "/power-automate/error-handling",
  "/power-automate/trigger-conditions",
  "/sharepoint/list-schemas"
];

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
    "/terms",
    ...seoHubRoutes
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: baseUrl + route,
      lastModified: new Date("2026-05-14")
    })),
    ...patternCollections.map((collection) => ({
      url: baseUrl + "/collections/" + collection.slug,
      lastModified: new Date("2026-05-14")
    })),
    ...getAllPatterns().map((pattern) => ({
      url: baseUrl + "/patterns/" + pattern.slug,
      lastModified: new Date(pattern.updatedAt)
    }))
  ];
}
