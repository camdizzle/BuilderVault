# Change, risk, and issue control Implementation Guide

BuilderVault PMO toolkit guide for change, risk, and issue control.

## Outcome

A connected control layer for change requests, risk and issue management, decision logs, and escalation communications.

## Business Problem

Projects fail quietly when changes, risks, and issues live in meeting notes. A small PMO needs one operational source of truth.

## Build Checklist

- Define change, risk, and issue fields.
- Build separate but linked portals for each control area.
- Automate reminders and escalations.
- Create Power BI views for executives and delivery teams.
- Review open controls in weekly governance meetings.

## Core Lists Or Tables

- Change Requests
- Risks
- Issues
- Actions
- Decisions
- Escalations
- Impact Assessments

## Workflow Map

- 1. Team submits change, risk, issue, or decision
- 2. Classify severity and impact
- 3. Assign owner and due date
- 4. Route approval or escalation if needed
- 5. Track mitigation or decision action
- 6. Confirm closure evidence
- 7. Report open exposure and aging

## Data Model

### Change Requests

Platform: Either

Controls scope, budget, schedule, and risk changes after charter approval.

| Column | Type | Required | Notes |
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

#### Indexes

- Project
- Status
- Change Type
- Approver
- Decision Date

### Risks and Issues

Platform: Either

Operational RAID control for project uncertainty and active blockers.

| Column | Type | Required | Notes |
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

#### Indexes

- Project
- Item Type
- Severity
- Owner
- Due Date
- Status

## Power Apps Screen Blueprints

### RAID Register Screen

Persona: Project manager and PMO analyst

Manage risks, issues, actions, and decisions from one operating queue.

#### Layout

- Filter tabs for Risk, Issue, Action, Decision
- Severity and overdue filters
- Register gallery
- Selected item edit panel

#### Controls

- tabRaidType
- galRaidItems
- cmbSeverity
- tglEscalatedOnly
- frmRaidItem
- btnEscalate
- btnCloseItem

#### Formula Notes

- Heat score = Probability * Impact Score
- Close requires closure notes
- Escalate creates decision request when decision is needed

#### Data Sources

- Risks and Issues
- Actions
- Decisions
- Escalations

### Change Request Screen

Persona: Project manager or sponsor

Capture impact and route change approval before baseline changes.

#### Layout

- Change summary
- Impact assessment cards
- Recommendation
- Approver routing
- Decision history

#### Controls

- frmChangeRequest
- cmbChangeType
- numScheduleImpact
- curBudgetImpact
- cmbScopeImpact
- txtRecommendation
- btnSubmitChange

#### Formula Notes

- Impact level derives from budget, schedule, scope, and risk impacts
- Approval route changes by impact threshold
- Approved change prompts baseline update task

#### Data Sources

- Change Requests
- Projects
- Approval History
- Actions

### Owner Work Queue Screen

Persona: Risk, issue, and action owners

Let owners update mitigation, due dates, and closure evidence without seeing the full PMO admin app.

#### Layout

- My open items
- Due soon and overdue grouping
- Update panel
- Closure evidence panel

#### Controls

- galMyActions
- frmOwnerUpdate
- txtMitigationUpdate
- dpNewDueDate
- attClosureEvidence
- btnSubmitUpdate

#### Formula Notes

- Items filter by current user email
- Due date extension requires reason
- Closure sets Closed Date and notifies PM

#### Data Sources

- Risks and Issues
- Actions
- Communication Log

## Power Fx Starter Snippets

### Calculate RAID heat score

Location: lblHeatScore.Text

```powerfx
With(
    {
        heatScore: Coalesce(Value(cmbProbability.Selected.Value), 1) * Coalesce(Value(cmbImpact.Selected.Value), 1)
    },
    Text(heatScore, "0")
)
```

#### Notes

- Use probability only for risks; issues can default probability to 1.
- Use the score to drive escalation and Power BI heat maps.

### Close RAID item with evidence

Location: btnCloseItem.OnSelect

```powerfx
If(
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
);
```

#### Notes

- Closure evidence is what makes RAID history useful later.
- Notify the project manager when an owner closes an escalated item.

## Power Automate Recipes

### Control - Escalate Critical Risk

Trigger: When a risk or issue is created or severity changes.

#### Steps

- Check severity and heat score.
- If critical or escalated, post Teams alert to sponsor and PMO lead.
- Create escalation record.
- Create owner action with due date.
- Write communication log.

#### Expressions

- @or(equals(triggerOutputs()?['body/Severity/Value'], 'Critical'), greaterOrEquals(triggerOutputs()?['body/HeatScore'], 12))
- addDays(utcNow(), 3)

### Control - Route Change Approval

Trigger: When Change Request status changes to Submitted.

#### Steps

- Calculate impact level from schedule, budget, scope, and risk.
- Route low impact to PMO lead and high impact to sponsor/change board.
- Update decision fields.
- Create baseline update action after approval.

#### Expressions

- @equals(triggerOutputs()?['body/Status/Value'], 'Submitted')
- if(greater(triggerOutputs()?['body/BudgetImpact'], 25000), 'Sponsor', 'PMO Lead')

## Dataverse Solution Component Map

Solution name: BV PMO Controls

Publisher prefix: bvpmocntl

### Tables

- bv_changerequest
- bv_raiditem
- bv_action
- bv_decision
- bv_escalation
- bv_impactassessment

### Choices

- bv_changetype
- bv_controlstatus
- bv_severity
- bv_raidtype
- bv_decisionstatus

### Apps

- RAID Register
- Change Request Portal
- Owner Work Queue

### Cloud Flows

- Control - Route Change Approval
- Control - Escalate Critical Risk
- Control - Overdue Owner Reminder
- Control - Close Item Notification

### Security Roles

- Control Project Manager
- Control Item Owner
- Change Approver
- Executive Escalation Viewer

### Environment Variables

- Critical Risk Channel URL
- Change Board Email
- Overdue Reminder Days
- Baseline Update Owner

### Dashboards

- Risk Heat Map
- Issue Aging
- Change Impact
- Open Decisions

## Power BI Reporting Ideas

- RAID dashboard
- change impact dashboard
- risk heat map
- issue aging and escalation trends

## Starter DAX Measures

- Open Risk Exposure = SUMX(FILTER('Risks', 'Risks'[Status] <> "Closed"), 'Risks'[Probability] * 'Risks'[Impact Score])
- Overdue Actions = COUNTROWS(FILTER('Actions', 'Actions'[Due Date] < TODAY() && 'Actions'[Status] <> "Closed"))
- Average Issue Age = AVERAGEX(FILTER('Issues', 'Issues'[Status] <> "Closed"), DATEDIFF('Issues'[Created Date], TODAY(), DAY))
- Approved Change Impact = SUM('Change Requests'[Budget Impact])

## Governance Notes

- Separate risks from issues: risks might happen, issues are already happening.
- Require owner and due date on every active item.
- Track decision history so escalations do not reset the story.

## Deployment Checklist

- Create development, test, and production environments or sites before build-out.
- Create publisher prefix, solution shell, environment variables, and connection references first.
- Build tables and choices before apps and flows.
- Import sample template rows, then test with non-admin users.
- Run approval, rejection, revision, escalation, and overdue scenarios before release.
- Publish Power BI pages after validating relationships, date fields, status definitions, and security trimming.
- Document owners, support mailbox, release notes, and rollback steps.

---

Generated from the BuilderVault hidden PMO toolkit content.
