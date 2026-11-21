"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { NavLink, NavMenu } from "@/lib/navigation";

type SiteNavProps = {
  menus: NavMenu[];
  formatter: NavLink;
};

export function SiteNav({ menus, formatter }: SiteNavProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  // Close everything once a link inside the menus is followed.
  function closeOnLinkClick(event: ReactMouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) {
      setOpenMenu(null);
      setMobileOpen(false);
      setMobileSection(null);
    }
  }

  // Close on Escape or a click outside the header.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    }
    function onClick(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const isActive = (menu: NavMenu) =>
    [menu.featured.more, ...menu.featured.links, ...menu.columns.flatMap((column) => column.links)].some(
      (link) => {
        const base = link.href.split("#")[0];
        return base !== "/" && (pathname === base || pathname.startsWith(`${base}/`));
      }
    );

  return (
    <div className="site-nav" onClick={closeOnLinkClick} ref={navRef}>
      <nav aria-label="Main navigation" className="site-nav-desktop">
        <ul className="site-nav-list">
          {menus.map((menu) => {
            const open = openMenu === menu.id;
            return (
              <li key={menu.id}>
                <button
                  aria-controls={`nav-panel-${menu.id}`}
                  aria-expanded={open}
                  className={`site-nav-trigger${open ? " is-open" : ""}${isActive(menu) ? " is-active" : ""}`}
                  onClick={() => setOpenMenu(open ? null : menu.id)}
                  type="button"
                >
                  {menu.label}
                  <Chevron />
                </button>
                <div className={`site-nav-panel${open ? " is-open" : ""}`} id={`nav-panel-${menu.id}`}>
                  <MenuPanel menu={menu} />
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      <Link className="button site-nav-cta" href={formatter.href}>
        {formatter.label}
      </Link>

      <button
        aria-controls="mobile-nav"
        aria-expanded={mobileOpen}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        className="site-nav-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        type="button"
      >
        {mobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div className={`site-nav-mobile${mobileOpen ? " is-open" : ""}`} id="mobile-nav">
        <nav aria-label="Mobile navigation">
          {menus.map((menu) => {
            const open = mobileSection === menu.id;
            return (
              <div className="site-nav-mobile-section" key={menu.id}>
                <button
                  aria-controls={`mobile-panel-${menu.id}`}
                  aria-expanded={open}
                  className="site-nav-mobile-trigger"
                  onClick={() => setMobileSection(open ? null : menu.id)}
                  type="button"
                >
                  {menu.label}
                  <Chevron />
                </button>
                <div className={`site-nav-mobile-panel${open ? " is-open" : ""}`} id={`mobile-panel-${menu.id}`}>
                  {[{ title: menu.featured.title, links: menu.featured.links }, ...menu.columns].map((column) => (
                    <div key={column.title}>
                      <div className="site-nav-heading">{column.title}</div>
                      {column.links.map((link) => (
                        <Link href={link.href} key={`${column.title}-${link.href}`}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                  <Link className="site-nav-more" href={menu.featured.more.href}>
                    {menu.featured.more.label} →
                  </Link>
                </div>
              </div>
            );
          })}
          <div className="site-nav-mobile-extra">
            <Link href="/about">About</Link>
            <Link href="/services">Get help</Link>
          </div>
          <Link className="button site-nav-mobile-cta" href={formatter.href}>
            {formatter.label}
          </Link>
        </nav>
      </div>
    </div>
  );
}

function MenuPanel({ menu }: { menu: NavMenu }) {
  return (
    <div className="site-nav-panel-inner" data-columns={menu.columns.length}>
      <div className="site-nav-featured">
        <div className="site-nav-heading">{menu.featured.title}</div>
        {menu.featured.links.map((link) => (
          <Link className="site-nav-featured-link" href={link.href} key={link.href}>
            <strong>{link.label}</strong>
            {link.note ? <span>{link.note}</span> : null}
          </Link>
        ))}
        <Link className="site-nav-more" href={menu.featured.more.href}>
          {menu.featured.more.label} →
        </Link>
      </div>
      {menu.columns.map((column) => (
        <div className="site-nav-column" key={column.title}>
          <div className="site-nav-heading">{column.title}</div>
          {column.links.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

function Chevron() {
  return (
    <svg aria-hidden="true" className="site-nav-chevron" fill="none" height="12" viewBox="0 0 12 12" width="12">
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 22 22" width="22">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 22 22" width="22">
      <path d="M5 5l12 12M17 5 5 17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
