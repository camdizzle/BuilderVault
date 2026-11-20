// Newsletter signup posts straight to your email provider's embed form endpoint.
// Off until NEXT_PUBLIC_NEWSLETTER_FORM_ACTION is set. Works with Buttondown, Kit (ConvertKit),
// MailerLite, Mailchimp, and most providers that publish an HTML embed form.
export const newsletterConfig = {
  formAction: process.env.NEXT_PUBLIC_NEWSLETTER_FORM_ACTION ?? "",
  emailField: process.env.NEXT_PUBLIC_NEWSLETTER_EMAIL_FIELD || "email"
};

export const newsletterEnabled = Boolean(newsletterConfig.formAction);

export type DownloadPack = {
  slug: string;
  title: string;
  description: string;
  href: string;
  format: string;
  contents: string[];
  relatedTool?: { href: string; label: string };
};

export const downloadPacks: DownloadPack[] = [
  {
    slug: "power-fx-review-pack",
    title: "Power Fx Review Pack",
    description: "A formula review checklist, eight copy-ready Power Fx snippets, and a control naming table to use before handoff or code review.",
    href: "/packs/power-fx-review-pack.md",
    format: "Markdown",
    contents: [
      "Review checklist: readability, saving data, delegation, performance, handoff",
      "Snippets: save with IfError, delegation-safe user filter, Switch, With, caching, validation, confirm-delete, person column Patch",
      "Naming convention table for controls, variables, and collections"
    ],
    relatedTool: { href: "/tools/power-fx-formatter", label: "Power Fx Formatter" }
  },
  {
    slug: "power-automate-flow-review-pack",
    title: "Power Automate Flow Review Pack",
    description: "A review checklist for production flows, copy-ready expressions and trigger conditions, a Try, Catch, Finally layout, a naming table and a failure triage table.",
    href: "/packs/power-automate-flow-review-pack.md",
    format: "Markdown",
    contents: [
      "Review checklist: ownership, trigger, actions, error handling, notifications, go-live",
      "Expressions for blanks, dates, arrays, trigger conditions, filter queries and run links",
      "Try, Catch, Finally layout, naming table and a table of common errors with the response to each"
    ],
    relatedTool: { href: "/tools/trigger-condition-builder", label: "Trigger Condition Builder" }
  },
  {
    slug: "sharepoint-list-design-pack",
    title: "SharePoint List Design Pack",
    description: "A design worksheet, a column plan, six ready-made list schemas and the index, view and go-live checks for lists that back Power Apps and flows.",
    href: "/packs/sharepoint-list-design-pack.md",
    format: "Markdown",
    contents: [
      "Design worksheet and column plan with type and naming rules",
      "Schemas: request list, approval columns, child list, reference list, settings list, history list",
      "Checklists: indexes and views, Power Apps and Power Automate, go-live"
    ],
    relatedTool: { href: "/tools/sharepoint-internal-name-helper", label: "SharePoint Internal Name Helper" }
  },
  {
    slug: "alm-release-pack",
    title: "Power Platform Release Pack",
    description: "Everything for moving a solution from development to production: a release checklist, release notes template, variable and connection registers, CLI commands, a smoke test and a rollback plan.",
    href: "/packs/alm-release-pack.md",
    format: "Markdown",
    contents: [
      "Release checklist: before export, export, test, production, after",
      "Templates: release notes, environment variable register, connection reference register, rollback plan",
      "pac CLI commands, a deployment settings file, a smoke test script and steps for removing an unmanaged layer"
    ],
    relatedTool: { href: "/tools/solution-layering-checklist-generator", label: "Solution Layering Checklist Generator" }
  },
  {
    slug: "dataverse-security-role-pack",
    title: "Dataverse Security Role Pack",
    description: "Design and test Dataverse security roles with a persona worksheet, a role matrix template with worked examples, team set-up steps and a troubleshooting table.",
    href: "/packs/dataverse-security-role-pack.md",
    format: "Markdown",
    contents: [
      "Quick reference for privileges and access levels, and what each task needs",
      "Persona worksheet and role matrix template, with requester and agent examples",
      "Team set-up steps, a test checklist and a table of common access errors with fixes"
    ],
    relatedTool: { href: "/tools/dataverse-table-naming-helper", label: "Dataverse Table Naming Helper" }
  },
  {
    slug: "solution-handoff-pack",
    title: "Solution Handoff Pack",
    description: "Hand a solution from the people who built it to the people who will run it: a support guide template, a user acceptance test script, an ownership transfer checklist and a go-live checklist.",
    href: "/packs/solution-handoff-pack.md",
    format: "Markdown",
    contents: [
      "Support guide template with contacts, components, known problems, incident steps and recovery",
      "User acceptance test script with scenarios, defect severities and sign-off",
      "Checklists for ownership transfer, go-live and the first four weeks"
    ],
    relatedTool: { href: "/tools/power-apps-naming-linter", label: "Power Apps Naming Linter" }
  }
];
