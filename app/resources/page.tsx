import Link from "next/link";
import { PlatformIcon, platformLinks } from "@/components/platform/platform-icon";
import { ResourceCard } from "@/components/resources/resource-card";
import { resourceGroups } from "@/lib/resources";

export const metadata = {
  title: "Power Platform Resources | BuilderVault",
  description: "Browse BuilderVault cookbooks, standards, cheat sheets, and free tool concepts for Power Apps, Power Automate, SharePoint, Dataverse, and ALM."
};

export default function ResourcesPage() {
  const featured = [resourceGroups[0].items[0], resourceGroups[1].items[6], resourceGroups[2].items[0], resourceGroups[3].items[1]];

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 38 }}>
        <div className="split-grid">
          <div>
            <div className="eyebrow">Power Platform resources</div>
            <h1 className="page-title">Fast lookup for makers who are already building.</h1>
            <p className="lead">
              BuilderVault resources package the pattern library into cookbooks, standards, cheat sheets, and utility pages for the questions Power Platform developers search for mid-build.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/cookbooks">Open cookbooks</Link>
              <Link className="button secondary" href="/tools">Try free tools</Link>
            </div>
          </div>
          <div className="card" style={{ alignSelf: "start", display: "grid", gap: 16, padding: 24 }}>
            <div className="eyebrow">Choose by platform</div>
            <div className="platform-strip" style={{ gridTemplateColumns: "1fr" }}>
              {platformLinks.slice(0, 5).map((platform) => <PlatformIcon key={platform.href} {...platform} />)}
            </div>
          </div>
        </div>

        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">Recommended first</div>
            <h2 className="section-title">High-use references.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {featured.map((item) => <ResourceCard key={item.slug} resource={item} />)}
          </div>
        </section>

        <section className="surface" style={{ margin: "0 -24px", padding: "34px 24px" }}>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {resourceGroups.map((group) => (
              <Link className="card" href={group.path} key={group.slug} style={{ display: "grid", gap: 14, padding: 22 }}>
                <div className="eyebrow">{group.eyebrow}</div>
                <h2 style={{ fontSize: "1.35rem", margin: 0 }}>{group.title}</h2>
                <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{group.description}</p>
                <span style={{ color: "var(--accent-strong)", fontWeight: 800 }}>{group.items.length} resources</span>
              </Link>
            ))}
          </div>
        </section>

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
