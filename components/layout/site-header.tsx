import Link from "next/link";
import { AccountMenu } from "@/components/pro/account-menu";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link className="site-logo" href="/">
          <span aria-hidden="true" className="site-logo-mark">
            B
          </span>
          BuilderVault
        </Link>
        <nav aria-label="Main navigation" className="compact-nav-group">
          <Link href="/patterns">Patterns</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/examples">Examples</Link>
          <Link href="/tools">Tools</Link>
          <Link href="/services">Get help</Link>
          <Link href="/about">About</Link>
          <AccountMenu />
        </nav>
      </div>
    </header>
  );
}
