import Link from "next/link";
import { BulletList } from "@/components/patterns/bullet-list";
import { getPmoStageBySlug, pmoPortalMockups } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO Portal Mockups | BuilderVault",
  description: "Hidden BuilderVault visual mockups for PMO Power Apps portals, queues, gate reviews, RAID control, and executive reporting.",
  robots: {
    index: false,
    follow: false
  }
};

export default function PmoMockupsPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 32 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>PMO toolkit</Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span>
          <span style={{ color: "var(--muted)" }}>Portal mockups</span>
        </nav>

        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">Hidden PMO visual blueprints</div>
          <h1 className="page-title">PMO portal mockups</h1>
          <p className="lead">
            Static visual references for the Power Apps and Power BI experiences in the PMO toolkit. These are not live apps yet; they show the screen structure, data density, and decisions each module should support.
          </p>
        </header>

        <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {pmoPortalMockups.map((mockup) => (
            <a className="card" href={`#${mockup.slug}`} key={mockup.slug} style={{ display: "grid", gap: 10, padding: 18 }}>
              <span className="badge free" style={{ justifySelf: "start" }}>{mockup.persona}</span>
              <strong>{mockup.title}</strong>
              <span style={{ color: "#415049", lineHeight: 1.55 }}>{mockup.purpose}</span>
            </a>
          ))}
        </section>

        <div style={{ display: "grid", gap: 28 }}>
          {pmoPortalMockups.map((mockup) => {
            const stage = getPmoStageBySlug(mockup.moduleSlug);
            return (
              <article className="card" id={mockup.slug} key={mockup.slug} style={{ display: "grid", gap: 22, padding: 24 }}>
                <div className="badge-row">
                  <span className="badge free">{stage?.title}</span>
                  <Link href={`/pmo/packages/${mockup.moduleSlug}`} style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Open package</Link>
                </div>
                <div style={{ display: "grid", gap: 10, maxWidth: 900 }}>
                  <h2 style={{ fontSize: "1.55rem", lineHeight: 1.2, margin: 0 }}>{mockup.title}</h2>
                  <p style={{ color: "#415049", lineHeight: 1.65, margin: 0 }}>{mockup.purpose}</p>
                </div>
                <MockupFrame mockup={mockup} />
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                  <MiniPanel title="Layout pattern" items={mockup.layout} />
                  <MiniPanel title="Core fields" items={mockup.fields} />
                  <MiniPanel title="Primary actions" items={mockup.actions} />
                  <MiniPanel title="Build notes" items={mockup.buildNotes} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type Mockup = (typeof pmoPortalMockups)[number];

function MockupFrame({ mockup }: { mockup: Mockup }) {
  return (
    <div style={{ background: "#eef1ed", border: "1px solid var(--line)", borderRadius: 8, padding: 14 }}>
      <div style={{ background: "#ffffff", border: "1px solid #cfd7d1", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ alignItems: "center", background: "#17201d", color: "#ffffff", display: "flex", justifyContent: "space-between", minHeight: 46, padding: "0 16px" }}>
          <strong>{mockup.title.replace(" mockup", "")}</strong>
          <span style={{ color: "#b8ead4", fontSize: "0.86rem", fontWeight: 700 }}>{mockup.persona}</span>
        </div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "minmax(220px, 0.72fr) minmax(220px, 1fr)", padding: 16 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <div className="grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              {mockup.metrics.map((metric) => (
                <div className="stat-tile" key={metric.label} style={{ padding: 12 }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{metric.value}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{metric.label}</div>
                </div>
              ))}
            </div>
            <div className="surface" style={{ border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 10, padding: 14 }}>
              <strong>Record form</strong>
              <div style={{ display: "grid", gap: 8 }}>
                {mockup.fields.slice(0, 6).map((field) => (
                  <div key={field} style={{ display: "grid", gap: 5 }}>
                    <span style={{ color: "#415049", fontSize: "0.78rem", fontWeight: 800 }}>{field}</span>
                    <span style={{ background: "#f7f8f5", border: "1px solid var(--line)", borderRadius: 6, minHeight: 30 }} />
                  </div>
                ))}
              </div>
              <div className="badge-row" style={{ paddingTop: 4 }}>
                {mockup.actions.slice(0, 2).map((action, index) => (
                  <span className={index === 0 ? "badge free" : "badge"} key={action}>{action}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <div className="surface" style={{ border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 10, padding: 14 }}>
              <strong>Operational queue</strong>
              {mockup.queueItems.map((item) => (
                <div key={item.title} style={{ alignItems: "center", borderBottom: "1px solid var(--line)", display: "grid", gap: 10, gridTemplateColumns: "minmax(0, 1fr) auto", padding: "8px 0" }}>
                  <span style={{ display: "grid", gap: 4 }}>
                    <strong style={{ fontSize: "0.95rem" }}>{item.title}</strong>
                    <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{item.meta}</span>
                  </span>
                  <span className="badge">{item.status}</span>
                </div>
              ))}
            </div>
            <div className="surface" style={{ border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 10, padding: 14 }}>
              <strong>Decision panel</strong>
              <div className="badge-row">
                {mockup.actions.map((action) => <span className="badge" key={action}>{action}</span>)}
              </div>
              <div style={{ background: "#f7f8f5", border: "1px solid var(--line)", borderRadius: 8, minHeight: 78, padding: 12 }}>
                <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>Comments, decision reason, evidence links, or executive summary appear here.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniPanel({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="surface" style={{ borderRadius: 10, padding: 16 }}>
      <h3 style={{ fontSize: "1rem", margin: "0 0 10px" }}>{title}</h3>
      <BulletList items={items} />
    </div>
  );
}
