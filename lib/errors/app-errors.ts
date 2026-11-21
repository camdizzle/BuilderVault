import { canvasDoc, code, learnDoc, note, ol, p, powerFxDoc, table, tool, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Power Apps" as const, published: "2026-11-20", updated: "2026-11-20" };

const patchDoc = powerFxDoc("reference/function-patch", "Patch function");
const errorsDoc = powerFxDoc("reference/function-errors", "Errors function");
const errorHandlingDoc = powerFxDoc("error-handling", "Error handling in Power Fx");
const sharePointDoc = canvasDoc("connections/connection-sharepoint-online", "Connect to SharePoint from a canvas app");
const formsDoc = canvasDoc("working-with-forms", "Understand data forms in canvas apps");
const monitorDoc = learnDoc("power-apps/maker/monitor-canvasapps", "Debug canvas apps with Monitor");
const patchCheatSheet = { href: "/cheat-sheets/patch-sharepoint-columns-cheat-sheet", label: "Patch SharePoint Columns Cheat Sheet" };
const formulaErrorsGuide = { href: "/guides/fix-common-power-fx-formula-errors", label: "Fix common Power Fx formula errors" };

const patchOperationInvalid: ErrorPage = {
  ...base,
  slug: "network-error-patch-requested-operation-is-invalid",
  message: "Network error when using Patch function: The requested operation is invalid.",
  title: "Fix \"Network error when using Patch function: The requested operation is invalid\"",
  shortTitle: "Patch: The requested operation is invalid",
  description: "Why a Patch that passes every check in Studio is refused by SharePoint or Dataverse when the app runs, how to see the real reason, and the fix for each cause.",
  keywords: ["Network error when using Patch function", "The requested operation is invalid", "Power Apps Patch error", "Patch SharePoint error", "Patch not working Power Apps"],
  quickAnswer: "The formula is valid, but the data source refused the save. It is rarely a network problem. The usual causes are a value the column will not accept, a read-only column in the record, a required column left out, or a record to update that does not exist. Open Monitor from Advanced tools, run the Patch again and read the response from the data source, which states the real reason.",
  variants: [
    "Network error when using Patch function: The requested operation is invalid. Server Response: ...",
    "The requested operation is invalid.",
    "An error occurred on the server."
  ],
  meaning: [
    p("Studio checks that a `Patch` formula has the right shape. It cannot check what the data source will accept. When the app runs, Power Apps sends the record, the data source rejects it, and the app shows this general message in a red banner."),
    p("The words network error are misleading. The request arrived and was answered. The answer was no.")
  ],
  causes: [
    ol(
      "**A value the column rejects.** Text longer than the column allows, a number outside the column's range, a choice that is not in the list, or a lookup ID that does not exist in the other list.",
      "**A read-only column in the record**, such as ID, Created, Modified or a calculated column. This happens when a whole record from a gallery or collection is patched back.",
      "**A required column is missing**, or the list has a validation rule that the record fails.",
      "**The record to update is not there.** The second argument is blank, comes from a different data source, or refers to an item that was deleted.",
      "**The user cannot edit the item.** They have read access only, or the item has its own permissions.",
      "**A column that must be unique** already has that value in another item."
    )
  ],
  fixes: [
    p("**See the real message first.**"),
    ol(
      "In Studio, open **Advanced tools** and select **Open monitor**.",
      "Play the app from Studio and run the Patch.",
      "In Monitor, select the row marked as an error and open its **Response**. The data source's own message is there, and it usually names the column."
    ),
    p("**Show the message in the app.** Wrap the Patch so the user, and you, see the specific text."),
    code(`IfError(
    Patch(Requests, Defaults(Requests), {Title: txtTitle.Text, Amount: Value(txtAmount.Text)}),
    Notify(FirstError.Message, NotificationType.Error),
    Notify("Saved", NotificationType.Success)
)`),
    p("**Then fix the cause.**"),
    table(
      ["Cause", "Fix"],
      ["Rejected value", "Check the column's limits. Trim long text with `Left`, and set choices and lookups with the record shape the column needs."],
      ["Read-only column", "Patch only the columns you are changing. Do not pass a whole gallery record as the change."],
      ["Missing required column", "Add it to the record, or make the column optional in the list."],
      ["Record not found", "Use `LookUp(Requests, ID = varRequestId)` as the second argument, and check it is not blank before patching."],
      ["No permission", "Give the user edit access to the list. Sharing the app does not do this."],
      ["Unique value", "Check for an existing item with `LookUp` before saving and tell the user."]
    ),
    p("The [Patch cheat sheet](/cheat-sheets/patch-sharepoint-columns-cheat-sheet) has the record shape for choice, person, lookup and date columns.")
  ],
  prevention: [
    ul(
      "Validate in the app before saving: required inputs filled, numbers in range, text within length.",
      "Always wrap a save in `IfError` and show `FirstError.Message`.",
      "Patch named columns. Avoid patching whole records that came from the data source.",
      "Test with an account that has the same permissions as a real user, not as the list owner."
    ),
    p("The [IfError pattern](/patterns/power-apps-error-handling-iferror-patch) has a complete save formula.")
  ],
  faqs: [
    { question: "Is Network error when using Patch function really a network problem?", answer: "Almost never. The request reached the data source and was refused. The cause is in the data being saved or in the user's permissions." },
    { question: "How do I see why a Patch failed in Power Apps?", answer: "Open Monitor from Advanced tools in Studio, run the Patch and read the response on the failed row. In the app itself, wrap the Patch in IfError and show FirstError.Message." },
    { question: "Why does the Patch work for me and fail for other users?", answer: "You probably own the list, so you can edit every item. Other users may have read access only, or the item may have its own permissions. Check their access to the list, not to the app." }
  ],
  relatedTools: ["patch-formula-builder", "power-fx-formatter"],
  relatedPatterns: ["power-apps-error-handling-iferror-patch", "patch-sharepoint-choice-field", "power-apps-monitor-debug-performance-trace"],
  relatedLinks: [patchCheatSheet, formulaErrorsGuide],
  relatedErrors: ["function-patch-has-some-invalid-arguments", "specified-column-is-read-only-power-apps", "field-title-is-required-power-apps", "patch-conflicts-exist-with-changes-on-the-server"],
  sources: [patchDoc, errorsDoc, errorHandlingDoc, monitorDoc]
};

const patchConflict: ErrorPage = {
  ...base,
  slug: "patch-conflicts-exist-with-changes-on-the-server",
  message: "Network error when using Patch function: Conflicts exist with changes on the server, please reload.",
  title: "Fix \"Conflicts exist with changes on the server, please reload\" in Power Apps",
  shortTitle: "Patch: Conflicts exist with changes on the server",
  description: "Why Power Apps refuses to save a record that changed after the app loaded it, and how to fix it with Refresh, a fresh LookUp or Revert.",
  keywords: ["Conflicts exist with changes on the server, please reload", "Power Apps Patch conflict", "Network error when using Patch function conflicts", "Power Apps Refresh before Patch", "Revert function Power Apps"],
  quickAnswer: "The record was changed by someone else, or by a flow, after your app loaded its copy. Power Apps will not overwrite the newer version. Refresh the data source, then patch a record you look up at that moment: Refresh(Requests); Patch(Requests, LookUp(Requests, ID = varRequestId), {Status: {Value: \"Approved\"}}). The most common culprit is a flow that updates the item straight after the app creates it.",
  variants: [
    "Conflicts exist with changes on the server, please reload.",
    "The record you are trying to edit has been modified by another user. Please revert the record and retry."
  ],
  meaning: [
    p("Power Apps keeps a copy of each record it loads, with a version marker. When you patch, it sends the marker along. If the data source holds a newer version, the save is refused so that the other change is not lost."),
    p("The protection is working as intended. The fix is to save against the current version.")
  ],
  causes: [
    ol(
      "**A flow updated the item.** A flow triggered when the item was created writes a reference number or status back, and the app still holds the version from before.",
      "**Another person edited the item** while this user had it open.",
      "**The app patched the same record twice** from an old copy, for example from a variable set when the screen opened.",
      "**A collection holds old records.** The app loaded items into a collection, time passed, and it now patches from those copies."
    )
  ],
  fixes: [
    p("**Refresh, then patch a fresh record.**"),
    code(`Refresh(Requests);
Patch(
    Requests,
    LookUp(Requests, ID = varRequestId),
    {Status: {Value: "Approved"}}
)`),
    p("`Refresh` reloads the data source and `LookUp` fetches the current record, so the save carries the current version marker. Store the item's ID in a variable, not the whole record, so there is no old copy to patch from."),
    p("**After the app creates an item, keep what Patch returns.** `Patch` returns the saved record. If a flow then changes the item, refresh before the next save."),
    code(`Set(varRequestId, Patch(Requests, Defaults(Requests), {Title: txtTitle.Text}).ID)`),
    p("**Clear the conflict on a record with Revert.** `Revert` reloads one record and discards the conflict state."),
    code(`Revert(Requests, LookUp(Requests, ID = varRequestId))`),
    p("**Let the user decide when it matters.** When two people really did edit the same item, overwriting silently is the wrong fix. Catch the error, reload the record and ask the user to check the latest values before saving again."),
    code(`IfError(
    Patch(Requests, LookUp(Requests, ID = varRequestId), {Notes: txtNotes.Text}),
    Refresh(Requests);
    Notify("This request was changed by someone else. Check the latest details and save again.", NotificationType.Warning)
)`)
  ],
  prevention: [
    ul(
      "Have flows write to columns the app does not edit, and keep the app from saving again in the seconds after it creates an item.",
      "Patch only the columns that changed.",
      "Hold IDs in variables and look the record up when you need it.",
      "On screens that stay open a long time, refresh the record when the screen becomes visible."
    ),
    p("The flow side of the same problem is covered under [412 and save conflicts](/errors/412-precondition-failed-etag-mismatch).")
  ],
  faqs: [
    { question: "Why do I get a conflict error when I am the only user?", answer: "A flow is probably updating the item. A flow that runs when an item is created or modified changes the item's version, and the app's copy is then out of date. Refresh the data source before the next save." },
    { question: "Does Refresh slow the app down?", answer: "Refresh reloads the data source, which takes a moment on a large list. Use it before a save that follows a known change, such as a flow run, not before every save." },
    { question: "What does the Revert function do?", answer: "Revert(DataSource, Record) reloads that record from the data source and clears any conflict or error state held for it in the app." }
  ],
  relatedTools: ["power-fx-formatter"],
  relatedPatterns: ["power-apps-error-handling-iferror-patch", "power-automate-avoid-infinite-update-loop", "respond-to-power-app-return-values-from-flow"],
  relatedLinks: [patchCheatSheet],
  relatedErrors: ["network-error-patch-requested-operation-is-invalid", "412-precondition-failed-etag-mismatch"],
  sources: [patchDoc, powerFxDoc("reference/function-revert", "Revert function"), powerFxDoc("reference/function-refresh", "Refresh function"), canvasDoc("working-with-data-sources", "Understand data sources for canvas apps")]
};

const patchInvalidArguments: ErrorPage = {
  ...base,
  slug: "function-patch-has-some-invalid-arguments",
  message: "The function 'Patch' has some invalid arguments.",
  title: "Fix \"The function 'Patch' has some invalid arguments\" in Power Apps",
  shortTitle: "The function 'Patch' has some invalid arguments",
  description: "How to find the argument Power Apps objects to in a Patch formula, and the corrected form for choice, lookup, person, number and date columns.",
  keywords: ["The function 'Patch' has some invalid arguments", "Patch invalid arguments", "does not match the expected type Record", "Power Apps Patch choice column", "Patch formula error"],
  quickAnswer: "This is a summary message. Hover over the smaller red underline inside the Patch brackets to read the specific error, which names a column and the type it expected. Most cases are a choice, lookup or person column given plain text when it needs a record, a text input used where a number is needed, or a column name that does not match the data source.",
  variants: [
    "The type of this argument 'Status' does not match the expected type 'Record'. Found type 'Text'.",
    "The specified column 'Due Date' does not exist. The column with the most similar name is 'DueDate'.",
    "Invalid argument type. Expecting a Record value, but of a different schema."
  ],
  meaning: [
    p("Studio checks a `Patch` formula against the data source as you type. This message means at least one of the three arguments does not fit: the data source, the record to change, or the record of new values."),
    p("The message on the word `Patch` never says which. A second underline inside the brackets does.")
  ],
  causes: [
    table(
      ["Inner message", "Cause"],
      ["does not match the expected type 'Record'. Found type 'Text'", "A choice, lookup or person column given text"],
      ["does not match the expected type 'Number'. Found type 'Text'", "A text input used for a number column"],
      ["does not match the expected type 'DateTime'. Found type 'Text'", "Text used for a date column"],
      ["The specified column does not exist", "A column name that is misspelled, or that has spaces and no quotes"],
      ["Expecting a Record value, but of a different schema", "The second argument is a table, or a record from another data source"],
      ["does not match the expected type 'Table'", "A column that allows several choices given one record"]
    )
  ],
  fixes: [
    p("**Give each column the shape it needs.**"),
    code(`Patch(
    Requests,
    Defaults(Requests),
    {
        Title: txtTitle.Text,
        Amount: Value(txtAmount.Text),
        DueDate: dpDue.SelectedDate,
        Status: {Value: "Submitted"},
        Category: drpCategory.Selected,
        'Cost Centre': {Id: cmbCostCentre.Selected.ID, Value: cmbCostCentre.Selected.Title}
    }
)`),
    ul(
      "**Choice:** a record with a `Value` field, or the `Selected` record of a dropdown bound to the column's choices.",
      "**Lookup:** a record with `Id` and `Value`.",
      "**Number:** wrap text inputs in `Value()`.",
      "**Date:** use a date picker's `SelectedDate`, or convert text with `DateValue()`.",
      "**A name with a space:** wrap it in single quotes, as in `'Cost Centre'`."
    ),
    p("**Check the second argument.** It must be one record from the same data source: `Defaults(Requests)` for a new item, or `LookUp(Requests, ID = varRequestId)` for an existing one. `Filter` returns a table, even when one row matches, and causes the schema message."),
    p("**Find the column by elimination.** If you cannot see the inner underline, remove columns from the record one at a time until the error clears. The last one removed is the one to fix."),
    tool("power-fx-formatter", "Format the formula so each column sits on its own line. The underline is then on a single line and easy to find."),
    p("The [Patch cheat sheet](/cheat-sheets/patch-sharepoint-columns-cheat-sheet) has the shape for every SharePoint column type, including person and multi-select columns.")
  ],
  prevention: [
    ul(
      "Write one column per line and add columns one at a time, checking for an underline after each.",
      "Bind dropdowns and combo boxes to `Choices(Requests.Status)` so their `Selected` value already has the right shape.",
      "Refresh the data source in Studio after someone changes the list, so Studio knows the current columns."
    )
  ],
  faqs: [
    { question: "How do I find which Patch argument is invalid?", answer: "Hover over the narrower red underline inside the brackets, not the one on the word Patch. It names the column and the type it expected. If you cannot find it, remove columns one at a time until the error clears." },
    { question: "How do I Patch a choice column in Power Apps?", answer: "Give it a record with a Value field, such as Status: {Value: \"Submitted\"}, or the Selected record of a dropdown whose Items are Choices(Requests.Status)." },
    { question: "Why does Patch say the column does not exist?", answer: "The name in the formula does not match a column Studio knows. Check the spelling, wrap names with spaces in single quotes, and refresh the data source if the column was added recently." }
  ],
  relatedTools: ["patch-formula-builder", "power-fx-formatter", "power-apps-naming-linter"],
  relatedPatterns: ["patch-sharepoint-choice-field", "power-apps-error-handling-iferror-patch"],
  relatedLinks: [patchCheatSheet, formulaErrorsGuide, { href: "/cookbooks/power-apps-patch-cookbook", label: "Power Apps Patch Cookbook" }],
  relatedErrors: ["network-error-patch-requested-operation-is-invalid", "incompatible-types-for-comparison-power-apps", "specified-column-is-read-only-power-apps"],
  sources: [patchDoc, sharePointDoc, powerFxDoc("data-types", "Data types in Power Fx")]
};

const titleRequired: ErrorPage = {
  ...base,
  slug: "field-title-is-required-power-apps",
  message: "Title: Field 'Title' is required.",
  title: "Fix \"Field 'Title' is required\" when saving to SharePoint from Power Apps",
  shortTitle: "Field 'Title' is required",
  description: "Why SharePoint asks for a Title your app does not show, and the two fixes: set Title in the save, or make the column optional in the list.",
  keywords: ["Field 'Title' is required", "Title field is required Power Apps", "Patch Title required", "SharePoint Title column required", "hide Title field Power Apps form"],
  quickAnswer: "Every SharePoint list has a Title column, and it is required by default. Your app is saving an item without one. Either include Title in the save, for example Title: txtName.Text or a generated value, or open the list settings, select the Title column and set Require that this column contains information to No.",
  variants: [
    "Field 'Title' is required.",
    "Title: An entry is required or has an invalid value. Please correct and try again.",
    "Network error when using Patch function: Field 'Title' is required."
  ],
  meaning: [
    p("SharePoint refused the new item because a required column was empty. The message names the column, here Title. The same message with a different column name means the same thing for that column."),
    p("Title catches people out because many lists do not use it. It was renamed, hidden from the views, or simply ignored, and it is still there and still required.")
  ],
  causes: [
    ol(
      "A `Patch` record that does not include Title.",
      "A form with the Title card removed or hidden, so nothing is submitted for it.",
      "The Title column was renamed, for example to Request name, and the app does not fill the renamed column either.",
      "A different required column is empty. Read the column name in the message."
    )
  ],
  fixes: [
    p("**Option 1: set Title in the save.** If the list has no natural title, generate one."),
    code(`Patch(
    Requests,
    Defaults(Requests),
    {
        Title: "REQ-" & Text(Now(), "yyyymmdd-hhmmss"),
        Amount: Value(txtAmount.Text)
    }
)`),
    p("In a form, keep the Title card but hide it, and set its `Default` so a value is always submitted."),
    code(`// Title card, Visible property
false

// Title card, Default property
If(frmRequest.Mode = FormMode.New, "REQ-" & Text(Now(), "yyyymmdd-hhmmss"), ThisItem.Title)`),
    p("**Option 2: make Title optional in SharePoint.**"),
    ol(
      "Open the list, select the gear icon, then **List settings**.",
      "Under **Columns**, select **Title**.",
      "Set **Require that this column contains information** to **No** and save.",
      "In Power Apps Studio, refresh the data source so the app picks up the change."
    ),
    note("If the Title column was renamed in SharePoint, Power Apps may list it under its new display name. Use the name Studio suggests as you type.")
  ],
  prevention: [
    ul(
      "Decide what Title is for when the list is designed. A reference number or a short summary are both good uses.",
      "If Title will not be used, make it optional before building the app.",
      "After changing which columns are required, refresh the data source in every app that uses the list."
    ),
    p("The [list design standards](/standards/sharepoint-list-design-standards) include a note on the Title column.")
  ],
  faqs: [
    { question: "Can I delete the Title column from a SharePoint list?", answer: "No. Title is a built-in column and cannot be deleted. You can rename it, hide it from views and make it optional." },
    { question: "How do I hide the Title field in a Power Apps form?", answer: "Set the Title data card's Visible property to false. If the column is still required in SharePoint, also set the card's Default so that a value is submitted, or make the column optional in the list." },
    { question: "I made Title optional but still get the error. Why?", answer: "The app is using the column settings it loaded earlier. Refresh the data source in Studio, then save and publish the app." }
  ],
  relatedTools: ["patch-formula-builder"],
  relatedPatterns: ["power-apps-error-handling-iferror-patch"],
  relatedLinks: [patchCheatSheet, { href: "/standards/sharepoint-list-design-standards", label: "SharePoint List Design Standards" }],
  relatedErrors: ["entry-is-required-or-has-an-invalid-value", "network-error-patch-requested-operation-is-invalid"],
  sources: [sharePointDoc, patchDoc, formsDoc]
};

const entryRequired: ErrorPage = {
  ...base,
  slug: "entry-is-required-or-has-an-invalid-value",
  message: "An entry is required or has an invalid value. Please correct and try again.",
  title: "Fix \"An entry is required or has an invalid value. Please correct and try again\" in a Power Apps form",
  shortTitle: "An entry is required or has an invalid value",
  description: "How to find which field a Power Apps form is rejecting when SubmitForm fails, including hidden cards, customized cards and required columns the form does not show.",
  keywords: ["An entry is required or has an invalid value", "SubmitForm not working", "Power Apps form validation error", "form Valid property", "data card Required"],
  quickAnswer: "SubmitForm checked the form and at least one card failed. The card is often one you cannot see: hidden, on another screen or scrolled out of view. Add a temporary label showing each card's Valid property, or make every card visible, to find it. Then fill the field, fix the card's Update property, or change its Required setting.",
  variants: [
    "An entry is required or has an invalid value.",
    "Title: An entry is required or has an invalid value. Please correct and try again."
  ],
  meaning: [
    p("`SubmitForm` validates before it saves. Each data card has a `Valid` property, and the form has one too. If any card is not valid, nothing is sent to the data source and the form shows this message."),
    p("Sometimes the message starts with a column name. When it does not, you have to find the card yourself.")
  ],
  causes: [
    ol(
      "**A required field is empty.** A star beside the field name marks it, if the card is visible.",
      "**A required card is hidden**, or sits on a part of the form the user did not scroll to.",
      "**A required column has no card at all.** The column is required in the list and was left out of the form.",
      "**A customized card returns the wrong thing.** The control in the card was replaced, for example a text input swapped for a dropdown, and the card's `Update` property still points at the old control or returns the wrong type.",
      "**The value has the wrong type or breaks a column rule**: text in a number field, a number outside the allowed range, or text that is too long.",
      "**The card's `Required` property was set to true by hand** for a column that is optional, and the field is empty."
    )
  ],
  fixes: [
    p("**Find the failing card.** Add a label near the Submit button, temporarily, with a formula that names the invalid cards."),
    code(`Concatenate(
    If(!Title_DataCard1.Valid, "Title "),
    If(!Amount_DataCard1.Valid, "Amount "),
    If(!DueDate_DataCard1.Valid, "Due date "),
    If(!Status_DataCard1.Valid, "Status ")
)`),
    p("List every card in the form. Whatever the label shows after you press Submit is the field to fix. A quicker rough check is to set every card's `Visible` to true and look for the red error text under a field."),
    p("**Then fix it.**"),
    table(
      ["Cause", "Fix"],
      ["Hidden required card", "Give the card a `Default` so it always submits a value, or make the column optional in the list."],
      ["Required column not on the form", "Add the field to the form, hide the card if needed, and set its `Default`."],
      ["Customized card", "Set the card's `Update` property to the new control's value in the right shape, such as `drpStatus.Selected` for a choice."],
      ["Wrong type", "Set the text input's `Format` to Number for number columns, and check the column's limits."],
      ["Required set by hand", "Set the card's `Required` back to the default, or to a formula that matches when the field is really needed."]
    ),
    p("**Stop users reaching the error.** Disable the Submit button until the form is valid."),
    code(`// Submit button, DisplayMode
If(frmRequest.Valid, DisplayMode.Edit, DisplayMode.Disabled)`)
  ],
  prevention: [
    ul(
      "When you replace the control in a card, update the card's `Update` property in the same sitting.",
      "Keep the error label in each card. It is where the reason is shown. Hiding it hides the explanation.",
      "Use `OnFailure` on the form to show `frmRequest.Error`, which carries the data source's message when the failure happens after validation.",
      "After someone changes which columns are required in the list, refresh the data source and retest the form."
    ),
    code(`// Form, OnFailure
Notify(frmRequest.Error, NotificationType.Error)`)
  ],
  faqs: [
    { question: "How do I find which field is failing validation in a Power Apps form?", answer: "Each data card has a Valid property. Show them in a temporary label, or make every card visible and look for the error text. The card whose Valid property is false is the one stopping the save." },
    { question: "Why does SubmitForm do nothing?", answer: "The form is not valid, so nothing is sent. If there is no visible message, the failing card is probably hidden. Check the form's Valid property and each card's Valid property." },
    { question: "How do I make a field required only in some cases?", answer: "Set the data card's Required property to a formula, such as drpType.Selected.Value = \"Purchase\". The card is then required only when the formula is true. The column must be optional in the data source for this to work." }
  ],
  relatedTools: ["patch-formula-builder", "power-fx-formatter"],
  relatedPatterns: ["power-apps-error-handling-iferror-patch"],
  relatedLinks: [formulaErrorsGuide, patchCheatSheet],
  relatedErrors: ["field-title-is-required-power-apps", "network-error-patch-requested-operation-is-invalid"],
  sources: [formsDoc, canvasDoc("controls/control-form-detail", "Edit form and Display form controls"), canvasDoc("add-form", "Add a form in canvas apps")]
};

const readOnlyColumn: ErrorPage = {
  ...base,
  slug: "specified-column-is-read-only-power-apps",
  message: "The specified column is read-only and can't be modified.",
  title: "Fix \"The specified column is read-only and can't be modified\" in Power Apps",
  shortTitle: "The specified column is read-only and can't be modified",
  description: "Which SharePoint and Dataverse columns cannot be written from Power Apps, why they end up in a Patch by accident, and how to save only the columns you can change.",
  keywords: ["The specified column is read-only and can't be modified", "Power Apps read-only column", "Patch calculated column", "Patch ID column", "Patch collection to SharePoint"],
  quickAnswer: "The record being saved includes a column the data source fills in itself, such as ID, Created, Modified, Created By or a calculated column. This usually happens when a whole record or a whole collection is patched back. Save only the columns you are changing, or remove the system columns from the collection with DropColumns before the save.",
  variants: [
    "The specified column is read-only and can't be modified: ID",
    "The specified column is read-only and can't be modified: Modified",
    "Network error when using Patch function: The specified column is read-only and can't be modified."
  ],
  meaning: [
    p("Some columns are owned by the data source. It sets them when an item is created or changed, and it refuses any attempt to write them. Power Apps reports the refusal with this message, usually with the column name at the end.")
  ],
  causes: [
    ol(
      "**A whole record used as the change.** `Patch(Requests, ThisItem, varEditedRecord)` can send every column of that record, system columns included.",
      "**A collection of loaded records patched back.** `Patch(Requests, colEdits)` can send every column in the collection.",
      "**A system or calculated column named in the record**, such as `ID: 12` or `Modified: Now()`.",
      "**A form with a card for a read-only column** whose `Update` property was filled in by hand."
    ),
    table(
      ["Data source", "Columns that cannot be written"],
      ["SharePoint", "ID, Created, Modified, Created By, Modified By, calculated columns, version and other system columns"],
      ["Dataverse", "The primary key, Created On, Modified On, Created By, Modified By, calculated and rollup columns"]
    )
  ],
  fixes: [
    p("**Name the columns you are changing.** The third argument of `Patch` should hold only those."),
    code(`// Can send read-only columns along with the changes
Patch(Requests, galRequests.Selected, varEditedRecord)

// Sends two columns
Patch(
    Requests,
    galRequests.Selected,
    {Status: {Value: "Approved"}, Notes: txtNotes.Text}
)`),
    p("**For a collection, drop the system columns first**, or build the collection with only the columns you need."),
    code(`Patch(
    Requests,
    ShowColumns(colEdits, ID, Status, Notes)
)`),
    p("`ShowColumns` keeps the named columns. ID stays in so that `Patch` knows which item each row belongs to. Power Apps uses it to match rows and does not try to change it."),
    p("**To set who created an item or when,** you cannot. Add your own columns, such as Requested by and Requested on, and write to those."),
    p("**In a form,** remove the card for the read-only column, or set the card's `DisplayMode` to View and clear its `Update` property.")
  ],
  prevention: [
    ul(
      "Treat records from the data source as read-only copies. Build a new record for every save.",
      "When loading a collection for editing, use `ShowColumns` at load time so system columns never enter it.",
      "Use your own columns for anything the app must control, including dates and people."
    ),
    p("The [collections cookbook](/cookbooks/power-apps-collections-cookbook) shows how to stage edits in a collection and save them.")
  ],
  faqs: [
    { question: "Can I set the ID of a SharePoint item from Power Apps?", answer: "No. SharePoint assigns the ID when the item is created and it cannot be changed. If you need your own reference number, add a separate column for it." },
    { question: "Can I change Created or Created By from Power Apps?", answer: "No. These are system columns set by SharePoint. Add your own date and person columns if the app needs to record a different date or person." },
    { question: "How do I save a whole collection back to SharePoint?", answer: "Use Patch with the data source and a table that holds only ID and the editable columns, for example Patch(Requests, ShowColumns(colEdits, ID, Status, Notes)). Rows with an ID update the matching item." }
  ],
  relatedTools: ["patch-formula-builder", "power-fx-formatter", "csv-to-power-fx-table"],
  relatedPatterns: ["power-apps-error-handling-iferror-patch"],
  relatedLinks: [patchCheatSheet, { href: "/cookbooks/power-apps-collections-cookbook", label: "Power Apps Collections Cookbook" }],
  relatedErrors: ["network-error-patch-requested-operation-is-invalid", "function-patch-has-some-invalid-arguments"],
  sources: [patchDoc, sharePointDoc, powerFxDoc("reference/function-table-shaping", "AddColumns, DropColumns, RenameColumns and ShowColumns functions")]
};

const incompatibleTypes: ErrorPage = {
  ...base,
  slug: "incompatible-types-for-comparison-power-apps",
  message: "Incompatible types for comparison. These types can't be compared: Record, Text.",
  title: "Fix \"Incompatible types for comparison. These types can't be compared\" in Power Apps",
  shortTitle: "Incompatible types for comparison",
  description: "Why Power Apps cannot compare a choice, lookup or person column with text, and the right comparison for each pair of types the message can name.",
  keywords: ["Incompatible types for comparison", "These types can't be compared: Record, Text", "Power Apps filter choice column", "These types can't be compared: Text, Number", "compare choice column Power Apps"],
  quickAnswer: "The two sides of the comparison are different types, and the message names them. Record, Text means a choice, lookup or person column compared with text: compare one field of it, such as Status.Value = \"Open\". Text, Number means a text input compared with a number: wrap it in Value(). Convert one side so both are the same type.",
  variants: [
    "These types can't be compared: Text, Number.",
    "These types can't be compared: Record, Text.",
    "These types can't be compared: OptionSetValue, Text.",
    "These types can't be compared: Text, Boolean.",
    "These types can't be compared: Date, Text."
  ],
  meaning: [
    p("The operators `=`, `<>`, `<`, `>`, `<=` and `>=` need the same type on both sides. Power Fx does not guess a conversion for you. The message lists the type on the left and then the type on the right, which tells you which side to change.")
  ],
  causes: [
    table(
      ["Types named", "What is being compared", "Fix"],
      ["Record, Text", "A SharePoint choice, lookup or person column with text", "Compare a field: `Status.Value`, `Project.Value`, `Owner.Email`"],
      ["OptionSetValue, Text", "A Dataverse choice with text", "Compare with the named option: `'Status (Requests)'.Open`"],
      ["Text, Number", "A text input with a number", "`Value(txtAmount.Text) > 100`"],
      ["Number, Text", "A number column with a text input", "`Amount > Value(txtLimit.Text)`"],
      ["Text, Boolean", "Text such as \"Yes\" with a yes/no column", "Compare with `true` or `false`"],
      ["Date, Text", "A date column with text", "`DueDate < DateValue(txtDate.Text)`"],
      ["Table, Text", "A multi-select column with text", "`\"Finance\" in Tags.Value`"],
      ["GUID, Text", "A Dataverse ID with text", "`RequestId = GUID(txtId.Text)`"]
    )
  ],
  fixes: [
    p("**Choice columns in SharePoint.** The column holds a record, and the text is in its `Value` field."),
    code(`// Error
Filter(Requests, Status = "Open")

// Fixed
Filter(Requests, Status.Value = "Open")

// Fixed, comparing with a dropdown selection
Filter(Requests, Status.Value = drpStatus.Selected.Value)`),
    p("**Choice columns in Dataverse.** Compare with the option itself. Type the choice name and Studio offers the options."),
    code(`Filter(Requests, Status = 'Status (Requests)'.Open)`),
    p("**Person and lookup columns.** Compare a field of the column."),
    code(`Filter(Requests, Owner.Email = User().Email)

Filter(Tasks, Project.Id = galProjects.Selected.ID)`),
    p("**Text and numbers.** A text input's `Text` is always text."),
    code(`Filter(Requests, Amount > Value(txtMinimum.Text))`),
    p("**Yes/No columns.** Compare with `true` or `false`, or use the column by itself."),
    code(`Filter(Requests, Approved)

Filter(Requests, !Approved)`),
    p("To see the type of anything, select it in the formula bar. Studio shows its type and current value underneath."),
    tool("power-apps-delegation-checker", "After fixing the comparison, check that the filter still delegates for your data source. Some of these fixes, such as the in operator, do not delegate to SharePoint.")
  ],
  prevention: [
    ul(
      "When a comparison involves a column, check the column type before writing it.",
      "Bind dropdowns to `Choices(Requests.Status)` and compare with `.Selected.Value`.",
      "Give number inputs the Number format and still wrap them in `Value()`."
    ),
    p("The [formula errors guide](/guides/fix-common-power-fx-formula-errors) covers the related type errors in function arguments.")
  ],
  faqs: [
    { question: "How do I filter a gallery by a choice column in Power Apps?", answer: "For SharePoint, compare the Value field of the column with text, for example Filter(Requests, Status.Value = \"Open\"). For Dataverse, compare the column with the named option, such as 'Status (Requests)'.Open." },
    { question: "What does Record, Text mean in the error?", answer: "The left side of the comparison is a record and the right side is text. Choice, lookup and person columns are records. Compare one of their fields, such as Value or Email, with the text." },
    { question: "How do I compare a text input with a number?", answer: "Convert the text with Value, for example Value(txtAmount.Text) > 100. The Text property of a text input is always text, even when its format is set to Number." }
  ],
  relatedTools: ["power-apps-delegation-checker", "power-fx-formatter", "gallery-search-filter-builder"],
  relatedPatterns: ["avoid-delegation-warnings-sharepoint-filters", "patch-sharepoint-choice-field"],
  relatedLinks: [formulaErrorsGuide, { href: "/cheat-sheets/power-apps-gallery-filtering-cheat-sheet", label: "Power Apps Gallery Filtering Cheat Sheet" }],
  relatedErrors: ["function-patch-has-some-invalid-arguments", "fetching-items-failed-possible-invalid-string-in-filter-query"],
  sources: [powerFxDoc("data-types", "Data types in Power Fx"), powerFxDoc("reference/operators", "Operators and identifiers"), sharePointDoc]
};

const fetchingItemsFailed: ErrorPage = {
  ...base,
  slug: "fetching-items-failed-possible-invalid-string-in-filter-query",
  message: "The requested operation is invalid. Server Response: Requests failed: Fetching items failed. Possible invalid string in filter query.",
  title: "Fix \"Fetching items failed. Possible invalid string in filter query\" in Power Apps",
  shortTitle: "Fetching items failed. Possible invalid string in filter query",
  description: "Why a Filter or LookUp against SharePoint fails when the app runs, how to find the condition SharePoint rejected, and ways to rewrite it.",
  keywords: ["Fetching items failed. Possible invalid string in filter query", "The requested operation is invalid Power Apps", "Power Apps SharePoint filter error", "gallery not loading SharePoint", "LookUp SharePoint error"],
  quickAnswer: "Power Apps turned your Filter or LookUp into a query, and SharePoint rejected it. Find the condition at fault by removing conditions one at a time until the data loads. Then rewrite that condition: compare with the right type, handle blank values before the query, or load the data with the conditions that work and apply the rest to the result.",
  variants: [
    "Fetching items failed. Possible invalid string in filter query.",
    "The requested operation is invalid. Server Response: ... failed: The query is not valid.",
    "Error when trying to retrieve data from the network."
  ],
  meaning: [
    p("When a formula such as `Filter` can be delegated, Power Apps does not fetch the list and filter it in the app. It translates the formula into a SharePoint query and lets SharePoint do the work. This error means SharePoint could not run the query it was sent."),
    p("Studio shows no underline, because the formula itself is valid. The wording of the message varies between versions of the connector, so match it on the phrase about the filter query.")
  ],
  causes: [
    ol(
      "**A value of the wrong type for the column**, such as text compared with a number column or an ID.",
      "**A blank value in the comparison**, for example a variable that is not set yet, or an empty text input compared with a date or number column.",
      "**A date comparison** built from text instead of a date value.",
      "**Too many lookup-type columns.** A SharePoint query that touches more than twelve lookup, person or managed metadata columns is refused.",
      "**A condition on a column type SharePoint cannot filter**, such as a calculated column.",
      "**The list or a column was changed** and the app still has the old definition."
    )
  ],
  fixes: [
    p("**Find the condition.** Cut the filter down until it works."),
    code(`// Fails
Filter(Requests, Status.Value = "Open" && Amount > txtMin.Text && DueDate < varCutoff)

// Try one condition at a time
Filter(Requests, Status.Value = "Open")
Filter(Requests, Amount > Value(txtMin.Text))
Filter(Requests, DueDate < varCutoff)`),
    p("For the exact query and SharePoint's reply, open **Monitor** from Advanced tools, reload the gallery and select the failed row."),
    p("**Match the types.** Convert text to numbers and dates before the comparison."),
    code(`Filter(Requests, Amount > Value(txtMin.Text))

Filter(Requests, DueDate < DateValue(txtCutoff.Text))`),
    p("**Handle blanks before the query.** Give an empty input a value that matches everything, or skip the condition."),
    code(`With(
    {minAmount: If(IsBlank(txtMin.Text), 0, Value(txtMin.Text))},
    Filter(Requests, Amount >= minAmount)
)`),
    p("**Split the work.** Let SharePoint apply the conditions it accepts, and apply the rest in the app to the smaller result."),
    code(`With(
    {open: Filter(Requests, Status.Value = "Open")},
    Filter(open, Left(Title, 3) = "INV")
)`),
    p("The second filter runs in the app, on at most as many rows as the data row limit allows, so keep the first filter selective."),
    p("**Refresh the data source** in Studio if the list was changed recently, then save and publish."),
    tool("power-apps-delegation-checker", "Check which functions and operators SharePoint can run, so you know which conditions to keep in the first filter.")
  ],
  prevention: [
    ul(
      "Set variables used in a filter in `App.OnStart` or `App.Formulas`, so they are never blank when a gallery first loads.",
      "Keep type conversions outside the filter by working out the value first with `With`.",
      "Keep lists under twelve lookup, person and managed metadata columns, or filter from a view-sized set of columns."
    ),
    p("The [gallery filtering cheat sheet](/cheat-sheets/power-apps-gallery-filtering-cheat-sheet) has filter formulas that delegate to SharePoint.")
  ],
  faqs: [
    { question: "Why does my gallery show an error instead of data?", answer: "The Filter in its Items property was sent to SharePoint as a query and rejected. Remove conditions one at a time to find the one at fault, then correct its type or handle blank values before the query runs." },
    { question: "Why is there no error in Studio when the filter fails at run time?", answer: "The formula is valid Power Fx, so Studio has nothing to underline. The failure happens when SharePoint receives the translated query with the actual values." },
    { question: "How do I see the query Power Apps sends to SharePoint?", answer: "Open Monitor from Advanced tools in Studio, run the app and select the network row for the request. It shows the request address, including the filter, and the response from SharePoint." }
  ],
  relatedTools: ["power-apps-delegation-checker", "power-fx-formatter"],
  relatedPatterns: ["avoid-delegation-warnings-sharepoint-filters", "power-apps-monitor-debug-performance-trace"],
  relatedLinks: [
    { href: "/guides/power-apps-delegation-warning-explained", label: "What a delegation warning means" },
    { href: "/cheat-sheets/power-apps-gallery-filtering-cheat-sheet", label: "Power Apps Gallery Filtering Cheat Sheet" }
  ],
  relatedErrors: ["incompatible-types-for-comparison-power-apps", "you-dont-have-permission-to-view-this-data", "the-query-is-not-valid-get-items"],
  sources: [sharePointDoc, canvasDoc("delegation-overview", "Understand delegation in a canvas app"), monitorDoc]
};

const dlpNotCompliant: ErrorPage = {
  ...base,
  slug: "app-not-compliant-data-loss-prevention-policies",
  message: "It looks like this app isn't compliant with the latest data loss prevention policies.",
  title: "Fix \"this app isn't compliant with the latest data loss prevention policies\" in Power Apps",
  shortTitle: "App isn't compliant with data loss prevention policies",
  description: "What a data loss prevention policy is, why it stops a Power Apps app from opening, what a maker can change, and what to ask an administrator for.",
  keywords: ["isn't compliant with the latest data loss prevention policies", "Power Apps DLP error", "data loss prevention policy Power Apps", "connector blocked by DLP", "business and non-business connectors"],
  quickAnswer: "Your organization's data loss prevention policy does not allow the mix of connectors this app uses. Either the app combines a connector from the Business group with one from the Non-business group, or it uses a connector the policy blocks. As a maker you can remove or replace the connector at fault. Changing the policy, or the classification of a connector, needs a Power Platform administrator.",
  variants: [
    "It looks like this app isn't compliant with the latest data loss prevention policies. Contact your admin for more info."
  ],
  meaning: [
    p("A data loss prevention policy, or DLP policy, is a rule set by administrators about which connectors may be used together. Each connector is placed in one of three groups: Business, Non-business or Blocked."),
    ul(
      "An app may use several connectors from the Business group together.",
      "An app may use several connectors from the Non-business group together.",
      "An app may not mix the two groups.",
      "An app may not use a Blocked connector at all."
    ),
    p("The aim is to stop company data from being copied to services the organization does not control. Policies apply per environment, so the same app can be allowed in one environment and stopped in another.")
  ],
  causes: [
    ol(
      "A connector was added to the app that sits in the other group from the rest, such as a social media or personal storage connector next to SharePoint.",
      "The policy changed after the app was built. An app that ran for months can stop without anyone editing it.",
      "The app was moved or imported into an environment with a stricter policy.",
      "A connector the app uses was moved to Blocked.",
      "A custom connector or an HTTP connector is restricted by the policy."
    )
  ],
  fixes: [
    p("**Find the connector.**"),
    ol(
      "Open the app in Studio. A message at the top names the policy problem when there is one.",
      "Open the **Data** pane and list the connections the app uses.",
      "Compare them with the policy. If you cannot see the policy, send the list to your administrator and ask which connector is in a different group."
    ),
    p("**What a maker can do.**"),
    ul(
      "Remove the connection if the app no longer needs it. Unused connections left in the Data pane still count.",
      "Replace the connector with one in the allowed group. For example, store files in SharePoint, not in a personal storage service.",
      "Move the work to an environment whose policy allows it, if your organization has one for that purpose."
    ),
    p("**What to ask an administrator for.** Be specific. Name the app, the environment, the connector and the business reason. An administrator can move a connector to another group, exclude an environment from a policy, or allow specific addresses for HTTP and custom connectors."),
    note("Calling a flow from the app does not get around the policy. Flows are checked against the same policy, and a flow that breaks it is suspended.")
  ],
  prevention: [
    ul(
      "Before designing an app, ask which connectors are in the Business group for your environment.",
      "Build in the environment the app will run in, or one with the same policy, so problems show up early.",
      "Remove connections you tried and no longer use.",
      "Keep an inventory of connectors per app, so a planned policy change can be checked against it."
    ),
    p("The [ALM and governance patterns](/alm) cover environments and governance from the administrator's side.")
  ],
  faqs: [
    { question: "Can I fix a DLP error myself?", answer: "Only by changing the app: removing the connector that breaks the policy or replacing it with an allowed one. The policy itself, and the group each connector is in, can only be changed by a Power Platform administrator." },
    { question: "Why did my app stop working when I changed nothing?", answer: "The data loss prevention policy for the environment was probably changed, or a connector was moved to a different group. Apps are checked against the current policy, not the one in force when they were built." },
    { question: "What are Business and Non-business connectors?", answer: "They are the two groups a data loss prevention policy sorts connectors into. Connectors in the same group can be used together in one app or flow. Connectors from different groups cannot." }
  ],
  relatedTools: [],
  relatedPatterns: ["managed-environments-sharing-limits-weekly-digest", "export-power-platform-inventory-powershell"],
  relatedLinks: [
    { href: "/alm", label: "ALM and governance patterns" },
    { href: "/standards/connection-reference-standards", label: "Connection Reference Standards" }
  ],
  relatedErrors: ["you-dont-have-permission-to-view-this-data", "problem-with-the-flows-trigger"],
  sources: [
    learnDoc("power-platform/admin/wp-data-loss-prevention", "Data policies"),
    learnDoc("power-platform/admin/dlp-connector-classification", "Connector classification"),
    learnDoc("troubleshoot/power-platform/power-automate/flow-run-issues/triggers-troubleshoot", "Troubleshoot Power Automate trigger problems and errors")
  ]
};

const noPermission: ErrorPage = {
  ...base,
  slug: "you-dont-have-permission-to-view-this-data",
  message: "You don't have permission to view this data.",
  title: "Fix \"You don't have permission to view this data\" in a shared Power Apps app",
  shortTitle: "You don't have permission to view this data",
  description: "Why users can open a shared app and still see no data, and how to give them the right access to the SharePoint list or Dataverse table behind it.",
  keywords: ["You don't have permission to view this data", "Power Apps shared app no data", "Power Apps SharePoint permissions", "share app data source access", "Dataverse security role Power Apps"],
  quickAnswer: "Sharing an app gives people the app, not the data. Each user also needs access to the SharePoint list, Dataverse table or other source the app reads. For SharePoint, add the users to the site or list with at least Read access, and Contribute or Edit if they save data. For Dataverse, assign a security role that covers the tables when you share the app.",
  variants: [
    "You don't have permission to view this data. Server Response: ... Access denied."
  ],
  meaning: [
    p("For most connectors, including SharePoint and Dataverse, a canvas app connects to data as the person using it. The maker's own access is not passed on. If the user could not open the list in a browser, the app cannot read it for them either."),
    p("That is why the app works for the maker, who owns the list, and shows this message to everyone else.")
  ],
  causes: [
    ol(
      "The users were never given access to the SharePoint site or list.",
      "The list has its own permissions, separate from the site, and the users are not in them.",
      "Items have individual permissions, so users can open the list and still not see particular items.",
      "For Dataverse, the users have no security role that grants read access to the tables.",
      "The app reads a second source, such as another list used for a dropdown, that was not shared.",
      "The user is a guest, and guest access to the site or environment is not set up."
    )
  ],
  fixes: [
    p("**Confirm the cause.** Ask an affected user to open the SharePoint list directly in a browser. If they are refused there, the problem is list access and the app is behaving correctly."),
    p("**SharePoint.**"),
    ol(
      "Open the site, select the gear icon, then **Site permissions**, and add the users or a group. Or share the list alone from its own settings if they should not see the rest of the site.",
      "Choose the level: **Read** to view, **Contribute** or **Edit** to create and change items.",
      "Do the same for every list and library the app uses."
    ),
    p("**Dataverse.**"),
    ol(
      "Open the app's **Share** panel.",
      "Select the user or group.",
      "Under the data permissions section, assign a security role that grants access to the tables the app uses."
    ),
    p("See the [security roles cheat sheet](/cheat-sheets/dataverse-security-roles-cheat-sheet) for what each access level means."),
    p("**Then have the user reload the app.** Permission changes can take a few minutes to apply. If the app had already cached a failed connection, closing and reopening it clears that."),
    note("Use groups, not individual names. Share the app with a Microsoft 365 or security group and give the same group access to the data, so adding a person is one step.")
  ],
  prevention: [
    ul(
      "Write down every data source the app uses and the access level users need for each. Share the data when you share the app.",
      "Test with an ordinary user account before announcing the app.",
      "Remember that anyone with access to the list can also open it outside the app. If users must not see each other's items, that has to be enforced in the list's permissions, not by a filter in the app."
    ),
    p("For item-level permissions set by a flow, see the [item-level permissions pattern](/patterns/sharepoint-item-level-permissions-break-inheritance-flow).")
  ],
  faqs: [
    { question: "Does sharing a Power Apps app share the SharePoint list too?", answer: "No. Sharing the app only lets people open it. They need their own permission on the SharePoint site or list, which you grant in SharePoint." },
    { question: "What SharePoint permission do app users need?", answer: "Read access to view items. Contribute or Edit access to create and change them. Users who only have Read will be able to open the app and will get an error when they save." },
    { question: "Can I let users use the app without giving them access to the list?", answer: "Not with the SharePoint connector, which always acts as the signed-in user. One alternative is to have the app call a flow that reads or writes the data using the flow owner's connection, which needs careful thought about who can then see what." }
  ],
  relatedTools: [],
  relatedPatterns: ["sharepoint-item-level-permissions-break-inheritance-flow", "managed-environments-sharing-limits-weekly-digest"],
  relatedLinks: [
    { href: "/cheat-sheets/dataverse-security-roles-cheat-sheet", label: "Dataverse Security Roles Cheat Sheet" },
    { href: "/standards/sharepoint-list-design-standards", label: "SharePoint List Design Standards" }
  ],
  relatedErrors: ["app-not-compliant-data-loss-prevention-policies", "network-error-patch-requested-operation-is-invalid"],
  sources: [canvasDoc("share-app", "Share a canvas app"), canvasDoc("share-app-resources", "Share resources used by canvas apps"), sharePointDoc]
};

const behaviorFunction: ErrorPage = {
  ...base,
  slug: "behavior-function-in-a-non-behavior-property",
  message: "Behavior function in a non-behavior property. You can't use this property to change values elsewhere in the app.",
  title: "Fix \"Behavior function in a non-behavior property\" in Power Apps",
  shortTitle: "Behavior function in a non-behavior property",
  description: "Why Set, Patch, Collect and Navigate are refused in properties such as Text, Items and Visible, and where to move each kind of formula.",
  keywords: ["Behavior function in a non-behavior property", "You can't use this property to change values elsewhere in the app", "Set in Text property Power Apps", "Power Apps behavior formula", "named formulas"],
  quickAnswer: "Functions that change something, such as Set, UpdateContext, Patch, Collect, Navigate and Notify, only run in behavior properties, which are the ones whose names start with On. Move the function to OnSelect, OnChange or OnVisible. If you were using Set to calculate a value for display, put the calculation straight into the property, or into a named formula in App.Formulas.",
  variants: [
    "Behavior function in a non-behavior property. You can't use this property to change values elsewhere in the app.",
    "The function 'Set' has some invalid arguments."
  ],
  meaning: [
    p("Power Apps properties come in two kinds."),
    table(
      ["Kind", "Examples", "When the formula runs"],
      ["Data properties", "`Text`, `Items`, `Visible`, `Fill`, `Default`, `DisplayMode`", "Whenever Power Apps needs the value, as often as it likes"],
      ["Behavior properties", "`OnSelect`, `OnChange`, `OnVisible`, `OnStart`, `OnSuccess`", "Once, when the event happens"]
    ),
    p("A data property describes a value. Power Apps recalculates it whenever anything it depends on changes, and may do so many times. If such a formula could save a record or set a variable, the app would do those things at unpredictable moments. So the functions that change state are allowed only where an event triggers them.")
  ],
  causes: [
    ol(
      "`Set` or `UpdateContext` in a `Text`, `Visible` or `Default` property, to store a calculated value.",
      "`Collect` or `ClearCollect` in a gallery's `Items`, to load data when the gallery appears.",
      "`Patch` in a data property, to save as soon as a value changes.",
      "`Navigate` in `Visible`, to redirect when a condition is true.",
      "`Notify` in a label, to warn when a value is out of range."
    )
  ],
  fixes: [
    table(
      ["You wanted to", "Do this instead"],
      ["Show a calculated value", "Put the calculation in the property itself, with no `Set`."],
      ["Reuse a calculated value in several places", "Define a named formula in `App.Formulas`."],
      ["Load data when a screen opens", "Use the screen's `OnVisible`, or set `Items` straight to the `Filter`."],
      ["Save when a value changes", "Use the control's `OnChange`."],
      ["Redirect on a condition", "Use `App.StartScreen` at launch, or `Navigate` in the event that changes the condition."],
      ["Warn about a value", "Show a label whose `Visible` is the condition, or call `Notify` from `OnChange`."]
    ),
    p("**A calculated value.**"),
    code(`// Error: in a label's Text property
Set(varTotal, Sum(colLines, Amount)); Text(varTotal, "#,##0.00")

// Fixed: the property calculates the value
Text(Sum(colLines, Amount), "#,##0.00")`),
    p("**A value used in many places.** A named formula recalculates by itself and needs no event."),
    code(`// App.Formulas
nfOrderTotal = Sum(colLines, Amount);

// Any Text property
Text(nfOrderTotal, "#,##0.00")`),
    p("**Loading data.**"),
    code(`// Error: in a gallery's Items property
ClearCollect(colOpen, Filter(Requests, Status.Value = "Open"))

// Fixed: Items reads the data directly
Filter(Requests, Status.Value = "Open")`),
    p("**Saving on change.**"),
    code(`// Toggle, OnChange
Patch(Requests, ThisItem, {Approved: Self.Value})`),
    tool("onstart-to-named-formulas", "Paste an App.OnStart full of Set calls and the converter rewrites the ones that can become named formulas.")
  ],
  prevention: [
    ul(
      "Before writing a formula, ask whether it describes a value or performs an action. Values go in data properties. Actions go in On properties.",
      "Prefer formulas that read data directly over variables that have to be kept up to date.",
      "Use named formulas for anything calculated from other values."
    ),
    p("The [formula errors guide](/guides/fix-common-power-fx-formula-errors) covers this error alongside the other common ones.")
  ],
  faqs: [
    { question: "What is a behavior property in Power Apps?", answer: "A property that runs its formula once in response to an event. Their names start with On, such as OnSelect, OnChange and OnVisible. Functions that change variables, data or the current screen are only allowed there." },
    { question: "Why can't I use Set in a label's Text property?", answer: "Text is a data property that Power Apps recalculates whenever it needs to. Functions that change values are not allowed there, because they would run at unpredictable times. Put the calculation directly in the Text property, or use a named formula." },
    { question: "How do I run a formula when a screen loads?", answer: "Use the screen's OnVisible property, which runs each time the screen is shown. For values that do not depend on an event, use a named formula in App.Formulas, which needs no trigger." }
  ],
  relatedTools: ["onstart-to-named-formulas", "power-fx-formatter"],
  relatedPatterns: ["with-function-readable-power-fx-formulas", "power-apps-error-handling-iferror-patch"],
  relatedLinks: [formulaErrorsGuide, { href: "/guides/speed-up-slow-power-fx-formulas", label: "Speed up slow Power Fx formulas" }],
  relatedErrors: ["formula-uses-scope-not-supported-for-evaluation", "function-patch-has-some-invalid-arguments"],
  sources: [canvasDoc("working-with-formulas-in-depth", "Understand behavior formulas"), canvasDoc("working-with-variables", "Understand variables in canvas apps"), powerFxDoc("reference/object-app", "App object")]
};

const usesScope: ErrorPage = {
  ...base,
  slug: "formula-uses-scope-not-supported-for-evaluation",
  message: "This formula uses scope, which is not presently supported for evaluation.",
  title: "What \"This formula uses scope, which is not presently supported for evaluation\" means in Power Apps",
  shortTitle: "This formula uses scope, which is not presently supported for evaluation",
  description: "Why Power Apps Studio shows this notice under some formulas, why it is not an error, and how to check the value of a formula that uses ThisItem, ThisRecord or a record scope.",
  keywords: ["This formula uses scope, which is not presently supported for evaluation", "Power Apps formula uses scope", "ThisItem preview not available", "Power Apps formula bar result", "ThisRecord scope"],
  quickAnswer: "Nothing is wrong. Studio normally shows the result of the selected part of a formula under the formula bar. It cannot do that for a part that depends on the current row, such as ThisItem in a gallery or a column name inside Filter or ForAll, because there is no single row to evaluate it for. The formula still runs correctly in the app.",
  variants: [],
  meaning: [
    p("When you select part of a formula in Studio, the area under the formula bar shows that part's type and current value. It is a preview for the maker and has nothing to do with how the app runs."),
    p("Some parts have no single value to preview. Inside a gallery, `ThisItem` is a different record for every row. Inside `Filter`, `ForAll`, `AddColumns`, `Sum` or `With`, a column name means the column of whichever row is being processed. This is called record scope. Studio cannot pick a row for you, so it shows this notice in place of a value."),
    p("There is no red underline and no error icon. If you see those as well, they are a separate problem.")
  ],
  causes: [
    ul(
      "A formula in a control inside a gallery or form that uses `ThisItem`.",
      "The condition inside `Filter`, `LookUp`, `CountIf` or `Sum`, where column names refer to each row in turn.",
      "The formula inside `ForAll`, `AddColumns` or `With`, including `ThisRecord`.",
      "A reference to `Parent` or `Self` in a property that depends on the row."
    )
  ],
  fixes: [
    p("**If the app behaves correctly, do nothing.** The notice does not affect users and does not need to be cleared."),
    p("**If you want to see the value while building,** use one of these."),
    ul(
      "**Preview the whole expression.** Select the entire `Filter(...)` or `ForAll(...)` call instead of the part inside it. Studio can evaluate the complete function and shows the resulting table.",
      "**Add a temporary label.** Inside the gallery, add a label with the expression as its `Text`. Each row shows its own value.",
      "**Try one record.** Replace `ThisItem` with a fixed record such as `First(Requests)` in a label outside the gallery.",
      "**Use Monitor.** Open Monitor from Advanced tools to see what the app sends and receives when the formula runs."
    ),
    code(`// Inside a gallery, Studio cannot preview this
ThisItem.Amount * 1.2

// In a label outside the gallery, it can preview this
First(Requests).Amount * 1.2`),
    p("**If the result is wrong,** look for the cause elsewhere: a comparison between different types, a blank value, or a filter that is not delegated and only sees part of the list. The notice is not related to any of them."),
    tool("power-fx-formatter", "Format a long formula so each function is on its own line. It is then easier to select one complete function and preview its result.")
  ],
  prevention: [
    p("There is nothing to prevent. For formulas that are easier to check, give the stages names with `With`, so each stage can be read and tested separately. The [With pattern](/patterns/with-function-readable-power-fx-formulas) shows how.")
  ],
  faqs: [
    { question: "Is This formula uses scope an error?", answer: "No. It is a notice that Studio cannot show a preview value for that part of the formula. The formula runs normally when the app is used." },
    { question: "What is scope in Power Apps?", answer: "Record scope is the context in which a column name or ThisItem refers to one particular row. It exists inside galleries and forms, and inside functions such as Filter, ForAll and Sum that process a table row by row." },
    { question: "How do I check what ThisItem contains?", answer: "Add a temporary label inside the gallery and set its Text to the field you want to see, such as ThisItem.Status.Value. Each row then shows its own value." }
  ],
  relatedTools: ["power-fx-formatter"],
  relatedPatterns: ["with-function-readable-power-fx-formulas", "power-apps-monitor-debug-performance-trace"],
  relatedLinks: [formulaErrorsGuide, { href: "/guides/format-power-fx-formulas", label: "Format Power Fx formulas" }],
  relatedErrors: ["behavior-function-in-a-non-behavior-property", "incompatible-types-for-comparison-power-apps"],
  sources: [powerFxDoc("reference/operators", "Operators and identifiers"), canvasDoc("working-with-formulas", "Get started with canvas app formulas"), monitorDoc]
};

export const appErrors: ErrorPage[] = [
  patchOperationInvalid,
  patchConflict,
  patchInvalidArguments,
  titleRequired,
  entryRequired,
  readOnlyColumn,
  incompatibleTypes,
  fetchingItemsFailed,
  dlpNotCompliant,
  noPermission,
  behaviorFunction,
  usesScope
];
