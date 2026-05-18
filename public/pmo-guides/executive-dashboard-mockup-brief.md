# Executive dashboard mockup Build Brief

Module: Communications and Power BI reporting

Persona: Executive sponsor, PMO director, and portfolio steering group

## Purpose

Convert PMO records into portfolio health, exceptions, decisions needed, and benefits visibility.

## Layout Pattern

- Portfolio health ribbon
- Stage and demand charts
- Exception list
- Decision requests and benefits review

## Metrics To Show

- Red projects: 5
- Decisions needed: 8
- Benefits tracked: 71%

## Core Fields

- Overall health
- Stage
- Milestone variance
- Decision needed
- Sponsor
- Benefit metric
- Target
- Current value

## Queue Examples

| Item | Meta | Status |
| --- | --- | --- |
| ERP reporting rollout | Decision: launch date tradeoff | Red |
| Field inspection app | Gate exception due Friday | Yellow |
| Invoice automation | Benefit review in 30 days | Green |

## Primary Actions

- Open decision
- Send digest
- Refresh Power BI
- Snapshot month end

## Build Notes

- Separate executive pages from PMO working queues.
- Use health definitions before publishing dashboards.
- Lead with exceptions and decisions, not raw activity counts.

## Recommended Build Order

- Create the backing table or list and choices first.
- Build the read-only queue view before the edit form.
- Add command buttons only after status transitions are clear.
- Wire automations for notifications, approvals, and history writes.
- Add reporting measures after records have consistent owner, status, and date fields.

---

Generated from the BuilderVault PMO toolkit content.
