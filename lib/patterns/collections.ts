import type { Pattern } from "@/types/pattern";
import { getPublishedPatternBySlug, getPublishedPatterns } from "@/lib/patterns/patterns";

export type PatternCollection = {
  slug: string;
  title: string;
  shortDescription: string;
  patternSlugs: string[];
};

export const patternCollections: PatternCollection[] = [
  {
    slug: "power-apps-patching-cookbook",
    title: "Power Apps Patching Cookbook",
    shortDescription: "Core patching examples for SharePoint fields, Dataverse-style saves, validation, refresh, and save behavior.",
    patternSlugs: [
      "forall-patch-multiple-records-power-apps",
      "updateif-removeif-bulk-changes-power-apps",
      "patch-sharepoint-people-picker-power-apps",
      "patch-sharepoint-choice-field",
      "patch-sharepoint-lookup-field",
      "patch-sharepoint-multi-choice-field",
      "patch-sharepoint-multi-person-field",
      "patch-a-sharepoint-yes-no-field-from-power-apps",
      "patch-a-sharepoint-currency-field",
      "patch-a-sharepoint-date-and-time-field",
      "patch-sharepoint-rich-text-notes-from-power-apps",
      "patch-a-generated-request-number-after-create",
      "patch-approval-metadata-from-a-button",
      "patch-a-priority-change-with-history-note"
    ]
  },
  {
    slug: "delegation-survival-kit",
    title: "Delegation Survival Kit",
    shortDescription: "Patterns for SharePoint filters, searchable galleries, query shaping, and predictable app performance.",
    patternSlugs: [
      "sharepoint-list-view-threshold-5000-items",
      "get-more-than-5000-items-power-automate",
      "sort-gallery-by-column-header-power-apps",
      "dataverse-delegation-filter-search-large-tables",
      "avoid-delegation-warnings-sharepoint-filters",
      "build-a-queue-dashboard-gallery",
      "build-a-reusable-filter-panel",
      "power-apps-search-with-multiple-fields"
    ]
  },
  {
    slug: "power-apps-app-design-kit",
    title: "Power Apps App Design Kit",
    shortDescription: "Screen, state, dashboard, validation, command, and UX patterns for maintainable business apps.",
    patternSlugs: [
      "responsive-canvas-app-layout-containers",
      "with-function-readable-power-fx-formulas",
      "check-microsoft-365-group-membership-power-apps",
      "build-a-queue-dashboard-gallery",
      "build-a-tabbed-request-detail-screen",
      "build-a-compact-mobile-request-form",
      "build-a-reusable-filter-panel",
      "build-a-multi-step-intake-wizard",
      "use-named-formulas-for-app-constants",
      "create-a-reusable-loading-overlay"
    ]
  },
  {
    slug: "sharepoint-backend-starter-kit",
    title: "SharePoint Backend Starter Kit",
    shortDescription: "List design, internal names, permissions, views, indexing, ownership, and support patterns for app backends.",
    patternSlugs: [
      "sharepoint-list-view-threshold-5000-items",
      "send-http-request-to-sharepoint-power-automate",
      "sharepoint-internal-name-safe-column-design",
      "sharepoint-view-indexing-for-large-lists",
      "sharepoint-permissions-request-list-pattern",
      "sharepoint-external-sharing-review-pattern",
      "design-a-facilities-request-list-schema",
      "design-an-it-access-request-list-schema",
      "design-a-training-request-list-schema",
      "design-a-policy-exception-list-schema",
      "document-sharepoint-list-ownership-and-support"
    ]
  },
  {
    slug: "approval-workflow-starter-kit",
    title: "Approval Workflow Starter Kit",
    shortDescription: "Approval routing, SharePoint status sync, escalation, reminders, Teams cards, and audit trail patterns.",
    patternSlugs: [
      "power-automate-approval-with-sharepoint-status-sync",
      "power-automate-start-approval-from-power-apps",
      "power-automate-get-manager-approval-route",
      "power-automate-approval-timeout-escalation",
      "create-an-approval-audit-trail-in-sharepoint",
      "power-automate-trigger-condition-status-changed",
      "route-approvals-by-request-amount",
      "route-approvals-by-risk-severity",
      "send-reminder-emails-for-pending-approvals",
      "handle-cancelled-approvals-with-cleanup"
    ]
  },
  {
    slug: "power-automate-error-handling-kit",
    title: "Power Automate Error Handling Kit",
    shortDescription: "Try/catch scopes, trigger conditions, failed-run triage, ownership transfer, retries, and support models.",
    patternSlugs: [
      "coalesce-empty-null-handling-power-automate",
      "apply-to-each-concurrency-variables-power-automate",
      "power-automate-try-catch-scope-error-handling",
      "power-automate-trigger-condition-status-changed",
      "retry-transient-sharepoint-connector-failures",
      "use-terminate-action-for-controlled-flow-failures",
      "create-a-flow-run-logging-list",
      "handle-duplicate-flow-trigger-runs"
    ]
  },
  {
    slug: "dataverse-app-foundation-pack",
    title: "Dataverse App Foundation Pack",
    shortDescription: "Tables, relationships, choices, security, solution-aware configuration, and SharePoint migration patterns.",
    patternSlugs: [
      "patch-dataverse-lookup-and-choice-columns",
      "dataverse-delegation-filter-search-large-tables",
      "relate-unrelate-dataverse-many-to-many",
      "check-dataverse-security-role-in-canvas-app",
      "dataverse-environment-variables-canvas-apps-flows",
      "solution-publisher-prefix-naming-standard"
    ]
  },
  {
    slug: "solution-deployment-checklist",
    title: "Solution Deployment Checklist",
    shortDescription: "ALM patterns for solution layering, connection references, managed deployments, rollback, and handoff.",
    patternSlugs: [
      "solution-publisher-prefix-naming-standard",
      "connection-references-for-solution-flows",
      "deployment-settings-file-pac-cli",
      "export-import-managed-solution-pac-cli",
      "power-platform-pipelines-dev-test-prod",
      "dataverse-environment-variables-canvas-apps-flows"
    ]
  },
  {
    slug: "power-platform-admin-governance-kit",
    title: "Power Platform Admin Governance Kit",
    shortDescription: "Admin center patterns for environment inventory, connector review, DLP, maker activity, cleanup, and support.",
    patternSlugs: [
      "power-platform-environment-strategy",
      "dlp-policy-connector-groups",
      "export-power-platform-inventory-powershell",
      "find-orphaned-apps-and-flows-powershell",
      "govern-power-automate-service-account-ownership",
      "power-automate-document-flow-inventory"
    ]
  },
  {
    slug: "power-pages-delivery-pack",
    title: "Power Pages Delivery Pack",
    shortDescription: "Portal launch, table permissions, web roles, forms, anonymous access, and publishing governance patterns.",
    patternSlugs: [
      "power-pages-table-permissions-web-roles",
      "power-pages-show-content-by-web-role",
      "power-pages-liquid-fetchxml-list",
      "power-pages-web-api-create-record",
      "patch-dataverse-lookup-and-choice-columns",
      "dataverse-delegation-filter-search-large-tables"
    ]
  },
  {
    slug: "teams-adaptive-card-workflows",
    title: "Teams Adaptive Card Workflows",
    shortDescription: "Teams card patterns for approvals, routing, queue digests, decisions, user mentions, retries, and handoff.",
    patternSlugs: [
      "post-adaptive-card-and-wait-for-response",
      "mention-a-user-in-teams-adaptive-card",
      "adaptive-card-fact-set-from-sharepoint-items",
      "teams-channel-notification-deep-link-to-app",
      "send-teams-cards-for-new-high-priority-issues",
      "parse-adaptive-card-responses-into-decisions",
      "power-automate-teams-notification-for-high-risk"
    ]
  },
  {
    slug: "consultant-delivery-pack",
    title: "Consultant Delivery Pack",
    shortDescription: "Reusable handoff, release, readiness, ownership, and governance patterns for client delivery teams.",
    patternSlugs: [
      "sharepoint-list-template-release-checklist",
      "power-automate-document-flow-inventory",
      "create-a-power-automate-flow-documentation-template",
      "document-sharepoint-list-ownership-and-support",
      "build-a-sharepoint-launch-readiness-checklist",
      "govern-power-automate-service-account-ownership",
      "power-platform-environment-strategy",
      "design-an-operational-handoff-list"
    ]
  },
  {
    slug: "request-management-app-kit",
    title: "Request Management App Kit",
    shortDescription: "Patterns for intake screens, queue views, backend schemas, approvals, confirmation messages, and support handoff.",
    patternSlugs: [
      "build-a-my-requests-view",
      "build-a-queue-dashboard-gallery",
      "build-a-multi-step-intake-wizard",
      "design-a-facilities-request-list-schema",
      "send-requester-confirmation-after-submission",
      "route-approvals-by-request-amount"
    ]
  },
  {
    slug: "notification-and-digest-kit",
    title: "Notification and Digest Kit",
    shortDescription: "Email, Teams, reminder, escalation, digest, throttling, and routing patterns for workflow communication.",
    patternSlugs: [
      "select-union-remove-duplicates-power-automate",
      "convert-time-zone-format-date-power-automate",
      "power-automate-email-html-table",
      "send-reminder-emails-for-pending-approvals",
      "send-digest-emails-for-overdue-actions",
      "send-teams-cards-for-new-high-priority-issues",
      "send-requester-confirmation-after-submission",
      "send-weekly-queue-summary-to-team-leads",
      "send-a-digest-email-grouped-by-owner"
    ]
  },
  {
    slug: "free-starter-patterns",
    title: "Free Starter Patterns",
    shortDescription: "High-value free patterns that demonstrate the BuilderVault style and practical Power Platform depth.",
    patternSlugs: [
      "patch-sharepoint-choice-field",
      "avoid-delegation-warnings-sharepoint-filters",
      "power-automate-email-html-table",
      "sharepoint-internal-name-safe-column-design",
      "power-apps-empty-state-gallery",
      "build-a-my-requests-view",
      "create-a-sharepoint-view-for-aging-requests",
      "forall-patch-multiple-records-power-apps",
      "filter-array-instead-of-apply-to-each"
    ]
  }
];

export function getCollectionBySlug(slug: string) {
  return patternCollections.find((collection) => collection.slug === slug);
}

export function getCollectionPatterns(collection: PatternCollection): Pattern[] {
  return collection.patternSlugs
    .map((slug) => getPublishedPatternBySlug(slug))
    .filter((pattern): pattern is Pattern => Boolean(pattern));
}

export function getSuggestedCollections() {
  const allPatterns = getPublishedPatterns();

  return patternCollections.map((collection) => ({
    ...collection,
    count: collection.patternSlugs.filter((slug) =>
      allPatterns.some((pattern) => pattern.slug === slug)
    ).length
  }));
}

export function getCollectionsForPattern(patternSlug: string) {
  return getSuggestedCollections()
    .filter((collection) => collection.patternSlugs.includes(patternSlug))
    .slice(0, 3);
}
