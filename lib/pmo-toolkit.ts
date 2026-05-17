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
    powerBiMeasures: ["Intake Count = COUNTROWS('Intake Requests')", "Average Triage Days = AVERAGEX('Intake Requests', DATEDIFF('Intake Requests'[Submitted Date], 'Intake Requests'[Decision Date], DAY))", "Aging Requests = COUNTROWS(FILTER('Intake Requests', ISBLANK('Intake Requests'[Decision Date]) && 'Intake Requests'[Submitted Date] < TODAY() - 7))", "Approval Rate = DIVIDE([Approved Requests], [Decided Requests])"],
    mvpBuildSteps: ["Start with SharePoint for small PMOs or Dataverse when security and relationships matter.", "Build the intake form with only fields needed for triage.", "Add a PMO-only scoring and decision screen.", "Automate submission, clarification, and decision notifications.", "Create a Power BI demand funnel and aging page."]
  },
  "charter-and-approval": {
    schemaFields: ["Project Charter: Charter ID, Linked Intake Request, Project Name, Sponsor, Project Manager, Business Owner, Problem Statement, Objectives, In Scope, Out of Scope, Success Measures, Estimated Budget, Estimated Timeline, Key Risks, Assumptions, Dependencies, Charter Status, Approval Date.", "Stakeholder: Charter, Name, Role, Department, Influence, Engagement Need, Communication Preference.", "Success Measure: Charter, Metric, Baseline, Target, Measurement Method, Review Date.", "Approval History: Charter, Approver, Decision, Comments, Decision Date, Approval Round."],
    screens: ["Charter drafting screen for business case, scope, value, timeline, risks, and stakeholders.", "Sponsor review screen with read-only summary, approval buttons, and revision comments.", "PMO quality review screen for missing fields, unclear objectives, and unowned dependencies.", "Printable charter summary page for steering committee packets."],
    statusModel: ["Draft", "PMO Review", "Sponsor Review", "Revision Requested", "Approved", "Cancelled"],
    permissionModel: ["Charter authors edit drafts and revisions.", "Sponsors approve only charters assigned to them.", "PMO reviewers edit quality fields, status, and approval routing.", "Executives view approved and pending charters across the portfolio."],
    workflowDetails: ["When intake moves to charter, create the charter shell and copy sponsor, department, request type, and business need.", "On PMO review, check scope, objectives, success measures, and sponsor.", "On PMO approval, start sponsor approval and lock core fields.", "On sponsor approval, create the project record and initial gate checklist."],
    powerBiMeasures: ["Charters Awaiting Sponsor = COUNTROWS(FILTER('Project Charters', 'Project Charters'[Charter Status] = \"Sponsor Review\"))", "Average Approval Days = AVERAGEX('Project Charters', DATEDIFF('Project Charters'[Submitted Date], 'Project Charters'[Approval Date], DAY))", "Approved Estimated Value = SUM('Project Charters'[Estimated Benefit])", "Revision Rate = DIVIDE([Revision Requested Count], [Submitted Charter Count])"],
    mvpBuildSteps: ["Create a charter table linked to intake requests.", "Build draft/edit screens for scope, value, risks, and stakeholders.", "Add PMO completeness review before sponsor approval.", "Add sponsor approval with comments and revision handling.", "Generate a simple charter summary view."]
  },
  "stage-gates": {
    schemaFields: ["Project: Project ID, Name, Sponsor, Project Manager, Current Stage, Health, Start Date, Target Launch Date, Baseline Launch Date, Stage Changed Date.", "Gate Criteria: Stage, Criterion, Required Evidence Type, Owner Role, Required Flag, Sort Order.", "Gate Review: Project, Stage, Review Status, Submitted By, Submitted Date, Decision, Decision Date, Approver, Exception Reason.", "Evidence Link: Gate Review, Criterion, Evidence URL, Evidence Notes, Submitted By, Submitted Date."],
    screens: ["Project lifecycle dashboard showing current stage, gate readiness, stage age, and blocked criteria.", "Gate checklist screen with required criteria, evidence link, owner, and completion state.", "Gate approval screen with decision, comments, exception flag, and next-stage target.", "Audit timeline showing every stage change, approver, exception, and date."],
    statusModel: ["Stage In Progress", "Gate Prep", "Gate Submitted", "Gate Approved", "Gate Approved with Exception", "Gate Rejected", "Stage Changed"],
    permissionModel: ["Project managers update evidence and submit gate reviews.", "Gate approvers decide assigned gate reviews but do not edit submitted evidence.", "PMO admins maintain gate criteria and exception rules.", "Executives view stage health and exception trends."],
    workflowDetails: ["When a project enters a stage, create gate checklist rows from the criteria template.", "When required evidence is complete, enable submit-for-gate-review.", "On gate submission, route approval based on project size, risk, or stage.", "On approval, update current stage, lock prior evidence, and notify the project team."],
    powerBiMeasures: ["Projects by Stage = COUNTROWS('Projects') grouped by Current Stage", "Average Stage Age = AVERAGEX('Projects', DATEDIFF('Projects'[Stage Changed Date], TODAY(), DAY))", "Gate Exception Rate = DIVIDE([Gate Approved With Exception], [Gate Decisions])", "Overdue Gate Count = COUNTROWS(FILTER('Gate Reviews', 'Gate Reviews'[Due Date] < TODAY() && 'Gate Reviews'[Review Status] <> \"Approved\"))"],
    mvpBuildSteps: ["Define five to seven lifecycle stages and no more than ten criteria per stage.", "Create template criteria and generated project checklist rows.", "Build the project lifecycle dashboard and gate checklist screen.", "Add gate approval and stage-change automation.", "Publish stage aging, gate status, and exception reporting."]
  },
  "change-risk-issue-control": {
    schemaFields: ["Change Request: Change ID, Project, Requestor, Change Type, Description, Reason, Scope Impact, Schedule Impact, Budget Impact, Risk Impact, Recommendation, Status, Approver, Decision Date.", "Risk: Risk ID, Project, Category, Cause, Event, Impact, Probability, Impact Score, Exposure, Mitigation Plan, Contingency Plan, Owner, Due Date, Status.", "Issue: Issue ID, Project, Description, Severity, Impact, Owner, Due Date, Resolution Plan, Escalation Needed, Status, Closed Date.", "Decision: Decision ID, Project, Decision Needed, Options, Recommendation, Decision Maker, Decision, Decision Date, Rationale."],
    screens: ["Change request form with impact assessment, recommendation, approval route, and baseline update reminder.", "Risk register screen with heat scoring, mitigation owner, due date, escalation flag, and trend notes.", "Issue register screen with severity, blocker flag, owner queue, resolution plan, and closure evidence.", "Weekly RAID review dashboard for open high-severity items and overdue actions."],
    statusModel: ["Draft", "Submitted", "Under Review", "Action Required", "Approved or Accepted", "Rejected or Closed", "Escalated"],
    permissionModel: ["Project managers create and update controls for their projects.", "Risk and issue owners update mitigation, resolution, and due dates assigned to them.", "Change approvers approve or reject assigned changes.", "Executives view escalated items and decision requests."],
    workflowDetails: ["When a change is submitted, calculate impact level and route approval by threshold.", "When a high-exposure risk is created, notify the PMO lead and sponsor.", "Send overdue mitigation reminders before and after due dates.", "When a change is approved, remind the project manager to update baselines."],
    powerBiMeasures: ["Open Risk Exposure = SUMX(FILTER('Risks', 'Risks'[Status] <> \"Closed\"), 'Risks'[Probability] * 'Risks'[Impact Score])", "Overdue Actions = COUNTROWS(FILTER('Actions', 'Actions'[Due Date] < TODAY() && 'Actions'[Status] <> \"Closed\"))", "Average Issue Age = AVERAGEX(FILTER('Issues', 'Issues'[Status] <> \"Closed\"), DATEDIFF('Issues'[Created Date], TODAY(), DAY))", "Approved Change Impact = SUM('Change Requests'[Budget Impact])"],
    mvpBuildSteps: ["Create Change Requests, Risks, Issues, Actions, and Decisions tables linked to Projects.", "Build owner queues first so the tool changes behavior.", "Add threshold-based escalation for high-severity items.", "Add change approval with impact assessment and baseline reminder.", "Create Power BI RAID and change-impact pages."]
  },
  "communications-and-reporting": {
    schemaFields: ["Status Update: Project, Reporting Period, Overall Health, Scope Health, Schedule Health, Budget Health, Key Accomplishments, Next Steps, Decisions Needed, Help Needed, Submitted By, Submitted Date.", "Milestone: Project, Milestone Name, Baseline Date, Forecast Date, Actual Date, Status, Owner, Notes.", "Communication: Project, Audience, Message Type, Subject, Summary, Sent Date, Sent By, Channel.", "Benefits Tracking: Project, Benefit Metric, Baseline, Target, Current Value, Measurement Date, Owner."],
    screens: ["Weekly status update form with health ratings, accomplishments, next steps, blockers, and decisions needed.", "Executive summary screen that rolls project updates into a portfolio narrative.", "Milestone update screen for baseline, forecast, actual, and variance notes.", "Benefits review screen for target, current value, evidence, and next measurement date."],
    statusModel: ["Not Started", "Draft", "Submitted", "Needs Revision", "Published", "Missed"],
    permissionModel: ["Project managers create and edit their status updates.", "PMO reviewers request revisions and publish updates.", "Sponsors view status, decisions needed, and benefits for their projects.", "Executives view portfolio reporting and decision requests."],
    workflowDetails: ["Create status update shells at the start of each reporting period.", "Send reminders before due dates and missed-update escalations after deadlines.", "When an update is published, refresh Power BI and notify stakeholders.", "If decisions are needed, create decision request records linked to the status update."],
    powerBiMeasures: ["Current Red Projects = COUNTROWS(FILTER('Status Updates', 'Status Updates'[Overall Health] = \"Red\" && 'Status Updates'[Is Current] = TRUE()))", "Milestone Variance Days = DATEDIFF('Milestones'[Baseline Date], 'Milestones'[Forecast Date], DAY)", "Missing Status Count = COUNTROWS(FILTER('Status Updates', 'Status Updates'[Status] = \"Missed\"))", "Benefits Realization % = DIVIDE(SUM('Benefits Tracking'[Current Value]), SUM('Benefits Tracking'[Target]))"],
    mvpBuildSteps: ["Define standard health ratings and weekly status questions.", "Build status update capture and PMO review screens.", "Create milestone and benefits tracking tables linked to projects.", "Build executive Power BI pages for health, milestones, decisions, and benefits.", "Automate reminders, escalations, dataset refresh, and stakeholder digest emails."]
  }
};

export function getPmoDeepDiveBySlug(slug: string) {
  return pmoDeepDives[slug];
}
