# Intake and triage Implementation Guide

BuilderVault PMO toolkit guide for intake and triage.

## Outcome

A lightweight portfolio intake portal with request scoring, approval routing, communications, and a decision log.

## Business Problem

Small PMO teams often receive requests through email, Teams chats, spreadsheets, and hallway conversations. The first tool should make demand visible without forcing a million-dollar enterprise platform rollout.

## Build Checklist

- Define intake categories and required questions.
- Build the request table and submitter form.
- Add triage scoring and status transitions.
- Automate submitter and reviewer communications.
- Publish Power BI demand funnel and aging views.

## Core Lists Or Tables

- Intake Requests
- Business Sponsors
- Scoring Criteria
- Triage Decisions
- Approval History
- Communication Log

## Workflow Map

- 1. Requester drafts demand
- 2. Submit intake request
- 3. PMO validates completeness
- 4. Clarification loop if needed
- 5. Weighted triage scoring
- 6. Approve, defer, or reject
- 7. Create charter record when approved

## Data Model

### Intake Requests

Platform: Either

Primary demand record submitted by business users and triaged by the PMO.

| Column | Type | Required | Notes |
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

#### Indexes

- Current Status
- Business Unit
- Sponsor
- Submitted Date
- Triage Owner
- Decision Date

### Scoring Criteria

Platform: Either

Configurable scoring rubric so the PMO can change weights without editing the app.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| Criterion Name | Single line text | Yes | Strategic alignment, benefit, urgency, risk, complexity. |
| Weight | Number | Yes | Use whole numbers that total 100 across active criteria. |
| Score Guidance | Multiple lines text | Yes | Explains what low, medium, and high scores mean. |
| Active | Yes/No | Yes | Deactivate instead of deleting to preserve history. |

#### Relationships

- Scoring Criteria is referenced by triage scoring controls.

#### Indexes

- Active
- Sort Order

## Power Apps Screen Blueprints

### Request Intake Submit Screen

Persona: Business requester

Capture a clean demand request without exposing PMO-only scoring fields.

#### Layout

- Header with request type and save state
- Left column for business need and sponsor
- Right column for timing, benefit, complexity, and attachments
- Footer command bar with Save Draft and Submit

#### Controls

- frmIntakeRequest bound to Intake Requests
- cmbRequestType
- cmbBusinessUnit
- cmbSponsor
- txtProblemStatement
- txtExpectedBenefit
- dpDesiredStart
- attBusinessCase
- btnSaveDraft
- btnSubmit

#### Formula Notes

- btnSubmit.DisplayMode checks required fields and varWorking
- OnSuccess sets status to Submitted and navigates to confirmation
- Use IfError around SubmitForm or Patch to show clear failure messages

#### Data Sources

- Intake Requests
- Business Units
- Sponsors or Users
- Attachments

### PMO Triage Queue Screen

Persona: PMO analyst

Work the intake backlog by owner, status, age, score, and business unit.

#### Layout

- Filter rail for status, owner, business unit, aging
- Gallery of intake cards
- Selected request summary panel
- Action buttons for assign, clarify, score, approve, defer, reject

#### Controls

- galTriageQueue
- cmbStatusFilter
- cmbOwnerFilter
- txtSearch
- frmSelectedRequest
- btnRequestClarification
- btnMoveToScoring
- btnDecision

#### Formula Notes

- Gallery Items uses delegable status and StartsWith filters
- Age badge uses DateDiff(SubmittedDate, Today())
- Decision buttons require decision reason for defer/reject

#### Data Sources

- Intake Requests
- Triage Decisions
- Communication Log

### Triage Scoring Screen

Persona: PMO analyst or review board

Score requests consistently and produce a recommendation.

#### Layout

- Request context summary
- Repeating scoring criteria gallery
- Weighted score panel
- Recommendation and decision notes
- Submit decision command bar

#### Controls

- galScoringCriteria
- sldCriterionScore
- lblWeightedTotal
- cmbDecision
- txtDecisionReason
- btnSaveScore
- btnCreateCharter

#### Formula Notes

- Weighted score = Sum(criteria score * weight)
- Recommendation maps thresholds to approve/defer/reject
- Create charter button patches Project Charters and links intake request

#### Data Sources

- Scoring Criteria
- Intake Requests
- Triage Decisions
- Project Charters

## Power Fx Starter Snippets

### Submit intake request with validation

Location: btnSubmit.OnSelect

```powerfx
If(
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
);
```

#### Notes

- Use Coalesce so the same button can submit a draft or new request.
- Keep status transition in the same Patch as Submitted Date.
- Replace SharePoint choice syntax with Dataverse choices if using Dataverse.

### Weighted triage score

Location: lblWeightedScore.Text

```powerfx
With(
    {
        weightedScore: Sum(
            galScoringCriteria.AllItems,
            Value(txtScore.Text) * ThisRecord.Weight
        )
    },
    Text(weightedScore, "0")
)
```

#### Notes

- Store the final score on the intake request when the decision is saved.
- Keep scoring criteria in a config table so weights are not hard-coded forever.

## Power Automate Recipes

### Intake - Confirm Submission

Trigger: When an intake request is created or status changes to Submitted.

#### Steps

- Check Current Status equals Submitted.
- Send confirmation email to requester.
- Post adaptive card or Teams message to triage channel.
- Create initial triage decision row assigned to PMO queue.
- Write Communication Log row.

#### Expressions

- @equals(triggerOutputs()?['body/CurrentStatus/Value'], 'Submitted')
- coalesce(triggerOutputs()?['body/Sponsor/Email'], 'unassigned')

### Intake - Create Charter

Trigger: When triage decision changes to Approved for Charter.

#### Steps

- Get intake request.
- Create Project Charter record.
- Copy sponsor, business unit, request title, problem statement, and expected benefit.
- Update intake Next Stage to Charter.
- Notify requester and charter owner.

#### Expressions

- @equals(triggerOutputs()?['body/Decision/Value'], 'Approved for Charter')
- formatDateTime(utcNow(), 'yyyy-MM-dd')

## Dataverse Solution Component Map

Solution name: BV PMO Intake

Publisher prefix: bvpmointake

### Tables

- bv_intakerequest
- bv_scoringcriterion
- bv_triagedecision
- bv_communicationlog

### Choices

- bv_requesttype
- bv_intakestatus
- bv_complexity
- bv_triagedecisiontype

### Apps

- PMO Intake Portal
- PMO Triage Workbench

### Cloud Flows

- Intake - Confirm Submission
- Intake - Request Clarification
- Intake - Create Charter
- Intake - Weekly Aging Digest

### Security Roles

- PMO Intake Requester
- PMO Triage Analyst
- PMO Sponsor Viewer
- PMO Executive Viewer

### Environment Variables

- PMO Intake Site URL
- PMO Triage Team Email
- PMO Digest Channel URL
- Default Charter Owner

### Dashboards

- Demand Funnel
- Triage Aging
- Department Demand
- Decision Mix

## Power BI Reporting Ideas

- Portfolio demand funnel
- intake aging by owner
- request source and category trends
- approved vs rejected request mix

## Starter DAX Measures

- Intake Count = COUNTROWS('Intake Requests')
- Average Triage Days = AVERAGEX('Intake Requests', DATEDIFF('Intake Requests'[Submitted Date], 'Intake Requests'[Decision Date], DAY))
- Aging Requests = COUNTROWS(FILTER('Intake Requests', ISBLANK('Intake Requests'[Decision Date]) && 'Intake Requests'[Submitted Date] < TODAY() - 7))
- Approval Rate = DIVIDE([Approved Requests], [Decided Requests])

## Governance Notes

- Keep intake short enough that users actually submit requests.
- Separate clarification from approval so early discovery does not look like commitment.
- Store decision reasons for future prioritization conversations.

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
