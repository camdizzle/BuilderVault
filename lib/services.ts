// Services offer shown on /services and in "get help" callouts.
// DRAFT COPY: review the offers, turnaround, and contact address before deploying.
export const servicesContactEmail = "help@camwow.tv";

export const serviceOffers = [
  {
    slug: "formula-review",
    title: "Formula and app review",
    summary: "Send a Power Fx formula, screen, or whole app. Get back written notes on delegation, error handling, performance, and maintainability, with suggested rewrites.",
    goodFor: ["Apps slowing down as data grows", "Delegation warnings you can't get rid of", "A handoff or audit coming up"]
  },
  {
    slug: "fix-it",
    title: "Fix a broken app or flow",
    summary: "A focused session on one problem: a Patch that won't save, a flow that fails on some items, a trigger that fires too often, or a deployment that breaks connections.",
    goodFor: ["Production issues", "Errors you can reproduce but can't explain", "Flows that fail silently"]
  },
  {
    slug: "build-help",
    title: "Build and ALM setup",
    summary: "Help designing a SharePoint or Dataverse data model, setting up solutions, environment variables, and connection references, or building a first version with your team.",
    goodFor: ["New apps that need to scale", "Moving from personal to team-owned apps", "Setting up dev, test, and prod environments"]
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
