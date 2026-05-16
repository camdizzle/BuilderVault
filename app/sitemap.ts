import type { MetadataRoute } from "next";
import { patternCollections } from "@/lib/patterns/collections";
import { getAllPatterns } from "@/lib/patterns/patterns";
import { getPatternSeo } from "@/lib/patterns/seo";
import { absoluteUrl } from "@/lib/site";
import { allResources, resourceGroups } from "@/lib/resources";

const defaultLastModified = new Date("2026-05-14");

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

const staticRoutes: Array<{
  route: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { route: "", changeFrequency: "weekly", priority: 1 },
  { route: "/patterns", changeFrequency: "weekly", priority: 0.95 },
  { route: "/power-apps", changeFrequency: "weekly", priority: 0.9 },
  { route: "/power-automate", changeFrequency: "weekly", priority: 0.9 },
  { route: "/sharepoint", changeFrequency: "weekly", priority: 0.88 },
  { route: "/dataverse", changeFrequency: "weekly", priority: 0.88 },
  { route: "/alm", changeFrequency: "weekly", priority: 0.84 },
  { route: "/collections", changeFrequency: "weekly", priority: 0.8 },
  { route: "/resources", changeFrequency: "weekly", priority: 0.82 },
  ...resourceGroups.map((group) => ({ route: group.path, changeFrequency: "weekly" as const, priority: 0.78 })),
  { route: "/about", changeFrequency: "monthly", priority: 0.45 },
  { route: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { route: "/pricing", changeFrequency: "monthly", priority: 0.35 },
  { route: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { route: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { route: "/disclaimer", changeFrequency: "yearly", priority: 0.2 },
  ...seoHubRoutes.map((route) => ({
    route,
    changeFrequency: "weekly" as const,
    priority: 0.86
  }))
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...staticRoutes.map(({ route, changeFrequency, priority }) => ({
      url: absoluteUrl(route),
      lastModified: defaultLastModified,
      changeFrequency,
      priority
    })),
    ...allResources.map((resource) => ({
      url: absoluteUrl(resource.path),
      lastModified: defaultLastModified,
      changeFrequency: "monthly" as const,
      priority: resource.kind === "cookbook" || resource.kind === "cheat-sheet" ? 0.76 : 0.68
    })),
    ...patternCollections.map((collection) => ({
      url: absoluteUrl("/collections/" + collection.slug),
      lastModified: defaultLastModified,
      changeFrequency: "weekly" as const,
      priority: 0.72
    })),
    ...getAllPatterns().map((pattern) => {
      const seo = getPatternSeo(pattern);

      return {
        url: absoluteUrl("/patterns/" + pattern.slug),
        lastModified: new Date(pattern.updatedAt),
        changeFrequency: "monthly" as const,
        priority: seo.seoPriority === "high" ? 0.7 : seo.seoPriority === "standard" ? 0.62 : 0.5
      };
    })
  ];
}
