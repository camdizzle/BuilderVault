# Power Fx Review Pack

From BuilderVault (buildervault.camwow.tv). Free to use and share inside your team.

Use this pack before you hand an app to another maker, publish to production, or ask someone to review a formula. Format formulas first with the free Power Fx Formatter: https://buildervault.camwow.tv/tools/power-fx-formatter

---

## 1. Formula review checklist

Work through this list for every button OnSelect, App.OnStart, and any formula longer than a few lines.

### Readability

- [ ] The formula is formatted: one argument per line for long calls, short calls kept inline.
- [ ] Controls are renamed from defaults (Button1, Gallery3) to a prefix plus purpose (btnSubmit, galRequests).
- [ ] Variables use a clear prefix: `var` for global (Set), `loc` for context (UpdateContext), `col` for collections.
- [ ] Repeated sub-expressions are pulled into a `With()` block instead of being copied.
- [ ] Nesting is no deeper than four or five levels. If it is, split with `With()` or named formulas.
- [ ] Long `If()` chains on one value are rewritten as `Switch()`.
- [ ] Comments (`//`) explain why, not what.

### Saving data

- [ ] Every `Patch()`, `SubmitForm()`, `Remove()`, and `Collect()` against a data source is wrapped in `IfError()` or checked with `Errors()`.
- [ ] The user sees success and failure feedback with `Notify()`.
- [ ] Save buttons are disabled while saving, so double clicks don't create duplicate records.
- [ ] Required fields are validated before the save runs, not after it fails.
- [ ] `ForAll()` with `Patch()` has been tested with realistic row counts. Consider a single `Patch()` with a table instead.

### Delegation

- [ ] Every `Filter()`, `LookUp()`, `Search()`, and `Sort()` against SharePoint or Dataverse shows no delegation warning in Studio.
- [ ] No functions such as `Lower()`, `Len()`, `Left()`, or `Text()` are applied to a column inside a filter.
- [ ] The `in` operator and `Search()` are not used against SharePoint lists.
- [ ] `CountRows()`, `Sum()`, and other aggregates are not run directly on a large SharePoint list.
- [ ] You've tested with more rows than the data row limit (set it to 1 temporarily to find hidden problems).

### Performance

- [ ] App.OnStart only loads what the first screen needs. Use named formulas or screen OnVisible for the rest.
- [ ] Reference data that rarely changes is cached in a collection once, not looked up in every gallery row.
- [ ] Galleries don't call `LookUp()` per row against a data source.
- [ ] `Concurrent()` is used when several independent loads run at start-up.

### Handoff

- [ ] Environment-specific values (URLs, emails, list names) are not hard-coded.
- [ ] The app works for a user with only the permissions a normal user will have.
- [ ] Someone other than the author can explain each complex formula after reading it once.

---

## 2. Snippets

All snippets use comma separators. If your region uses semicolons, swap `,` for `;` and `;` for `;;`.

### Save with error handling and feedback

```
UpdateContext({locSaving: true});
IfError(
    Patch(
        Requests,
        Defaults(Requests),
        {
            Title: txtTitle.Text,
            DueDate: dpDueDate.SelectedDate
        }
    ),
    Notify("The request could not be saved. " & FirstError.Message, NotificationType.Error),
    Notify("Request saved.", NotificationType.Success);
    ResetForm(frmRequest)
);
UpdateContext({locSaving: false})
```

Set the save button's DisplayMode to `If(locSaving, DisplayMode.Disabled, DisplayMode.Edit)`.

### Filter by the current user without breaking delegation

```
With(
    {me: Lower(User().Email)},
    Filter(Requests, 'Created By'.Email = me)
)
```

Work out the value once with `With()`, then compare the column directly.

### Replace a long If chain with Switch

```
Switch(
    ThisItem.Status.Value,
    "Draft", Color.Gray,
    "Submitted", RGBA(0, 120, 212, 1),
    "Approved", Color.Green,
    "Rejected", Color.Red,
    Color.Black
)
```

### Name intermediate values with With

```
With(
    {
        subtotal: Sum(colLines, Quantity * UnitPrice),
        taxRate: 0.0825
    },
    Text(subtotal * (1 + taxRate), "$#,##0.00")
)
```

### Cache reference data at start-up

```
Concurrent(
    ClearCollect(colStatuses, Statuses),
    ClearCollect(colDepartments, Departments),
    Set(varCurrentUser, User())
)
```

### Validate required fields before saving

```
If(
    IsBlank(txtTitle.Text) || IsBlank(dpDueDate.SelectedDate),
    Notify("Title and due date are required.", NotificationType.Warning),
    Select(btnSave)
)
```

### Confirm before a destructive action

```
// OnSelect of the delete icon
UpdateContext({locConfirmDelete: true, locItemToDelete: ThisItem})

// OnSelect of the dialog's Yes button
IfError(
    Remove(Requests, locItemToDelete),
    Notify("Delete failed. " & FirstError.Message, NotificationType.Error),
    Notify("Deleted.", NotificationType.Success)
);
UpdateContext({locConfirmDelete: false})
```

### Patch a SharePoint person column

```
Patch(
    Requests,
    galRequests.Selected,
    {
        AssignedTo: {
            '@odata.type': "#Microsoft.Azure.Connectors.SharePoint.SPListExpandedUser",
            Claims: "i:0#.f|membership|" & Lower(cmbAssignee.Selected.Mail),
            DisplayName: cmbAssignee.Selected.DisplayName,
            Email: cmbAssignee.Selected.Mail,
            Department: "",
            JobTitle: "",
            Picture: ""
        }
    }
)
```

---

## 3. Naming conventions

| Thing | Prefix | Example |
| --- | --- | --- |
| Screen | `scr` | scrRequestDetails |
| Gallery | `gal` | galRequests |
| Form | `frm` | frmRequest |
| Button | `btn` | btnSubmit |
| Text input | `txt` | txtTitle |
| Combo box / dropdown | `cmb` / `drp` | cmbAssignee |
| Date picker | `dp` | dpDueDate |
| Label | `lbl` | lblStatus |
| Container | `con` | conHeader |
| Global variable | `var` | varCurrentUser |
| Context variable | `loc` | locSaving |
| Collection | `col` | colStatuses |

Pick one convention for the team and write it down. Consistency matters more than the exact prefixes.

---

More patterns, cheat sheets, and free tools: https://buildervault.camwow.tv
BuilderVault is independent and not affiliated with Microsoft.
