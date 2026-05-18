# PMO 30/60/90-Day Implementation Roadmap

A practical BuilderVault rollout plan for PMO teams that want to build their own Microsoft 365 and Power Platform PMO system before investing in a large enterprise PMO platform.

## Rollout Principle

Build behavior change before building platform weight. The first 90 days should prove that the PMO can capture demand, route decisions, control lifecycle movement, and communicate portfolio health.

## Recommended Build Sequence

- Start with intake so all new demand is visible.
- Add charter approval so approved work has scope, value, sponsor, and owner alignment.
- Add stage gates so lifecycle movement is controlled and auditable.
- Add RAID and change control so delivery risks, issues, decisions, and changes stop living in meeting notes.
- Add communications and reporting so stakeholders see decisions needed, exceptions, and portfolio health.

## Phase 1: Days 1-30

Create one visible source of truth for demand and approved work before building heavier governance.

### Modules

- Intake and triage: /pmo/packages/intake-and-triage
- Charter and approval: /pmo/packages/charter-and-approval

### Deliverables

- Intake request table or list with required fields and triage status model.
- Requester intake form with save draft and submit behavior.
- PMO triage queue with scoring, decision reason, owner, and aging views.
- Project charter record linked to approved intake.
- Sponsor approval workflow with revision loop and approval history.

### Build Activities

- Run a working session to define request types, sponsor roles, intake questions, and required triage decisions.
- Build the intake data model first, then add requester and PMO views.
- Create two to three sample requests from real historical demand so stakeholders can react to something concrete.
- Add confirmation, clarification, and decision notifications before expanding reporting.
- Move approved requests into charter records so intake does not become another static spreadsheet.

### Exit Criteria

- Every new request can be submitted through one intake experience.
- The PMO can see unassigned, aging, and high-priority demand in a queue.
- Approved intake creates or links to a charter record.
- Sponsors can approve, reject, or request revision with comments.
- Basic intake and charter metrics are visible in Power BI or a simple dashboard.

### Adoption Risks

- Too many intake fields will push users back to email.
- Unclear sponsor ownership will stall approvals.
- If decisions are not communicated automatically, users will assume the portal is a black hole.

## Phase 2: Days 31-60

Add lifecycle control so approved work moves through standard gates with evidence, exceptions, and decisions.

### Modules

- Stage gates and lifecycle control: /pmo/packages/stage-gates
- Change, risk, and issue control: /pmo/packages/change-risk-issue-control

### Deliverables

- Project table or list with current lifecycle stage, health, sponsor, PM, and baseline dates.
- Gate criteria template with generated project-specific checklist rows.
- Gate review screen with evidence links, approver, decision, and exception reason.
- Change request portal with scope, schedule, budget, risk, and benefit impact fields.
- Risk, issue, action, decision, and escalation records connected to projects.

### Build Activities

- Define a practical stage model with no more than seven stages and objective exit criteria.
- Create gate criteria that can be answered with evidence, not vague confidence statements.
- Add a stage-change approval flow that writes history instead of overwriting prior decisions.
- Build RAID owner queues so risks and issues become daily work, not meeting-only artifacts.
- Create escalation thresholds for critical risks, overdue actions, and high-impact changes.

### Exit Criteria

- Projects cannot advance stages without a gate review record.
- Gate exceptions are captured with approver, reason, and follow-up action.
- Every open risk, issue, action, and change has an owner and due date.
- Critical risks and overdue actions trigger stakeholder notifications.
- Lifecycle, gate, RAID, and change-control reporting can be reviewed weekly.

### Adoption Risks

- Gate criteria that feel ceremonial will be ignored.
- If RAID items do not create owner work queues, they become another reporting chore.
- Change approval thresholds must match the organization or every change will feel escalated.

## Phase 3: Days 61-90

Turn operational PMO records into executive reporting, stakeholder communications, and a repeatable governance cadence.

### Modules

- Communications and Power BI reporting: /pmo/packages/communications-and-reporting

### Deliverables

- Weekly status update form with health, milestones, decisions needed, and help needed.
- Executive portfolio dashboard with demand, stage, health, RAID, changes, and decisions.
- Stakeholder digest workflow for red/yellow projects and open sponsor decisions.
- Monthly benefits review view or report page.
- PMO operating cadence for triage, gate review, RAID review, and executive reporting.

### Build Activities

- Standardize health definitions before building report pages.
- Create draft status shells automatically so project managers update rather than start from scratch.
- Separate executive dashboards from PMO working queues.
- Build a weekly digest around decisions needed and exceptions, not a wall of project text.
- Review usage data and remove fields, reports, or workflows that are not driving decisions.

### Exit Criteria

- Project managers can submit current status updates on a predictable cadence.
- Executives can see portfolio health, exceptions, and decisions needed without opening raw lists.
- Sponsors receive timely communications when their input is required.
- Benefits measures are tracked after launch or closeout.
- The PMO has documented operating rhythms and ownership for each part of the system.

### Adoption Risks

- Dashboard pages that mirror raw lists will not change executive behavior.
- Red/yellow/green status must be defined or reporting will become political.
- Communications should be brief and decision-oriented or stakeholders will tune them out.

## Operating Model

### Demand triage

Owner: PMO intake lead

Cadence: Twice weekly

- Review new requests
- Assign triage owners
- Request clarification
- Move approved demand to charter

### Sponsor approval

Owner: Business sponsor group

Cadence: Weekly

- Approve or reject charters
- Resolve revision requests
- Confirm value and scope boundaries
- Name accountable owners

### Gate governance

Owner: PMO governance lead

Cadence: Weekly or by stage movement

- Review gate evidence
- Approve exceptions
- Record stage changes
- Escalate blocked transitions

### RAID and change control

Owner: Delivery governance lead

Cadence: Weekly

- Review overdue actions
- Escalate critical risks
- Route change approvals
- Confirm closure evidence

### Executive reporting

Owner: PMO reporting lead

Cadence: Weekly status and monthly portfolio review

- Publish portfolio dashboard
- Send stakeholder digest
- Track decisions needed
- Maintain benefits review views

## Definition Of Done For The 90-Day Build

- New demand has a single submission path and triage queue.
- Approved work has a charter, sponsor decision, and initial project record.
- Projects move through stages with gate evidence and approval history.
- Risks, issues, actions, decisions, escalations, and change requests have owners and due dates.
- Executives can see portfolio health, exceptions, decisions needed, and trends without opening raw lists.
- The PMO has named owners for triage, sponsor approval, gate governance, RAID/change control, and executive reporting.

---

Generated from the BuilderVault PMO toolkit content.
