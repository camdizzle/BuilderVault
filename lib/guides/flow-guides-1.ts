import { automateDoc, code, learnDoc, note, ol, p, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-20";
const eyebrow = "Power Automate how-to";

export const getItemsFilterQueryGuide: Guide = {
  slug: "sharepoint-get-items-filter-query",
  title: "Write a SharePoint Get items Filter Query for every column type",
  shortTitle: "Get items Filter Query by column type",
  description: "How to write the Filter Query in the SharePoint Get items action for text, number, yes/no, choice, person, lookup and date columns, with the operators that work, the quoting rules and a way to test a filter.",
  eyebrow,
  keywords: ["Power Automate Get items filter query", "SharePoint OData filter", "Filter Query choice column", "Filter Query person column", "Get items filter"],
  published,
  updated: published,
  quickAnswer: "A Filter Query is an OData expression in the form: internal column name, operator, value. Text and dates go in single quotes and numbers do not, for example Status eq 'Approved' or Amount gt 1000. Use the column's internal name, join conditions with and or or, and read a person or lookup column through one of its fields, such as AssignedTo/EMail. SharePoint filters the list before it returns anything, so the flow receives only the matching items.",
  sections: [
    section(
      "what-it-is",
      "What the Filter Query does",
      p("The **Get items** action reads items from a SharePoint list. Without a filter it returns the first 100 items of the whole list, and the flow then has to sort out which ones it wanted. With a Filter Query, SharePoint does the selecting and sends back only the matches."),
      p("That matters for three reasons."),
      ul(
        "**Speed.** The flow receives ten items in place of ten thousand.",
        "**Correctness.** Get items stops at 100 items unless you raise **Top Count** or turn on pagination. A filter applied later in the flow never sees the items that were cut off.",
        "**Cost.** Every action inside an Apply to each counts as a request. Fewer items means fewer loop runs."
      ),
      p("The Filter Query box is on the action itself in the classic designer, under **Show advanced options**. In the new designer it is in the **Advanced parameters** list on the action's Parameters tab."),
      tool("odata-filter-query-builder", "Pick the column type, operator and value for each condition, and the builder writes the Filter Query with the right quotes and column path.")
    ),
    section(
      "operators",
      "The operators that work",
      p("SharePoint supports a small set of OData operators. Everything in a Filter Query is built from these."),
      table(
        ["Operator", "Meaning", "Example"],
        ["`eq`", "Equals", "`Status eq 'Approved'`"],
        ["`ne`", "Does not equal", "`Status ne 'Closed'`"],
        ["`gt`, `ge`", "Greater than, greater than or equal", "`Amount ge 1000`"],
        ["`lt`, `le`", "Less than, less than or equal", "`Amount lt 500`"],
        ["`and`, `or`", "Join conditions", "`Status eq 'Open' and Amount gt 1000`"],
        ["`startswith`", "Text starts with", "`startswith(Title, 'INV-')`"],
        ["`substringof`", "Text contains", "`substringof('urgent', Title)`"]
      ),
      p("Two details catch people out. `substringof` takes the search text first and the column second, the reverse of `startswith`. And the operators are lowercase words, not symbols: `=`, `>` and `<>` do not work."),
      p("Use brackets when you mix `and` and `or`, so the grouping is not left to chance."),
      code(`(Status eq 'Open' or Status eq 'In progress') and Amount gt 1000`, "Filter Query"),
      note("`contains`, `endswith` and `not` are not supported by the SharePoint connector. Use `substringof` for contains. For the other two, filter as far as you can in the Filter Query and finish with a [Filter array](/guides/filter-query-vs-filter-array-vs-condition) action.")
    ),
    section(
      "by-column-type",
      "One filter for each column type",
      p("The value on the right has to match the column type. This table has the form for each one. Every column name is the internal name. See [internal column names](/guides/sharepoint-internal-column-names-power-automate) if a column has a space in its title or has ever been renamed."),
      table(
        ["Column type", "Filter Query", "Note"],
        ["Single line of text", "`Title eq 'Laptop request'`", "Single quotes around the value."],
        ["Number, currency", "`Amount gt 1000`", "No quotes."],
        ["Yes/No", "`Approved eq 1`", "Use 1 for Yes and 0 for No."],
        ["Choice", "`Status eq 'Approved'`", "Compare the choice text directly."],
        ["Person", "`AssignedTo/EMail eq 'sam@contoso.com'`", "EMail has a capital M."],
        ["Person, by ID", "`AssignedToId eq 12`", "The column name followed by Id."],
        ["Lookup", "`Project/Title eq 'Apollo'`", "Compares the looked-up item's Title."],
        ["Lookup, by ID", "`ProjectId eq 7`", "The column name followed by Id."],
        ["Date and time", "`DueDate lt '2026-12-31T00:00:00Z'`", "ISO format in single quotes."],
        ["ID", "`ID eq 42`", "No quotes."]
      ),
      p("Some columns do not work in a Filter Query: calculated columns, multiple lines of text, and columns that allow several choices or several people. For those, filter on the other columns first and then use Filter array on the result."),
      p("Date filters have enough traps to need their own page. See [filter SharePoint items by date](/guides/power-automate-filter-query-by-date).")
    ),
    section(
      "dynamic-values",
      "Use a value from the flow",
      p("Most filters compare a column with a value from the trigger or an earlier action. Pick the value from dynamic content, and keep the single quotes around it when the column is text or a date."),
      code(`Status eq 'Approved' and Department eq '@{triggerBody()?['Department']?['Value']}'`, "Filter Query"),
      p("The designer shows the dynamic value as a coloured token between the quotes. In code view it appears as `@{...}`. The quotes belong to the filter, and the token supplies the text between them."),
      p("For a number, leave the quotes out."),
      code(`Amount gt @{triggerBody()?['Threshold']}`, "Filter Query")
    ),
    section(
      "apostrophes",
      "Quotes and the apostrophe trap",
      p("A value such as O'Brien ends the text early, because the apostrophe is read as the closing quote. The flow then fails with **The query is not valid**."),
      p("In OData, an apostrophe inside a value is written twice. When the value comes from the flow, double the apostrophes with `replace`."),
      code(`Title eq '@{replace(triggerBody()?['Title'], '''', '''''')}'`, "Filter Query"),
      p("Inside an expression, a single quote is itself written as two single quotes. So `''''` is one apostrophe and `''''''` is two.")
    ),
    section(
      "empty-values",
      "Filter for empty values",
      p("Compare with `null`, without quotes."),
      code(`DueDate eq null

AssignedToId ne null`, "Filter Query"),
      p("For a person or lookup column, test the Id form of the column, as in the second line. An empty text column that once held a value can hold an empty text value instead of null, so check both when it matters."),
      code(`Notes eq null or Notes eq ''`, "Filter Query")
    ),
    section(
      "limits",
      "Limits to know about",
      ul(
        "**100 items by default.** Set **Top Count** to raise the number, up to 5,000 in one request. For more, turn on pagination in the action's settings. The [5,000 items pattern](/patterns/get-more-than-5000-items-power-automate) covers the options.",
        "**Lists over 5,000 items.** A filter on a column that is not indexed can fail with the list view threshold error. Index the columns you filter on and put the most selective condition first.",
        "**Twelve lookup columns.** Person, lookup and managed metadata columns all count as lookups. A list with more than twelve of them fails with a lookup column threshold error. Set **Limit Columns by View** to a view that shows fewer of those columns."
      )
    ),
    section(
      "test",
      "Test a filter before the flow depends on it",
      ol(
        "Add a manually triggered flow with one Get items action.",
        "Enter the Filter Query with fixed values in place of dynamic content, and set Top Count to 5.",
        "Run the flow and open the action's outputs. Check that the items returned are the ones you expected, and that there are not zero of them.",
        "Swap the fixed values for dynamic content one at a time, running the flow after each change."
      ),
      p("A filter that returns nothing does not fail. Get items succeeds with an empty list, and every later step is skipped or does nothing. If a flow runs and seems to do nothing, check the number of items Get items returned before anything else.")
    )
  ],
  faqs: [
    {
      question: "Why does my Filter Query return no items?",
      answer: "The usual causes are a display name used in place of the internal column name, a value with different spelling from the one stored, a date compared without single quotes, and a person column compared without the /EMail path. Run Get items with one condition at a time to find which one removes every item."
    },
    {
      question: "Can I use contains in a SharePoint Filter Query?",
      answer: "Not by that name. SharePoint uses substringof with the search text first and the column second, for example substringof('urgent', Title). The contains function works in Dataverse filters, not SharePoint ones."
    },
    {
      question: "How do I filter a choice column in Get items?",
      answer: "For a single-choice column, compare the internal column name with the choice text in single quotes, such as Status eq 'Approved'. A column that allows several choices cannot be filtered reliably in a Filter Query, so filter on other columns and then use a Filter array action."
    },
    {
      question: "How do I filter by the person assigned to an item?",
      answer: "Use the email field of the person column, such as AssignedTo/EMail eq 'sam@contoso.com', with a capital M in EMail. To filter by the person's SharePoint user ID, add Id to the column name, such as AssignedToId eq 12."
    },
    {
      question: "Is a Filter Query case sensitive?",
      answer: "The operators must be lowercase and the column names must match the internal names exactly. Do not rely on the case of the values being ignored. Store values consistently, for example in a choice column, so the filter always matches."
    },
    {
      question: "Why does Get items return only 100 items?",
      answer: "100 is the default page size. Set Top Count to a higher number, up to 5,000, or turn on pagination in the action settings to return more."
    }
  ],
  relatedTools: ["odata-filter-query-builder", "sharepoint-internal-name-helper"],
  relatedPatterns: ["use-odata-filters-sharepoint-text-fields", "get-more-than-5000-items-power-automate", "filter-array-instead-of-apply-to-each"],
  relatedLinks: [
    { href: "/guides/power-automate-filter-query-by-date", label: "Filter SharePoint items by date" },
    { href: "/errors/the-query-is-not-valid-get-items", label: "Error: The query is not valid" },
    { href: "/errors/column-does-not-exist-deleted-by-another-user", label: "Error: Column does not exist" }
  ],
  sources: [
    automateDoc("sharepoint-overview", "Use SharePoint and Power Automate to build workflows"),
    learnDoc("sharepoint/dev/sp-add-ins/use-odata-query-operations-in-sharepoint-rest-requests", "Use OData query operations in SharePoint REST requests"),
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows"),
    learnDoc("azure/logic-apps/workflow-definition-language-functions-reference", "Reference guide to workflow expression functions")
  ]
};

export const filterByDateGuide: Guide = {
  slug: "power-automate-filter-query-by-date",
  title: "Filter SharePoint items by date in a flow: today, the last 7 days or a date range",
  shortTitle: "Filter SharePoint items by date",
  description: "Filter Query examples for dates in the SharePoint Get items action: today, overdue, the last 7 days, this month and a from and to range, with the time zone fix that stops today's items going missing.",
  eyebrow,
  keywords: ["Power Automate filter query date", "Get items filter by date", "filter query today", "filter query last 7 days", "utcNow filter query"],
  published,
  updated: published,
  quickAnswer: "Put the date in single quotes in ISO format and compare with ge, gt, le or lt, for example DueDate lt '2026-12-31T00:00:00Z'. For a moving date, build it with an expression such as addDays(utcNow(), -7). To match one whole day, use a range from the start of that day to the start of the next one. SharePoint stores times in UTC, so work out the start of the day in your own time zone first.",
  sections: [
    section(
      "format",
      "The format a date filter needs",
      p("A date in a Filter Query is text in single quotes, written in ISO 8601 order: year, month, day, then an optional time."),
      code(`DueDate lt '2026-12-31'

Created ge '2026-12-01T00:00:00Z'`, "Filter Query"),
      p("Without the quotes the flow fails with **The query is not valid**. A date in another order, such as 31/12/2026, fails the same way or matches nothing."),
      p("The `Z` at the end means UTC. SharePoint stores every date and time in UTC, whatever time zone the site shows. That one fact explains most date filters that miss items."),
      tool("odata-filter-query-builder", "Choose a date column and an operator, and the builder writes the condition with the quotes and the ISO format in place.")
    ),
    section(
      "moving-dates",
      "Dates that move with the calendar",
      p("A scheduled flow needs dates worked out at run time. `utcNow()` returns the current moment and the functions below shift it."),
      table(
        ["You want", "Expression"],
        ["Now", "`utcNow()`"],
        ["Seven days ago", "`addDays(utcNow(), -7)`"],
        ["Thirty days from now", "`addDays(utcNow(), 30)`"],
        ["Midnight at the start of today, UTC", "`startOfDay(utcNow())`"],
        ["The first day of this month", "`startOfMonth(utcNow())`"],
        ["Two hours ago", "`addHours(utcNow(), -2)`"]
      ),
      p("Type the filter, then put the cursor between the quotes and add the expression from the expression editor. In code view the result looks like this."),
      code(`Created ge '@{addDays(utcNow(), -7)}'`, "Filter Query")
    ),
    section(
      "common-filters",
      "The filters people need most",
      p("Items created in the last 7 days:"),
      code(`Created ge '@{addDays(utcNow(), -7)}'`, "Filter Query"),
      p("Items that are overdue and still open:"),
      code(`DueDate lt '@{utcNow()}' and Status ne 'Closed'`, "Filter Query"),
      p("Items due in the next 3 days, for a reminder flow:"),
      code(`DueDate ge '@{utcNow()}' and DueDate le '@{addDays(utcNow(), 3)}'`, "Filter Query"),
      p("Items created this month:"),
      code(`Created ge '@{startOfMonth(utcNow())}'`, "Filter Query"),
      p("Items modified since the flow last ran, for an hourly schedule:"),
      code(`Modified ge '@{addHours(utcNow(), -1)}'`, "Filter Query")
    ),
    section(
      "one-day",
      "Match one whole day",
      p("`DueDate eq '2026-12-31'` looks right and often returns nothing. A date and time column holds a time as well, and `eq` only matches when the time is the same too."),
      p("Ask for a range instead: from the start of the day up to, and not including, the start of the next day."),
      code(`DueDate ge '@{startOfDay(utcNow())}' and DueDate lt '@{startOfDay(addDays(utcNow(), 1))}'`, "Filter Query"),
      p("The range works for both kinds of date column, so it is the safe choice. For a column set to **Date only**, comparing with the date alone also works."),
      code(`DueDate eq '@{formatDateTime(utcNow(), 'yyyy-MM-dd')}'`, "Filter Query")
    ),
    section(
      "time-zone",
      "Fix the time zone gap",
      p("`startOfDay(utcNow())` is midnight in UTC. If you work in New York, that moment is 7 or 8 in the evening of the day before. A filter for today then includes yesterday evening and leaves out this evening."),
      p("The fix has three steps: convert now to local time, take the start of that local day, and convert the result back to UTC for the filter."),
      code(`convertToUtc(
  startOfDay(convertFromUtc(utcNow(), 'Eastern Standard Time')),
  'Eastern Standard Time'
)`, "Expression"),
      p("Put that expression in a **Compose** action called Start of today, add a second Compose that adds one day to it, and use the two outputs in the filter."),
      code(`DueDate ge '@{outputs('Start_of_today')}' and DueDate lt '@{outputs('Start_of_tomorrow')}'`, "Filter Query"),
      p("The time zone name is the Windows name, such as `GMT Standard Time`, `W. Europe Standard Time` or `AUS Eastern Standard Time`. These names cover daylight saving time, even though they say Standard."),
      tool("date-format-tester", "Check what a UTC time becomes in your time zone, and find the Windows time zone name to use in the expression.")
    ),
    section(
      "date-range",
      "A reusable from and to range",
      p("When a user picks the dates, for example in an instant flow with two date inputs, make the end of the range the day after the To date. That includes everything on the last day."),
      code(`Created ge '@{triggerBody()?['date']}' and Created lt '@{addDays(triggerBody()?['date_1'], 1)}'`, "Filter Query"),
      p("Add Order By so the results come back in a predictable order."),
      code(`Created desc`, "Order By")
    ),
    section(
      "check",
      "Check a date filter",
      ol(
        "Put the date expression in a Compose action first and run the flow. The output shows the exact value SharePoint will receive.",
        "Compare it with the raw value of an item you expect to match. Open the Get items output from a run without a filter to see the stored UTC value.",
        "If an item sits just outside the range, the cause is the time zone. If no items match at all, check the quotes and the internal column name."
      )
    )
  ],
  faqs: [
    {
      question: "How do I filter Get items by today's date?",
      answer: "Use a range from the start of today to the start of tomorrow: DueDate ge the start of today and DueDate lt the start of tomorrow. Build both values with startOfDay, and convert from your own time zone if the list is used outside UTC."
    },
    {
      question: "Why does my date filter return nothing?",
      answer: "Check that the date is in single quotes, in ISO order, and that the column name is the internal name. If you compare with eq on a date and time column, switch to a range, because eq only matches when the time is identical."
    },
    {
      question: "Can I use utcNow in a Filter Query?",
      answer: "Yes. Add it as an expression between the single quotes, which appears in code view as Created ge '@{utcNow()}'. Combine it with addDays, addHours, startOfDay or startOfMonth to move the date."
    },
    {
      question: "Why are items from late in the day missing from my filter?",
      answer: "SharePoint stores times in UTC. Midnight UTC is a different moment from midnight where you are, so a filter built on startOfDay(utcNow()) is offset by your distance from UTC. Work out the start of the local day and convert it to UTC before filtering."
    },
    {
      question: "How do I filter between two dates?",
      answer: "Join two conditions with and: the column ge the from date, and the column lt the day after the to date. Using lt with the following day includes every item on the last day, whatever its time."
    }
  ],
  relatedTools: ["odata-filter-query-builder", "date-format-tester", "recurrence-schedule-planner"],
  relatedPatterns: ["convert-time-zone-format-date-power-automate", "power-automate-reminder-before-due-date", "power-automate-compose-date-formatting"],
  relatedLinks: [
    { href: "/guides/sharepoint-get-items-filter-query", label: "Get items Filter Query by column type" },
    { href: "/cheat-sheets/power-automate-date-formatting-cheat-sheet", label: "Power Automate Date Formatting Cheat Sheet" },
    { href: "/errors/datetime-string-must-match-iso-8601-format", label: "Error: The datetime string must match ISO 8601 format" }
  ],
  sources: [
    learnDoc("azure/logic-apps/workflow-definition-language-functions-reference", "Reference guide to workflow expression functions"),
    learnDoc("sharepoint/dev/sp-add-ins/use-odata-query-operations-in-sharepoint-rest-requests", "Use OData query operations in SharePoint REST requests"),
    learnDoc("windows-hardware/manufacture/desktop/default-time-zones", "Default time zones")
  ]
};

export const dataverseFilterRowsGuide: Guide = {
  slug: "dataverse-list-rows-filter-rows",
  title: "Filter Dataverse rows in a flow with List rows",
  shortTitle: "Filter Dataverse rows with List rows",
  description: "How to write the Filter rows expression in the Dataverse List rows action: logical column names, choice numbers, lookup GUIDs, dates, empty values and text search, plus Select columns, Row count and when to use FetchXML.",
  eyebrow,
  keywords: ["Power Automate list rows filter rows", "Dataverse filter rows", "Dataverse OData filter", "list rows lookup filter", "list rows choice filter"],
  published,
  updated: published,
  quickAnswer: "Filter rows takes an OData expression built from logical column names, such as statecode eq 0 and revenue gt 5000. Text goes in single quotes. Numbers, dates, true and false, and GUIDs do not. A choice column is filtered by its number, and a lookup column by the related row's GUID using the form _columnname_value. Do not type $filter= in the box.",
  sections: [
    section(
      "differences",
      "How Dataverse filters differ from SharePoint filters",
      p("Both use OData, and the comparison operators are the same: `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `and`, `or`. The values are written differently, which is why a filter copied from a SharePoint flow rarely works."),
      table(
        ["Value", "SharePoint Get items", "Dataverse List rows"],
        ["Column name", "Internal name, such as `DueDate`", "Logical name, lowercase, such as `cr1a2_duedate`"],
        ["Date", "In single quotes", "No quotes"],
        ["Choice", "The text, in quotes", "The number, no quotes"],
        ["Lookup", "`Project/Title eq 'Apollo'`", "`_cr1a2_project_value eq` the GUID"],
        ["Yes/No", "`1` or `0`", "`true` or `false`"],
        ["Contains", "`substringof('x', Title)`", "`contains(name, 'x')`"]
      ),
      tool("odata-filter-query-builder", "Switch the builder to Dataverse and it writes the lookup form, removes the quotes from dates and warns when a choice value is text instead of a number.")
    ),
    section(
      "logical-names",
      "Find the logical column name",
      p("Dataverse filters use the logical name of a column, not the display name. Logical names are lowercase and custom columns start with the publisher prefix, such as `cr1a2_priority`."),
      ol(
        "Open the table in Power Apps and select **Columns**.",
        "Select the column and expand **Advanced options**.",
        "Copy the **Logical name**."
      ),
      p("The run history is a second place to look. Open the output of a List rows action and the property names in the JSON are the logical names.")
    ),
    section(
      "by-type",
      "One filter for each column type",
      table(
        ["Column type", "Filter rows", "Note"],
        ["Text", "`name eq 'Contoso'`", "Single quotes."],
        ["Whole number, decimal, currency", "`revenue gt 5000`", "No quotes."],
        ["Yes/No", "`donotemail eq false`", "`true` or `false`, no quotes."],
        ["Choice", "`prioritycode eq 1`", "The number of the option."],
        ["Status", "`statecode eq 0`", "0 is Active on most tables."],
        ["Lookup", "`_primarycontactid_value eq 70bf4d48-34cb-ed11-b596-0022481d68cd`", "Underscore, name, `_value`. GUID without quotes."],
        ["Date and time", "`createdon ge 2026-01-01T00:00:00Z`", "ISO format, no quotes."],
        ["Empty", "`emailaddress1 eq null`", "`ne null` for not empty."]
      ),
      p("To find the number behind a choice, open the column in Power Apps and look at the **Value** beside each label. Custom choices usually start at a long number based on the publisher prefix, such as 100000000."),
      p("Join conditions with `and` and `or`, with brackets to group them."),
      code(`statecode eq 0 and (prioritycode eq 1 or revenue gt 100000)`, "Filter rows")
    ),
    section(
      "lookups",
      "Filter on a lookup",
      p("A lookup column is stored as the GUID of the related row. In a filter its name has an underscore in front and `_value` behind."),
      code(`_parentcustomerid_value eq @{triggerOutputs()?['body/accountid']}`, "Filter rows"),
      p("The GUID usually comes from the trigger or an earlier action, as above, and takes no quotes."),
      p("To filter on a column of the related row instead of its ID, use the navigation property, a slash and the column."),
      code(`primarycontactid/fullname eq 'Sam Rivera'`, "Filter rows"),
      p("The navigation property name is case sensitive and is not always the same as the logical name of the lookup column. For a custom lookup it is usually the schema name, with capitals, such as `cr1a2_Project`. If the filter fails, check the name in the table's relationship definition.")
    ),
    section(
      "text-and-dates",
      "Text search and dates",
      p("Dataverse supports three text functions."),
      code(`contains(name, 'sample')

startswith(name, 'A')

endswith(emailaddress1, '@contoso.com')`, "Filter rows"),
      p("A text value that contains `&`, `#` or `+` must be URL encoded, because the filter travels in a web address. Wrap dynamic text in `encodeUriComponent` when users can type those characters. Write an apostrophe inside a value twice."),
      p("Dates take an expression without quotes."),
      code(`createdon ge @{addDays(utcNow(), -7)}`, "Filter rows"),
      p("Dataverse also has named date functions for common ranges. They are called with the `Microsoft.Dynamics.CRM` prefix."),
      code(`Microsoft.Dynamics.CRM.LastXDays(PropertyName='createdon',PropertyValue=7)

Microsoft.Dynamics.CRM.Today(PropertyName='scheduledend')`, "Filter rows"),
      p("These functions save writing the date arithmetic yourself. Microsoft's query function reference lists all of them.")
    ),
    section(
      "performance",
      "Keep the action fast",
      ul(
        "**Select columns.** Enter the logical names you need, separated by commas, such as `name,revenue,_primarycontactid_value`. The action returns less data and runs faster.",
        "**Row count.** Set it when you only need the first row or the first few. With Row count 1 and a Sort by, you have a simple find the latest.",
        "**Sort by.** A column name followed by `asc` or `desc`, such as `createdon desc`.",
        "**5,000 rows.** List rows returns up to 5,000 rows by default. Turn on **Pagination** in the action's settings and set a threshold of up to 100,000 to get more."
      ),
      p("The same filter idea applies to triggers. The [Dataverse trigger pattern](/patterns/dataverse-trigger-filter-select-columns) shows how filter rows and select columns stop a flow from running on every change.")
    ),
    section(
      "fetchxml",
      "When to switch to FetchXML",
      p("List rows also accepts a FetchXML query in place of the OData options. Use it when the query needs conditions across several related tables, or operators OData does not offer."),
      p("Two limits apply. Aggregation queries are not supported in the List rows action, and the Pagination setting does not apply to FetchXML, so paging has to be written into the query. For most flows, Filter rows with Select columns is simpler to write and to read later.")
    ),
    section(
      "mistakes",
      "Mistakes that cause most failures",
      ul(
        "Typing `$filter=` in the Filter rows box. The box wants only the expression.",
        "Using the display name or a capital letter in a column name.",
        "Putting quotes around a GUID, a number or a date.",
        "Filtering a choice by its label. Use the number.",
        "Writing a lookup without the leading underscore and `_value`."
      )
    )
  ],
  faqs: [
    {
      question: "How do I filter List rows by a lookup column?",
      answer: "Write the logical name of the lookup with an underscore in front and _value behind, and compare it with the GUID of the related row without quotes, for example _parentcustomerid_value eq followed by the GUID."
    },
    {
      question: "How do I filter List rows by a choice column?",
      answer: "Compare the logical column name with the number of the option, not its label, for example prioritycode eq 1. The number is shown as Value beside each choice label in the column settings."
    },
    {
      question: "How do I get only active rows from Dataverse?",
      answer: "Add statecode eq 0 to the filter. On most tables 0 is Active and 1 is Inactive. Check the status column of the table if it uses custom states."
    },
    {
      question: "Why does List rows return only 5,000 rows?",
      answer: "5,000 is the default page size. Open the action's settings, turn on Pagination and set a threshold of up to 100,000 rows."
    },
    {
      question: "Can I use contains in a Dataverse filter?",
      answer: "Yes. Dataverse supports contains, startswith and endswith with the column first and the text second, such as contains(name, 'sample')."
    }
  ],
  relatedTools: ["odata-filter-query-builder", "dataverse-table-naming-helper"],
  relatedPatterns: ["dataverse-trigger-filter-select-columns", "dataverse-delegation-filter-search-large-tables"],
  relatedLinks: [
    { href: "/guides/sharepoint-get-items-filter-query", label: "Get items Filter Query by column type" },
    { href: "/standards/dataverse-table-design-standards", label: "Dataverse Table Design Standards" }
  ],
  sources: [
    automateDoc("dataverse/list-rows", "Use lists of rows in flows"),
    learnDoc("power-apps/developer/data-platform/webapi/query/filter-rows", "Filter rows using OData"),
    learnDoc("power-apps/developer/data-platform/webapi/query/overview", "Query data using the Web API")
  ]
};

export const whereToFilterGuide: Guide = {
  slug: "filter-query-vs-filter-array-vs-condition",
  title: "Filter Query, Filter array or Condition: where to filter data in a flow",
  shortTitle: "Filter Query vs Filter array vs Condition",
  description: "The three places a flow can filter data, what each one costs and what each can express, with a decision table and the two-step approach that handles filters SharePoint cannot run.",
  eyebrow,
  keywords: ["Power Automate filter array vs filter query", "Filter array", "Filter Query", "condition in apply to each", "filter data Power Automate"],
  published,
  updated: published,
  quickAnswer: "Filter at the source whenever the source can do it: use the Filter Query on Get items or Filter rows on List rows. Use a Filter array action for anything the source cannot express, such as columns with several choices, text that ends with a value, or data that did not come from a list. Keep a Condition inside Apply to each for cases where each item needs a different set of actions, not for selecting items.",
  sections: [
    section(
      "three-places",
      "The three places to filter",
      table(
        ["", "Filter Query", "Filter array", "Condition in Apply to each"],
        ["Where the work happens", "In SharePoint or Dataverse", "In the flow, in one action", "In the flow, once per item"],
        ["Actions used for 1,000 items", "1", "1 more", "At least 1,000"],
        ["Sees items beyond the page limit", "Yes", "No", "No"],
        ["Can use any expression", "No", "Yes", "Yes"],
        ["Works on any array", "No, only on the data source", "Yes", "Yes"]
      ),
      p("The row about the page limit is the one that causes wrong results. Get items returns 100 items unless you change it. A Filter array or a Condition only looks at what was returned. If the item you wanted was number 250 in the list, only a Filter Query finds it.")
    ),
    section(
      "filter-query-first",
      "Start with the Filter Query",
      p("A Filter Query runs inside SharePoint or Dataverse, against the whole list, before any data is sent to the flow. It is the fastest option and the only one that is correct on large lists without extra settings."),
      code(`Status eq 'Approved' and DueDate lt '@{utcNow()}'`, "Filter Query"),
      p("Its weakness is what it cannot say. SharePoint has no `endswith` or `not`, cannot filter calculated columns or columns with several values, and cannot compare one column with another."),
      tool("odata-filter-query-builder", "Build the part of the filter the data source can run. The builder writes the correct form for SharePoint or Dataverse.")
    ),
    section(
      "filter-array",
      "Add a Filter array for the rest",
      p("**Filter array** is a Data Operations action. It takes an array and a condition and returns the items that pass. It runs as one action however many items there are."),
      ol(
        "Add **Filter array** after Get items.",
        "In **From**, pick the `value` output of Get items.",
        "Build the condition in the row provided, or select **Edit in advanced mode** to type an expression."
      ),
      p("In advanced mode the condition is an expression that starts with `@`. Inside it, `item()` is the current item."),
      code(`@and(contains(string(item()?['Tags']), 'Finance'), endsWith(item()?['Title'], '-DRAFT'))`, "Filter array, advanced mode"),
      p("The result is `body('Filter_array')`. Use `length(body('Filter_array'))` to count the matches, and send the body to an Apply to each, a Select or a Create HTML table."),
      p("The [Filter array pattern](/patterns/filter-array-instead-of-apply-to-each) walks through replacing a loop and Condition with this action.")
    ),
    section(
      "both",
      "Use both on the same data",
      p("The two work best together. Let the Filter Query cut the list down to a few hundred likely items, then let Filter array apply the test the source could not."),
      p("Example: open requests that have the Finance tag, where Tags allows several choices."),
      code(`Status eq 'Open'`, "Filter Query on Get items"),
      code(`@contains(string(item()?['Tags']), 'Finance')`, "Filter array, advanced mode"),
      p("SharePoint removes the closed requests, which is most of the list. Filter array then checks the tag on what is left. Raise Top Count or turn on pagination if the first step can return more than 100 items.")
    ),
    section(
      "only-filter-array",
      "Cases only Filter array can handle",
      ul(
        "Data that is not from a list: the body of an HTTP call, rows from Excel, the output of Parse JSON or Select.",
        "Columns that hold several choices or several people.",
        "Calculated columns and multiple lines of text in SharePoint.",
        "Tests with `endsWith`, `not`, `length` or any other expression function.",
        "Comparing two properties of the same item, such as an actual amount greater than a budget amount.",
        "Comparing against a second array, such as items whose ID is not in a list of processed IDs."
      )
    ),
    section(
      "condition",
      "When a Condition in a loop is right",
      p("A **Condition** inside **Apply to each** tests one item at a time. For selecting items it is the slow choice. A loop over 1,000 items with a Condition and one action in the Yes branch runs at least 2,000 actions, one after another, and every one counts toward the flow's request limits."),
      p("It is the right tool when the items are not being selected but treated differently: approved items go to one mailbox and rejected items to another. Even then, filter first so the loop only sees items that need work."),
      note("Apply to each runs one item at a time by default. If the loop is still slow after filtering, see [speeding up Apply to each with concurrency](/patterns/apply-to-each-concurrency-variables-power-automate).")
    ),
    section(
      "decide",
      "A quick way to decide",
      ol(
        "Can the data source run the test? Put it in the Filter Query.",
        "Is part of the test beyond the data source? Put that part in a Filter array straight after.",
        "Do different items need different actions? Use a Condition in the loop, on the filtered result.",
        "Is the data not from a list at all? Start at Filter array."
      )
    )
  ],
  faqs: [
    {
      question: "What is the difference between Filter Query and Filter array?",
      answer: "A Filter Query is part of the Get items or List rows action and is run by SharePoint or Dataverse before data reaches the flow. Filter array is a separate action that filters an array the flow already has. Filter Query is faster and sees the whole list. Filter array can use any expression."
    },
    {
      question: "Is Filter array faster than Apply to each with a Condition?",
      answer: "Yes. Filter array processes the whole array in a single action. A Condition inside Apply to each runs once for every item, one after another by default, and each run counts as an action."
    },
    {
      question: "Why does my Filter array miss items that are in the list?",
      answer: "Filter array only sees the items the earlier action returned. Get items returns 100 items by default. Raise Top Count, turn on pagination, or move part of the test into the Filter Query so the right items are returned in the first place."
    },
    {
      question: "How do I count the items after a Filter array?",
      answer: "Use the expression length(body('Filter_array')), replacing Filter_array with the name of your action with spaces written as underscores."
    },
    {
      question: "Can I filter on a multi-select choice column?",
      answer: "Not reliably in a SharePoint Filter Query. Filter on other columns first, then use Filter array with a contains test on the choice column."
    }
  ],
  relatedTools: ["odata-filter-query-builder", "power-automate-expression-builder"],
  relatedPatterns: ["filter-array-instead-of-apply-to-each", "apply-to-each-concurrency-variables-power-automate", "select-union-remove-duplicates-power-automate", "get-more-than-5000-items-power-automate"],
  relatedLinks: [
    { href: "/guides/sharepoint-get-items-filter-query", label: "Get items Filter Query by column type" },
    { href: "/guides/dataverse-list-rows-filter-rows", label: "Filter Dataverse rows with List rows" }
  ],
  sources: [
    automateDoc("data-operations", "Use data operations"),
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows"),
    automateDoc("dataverse/list-rows", "Use lists of rows in flows")
  ]
};

export const triggerConditionsGuide: Guide = {
  slug: "power-automate-trigger-conditions-guide",
  title: "Write and test a trigger condition in Power Automate",
  shortTitle: "Write and test a trigger condition",
  description: "Where trigger conditions are set, how the expression is built, how several conditions combine, and a safe way to test one before it silently stops your flow from running.",
  eyebrow,
  keywords: ["Power Automate trigger conditions", "trigger condition not working", "trigger condition multiple conditions", "trigger condition choice column", "flow not triggering"],
  published,
  updated: published,
  quickAnswer: "A trigger condition is an expression in the trigger's settings that must be true for the flow to start. It begins with @, for example @equals(triggerOutputs()?['body/Status/Value'], 'Submitted'). Each condition on its own line must be true, so separate lines mean and. Use @or(...) on one line for or. When a condition is false the flow does not run and nothing appears in the run history, so test the expression in a Compose action first.",
  sections: [
    section(
      "why",
      "What a trigger condition is for",
      p("A trigger such as **When an item is created or modified** fires on every change to every item. Most of those runs are not wanted. A Condition action as the first step can end them early, but each one still starts, still counts as a run and still fills the run history."),
      p("A trigger condition is checked before the flow starts. If it is false there is no run at all. That keeps the history readable and the request count low, and it is the standard way to stop a flow from triggering itself when it updates the item it watches."),
      tool("trigger-condition-builder", "Choose the trigger, the column and the test, and the builder writes the expression with the right path for choice, person and yes/no columns.")
    ),
    section(
      "where",
      "Where to add one",
      p("**New designer**"),
      ol(
        "Select the trigger.",
        "Open the **Settings** tab.",
        "Next to **Trigger conditions**, select **Add**.",
        "Enter the expression."
      ),
      p("**Classic designer**"),
      ol(
        "Select the three dots on the trigger and choose **Settings**.",
        "Under **Trigger Conditions**, select **Add**.",
        "Enter the expression and select **Done**."
      )
    ),
    section(
      "shape",
      "The shape of the expression",
      p("Every trigger condition starts with `@`, then a function that returns true or false, then the value from the trigger and the value to compare it with."),
      code(`@equals(triggerOutputs()?['body/Status/Value'], 'Submitted')`, "Trigger condition"),
      p("`triggerOutputs()?['body/Status/Value']` reads the Status column from the item that fired the trigger. `triggerBody()?['Status']?['Value']` reads the same value and is equally valid."),
      table(
        ["Column type", "Trigger condition"],
        ["Text", "`@equals(triggerOutputs()?['body/Title'], 'Urgent')`"],
        ["Choice", "`@equals(triggerOutputs()?['body/Status/Value'], 'Submitted')`"],
        ["Yes/No", "`@equals(triggerOutputs()?['body/Approved'], true)`"],
        ["Number", "`@greater(triggerOutputs()?['body/Amount'], 1000)`"],
        ["Person", "`@equals(triggerOutputs()?['body/AssignedTo/Email'], 'sam@contoso.com')`"],
        ["Empty", "`@empty(triggerOutputs()?['body/ApprovedDate'])`"],
        ["Not empty", "`@not(empty(triggerOutputs()?['body/ApprovedDate']))`"],
        ["Text contains", "`@contains(triggerOutputs()?['body/Title'], 'invoice')`"]
      ),
      p("Use the internal column name in the path. See [internal column names](/guides/sharepoint-internal-column-names-power-automate).")
    ),
    section(
      "and-or",
      "And, or, and several boxes",
      p("You can add more than one condition. **Every condition must be true** for the flow to start, so two boxes mean and."),
      code(`@equals(triggerOutputs()?['body/Status/Value'], 'Submitted')
@greater(triggerOutputs()?['body/Amount'], 1000)`, "Two trigger conditions"),
      p("For or, put the tests inside `@or(...)` in a single box."),
      code(`@or(equals(triggerOutputs()?['body/Status/Value'], 'Submitted'), equals(triggerOutputs()?['body/Status/Value'], 'Resubmitted'))`, "One trigger condition"),
      p("Only the outermost function has the `@`. The functions inside it do not. Mixing the two is also fine in one box: `@and(equals(...), or(equals(...), equals(...)))`.")
    ),
    section(
      "generate",
      "Let the designer write it",
      p("If you prefer not to type the expression, build it with a Filter array action and copy it out."),
      ol(
        "Add a **Filter array** action anywhere in the flow.",
        "Build the test with the dropdowns, picking the trigger's values from dynamic content.",
        "Select **Edit in advanced mode** and copy the expression, including the `@`.",
        "Paste it into the trigger condition and delete the Filter array action."
      ),
      p("The copied expression may use `triggerBody()` paths. That is fine.")
    ),
    section(
      "test",
      "Test before you rely on it",
      p("A false trigger condition leaves no trace: no run, no error, no message. A condition with a typing mistake in a column name is simply never true, and the flow goes quiet. Test in this order."),
      ol(
        "Leave the trigger condition empty.",
        "Add a **Compose** action as the first step and paste the expression into it through the expression editor, without the leading `@`.",
        "Trigger the flow with an item that should pass and one that should not.",
        "Open each run. The Compose output must be `true` for the first and `false` for the second.",
        "Only then move the expression into the trigger condition, add the `@` back, and delete the Compose."
      ),
      p("If Compose shows `false` for an item that should pass, look at the trigger's outputs in the same run. Find the property and compare its exact value and spelling with what the condition expects.")
    ),
    section(
      "stopped",
      "When the flow stops triggering",
      ul(
        "**A wrong path.** `body/Status` returns the whole choice record, not its text. A choice needs `/Value`, and a person needs `/Email` or `/DisplayName`.",
        "**A wrong name.** The path needs the internal column name. A column titled Due Date is usually `DueDate` or `Due_x0020_Date`.",
        "**Text against a number.** `@equals(triggerOutputs()?['body/Amount'], '1000')` is false when Amount is a number. Remove the quotes.",
        "**Two boxes where or was meant.** Two boxes are and. One item can rarely have two statuses at once.",
        "**A missing `@`**, or an `@` on an inner function.",
        "**The trigger itself.** A SharePoint trigger checks for changes on a schedule, so a short delay is normal. Wait a few minutes before deciding the condition is at fault.",
        "**An expression that should move with time.** Expressions in a trigger are worked out when the flow is saved, not each time it fires. `utcNow()` in a trigger input is fixed at the moment of the last save."
      ),
      p("A trigger condition cannot see the previous value of a column. To run only when a status changes, see the [status changed pattern](/patterns/power-automate-trigger-condition-status-changed). For ready-made expressions, see the [trigger conditions cheat sheet](/cheat-sheets/power-automate-trigger-conditions-cheat-sheet).")
    )
  ],
  faqs: [
    {
      question: "Why is my flow not triggering after I added a trigger condition?",
      answer: "The condition is evaluating to false. The usual causes are a missing /Value on a choice column, a display name used in place of the internal column name, a number compared with text in quotes, or two separate conditions where an or was intended. Test the expression in a Compose action to see the result."
    },
    {
      question: "How do I add multiple trigger conditions?",
      answer: "Add each one as a separate condition when all of them must be true. When any one of them is enough, write a single condition that wraps the tests in @or(...)."
    },
    {
      question: "Does a flow run count when the trigger condition is false?",
      answer: "No. When the trigger condition is not met the flow is not triggered and no run history is logged."
    },
    {
      question: "Do trigger conditions need the @ symbol?",
      answer: "Yes. Every trigger condition must start with @. Functions nested inside the first one do not take an @."
    },
    {
      question: "Can a trigger condition check whether a column changed?",
      answer: "Not by itself. The trigger only supplies the current values. To react to a change, store the previous value in another column and compare the two, or use the SharePoint action that gets the changes for an item."
    },
    {
      question: "How do I stop a flow from triggering itself?",
      answer: "Add a trigger condition that is false for the flow's own update, for example one that checks a status the flow sets or the account that last modified the item."
    }
  ],
  relatedTools: ["trigger-condition-builder", "power-automate-expression-builder", "sharepoint-internal-name-helper"],
  relatedPatterns: ["power-automate-trigger-condition-status-changed", "power-automate-avoid-infinite-update-loop", "dataverse-trigger-filter-select-columns"],
  relatedLinks: [
    { href: "/cheat-sheets/power-automate-trigger-conditions-cheat-sheet", label: "Power Automate Trigger Conditions Cheat Sheet" },
    { href: "/guides/worked-example-trigger-condition-parse-json-asset-tag-flow", label: "Worked example: trigger conditions with a loop guard" },
    { href: "/errors/problem-with-the-flows-trigger", label: "Error: There is a problem with the flow's trigger" }
  ],
  sources: [
    automateDoc("customize-triggers", "Customize your triggers with conditions"),
    automateDoc("use-expressions-in-conditions", "Use expressions in conditions to check multiple values"),
    automateDoc("triggers-introduction", "Get started with triggers")
  ]
};
