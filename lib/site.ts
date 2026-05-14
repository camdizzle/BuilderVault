export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://buildervault.camwow.tv").replace(/\/$/, "");

export function absoluteUrl(path = "") {
  if (!path) {
    return siteUrl;
  }

  return siteUrl + (path.startsWith("/") ? path : "/" + path);
}
