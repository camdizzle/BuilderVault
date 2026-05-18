import Link from "next/link";
import { BulletList } from "@/components/patterns/bullet-list";
import { DetailSection } from "@/components/patterns/detail-section";
import { getPmoStageBySlug, pmoMasterRoadmapDownload, pmoOperatingModel, pmoRoadmapPhases } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO 30/60/90 Roadmap | BuilderVault",
  description: "A BuilderVault roadmap for rolling out a practical PMO system with Power Platform over 30, 60, and 90 days."
};

export default function PmoRoadmapPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 32 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>PMO toolkit</Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span>
          <span style={{ color: "var(--muted)" }}>30/60/90 roadmap</span>
        </nav>

        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO implementation roadmap</div>
          <h1 className="page-title">30/60/90-day PMO build roadmap</h1>
          <p className="lead">
            A practical rollout plan for PMO teams that want portfolio visibility, approvals, gate control, RAID discipline, and reporting without buying a large enterprise PMO platform first.
          </p>
        </header>

        <section className="surface" style={{ borderRadius: 12, padding: 24 }}>
          <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
            <div className="eyebrow">Rollout principle</div>
            <h2 className="section-title">Build behavior change before building platform weight.</h2>
            <p style={{ color: "#415049", fontSize: "1.06rem", lineHeight: 1.7, margin: 0 }}>
              The first 90 days should prove that the PMO can capture demand, route decisions, control lifecycle movement, and communicate portfolio health. Keep each release small enough that people actually use it, then tighten governance after the operating rhythm is real.
            </p>
            <a className="button" download href={pmoMasterRoadmapDownload.href} style={{ justifySelf: "start" }}>
              Download master roadmap
            </a>
          </div>
        </section>

        <section style={{ display: "grid", gap: 22 }}>
          {pmoRoadmapPhases.map((phase) => (
            <article className="card" key={phase.phase} style={{ display: "grid", gap: 22, padding: 24 }}>
              <div className="badge-row">
                <span className="badge free">{phase.phase}</span>
                <span className="badge">{phase.timebox}</span>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <h2 style={{ fontSize: "1.45rem", lineHeight: 1.2, margin: 0 }}>{phase.goal}</h2>
                <ModuleLinks slugs={phase.modules} />
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                <RoadmapPanel title="Deliverables" items={phase.deliverables} />
                <RoadmapPanel title="Build activities" items={phase.activities} />
                <RoadmapPanel title="Exit criteria" items={phase.exitCriteria} />
              </div>
              <DetailSection title="Adoption risks to watch">
                <BulletList items={phase.adoptionRisks} />
              </DetailSection>
            </article>
          ))}
        </section>

        <section className="card" style={{ display: "grid", gap: 20, padding: 24 }}>
          <div>
            <div className="eyebrow">Operating model</div>
            <h2 className="section-title">The cadence that keeps the PMO system alive.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {pmoOperatingModel.map((item) => (
              <article className="surface" key={item.area} style={{ borderRadius: 10, display: "grid", gap: 12, padding: 18 }}>
                <div className="badge-row">
                  <span className="badge free">{item.cadence}</span>
                </div>
                <h3 style={{ fontSize: "1.1rem", margin: 0 }}>{item.area}</h3>
                <p style={{ color: "#415049", lineHeight: 1.55, margin: 0 }}><strong>Owner:</strong> {item.owner}</p>
                <BulletList items={item.responsibilities} />
              </article>
            ))}
          </div>
        </section>

        <section className="surface" style={{ borderRadius: 12, padding: 24 }}>
          <div style={{ display: "grid", gap: 14, maxWidth: 920 }}>
            <div className="eyebrow">Recommended path</div>
            <h2 className="section-title">Start with intake, then earn the right to govern more.</h2>
            <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>
              The order matters. Intake gives visibility. Charter approval creates alignment. Stage gates create lifecycle control. RAID and change control protect delivery. Reporting turns all of it into executive action. Skipping straight to dashboards usually creates beautiful reports on top of inconsistent behavior.
            </p>
            <Link className="button" href="/pmo/packages/intake-and-triage" style={{ justifySelf: "start" }}>
              Start with the intake package
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}

function ModuleLinks({ slugs }: { slugs: string[] }) {
  return (
    <div className="badge-row">
      {slugs.map((slug) => {
        const stage = getPmoStageBySlug(slug);

        if (!stage) {
          return null;
        }

        return (
          <span className="badge-row" key={slug}>
            <Link href={`/pmo/${slug}`} style={{ color: "var(--accent-strong)", fontWeight: 800 }}>{stage.title}</Link>
            <Link href={`/pmo/packages/${slug}`} style={{ color: "var(--muted)", fontWeight: 700 }}>Package</Link>
          </span>
        );
      })}
    </div>
  );
}

function RoadmapPanel({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="surface" style={{ borderRadius: 10, display: "grid", gap: 12, padding: 18 }}>
      <h3 style={{ fontSize: "1.05rem", margin: 0 }}>{title}</h3>
      <BulletList items={items} />
    </div>
  );
}
