import { canvasDoc, code, note, ol, p, section, table, tool, ul, type Guide } from "./types";

// A walk-through that chains three tools. The formulas and the findings quoted below are what
// lib/tools/gallery-filter.ts and lib/tools/delegation-check.ts produce for these inputs, so keep
// them in step if either tool changes.

const published = "2026-11-28";

const builtFormula = `Sort(
    Filter(
        'Equipment Requests',
        StartsWith(Title, txtSearch.Text) &&
        (IsBlank(cmbStatus.Selected.Value) || Status.Value = cmbStatus.Selected.Value) &&
        (tglMine.Value = false || 'Requested By'.Email = User().Email) &&
        (IsBlank(dpFrom.SelectedDate) || Created >= dpFrom.SelectedDate) &&
        (IsBlank(dpTo.SelectedDate) || Created < DateAdd(dpTo.SelectedDate, 1, TimeUnit.Days))
    ),
    Created,
    SortOrder.Descending
)`;

const editedFormula = `Sort(
    Filter(
        'Equipment Requests',
        txtSearch.Text in Title &&
        (IsBlank(cmbStatus.Selected.Value) || Status.Value = cmbStatus.Selected.Value) &&
        (tglMine.Value = false || 'Requested By'.Email = User().Email) &&
        Year(Created) = Year(Today())
    ),
    Created,
    SortOrder.Descending
)`;

const fixedFormula = `Sort(
    Filter(
        'Equipment Requests',
        StartsWith(Title, txtSearch.Text) &&
        (IsBlank(cmbStatus.Selected.Value) || Status.Value = cmbStatus.Selected.Value) &&
        (tglMine.Value = false || 'Requested By'.Email = User().Email) &&
        Created >= Date(Year(Today()), 1, 1)
    ),
    Created,
    SortOrder.Descending
)`;

export const galleryToolsWorkedExample: Guide = {
  slug: "worked-example-gallery-formula-builder-formatter-delegation-checker",
  title: "Worked example: build a gallery formula, check it, and catch a delegation problem before release",
  shortTitle: "Worked example: build and check a gallery formula",
  description: "One SharePoint gallery from start to finish: write the Items formula with the gallery builder, read and check it in the Power Fx formatter, then use the delegation checker to catch and fix the two changes that would have quietly broken it on a large list.",
  eyebrow: "Power Fx how-to",
  keywords: [
    "Power Apps gallery filter formula example",
    "check Power Apps formula delegation",
    "Power Apps SharePoint gallery search example",
    "Power Apps delegation warning gallery fix",
    "Power Fx formatter delegation check"
  ],
  published,
  updated: published,
  quickAnswer: "Generate the gallery's Items formula with the gallery search and filter builder, open it in the Power Fx formatter with the button under the result, and check the Delegation tab with SharePoint list picked. Do the same every time someone edits the formula. In this example a later edit added txtSearch.Text in Title and Year(Created) = Year(Today()). Both work on a small test list, and neither is delegated to SharePoint. The fix is StartsWith for the search and Created >= Date(Year(Today()), 1, 1) for the year.",
  sections: [
    section(
      "the-app",
      "The app",
      p("An IT team tracks equipment requests in a SharePoint list called **Equipment Requests**. It has a **Title** text column, a **Status** choice column, a **Requested By** person column and the built-in **Created** date. The list has a few thousand items, well past the 500-item data row limit, so anything SharePoint can't run would only look at the first 500."),
      p("The browse screen has these controls above a gallery named `galRequests`:"),
      table(
        ["Control", "Name", "What it does"],
        ["Text input", "`txtSearch`", "Search the title"],
        ["Combo box", "`cmbStatus`", "Show one status, or all when empty"],
        ["Toggle", "`tglMine`", "Show only my requests"],
        ["Two date pickers", "`dpFrom`, `dpTo`", "Show requests created in a date range"]
      )
    ),
    section(
      "build",
      "Step 1: write the formula with the gallery builder",
      tool("gallery-search-filter-builder", "Describe the search box and filters, pick the data source, and get a delegable Items formula plus the settings for each control."),
      p("In the builder, set these options:"),
      ul(
        "**Data source type:** SharePoint. **List name:** `Equipment Requests`. **Sort by column:** `Created`, newest first.",
        "**Search box:** `txtSearch`, searching the `Title` column.",
        "**Filter 1:** Choice column, from a dropdown. Column `Status`, control `cmbStatus`.",
        "**Filter 2:** Person, only my items. Column `Requested By`, toggle `tglMine`.",
        "**Filter 3:** Date column, between two date pickers. Column `Created`, from `dpFrom` to `dpTo`."
      ),
      p("The builder writes this for the gallery's **Items** property:"),
      code(builtFormula, "galRequests.Items"),
      p("It also gives the settings for the controls:"),
      code(`txtSearch.DelayOutput: true
cmbStatus.Items: Choices('Equipment Requests'.Status)`, "Control settings"),
      p("Each filter starts with a check on its control, such as `IsBlank(cmbStatus.Selected.Value) || ...`, so an empty control shows every item. Those checks don't depend on the row, so SharePoint still runs the whole formula. The builder's notes also explain why the search uses `StartsWith`: SharePoint can't run `Search` or the `in` operator, so the search matches the start of the title. Searching \"lap\" finds \"Laptop for new starter\" but not \"Replacement laptop\".")
    ),
    section(
      "check",
      "Step 2: read and check it in the formatter",
      p("Under the formula, choose **Check it in the Power Fx formatter**. The formatter opens with the formula already filled in. Nothing is sent to a server: the formula travels in the part of the link after the #, which browsers don't send."),
      tool("power-fx-formatter", "Format a formula, then read the Review, Delegation and Explain tabs underneath it."),
      ol(
        "Set **Data source** to SharePoint list, because delegation depends on the source.",
        "Open the **Delegation** tab. For this formula it reports no delegation problems for SharePoint list.",
        "Open the **Explain** tab and read the plain-English version. It is a quick check that the formula does what the screen promises, and it is handy to paste into the app's handover notes.",
        "Paste the formatted formula into the gallery's Items property in Power Apps Studio and confirm there is no yellow warning triangle."
      )
    ),
    section(
      "change",
      "Step 3: three months later, someone edits it",
      p("The team asks for two changes. Search should find a word anywhere in the title, and the date pickers should go, with the gallery showing only this year's requests. A maker makes the edit in Studio:"),
      code(editedFormula, "The edited Items formula"),
      p("It works when they test it, because the test copy of the list has 40 items. In production it would quietly search and filter only the first 500 items it downloads, so older matches and most of this year's requests would be missing with no error. Studio does show a delegation warning, but a yellow triangle on a formula that has just passed testing is easy to wave through.")
    ),
    section(
      "catch",
      "Step 4: catch it before it ships",
      p("Paste the edited formula into the formatter, with SharePoint list still picked, before publishing. The Delegation tab now lists two problems:"),
      table(
        ["Finding", "Suggested fix"],
        ["Year() inside Filter is not delegated to SharePoint list", "Compare the date column with a start and end date instead, such as `Created >= dStart && Created < dEnd`."],
        ["The \"in\" operator inside Filter is not delegated to SharePoint list", "Use `StartsWith`, or compare with `=` against each value joined with `||`."]
      ),
      p("To see the whole picture for the data source, paste the same formula into the delegation checker. It gives the same findings and lists what each source can run. The table answers the obvious next question: `in` and `Search` are delegated to Dataverse and SQL Server but not to SharePoint, while `Year` on a column isn't delegated to any of them."),
      tool("power-apps-delegation-checker", "Paste a formula, pick SharePoint, Dataverse, SQL Server or Excel, and see each part that won't run on the data source, with a fix.")
    ),
    section(
      "fix",
      "Step 5: fix it",
      p("The year filter has a delegable form. Move the date work off the column and compare `Created` with the first day of the year. `Year(Today())` is fine, because it doesn't involve a column:"),
      code(fixedFormula, "The fixed Items formula"),
      p("The contains search doesn't. On SharePoint there are two honest answers:"),
      ul(
        "Keep `StartsWith`, and set the search box's **HintText** to something like \"Search by the start of the title\" so users know how it works.",
        "If finding a word anywhere really matters, move the list to Dataverse. In the gallery builder, change **Data source type** to Dataverse and it writes a `Search` version instead, which Dataverse can run on the whole table."
      ),
      p("The team kept `StartsWith`. Pasting the fixed formula back into the formatter shows no delegation problems for SharePoint list again.")
    ),
    section(
      "test",
      "Step 6: prove it on the real list",
      p("The tools read the formula, not your data, so finish with Microsoft's own check. In Studio, open **Settings**, **General**, set **Data row limit** to 1 and use the screen. Anything delegated still returns the right items, and anything that isn't now returns at most one, which is hard to miss. Set the limit back to 500 when you are done."),
      note("Do this before each release, not just the first one. In this example the formula was correct on day one and broken by a reasonable change months later.")
    ),
    section(
      "which-tool",
      "What each tool is for",
      table(
        ["Tool", "Use it to", "It won't"],
        ["[Gallery search and filter builder](/tools/gallery-search-filter-builder)", "Write the first version of a search and filter formula, already delegable for your source", "Know about columns or rules you didn't describe to it"],
        ["[Power Fx formatter](/tools/power-fx-formatter)", "Make any formula readable, and get a quick delegation check while you edit", "See your column types, which also affect delegation"],
        ["[Delegation checker](/tools/power-apps-delegation-checker)", "See everything a data source can and can't run, with a fix for each problem", "Replace the warnings in Studio or the data row limit test"]
      )
    )
  ],
  faqs: [
    {
      question: "Why did the edited formula work in testing?",
      answer: "The test list had fewer items than the data row limit, so Power Apps downloaded every item and filtered them in the app. The same formula on a list past the limit only looks at the first 500 items, or up to 10,000 if the limit is raised, and leaves the rest out without an error."
    },
    {
      question: "How do I filter a SharePoint gallery to this year without a delegation warning?",
      answer: "Compare the date column with the first day of the year, for example Created >= Date(Year(Today()), 1, 1). Year(Today()) is fine because it doesn't involve a column. Year(Created) isn't delegated, because a function is applied to the column."
    },
    {
      question: "Can I search for a word anywhere in a SharePoint column without delegation problems?",
      answer: "Not on a large list. SharePoint can't run Search or the in operator, only StartsWith, which matches the start of the text. If you need a contains search over many items, Dataverse and SQL Server can run Search."
    },
    {
      question: "Does the formatter send my formula anywhere?",
      answer: "No. The formatter and the delegation check run in your browser. A link from another tool carries the formula after the # in the address, which browsers don't send to the server."
    }
  ],
  relatedTools: ["gallery-search-filter-builder", "power-fx-formatter", "power-apps-delegation-checker"],
  relatedPatterns: ["avoid-delegation-warnings-sharepoint-filters", "delegation-safe-date-range-filter", "power-apps-search-with-multiple-fields"],
  relatedLinks: [
    { href: "/guides/power-apps-searchable-filterable-gallery-sharepoint", label: "Build a searchable, filterable gallery on SharePoint" },
    { href: "/guides/power-apps-delegation-sharepoint", label: "Delegation with SharePoint lists" },
    { href: "/guides/power-apps-delegation-warning-explained", label: "What a delegation warning means" }
  ],
  sources: [
    canvasDoc("delegation-overview", "Understand delegation in a canvas app"),
    canvasDoc("connections/connection-sharepoint-online", "Connect to SharePoint from a canvas app (delegable functions)")
  ]
};
