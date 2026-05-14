import type { Pattern, PatternCategory, PatternDifficulty, PatternPlatform } from "@/types/pattern";

type ExpansionSpec = {
  topic: string;
  category: PatternCategory;
  subCategory: string;
  platform: PatternPlatform[];
  difficulty: PatternDifficulty;
  tags: string[];
  premium?: boolean;
  related: string[];
};

const specs: ExpansionSpec[] = [
  { topic: "Patch a SharePoint yes/no field from Power Apps", category: "Power Apps", subCategory: "Patch patterns", platform: ["Power Apps", "SharePoint"], difficulty: "Beginner", tags: ["Patch", "Yes No", "Boolean"], related: ["power-apps-error-handling-iferror-patch", "refresh-selected-request-after-patch"] },
  { topic: "Patch a SharePoint currency field", category: "Power Apps", subCategory: "Patch patterns", platform: ["Power Apps", "SharePoint"], difficulty: "Beginner", tags: ["Patch", "Currency", "Validation"], related: ["calculate-totals-gallery-collection", "power-apps-error-handling-iferror-patch"] },
  { topic: "Patch a SharePoint date and time field", category: "Power Apps", subCategory: "Date handling", platform: ["Power Apps", "SharePoint"], difficulty: "Intermediate", tags: ["Patch", "Date", "Time Zone"], premium: true, related: ["delegation-safe-date-range-filter", "power-automate-compose-date-formatting"] },
  { topic: "Validate required fields before Patch", category: "Power Apps", subCategory: "Error handling", platform: ["Power Apps"], difficulty: "Beginner", tags: ["Validation", "Patch", "Notify"], related: ["power-apps-error-handling-iferror-patch", "power-apps-submit-button-disable-while-saving"] },
  { topic: "Build a confirmation dialog before destructive actions", category: "Power Apps", subCategory: "Modal forms", platform: ["Power Apps"], difficulty: "Beginner", tags: ["Modal", "Confirmation", "UX"], related: ["build-modal-edit-form", "soft-delete-sharepoint-items-power-apps"] },
  { topic: "Create a reusable loading overlay", category: "Power Apps", subCategory: "Form mode handling", platform: ["Power Apps"], difficulty: "Beginner", tags: ["Loading", "UX", "Performance"], related: ["power-apps-submit-button-disable-while-saving", "power-apps-empty-state-gallery"] },
  { topic: "Use named formulas for app constants", category: "Power Apps", subCategory: "Collection management", platform: ["Power Apps"], difficulty: "Intermediate", tags: ["Named Formulas", "Maintainability", "Constants"], premium: true, related: ["power-apps-componentized-header-pattern", "sharepoint-choice-taxonomy-governance"] },
  { topic: "Cache reference data on app start", category: "Power Apps", subCategory: "Collection management", platform: ["Power Apps", "SharePoint"], difficulty: "Intermediate", tags: ["Cache", "Collections", "Reference Data"], related: ["power-apps-cascading-dropdowns-sharepoint", "sharepoint-lookup-vs-choice-design"] },
  { topic: "Reset form controls after cancel", category: "Power Apps", subCategory: "Form mode handling", platform: ["Power Apps"], difficulty: "Beginner", tags: ["ResetForm", "Cancel", "Forms"], related: ["power-apps-form-mode-new-edit-view", "build-modal-edit-form"] },
  { topic: "Use a context variable for screen-level edit state", category: "Power Apps", subCategory: "Form mode handling", platform: ["Power Apps"], difficulty: "Intermediate", tags: ["Context Variables", "Edit State", "UX"], premium: true, related: ["power-apps-form-mode-new-edit-view", "power-apps-componentized-header-pattern"] },
  { topic: "Create a reusable notification pattern", category: "Power Apps", subCategory: "Error handling", platform: ["Power Apps"], difficulty: "Beginner", tags: ["Notify", "UX", "Error Handling"], related: ["power-apps-error-handling-iferror-patch", "power-apps-submit-button-disable-while-saving"] },
  { topic: "Filter galleries by current user", category: "Power Apps", subCategory: "Delegation-safe filtering", platform: ["Power Apps", "SharePoint"], difficulty: "Intermediate", tags: ["Current User", "Filter", "Delegation"], related: ["power-apps-current-user-profile-cache", "avoid-delegation-warnings-sharepoint-filters"] },
  { topic: "Build a My Requests view", category: "Power Apps", subCategory: "Delegation-safe filtering", platform: ["Power Apps", "SharePoint"], difficulty: "Beginner", tags: ["My Requests", "Filter", "Dashboard"], related: ["filter-galleries-by-current-user", "power-apps-empty-state-gallery"] },
  { topic: "Create an admin-only maintenance screen", category: "Power Apps", subCategory: "Role-based visibility", platform: ["Power Apps", "SharePoint"], difficulty: "Intermediate", tags: ["Admin", "Roles", "Maintenance"], premium: true, related: ["role-based-button-visibility-sharepoint-security-list", "sharepoint-permissions-request-list-pattern"] },
  { topic: "Use a SharePoint settings list for app configuration", category: "Power Apps", subCategory: "Collection management", platform: ["Power Apps", "SharePoint"], difficulty: "Advanced", tags: ["Settings", "Configuration", "SharePoint"], premium: true, related: ["cache-reference-data-on-app-start", "sharepoint-choice-taxonomy-governance"] },
  { topic: "Build a reusable approval comments panel", category: "Power Apps", subCategory: "Modal forms", platform: ["Power Apps", "SharePoint"], difficulty: "Intermediate", tags: ["Approvals", "Comments", "Modal"], related: ["build-modal-edit-form", "build-pmo-gate-approval-lifecycle"] },
  { topic: "Track unsaved changes before navigation", category: "Power Apps", subCategory: "Form mode handling", platform: ["Power Apps"], difficulty: "Advanced", tags: ["Unsaved Changes", "Navigation", "UX"], premium: true, related: ["power-apps-save-draft-submit-later", "power-apps-submit-button-disable-while-saving"] },
  { topic: "Create dependent checklist rows from a template", category: "Power Apps", subCategory: "Collection management", platform: ["Power Apps", "SharePoint"], difficulty: "Advanced", tags: ["Checklist", "Templates", "Child List"], premium: true, related: ["create-sharepoint-item-and-child-tasks", "patch-collection-checklist-items"] },
  { topic: "Use Concat to summarize selected rows", category: "Power Apps", subCategory: "Collection management", platform: ["Power Apps"], difficulty: "Beginner", tags: ["Concat", "Gallery", "Summary"], related: ["calculate-totals-gallery-collection", "power-apps-gallery-inline-edit-save"] },
  { topic: "Build a compact Power Apps audit note", category: "Power Apps", subCategory: "Error handling", platform: ["Power Apps", "SharePoint"], difficulty: "Intermediate", tags: ["Audit", "Patch", "History"], related: ["soft-delete-sharepoint-items-power-apps", "power-apps-error-handling-iferror-patch"] },
  { topic: "Create a SharePoint list for reusable app reference data", category: "SharePoint", subCategory: "List schema design", platform: ["SharePoint", "Power Apps"], difficulty: "Beginner", tags: ["Reference Data", "List Schema", "Governance"], related: ["sharepoint-lookup-vs-choice-design", "power-apps-cascading-dropdowns-sharepoint"] },
  { topic: "Design a SharePoint audit history list", category: "SharePoint", subCategory: "List schema design", platform: ["SharePoint", "Power Apps", "Power Automate"], difficulty: "Intermediate", tags: ["Audit", "History", "Governance"], premium: true, related: ["build-a-compact-power-apps-audit-note", "sharepoint-list-template-release-checklist"] },
  { topic: "Create a SharePoint environment inventory", category: "SharePoint", subCategory: "Permissions and governance", platform: ["SharePoint", "Microsoft 365"], difficulty: "Intermediate", tags: ["Inventory", "Governance", "Sites"], related: ["sharepoint-hub-site-content-ownership", "sharepoint-external-sharing-review-pattern"] },
  { topic: "Document SharePoint list ownership and support", category: "SharePoint", subCategory: "Permissions and governance", platform: ["SharePoint"], difficulty: "Beginner", tags: ["Ownership", "Support", "Governance"], related: ["sharepoint-list-template-release-checklist", "power-automate-document-flow-inventory"] },
  { topic: "Use managed metadata vs choice fields", category: "SharePoint", subCategory: "List schema design", platform: ["SharePoint", "Microsoft 365"], difficulty: "Advanced", tags: ["Managed Metadata", "Choice", "Taxonomy"], premium: true, related: ["sharepoint-lookup-vs-choice-design", "sharepoint-choice-taxonomy-governance"] },
  { topic: "Create a SharePoint project workspace template", category: "SharePoint", subCategory: "Site navigation patterns", platform: ["SharePoint", "PMO"], difficulty: "Intermediate", tags: ["Project Workspace", "Template", "PMO"], related: ["sharepoint-site-navigation-for-business-apps", "sharepoint-document-library-metadata-pattern"] },
  { topic: "Build a SharePoint issue list view set", category: "SharePoint", subCategory: "List schema design", platform: ["SharePoint", "PMO"], difficulty: "Beginner", tags: ["Issues", "Views", "PMO"], related: ["pmo-risk-issue-action-log-schema", "sharepoint-view-indexing-for-large-lists"] },
  { topic: "Create a default view for active work only", category: "SharePoint", subCategory: "List schema design", platform: ["SharePoint"], difficulty: "Beginner", tags: ["Views", "Archive", "Filter"], related: ["soft-delete-sharepoint-items-power-apps", "sharepoint-view-indexing-for-large-lists"] },
  { topic: "Govern SharePoint list version history", category: "SharePoint", subCategory: "Permissions and governance", platform: ["SharePoint"], difficulty: "Intermediate", tags: ["Version History", "Governance", "Audit"], premium: true, related: ["design-a-sharepoint-audit-history-list", "sharepoint-list-template-release-checklist"] },
  { topic: "Create a document review library pattern", category: "SharePoint", subCategory: "Document library patterns", platform: ["SharePoint", "Power Automate"], difficulty: "Intermediate", tags: ["Document Review", "Metadata", "Approvals"], related: ["sharepoint-document-library-metadata-pattern", "power-automate-approval-with-sharepoint-status-sync"] },
  { topic: "Use SharePoint content types for project artifacts", category: "SharePoint", subCategory: "Document library patterns", platform: ["SharePoint", "PMO"], difficulty: "Advanced", tags: ["Content Types", "Documents", "PMO"], premium: true, related: ["sharepoint-document-library-metadata-pattern", "create-a-sharepoint-project-workspace-template"] },
  { topic: "Build a SharePoint launch readiness checklist", category: "SharePoint", subCategory: "Permissions and governance", platform: ["SharePoint", "Power Apps", "Power Automate"], difficulty: "Intermediate", tags: ["Launch", "Checklist", "Governance"], related: ["sharepoint-list-template-release-checklist", "sharepoint-external-sharing-review-pattern"] },
  { topic: "Create an intranet page review workflow", category: "SharePoint", subCategory: "Site navigation patterns", platform: ["SharePoint", "Power Automate"], difficulty: "Intermediate", tags: ["Intranet", "Review", "Workflow"], premium: true, related: ["sharepoint-hub-site-content-ownership", "power-automate-reminder-before-due-date"] },
  { topic: "Build a SharePoint permissions exception log", category: "SharePoint", subCategory: "Permissions and governance", platform: ["SharePoint"], difficulty: "Advanced", tags: ["Permissions", "Exception Log", "Security"], premium: true, related: ["sharepoint-permissions-request-list-pattern", "sharepoint-external-sharing-review-pattern"] },
  { topic: "Use view formatting for overdue items", category: "SharePoint", subCategory: "JSON column formatting", platform: ["SharePoint"], difficulty: "Intermediate", tags: ["JSON Formatting", "Due Date", "Views"], related: ["sharepoint-json-status-pill-formatting", "power-automate-reminder-before-due-date"] },
  { topic: "Create a SharePoint vendor onboarding list", category: "SharePoint", subCategory: "List schema design", platform: ["SharePoint", "Power Apps"], difficulty: "Intermediate", tags: ["Vendor", "Onboarding", "List Schema"], related: ["sharepoint-list-schema-for-project-intake", "create-a-sharepoint-list-for-reusable-app-reference-data"] },
  { topic: "Create adaptive approval emails", category: "Power Automate", subCategory: "Email formatting", platform: ["Power Automate", "SharePoint"], difficulty: "Intermediate", tags: ["Approvals", "Email", "Adaptive Content"], related: ["power-automate-html-email-button-link", "power-automate-approval-with-sharepoint-status-sync"] },
  { topic: "Send a digest email grouped by owner", category: "Power Automate", subCategory: "Email formatting", platform: ["Power Automate", "SharePoint"], difficulty: "Advanced", tags: ["Digest", "Email", "Owner"], premium: true, related: ["power-automate-email-html-table", "power-automate-reminder-before-due-date"] },
  { topic: "Create a flow run logging list", category: "Power Automate", subCategory: "Flow documentation", platform: ["Power Automate", "SharePoint"], difficulty: "Intermediate", tags: ["Logging", "Flow", "Support"], related: ["power-automate-try-catch-scope-error-handling", "power-automate-document-flow-inventory"] },
  { topic: "Use child flows for shared notification logic", category: "Power Automate", subCategory: "Flow documentation", platform: ["Power Automate"], difficulty: "Advanced", tags: ["Child Flow", "Reuse", "Notifications"], premium: true, related: ["power-automate-try-catch-scope-error-handling", "create-a-flow-run-logging-list"] },
  { topic: "Build a scheduled stale item cleanup flow", category: "Power Automate", subCategory: "SharePoint item updates", platform: ["Power Automate", "SharePoint"], difficulty: "Intermediate", tags: ["Scheduled Flow", "Cleanup", "Archive"], related: ["soft-delete-sharepoint-items-power-apps", "power-automate-reminder-before-due-date"] },
  { topic: "Route work based on SharePoint choice value", category: "Power Automate", subCategory: "Approval workflows", platform: ["Power Automate", "SharePoint"], difficulty: "Beginner", tags: ["Routing", "Choice", "Condition"], related: ["sharepoint-choice-taxonomy-governance", "power-automate-approval-with-sharepoint-status-sync"] },
  { topic: "Use switch control for status-based flow paths", category: "Power Automate", subCategory: "Compose expressions", platform: ["Power Automate", "SharePoint"], difficulty: "Beginner", tags: ["Switch", "Status", "Flow"], related: ["route-work-based-on-sharepoint-choice-value", "power-automate-trigger-condition-status-changed"] },
  { topic: "Parse semicolon-separated emails into recipients", category: "Power Automate", subCategory: "Compose expressions", platform: ["Power Automate"], difficulty: "Intermediate", tags: ["Email", "Recipients", "Expressions"], related: ["power-automate-html-email-button-link", "power-automate-email-html-table"] },
  { topic: "Create an approval audit trail in SharePoint", category: "Power Automate", subCategory: "Approval workflows", platform: ["Power Automate", "SharePoint"], difficulty: "Intermediate", tags: ["Approvals", "Audit", "SharePoint"], premium: true, related: ["power-automate-approval-with-sharepoint-status-sync", "design-a-sharepoint-audit-history-list"] },
  { topic: "Retry transient SharePoint connector failures", category: "Power Automate", subCategory: "Error handling", platform: ["Power Automate", "SharePoint"], difficulty: "Advanced", tags: ["Retry", "Error Handling", "Connector"], premium: true, related: ["power-automate-try-catch-scope-error-handling", "power-automate-sharepoint-update-item-with-etag-awareness"] },
  { topic: "Use terminate action for controlled flow failures", category: "Power Automate", subCategory: "Error handling", platform: ["Power Automate"], difficulty: "Intermediate", tags: ["Terminate", "Error Handling", "Support"], related: ["power-automate-try-catch-scope-error-handling", "create-a-flow-run-logging-list"] },
  { topic: "Build a file naming standard flow", category: "Power Automate", subCategory: "SharePoint item updates", platform: ["Power Automate", "SharePoint"], difficulty: "Intermediate", tags: ["Files", "Naming", "Document Library"], premium: true, related: ["sharepoint-document-library-metadata-pattern", "create-a-document-review-library-pattern"] },
  { topic: "Notify when a project health turns red", category: "Power Automate", subCategory: "Email formatting", platform: ["Power Automate", "SharePoint", "PMO"], difficulty: "Intermediate", tags: ["Status", "Teams", "PMO"], related: ["power-automate-teams-notification-for-high-risk", "pmo-status-report-health-rollup"] },
  { topic: "Create monthly portfolio summary emails", category: "Power Automate", subCategory: "Email formatting", platform: ["Power Automate", "SharePoint", "PMO"], difficulty: "Advanced", tags: ["Portfolio", "Digest", "Executive Reporting"], premium: true, related: ["pmo-weekly-report-email-template", "pmo-status-report-health-rollup"] },
  { topic: "Create a project charter checklist", category: "PMO / Project Management", subCategory: "Deliverables/checklists", platform: ["PMO", "SharePoint"], difficulty: "Beginner", tags: ["Charter", "Checklist", "PMO"], related: ["sharepoint-list-schema-for-project-intake", "pmo-project-closeout-checklist"] },
  { topic: "Define project sponsor responsibilities", category: "PMO / Project Management", subCategory: "Executive reporting", platform: ["PMO"], difficulty: "Beginner", tags: ["Sponsor", "Governance", "PMO"], related: ["pmo-steering-committee-decision-pack", "pmo-decision-log-sharepoint-pattern"] },
  { topic: "Create a stakeholder communication matrix", category: "PMO / Project Management", subCategory: "Executive reporting", platform: ["PMO"], difficulty: "Intermediate", tags: ["Stakeholders", "Communication", "PMO"], related: ["pmo-weekly-report-email-template", "pmo-executive-summary-from-rough-notes"] },
  { topic: "Build a project RAID review cadence", category: "PMO / Project Management", subCategory: "Risk and issue tracking", platform: ["PMO"], difficulty: "Intermediate", tags: ["RAID", "Cadence", "Governance"], related: ["pmo-risk-issue-action-log-schema", "pmo-risk-escalation-thresholds"] },
  { topic: "Create a weekly PMO health review agenda", category: "PMO / Project Management", subCategory: "Status reporting", platform: ["PMO"], difficulty: "Beginner", tags: ["Agenda", "Status Reporting", "PMO"], related: ["pmo-status-report-health-rollup", "pmo-weekly-report-email-template"] },
  { topic: "Define project escalation paths", category: "PMO / Project Management", subCategory: "Gate approvals", platform: ["PMO"], difficulty: "Intermediate", tags: ["Escalation", "Governance", "Decisions"], premium: true, related: ["pmo-risk-escalation-thresholds", "pmo-steering-committee-decision-pack"] },
  { topic: "Create a dependency tracker schema", category: "PMO / Project Management", subCategory: "Risk and issue tracking", platform: ["PMO", "SharePoint"], difficulty: "Intermediate", tags: ["Dependencies", "Schema", "PMO"], related: ["pmo-risk-issue-action-log-schema", "pmo-milestone-baseline-tracking"] },
  { topic: "Build a deliverable acceptance checklist", category: "PMO / Project Management", subCategory: "Deliverables/checklists", platform: ["PMO"], difficulty: "Beginner", tags: ["Acceptance", "Deliverables", "Checklist"], related: ["pmo-project-closeout-checklist", "recalculate-deliverable-completion-checklist-rows"] },
  { topic: "Create a project onboarding checklist", category: "PMO / Project Management", subCategory: "Deliverables/checklists", platform: ["PMO", "SharePoint"], difficulty: "Beginner", tags: ["Onboarding", "Checklist", "PMO"], related: ["create-a-project-charter-checklist", "sharepoint-document-library-metadata-pattern"] },
  { topic: "Define status report quality criteria", category: "PMO / Project Management", subCategory: "Status reporting", platform: ["PMO"], difficulty: "Intermediate", tags: ["Status Reporting", "Quality", "PMO"], related: ["pmo-executive-summary-from-rough-notes", "pmo-status-report-health-rollup"] },
  { topic: "Create executive risk narrative guidance", category: "PMO / Project Management", subCategory: "Executive reporting", platform: ["PMO"], difficulty: "Intermediate", tags: ["Risks", "Executive Reporting", "Writing"], premium: true, related: ["pmo-risk-escalation-thresholds", "pmo-executive-summary-from-rough-notes"] },
  { topic: "Build a PMO lessons learned library", category: "PMO / Project Management", subCategory: "Deliverables/checklists", platform: ["PMO", "SharePoint"], difficulty: "Intermediate", tags: ["Lessons Learned", "Library", "PMO"], related: ["pmo-project-closeout-checklist", "sharepoint-document-library-metadata-pattern"] },
  { topic: "Create a portfolio capacity snapshot", category: "PMO / Project Management", subCategory: "Executive reporting", platform: ["PMO", "SharePoint"], difficulty: "Advanced", tags: ["Capacity", "Portfolio", "Executive Reporting"], premium: true, related: ["pmo-intake-scoring-model", "pmo-benefits-realization-tracker"] },
  { topic: "Define go no-go launch criteria", category: "PMO / Project Management", subCategory: "Gate approvals", platform: ["PMO"], difficulty: "Intermediate", tags: ["Launch", "Gate", "Checklist"], related: ["build-pmo-gate-approval-lifecycle", "build-a-sharepoint-launch-readiness-checklist"] },
  { topic: "Create a lightweight benefits review agenda", category: "PMO / Project Management", subCategory: "Executive reporting", platform: ["PMO"], difficulty: "Intermediate", tags: ["Benefits", "Agenda", "Value"], premium: true, related: ["pmo-benefits-realization-tracker", "pmo-steering-committee-decision-pack"] },
  { topic: "Build a change impact assessment template", category: "PMO / Project Management", subCategory: "Gate approvals", platform: ["PMO"], difficulty: "Intermediate", tags: ["Change Request", "Impact", "Template"], related: ["pmo-change-request-lifecycle", "pmo-steering-committee-decision-pack"] },
  { topic: "Create an executive portfolio one-pager", category: "PMO / Project Management", subCategory: "Executive reporting", platform: ["PMO"], difficulty: "Advanced", tags: ["Portfolio", "Executive Reporting", "One Pager"], premium: true, related: ["pmo-status-report-health-rollup", "create-monthly-portfolio-summary-emails"] },
  { topic: "Document an app support handoff plan", category: "PMO / Project Management", subCategory: "Deliverables/checklists", platform: ["PMO", "SharePoint"], difficulty: "Intermediate", tags: ["Support", "Handoff", "Checklist"], related: ["pmo-project-closeout-checklist", "power-automate-document-flow-inventory"] },
  { topic: "Create an operational readiness checklist", category: "PMO / Project Management", subCategory: "Deliverables/checklists", platform: ["PMO"], difficulty: "Intermediate", tags: ["Operational Readiness", "Checklist", "Launch"], related: ["define-go-no-go-launch-criteria", "pmo-project-closeout-checklist"] },
  { topic: "Build a small business PTO request workflow", category: "Power Automate", subCategory: "Approval workflows", platform: ["Power Apps", "SharePoint", "Power Automate"], difficulty: "Intermediate", tags: ["PTO", "Approvals", "Workflow"], related: ["power-automate-start-approval-from-power-apps", "sharepoint-list-schema-for-project-intake"] },
  { topic: "Build an expense reimbursement request workflow", category: "Power Automate", subCategory: "Approval workflows", platform: ["Power Apps", "SharePoint", "Power Automate"], difficulty: "Intermediate", tags: ["Expense", "Approvals", "Workflow"], premium: true, related: ["power-automate-get-manager-approval-route", "patch-a-sharepoint-currency-field"] },
  { topic: "Create a vendor onboarding workflow package", category: "Power Automate", subCategory: "Approval workflows", platform: ["Power Apps", "SharePoint", "Power Automate"], difficulty: "Advanced", tags: ["Vendor", "Onboarding", "Workflow"], premium: true, related: ["create-a-sharepoint-vendor-onboarding-list", "power-automate-approval-with-sharepoint-status-sync"] },
  { topic: "Create a meeting notes to action tracker", category: "PMO / Project Management", subCategory: "Risk and issue tracking", platform: ["PMO", "SharePoint"], difficulty: "Intermediate", tags: ["Meeting Notes", "Actions", "Decisions"], related: ["pmo-action-item-owner-due-date-discipline", "pmo-decision-log-sharepoint-pattern"] },
  { topic: "Design a SharePoint permission audit intake list", category: "SharePoint", subCategory: "Permissions and governance", platform: ["SharePoint", "Microsoft 365"], difficulty: "Advanced", tags: ["Permissions", "Audit", "Governance"], premium: true, related: ["build-a-sharepoint-permissions-exception-log", "sharepoint-external-sharing-review-pattern"] },
  { topic: "Create a Power Automate flow documentation template", category: "Power Automate", subCategory: "Flow documentation", platform: ["Power Automate"], difficulty: "Intermediate", tags: ["Flow Documentation", "Template", "Support"], related: ["power-automate-document-flow-inventory", "create-a-flow-run-logging-list"] },
  { topic: "Build a SharePoint readiness assessment checklist", category: "SharePoint", subCategory: "Permissions and governance", platform: ["SharePoint", "Microsoft 365"], difficulty: "Intermediate", tags: ["Readiness", "Assessment", "Governance"], premium: true, related: ["build-a-sharepoint-launch-readiness-checklist", "create-a-sharepoint-environment-inventory"] },
  { topic: "Create a Power Apps formula pack outline", category: "Power Apps", subCategory: "Patch patterns", platform: ["Power Apps"], difficulty: "Beginner", tags: ["Formula Pack", "Patch", "Templates"], related: ["patch-sharepoint-choice-field", "patch-sharepoint-people-picker-power-apps"] },
  { topic: "Design a SharePoint list schema export checklist", category: "SharePoint", subCategory: "List schema design", platform: ["SharePoint"], difficulty: "Intermediate", tags: ["List Schema", "Export", "Documentation"], related: ["sharepoint-internal-name-safe-column-design", "sharepoint-list-template-release-checklist"] },
  { topic: "Create a 3D print pricing calculator schema", category: "PMO / Project Management", subCategory: "Executive reporting", platform: ["PMO"], difficulty: "Beginner", tags: ["Pricing", "Calculator", "Small Business"], related: ["pmo-benefits-realization-tracker", "pmo-intake-scoring-model"] },
  { topic: "Create an Etsy listing workflow checklist", category: "PMO / Project Management", subCategory: "Deliverables/checklists", platform: ["PMO"], difficulty: "Beginner", tags: ["Etsy", "Workflow", "Checklist"], related: ["pmo-action-item-owner-due-date-discipline", "pmo-project-closeout-checklist"] }
];

const categoryDescriptions: Partial<Record<PatternCategory, string>> = {
  "PMO / Project Management": "project governance and reporting",
  "Power Apps": "canvas app implementation",
  "Power Automate": "flow automation",
  SharePoint: "SharePoint solution design"
};

export const expandedPatterns: Pattern[] = specs.map((spec, index) => {
  const idNumber = index + 81;
  const slug = slugify(spec.topic);
  const primaryPlatform = spec.platform[0];

  return {
    id: `pat-${String(idNumber).padStart(3, "0")}`,
    slug,
    title: spec.topic,
    shortDescription: `A practical ${spec.subCategory.toLowerCase()} pattern for ${categoryDescriptions[spec.category] ?? "Power Platform delivery"}.`,
    fullDescription: `${spec.topic} gives builders a repeatable starting point with implementation guidance, common mistakes, and troubleshooting notes for real-world ${categoryDescriptions[spec.category]} work.`,
    category: spec.category,
    subCategory: spec.subCategory,
    platform: spec.platform,
    difficulty: spec.difficulty,
    tags: spec.tags,
    isPremium: Boolean(spec.premium),
    estimatedTimeSaved: spec.difficulty === "Advanced" ? "1.5 hours" : spec.difficulty === "Intermediate" ? "50 minutes" : "25 minutes",
    problemStatement: `Teams often rebuild this ${spec.subCategory.toLowerCase()} solution from scratch, which creates inconsistent behavior and avoidable support issues.`,
    whenToUse: [
      `Use when building ${spec.subCategory.toLowerCase()} capabilities in ${primaryPlatform}.`,
      "Use when the team needs a repeatable implementation pattern instead of one-off notes.",
      "Use when supportability, clear ownership, and business-readable behavior matter."
    ],
    whenNotToUse: [
      "Avoid when the process is still too undefined to standardize.",
      "Avoid when tenant policy, compliance, or licensing requires a different approved architecture."
    ],
    formulaOrCode: buildFormula(spec),
    stepByStepInstructions: [
      "Confirm the business scenario and owner before building.",
      "Create the supporting SharePoint fields, app controls, flow steps, or PMO template sections.",
      "Test with a realistic example and at least one edge case.",
      "Document the expected behavior so future maintainers know what the pattern owns."
    ],
    commonMistakes: [
      "Building the pattern before naming the owner and lifecycle.",
      "Using display labels where stable IDs, internal names, or structured fields are needed.",
      "Skipping error, empty-state, or exception handling until after launch."
    ],
    troubleshooting: [
      "If results look inconsistent, inspect the source data shape and compare it to the fields used by the pattern.",
      "If users are confused, simplify the status labels, ownership fields, or action text before adding more automation."
    ],
    relatedPatterns: spec.related,
    createdAt: "2026-05-10",
    updatedAt: "2026-05-10"
  };
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildFormula(spec: ExpansionSpec) {
  if (spec.category === "Power Apps") {
    return `// ${spec.topic}\nIfError(\n    /* Add ${spec.subCategory} implementation here */,\n    Notify(\"The action could not be completed.\", NotificationType.Error),\n    Notify(\"Action completed.\", NotificationType.Success)\n)`;
  }

  if (spec.category === "Power Automate") {
    return `Flow outline:\nTrigger -> Validate inputs -> Apply ${spec.subCategory} logic -> Update SharePoint or notify stakeholders -> Log outcome`;
  }

  if (spec.category === "SharePoint") {
    return `Recommended structure:\nPurpose, Owner, Key fields, Default views, Permissions, Review cadence, Support notes`;
  }

  return `Template sections:\nPurpose, Owner, Current state, Decision or action needed, Status, Due date, Follow-up notes`;
}
