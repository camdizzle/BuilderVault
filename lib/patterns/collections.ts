import type { Pattern } from "@/types/pattern";
import { getAllPatterns, getPatternBySlug } from "@/lib/patterns/patterns";

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
      "avoid-delegation-warnings-sharepoint-filters",
      "build-a-queue-dashboard-gallery",
      "build-a-reusable-filter-panel",
      "optimize-a-screen-performance-review",
      "validate-a-delegation-review-worksheet",
      "document-a-delegation-review-worksheet",
      "troubleshoot-a-delegation-review-worksheet"
    ]
  },
  {
    slug: "power-apps-app-design-kit",
    title: "Power Apps App Design Kit",
    shortDescription: "Screen, state, dashboard, validation, command, and UX patterns for maintainable business apps.",
    patternSlugs: [
      "build-a-queue-dashboard-gallery",
      "build-a-tabbed-request-detail-screen",
      "build-a-compact-mobile-request-form",
      "build-a-reusable-filter-panel",
      "build-a-multi-step-intake-wizard",
      "build-a-request-escalation-screen",
      "configure-a-role-aware-dashboard",
      "standardize-a-reusable-app-settings-panel",
      "create-a-maker-handoff-checklist",
      "build-a-formula-review-checklist",
      "optimize-a-screen-performance-review",
      "troubleshoot-a-reusable-command-bar"
    ]
  },
  {
    slug: "sharepoint-backend-starter-kit",
    title: "SharePoint Backend Starter Kit",
    shortDescription: "List design, internal names, permissions, views, indexing, ownership, and support patterns for app backends.",
    patternSlugs: [
      "sharepoint-internal-name-safe-column-design",
      "sharepoint-view-indexing-for-large-lists",
      "sharepoint-permissions-request-list-pattern",
      "sharepoint-external-sharing-review-pattern",
      "design-a-facilities-request-list-schema",
      "design-an-it-access-request-list-schema",
      "design-a-training-request-list-schema",
      "design-a-policy-exception-list-schema",
      "document-sharepoint-list-ownership-and-support",
      "create-a-site-lifecycle-review",
      "build-a-content-owner-register",
      "troubleshoot-a-stale-content-cleanup-process"
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
      "handle-cancelled-approvals-with-cleanup",
      "build-a-conditional-approval-flow",
      "create-an-adaptive-card-approval-summary"
    ]
  },
  {
    slug: "power-automate-error-handling-kit",
    title: "Power Automate Error Handling Kit",
    shortDescription: "Try/catch scopes, trigger conditions, failed-run triage, ownership transfer, retries, and support models.",
    patternSlugs: [
      "power-automate-try-catch-scope-error-handling",
      "power-automate-trigger-condition-status-changed",
      "create-a-failed-run-triage-process",
      "build-a-flow-ownership-transfer-checklist",
      "troubleshoot-a-production-flow-support-model",
      "create-a-card-retry-and-timeout-path",
      "validate-a-card-retry-and-timeout-path"
    ]
  },
  {
    slug: "dataverse-app-foundation-pack",
    title: "Dataverse App Foundation Pack",
    shortDescription: "Tables, relationships, choices, security, solution-aware configuration, and SharePoint migration patterns.",
    patternSlugs: [
      "create-a-dataverse-table-naming-standard",
      "build-a-request-table-schema",
      "design-a-lookup-relationship-model",
      "configure-a-choice-column-strategy",
      "standardize-a-business-rule-checklist",
      "validate-a-security-role-matrix",
      "document-an-environment-variable-register",
      "optimize-a-solution-aware-data-model",
      "troubleshoot-a-sharepoint-to-dataverse-migration-path"
    ]
  },
  {
    slug: "solution-deployment-checklist",
    title: "Solution Deployment Checklist",
    shortDescription: "ALM patterns for solution layering, connection references, managed deployments, rollback, and handoff.",
    patternSlugs: [
      "create-a-solution-layering-checklist",
      "build-an-environment-strategy-guide",
      "design-a-deployment-readiness-review",
      "configure-a-connection-reference-inventory",
      "standardize-an-unmanaged-customizations-cleanup-plan",
      "validate-a-release-notes-template",
      "document-a-maker-handoff-package",
      "optimize-a-managed-solution-promotion-path",
      "troubleshoot-a-rollback-decision-checklist"
    ]
  },
  {
    slug: "power-platform-admin-governance-kit",
    title: "Power Platform Admin Governance Kit",
    shortDescription: "Admin center patterns for environment inventory, connector review, DLP, maker activity, cleanup, and support.",
    patternSlugs: [
      "create-an-environment-inventory",
      "build-a-connector-review-process",
      "design-a-data-loss-prevention-policy-checklist",
      "configure-a-maker-activity-review",
      "standardize-an-orphaned-app-cleanup-process",
      "validate-a-premium-connector-exception-register",
      "document-a-tenant-settings-review",
      "optimize-a-capacity-monitoring-checklist",
      "troubleshoot-a-center-of-excellence-triage-view"
    ]
  },
  {
    slug: "power-pages-delivery-pack",
    title: "Power Pages Delivery Pack",
    shortDescription: "Portal launch, table permissions, web roles, forms, anonymous access, and publishing governance patterns.",
    patternSlugs: [
      "create-a-public-intake-portal-checklist",
      "build-a-portal-table-permission-model",
      "design-a-web-role-matrix",
      "configure-a-basic-form-validation-plan",
      "standardize-a-portal-content-publishing-workflow",
      "validate-a-dataverse-backed-contact-experience",
      "document-a-site-launch-readiness-review",
      "troubleshoot-an-anonymous-access-risk-checklist"
    ]
  },
  {
    slug: "teams-adaptive-card-workflows",
    title: "Teams Adaptive Card Workflows",
    shortDescription: "Teams card patterns for approvals, routing, queue digests, decisions, user mentions, retries, and handoff.",
    patternSlugs: [
      "create-an-adaptive-card-approval-summary",
      "build-a-teams-notification-routing-rule",
      "design-a-channel-based-exception-alert",
      "configure-a-manager-response-card",
      "standardize-a-queue-digest-card",
      "validate-a-decision-capture-card",
      "document-a-user-mention-notification-pattern",
      "optimize-a-teams-handoff-message-template",
      "govern-a-card-schema-versioning-checklist"
    ]
  },
  {
    slug: "consultant-delivery-pack",
    title: "Consultant Delivery Pack",
    shortDescription: "Reusable handoff, release, readiness, ownership, and governance patterns for client delivery teams.",
    patternSlugs: [
      "create-a-maker-handoff-checklist",
      "document-a-maker-handoff-package",
      "build-a-flow-ownership-transfer-checklist",
      "validate-a-release-notes-template",
      "design-a-deployment-readiness-review",
      "configure-a-production-support-ownership-model",
      "document-a-production-support-ownership-model",
      "govern-a-managed-solution-promotion-path"
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
      "build-a-request-table-schema",
      "send-requester-confirmation-after-submission",
      "route-approvals-by-request-amount",
      "create-a-support-intake-queue"
    ]
  },
  {
    slug: "notification-and-digest-kit",
    title: "Notification and Digest Kit",
    shortDescription: "Email, Teams, reminder, escalation, digest, throttling, and routing patterns for workflow communication.",
    patternSlugs: [
      "power-automate-email-html-table",
      "send-reminder-emails-for-pending-approvals",
      "send-digest-emails-for-overdue-actions",
      "send-teams-cards-for-new-high-priority-issues",
      "send-requester-confirmation-after-submission",
      "send-weekly-queue-summary-to-team-leads",
      "build-a-daily-exception-digest",
      "standardize-a-notification-throttling-pattern",
      "build-a-teams-notification-routing-rule"
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
      "create-a-dataverse-table-naming-standard",
      "build-a-connector-review-process",
      "create-an-adaptive-card-approval-summary"
    ]
  }
];

export function getCollectionBySlug(slug: string) {
  return patternCollections.find((collection) => collection.slug === slug);
}

export function getCollectionPatterns(collection: PatternCollection): Pattern[] {
  return collection.patternSlugs
    .map((slug) => getPatternBySlug(slug))
    .filter((pattern): pattern is Pattern => Boolean(pattern));
}

export function getSuggestedCollections() {
  const allPatterns = getAllPatterns();

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
