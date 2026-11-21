import Link from "next/link";
import { functionPath, type FunctionPage } from "@/lib/functions";

export function FunctionCard({ page }: { page: FunctionPage }) {
  return (
    <Link className="card" href={functionPath(page)} style={{ alignContent: "start", display: "grid", gap: 10, padding: 20 }}>
      <h3 style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: "1.1rem", lineHeight: 1.3, margin: 0 }}>{page.name}</h3>
      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{page.description}</p>
    </Link>
  );
}
