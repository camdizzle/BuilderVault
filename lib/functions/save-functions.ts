import { canvasDoc, code, note, p, powerFxDoc, section, table, ul } from "../guides/types";
import { fxRef, type FunctionPage } from "./types";

const published = "2026-11-21";
const category = "Save and remove data" as const;
const sharePointDoc = canvasDoc("connections/connection-sharepoint-online", "Connect to SharePoint from a canvas app: delegable functions");
const errorHandlingDoc = powerFxDoc("error-handling", "Error handling in Power Fx");

export const patchFunction: FunctionPage = {
  slug: "patch",
  name: "Patch",
  category,
  title: "Patch function in Power Apps: create and update records",
  description: "How the Power Fx Patch function creates a record with Defaults, updates an existing one, saves several records at once, returns the saved record, and reports errors.",
  keywords: ["Power Apps Patch function", "Patch Defaults create record", "Patch update record Power Apps", "Patch multiple records", "Patch SharePoint list"],
  published,
  updated: published,
  quickAnswer: "Patch(DataSource, BaseRecord, Changes) saves changes to one record. To create a record, pass Defaults(DataSource) as the base record. To update one, pass a record that came from the data source, such as Gallery.Selected or a LookUp. Only the columns in the change record are written. Patch returns the saved record, which is how you get the ID of a new item, and an error you can catch with IfError.",
  syntax: `Patch( DataSource, BaseRecord, ChangeRecord1 [, ChangeRecord2, ... ] )
Patch( DataSource, BaseRecordsTable, ChangeRecordTable1 [, ChangeRecordTable2, ... ] )
Patch( Record1, Record2 [, ... ] )`,
  arguments: [
    ["`DataSource`", "Required", "The list, table or collection to save to."],
    ["`BaseRecord`", "Required", "The record to change, which must trace back to the data source, or `Defaults(DataSource)` to create a new one."],
    ["`ChangeRecord1`, ...", "Required", "Records holding the columns to set. Applied in order, so later values win."],
    ["`BaseRecordsTable`, `ChangeRecordTable`", "Required (table form)", "A table of base records and matching tables of changes, one for one, to save many records in one call."]
  ],
  returns: "The record that was created or changed, including columns the data source filled in, such as ID. A table of records in the table form. An error if the save failed.",
  usableIn: "Behaviour formulas only",
  delegation: "Patch writes rather than queries, so it is not subject to delegation. A `Filter` or `LookUp` that picks the record still is.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Create a record
Patch(Requests, Defaults(Requests), { Title: txtTitle.Text, DueDate: dpDue.SelectedDate })

// Update the selected record
Patch(Requests, galRequests.Selected, { Status: { Value: "Closed" } })

// Update by ID
Patch(Requests, LookUp(Requests, ID = varID), { Title: txtTitle.Text })

// Keep the new record, for its ID
Set(varNew, Patch(Requests, Defaults(Requests), { Title: txtTitle.Text }));
Navigate(scrDetails, ScreenTransition.None, { selectedID: varNew.ID })`),
      p("Columns you do not name are left as they are. That is the difference from `Update`, which replaces the whole record.")
    ),
    section(
      "column-types",
      "Choice, Person, Lookup and date columns",
      table(
        ["Column type", "Value to patch"],
        ["SharePoint Choice", "`{ Value: \"Closed\" }`, or `drpStatus.Selected`"],
        ["SharePoint Person", "A record with `Claims`, such as `{ Claims: \"i:0#.f|membership|\" & User().Email, DisplayName: User().FullName, Email: User().Email, Department: \"\", JobTitle: \"\", Picture: \"\" }`"],
        ["SharePoint Lookup", "`{ Id: 12, Value: \"Contoso\" }`"],
        ["Dataverse Choice", "The choice value, such as `'Status (Requests)'.Closed`"],
        ["Dataverse Lookup", "The related record, such as `LookUp(Accounts, 'Account Name' = \"Contoso\")`"],
        ["Date only", "A date, such as `dpDue.SelectedDate`, not text"]
      ),
      p("The [SharePoint Choice pattern](/patterns/patch-sharepoint-choice-field) and the [Dataverse lookup and choice pattern](/patterns/patch-dataverse-lookup-and-choice-columns) have complete examples.")
    ),
    section(
      "errors",
      "Catching a failed save",
      p("Patch returns an error when the save fails: the user lacks permission, a required column is empty, another user changed the record first, or the network dropped. Catch it with `IfError` so the user sees a clear message and the screen does not move on."),
      code(`IfError(
    Patch(Requests, galRequests.Selected, { Status: { Value: "Closed" } }),
    Notify("Could not save: " & FirstError.Message, NotificationType.Error),
    Notify("Saved", NotificationType.Success); Back()
)`),
      p("The last argument runs only when there was no error. The [error handling guide](/guides/power-fx-iferror-and-app-onerror) covers `App.OnError` and logging.")
    ),
    section(
      "many",
      "Saving many records",
      p("`ForAll` with a `Patch` inside saves one record per call. The table form of `Patch` sends the whole set in one call and is usually faster."),
      code(`// One call for all ticked rows
With(
    { ticked: Filter(galTasks.AllItems, chkDone.Value) },
    Patch(Tasks, ticked, ForAll(ticked, { Done: true }))
)`),
      p("The second argument is the table of records to change and the third a table of changes, one for each record and in the same order. See the [bulk update pattern](/patterns/power-apps-bulk-update-selected-gallery-items) and the [ForAll page](/functions/forall).")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Patching a record that did not come from the data source.** A record built by hand, without its ID, creates a new item or fails. Base it on `LookUp` or `Gallery.Selected`.",
        "**Passing text to a Choice or Person column.** See the table above, and [Patch has some invalid arguments](/errors/function-patch-has-some-invalid-arguments).",
        "**Ignoring the result.** Without `IfError`, the screen navigates away even when the save failed.",
        "**Patching a column the user cannot see in a form.** Hidden required columns still have to have a value. See [Field 'Title' is required](/errors/field-title-is-required-power-apps)."
      )
    )
  ],
  faqs: [
    { question: "How do I create a new record with Patch?", answer: "Pass Defaults(DataSource) as the base record, as in Patch(Requests, Defaults(Requests), { Title: \"New request\" }). Defaults gives a new record with the data source's default values." },
    { question: "How do I get the ID of a record created with Patch?", answer: "Patch returns the saved record. Store it, Set(varNew, Patch(Requests, Defaults(Requests), {...})), then read varNew.ID." },
    { question: "What is the difference between Patch and SubmitForm?", answer: "SubmitForm saves the values of an Edit form control, checks its validation and runs OnSuccess or OnFailure. Patch saves any values you give it, from any controls or none, and leaves validation and error handling to you." }
  ],
  relatedFunctions: ["submitform", "collect", "remove", "iferror", "forall"],
  relatedGuides: ["power-apps-patch-vs-submitform-vs-collect", "power-fx-iferror-and-app-onerror"],
  relatedErrors: ["function-patch-has-some-invalid-arguments", "network-error-patch-requested-operation-is-invalid", "patch-conflicts-exist-with-changes-on-the-server", "field-title-is-required-power-apps"],
  relatedPatterns: ["patch-sharepoint-choice-field", "patch-dataverse-lookup-and-choice-columns", "power-apps-error-handling-iferror-patch", "power-apps-bulk-update-selected-gallery-items"],
  relatedTools: ["power-fx-formatter"],
  sources: [fxRef("function-patch", "Patch function"), fxRef("function-defaults", "Defaults function"), errorHandlingDoc]
};

export const collectFunction: FunctionPage = {
  slug: "collect",
  name: "Collect, Clear and ClearCollect",
  category,
  title: "Collect and ClearCollect in Power Apps: build and refresh collections",
  description: "How the Power Fx Collect, Clear and ClearCollect functions create collections, add records to them or to a data source, refresh a cached copy, and why a collection holds only part of a large list.",
  keywords: ["Power Apps Collect function", "ClearCollect Power Apps", "Power Apps collection", "Collect vs Patch", "ClearCollect 500 limit"],
  published,
  updated: published,
  quickAnswer: "Collect(Collection, Items) adds records to a collection, creating it if needed. ClearCollect(Collection, Items) empties it first, which is how you load or refresh a cached copy of data. Clear(Collection) empties it. Collect can also add a record to a real data source. A collection is held in the app, so loading a large list into one brings only the first 500 rows by default.",
  syntax: `Collect( DataSource, Item [, ... ] )
Clear( Collection )
ClearCollect( Collection, Item [, ... ] )`,
  arguments: [
    ["`DataSource` / `Collection`", "Required", "The collection to add to or clear. If it does not exist, Collect and ClearCollect create it. Collect also accepts a data source."],
    ["`Item`, ...", "Required", "Records or tables to add. Each record of a table is added as a separate record. A single value goes into a column named `Value`."]
  ],
  returns: "`Collect` and `ClearCollect` return the changed collection as a table. `Clear` returns nothing.",
  usableIn: "Behaviour formulas only",
  delegation: "Not delegable. `ClearCollect(col, BigList)` collects at most the data row limit, 500 records by default.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A shopping basket
Collect(colBasket, { Product: ThisItem.Title, Qty: 1, Price: ThisItem.Price })

// Load reference data when the app starts
ClearCollect(colStatuses, Statuses)

// Refresh a filtered copy
ClearCollect(colMyRequests, Filter(Requests, 'Created By'.Email = User().Email))

// Empty the basket
Clear(colBasket)`),
      p("Collections do not need declaring. The first `Collect` or `ClearCollect` creates one, and its columns come from the records you add. A later record with an extra column adds that column.")
    ),
    section(
      "when",
      "When a collection helps, and when it does not",
      table(
        ["Use a collection for", "Avoid it for"],
        ["Data the user builds up, like a basket or a list of lines before saving", "A working copy of a large list. It only holds the first rows."],
        ["Small reference lists read on many screens", "Data other people change while the app is open. The copy goes stale."],
        ["Results of a slow call you do not want to repeat", "A single value. A variable or a [named formula](/guides/power-fx-named-formulas-explained) is simpler."]
      ),
      p("Microsoft's own advice is to check whether a formula would do before reaching for a collection, because a collection does not recalculate when its source changes.")
    ),
    section(
      "data-source",
      "Collect into a data source",
      p("`Collect(Requests, { Title: \"New\" })` adds a record to a SharePoint list or Dataverse table, much like `Patch` with `Defaults`. Patch is the more common choice for data sources because it reads as create-or-update and returns the saved record in the same way."),
      note("`Clear` and `ClearCollect` work only on collections. To delete everything from a data source you would use `RemoveIf(DataSource, true)`, which removes every record for every user. Be very sure before you do.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Loading a large list into a collection** and filtering the collection. Only the first 500 rows are there. Filter the data source with a delegable condition instead.",
        "**ClearCollect inside ForAll.** It is not allowed, because ForAll may run records in any order. Use Collect, or build the table with ForAll and ClearCollect the result.",
        "**Collecting a table into a column.** Collect adds each record of a table separately. To store a table inside one record, wrap it: `{ Lines: colLines }`.",
        "**Using a collection where a variable would do.** `Set` is simpler for one value or one record."
      )
    )
  ],
  faqs: [
    { question: "What is the difference between Collect and ClearCollect?", answer: "Collect adds records to whatever is already in the collection. ClearCollect removes everything first, then adds the records, so the collection holds only the new set." },
    { question: "Why does my collection only have 500 records?", answer: "Collecting from a data source is not delegated, so Power Apps fetches up to the data row limit, 500 by default. You can raise the limit in the app settings, or load the data in pages, but filtering the data source directly is usually the better design." },
    { question: "Where do I see what is in a collection?", answer: "In Power Apps Studio, open Variables in the left pane and look under Collections. You can see each collection's contents there." }
  ],
  relatedFunctions: ["patch", "remove", "set", "forall"],
  relatedGuides: ["power-apps-patch-vs-submitform-vs-collect", "power-fx-set-vs-updatecontext-vs-with", "power-apps-faster-app-start-concurrent-onstart"],
  relatedErrors: [],
  relatedPatterns: ["patch-collection-checklist-items", "power-apps-concurrent-load-data-faster", "calculate-totals-gallery-collection"],
  relatedTools: ["power-fx-formatter"],
  sources: [fxRef("function-clear-collect-clearcollect", "Collect, Clear and ClearCollect functions"), canvasDoc("delegation-overview", "Understand delegation in a canvas app")]
};

export const removeFunction: FunctionPage = {
  slug: "remove",
  name: "Remove and RemoveIf",
  category,
  title: "Remove and RemoveIf in Power Apps: delete records",
  description: "How the Power Fx Remove and RemoveIf functions delete one record, a set of records or every record that meets a condition, how they behave on SharePoint, and how to confirm before deleting.",
  keywords: ["Power Apps Remove function", "RemoveIf Power Apps", "delete record Power Apps", "remove item from collection", "RemoveIf SharePoint delegation"],
  published,
  updated: published,
  quickAnswer: "Remove(DataSource, Record) deletes a record, usually Gallery.Selected or ThisItem. RemoveIf(DataSource, Condition) deletes every record for which the condition is true. Both work on collections and data sources. On SharePoint, RemoveIf is not delegated: it fetches matching records in batches up to the data row limit and deletes them one at a time.",
  syntax: `Remove( DataSource, Record1 [, Record2, ... ] [, RemoveFlags.All ] )
Remove( DataSource, Table [, RemoveFlags.All ] )
RemoveIf( DataSource, Condition [, ... ] )`,
  arguments: [
    ["`DataSource`", "Required", "The list, table or collection to delete from."],
    ["`Record1`, ... or `Table`", "Required (Remove)", "The record or records to delete."],
    ["`RemoveFlags.All`", "Optional", "In a collection the same record can appear more than once. With this flag every copy is removed, not just one."],
    ["`Condition`, ...", "Required (RemoveIf)", "Formulas that must all be true for a record to be removed. They can use the record's columns."]
  ],
  returns: "The changed data source as a table.",
  usableIn: "Behaviour formulas only",
  delegation: "Remove is not a query. RemoveIf is delegated only by a few data sources. For SharePoint and Dataverse it works locally on batches of up to the data row limit.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A trash icon in a gallery row
Remove(Requests, ThisItem)

// The selected record, from a button outside the gallery
Remove(Requests, galRequests.Selected)

// Every ticked row
Remove(Requests, Filter(galRequests.AllItems, chkPick.Value))

// A line from a basket collection
RemoveIf(colBasket, Product = ThisItem.Product)`)
    ),
    section(
      "confirm",
      "Confirm before deleting",
      p("A delete is hard to undo, and users click trash icons by mistake. Ask first. The usual approach is a confirmation panel shown with a variable."),
      code(`// Trash icon OnSelect
Set(varToDelete, ThisItem); Set(varConfirm, true)

// "Delete" button on the confirmation panel
IfError(
    Remove(Requests, varToDelete),
    Notify("Could not delete: " & FirstError.Message, NotificationType.Error),
    Notify("Deleted", NotificationType.Success)
);
Set(varConfirm, false)`),
      p("The panel's `Visible` property is `varConfirm`.")
    ),
    section(
      "sharepoint",
      "RemoveIf on a large SharePoint list",
      p("Microsoft's SharePoint connector page says RemoveIf and UpdateIf work locally but simulate delegation up to the data row limit: they retrieve records that meet the condition in batches, and delete them one call at a time. A RemoveIf that matches thousands of items makes thousands of calls and can take a long time or hit throttling."),
      p("For bulk deletes in SharePoint, a flow that uses batch requests is usually faster. See the [SharePoint batch pattern](/patterns/sharepoint-batch-create-update-items-power-automate).")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Removing a record built by hand.** For a data source, the record must come from it, with its ID. For a collection, every column must match.",
        "**`RemoveIf(DataSource, true)` to clear a list.** It deletes every record for everyone. `Clear` is only for collections.",
        "**No confirmation and no error handling.** A failed delete looks like a successful one unless you check."
      )
    )
  ],
  faqs: [
    { question: "How do I delete an item from a gallery in Power Apps?", answer: "Put a trash icon in the gallery template and set its OnSelect to Remove(DataSource, ThisItem). Add a confirmation step and wrap it in IfError so failures are reported." },
    { question: "How do I remove one item from a collection?", answer: "Remove(colBasket, ThisItem) from inside a gallery over the collection, or RemoveIf(colBasket, Product = \"Pen\") by a condition. Add RemoveFlags.All to Remove if the same record appears more than once and you want every copy gone." },
    { question: "Is RemoveIf delegable to SharePoint?", answer: "Not in the usual sense. It processes matching records locally in batches of up to the data row limit and deletes them one by one, so large deletes are slow." }
  ],
  relatedFunctions: ["patch", "collect", "iferror", "notify"],
  relatedGuides: ["power-fx-iferror-and-app-onerror"],
  relatedErrors: [],
  relatedPatterns: ["updateif-removeif-bulk-changes-power-apps", "sharepoint-batch-create-update-items-power-automate"],
  relatedTools: ["power-fx-formatter"],
  sources: [fxRef("function-remove-removeif", "Remove and RemoveIf functions"), sharePointDoc]
};

export const submitFormFunction: FunctionPage = {
  slug: "submitform",
  name: "SubmitForm, ResetForm, NewForm and EditForm",
  category,
  title: "SubmitForm in Power Apps: save a form, reset it and switch modes",
  description: "How the Power Fx SubmitForm, ResetForm, NewForm, EditForm and ViewForm functions save an Edit form, check validation, run OnSuccess and OnFailure, and switch between new, edit and view.",
  keywords: ["Power Apps SubmitForm", "ResetForm Power Apps", "NewForm EditForm ViewForm", "SubmitForm OnSuccess", "form LastSubmit ID"],
  published,
  updated: published,
  quickAnswer: "SubmitForm(Form) checks the form's required fields and validation, then saves it to the data source. On success the form's OnSuccess runs and Form.LastSubmit holds the saved record. On failure OnFailure runs and Form.Error holds the message. NewForm, EditForm and ViewForm switch the form's mode, and ResetForm puts the fields back to their starting values.",
  syntax: `SubmitForm( FormName )
ResetForm( FormName )
NewForm( FormName )
EditForm( FormName )
ViewForm( FormName )`,
  arguments: [
    ["`FormName`", "Required", "The Edit form control to act on."]
  ],
  returns: "Nothing. The results appear on the form: `OnSuccess` or `OnFailure` runs, and `LastSubmit`, `Error` and `ErrorKind` are set.",
  usableIn: "Behaviour formulas only",
  delegation: "Not relevant: these functions act on a form control.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Save button
SubmitForm(frmRequest)

// Form OnSuccess: tell the user and go back
Notify("Saved request " & frmRequest.LastSubmit.ID, NotificationType.Success);
Back()

// Form OnFailure
Notify("Could not save: " & frmRequest.Error, NotificationType.Error)

// New button on a list screen
NewForm(frmRequest); Navigate(scrEdit)

// Cancel button
ResetForm(frmRequest); Back()`),
      p("Put the follow-on steps in `OnSuccess`, not after `SubmitForm` in the button. The button carries on to the next step at once, before the save has finished or failed.")
    ),
    section(
      "modes",
      "The three modes",
      table(
        ["Mode", "Set with", "What the form shows", "SubmitForm"],
        ["`FormMode.Edit`", "`EditForm`", "The record in the form's Item property, editable", "Updates that record"],
        ["`FormMode.New`", "`NewForm`", "Default values, editable. Item is ignored.", "Creates a record, then the form switches to Edit"],
        ["`FormMode.View`", "`ViewForm`", "The record in Item, read only", "Does nothing"]
      ),
      p("Edit is the default. Read the current mode with `frmRequest.Mode`, for example to change a heading: `If(frmRequest.Mode = FormMode.New, \"New request\", \"Edit request\")`. The [form modes pattern](/patterns/power-apps-form-mode-new-edit-view) uses one screen for all three.")
    ),
    section(
      "validation",
      "Validation",
      p("Before saving, `SubmitForm` checks every field that is required or has a constraint, and the form's `Valid` property, which combines the `Valid` property of each card. If anything fails, nothing is saved and `OnFailure` runs. Show the problem next to the field with the card's error label, and use `frmRequest.Valid` to disable the Save button until the form is complete.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Navigating straight after SubmitForm in the button.** Move it to OnSuccess.",
        "**Reading LastSubmit before the save finishes.** Read it in OnSuccess.",
        "**Removing a required field's card from the form.** The data source still requires it. See [Field 'Title' is required](/errors/field-title-is-required-power-apps).",
        "**Expecting SubmitForm to save controls outside the form.** It saves the form's cards only. Use Patch for values from other controls, or add a card."
      )
    )
  ],
  faqs: [
    { question: "How do I get the ID of a record saved with SubmitForm?", answer: "In the form's OnSuccess property, read Form.LastSubmit.ID. LastSubmit holds the record as saved, including columns the data source filled in." },
    { question: "What does ResetForm do?", answer: "It puts every field back to its starting value and runs the form's OnReset. If the form was in New mode, it switches back to Edit mode." },
    { question: "Should I use SubmitForm or Patch?", answer: "Use SubmitForm with an Edit form when the fields map to one record and you want built-in validation. Use Patch when you save values from controls outside a form, several records at once, or need full control." }
  ],
  relatedFunctions: ["patch", "notify", "navigate"],
  relatedGuides: ["power-apps-patch-vs-submitform-vs-collect"],
  relatedErrors: ["field-title-is-required-power-apps", "entry-is-required-or-has-an-invalid-value", "specified-column-is-read-only-power-apps"],
  relatedPatterns: ["power-apps-form-mode-new-edit-view", "submit-multiple-power-apps-forms"],
  relatedTools: ["power-fx-formatter"],
  sources: [fxRef("function-form", "EditForm, NewForm, SubmitForm, ResetForm and ViewForm functions"), canvasDoc("working-with-forms", "Understand canvas app forms")]
};

export const saveFunctions: FunctionPage[] = [patchFunction, collectFunction, removeFunction, submitFormFunction];
