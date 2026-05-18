import Link from "next/link";
import { BulletList } from "@/components/patterns/bullet-list";
import { pmoCommunicationTemplates } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO communication templates | BuilderVault"
};

export default function Page() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <Breadcrumb current="PMO communication templates" />
        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO communications</div>
          <h1 className="page-title">PMO communication templates</h1>
          <p className="lead">Reusable stakeholder messages for intake, approvals, gates, and executive reporting.</p>
        </header>
        <div style={{ display: "grid", gap: 18 }}>
          {pmoCommunicationTemplates.map((item) => (
            <article className="card" key={item.title} style={{ display: "grid", gap: 14, padding: 22 }}>
              <div className="badge-row"><span className="badge free">{item.audience}</span></div>
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{item.title}</h2>
              <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{item.purpose}</p>
              <div className="surface" style={{ borderRadius: 10, padding: 16 }}><BulletList items={item.template} /></div>
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

