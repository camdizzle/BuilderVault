import { getToolCatalogEntry } from "@/lib/tool-catalog";
import { absoluteUrl } from "@/lib/site";

const contactEmail = "help@camwow.tv";

function formatDate(isoDate: string) {
  return new Date(isoDate + "T12:00:00Z").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** The mail a visitor sends to report a wrong result. Their input isn't included, so they choose what to share. */
export function reportLink(title: string, path: string) {
  const subject = `Wrong result: ${title}`;
  const body = [
    `Tool: ${title}`,
    `Page: ${absoluteUrl(path)}`,
    "",
    "What I entered:",
    "",
    "What I expected:",
    "",
    "What the tool showed:",
    ""
  ].join("\n");
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Under each tool: which Microsoft pages its rules follow, when they were checked, and how to report a mistake. */
export function ToolTrustLine({ slug, title, path }: { slug: string; title: string; path: string }) {
  const docs = getToolCatalogEntry(slug).docs;
  return (
    <p className="tool-trust-line">
      {docs ? (
        <span>
          {docs.what} follow Microsoft&apos;s documentation, checked on {formatDate(docs.checked)}:{" "}
          {docs.sources.map((source, index) => (
            <span key={source.href}>
              {index > 0 ? ", " : ""}
              <a href={source.href} rel="noopener" target="_blank">{source.label}</a>
            </span>
          ))}
          .
        </span>
      ) : null}
      <a href={reportLink(title, path)}>Report a wrong result</a>
    </p>
  );
}
