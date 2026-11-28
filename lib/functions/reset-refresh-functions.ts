import { canvasDoc, code, note, p, section, table, ul } from "../guides/types";
import { fxRef, type FunctionPage } from "./types";

const published = "2026-11-26";
const dataSourcesDoc = canvasDoc("working-with-data-sources", "Understand data sources for canvas apps");

export const resetFunction: FunctionPage = {
  slug: "reset",
  name: "Reset",
  category: "Variables, screens and messages",
  title: "Reset function in Power Apps: clear a control back to its default",
  description: "How the Power Fx Reset function puts a text input, dropdown, combo box or other input control back to its Default value, why it can't reach into a gallery or form from outside, and when to use ResetForm or a Default variable instead.",
  keywords: ["Power Apps Reset function", "Reset text input Power Apps", "clear search box Power Apps", "reset dropdown Power Apps", "Reset control in gallery", "Reset vs ResetForm"],
  published,
  updated: published,
  quickAnswer: "Reset(Control) puts an input control back to the value of its Default property and throws away whatever the user typed or picked. It's a behaviour function, so use it in OnSelect and similar properties, for example Reset(txtSearch) on a Clear button. It can't reset a control inside a gallery or form from outside that gallery or form. To clear every field of an Edit form, use ResetForm instead.",
  syntax: `Reset( Control )`,
  arguments: [
    ["`Control`", "Required", "The input control to reset, such as a text input, dropdown, combo box, date picker, toggle or slider."]
  ],
  returns: "Nothing. Reset has no return value.",
  usableIn: "Behaviour formulas only",
  delegation: "Not relevant: Reset works on a control, not on data.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A Clear button next to a search box
Reset(txtSearch)

// Clear every filter on a screen in one button
Reset(txtSearch); Reset(drpStatus); Reset(dteFrom); Reset(dteTo)

// Clear the box after the value is used
Patch(Comments, Defaults(Comments), { Title: txtComment.Text });
Reset(txtComment)`),
      p("Each call sets the control back to its **Default** property. If the Default of `txtSearch` is `\"\"`, the box empties. If the Default of `drpStatus` is `\"Open\"`, the dropdown goes back to Open, not to nothing.")
    ),
    section(
      "what-default-means",
      "Reset goes back to Default, not to blank",
      p("A control has two values: the **Default** you set as the maker, and the value the user has typed or picked since. Reset throws away the user's value and shows the Default again. To make a Clear button empty a control, its Default has to be empty too."),
      table(
        ["Control", "Default for an empty reset", "Value after Reset"],
        ["Text input", "`\"\"`", "An empty box"],
        ["Dropdown", "Blank, with **AllowEmptySelection** set to true", "No item selected"],
        ["Combo box", "Leave **DefaultSelectedItems** empty", "No items selected"],
        ["Date picker", "`Blank()`", "No date"],
        ["Toggle", "`false`", "Off"]
      ),
      p("Input controls also reset when their Default changes. If a text input's Default is a variable, `Set(varName, \"Sam\")` puts Sam in the box with no Reset needed. Setting the variable to the value it already holds changes nothing, and that's the case where you call Reset.")
    ),
    section(
      "gallery-form",
      "Controls inside a gallery or form",
      p("Microsoft's reference says you can't reset controls within a **Gallery** or **Edit form** control from outside them. A formula on a control inside the same gallery or form can reset them. For a whole form, use ResetForm."),
      code(`// Inside a gallery row: a Clear icon next to the row's text input
Reset(txtRowNote)

// Outside the form: clear every field of the form
ResetForm(frmRequest)`),
      note("If a button outside a gallery needs to clear an input in every row, give the input's Default a variable and change the variable instead. Changing the Default resets the control in every row.")
    ),
    section(
      "reset-property",
      "Reset function or Reset property",
      p("Input controls also have a **Reset** property. When it changes to true, the control resets. Microsoft's reference says the function is generally preferred, and that the property can be the better choice when many controls need to reset together from several formulas."),
      code(`// On each control that should clear together
Reset: varClearFilters

// On any button that clears them
Set(varClearFilters, true); Set(varClearFilters, false)`, "The Reset property pattern")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Using Reset in a property that isn't a behaviour property,** such as Items or Default. It only works in OnSelect, OnChange, OnVisible, OnSuccess and similar.",
        "**Expecting Reset to empty a control that has a Default.** It goes back to the Default. Change the Default, or clear it, if the control should come back empty.",
        "**Resetting the search box but not the filters.** A gallery whose Items uses three controls needs all three reset to show everything again.",
        "**Trying to write a value into a control.** Power Fx can't assign to a control's Text or Selected. Change the variable the Default reads instead.",
        "**Calling Reset on a form field from outside the form.** Use ResetForm on the form, or put the button inside the form's data card."
      )
    )
  ],
  faqs: [
    { question: "How do I clear a text input in Power Apps?", answer: "Set the text input's Default to an empty string, then call Reset(txtName) from a button's OnSelect or after the value is saved. Reset puts the control back to its Default and discards what the user typed." },
    { question: "Why doesn't Reset clear my dropdown?", answer: "Reset goes back to the control's Default, so a dropdown with a Default value returns to that value. For a dropdown that resets to nothing, leave Default blank and set AllowEmptySelection to true." },
    { question: "Can I reset a control in a gallery from a button outside the gallery?", answer: "No. Microsoft's reference says controls inside a gallery or Edit form can only be reset from formulas inside that gallery or form. From outside, change a variable that the control's Default uses, or use ResetForm for a form." },
    { question: "What is the difference between Reset and ResetForm?", answer: "Reset clears one control. ResetForm clears every field of an Edit form, runs the form's OnReset and, if the form was in New mode, switches it back to Edit mode." }
  ],
  relatedFunctions: ["submitform", "set", "updatecontext", "navigate"],
  relatedGuides: ["power-apps-searchable-filterable-gallery-sharepoint", "build-first-canvas-app-sharepoint-list"],
  relatedErrors: [],
  relatedPatterns: [],
  relatedTools: ["gallery-search-filter-builder"],
  sources: [fxRef("function-reset", "Reset function"), fxRef("function-form", "EditForm, NewForm, SubmitForm, ResetForm and ViewForm functions")]
};

export const refreshFunction: FunctionPage = {
  slug: "refresh",
  name: "Refresh",
  category: "Save and remove data",
  title: "Refresh function in Power Apps: reload a data source",
  description: "How the Power Fx Refresh function reloads a SharePoint list, Dataverse table or other data source so the app shows changes made outside it, when you need it after a flow runs, and why you usually don't need it after Patch or SubmitForm.",
  keywords: ["Power Apps Refresh function", "Refresh data source Power Apps", "Power Apps gallery not updating", "Refresh after flow Power Apps", "Refresh SharePoint list Power Apps", "Power Apps reload data"],
  published,
  updated: published,
  quickAnswer: "Refresh(DataSource) fetches a fresh copy of a data source, such as a SharePoint list or Dataverse table, so galleries and formulas show changes that other users, flows or other apps made since the app loaded. A running app doesn't detect those changes on its own. Changes the app makes itself with Patch, SubmitForm or Remove already show up, so you don't need Refresh after them. It's a behaviour function and doesn't work on collections.",
  syntax: `Refresh( DataSource )`,
  arguments: [
    ["`DataSource`", "Required", "The connected data source to reload, such as a SharePoint list or Dataverse table. Not a collection."]
  ],
  returns: "Nothing. Refresh has no return value.",
  usableIn: "Behaviour formulas only",
  delegation: "Refresh doesn't filter anything itself. After it runs, galleries and formulas that use the data source query it again, with the same delegation rules as before.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A refresh button above a gallery
Refresh(Requests)

// After a flow that changes the list
SetStatusFlow.Run(galRequests.Selected.ID, "Approved");
Refresh(Requests)

// Reload two sources at once
Concurrent(Refresh(Requests), Refresh(Comments))`),
      p("After `Refresh(Requests)`, every gallery, form and formula that uses Requests shows the current data, including items other people added, changed or deleted.")
    ),
    section(
      "when-needed",
      "When you need Refresh, and when you don't",
      p("A canvas app loads data from the source when it starts, and Microsoft's documentation says a running app doesn't detect changes made outside it, such as an item added in SharePoint. Refresh is how you pick those up."),
      table(
        ["What changed the data", "Do you need Refresh?"],
        ["This app, with Patch, SubmitForm, Collect, Remove or Update", "No. The app already knows about its own change"],
        ["A Power Automate flow the app just ran", "Yes, after the flow finishes"],
        ["Another user, in their copy of the app", "Yes, if this user needs to see it straight away"],
        ["Someone editing the SharePoint list or Dataverse table directly", "Yes"],
        ["A scheduled flow overnight", "Usually no: the next time the app opens it loads fresh data"]
      ),
      note("Adding Refresh after every Patch is a common habit that slows the app down for no gain. Each Refresh asks the data source for its data again.")
    ),
    section(
      "after-flow",
      "Refresh after calling a flow",
      p("When a flow ends the app's part of the work with **Respond to a PowerApp or flow**, the app waits for that action before it runs the next part of the formula. Put the Respond action after the step that changes the list, and a Refresh on the next line sees the change."),
      code(`// The flow updates the item, then runs Respond to a PowerApp or flow
Set(varResult, SetStatusFlow.Run(galRequests.Selected.ID, "Approved"));
Refresh(Requests);
Notify("Status updated", NotificationType.Success)`),
      p("Actions after the Respond action keep running after the app has its answer. If the flow changes the list after it responds, the change may not be saved yet when Refresh runs. The [call a flow from Power Apps guide](/guides/call-power-automate-flow-from-power-apps) covers inputs, outputs and the 120-second limit.")
    ),
    section(
      "collections",
      "Collections and Refresh",
      p("A collection is a table held in the app, not a connected data source, so there's nothing for Refresh to reload. To update a collection with the latest data, rebuild it."),
      code(`// Reload the source, then rebuild the collection from it
Refresh(Requests);
ClearCollect(colMyRequests, Filter(Requests, 'Created By'.Email = User().Email))`)
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Refresh in OnVisible on a busy screen.** It reloads every time the screen opens. Use a refresh button, or refresh only after something outside the app changed the data.",
        "**Refresh on a timer every few seconds.** Every tick queries the data source for every user. Choose the longest interval users can live with, or let them refresh by hand.",
        "**Refresh after your own Patch.** Not needed. If a gallery doesn't show a patched value, check that the gallery's Items and the Patch use the same data source.",
        "**Refresh on a collection.** Rebuild the collection with ClearCollect instead.",
        "**Refreshing before the flow has saved its change.** Put the Respond action after the step that updates the data."
      )
    )
  ],
  faqs: [
    { question: "Why isn't my Power Apps gallery showing new items?", answer: "A running app doesn't detect changes made outside it, such as an item added in SharePoint or by a flow. Call Refresh with the data source, for example Refresh(Requests), from a button or after the flow runs." },
    { question: "Do I need Refresh after Patch in Power Apps?", answer: "No. Changes the app makes itself with Patch, SubmitForm, Remove and similar functions are already reflected in the app. Refresh is for changes made outside the app." },
    { question: "Can I refresh a collection in Power Apps?", answer: "No. Refresh works on connected data sources. A collection lives in the app, so rebuild it with ClearCollect, after Refresh on its source if the source changed." },
    { question: "How do I make Power Apps refresh data automatically?", answer: "Add a Timer control with Repeat and AutoStart turned on, and put Refresh(DataSource) in its OnTimerEnd. Keep the interval long, because each refresh queries the data source for every user of the app." }
  ],
  relatedFunctions: ["patch", "submitform", "collect", "remove"],
  relatedGuides: ["call-power-automate-flow-from-power-apps", "power-apps-patch-vs-submitform-vs-collect"],
  relatedErrors: [],
  relatedPatterns: ["refresh-selected-request-after-patch"],
  relatedTools: [],
  sources: [fxRef("function-refresh", "Refresh function"), dataSourcesDoc]
};

