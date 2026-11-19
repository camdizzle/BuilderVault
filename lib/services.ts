// Services offer shown on /services and in "get help" callouts.
// Kinds of help listed on /services. Copy describes topics only: no prices, turnaround, or guarantees.
export const servicesContactEmail = "help@camwow.tv";

export const serviceOffers = [
  {
    slug: "formula-review",
    title: "Formula and app review",
    summary: "Questions about a Power Fx formula, a screen, or an app's structure: delegation, error handling, performance, and maintainability.",
    goodFor: ["Apps slowing down as data grows", "Delegation warnings", "Preparing an app for handoff"]
  },
  {
    slug: "fix-it",
    title: "Troubleshooting an app or flow",
    summary: "A specific problem such as a Patch that won't save, a flow that fails on some items, a trigger that fires too often, or a deployment that breaks connections.",
    goodFor: ["Errors you can reproduce but can't explain", "Flows that fail silently", "Broken connections after import"]
  },
  {
    slug: "build-help",
    title: "Data model and ALM setup",
    summary: "Designing a SharePoint or Dataverse data model, or setting up solutions, environment variables, and connection references.",
    goodFor: ["New apps that need to scale", "Moving from personal to team-owned apps", "Separate dev, test, and prod environments"]
  }
];

export function servicesMailto(offerTitle?: string) {
  const subject = offerTitle ? `BuilderVault help: ${offerTitle}` : "BuilderVault help request";
  const body = [
    "What are you building (app, flow, data source)?",
    "",
    "What is going wrong, or what do you need?",
    "",
    "Timeline:",
    ""
  ].join("\n");
  return `mailto:${servicesContactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
