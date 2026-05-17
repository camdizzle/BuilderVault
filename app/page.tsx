import Link from "next/link";
import { CollectionCard } from "@/components/collections/collection-card";
import { PatternCard } from "@/components/patterns/pattern-card";
import { ResourceCard } from "@/components/resources/resource-card";
import { PlatformIcon, platformLinks } from "@/components/platform/platform-icon";
import { getSuggestedCollections } from "@/lib/patterns/collections";
import { getFeaturedPatterns, getPatternStats } from "@/lib/patterns/patterns";
import { cheatSheets, cookbooks, standards, tools } from "@/lib/resources";

export default function HomePage() {
  const featuredPatterns = getFeaturedPatterns().slice(0, 3);
  const stats = getPatternStats();
  const collections = getSuggestedCollections().slice(0, 3);
  const resources = [cookbooks[0], cookbooks[2], standards[6], cheatSheets[0], tools[1], tools[6]];
  const rolePaths = [
    { href: "/power-apps/patch", label: "Canvas app maker", text: "Patch, forms, galleries, validation, and Power Fx cleanup." },
    { href: "/power-automate/trigger-conditions", label: "Flow builder", text: "Trigger conditions, approvals, expressions, error handling, and Teams cards." },
    { href: "/sharepoint/list-schemas", label: "SharePoint app builder", text: "List schemas, internal names, views, indexes, and Power Apps backends." },
    { href: "/dataverse/security-roles", label: "Dataverse developer", text: "Table design, relationships, security roles, and model-driven access." }
  ];

  return (
    <>
      <section style={{ padding: "70px 0 36px" }}>
        <div className="container split-grid">
          <div>
            <div className="eyebrow">Power Platform pattern vault</div>
            <h1 className="page-title">Build cleaner Power Apps and flows without starting from scratch.</h1>
            <p className="lead">
              BuilderVault gives Power Platform developers a searchable library of patterns, cookbooks, standards, cheat sheets, and utility pages for real Microsoft business app delivery.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/patterns">Find a pattern</Link>
              <Link className="button secondary" href="/resources">Explore resources</Link>
            </div>
          </div>
          <div className="card" style={{ alignSelf: "start", display: "grid", gap: 18, padding: 24 }}>
            <div>
              <div className="eyebrow">Choose your path</div>
              <h2 style={{ fontSize: "1.5rem", lineHeight: 1.15, margin: "10px 0 0" }}>What do you need right now?</h2>
            </div>
            <PathLink href="/patterns" label="I need a pattern" text="Search implementation guidance, formulas, flows, schemas, and troubleshooting notes." />
            <PathLink href="/cookbooks" label="I need a recipe" text="Use task-based examples for Patch, collections, expressions, and SharePoint schemas." />
            <PathLink href="/standards" label="I need team standards" text="Standardize naming, ALM, error handling, logging, and support handoff." />
          </div>
        </div>
      </section>

      <section className="surface" style={{ padding: "28px 0" }}>
        <div className="container" style={{ display: "grid", gap: 18 }}>
          <div style={{ alignItems: "end", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
            <div>
              <div className="eyebrow">Supported technologies</div>
              <h2 className="section-title" style={{ fontSize: "2rem" }}>Jump in by platform.</h2>
            </div>
            <Link className="button secondary" href="/resources">View all resources</Link>
          </div>
          <div className="platform-strip">
            {platformLinks.map((platform) => <PlatformIcon key={platform.href} {...platform} />)}
          </div>
        </div>
      </section>

      <section style={{ padding: "44px 0" }}>
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <Metric label="Power Platform patterns" value={stats.totalPatterns} />
            <Metric label="Free examples" value={stats.freePatterns} />
            <Metric label="Resource guides" value={cookbooks.length + standards.length + cheatSheets.length + tools.length} />
            <Metric label="Core categories" value={stats.categories} />
          </div>
        </div>
      </section>


      <section style={{ padding: "34px 0" }}>
        <div className="container" style={{ display: "grid", gap: 24 }}>
          <div style={{ maxWidth: 820 }}>
            <div className="eyebrow">Start by role</div>
            <h2 className="section-title">Open the path closest to your build.</h2>
            <p className="lead">Each path links to focused examples, standards, tools, and patterns instead of making you hunt through the whole library.</p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {rolePaths.map((path) => <PathLink href={path.href} key={path.href} label={path.label} text={path.text} />)}
          </div>
        </div>
      </section>

      <section style={{ padding: "34px 0" }}>
        <div className="container" style={{ display: "grid", gap: 24 }}>
          <div style={{ maxWidth: 780 }}>
            <div className="eyebrow">Builder resources</div>
            <h2 className="section-title">Fast references for the problems makers search for most.</h2>
            <p className="lead">
              Inspired by practical Power Platform learning sites, these pages are designed for fast lookup: what to use, starter code, expected result, and common mistakes.
            </p>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {resources.map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}
          </div>
        </div>
      </section>

      <section className="surface" style={{ padding: "44px 0" }}>
        <div className="container" style={{ display: "grid", gap: 24 }}>
          <div style={{ alignItems: "end", display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "space-between" }}>
            <div>
              <div className="eyebrow">Build paths</div>
              <h2 className="section-title">Curated workstreams, not endless menus.</h2>
            </div>
            <Link className="button secondary" href="/collections">Explore collections</Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {collections.map((collection) => <CollectionCard collection={collection} key={collection.slug} />)}
          </div>
        </div>
      </section>

      <section style={{ padding: "44px 0" }}>
        <div className="container" style={{ display: "grid", gap: 24 }}>
          <div style={{ alignItems: "end", display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "space-between" }}>
            <div>
              <div className="eyebrow">Featured patterns</div>
              <h2 className="section-title">Start with proven implementation details.</h2>
            </div>
            <Link className="button secondary" href="/patterns">Browse all patterns</Link>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {featuredPatterns.map((pattern) => <PatternCard key={pattern.id} pattern={pattern} />)}
          </div>
        </div>
      </section>
    </>
  );
}

function PathLink({ href, label, text }: { href: string; label: string; text: string }) {
  return (
    <Link className="path-card card" href={href} style={{ minHeight: 0 }}>
      <strong style={{ fontSize: "1.08rem" }}>{label}</strong>
      <p>{text}</p>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-tile">
      <div style={{ fontSize: "2rem", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "var(--muted)" }}>{label}</div>
    </div>
  );
}
