import Link from "next/link";
import { pmoKpiCatalog } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO KPI catalog | BuilderVault"
};

export default function Page() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <Breadcrumb current="PMO KPI catalog" />
        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO reporting</div>
          <h1 className="page-title">PMO KPI catalog</h1>
          <p className="lead">A KPI reference for demand, charter, lifecycle, RAID, reporting, and benefits dashboards.</p>
        </header>
        <div className="card" style={{ overflowX: "auto", padding: 18 }}>
          <table style={{ borderCollapse: "collapse", minWidth: 980, width: "100%" }}>
            <thead><tr>{["KPI", "Category", "Definition", "Formula", "Signal"].map((heading) => <th key={heading} style={{ borderBottom: "1px solid var(--line)", padding: "10px", textAlign: "left" }}>{heading}</th>)}</tr></thead>
            <tbody>{pmoKpiCatalog.map((kpi) => <tr key={kpi.name}><td style={cell}><strong>{kpi.name}</strong></td><td style={cell}>{kpi.category}</td><td style={cell}>{kpi.definition}</td><td style={cell}>{kpi.formula}</td><td style={cell}>{kpi.signal}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const cell = { borderBottom: "1px solid var(--line)", color: "#415049", lineHeight: 1.5, padding: "10px", verticalAlign: "top" } as const;

function Breadcrumb({ current }: { current: string }) {
  return <nav aria-label="Breadcrumb" className="badge-row"><Link href="/pmo" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>PMO toolkit</Link><span aria-hidden="true" style={{ color: "var(--muted)" }}>/</span><span style={{ color: "var(--muted)" }}>{current}</span></nav>;
}

