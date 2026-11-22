import { errorProducts } from "@/lib/errors";
import { tools } from "@/lib/resources";

// Server-only data: the header passes these menus to the client nav as props,
// so the error and tool data modules never reach the browser bundle.

export type NavLink = {
  href: string;
  label: string;
  note?: string;
};

export type NavColumn = {
  title: string;
  links: NavLink[];
};

export type NavMenu = {
  id: string;
  label: string;
  featured: { title: string; links: NavLink[]; more: NavLink };
  columns: NavColumn[];
};

const tool = (slug: string, label: string, note?: string): NavLink => ({ href: `/tools/${slug}`, label, note });

export const errorProductAnchor = (product: string) =>
  product
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const formatterLink: NavLink = { href: "/tools/power-fx-formatter", label: "Format Power Fx" };

export const navMenus: NavMenu[] = [
  {
    id: "tools",
    label: "Tools",
    featured: {
      title: "Most used",
      links: [
        tool("power-fx-formatter", "Power Fx Formatter", "Format, minify and check delegation"),
        tool("power-automate-expression-builder", "Expression Builder", "Power Automate expressions"),
        tool("odata-filter-query-builder", "Filter Query Builder", "SharePoint and Dataverse OData")
      ],
      more: { href: "/tools", label: `All ${tools.length} tools` }
    },
    columns: [
      {
        title: "Power Apps",
        links: [
          tool("power-apps-delegation-checker", "Delegation checker"),
          tool("patch-formula-builder", "Patch formula builder"),
          tool("gallery-search-filter-builder", "Gallery search and filter builder"),
          tool("excel-to-power-fx", "Excel formula to Power Fx"),
          tool("onstart-to-named-formulas", "OnStart to named formulas"),
          tool("csv-to-power-fx-table", "CSV and JSON to Power Fx table"),
          tool("power-apps-naming-linter", "Naming convention checker"),
          tool("power-apps-color-token-generator", "Color token generator")
        ]
      },
      {
        title: "Power Automate",
        links: [
          tool("trigger-condition-builder", "Trigger condition builder"),
          tool("date-format-tester", "Date format and time zone tester"),
          tool("parse-json-schema-generator", "Parse JSON schema generator"),
          tool("adaptive-card-preview-snippets", "Adaptive Card builder"),
          tool("recurrence-schedule-planner", "Recurrence schedule planner"),
          tool("sharepoint-http-request-builder", "SharePoint HTTP request builder")
        ]
      },
      {
        title: "SharePoint, Dataverse and ALM",
        links: [
          tool("sharepoint-internal-name-helper", "SharePoint internal name helper"),
          tool("sharepoint-column-formatting-builder", "Column formatting JSON builder"),
          tool("dataverse-table-naming-helper", "Dataverse table naming helper"),
          tool("solution-layering-checklist-generator", "Solution layering checklist"),
          tool("error-message-finder", "Error message finder")
        ]
      }
    ]
  },
  {
    id: "learn",
    label: "Learn",
    featured: {
      title: "Start learning",
      links: [
        { href: "/start", label: "Learn Power Apps step by step", note: "A seven-step path for new makers" },
        { href: "/guides/format-power-fx-formulas", label: "Format Power Fx formulas", note: "Readable formulas your team can maintain" },
        { href: "/guides/power-apps-delegation-warning-explained", label: "Delegation warnings explained", note: "What the yellow triangle means" },
        { href: "/guides/fix-common-power-fx-formula-errors", label: "Fix common formula errors", note: "The errors makers hit most" }
      ],
      more: { href: "/guides", label: "All guides" }
    },
    columns: [
      {
        title: "Read",
        links: [
          { href: "/guides", label: "How-to guides" },
          { href: "/examples", label: "Worked examples" },
          { href: "/cookbooks", label: "Cookbooks" }
        ]
      },
      {
        title: "Look up",
        links: [
          { href: "/functions", label: "Power Fx function reference" },
          { href: "/cheat-sheets", label: "Cheat sheets" },
          { href: "/standards", label: "Team standards" }
        ]
      },
      {
        title: "Take away",
        links: [
          { href: "/downloads", label: "Free downloads" },
          { href: "/resources", label: "All resources" }
        ]
      }
    ]
  },
  {
    id: "errors",
    label: "Fix an error",
    featured: {
      title: "Not sure which error?",
      links: [
        tool("error-message-finder", "Error message finder", "Paste the message, get the matching fix"),
        tool("power-apps-delegation-checker", "Delegation checker", "Check a formula before it hits the row limit")
      ],
      more: { href: "/errors", label: "Full error library" }
    },
    columns: [
      {
        title: "Errors by product",
        links: errorProducts.map((product) => ({ href: `/errors#${errorProductAnchor(product)}`, label: `${product} errors` }))
      }
    ]
  },
  {
    id: "patterns",
    label: "Patterns",
    featured: {
      title: "Pattern library",
      links: [
        { href: "/patterns", label: "Search all patterns", note: "Formulas, flows, schemas and fixes" },
        { href: "/collections", label: "Collections", note: "Curated sets for one kind of build" }
      ],
      more: { href: "/patterns", label: "Browse the library" }
    },
    columns: [
      {
        title: "By platform",
        links: [
          { href: "/power-apps", label: "Power Apps" },
          { href: "/power-automate", label: "Power Automate" },
          { href: "/sharepoint", label: "SharePoint" },
          { href: "/dataverse", label: "Dataverse" },
          { href: "/alm", label: "ALM and governance" }
        ]
      },
      {
        title: "Popular topics",
        links: [
          { href: "/power-apps/patch", label: "Patch" },
          { href: "/power-apps/delegation", label: "Delegation" },
          { href: "/power-apps/forms", label: "Forms" },
          { href: "/power-automate/trigger-conditions", label: "Trigger conditions" },
          { href: "/power-automate/error-handling", label: "Flow error handling" },
          { href: "/power-automate/approvals", label: "Approvals" }
        ]
      }
    ]
  }
];
