import Link from "next/link";
import { GuideCard } from "@/components/guides/guide-card";
import { ResourceCard } from "@/components/resources/resource-card";
import { guides } from "@/lib/guides";
import { getResourceBySlug, type ResourceItem } from "@/lib/resources";

export const metadata = {
  title: "Power Fx and Power Automate How-To Guides | BuilderVault",
  description: "Step-by-step guides for Power Apps formulas and Power Automate flows: formula errors, delegation, formatting, Filter Query, trigger conditions, Parse JSON, expressions, flow limits, troubleshooting failed runs, variables, named formulas, saving data, error handling, handing over flows when someone leaves, and quick starts for SharePoint, Outlook, Outlook calendar, Teams, Excel, Forms, Dataverse, OneDrive, Planner, Approvals, HTTP, SQL Server and custom connectors.",
  alternates: { canonical: "/guides" }
};

const groups = [
  {
    eyebrow: "Power Apps basics",
    title: "New to Power Apps",
    text: "Pick a data source, choose between canvas and model-driven apps, build a first canvas app on a SharePoint list, and share it with your team. Most of these guides are part of the step-by-step learning path."
  },
  {
    eyebrow: "Power Automate basics",
    title: "New to Power Automate",
    text: "What a cloud flow is, the three flow types, and a first flow built and tested step by step. This is where the Power Automate learning path starts."
  },
  {
    eyebrow: "Power Fx how-to",
    title: "Power Apps formula guides",
    text: "Fix, tidy and speed up Power Fx formulas, choose between functions that look alike, and handle variables, saving and errors."
  },
  {
    eyebrow: "Delegation by data source",
    title: "Delegation for your data source",
    text: "What SharePoint, Dataverse, SQL Server and Excel can and can't run for a Power Apps formula, with a delegable replacement for each common warning."
  },
  {
    eyebrow: "Power Automate how-to",
    title: "Power Automate flow guides",
    text: "Filter data, control triggers, read expressions, check limits and troubleshoot failed runs."
  },
  {
    eyebrow: "Power Automate connectors",
    title: "Connector quick starts",
    text: "The triggers and actions worth knowing for each connector, with one complete flow to build."
  }
];

const toolSlugs = [
  "power-fx-formatter",
  "power-apps-delegation-checker",
  "odata-filter-query-builder",
  "trigger-condition-builder",
  "parse-json-schema-generator",
  "power-automate-expression-builder",
  "power-apps-naming-linter",
  "excel-to-power-fx"
];

export default function GuidesPage() {
  const tools = toolSlugs
    .map((slug) => getResourceBySlug("tool", slug))
    .filter((tool): tool is ResourceItem => Boolean(tool));

  return (
    <section style={{ padding: "54px 0" }}>
      <div className="container" style={{ display: "grid", gap: 34 }}>
        <nav aria-label="Breadcrumb" className="badge-row">
          <Link href="/resources" style={{ color: "var(--accent-strong)", fontWeight: 800 }}>Resources</Link>
        </nav>
        <div style={{ maxWidth: 940 }}>
          <div className="eyebrow">How-to guides</div>
          <h1 className="page-title">How-to guides for Power Apps formulas and Power Automate flows.</h1>
          <p className="lead">
            Each guide answers one question, shows the formula or expression before and after, and points to the free tool that does the checking for you. The guides are checked against Microsoft&apos;s documentation. New to Power Apps? Follow the <Link href="/start" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>step-by-step learning path</Link>, or the <Link href="/start/flows" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>Power Automate path</Link> for flows. For a specific error message, see the <Link href="/errors" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>error library</Link>, and for one function at a time, the <Link href="/functions" style={{ color: "var(--accent-strong)", fontWeight: 700 }}>Power Fx function reference</Link>.
          </p>
        </div>
        {groups.map((group) => (
          <section key={group.eyebrow} style={{ display: "grid", gap: 18 }}>
            <div>
              <div className="eyebrow">{group.eyebrow}</div>
              <h2 className="section-title">{group.title}</h2>
              <p style={{ color: "#415049", lineHeight: 1.7, margin: "8px 0 0" }}>{group.text}</p>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {guides.filter((guide) => guide.eyebrow === group.eyebrow).map((guide) => <GuideCard guide={guide} key={guide.slug} />)}
            </div>
          </section>
        ))}
        <section style={{ display: "grid", gap: 18 }}>
          <div>
            <div className="eyebrow">Tools used in the guides</div>
            <h2 className="section-title">Check your work as you read.</h2>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {tools.map((tool) => <ResourceCard key={tool.slug} resource={tool} />)}
          </div>
        </section>
      </div>
    </section>
  );
}
