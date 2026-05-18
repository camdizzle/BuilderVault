import Link from "next/link";
import { BulletList } from "@/components/patterns/bullet-list";
import { pmoBacklogModel } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO enhancement backlog model | BuilderVault"
};

export default function Page() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <Breadcrumb current="PMO enhancement backlog model" />
        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO product management</div>
          <h1 className="page-title">PMO enhancement backlog model</h1>
          <p className="lead">A backlog structure for improving the PMO system after launch.</p>
        </header>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {pmoBacklogModel.map((section) => (
            <article className="card" key={section.title} style={{ display: "grid", gap: 14, padding: 22 }}>
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{section.title}</h2>
              <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{section.summary}</p>
              <BulletList items={section.items} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Breadcrumb({ current }: { current: string }) {
  return <nav aria-label="Breadcrumb" className="badge-row"><Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>PMO toolkit</Link><span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span><span style={{ color: "var(--muted)" }}>{current}</span></nav>;
}

