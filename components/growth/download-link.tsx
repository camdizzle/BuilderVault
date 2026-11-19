"use client";

import { trackEvent } from "@/lib/analytics";

export function DownloadLink({ href, label, slug }: { href: string; label: string; slug: string }) {
  return (
    <a className="button" download href={href} onClick={() => trackEvent("Pack Downloaded", { pack: slug })}>
      {label}
    </a>
  );
}
