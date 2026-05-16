import Link from "next/link";
import { ResourceCard } from "@/components/resources/resource-card";
import { resourceGroups } from "@/lib/resources";

export const metadata = {
  title: "Power Platform Resources | BuilderVault",
  description: "Browse BuilderVault cookbooks, standards, cheat sheets, and free tool concepts for Power Apps, Power Automate, SharePoint, Dataverse, and ALM."
};

export default function ResourcesPage() {
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 36 }}>
        <div style={{ maxWidth: 940 }}>
          <div className="eyebrow">Power Platform resources</div>
          <h1 className="page-title">Cookbooks, standards, cheat sheets, and builder utilities.</h1>
          <p className="lead">
            BuilderVault resources turn the pattern library into faster lookup paths for common Power Platform work: copy-ready formulas, team standards, short references, and static utility pages that can grow into interactive tools later.
          </p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {resourceGroups.map((group) => (
            <Link className="card" href={group.path} key={group.slug} style={{ display: "grid", gap: 14, padding: 22 }}>
              <div className="eyebrow">{group.eyebrow}</div>
              <h2 style={{ fontSize: "1.35rem", margin: 0 }}>{group.title}</h2>
              <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{group.description}</p>
              <span style={{ color: "var(--accent-strong)", fontWeight: 800 }}>{group.items.length} resources</span>
            </Link>
          ))}
        </div>
        {resourceGroups.map((group) => (
          <section key={group.slug} style={{ display: "grid", gap: 18 }}>
            <div style={{ alignItems: "end", display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "space-between" }}>
              <div>
                <div className="eyebrow">{group.eyebrow}</div>
                <h2 className="section-title">{group.title}</h2>
              </div>
              <Link className="button secondary" href={group.path}>View all</Link>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {group.items.slice(0, 4).map((item) => <ResourceCard key={item.slug} resource={item} />)}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
