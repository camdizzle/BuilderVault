export type PmoToolBlueprint = {
  name: string;
  purpose: string;
  powerPlatformBuild: string[];
  automations: string[];
  reporting: string[];
};

export type PmoLifecycleStage = {
  slug: string;
  title: string;
  summary: string;
  outcome: string;
  businessProblem: string;
  coreLists: string[];
  portals: PmoToolBlueprint[];
  powerBi: string[];
  implementationRoadmap: string[];
  governanceNotes: string[];
};

export const pmoLifecycleStages: PmoLifecycleStage[] = [
  {
    slug: "intake-and-triage",
    title: "Intake and triage",
    summary: "Capture demand in one place, score it consistently, and route it to the right reviewers before work becomes shadow delivery.",
    outcome: "A lightweight portfolio intake portal with request scoring, approval routing, communications, and a decision log.",
    businessProblem: "Small PMO teams often receive requests through email, Teams chats, spreadsheets, and hallway conversations. The first tool should make demand visible without forcing a million-dollar enterprise platform rollout.",
    coreLists: ["Intake Requests", "Business Sponsors", "Scoring Criteria", "Triage Decisions", "Approval History", "Communication Log"],
    portals: [
      {
        name: "Intake Portal",
        purpose: "Let business users submit new project, enhancement, automation, reporting, and process-improvement requests.",
        powerPlatformBuild: ["Power Pages or canvas app request form", "SharePoint or Dataverse request table", "role-based views for submitters, triage team, and sponsors", "attachment area for business case files"],
        automations: ["submission confirmation", "triage team notification", "missing-info request workflow", "score threshold routing"],
        reporting: ["new requests by month", "requests by department", "average triage time", "demand by category"]
      },
      {
        name: "Triage Workbench",
        purpose: "Give the PMO team a queue for scoring, clarifying, rejecting, deferring, or moving requests to charter.",
        powerPlatformBuild: ["canvas app queue gallery", "priority and complexity scoring controls", "decision notes panel", "next-action assignment"],
        automations: ["reviewer assignment", "sponsor clarification email", "decision notification", "weekly untriaged digest"],
        reporting: ["aging intake items", "triage decision mix", "reviewer workload", "high-value demand pipeline"]
      }
    ],
    powerBi: ["Portfolio demand funnel", "intake aging by owner", "request source and category trends", "approved vs rejected request mix"],
    implementationRoadmap: ["Define intake categories and required questions.", "Build the request table and submitter form.", "Add triage scoring and status transitions.", "Automate submitter and reviewer communications.", "Publish Power BI demand funnel and aging views."],
    governanceNotes: ["Keep intake short enough that users actually submit requests.", "Separate clarification from approval so early discovery does not look like commitment.", "Store decision reasons for future prioritization conversations."]
  },
  {
    slug: "charter-and-approval",
    title: "Charter and approval",
    summary: "Turn approved intake into a project charter with sponsor approval, scope boundaries, estimated value, and delivery ownership.",
    outcome: "A charter approval portal that captures scope, objectives, success measures, stakeholders, assumptions, and formal sponsor approval.",
    businessProblem: "Many teams jump from idea to execution without a clear charter. A simple charter workflow creates alignment before delivery effort begins.",
    coreLists: ["Project Charters", "Stakeholders", "Success Measures", "Assumptions", "Charter Approval History", "Charter Documents"],
    portals: [
      {
        name: "Charter Approval Portal",
        purpose: "Collect and route project charters for sponsor review before work moves into planning.",
        powerPlatformBuild: ["charter form with scope, objectives, value, and risk fields", "stakeholder repeater or child table", "approval comments panel", "charter PDF or print view"],
        automations: ["sponsor approval request", "revision request workflow", "charter approved notification", "Teams post to project channel"],
        reporting: ["charters awaiting approval", "approval cycle time", "charters by sponsor", "approved value pipeline"]
      }
    ],
    powerBi: ["Charter approval cycle time", "approved project value", "sponsor queue", "charters by business unit"],
    implementationRoadmap: ["Create charter schema and required fields.", "Build the charter draft/edit experience.", "Add sponsor approval and revision paths.", "Generate a printable charter summary.", "Track cycle time and approval backlog."],
    governanceNotes: ["Do not overbuild charter fields on day one.", "Make revision comments visible to the requester.", "Require explicit scope exclusions for risky projects."]
  },
  {
    slug: "stage-gates",
    title: "Stage gates and lifecycle control",
    summary: "Move projects through standard delivery stages with clear entry criteria, exit criteria, approvals, and evidence.",
    outcome: "A gate portal for initiation, planning, build, test, launch, closeout, and benefits review.",
    businessProblem: "A PMO does not need heavyweight software to enforce lifecycle discipline. It needs visible criteria, simple evidence capture, and consistent decisions.",
    coreLists: ["Projects", "Lifecycle Stages", "Gate Criteria", "Gate Reviews", "Evidence Links", "Gate Decisions"],
    portals: [
      {
        name: "Gate Portal",
        purpose: "Show each project stage, required gate evidence, approvers, and current decision state.",
        powerPlatformBuild: ["project stage dashboard", "criteria checklist", "evidence upload/link fields", "approval status timeline"],
        automations: ["gate readiness reminder", "gate review approval", "missing evidence notification", "stage transition update"],
        reporting: ["projects by lifecycle stage", "gate pass/fail rate", "overdue gates", "stage cycle time"]
      },
      {
        name: "Stage Change Portal",
        purpose: "Control transitions between stages and capture who approved the move.",
        powerPlatformBuild: ["stage change request form", "entry and exit criteria checklist", "approval decision panel", "audit history"],
        automations: ["stage change approval", "project team notification", "Power BI dataset refresh trigger", "close previous stage tasks"],
        reporting: ["stage movement over time", "blocked stage changes", "average days per stage", "approval bottlenecks"]
      }
    ],
    powerBi: ["Lifecycle pipeline", "stage aging", "gate health", "approval bottleneck dashboard"],
    implementationRoadmap: ["Define standard stages and gate criteria.", "Build project/stage data model.", "Create gate checklist and evidence capture.", "Automate gate approval and stage changes.", "Publish lifecycle and gate-health dashboards."],
    governanceNotes: ["Keep gate criteria objective and auditable.", "Allow exceptions, but require reason and approver.", "Use stage history instead of overwriting old decisions."]
  },
  {
    slug: "change-risk-issue-control",
    title: "Change, risk, and issue control",
    summary: "Give delivery teams structured portals for change requests, risks, issues, actions, escalations, and decisions.",
    outcome: "A connected control layer for change requests, risk and issue management, decision logs, and escalation communications.",
    businessProblem: "Projects fail quietly when changes, risks, and issues live in meeting notes. A small PMO needs one operational source of truth.",
    coreLists: ["Change Requests", "Risks", "Issues", "Actions", "Decisions", "Escalations", "Impact Assessments"],
    portals: [
      {
        name: "Change Request Portal",
        purpose: "Capture scope, schedule, budget, risk, and benefit impacts before approving project changes.",
        powerPlatformBuild: ["change request form", "impact assessment section", "approval matrix", "linked project and gate records"],
        automations: ["change review routing", "approval/rejection notification", "project baseline update reminder", "change board agenda digest"],
        reporting: ["changes by project", "approved impact", "pending change aging", "change reasons"]
      },
      {
        name: "Risks and Issues Portal",
        purpose: "Track ownership, severity, mitigation, due dates, escalation, and closure evidence.",
        powerPlatformBuild: ["risk and issue forms", "severity and probability scoring", "owner work queue", "escalation notes"],
        automations: ["overdue mitigation reminder", "high-severity Teams alert", "weekly RAID digest", "closure confirmation"],
        reporting: ["open risks by severity", "issues aging", "mitigation overdue", "escalations by sponsor"]
      }
    ],
    powerBi: ["RAID dashboard", "change impact dashboard", "risk heat map", "issue aging and escalation trends"],
    implementationRoadmap: ["Define change, risk, and issue fields.", "Build separate but linked portals for each control area.", "Automate reminders and escalations.", "Create Power BI views for executives and delivery teams.", "Review open controls in weekly governance meetings."],
    governanceNotes: ["Separate risks from issues: risks might happen, issues are already happening.", "Require owner and due date on every active item.", "Track decision history so escalations do not reset the story."]
  },
  {
    slug: "communications-and-reporting",
    title: "Communications and Power BI reporting",
    summary: "Convert PMO data into status communications, executive dashboards, operational queues, and stakeholder updates.",
    outcome: "A reporting and communications layer that turns intake, charter, gate, change, risk, and issue data into decisions.",
    businessProblem: "Executives do not need more raw project data. They need clear status, exceptions, decisions needed, and trend signals.",
    coreLists: ["Status Updates", "Milestones", "Communications", "Report Snapshots", "Decision Requests", "Benefits Tracking"],
    portals: [
      {
        name: "Communications Center",
        purpose: "Prepare stakeholder updates, decision requests, meeting summaries, and portfolio digests from the PMO data model.",
        powerPlatformBuild: ["status update form", "audience-specific message templates", "decision request queue", "communication history"],
        automations: ["weekly status reminder", "executive digest", "decision-needed Teams alert", "missed update escalation"],
        reporting: ["missing status updates", "decisions awaiting sponsor", "communication coverage", "benefits review readiness"]
      },
      {
        name: "Power BI PMO Reporting Pack",
        purpose: "Provide dashboards for portfolio health, intake demand, gate progress, change impact, risks, issues, and benefits.",
        powerPlatformBuild: ["SharePoint or Dataverse semantic model", "standard measures", "role-based report pages", "published app workspace"],
        automations: ["dataset refresh schedule", "snapshot export", "threshold-based alert", "monthly benefits review reminder"],
        reporting: ["portfolio health", "delivery confidence", "stage aging", "RAID", "change impact", "benefits realization"]
      }
    ],
    powerBi: ["Executive portfolio overview", "delivery health scorecard", "financial and benefit tracking", "PMO operations dashboard"],
    implementationRoadmap: ["Standardize project status and health definitions.", "Build status update capture.", "Create a clean reporting model from operational lists/tables.", "Publish executive and working-team report pages.", "Automate reminders, alerts, and report snapshots."],
    governanceNotes: ["Avoid dashboards that simply mirror raw lists.", "Use definitions for red/yellow/green health so teams report consistently.", "Separate executive reporting from working-team operations views."]
  }
];

export const pmoToolkitSummary = {
  title: "Build your own practical PMO system with Microsoft 365 and Power Platform",
  audience: "PMO teams that need governance, visibility, approvals, and reporting but cannot justify a seven-figure enterprise PMO platform.",
  promise: "Start with simple portals, workflows, and dashboards that map to the real PMO lifecycle, then mature the system one stage at a time.",
  principles: [
    "Use SharePoint or Dataverse as the operational system of record.",
    "Use Power Apps or Power Pages for focused portals instead of one giant app.",
    "Use Power Automate for approvals, reminders, escalations, and communications.",
    "Use Power BI for decision-ready reporting, not just list exports.",
    "Design the data model around lifecycle decisions, not software features."
  ]
};

export function getPmoStageBySlug(slug: string) {
  return pmoLifecycleStages.find((stage) => stage.slug === slug);
}
