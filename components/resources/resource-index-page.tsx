import Link from "next/link";
import { PlatformIcon, platformLinks } from "@/components/platform/platform-icon";
import { ResourceCard } from "@/components/resources/resource-card";
import type { ResourceItem } from "@/lib/resources";

export function ResourceIndexPage({
  title,
  eyebrow,
  description,
  items,
  backHref = "/resources",
  backLabel = "All resources"
}: {
  title: string;
  eyebrow: string;
  description: string;
  items: ResourceItem[];
  backHref?: string;
  backLabel?: string;
}) {
  const featured = items.slice(0, 3);
  const remaining = items.slice(3);

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <div className="split-grid">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h1 className="page-title">{title}</h1>
            <p className="lead">{description}</p>
            <div className="hero-actions">
              <Link className="button" href={featured[0]?.path ?? "/resources"}>Start with featured</Link>
              <Link className="button secondary" href={backHref}>{backLabel}</Link>
            </div>
          </div>
          <div className="card" style={{ alignSelf: "start", display: "grid", gap: 14, padding: 22 }}>
            <div className="eyebrow">Resource shortcuts</div>
            <div className="platform-strip" style={{ gridTemplateColumns: "1fr" }}>
              {platformLinks.slice(0, 4).map((platform) => <PlatformIcon key={platform.href} {...platform} />)}
            </div>
          </div>
        </div>

        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">Featured</div>
            <h2 className="section-title">Best starting points.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {featured.map((item) => <ResourceCard key={item.slug} resource={item} />)}
          </div>
        </section>

        {remaining.length > 0 ? (
          <section style={{ display: "grid", gap: 18 }}>
            <div>
              <div className="eyebrow">All guides</div>
              <h2 className="section-title">Keep going by task.</h2>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {remaining.map((item) => <ResourceCard key={item.slug} resource={item} />)}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
