# Communications and Power BI reporting Implementation Guide

BuilderVault PMO toolkit guide for communications and power bi reporting.

## Outcome

A reporting and communications layer that turns intake, charter, gate, change, risk, and issue data into decisions.

## Business Problem

Executives do not need more raw project data. They need clear status, exceptions, decisions needed, and trend signals.

## Build Checklist

- Standardize project status and health definitions.
- Build status update capture.
- Create a clean reporting model from operational lists/tables.
- Publish executive and working-team report pages.
- Automate reminders, alerts, and report snapshots.

## Core Lists Or Tables

- Status Updates
- Milestones
- Communications
- Report Snapshots
- Decision Requests
- Benefits Tracking

## Workflow Map

- 1. Create reporting period shell
- 2. Project manager submits update
- 3. PMO reviews and requests revisions if needed
- 4. Publish portfolio status
- 5. Refresh Power BI dataset
- 6. Send stakeholder digest
- 7. Snapshot month-end measures

## Data Model

### Status Updates

Platform: Either

Weekly or monthly narrative and health record for each project.

| Column | Type | Required | Notes |
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

#### Indexes

- Project
- Reporting Period
- Overall Health
- Status
- Submitted Date

### Milestones

Platform: Either

Tracks baseline, forecast, actual dates, and variance for portfolio reporting.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| Project | Lookup | Yes | Parent project. |
| Milestone Name | Single line text | Yes | Planning complete, build complete, UAT complete, launch. |
| Baseline Date | Date | Yes | Original approved date. |
| Forecast Date | Date | Yes | Current expected date. |
| Actual Date | Date | No | Set when complete. |
| Status | Choice | Yes | Not Started, On Track, At Risk, Late, Complete. |

#### Relationships

- Many Milestones relate to one Project.

#### Indexes

- Project
- Forecast Date
- Status

## Power Apps Screen Blueprints

### Weekly Status Entry Screen

Persona: Project manager

Capture consistent weekly status updates for reporting.

#### Layout

- Project header
- Health rating row
- Narrative fields
- Decisions and help needed
- Submit to PMO review

#### Controls

- frmStatusUpdate
- cmbOverallHealth
- cmbScopeHealth
- cmbScheduleHealth
- cmbBudgetHealth
- txtAccomplishments
- txtNextSteps
- txtDecisionsNeeded
- btnSubmitStatus

#### Formula Notes

- Health ratings required before submit
- Red health requires help-needed notes
- Submitted status locks update from project manager edits

#### Data Sources

- Status Updates
- Projects
- Decision Requests

### PMO Status Review Screen

Persona: PMO reviewer

Review, publish, or request revisions before executive reporting.

#### Layout

- Submitted updates queue
- Selected update preview
- Quality checklist
- Publish or request revision actions

#### Controls

- galSubmittedUpdates
- cntStatusPreview
- chkNarrativeQuality
- txtRevisionComments
- btnPublish
- btnRequestRevision

#### Formula Notes

- Publish stamps Published Date and current reporting flag
- Revision sends comments back to PM
- Decision-needed text can generate Decision Request row

#### Data Sources

- Status Updates
- Decision Requests
- Communication Log

### Portfolio Reporting Workspace Screen

Persona: Executive or PMO lead

Surface Power BI pages, decision queues, and report refresh status from one workspace.

#### Layout

- Embedded report links
- Red/yellow project queue
- Decisions needed
- Refresh and snapshot status

#### Controls

- lnkPortfolioReport
- galRedProjects
- galDecisionRequests
- lblLastRefresh
- btnSendDigest

#### Formula Notes

- Red projects gallery filters current status update
- Digest button triggers communications flow
- Decision queue filters open sponsor decisions

#### Data Sources

- Status Updates
- Projects
- Decision Requests
- Report Snapshots

## Power Fx Starter Snippets

### Require help-needed notes for red health

Location: btnSubmitStatus.DisplayMode

```powerfx
If(
    cmbOverallHealth.Selected.Value = "Red" && IsBlank(Trim(txtHelpNeeded.Text)),
    DisplayMode.Disabled,
    DisplayMode.Edit
)
```

#### Notes

- Red status without help-needed notes creates executive noise.
- Show a small field-level message explaining why submit is disabled.

### Submit weekly status update

Location: btnSubmitStatus.OnSelect

```powerfx
IfError(
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
);
```

#### Notes

- Create the status shell with a scheduled flow before the reporting period starts.
- Publishing should happen after PMO review, not directly from the PM screen.

## Power Automate Recipes

### Reporting - Create Weekly Status Shells

Trigger: Scheduled weekly before status updates are due.

#### Steps

- List active projects.
- Create draft Status Update for each project and reporting period if missing.
- Email project managers with direct links.
- Post PMO summary of missing drafts.

#### Expressions

- formatDateTime(utcNow(), 'yyyy-\WW')
- @equals(items('Apply_to_each_project')?['Status'], 'Active')

### Reporting - Publish Digest

Trigger: When PMO publishes status updates or on weekly schedule.

#### Steps

- List current published status updates.
- Group red and yellow projects.
- List decisions needed.
- Refresh Power BI dataset.
- Send executive digest email or Teams post.

#### Expressions

- @equals(item()?['IsCurrent'], true)
- join(variables('DecisionLinks'), '<br/>')

## Dataverse Solution Component Map

Solution name: BV PMO Reporting

Publisher prefix: bvpmorpt

### Tables

- bv_statusupdate
- bv_milestone
- bv_communication
- bv_reportsnapshot
- bv_decisionrequest
- bv_benefittracking

### Choices

- bv_healthrating
- bv_statusupdatestate
- bv_milestonestatus
- bv_audience
- bv_decisionpriority

### Apps

- Weekly Status Entry
- PMO Status Review
- Portfolio Reporting Workspace

### Cloud Flows

- Reporting - Create Weekly Status Shells
- Reporting - Missed Update Escalation
- Reporting - Publish Digest
- Reporting - Snapshot Month End

### Security Roles

- Status Project Manager
- Status PMO Reviewer
- Sponsor Report Viewer
- Executive Report Viewer

### Environment Variables

- Status Due Day
- Executive Digest Recipients
- Power BI Workspace URL
- Report Snapshot Library URL

### Dashboards

- Executive Portfolio Overview
- Delivery Health Scorecard
- Milestone Variance
- Benefits Realization

## Power BI Reporting Ideas

- Executive portfolio overview
- delivery health scorecard
- financial and benefit tracking
- PMO operations dashboard

## Starter DAX Measures

- Current Red Projects = COUNTROWS(FILTER('Status Updates', 'Status Updates'[Overall Health] = "Red" && 'Status Updates'[Is Current] = TRUE()))
- Milestone Variance Days = DATEDIFF('Milestones'[Baseline Date], 'Milestones'[Forecast Date], DAY)
- Missing Status Count = COUNTROWS(FILTER('Status Updates', 'Status Updates'[Status] = "Missed"))
- Benefits Realization % = DIVIDE(SUM('Benefits Tracking'[Current Value]), SUM('Benefits Tracking'[Target]))

## Governance Notes

- Avoid dashboards that simply mirror raw lists.
- Use definitions for red/yellow/green health so teams report consistently.
- Separate executive reporting from working-team operations views.

## Deployment Checklist

- Create development, test, and production environments or sites before build-out.
- Create publisher prefix, solution shell, environment variables, and connection references first.
- Build tables and choices before apps and flows.
- Import sample template rows, then test with non-admin users.
- Run approval, rejection, revision, escalation, and overdue scenarios before release.
- Publish Power BI pages after validating relationships, date fields, status definitions, and security trimming.
- Document owners, support mailbox, release notes, and rollback steps.

---

Generated from the BuilderVault PMO toolkit content.
