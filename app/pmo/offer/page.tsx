import Link from "next/link";
import { BulletList } from "@/components/patterns/bullet-list";
import { pmoOfferSections } from "@/lib/pmo-toolkit";

export const metadata = {
  title: "PMO Offer Outline | BuilderVault",
  robots: { index: false, follow: false }
};

export default function PmoOfferPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <PmoBreadcrumb current="Offer outline" />
        <header style={{ display: "grid", gap: 14, maxWidth: 980 }}>
          <div className="eyebrow">Hidden PMO offer draft</div>
          <h1 className="page-title">PMO offer outline</h1>
          <p className="lead">A private positioning page for the future PMO service offering. This keeps the business idea shaped without exposing it in the public site navigation.</p>
        </header>
        <section className="surface" style={{ borderRadius: 12, padding: 24 }}>
          <h2 className="section-title">Offer thesis</h2>
          <p style={{ color: "#415049", lineHeight: 1.7, margin: 0 }}>For PMO teams priced out of enterprise PMO systems, BuilderVault can become the practical Power Platform playbook for building demand intake, charter approvals, stage gates, change control, RAID, communications, and reporting with tools they already own.</p>
        </section>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {pmoOfferSections.map((section) => (
            <article className="card" key={section.title} style={{ display: "grid", gap: 14, padding: 22 }}>
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{section.title}</h2>
              <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{section.summary}</p>
              <BulletList items={section.bullets} />
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
