# PMO Data Dictionary

A consolidated technical reference for PMO tables, fields, relationships, indexes, status models, Power BI measures, and Dataverse solution components.

## Module Data Dictionary

## Intake and triage

Capture demand in one place, score it consistently, and route it to the right reviewers before work becomes shadow delivery.

### Status Model

- Draft
- Submitted
- Clarification Requested
- Ready for Triage
- Approved for Charter
- Deferred
- Rejected

### Power BI Measures

- Intake Count = COUNTROWS('Intake Requests')
- Average Triage Days = AVERAGEX('Intake Requests', DATEDIFF('Intake Requests'[Submitted Date], 'Intake Requests'[Decision Date], DAY))
- Aging Requests = COUNTROWS(FILTER('Intake Requests', ISBLANK('Intake Requests'[Decision Date]) && 'Intake Requests'[Submitted Date] < TODAY() - 7))
- Approval Rate = DIVIDE([Approved Requests], [Decided Requests])

### Dataverse Components

#### Tables

- bv_intakerequest
- bv_scoringcriterion
- bv_triagedecision
- bv_communicationlog

#### Choices

- bv_requesttype
- bv_intakestatus
- bv_complexity
- bv_triagedecisiontype

### Intake Requests

Platform: Either

Primary demand record submitted by business users and triaged by the PMO.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Title | Single line text | Yes | Short request name used in queues and reports. |
| Request Type | Choice | Yes | Project, enhancement, automation, report, process improvement, support. |
| Business Unit | Choice or lookup | Yes | Use a lookup when departments need owners, sponsors, or reporting attributes. |
| Sponsor | Person or lookup to Contact/User | Yes | The accountable business sponsor. |
| Problem Statement | Multiple lines text | Yes | Capture the business pain in plain language. |
| Expected Benefit | Currency or number | No | Use text early if benefits are qualitative. |
| Complexity | Choice | Yes | Low, Medium, High. Feed scoring and routing. |
| Priority Score | Number | No | Calculated from weighted criteria; avoid manual entry when possible. |
| Current Status | Choice | Yes | Draft, Submitted, Clarification Requested, Ready for Triage, Approved for Charter, Deferred, Rejected. |
| Decision Reason | Multiple lines text | No | Required when rejecting or deferring. |

#### Relationships

- One Intake Request can create one Project Charter.
- Many Triage Decisions can relate to one Intake Request.
- Many Communication Log rows can relate to one Intake Request.

#### Recommended Indexes

- Current Status
- Business Unit
- Sponsor
- Submitted Date
- Triage Owner
- Decision Date

### Scoring Criteria

Platform: Either

Configurable scoring rubric so the PMO can change weights without editing the app.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Criterion Name | Single line text | Yes | Strategic alignment, benefit, urgency, risk, complexity. |
| Weight | Number | Yes | Use whole numbers that total 100 across active criteria. |
| Score Guidance | Multiple lines text | Yes | Explains what low, medium, and high scores mean. |
| Active | Yes/No | Yes | Deactivate instead of deleting to preserve history. |

#### Relationships

- Scoring Criteria is referenced by triage scoring controls.

#### Recommended Indexes

- Active
- Sort Order

## Charter and approval

Turn approved intake into a project charter with sponsor approval, scope boundaries, estimated value, and delivery ownership.

### Status Model

- Draft
- PMO Review
- Sponsor Review
- Revision Requested
- Approved
- Cancelled

### Power BI Measures

- Charters Awaiting Sponsor = COUNTROWS(FILTER('Project Charters', 'Project Charters'[Charter Status] = "Sponsor Review"))
- Average Approval Days = AVERAGEX('Project Charters', DATEDIFF('Project Charters'[Submitted Date], 'Project Charters'[Approval Date], DAY))
- Approved Estimated Value = SUM('Project Charters'[Estimated Benefit])
- Revision Rate = DIVIDE([Revision Requested Count], [Submitted Charter Count])

### Dataverse Components

#### Tables

- bv_projectcharter
- bv_stakeholder
- bv_successmeasure
- bv_approvalhistory
- bv_project

#### Choices

- bv_charterstatus
- bv_stakeholderrole
- bv_approvaldecision
- bv_measuretype

### Project Charters

Platform: Either

Formal definition of approved work before planning begins.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Project Name | Single line text | Yes | Use consistent naming because it becomes the reporting label. |
| Linked Intake Request | Lookup | No | Connects the charter to original demand. |
| Sponsor | Person or lookup | Yes | Approver and accountable business owner. |
| Project Manager | Person | Yes | Delivery owner for planning and execution. |
| Objectives | Multiple lines text | Yes | Business outcomes, not just deliverables. |
| In Scope | Multiple lines text | Yes | What the project will deliver. |
| Out of Scope | Multiple lines text | Yes | Prevents expectation drift. |
| Estimated Budget | Currency | No | Use range if exact estimate is not available. |
| Charter Status | Choice | Yes | Draft, PMO Review, Sponsor Review, Revision Requested, Approved, Cancelled. |
| Approval Date | Date | No | Stamped by workflow. |

#### Relationships

- One Project Charter creates one Project.
- Many Stakeholders can relate to one Charter.
- Many Approval History rows can relate to one Charter.

#### Recommended Indexes

- Charter Status
- Sponsor
- Project Manager
- Approval Date

### Success Measures

Platform: Either

Defines how the PMO will know whether the project created value.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Metric | Single line text | Yes | Cycle time, cost reduction, adoption, compliance, satisfaction. |
| Baseline | Number or text | No | Current-state value before project. |
| Target | Number or text | Yes | Desired future-state value. |
| Measurement Method | Multiple lines text | Yes | Where the number comes from and how often it is reviewed. |

#### Relationships

- Many Success Measures relate to one Project Charter.

#### Recommended Indexes

- Charter
- Review Date

## Stage gates and lifecycle control

Move projects through standard delivery stages with clear entry criteria, exit criteria, approvals, and evidence.

### Status Model

- Stage In Progress
- Gate Prep
- Gate Submitted
- Gate Approved
- Gate Approved with Exception
- Gate Rejected
- Stage Changed

### Power BI Measures

- Projects by Stage = COUNTROWS('Projects') grouped by Current Stage
- Average Stage Age = AVERAGEX('Projects', DATEDIFF('Projects'[Stage Changed Date], TODAY(), DAY))
- Gate Exception Rate = DIVIDE([Gate Approved With Exception], [Gate Decisions])
- Overdue Gate Count = COUNTROWS(FILTER('Gate Reviews', 'Gate Reviews'[Due Date] < TODAY() && 'Gate Reviews'[Review Status] <> "Approved"))

### Dataverse Components

#### Tables

- bv_project
- bv_lifecyclestage
- bv_gatecriterion
- bv_gatereview
- bv_evidencelink
- bv_gateexception

#### Choices

- bv_lifecyclestagechoice
- bv_gatereviewstatus
- bv_gatedecision
- bv_evidencetype

### Projects

Platform: Either

Portfolio record that moves through lifecycle stages and connects to controls, status, and reporting.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Project Name | Single line text | Yes | Primary reporting label. |
| Sponsor | Person or lookup | Yes | Executive owner. |
| Project Manager | Person | Yes | Delivery owner. |
| Current Stage | Choice or lookup | Yes | Initiation, Planning, Build, Test, Launch, Closeout, Benefits Review. |
| Overall Health | Choice | Yes | Green, Yellow, Red, Not Rated. |
| Baseline Launch Date | Date | No | Original approved launch date. |
| Forecast Launch Date | Date | No | Current expected launch date. |

#### Relationships

- One Project has many Gate Reviews, Risks, Issues, Changes, Status Updates, and Milestones.

#### Recommended Indexes

- Current Stage
- Sponsor
- Project Manager
- Overall Health
- Forecast Launch Date

### Gate Reviews

Platform: Either

Approval record for moving a project from one stage to the next.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Project | Lookup | Yes | Parent project. |
| Stage | Choice or lookup | Yes | Stage being reviewed. |
| Review Status | Choice | Yes | Draft, Submitted, Approved, Approved with Exception, Rejected. |
| Approver | Person | Yes | Decision maker for the gate. |
| Exception Reason | Multiple lines text | No | Required when approved with exception. |

#### Relationships

- One Gate Review has many Evidence Links and Gate Decisions.

#### Recommended Indexes

- Project
- Stage
- Review Status
- Approver
- Decision Date

## Change, risk, and issue control

Give delivery teams structured portals for change requests, risks, issues, actions, escalations, and decisions.

### Status Model

- Draft
- Submitted
- Under Review
- Action Required
- Approved or Accepted
- Rejected or Closed
- Escalated

### Power BI Measures

- Open Risk Exposure = SUMX(FILTER('Risks', 'Risks'[Status] <> "Closed"), 'Risks'[Probability] * 'Risks'[Impact Score])
- Overdue Actions = COUNTROWS(FILTER('Actions', 'Actions'[Due Date] < TODAY() && 'Actions'[Status] <> "Closed"))
- Average Issue Age = AVERAGEX(FILTER('Issues', 'Issues'[Status] <> "Closed"), DATEDIFF('Issues'[Created Date], TODAY(), DAY))
- Approved Change Impact = SUM('Change Requests'[Budget Impact])

### Dataverse Components

#### Tables

- bv_changerequest
- bv_raiditem
- bv_action
- bv_decision
- bv_escalation
- bv_impactassessment

#### Choices

- bv_changetype
- bv_controlstatus
- bv_severity
- bv_raidtype
- bv_decisionstatus

### Change Requests

Platform: Either

Controls scope, budget, schedule, and risk changes after charter approval.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Project | Lookup | Yes | Project affected by the change. |
| Change Type | Choice | Yes | Scope, schedule, budget, resource, quality, compliance. |
| Reason | Multiple lines text | Yes | Why the change is needed. |
| Scope Impact | Choice | Yes | None, Low, Medium, High. |
| Schedule Impact Days | Number | No | Positive or negative variance. |
| Budget Impact | Currency | No | Estimated cost increase or decrease. |
| Status | Choice | Yes | Draft, Submitted, Under Review, Approved, Rejected, Closed. |

#### Relationships

- Many Change Requests relate to one Project.
- Change approvals create Approval History records.

#### Recommended Indexes

- Project
- Status
- Change Type
- Approver
- Decision Date

### Risks and Issues

Platform: Either

Operational RAID control for project uncertainty and active blockers.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Item Type | Choice | Yes | Risk or Issue. |
| Project | Lookup | Yes | Parent project. |
| Severity | Choice | Yes | Low, Medium, High, Critical. |
| Probability | Number | No | Use only for risks. |
| Impact Score | Number | Yes | 1-5 scoring for heat maps. |
| Owner | Person | Yes | Accountable for mitigation or resolution. |
| Due Date | Date | Yes | Drives reminders and overdue reporting. |
| Status | Choice | Yes | Open, Monitoring, Escalated, Closed. |

#### Relationships

- Many Risks and Issues relate to one Project.
- Actions and Decisions can link to a RAID item.

#### Recommended Indexes

- Project
- Item Type
- Severity
- Owner
- Due Date
- Status

## Communications and Power BI reporting

Convert PMO data into status communications, executive dashboards, operational queues, and stakeholder updates.

### Status Model

- Not Started
- Draft
- Submitted
- Needs Revision
- Published
- Missed

### Power BI Measures

- Current Red Projects = COUNTROWS(FILTER('Status Updates', 'Status Updates'[Overall Health] = "Red" && 'Status Updates'[Is Current] = TRUE()))
- Milestone Variance Days = DATEDIFF('Milestones'[Baseline Date], 'Milestones'[Forecast Date], DAY)
- Missing Status Count = COUNTROWS(FILTER('Status Updates', 'Status Updates'[Status] = "Missed"))
- Benefits Realization % = DIVIDE(SUM('Benefits Tracking'[Current Value]), SUM('Benefits Tracking'[Target]))

### Dataverse Components

#### Tables

- bv_statusupdate
- bv_milestone
- bv_communication
- bv_reportsnapshot
- bv_decisionrequest
- bv_benefittracking

#### Choices

- bv_healthrating
- bv_statusupdatestate
- bv_milestonestatus
- bv_audience
- bv_decisionpriority

### Status Updates

Platform: Either

Weekly or monthly narrative and health record for each project.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Project | Lookup | Yes | Parent project. |
| Reporting Period | Date or text | Yes | Week ending or month label. |
| Overall Health | Choice | Yes | Green, Yellow, Red. |
| Scope Health | Choice | Yes | Green, Yellow, Red. |
| Schedule Health | Choice | Yes | Green, Yellow, Red. |
| Budget Health | Choice | Yes | Green, Yellow, Red. |
| Key Accomplishments | Multiple lines text | Yes | What changed since last period. |
| Next Steps | Multiple lines text | Yes | What happens next. |
| Decisions Needed | Multiple lines text | No | Feeds decision request queue. |
| Status | Choice | Yes | Draft, Submitted, Needs Revision, Published, Missed. |

#### Relationships

- Many Status Updates relate to one Project.
- Decision Requests can be generated from status updates.

#### Recommended Indexes

- Project
- Reporting Period
- Overall Health
- Status
- Submitted Date

### Milestones

Platform: Either

Tracks baseline, forecast, actual dates, and variance for portfolio reporting.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Project | Lookup | Yes | Parent project. |
| Milestone Name | Single line text | Yes | Planning complete, build complete, UAT complete, launch. |
| Baseline Date | Date | Yes | Original approved date. |
| Forecast Date | Date | Yes | Current expected date. |
| Actual Date | Date | No | Set when complete. |
| Status | Choice | Yes | Not Started, On Track, At Risk, Late, Complete. |

#### Relationships

- Many Milestones relate to one Project.

#### Recommended Indexes

- Project
- Forecast Date
- Status

---

Generated from the BuilderVault PMO toolkit content.
