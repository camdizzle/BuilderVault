import Link from "next/link";
import { CollectionCard } from "@/components/collections/collection-card";
import { PatternCard } from "@/components/patterns/pattern-card";
import { getCollectionBySlug } from "@/lib/patterns/collections";
import { getAllPatterns } from "@/lib/patterns/patterns";

export const metadata = {
  title: "Dataverse patterns for scalable Power Platform apps | BuilderVault",
  description: "Plan better Dataverse apps with patterns for tables, relationships, choice columns, security roles, environment variables, solution-aware data models, and SharePoint migration paths."
};

export default function TopicPage() {
  const patterns = getAllPatterns()
    .filter((pattern) => pattern.category === "Dataverse")
    .slice(0, 12);
  const collections = ["dataverse-app-foundation-pack", "solution-deployment-checklist", "power-platform-admin-governance-kit"]
    .map((slug) => getCollectionBySlug(slug))
    .filter((collection): collection is NonNullable<typeof collection> => Boolean(collection));

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <div style={{ maxWidth: 900 }}>
          <div className="eyebrow">Dataverse hub</div>
          <h1 className="page-title">Dataverse patterns for scalable Power Platform apps</h1>
          <p className="lead">Plan better Dataverse apps with patterns for tables, relationships, choice columns, security roles, environment variables, solution-aware data models, and SharePoint migration paths.</p>
          <div className="badge-row" style={{ marginTop: 18 }}>
            <span className="badge">Dataverse table design</span>
            <span className="badge">security roles</span>
            <span className="badge">relationships</span>
            <span className="badge">environment variables</span>
            <span className="badge">SharePoint migration</span>
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
