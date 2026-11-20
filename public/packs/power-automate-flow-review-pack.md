# Power Automate Flow Review Pack

From BuilderVault (buildervault.camwow.tv). Free to use and share inside your team.

Use this pack before a flow goes to production, when you take over a flow from someone else, or when a flow keeps failing. Build trigger conditions with the free Trigger Condition Builder: https://buildervault.camwow.tv/tools/trigger-condition-builder

---

## 1. Flow review checklist

### Ownership and set-up

- [ ] The flow is in a solution, not in My flows.
- [ ] The flow name states the area, the trigger and the outcome, for example `Request Hub - When request submitted - Start approval`.
- [ ] Production connections belong to a service account or service principal, not a person.
- [ ] Every connection is used through a connection reference.
- [ ] At least two co-owners are listed, or the owner is a team.
- [ ] Site addresses, list names, email addresses and thresholds come from environment variables.

### Trigger

- [ ] A trigger condition stops runs that have nothing to do.
- [ ] The flow cannot trigger itself. If it updates the item that started it, a condition or flag prevents a loop.
- [ ] Concurrency control is set on purpose: 1 when order matters or duplicates are possible, higher when runs are independent.
- [ ] For scheduled flows, the time zone is set explicitly.

### Actions

- [ ] Every action is renamed to say what it does.
- [ ] Get items uses a Filter Query, not a Condition inside a loop.
- [ ] Top Count and Pagination are set where more than 100 rows are expected.
- [ ] Loops are replaced with Select, Filter array and join where possible.
- [ ] Apply to each concurrency is on only when the steps inside do not depend on each other and do not set variables.
- [ ] Expressions used more than once sit in a named Compose action.
- [ ] Optional values are wrapped in `coalesce()` or checked with `empty()`.
- [ ] Dates shown to people are converted from UTC to their time zone.

### Error handling

- [ ] Main actions are inside a `Scope - Try`.
- [ ] A `Scope - Catch` runs after Try has failed or timed out.
- [ ] The catch scope logs the flow name, run link, record identifier and error message.
- [ ] The catch scope ends with Terminate set to Failed, so the run shows as failed.
- [ ] Actions that call other services use a retry policy that suits them.
- [ ] Approvals have a timeout and a path for what happens when nobody answers.

### Notifications

- [ ] Emails come from a shared mailbox, not a person.
- [ ] A bulk change cannot send hundreds of messages. There is a digest or a quiet period.
- [ ] Messages include a link to the record.

### Before go-live

- [ ] Tested with create, update and unrelated-edit scenarios.
- [ ] Tested with blank optional fields.
- [ ] Tested with a normal user's permissions.
- [ ] Run history reviewed after the first real runs.
- [ ] The flow is listed in the support guide with its purpose, owner and known problems.

---

## 2. Copy-ready expressions

### Blank handling

```
coalesce(triggerOutputs()?['body/Notes'], 'No notes')
if(empty(triggerOutputs()?['body/DueDate']), '', formatDateTime(triggerOutputs()?['body/DueDate'], 'd MMMM yyyy'))
```

### Dates

```
formatDateTime(utcNow(), 'yyyy-MM-dd')
convertFromUtc(utcNow(), 'GMT Standard Time', 'dd/MM/yyyy HH:mm')
addDays(utcNow(), 7)
startOfMonth(utcNow())
```

### Arrays

```
length(body('Get_items')?['value'])
first(body('Get_items')?['value'])?['Title']
join(body('Select'), ';')
union(body('Select'), body('Select'))
```

### Trigger conditions

```
@equals(triggerOutputs()?['body/Status/Value'], 'Approved')
@not(empty(triggerOutputs()?['body/AssignedTo']))
@not(equals(triggerOutputs()?['body/Editor/Email'], 'svc-flow@contoso.com'))
@and(equals(triggerOutputs()?['body/Status/Value'], 'Submitted'), greater(triggerOutputs()?['body/Amount'], 1000))
```

### SharePoint filter queries

```
Status eq 'Open'
Status eq 'Open' and DueDate lt '@{utcNow()}'
AssignedTo/EMail eq '@{triggerOutputs()?['body/Author/Email']}'
startswith(Title, 'INV-')
Modified ge '@{addDays(utcNow(), -1)}'
```

### Run details for logging

```
Flow name:  workflow()?['tags']?['flowDisplayName']
Run link:   concat('https://make.powerautomate.com/environments/', workflow()?['tags']?['environmentName'], '/flows/', workflow()?['name'], '/runs/', workflow()?['run']?['name'])
Error:      first(body('Filter_array_-_Failed'))?['error']?['message']
```

---

## 3. Try, Catch, Finally layout

```
Trigger
Initialize variables
Scope - Try
    (all working actions)
Scope - Catch                  Run after: Try has failed, has timed out
    Filter array - Failed      From: result('Scope_-_Try')    where status is equal to Failed
    Create item                Flow Failures list: flow name, run link, record key, error
    Post message               Support channel, for critical flows
    Terminate                  Failed
Scope - Finally                Run after: Catch is successful, is skipped, has failed
    (clean-up that must always run)
```

---

## 4. Naming table

| Item | Pattern | Example |
| --- | --- | --- |
| Flow | Area - Trigger - Outcome | Request Hub - Daily 08:00 - Send overdue digest |
| Child flow | Area - Child - Purpose | Shared - Child - Run approval |
| Action | Type - what it does | Get items - Open requests for approver |
| Scope | Scope - stage | Scope - Try |
| Variable | var + name | varApproverEmails |
| Connection reference | prefix_cr_Connector_Purpose | cnt_cr_SharePoint_RequestHub |
| Environment variable | prefix_Name | cnt_SupportEmail |

---

## 5. Failure triage table

| Error | Usual cause | Response |
| --- | --- | --- |
| 401, 403, connection not configured | Password changed, account disabled, permission removed | Fix the connection as its owner, then resubmit |
| 429 | Throttling | Let retries run. Lower concurrency or add a delay if it repeats |
| 408, 502, 503, 504 | Service or network blip | Resubmit |
| 400, InvalidTemplate | Null value, wrong type, missing column | Fix the data or the flow before resubmitting |
| 404 | Item, list or site deleted or renamed | Restore or repoint |
| 409, 412 | Two runs edited the same item, or a file is locked | Resubmit. Add concurrency control |
| Flow suspended | Licence removed or DLP policy change | Platform admin |

Failed runs can be resubmitted for 28 days. After that the trigger data is gone.

---

More patterns, tools and examples: https://buildervault.camwow.tv
