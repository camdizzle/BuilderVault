import Link from "next/link";
import { BulletList } from "@/components/patterns/bullet-list";
import { pmoSupportRunbook } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO support runbook | BuilderVault"
};

export default function Page() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <Breadcrumb current="PMO support runbook" />
        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO operations</div>
          <h1 className="page-title">PMO support runbook</h1>
          <p className="lead">Support routines, common fixes, and escalation paths for operating the PMO toolkit.</p>
        </header>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {pmoSupportRunbook.map((section) => (
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

