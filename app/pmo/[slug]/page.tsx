import Link from "next/link";
import { notFound } from "next/navigation";
import { BulletList } from "@/components/patterns/bullet-list";
import { DetailSection } from "@/components/patterns/detail-section";
import { getPmoDeepDiveBySlug, getPmoStageBySlug, pmoLifecycleStages } from "@/lib/pmo-toolkit";

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
                  <DeepDiveBlock title="Recommended fields" items={deepDive.schemaFields} />
                  <DeepDiveBlock title="Screens to build" items={deepDive.screens} />
                  <DeepDiveBlock title="Status model" items={deepDive.statusModel} />
                  <DeepDiveBlock title="Permissions" items={deepDive.permissionModel} />
                  <DeepDiveBlock title="Workflow logic" items={deepDive.workflowDetails} />
                  <DeepDiveBlock title="Power BI measures and calculations" items={deepDive.powerBiMeasures} />
                  <DeepDiveBlock title="MVP build sequence" items={deepDive.mvpBuildSteps} />
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
          </aside>
        </div>
      </div>
    </section>
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
