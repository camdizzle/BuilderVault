import type { MetadataRoute } from "next";
import { patternCollections } from "@/lib/patterns/collections";
import { getAllPatterns } from "@/lib/patterns/patterns";
import { isPatternIndexable } from "@/lib/patterns/indexing";
import { getPatternSeo } from "@/lib/patterns/seo";
import { absoluteUrl } from "@/lib/site";
import { allResources, resourceGroups } from "@/lib/resources";
import { exampleGuides } from "@/lib/example-guides";
import { errorPages, errorPath } from "@/lib/errors";
import { functionPages, functionPath } from "@/lib/functions";
import { guidePath, guides } from "@/lib/guides";
import { pmoLifecycleStages } from "@/lib/pmo-toolkit";

// The date each group of pages last changed. Move a date forward only when that group's content changes.
const lastChanged = {
  library: new Date("2026-11-20"),
  resources: new Date("2026-11-20"),
  examples: new Date("2026-11-20"),
  pmo: new Date("2026-05-14"),
  company: new Date("2026-05-14")
};
const companyRoutes = new Set(["/about", "/contact", "/services", "/privacy", "/terms", "/disclaimer", "/downloads", "/examples"]);

function lastChangedFor(route: string) {
  if (route === "/pmo") return lastChanged.library;
  if (route.startsWith("/pmo/")) return lastChanged.pmo;
  if (route === "/downloads" || route === "/examples") return lastChanged.examples;
  if (companyRoutes.has(route)) return lastChanged.company;
  return lastChanged.library;
}

const pmoRoutes = [
  "/pmo",
  "/pmo/roadmap",
  "/pmo/architecture",
  "/pmo/data-dictionary",
  "/pmo/bundle",
  "/pmo/compare",
  "/pmo/mockups",
  "/pmo/starter-files",
  "/pmo/glossary",
  "/pmo/demo",
  "/pmo/offer",
  ...pmoLifecycleStages.map((stage) => `/pmo/${stage.slug}`),
  ...pmoLifecycleStages.map((stage) => `/pmo/packages/${stage.slug}`)
];
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
  { route: "/examples", changeFrequency: "weekly", priority: 0.84 },
  { route: "/guides", changeFrequency: "weekly", priority: 0.84 },
  { route: "/errors", changeFrequency: "weekly", priority: 0.84 },
  { route: "/functions", changeFrequency: "weekly", priority: 0.84 },
  { route: "/downloads", changeFrequency: "monthly", priority: 0.7 },
  ...pmoRoutes.map((route) => ({ route, changeFrequency: "weekly" as const, priority: route === "/pmo" ? 0.86 : 0.64 })),
  ...resourceGroups.map((group) => ({ route: group.path, changeFrequency: "weekly" as const, priority: 0.78 })),
  { route: "/about", changeFrequency: "monthly", priority: 0.45 },
  { route: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { route: "/services", changeFrequency: "monthly", priority: 0.6 },
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
      lastModified: lastChangedFor(route),
      changeFrequency,
      priority
    })),
    ...exampleGuides.map((guide) => ({
      url: absoluteUrl("/examples/" + guide.slug),
      lastModified: lastChanged.examples,
      changeFrequency: "monthly" as const,
      priority: 0.78
    })),
    ...guides.map((guide) => ({
      url: absoluteUrl(guidePath(guide)),
      lastModified: new Date(guide.updated),
      changeFrequency: "monthly" as const,
      priority: 0.8
    })),
    ...functionPages.map((page) => ({
      url: absoluteUrl(functionPath(page)),
      lastModified: new Date(page.updated),
      changeFrequency: "monthly" as const,
      priority: 0.8
    })),
    ...errorPages.map((page) => ({
      url: absoluteUrl(errorPath(page)),
      lastModified: new Date(page.updated),
      changeFrequency: "monthly" as const,
      priority: 0.78
    })),
    ...allResources.map((resource) => ({
      url: absoluteUrl(resource.path),
      lastModified: lastChanged.resources,
      changeFrequency: "monthly" as const,
      priority: resource.kind === "cookbook" || resource.kind === "cheat-sheet" ? 0.76 : 0.68
    })),
    ...patternCollections.map((collection) => ({
      url: absoluteUrl("/collections/" + collection.slug),
      lastModified: lastChanged.library,
      changeFrequency: "weekly" as const,
      priority: 0.72
    })),
    ...getAllPatterns().filter(isPatternIndexable).map((pattern) => {
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
