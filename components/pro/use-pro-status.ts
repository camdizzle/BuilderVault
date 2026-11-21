"use client";

import { useEffect, useState } from "react";

export type ProStatus = { enabled: boolean; signedIn: boolean; pro: boolean; email?: string | null };

const off: ProStatus = { enabled: false, signedIn: false, pro: false };
let request: Promise<ProStatus> | null = null;

/** One status request per page view, shared by the header and the tools. */
function loadStatus() {
  if (!request) {
    request = fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" })
      .then((response) => (response.ok ? (response.json() as Promise<ProStatus>) : off))
      .catch(() => off);
  }
  return request;
}

/** Null until loaded. While Pro is switched off on the server, enabled is false and nothing should show. */
export function useProStatus() {
  const [status, setStatus] = useState<ProStatus | null>(null);
  useEffect(() => {
    let active = true;
    loadStatus().then((value) => {
      if (active) setStatus(value);
    });
    return () => {
      active = false;
    };
  }, []);
  return status;
}
