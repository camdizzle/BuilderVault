import Link from "next/link";
import { CollectionCard } from "@/components/collections/collection-card";
import { PatternCard } from "@/components/patterns/pattern-card";
import { getSuggestedCollections } from "@/lib/patterns/collections";
import { getFeaturedPatterns, getPatternStats } from "@/lib/patterns/patterns";

export default function HomePage() {
  const featuredPatterns = getFeaturedPatterns();
  const stats = getPatternStats();
  const collections = getSuggestedCollections().slice(0, 3);

  return (
    <>
      <section style={{ padding: "76px 0 48px" }}>
        <div className="container split-grid">
          <div>
            <div className="eyebrow">Microsoft 365 builder toolkit</div>
            <h1 className="page-title">Practical patterns for real business apps.</h1>
            <p className="lead">
              BuilderVault helps Power Apps makers, SharePoint owners, and PMO
              teams find copy-ready implementation patterns and turn rough
              project notes into polished status updates.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
              <Link className="button" href="/patterns">
                Browse patterns
              </Link>
              <Link className="button secondary" href="/reports/new">
                Try report preview
              </Link>
            </div>
          </div>
          <div className="card" style={{ alignSelf: "start", padding: 24 }}>
            <div className="eyebrow">Static library preview</div>
            <div className="stat-grid" style={{ marginTop: 18 }}>
              <Metric label="Patterns" value={stats.totalPatterns} />
              <Metric label="Free examples" value={stats.freePatterns} />
              <Metric label="Premium previews" value={stats.premiumPatterns} />
              <Metric label="Categories" value={stats.categories} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "44px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
            <div className="eyebrow">Curated kits</div>
            <h2 className="section-title">Start with a focused collection.</h2>
            <p className="lead" style={{ maxWidth: 760 }}>
              Collections turn the larger 160-pattern library into practical
              workstreams for builders, admins, and PMO teams.
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
            <h2 className="section-title">Find the formula before the work stalls.</h2>
            <p className="lead" style={{ maxWidth: 760 }}>
              The first product is a searchable library of field-tested Power
              Apps, SharePoint, Power Automate, and PMO patterns with formulas,
              implementation notes, mistakes, and troubleshooting.
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

      <section id="reports" style={{ padding: "48px 0" }}>
        <div className="container">
          <div className="card split-grid" style={{ padding: 28 }}>
            <div>
              <div className="eyebrow">Coming after foundation</div>
              <h2 className="section-title">Project status reports without the blank page.</h2>
              <p className="lead">
                The second BuilderVault product will collect project health,
                accomplishments, risks, issues, decisions, and next steps, then
                produce business-ready summaries for executives, PMOs, teams,
                and stakeholders. A local-only preview is available now.
              </p>
              <Link className="button" href="/reports/new">
                Open report preview
              </Link>
            </div>
            <div
              style={{
                background: "#f3f6f2",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: 20
              }}
            >
              <strong>Sample output shape</strong>
              <ul style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 0 }}>
                <li>Executive summary</li>
                <li>Weekly status report</li>
                <li>Steering committee summary</li>
                <li>Email-ready update</li>
                <li>Risks, issues, and actions table</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" style={{ padding: "34px 0" }}>
        <div className="container">
          <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
            <div className="eyebrow">Pricing concept</div>
            <h2 className="section-title">Start useful, then unlock the deeper library.</h2>
          </div>
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
          >
            <Plan name="Free" price="$0" features={["Browse free patterns", "View premium previews", "Copy public formulas"]} />
            <Plan name="Pro" price="$9-$19/mo" features={["Premium patterns", "Saved favorites later", "Full report generation later"]} />
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
