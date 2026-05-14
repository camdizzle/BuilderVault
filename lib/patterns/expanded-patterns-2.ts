import { buildImplementationSnippet, buildStepInstructions } from "@/lib/patterns/implementation";
import type { Pattern, PatternCategory, PatternDifficulty, PatternPlatform } from "@/types/pattern";

type TopicGroup = {
  category: PatternCategory;
  subCategory: string;
  platform: PatternPlatform[];
  related: string[];
  topics: string[];
};

const groups: TopicGroup[] = [
  {
    category: "Power Apps",
    subCategory: "Patch patterns",
    platform: ["Power Apps", "SharePoint"],
    related: ["patch-sharepoint-choice-field", "power-apps-error-handling-iferror-patch"],
    topics: [
      "Patch SharePoint rich text notes from Power Apps",
      "Patch a generated request number after create",
      "Patch a SharePoint image column from Power Apps",
      "Patch a SharePoint location text bundle",
      "Patch approval metadata from a button",
      "Patch a reopen request action",
      "Patch a cancelled request status with reason",
      "Patch a delegated owner field",
      "Patch a priority change with history note",
      "Patch a due date extension request",
      "Patch a project code lookup safely",
      "Patch a risk score field from sliders",
      "Patch a calculated display summary field",
      "Patch a requester department snapshot",
      "Patch a manager approval comment",
      "Patch a conditional required field set",
      "Patch a related document link field",
      "Patch a training completion acknowledgement",
      "Patch a service catalog selection",
      "Patch a PMO triage assignment",
      "Build a queue dashboard gallery",
      "Build a tabbed request detail screen",
      "Build a compact mobile request form",
      "Build a reusable filter panel",
      "Build a multi-step intake wizard",
      "Build a collection-backed review screen",
      "Build an approval history timeline",
      "Build a requester self-service screen",
      "Build an admin data repair screen",
      "Build a printable request summary",
      "Use a loading state for flow calls",
      "Use a save result variable for navigation",
      "Use app settings for feature flags",
      "Use a local collection for draft attachments",
      "Use clear button states for approvals",
      "Use fallback text for blank people fields",
      "Use a conflict warning after stale edits",
      "Use a reusable validation summary",
      "Use a status transition matrix in Power Apps",
      "Use a read-only review mode before submit"
    ]
  },
  {
    category: "SharePoint",
    subCategory: "List schema design",
    platform: ["SharePoint", "Microsoft 365"],
    related: ["sharepoint-internal-name-safe-column-design", "sharepoint-list-template-release-checklist"],
    topics: [
      "Design a facilities request list schema",
      "Design an IT access request list schema",
      "Design a training request list schema",
      "Design a policy exception list schema",
      "Design a change advisory board list schema",
      "Design a vendor risk review list schema",
      "Design a contract intake list schema",
      "Design an equipment checkout list schema",
      "Design a knowledge article review list",
      "Design a site provisioning request list",
      "Design a document approval register",
      "Design a stakeholder register list",
      "Design a project communications log",
      "Design a lessons learned capture list",
      "Design a meeting decision capture list",
      "Design an operational handoff list",
      "Design a release readiness list",
      "Design a data quality issue list",
      "Design a process improvement backlog",
      "Design a compliance evidence tracker",
      "Create a SharePoint view for overdue approvals",
      "Create a SharePoint view for unassigned work",
      "Create a SharePoint view for sponsor decisions",
      "Create a SharePoint view for blocked projects",
      "Create a SharePoint view for aging requests",
      "Create a SharePoint view for archived records",
      "Create a SharePoint view for upcoming milestones",
      "Create a SharePoint view for external guest review",
      "Create a SharePoint view for missing metadata",
      "Create a SharePoint view for high priority issues",
      "Govern required fields by lifecycle stage",
      "Govern list owners and backup owners",
      "Govern lookup reference list changes",
      "Govern document library default metadata",
      "Govern site page retirement dates",
      "Govern unique permission exceptions",
      "Govern Power Apps connected list changes",
      "Govern Power Automate service account ownership",
      "Govern SharePoint list naming standards",
      "Govern launch communications for site changes"
    ]
  },
  {
    category: "Power Automate",
    subCategory: "Approval workflows",
    platform: ["Power Automate", "SharePoint"],
    related: ["power-automate-approval-with-sharepoint-status-sync", "power-automate-try-catch-scope-error-handling"],
    topics: [
      "Route approvals by request amount",
      "Route approvals by department code",
      "Route approvals by project phase",
      "Route approvals by risk severity",
      "Route approvals by site location",
      "Route approvals by vendor category",
      "Route approvals by document type",
      "Route approvals by budget owner",
      "Route approvals by change impact",
      "Route approvals by support team",
      "Send reminder emails for pending approvals",
      "Send escalation emails for rejected requests",
      "Send digest emails for overdue actions",
      "Send Teams cards for new high priority issues",
      "Send sponsor updates after gate approval",
      "Send requester confirmation after submission",
      "Send PMO summary after status change",
      "Send owner notifications for reassigned work",
      "Send weekly queue summary to team leads",
      "Send exception alerts for missing metadata",
      "Create child tasks after approval",
      "Create planner checklist items from SharePoint",
      "Create folders after project approval",
      "Create document set metadata after intake",
      "Create audit rows for status changes",
      "Create renewal reminders from contract dates",
      "Create recurring review tasks for policies",
      "Create onboarding tasks for new vendors",
      "Create closeout reminders for completed projects",
      "Create risk review tasks for red projects",
      "Parse form response JSON into SharePoint rows",
      "Parse adaptive card responses into decisions",
      "Parse email recipients from a security list",
      "Parse CSV text into SharePoint actions",
      "Parse approval comments into audit notes",
      "Handle missing manager lookup gracefully",
      "Handle empty attachment arrays gracefully",
      "Handle failed Planner task creation",
      "Handle duplicate flow trigger runs",
      "Handle cancelled approvals with cleanup"
    ]
  },
  {
    category: "PMO / Project Management",
    subCategory: "Status reporting",
    platform: ["PMO", "SharePoint"],
    related: ["pmo-status-report-health-rollup", "pmo-risk-issue-action-log-schema"],
    topics: [
      "Create a monthly portfolio health summary",
      "Create a sponsor-ready project brief",
      "Create a project recovery plan outline",
      "Create a red project escalation summary",
      "Create a yellow project watchlist summary",
      "Create a dependency escalation memo",
      "Create a budget variance explanation",
      "Create a schedule slippage narrative",
      "Create a scope change summary",
      "Create a launch readiness summary",
      "Build a portfolio decision register",
      "Build a PMO intake triage board",
      "Build a project prioritization workshop agenda",
      "Build a governance meeting action log",
      "Build a sponsor checkpoint agenda",
      "Build a stakeholder readiness checklist",
      "Build a training rollout checklist",
      "Build a communications readiness checklist",
      "Build a post launch support checklist",
      "Build a benefits measurement plan",
      "Define executive status color criteria",
      "Define risk appetite for project reporting",
      "Define PMO intake acceptance criteria",
      "Define change control approval thresholds",
      "Define project closure acceptance criteria",
      "Define milestone health scoring rules",
      "Define dependency ownership rules",
      "Define issue aging escalation rules",
      "Define decision turnaround expectations",
      "Define sponsor engagement expectations",
      "Track action item aging by owner",
      "Track risks converting into issues",
      "Track decisions waiting on sponsors",
      "Track benefits after operational handoff",
      "Track project assumptions and constraints",
      "Track readiness gaps before launch",
      "Track support transition ownership",
      "Track lessons learned by theme",
      "Track portfolio capacity risk",
      "Track governance exceptions by project"
    ]
  }
];

const categoryDescriptions: Partial<Record<PatternCategory, string>> = {
  "PMO / Project Management": "PMO execution and governance",
  "Power Apps": "Power Apps delivery",
  "Power Automate": "Power Automate workflow delivery",
  SharePoint: "SharePoint information architecture"
};

export const expandedPatterns2: Pattern[] = groups.flatMap((group, groupIndex) =>
  group.topics.map((topic, topicIndex) => {
    const ordinal = groupIndex * 40 + topicIndex;
    const difficulty = difficultyFor(topicIndex);

    return {
      id: `pat-${String(161 + ordinal).padStart(3, "0")}`,
      slug: slugify(topic),
      title: topic,
      shortDescription: `A practical ${group.subCategory.toLowerCase()} pattern for ${categoryDescriptions[group.category]}.`,
      fullDescription: `${topic} provides a repeatable implementation pattern with business context, build guidance, common mistakes, and troubleshooting notes.`,
      category: group.category,
      subCategory: group.subCategory,
      platform: group.platform,
      difficulty,
      tags: buildTags(topic, group),
      isPremium: topicIndex % 3 === 0,
      estimatedTimeSaved: difficulty === "Advanced" ? "1.5 hours" : difficulty === "Intermediate" ? "55 minutes" : "30 minutes",
      problemStatement: `Teams often need ${topic.toLowerCase()} but lose time recreating the same structure without clear ownership, validation, or support notes.`,
      whenToUse: [
        `Use when ${topic.toLowerCase()} is part of a repeatable business process.`,
        "Use when the team needs a clear starter pattern that can be adapted safely.",
        "Use when maintainability and business-readable documentation matter."
      ],
      whenNotToUse: [
        "Avoid when the business process has not been agreed with owners.",
        "Avoid when an enterprise platform already governs this workflow with stricter controls."
      ],
      formulaOrCode: buildImplementationSnippet({ category: group.category, platform: group.platform, subCategory: group.subCategory, title: topic }),
      stepByStepInstructions: buildStepInstructions({ category: group.category, platform: group.platform, subCategory: group.subCategory, title: topic }),
      commonMistakes: [
        "Skipping the ownership model before building the pattern.",
        "Using unstructured text where reporting needs structured fields.",
        "Launching without testing the exception path."
      ],
      troubleshooting: [
        "If the pattern is hard to report on, convert key values into choice, date, person, or lookup fields.",
        "If users do not follow the process, simplify the labels and make the next action more explicit."
      ],
      relatedPatterns: group.related,
      createdAt: "2026-05-10",
      updatedAt: "2026-05-10"
    };
  })
);

function difficultyFor(index: number): PatternDifficulty {
  if (index % 5 === 0) {
    return "Advanced";
  }

  if (index % 2 === 0) {
    return "Intermediate";
  }

  return "Beginner";
}

function buildTags(topic: string, group: TopicGroup) {
  const words = topic
    .split(" ")
    .filter((word) => word.length > 4)
    .slice(0, 2);

  return [...new Set([group.subCategory, ...words, group.category.split(" ")[0]])].slice(0, 4);
}


function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
