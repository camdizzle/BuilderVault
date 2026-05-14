import Link from "next/link";
import { CollectionCard } from "@/components/collections/collection-card";
import { PatternCard } from "@/components/patterns/pattern-card";
import { getCollectionBySlug } from "@/lib/patterns/collections";
import { getAllPatterns } from "@/lib/patterns/patterns";

export const metadata = {
  title: "Power Platform ALM and governance patterns | BuilderVault",
  description: "Strengthen delivery with patterns for solution layering, deployment readiness, connection references, managed solution promotion, rollback decisions, maker handoff, and admin governance."
};

export default function TopicPage() {
  const patterns = getAllPatterns()
    .filter((pattern) => pattern.category === "ALM & Governance")
    .slice(0, 12);
  const collections = ["solution-deployment-checklist", "consultant-delivery-pack", "power-platform-admin-governance-kit"]
    .map((slug) => getCollectionBySlug(slug))
    .filter((collection): collection is NonNullable<typeof collection> => Boolean(collection));

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <div style={{ maxWidth: 900 }}>
          <div className="eyebrow">ALM and governance hub</div>
          <h1 className="page-title">Power Platform ALM and governance patterns</h1>
          <p className="lead">Strengthen delivery with patterns for solution layering, deployment readiness, connection references, managed solution promotion, rollback decisions, maker handoff, and admin governance.</p>
          <div className="badge-row" style={{ marginTop: 18 }}>
            <span className="badge">Power Platform ALM</span>
            <span className="badge">managed solutions</span>
            <span className="badge">connection references</span>
            <span className="badge">deployment checklist</span>
            <span className="badge">maker handoff</span>
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
