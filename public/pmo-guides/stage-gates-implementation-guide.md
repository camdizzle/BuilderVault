# Stage gates and lifecycle control Implementation Guide

BuilderVault PMO toolkit guide for stage gates and lifecycle control.

## Outcome

A gate portal for initiation, planning, build, test, launch, closeout, and benefits review.

## Business Problem

A PMO does not need heavyweight software to enforce lifecycle discipline. It needs visible criteria, simple evidence capture, and consistent decisions.

## Build Checklist

- Define standard stages and gate criteria.
- Build project/stage data model.
- Create gate checklist and evidence capture.
- Automate gate approval and stage changes.
- Publish lifecycle and gate-health dashboards.

## Core Lists Or Tables

- Projects
- Lifecycle Stages
- Gate Criteria
- Gate Reviews
- Evidence Links
- Gate Decisions

## Workflow Map

- 1. Project enters lifecycle stage
- 2. Generate stage criteria checklist
- 3. Project team attaches evidence
- 4. Submit gate review
- 5. Approver decides gate
- 6. Record exception if needed
- 7. Move project to next stage

## Data Model

### Projects

Platform: Either

Portfolio record that moves through lifecycle stages and connects to controls, status, and reporting.

| Column | Type | Required | Notes |
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

#### Indexes

- Current Stage
- Sponsor
- Project Manager
- Overall Health
- Forecast Launch Date

### Gate Reviews

Platform: Either

Approval record for moving a project from one stage to the next.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| Project | Lookup | Yes | Parent project. |
| Stage | Choice or lookup | Yes | Stage being reviewed. |
| Review Status | Choice | Yes | Draft, Submitted, Approved, Approved with Exception, Rejected. |
| Approver | Person | Yes | Decision maker for the gate. |
| Exception Reason | Multiple lines text | No | Required when approved with exception. |

#### Relationships

- One Gate Review has many Evidence Links and Gate Decisions.

#### Indexes

- Project
- Stage
- Review Status
- Approver
- Decision Date

## Power Apps Screen Blueprints

### Project Lifecycle Dashboard Screen

Persona: Project manager and PMO lead

Show stage, gate readiness, missing evidence, and stage aging for a project.

#### Layout

- Project header with health and stage
- Horizontal lifecycle tracker
- Gate readiness cards
- Open exceptions and actions
- Submit gate review button

#### Controls

- cmpLifecycleTracker
- galGateCriteria
- galMissingEvidence
- lblStageAge
- btnSubmitGate

#### Formula Notes

- Gate submit enabled when all required criteria have evidence
- Stage age uses DateDiff(StageChangedDate, Today())
- Exception badge appears when gate has approved exception

#### Data Sources

- Projects
- Gate Criteria
- Gate Reviews
- Evidence Links

### Gate Evidence Screen

Persona: Project manager

Attach links, documents, and notes against each gate criterion.

#### Layout

- Criteria list
- Evidence details panel
- Upload or link controls
- Save evidence command bar

#### Controls

- galCriteria
- txtEvidenceUrl
- txtEvidenceNotes
- attEvidence
- btnSaveEvidence
- btnMarkCriterionReady

#### Formula Notes

- Evidence URL or attachment required for required criteria
- Patch evidence rows by selected criterion
- Refresh readiness summary after save

#### Data Sources

- Gate Criteria
- Evidence Links
- Gate Reviews

### Gate Approval Screen

Persona: Gate approver

Decide whether a project can move to the next lifecycle stage.

#### Layout

- Project and stage summary
- Evidence checklist read-only view
- Decision section
- Exception reason panel
- Approval history

#### Controls

- galEvidenceReview
- cmbGateDecision
- txtGateComments
- txtExceptionReason
- btnSubmitGateDecision

#### Formula Notes

- Exception reason required for Approved with Exception
- Approved decision updates Project.CurrentStage
- Rejected decision keeps stage and creates remediation action

#### Data Sources

- Projects
- Gate Reviews
- Evidence Links
- Actions

## Power Fx Starter Snippets

### Enable submit gate review only when evidence is ready

Location: btnSubmitGate.DisplayMode

```powerfx
If(
    CountRows(
        Filter(
            galGateCriteria.AllItems,
            Required = true && IsBlank('Evidence URL')
        )
    ) = 0,
    DisplayMode.Edit,
    DisplayMode.Disabled
)
```

#### Notes

- Use a generated checklist row per project and stage.
- If attachments are used instead of URLs, check attachment count instead.

### Approve gate and move project stage

Location: btnSubmitGateDecision.OnSelect

```powerfx
IfError(
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
);
```

#### Notes

- Gate approval and project stage update should be treated as one business transaction.
- Create an action item when the decision is approved with exception.

## Power Automate Recipes

### Gate - Generate Criteria

Trigger: When Project Current Stage changes.

#### Steps

- List active Gate Criteria for the new stage.
- Create project-specific checklist rows.
- Assign evidence owners.
- Notify project manager that stage checklist is ready.

#### Expressions

- triggerOutputs()?['body/CurrentStage/Value']
- items('Apply_to_each_criterion')?['Required']

### Gate - Approval Decision

Trigger: When Gate Review status changes to Submitted.

#### Steps

- Collect evidence links.
- Start approval for gate approver.
- Update Gate Review decision and decision date.
- If approved, update Project Current Stage.
- If approved with exception, create exception action.

#### Expressions

- @equals(triggerOutputs()?['body/ReviewStatus/Value'], 'Submitted')
- @or(equals(variables('Decision'), 'Approved'), equals(variables('Decision'), 'Approved with Exception'))

## Dataverse Solution Component Map

Solution name: BV PMO Stage Gates

Publisher prefix: bvpmogate

### Tables

- bv_project
- bv_lifecyclestage
- bv_gatecriterion
- bv_gatereview
- bv_evidencelink
- bv_gateexception

### Choices

- bv_lifecyclestagechoice
- bv_gatereviewstatus
- bv_gatedecision
- bv_evidencetype

### Apps

- Project Lifecycle Dashboard
- Gate Evidence App
- Gate Approval Portal

### Cloud Flows

- Gate - Generate Criteria
- Gate - Submit Review
- Gate - Approval Decision
- Gate - Stage Change Notification

### Security Roles

- Gate Project Manager
- Gate Approver
- Gate PMO Admin
- Gate Executive Viewer

### Environment Variables

- Gate Review Team Email
- Gate Exception Owner
- Lifecycle Stage Config URL
- Power BI Refresh Flow URL

### Dashboards

- Lifecycle Pipeline
- Stage Aging
- Gate Exceptions
- Approval Bottlenecks

## Power BI Reporting Ideas

- Lifecycle pipeline
- stage aging
- gate health
- approval bottleneck dashboard

## Starter DAX Measures

- Projects by Stage = COUNTROWS('Projects') grouped by Current Stage
- Average Stage Age = AVERAGEX('Projects', DATEDIFF('Projects'[Stage Changed Date], TODAY(), DAY))
- Gate Exception Rate = DIVIDE([Gate Approved With Exception], [Gate Decisions])
- Overdue Gate Count = COUNTROWS(FILTER('Gate Reviews', 'Gate Reviews'[Due Date] < TODAY() && 'Gate Reviews'[Review Status] <> "Approved"))

## Governance Notes

- Keep gate criteria objective and auditable.
- Allow exceptions, but require reason and approver.
- Use stage history instead of overwriting old decisions.

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
