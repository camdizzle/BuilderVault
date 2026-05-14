import Link from "next/link";
import { CollectionCard } from "@/components/collections/collection-card";
import { PatternCard } from "@/components/patterns/pattern-card";
import { getSuggestedCollections } from "@/lib/patterns/collections";
import { getFeaturedPatterns, getPatternStats } from "@/lib/patterns/patterns";

export default function HomePage() {
  const featuredPatterns = getFeaturedPatterns();
  const stats = getPatternStats();
  const collections = getSuggestedCollections().slice(0, 6);

  return (
    <>
      <section style={{ padding: "76px 0 48px" }}>
        <div className="container split-grid">
          <div>
            <div className="eyebrow">Power Platform pattern library</div>
            <h1 className="page-title">Reusable patterns for faster, cleaner Microsoft business apps.</h1>
            <p className="lead">
              BuilderVault helps Power Platform developers, makers, consultants, and internal automation teams find proven implementation patterns for Power Apps, Power Automate, SharePoint, Dataverse, ALM, and admin governance.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
              <Link className="button" href="/patterns">
                Browse patterns
              </Link>
              <Link className="button secondary" href="/collections">
                Explore collections
              </Link>
            </div>
          </div>
          <div className="card" style={{ alignSelf: "start", padding: 24 }}>
            <div className="eyebrow">Builder library</div>
            <div className="stat-grid" style={{ marginTop: 18 }}>
              <Metric label="Power Platform patterns" value={stats.totalPatterns} />
              <Metric label="Free examples" value={stats.freePatterns} />
              <Metric label="Premium previews" value={stats.premiumPatterns} />
              <Metric label="Core categories" value={stats.categories} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "44px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
            <div className="eyebrow">Builder workstreams</div>
            <h2 className="section-title">Start with the thing you are building.</h2>
            <p className="lead" style={{ maxWidth: 760 }}>
              Collections package the larger library into practical build paths for request apps, approval flows, Dataverse foundations, admin governance, and delivery handoff.
            </p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {collections.map((collection) => (
              <CollectionCard collection={collection} key={collection.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="surface" style={{ padding: "44px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
            <div className="eyebrow">Pattern library</div>
            <h2 className="section-title">Find the pattern before the build slows down.</h2>
            <p className="lead" style={{ maxWidth: 760 }}>
              Search practical formulas, flow outlines, data model checklists, deployment notes, troubleshooting steps, and support handoff guidance for real Power Platform delivery.
            </p>
          </div>
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
          >
            {featuredPatterns.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "48px 0" }}>
        <div className="container">
          <div className="card split-grid" style={{ padding: 28 }}>
            <div>
              <div className="eyebrow">SEO topic hubs</div>
              <h2 className="section-title">Focused paths for common Power Platform searches.</h2>
              <p className="lead">
                Topic hubs help builders and search engines understand the library by platform: Power Apps, Power Automate, SharePoint, Dataverse, ALM, and admin governance.
              </p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              <TopicLink href="/power-apps" label="Power Apps" />
              <TopicLink href="/power-automate" label="Power Automate" />
              <TopicLink href="/sharepoint" label="SharePoint" />
              <TopicLink href="/dataverse" label="Dataverse" />
              <TopicLink href="/alm" label="ALM & governance" />
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: "34px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
            <div className="eyebrow">Pricing concept</div>
            <h2 className="section-title">Start with public examples, then unlock the deeper builder library.</h2>
          </div>
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
          >
            <Plan name="Free" price="$0" features={["Browse free patterns", "Save local favorites", "Copy public formulas"]} />
            <Plan name="Pro" price="$9-$19/mo" features={["Premium implementation patterns", "Account-based favorites later", "Curated app and workflow packs"]} />
          </div>
        </div>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-tile">
      <div style={{ fontSize: "2rem", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

function TopicLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="button secondary" href={href}>
      {label}
    </Link>
  );
}

function Plan({
  name,
  price,
  features
}: {
  name: string;
  price: string;
  features: string[];
}) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <h3 style={{ fontSize: "1.3rem", margin: 0 }}>{name}</h3>
      <div style={{ fontSize: "2rem", fontWeight: 800, margin: "10px 0" }}>{price}</div>
      <ul style={{ color: "var(--muted)", lineHeight: 1.75, marginBottom: 0 }}>
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </div>
  );
}
