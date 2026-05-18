import Link from "next/link";
import { notFound } from "next/navigation";
import { BulletList } from "@/components/patterns/bullet-list";
import { DetailSection } from "@/components/patterns/detail-section";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { getPmoDeepDiveBySlug, getPmoFlowSnippetsBySlug, getPmoFormulaSnippetsBySlug, getPmoScreenBlueprintsBySlug, getPmoSolutionMapBySlug, getPmoStageBySlug, getPmoTableSpecsBySlug, pmoLifecycleStages, pmoTemplateDownloads } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO Blueprint | BuilderVault",
  robots: {
    index: false,
    follow: false
  }
};

type PmoStagePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return pmoLifecycleStages.map((stage) => ({ slug: stage.slug }));
}

export default async function PmoStagePage({ params }: PmoStagePageProps) {
  const { slug } = await params;
  const stage = getPmoStageBySlug(slug);
  const deepDive = getPmoDeepDiveBySlug(slug);
  const tableSpecs = getPmoTableSpecsBySlug(slug);
  const screenBlueprints = getPmoScreenBlueprintsBySlug(slug);
  const solutionMap = getPmoSolutionMapBySlug(slug);
  const formulaSnippets = getPmoFormulaSnippetsBySlug(slug);
  const flowSnippets = getPmoFlowSnippetsBySlug(slug);

  if (!stage) {
    notFound();
  }

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>
            PMO toolkit
          </Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span>
          <span style={{ color: "var(--muted)" }}>{stage.title}</span>
        </nav>

        <header style={{ display: "grid", gap: 14, maxWidth: 940 }}>
          <div className="eyebrow">Build-your-own PMO blueprint</div>
          <h1 className="page-title">{stage.title}</h1>
          <p className="lead">{stage.summary}</p>
          <p style={{ color: "#415049", fontSize: "1.08rem", lineHeight: 1.7, margin: 0 }}>
            <strong>Finished outcome:</strong> {stage.outcome}
          </p>
        </header>

        <div style={{ display: "grid", gap: 28, gridTemplateColumns: "minmax(0, 0.7fr) minmax(260px, 0.3fr)" }}>
          <main className="card" style={{ display: "grid", gap: 28, padding: 24 }}>
            <DetailSection title="Business problem">
              <p style={{ color: "#415049", lineHeight: 1.65, margin: 0 }}>{stage.businessProblem}</p>
            </DetailSection>

            <DetailSection title="Core data model">
              <BulletList items={stage.coreLists} />
            </DetailSection>

            <DetailSection title="Portals and workflows to build">
              <div style={{ display: "grid", gap: 18 }}>
                {stage.portals.map((portal) => (
                  <article className="surface" key={portal.name} style={{ borderRadius: 10, display: "grid", gap: 14, padding: 20 }}>
                    <div>
                      <h2 style={{ fontSize: "1.2rem", margin: "0 0 6px" }}>{portal.name}</h2>
                      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{portal.purpose}</p>
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
                      <MiniList title="Power Platform build" items={portal.powerPlatformBuild} />
                      <MiniList title="Automations" items={portal.automations} />
                      <MiniList title="Reporting" items={portal.reporting} />
                    </div>
                  </article>
                ))}
              </div>
            </DetailSection>

            <DetailSection title="Power BI report pages">
              <BulletList items={stage.powerBi} />
            </DetailSection>

            <DetailSection title="Implementation roadmap">
              <BulletList items={stage.implementationRoadmap} />
            </DetailSection>

            <DetailSection title="Governance notes">
              <BulletList items={stage.governanceNotes} />
            </DetailSection>

            {deepDive ? (
              <DetailSection title="Next layer down: implementation details">
                <div style={{ display: "grid", gap: 18 }}>
                  {tableSpecs.length > 0 ? <TableSpecSection tables={tableSpecs} /> : null}
                  <DeepDiveBlock title="Recommended fields" items={deepDive.schemaFields} />
                  <DeepDiveBlock title="Screens to build" items={deepDive.screens} />
                  {screenBlueprints.length > 0 ? <ScreenBlueprintSection screens={screenBlueprints} /> : null}
                  {solutionMap ? <SolutionMapSection solution={solutionMap} /> : null}
                  {formulaSnippets.length > 0 ? <FormulaSnippetSection snippets={formulaSnippets} /> : null}
                  {flowSnippets.length > 0 ? <FlowSnippetSection flows={flowSnippets} /> : null}
                  <DeepDiveBlock title="Status model" items={deepDive.statusModel} />
                  <DeepDiveBlock title="Permissions" items={deepDive.permissionModel} />
                  <WorkflowMap steps={deepDive.workflowMap} />
                  <DeepDiveBlock title="Workflow logic" items={deepDive.workflowDetails} />
                  <DeepDiveBlock title="Power BI measures and calculations" items={deepDive.powerBiMeasures} />
                  <DeepDiveBlock title="MVP build sequence" items={deepDive.mvpBuildSteps} />
                  <DownloadSection />
                </div>
              </DetailSection>
            ) : null}
          </main>

          <aside style={{ alignSelf: "start", display: "grid", gap: 18 }}>
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Lifecycle stages</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {pmoLifecycleStages.map((item) => (
                  <Link href={`/pmo/${item.slug}`} key={item.slug}>{item.title}</Link>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>Suggested Microsoft stack</h2>
              <BulletList items={["Power Pages or Power Apps for portals", "SharePoint or Dataverse for PMO records", "Power Automate for approvals and communications", "Power BI for portfolio reporting", "Teams for stakeholder notifications"]} />
            </div>
            <Link className="card" href="/pmo/mockups" style={{ display: "grid", gap: 10, padding: 20 }}>
              <strong>Portal mockups</strong>
              <span style={{ color: "#415049", lineHeight: 1.55 }}>See static screen references for the PMO apps and executive reporting layer.</span>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

function FormulaSnippetSection({ snippets }: { snippets: ReturnType<typeof getPmoFormulaSnippetsBySlug> }) {
  return (
    <article className="surface" style={{ borderRadius: 10, display: "grid", gap: 16, padding: 18 }}>
      <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Power Fx snippets</h3>
      <div style={{ display: "grid", gap: 16 }}>
        {snippets.map((snippet) => (
          <div className="card" key={snippet.title} style={{ display: "grid", gap: 12, padding: 16 }}>
            <div>
              <div className="badge-row">
                <span className="badge free">{snippet.location}</span>
                <span className="badge">{snippet.title}</span>
              </div>
            </div>
            <CopyCodeBlock code={snippet.code} />
            <MiniList title="Implementation notes" items={snippet.notes} />
          </div>
        ))}
      </div>
    </article>
  );
}

function FlowSnippetSection({ flows }: { flows: ReturnType<typeof getPmoFlowSnippetsBySlug> }) {
  return (
    <article className="surface" style={{ borderRadius: 10, display: "grid", gap: 16, padding: 18 }}>
      <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Power Automate flow pseudo-steps</h3>
      <div style={{ display: "grid", gap: 16 }}>
        {flows.map((flow) => (
          <div className="card" key={flow.name} style={{ display: "grid", gap: 12, padding: 16 }}>
            <div>
              <div className="badge-row">
                <span className="badge free">Flow</span>
                <span className="badge">{flow.name}</span>
              </div>
              <p style={{ color: "#415049", lineHeight: 1.6, margin: "10px 0 0" }}><strong>Trigger:</strong> {flow.trigger}</p>
            </div>
            <WorkflowMap steps={flow.steps} />
            <MiniList title="Useful expressions" items={flow.expressions} />
          </div>
        ))}
      </div>
    </article>
  );
}
function ScreenBlueprintSection({ screens }: { screens: ReturnType<typeof getPmoScreenBlueprintsBySlug> }) {
  return (
    <article className="surface" style={{ borderRadius: 10, display: "grid", gap: 16, padding: 18 }}>
      <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Power Apps screen blueprints</h3>
      <div style={{ display: "grid", gap: 16 }}>
        {screens.map((screen) => (
          <div className="card" key={screen.name} style={{ display: "grid", gap: 12, padding: 16 }}>
            <div>
              <div className="badge-row">
                <span className="badge free">{screen.persona}</span>
                <span className="badge">{screen.name}</span>
              </div>
              <p style={{ color: "#415049", lineHeight: 1.6, margin: "10px 0 0" }}>{screen.purpose}</p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <MiniList title="Layout" items={screen.layout} />
              <MiniList title="Controls" items={screen.controls} />
              <MiniList title="Formula notes" items={screen.formulas} />
              <MiniList title="Data sources" items={screen.dataSources} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function SolutionMapSection({ solution }: { solution: NonNullable<ReturnType<typeof getPmoSolutionMapBySlug>> }) {
  return (
    <article className="surface" style={{ borderRadius: 10, display: "grid", gap: 16, padding: 18 }}>
      <div>
        <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Dataverse solution component map</h3>
        <p style={{ color: "#415049", lineHeight: 1.6, margin: "8px 0 0" }}>
          Create this as <strong>{solution.solutionName}</strong> using publisher prefix <strong>{solution.publisherPrefix}</strong>.
        </p>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <MiniList title="Tables" items={solution.tables} />
        <MiniList title="Choices" items={solution.choices} />
        <MiniList title="Apps" items={solution.apps} />
        <MiniList title="Cloud flows" items={solution.flows} />
        <MiniList title="Security roles" items={solution.securityRoles} />
        <MiniList title="Environment variables" items={solution.environmentVariables} />
        <MiniList title="Dashboards" items={solution.dashboards} />
      </div>
    </article>
  );
}
function TableSpecSection({ tables }: { tables: ReturnType<typeof getPmoTableSpecsBySlug> }) {
  return (
    <article className="surface" style={{ borderRadius: 10, display: "grid", gap: 16, padding: 18 }}>
      <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Table build specs</h3>
      <div style={{ display: "grid", gap: 18 }}>
        {tables.map((table) => (
          <div className="card" key={table.name} style={{ display: "grid", gap: 12, padding: 16 }}>
            <div>
              <div className="badge-row">
                <span className="badge free">{table.platform}</span>
                <span className="badge">{table.name}</span>
              </div>
              <p style={{ color: "#415049", lineHeight: 1.6, margin: "10px 0 0" }}>{table.purpose}</p>
            </div>
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
            <MiniList title="Recommended indexes" items={table.indexes} />
          </div>
        ))}
      </div>
    </article>
  );
}

function DownloadSection() {
  return (
    <article className="surface" style={{ borderRadius: 10, display: "grid", gap: 12, padding: 18 }}>
      <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Starter template downloads</h3>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {pmoTemplateDownloads.map((download) => (
          <a className="card" href={download.href} key={download.href} style={{ display: "grid", gap: 8, padding: 14 }}>
            <strong>{download.label}</strong>
            <span style={{ color: "#415049", lineHeight: 1.5 }}>{download.description}</span>
          </a>
        ))}
      </div>
    </article>
  );
}
function WorkflowMap({ steps }: { steps: string[] }) {
  return (
    <article className="surface" style={{ borderRadius: 10, display: "grid", gap: 12, padding: 18 }}>
      <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Workflow map</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {steps.map((step, index) => (
          <div key={step} style={{ alignItems: "center", display: "grid", gap: 10, gridTemplateColumns: "34px minmax(0, 1fr)" }}>
            <span aria-hidden="true" className="badge free" style={{ justifySelf: "start" }}>{index + 1}</span>
            <div style={{ color: "#415049", lineHeight: 1.55 }}>
              {step}
              {index < steps.length - 1 ? <span style={{ color: "var(--muted)", fontWeight: 800 }}> {"->"}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
function DeepDiveBlock({ items, title }: { items: string[]; title: string }) {
  return (
    <article className="surface" style={{ borderRadius: 10, display: "grid", gap: 10, padding: 18 }}>
      <h3 style={{ fontSize: "1.05rem", margin: 0 }}>{title}</h3>
      <ul style={{ color: "#415049", display: "grid", gap: 10, lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
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

