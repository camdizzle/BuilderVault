import Link from "next/link";
import { guidePath, type Guide } from "@/lib/guides";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link className="card" href={guidePath(guide)} style={{ display: "grid", gap: 14, padding: 20 }}>
      <div className="eyebrow">{guide.eyebrow}</div>
      <h2 style={{ fontSize: "1.2rem", lineHeight: 1.2, margin: 0 }}>{guide.title}</h2>
      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{guide.description}</p>
    </Link>
  );
}
