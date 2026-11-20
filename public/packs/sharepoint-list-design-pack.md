# SharePoint List Design Pack

From BuilderVault (buildervault.camwow.tv). Free to use and share inside your team.

Use this pack when you plan a SharePoint list that a Power App or flow will depend on. Check internal names with the free SharePoint Internal Name Helper: https://buildervault.camwow.tv/tools/sharepoint-internal-name-helper

---

## 1. Design worksheet

Fill this in before creating anything.

```
List name:
Site:
Purpose (one sentence):
Owner:                          Backup owner:
Who adds items:                 Who edits:                 Who only reads:
Expected items per year:        Expected total after 3 years:
Apps that use it:
Flows that use it:
Questions the data must answer:
  1.
  2.
  3.
Views needed:
Retention (how long items are kept, and what happens then):
```

---

## 2. Column plan

One row per column. Create each column with the internal name, then rename the display name.

| Internal name | Display name | Type | Required | Default | Indexed | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Title | Summary | Single line | Yes | | | |
| RequestType | Request type | Choice | Yes | | Yes | |
| Status | Status | Choice | Yes | New | Yes | |
| AssignedTo | Assigned to | Person | No | | Yes | |
| DueDate | Due date | Date only | No | | Yes | |

### Choosing a type

| The value is | Use |
| --- | --- |
| A person | Person |
| One of a short fixed list | Choice |
| One of a list that has its own details | Lookup |
| Shared across many sites | Managed metadata |
| A date | Date (date only unless time matters) |
| Money | Currency |
| A count or measure | Number |
| True or false | Yes/No |
| Long notes | Multiple lines, plain text |
| An identifier | Single line, enforce unique values |

### Naming rules

- Create columns without spaces: `DueDate`, then rename to `Due date`.
- The internal name never changes after creation.
- Avoid `Title`, `Name`, `Author`, `Editor`, `Created`, `Modified`, `ID` as new column names.
- One meaning per column. Do not reuse a column for a second purpose.

---

## 3. Ready-made schemas

### Request list

```
Title            Single line     required
RequestType      Choice          indexed
Details          Multiple lines  plain text
Priority         Choice          Low | Normal | High            default Normal
Status           Choice          New | In progress | Waiting | Done | Declined    default New, indexed
AssignedTo       Person          indexed
DueDate          Date only       indexed
ResolutionNotes  Multiple lines  plain text
ClosedOn         Date and time
```

### Approval columns

```
ApprovalStatus   Choice          Not submitted | Pending | Approved | Rejected    indexed
Approver         Person
SubmittedOn      Date and time
DecisionOn       Date and time
DecisionBy       Person
DecisionComments Multiple lines  plain text
```

### Child list

```
Title            Single line
ParentId         Number          indexed     ID of the parent item
Quantity         Number
UnitPrice        Currency
LineTotal        Calculated      =[Quantity]*[UnitPrice]
```

### Reference list

```
Title            Single line     enforce unique values
Code             Single line     enforce unique values
IsActive         Yes/No          default Yes
SortOrder        Number
```

### Settings list

```
Title            Single line     setting key, enforce unique values
SettingValue     Single line
Description      Multiple lines
IsEnabled        Yes/No
```

### History list

```
Title            Single line     event
RecordId         Number          indexed
FromValue        Single line
ToValue          Single line
Comment          Multiple lines  plain text
EventOn          Date and time   default today
```

---

## 4. Index and view checklist

- [ ] Every column used to filter or sort in a view, app or flow is indexed.
- [ ] Indexes were added before the list reached 5,000 items.
- [ ] No more than 20 indexes.
- [ ] Each view's first filter is on an indexed column and returns fewer than 5,000 items.
- [ ] Views show 12 or fewer lookup, person and managed metadata columns.
- [ ] Standard views exist: My items, Open, Overdue, Unassigned, Recently changed, All items for support.

---

## 5. Power Apps and Power Automate checks

- [ ] App filters use `=`, `<>`, `<`, `>`, `StartsWith` and `&&` or `||` only, so they delegate.
- [ ] Person filters compare `.Email`, or a text column that stores the email.
- [ ] Date boundaries are calculated outside `Filter()`.
- [ ] Flow Get items actions use a Filter Query with internal names.
- [ ] Choice columns are read with `/Value` in flow expressions.
- [ ] Flows that update the list have a trigger condition to avoid loops.

---

## 6. Go-live checklist

- [ ] Owner and backup owner recorded.
- [ ] Permissions use SharePoint groups. Unique permissions are documented.
- [ ] Versioning is on.
- [ ] Attachments are off unless needed.
- [ ] Test items removed.
- [ ] The list, its apps and its flows are listed in the support guide.

---

More patterns, tools and examples: https://buildervault.camwow.tv
