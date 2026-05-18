# Gate review mockup Build Brief

Module: Stage gates and lifecycle control

Persona: Project manager, gate approver, and PMO governance lead

## Purpose

Show stage readiness, required evidence, exceptions, and approval decisions in one view.

## Layout Pattern

- Project stage header
- Gate criteria checklist
- Evidence links table
- Approval and exception panel

## Metrics To Show

- Projects in build: 14
- Overdue gates: 3
- Exception rate: 16%

## Core Fields

- Current stage
- Gate criterion
- Evidence URL
- Owner
- Due date
- Approver
- Decision
- Exception reason

## Queue Examples

| Item | Meta | Status |
| --- | --- | --- |
| Planning exit review | 6 of 7 criteria complete | Gate prep |
| Testing entry review | Evidence missing: test plan | Blocked |
| Launch readiness | Approver: PMO governance | Submitted |

## Primary Actions

- Attach evidence
- Submit gate
- Approve with exception
- Move stage

## Build Notes

- Generate checklist rows from a criteria template.
- Write stage history instead of overwriting old decisions.
- Require exception owners and due dates.

## Recommended Build Order

- Create the backing table or list and choices first.
- Build the read-only queue view before the edit form.
- Add command buttons only after status transitions are clear.
- Wire automations for notifications, approvals, and history writes.
- Add reporting measures after records have consistent owner, status, and date fields.

---

Generated from the BuilderVault PMO toolkit content.
