export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://buildervault.camwow.tv").replace(/\/$/, "");

export function absoluteUrl(path = "") {
  if (!path) {
    return siteUrl;
  }

  return siteUrl + (path.startsWith("/") ? path : "/" + path);
}

/**
 * Author shown on pattern bylines, the About page, and in structured data.
 * Fill these in to turn the byline on. Leave name empty to hide it.
 */
export const siteAuthor = {
  name: "",
  /** One or two sentences: role, years with Power Platform, certifications. */
  bio: "",
  /** Public profile URLs such as LinkedIn or GitHub, used for sameAs in structured data. */
  profiles: [] as string[]
};

export const publisherOrganization = {
  "@type": "Organization",
  name: "BuilderVault",
  url: siteUrl,
  logo: siteUrl + "/icon.svg"
};

export function authorStructuredData() {
  if (!siteAuthor.name) return undefined;
  return {
    "@type": "Person",
    name: siteAuthor.name,
    url: siteUrl + "/about",
    ...(siteAuthor.profiles.length > 0 ? { sameAs: siteAuthor.profiles } : {})
  };
}

export function formatDisplayDate(value: string) {
  const date = new Date(value + (value.length === 10 ? "T00:00:00Z" : ""));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
