import { canvasDoc, code, note, p, powerFxDoc, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-20";
const eyebrow = "Power Fx how-to";

export const findRecordsGuide: Guide = {
  slug: "power-fx-lookup-vs-filter-vs-search",
  title: "LookUp, Filter or Search: how to find records in Power Apps",
  shortTitle: "LookUp vs Filter vs Search",
  description: "What LookUp, Filter and Search each return, when to use which, how to combine them for a search box with filters, and which of them SharePoint and Dataverse can run on the server.",
  eyebrow,
  keywords: ["LookUp vs Filter Power Apps", "Power Apps Search function", "Power Apps filter gallery", "Power Apps search box SharePoint", "First Filter vs LookUp"],
  published,
  updated: published,
  quickAnswer: "LookUp returns one record, the first that matches, or blank when none does. Filter returns a table of every record that matches. Search returns a table of the records where some text appears anywhere in the columns you name. Use LookUp when you want one record, Filter for a gallery, and Search for a search box, but check delegation first: SharePoint cannot run Search on the server, so for a large list use Filter with StartsWith.",
  sections: [
    section(
      "comparison",
      "What each one returns",
      table(
        ["", "LookUp", "Filter", "Search"],
        ["Returns", "One record, or one value from it", "A table", "A table"],
        ["When nothing matches", "Blank", "An empty table", "An empty table"],
        ["You give it", "A condition", "One or more conditions", "A text and the columns to look in"],
        ["Matches", "The first record that meets the condition", "Every record that meets all the conditions", "Every record that contains the text, in any position, ignoring case"],
        ["Typical place", "A label, a form's Item, a variable", "A gallery's Items", "A gallery's Items behind a search box"]
      ),
      code(`// One record
LookUp(Employees, Email = User().Email)

// Many records
Filter(Requests, Status.Value = "Open")

// Text anywhere in two columns
Search(Customers, txtSearch.Text, Name, City)`)
    ),
    section(
      "lookup",
      "LookUp: one record",
      p("`LookUp` stops at the first match. Use it when the condition identifies one record, such as an ID or an email address."),
      code(`// The whole record
LookUp(Requests, ID = 42)

// One column of it
LookUp(Requests, ID = 42).Title

// The same, using the third argument
LookUp(Requests, ID = 42, Title)`),
      p("The third argument is a formula that is applied to the record that was found. It returns a single value instead of the record. Either form works, and the third argument makes it plain which column the formula needs."),
      p("When nothing matches, the result is blank, and reading a column of blank is also blank. Check for that where it matters."),
      code(`If(
    IsBlank(LookUp(Employees, Email = User().Email)),
    "You are not registered",
    "Welcome back"
)`),
      p("If several records match, you get the first one the data source returns, which is not always the one you expect. When the order matters, sort first: `First(Sort(Filter(...), Created, SortOrder.Descending))`."),
      note("`First(Filter(Requests, ID = 42))` gives the same answer as `LookUp(Requests, ID = 42)`. Prefer `LookUp`. It states what you mean and asks the data source for one record.")
    ),
    section(
      "filter",
      "Filter: every record that matches",
      p("`Filter` checks each record against your conditions and keeps the ones where all of them are true."),
      code(`// Two conditions: both must be true
Filter(
    Requests,
    Status.Value = "Open",
    DueDate < Today()
)

// Either condition
Filter(
    Requests,
    Status.Value = "Open" || Status.Value = "On hold"
)`),
      p("Separating conditions with a comma is the same as joining them with `&&`. Use `||` for or."),
      p("A filter that depends on optional inputs needs a way to say no filter. Test for an empty input and let the condition be true in that case."),
      code(`Filter(
    Requests,
    IsBlank(drpStatus.Selected.Value) || Status.Value = drpStatus.Selected.Value,
    IsBlank(dpFrom.SelectedDate) || DueDate >= dpFrom.SelectedDate
)`),
      p("Check that form for a delegation warning with your data source. Where it appears, the [gallery filtering cheat sheet](/cheat-sheets/power-apps-gallery-filtering-cheat-sheet) has variants that delegate.")
    ),
    section(
      "search",
      "Search: text anywhere in a column",
      p("`Search` takes a table, the text to look for and one or more text columns. It keeps the records where the text appears anywhere in any of those columns. Capital letters are ignored. An empty search text returns every record, which is what a search box should do before the user types."),
      code(`Search(Customers, txtSearch.Text, Name, City)`),
      p("The columns have to be text columns of the table itself. `Search` cannot look inside a Choice, a Person, a Lookup or a number column. For those, add a `Filter` condition, or search a text copy of the value."),
      p("In apps made some years ago, the column names were written in quotation marks, as in `Search(Customers, txtSearch.Text, \"Name\", \"City\")`. Current versions use the names without quotation marks."),
      p("The `in` operator does a similar job inside a `Filter` and can be mixed with other conditions."),
      code(`Filter(Customers, txtSearch.Text in Name, Active = true)`)
    ),
    section(
      "delegation",
      "Which ones run at the data source",
      p("With a large table, what matters most is whether the data source can do the work. If it cannot, Power Apps fetches only the first rows, up to the data row limit of 500 by default, and searches those. Rows beyond the limit are never found, and the only sign is a warning in Studio."),
      table(
        ["", "SharePoint", "Dataverse"],
        ["`Filter` and `LookUp` with `=`", "Yes", "Yes"],
        ["`StartsWith` on a text column", "Yes", "Yes"],
        ["`Search`", "No", "Yes, on text columns"],
        ["`in` to find text inside a column", "No", "Yes, on text columns"],
        ["`<`, `>` on numbers and dates", "Yes, except on the ID column", "Yes"]
      ),
      p("This table is a summary of Microsoft's connector pages on the day this guide was checked. Each data source has more rules, and the pages are updated, so treat the warning in Studio as the final word for your formula."),
      tool("power-apps-delegation-checker", "Paste a formula and pick the data source to see which parts are likely to stop delegation."),
      p("The [delegation guide](/guides/power-apps-delegation-warning-explained) explains the warning and the data row limit.")
    ),
    section(
      "search-box",
      "A search box with filters",
      p("A typical list screen has a search box, a status dropdown and a sort order. How you write it depends on the data source."),
      code(`// Dataverse: Search can be delegated, so wrap it around the Filter
SortByColumns(
    Search(
        Filter(Accounts, Status = 'Status (Accounts)'.Active),
        txtSearch.Text,
        'Account Name',
        'Address 1: City'
    ),
    "name",
    SortOrder.Ascending
)`),
      code(`// SharePoint: use StartsWith, which can be delegated
SortByColumns(
    Filter(
        Customers,
        StartsWith(Title, txtSearch.Text),
        IsBlank(drpRegion.Selected.Value) || Region.Value = drpRegion.Selected.Value
    ),
    "Title",
    SortOrder.Ascending
)`),
      p("`StartsWith` matches from the beginning of the column only, so searching for `soft` finds Software Ltd and not Microsoft. For a large SharePoint list that is the trade: results that are complete but match from the start, or results that match anywhere but come from the first rows only."),
      p("For a list that will stay small, `Search` on SharePoint is fine. The [multi-field search pattern](/patterns/power-apps-search-with-multiple-fields) and the [SharePoint delegation pattern](/patterns/avoid-delegation-warnings-sharepoint-filters) show both designs, and the [Dataverse search pattern](/patterns/dataverse-delegation-filter-search-large-tables) covers large tables.")
    ),
    section(
      "counts-exists",
      "Does a record exist, and how many",
      table(
        ["Question", "Formula"],
        ["Is there at least one match?", "`!IsBlank(LookUp(Requests, Requester.Email = User().Email))`"],
        ["Is the result empty?", "`IsEmpty(Filter(Requests, Status.Value = \"Open\"))`"],
        ["How many match?", "`CountRows(Filter(Requests, Status.Value = \"Open\"))`"]
      ),
      p("`IsBlank` is for a record or a value. `IsEmpty` is for a table. Using `IsBlank` on the result of a `Filter` is a common slip: a table with no rows is empty, not blank, so the test is always false."),
      p("Counting has its own delegation rules. `CountRows` over a SharePoint list counts only the rows that were fetched, so a count above the data row limit is wrong. For large lists, keep the count somewhere else or show it as a minimum.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**LookUp inside a gallery row.** Each row sends its own request. Bring the value with the row or look it up in a small collection, as the [slow formulas guide](/guides/speed-up-slow-power-fx-formulas) shows.",
        "**Filter where one record is wanted.** Setting a form's `Item` to a `Filter` is a type error. A form wants a record: use `LookUp`.",
        "**Comparing a Choice column with text.** `Status = \"Open\"` fails for a SharePoint Choice column. Compare its text: `Status.Value = \"Open\"`.",
        "**Ignoring the delegation warning because the test list is small.** The formula works with 200 rows and silently loses records at 2,001."
      )
    )
  ],
  faqs: [
    {
      question: "What is the difference between LookUp and Filter in Power Apps?",
      answer: "LookUp returns a single record, the first one that matches the condition, or blank if none matches. Filter returns a table of all the records that match. Use LookUp for a label or a form, and Filter for a gallery."
    },
    {
      question: "Should I use First(Filter()) or LookUp?",
      answer: "Use LookUp. Both return the first matching record, but LookUp says what you mean and asks the data source for one record only."
    },
    {
      question: "Why does Search show a delegation warning with SharePoint?",
      answer: "SharePoint cannot run the Search function on the server, so Power Apps searches only the first rows up to the data row limit. For a large list, use Filter with StartsWith, which SharePoint can delegate."
    },
    {
      question: "Is Search in Power Apps case sensitive?",
      answer: "No. Search ignores the difference between capital and small letters, and it finds the text anywhere in the column."
    },
    {
      question: "How do I check if a record exists in Power Apps?",
      answer: "Use IsBlank on a LookUp: IsBlank(LookUp(Table, Condition)) is true when no record matches. For a table result, use IsEmpty(Filter(Table, Condition))."
    }
  ],
  relatedTools: ["power-apps-delegation-checker", "power-fx-formatter", "power-apps-gallery-filtering-cheat-sheet"],
  relatedPatterns: ["power-apps-search-with-multiple-fields", "avoid-delegation-warnings-sharepoint-filters", "dataverse-delegation-filter-search-large-tables", "delegation-safe-date-range-filter", "power-apps-empty-state-gallery"],
  relatedLinks: [
    { href: "/guides/power-apps-delegation-warning-explained", label: "The delegation warning explained" },
    { href: "/cheat-sheets/power-apps-gallery-filtering-cheat-sheet", label: "Gallery filtering cheat sheet" },
    { href: "/guides/speed-up-slow-power-fx-formulas", label: "Speed up slow Power Fx formulas" }
  ],
  sources: [
    powerFxDoc("reference/function-filter-lookup", "Filter, Search and LookUp functions"),
    canvasDoc("delegation-overview", "Understand delegation in a canvas app"),
    canvasDoc("connections/connection-sharepoint-online", "SharePoint connector: delegable functions and operations"),
    canvasDoc("connections/connection-common-data-service", "Dataverse connector: delegable functions and operations")
  ]
};

export const forAllGuide: Guide = {
  slug: "power-fx-forall-explained",
  title: "ForAll in Power Apps explained, and why it is not a loop",
  shortTitle: "ForAll explained",
  description: "What ForAll does, what it returns, how to use ThisRecord, As and Sequence, why it does not behave like a for loop in other languages, and when a single Patch, UpdateIf or AddColumns is the better choice.",
  eyebrow,
  keywords: ["Power Apps ForAll", "ForAll Patch Power Apps", "ForAll loop Power Fx", "ForAll Sequence", "ForAll ThisRecord As"],
  published,
  updated: published,
  quickAnswer: "ForAll evaluates a formula once for each record of a table and returns a table of the results. It is a function that produces a value, not a loop statement. Records can be processed in any order and at the same time, so a formula inside ForAll must not depend on the record before it. You cannot update a counter step by step or change the table you are going through. Use ForAll to build a table or to run an action per record, and check first whether one Patch, UpdateIf or AddColumns does the same job.",
  sections: [
    section(
      "what",
      "What ForAll does",
      p("`ForAll` takes a table and a formula. It works the formula out for each record and collects the answers into a new table."),
      code(`// A table of three records in, a table of three values out
ForAll(
    [10, 20, 30],
    Value * 2
)
// Result: a single-column table with 20, 40 and 60`),
      p("If the formula returns a record, the result is a table with those columns. That makes `ForAll` a tool for reshaping data."),
      code(`ForAll(
    colBasket,
    {
        Title: Name,
        LineTotal: Quantity * UnitPrice
    }
)`),
      p("If the formula returns blank for a record, that record is left out of the result, so the result can be shorter than the input."),
      p("The formula can also do something, such as save a record. Then the result is usually ignored and `ForAll` is used for its effect.")
    ),
    section(
      "not-a-loop",
      "Why it is not a loop",
      p("In most programming languages, a for loop runs its steps for the first item, then the second, and so on, and each step can use what the step before left behind. `ForAll` makes no such promise. Microsoft's reference says that records can be processed in any order and, when possible, in parallel, and that the first record may be processed after the last."),
      p("Three things follow from that."),
      ul(
        "**No step-by-step state.** You cannot use `UpdateContext`, `Clear` or `ClearCollect` inside `ForAll`. A running total or a counter that each record adds to is not reliable, because the records do not wait for each other.",
        "**No changing the table you are reading.** A formula inside `ForAll` cannot modify the table that `ForAll` is going through.",
        "**No early exit.** There is no break. Every record is processed. To stop at a condition, filter the table before it goes in."
      ),
      p("The order of the result is dependable: the output table is in the same order as the input table. It is the order of the work that is not."),
      code(`// A running total is a job for Sum, not for ForAll
Sum(colBasket, Quantity * UnitPrice)

// Process only some records: filter first
ForAll(
    Filter(colBasket, Quantity > 0),
    Patch(OrderLines, Defaults(OrderLines), {Title: Name, Quantity: Quantity})
)`)
    ),
    section(
      "thisrecord-as",
      "ThisRecord and As",
      p("Inside the formula, the columns of the current record can be used by name. `ThisRecord` refers to the whole record."),
      code(`ForAll(
    colSelected,
    Patch(Requests, ThisRecord, {Status: {Value: "Closed"}})
)`),
      p("Column names cause trouble when the table inside the formula has columns with the same names. In `Patch(Requests, ..., {Title: Title})`, which Title is meant? Give the record a name with `As` and the question goes away."),
      code(`ForAll(
    colBasket As line,
    Patch(
        OrderLines,
        Defaults(OrderLines),
        {
            Title: line.Name,
            Quantity: line.Quantity
        }
    )
)`),
      p("`As` is required when one `ForAll` sits inside another, so that the inner formula can reach the outer record."),
      code(`ForAll(
    colOrders As order,
    ForAll(
        Filter(colLines, OrderId = order.ID) As line,
        {Order: order.Title, Product: line.Name}
    )
)`),
      p("The result of that formula is a table of tables. Wrap it in `Ungroup` to flatten it into one table.")
    ),
    section(
      "sequence",
      "Repeat something a number of times",
      p("To repeat by count, give `ForAll` a table of numbers from `Sequence`. Each record has one column named `Value`."),
      code(`// The next seven dates, starting today
ForAll(
    Sequence(7),
    DateAdd(Today(), Value - 1, TimeUnit.Days)
)

// Ten empty rows for a data entry grid
ClearCollect(
    colRows,
    ForAll(Sequence(10), {RowNo: Value, Item: "", Quantity: 0})
)`),
      p("`Sequence(7)` gives 1 to 7. `Sequence(7, 0)` starts at 0. This is also how to add a row number to a table, by using the number to pick a record with `Index`."),
      code(`ForAll(
    Sequence(CountRows(colBasket)),
    Patch(Index(colBasket, Value), {RowNo: Value})
)`),
      p("That formula returns a new table with a RowNo column. It does not change `colBasket`.")
    ),
    section(
      "saving",
      "Save many records",
      p("Calling `Patch` inside `ForAll` saves the records one request at a time. It works, and for a handful of rows it is fine."),
      code(`ForAll(
    colBasket As line,
    Patch(OrderLines, Defaults(OrderLines), {Title: line.Name, Quantity: line.Quantity})
)`),
      p("For more rows, turn it inside out. Use `ForAll` to build the table of records, and hand the whole table to one `Patch`."),
      code(`Patch(
    OrderLines,
    ForAll(
        colBasket As line,
        {Title: line.Name, Quantity: line.Quantity}
    )
)`),
      p("The second form sends the rows together and is noticeably quicker. To update existing rows, include each row's key, such as its ID, in the records. The [ForAll and Patch pattern](/patterns/forall-patch-multiple-records-power-apps) has both the create and the update form, and the [bulk update pattern](/patterns/power-apps-bulk-update-selected-gallery-items) applies it to rows ticked in a gallery."),
      note("Whichever form you use, wrap the save in `IfError` so that a row that fails is reported. See the [error handling guide](/guides/power-fx-iferror-and-app-onerror).")
    ),
    section(
      "alternatives",
      "When you do not need ForAll",
      table(
        ["Job", "Use instead"],
        ["Change the same columns on every row that matches a condition", "`UpdateIf(Requests, Status.Value = \"Open\", {Priority: 1})`"],
        ["Delete every row that matches", "`RemoveIf(colBasket, Quantity = 0)`"],
        ["Add a calculated column to a table", "`AddColumns(colBasket, LineTotal, Quantity * UnitPrice)`"],
        ["Add up or count", "`Sum`, `CountRows`, `CountIf`, `Average`"],
        ["Join values into text", "`Concat(colBasket, Name, \", \")`"],
        ["Keep some rows", "`Filter`"],
        ["Copy rows into a collection", "`Collect(colTarget, colSource)`"]
      ),
      p("These say what you want in one function, and several of them can be delegated to the data source. `ForAll` itself cannot be delegated: when you give it a data source directly, it works on the rows that were fetched, up to the data row limit."),
      tool("power-fx-formatter", "Paste a formula to format it. The review notes point out ForAll combined with Patch.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Using ForAll over a large data source.** Only the rows up to the data row limit are processed, with no error. Filter the data source first with a delegable formula.",
        "**Collecting inside ForAll and expecting an order.** `Collect` is allowed inside `ForAll`, but the order in which rows are added is not defined. Build the table as the result of `ForAll` and collect that.",
        "**Forgetting that ForAll returns a table.** `ForAll(colIds, LookUp(Requests, ID = Value))` in a label's Text is a type error. A label needs text: wrap it in `Concat`.",
        "**Showing a spinner that never ends.** If one record fails, the others still run. Catch errors so the formula reaches the line that hides the spinner."
      )
    )
  ],
  faqs: [
    {
      question: "Is ForAll a loop in Power Apps?",
      answer: "Not in the usual sense. ForAll evaluates a formula for each record of a table and returns a table of results, but the records can be processed in any order and in parallel. A formula inside it cannot rely on the record before it or keep a running counter."
    },
    {
      question: "What does ForAll return?",
      answer: "A table with one row per input record, in the same order as the input. If the formula returns a single value, the table has one column named Value. If it returns a record, the table has that record's columns. Records for which the formula returns blank are left out."
    },
    {
      question: "How do I loop a set number of times in Power Fx?",
      answer: "Pass Sequence to ForAll. ForAll(Sequence(10), formula) evaluates the formula ten times, and Value holds the numbers 1 to 10."
    },
    {
      question: "Why can't I use UpdateContext or ClearCollect inside ForAll?",
      answer: "Because ForAll may process records in any order and in parallel. Microsoft's reference says these functions are not allowed inside ForAll, since they could be used to hold variables that depend on the order of processing."
    },
    {
      question: "Is ForAll with Patch slow?",
      answer: "Patch inside ForAll sends one request per record, so it slows down as the number of rows grows. Building a table of records with ForAll and passing it to a single Patch is quicker."
    }
  ],
  relatedTools: ["power-fx-formatter", "power-apps-patch-cookbook", "power-apps-collections-cookbook"],
  relatedPatterns: ["forall-patch-multiple-records-power-apps", "power-apps-bulk-update-selected-gallery-items", "updateif-removeif-bulk-changes-power-apps", "patch-collection-checklist-items", "calculate-totals-gallery-collection"],
  relatedLinks: [
    { href: "/guides/power-apps-patch-vs-submitform-vs-collect", label: "Patch, SubmitForm or Collect" },
    { href: "/guides/speed-up-slow-power-fx-formulas", label: "Speed up slow Power Fx formulas" },
    { href: "/cookbooks/power-apps-collections-cookbook", label: "Power Apps collections cookbook" }
  ],
  sources: [
    powerFxDoc("reference/function-forall", "ForAll function"),
    powerFxDoc("reference/function-sequence", "Sequence function"),
    powerFxDoc("reference/operators", "Operators and identifiers: ThisRecord and As"),
    powerFxDoc("reference/function-patch", "Patch function")
  ]
};

export const appStartGuide: Guide = {
  slug: "power-apps-faster-app-start-concurrent-onstart",
  title: "Make a Power Apps app open faster with Concurrent, named formulas and less App.OnStart",
  shortTitle: "Faster app start",
  description: "Why a canvas app is slow to open and how to fix it: move values out of App.OnStart into named formulas, load data at the same time with Concurrent, load less data, use StartScreen, and load each screen's data when the screen opens.",
  eyebrow,
  keywords: ["Power Apps slow to load", "Power Apps Concurrent function", "App.OnStart performance", "Power Apps StartScreen", "Power Apps app start time"],
  published,
  updated: published,
  quickAnswer: "An app opens slowly when App.OnStart makes many data calls one after another. Work through four steps. Move every value that is only calculated into App.Formulas, where it is worked out only when needed. Replace Navigate in OnStart with the App.StartScreen property. Move data that one screen needs to that screen's OnVisible. Then wrap the data calls that remain in Concurrent, so that they run at the same time and the wait is the longest call and not the sum of all of them.",
  sections: [
    section(
      "why-slow",
      "Why the app is slow to open",
      p("A typical `App.OnStart` grows one line at a time until it looks like this."),
      code(`// App.OnStart
Set(gblUser, User());
Set(gblProfile, LookUp(Employees, Email = gblUser.Email));
Set(gblIsAdmin, gblProfile.Role.Value = "Admin");
ClearCollect(colDepartments, Departments);
ClearCollect(colProducts, Products);
ClearCollect(colRequests, Requests);
ClearCollect(colSettings, Settings);
Navigate(If(gblIsAdmin, scrAdmin, scrHome))`),
      p("Five of those lines call a data source, and each one waits for the line before it. If each call takes a second, the user looks at the loading screen for five seconds, and some of that data is for screens they may not open today."),
      p("Measure before you change anything. Open **Advanced tools**, then **Monitor**, restart the app and look at the calls made while it opens: how many, how long each took and how many rows came back. The [Monitor pattern](/patterns/power-apps-monitor-debug-performance-trace) shows how to read the list.")
    ),
    section(
      "named-formulas",
      "Step 1: move calculated values to App.Formulas",
      p("A value that is set once and never changed is a named formula. It is worked out the first time something uses it, not while the app opens."),
      code(`// App.Formulas
CurrentUser = User();
Profile = LookUp(Employees, Email = CurrentUser.Email);
IsAdmin = Profile.Role.Value = "Admin";`),
      p("Three lines have left `App.OnStart`, and one data call with them. Microsoft's reference for the App object recommends this as the first alternative to OnStart for caching data and setting up global values."),
      tool("onstart-to-named-formulas", "Paste your App.OnStart and get the named formulas for the lines that qualify."),
      p("The [named formulas guide](/guides/power-fx-named-formulas-explained) explains what can move and what has to stay.")
    ),
    section(
      "startscreen",
      "Step 2: choose the first screen with StartScreen",
      p("`Navigate` in `App.OnStart` forces the app to finish OnStart before it can show anything. Microsoft has retired that use: existing apps still work, and for a limited time it can be switched back on under the retired settings. The replacement is the `App.StartScreen` property, a formula that returns the screen to show first."),
      code(`// App.StartScreen
If(IsAdmin, scrAdmin, scrHome)`),
      code(`// App.StartScreen: open a record from a link such as ...?requestId=42
If(!IsBlank(Param("requestId")), scrRequestDetail, scrHome)`),
      p("`StartScreen` cannot run actions, so it cannot set variables. It can read named formulas, `Param` and `User`, which is another reason to move those values into `App.Formulas` first.")
    ),
    section(
      "onvisible",
      "Step 3: load each screen's data when the screen opens",
      p("Data that one screen uses does not belong in `App.OnStart`. Load it in that screen's `OnVisible`, so that only the people who open the screen wait for it."),
      code(`// scrProducts.OnVisible
If(
    IsEmpty(colProducts),
    ClearCollect(colProducts, ShowColumns(Products, ID, Title, Price))
)`),
      p("The `IsEmpty` test loads the collection the first time and skips the call on later visits. Leave the test out if the screen should always show fresh data."),
      p("Better still, ask whether the collection is needed. A gallery whose `Items` is `Filter(Products, ...)` reads straight from the data source, a page at a time, with no start-up cost and no limit on rows. Copy data into a collection only when the app has to work on it in memory.")
    ),
    section(
      "concurrent",
      "Step 4: run the remaining calls together with Concurrent",
      p("Some data really is needed straight away. `Concurrent` takes several formulas and starts them at the same time. The user waits for the slowest call, not for all of them added up."),
      code(`// App.OnStart
Concurrent(
    ClearCollect(colDepartments, ShowColumns(Departments, ID, Title)),
    ClearCollect(colSettings, Settings),
    ClearCollect(colMyOpenRequests, Filter(Requests, Requester.Email = CurrentUser.Email, Status.Value = "Open"))
)`),
      p("The rules are short."),
      ul(
        "**The formulas must not depend on each other.** You cannot predict which starts or finishes first, and Studio shows an error if one formula in a `Concurrent` uses a value that another one sets.",
        "**Steps that do depend on each other go in one argument**, joined with a semicolon. `Concurrent(Set(a, 1); Set(b, a + 1), Set(x, 2))` runs the first pair in order, alongside the third.",
        "**Whatever follows Concurrent waits for all of it.** A line after the closing bracket can use everything that was loaded inside.",
        "**It works in behavior properties only**, such as `OnStart`, `OnVisible` and `OnSelect`.",
        "**It needs at least two formulas.**"
      ),
      p("Microsoft's reference notes that, depending on the device or browser, only a handful of formulas may actually run at the same time. Ten calls in one `Concurrent` will not all start at once, so loading less still matters. The [Concurrent pattern](/patterns/power-apps-concurrent-load-data-faster) has a way to time the difference.")
    ),
    section(
      "load-less",
      "Load less",
      p("The quickest call is the one that returns little. Three habits reduce what each call brings back."),
      ul(
        "**Filter at the source.** `Filter(Requests, Status.Value = \"Open\")` returns far fewer rows than the whole list. Check that the filter can be delegated.",
        "**Ask for the columns you use.** `ShowColumns(Departments, ID, Title)` avoids fetching wide rows with long text and lookups.",
        "**Do not copy large tables into collections.** A collection is cut off at the data row limit, so a copy of a large table is both slow and incomplete."
      ),
      p("Small settings that rarely change, such as a list of statuses or colours, can be written into the app as a table in a named formula, which makes no call at all."),
      tool("csv-to-power-fx-table", "Turn a small reference list into a Power Fx table you can paste into App.Formulas.")
    ),
    section(
      "timing",
      "What runs when",
      table(
        ["Property", "Runs", "Use it for"],
        ["App.Formulas", "Each formula when first needed, and again when its inputs change", "Calculated values, constants, the user's profile"],
        ["App.StartScreen", "Once, as the app opens", "Choosing the first screen"],
        ["App.OnStart", "Once, as the app opens", "Actions that must happen once, such as loading shared data"],
        ["Screen.OnVisible", "Each time the screen is shown", "Data and resets for that screen"]
      ),
      p("In current apps `App.OnStart` does not hold up the first screen. Microsoft's reference says that, with the default setting, OnStart runs at the same time as other formulas, so a screen can appear and become usable before OnStart has finished, and a variable set in OnStart may not have its value yet when a control first reads it."),
      p("Plan for that. Show a loading state while the data arrives, and do not write formulas that break when a collection is still empty."),
      code(`// App.OnStart
Set(gblLoading, true);
Concurrent(
    ClearCollect(colDepartments, ShowColumns(Departments, ID, Title)),
    ClearCollect(colSettings, Settings)
);
Set(gblLoading, false)

// Spinner Visible
gblLoading`)
    ),
    section(
      "after",
      "The same app after the four steps",
      code(`// App.Formulas
CurrentUser = User();
Profile = LookUp(Employees, Email = CurrentUser.Email);
IsAdmin = Profile.Role.Value = "Admin";

// App.StartScreen
If(IsAdmin, scrAdmin, scrHome)

// App.OnStart
Concurrent(
    ClearCollect(colDepartments, ShowColumns(Departments, ID, Title)),
    ClearCollect(colSettings, Settings)
)

// scrProducts.OnVisible
If(IsEmpty(colProducts), ClearCollect(colProducts, ShowColumns(Products, ID, Title, Price)))`),
      p("Five data calls in a row have become two that run together, one that happens when the profile is first used, and one that only people who open the products screen wait for. How much time that saves depends on your data and network, so run Monitor again and compare."),
      p("If the app is still slow after it opens, the cause is usually in the screens. The [slow formulas guide](/guides/speed-up-slow-power-fx-formulas) covers lookups inside galleries and repeated calls.")
    )
  ],
  faqs: [
    {
      question: "Why is my Power Apps app slow to load?",
      answer: "Usually because App.OnStart makes several data calls one after another, and often loads data that the first screen does not need. Move calculated values to App.Formulas, load screen data in the screen's OnVisible, and run the remaining calls together with Concurrent."
    },
    {
      question: "What does Concurrent do in Power Apps?",
      answer: "Concurrent evaluates several formulas at the same time instead of one after another. For data calls, the app waits for the longest call and not for the total of all of them. The formulas must not depend on each other."
    },
    {
      question: "Should I still use App.OnStart?",
      answer: "Only for actions that must run once when the app opens, such as loading shared data into collections. Microsoft recommends named formulas for values and App.StartScreen for choosing the first screen."
    },
    {
      question: "Can I use Navigate in App.OnStart?",
      answer: "Microsoft has retired Navigate in App.OnStart. Existing apps keep working, but the replacement is the App.StartScreen property, which returns the screen to show first without waiting for OnStart to finish."
    },
    {
      question: "Does the first screen wait for App.OnStart to finish?",
      answer: "Not with the default setting. Microsoft's documentation says OnStart runs at the same time as other formulas, so the first screen can appear before OnStart is done and variables set there may still be blank for a moment."
    }
  ],
  relatedTools: ["onstart-to-named-formulas", "csv-to-power-fx-table", "power-fx-formatter"],
  relatedPatterns: ["power-apps-concurrent-load-data-faster", "power-apps-monitor-debug-performance-trace", "use-named-formulas-for-app-constants", "power-apps-current-user-profile-cache"],
  relatedLinks: [
    { href: "/guides/power-fx-named-formulas-explained", label: "Named formulas explained" },
    { href: "/guides/speed-up-slow-power-fx-formulas", label: "Speed up slow Power Fx formulas" },
    { href: "/guides/power-apps-delegation-warning-explained", label: "The delegation warning explained" }
  ],
  sources: [
    powerFxDoc("reference/function-concurrent", "Concurrent function"),
    powerFxDoc("reference/object-app", "App object: Formulas, OnStart and StartScreen properties"),
    canvasDoc("fast-app-page-load", "Fast app or page load"),
    canvasDoc("small-data-payloads", "Small data payloads")
  ]
};

export const textFormatGuide: Guide = {
  slug: "power-fx-text-function-format-dates-numbers-currency",
  title: "Format dates, numbers and currency in Power Apps with the Text function",
  shortTitle: "Format with the Text function",
  description: "How to use the Text function to format dates, times, numbers and currency in Power Apps, with a table of format codes, the ready-made date formats, how to format for another language, and the mistakes that give the wrong month or no formatting at all.",
  eyebrow,
  keywords: ["Power Apps Text function", "Power Apps format date", "Power Apps format number with commas", "Power Apps currency format", "Power Apps date format dd/mm/yyyy"],
  published,
  updated: published,
  quickAnswer: "Text(value, format) turns a number or a date into text in the layout you choose. For numbers, 0 shows a digit always and # shows it only when needed, so Text(1234.5, \"#,##0.00\") gives 1,234.50. For dates, use d, m, y, h and s codes, so Text(Today(), \"dd mmm yyyy\") gives 20 Nov 2026. For dates that should follow each user's own region, use a ready-made format such as DateTimeFormat.ShortDate. The result is text, so format at the last moment, for display only.",
  sections: [
    section(
      "basics",
      "The two ways to call Text",
      code(`// A ready-made format, which follows the user's language and region
Text(Now(), DateTimeFormat.ShortDateTime)

// A custom format, which you spell out
Text(Now(), "dd/mm/yyyy hh:mm")`),
      p("Both return text. `Text` with only a value, such as `Text(42)`, converts the value with a default format, which is useful when a function needs text."),
      p("Microsoft's reference says the ready-made formats are the preferred choice for dates and times, because they adjust to each user's language and region on their own. Use a custom format when the layout is fixed by the business, such as a reference number or a file name.")
    ),
    section(
      "numbers",
      "Numbers",
      table(
        ["Code", "Meaning"],
        ["`0`", "A digit that is always shown, with a zero if the number has none there"],
        ["`#`", "A digit that is shown only when the number has one there"],
        ["`.`", "The decimal point"],
        ["`,`", "The thousands separator, when it sits between `#` or `0` codes"]
      ),
      table(
        ["Formula", "Result"],
        ["`Text(1234.5, \"#,##0.00\")`", "1,234.50"],
        ["`Text(1234.56, \"#,##0\")`", "1,235"],
        ["`Text(0.5, \"0.00\")`", "0.50"],
        ["`Text(0.5, \"#.##\")`", ".5"],
        ["`Text(7, \"000\")`", "007"],
        ["`Text(1234567, \"#,##0\")`", "1,234,567"]
      ),
      p("The number is rounded to the number of decimal places in the format. If the whole part has more digits than the format has codes, the extra digits are still shown, so `\"#,##0\"` is enough for any size of number."),
      p("Use `0` for the last digit before the decimal point. With `\"#.##\"`, a value below one loses its leading zero."),
      p("For a percentage, multiply and add the sign yourself."),
      code(`Text(Completed / Total * 100, "0.0") & "%"`)
    ),
    section(
      "currency",
      "Currency",
      p("A currency symbol can be typed straight into the format."),
      code(`Text(1234.5, "$#,##0.00")      // $1,234.50
Text(1234.5, "£#,##0.00")      // £1,234.50
Text(1234.5, "#,##0.00 €")     // 1,234.50 €`),
      p("The symbol is fixed by the format, but the separators follow the language of the person using the app. A user whose device is set to German sees `1.234,50 €` from the third formula. That is usually what you want."),
      p("To show negative amounts in a different way, test the value."),
      code(`If(
    Amount < 0,
    "(" & Text(Abs(Amount), "$#,##0.00") & ")",
    Text(Amount, "$#,##0.00")
)`),
      p("When the app holds amounts in several currencies, keep the currency code in its own column and put it next to the number: `Text(Amount, \"#,##0.00\") & \" \" & CurrencyCode`.")
    ),
    section(
      "dates",
      "Dates and times",
      table(
        ["Code", "Shows", "Example"],
        ["`d`, `dd`", "Day of the month, without or with a leading zero", "7, 07"],
        ["`ddd`, `dddd`", "Day of the week, short or full", "Tue, Tuesday"],
        ["`m`, `mm`", "Month as a number, without or with a leading zero", "4, 04"],
        ["`mmm`, `mmmm`", "Month name, short or full", "Apr, April"],
        ["`yy`, `yyyy`", "Year with two or four digits", "26, 2026"],
        ["`h`, `hh`", "Hour, without or with a leading zero", "8, 08"],
        ["`m`, `mm` next to hours or seconds", "Minutes", "5, 05"],
        ["`s`, `ss`", "Seconds", "9, 09"],
        ["`AM/PM`", "Switches the hour to a 12-hour clock and adds AM or PM", "8:05 PM"]
      ),
      table(
        ["Formula", "Result for 20 November 2026, 14:05"],
        ["`Text(Now(), \"dd/mm/yyyy\")`", "20/11/2026"],
        ["`Text(Now(), \"d mmmm yyyy\")`", "20 November 2026"],
        ["`Text(Now(), \"ddd d mmm\")`", "Fri 20 Nov"],
        ["`Text(Now(), \"yyyy-mm-dd\")`", "2026-11-20"],
        ["`Text(Now(), \"hh:mm\")`", "14:05"],
        ["`Text(Now(), \"h:mm AM/PM\")`", "2:05 PM"],
        ["`Text(Now(), \"yyyymmdd-hhmmss\")`", "20261120-140500"]
      ),
      p("**The letter m means two things.** It is minutes only when it comes straight after an `h` or `hh` code or straight before `ss`. Anywhere else it is the month. `Text(Now(), \"mm\")` on its own returns the month, not the minutes. To show minutes alone, take them with the `Minute` function: `Text(Minute(Now()), \"00\")`."),
      p("Without `AM/PM` in the format, hours use the 24-hour clock.")
    ),
    section(
      "ready-made",
      "The ready-made date formats",
      table(
        ["Format", "Example for a user in the United States"],
        ["`DateTimeFormat.ShortDate`", "4/7/2020"],
        ["`DateTimeFormat.LongDate`", "Tuesday, April 7, 2020"],
        ["`DateTimeFormat.ShortTime`", "8:26 PM"],
        ["`DateTimeFormat.ShortTime24`", "20:26"],
        ["`DateTimeFormat.ShortDateTime`", "4/7/2020 8:26 PM"],
        ["`DateTimeFormat.ShortDateTime24`", "4/7/2020 20:26"],
        ["`DateTimeFormat.LongDateTime`", "Tuesday, April 7, 2020 8:26:59 PM"],
        ["`DateTimeFormat.UTC`", "2020-04-08T03:26:59.180Z"]
      ),
      p("The examples are the ones in Microsoft's reference. A user in the United Kingdom sees `07/04/2020` for the same ShortDate, with no change to the formula. That is the reason to prefer these formats in an app used in more than one country."),
      p("`DateTimeFormat.UTC` converts the value to UTC and writes it in ISO 8601 form. Use it when you pass a date to a flow or an API."),
      tool("date-format-tester", "Try a format string against a sample date before you put it in the app. The tester also covers the format strings that Power Automate uses, which are different.")
    ),
    section(
      "languages",
      "Other languages and regions",
      p("Two languages are involved in a custom format, and mixing them up causes most of the surprises."),
      ul(
        "**The language the format is written in.** In `\"#,##0.00\"`, the comma and the full stop mean what they mean in English. A format without a language tag is read as US English when the app runs.",
        "**The language of the result.** Month names, day names and separators come out in the language of the person using the app."
      ),
      p("To force the result into one language whoever the user is, pass a language tag as the third argument."),
      code(`Text(1234.5, "#,##0.00", "de-DE")           // 1.234,50
Text(Date(2026, 11, 20), "d mmmm yyyy", "fr-FR")   // 20 novembre 2026
Text(Date(2026, 11, 20), "dddd", "es-ES")          // viernes`),
      p("To write the format itself in another language's conventions, start it with a language placeholder such as `[$-de-DE]`. When you type a format in Studio on a device set to another language, Studio adds that placeholder for you, which is why formulas copied from a colleague's app sometimes contain one."),
      p("Makers in regions that use a comma as the decimal separator also write formulas with semicolons between arguments. The [separators guide](/guides/power-fx-commas-vs-semicolons) covers that, and the [multi-language pattern](/patterns/power-apps-multi-language-labels-localisation) covers translating labels.")
    ),
    section(
      "back-again",
      "Text is for display only",
      p("The result of `Text` is text. It no longer sorts, adds up or compares as a number or a date. `\"9\"` sorts after `\"10\"`, and `\"20/11/2026\"` sorts before `\"21/01/2026\"`."),
      ul(
        "Keep the real value in the data and in your variables. Format it in the label that shows it.",
        "Sort and filter on the original column, never on the formatted text.",
        "To turn text back into a value, use `Value` for numbers and `DateValue` or `DateTimeValue` for dates, and expect them to follow the user's language unless you pass a language tag."
      ),
      code(`// Sort by the date, show the text
SortByColumns(Requests, "DueDate", SortOrder.Ascending)

// Label inside the gallery
Text(ThisItem.DueDate, DateTimeFormat.ShortDate)`)
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Formatting text instead of a number.** `Text(txtAmount.Text, \"#,##0.00\")` does nothing, because the input is already text. Convert it first: `Text(Value(txtAmount.Text), \"#,##0.00\")`.",
        "**Getting the month where minutes were wanted.** `mm` away from the hour code is the month.",
        "**Using Power Automate codes.** Flows use `MM` for month, `mm` for minute and `HH` for the 24-hour clock. Power Apps follows Excel's codes instead.",
        "**Saving formatted text to a date or number column.** Send the real value. The data source rejects the text or, worse, reads it in another region's order.",
        "**Showing a UTC time as local.** A date and time from a data source is shown in the user's time zone. If the value should not move, such as a date of birth, store it as a date-only column."
      ),
      note("A blank value formats to an empty text, so a label shows nothing. To show a dash instead, write `Coalesce(Text(ThisItem.DueDate, DateTimeFormat.ShortDate), \"-\")`.")
    )
  ],
  faqs: [
    {
      question: "How do I format a date as dd/mm/yyyy in Power Apps?",
      answer: "Use the Text function with a custom format: Text(DateValue, \"dd/mm/yyyy\"). For a format that follows each user's own region, use Text(DateValue, DateTimeFormat.ShortDate) instead."
    },
    {
      question: "How do I show a number with commas and two decimal places in Power Apps?",
      answer: "Use Text(Number, \"#,##0.00\"). The comma adds the thousands separator and the two zeros after the point always show two decimal places, so 1234.5 becomes 1,234.50."
    },
    {
      question: "How do I format currency in Power Apps?",
      answer: "Put the currency symbol in the format string, for example Text(Amount, \"$#,##0.00\"). The symbol stays as typed and the separators follow the language of the person using the app."
    },
    {
      question: "Why does mm return the month instead of minutes in Power Apps?",
      answer: "In a Text format, m and mm mean minutes only when they come straight after an hour code or straight before the seconds code. Anywhere else they mean the month. Write \"hh:mm\" for hours and minutes."
    },
    {
      question: "Why is my Text format not being applied?",
      answer: "The value is probably already text, such as the Text property of a text input. Text formats numbers and dates only. Convert first with Value or DateValue, then format."
    }
  ],
  relatedTools: ["date-format-tester", "power-fx-formatter", "excel-to-power-fx"],
  relatedPatterns: ["power-apps-multi-language-labels-localisation", "calculate-totals-gallery-collection", "dataverse-date-only-time-zone-behavior"],
  relatedLinks: [
    { href: "/guides/power-fx-commas-vs-semicolons", label: "Commas or semicolons in Power Fx" },
    { href: "/guides/power-fx-for-excel-users", label: "Power Fx for Excel users" },
    { href: "/cheat-sheets/power-automate-date-formatting-cheat-sheet", label: "Power Automate date formatting cheat sheet" }
  ],
  sources: [
    powerFxDoc("reference/function-text", "Text function"),
    canvasDoc("show-text-dates-times", "Show text and format dates and times in a canvas app"),
    powerFxDoc("reference/function-language", "Language function and language tags")
  ]
};
