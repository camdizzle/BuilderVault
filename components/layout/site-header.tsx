import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";
import { formatterLink, navMenus } from "@/lib/navigation";

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
        <SiteNav formatter={formatterLink} menus={navMenus} />
      </div>
    </header>
  );
}
