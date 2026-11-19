"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

export function ServicesCta({ placement, text, title }: { placement: string; text: string; title: string }) {
  return (
    <div className="card" style={{ display: "grid", gap: 10, padding: 20 }}>
      <div className="eyebrow">Need a hand?</div>
      <h2 style={{ fontSize: "1.15rem", margin: 0 }}>{title}</h2>
      <p style={{ color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{text}</p>
      <Link className="button secondary" href="/services" onClick={() => trackEvent("Services CTA Clicked", { placement })}>
        See how I can help
      </Link>
    </div>
  );
}
