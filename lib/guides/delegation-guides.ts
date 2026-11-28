import { canvasDoc, code, note, ol, p, section, table, tool, ul, type Guide } from "./types";

// One delegation guide per data source. The formatter's Delegation tab and the delegation
// checker link here, so keep the facts in step with lib/tools/delegation-check.ts.

const published = "2026-11-28";

const rowLimitTest = section(
  "test-it",
  "Test it with a data row limit of 1",
  p("A formula can look fine with test data and still be cut short in production. Microsoft's suggested check takes a minute:"),
  ol(
    "In Power Apps Studio, open **Settings**, **General** and set **Data row limit** to 1.",
    "Use each screen. Anything delegated still works, because the data source does the work.",
    "Anything not delegated now returns at most one row, which is easy to spot.",
    "Fix what broke, then set the limit back (500 is the default)."
  ),
  p("This also finds the cases that show no warning, such as a table you stored in a variable or collection before filtering it.")
);

const sharedFaqLimit = {
  question: "Does raising the data row limit fix delegation?",
  answer: "No. The limit is 500 rows by default and can be raised to 10,000, but that only moves the point where results go missing, and every non-delegated query downloads more rows and gets slower. Change the formula so the data source can run it."
};

export const sharePointDelegationGuide: Guide = {
  slug: "power-apps-delegation-sharepoint",
  title: "Power Apps delegation with SharePoint lists: what works and what to use instead",
  shortTitle: "Delegation with SharePoint",
  description: "Which Power Fx functions and operators SharePoint can delegate, by column type, with delegable replacements for Search, in, Not, IsBlank and counts, and how person, choice and lookup columns behave.",
  eyebrow: "Delegation by data source",
  keywords: ["Power Apps delegation SharePoint", "SharePoint delegable functions", "SharePoint delegation warning", "Power Apps SharePoint 500 items"],
  published,
  updated: published,
  quickAnswer: "SharePoint can run Filter, LookUp, Sort and SortByColumns, the = operator on every column type, <, >, <=, >= and <> on number and date columns, StartsWith on text columns, and conditions joined with And and Or. It cannot run Search, the in operator, Not, IsBlank, <> on text, CountRows, Sum or any function wrapped around a column. Replace Search and in with StartsWith, Not with = against the values you want, and IsBlank(Column) with Column = Blank().",
  sections: [
    section(
      "what-delegates",
      "What SharePoint can delegate",
      p("Delegation means SharePoint runs the query and sends back only the matching items. When part of a formula can't be delegated, Power Apps downloads the first items up to the data row limit (500 by default) and works on those, so results on a large list are quietly incomplete."),
      p("Microsoft's table for SharePoint, by the type of the column you compare:"),
      table(
        ["Function or operator", "Number", "Text", "Yes/No", "Date"],
        ["`Filter`, `LookUp`", "Yes", "Yes", "Yes", "Yes"],
        ["`=`", "Yes", "Yes", "Yes", "Yes"],
        ["`<`, `<=`, `>`, `>=`, `<>`", "Yes (not the ID column)", "No", "No", "Yes"],
        ["`StartsWith`", "-", "Yes", "-", "-"],
        ["`Sort`, `SortByColumns`", "Yes", "Yes", "Yes", "Yes"],
        ["`IsBlank`", "-", "No", "-", "-"]
      ),
      p("Conditions joined with `And` (`&&`) and `Or` (`||`) are delegated. `Not` (`!`) is not, and `<>` is not delegated on text, so \"is not Closed\" has to be written as the values you do want."),
      tool("power-apps-delegation-checker", "Paste a formula, pick SharePoint list, and see which parts SharePoint can run.")
    ),
    section(
      "not-delegated",
      "What isn't delegated, and what to use instead",
      table(
        ["Not delegated", "Use instead"],
        ["`Search(Requests, txtSearch.Text, Title)`", "`Filter(Requests, StartsWith(Title, txtSearch.Text))`"],
        ["`txtSearch.Text in Title`", "`StartsWith(Title, txtSearch.Text)`"],
        ["`Not(Status.Value = \"Closed\")` or `Status.Value <> \"Closed\"`", "Name the values you want: `Status.Value = \"Open\" || Status.Value = \"In progress\"`"],
        ["`IsBlank(DueDate)`", "`DueDate = Blank()`"],
        ["`Lower(Title) = \"laptop\"`", "Compare the column as it is: `Title = \"Laptop\"`"],
        ["`Year(Created) = 2026`", "`Created >= Date(2026, 1, 1) && Created < Date(2027, 1, 1)`"]
      ),
      p("`StartsWith` only matches the beginning of the text, so tell users the search box works that way. If you need a true contains search over a large list, that is a reason to move the data to Dataverse."),
      code(`// Delegable search box on a SharePoint list
Filter(
    Requests,
    IsBlank(txtSearch.Text) || StartsWith(Title, txtSearch.Text),
    Status.Value = "Open" || Status.Value = "In progress"
)`, "Search box that SharePoint can run"),
      p("`IsBlank(txtSearch.Text)` is fine here because it checks a control, not a column. Only functions applied to a column break delegation.")
    ),
    section(
      "complex-columns",
      "Person, choice and lookup columns",
      p("For a person, choice or lookup column, SharePoint decides by the part of the column you use, such as `Status.Value` or `AssignedTo.Email`. The rules above then apply to that part."),
      ul(
        "**Person columns:** only `Email` and `DisplayName` can be delegated. `Filter(Requests, AssignedTo.Email = User().Email)` works.",
        "**Choice and lookup columns:** `=` works on the value, such as `Status.Value = \"Open\"`, but `StartsWith` on a choice or lookup value is not delegated.",
        "**Sorting:** `Sort` and `SortByColumns` are not delegated on person, choice or lookup columns. Sort by a text, number or date column instead."
      ),
      note("If you often filter or sort by a choice value, a plain text column kept in step by a flow, or a Dataverse table, avoids these limits.")
    ),
    section(
      "id-and-blank",
      "The ID column and blank checks",
      ul(
        "**ID:** Power Apps shows ID as a number, but SharePoint stores it as text. Only `ID = value` is delegated. `ID > 100` is not.",
        "**Blank checks:** `DueDate = Blank()` is delegated, `IsBlank(DueDate)` is not. `DueDate <> Blank()` is not delegated either, so to find items that have a value, filter on something else first.",
        "**System columns:** columns such as Name, Path, ContentType, IsFolder and VersionNumber don't generally delegate. Filter on your own columns."
      )
    ),
    section(
      "counts-and-totals",
      "Counts and totals",
      p("`CountRows`, `CountIf`, `Sum`, `Average`, `Min` and `Max` are not delegated to SharePoint. On a list larger than the row limit they count or add up only the first items, with no error."),
      p("There is no formula that fixes this. The usual answers are a summary list that a flow keeps up to date, a count done in a flow and returned to the app, or a filter that always returns well under the limit before you count.")
    ),
    rowLimitTest
  ],
  faqs: [
    {
      question: "Can SharePoint delegate the Search function?",
      answer: "No. Search is delegated to Dataverse and SQL Server but not to SharePoint lists. Use Filter with StartsWith on a text column instead, which SharePoint can run."
    },
    {
      question: "Why doesn't IsBlank delegate to SharePoint?",
      answer: "SharePoint can't run IsBlank on a column. Write Column = Blank() instead, which it can run. It is not exactly the same, because it doesn't treat an empty string as blank, but it works for most columns. Column <> Blank() is not delegated."
    },
    {
      question: "Can I filter a SharePoint person column without a delegation warning?",
      answer: "Yes, on the Email or DisplayName part, for example Filter(Requests, AssignedTo.Email = User().Email). Other parts of a person column are not delegated."
    },
    {
      question: "Why does ID > 100 give a delegation warning on SharePoint?",
      answer: "SharePoint stores ID as text even though Power Apps shows it as a number, so only the = comparison is delegated on the ID column."
    },
    sharedFaqLimit
  ],
  relatedTools: ["power-apps-delegation-checker", "gallery-search-filter-builder"],
  relatedPatterns: ["avoid-delegation-warnings-sharepoint-filters", "delegation-safe-date-range-filter", "power-apps-search-with-multiple-fields"],
  relatedLinks: [
    { href: "/guides/power-apps-delegation-warning-explained", label: "What a delegation warning means" },
    { href: "/guides/power-apps-searchable-filterable-gallery-sharepoint", label: "Build a searchable SharePoint gallery" },
    { href: "/functions/filter", label: "Filter function reference" }
  ],
  sources: [
    canvasDoc("connections/connection-sharepoint-online", "Connect to SharePoint from a canvas app (delegable functions)"),
    canvasDoc("delegation-overview", "Understand delegation in a canvas app")
  ]
};

export const dataverseDelegationGuide: Guide = {
  slug: "power-apps-delegation-dataverse",
  title: "Power Apps delegation with Dataverse: what works and where the limits are",
  shortTitle: "Delegation with Dataverse",
  description: "Which Power Fx functions Dataverse can delegate, including Search, in, Not and text functions, the limits on choice columns, CountRows and totals, and what still has to run in the app.",
  eyebrow: "Delegation by data source",
  keywords: ["Power Apps delegation Dataverse", "Dataverse delegable functions", "Dataverse CountRows delegation", "Dataverse Search delegation"],
  published,
  updated: published,
  quickAnswer: "Dataverse delegates more than SharePoint or Excel: Filter, LookUp, Search, Sort, First, StartsWith, in, And, Or, Not, IsBlank, and Left, Mid, Right, Upper, Lower, Replace and Substitute on text columns. The limits to know are that choice columns only support = and <>, Trim, Len and Text(column) are not delegated, arithmetic on a column is not delegated, CountRows returns a cached count, and CountIf, Sum, Min, Max and Average work on up to 50,000 rows and not on views.",
  sections: [
    section(
      "what-delegates",
      "What Dataverse can delegate",
      p("Delegation means Dataverse runs the query and sends back only the matching rows. Microsoft's table for Dataverse, by column type:"),
      table(
        ["Function or operator", "Number", "Text", "Choice", "Date", "Guid"],
        ["`Filter`, `LookUp`, `First`", "Yes", "Yes", "Yes", "Yes", "Yes"],
        ["`=`, `<>`", "Yes", "Yes", "Yes", "Yes", "Yes"],
        ["`<`, `<=`, `>`, `>=`", "Yes", "Yes", "No", "Yes", "-"],
        ["`And`, `Or`, `Not`", "Yes", "Yes", "Yes", "Yes", "Yes"],
        ["`in` (is in a list)", "Yes", "Yes", "Yes", "Yes", "Yes"],
        ["`in` (contains text)", "-", "Yes", "-", "-", "-"],
        ["`IsBlank`", "Yes", "Yes", "No", "Yes", "Yes"],
        ["`Search`, `StartsWith`", "-", "Yes", "-", "-", "-"],
        ["`Sort`, `SortByColumns`", "Yes", "Yes", "Yes", "Yes", "-"],
        ["`Sum`, `Min`, `Max`, `Average`", "Yes", "-", "-", "No", "-"]
      ),
      p("On text columns, `Left`, `Mid`, `Right`, `Upper`, `Lower`, `Replace` and `Substitute` are delegated too, so `Filter(Accounts, Lower(Name) = \"contoso\")` works on Dataverse when it would not on SharePoint."),
      tool("power-apps-delegation-checker", "Paste a formula, pick Dataverse, and see which parts Dataverse can run.")
    ),
    section(
      "not-delegated",
      "What isn't delegated",
      table(
        ["Not delegated", "Use instead"],
        ["`Trim(Name)`, `Len(Name)`, `Text(Amount)` on a column", "Clean or convert the value you compare against, or store the cleaned value in its own column"],
        ["`Filter(Orders, Quantity + 10 > 100)`", "Move the arithmetic: `Quantity > 90`"],
        ["`>` or `<` on a choice column", "Compare with `=` against each value you need, joined with `||`, or use a number column for ranges"],
        ["`FirstN(Accounts, 10)`", "`First` is delegated, `FirstN` is not. Filter first so the set is small"],
        ["`IsBlank(Status)` on a choice column", "`Status = Blank()`"]
      ),
      p("Columns that look like numbers in Power Apps but are stored as something else in Dataverse, such as currency, are not delegated in number comparisons."),
      p("`in` checking a list of values is only delegated for columns on the table itself. `Filter(Accounts, Name in [\"A\", \"B\"])` is delegated, but `Filter(Accounts, 'Primary Contact'.'Full Name' in [\"A\", \"B\"])` is not, because the column is on a related table. Membership queries also count toward Dataverse's limit of 15 tables in one query.")
    ),
    section(
      "counts-and-totals",
      "CountRows, CountIf and totals",
      ul(
        "`CountRows` on a whole table returns a cached count, which can be out of date. For an exact count of fewer than 50,000 rows, use `CountIf(Table, true)`.",
        "`CountIf`, `Sum`, `Min`, `Max` and `Average` are delegated for up to 50,000 rows. Use a filter to bring the set under that if needed.",
        "Totals are not delegated on views.",
        "Users need permission to read the rows for the count to be right."
      ),
      code(`// Exact count of large orders, delegated for under 50,000 rows
CountIf(Orders, Amount > 1000)`, "Count that Dataverse runs")
    ),
    section(
      "search",
      "Search and contains filters",
      p("Dataverse can run `Search` and \"contains\" filters on text columns, which makes search boxes much simpler than on SharePoint:"),
      code(`// Both are delegated to Dataverse
Search(Accounts, txtSearch.Text, 'Account Name', 'Main Phone')

Filter(Accounts, txtSearch.Text in 'Account Name')`, "Search box that Dataverse can run")
    ),
    rowLimitTest
  ],
  faqs: [
    {
      question: "Is CountRows delegated to Dataverse?",
      answer: "CountRows on a Dataverse table returns a cached count, which may not be current. For an exact count of fewer than 50,000 rows, use CountIf(Table, true), which Dataverse runs."
    },
    {
      question: "Can Dataverse delegate Search?",
      answer: "Yes. Search is delegated to Dataverse on text columns, and so is the in operator for contains text."
    },
    {
      question: "Why do I get a delegation warning comparing a Dataverse choice column with greater than?",
      answer: "Dataverse only delegates = and <> on choice columns. Compare against each value you need with = joined by ||, or use a number column for ranges."
    },
    {
      question: "Is Not delegated to Dataverse?",
      answer: "Yes. Dataverse delegates And, Or and Not, unlike SharePoint, which does not delegate Not."
    },
    sharedFaqLimit
  ],
  relatedTools: ["power-apps-delegation-checker", "gallery-search-filter-builder"],
  relatedPatterns: ["delegation-safe-date-range-filter", "power-apps-search-with-multiple-fields", "create-a-delegation-review-worksheet"],
  relatedLinks: [
    { href: "/guides/power-apps-delegation-warning-explained", label: "What a delegation warning means" },
    { href: "/functions/countrows", label: "CountRows function reference" },
    { href: "/functions/search", label: "Search function reference" }
  ],
  sources: [
    canvasDoc("connections/connection-common-data-service", "Connect to Microsoft Dataverse (delegable functions)"),
    canvasDoc("delegation-overview", "Understand delegation in a canvas app")
  ]
};

export const sqlDelegationGuide: Guide = {
  slug: "power-apps-delegation-sql-server",
  title: "Power Apps delegation with SQL Server: what works and the gotchas",
  shortTitle: "Delegation with SQL Server",
  description: "Which Power Fx functions SQL Server can delegate, including Search, StartsWith, EndsWith, Len and totals, the argument order rules, IsBlank, char columns, and date filters through an on-premises gateway.",
  eyebrow: "Delegation by data source",
  keywords: ["Power Apps delegation SQL Server", "SQL Server delegable functions", "Power Apps SQL delegation warning", "Power Apps Azure SQL delegation"],
  published,
  updated: published,
  quickAnswer: "SQL Server delegates Filter, LookUp, Search, Sort, StartsWith, EndsWith, contains text with in, Len, arithmetic on number columns, Sum, Average, Min and Max on numbers, and conditions joined with And, Or and Not. Put the column first in StartsWith and EndsWith, and second in \"text\" in Column. IsBlank is not delegated, so write Column <> Blank() instead. CountRows is not delegated.",
  sections: [
    section(
      "what-delegates",
      "What SQL Server can delegate",
      p("Microsoft's table for SQL Server, by column type:"),
      table(
        ["Function or operator", "Number", "Text", "Bit", "Date", "Guid"],
        ["`Filter`, `LookUp`", "Yes", "Yes", "Yes", "Yes", "Yes"],
        ["`=`, `<>`", "Yes", "Yes", "Yes", "Yes", "Yes"],
        ["`<`, `<=`, `>`, `>=`", "Yes", "No", "No", "Yes", "-"],
        ["`*`, `+`, `-`, `/`", "Yes", "-", "-", "No", "-"],
        ["`Search`, `StartsWith`, `EndsWith`, `in`, `Len`", "-", "Yes", "-", "-", "-"],
        ["`Sort`, `SortByColumns`", "Yes", "Yes", "Yes", "Yes", "-"],
        ["`Sum`, `Average`", "Yes", "-", "-", "-", "-"],
        ["`Min`, `Max`", "Yes", "-", "-", "No", "-"],
        ["`IsBlank`", "No", "No", "No", "No", "No"]
      ),
      p("Conditions joined with `And`, `Or` and `Not` are delegated. `CountRows` is not in Microsoft's list for SQL Server, so a count over a large table covers only the first rows."),
      tool("power-apps-delegation-checker", "Paste a formula, pick SQL Server, and see which parts SQL Server can run.")
    ),
    section(
      "argument-order",
      "Argument order matters",
      p("SQL Server delegates text matching only when the column is in the expected place:"),
      table(
        ["Delegated", "Not delegated"],
        ["`StartsWith(CustomerName, txtSearch.Text)`", "`StartsWith(txtSearch.Text, CustomerName)`"],
        ["`EndsWith(Email, \"@contoso.com\")`", "`EndsWith(\"@contoso.com\", Email)`"],
        ["`txtSearch.Text in CustomerName`", "`CustomerName in txtSearch.Text`"]
      )
    ),
    section(
      "blank-and-char",
      "Blank checks and char columns",
      ul(
        "**Blank checks:** `!IsBlank(CustomerId)` is not delegated. `CustomerId <> Blank()` is. It doesn't treat an empty string as blank, and this doesn't work for Guid columns.",
        "**char and nchar columns:** SQL pads them with spaces. `Len` on a char(10) column holding \"hello\" is 10 on the server but 5 in Power Apps, and `EndsWith(Column, \"llo\")` returns false. Use varchar or nvarchar columns."
      )
    ),
    section(
      "gateway-dates",
      "Date filters through an on-premises gateway",
      p("Microsoft notes that direct date filters don't work for SQL Server through an on-premises data gateway. The workaround is a computed number column that holds the date, which you then filter like any number:"),
      code(`-- In SQL Server
ALTER TABLE Orders ADD OrderDateNumber AS (YEAR([OrderDate]) * 10000 + MONTH([OrderDate]) * 100 + DAY([OrderDate]));`, "Computed column for date filters"),
      code(`// In Power Apps: orders from November 2026
Filter(Orders, OrderDateNumber >= 20261101 && OrderDateNumber < 20261201)`, "Filter on the number column")
    ),
    rowLimitTest
  ],
  faqs: [
    {
      question: "Is Search delegated to SQL Server?",
      answer: "Yes, on text columns. StartsWith, EndsWith and contains text with the in operator are delegated too, as long as the column is in the right place in the expression."
    },
    {
      question: "Why isn't IsBlank delegated to SQL Server?",
      answer: "SQL Server doesn't support IsBlank for delegation on any column type. Write Column <> Blank() instead, which it can run. This doesn't treat empty strings as blank and doesn't work for Guid columns."
    },
    {
      question: "Is CountRows delegated to SQL Server?",
      answer: "No. CountRows is not in Microsoft's list of functions SQL Server can delegate, so on a large table it counts only the rows Power Apps downloaded. Count in a SQL view or stored procedure instead."
    },
    sharedFaqLimit
  ],
  relatedTools: ["power-apps-delegation-checker"],
  relatedPatterns: ["delegation-safe-date-range-filter", "create-a-delegation-review-worksheet"],
  relatedLinks: [
    { href: "/guides/power-apps-delegation-warning-explained", label: "What a delegation warning means" },
    { href: "/guides/power-automate-sql-server-quick-start", label: "SQL Server in Power Automate" },
    { href: "/functions/filter", label: "Filter function reference" }
  ],
  sources: [
    canvasDoc("connections/sql-connection-overview", "Connect to SQL Server from Power Apps (delegable functions)"),
    canvasDoc("delegation-overview", "Understand delegation in a canvas app")
  ]
};

export const excelDelegationGuide: Guide = {
  slug: "power-apps-delegation-excel",
  title: "Power Apps with an Excel table: the row limit and when to move your data",
  shortTitle: "Delegation with Excel",
  description: "Why an Excel table in OneDrive or SharePoint can't delegate queries, what the data row limit means for your app, when Excel is still fine, and where to move the data when it grows.",
  eyebrow: "Delegation by data source",
  keywords: ["Power Apps Excel delegation", "Power Apps Excel 500 rows", "Power Apps Excel data row limit", "Power Apps Excel vs SharePoint"],
  published,
  updated: published,
  quickAnswer: "Excel is not one of the data sources that support delegation, so Power Apps loads only the first rows of an Excel table, up to the data row limit (500 by default, 10,000 at most), and runs every Filter, Search and count on those rows. Excel is fine for small tables that will stay under the limit. For anything that can grow, move the data to a SharePoint list or a Dataverse table.",
  sections: [
    section(
      "why",
      "Why Excel doesn't delegate",
      p("Delegation means the data source runs the query and sends back only the matching rows. Microsoft lists Dataverse, SharePoint, SQL Server and Salesforce as the popular data sources that support it. An Excel workbook is a file, not a database, so there is nothing on the other side to run the query."),
      p("Power Apps therefore downloads the first rows of the table, up to the app's **Data row limit**, and does all the filtering, sorting and counting on the device. Rows past the limit are simply not seen."),
      note("This is easy to miss because nothing fails. An app built against 300 test rows works perfectly, then gives incomplete results once the table passes 500 rows.")
    ),
    section(
      "when-fine",
      "When Excel is still fine",
      ul(
        "The table is small and will stay small, such as a list of offices, product categories or approvers.",
        "You raise the data row limit (up to 10,000) and the table will always stay under it, accepting slower loading.",
        "The data never changes in the app. For read-only reference data you can use **Add static data to your app** to import the workbook, and it is then held in memory with no limit to worry about. Changes to the file after import don't reach the app."
      )
    ),
    section(
      "where-to-move",
      "Where to move the data when it grows",
      table(
        ["Option", "Good for", "Watch for"],
        ["SharePoint list", "Most team apps, already in your Microsoft 365 licence", "Search, in and counts aren't delegated. See [delegation with SharePoint](/guides/power-apps-delegation-sharepoint)"],
        ["Dataverse table", "Larger or related data, contains search, exact counts", "Usually needs a premium licence. See [delegation with Dataverse](/guides/power-apps-delegation-dataverse)"],
        ["SQL Server", "Data that already lives in a database", "Premium connector. See [delegation with SQL Server](/guides/power-apps-delegation-sql-server)"]
      ),
      p("The [choose a data source guide](/guides/choose-data-source-power-apps) compares the options in more detail.")
    ),
    rowLimitTest
  ],
  faqs: [
    {
      question: "Does Power Apps delegate queries to Excel?",
      answer: "No. Excel isn't one of the data sources that support delegation, so Power Apps loads the first rows up to the data row limit and works on those. The limit is 500 rows by default and 10,000 at most."
    },
    {
      question: "How many rows can a Power Apps app read from Excel?",
      answer: "Up to the app's data row limit: 500 by default, and you can raise it to 10,000 in Settings. Rows past the limit are not seen by filters, searches or counts."
    },
    {
      question: "Should I use Excel or a SharePoint list for Power Apps?",
      answer: "Use a SharePoint list for anything that will grow or that several people edit. Excel suits small tables that stay under the row limit, or read-only reference data imported into the app."
    },
    sharedFaqLimit
  ],
  relatedTools: ["power-apps-delegation-checker"],
  relatedPatterns: ["create-a-delegation-review-worksheet"],
  relatedLinks: [
    { href: "/guides/power-apps-delegation-warning-explained", label: "What a delegation warning means" },
    { href: "/guides/choose-data-source-power-apps", label: "Choose a data source for Power Apps" },
    { href: "/guides/power-automate-excel-quick-start", label: "Excel in Power Automate" }
  ],
  sources: [
    canvasDoc("delegation-overview", "Understand delegation in a canvas app")
  ]
};

export const delegationGuides = [sharePointDelegationGuide, dataverseDelegationGuide, sqlDelegationGuide, excelDelegationGuide];
