# Charter and approval Implementation Guide

BuilderVault PMO toolkit guide for charter and approval.

## Outcome

A charter approval portal that captures scope, objectives, success measures, stakeholders, assumptions, and formal sponsor approval.

## Business Problem

Many teams jump from idea to execution without a clear charter. A simple charter workflow creates alignment before delivery effort begins.

## Build Checklist

- Create charter schema and required fields.
- Build the charter draft/edit experience.
- Add sponsor approval and revision paths.
- Generate a printable charter summary.
- Track cycle time and approval backlog.

## Core Lists Or Tables

- Project Charters
- Stakeholders
- Success Measures
- Assumptions
- Charter Approval History
- Charter Documents

## Workflow Map

- 1. Draft charter from approved intake
- 2. PMO completeness review
- 3. Revision loop if incomplete
- 4. Sponsor approval request
- 5. Sponsor approves or requests revision
- 6. Create project record
- 7. Open initial lifecycle stage

## Data Model

### Project Charters

Platform: Either

Formal definition of approved work before planning begins.

| Column | Type | Required | Notes |
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

#### Indexes

- Charter Status
- Sponsor
- Project Manager
- Approval Date

### Success Measures

Platform: Either

Defines how the PMO will know whether the project created value.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| Metric | Single line text | Yes | Cycle time, cost reduction, adoption, compliance, satisfaction. |
| Baseline | Number or text | No | Current-state value before project. |
| Target | Number or text | Yes | Desired future-state value. |
| Measurement Method | Multiple lines text | Yes | Where the number comes from and how often it is reviewed. |

#### Relationships

- Many Success Measures relate to one Project Charter.

#### Indexes

- Charter
- Review Date

## Power Apps Screen Blueprints

### Charter Draft Screen

Persona: Project manager or requester

Build the charter from an approved intake request with scope, objectives, risks, and value.

#### Layout

- Charter progress tabs
- Business case section
- Scope and out-of-scope section
- Stakeholders subgrid
- Success measures subgrid

#### Controls

- frmProjectCharter
- txtObjectives
- txtInScope
- txtOutOfScope
- galStakeholders
- galSuccessMeasures
- btnSubmitForPmoReview

#### Formula Notes

- Submit disabled until objectives, scope, sponsor, and success measures exist
- Patch stakeholder child rows before status changes
- Notify author when PMO review starts

#### Data Sources

- Project Charters
- Stakeholders
- Success Measures
- Approval History

### PMO Charter Review Screen

Persona: PMO reviewer

Validate charter quality before sponsor approval.

#### Layout

- Read-only charter summary
- Completeness checklist
- Reviewer comments
- Request revision or send to sponsor actions

#### Controls

- frmCharterReadOnly
- galCompletenessChecklist
- txtReviewComments
- btnRequestRevision
- btnSendSponsorApproval

#### Formula Notes

- Checklist must be complete before sponsor approval
- Revision action sets status and sends comments
- Sponsor approval action starts approval flow

#### Data Sources

- Project Charters
- Approval History
- Communication Log

### Sponsor Approval Screen

Persona: Business sponsor

Approve, reject, or request revisions with minimal friction.

#### Layout

- Charter one-page summary
- Risk and investment highlights
- Approval decision panel
- Comments and attachments

#### Controls

- cntCharterSummary
- galSuccessMeasureSummary
- cmbSponsorDecision
- txtSponsorComments
- btnSubmitDecision

#### Formula Notes

- Approval creates Project record and initial lifecycle stage
- Revision reopens charter for author
- Reject requires rationale

#### Data Sources

- Project Charters
- Projects
- Approval History
- Lifecycle Stages

## Power Fx Starter Snippets

### Submit charter for PMO review

Location: btnSubmitForPmoReview.OnSelect

```powerfx
If(
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
);
```

#### Notes

- Require success measures before approval so value tracking is not an afterthought.
- Lock major charter fields after sponsor approval.

### Create project after sponsor approval

Location: Sponsor approval success action

```powerfx
Set(
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
);
```

#### Notes

- Create the Project record once, from the approved charter.
- Use the created project ID to generate initial stage gate checklist rows.

## Power Automate Recipes

### Charter - Sponsor Approval

Trigger: When Charter Status changes to Sponsor Review.

#### Steps

- Get charter and stakeholder details.
- Start and wait for approval assigned to Sponsor.
- If approved, update Charter Status to Approved.
- Create Project record and first lifecycle stage.
- If rejected or revision requested, update status and send comments to author.

#### Expressions

- @equals(triggerOutputs()?['body/CharterStatus/Value'], 'Sponsor Review')
- outputs('Start_and_wait_for_an_approval')?['body/outcome']

## Dataverse Solution Component Map

Solution name: BV PMO Charter

Publisher prefix: bvpmocrt

### Tables

- bv_projectcharter
- bv_stakeholder
- bv_successmeasure
- bv_approvalhistory
- bv_project

### Choices

- bv_charterstatus
- bv_stakeholderrole
- bv_approvaldecision
- bv_measuretype

### Apps

- Charter Draft App
- Sponsor Approval Portal
- PMO Charter Review

### Cloud Flows

- Charter - Submit PMO Review
- Charter - Sponsor Approval
- Charter - Request Revision
- Charter - Create Project

### Security Roles

- Charter Author
- Charter PMO Reviewer
- Charter Sponsor Approver
- Portfolio Viewer

### Environment Variables

- Charter Approval Timeout Days
- Sponsor Approval Email Template
- Project Site Base URL
- PMO Charter Support Email

### Dashboards

- Charter Approval Backlog
- Sponsor Queue
- Approved Value Pipeline
- Revision Rate

## Power BI Reporting Ideas

- Charter approval cycle time
- approved project value
- sponsor queue
- charters by business unit

## Starter DAX Measures

- Charters Awaiting Sponsor = COUNTROWS(FILTER('Project Charters', 'Project Charters'[Charter Status] = "Sponsor Review"))
- Average Approval Days = AVERAGEX('Project Charters', DATEDIFF('Project Charters'[Submitted Date], 'Project Charters'[Approval Date], DAY))
- Approved Estimated Value = SUM('Project Charters'[Estimated Benefit])
- Revision Rate = DIVIDE([Revision Requested Count], [Submitted Charter Count])

## Governance Notes

- Do not overbuild charter fields on day one.
- Make revision comments visible to the requester.
- Require explicit scope exclusions for risky projects.

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
