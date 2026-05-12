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
    slug: "power-apps-patch-patterns",
    title: "Power Apps Patch Patterns",
    shortDescription: "Core patching examples for SharePoint fields, validation, refresh, and save behavior.",
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
      "patch-a-priority-change-with-history-note",
      "patch-a-risk-score-field-from-sliders",
      "patch-a-service-catalog-selection"
    ]
  },
  {
    slug: "sharepoint-governance-starter-kit",
    title: "SharePoint Governance Starter Kit",
    shortDescription: "List design, internal names, permissions, external sharing, and launch readiness patterns.",
    patternSlugs: [
      "sharepoint-internal-name-safe-column-design",
      "sharepoint-view-indexing-for-large-lists",
      "sharepoint-permissions-request-list-pattern",
      "sharepoint-external-sharing-review-pattern",
      "build-a-sharepoint-launch-readiness-checklist",
      "document-sharepoint-list-ownership-and-support",
      "govern-unique-permission-exceptions",
      "document-a-site-owner-review-process",
      "optimize-a-lifecycle-archive-process",
      "build-a-sharepoint-permissions-exception-log",
      "design-a-sharepoint-permission-audit-intake-list",
      "build-a-sharepoint-readiness-assessment-checklist"
    ]
  },
  {
    slug: "pmo-status-reporting-kit",
    title: "PMO Status Reporting Kit",
    shortDescription: "Status rollups, weekly updates, executive summaries, and steering committee decision support.",
    patternSlugs: [
      "pmo-status-report-health-rollup",
      "pmo-executive-summary-from-rough-notes",
      "pmo-weekly-report-email-template",
      "pmo-steering-committee-decision-pack",
      "define-status-report-quality-criteria",
      "create-an-executive-portfolio-one-pager",
      "create-a-monthly-portfolio-health-summary",
      "define-executive-status-color-criteria",
      "create-a-sponsor-ready-project-brief",
      "create-a-red-project-escalation-summary",
      "track-action-item-aging-by-owner",
      "track-portfolio-capacity-risk"
    ]
  },
  {
    slug: "power-automate-approvals",
    title: "Power Automate Approval Pack",
    shortDescription: "Approval routing, status sync, escalation, reminders, and audit trail patterns.",
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
      "troubleshoot-a-conditional-approval-flow"
    ]
  },
  {
    slug: "free-starter-patterns",
    title: "Free Starter Patterns",
    shortDescription: "High-value free patterns that demonstrate the BuilderVault style and practical depth.",
    patternSlugs: [
      "patch-sharepoint-choice-field",
      "avoid-delegation-warnings-sharepoint-filters",
      "power-automate-email-html-table",
      "sharepoint-internal-name-safe-column-design",
      "pmo-weekly-report-email-template",
      "power-apps-empty-state-gallery",
      "build-a-my-requests-view",
      "create-a-sharepoint-view-for-aging-requests",
      "create-a-weekly-pmo-health-review-agenda"
    ]
  },
  {
    slug: "power-apps-app-design-kit",
    title: "Power Apps App Design Kit",
    shortDescription: "Screen, state, dashboard, validation, and UX patterns for building maintainable business apps.",
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
    slug: "sharepoint-list-schema-kit",
    title: "SharePoint List Schema Kit",
    shortDescription: "Ready-to-adapt list schema patterns for intake, operations, governance, and support tracking.",
    patternSlugs: [
      "design-a-facilities-request-list-schema",
      "design-an-it-access-request-list-schema",
      "design-a-training-request-list-schema",
      "design-a-policy-exception-list-schema",
      "design-a-vendor-risk-review-list-schema",
      "design-a-contract-intake-list-schema",
      "design-an-operational-handoff-list",
      "design-a-compliance-evidence-tracker",
      "create-a-site-lifecycle-review",
      "build-a-content-owner-register",
      "validate-a-page-quality-audit",
      "troubleshoot-a-stale-content-cleanup-process"
    ]
  },
  {
    slug: "power-automate-notification-kit",
    title: "Power Automate Notification Kit",
    shortDescription: "Email, Teams, reminder, escalation, and digest patterns for practical workflow communications.",
    patternSlugs: [
      "send-reminder-emails-for-pending-approvals",
      "send-digest-emails-for-overdue-actions",
      "send-teams-cards-for-new-high-priority-issues",
      "send-sponsor-updates-after-gate-approval",
      "send-requester-confirmation-after-submission",
      "send-weekly-queue-summary-to-team-leads",
      "build-a-daily-exception-digest",
      "optimize-a-teams-escalation-notice",
      "create-a-failed-run-triage-process",
      "build-a-flow-ownership-transfer-checklist",
      "standardize-a-notification-throttling-pattern",
      "troubleshoot-a-production-flow-support-model"
    ]
  },
  {
    slug: "pmo-governance-kit",
    title: "PMO Governance Kit",
    shortDescription: "Decision, escalation, dependency, change, readiness, and closeout patterns for PMO operating rhythm.",
    patternSlugs: [
      "build-a-project-raid-review-cadence",
      "define-project-escalation-paths",
      "create-a-dependency-tracker-schema",
      "define-go-no-go-launch-criteria",
      "build-a-change-impact-assessment-template",
      "create-an-operational-readiness-checklist",
      "build-a-portfolio-decision-register",
      "package-a-project-closeout-playbook",
      "create-a-portfolio-intake-calendar",
      "build-a-governance-exception-register",
      "validate-a-benefits-review-board",
      "troubleshoot-a-project-restart-checklist"
    ]
  },
  {
    slug: "workflow-template-packs",
    title: "Workflow Template Packs",
    shortDescription: "Reusable starter workflows for PTO, expense, vendor onboarding, document review, and operational requests.",
    patternSlugs: [
      "build-a-small-business-pto-request-workflow",
      "build-an-expense-reimbursement-request-workflow",
      "create-a-vendor-onboarding-workflow-package",
      "create-a-document-review-library-pattern",
      "build-a-file-naming-standard-flow",
      "build-a-conditional-approval-flow",
      "create-child-tasks-after-approval",
      "create-onboarding-tasks-for-new-vendors"
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
