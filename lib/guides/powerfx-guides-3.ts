import { canvasDoc, code, note, ol, p, powerFxDoc, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-21";

export const sharePointGalleryGuide: Guide = {
  slug: "power-apps-searchable-filterable-gallery-sharepoint",
  title: "Build a searchable, filterable gallery on a SharePoint list in Power Apps",
  shortTitle: "Searchable, filterable gallery on SharePoint",
  description: "Step by step: a search box, a status filter, a my-items toggle and a date range above a gallery, written so SharePoint does the filtering and the gallery still finds items past the first 500.",
  eyebrow: "Power Fx how-to",
  keywords: ["Power Apps search gallery SharePoint", "Power Apps filter gallery dropdown SharePoint", "Power Apps gallery multiple filters", "Power Apps search box delegation SharePoint", "Power Apps filter gallery show all when blank"],
  published,
  updated: published,
  quickAnswer: "Set the gallery's Items to one Filter over the list. Search with StartsWith, because SharePoint can't run Search or the in operator. Give each filter its own condition that starts with a check on the control, such as IsBlank(cmbStatus.Selected.Value) || Status.Value = cmbStatus.Selected.Value, so an empty control shows everything. Sort by a date, number or text column, not a choice or person column. The whole formula is then sent to SharePoint and covers the entire list.",
  sections: [
    section(
      "what-you-build",
      "What you'll build",
      p("A screen for a SharePoint list named **Requests**, with these controls above a gallery. Rename them to match your app, but keep the prefixes, because the formulas and the builder tool read them."),
      table(
        ["Control", "Name", "Purpose"],
        ["Text input", "`txtSearch`", "Search the title and request number"],
        ["Combo box", "`cmbStatus`", "Show one status, or all when empty"],
        ["Toggle", "`tglMyItems`", "Show only items assigned to me"],
        ["Two date pickers", "`dpFrom`, `dpTo`", "Show items created in a date range"],
        ["Button", "`btnClear`", "Clear every filter"],
        ["Vertical gallery", "`galRequests`", "The results"]
      ),
      p("The list has a **Title** text column, a **Request Number** text column, a **Status** choice column, an **Assigned To** person column and the built-in **Created** date.")
    ),
    section(
      "why-it-breaks",
      "Why the obvious formula stops working",
      p("Most first versions use `Search`, or `txtSearch.Text in Title`. Both work in testing. Neither is delegated to SharePoint, so once the list passes the data row limit, Power Apps searches only the first 500 items, or up to 10,000 if you raise the limit, and quietly misses the rest."),
      table(
        ["In the gallery's formula", "Sent to SharePoint?"],
        ["`StartsWith(Title, txtSearch.Text)`", "Yes, for text columns"],
        ["`Search(Requests, txtSearch.Text, Title)` or `in`", "No"],
        ["`=` on text, numbers, dates, yes/no, and a choice's `.Value`", "Yes"],
        ["`<`, `>`, `>=` on numbers and dates", "Yes"],
        ["Conditions joined with `&&` or `||`", "Yes"],
        ["`Not` or `!` on a column", "No"],
        ["`IsBlank` on a column", "No. `Column = Blank()` is"],
        ["`Sort` by a date, number or text column", "Yes"],
        ["`Sort` by a choice, person or lookup column", "No"]
      ),
      p("The table follows Microsoft's SharePoint delegation list. For the full background, read [Power Apps delegation warning explained](/guides/power-apps-delegation-warning-explained).")
    ),
    section(
      "controls",
      "Step 1: Set up the controls",
      ol(
        "On `txtSearch`, set **DelayOutput** to `true`. The gallery then waits until the user pauses typing, instead of reloading on every key.",
        "On `cmbStatus`, set **Items** to `Choices(Requests.Status)` and turn off **SelectMultiple**. A combo box starts empty and the user can clear it.",
        "If you use a drop-down instead of a combo box, set **AllowEmptySelection** to `true`. Otherwise a drop-down always has a value selected, and the filter can never show everything.",
        "Leave `tglMyItems` off by default, and leave both date pickers empty by clearing their **DefaultDate**."
      )
    ),
    section(
      "search",
      "Step 2: The search box",
      p("Set the gallery's **Items** to a Filter with StartsWith. An empty search box matches every item, so no extra check is needed."),
      code(`Filter(
    Requests,
    StartsWith(Title, txtSearch.Text) || StartsWith('Request Number', txtSearch.Text)
)`),
      note("StartsWith matches the start of the column only. Searching \"inv\" finds \"Invoice 42\" but not \"Late invoice\". That's the trade for searching the whole list. If users need to match words in the middle, keep a short search column, such as a keywords column the app fills, or move the data to Dataverse, where Search is delegated.")
    ),
    section(
      "filters",
      "Step 3: Filters that switch off when empty",
      p("Add one condition per control. Each starts with a test on the control, then `||`, then the real comparison. While the control is empty that test is true for every item, so the condition lets everything through. The test doesn't depend on the item, so it doesn't stop the rest from being sent to SharePoint."),
      code(`Filter(
    Requests,
    (StartsWith(Title, txtSearch.Text) || StartsWith('Request Number', txtSearch.Text)) &&
    (IsBlank(cmbStatus.Selected.Value) || Status.Value = cmbStatus.Selected.Value) &&
    (tglMyItems.Value = false || 'Assigned To'.Email = User().Email) &&
    (IsBlank(dpFrom.SelectedDate) || Created >= dpFrom.SelectedDate) &&
    (IsBlank(dpTo.SelectedDate) || Created < DateAdd(dpTo.SelectedDate, 1, TimeUnit.Days))
)`),
      ul(
        "**Choice column:** compare `Status.Value`, the text inside the choice.",
        "**Person column:** SharePoint delegates only `Email` and `DisplayName` on a person. Compare the email.",
        "**My items toggle:** write `tglMyItems.Value = false`, not `!tglMyItems.Value`. Both work here, because the toggle isn't a column, but the delegation checker flags `!` inside a filter, so the first form keeps the formula clean to check.",
        "**Date range:** the end date adds one day and uses `<`, so items created any time on the last day are included."
      ),
      p("Don't wrap each filter in `If(IsBlank(...), Requests, Filter(...))`. That grows into a formula with a branch for every combination of filters, and is hard to change.")
    ),
    section(
      "sort",
      "Step 4: Sort the results",
      p("Wrap the Filter in Sort. Use a date, number or text column. Sorting by a choice, person or lookup column isn't delegated to SharePoint."),
      code(`Sort(
    Filter(
        Requests,
        StartsWith(Title, txtSearch.Text) &&
        (IsBlank(cmbStatus.Selected.Value) || Status.Value = cmbStatus.Selected.Value)
    ),
    Created,
    SortOrder.Descending
)`)
    ),
    section(
      "clear-and-empty",
      "Step 5: A clear button and an empty message",
      p("Set `btnClear.OnSelect` to reset every control to its default."),
      code(`Reset(txtSearch);
Reset(cmbStatus);
Reset(tglMyItems);
Reset(dpFrom);
Reset(dpTo)`),
      p("Add a label inside the screen, over the gallery, with **Text** set to \"No requests match these filters.\" and **Visible** set to `IsEmpty(galRequests.AllItems)`."),
      note("Don't show a total with CountRows on the list. It isn't delegated to SharePoint, so the number stops at the data row limit. `CountRows(galRequests.AllItems)` counts only the items the gallery has loaded so far.")
    ),
    section(
      "test",
      "Step 6: Check it before users find out",
      ol(
        "Look for a delegation warning, a blue underline, on the gallery's Items in Studio. There should be none.",
        "Paste the formula into the [delegation checker](/tools/power-apps-delegation-checker) with SharePoint selected.",
        "Test with a list over 500 items, or temporarily lower the data row limit in **Settings** to a small number, such as 5, and check that searching still finds old items. Set it back afterwards."
      ),
      tool("gallery-search-filter-builder", "Build this Items formula for your own list, controls and columns, including the settings for each control.")
    ),
    section(
      "when-to-move",
      "When SharePoint is the wrong place",
      p("This design keeps the whole list searchable, but some needs can't be met on SharePoint while staying delegated: matching words in the middle of a column, sorting by a choice column, or totals across the whole list. If those matter, use Dataverse, where Search, `in` and aggregate functions are delegated, or run the heavy query in a flow and return the result.")
    )
  ],
  faqs: [
    { question: "How do I search a SharePoint list in Power Apps without a delegation warning?", answer: "Use Filter with StartsWith on a text column, for example Filter(Requests, StartsWith(Title, txtSearch.Text)). Search and the in operator aren't delegated to SharePoint." },
    { question: "How do I make a gallery filter show all items when the dropdown is empty?", answer: "Start the condition with a test on the control, such as IsBlank(cmbStatus.Selected.Value) || Status.Value = cmbStatus.Selected.Value. While nothing is selected the first part is true, so every item passes. A drop-down needs AllowEmptySelection set to true." },
    { question: "Can I combine several filters and a search box in one gallery?", answer: "Yes. Join the conditions with && inside one Filter. SharePoint can run conditions joined with And and Or, as long as each condition is delegable on its own." },
    { question: "Why can't I sort my gallery by a choice column?", answer: "SharePoint doesn't delegate sorting on choice, person or lookup columns. Sort by a date, number or text column, or keep a text copy of the choice in another column." },
    { question: "Does this work with more than 2,000 items?", answer: "Yes. Every part of the formula is delegated, so SharePoint filters the whole list and the gallery loads results in pages as the user scrolls." }
  ],
  relatedTools: ["gallery-search-filter-builder", "power-apps-delegation-checker", "power-fx-formatter"],
  relatedPatterns: ["power-apps-search-with-multiple-fields", "avoid-delegation-warnings-sharepoint-filters", "delegation-safe-date-range-filter", "power-apps-empty-state-gallery", "sort-gallery-by-column-header-power-apps"],
  relatedLinks: [
    { href: "/guides/power-fx-lookup-vs-filter-vs-search", label: "LookUp vs Filter vs Search" },
    { href: "/guides/power-apps-delegation-warning-explained", label: "Power Apps delegation warning explained" },
    { href: "/cheat-sheets/power-apps-gallery-filtering-cheat-sheet", label: "Gallery filtering cheat sheet" }
  ],
  sources: [
    canvasDoc("connections/connection-sharepoint-online", "Connect to SharePoint from a canvas app: delegable functions"),
    canvasDoc("delegation-overview", "Understand delegation in a canvas app"),
    powerFxDoc("reference/function-filter-lookup", "Filter, Search and LookUp functions"),
    powerFxDoc("reference/function-sort", "Sort and SortByColumns functions"),
    canvasDoc("controls/control-text-input", "Text input control: DelayOutput"),
    canvasDoc("controls/control-drop-down", "Drop down control: AllowEmptySelection")
  ]
};
