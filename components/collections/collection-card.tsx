import Link from "next/link";
import type { PatternCollection } from "@/lib/patterns/collections";

type CollectionCardProps = {
  collection: PatternCollection & { count?: number };
};

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <article className="card" style={{ display: "grid", gap: 14, padding: 22 }}>
      <div className="eyebrow">Collection</div>
      <h2 style={{ margin: 0 }}>{collection.title}</h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
        {collection.shortDescription}
      </p>
      {typeof collection.count === "number" ? (
        <strong>{collection.count} patterns</strong>
      ) : null}
      <Link className="button secondary" href={`/collections/${collection.slug}`}>
        Open collection
      </Link>
    </article>
  );
}
