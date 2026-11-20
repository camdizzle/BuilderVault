import Link from "next/link";
import { errorPath, type ErrorPage } from "@/lib/errors";

export function ErrorCard({ page }: { page: ErrorPage }) {
  return (
    <Link className="card" href={errorPath(page)} style={{ display: "grid", gap: 12, padding: 20 }}>
      <div className="eyebrow">{page.product} error</div>
      <h3 style={{ fontSize: "1.1rem", lineHeight: 1.3, margin: 0 }}>{page.shortTitle}</h3>
      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{page.description}</p>
    </Link>
  );
}
