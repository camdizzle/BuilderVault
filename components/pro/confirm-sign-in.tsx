"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * The sign-in link carries its token after # so it never reaches server logs. The visitor
 * presses a button to use it, because work email scanners open links on their own.
 */
export function ConfirmSignIn() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const match = window.location.hash.match(/token=([^&]+)/);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the hash is only readable in the browser, after the first render
    setToken(match ? decodeURIComponent(match[1]) : "");
  }, []);

  if (token === null) return null;
  if (!token) {
    return (
      <p className="pro-notice error" role="alert">
        This page needs the link from your sign-in email. <Link href="/sign-in">Request a new link</Link>.
      </p>
    );
  }
  return (
    <form action="/api/auth/verify" className="pro-form" method="post">
      <input name="token" type="hidden" value={token} />
      <button className="button" type="submit">
        Sign in
      </button>
    </form>
  );
}
