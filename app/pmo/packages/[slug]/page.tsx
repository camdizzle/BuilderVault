import Link from "next/link";
import { notFound } from "next/navigation";
import { BulletList } from "@/components/patterns/bullet-list";
import { DetailSection } from "@/components/patterns/detail-section";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import {
  getPmoDeepDiveBySlug,
  getPmoFlowSnippetsBySlug,
  getPmoImplementationGuideBySlug,
  getPmoFormulaSnippetsBySlug,
  getPmoScreenBlueprintsBySlug,
  getPmoSolutionMapBySlug,
  getPmoStageBySlug,
  getPmoTableSpecsBySlug,
  pmoLifecycleStages,
  pmoTemplateDownloads
} from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO Implementation Package | BuilderVault"
};

type PmoPackagePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return pmoLifecycleStages.map((stage) => ({ slug: stage.slug }));
}

export default async function PmoPackagePage({ params }: PmoPackagePageProps) {
  const { slug } = await params;
  const stage = getPmoStageBySlug(slug);

  if (!stage) {
    notFound();
  }

  const deepDive = getPmoDeepDiveBySlug(slug);
  const tableSpecs = getPmoTableSpecsBySlug(slug);
  const screenBlueprints = getPmoScreenBlueprintsBySlug(slug);
  const solutionMap = getPmoSolutionMapBySlug(slug);
  const formulaSnippets = getPmoFormulaSnippetsBySlug(slug);
  const flowSnippets = getPmoFlowSnippetsBySlug(slug);
  const guideDownload = getPmoImplementationGuideBySlug(slug);
  const deploymentChecklist = [
    "Create development, test, and production environments or sites before build-out.",
    "Create publisher prefix, solution shell, environment variables, and connection references first.",
    "Build tables and choices before apps and flows.",
    "Import sample template rows, then test with non-admin users.",
    "Run approval, rejection, revision, escalation, and overdue scenarios before release.",
    "Publish Power BI pages after validating relationships, date fields, status definitions, and security trimming.",
    "Document owners, support mailbox, release notes, and rollback steps."
  ];

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>PMO toolkit</Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span>
          <Link href={`/pmo/${stage.slug}`} style={{ color: "var(--accent-strong)", fontWeight: 800 }}>{stage.title}</Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span>
          <span style={{ color: "var(--muted)" }}>Implementation package</span>
        </nav>

        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO implementation package</div>
          <h1 className="page-title">{stage.title} implementation package</h1>
          <p className="lead">{stage.outcome}</p>
        </header>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <PackageTile label="Tables" value={tableSpecs.length} />
          <PackageTile label="Screens" value={screenBlueprints.length} />
          <PackageTile label="Power Fx snippets" value={formulaSnippets.length} />
          <PackageTile label="Flow recipes" value={flowSnippets.length} />
        </div>

        {guideDownload ? (
          <a className="card" download href={guideDownload.href} style={{ display: "grid", gap: 8, padding: 18 }}>
            <span className="badge free" style={{ justifySelf: "start" }}>Downloadable guide</span>
            <strong>{guideDownload.label}</strong>
            <span style={{ color: "#415049", lineHeight: 1.5 }}>{guideDownload.description}</span>
          </a>
        ) : null}

        <main className="card" style={{ display: "grid", gap: 28, padding: 24 }}>
          <DetailSection title="Build checklist">
            <BulletList items={stage.implementationRoadmap} />
          </DetailSection>

          {deepDive ? (
            <DetailSection title="Workflow map">
              <WorkflowSteps steps={deepDive.workflowMap} />
            </DetailSection>
          ) : null}

          {tableSpecs.length > 0 ? (
            <DetailSection title="Data model package">
              <div style={{ display: "grid", gap: 18 }}>
                {tableSpecs.map((table) => (
                  <article className="surface" key={table.name} style={{ borderRadius: 10, display: "grid", gap: 12, padding: 18 }}>
                    <div className="badge-row">
                      <span className="badge free">{table.platform}</span>
                      <span className="badge">{table.name}</span>
                    </div>
                    <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{table.purpose}</p>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ borderCollapse: "collapse", minWidth: 760, width: "100%" }}>
                        <thead>
                          <tr>
                            {['Column', 'Type', 'Required', 'Notes'].map((heading) => (
                              <th key={heading} style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px", textAlign: "left" }}>{heading}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.columns.map((column) => (
                            <tr key={column.name}>
                              <td style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px", verticalAlign: "top" }}>{column.name}</td>
                              <td style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px", verticalAlign: "top" }}>{column.type}</td>
                              <td style={{ borderBottom: "1px solid var(--line)", padding: "8px 10px", verticalAlign: "top" }}>{column.required ? "Yes" : "No"}</td>
                              <td style={{ borderBottom: "1px solid var(--line)", color: "#415049", padding: "8px 10px", verticalAlign: "top" }}>{column.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <MiniList title="Relationships" items={table.relationships} />
                    <MiniList title="Indexes" items={table.indexes} />
                  </article>
                ))}
              </div>
            </DetailSection>
          ) : null}

          {screenBlueprints.length > 0 ? (
            <DetailSection title="Power Apps screen package">
              <div style={{ display: "grid", gap: 18 }}>
                {screenBlueprints.map((screen) => (
                  <article className="surface" key={screen.name} style={{ borderRadius: 10, display: "grid", gap: 12, padding: 18 }}>
                    <div className="badge-row">
                      <span className="badge free">{screen.persona}</span>
                      <span className="badge">{screen.name}</span>
                    </div>
                    <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{screen.purpose}</p>
                    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                      <MiniList title="Layout" items={screen.layout} />
                      <MiniList title="Controls" items={screen.controls} />
                      <MiniList title="Formula notes" items={screen.formulas} />
                      <MiniList title="Data sources" items={screen.dataSources} />
                    </div>
                  </article>
                ))}
              </div>
            </DetailSection>
          ) : null}

          {formulaSnippets.length > 0 ? (
            <DetailSection title="Power Fx package">
              <div style={{ display: "grid", gap: 18 }}>
                {formulaSnippets.map((snippet) => (
                  <article className="surface" key={snippet.title} style={{ borderRadius: 10, display: "grid", gap: 12, padding: 18 }}>
                    <div className="badge-row">
                      <span className="badge free">{snippet.location}</span>
                      <span className="badge">{snippet.title}</span>
                    </div>
                    <CopyCodeBlock code={snippet.code} />
                    <MiniList title="Notes" items={snippet.notes} />
                  </article>
                ))}
              </div>
            </DetailSection>
          ) : null}

          {flowSnippets.length > 0 ? (
            <DetailSection title="Power Automate package">
              <div style={{ display: "grid", gap: 18 }}>
                {flowSnippets.map((flow) => (
                  <article className="surface" key={flow.name} style={{ borderRadius: 10, display: "grid", gap: 12, padding: 18 }}>
                    <div className="badge-row">
                      <span className="badge free">Flow</span>
                      <span className="badge">{flow.name}</span>
                    </div>
                    <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}><strong>Trigger:</strong> {flow.trigger}</p>
                    <WorkflowSteps steps={flow.steps} />
                    <MiniList title="Expressions" items={flow.expressions} />
                  </article>
                ))}
              </div>
            </DetailSection>
          ) : null}

          {solutionMap ? (
            <DetailSection title="Dataverse solution package">
              <article className="surface" style={{ borderRadius: 10, display: "grid", gap: 16, padding: 18 }}>
                <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>
                  Create solution <strong>{solutionMap.solutionName}</strong> with publisher prefix <strong>{solutionMap.publisherPrefix}</strong>.
                </p>
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                  <MiniList title="Tables" items={solutionMap.tables} />
                  <MiniList title="Choices" items={solutionMap.choices} />
                  <MiniList title="Apps" items={solutionMap.apps} />
                  <MiniList title="Cloud flows" items={solutionMap.flows} />
                  <MiniList title="Security roles" items={solutionMap.securityRoles} />
                  <MiniList title="Environment variables" items={solutionMap.environmentVariables} />
                  <MiniList title="Dashboards" items={solutionMap.dashboards} />
                </div>
              </article>
            </DetailSection>
          ) : null}

          <DetailSection title="Deployment checklist">
            <BulletList items={deploymentChecklist} />
          </DetailSection>

          <DetailSection title="Starter files">
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {pmoTemplateDownloads.map((download) => (
                <a className="card" href={download.href} key={download.href} style={{ display: "grid", gap: 8, padding: 14 }}>
                  <strong>{download.label}</strong>
                  <span style={{ color: "#415049", lineHeight: 1.5 }}>{download.description}</span>
                </a>
              ))}
            </div>
          </DetailSection>
        </main>
      </div>
    </section>
  );
}

function PackageTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-tile">
      <div style={{ fontSize: "2rem", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

function WorkflowSteps({ steps }: { steps: string[] }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {steps.map((step, index) => (
        <div key={step} style={{ alignItems: "center", display: "grid", gap: 10, gridTemplateColumns: "34px minmax(0, 1fr)" }}>
          <span aria-hidden="true" className="badge free" style={{ justifySelf: "start" }}>{index + 1}</span>
          <span style={{ color: "#415049", lineHeight: 1.55 }}>{step}</span>
        </div>
      ))}
    </div>
  );
}

function MiniList({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <h3 style={{ fontSize: "0.98rem", margin: "0 0 8px" }}>{title}</h3>
      <ul style={{ color: "#415049", display: "grid", gap: 8, lineHeight: 1.55, margin: 0, paddingLeft: 18 }}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
