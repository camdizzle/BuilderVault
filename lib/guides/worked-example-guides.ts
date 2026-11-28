import { automateDoc, canvasDoc, code, learnDoc, note, ol, p, powerFxDoc, section, table, tool, ul, type Guide } from "./types";

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
  eyebrow: "Worked examples",
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

// Patch builder, formatter and error message finder. The formula is what lib/tools/patch-builder.ts
// writes for these inputs.

const builtPatch = `IfError(
    Patch(
        'Equipment Requests',
        Defaults('Equipment Requests'),
        {
            Title: txtTitle.Text,
            Status: { Value: "Submitted" },
            'Requested By': {
                Claims: "i:0#.f|membership|" & Lower(User().Email),
                DisplayName: User().FullName,
                Email: Lower(User().Email),
                Department: "",
                JobTitle: "",
                Picture: ""
            },
            Quantity: Value(txtQuantity.Text),
            'Needed By': dpNeededBy.SelectedDate,
            Department: { Id: cmbDepartment.Selected.ID, Value: cmbDepartment.Selected.Title }
        }
    ),
    Notify("The record could not be saved: " & FirstError.Message, NotificationType.Error),
    Notify("Saved.", NotificationType.Success);
    Reset(txtTitle);
    Reset(txtQuantity);
    Reset(dpNeededBy);
    Reset(cmbDepartment)
)`;

export const patchToolsWorkedExample: Guide = {
  slug: "worked-example-patch-formula-builder-error-finder",
  title: "Worked example: write a Patch formula, then find and fix the error when someone adds a column",
  shortTitle: "Worked example: write and fix a Patch formula",
  description: "One save button from start to finish: write the Patch formula with the Patch builder, check it in the Power Fx formatter, then use the error message finder to fix the invalid argument error a later edit causes.",
  eyebrow: "Worked examples",
  keywords: [
    "Power Apps Patch example SharePoint",
    "The function Patch has some invalid arguments",
    "Patch choice column Power Apps example",
    "expected type Record found type Text Patch",
    "Power Apps save button formula"
  ],
  published,
  updated: published,
  quickAnswer: "Generate the save formula with the Patch formula builder, which gives choice, person and lookup columns the record shape SharePoint needs. When a later edit adds Priority: drpPriority.Selected.Value, Studio reports that the function Patch has some invalid arguments, because a choice column needs a record, not text. Paste the inner message into the error message finder to get the fix, then add the column in the builder, which writes Priority: { Value: drpPriority.Selected.Value }.",
  sections: [
    section(
      "the-app",
      "The app",
      p("The same IT team now wants a screen for raising a request. It saves to the **Equipment Requests** list, which has these columns:"),
      table(
        ["Column", "Type", "Comes from"],
        ["Title", "Single line of text", "`txtTitle`"],
        ["Status", "Choice", "Always \"Submitted\" for a new request"],
        ["Requested By", "Person", "The signed-in user"],
        ["Quantity", "Number", "`txtQuantity`"],
        ["Needed By", "Date", "`dpNeededBy`"],
        ["Department", "Lookup to a Departments list", "`cmbDepartment`, with its Items set to `Departments`"]
      ),
      p("Choice, person and lookup columns each need a record with particular fields, which is where most hand-written Patch formulas go wrong.")
    ),
    section(
      "build",
      "Step 1: write the formula with the Patch builder",
      tool("patch-formula-builder", "Pick the list, the columns and the controls they come from, and get a Patch formula with the right shape for each column type."),
      ul(
        "**Data source type:** SharePoint. **List name:** `Equipment Requests`. **What the formula does:** Create a new record.",
        "Add a row per column with its type: Title as Text from `txtTitle`, Status as Choice with the value `\"Submitted\"`, Requested By as Person with the value `me`, Quantity as Number from `txtQuantity`, Needed By as Date from `dpNeededBy`, and Department as Lookup from `cmbDepartment`.",
        "Leave **Show the reason if the save fails** and **Clear the controls after saving** turned on."
      ),
      p("The builder writes this for the save button's **OnSelect**:"),
      code(builtPatch, "btnSave.OnSelect"),
      p("Note the shapes: the choice is `{ Value: \"Submitted\" }`, the person is a full record built from `User()`, and the lookup is `{ Id: ..., Value: ... }`. `IfError` shows SharePoint's own reason if the save fails, such as a required column, and the success branch only runs when it worked.")
    ),
    section(
      "check",
      "Step 2: check it in the formatter",
      p("Choose **Check it in the Power Fx formatter** under the formula. Read the **Explain** tab to confirm what the button does, then paste the formula into the button's OnSelect in Studio. Test it once with every control filled in and once with Needed By left empty, so you know what a blank date does to your list.")
    ),
    section(
      "change",
      "Step 3: someone adds a column",
      p("A month later the team adds a **Priority** choice column to the list and a dropdown, `drpPriority`, with its Items set to `Choices('Equipment Requests'.Priority)`. A maker adds one line to the record:"),
      code(`Priority: drpPriority.Selected.Value`, "The new line"),
      p("Studio underlines `Patch` and reports **The function 'Patch' has some invalid arguments**. That message never says which argument. Hovering over the smaller underline inside the brackets shows the specific one:"),
      code(`The type of this argument 'Priority' does not match the expected type 'Record'. Found type 'Text'.`, "The inner message")
    ),
    section(
      "find",
      "Step 4: look the message up",
      tool("error-message-finder", "Paste an error message exactly as Power Apps or Power Automate shows it, and get the page that explains the fix."),
      p("Paste the inner message into the error message finder. It matches the page for **The function 'Patch' has some invalid arguments**, which has a table of the inner messages and their causes. This one is the first row: a choice, lookup or person column given text when it needs a record. The page's fix is to give each column the shape it needs, and its **Fix it with** links go back to the Patch builder.")
    ),
    section(
      "fix",
      "Step 5: fix it",
      p("Either correct the line by hand or add a Priority row to the builder as a Choice column from `drpPriority`. The builder writes:"),
      code(`Priority: { Value: drpPriority.Selected.Value }`, "The corrected line"),
      p("Because `drpPriority` lists `Choices('Equipment Requests'.Priority)`, `drpPriority.Selected` is already a record of the right shape, so `Priority: drpPriority.Selected` also works. The underline goes away, and the save works again."),
      note("Rebuilding the whole formula in the builder, rather than editing one line, is often quicker once a save formula has more than a few columns. The builder remembers what you entered last time in this browser, so adding a column is one more row.")
    ),
    section(
      "which-tool",
      "What each tool is for",
      table(
        ["Tool", "Use it to", "It won't"],
        ["[Patch formula builder](/tools/patch-formula-builder)", "Write a save formula with the right record shape for each column type", "Know your column types unless you pick them"],
        ["[Power Fx formatter](/tools/power-fx-formatter)", "Lay the formula out one column per line and explain it in plain English", "Check it against your list's columns"],
        ["[Error message finder](/tools/error-message-finder)", "Turn an error message into the page with the cause and the fix", "Read the error from Studio for you. Paste the inner message, not just the one on Patch"]
      )
    )
  ],
  faqs: [
    {
      question: "How do I find which Patch argument is invalid?",
      answer: "Hover over the smaller red underline inside the Patch brackets, not the one on the word Patch. It names the column and the type it expected. If you can't find it, remove columns from the record one at a time until the error clears."
    },
    {
      question: "How do I Patch a SharePoint choice column from a dropdown?",
      answer: "Give it a record with a Value field, such as Priority: { Value: drpPriority.Selected.Value }. If the dropdown's Items are Choices('Equipment Requests'.Priority), drpPriority.Selected is already that record and works too."
    },
    {
      question: "Why use IfError around Patch?",
      answer: "Without it, a failed save can go unnoticed, or the success message runs anyway. IfError shows SharePoint's own reason, such as a required column, and only runs the success steps when the save worked."
    }
  ],
  relatedTools: ["patch-formula-builder", "power-fx-formatter", "error-message-finder"],
  relatedPatterns: ["patch-sharepoint-choice-field", "patch-sharepoint-people-picker-power-apps", "power-apps-error-handling-iferror-patch"],
  relatedLinks: [
    { href: "/errors/function-patch-has-some-invalid-arguments", label: "Error: The function 'Patch' has some invalid arguments" },
    { href: "/cheat-sheets/patch-sharepoint-columns-cheat-sheet", label: "Patch SharePoint columns cheat sheet" },
    { href: "/guides/worked-example-gallery-formula-builder-formatter-delegation-checker", label: "Worked example: build and check a gallery formula" }
  ],
  sources: [
    powerFxDoc("reference/function-patch", "Patch function"),
    canvasDoc("connections/connection-sharepoint-online", "Connect to SharePoint from a canvas app")
  ]
};

// Recurrence planner, filter query builder and date format tester. The trigger, filter and expression
// are what lib/tools/recurrence.ts, odata-filter.ts and date-format.ts produce for these inputs.

export const reminderFlowWorkedExample: Guide = {
  slug: "worked-example-overdue-reminder-flow-schedule-filter-dates",
  title: "Worked example: a weekday reminder flow for overdue items, with the schedule, filter and dates checked",
  shortTitle: "Worked example: an overdue reminder flow",
  description: "Build a flow that emails the requester of every overdue SharePoint item at 8 AM on weekdays. Plan the schedule with the recurrence planner, write the Get items filter with the filter query builder, and format the due date with the date format tester, catching the three mistakes that usually slip through.",
  eyebrow: "Worked examples",
  keywords: [
    "Power Automate overdue reminder flow",
    "Power Automate recurrence weekdays time zone",
    "Get items filter query date less than today",
    "formatDateTime due date email Power Automate",
    "Power Automate recurrence runs at wrong time"
  ],
  published,
  updated: published,
  quickAnswer: "Use a Recurrence trigger set to Week, Monday to Friday, at 8:00, with both a time zone and a start time, because the time zone is ignored without a start time and the flow runs at 8:00 UTC. In Get items, filter with DueDate lt '@{utcNow('yyyy-MM-dd')}' and Status ne 'Closed', and set Top Count or turn on Pagination, because Get items returns only 100 items by default. Format the date in the email with formatDateTime(items('Apply_to_each')?['DueDate'], 'dd MMM yyyy').",
  sections: [
    section(
      "the-flow",
      "The flow",
      p("The IT team wants a reminder email at 8:00 AM New York time every weekday, to the person who raised each equipment request that is past its due date and not closed. The list has a **DueDate** date column, a **Status** choice column and a **RequestedBy** person column. Those are the internal names, because the columns were created without spaces."),
      ol(
        "**Recurrence** trigger: weekdays at 8:00.",
        "**Get items** on Equipment Requests, with a Filter Query for overdue, open items.",
        "**Apply to each** over the items, with **Send an email (V2)** to the requester, showing the due date."
      )
    ),
    section(
      "schedule",
      "Step 1: plan the schedule",
      tool("recurrence-schedule-planner", "Set the frequency, days, hours and time zone, and see the next 10 runs in your time zone before you save the flow."),
      p("In the recurrence planner, set **Frequency** to Week, **Interval** to 1, the days to Monday to Friday, the hour to 8 and the minute to 0, and **Time zone** to Eastern Time. Leave the start time empty, as most people do in the flow designer."),
      p("The planner warns that a time zone only applies when you also set a start time, and its list of next runs shows 08:00 UTC, which is 3:00 AM in New York in winter. Microsoft's documentation for the Recurrence trigger says the same: the time zone applies only when you specify a start time."),
      p("Set **Start time** to a date that has already passed, such as `2026-11-23T08:00`. The runs now show 08:00 in New York, which is 13:00 UTC in winter. The trigger as it appears in Peek code:"),
      code(`{
  "type": "Recurrence",
  "recurrence": {
    "frequency": "Week",
    "interval": 1,
    "schedule": {
      "hours": [8],
      "minutes": [0],
      "weekDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    "startTime": "2026-11-23T08:00:00",
    "timeZone": "Eastern Standard Time"
  }
}`, "Recurrence trigger"),
      note("With a time zone set, the run time follows daylight saving time, so the email keeps arriving at 8:00 local time all year.")
    ),
    section(
      "filter",
      "Step 2: filter the items in SharePoint",
      tool("odata-filter-query-builder", "Pick SharePoint or Dataverse, add conditions with the column's internal name, and get Filter Query text with the quotes in the right place."),
      p("Filtering in Get items means SharePoint sends only the overdue items, instead of the flow loading every item and checking each one. In the filter query builder, set **Action** to SharePoint: Get items and add two conditions:"),
      ul(
        "`DueDate`, Date and time, less than, with the value `@{utcNow('yyyy-MM-dd')}`.",
        "`Status`, Choice, does not equal, `Closed`."
      ),
      code(`DueDate lt '@{utcNow('yyyy-MM-dd')}' and Status ne 'Closed'`, "Filter Query"),
      p("Add **Order By** `DueDate` ascending so the oldest come first. The builder then notes that with **Top Count** empty, Get items returns the first 100 items only. If more than 100 items could be overdue, set Top Count, or turn on **Pagination** in the action's settings with a threshold above the number you expect.")
    ),
    section(
      "dates",
      "Step 3: show the due date the way people read it",
      tool("date-format-tester", "Type a format string, see it on a sample date, and copy the matching Power Automate expression."),
      p("Put `dd MMM yyyy` in the date format tester and `items('Apply_to_each')?['DueDate']` in the Power Automate value box. A sample date of 20 November 2026 shows as `20 Nov 2026`, and the tester gives the expression to paste into the email body:"),
      code(`formatDateTime(items('Apply_to_each')?['DueDate'], 'dd MMM yyyy')`, "Expression for the email body"),
      p("For a date and time column, such as **Created**, pick the time zone in the tester as well. It then writes a `convertTimeZone` expression, because SharePoint returns times in UTC and a time formatted without converting it will be hours out for people outside UTC.")
    ),
    section(
      "email",
      "Step 4: send the email",
      p("Inside **Apply to each**, set the email's **To** to the requester's address and use the expression in the body:"),
      code(`To:      items('Apply_to_each')?['RequestedBy']?['Email']
Subject: Overdue: @{items('Apply_to_each')?['Title']}
Body:    Your request was due on @{formatDateTime(items('Apply_to_each')?['DueDate'], 'dd MMM yyyy')}.
         Update it or close it in the Equipment Requests list.`, "Send an email (V2)"),
      p("Test it with **Test**, **Manually**, then check the run history. The Get items output shows exactly which items matched, which is quicker than waiting for 8:00.")
    ),
    section(
      "mistakes",
      "The three mistakes this catches",
      table(
        ["Mistake", "What happens", "Which tool shows it"],
        ["Time zone without a start time", "The flow runs at 8:00 UTC, which is the middle of the night in the Americas", "[Recurrence schedule planner](/tools/recurrence-schedule-planner)"],
        ["Get items with no Top Count", "Only the first 100 items are checked, so later overdue items get no reminder", "[Filter query builder](/tools/odata-filter-query-builder)"],
        ["A date or time shown without formatting or conversion", "The email shows a raw ISO value, or a time in UTC", "[Date format tester](/tools/date-format-tester)"]
      )
    )
  ],
  faqs: [
    {
      question: "Why does my Power Automate recurrence run at the wrong time?",
      answer: "The time zone on a Recurrence trigger only applies when a start time is also set. Without one the schedule runs in UTC. Set a start time, such as a date that has already passed at the hour you want, and keep the time zone."
    },
    {
      question: "How do I filter SharePoint items that are overdue in Power Automate?",
      answer: "In Get items, use the Filter Query DueDate lt '@{utcNow('yyyy-MM-dd')}' with the column's internal name. Add and Status ne 'Closed' to leave out closed items."
    },
    {
      question: "Why does Get items only return 100 items?",
      answer: "With Top Count empty, Get items returns the first 100 items. Set Top Count, up to 5,000 per call, or turn on Pagination in the action's settings and set a threshold."
    }
  ],
  relatedTools: ["recurrence-schedule-planner", "odata-filter-query-builder", "date-format-tester"],
  relatedPatterns: ["power-automate-reminder-before-due-date", "power-automate-compose-date-formatting"],
  relatedLinks: [
    { href: "/guides/power-automate-schedule-flow-recurrence", label: "Schedule a flow with Recurrence" },
    { href: "/guides/sharepoint-get-items-filter-query", label: "Get items Filter Query guide" },
    { href: "/guides/power-automate-filter-query-by-date", label: "Filter by date in Power Automate" }
  ],
  sources: [
    learnDoc("azure/connectors/connectors-native-recurrence", "Schedule and run recurring workflows with the Recurrence trigger"),
    automateDoc("run-scheduled-tasks", "Run flows on a schedule")
  ]
};
