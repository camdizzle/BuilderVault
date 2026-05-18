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

export type PmoDeepDive = {
  schemaFields: string[];
  screens: string[];
  statusModel: string[];
  permissionModel: string[];
  workflowDetails: string[];
  workflowMap: string[];
  powerBiMeasures: string[];
  mvpBuildSteps: string[];
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

export const pmoDeepDives: Record<string, PmoDeepDive> = {
  "intake-and-triage": {
    schemaFields: ["Intake Request: Request ID, Title, Request Type, Business Unit, Sponsor, Requested By, Submitted Date, Current Status, Desired Start Date, Requested Due Date, Strategic Alignment, Problem Statement, Expected Benefit, Estimated Cost, Estimated Effort, Complexity, Risk Level, Priority Score, Triage Owner, Decision, Decision Date, Decision Reason, Next Stage.", "Scoring Criteria: Criterion Name, Weight, Score Scale, Guidance Text, Active Flag, Sort Order.", "Triage Decision: Request, Reviewer, Decision, Comments, Required Follow-up, Follow-up Owner, Follow-up Due Date.", "Communication Log: Request, Audience, Message Type, Sent Date, Sent By, Delivery Channel, Message Summary."],
    screens: ["Submit request screen with business need, value, timing, attachments, and sponsor information.", "Requester status screen showing draft, submitted, clarification requested, triaged, rejected, deferred, or moved to charter.", "PMO triage queue with filters for unassigned, aging, high score, missing info, and sponsor review needed.", "Triage scoring screen with weighted criteria, total score, recommendation, decision notes, and next-stage action."],
    statusModel: ["Draft", "Submitted", "Clarification Requested", "Ready for Triage", "Approved for Charter", "Deferred", "Rejected"],
    permissionModel: ["Requesters create and view their own submissions.", "Department sponsors view requests tied to their business unit.", "PMO triage members edit scores, owners, status, and decision fields.", "Executives view all intake reporting without edit rights."],
    workflowDetails: ["On submit, validate required fields, stamp submitted date, and notify the triage team.", "When clarification is requested, email the requester and create a follow-up task.", "When scoring is complete, calculate weighted score and recommend approve, defer, or reject.", "When approved for charter, create a draft charter linked to the intake request."],
    workflowMap: ["Requester drafts demand","Submit intake request","PMO validates completeness","Clarification loop if needed","Weighted triage scoring","Approve, defer, or reject","Create charter record when approved"],
    powerBiMeasures: ["Intake Count = COUNTROWS('Intake Requests')", "Average Triage Days = AVERAGEX('Intake Requests', DATEDIFF('Intake Requests'[Submitted Date], 'Intake Requests'[Decision Date], DAY))", "Aging Requests = COUNTROWS(FILTER('Intake Requests', ISBLANK('Intake Requests'[Decision Date]) && 'Intake Requests'[Submitted Date] < TODAY() - 7))", "Approval Rate = DIVIDE([Approved Requests], [Decided Requests])"],
    mvpBuildSteps: ["Start with SharePoint for small PMOs or Dataverse when security and relationships matter.", "Build the intake form with only fields needed for triage.", "Add a PMO-only scoring and decision screen.", "Automate submission, clarification, and decision notifications.", "Create a Power BI demand funnel and aging page."]
  },
  "charter-and-approval": {
    schemaFields: ["Project Charter: Charter ID, Linked Intake Request, Project Name, Sponsor, Project Manager, Business Owner, Problem Statement, Objectives, In Scope, Out of Scope, Success Measures, Estimated Budget, Estimated Timeline, Key Risks, Assumptions, Dependencies, Charter Status, Approval Date.", "Stakeholder: Charter, Name, Role, Department, Influence, Engagement Need, Communication Preference.", "Success Measure: Charter, Metric, Baseline, Target, Measurement Method, Review Date.", "Approval History: Charter, Approver, Decision, Comments, Decision Date, Approval Round."],
    screens: ["Charter drafting screen for business case, scope, value, timeline, risks, and stakeholders.", "Sponsor review screen with read-only summary, approval buttons, and revision comments.", "PMO quality review screen for missing fields, unclear objectives, and unowned dependencies.", "Printable charter summary page for steering committee packets."],
    statusModel: ["Draft", "PMO Review", "Sponsor Review", "Revision Requested", "Approved", "Cancelled"],
    permissionModel: ["Charter authors edit drafts and revisions.", "Sponsors approve only charters assigned to them.", "PMO reviewers edit quality fields, status, and approval routing.", "Executives view approved and pending charters across the portfolio."],
    workflowDetails: ["When intake moves to charter, create the charter shell and copy sponsor, department, request type, and business need.", "On PMO review, check scope, objectives, success measures, and sponsor.", "On PMO approval, start sponsor approval and lock core fields.", "On sponsor approval, create the project record and initial gate checklist."],
    workflowMap: ["Draft charter from approved intake","PMO completeness review","Revision loop if incomplete","Sponsor approval request","Sponsor approves or requests revision","Create project record","Open initial lifecycle stage"],
    powerBiMeasures: ["Charters Awaiting Sponsor = COUNTROWS(FILTER('Project Charters', 'Project Charters'[Charter Status] = \"Sponsor Review\"))", "Average Approval Days = AVERAGEX('Project Charters', DATEDIFF('Project Charters'[Submitted Date], 'Project Charters'[Approval Date], DAY))", "Approved Estimated Value = SUM('Project Charters'[Estimated Benefit])", "Revision Rate = DIVIDE([Revision Requested Count], [Submitted Charter Count])"],
    mvpBuildSteps: ["Create a charter table linked to intake requests.", "Build draft/edit screens for scope, value, risks, and stakeholders.", "Add PMO completeness review before sponsor approval.", "Add sponsor approval with comments and revision handling.", "Generate a simple charter summary view."]
  },
  "stage-gates": {
    schemaFields: ["Project: Project ID, Name, Sponsor, Project Manager, Current Stage, Health, Start Date, Target Launch Date, Baseline Launch Date, Stage Changed Date.", "Gate Criteria: Stage, Criterion, Required Evidence Type, Owner Role, Required Flag, Sort Order.", "Gate Review: Project, Stage, Review Status, Submitted By, Submitted Date, Decision, Decision Date, Approver, Exception Reason.", "Evidence Link: Gate Review, Criterion, Evidence URL, Evidence Notes, Submitted By, Submitted Date."],
    screens: ["Project lifecycle dashboard showing current stage, gate readiness, stage age, and blocked criteria.", "Gate checklist screen with required criteria, evidence link, owner, and completion state.", "Gate approval screen with decision, comments, exception flag, and next-stage target.", "Audit timeline showing every stage change, approver, exception, and date."],
    statusModel: ["Stage In Progress", "Gate Prep", "Gate Submitted", "Gate Approved", "Gate Approved with Exception", "Gate Rejected", "Stage Changed"],
    permissionModel: ["Project managers update evidence and submit gate reviews.", "Gate approvers decide assigned gate reviews but do not edit submitted evidence.", "PMO admins maintain gate criteria and exception rules.", "Executives view stage health and exception trends."],
    workflowDetails: ["When a project enters a stage, create gate checklist rows from the criteria template.", "When required evidence is complete, enable submit-for-gate-review.", "On gate submission, route approval based on project size, risk, or stage.", "On approval, update current stage, lock prior evidence, and notify the project team."],
    workflowMap: ["Project enters lifecycle stage","Generate stage criteria checklist","Project team attaches evidence","Submit gate review","Approver decides gate","Record exception if needed","Move project to next stage"],
    powerBiMeasures: ["Projects by Stage = COUNTROWS('Projects') grouped by Current Stage", "Average Stage Age = AVERAGEX('Projects', DATEDIFF('Projects'[Stage Changed Date], TODAY(), DAY))", "Gate Exception Rate = DIVIDE([Gate Approved With Exception], [Gate Decisions])", "Overdue Gate Count = COUNTROWS(FILTER('Gate Reviews', 'Gate Reviews'[Due Date] < TODAY() && 'Gate Reviews'[Review Status] <> \"Approved\"))"],
    mvpBuildSteps: ["Define five to seven lifecycle stages and no more than ten criteria per stage.", "Create template criteria and generated project checklist rows.", "Build the project lifecycle dashboard and gate checklist screen.", "Add gate approval and stage-change automation.", "Publish stage aging, gate status, and exception reporting."]
  },
  "change-risk-issue-control": {
    schemaFields: ["Change Request: Change ID, Project, Requestor, Change Type, Description, Reason, Scope Impact, Schedule Impact, Budget Impact, Risk Impact, Recommendation, Status, Approver, Decision Date.", "Risk: Risk ID, Project, Category, Cause, Event, Impact, Probability, Impact Score, Exposure, Mitigation Plan, Contingency Plan, Owner, Due Date, Status.", "Issue: Issue ID, Project, Description, Severity, Impact, Owner, Due Date, Resolution Plan, Escalation Needed, Status, Closed Date.", "Decision: Decision ID, Project, Decision Needed, Options, Recommendation, Decision Maker, Decision, Decision Date, Rationale."],
    screens: ["Change request form with impact assessment, recommendation, approval route, and baseline update reminder.", "Risk register screen with heat scoring, mitigation owner, due date, escalation flag, and trend notes.", "Issue register screen with severity, blocker flag, owner queue, resolution plan, and closure evidence.", "Weekly RAID review dashboard for open high-severity items and overdue actions."],
    statusModel: ["Draft", "Submitted", "Under Review", "Action Required", "Approved or Accepted", "Rejected or Closed", "Escalated"],
    permissionModel: ["Project managers create and update controls for their projects.", "Risk and issue owners update mitigation, resolution, and due dates assigned to them.", "Change approvers approve or reject assigned changes.", "Executives view escalated items and decision requests."],
    workflowDetails: ["When a change is submitted, calculate impact level and route approval by threshold.", "When a high-exposure risk is created, notify the PMO lead and sponsor.", "Send overdue mitigation reminders before and after due dates.", "When a change is approved, remind the project manager to update baselines."],
    workflowMap: ["Team submits change, risk, issue, or decision","Classify severity and impact","Assign owner and due date","Route approval or escalation if needed","Track mitigation or decision action","Confirm closure evidence","Report open exposure and aging"],
    powerBiMeasures: ["Open Risk Exposure = SUMX(FILTER('Risks', 'Risks'[Status] <> \"Closed\"), 'Risks'[Probability] * 'Risks'[Impact Score])", "Overdue Actions = COUNTROWS(FILTER('Actions', 'Actions'[Due Date] < TODAY() && 'Actions'[Status] <> \"Closed\"))", "Average Issue Age = AVERAGEX(FILTER('Issues', 'Issues'[Status] <> \"Closed\"), DATEDIFF('Issues'[Created Date], TODAY(), DAY))", "Approved Change Impact = SUM('Change Requests'[Budget Impact])"],
    mvpBuildSteps: ["Create Change Requests, Risks, Issues, Actions, and Decisions tables linked to Projects.", "Build owner queues first so the tool changes behavior.", "Add threshold-based escalation for high-severity items.", "Add change approval with impact assessment and baseline reminder.", "Create Power BI RAID and change-impact pages."]
  },
  "communications-and-reporting": {
    schemaFields: ["Status Update: Project, Reporting Period, Overall Health, Scope Health, Schedule Health, Budget Health, Key Accomplishments, Next Steps, Decisions Needed, Help Needed, Submitted By, Submitted Date.", "Milestone: Project, Milestone Name, Baseline Date, Forecast Date, Actual Date, Status, Owner, Notes.", "Communication: Project, Audience, Message Type, Subject, Summary, Sent Date, Sent By, Channel.", "Benefits Tracking: Project, Benefit Metric, Baseline, Target, Current Value, Measurement Date, Owner."],
    screens: ["Weekly status update form with health ratings, accomplishments, next steps, blockers, and decisions needed.", "Executive summary screen that rolls project updates into a portfolio narrative.", "Milestone update screen for baseline, forecast, actual, and variance notes.", "Benefits review screen for target, current value, evidence, and next measurement date."],
    statusModel: ["Not Started", "Draft", "Submitted", "Needs Revision", "Published", "Missed"],
    permissionModel: ["Project managers create and edit their status updates.", "PMO reviewers request revisions and publish updates.", "Sponsors view status, decisions needed, and benefits for their projects.", "Executives view portfolio reporting and decision requests."],
    workflowDetails: ["Create status update shells at the start of each reporting period.", "Send reminders before due dates and missed-update escalations after deadlines.", "When an update is published, refresh Power BI and notify stakeholders.", "If decisions are needed, create decision request records linked to the status update."],
    workflowMap: ["Create reporting period shell","Project manager submits update","PMO reviews and requests revisions if needed","Publish portfolio status","Refresh Power BI dataset","Send stakeholder digest","Snapshot month-end measures"],
    powerBiMeasures: ["Current Red Projects = COUNTROWS(FILTER('Status Updates', 'Status Updates'[Overall Health] = \"Red\" && 'Status Updates'[Is Current] = TRUE()))", "Milestone Variance Days = DATEDIFF('Milestones'[Baseline Date], 'Milestones'[Forecast Date], DAY)", "Missing Status Count = COUNTROWS(FILTER('Status Updates', 'Status Updates'[Status] = \"Missed\"))", "Benefits Realization % = DIVIDE(SUM('Benefits Tracking'[Current Value]), SUM('Benefits Tracking'[Target]))"],
    mvpBuildSteps: ["Define standard health ratings and weekly status questions.", "Build status update capture and PMO review screens.", "Create milestone and benefits tracking tables linked to projects.", "Build executive Power BI pages for health, milestones, decisions, and benefits.", "Automate reminders, escalations, dataset refresh, and stakeholder digest emails."]
  }
};

export function getPmoDeepDiveBySlug(slug: string) {
  return pmoDeepDives[slug];
}

export type PmoColumnSpec = {
  name: string;
  type: string;
  required: boolean;
  notes: string;
};

export type PmoTableSpec = {
  name: string;
  platform: "SharePoint" | "Dataverse" | "Either";
  purpose: string;
  columns: PmoColumnSpec[];
  relationships: string[];
  indexes: string[];
};

export type PmoDownload = {
  href: string;
  label: string;
  description: string;
};

export const pmoMasterRoadmapDownload: PmoDownload = {
  href: "/pmo-guides/pmo-30-60-90-master-roadmap.md",
  label: "PMO 30/60/90 master roadmap",
  description: "Downloadable rollout guide connecting intake, charters, gates, RAID, change control, reporting, cadence, owners, and exit criteria."
};

export const pmoTemplateDownloads: PmoDownload[] = [
  { href: "/pmo-templates/pmo-intake-requests-template.csv", label: "Intake requests CSV", description: "Starter columns for demand intake, scoring, ownership, and triage decisions." },
  { href: "/pmo-templates/pmo-project-charters-template.csv", label: "Project charters CSV", description: "Starter charter fields for scope, sponsors, success measures, approvals, and assumptions." },
  { href: "/pmo-templates/pmo-stage-gates-template.csv", label: "Stage gates CSV", description: "Starter criteria and review fields for stage movement and gate decisions." },
  { href: "/pmo-templates/pmo-raid-change-control-template.csv", label: "RAID and change control CSV", description: "Starter fields for risks, issues, actions, decisions, and change requests." },
  { href: "/pmo-templates/pmo-status-reporting-template.csv", label: "Status reporting CSV", description: "Starter fields for weekly project health, milestones, benefits, and decision requests." },
  { href: "/pmo-templates/pmo-build-roadmap.md", label: "PMO build roadmap", description: "A plain-language build order for rolling out the PMO system one tool at a time." }
];

export const pmoImplementationGuideDownloads: Record<string, PmoDownload> = {
  "intake-and-triage": { href: "/pmo-guides/intake-and-triage-implementation-guide.md", label: "Intake and triage build guide", description: "Downloadable implementation guide with data model, screen blueprint, formulas, flows, and rollout checklist." },
  "charter-and-approval": { href: "/pmo-guides/charter-and-approval-implementation-guide.md", label: "Charter and approval build guide", description: "Downloadable implementation guide for charter drafting, sponsor approval, revision loops, and reporting." },
  "stage-gates": { href: "/pmo-guides/stage-gates-implementation-guide.md", label: "Stage gates build guide", description: "Downloadable implementation guide for lifecycle stages, gate evidence, approvals, and exception tracking." },
  "change-risk-issue-control": { href: "/pmo-guides/change-risk-issue-control-implementation-guide.md", label: "Change, risk, and issue build guide", description: "Downloadable implementation guide for RAID, change approvals, escalations, and decision control." },
  "communications-and-reporting": { href: "/pmo-guides/communications-and-reporting-implementation-guide.md", label: "Communications and reporting build guide", description: "Downloadable implementation guide for status capture, stakeholder communications, and Power BI reporting." }
};

export function getPmoImplementationGuideBySlug(slug: string) {
  return pmoImplementationGuideDownloads[slug];
}

export const pmoTableSpecs: Record<string, PmoTableSpec[]> = {
  "intake-and-triage": [
    {
      name: "Intake Requests",
      platform: "Either",
      purpose: "Primary demand record submitted by business users and triaged by the PMO.",
      columns: [
        { name: "Title", type: "Single line text", required: true, notes: "Short request name used in queues and reports." },
        { name: "Request Type", type: "Choice", required: true, notes: "Project, enhancement, automation, report, process improvement, support." },
        { name: "Business Unit", type: "Choice or lookup", required: true, notes: "Use a lookup when departments need owners, sponsors, or reporting attributes." },
        { name: "Sponsor", type: "Person or lookup to Contact/User", required: true, notes: "The accountable business sponsor." },
        { name: "Problem Statement", type: "Multiple lines text", required: true, notes: "Capture the business pain in plain language." },
        { name: "Expected Benefit", type: "Currency or number", required: false, notes: "Use text early if benefits are qualitative." },
        { name: "Complexity", type: "Choice", required: true, notes: "Low, Medium, High. Feed scoring and routing." },
        { name: "Priority Score", type: "Number", required: false, notes: "Calculated from weighted criteria; avoid manual entry when possible." },
        { name: "Current Status", type: "Choice", required: true, notes: "Draft, Submitted, Clarification Requested, Ready for Triage, Approved for Charter, Deferred, Rejected." },
        { name: "Decision Reason", type: "Multiple lines text", required: false, notes: "Required when rejecting or deferring." }
      ],
      relationships: ["One Intake Request can create one Project Charter.", "Many Triage Decisions can relate to one Intake Request.", "Many Communication Log rows can relate to one Intake Request."],
      indexes: ["Current Status", "Business Unit", "Sponsor", "Submitted Date", "Triage Owner", "Decision Date"]
    },
    {
      name: "Scoring Criteria",
      platform: "Either",
      purpose: "Configurable scoring rubric so the PMO can change weights without editing the app.",
      columns: [
        { name: "Criterion Name", type: "Single line text", required: true, notes: "Strategic alignment, benefit, urgency, risk, complexity." },
        { name: "Weight", type: "Number", required: true, notes: "Use whole numbers that total 100 across active criteria." },
        { name: "Score Guidance", type: "Multiple lines text", required: true, notes: "Explains what low, medium, and high scores mean." },
        { name: "Active", type: "Yes/No", required: true, notes: "Deactivate instead of deleting to preserve history." }
      ],
      relationships: ["Scoring Criteria is referenced by triage scoring controls."],
      indexes: ["Active", "Sort Order"]
    }
  ],
  "charter-and-approval": [
    {
      name: "Project Charters",
      platform: "Either",
      purpose: "Formal definition of approved work before planning begins.",
      columns: [
        { name: "Project Name", type: "Single line text", required: true, notes: "Use consistent naming because it becomes the reporting label." },
        { name: "Linked Intake Request", type: "Lookup", required: false, notes: "Connects the charter to original demand." },
        { name: "Sponsor", type: "Person or lookup", required: true, notes: "Approver and accountable business owner." },
        { name: "Project Manager", type: "Person", required: true, notes: "Delivery owner for planning and execution." },
        { name: "Objectives", type: "Multiple lines text", required: true, notes: "Business outcomes, not just deliverables." },
        { name: "In Scope", type: "Multiple lines text", required: true, notes: "What the project will deliver." },
        { name: "Out of Scope", type: "Multiple lines text", required: true, notes: "Prevents expectation drift." },
        { name: "Estimated Budget", type: "Currency", required: false, notes: "Use range if exact estimate is not available." },
        { name: "Charter Status", type: "Choice", required: true, notes: "Draft, PMO Review, Sponsor Review, Revision Requested, Approved, Cancelled." },
        { name: "Approval Date", type: "Date", required: false, notes: "Stamped by workflow." }
      ],
      relationships: ["One Project Charter creates one Project.", "Many Stakeholders can relate to one Charter.", "Many Approval History rows can relate to one Charter."],
      indexes: ["Charter Status", "Sponsor", "Project Manager", "Approval Date"]
    },
    {
      name: "Success Measures",
      platform: "Either",
      purpose: "Defines how the PMO will know whether the project created value.",
      columns: [
        { name: "Metric", type: "Single line text", required: true, notes: "Cycle time, cost reduction, adoption, compliance, satisfaction." },
        { name: "Baseline", type: "Number or text", required: false, notes: "Current-state value before project." },
        { name: "Target", type: "Number or text", required: true, notes: "Desired future-state value." },
        { name: "Measurement Method", type: "Multiple lines text", required: true, notes: "Where the number comes from and how often it is reviewed." }
      ],
      relationships: ["Many Success Measures relate to one Project Charter."],
      indexes: ["Charter", "Review Date"]
    }
  ],
  "stage-gates": [
    {
      name: "Projects",
      platform: "Either",
      purpose: "Portfolio record that moves through lifecycle stages and connects to controls, status, and reporting.",
      columns: [
        { name: "Project Name", type: "Single line text", required: true, notes: "Primary reporting label." },
        { name: "Sponsor", type: "Person or lookup", required: true, notes: "Executive owner." },
        { name: "Project Manager", type: "Person", required: true, notes: "Delivery owner." },
        { name: "Current Stage", type: "Choice or lookup", required: true, notes: "Initiation, Planning, Build, Test, Launch, Closeout, Benefits Review." },
        { name: "Overall Health", type: "Choice", required: true, notes: "Green, Yellow, Red, Not Rated." },
        { name: "Baseline Launch Date", type: "Date", required: false, notes: "Original approved launch date." },
        { name: "Forecast Launch Date", type: "Date", required: false, notes: "Current expected launch date." }
      ],
      relationships: ["One Project has many Gate Reviews, Risks, Issues, Changes, Status Updates, and Milestones."],
      indexes: ["Current Stage", "Sponsor", "Project Manager", "Overall Health", "Forecast Launch Date"]
    },
    {
      name: "Gate Reviews",
      platform: "Either",
      purpose: "Approval record for moving a project from one stage to the next.",
      columns: [
        { name: "Project", type: "Lookup", required: true, notes: "Parent project." },
        { name: "Stage", type: "Choice or lookup", required: true, notes: "Stage being reviewed." },
        { name: "Review Status", type: "Choice", required: true, notes: "Draft, Submitted, Approved, Approved with Exception, Rejected." },
        { name: "Approver", type: "Person", required: true, notes: "Decision maker for the gate." },
        { name: "Exception Reason", type: "Multiple lines text", required: false, notes: "Required when approved with exception." }
      ],
      relationships: ["One Gate Review has many Evidence Links and Gate Decisions."],
      indexes: ["Project", "Stage", "Review Status", "Approver", "Decision Date"]
    }
  ],
  "change-risk-issue-control": [
    {
      name: "Change Requests",
      platform: "Either",
      purpose: "Controls scope, budget, schedule, and risk changes after charter approval.",
      columns: [
        { name: "Project", type: "Lookup", required: true, notes: "Project affected by the change." },
        { name: "Change Type", type: "Choice", required: true, notes: "Scope, schedule, budget, resource, quality, compliance." },
        { name: "Reason", type: "Multiple lines text", required: true, notes: "Why the change is needed." },
        { name: "Scope Impact", type: "Choice", required: true, notes: "None, Low, Medium, High." },
        { name: "Schedule Impact Days", type: "Number", required: false, notes: "Positive or negative variance." },
        { name: "Budget Impact", type: "Currency", required: false, notes: "Estimated cost increase or decrease." },
        { name: "Status", type: "Choice", required: true, notes: "Draft, Submitted, Under Review, Approved, Rejected, Closed." }
      ],
      relationships: ["Many Change Requests relate to one Project.", "Change approvals create Approval History records."],
      indexes: ["Project", "Status", "Change Type", "Approver", "Decision Date"]
    },
    {
      name: "Risks and Issues",
      platform: "Either",
      purpose: "Operational RAID control for project uncertainty and active blockers.",
      columns: [
        { name: "Item Type", type: "Choice", required: true, notes: "Risk or Issue." },
        { name: "Project", type: "Lookup", required: true, notes: "Parent project." },
        { name: "Severity", type: "Choice", required: true, notes: "Low, Medium, High, Critical." },
        { name: "Probability", type: "Number", required: false, notes: "Use only for risks." },
        { name: "Impact Score", type: "Number", required: true, notes: "1-5 scoring for heat maps." },
        { name: "Owner", type: "Person", required: true, notes: "Accountable for mitigation or resolution." },
        { name: "Due Date", type: "Date", required: true, notes: "Drives reminders and overdue reporting." },
        { name: "Status", type: "Choice", required: true, notes: "Open, Monitoring, Escalated, Closed." }
      ],
      relationships: ["Many Risks and Issues relate to one Project.", "Actions and Decisions can link to a RAID item."],
      indexes: ["Project", "Item Type", "Severity", "Owner", "Due Date", "Status"]
    }
  ],
  "communications-and-reporting": [
    {
      name: "Status Updates",
      platform: "Either",
      purpose: "Weekly or monthly narrative and health record for each project.",
      columns: [
        { name: "Project", type: "Lookup", required: true, notes: "Parent project." },
        { name: "Reporting Period", type: "Date or text", required: true, notes: "Week ending or month label." },
        { name: "Overall Health", type: "Choice", required: true, notes: "Green, Yellow, Red." },
        { name: "Scope Health", type: "Choice", required: true, notes: "Green, Yellow, Red." },
        { name: "Schedule Health", type: "Choice", required: true, notes: "Green, Yellow, Red." },
        { name: "Budget Health", type: "Choice", required: true, notes: "Green, Yellow, Red." },
        { name: "Key Accomplishments", type: "Multiple lines text", required: true, notes: "What changed since last period." },
        { name: "Next Steps", type: "Multiple lines text", required: true, notes: "What happens next." },
        { name: "Decisions Needed", type: "Multiple lines text", required: false, notes: "Feeds decision request queue." },
        { name: "Status", type: "Choice", required: true, notes: "Draft, Submitted, Needs Revision, Published, Missed." }
      ],
      relationships: ["Many Status Updates relate to one Project.", "Decision Requests can be generated from status updates."],
      indexes: ["Project", "Reporting Period", "Overall Health", "Status", "Submitted Date"]
    },
    {
      name: "Milestones",
      platform: "Either",
      purpose: "Tracks baseline, forecast, actual dates, and variance for portfolio reporting.",
      columns: [
        { name: "Project", type: "Lookup", required: true, notes: "Parent project." },
        { name: "Milestone Name", type: "Single line text", required: true, notes: "Planning complete, build complete, UAT complete, launch." },
        { name: "Baseline Date", type: "Date", required: true, notes: "Original approved date." },
        { name: "Forecast Date", type: "Date", required: true, notes: "Current expected date." },
        { name: "Actual Date", type: "Date", required: false, notes: "Set when complete." },
        { name: "Status", type: "Choice", required: true, notes: "Not Started, On Track, At Risk, Late, Complete." }
      ],
      relationships: ["Many Milestones relate to one Project."],
      indexes: ["Project", "Forecast Date", "Status"]
    }
  ]
};

export function getPmoTableSpecsBySlug(slug: string) {
  return pmoTableSpecs[slug] ?? [];
}

export type PmoScreenBlueprint = {
  name: string;
  persona: string;
  purpose: string;
  layout: string[];
  controls: string[];
  formulas: string[];
  dataSources: string[];
};

export type PmoSolutionComponentMap = {
  solutionName: string;
  publisherPrefix: string;
  tables: string[];
  choices: string[];
  apps: string[];
  flows: string[];
  securityRoles: string[];
  environmentVariables: string[];
  dashboards: string[];
};

export const pmoScreenBlueprints: Record<string, PmoScreenBlueprint[]> = {
  "intake-and-triage": [
    {
      name: "Request Intake Submit Screen",
      persona: "Business requester",
      purpose: "Capture a clean demand request without exposing PMO-only scoring fields.",
      layout: ["Header with request type and save state", "Left column for business need and sponsor", "Right column for timing, benefit, complexity, and attachments", "Footer command bar with Save Draft and Submit"],
      controls: ["frmIntakeRequest bound to Intake Requests", "cmbRequestType", "cmbBusinessUnit", "cmbSponsor", "txtProblemStatement", "txtExpectedBenefit", "dpDesiredStart", "attBusinessCase", "btnSaveDraft", "btnSubmit"],
      formulas: ["btnSubmit.DisplayMode checks required fields and varWorking", "OnSuccess sets status to Submitted and navigates to confirmation", "Use IfError around SubmitForm or Patch to show clear failure messages"],
      dataSources: ["Intake Requests", "Business Units", "Sponsors or Users", "Attachments"]
    },
    {
      name: "PMO Triage Queue Screen",
      persona: "PMO analyst",
      purpose: "Work the intake backlog by owner, status, age, score, and business unit.",
      layout: ["Filter rail for status, owner, business unit, aging", "Gallery of intake cards", "Selected request summary panel", "Action buttons for assign, clarify, score, approve, defer, reject"],
      controls: ["galTriageQueue", "cmbStatusFilter", "cmbOwnerFilter", "txtSearch", "frmSelectedRequest", "btnRequestClarification", "btnMoveToScoring", "btnDecision"],
      formulas: ["Gallery Items uses delegable status and StartsWith filters", "Age badge uses DateDiff(SubmittedDate, Today())", "Decision buttons require decision reason for defer/reject"],
      dataSources: ["Intake Requests", "Triage Decisions", "Communication Log"]
    },
    {
      name: "Triage Scoring Screen",
      persona: "PMO analyst or review board",
      purpose: "Score requests consistently and produce a recommendation.",
      layout: ["Request context summary", "Repeating scoring criteria gallery", "Weighted score panel", "Recommendation and decision notes", "Submit decision command bar"],
      controls: ["galScoringCriteria", "sldCriterionScore", "lblWeightedTotal", "cmbDecision", "txtDecisionReason", "btnSaveScore", "btnCreateCharter"],
      formulas: ["Weighted score = Sum(criteria score * weight)", "Recommendation maps thresholds to approve/defer/reject", "Create charter button patches Project Charters and links intake request"],
      dataSources: ["Scoring Criteria", "Intake Requests", "Triage Decisions", "Project Charters"]
    }
  ],
  "charter-and-approval": [
    {
      name: "Charter Draft Screen",
      persona: "Project manager or requester",
      purpose: "Build the charter from an approved intake request with scope, objectives, risks, and value.",
      layout: ["Charter progress tabs", "Business case section", "Scope and out-of-scope section", "Stakeholders subgrid", "Success measures subgrid"],
      controls: ["frmProjectCharter", "txtObjectives", "txtInScope", "txtOutOfScope", "galStakeholders", "galSuccessMeasures", "btnSubmitForPmoReview"],
      formulas: ["Submit disabled until objectives, scope, sponsor, and success measures exist", "Patch stakeholder child rows before status changes", "Notify author when PMO review starts"],
      dataSources: ["Project Charters", "Stakeholders", "Success Measures", "Approval History"]
    },
    {
      name: "PMO Charter Review Screen",
      persona: "PMO reviewer",
      purpose: "Validate charter quality before sponsor approval.",
      layout: ["Read-only charter summary", "Completeness checklist", "Reviewer comments", "Request revision or send to sponsor actions"],
      controls: ["frmCharterReadOnly", "galCompletenessChecklist", "txtReviewComments", "btnRequestRevision", "btnSendSponsorApproval"],
      formulas: ["Checklist must be complete before sponsor approval", "Revision action sets status and sends comments", "Sponsor approval action starts approval flow"],
      dataSources: ["Project Charters", "Approval History", "Communication Log"]
    },
    {
      name: "Sponsor Approval Screen",
      persona: "Business sponsor",
      purpose: "Approve, reject, or request revisions with minimal friction.",
      layout: ["Charter one-page summary", "Risk and investment highlights", "Approval decision panel", "Comments and attachments"],
      controls: ["cntCharterSummary", "galSuccessMeasureSummary", "cmbSponsorDecision", "txtSponsorComments", "btnSubmitDecision"],
      formulas: ["Approval creates Project record and initial lifecycle stage", "Revision reopens charter for author", "Reject requires rationale"],
      dataSources: ["Project Charters", "Projects", "Approval History", "Lifecycle Stages"]
    }
  ],
  "stage-gates": [
    {
      name: "Project Lifecycle Dashboard Screen",
      persona: "Project manager and PMO lead",
      purpose: "Show stage, gate readiness, missing evidence, and stage aging for a project.",
      layout: ["Project header with health and stage", "Horizontal lifecycle tracker", "Gate readiness cards", "Open exceptions and actions", "Submit gate review button"],
      controls: ["cmpLifecycleTracker", "galGateCriteria", "galMissingEvidence", "lblStageAge", "btnSubmitGate"],
      formulas: ["Gate submit enabled when all required criteria have evidence", "Stage age uses DateDiff(StageChangedDate, Today())", "Exception badge appears when gate has approved exception"],
      dataSources: ["Projects", "Gate Criteria", "Gate Reviews", "Evidence Links"]
    },
    {
      name: "Gate Evidence Screen",
      persona: "Project manager",
      purpose: "Attach links, documents, and notes against each gate criterion.",
      layout: ["Criteria list", "Evidence details panel", "Upload or link controls", "Save evidence command bar"],
      controls: ["galCriteria", "txtEvidenceUrl", "txtEvidenceNotes", "attEvidence", "btnSaveEvidence", "btnMarkCriterionReady"],
      formulas: ["Evidence URL or attachment required for required criteria", "Patch evidence rows by selected criterion", "Refresh readiness summary after save"],
      dataSources: ["Gate Criteria", "Evidence Links", "Gate Reviews"]
    },
    {
      name: "Gate Approval Screen",
      persona: "Gate approver",
      purpose: "Decide whether a project can move to the next lifecycle stage.",
      layout: ["Project and stage summary", "Evidence checklist read-only view", "Decision section", "Exception reason panel", "Approval history"],
      controls: ["galEvidenceReview", "cmbGateDecision", "txtGateComments", "txtExceptionReason", "btnSubmitGateDecision"],
      formulas: ["Exception reason required for Approved with Exception", "Approved decision updates Project.CurrentStage", "Rejected decision keeps stage and creates remediation action"],
      dataSources: ["Projects", "Gate Reviews", "Evidence Links", "Actions"]
    }
  ],
  "change-risk-issue-control": [
    {
      name: "RAID Register Screen",
      persona: "Project manager and PMO analyst",
      purpose: "Manage risks, issues, actions, and decisions from one operating queue.",
      layout: ["Filter tabs for Risk, Issue, Action, Decision", "Severity and overdue filters", "Register gallery", "Selected item edit panel"],
      controls: ["tabRaidType", "galRaidItems", "cmbSeverity", "tglEscalatedOnly", "frmRaidItem", "btnEscalate", "btnCloseItem"],
      formulas: ["Heat score = Probability * Impact Score", "Close requires closure notes", "Escalate creates decision request when decision is needed"],
      dataSources: ["Risks and Issues", "Actions", "Decisions", "Escalations"]
    },
    {
      name: "Change Request Screen",
      persona: "Project manager or sponsor",
      purpose: "Capture impact and route change approval before baseline changes.",
      layout: ["Change summary", "Impact assessment cards", "Recommendation", "Approver routing", "Decision history"],
      controls: ["frmChangeRequest", "cmbChangeType", "numScheduleImpact", "curBudgetImpact", "cmbScopeImpact", "txtRecommendation", "btnSubmitChange"],
      formulas: ["Impact level derives from budget, schedule, scope, and risk impacts", "Approval route changes by impact threshold", "Approved change prompts baseline update task"],
      dataSources: ["Change Requests", "Projects", "Approval History", "Actions"]
    },
    {
      name: "Owner Work Queue Screen",
      persona: "Risk, issue, and action owners",
      purpose: "Let owners update mitigation, due dates, and closure evidence without seeing the full PMO admin app.",
      layout: ["My open items", "Due soon and overdue grouping", "Update panel", "Closure evidence panel"],
      controls: ["galMyActions", "frmOwnerUpdate", "txtMitigationUpdate", "dpNewDueDate", "attClosureEvidence", "btnSubmitUpdate"],
      formulas: ["Items filter by current user email", "Due date extension requires reason", "Closure sets Closed Date and notifies PM"],
      dataSources: ["Risks and Issues", "Actions", "Communication Log"]
    }
  ],
  "communications-and-reporting": [
    {
      name: "Weekly Status Entry Screen",
      persona: "Project manager",
      purpose: "Capture consistent weekly status updates for reporting.",
      layout: ["Project header", "Health rating row", "Narrative fields", "Decisions and help needed", "Submit to PMO review"],
      controls: ["frmStatusUpdate", "cmbOverallHealth", "cmbScopeHealth", "cmbScheduleHealth", "cmbBudgetHealth", "txtAccomplishments", "txtNextSteps", "txtDecisionsNeeded", "btnSubmitStatus"],
      formulas: ["Health ratings required before submit", "Red health requires help-needed notes", "Submitted status locks update from project manager edits"],
      dataSources: ["Status Updates", "Projects", "Decision Requests"]
    },
    {
      name: "PMO Status Review Screen",
      persona: "PMO reviewer",
      purpose: "Review, publish, or request revisions before executive reporting.",
      layout: ["Submitted updates queue", "Selected update preview", "Quality checklist", "Publish or request revision actions"],
      controls: ["galSubmittedUpdates", "cntStatusPreview", "chkNarrativeQuality", "txtRevisionComments", "btnPublish", "btnRequestRevision"],
      formulas: ["Publish stamps Published Date and current reporting flag", "Revision sends comments back to PM", "Decision-needed text can generate Decision Request row"],
      dataSources: ["Status Updates", "Decision Requests", "Communication Log"]
    },
    {
      name: "Portfolio Reporting Workspace Screen",
      persona: "Executive or PMO lead",
      purpose: "Surface Power BI pages, decision queues, and report refresh status from one workspace.",
      layout: ["Embedded report links", "Red/yellow project queue", "Decisions needed", "Refresh and snapshot status"],
      controls: ["lnkPortfolioReport", "galRedProjects", "galDecisionRequests", "lblLastRefresh", "btnSendDigest"],
      formulas: ["Red projects gallery filters current status update", "Digest button triggers communications flow", "Decision queue filters open sponsor decisions"],
      dataSources: ["Status Updates", "Projects", "Decision Requests", "Report Snapshots"]
    }
  ]
};

export const pmoSolutionMaps: Record<string, PmoSolutionComponentMap> = {
  "intake-and-triage": {
    solutionName: "BV PMO Intake",
    publisherPrefix: "bvpmointake",
    tables: ["bv_intakerequest", "bv_scoringcriterion", "bv_triagedecision", "bv_communicationlog"],
    choices: ["bv_requesttype", "bv_intakestatus", "bv_complexity", "bv_triagedecisiontype"],
    apps: ["PMO Intake Portal", "PMO Triage Workbench"],
    flows: ["Intake - Confirm Submission", "Intake - Request Clarification", "Intake - Create Charter", "Intake - Weekly Aging Digest"],
    securityRoles: ["PMO Intake Requester", "PMO Triage Analyst", "PMO Sponsor Viewer", "PMO Executive Viewer"],
    environmentVariables: ["PMO Intake Site URL", "PMO Triage Team Email", "PMO Digest Channel URL", "Default Charter Owner"],
    dashboards: ["Demand Funnel", "Triage Aging", "Department Demand", "Decision Mix"]
  },
  "charter-and-approval": {
    solutionName: "BV PMO Charter",
    publisherPrefix: "bvpmocrt",
    tables: ["bv_projectcharter", "bv_stakeholder", "bv_successmeasure", "bv_approvalhistory", "bv_project"],
    choices: ["bv_charterstatus", "bv_stakeholderrole", "bv_approvaldecision", "bv_measuretype"],
    apps: ["Charter Draft App", "Sponsor Approval Portal", "PMO Charter Review"],
    flows: ["Charter - Submit PMO Review", "Charter - Sponsor Approval", "Charter - Request Revision", "Charter - Create Project"],
    securityRoles: ["Charter Author", "Charter PMO Reviewer", "Charter Sponsor Approver", "Portfolio Viewer"],
    environmentVariables: ["Charter Approval Timeout Days", "Sponsor Approval Email Template", "Project Site Base URL", "PMO Charter Support Email"],
    dashboards: ["Charter Approval Backlog", "Sponsor Queue", "Approved Value Pipeline", "Revision Rate"]
  },
  "stage-gates": {
    solutionName: "BV PMO Stage Gates",
    publisherPrefix: "bvpmogate",
    tables: ["bv_project", "bv_lifecyclestage", "bv_gatecriterion", "bv_gatereview", "bv_evidencelink", "bv_gateexception"],
    choices: ["bv_lifecyclestagechoice", "bv_gatereviewstatus", "bv_gatedecision", "bv_evidencetype"],
    apps: ["Project Lifecycle Dashboard", "Gate Evidence App", "Gate Approval Portal"],
    flows: ["Gate - Generate Criteria", "Gate - Submit Review", "Gate - Approval Decision", "Gate - Stage Change Notification"],
    securityRoles: ["Gate Project Manager", "Gate Approver", "Gate PMO Admin", "Gate Executive Viewer"],
    environmentVariables: ["Gate Review Team Email", "Gate Exception Owner", "Lifecycle Stage Config URL", "Power BI Refresh Flow URL"],
    dashboards: ["Lifecycle Pipeline", "Stage Aging", "Gate Exceptions", "Approval Bottlenecks"]
  },
  "change-risk-issue-control": {
    solutionName: "BV PMO Controls",
    publisherPrefix: "bvpmocntl",
    tables: ["bv_changerequest", "bv_raiditem", "bv_action", "bv_decision", "bv_escalation", "bv_impactassessment"],
    choices: ["bv_changetype", "bv_controlstatus", "bv_severity", "bv_raidtype", "bv_decisionstatus"],
    apps: ["RAID Register", "Change Request Portal", "Owner Work Queue"],
    flows: ["Control - Route Change Approval", "Control - Escalate Critical Risk", "Control - Overdue Owner Reminder", "Control - Close Item Notification"],
    securityRoles: ["Control Project Manager", "Control Item Owner", "Change Approver", "Executive Escalation Viewer"],
    environmentVariables: ["Critical Risk Channel URL", "Change Board Email", "Overdue Reminder Days", "Baseline Update Owner"],
    dashboards: ["Risk Heat Map", "Issue Aging", "Change Impact", "Open Decisions"]
  },
  "communications-and-reporting": {
    solutionName: "BV PMO Reporting",
    publisherPrefix: "bvpmorpt",
    tables: ["bv_statusupdate", "bv_milestone", "bv_communication", "bv_reportsnapshot", "bv_decisionrequest", "bv_benefittracking"],
    choices: ["bv_healthrating", "bv_statusupdatestate", "bv_milestonestatus", "bv_audience", "bv_decisionpriority"],
    apps: ["Weekly Status Entry", "PMO Status Review", "Portfolio Reporting Workspace"],
    flows: ["Reporting - Create Weekly Status Shells", "Reporting - Missed Update Escalation", "Reporting - Publish Digest", "Reporting - Snapshot Month End"],
    securityRoles: ["Status Project Manager", "Status PMO Reviewer", "Sponsor Report Viewer", "Executive Report Viewer"],
    environmentVariables: ["Status Due Day", "Executive Digest Recipients", "Power BI Workspace URL", "Report Snapshot Library URL"],
    dashboards: ["Executive Portfolio Overview", "Delivery Health Scorecard", "Milestone Variance", "Benefits Realization"]
  }
};

export function getPmoScreenBlueprintsBySlug(slug: string) {
  return pmoScreenBlueprints[slug] ?? [];
}

export function getPmoSolutionMapBySlug(slug: string) {
  return pmoSolutionMaps[slug];
}

export type PmoFormulaSnippet = {
  title: string;
  location: string;
  code: string;
  notes: string[];
};

export type PmoFlowSnippet = {
  name: string;
  trigger: string;
  steps: string[];
  expressions: string[];
};

export const pmoFormulaSnippets: Record<string, PmoFormulaSnippet[]> = {
  "intake-and-triage": [
    {
      title: "Submit intake request with validation",
      location: "btnSubmit.OnSelect",
      code: `If(
    IsBlank(Trim(txtProblemStatement.Text)) || IsBlank(cmbRequestType.Selected) || IsBlank(cmbSponsor.Selected),
    Notify("Complete request type, sponsor, and problem statement before submitting.", NotificationType.Warning),
    IfError(
        Patch(
            'Intake Requests',
            Coalesce(varCurrentRequest, Defaults('Intake Requests')),
            {
                Title: txtTitle.Text,
                'Request Type': cmbRequestType.Selected,
                Sponsor: cmbSponsor.Selected,
                'Problem Statement': txtProblemStatement.Text,
                'Current Status': { Value: "Submitted" },
                'Submitted Date': Now()
            }
        ),
        Notify("The request could not be submitted.", NotificationType.Error),
        Notify("Request submitted for PMO triage.", NotificationType.Success)
    )
);`,
      notes: ["Use Coalesce so the same button can submit a draft or new request.", "Keep status transition in the same Patch as Submitted Date.", "Replace SharePoint choice syntax with Dataverse choices if using Dataverse."]
    },
    {
      title: "Weighted triage score",
      location: "lblWeightedScore.Text",
      code: `With(
    {
        weightedScore: Sum(
            galScoringCriteria.AllItems,
            Value(txtScore.Text) * ThisRecord.Weight
        )
    },
    Text(weightedScore, "0")
)`,
      notes: ["Store the final score on the intake request when the decision is saved.", "Keep scoring criteria in a config table so weights are not hard-coded forever."]
    }
  ],
  "charter-and-approval": [
    {
      title: "Submit charter for PMO review",
      location: "btnSubmitForPmoReview.OnSelect",
      code: `If(
    CountRows(galSuccessMeasures.AllItems) = 0 || IsBlank(Trim(txtObjectives.Text)) || IsBlank(Trim(txtInScope.Text)),
    Notify("Add objectives, scope, and at least one success measure before PMO review.", NotificationType.Warning),
    IfError(
        Patch(
            'Project Charters',
            varCurrentCharter,
            {
                Objectives: txtObjectives.Text,
                'In Scope': txtInScope.Text,
                'Out of Scope': txtOutOfScope.Text,
                'Charter Status': { Value: "PMO Review" }
            }
        ),
        Notify("Charter could not be submitted.", NotificationType.Error),
        Notify("Charter sent to PMO review.", NotificationType.Success)
    )
);`,
      notes: ["Require success measures before approval so value tracking is not an afterthought.", "Lock major charter fields after sponsor approval."]
    },
    {
      title: "Create project after sponsor approval",
      location: "Sponsor approval success action",
      code: `Set(
    varProject,
    Patch(
        Projects,
        Defaults(Projects),
        {
            'Project Name': varCurrentCharter.'Project Name',
            Sponsor: varCurrentCharter.Sponsor,
            'Project Manager': varCurrentCharter.'Project Manager',
            'Current Stage': { Value: "Initiation" },
            'Overall Health': { Value: "Not Rated" }
        }
    )
);`,
      notes: ["Create the Project record once, from the approved charter.", "Use the created project ID to generate initial stage gate checklist rows."]
    }
  ],
  "stage-gates": [
    {
      title: "Enable submit gate review only when evidence is ready",
      location: "btnSubmitGate.DisplayMode",
      code: `If(
    CountRows(
        Filter(
            galGateCriteria.AllItems,
            Required = true && IsBlank('Evidence URL')
        )
    ) = 0,
    DisplayMode.Edit,
    DisplayMode.Disabled
)`,
      notes: ["Use a generated checklist row per project and stage.", "If attachments are used instead of URLs, check attachment count instead."]
    },
    {
      title: "Approve gate and move project stage",
      location: "btnSubmitGateDecision.OnSelect",
      code: `IfError(
    Patch(
        'Gate Reviews',
        varGateReview,
        {
            Decision: cmbGateDecision.Selected,
            'Decision Date': Now(),
            Comments: txtGateComments.Text
        }
    );
    If(
        cmbGateDecision.Selected.Value in ["Approved", "Approved with Exception"],
        Patch(Projects, varCurrentProject, { 'Current Stage': cmbNextStage.Selected, 'Stage Changed Date': Today() })
    ),
    Notify("Gate decision could not be saved.", NotificationType.Error),
    Notify("Gate decision saved.", NotificationType.Success)
);`,
      notes: ["Gate approval and project stage update should be treated as one business transaction.", "Create an action item when the decision is approved with exception."]
    }
  ],
  "change-risk-issue-control": [
    {
      title: "Calculate RAID heat score",
      location: "lblHeatScore.Text",
      code: `With(
    {
        heatScore: Coalesce(Value(cmbProbability.Selected.Value), 1) * Coalesce(Value(cmbImpact.Selected.Value), 1)
    },
    Text(heatScore, "0")
)`,
      notes: ["Use probability only for risks; issues can default probability to 1.", "Use the score to drive escalation and Power BI heat maps."]
    },
    {
      title: "Close RAID item with evidence",
      location: "btnCloseItem.OnSelect",
      code: `If(
    IsBlank(Trim(txtClosureNotes.Text)),
    Notify("Add closure notes before closing this item.", NotificationType.Warning),
    IfError(
        Patch(
            'Risks and Issues',
            varSelectedRaidItem,
            {
                Status: { Value: "Closed" },
                'Closed Date': Today(),
                'Closure Notes': txtClosureNotes.Text
            }
        ),
        Notify("Item could not be closed.", NotificationType.Error),
        Notify("Item closed.", NotificationType.Success)
    )
);`,
      notes: ["Closure evidence is what makes RAID history useful later.", "Notify the project manager when an owner closes an escalated item."]
    }
  ],
  "communications-and-reporting": [
    {
      title: "Require help-needed notes for red health",
      location: "btnSubmitStatus.DisplayMode",
      code: `If(
    cmbOverallHealth.Selected.Value = "Red" && IsBlank(Trim(txtHelpNeeded.Text)),
    DisplayMode.Disabled,
    DisplayMode.Edit
)`,
      notes: ["Red status without help-needed notes creates executive noise.", "Show a small field-level message explaining why submit is disabled."]
    },
    {
      title: "Submit weekly status update",
      location: "btnSubmitStatus.OnSelect",
      code: `IfError(
    Patch(
        'Status Updates',
        varCurrentStatusUpdate,
        {
            'Overall Health': cmbOverallHealth.Selected,
            'Scope Health': cmbScopeHealth.Selected,
            'Schedule Health': cmbScheduleHealth.Selected,
            'Budget Health': cmbBudgetHealth.Selected,
            'Key Accomplishments': txtAccomplishments.Text,
            'Next Steps': txtNextSteps.Text,
            'Decisions Needed': txtDecisionsNeeded.Text,
            Status: { Value: "Submitted" },
            'Submitted Date': Now()
        }
    ),
    Notify("Status update could not be submitted.", NotificationType.Error),
    Notify("Status update submitted to PMO review.", NotificationType.Success)
);`,
      notes: ["Create the status shell with a scheduled flow before the reporting period starts.", "Publishing should happen after PMO review, not directly from the PM screen."]
    }
  ]
};

export const pmoFlowSnippets: Record<string, PmoFlowSnippet[]> = {
  "intake-and-triage": [
    {
      name: "Intake - Confirm Submission",
      trigger: "When an intake request is created or status changes to Submitted.",
      steps: ["Check Current Status equals Submitted.", "Send confirmation email to requester.", "Post adaptive card or Teams message to triage channel.", "Create initial triage decision row assigned to PMO queue.", "Write Communication Log row."],
      expressions: ["@equals(triggerOutputs()?['body/CurrentStatus/Value'], 'Submitted')", "coalesce(triggerOutputs()?['body/Sponsor/Email'], 'unassigned')"]
    },
    {
      name: "Intake - Create Charter",
      trigger: "When triage decision changes to Approved for Charter.",
      steps: ["Get intake request.", "Create Project Charter record.", "Copy sponsor, business unit, request title, problem statement, and expected benefit.", "Update intake Next Stage to Charter.", "Notify requester and charter owner."],
      expressions: ["@equals(triggerOutputs()?['body/Decision/Value'], 'Approved for Charter')", "formatDateTime(utcNow(), 'yyyy-MM-dd')"]
    }
  ],
  "charter-and-approval": [
    {
      name: "Charter - Sponsor Approval",
      trigger: "When Charter Status changes to Sponsor Review.",
      steps: ["Get charter and stakeholder details.", "Start and wait for approval assigned to Sponsor.", "If approved, update Charter Status to Approved.", "Create Project record and first lifecycle stage.", "If rejected or revision requested, update status and send comments to author."],
      expressions: ["@equals(triggerOutputs()?['body/CharterStatus/Value'], 'Sponsor Review')", "outputs('Start_and_wait_for_an_approval')?['body/outcome']"]
    }
  ],
  "stage-gates": [
    {
      name: "Gate - Generate Criteria",
      trigger: "When Project Current Stage changes.",
      steps: ["List active Gate Criteria for the new stage.", "Create project-specific checklist rows.", "Assign evidence owners.", "Notify project manager that stage checklist is ready."],
      expressions: ["triggerOutputs()?['body/CurrentStage/Value']", "items('Apply_to_each_criterion')?['Required']"]
    },
    {
      name: "Gate - Approval Decision",
      trigger: "When Gate Review status changes to Submitted.",
      steps: ["Collect evidence links.", "Start approval for gate approver.", "Update Gate Review decision and decision date.", "If approved, update Project Current Stage.", "If approved with exception, create exception action."],
      expressions: ["@equals(triggerOutputs()?['body/ReviewStatus/Value'], 'Submitted')", "@or(equals(variables('Decision'), 'Approved'), equals(variables('Decision'), 'Approved with Exception'))"]
    }
  ],
  "change-risk-issue-control": [
    {
      name: "Control - Escalate Critical Risk",
      trigger: "When a risk or issue is created or severity changes.",
      steps: ["Check severity and heat score.", "If critical or escalated, post Teams alert to sponsor and PMO lead.", "Create escalation record.", "Create owner action with due date.", "Write communication log."],
      expressions: ["@or(equals(triggerOutputs()?['body/Severity/Value'], 'Critical'), greaterOrEquals(triggerOutputs()?['body/HeatScore'], 12))", "addDays(utcNow(), 3)"]
    },
    {
      name: "Control - Route Change Approval",
      trigger: "When Change Request status changes to Submitted.",
      steps: ["Calculate impact level from schedule, budget, scope, and risk.", "Route low impact to PMO lead and high impact to sponsor/change board.", "Update decision fields.", "Create baseline update action after approval."],
      expressions: ["@equals(triggerOutputs()?['body/Status/Value'], 'Submitted')", "if(greater(triggerOutputs()?['body/BudgetImpact'], 25000), 'Sponsor', 'PMO Lead')"]
    }
  ],
  "communications-and-reporting": [
    {
      name: "Reporting - Create Weekly Status Shells",
      trigger: "Scheduled weekly before status updates are due.",
      steps: ["List active projects.", "Create draft Status Update for each project and reporting period if missing.", "Email project managers with direct links.", "Post PMO summary of missing drafts."],
      expressions: ["formatDateTime(utcNow(), 'yyyy-\\WW')", "@equals(items('Apply_to_each_project')?['Status'], 'Active')"]
    },
    {
      name: "Reporting - Publish Digest",
      trigger: "When PMO publishes status updates or on weekly schedule.",
      steps: ["List current published status updates.", "Group red and yellow projects.", "List decisions needed.", "Refresh Power BI dataset.", "Send executive digest email or Teams post."],
      expressions: ["@equals(item()?['IsCurrent'], true)", "join(variables('DecisionLinks'), '<br/>')"]
    }
  ]
};

export function getPmoFormulaSnippetsBySlug(slug: string) {
  return pmoFormulaSnippets[slug] ?? [];
}

export function getPmoFlowSnippetsBySlug(slug: string) {
  return pmoFlowSnippets[slug] ?? [];
}


export type PmoRoadmapPhase = {
  phase: string;
  timebox: string;
  goal: string;
  modules: string[];
  deliverables: string[];
  activities: string[];
  exitCriteria: string[];
  adoptionRisks: string[];
};

export type PmoOperatingModelItem = {
  area: string;
  owner: string;
  cadence: string;
  responsibilities: string[];
};

export const pmoRoadmapPhases: PmoRoadmapPhase[] = [
  {
    phase: "Phase 1",
    timebox: "Days 1-30",
    goal: "Create one visible source of truth for demand and approved work before building heavier governance.",
    modules: ["intake-and-triage", "charter-and-approval"],
    deliverables: [
      "Intake request table or list with required fields and triage status model.",
      "Requester intake form with save draft and submit behavior.",
      "PMO triage queue with scoring, decision reason, owner, and aging views.",
      "Project charter record linked to approved intake.",
      "Sponsor approval workflow with revision loop and approval history."
    ],
    activities: [
      "Run a working session to define request types, sponsor roles, intake questions, and required triage decisions.",
      "Build the intake data model first, then add requester and PMO views.",
      "Create two to three sample requests from real historical demand so stakeholders can react to something concrete.",
      "Add confirmation, clarification, and decision notifications before expanding reporting.",
      "Move approved requests into charter records so intake does not become another static spreadsheet."
    ],
    exitCriteria: [
      "Every new request can be submitted through one intake experience.",
      "The PMO can see unassigned, aging, and high-priority demand in a queue.",
      "Approved intake creates or links to a charter record.",
      "Sponsors can approve, reject, or request revision with comments.",
      "Basic intake and charter metrics are visible in Power BI or a simple dashboard."
    ],
    adoptionRisks: [
      "Too many intake fields will push users back to email.",
      "Unclear sponsor ownership will stall approvals.",
      "If decisions are not communicated automatically, users will assume the portal is a black hole."
    ]
  },
  {
    phase: "Phase 2",
    timebox: "Days 31-60",
    goal: "Add lifecycle control so approved work moves through standard gates with evidence, exceptions, and decisions.",
    modules: ["stage-gates", "change-risk-issue-control"],
    deliverables: [
      "Project table or list with current lifecycle stage, health, sponsor, PM, and baseline dates.",
      "Gate criteria template with generated project-specific checklist rows.",
      "Gate review screen with evidence links, approver, decision, and exception reason.",
      "Change request portal with scope, schedule, budget, risk, and benefit impact fields.",
      "Risk, issue, action, decision, and escalation records connected to projects."
    ],
    activities: [
      "Define a practical stage model with no more than seven stages and objective exit criteria.",
      "Create gate criteria that can be answered with evidence, not vague confidence statements.",
      "Add a stage-change approval flow that writes history instead of overwriting prior decisions.",
      "Build RAID owner queues so risks and issues become daily work, not meeting-only artifacts.",
      "Create escalation thresholds for critical risks, overdue actions, and high-impact changes."
    ],
    exitCriteria: [
      "Projects cannot advance stages without a gate review record.",
      "Gate exceptions are captured with approver, reason, and follow-up action.",
      "Every open risk, issue, action, and change has an owner and due date.",
      "Critical risks and overdue actions trigger stakeholder notifications.",
      "Lifecycle, gate, RAID, and change-control reporting can be reviewed weekly."
    ],
    adoptionRisks: [
      "Gate criteria that feel ceremonial will be ignored.",
      "If RAID items do not create owner work queues, they become another reporting chore.",
      "Change approval thresholds must match the organization or every change will feel escalated."
    ]
  },
  {
    phase: "Phase 3",
    timebox: "Days 61-90",
    goal: "Turn operational PMO records into executive reporting, stakeholder communications, and a repeatable governance cadence.",
    modules: ["communications-and-reporting"],
    deliverables: [
      "Weekly status update form with health, milestones, decisions needed, and help needed.",
      "Executive portfolio dashboard with demand, stage, health, RAID, changes, and decisions.",
      "Stakeholder digest workflow for red/yellow projects and open sponsor decisions.",
      "Monthly benefits review view or report page.",
      "PMO operating cadence for triage, gate review, RAID review, and executive reporting."
    ],
    activities: [
      "Standardize health definitions before building report pages.",
      "Create draft status shells automatically so project managers update rather than start from scratch.",
      "Separate executive dashboards from PMO working queues.",
      "Build a weekly digest around decisions needed and exceptions, not a wall of project text.",
      "Review usage data and remove fields, reports, or workflows that are not driving decisions."
    ],
    exitCriteria: [
      "Project managers can submit current status updates on a predictable cadence.",
      "Executives can see portfolio health, exceptions, and decisions needed without opening raw lists.",
      "Sponsors receive timely communications when their input is required.",
      "Benefits measures are tracked after launch or closeout.",
      "The PMO has documented operating rhythms and ownership for each part of the system."
    ],
    adoptionRisks: [
      "Dashboard pages that mirror raw lists will not change executive behavior.",
      "Red/yellow/green status must be defined or reporting will become political.",
      "Communications should be brief and decision-oriented or stakeholders will tune them out."
    ]
  }
];

export const pmoOperatingModel: PmoOperatingModelItem[] = [
  {
    area: "Demand triage",
    owner: "PMO intake lead",
    cadence: "Twice weekly",
    responsibilities: ["Review new requests", "Assign triage owners", "Request clarification", "Move approved demand to charter"]
  },
  {
    area: "Sponsor approval",
    owner: "Business sponsor group",
    cadence: "Weekly",
    responsibilities: ["Approve or reject charters", "Resolve revision requests", "Confirm value and scope boundaries", "Name accountable owners"]
  },
  {
    area: "Gate governance",
    owner: "PMO governance lead",
    cadence: "Weekly or by stage movement",
    responsibilities: ["Review gate evidence", "Approve exceptions", "Record stage changes", "Escalate blocked transitions"]
  },
  {
    area: "RAID and change control",
    owner: "Delivery governance lead",
    cadence: "Weekly",
    responsibilities: ["Review overdue actions", "Escalate critical risks", "Route change approvals", "Confirm closure evidence"]
  },
  {
    area: "Executive reporting",
    owner: "PMO reporting lead",
    cadence: "Weekly status and monthly portfolio review",
    responsibilities: ["Publish portfolio dashboard", "Send stakeholder digest", "Track decisions needed", "Maintain benefits review views"]
  }
];


export type PmoModuleComparison = {
  slug: string;
  complexity: "Low" | "Medium" | "High";
  buildWhen: string;
  dependencies: string[];
  firstReleaseScope: string[];
  dataSources: string[];
  appScreens: string[];
  automations: string[];
  reports: string[];
  workingSignals: string[];
};

export type PmoGlossaryTerm = {
  term: string;
  definition: string;
  buildImplication: string;
};

export type PmoDemoStep = {
  title: string;
  actor: string;
  action: string;
  systemBehavior: string[];
  proofPoint: string;
};

export type PmoOfferSection = {
  title: string;
  summary: string;
  bullets: string[];
};

export const pmoModuleComparisons: PmoModuleComparison[] = [
  {
    slug: "intake-and-triage",
    complexity: "Low",
    buildWhen: "Build first when requests arrive through email, Teams, spreadsheets, and informal conversations.",
    dependencies: ["Request category list", "Sponsor or department owner list", "Basic status choices"],
    firstReleaseScope: ["Submit request form", "PMO triage queue", "Scoring and decision fields", "Confirmation and decision notifications"],
    dataSources: ["Intake Requests", "Scoring Criteria", "Triage Decisions", "Communication Log"],
    appScreens: ["Request intake submit screen", "Requester status screen", "PMO triage queue", "Triage scoring screen"],
    automations: ["Submission confirmation", "Clarification request", "Decision notification", "Approved intake to charter shell"],
    reports: ["Demand funnel", "Aging intake", "Requests by business unit", "Approved, deferred, rejected mix"],
    workingSignals: ["Users stop emailing new requests", "PMO can see untriaged demand", "Sponsors receive clear decisions", "Approved work moves into charter without retyping"]
  },
  {
    slug: "charter-and-approval",
    complexity: "Medium",
    buildWhen: "Build after intake when approved ideas need scope, value, sponsor alignment, and delivery ownership.",
    dependencies: ["Approved intake records", "Sponsor role model", "Approval comments history", "Project manager or delivery owner list"],
    firstReleaseScope: ["Charter draft form", "PMO completeness review", "Sponsor approval screen", "Printable charter summary"],
    dataSources: ["Project Charters", "Stakeholders", "Success Measures", "Approval History"],
    appScreens: ["Charter drafting screen", "PMO quality review screen", "Sponsor approval screen", "Charter summary screen"],
    automations: ["Create charter from intake", "Sponsor approval", "Revision request", "Approved charter to project record"],
    reports: ["Charters awaiting approval", "Approval cycle time", "Approved value pipeline", "Revision rate"],
    workingSignals: ["Sponsors approve with comments", "Scope exclusions are captured", "Approved charters create project records", "Revision loops are visible"]
  },
  {
    slug: "stage-gates",
    complexity: "High",
    buildWhen: "Build when projects are moving forward without consistent evidence, entry criteria, exit criteria, or approval history.",
    dependencies: ["Project records", "Lifecycle stage model", "Gate criteria library", "Gate approver roles"],
    firstReleaseScope: ["Project lifecycle dashboard", "Gate checklist", "Evidence links", "Gate approval decision"],
    dataSources: ["Projects", "Lifecycle Stages", "Gate Criteria", "Gate Reviews", "Evidence Links", "Gate Decisions"],
    appScreens: ["Project lifecycle dashboard", "Gate checklist screen", "Gate approval screen", "Stage audit timeline"],
    automations: ["Generate criteria for stage", "Gate readiness reminder", "Gate approval", "Stage transition notification"],
    reports: ["Projects by stage", "Stage aging", "Gate exception rate", "Overdue gates"],
    workingSignals: ["Projects do not advance without gate decisions", "Exceptions have owners", "Evidence is linked", "Stage history is auditable"]
  },
  {
    slug: "change-risk-issue-control",
    complexity: "High",
    buildWhen: "Build when risks, issues, decisions, and changes live in meeting notes and cannot be trusted as an operational source of truth.",
    dependencies: ["Project records", "Owner role model", "Severity and impact definitions", "Escalation thresholds"],
    firstReleaseScope: ["Change request form", "Risk and issue registers", "Owner work queue", "Escalation and overdue reminders"],
    dataSources: ["Change Requests", "Risks", "Issues", "Actions", "Decisions", "Escalations", "Impact Assessments"],
    appScreens: ["Change request form", "Risk register", "Issue register", "Weekly RAID review dashboard"],
    automations: ["Critical risk escalation", "Overdue mitigation reminder", "Change approval routing", "Closure confirmation"],
    reports: ["RAID dashboard", "Change impact dashboard", "Risk heat map", "Issue aging"],
    workingSignals: ["Every open item has owner and due date", "Critical exposure is escalated", "Approved changes trigger baseline updates", "Closure requires evidence"]
  },
  {
    slug: "communications-and-reporting",
    complexity: "Medium",
    buildWhen: "Build after core operational records exist and leaders need exception reporting, decision requests, and repeatable stakeholder updates.",
    dependencies: ["Project records", "Status definitions", "Milestone records", "Power BI workspace", "Audience list"],
    firstReleaseScope: ["Weekly status form", "PMO review queue", "Executive dashboard", "Stakeholder digest"],
    dataSources: ["Status Updates", "Milestones", "Communications", "Report Snapshots", "Decision Requests", "Benefits Tracking"],
    appScreens: ["Weekly status update form", "Executive summary screen", "Milestone update screen", "Benefits review screen"],
    automations: ["Create weekly status shells", "Missed update escalation", "Power BI refresh", "Executive digest"],
    reports: ["Portfolio health", "Missing status", "Milestone variance", "Benefits realization"],
    workingSignals: ["Executives see decisions needed", "Status updates are current", "Dashboards show exceptions, not raw list dumps", "Sponsors receive concise digests"]
  }
];

export const pmoGlossaryTerms: PmoGlossaryTerm[] = [
  { term: "Demand intake", definition: "The controlled path for capturing new project, automation, reporting, enhancement, or process-improvement requests.", buildImplication: "Create one request record with status, sponsor, category, problem statement, benefit, and decision history." },
  { term: "Triage", definition: "The PMO review process that validates completeness, scores demand, and decides whether to approve, defer, reject, or request clarification.", buildImplication: "Use a queue with aging, owner, score, decision reason, and automatic notifications." },
  { term: "Project charter", definition: "The lightweight agreement that defines scope, objectives, value, sponsor, assumptions, dependencies, and ownership before delivery begins.", buildImplication: "Link the charter to approved intake and require sponsor approval before a project record is opened." },
  { term: "Stage gate", definition: "A formal lifecycle checkpoint that verifies required evidence before a project moves to the next stage.", buildImplication: "Use gate criteria, evidence links, approver decisions, exception reasons, and stage history records." },
  { term: "Gate evidence", definition: "The artifact, link, approval, plan, or test result used to prove a stage exit criterion has been met.", buildImplication: "Store evidence as rows or links tied to a gate review instead of free-text status notes." },
  { term: "RAID", definition: "A combined governance view of risks, actions, issues, and decisions that need ownership and follow-up.", buildImplication: "Require owner, due date, severity, status, escalation flag, and closure evidence for active items." },
  { term: "Change request", definition: "A controlled request to change scope, schedule, budget, risk, or expected benefits after baseline approval.", buildImplication: "Capture impact assessment, decision, approver, baseline update action, and communication history." },
  { term: "Decision log", definition: "The record of decisions needed, options considered, final decision, decision maker, rationale, and date.", buildImplication: "Keep decisions linked to project, intake, gate, change, or status records so reporting has context." },
  { term: "Benefits review", definition: "The post-launch or periodic check that determines whether the approved work created the expected business value.", buildImplication: "Track benefit metric, baseline, target, current value, measurement date, and accountable owner." },
  { term: "Executive digest", definition: "A concise stakeholder update focused on portfolio health, exceptions, decisions needed, and upcoming governance events.", buildImplication: "Generate from current PMO records and avoid sending raw list exports." }
];

export const pmoDemoSteps: PmoDemoStep[] = [
  {
    title: "A department submits a new automation request",
    actor: "Business requester",
    action: "Completes the intake form with problem statement, sponsor, expected benefit, complexity, timing, and attachments.",
    systemBehavior: ["Creates an Intake Request record", "Sets status to Submitted", "Sends confirmation to requester", "Posts new demand to the PMO triage queue"],
    proofPoint: "The PMO can see the request without searching email or Teams threads."
  },
  {
    title: "The PMO triages and approves the request for charter",
    actor: "PMO intake lead",
    action: "Reviews completeness, assigns score, captures decision reason, and marks the request approved for charter.",
    systemBehavior: ["Creates a triage decision row", "Copies key fields into a Project Charter shell", "Notifies the requester and sponsor", "Updates the intake funnel"],
    proofPoint: "Demand is converted into a governed work candidate without duplicate entry."
  },
  {
    title: "The sponsor approves the charter",
    actor: "Business sponsor",
    action: "Reviews scope, value, assumptions, risks, and success measures, then approves with comments.",
    systemBehavior: ["Writes approval history", "Creates the project record", "Opens the first lifecycle stage", "Notifies the project manager"],
    proofPoint: "The project begins with sponsor alignment and a traceable approval."
  },
  {
    title: "The project submits a gate review",
    actor: "Project manager",
    action: "Completes stage criteria, links required evidence, and submits the gate for approval.",
    systemBehavior: ["Routes the gate decision", "Records approver comments", "Moves stage when approved", "Creates exception action if approved with exception"],
    proofPoint: "Lifecycle movement is based on evidence rather than informal status updates."
  },
  {
    title: "A risk becomes critical and is escalated",
    actor: "Risk owner",
    action: "Updates probability, impact, mitigation plan, and escalation flag on a project risk.",
    systemBehavior: ["Calculates exposure", "Posts alert to sponsor and PMO lead", "Creates escalation record", "Adds owner action with due date"],
    proofPoint: "High exposure is visible before it becomes a surprise executive escalation."
  },
  {
    title: "Executives receive portfolio reporting",
    actor: "PMO reporting lead",
    action: "Publishes current status updates and sends the weekly digest.",
    systemBehavior: ["Refreshes Power BI", "Groups red and yellow projects", "Lists decisions needed", "Sends stakeholder digest"],
    proofPoint: "Leadership sees exceptions and decisions needed without opening operational lists."
  }
];

export const pmoOfferSections: PmoOfferSection[] = [
  {
    title: "Who this is for",
    summary: "PMO teams that need intake, governance, delivery control, and reporting but want to build on Microsoft 365 and Power Platform before buying a large enterprise PMO platform.",
    bullets: ["Small or growing PMO teams", "Operations teams managing project demand", "Power Platform centers of excellence", "IT teams replacing spreadsheet-based governance"]
  },
  {
    title: "What the toolkit helps you build",
    summary: "A modular PMO operating system made from practical portals, workflows, dashboards, templates, and governance routines.",
    bullets: ["Demand intake and triage", "Charter and sponsor approval", "Stage gates and lifecycle control", "RAID and change request management", "Executive reporting and communication digests"]
  },
  {
    title: "Implementation path",
    summary: "Start with the smallest useful PMO workflow, then expand into a connected lifecycle as the data and operating cadence mature.",
    bullets: ["Days 1-30: intake and charter foundation", "Days 31-60: stage gates, RAID, and change control", "Days 61-90: communications, reporting, and operating cadence", "Ongoing: backlog improvements and governance tuning"]
  },
  {
    title: "What is included",
    summary: "BuilderVault provides the reference material needed to plan and build the system with your existing Microsoft tools.",
    bullets: ["Solution architecture", "Data dictionary", "Power Apps screen blueprints", "Power Automate recipes", "Power BI KPI catalog", "Downloadable build guides and starter files"]
  },
  {
    title: "Design principles",
    summary: "The toolkit is intentionally lightweight, modular, and grounded in PMO behavior rather than software feature sprawl.",
    bullets: ["Build focused tools instead of one giant app", "Use evidence and decision history instead of status theater", "Separate executive reporting from operational queues", "Keep ownership, due dates, and escalation paths visible"]
  }
];

export type PmoPortalMockup = {
  slug: string;
  title: string;
  moduleSlug: string;
  persona: string;
  purpose: string;
  layout: string[];
  metrics: { label: string; value: string }[];
  fields: string[];
  queueItems: { title: string; meta: string; status: string }[];
  actions: string[];
  buildNotes: string[];
  briefHref: string;
};

export const pmoPortalMockups: PmoPortalMockup[] = [
  {
    slug: "intake-portal",
    briefHref: "/pmo-guides/intake-portal-mockup-brief.md",
    title: "Intake portal mockup",
    moduleSlug: "intake-and-triage",
    persona: "Business requester and PMO triage lead",
    purpose: "Show how a simple intake form and triage queue can replace scattered email demand.",
    layout: ["Left-side request form", "Right-side submission checklist", "PMO triage queue below", "Decision summary panel"],
    metrics: [
      { label: "New requests", value: "18" },
      { label: "Aging over 7 days", value: "5" },
      { label: "Approved this month", value: "11" }
    ],
    fields: ["Request type", "Business unit", "Sponsor", "Problem statement", "Expected benefit", "Complexity", "Desired start", "Attachments"],
    queueItems: [
      { title: "Automate invoice exception review", meta: "Finance / High benefit", status: "Ready for triage" },
      { title: "Replace manual onboarding checklist", meta: "HR / Medium complexity", status: "Clarification needed" },
      { title: "Power BI executive sales view", meta: "Sales / Sponsor review", status: "Submitted" }
    ],
    actions: ["Save draft", "Submit request", "Request clarification", "Approve for charter"],
    buildNotes: ["Keep requester fields short and plain-language.", "Hide score and decision fields from submitters.", "Use the triage queue as the PMO daily work surface."]
  },
  {
    slug: "charter-approval",
    briefHref: "/pmo-guides/charter-approval-mockup-brief.md",
    title: "Charter approval mockup",
    moduleSlug: "charter-and-approval",
    persona: "Sponsor, PMO reviewer, and project manager",
    purpose: "Turn approved demand into a scoped charter with sponsor signoff and revision history.",
    layout: ["Charter summary header", "Scope and value form", "Stakeholder and success measure sections", "Sponsor decision panel"],
    metrics: [
      { label: "Awaiting sponsor", value: "7" },
      { label: "Avg approval days", value: "4.8" },
      { label: "Revision rate", value: "22%" }
    ],
    fields: ["Project name", "Sponsor", "Project manager", "Objectives", "In scope", "Out of scope", "Success measures", "Assumptions", "Key risks"],
    queueItems: [
      { title: "Customer service case automation", meta: "Sponsor: Operations VP", status: "Sponsor review" },
      { title: "Vendor renewal tracker", meta: "Sponsor: Procurement", status: "PMO review" },
      { title: "Warehouse safety inspection app", meta: "Sponsor: Facilities", status: "Revision requested" }
    ],
    actions: ["Send to sponsor", "Request revision", "Approve charter", "Create project"],
    buildNotes: ["Make scope exclusions mandatory for risky projects.", "Keep approval comments visible to the author.", "Create the project record only after sponsor approval."]
  },
  {
    slug: "gate-review",
    briefHref: "/pmo-guides/gate-review-mockup-brief.md",
    title: "Gate review mockup",
    moduleSlug: "stage-gates",
    persona: "Project manager, gate approver, and PMO governance lead",
    purpose: "Show stage readiness, required evidence, exceptions, and approval decisions in one view.",
    layout: ["Project stage header", "Gate criteria checklist", "Evidence links table", "Approval and exception panel"],
    metrics: [
      { label: "Projects in build", value: "14" },
      { label: "Overdue gates", value: "3" },
      { label: "Exception rate", value: "16%" }
    ],
    fields: ["Current stage", "Gate criterion", "Evidence URL", "Owner", "Due date", "Approver", "Decision", "Exception reason"],
    queueItems: [
      { title: "Planning exit review", meta: "6 of 7 criteria complete", status: "Gate prep" },
      { title: "Testing entry review", meta: "Evidence missing: test plan", status: "Blocked" },
      { title: "Launch readiness", meta: "Approver: PMO governance", status: "Submitted" }
    ],
    actions: ["Attach evidence", "Submit gate", "Approve with exception", "Move stage"],
    buildNotes: ["Generate checklist rows from a criteria template.", "Write stage history instead of overwriting old decisions.", "Require exception owners and due dates."]
  },
  {
    slug: "raid-control",
    briefHref: "/pmo-guides/raid-control-mockup-brief.md",
    title: "RAID and change control mockup",
    moduleSlug: "change-risk-issue-control",
    persona: "Project manager, risk owner, PMO lead, and sponsor",
    purpose: "Bring risks, issues, actions, decisions, and change requests into an operational control center.",
    layout: ["RAID summary tiles", "Owner work queue", "Risk heat panel", "Change approval list"],
    metrics: [
      { label: "Critical risks", value: "4" },
      { label: "Overdue actions", value: "9" },
      { label: "Pending changes", value: "6" }
    ],
    fields: ["Project", "Item type", "Severity", "Probability", "Impact", "Owner", "Due date", "Mitigation", "Decision needed"],
    queueItems: [
      { title: "Integration vendor delay", meta: "Owner: Maya / Exposure 15", status: "Escalated" },
      { title: "Scope change: add mobile approvals", meta: "Budget impact: $18k", status: "Under review" },
      { title: "Training material approval", meta: "Due yesterday", status: "Overdue" }
    ],
    actions: ["Escalate", "Assign owner", "Route change", "Close with evidence"],
    buildNotes: ["Treat risks and issues differently in the data model.", "Make owner and due date required on every active item.", "Use heat score and severity to drive alerts."]
  },
  {
    slug: "executive-dashboard",
    briefHref: "/pmo-guides/executive-dashboard-mockup-brief.md",
    title: "Executive dashboard mockup",
    moduleSlug: "communications-and-reporting",
    persona: "Executive sponsor, PMO director, and portfolio steering group",
    purpose: "Convert PMO records into portfolio health, exceptions, decisions needed, and benefits visibility.",
    layout: ["Portfolio health ribbon", "Stage and demand charts", "Exception list", "Decision requests and benefits review"],
    metrics: [
      { label: "Red projects", value: "5" },
      { label: "Decisions needed", value: "8" },
      { label: "Benefits tracked", value: "71%" }
    ],
    fields: ["Overall health", "Stage", "Milestone variance", "Decision needed", "Sponsor", "Benefit metric", "Target", "Current value"],
    queueItems: [
      { title: "ERP reporting rollout", meta: "Decision: launch date tradeoff", status: "Red" },
      { title: "Field inspection app", meta: "Gate exception due Friday", status: "Yellow" },
      { title: "Invoice automation", meta: "Benefit review in 30 days", status: "Green" }
    ],
    actions: ["Open decision", "Send digest", "Refresh Power BI", "Snapshot month end"],
    buildNotes: ["Separate executive pages from PMO working queues.", "Use health definitions before publishing dashboards.", "Lead with exceptions and decisions, not raw activity counts."]
  }
];



export type PmoArchitectureLayer = {
  layer: string;
  purpose: string;
  components: string[];
  designNotes: string[];
};

export type PmoArchitectureDecision = {
  decision: string;
  useSharePointWhen: string[];
  useDataverseWhen: string[];
};

export type PmoSecurityRole = {
  role: string;
  access: string;
  notes: string[];
};

export type PmoEnvironmentStep = {
  stage: string;
  purpose: string;
  requiredPractices: string[];
};

export const pmoArchitectureLayers: PmoArchitectureLayer[] = [
  {
    layer: "Experience layer",
    purpose: "Focused portals and apps for each PMO workflow instead of one giant all-purpose application.",
    components: ["Power Apps requester and PMO workbench screens", "Power Pages intake portal when external or broad business access is needed", "Model-driven admin views for Dataverse-heavy builds", "Power BI app for executive and PMO reporting"],
    designNotes: ["Separate requester experiences from PMO-only work queues.", "Use role-based navigation so sponsors, PMs, and executives see only relevant actions.", "Keep forms short at intake and add detail as work moves through the lifecycle."]
  },
  {
    layer: "Operational data layer",
    purpose: "The source of truth for demand, charters, projects, gates, RAID, changes, decisions, status updates, and benefits.",
    components: ["SharePoint lists for lightweight MVPs", "Dataverse tables for relational security and lifecycle maturity", "Choice sets for status, health, severity, and decision outcomes", "Audit/history tables for approvals, stage movement, decisions, and communications"],
    designNotes: ["Design around lifecycle records, not screens.", "Use lookup relationships for projects, sponsors, gates, risks, issues, and decisions.", "Do not overwrite history fields when a separate history row is needed."]
  },
  {
    layer: "Automation layer",
    purpose: "Power Automate flows that route approvals, reminders, escalations, notifications, history writes, and report refreshes.",
    components: ["Submission confirmations", "Sponsor approvals", "Gate approval routing", "Critical risk and overdue action escalations", "Weekly status shells and executive digest", "Power BI refresh triggers"],
    designNotes: ["Use connection references and environment variables from the beginning.", "Keep business-critical decision writes explicit and auditable.", "Create communication log rows when flows notify stakeholders."]
  },
  {
    layer: "Reporting layer",
    purpose: "Power BI semantic model and dashboards for portfolio health, lifecycle movement, exceptions, decisions, and benefits.",
    components: ["Demand funnel", "Lifecycle and stage aging", "Gate exception dashboard", "RAID and change impact dashboards", "Executive portfolio health", "Benefits review pages"],
    designNotes: ["Separate operational queues from executive pages.", "Define health, severity, and status before building visuals.", "Build reports from curated views or modeled tables instead of raw list exports when the system matures."]
  },
  {
    layer: "Collaboration layer",
    purpose: "Teams, email, and stakeholder digest patterns that keep PMO decisions visible without making users live inside lists.",
    components: ["Teams triage channel posts", "Sponsor approval notifications", "Overdue owner reminders", "Executive digest messages", "Decision-needed alerts"],
    designNotes: ["Send fewer, more decision-oriented notifications.", "Link messages back to the relevant app, record, or report.", "Use Teams for visibility, not as the system of record."]
  }
];

export const pmoArchitectureDecisionGuide: PmoArchitectureDecision = {
  decision: "SharePoint versus Dataverse",
  useSharePointWhen: [
    "The PMO is small and needs a fast MVP.",
    "Security can be handled at site, list, or simple item ownership level.",
    "Relationships are light and mostly lookup-style.",
    "The first goal is demand visibility and basic reporting."
  ],
  useDataverseWhen: [
    "Role-based security, teams, business units, or row-level access matter.",
    "The PMO needs stronger relationships across projects, gates, risks, issues, changes, and decisions.",
    "Model-driven admin experiences would reduce maintenance effort.",
    "The solution is likely to become a managed internal platform or client offering."
  ]
};

export const pmoArchitectureSecurityRoles: PmoSecurityRole[] = [
  { role: "Requester", access: "Create and view own intake requests and clarification responses.", notes: ["No access to PMO scoring fields.", "Can see submitted status and decision outcome."] },
  { role: "PMO analyst", access: "Edit triage, scoring, decision notes, queues, and operational PMO records.", notes: ["Can assign owners and request clarification.", "Can move approved demand to charter."] },
  { role: "Sponsor", access: "Review and approve assigned charters, decisions, gate exceptions, and escalations.", notes: ["Should see items tied to their department or sponsorship.", "Approval comments must be retained."] },
  { role: "Project manager", access: "Manage project status, gate evidence, RAID items, change requests, milestones, and weekly updates for assigned projects.", notes: ["Cannot approve their own gate decisions unless governance allows it.", "Owns evidence quality and update cadence."] },
  { role: "Executive viewer", access: "Read portfolio dashboards, exceptions, decisions needed, and benefits reporting.", notes: ["Prefer read-only reporting access.", "Avoid exposing operational edit forms."] },
  { role: "PMO admin", access: "Maintain choices, criteria templates, environment variables, app settings, and security assignments.", notes: ["Limited group with documented release process.", "Owns data model and support playbook."] }
];

export const pmoArchitectureEnvironmentPath: PmoEnvironmentStep[] = [
  {
    stage: "Development",
    purpose: "Build and test data model, apps, flows, and reports with sample records.",
    requiredPractices: ["Use a solution from day one for Dataverse builds.", "Create environment variables and connection references early.", "Keep sample data realistic enough for stakeholder review."]
  },
  {
    stage: "Test or UAT",
    purpose: "Validate role access, approval paths, edge cases, notifications, reporting, and migration steps.",
    requiredPractices: ["Test as non-admin users.", "Run approve, reject, revise, escalate, overdue, and exception scenarios.", "Confirm Power BI refresh and audience permissions."]
  },
  {
    stage: "Production",
    purpose: "Operate the PMO system with controlled releases, support ownership, and governance cadence.",
    requiredPractices: ["Deploy managed solutions when using Dataverse.", "Document rollback steps and support contacts.", "Track enhancement backlog and release notes."]
  }
];

export const pmoArchitectureReleasePath = [
  "Create publisher, solution shell, environment variables, and connection references.",
  "Build core tables or lists, choices, relationships, and sample rows.",
  "Create app screens and role-based navigation.",
  "Add flows for status changes, approvals, notifications, escalations, and logs.",
  "Build Power BI model and reports after operational records stabilize.",
  "Test role access, lifecycle scenarios, flow failures, and reporting refresh.",
  "Release by phase and monitor adoption before adding complexity."
];

export type PmoNamedList = {
  title: string;
  summary: string;
  items: string[];
};

export type PmoTemplateText = {
  title: string;
  audience: string;
  purpose: string;
  template: string[];
};

export type PmoKpi = {
  name: string;
  category: string;
  definition: string;
  formula: string;
  signal: string;
};

export const pmoUatScenarios: PmoNamedList[] = [
  { title: "Intake submission", summary: "Validate requester submission, required fields, confirmation, and triage queue visibility.", items: ["Submit a complete request as a requester.", "Try submitting without sponsor and problem statement.", "Confirm status changes to Submitted.", "Confirm PMO triage queue shows the new request.", "Confirm requester receives confirmation."] },
  { title: "Clarification loop", summary: "Validate that incomplete demand can be returned without losing history.", items: ["PMO requests clarification with comments.", "Requester receives clarification message.", "Requester updates missing details.", "PMO sees updated request as ready for triage.", "Communication log retains the loop."] },
  { title: "Charter approval", summary: "Validate sponsor approval, revision, rejection, and approved project creation.", items: ["Create charter from approved intake.", "Route to sponsor approval.", "Request revision with comments.", "Approve revised charter.", "Confirm project record and approval history are created."] },
  { title: "Gate review", summary: "Validate gate checklist, evidence, exception, and stage movement.", items: ["Generate criteria for a project stage.", "Attach evidence for required criteria.", "Submit gate review.", "Approve with exception and assign follow-up.", "Confirm stage history is written."] },
  { title: "RAID and change control", summary: "Validate owner queues, escalation thresholds, change routing, and closure evidence.", items: ["Create high-severity risk.", "Confirm Teams or email escalation.", "Submit change request with budget impact.", "Route approval by impact threshold.", "Close issue only after closure notes are entered."] },
  { title: "Reporting and digest", summary: "Validate status shells, missed updates, dashboard refresh, and stakeholder digest.", items: ["Generate weekly status update shells.", "Submit red status with help-needed notes.", "Mark one status update missed.", "Refresh Power BI dataset or reporting view.", "Send executive digest with decisions needed."] }
];

export const pmoReleaseChecklist: PmoNamedList[] = [
  { title: "Pre-release readiness", summary: "Confirm the build is ready before deployment.", items: ["All required fields and choices exist in target environment.", "Connection references are assigned.", "Environment variables point to production resources.", "Security roles are assigned to pilot users.", "Rollback notes and support owner are documented."] },
  { title: "Functional validation", summary: "Run core business scenarios before release.", items: ["Submit, clarify, approve, reject, and defer intake.", "Approve and revise charter.", "Approve gate and approve gate with exception.", "Escalate critical risk and route change approval.", "Submit weekly status and publish digest."] },
  { title: "Reporting validation", summary: "Ensure reports reflect operational records correctly.", items: ["Dataset refresh succeeds.", "Current period filters work.", "Health and status definitions match PMO rules.", "Executives see read-only reports.", "Sensitive operational fields are not overexposed."] },
  { title: "Launch communications", summary: "Prepare users and sponsors for release.", items: ["Send what-is-changing note.", "Publish support contact and office hours.", "Share quick-start guide links.", "Confirm PMO triage cadence.", "Announce first governance review date."] }
];

export const pmoSupportRunbook: PmoNamedList[] = [
  { title: "Daily support", summary: "Keep the system healthy during normal operation.", items: ["Review failed flows each morning.", "Check unassigned intake requests.", "Review overdue approvals and escalations.", "Confirm status shells were created for the period.", "Monitor user questions and recurring friction."] },
  { title: "Common fixes", summary: "Known fixes for predictable operational issues.", items: ["Reassign approval when sponsor is out.", "Refresh connection reference after credential changes.", "Reopen clarification request when requester updates wrong field.", "Correct status record marked current incorrectly.", "Repair missing project lookup on RAID or status records."] },
  { title: "Escalation path", summary: "When support should move from PMO admin to technical owner.", items: ["Flow fails repeatedly after retry.", "Security role exposes incorrect records.", "Power BI refresh fails after schema change.", "Production data requires bulk correction.", "Approval or gate history is missing."] }
];

export const pmoGovernanceCadence: PmoNamedList[] = [
  { title: "Twice-weekly demand triage", summary: "Keep new demand from aging silently.", items: ["Review submitted and clarification-ready intake.", "Assign triage owners.", "Score high-priority demand.", "Approve, defer, reject, or request clarification.", "Move approved requests to charter."] },
  { title: "Weekly delivery control", summary: "Review gates, RAID, changes, and decisions.", items: ["Review gate submissions and exceptions.", "Review critical risks and overdue actions.", "Route pending change requests.", "Confirm decision owners and due dates.", "Capture escalations for sponsor review."] },
  { title: "Weekly executive digest", summary: "Communicate exceptions and decisions needed.", items: ["Publish current status updates.", "Group red and yellow projects.", "List sponsor decisions needed.", "Highlight major changes and gate exceptions.", "Send digest with links to reports."] },
  { title: "Monthly portfolio review", summary: "Use PMO data for prioritization and governance improvement.", items: ["Review demand trend and approval mix.", "Review stage aging and gate exception rate.", "Review benefits measures after launch.", "Review PMO system adoption metrics.", "Approve backlog improvements."] }
];

export const pmoCommunicationTemplates: PmoTemplateText[] = [
  { title: "Intake confirmation", audience: "Requester", purpose: "Confirm the request entered the PMO queue.", template: ["Subject: Your request has been received", "Thanks for submitting [Request Title].", "The PMO will review it during the next triage cycle.", "Current status: Submitted", "You will be notified if clarification is needed or when a decision is made."] },
  { title: "Clarification request", audience: "Requester", purpose: "Ask for missing details without losing the request.", template: ["Subject: More detail needed for [Request Title]", "The PMO needs clarification before this can be triaged.", "Requested details: [Clarification Notes]", "Please update the request by [Due Date]."] },
  { title: "Sponsor approval request", audience: "Sponsor", purpose: "Route charter approval with enough context for a decision.", template: ["Subject: Charter approval needed for [Project Name]", "Please review scope, value, success measures, assumptions, and risks.", "Decision options: Approve, Request Revision, Reject", "Requested decision date: [Date]."] },
  { title: "Gate exception alert", audience: "Sponsor or PMO governance lead", purpose: "Make lifecycle exceptions visible and owned.", template: ["Subject: Gate exception recorded for [Project Name]", "Stage: [Stage]", "Exception reason: [Reason]", "Owner: [Owner]", "Follow-up due: [Due Date]."] },
  { title: "Executive weekly digest", audience: "Executives and sponsors", purpose: "Summarize portfolio exceptions and decisions needed.", template: ["Subject: PMO weekly portfolio digest", "Red projects: [Count]", "Decisions needed: [List]", "Gate exceptions: [List]", "Critical risks: [List]", "Open dashboard: [Link]."] }
];

export const pmoKpiCatalog: PmoKpi[] = [
  { name: "Intake volume", category: "Demand", definition: "Number of new requests submitted in a period.", formula: "COUNTROWS('Intake Requests')", signal: "Demand trend and PMO workload." },
  { name: "Average triage days", category: "Demand", definition: "Average days from submitted date to decision date.", formula: "AVERAGEX('Intake Requests', DATEDIFF([Submitted Date], [Decision Date], DAY))", signal: "Whether demand is moving or aging." },
  { name: "Approval rate", category: "Demand", definition: "Percent of decided requests approved for charter.", formula: "DIVIDE([Approved Requests], [Decided Requests])", signal: "Quality and fit of incoming demand." },
  { name: "Charter approval cycle time", category: "Charter", definition: "Days from charter submitted to sponsor decision.", formula: "AVERAGEX('Project Charters', DATEDIFF([Submitted Date], [Approval Date], DAY))", signal: "Sponsor responsiveness and charter quality." },
  { name: "Stage aging", category: "Lifecycle", definition: "Days a project has remained in the current stage.", formula: "DATEDIFF('Projects'[Stage Changed Date], TODAY(), DAY)", signal: "Lifecycle bottlenecks." },
  { name: "Gate exception rate", category: "Lifecycle", definition: "Percent of gate approvals with exception.", formula: "DIVIDE([Gate Approved With Exception], [Gate Decisions])", signal: "Governance quality and readiness gaps." },
  { name: "Open risk exposure", category: "RAID", definition: "Sum of probability times impact for open risks.", formula: "SUMX(FILTER('Risks', [Status] <> \"Closed\"), [Probability] * [Impact Score])", signal: "Portfolio exposure." },
  { name: "Overdue actions", category: "RAID", definition: "Open actions past due date.", formula: "COUNTROWS(FILTER('Actions', [Due Date] < TODAY() && [Status] <> \"Closed\"))", signal: "Execution discipline." },
  { name: "Missing status count", category: "Reporting", definition: "Required status updates not submitted for current period.", formula: "COUNTROWS(FILTER('Status Updates', [Status] = \"Missed\"))", signal: "Reporting compliance." },
  { name: "Benefits realization percent", category: "Benefits", definition: "Current measured benefit divided by target benefit.", formula: "DIVIDE(SUM('Benefits Tracking'[Current Value]), SUM('Benefits Tracking'[Target]))", signal: "Whether delivered work created expected value." }
];

export const pmoAdoptionPlan: PmoNamedList[] = [
  { title: "Pilot group", summary: "Start with a small group that feels the PMO pain daily.", items: ["Select two or three departments.", "Use real incoming demand.", "Hold weekly feedback office hours.", "Remove confusing fields quickly.", "Track adoption friction in backlog."] },
  { title: "Role-based onboarding", summary: "Train people only on the tasks they perform.", items: ["Requesters learn submit and respond to clarification.", "PMO analysts learn triage and decision logging.", "Sponsors learn approval and decision views.", "Project managers learn gates, RAID, and status.", "Executives learn dashboard and digest usage."] },
  { title: "Adoption signals", summary: "Measure whether behavior is changing.", items: ["Percent of new demand submitted through intake.", "Average triage days trending down.", "Fewer requests handled only in email.", "Status update compliance improves.", "Sponsors use approval links rather than side conversations."] }
];

export const pmoBacklogModel: PmoNamedList[] = [
  { title: "Backlog fields", summary: "Track enhancements as PMO product work.", items: ["Title", "Module", "Persona", "Problem", "Expected value", "Priority", "Effort", "Risk", "Requested by", "Target release", "Decision"] },
  { title: "Prioritization rules", summary: "Favor improvements that reduce operational friction.", items: ["Fix broken governance paths before cosmetic work.", "Prioritize work that removes duplicate entry.", "Prioritize executive decision visibility.", "Defer features that require immature data.", "Bundle small report refinements into monthly releases."] },
  { title: "Release buckets", summary: "Keep improvements grouped by predictable release type.", items: ["Bug fix", "Field or choice update", "Workflow improvement", "Report enhancement", "New module", "Security or governance change"] }
];

export const pmoEscalationPlaybook: PmoNamedList[] = [
  { title: "Escalate demand", summary: "When intake needs leadership attention.", items: ["Strategic request with unclear sponsor.", "High-value request blocked by missing information.", "Duplicate demand across departments.", "Rejected or deferred request disputed by sponsor."] },
  { title: "Escalate delivery", summary: "When active work needs sponsor or governance attention.", items: ["Critical risk exposure exceeds threshold.", "Gate exception follow-up is overdue.", "Issue blocks launch or compliance commitment.", "Change request impacts approved baseline."] },
  { title: "Escalate reporting", summary: "When status and executive visibility are unreliable.", items: ["Repeated missed status updates.", "Health rating conflicts with RAID data.", "Decision needed has no owner.", "Benefit tracking is missing after launch."] },
  { title: "Decision record requirements", summary: "Every escalation should leave a record.", items: ["Decision needed", "Options considered", "Recommendation", "Decision maker", "Decision", "Decision date", "Rationale", "Follow-up owner"] }
];
