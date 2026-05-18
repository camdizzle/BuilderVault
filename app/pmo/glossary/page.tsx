import Link from "next/link";
import { pmoGlossaryTerms } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO Implementation Glossary | BuilderVault"
};

export default function PmoGlossaryPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <PmoBreadcrumb current="Glossary" />
        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO glossary</div>
          <h1 className="page-title">PMO implementation glossary</h1>
          <p className="lead">Plain-language definitions for the PMO operating terms that become tables, screens, workflows, and reports in the BuilderVault PMO toolkit.</p>
        </header>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {pmoGlossaryTerms.map((term) => (
            <article className="card" key={term.term} style={{ display: "grid", gap: 12, padding: 20 }}>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>{term.term}</h2>
              <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{term.definition}</p>
              <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}><strong>Build implication:</strong> {term.buildImplication}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PmoBreadcrumb({ current }: { current: string }) {
  return <nav aria-label="Breadcrumb" className="badge-row"><Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>PMO toolkit</Link><span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span><span style={{ color: "var(--muted)" }}>{current}</span></nav>;
}
