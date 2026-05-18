import Link from "next/link";
import { pmoLifecycleStages, pmoMasterRoadmapDownload, pmoTemplateDownloads, pmoToolkitSummary } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "Build Your Own PMO System | BuilderVault",
  description: "A BuilderVault blueprint for building practical PMO portals, workflows, approvals, gates, controls, and Power BI reporting with Microsoft 365 and Power Platform."
};

export default function PmoToolkitPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <div style={{ maxWidth: 980 }}>
          <div className="eyebrow">PMO toolkit concept</div>
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
            <Link className="button" href="/pmo/roadmap" style={{ justifySelf: "start" }}>
              Open 30/60/90 roadmap
            </Link>
          </div>
        </section>
        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">Architecture maps</div>
            <h2 className="section-title">How the build hangs together.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <ArchitectureCard title="PMO data model" steps={["Intake", "Charter", "Project", "Gate", "RAID", "Status", "Power BI"]} />
            <ArchitectureCard title="Automation flow" steps={["Submit", "Validate", "Route", "Approve", "Notify", "Log", "Report"]} />
            <ArchitectureCard title="Reporting model" steps={["Operational records", "Curated views", "Measures", "Executive pages", "Digest"]} />
          </div>
        </section>

        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">Starter templates</div>
            <h2 className="section-title">Downloadable build starters.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <a className="card" download href={pmoMasterRoadmapDownload.href} style={{ display: "grid", gap: 10, padding: 20 }}>
              <span className="badge free" style={{ justifySelf: "start" }}>Roadmap</span>
              <strong>{pmoMasterRoadmapDownload.label}</strong>
              <span style={{ color: "#415049", lineHeight: 1.55 }}>{pmoMasterRoadmapDownload.description}</span>
            </a>
            {pmoTemplateDownloads.map((download) => (
              <a className="card" href={download.href} key={download.href} style={{ display: "grid", gap: 10, padding: 20 }}>
                <strong>{download.label}</strong>
                <span style={{ color: "#415049", lineHeight: 1.55 }}>{download.description}</span>
              </a>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">Supporting playbooks</div>
            <h2 className="section-title">Planning assets for the PMO offer.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <SupportCard href="/pmo/compare" title="Module comparison" text="Compare build triggers, complexity, dependencies, first release scope, and success signals." />
            <SupportCard href="/pmo/starter-files" title="Starter file index" text="Find every roadmap, implementation guide, CSV starter, and markdown template in one place." />
            <SupportCard href="/pmo/bundle" title="Implementation bundle" text="Group the roadmap, module guides, mockup briefs, and starter files by 30/60/90 rollout phase." />
            <SupportCard href="/pmo/architecture" title="Solution architecture" text="Map the PMO system across apps, data, automations, reporting, Teams, security, and releases." />
            <SupportCard href="/pmo/data-dictionary" title="Data dictionary" text="Review PMO tables, fields, relationships, indexes, statuses, measures, and solution components." />
            <SupportCard href="/pmo/uat" title="UAT scripts" text="Run role-based test scenarios across intake, charters, gates, RAID, changes, and reporting." />
            <SupportCard href="/pmo/release" title="Release checklist" text="Confirm readiness, validation, reporting, and launch communications before release." />
            <SupportCard href="/pmo/runbook" title="Support runbook" text="Operate the PMO system with daily checks, common fixes, and escalation guidance." />
            <SupportCard href="/pmo/cadence" title="Governance cadence" text="Plan triage, delivery control, executive digest, and portfolio review rhythms." />
            <SupportCard href="/pmo/communications" title="Communication templates" text="Reuse stakeholder messages for intake, approvals, gate exceptions, and digests." />
            <SupportCard href="/pmo/kpis" title="KPI catalog" text="Define dashboard measures for demand, lifecycle, RAID, reporting, and benefits." />
            <SupportCard href="/pmo/adoption" title="Adoption plan" text="Pilot, onboard, and measure behavior change for PMO users." />
            <SupportCard href="/pmo/backlog" title="Enhancement backlog" text="Manage future improvements as a PMO product backlog." />
            <SupportCard href="/pmo/escalations" title="Escalation playbook" text="Define escalation triggers and decision record requirements." />
            <SupportCard href="/pmo/glossary" title="PMO glossary" text="Define the terms that become tables, screens, workflows, reports, and operating cadence." />
            <SupportCard href="/pmo/demo" title="Demo narrative" text="Walk through how demand becomes a governed project with gates, RAID, reporting, and decisions." />
            <SupportCard href="/pmo/offer" title="PMO services" text="See who the PMO toolkit is for, what it helps build, and how the implementation path works." />
            <SupportCard href="/pmo/mockups" title="Portal mockups" text="Static visual references for intake, charter, gate review, RAID, and executive dashboard screens." />
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
                <span className="badge-row">
                  <strong style={{ color: "var(--accent-strong)" }}>Open blueprint</strong>
                  <span className="badge">Package included</span>
                </span>
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

function ArchitectureCard({ steps, title }: { steps: string[]; title: string }) {
  return (
    <article className="card" style={{ display: "grid", gap: 14, padding: 20 }}>
      <h3 style={{ fontSize: "1.15rem", margin: 0 }}>{title}</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {steps.map((step, index) => (
          <div key={step} style={{ alignItems: "center", display: "grid", gap: 10, gridTemplateColumns: "32px minmax(0, 1fr)" }}>
            <span className="badge free" style={{ justifySelf: "start" }}>{index + 1}</span>
            <span style={{ color: "#415049", lineHeight: 1.55 }}>{step}</span>
          </div>
        ))}
      </div>
    </article>
  );
}


function SupportCard({ href, text, title }: { href: string; text: string; title: string }) {
  return (
    <Link className="card" href={href} style={{ display: "grid", gap: 10, padding: 20 }}>
      <strong>{title}</strong>
      <span style={{ color: "#415049", lineHeight: 1.55 }}>{text}</span>
    </Link>
  );
}
