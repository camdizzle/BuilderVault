import Link from "next/link";
import type { ResourceItem } from "@/lib/resources";

export function ResourceCard({ resource }: { resource: ResourceItem }) {
  return (
    <Link className="card" href={resource.path} style={{ display: "grid", gap: 14, padding: 20 }}>
      <div className="eyebrow">{resource.eyebrow}</div>
      <h2 style={{ fontSize: "1.2rem", lineHeight: 1.2, margin: 0 }}>{resource.title}</h2>
      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{resource.description}</p>
      <div className="badge-row" aria-label="Keywords">
        {resource.keywords.slice(0, 3).map((keyword) => (
          <span className="badge" key={keyword}>{keyword}</span>
        ))}
      </div>
    </Link>
  );
}
