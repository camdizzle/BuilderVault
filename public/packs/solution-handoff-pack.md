# Solution Handoff Pack

From BuilderVault (buildervault.camwow.tv). Free to use and share inside your team.

Use this pack when a Power Platform solution moves from the people who built it to the people who will run it. It contains a support guide template, a user acceptance test script, an ownership transfer checklist and a go-live checklist. Check control and variable names before handoff with the free Power Apps Naming Linter: https://buildervault.camwow.tv/tools/power-apps-naming-linter

---

## 1. Support guide template

```
SUPPORT GUIDE: <solution name>            Last reviewed: <date>

1. Summary
   What it does (two sentences):
   Users (who, how many):
   Business owner:                        Criticality: High / Medium / Low
   Support hours:                         Target response:

2. Contacts
   First line:
   Second line:
   Maker or technical owner:              Backup:
   Platform admin team:

3. What it is made of
   Environment and URL:
   Solution name and version:
   Apps (name, type, link):
   Flows (name, trigger, purpose, owner):
   Data (sites and lists, or tables):
   Connections (connector, account, connection reference):
   Service account and where its credentials are held:
   Environment variables (name, purpose):
   Security (groups or roles, who approves access):
   Dependencies (other systems, gateways):

4. Routine tasks
   Add or remove a user:
   Change reference data:
   Check health:

5. Known problems and fixes
   Symptom:
   Cause:
   Fix:

6. What support may do without asking

7. What needs the maker or a change request

8. Incident steps
   1. Confirm scope: one user or everyone, since when, what changed.
   2. Check service health.
   3. Check flow run history.
   4. Apply a known fix, or escalate with time, user, screenshot, run link and error text.
   5. Tell the business owner and users what to do meanwhile.
   6. Record the cause and fix in section 5.

9. Recovery
   Data restore:
   Solution rollback:
   Manual fallback:

10. Change history
    Date | Version | Change | By
```

---

## 2. User acceptance test script

```
UAT: <solution name>     Version:     Environment: Test     Dates:
Coordinator:             Sign-off owner:
```

### Entry criteria

- [ ] The managed solution intended for production is deployed to Test.
- [ ] Test accounts exist for each role, with production-like permissions.
- [ ] Test data is loaded.
- [ ] Flows are on. Notifications go to testers only.

### Scenarios

| ID | Requirement | Role | Steps | Expected result | Actual | Pass or fail | Defect |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UAT-01 | Submit a request | Requester | Open the app, complete the form, submit | Reference number shown, status is waiting, email received | | | |
| UAT-02 | Validation | Requester | Enter an end date before the start date | Message beside the field, submit blocked | | | |
| UAT-03 | Approve | Approver | Open from the email link, approve with a comment | Status approved, requester told, comment recorded | | | |
| UAT-04 | Reject | Approver | Reject without a comment | Blocked until a comment is entered | | | |
| UAT-05 | Permissions | Requester | Open another person's request by link | Access denied or not found | | | |
| UAT-06 | Administration | Admin | Change a setting | Next request uses the new value | | | |
| UAT-07 | Mobile | Any | Repeat UAT-01 on a phone | Usable without sideways scrolling | | | |
| UAT-08 | Keyboard | Any | Complete the form with the keyboard only | Every field and button can be reached | | | |

### Defect severity

| Level | Meaning | Rule |
| --- | --- | --- |
| 1 | Blocks the process, no workaround | Fix before sign-off |
| 2 | Wrong result, workaround exists | Fix before go-live unless the owner accepts in writing |
| 3 | Cosmetic or wording | Schedule |

### Sign-off

```
I confirm version ____ was tested against this script and is accepted for production.
Name:                Role:                Date:
Known exceptions:
```

---

## 3. Ownership transfer checklist

- [ ] New owner named, with a backup.
- [ ] New owner has the licence the apps and flows need.
- [ ] New owner has access to every site, list, mailbox, table and gateway used.
- [ ] Apps: new owner added as co-owner, or app owner changed by an admin.
- [ ] Flows in a solution: primary owner changed.
- [ ] Flows outside a solution: new co-owner added, or the flow moved into a solution first.
- [ ] Every connection reference points to a connection owned by the new owner or service account.
- [ ] Triggers on personal resources (a person's OneDrive, mailbox or form) moved to shared resources.
- [ ] Emails are sent from a shared mailbox.
- [ ] A test run succeeded with no action using the previous owner's connection.
- [ ] Previous owner's access and unused connections removed.
- [ ] Inventory and support guide updated.

---

## 4. Go-live checklist

- [ ] Business owner has signed off UAT.
- [ ] Support guide is complete and stored where support can find it.
- [ ] Support team has been walked through the solution.
- [ ] Support team can see flow run history.
- [ ] Users have been told what is changing and when.
- [ ] Training or a short how-to is available.
- [ ] Access groups are populated.
- [ ] Monitoring is in place: failure notifications reach a shared channel or mailbox.
- [ ] A manual fallback exists if the solution is unavailable.
- [ ] A review date is set for four weeks after go-live.

---

## 5. First four weeks

| Week | Check |
| --- | --- |
| 1 | Daily look at failed runs and support questions. Fix and add to known problems |
| 2 | Review access requests and any permission errors |
| 3 | Review usage: who is using it, who is not |
| 4 | Review with the business owner. Agree improvements and close the project handoff |

---

More patterns, tools and examples: https://buildervault.camwow.tv
