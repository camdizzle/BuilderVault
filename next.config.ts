import type { NextConfig } from "next";

// Pages that were removed. Each old address forwards to the closest page that still exists.
const retiredRoutes: Array<[string, string]> = [
  ["/dashboard", "/patterns"],
  ["/favorites", "/patterns"],
  ["/reports", "/pmo/communications-and-reporting"],
  ["/reports/new", "/pmo/communications-and-reporting"],
  ["/pmo/adoption", "/pmo"],
  ["/pmo/backlog", "/pmo"],
  ["/pmo/cadence", "/pmo"],
  ["/pmo/communications", "/pmo/communications-and-reporting"],
  ["/pmo/escalations", "/pmo/change-risk-issue-control"],
  ["/pmo/kpis", "/pmo/communications-and-reporting"],
  ["/pmo/release", "/pmo/roadmap"],
  ["/pmo/runbook", "/pmo"],
  ["/pmo/uat", "/pmo/roadmap"],
  ["/examples/patch-sharepoint-person-field-examples", "/patterns/patch-sharepoint-people-picker-power-apps"],
  ["/examples/patch-sharepoint-choice-field-examples", "/patterns/patch-sharepoint-choice-field"],
  ["/examples/patch-sharepoint-lookup-field-examples", "/patterns/patch-sharepoint-lookup-field"],
  ["/examples/power-apps-delegation-filter-examples", "/patterns/avoid-delegation-warnings-sharepoint-filters"],
  ["/examples/power-apps-form-validation-examples", "/patterns/validate-required-fields-before-patch"],
  ["/examples/power-apps-gallery-search-sort-examples", "/patterns/power-apps-search-with-multiple-fields"],
  ["/examples/power-automate-approval-examples", "/patterns/power-automate-approval-with-sharepoint-status-sync"],
  ["/examples/power-automate-html-email-examples", "/patterns/power-automate-email-html-table"],
  ["/examples/power-automate-error-handling-examples", "/patterns/power-automate-try-catch-scope-error-handling"],
  ["/examples/power-automate-array-select-filter-examples", "/patterns/select-union-remove-duplicates-power-automate"],
  ["/examples/sharepoint-internal-name-examples", "/patterns/sharepoint-internal-name-safe-column-design"],
  ["/examples/sharepoint-view-index-examples", "/patterns/sharepoint-view-indexing-for-large-lists"],
  ["/examples/dataverse-relationship-examples", "/patterns/create-a-lookup-relationship-model"],
  ["/examples/dataverse-choice-column-examples", "/patterns/create-a-choice-column-strategy"],
  ["/examples/alm-environment-variable-examples", "/patterns/dataverse-environment-variables-canvas-apps-flows"],
  ["/examples/connection-reference-examples", "/patterns/connection-references-for-solution-flows"],
  ["/examples/adaptive-card-teams-approval-examples", "/patterns/post-adaptive-card-and-wait-for-response"]
];

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async redirects() {
    return retiredRoutes.map(([source, destination]) => ({ source, destination, permanent: true }));
  }
};

export default nextConfig;
