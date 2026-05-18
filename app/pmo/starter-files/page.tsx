import Link from "next/link";
import { pmoMasterRoadmapDownload, pmoTemplateDownloads, pmoImplementationGuideDownloads, pmoLifecycleStages } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO Starter File Index | BuilderVault"
};

export default function PmoStarterFilesPage() {
  const moduleGuides = pmoLifecycleStages.map((stage) => pmoImplementationGuideDownloads[stage.slug]).filter(Boolean);
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <PmoBreadcrumb current="Starter files" />
        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO file index</div>
          <h1 className="page-title">PMO starter file index</h1>
          <p className="lead">A single place to find the PMO roadmap, module implementation guides, and CSV starters for building the toolkit.</p>
          <Link className="button" href="/pmo/bundle" style={{ justifySelf: "start" }}>Open implementation bundle</Link>
        </header>
        <DownloadSection title="Roadmap" downloads={[pmoMasterRoadmapDownload]} />
        <DownloadSection title="Module implementation guides" downloads={moduleGuides} />
        <DownloadSection title="CSV and markdown starters" downloads={pmoTemplateDownloads} />
      </div>
    </section>
  );
}

type Download = { href: string; label: string; description: string };

function DownloadSection({ downloads, title }: { downloads: Download[]; title: string }) {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div><div className="eyebrow">{title}</div><h2 className="section-title">{title}</h2></div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {downloads.map((download) => (
          <a className="card" download href={download.href} key={download.href} style={{ display: "grid", gap: 10, padding: 20 }}>
            <strong>{download.label}</strong>
            <span style={{ color: "#415049", lineHeight: 1.55 }}>{download.description}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function PmoBreadcrumb({ current }: { current: string }) {
  return <nav aria-label="Breadcrumb" className="badge-row"><Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>PMO toolkit</Link><span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span><span style={{ color: "var(--muted)" }}>{current}</span></nav>;
}
