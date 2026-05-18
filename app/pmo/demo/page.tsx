import Link from "next/link";
import { BulletList } from "@/components/patterns/bullet-list";
import { pmoDemoSteps } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO Demo Narrative | BuilderVault"
};

export default function PmoDemoPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <PmoBreadcrumb current="Demo narrative" />
        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">PMO walkthrough</div>
          <h1 className="page-title">PMO demo narrative</h1>
          <p className="lead">A practical storyline showing how a business request becomes a governed project, then flows through gates, controls, reporting, and executive decisions.</p>
        </header>
        <div style={{ display: "grid", gap: 18 }}>
          {pmoDemoSteps.map((step, index) => (
            <article className="card" key={step.title} style={{ display: "grid", gap: 16, padding: 22 }}>
              <div className="badge-row"><span className="badge free">Step {index + 1}</span><span className="badge">{step.actor}</span></div>
              <h2 style={{ fontSize: "1.35rem", margin: 0 }}>{step.title}</h2>
              <p style={{ color: "#415049", lineHeight: 1.65, margin: 0 }}><strong>Action:</strong> {step.action}</p>
              <div className="surface" style={{ borderRadius: 10, padding: 16 }}><h3 style={{ fontSize: "1rem", margin: "0 0 10px" }}>System behavior</h3><BulletList items={step.systemBehavior} /></div>
              <p style={{ color: "#415049", lineHeight: 1.65, margin: 0 }}><strong>Proof point:</strong> {step.proofPoint}</p>
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
