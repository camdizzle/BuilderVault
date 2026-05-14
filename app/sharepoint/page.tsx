import Link from "next/link";
import { CollectionCard } from "@/components/collections/collection-card";
import { PatternCard } from "@/components/patterns/pattern-card";
import { getCollectionBySlug } from "@/lib/patterns/collections";
import { getAllPatterns } from "@/lib/patterns/patterns";

export const metadata = {
  title: "SharePoint patterns for Power Platform backends | BuilderVault",
  description: "Use SharePoint backend patterns for list schemas, internal names, indexed views, permissions, ownership, lifecycle reviews, and app-ready data structures."
};

export default function TopicPage() {
  const patterns = getAllPatterns()
    .filter((pattern) => pattern.category === "SharePoint")
    .slice(0, 12);
  const collections = ["sharepoint-backend-starter-kit", "request-management-app-kit", "free-starter-patterns"]
    .map((slug) => getCollectionBySlug(slug))
    .filter((collection): collection is NonNullable<typeof collection> => Boolean(collection));

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <div style={{ maxWidth: 900 }}>
          <div className="eyebrow">SharePoint hub</div>
          <h1 className="page-title">SharePoint patterns for Power Platform backends</h1>
          <p className="lead">Use SharePoint backend patterns for list schemas, internal names, indexed views, permissions, ownership, lifecycle reviews, and app-ready data structures.</p>
          <div className="badge-row" style={{ marginTop: 18 }}>
            <span className="badge">SharePoint list schema</span>
            <span className="badge">internal names</span>
            <span className="badge">indexed views</span>
            <span className="badge">permissions</span>
            <span className="badge">app backend</span>
          </div>
        </div>

        <section style={{ display: "grid", gap: 18 }}>
          <h2 className="section-title">Recommended collections</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {collections.map((collection) => (
              <CollectionCard collection={{ ...collection, count: collection.patternSlugs.length }} key={collection.slug} />
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gap: 18 }}>
          <div style={{ alignItems: "end", display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "space-between" }}>
            <h2 className="section-title" style={{ margin: 0 }}>Featured patterns</h2>
            <Link className="button secondary" href="/patterns">Browse all patterns</Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {patterns.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
