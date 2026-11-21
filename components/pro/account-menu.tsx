"use client";

import Link from "next/link";
import { useProStatus } from "./use-pro-status";

/** The header's Pro and account links. Renders nothing while Pro is switched off. */
export function AccountMenu() {
  const status = useProStatus();
  if (!status?.enabled) return null;
  return (
    <div className="account-menu">
      {status.pro ? null : (
        <Link className="account-menu-pro" href="/pro">
          Pro
        </Link>
      )}
      <Link href={status.signedIn ? "/account" : "/sign-in"}>{status.signedIn ? "Account" : "Sign in"}</Link>
    </div>
  );
}
