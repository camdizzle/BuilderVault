import Link from "next/link";
import { FavoriteButton } from "@/components/patterns/favorite-button";
import { Badge } from "@/components/ui/badge";
import type { Pattern } from "@/types/pattern";

type PatternCardProps = {
  pattern: Pattern;
};

export function PatternCard({ pattern }: PatternCardProps) {
  return (
    <article className="card pattern-card">
      <div className="badge-row">
        <Badge tone="free">Free</Badge>
        <Badge tone="difficulty">{pattern.difficulty}</Badge>
        <Badge>{pattern.category}</Badge>
      </div>
      <div>
        <h2 style={{ fontSize: "1.25rem", lineHeight: 1.2, margin: "0 0 8px" }}>
          <Link href={`/patterns/${pattern.slug}`}>{pattern.title}</Link>
        </h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>
          {pattern.shortDescription}
        </p>
      </div>
      <div className="badge-row">
        {pattern.platform.map((platform) => (
          <Badge key={platform}>{platform}</Badge>
        ))}
      </div>
      <div className="badge-row">
        {pattern.tags.slice(0, 3).map((tag) => (
          <span className="badge" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 16
        }}
      >
        <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Saves about {pattern.estimatedTimeSaved}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <FavoriteButton compact patternSlug={pattern.slug} />
          <Link className="button secondary" href={`/patterns/${pattern.slug}`}>
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
