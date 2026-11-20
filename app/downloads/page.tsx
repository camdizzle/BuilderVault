import Link from "next/link";
import { DownloadLink } from "@/components/growth/download-link";
import { NewsletterSignup } from "@/components/growth/newsletter-signup";
import { downloadPacks } from "@/lib/downloads";

export const metadata = {
  title: "Free Power Platform Downloads",
  description: "Free downloadable Power Platform packs: checklists, templates and copy-ready snippets for Power Fx, Power Automate, SharePoint lists, Dataverse security, releases and handoff.",
  alternates: { canonical: "/downloads" }
};

export default function DownloadsPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 28 }}>
        <header style={{ maxWidth: 880 }}>
          <div className="eyebrow">Free downloads</div>
          <h1 className="page-title">Take the checklists with you.</h1>
          <p className="lead">
            Packs you can save, print, or drop into your team wiki. No sign-up needed to download.
          </p>
        </header>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {downloadPacks.map((pack) => (
            <article className="card" key={pack.slug} style={{ display: "grid", gap: 14, padding: 24 }}>
              <div>
                <div className="eyebrow">{pack.format}</div>
                <h2 style={{ fontSize: "1.4rem", margin: "6px 0" }}>{pack.title}</h2>
                <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{pack.description}</p>
              </div>
              <ul style={{ color: "#415049", lineHeight: 1.7, margin: 0, paddingLeft: 20 }}>
                {pack.contents.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <div className="badge-row">
                <DownloadLink href={pack.href} label="Download" slug={pack.slug} />
                {pack.relatedTool ? (
                  <Link className="button secondary" href={pack.relatedTool.href}>Open the {pack.relatedTool.label}</Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        <NewsletterSignup placement="downloads" />
      </div>
    </section>
  );
}
