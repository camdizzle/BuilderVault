import Link from "next/link";
import {
  getPmoStageBySlug,
  pmoImplementationGuideDownloads,
  pmoMasterRoadmapDownload,
  pmoPortalMockups,
  pmoRoadmapPhases,
  pmoTemplateDownloads
} from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO Implementation Bundle | BuilderVault",
  description: "A BuilderVault bundle page grouping PMO roadmap, module guides, mockup briefs, and starter files by rollout phase."
};

const dataDictionaryDownload = {
  href: "/pmo-guides/pmo-data-dictionary.md",
  label: "PMO data dictionary",
  description: "Consolidated PMO tables, fields, relationships, indexes, statuses, measures, and solution components."
};

const architectureBrief = {
  href: "/pmo-guides/pmo-solution-architecture-brief.md",
  label: "PMO solution architecture brief",
  description: "Technical planning artifact for the PMO app, data, automation, reporting, collaboration, security, and release architecture."
};

const phaseTemplateMap: Record<string, string[]> = {
  "Phase 1": ["/pmo-templates/pmo-intake-requests-template.csv", "/pmo-templates/pmo-project-charters-template.csv"],
  "Phase 2": ["/pmo-templates/pmo-stage-gates-template.csv", "/pmo-templates/pmo-raid-change-control-template.csv"],
  "Phase 3": ["/pmo-templates/pmo-status-reporting-template.csv"]
};

export default function PmoBundlePage() {
  const allMockupBriefs = pmoPortalMockups.map((mockup) => ({
    href: mockup.briefHref,
    label: mockup.title.replace(" mockup", " mockup brief"),
    description: `Mini build spec for ${mockup.title.toLowerCase()} covering persona, layout, fields, metrics, queue examples, actions, and build notes.`
  }));

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 32 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>PMO toolkit</Link>
          <span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span>
          <span style={{ color: "var(--muted)" }}>Implementation bundle</span>
        </nav>

        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO bundle</div>
          <h1 className="page-title">PMO implementation bundle</h1>
          <p className="lead">
            A rollout-oriented package that groups the master roadmap, module build guides, visual mockup briefs, and starter templates by the 30/60/90-day PMO implementation path.
          </p>
        </header>

        <section className="surface" style={{ borderRadius: 12, padding: 24 }}>
          <div style={{ display: "grid", gap: 14, maxWidth: 920 }}>
            <div className="eyebrow">Start here</div>
            <h2 className="section-title">Use the roadmap first, then pull the phase assets as you build.</h2>
            <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>
              The bundle is organized around implementation order: intake and charter foundation, lifecycle control, then executive reporting and communications. Each phase includes the guides, briefs, and starter files that match the work in that window.
            </p>
            <div className="badge-row">
              <a className="button" download href={pmoMasterRoadmapDownload.href}>
                Download master roadmap
              </a>
              <Link className="button secondary" href="/pmo/architecture">
                Open solution architecture
              </Link>
              <Link className="button secondary" href="/pmo/data-dictionary">
                Open data dictionary
              </Link>
            </div>
          </div>
        </section>

        <section style={{ display: "grid", gap: 22 }}>
          {pmoRoadmapPhases.map((phase) => {
            const guides = phase.modules.map((slug) => pmoImplementationGuideDownloads[slug]).filter(Boolean);
            const briefs = pmoPortalMockups
              .filter((mockup) => phase.modules.includes(mockup.moduleSlug))
              .map((mockup) => ({
                href: mockup.briefHref,
                label: mockup.title.replace(" mockup", " mockup brief"),
                description: mockup.purpose
              }));
            const templates = pmoTemplateDownloads.filter((download) => phaseTemplateMap[phase.phase]?.includes(download.href));

            return (
              <article className="card" key={phase.phase} style={{ display: "grid", gap: 22, padding: 24 }}>
                <div className="badge-row">
                  <span className="badge free">{phase.phase}</span>
                  <span className="badge">{phase.timebox}</span>
                </div>
                <div style={{ display: "grid", gap: 10, maxWidth: 940 }}>
                  <h2 style={{ fontSize: "1.45rem", lineHeight: 1.2, margin: 0 }}>{phase.goal}</h2>
                  <div className="badge-row">
                    {phase.modules.map((slug) => {
                      const stage = getPmoStageBySlug(slug);
                      return stage ? <Link href={`/pmo/${slug}`} key={slug} style={{ color: "var(--accent-strong)", fontWeight: 800 }}>{stage.title}</Link> : null;
                    })}
                  </div>
                </div>
                <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                  <DownloadGroup downloads={guides} title="Module guides" />
                  <DownloadGroup downloads={briefs} title="Mockup briefs" />
                  <DownloadGroup downloads={templates} title="Starter files" />
                </div>
              </article>
            );
          })}
        </section>

        <section className="card" style={{ display: "grid", gap: 20, padding: 24 }}>
          <div>
            <div className="eyebrow">Complete inventory</div>
            <h2 className="section-title">Everything in the bundle.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <DownloadGroup downloads={[pmoMasterRoadmapDownload, architectureBrief, dataDictionaryDownload]} title="Roadmap, architecture, and data" />
            <DownloadGroup downloads={Object.values(pmoImplementationGuideDownloads)} title="Module guides" />
            <DownloadGroup downloads={allMockupBriefs} title="Mockup briefs" />
            <DownloadGroup downloads={pmoTemplateDownloads} title="Templates" />
          </div>
        </section>
      </div>
    </section>
  );
}

type Download = {
  href: string;
  label: string;
  description: string;
};

function DownloadGroup({ downloads, title }: { downloads: Download[]; title: string }) {
  return (
    <div className="surface" style={{ borderRadius: 10, display: "grid", gap: 12, padding: 18 }}>
      <h3 style={{ fontSize: "1.05rem", margin: 0 }}>{title}</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {downloads.length > 0 ? downloads.map((download) => (
          <a download href={download.href} key={download.href} style={{ borderBottom: "1px solid var(--line)", display: "grid", gap: 5, padding: "0 0 10px" }}>
            <strong>{download.label}</strong>
            <span style={{ color: "#415049", fontSize: "0.92rem", lineHeight: 1.5 }}>{download.description}</span>
          </a>
        )) : <span style={{ color: "var(--muted)", lineHeight: 1.5 }}>No specific file assigned to this phase.</span>}
      </div>
    </div>
  );
}





