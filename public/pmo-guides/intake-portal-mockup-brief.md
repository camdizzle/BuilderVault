# Intake portal mockup Build Brief

Module: Intake and triage

Persona: Business requester and PMO triage lead

## Purpose

Show how a simple intake form and triage queue can replace scattered email demand.

## Layout Pattern

- Left-side request form
- Right-side submission checklist
- PMO triage queue below
- Decision summary panel

## Metrics To Show

- New requests: 18
- Aging over 7 days: 5
- Approved this month: 11

## Core Fields

- Request type
- Business unit
- Sponsor
- Problem statement
- Expected benefit
- Complexity
- Desired start
- Attachments

## Queue Examples

| Item | Meta | Status |
| --- | --- | --- |
| Automate invoice exception review | Finance / High benefit | Ready for triage |
| Replace manual onboarding checklist | HR / Medium complexity | Clarification needed |
| Power BI executive sales view | Sales / Sponsor review | Submitted |

## Primary Actions

- Save draft
- Submit request
- Request clarification
- Approve for charter

## Build Notes

- Keep requester fields short and plain-language.
- Hide score and decision fields from submitters.
- Use the triage queue as the PMO daily work surface.

## Recommended Build Order

- Create the backing table or list and choices first.
- Build the read-only queue view before the edit form.
- Add command buttons only after status transitions are clear.
- Wire automations for notifications, approvals, and history writes.
- Add reporting measures after records have consistent owner, status, and date fields.

---

Generated from the BuilderVault PMO toolkit content.
