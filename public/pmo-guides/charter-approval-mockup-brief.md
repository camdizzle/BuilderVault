# Charter approval mockup Build Brief

Module: Charter and approval

Persona: Sponsor, PMO reviewer, and project manager

## Purpose

Turn approved demand into a scoped charter with sponsor signoff and revision history.

## Layout Pattern

- Charter summary header
- Scope and value form
- Stakeholder and success measure sections
- Sponsor decision panel

## Metrics To Show

- Awaiting sponsor: 7
- Avg approval days: 4.8
- Revision rate: 22%

## Core Fields

- Project name
- Sponsor
- Project manager
- Objectives
- In scope
- Out of scope
- Success measures
- Assumptions
- Key risks

## Queue Examples

| Item | Meta | Status |
| --- | --- | --- |
| Customer service case automation | Sponsor: Operations VP | Sponsor review |
| Vendor renewal tracker | Sponsor: Procurement | PMO review |
| Warehouse safety inspection app | Sponsor: Facilities | Revision requested |

## Primary Actions

- Send to sponsor
- Request revision
- Approve charter
- Create project

## Build Notes

- Make scope exclusions mandatory for risky projects.
- Keep approval comments visible to the author.
- Create the project record only after sponsor approval.

## Recommended Build Order

- Create the backing table or list and choices first.
- Build the read-only queue view before the edit form.
- Add command buttons only after status transitions are clear.
- Wire automations for notifications, approvals, and history writes.
- Add reporting measures after records have consistent owner, status, and date fields.

---

Generated from the BuilderVault PMO toolkit content.
