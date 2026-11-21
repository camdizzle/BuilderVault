import { canvasDoc, code, note, p, section, table, ul } from "../guides/types";
import { fxRef, type FunctionPage } from "./types";

const published = "2026-11-21";
const category = "Shape and summarise tables" as const;
const delegationDoc = canvasDoc("delegation-overview", "Understand delegation in a canvas app");
const dataverseDoc = canvasDoc("connections/connection-common-data-service", "Connect to Microsoft Dataverse: delegable functions");
const shapingDoc = fxRef("function-table-shaping", "AddColumns, DropColumns, RenameColumns and ShowColumns functions");
const quotedNames = "Apps made before Power Apps version 3.24042 wrote column names here as text in quotation marks, using logical names such as `\"cr43e_name\"`. Microsoft updated those apps to the current form, with plain names, automatically, but you will still see the quoted form in older blog posts and forum answers.";

export const addColumnsFunction: FunctionPage = {
  slug: "addcolumns",
  name: "AddColumns",
  category,
  title: "AddColumns function in Power Apps: add a calculated column",
  description: "How the Power Fx AddColumns function adds calculated columns to a table, how to bring in a value from another list, and the row limit that applies to its result.",
  keywords: ["Power Apps AddColumns", "AddColumns lookup another list", "add calculated column Power Apps", "AddColumns delegation", "Power Fx AddColumns syntax"],
  published,
  updated: published,
  quickAnswer: "AddColumns(Table, NewColumn, Formula) returns a copy of the table with a new column whose value is the formula, worked out for each record. You can add several columns in one call. The table you pass in can be delegated, but the result is limited to the data row limit, 500 rows by default, so keep the input filtered.",
  syntax: `AddColumns( TableOrRecord, ColumnName1, Formula1 [, ColumnName2, Formula2, ... ] )`,
  arguments: [
    ["`TableOrRecord`", "Required", "The table or record to add columns to."],
    ["`ColumnName1`, ...", "Required", "The name of each new column. The name must not already be in the table."],
    ["`Formula1`, ...", "Required", "Evaluated for each record to give the new column's value. It can use the record's other columns."]
  ],
  returns: "A new table or record with the extra columns. The data source is not changed.",
  usableIn: "Any formula",
  delegation: "The input, such as a `Filter`, is delegated, but the output holds at most the data row limit of records (500 by default).",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A line total for each order line
AddColumns(OrderLines, LineTotal, Quantity * UnitPrice)

// Two columns in one call
AddColumns(
    Requests,
    DaysOpen, DateDiff(Created, Today()),
    IsLate, DueDate < Today()
)

// Bring in a value from another list
AddColumns(
    Requests,
    ManagerName, LookUp(Employees, Email = 'Created By'.Email, Manager)
)`),
      p(quotedNames)
    ),
    section(
      "related-lists",
      "Values from another list",
      p("The last example looks up each request's manager. It works, but each record makes its own call to the Employees list. For a gallery of 200 requests that is 200 lookups when the screen loads."),
      ul(
        "When the lookup list is small and changes rarely, load it once into a collection in the screen's `OnVisible` or the app's start, and look up from the collection.",
        "When it is large, fetch the related value only for the selected record, in a form or a details pane, instead of for every row.",
        "In Dataverse, use a real lookup column and read the related value directly, as in `ThisItem.Manager.'Full Name'`."
      ),
      note("You cannot add a column to a data source with this function. To change the columns of a SharePoint list or Dataverse table, change them there. A collection, by contrast, gains any new columns you give it in `Collect`.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Using a name that already exists.** AddColumns fails if the table has a column with that name. Pick a new name, or drop the old column first.",
        "**Sorting a large source by the new column.** `Sort(AddColumns(Requests, DaysOpen, ...), DaysOpen)` sorts only the rows that came back. Sort or filter by a real column before adding the calculated one.",
        "**Expecting the new column to be saved.** It exists only in the formula's result. To store it, `Patch` it into a real column."
      )
    )
  ],
  faqs: [
    { question: "Does AddColumns change my SharePoint list?", answer: "No. It returns a new table that exists only in the app. To add a column to the list, add it in SharePoint, then fill it with Patch." },
    { question: "How do I add a column from another list in Power Apps?", answer: "Use AddColumns with a LookUp in the formula, as in AddColumns(Requests, ManagerName, LookUp(Employees, Email = 'Created By'.Email, Manager)). For long tables, cache the other list in a collection first, because each record makes its own lookup." },
    { question: "Why does AddColumns only return 500 rows?", answer: "The result of AddColumns is limited to the data row limit, 500 by default, even when the table you pass in is delegated. Filter the input so the result is small, or raise the limit in the app settings." }
  ],
  relatedFunctions: ["showcolumns", "groupby", "lookup", "forall"],
  relatedGuides: ["power-apps-delegation-warning-explained", "speed-up-slow-power-fx-formulas"],
  relatedErrors: [],
  relatedPatterns: ["calculate-totals-gallery-collection", "power-apps-concurrent-load-data-faster"],
  relatedTools: ["power-fx-formatter"],
  sources: [shapingDoc, delegationDoc]
};

export const showColumnsFunction: FunctionPage = {
  slug: "showcolumns",
  name: "ShowColumns, DropColumns and RenameColumns",
  category,
  title: "ShowColumns, DropColumns and RenameColumns in Power Apps",
  description: "How the Power Fx ShowColumns, DropColumns and RenameColumns functions keep, remove and rename columns, with examples for collections, data tables and sending data to a flow.",
  keywords: ["Power Apps ShowColumns", "DropColumns Power Apps", "RenameColumns Power Apps", "single column table Power Apps", "send table to Power Automate"],
  published,
  updated: published,
  quickAnswer: "ShowColumns(Table, Col1, Col2) keeps only the columns you name. DropColumns(Table, Col1) removes the columns you name and keeps the rest. RenameColumns(Table, OldName, NewName) gives a column a new name. Each returns a new table and leaves the original alone. They are handy for trimming a table before you collect it, show it or send it to a flow.",
  syntax: `ShowColumns( TableOrRecord, ColumnName1 [, ColumnName2, ... ] )
DropColumns( TableOrRecord, ColumnName1 [, ColumnName2, ... ] )
RenameColumns( TableOrRecord, OldColumnName1, NewColumnName1 [, OldColumnName2, NewColumnName2, ... ] )`,
  arguments: [
    ["`TableOrRecord`", "Required", "The table or record to reshape."],
    ["`ColumnName1`, ...", "Required", "For ShowColumns, the columns to keep. For DropColumns, the columns to remove."],
    ["`OldColumnName`, `NewColumnName`", "Required (RenameColumns)", "Pairs of the existing name and the new one. The old name must exist and the new one must not."]
  ],
  returns: "A new table or record with the columns changed.",
  usableIn: "Any formula",
  delegation: "The input is delegated, but the result is limited to the data row limit, 500 records by default.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Keep only what the screen needs
ShowColumns(Requests, ID, Title, Status, DueDate)

// Remove a large column before collecting
ClearCollect(colRequests, DropColumns(Requests, Description, Attachments))

// Friendlier names for an export
RenameColumns(ShowColumns(Requests, Title, DueDate), Title, 'Request name', DueDate, 'Due on')`),
      p(quotedNames)
    ),
    section(
      "flow",
      "Sending a table to a flow",
      p("A flow that takes a table from Power Apps usually receives it as JSON text. Trim the table to the columns the flow uses, then convert it."),
      code(`MyFlow.Run(
    JSON(
        ShowColumns(galItems.AllItems, Title, Quantity, UnitPrice),
        JSONFormat.IgnoreBinaryData
    )
)`),
      p("Fewer columns means a smaller message, no gallery control properties in the payload, and a simpler schema for Parse JSON in the flow. The [Parse JSON pattern](/patterns/power-automate-parse-json-from-power-apps) shows the flow side.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Renaming to a name already in the table.** RenameColumns fails. Drop the other column first.",
        "**Dropping a column you then try to Patch back.** A record that has lost its ID column cannot be matched to the data source.",
        "**Using ShowColumns to hide columns from the user for security.** The full data is still sent to the device. Control access in the data source instead."
      )
    )
  ],
  faqs: [
    { question: "What is the difference between ShowColumns and DropColumns?", answer: "ShowColumns keeps the columns you name and removes everything else. DropColumns removes the columns you name and keeps everything else. Use whichever list is shorter." },
    { question: "How do I make a single-column table in Power Apps?", answer: "Use ShowColumns with one column, as in ShowColumns(Requests, Title). Functions that take a single-column table, such as Concatenate or Lower, can then work on it." },
    { question: "Can I rename a column in a SharePoint list with RenameColumns?", answer: "No. It renames the column only in the table it returns. To change the list itself, rename the column in SharePoint." }
  ],
  relatedFunctions: ["addcolumns", "collect", "concat"],
  relatedGuides: ["power-automate-parse-json-guide"],
  relatedErrors: [],
  relatedPatterns: ["power-automate-parse-json-from-power-apps", "respond-to-power-app-return-values-from-flow"],
  relatedTools: ["power-fx-formatter"],
  sources: [shapingDoc, delegationDoc]
};

export const groupByFunction: FunctionPage = {
  slug: "groupby",
  name: "GroupBy and Ungroup",
  category,
  title: "GroupBy function in Power Apps: group records and total each group",
  description: "How the Power Fx GroupBy and Ungroup functions group records by one or more columns, how to count and sum each group for a summary gallery, and why GroupBy does not delegate.",
  keywords: ["Power Apps GroupBy", "GroupBy sum Power Apps", "GroupBy count Power Apps", "group gallery Power Apps", "Ungroup Power Fx"],
  published,
  updated: published,
  quickAnswer: "GroupBy(Table, Column, GroupName) returns one record for each distinct value of the column, with a nested table, named GroupName, that holds that group's records. Wrap it in AddColumns to count or total each group, as in AddColumns(GroupBy(Sales, Region, Rows), Total, Sum(Rows, Amount)). GroupBy does not delegate, so it works on the rows Power Apps has downloaded.",
  syntax: `GroupBy( Table, ColumnName1 [, ColumnName2, ... ], GroupColumnName )
Ungroup( Table, GroupColumnName )`,
  arguments: [
    ["`Table`", "Required", "The table to group."],
    ["`ColumnName1`, ...", "Required", "The columns to group by. They become the columns of the result."],
    ["`GroupColumnName`", "Required", "The name of the new column that holds each group's records as a table."]
  ],
  returns: "A table with one record per group: the grouping columns plus a nested table column. `Ungroup` returns the flat table again.",
  usableIn: "Any formula",
  delegation: "Not delegable. GroupBy and Ungroup work on the records already in the app.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Requests grouped by status
GroupBy(Requests, Status, Items)

// A summary: count and total per region
AddColumns(
    GroupBy(Sales, Region, Rows),
    Orders, CountRows(Rows),
    Total, Sum(Rows, Amount)
)

// Group by two columns
GroupBy(Sales, Region, Year, Rows)`),
      p("In the summary, each record has Region, Rows, Orders and Total. Show it in a gallery with `ThisItem.Region` and `ThisItem.Total`. Add `DropColumns(..., Rows)` around it if you do not need the detail."),
      p(quotedNames)
    ),
    section(
      "choice",
      "Grouping by a Choice or Person column",
      p("Group by a plain text value. A SharePoint Choice column is a record, so add a text column first and group by that."),
      code(`GroupBy(
    AddColumns(Requests, StatusText, Status.Value),
    StatusText,
    Items
)`)
    ),
    section(
      "large",
      "Large data sources",
      p("GroupBy is in Microsoft's list of functions that cannot be delegated. On a list larger than the data row limit, the groups and totals cover only the first rows, and the numbers look plausible, which makes the gap easy to miss."),
      ul(
        "Filter first with a delegable condition, such as the current month, so the rows that come back are the complete set.",
        "For totals over a whole Dataverse table, `Sum` and `CountRows` with a delegable `Filter` are run on the server. Calculate each group's total that way when there are few groups.",
        "For reporting over large data, a Power BI report or a scheduled flow that writes totals to a summary list is often the better tool."
      )
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Grouping a Choice column directly.** Group by `.Value` copied into a text column.",
        "**Trusting totals from a large list.** GroupBy only sees the rows downloaded.",
        "**Forgetting the group column name.** The last argument is the name of the nested table, not another column to group by."
      )
    )
  ],
  faqs: [
    { question: "How do I sum by group in Power Apps?", answer: "Group the table, then add a column with Sum over each group's nested table: AddColumns(GroupBy(Sales, Region, Rows), Total, Sum(Rows, Amount))." },
    { question: "Does GroupBy delegate to SharePoint or Dataverse?", answer: "No. GroupBy and Ungroup are on Microsoft's list of non-delegable functions. Filter the data down first, or calculate the totals in the data source or in Power BI." },
    { question: "What does Ungroup do?", answer: "It reverses GroupBy, turning each group's nested table back into separate records. A common use is to group, remove some groups with Filter, then ungroup." }
  ],
  relatedFunctions: ["addcolumns", "countrows", "sum", "distinct"],
  relatedGuides: ["power-apps-delegation-warning-explained"],
  relatedErrors: [],
  relatedPatterns: ["groupby-sum-count-gallery-power-apps", "calculate-totals-gallery-collection"],
  relatedTools: ["power-fx-formatter", "power-apps-delegation-checker"],
  sources: [fxRef("function-groupby", "GroupBy and Ungroup functions"), delegationDoc]
};

export const countRowsFunction: FunctionPage = {
  slug: "countrows",
  name: "CountRows and CountIf",
  category,
  title: "CountRows and CountIf in Power Apps: count records and matches",
  description: "How the Power Fx CountRows, CountIf, Count and CountA functions count records, which counts SharePoint and Dataverse can run on the server, and the 50,000 limit on Dataverse counts.",
  keywords: ["Power Apps CountRows", "CountIf Power Apps", "count items in gallery", "CountRows delegation SharePoint", "CountRows 50000 Dataverse"],
  published,
  updated: published,
  quickAnswer: "CountRows(Table) counts the records in a table. CountIf(Table, Condition) counts the records for which the condition is true. Count and CountA count numbers and non-blank values in a one-column table. Dataverse can run CountRows and CountIf on the server, up to 50,000 records when there is a filter. SharePoint cannot, so a count over a large list is capped at the rows downloaded.",
  syntax: `CountRows( Table )
CountIf( Table, LogicalFormula )
Count( SingleColumnTable )
CountA( SingleColumnTable )`,
  arguments: [
    ["`Table`", "Required", "The table whose records to count."],
    ["`LogicalFormula`", "Required (CountIf)", "Evaluated for each record. Records where it is true are counted."],
    ["`SingleColumnTable`", "Required (Count, CountA)", "A one-column table. Count counts numbers, CountA counts values that are not blank, including empty text."]
  ],
  returns: "A number.",
  usableIn: "Any formula",
  delegation: "Delegable to Dataverse (CountRows and CountIf, with a 50,000 limit when filtered). Not in SharePoint's list of delegable functions.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Items in a gallery
CountRows(galRequests.AllItems)

// Open requests
CountIf(Requests, Status.Value = "Open")

// The same with Filter
CountRows(Filter(Requests, Status.Value = "Open"))

// How many people were selected in a combo box
CountRows(cmbPeople.SelectedItems)`),
      p("`CountIf` and `CountRows(Filter(...))` give the same answer. Use whichever reads better.")
    ),
    section(
      "dataverse",
      "Counting in Dataverse",
      p("Microsoft gives two details for Dataverse. With a filter, CountRows and CountIf are delegated up to 50,000 records. Without a filter, `CountRows(Accounts)` reads a count that Dataverse caches and updates from time to time, so it has no hard limit but may lag behind recent changes. For an exact count of a table under the limit, Microsoft suggests `CountIf(Accounts, true)`, which bypasses the cache.")
    ),
    section(
      "sharepoint",
      "Counting a large SharePoint list",
      p("SharePoint does not run counts on the server. `CountRows(Filter(Requests, Status.Value = \"Open\"))` counts the open items among the rows downloaded, and stops at the data row limit. A badge that says 500 when there are 2,300 open items is the usual symptom."),
      ul(
        "Show \"500+\" when the count reaches your limit, so users know it is not exact.",
        "Have a flow keep a running count in a separate list, or return a count from the SharePoint REST API with [Send an HTTP request to SharePoint](/patterns/send-http-request-to-sharepoint-power-automate).",
        "Move the data to Dataverse when counts and totals over large tables are central to the app."
      ),
      note("`IsEmpty(Table)` asks the simpler question \"is there anything?\". It is the same as `CountRows(Table) = 0`.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Counting `galRequests.AllItems` on a long gallery.** A gallery loads items in pages as the user scrolls, so the count may be the first page only. Count the gallery's Items formula instead.",
        "**Using Count on a table of records.** Count takes a one-column table of numbers. Use CountRows for records.",
        "**Reading a SharePoint count of 500 as exact.** It is the data row limit."
      )
    )
  ],
  faqs: [
    { question: "What is the difference between CountRows and CountIf?", answer: "CountRows counts every record in a table. CountIf counts only the records for which a condition is true. CountIf(T, Condition) gives the same number as CountRows(Filter(T, Condition))." },
    { question: "Why does CountRows stop at 500?", answer: "The count is not delegated to the data source, which is the case for SharePoint, so Power Apps counts only the rows it downloaded, 500 by default. Dataverse runs the count on the server instead." },
    { question: "How do I count items in a gallery?", answer: "CountRows(Gallery.AllItems) works for a short gallery. For a long one, count the formula in the gallery's Items property, because a gallery loads its items in pages." }
  ],
  relatedFunctions: ["filter", "sum", "isblank", "groupby"],
  relatedGuides: ["power-apps-delegation-warning-explained"],
  relatedErrors: [],
  relatedPatterns: ["groupby-sum-count-gallery-power-apps", "send-http-request-to-sharepoint-power-automate"],
  relatedTools: ["power-fx-formatter", "power-apps-delegation-checker"],
  sources: [fxRef("function-table-counts", "Count, CountA, CountIf and CountRows functions"), dataverseDoc, delegationDoc]
};

export const sumFunction: FunctionPage = {
  slug: "sum",
  name: "Sum, Average, Max and Min",
  category,
  title: "Sum, Average, Max and Min in Power Apps: totals for a gallery or table",
  description: "How the Power Fx Sum, Average, Max and Min functions total a column, how to sum a calculated value, how to handle text and blanks, and when the total is complete.",
  keywords: ["Power Apps Sum function", "Sum gallery column Power Apps", "Power Apps Average", "Power Apps Max date", "Sum delegation Dataverse"],
  published,
  updated: published,
  quickAnswer: "Sum(Table, Formula) adds up the formula's value for every record, as in Sum(OrderLines, Quantity * UnitPrice). Average, Max and Min work the same way, and each also accepts separate values, as in Max(10, 20). Only numbers count: text is ignored, so convert it with Value. Dataverse can total a number column on the server, but SharePoint cannot, so a total over a large list covers only the rows downloaded.",
  syntax: `Sum( Table, NumericalFormula )
Average( Table, NumericalFormula )
Max( Table, NumericalFormula )
Min( Table, NumericalFormula )

Sum( Number1 [, Number2, ... ] )`,
  arguments: [
    ["`Table`", "Required (table form)", "The table to work over."],
    ["`NumericalFormula`", "Required", "Evaluated for each record. Its results are added up, averaged, or compared."],
    ["`Number1`, ...", "Required (value form)", "Separate numbers to work on."]
  ],
  returns: "A number.",
  usableIn: "Any formula",
  delegation: "Delegable to Dataverse on number columns. Not delegable to SharePoint. StdevP and VarP never delegate.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Total of a column
Sum(OrderLines, LineTotal)

// Total of a calculated value
Sum(OrderLines, Quantity * UnitPrice)

// Total of what is shown in a gallery
Sum(galLines.AllItems, Value(txtQty.Text) * UnitPrice)

// The largest order and the average score
Max(Orders, Amount)
Average(Reviews, Score)`),
      p("Summing a text input inside a gallery needs `Value`, because the input's Text is text. `Sum` ignores text values, so without `Value` the total is 0 and nothing tells you why.")
    ),
    section(
      "format",
      "Showing the total",
      code(`// As currency, with two decimal places
Text(Sum(OrderLines, LineTotal), "$#,##0.00")

// Rounded to a whole number
Round(Average(Reviews, Score), 0)`),
      p("See the [Text function](/functions/text) for format codes, and the [currency formatting guide](/guides/power-fx-text-function-format-dates-numbers-currency) for other languages.")
    ),
    section(
      "large",
      "When the total is complete",
      table(
        ["Data source", "Sum, Average, Max, Min"],
        ["Collection or gallery items", "Always complete for what is in the app"],
        ["Dataverse number column", "Run on the server, complete"],
        ["Dataverse, summing a formula like `Quantity * UnitPrice`", "Not delegated: first rows only"],
        ["SharePoint list", "Not delegated: first rows only"]
      ),
      p("For a total that must be exact over a large SharePoint list, store the line total in its own number column, move the data to Dataverse, or calculate the total in a flow or Power BI.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Summing a text column or text input.** Text is ignored. Use `Value(...)`.",
        "**Summing a formula over Dataverse and expecting delegation.** Only a plain column is sent to the server.",
        "**Average of an empty table.** There is nothing to divide by, so you can get an error instead of 0. Check `IsEmpty` first or wrap it in `IfError`."
      )
    )
  ],
  faqs: [
    { question: "How do I sum a column in a Power Apps gallery?", answer: "Use Sum over the gallery's items or its data source, as in Sum(galLines.AllItems, LineTotal). For a value typed into a text input in each row, convert it with Value: Sum(galLines.AllItems, Value(txtQty.Text))." },
    { question: "Why does Sum return 0?", answer: "Usually because the values are text, such as a text input or a text column, and Sum ignores text. Wrap the value in Value() to convert it to a number." },
    { question: "Is Sum delegable to SharePoint?", answer: "No. Sum, Average, Max and Min are delegated to Dataverse on number columns but not to SharePoint, so a total over a large list covers only the first rows." }
  ],
  relatedFunctions: ["countrows", "groupby", "text", "addcolumns"],
  relatedGuides: ["power-fx-text-function-format-dates-numbers-currency", "power-apps-delegation-warning-explained"],
  relatedErrors: [],
  relatedPatterns: ["calculate-totals-gallery-collection", "groupby-sum-count-gallery-power-apps"],
  relatedTools: ["power-fx-formatter", "power-apps-delegation-checker"],
  sources: [fxRef("function-aggregates", "Average, Max, Min, StdevP, Sum and VarP functions"), dataverseDoc, delegationDoc]
};

export const concatFunction: FunctionPage = {
  slug: "concat",
  name: "Concat and Concatenate",
  category,
  title: "Concat and Concatenate in Power Apps: join text and tables",
  description: "How the Power Fx Concat function joins a value from every record into one text, how Concatenate and the & operator join separate texts, and how to build an email list from a combo box.",
  keywords: ["Power Apps Concat", "Concat combo box emails semicolon", "Concatenate Power Apps", "join text Power Apps", "Concat separator"],
  published,
  updated: published,
  quickAnswer: "Concat(Table, Formula, Separator) works out the formula for each record and joins the results into one text, with the separator between them. Concat(cmbPeople.SelectedItems, Email, \"; \") gives a list of email addresses. Concatenate(\"a\", \"b\") and \"a\" & \"b\" join separate texts. Concat is not delegable, so use it on a filtered table or on what is already in the app.",
  syntax: `Concat( Table, Formula [, Separator ] )
Concatenate( String1 [, String2, ... ] )`,
  arguments: [
    ["`Table`", "Required (Concat)", "The table to work over."],
    ["`Formula`", "Required (Concat)", "Evaluated for each record. The results are joined."],
    ["`Separator`", "Optional (Concat)", "Text placed between the results, such as `\", \"`. Nothing if you leave it out."],
    ["`String1`, ...", "Required (Concatenate)", "Texts, or a one-column table of texts, to join."]
  ],
  returns: "Text. `Concatenate` given a table returns a table of texts.",
  usableIn: "Any formula",
  delegation: "Concat is not delegable. It joins the records already in the app.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Email addresses of the people picked in a combo box
Concat(cmbPeople.SelectedItems, Email, "; ")

// Titles of the gallery rows the user ticked
Concat(Filter(galItems.AllItems, chkPick.Value), Title, ", ")

// Joining separate texts
"Hello " & User().FullName
Concatenate("Request ", Text(ThisItem.ID), " is ", ThisItem.Status.Value)`),
      p("The separator argument goes only between values, so there is no trailing comma to strip. Older formulas often add the separator inside the formula and then trim it with `Left`; the third argument makes that unnecessary.")
    ),
    section(
      "flow",
      "Sending a list to a flow or an email",
      p("Office 365 Outlook and Power Automate take several recipients as one text separated by semicolons. `Concat` with `\";\"` is the usual way to build it from a combo box or a gallery."),
      code(`Office365Outlook.SendEmailV2(
    Concat(cmbPeople.SelectedItems, Email, ";"),
    "Request " & Text(varRequest.ID) & " needs your review",
    "Open the app to review it."
)`)
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Concat over a large data source.** It only joins the rows downloaded. Filter first.",
        "**Joining a number without Text.** `\"Total: \" & 5` works, but use `Text` when you need a format, such as `Text(Total, \"#,##0.00\")`.",
        "**Mixing up Concat and Concatenate.** Concat works over a table's records. Concatenate joins separate texts."
      )
    )
  ],
  faqs: [
    { question: "How do I get a semicolon-separated list of emails from a combo box?", answer: "Use Concat(ComboBox.SelectedItems, Email, \";\"). For a people picker connected to Office 365 Users the column is often Mail instead of Email." },
    { question: "What is the difference between Concat and Concatenate?", answer: "Concat applies a formula to every record of a table and joins the results into one text. Concatenate joins separate texts, the same as the & operator." },
    { question: "How do I split a joined text back into a table?", answer: "Use Split with the same separator, as in Split(\"a;b;c\", \";\"). It returns a one-column table named Value." }
  ],
  relatedFunctions: ["split", "text", "forall"],
  relatedGuides: ["power-fx-text-function-format-dates-numbers-currency"],
  relatedErrors: [],
  relatedPatterns: [],
  relatedTools: ["power-fx-formatter"],
  sources: [fxRef("function-concatenate", "Concat and Concatenate functions"), delegationDoc]
};

export const splitFunction: FunctionPage = {
  slug: "split",
  name: "Split",
  category,
  title: "Split function in Power Apps: break text into a table",
  description: "How the Power Fx Split function turns delimited text into a table, how to pick one part with First, Last or Index, and how to trim spaces from the results.",
  keywords: ["Power Apps Split function", "Split text by comma Power Apps", "Split get first part", "Split Index Power Fx", "Split Value column"],
  published,
  updated: published,
  quickAnswer: "Split(Text, Separator) breaks the text at each separator and returns a one-column table named Value, without the separators. Take one part with First, Last or Index, as in Index(Split(\"North|South|East\", \"|\"), 2).Value. If the separator is not found, you get the whole text as a single row.",
  syntax: `Split( Text, Separator )`,
  arguments: [
    ["`Text`", "Required", "The text to split."],
    ["`Separator`", "Required", "The text to split at. It can be more than one character. An empty separator splits every character apart."]
  ],
  returns: "A one-column table named `Value`.",
  usableIn: "Any formula",
  delegation: "Not relevant: Split works on a text value, not a data source.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A table of three rows: "red", "green", "blue"
Split("red,green,blue", ",")

// The domain of an email address
Last(Split(User().Email, "@")).Value

// The second part
Index(Split("North|South|East", "|"), 2).Value

// Tags typed into a text box, without spaces around them
ForAll(Split(txtTags.Text, ","), Trim(ThisRecord.Value))`),
      p("The last example returns a table of trimmed tags. A user typing \"red, green\" would otherwise get \" green\" with a leading space.")
    ),
    section(
      "multi-select",
      "Storing several choices in one text column",
      p("Joining choices into one text column with `Concat` and splitting them back with `Split` is a common way to store a multi-select in a list that has no multi-select column."),
      code(`// Save
Patch(Requests, varRecord, { Tags: Concat(cmbTags.SelectedItems, Value, ";") })

// Show in a combo box's DefaultSelectedItems
Split(ThisItem.Tags, ";")`),
      note("This is fine for display. Filtering by one of the values with `\"red\" in Tags` is not delegated to SharePoint, so for a list that will grow, a real multi-choice or related table is better.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Reading `.Value` on the table.** Split returns a table. Pick a record with First, Last or Index first.",
        "**Index past the end.** If the text has fewer parts than you expect, Index returns an error. Use IfError or check CountRows.",
        "**Splitting on \", \" when users type \",\".** Split on the bare separator and Trim each part."
      )
    )
  ],
  faqs: [
    { question: "How do I get the first word of a text in Power Apps?", answer: "Use First(Split(MyText, \" \")).Value. For the last word, use Last instead of First." },
    { question: "What does Split return if the separator is not found?", answer: "A table with one row that holds the whole text." },
    { question: "Can Split use more than one character as a separator?", answer: "Yes. The separator is matched as a whole, so Split(Text, \" - \") splits only at space, hyphen, space. To split on a pattern, use MatchAll with a regular expression." }
  ],
  relatedFunctions: ["concat", "first-last", "forall"],
  relatedGuides: [],
  relatedErrors: [],
  relatedPatterns: [],
  relatedTools: ["power-fx-formatter"],
  sources: [fxRef("function-split", "Split function"), fxRef("function-first-last", "First, FirstN, Index, Last and LastN functions")]
};

export const shapeFunctions: FunctionPage[] = [addColumnsFunction, showColumnsFunction, groupByFunction, countRowsFunction, sumFunction, concatFunction, splitFunction];
