import Link from "next/link";
import { BulletList } from "@/components/patterns/bullet-list";
import {
  pmoArchitectureDecisionGuide,
  pmoArchitectureEnvironmentPath,
  pmoArchitectureLayers,
  pmoArchitectureReleasePath,
  pmoArchitectureSecurityRoles
} from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO Solution Architecture | BuilderVault",
  description: "A BuilderVault architecture blueprint for building a PMO system with Power Apps, SharePoint or Dataverse, Power Automate, Power BI, Teams, and managed releases."
};

export default function PmoArchitecturePage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 32 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>PMO toolkit</Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span>
          <span style={{ color: "var(--muted)" }}>Solution architecture</span>
        </nav>

        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO architecture</div>
          <h1 className="page-title">PMO solution architecture</h1>
          <p className="lead">
            A practical architecture map for building the PMO toolkit with Microsoft 365 and Power Platform: focused app experiences, a governed operational data layer, automated decisions and communications, Power BI reporting, Teams notifications, security roles, and a release path.
          </p>
        </header>

        <section className="surface" style={{ borderRadius: 12, padding: 24 }}>
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <div className="eyebrow">Reference architecture</div>
              <h2 className="section-title">Five layers that keep the PMO build understandable.</h2>
            </div>
            <a className="button" download href="/pmo-guides/pmo-solution-architecture-brief.md" style={{ justifySelf: "start" }}>
              Download architecture brief
            </a>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
              {pmoArchitectureLayers.map((layer, index) => (
                <div className="stat-tile" key={layer.layer}>
                  <div style={{ color: "var(--accent-strong)", fontSize: "0.78rem", fontWeight: 800 }}>Layer {index + 1}</div>
                  <strong>{layer.layer}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gap: 18 }}>
          {pmoArchitectureLayers.map((layer) => (
            <article className="card" key={layer.layer} style={{ display: "grid", gap: 16, padding: 22 }}>
              <div>
                <div className="eyebrow">Architecture layer</div>
                <h2 style={{ fontSize: "1.35rem", margin: "6px 0" }}>{layer.layer}</h2>
                <p style={{ color: "#415049", lineHeight: 1.65, margin: 0 }}>{layer.purpose}</p>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                <MiniPanel title="Components" items={layer.components} />
                <MiniPanel title="Design notes" items={layer.designNotes} />
              </div>
            </article>
          ))}
        </section>

        <section className="card" style={{ display: "grid", gap: 20, padding: 24 }}>
          <div>
            <div className="eyebrow">Platform decision</div>
            <h2 className="section-title">{pmoArchitectureDecisionGuide.decision}</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <MiniPanel title="Use SharePoint when" items={pmoArchitectureDecisionGuide.useSharePointWhen} />
            <MiniPanel title="Use Dataverse when" items={pmoArchitectureDecisionGuide.useDataverseWhen} />
          </div>
        </section>

        <section className="card" style={{ display: "grid", gap: 20, padding: 24 }}>
          <div>
            <div className="eyebrow">Security model</div>
            <h2 className="section-title">Role-based access patterns.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {pmoArchitectureSecurityRoles.map((role) => (
              <article className="surface" key={role.role} style={{ borderRadius: 10, display: "grid", gap: 12, padding: 18 }}>
                <h3 style={{ fontSize: "1.08rem", margin: 0 }}>{role.role}</h3>
                <p style={{ color: "#415049", lineHeight: 1.55, margin: 0 }}>{role.access}</p>
                <BulletList items={role.notes} />
              </article>
            ))}
          </div>
        </section>

        <section className="card" style={{ display: "grid", gap: 20, padding: 24 }}>
          <div>
            <div className="eyebrow">Environment path</div>
            <h2 className="section-title">Build in phases, release with control.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {pmoArchitectureEnvironmentPath.map((step) => (
              <article className="surface" key={step.stage} style={{ borderRadius: 10, display: "grid", gap: 12, padding: 18 }}>
                <span className="badge free" style={{ justifySelf: "start" }}>{step.stage}</span>
                <p style={{ color: "#415049", lineHeight: 1.55, margin: 0 }}>{step.purpose}</p>
                <BulletList items={step.requiredPractices} />
              </article>
            ))}
          </div>
        </section>

        <section className="surface" style={{ borderRadius: 12, padding: 24 }}>
          <div style={{ display: "grid", gap: 16, maxWidth: 960 }}>
            <div>
              <div className="eyebrow">Release sequence</div>
              <h2 className="section-title">Recommended technical build order.</h2>
            </div>
            <ol style={{ color: "#415049", display: "grid", gap: 12, lineHeight: 1.65, margin: 0, paddingLeft: 20 }}>
              {pmoArchitectureReleasePath.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <div className="badge-row">
              <Link className="button" href="/pmo/bundle">Open implementation bundle</Link>
              <Link className="button secondary" href="/pmo/data-dictionary">Open data dictionary</Link>
              <Link className="button secondary" href="/pmo/mockups">Open portal mockups</Link>
            </div>
          </div>
        </section>
      </div>
    </section>
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



