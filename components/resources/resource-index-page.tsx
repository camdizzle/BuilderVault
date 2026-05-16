import Link from "next/link";
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
  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 30 }}>
        <div style={{ maxWidth: 900 }}>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="page-title">{title}</h1>
          <p className="lead">{description}</p>
          <Link className="button secondary" href={backHref} style={{ marginTop: 14 }}>{backLabel}</Link>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {items.map((item) => <ResourceCard key={item.slug} resource={item} />)}
        </div>
      </div>
    </section>
  );
}
