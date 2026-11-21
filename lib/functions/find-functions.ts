import { canvasDoc, code, note, p, section, table, ul } from "../guides/types";
import { fxRef, type FunctionPage } from "./types";

const published = "2026-11-21";
const category = "Find and sort records" as const;
const delegationDoc = canvasDoc("delegation-overview", "Understand delegation in a canvas app");
const sharePointDoc = canvasDoc("connections/connection-sharepoint-online", "Connect to SharePoint from a canvas app: delegable functions");
const dataverseDoc = canvasDoc("connections/connection-common-data-service", "Connect to Microsoft Dataverse: delegable functions");

export const filterFunction: FunctionPage = {
  slug: "filter",
  name: "Filter",
  category,
  title: "Filter function in Power Apps: syntax, examples and delegation",
  description: "How the Power Fx Filter function works, how to combine conditions, how to make a dropdown or date filter optional, and which conditions SharePoint and Dataverse can run on the server.",
  keywords: ["Power Apps Filter function", "Filter multiple conditions Power Apps", "Filter gallery by dropdown", "Filter delegation SharePoint", "Power Fx Filter syntax"],
  published,
  updated: published,
  quickAnswer: "Filter(Table, Condition1, Condition2, ...) returns a table of every record for which all the conditions are true. Separate conditions with commas or join them with && for and, and use || for or. If nothing matches you get an empty table, not an error. On a large SharePoint list or Dataverse table, keep each condition to a simple comparison on a column so the data source can run it, or you only search the first 500 rows.",
  syntax: `Filter( Table, Formula1 [, Formula2, ... ] )`,
  arguments: [
    ["`Table`", "Required", "The table or data source to search."],
    ["`Formula1`, `Formula2`, ...", "At least one", "Conditions evaluated for each record. A record is kept when every condition is true. You can refer to the record's columns by name. For Dataverse, a condition can also be the name of a view."]
  ],
  returns: "A table with the same columns as `Table`, holding the records that match. An empty table when none do.",
  usableIn: "Any formula",
  delegation: "Delegable to SharePoint, Dataverse and SQL Server when each condition is one the data source supports. See [which conditions delegate](#delegation).",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Open requests
Filter(Requests, Status.Value = "Open")

// Open and overdue: both conditions must be true
Filter(Requests, Status.Value = "Open", DueDate < Today())

// Open or on hold
Filter(Requests, Status.Value = "Open" || Status.Value = "On hold")

// Requests raised by the person using the app
Filter(Requests, 'Created By'.Email = User().Email)`),
      p("A comma between conditions means the same as `&&`. Use whichever reads better, but do not mix the two in one formula without brackets, because `a || b, c` is `(a || b) && c`."),
      p("The conditions can use any column of the record. Inside `Filter`, a bare column name means the column of the record being checked. If a control or variable has the same name as a column, the column wins. Use `ThisRecord.Status` or the [disambiguation operator](/guides/fix-common-power-fx-formula-errors) to be explicit.")
    ),
    section(
      "optional-filters",
      "Filters the user can leave empty",
      p("A gallery with a status dropdown and a date picker should show everything until the user picks something. Write each condition so that it is true when its input is empty."),
      code(`Filter(
    Requests,
    IsBlank(drpStatus.Selected.Value) || Status.Value = drpStatus.Selected.Value,
    IsBlank(dpFrom.SelectedDate) || DueDate >= dpFrom.SelectedDate,
    IsBlank(dpTo.SelectedDate) || DueDate <= dpTo.SelectedDate
)`),
      p("The empty test comes first, so when the dropdown is empty the second half is not needed. Because the test only reads a control, not a column, it is the same for every record and does not stop delegation.")
    ),
    section(
      "delegation",
      "Which conditions delegate",
      p("Delegation means the data source does the filtering and sends back only the matches. When a condition cannot be delegated, Power Apps downloads the first rows, 500 by default and up to 10,000 if you raise the limit, and filters those. Studio shows a delegation warning, and records past that limit are never found."),
      table(
        ["Condition", "SharePoint", "Dataverse"],
        ["`=` on text, number, Yes/No, date, Choice or Person", "Yes", "Yes"],
        ["`<`, `>`, `<=`, `>=` on numbers and dates", "Yes, but not on the ID column", "Yes"],
        ["`StartsWith(Title, txtSearch.Text)`", "Yes", "Yes"],
        ["`IsBlank(Column)`", "No. Use `Column = Blank()` instead", "Yes, except on Choice columns"],
        ["`Not(...)` or `!`", "No", "Yes"],
        ["`txtSearch.Text in Title` (text inside a column)", "No", "Yes"],
        ["Arithmetic on a column, such as `Price * 2 > 100`", "No", "No"],
        ["`Len`, `Text`, `Value` or `If` around a column", "No", "No"]
      ),
      p("This is a summary of Microsoft's delegation tables for each connector on the day this page was checked. The warning in Studio is the final word for your formula."),
      note("Work out values before the `Filter` where you can. `Filter(Requests, DueDate < DateAdd(Today(), 7))` delegates, because `DateAdd(Today(), 7)` is the same for every record. `Filter(Requests, DateAdd(DueDate, -7) < Today())` does not, because the function is applied to the column.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Comparing a Choice or Lookup column to text.** `Status = \"Open\"` fails on a SharePoint Choice column. Compare its value: `Status.Value = \"Open\"`. See [incompatible types for comparison](/errors/incompatible-types-for-comparison-power-apps).",
        "**Using `IsBlank` on a large SharePoint list.** It is not delegated. `Column = Blank()` is, though it does not treat an empty string as blank.",
        "**Filtering a collection and expecting the full list.** A collection only holds what was loaded into it, which for a large source is the first 500 rows, or the higher limit you set.",
        "**Wrapping `Filter` around `Search` on SharePoint.** `Search` is not delegated to SharePoint, so the whole formula runs on the first rows only. Use `StartsWith` inside `Filter` instead."
      )
    )
  ],
  faqs: [
    { question: "How do I filter by more than one condition in Power Apps?", answer: "List the conditions after the table, separated by commas, as in Filter(Requests, Status.Value = \"Open\", DueDate < Today()). Every condition must be true for a record to be kept. Use || inside one condition when either of two things may be true." },
    { question: "Why does my Filter only return 500 records?", answer: "One of the conditions cannot be delegated to the data source, so Power Apps filters only the first 500 rows it downloads. Look for the delegation warning in Studio, then rewrite that condition, for example using StartsWith instead of Search on SharePoint, or Column = Blank() instead of IsBlank." },
    { question: "What does Filter return when nothing matches?", answer: "An empty table. A gallery shows no items, CountRows returns 0 and IsEmpty returns true. It is not an error and it is not blank." }
  ],
  relatedFunctions: ["lookup", "search", "sort", "countrows", "isblank"],
  relatedGuides: ["power-fx-lookup-vs-filter-vs-search", "power-apps-delegation-warning-explained"],
  relatedErrors: ["incompatible-types-for-comparison-power-apps"],
  relatedPatterns: ["avoid-delegation-warnings-sharepoint-filters", "delegation-safe-date-range-filter", "dataverse-delegation-filter-search-large-tables"],
  relatedTools: ["gallery-search-filter-builder", "power-fx-formatter", "power-apps-delegation-checker"],
  sources: [fxRef("function-filter-lookup", "Filter, Search and LookUp functions"), delegationDoc, sharePointDoc, dataverseDoc]
};

export const lookupFunction: FunctionPage = {
  slug: "lookup",
  name: "LookUp",
  category,
  title: "LookUp function in Power Apps: syntax, examples and blank results",
  description: "How the Power Fx LookUp function finds one record, how to return a single column with the third argument, what happens when nothing or several records match, and how it delegates.",
  keywords: ["Power Apps LookUp function", "LookUp return one column", "LookUp blank Power Apps", "LookUp vs First Filter", "Power Fx LookUp syntax"],
  published,
  updated: published,
  quickAnswer: "LookUp(Table, Condition) returns the first record that meets the condition, or blank if none does. Add a third argument to get one value from that record instead of the whole record, as in LookUp(Employees, Email = User().Email, Department). Use it when the condition identifies one record, such as an ID or an email address.",
  syntax: `LookUp( Table, Formula [, ReductionFormula ] )`,
  arguments: [
    ["`Table`", "Required", "The table or data source to search."],
    ["`Formula`", "Required", "The condition. The first record for which it is true is returned."],
    ["`ReductionFormula`", "Optional", "A formula evaluated on the record that was found, to reduce it to one value, such as a column name. Without it, the whole record is returned."]
  ],
  returns: "One record, or one value if you give `ReductionFormula`. Blank when no record matches.",
  usableIn: "Any formula",
  delegation: "Delegable to SharePoint and Dataverse when the condition is delegable, under the same rules as [Filter](/functions/filter#delegation).",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// The whole record
LookUp(Requests, ID = 42)

// One column of it, two ways
LookUp(Requests, ID = 42).Title
LookUp(Requests, ID = 42, Title)

// The signed-in user's row in an Employees list
LookUp(Employees, Email = User().Email)

// A form showing the item selected in a gallery, fetched fresh
LookUp(Requests, ID = galRequests.Selected.ID)`),
      p("Both ways of reading one column give the same value. The third argument says plainly which column the formula needs, which helps when you come back to it later.")
    ),
    section(
      "blank",
      "When nothing matches",
      p("`LookUp` returns blank when no record meets the condition. Reading a column of blank is also blank, so `LookUp(Employees, Email = User().Email).Department` shows nothing rather than an error. Check for it where the user needs to know."),
      code(`With(
    { me: LookUp(Employees, Email = User().Email) },
    If(IsBlank(me), "You are not in the staff list yet", "Department: " & me.Department)
)`),
      p("Store the result in `With` or a variable when you need several columns, instead of repeating the same `LookUp` for each one. Each repeat can be another call to the data source.")
    ),
    section(
      "several-matches",
      "When several records match",
      p("You get the first one the data source returns. Without a sort, that order is not something to rely on. When you want the latest record, sort first and take the first one."),
      code(`// The most recent comment on a request
First(
    Sort(
        Filter(Comments, RequestID = galRequests.Selected.ID),
        Created,
        SortOrder.Descending
    )
)`),
      note("`First(Filter(Requests, ID = 42))` and `LookUp(Requests, ID = 42)` give the same record. Prefer `LookUp`: it states what you mean, and both forms delegate.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Comparing a whole record with a value.** `LookUp(Employees, Manager = User().Email)` fails when Manager is a Person column. Compare its field: `Manager.Email = User().Email`.",
        "**Calling LookUp inside a gallery template for every row.** Each row makes its own request. For a long gallery, add the column once with [AddColumns](/functions/addcolumns) or load the lookup table into a collection.",
        "**Expecting an error when nothing matches.** You get blank, and a form with a blank `Item` shows empty fields. Test with `IsBlank`.",
        "**Using LookUp on a SharePoint ID with `<` or `>`.** Only `=` delegates on the SharePoint ID column."
      )
    )
  ],
  faqs: [
    { question: "What is the difference between LookUp and Filter?", answer: "LookUp returns one record, the first that matches, or blank. Filter returns a table of every record that matches, which may be empty. Use LookUp for a label, a form's Item or a variable, and Filter for a gallery." },
    { question: "How do I return just one column from LookUp?", answer: "Either add the column name as the third argument, LookUp(Requests, ID = 42, Title), or read it from the result, LookUp(Requests, ID = 42).Title. Both give the same value." },
    { question: "Does LookUp delegate to SharePoint?", answer: "Yes, when its condition is one SharePoint can run, such as = on a column or StartsWith on a text column. A condition that cannot be delegated means LookUp only searches the first rows it downloads." }
  ],
  relatedFunctions: ["filter", "first-last", "with", "isblank"],
  relatedGuides: ["power-fx-lookup-vs-filter-vs-search"],
  relatedErrors: ["incompatible-types-for-comparison-power-apps"],
  relatedPatterns: ["power-apps-current-user-profile-cache", "with-function-readable-power-fx-formulas"],
  relatedTools: ["power-fx-formatter", "power-apps-delegation-checker"],
  sources: [fxRef("function-filter-lookup", "Filter, Search and LookUp functions"), delegationDoc, sharePointDoc]
};

export const searchFunction: FunctionPage = {
  slug: "search",
  name: "Search",
  category,
  title: "Search function in Power Apps: search a gallery across columns",
  description: "How the Power Fx Search function finds text anywhere in one or more columns, why it does not delegate to SharePoint, and what to use instead on a large list.",
  keywords: ["Power Apps Search function", "Search multiple columns Power Apps", "Search delegation SharePoint", "Power Apps search box gallery", "Search vs StartsWith"],
  published,
  updated: published,
  quickAnswer: "Search(Table, SearchText, Column1, Column2, ...) returns the records where the text appears anywhere in any of the columns you name, ignoring capital letters. An empty search text returns every record. Dataverse can run Search on the server, but SharePoint cannot, so on a large SharePoint list use Filter with StartsWith instead.",
  syntax: `Search( Table, SearchString, Column1 [, Column2, ... ] )`,
  arguments: [
    ["`Table`", "Required", "The table or data source to search."],
    ["`SearchString`", "Required", "The text to look for. When it is blank or empty, every record is returned."],
    ["`Column1`, `Column2`, ...", "At least one", "Text columns of `Table` to look in. A record is returned if the text appears in any of them."]
  ],
  returns: "A table with the same columns as `Table`, holding the matching records.",
  usableIn: "Any formula",
  delegation: "Delegable to Dataverse on text columns. Not delegable to SharePoint.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A search box over two columns
Search(Customers, txtSearch.Text, Name, City)

// Search inside a filtered set (Dataverse)
Search(
    Filter(Accounts, Status = 'Status (Accounts)'.Active),
    txtSearch.Text,
    'Account Name',
    'Address 1: City'
)`),
      p("Searching for \"rob\" finds Robert and Bobrob alike: the match can start anywhere in the text. The columns are written as names without quotation marks. Apps built before Power Apps version 3.24042 used quoted logical names, as in `\"cr43e_name\"`, and those apps were updated to the new form automatically.")
    ),
    section(
      "columns",
      "Which columns it can look in",
      p("Only text columns of the table itself. `Search` cannot look inside a Choice, Person or Lookup column, or a number. Add a `Filter` condition for those, or search a text column that holds a copy of the value."),
      code(`// Text search plus a Choice filter
Filter(
    Search(Requests, txtSearch.Text, Title, Description),
    IsBlank(drpStatus.Selected.Value) || Status.Value = drpStatus.Selected.Value
)`)
    ),
    section(
      "sharepoint",
      "Searching a large SharePoint list",
      p("SharePoint cannot run `Search`, so Power Apps downloads the first 500 rows (or up to 10,000 if you raise the limit) and searches those. Records further down are never found. For a list that will grow, use `StartsWith`, which SharePoint can run."),
      code(`Filter(
    Customers,
    StartsWith(Title, txtSearch.Text) || StartsWith(City, txtSearch.Text)
)`),
      p("`StartsWith` matches from the start of the text only: searching \"soft\" finds Software Ltd but not Microsoft. That is the trade on SharePoint, complete results that match from the start, or matches anywhere in the first rows only. For a small list that will stay small, `Search` is fine.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Naming a Choice or Lookup column.** Search accepts text columns only and shows an error for others.",
        "**Using Search over a large SharePoint list** and not noticing the delegation warning. Users report that records are missing.",
        "**Putting the search text in quotation marks** as a column name, copied from an old example. Column names are no longer quoted.",
        "**Expecting whole-word matches.** Search finds the text anywhere, so \"art\" matches \"Martin\"."
      )
    )
  ],
  faqs: [
    { question: "Can Power Apps Search more than one column?", answer: "Yes. List every column after the search text, as in Search(Customers, txtSearch.Text, Name, City, Email). A record is returned if the text appears in any of them." },
    { question: "Is Search case sensitive?", answer: "No. Search ignores capital letters. Use Filter with the exactin operator if you need a case-sensitive match." },
    { question: "Why does Search give a delegation warning with SharePoint?", answer: "SharePoint cannot run Search on the server, so Power Apps searches only the rows it has downloaded. Use Filter with StartsWith for a large list, or move the data to Dataverse, which can run Search on text columns." }
  ],
  relatedFunctions: ["filter", "lookup", "sort"],
  relatedGuides: ["power-fx-lookup-vs-filter-vs-search", "power-apps-delegation-warning-explained"],
  relatedErrors: [],
  relatedPatterns: ["power-apps-search-with-multiple-fields", "avoid-delegation-warnings-sharepoint-filters", "dataverse-delegation-filter-search-large-tables"],
  relatedTools: ["gallery-search-filter-builder", "power-fx-formatter", "power-apps-delegation-checker"],
  sources: [fxRef("function-filter-lookup", "Filter, Search and LookUp functions"), sharePointDoc, dataverseDoc]
};

export const sortFunction: FunctionPage = {
  slug: "sort",
  name: "Sort and SortByColumns",
  category,
  title: "Sort and SortByColumns in Power Apps: sort a gallery by one or more columns",
  description: "How the Power Fx Sort and SortByColumns functions order a table, how to sort by two columns, how to let the user pick the order, and how to keep sorting delegable.",
  keywords: ["Power Apps Sort function", "SortByColumns Power Apps", "Sort by two columns Power Apps", "Sort gallery descending", "Sort delegation SharePoint"],
  published,
  updated: published,
  quickAnswer: "Sort(Table, Formula, SortOrder.Descending) orders a table by the result of a formula, usually a column name. SortByColumns(Table, \"Column1\", SortOrder.Ascending, \"Column2\", SortOrder.Descending) orders by several columns named as text. Both delegate to SharePoint and Dataverse when you sort by a plain column. Ascending is the default.",
  syntax: `Sort( Table, Formula [, SortOrder ] )
SortByColumns( Table, ColumnName1 [, SortOrder1, ColumnName2, SortOrder2, ... ] )
SortByColumns( Table, ColumnName, SortOrderTable )`,
  arguments: [
    ["`Table`", "Required", "The table to sort."],
    ["`Formula`", "Required (Sort)", "Evaluated for each record. Must give a number, text or true/false, not a record or table."],
    ["`SortOrder`", "Optional", "`SortOrder.Ascending` (the default) or `SortOrder.Descending`."],
    ["`ColumnName1`, ...", "Required (SortByColumns)", "Column names as text, in quotation marks. Sorted by the first, then the second, and so on. Every column but the last needs a sort order."],
    ["`SortOrderTable`", "Optional (SortByColumns)", "A one-column table of values giving a custom order, such as `[\"High\", \"Medium\", \"Low\"]`."]
  ],
  returns: "A new table with the same records in the new order. The original table is not changed.",
  usableIn: "Any formula",
  delegation: "Delegable to SharePoint and Dataverse when sorting by a column. In `Sort`, the formula must be a single column name to delegate. SharePoint cannot sort by Choice, Lookup or Person columns on the server.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Newest first
Sort(Requests, Created, SortOrder.Descending)

// By due date, then by title
SortByColumns(Requests, "DueDate", SortOrder.Ascending, "Title", SortOrder.Ascending)

// Sort the result of a filter
Sort(
    Filter(Requests, Status.Value = "Open"),
    DueDate
)`),
      p("Nesting `Sort` also sorts by two columns: the inner `Sort` is the second key and the outer one the first. `Sort(Sort(Contacts, FirstName), LastName)` orders by last name, then first name. `SortByColumns` says the same thing in one call and is easier to read.")
    ),
    section(
      "custom-order",
      "A custom order, such as priority",
      p("Alphabetical order puts High, Low, Medium. Give `SortByColumns` the order you want as a table of values."),
      code(`SortByColumns(Tasks, "Priority", ["High", "Medium", "Low"])`),
      p("Records whose value is not in the list are placed at the end. This form takes one column only. For a Choice column, sort a text copy of the value, or use `Sort` with a `Switch` that turns each value into a number, which works but does not delegate.")
    ),
    section(
      "user-picks",
      "Let the user choose the sort",
      code(`// A toggle or icon flips a variable: Set(varDesc, !varDesc)
SortByColumns(
    Filter(Requests, StartsWith(Title, txtSearch.Text)),
    drpSortBy.Selected.Value,
    If(varDesc, SortOrder.Descending, SortOrder.Ascending)
)`),
      p("The dropdown's items are the column names to sort by, such as `[\"Title\", \"DueDate\", \"Created\"]`. Because `SortByColumns` takes the column name as text, the choice can come from a control.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Sorting by a formula on a large data source.** `Sort(Requests, DateDiff(Created, Today()))` cannot be delegated. Sort by the column itself.",
        "**Leaving out the quotation marks in SortByColumns.** Column names there are text: `\"DueDate\"`, not `DueDate`.",
        "**Sorting a SharePoint list by a Choice or Person column** and getting a delegation warning. Sort by a text or number column, or accept that only the first rows are sorted.",
        "**Using the display name of a SharePoint column with spaces** in SortByColumns. Use its internal name, where a space is written `_x0020_`."
      )
    )
  ],
  faqs: [
    { question: "How do I sort a gallery descending in Power Apps?", answer: "Wrap the Items formula in Sort and give SortOrder.Descending as the third argument, as in Sort(Requests, Created, SortOrder.Descending)." },
    { question: "How do I sort by two columns?", answer: "Use SortByColumns with a name and order for each, as in SortByColumns(Requests, \"Status\", SortOrder.Ascending, \"DueDate\", SortOrder.Descending), or nest one Sort inside another, with the main key on the outside." },
    { question: "What is the difference between Sort and SortByColumns?", answer: "Sort takes a formula, usually a column, written without quotation marks, and one sort order. SortByColumns takes column names as text, can sort by several columns, and can take a custom order as a table of values." }
  ],
  relatedFunctions: ["filter", "first-last", "distinct"],
  relatedGuides: ["power-apps-delegation-warning-explained"],
  relatedErrors: [],
  relatedPatterns: ["avoid-delegation-warnings-sharepoint-filters"],
  relatedTools: ["gallery-search-filter-builder", "power-fx-formatter", "power-apps-delegation-checker"],
  sources: [fxRef("function-sort", "Sort and SortByColumns functions"), delegationDoc, sharePointDoc]
};

export const distinctFunction: FunctionPage = {
  slug: "distinct",
  name: "Distinct",
  category,
  title: "Distinct function in Power Apps: unique values for a dropdown",
  description: "How the Power Fx Distinct function returns each value once, why the result column is called Value, how to fill a dropdown with it, and its limits on large data sources.",
  keywords: ["Power Apps Distinct function", "Distinct dropdown Power Apps", "Distinct Value column", "remove duplicates Power Apps", "Distinct delegation"],
  published,
  updated: published,
  quickAnswer: "Distinct(Table, Formula) evaluates the formula for every record and returns a one-column table of the results with duplicates removed. The column is always called Value, so a dropdown shows it with ThisItem.Value. On a large SharePoint list it only sees the first rows, so a list of departments or categories is better kept in its own small table.",
  syntax: `Distinct( Table, Formula )`,
  arguments: [
    ["`Table`", "Required", "The table to evaluate."],
    ["`Formula`", "Required", "Evaluated for each record, usually a column name."]
  ],
  returns: "A one-column table named `Value`, each value appearing once.",
  usableIn: "Any formula",
  delegation: "Not in Microsoft's list of functions SharePoint or Dataverse can run on the server. Over a large source, it works on the first rows only.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Each department once, for a dropdown's Items
Distinct(Employees, Department)

// In alphabetical order
Sort(Distinct(Employees, Department), Value)

// The values of a SharePoint Choice column that are in use
Distinct(Requests, Status.Value)`),
      p("Set the dropdown's `Value` property, or the combo box's display field, to `Value`. Any formula that reads the selection reads `drpDept.Selected.Value`.")
    ),
    section(
      "all-option",
      "Add an \"All\" option",
      p("A filter dropdown usually needs a way to pick nothing. Put a blank or an All entry in front of the distinct values."),
      code(`// Dropdown Items
Ungroup(
    Table(
        { Items: Table({ Value: "All" }) },
        { Items: Sort(Distinct(Employees, Department), Value) }
    ),
    Items
)

// Gallery Items
Filter(
    Employees,
    drpDept.Selected.Value = "All" || Department = drpDept.Selected.Value
)`),
      p("Many makers find it simpler to turn on the dropdown's `AllowEmptySelection` property and test `IsBlank(drpDept.Selected.Value)` in the gallery filter.")
    ),
    section(
      "large",
      "Large data sources",
      p("`Distinct` is not delegated to SharePoint or Dataverse, so over a large table it returns the distinct values of the first 500 rows (or the limit you set, up to 10,000). A department that only appears further down is missing from the dropdown, and nothing warns the user."),
      ul(
        "Keep the list of values in its own table or list, such as a Departments list, and use that for the dropdown.",
        "For a SharePoint Choice column, `Choices(Requests.Status)` returns every option defined on the column, whether or not any item uses it.",
        "For a Dataverse choice, use the choice itself, such as `Choices('Status (Requests)')`."
      )
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Reading the result with the original column name.** The column is `Value`, so `ThisItem.Department` shows nothing. Use `ThisItem.Value`.",
        "**Using Distinct on a Choice column without `.Value`.** You get a table of records, not text. Write `Distinct(Requests, Status.Value)`.",
        "**Expecting complete results from a large list.** Use a separate list of values or `Choices` instead."
      )
    )
  ],
  faqs: [
    { question: "Why is the Distinct column called Value?", answer: "Distinct always returns a one-column table, and Power Fx names that column Value whatever the source column was called. Read it with ThisItem.Value or Dropdown.Selected.Value." },
    { question: "How do I remove duplicates in a Power Apps collection?", answer: "For one column, use Distinct(colItems, Column). To keep whole records, group them with GroupBy on the columns that define a duplicate and take the first record of each group." },
    { question: "Does Distinct delegate to SharePoint?", answer: "No. It works on the rows Power Apps has downloaded, 500 by default. Keep the values in a small separate list or use the Choices function for a Choice column." }
  ],
  relatedFunctions: ["sort", "groupby", "filter"],
  relatedGuides: ["power-apps-delegation-warning-explained"],
  relatedErrors: [],
  relatedPatterns: ["dataverse-choices-combo-box-canvas-app"],
  relatedTools: ["power-fx-formatter", "power-apps-delegation-checker", "gallery-search-filter-builder"],
  sources: [fxRef("function-distinct", "Distinct function"), delegationDoc]
};

export const firstLastFunction: FunctionPage = {
  slug: "first-last",
  name: "First, Last, FirstN and LastN",
  category,
  title: "First, Last, FirstN and LastN in Power Apps: take records from a table",
  description: "How the Power Fx First, Last, FirstN, LastN and Index functions return records by position, how to get the latest record, and why Last cannot be delegated.",
  keywords: ["Power Apps First function", "Power Apps Last function", "FirstN Power Apps top 10", "get latest record Power Apps", "Index function Power Fx"],
  published,
  updated: published,
  quickAnswer: "First(Table) and Last(Table) return one record. FirstN(Table, 5) and LastN(Table, 5) return a table of that many records from the start or end. Index(Table, 3) returns the record in that position, counting from 1. First delegates, but Last, FirstN and LastN do not, so to get the latest record from a large list, sort it descending and take First.",
  syntax: `First( Table )
Last( Table )
FirstN( Table [, NumberOfRecords ] )
LastN( Table [, NumberOfRecords ] )
Index( Table, RecordIndex )`,
  arguments: [
    ["`Table`", "Required", "The table to take records from."],
    ["`NumberOfRecords`", "Optional", "How many records FirstN or LastN return. One if you leave it out."],
    ["`RecordIndex`", "Required (Index)", "The position of the record, starting at 1."]
  ],
  returns: "`First`, `Last` and `Index` return a record. `FirstN` and `LastN` return a table, even for one record.",
  usableIn: "Any formula",
  delegation: "`First` is delegable. `Last`, `FirstN` and `LastN` are not, so over a large source they see only the first rows. `Index` returns an error for a position beyond the rows downloaded.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// The latest request
First(Sort(Requests, Created, SortOrder.Descending))

// The five most recent for a summary gallery
FirstN(Sort(Requests, Created, SortOrder.Descending), 5)

// The first selected item's title
First(galRequests.AllItems).Title

// The second part of a split text
Index(Split("North|South|East", "|"), 2).Value`),
      p("`Index` returns an error, not blank, if the position is less than 1, past the end of the table, or the table is empty. Guard it with `IfError` or check `CountRows` first when the table may be short.")
    ),
    section(
      "latest",
      "Getting the latest record from a large list",
      p("`Last(Requests)` looks like the obvious way to get the newest item, but `Last` is not delegated. On a list with more rows than the data row limit, it returns the last of the rows downloaded, which is not the newest item."),
      code(`// Delegable: the data source sorts, then sends one record
First(Sort(Requests, ID, SortOrder.Descending))`),
      p("The same goes for `LastN`. Sort descending and use `FirstN`, which does not delegate either but is applied to rows that are already in the right order, so the top of the sort is what you get.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Using Last for the newest record** on a large data source. Sort descending and use `First`.",
        "**Treating FirstN(Table, 1) as a record.** It is a table with one record. Use `First` when you want a record.",
        "**Reading `.Value` straight from Split** without First, Last or Index. `Split` returns a table, so pick a record first.",
        "**Counting Index from 0.** Positions start at 1."
      )
    )
  ],
  faqs: [
    { question: "How do I get the last record in Power Apps?", answer: "Sort the table descending by a date or ID column and take First, as in First(Sort(Requests, Created, SortOrder.Descending)). This delegates. Last does not, so on a large list it returns the last of the rows downloaded." },
    { question: "How do I show the top 10 items in a gallery?", answer: "Use FirstN on a sorted table, as in FirstN(Sort(Scores, Points, SortOrder.Descending), 10)." },
    { question: "What does Index do in Power Fx?", answer: "Index(Table, n) returns the record at position n, counting from 1. It returns an error when n is out of range, so check the row count or wrap it in IfError when the table may be shorter." }
  ],
  relatedFunctions: ["sort", "lookup", "split"],
  relatedGuides: ["power-apps-delegation-warning-explained"],
  relatedErrors: [],
  relatedPatterns: ["avoid-delegation-warnings-sharepoint-filters"],
  relatedTools: ["power-fx-formatter", "power-apps-delegation-checker"],
  sources: [fxRef("function-first-last", "First, FirstN, Index, Last and LastN functions"), delegationDoc]
};

export const findFunctions: FunctionPage[] = [filterFunction, lookupFunction, searchFunction, sortFunction, distinctFunction, firstLastFunction];
