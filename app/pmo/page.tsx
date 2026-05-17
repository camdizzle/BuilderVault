import Link from "next/link";
import { pmoLifecycleStages, pmoToolkitSummary } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "Build Your Own PMO System | BuilderVault",
  description: "A hidden BuilderVault blueprint for building practical PMO portals, workflows, approvals, gates, controls, and Power BI reporting with Microsoft 365 and Power Platform.",
  robots: {
    index: false,
    follow: false
  }
};

export default function PmoToolkitPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <div style={{ maxWidth: 980 }}>
          <div className="eyebrow">Hidden PMO toolkit concept</div>
          <h1 className="page-title">{pmoToolkitSummary.title}</h1>
          <p className="lead">{pmoToolkitSummary.audience}</p>
          <p style={{ color: "#415049", fontSize: "1.08rem", lineHeight: 1.7, margin: 0 }}>
            {pmoToolkitSummary.promise}
          </p>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {pmoToolkitSummary.principles.map((principle) => (
            <div className="stat-tile" key={principle}>
              <strong>{principle}</strong>
            </div>
          ))}
        </div>

        <section className="surface" style={{ borderRadius: 12, padding: 28 }}>
          <div style={{ display: "grid", gap: 14, maxWidth: 900 }}>
            <div className="eyebrow">Lifecycle architecture</div>
            <h2 className="section-title">Break the PMO into buildable portals, not one giant platform.</h2>
            <p className="lead" style={{ margin: 0 }}>
              The practical path is to build a connected set of small tools: intake, charter approval, stage gates, change control, risks and issues, communications, and Power BI reporting. Each stage below includes the business problem, data model, portals, automations, and reporting pages to build.
            </p>
          </div>
        </section>

        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">PMO lifecycle stages</div>
            <h2 className="section-title">Start where the pain is loudest, then connect the lifecycle.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {pmoLifecycleStages.map((stage) => (
              <Link className="card" href={`/pmo/${stage.slug}`} key={stage.slug} style={{ display: "grid", gap: 14, padding: 22 }}>
                <div className="eyebrow">PMO blueprint</div>
                <h3 style={{ fontSize: "1.25rem", lineHeight: 1.2, margin: 0 }}>{stage.title}</h3>
                <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{stage.summary}</p>
                <strong style={{ color: "var(--accent-strong)" }}>Open blueprint</strong>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">Starter build order</div>
            <h2 className="section-title">A realistic MVP sequence.</h2>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <ol style={{ color: "#415049", display: "grid", gap: 12, lineHeight: 1.65, margin: 0 }}>
              <li>Build the intake portal and triage workbench so all demand is visible.</li>
              <li>Add charter approval so approved work has scope, value, owner, and sponsor signoff.</li>
              <li>Add gate and stage-change portals so lifecycle movement is controlled and auditable.</li>
              <li>Add change request, risk, and issue portals so delivery controls stop living in meeting notes.</li>
              <li>Add Power BI reporting pages for demand, lifecycle health, RAID, change impact, and executive decisions.</li>
            </ol>
          </div>
        </section>
      </div>
    </section>
  );
}
