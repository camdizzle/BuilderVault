# PMO Solution Architecture Brief

A technical planning artifact for building the BuilderVault PMO toolkit with Microsoft 365 and Power Platform.

## Reference Architecture Layers

### Experience layer

Focused portals and apps for each PMO workflow instead of one giant all-purpose application.

#### Components

- Power Apps requester and PMO workbench screens
- Power Pages intake portal when external or broad business access is needed
- Model-driven admin views for Dataverse-heavy builds
- Power BI app for executive and PMO reporting

#### Design Notes

- Separate requester experiences from PMO-only work queues.
- Use role-based navigation so sponsors, PMs, and executives see only relevant actions.
- Keep forms short at intake and add detail as work moves through the lifecycle.

### Operational data layer

The source of truth for demand, charters, projects, gates, RAID, changes, decisions, status updates, and benefits.

#### Components

- SharePoint lists for lightweight MVPs
- Dataverse tables for relational security and lifecycle maturity
- Choice sets for status, health, severity, and decision outcomes
- Audit/history tables for approvals, stage movement, decisions, and communications

#### Design Notes

- Design around lifecycle records, not screens.
- Use lookup relationships for projects, sponsors, gates, risks, issues, and decisions.
- Do not overwrite history fields when a separate history row is needed.

### Automation layer

Power Automate flows that route approvals, reminders, escalations, notifications, history writes, and report refreshes.

#### Components

- Submission confirmations
- Sponsor approvals
- Gate approval routing
- Critical risk and overdue action escalations
- Weekly status shells and executive digest
- Power BI refresh triggers

#### Design Notes

- Use connection references and environment variables from the beginning.
- Keep business-critical decision writes explicit and auditable.
- Create communication log rows when flows notify stakeholders.

### Reporting layer

Power BI semantic model and dashboards for portfolio health, lifecycle movement, exceptions, decisions, and benefits.

#### Components

- Demand funnel
- Lifecycle and stage aging
- Gate exception dashboard
- RAID and change impact dashboards
- Executive portfolio health
- Benefits review pages

#### Design Notes

- Separate operational queues from executive pages.
- Define health, severity, and status before building visuals.
- Build reports from curated views or modeled tables instead of raw list exports when the system matures.

### Collaboration layer

Teams, email, and stakeholder digest patterns that keep PMO decisions visible without making users live inside lists.

#### Components

- Teams triage channel posts
- Sponsor approval notifications
- Overdue owner reminders
- Executive digest messages
- Decision-needed alerts

#### Design Notes

- Send fewer, more decision-oriented notifications.
- Link messages back to the relevant app, record, or report.
- Use Teams for visibility, not as the system of record.

## SharePoint versus Dataverse

### Use SharePoint When

- The PMO is small and needs a fast MVP.
- Security can be handled at site, list, or simple item ownership level.
- Relationships are light and mostly lookup-style.
- The first goal is demand visibility and basic reporting.

### Use Dataverse When

- Role-based security, teams, business units, or row-level access matter.
- The PMO needs stronger relationships across projects, gates, risks, issues, changes, and decisions.
- Model-driven admin experiences would reduce maintenance effort.
- The solution is likely to become a managed internal platform or client offering.

## Security Roles

### Requester

Create and view own intake requests and clarification responses.

- No access to PMO scoring fields.
- Can see submitted status and decision outcome.

### PMO analyst

Edit triage, scoring, decision notes, queues, and operational PMO records.

- Can assign owners and request clarification.
- Can move approved demand to charter.

### Sponsor

Review and approve assigned charters, decisions, gate exceptions, and escalations.

- Should see items tied to their department or sponsorship.
- Approval comments must be retained.

### Project manager

Manage project status, gate evidence, RAID items, change requests, milestones, and weekly updates for assigned projects.

- Cannot approve their own gate decisions unless governance allows it.
- Owns evidence quality and update cadence.

### Executive viewer

Read portfolio dashboards, exceptions, decisions needed, and benefits reporting.

- Prefer read-only reporting access.
- Avoid exposing operational edit forms.

### PMO admin

Maintain choices, criteria templates, environment variables, app settings, and security assignments.

- Limited group with documented release process.
- Owns data model and support playbook.

## Environment Path

### Development

Build and test data model, apps, flows, and reports with sample records.

- Use a solution from day one for Dataverse builds.
- Create environment variables and connection references early.
- Keep sample data realistic enough for stakeholder review.

### Test or UAT

Validate role access, approval paths, edge cases, notifications, reporting, and migration steps.

- Test as non-admin users.
- Run approve, reject, revise, escalate, overdue, and exception scenarios.
- Confirm Power BI refresh and audience permissions.

### Production

Operate the PMO system with controlled releases, support ownership, and governance cadence.

- Deploy managed solutions when using Dataverse.
- Document rollback steps and support contacts.
- Track enhancement backlog and release notes.

## Recommended Technical Release Sequence

- 1. Create publisher, solution shell, environment variables, and connection references.
- 2. Build core tables or lists, choices, relationships, and sample rows.
- 3. Create app screens and role-based navigation.
- 4. Add flows for status changes, approvals, notifications, escalations, and logs.
- 5. Build Power BI model and reports after operational records stabilize.
- 6. Test role access, lifecycle scenarios, flow failures, and reporting refresh.
- 7. Release by phase and monitor adoption before adding complexity.

---

Generated from the BuilderVault PMO toolkit content.
