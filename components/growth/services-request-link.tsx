"use client";

import { trackEvent } from "@/lib/analytics";
import { servicesMailto } from "@/lib/services";

export function ServicesRequestLink({ className = "button", label, offer }: { className?: string; label: string; offer?: string }) {
  return (
    <a className={className} href={servicesMailto(offer)} onClick={() => trackEvent("Services Request Started", { offer: offer ?? "general" })}>
      {label}
    </a>
  );
}
