import Link from "next/link";
import { BulletList } from "@/components/patterns/bullet-list";
import { pmoUatScenarios } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO UAT test scripts | BuilderVault"
};

export default function Page() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <Breadcrumb current="PMO UAT test scripts" />
        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO testing</div>
          <h1 className="page-title">PMO UAT test scripts</h1>
          <p className="lead">Role-based UAT scenarios for validating the PMO system before launch.</p>
        </header>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {pmoUatScenarios.map((section) => (
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

