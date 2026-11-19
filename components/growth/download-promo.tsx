import Link from "next/link";
import { downloadPacks } from "@/lib/downloads";

export function DownloadPromo() {
  const pack = downloadPacks[0];

  return (
    <div className="card" style={{ display: "grid", gap: 10, padding: 20 }}>
      <div className="eyebrow">Free download</div>
      <h2 style={{ fontSize: "1.15rem", margin: 0 }}>{pack.title}</h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{pack.description}</p>
      <Link className="button secondary" href="/downloads">Get the pack</Link>
    </div>
  );
}
