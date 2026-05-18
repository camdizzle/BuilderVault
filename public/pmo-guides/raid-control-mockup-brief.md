# RAID and change control mockup Build Brief

Module: Change, risk, and issue control

Persona: Project manager, risk owner, PMO lead, and sponsor

## Purpose

Bring risks, issues, actions, decisions, and change requests into an operational control center.

## Layout Pattern

- RAID summary tiles
- Owner work queue
- Risk heat panel
- Change approval list

## Metrics To Show

- Critical risks: 4
- Overdue actions: 9
- Pending changes: 6

## Core Fields

- Project
- Item type
- Severity
- Probability
- Impact
- Owner
- Due date
- Mitigation
- Decision needed

## Queue Examples

| Item | Meta | Status |
| --- | --- | --- |
| Integration vendor delay | Owner: Maya / Exposure 15 | Escalated |
| Scope change: add mobile approvals | Budget impact: $18k | Under review |
| Training material approval | Due yesterday | Overdue |

## Primary Actions

- Escalate
- Assign owner
- Route change
- Close with evidence

## Build Notes

- Treat risks and issues differently in the data model.
- Make owner and due date required on every active item.
- Use heat score and severity to drive alerts.

## Recommended Build Order

- Create the backing table or list and choices first.
- Build the read-only queue view before the edit form.
- Add command buttons only after status transitions are clear.
- Wire automations for notifications, approvals, and history writes.
- Add reporting measures after records have consistent owner, status, and date fields.

---

Generated from the BuilderVault PMO toolkit content.
