import { automateDoc, code, learnDoc, note, ol, p, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-20";
const eyebrow = "Power Automate connectors";

export const excelQuickStartGuide: Guide = {
  slug: "power-automate-excel-quick-start",
  title: "Excel in Power Automate: read rows, add rows and update rows in a table",
  shortTitle: "Excel connector quick start",
  description: "How to read an Excel table from a flow, add and update rows with a key column, handle Excel dates, work with a file chosen at run time, and avoid file locks, with one complete flow.",
  eyebrow,
  keywords: ["Power Automate Excel tutorial", "Power Automate add a row into a table", "Power Automate read Excel file", "List rows present in a table", "Excel Online Business connector"],
  published,
  updated: published,
  quickAnswer: "The data must be formatted as a table in a workbook stored in OneDrive or SharePoint. Use List rows present in a table to read it, and turn on Pagination to get more than the first 256 rows. Use Add a row into a table to write, and Update a row with a key column that holds a unique value. Set DateTime Format to ISO 8601 in List rows so that dates arrive as dates and not as serial numbers.",
  sections: [
    section(
      "table-first",
      "The data must be in a table",
      p("The **Excel Online (Business)** connector works with tables and nothing else. A range of cells with headings is not a table until you make it one."),
      ol(
        "Open the workbook and select any cell in the data.",
        "Select **Insert**, then **Table**, and confirm that the table has headers.",
        "Select the **Table Design** tab and give the table a name, such as `Orders`, in place of `Table1`."
      ),
      p("The workbook must be an `.xlsx` file in OneDrive for work or school or in a SharePoint library. Files on a computer or a network drive cannot be reached by this connector."),
      p("Every action then asks for four things: **Location**, **Document Library**, **File** and **Table**. Pick them in that order from the dropdowns.")
    ),
    section(
      "actions",
      "Actions worth knowing",
      table(
        ["Action", "What it does"],
        ["List rows present in a table", "Reads rows, with an optional filter, sort and row count"],
        ["Get a row", "Reads one row by the value in a key column"],
        ["Add a row into a table", "Adds a row at the end of the table"],
        ["Update a row", "Changes one row, found by a key column and value"],
        ["Delete a row", "Removes one row, found by a key column and value"],
        ["Get tables", "Lists the tables in a workbook"],
        ["Create table", "Turns a range into a table"],
        ["Run script", "Runs an Office Script in the workbook"]
      ),
      p("The connector has no trigger for a changed row. To react to changes, start the flow on a schedule or from the file's SharePoint trigger, then read the table.")
    ),
    section(
      "read",
      "Read rows",
      p("**List rows present in a table** returns the rows as an array, with one property per column. Four advanced parameters matter."),
      table(
        ["Parameter", "What it does"],
        ["Filter Query", "Returns matching rows only. One condition on one column."],
        ["Order By", "Sorts by one column, for example `OrderDate desc`"],
        ["Top Count", "The number of rows to return"],
        ["DateTime Format", "Serial Number or ISO 8601"]
      ),
      code(`Status eq 'Open'`, "Filter Query"),
      p("The filter here is much weaker than a SharePoint Filter Query. It accepts one condition, with operators such as `eq`, `ne`, `contains`, `startswith` and `endswith`, and it cannot join conditions with `and` or `or`. For anything more, read the rows and narrow them with a **Filter array** action. Column names with spaces often fail in the filter, so give columns you filter on a name without spaces."),
      p("**The action returns 256 rows by default.** To read more, open the action's **Settings**, turn on **Pagination** and set the **Threshold** to the number of rows you need. The [large Excel table pattern](/patterns/excel-list-rows-large-table-filter-power-automate) covers big tables.")
    ),
    section(
      "write",
      "Add, update and delete rows",
      p("**Add a row into a table** shows one box per column once you pick the table. Leave a box empty to leave the cell empty."),
      p("**Update a row** and **Delete a row** find the row with a **Key Column** and a **Key Value**. The key column must hold a value that is unique in the table, such as an order number. If two rows have the same value, the first one is changed. If none has it, the action fails."),
      p("A table with no unique column needs one before a flow can update it. Add a column named `ID` and fill it, or have the flow write a GUID into it when it adds each row."),
      code(`guid()`, "Expression")
    ),
    section(
      "worked-flow",
      "A complete flow: copy every row of a table to a SharePoint list",
      p("A workbook named Orders.xlsx has a table named Orders with the columns OrderNumber, Customer, OrderDate and Amount. The flow creates one SharePoint list item per row."),
      ol(
        "Create an **Instant cloud flow** with the trigger **Manually trigger a flow**.",
        "Add **List rows present in a table**. Pick the location, library, file and the Orders table.",
        "Open the advanced parameters and set **DateTime Format** to **ISO 8601**.",
        "Open the action's **Settings**, turn on **Pagination** and set the **Threshold** to 5000.",
        "Add an **Apply to each** and pick **value** from List rows as its input.",
        "Inside the loop, add the SharePoint action **Create item**. Map **Title** to OrderNumber, and the other columns to Customer, OrderDate and Amount from dynamic content.",
        "Save and run the flow."
      ),
      p("If the Amount column in SharePoint is a number and the flow fails on an empty cell, wrap the value so that an empty cell becomes zero."),
      code(`if(empty(items('Apply_to_each')?['Amount']), 0, float(items('Apply_to_each')?['Amount']))`, "Expression"),
      p("Excel returns every cell as text, including numbers, so `float` or `int` is needed wherever a number is expected."),
      p("For hundreds of rows, this loop makes one SharePoint call per row. The [batch create pattern](/patterns/sharepoint-batch-create-update-items-power-automate) sends them in groups.")
    ),
    section(
      "dates",
      "Dates",
      p("Excel stores a date as a number: the count of days since the end of 1899. With **DateTime Format** left on **Serial Number**, an order date arrives as `46346` and not as a date."),
      p("Set **DateTime Format** to **ISO 8601** in List rows and dates arrive as text such as `2026-11-20T00:00:00.000Z`, which other actions accept."),
      p("If you cannot change the setting, convert the number with an expression."),
      code(`addDays('1899-12-30', int(items('Apply_to_each')?['OrderDate']), 'yyyy-MM-dd')`, "Expression"),
      p("The [Excel date serial number pattern](/patterns/excel-date-serial-number-power-automate) handles dates with a time and empty cells."),
      tool("date-format-tester", "Check the format string for the date before you put it in the expression.")
    ),
    section(
      "dynamic-file",
      "A file chosen at run time",
      p("When the **File** box holds dynamic content, such as the identifier of a file that was just uploaded, the designer cannot open the workbook to read its tables. Two things change."),
      ul(
        "The **Table** dropdown is empty. Choose **Enter custom value** and type the table's name.",
        "**Add a row into a table** shows a single **Row** box in place of one box per column. Enter the row as JSON."
      ),
      code(`{
  "OrderNumber": "@{triggerBody()?['text']}",
  "Customer": "Contoso",
  "Amount": 125.5
}`, "Row"),
      p("Pass the file's **Id** or **Identifier** from a SharePoint or OneDrive action, not its name or path. To find tables in a workbook you have not seen, call **Get tables** first.")
    ),
    section(
      "locks",
      "File locks and when to use a script",
      p("While a flow writes to a workbook, the connector holds a lock on the file. Microsoft's connector reference says the file can stay locked for up to six minutes after the connector last used it. A person who has the workbook open in the desktop app can also block the flow."),
      ul(
        "Do not run writes to the same workbook in parallel. Leave concurrency off on any loop that adds or updates rows.",
        "Ask people to use Excel for the web, which shares the file, and not the desktop app.",
        "If a flow fails with [the file is locked for shared use](/errors/file-is-locked-for-shared-use-power-automate), that page has the retry settings."
      ),
      p("When a flow needs to write many rows, format cells or work outside a table, one **Run script** action is faster and safer than hundreds of row actions. The [Office Scripts pattern](/patterns/office-scripts-run-script-excel-power-automate) shows how to pass data in and out.")
    ),
    section(
      "mistakes",
      "Three mistakes to avoid on day one",
      ul(
        "**Using a workbook as a database.** A workbook that many flows and people write to all day will lock and lose updates. A SharePoint list or a Dataverse table is built for that job. Excel suits imports, exports and reports.",
        "**Forgetting pagination.** A test with 50 rows passes, and the real table with 2,000 rows silently returns 256.",
        "**Renaming a column or the table.** The flow stores the names. After a rename, open each Excel action and pick the table again."
      )
    ),
    section(
      "limits",
      "Limits to know",
      ul(
        "256 rows are returned by default. Pagination raises this to the flow's limit of 5,000 items on Microsoft 365 licences and 100,000 on premium licences.",
        "The connector reference gives a maximum workbook size of 25 MB.",
        "The connector limits how many calls a connection can make per minute, so a long loop of row actions is slowed down. See the [429 error page](/errors/429-rate-limit-exceeded-power-automate)."
      ),
      p("The [limits reference](/guides/power-automate-limits) lists the flow-level limits.")
    )
  ],
  faqs: [
    {
      question: "Why does List rows present in a table return only 256 rows?",
      answer: "256 is the default page size of the Excel connector. Open the action's Settings, turn on Pagination and set the Threshold to the number of rows you need."
    },
    {
      question: "Why can't Power Automate find my Excel table?",
      answer: "The data is probably a plain range and not a table, or the workbook is not in OneDrive for work or school or SharePoint. Select the data in Excel, choose Insert then Table, save the file and pick it again in the flow."
    },
    {
      question: "Why does my Excel date show as a number like 46346 in a flow?",
      answer: "Excel stores dates as serial numbers. In List rows present in a table, set DateTime Format to ISO 8601, or convert the number with addDays('1899-12-30', int(value))."
    },
    {
      question: "How do I update a specific row in Excel with Power Automate?",
      answer: "Use the Update a row action. Set Key Column to a column that holds a unique value for each row, and Key Value to the value of the row you want to change."
    },
    {
      question: "Can a flow trigger when an Excel row changes?",
      answer: "No. The Excel Online (Business) connector has no row trigger. Run the flow on a schedule, or trigger on the file being modified in SharePoint or OneDrive, and then read the table."
    }
  ],
  relatedTools: ["date-format-tester", "power-automate-expression-builder"],
  relatedPatterns: ["excel-list-rows-large-table-filter-power-automate", "excel-date-serial-number-power-automate", "office-scripts-run-script-excel-power-automate", "sharepoint-batch-create-update-items-power-automate"],
  relatedLinks: [
    { href: "/errors/file-is-locked-for-shared-use-power-automate", label: "Error: The file is locked for shared use" },
    { href: "/guides/filter-query-vs-filter-array-vs-condition", label: "Filter Query, Filter array or Condition" },
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" }
  ],
  sources: [
    learnDoc("connectors/excelonlinebusiness", "Excel Online (Business) connector reference"),
    learnDoc("troubleshoot/power-platform/power-automate/flow-creation/unable-to-find-excel-online-table-in-microsoft-flow", "Unable to find an Excel Online table in a flow"),
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows")
  ]
};

export const formsQuickStartGuide: Guide = {
  slug: "power-automate-forms-quick-start",
  title: "Microsoft Forms in Power Automate: save responses, read choices and handle file uploads",
  shortTitle: "Forms connector quick start",
  description: "How to start a flow from a Microsoft Forms response, why Get response details is always needed, how to use a group form, and how to read multi-choice answers and uploaded files, with one complete flow.",
  eyebrow,
  keywords: ["Power Automate Forms to SharePoint", "Power Automate get response details", "Power Automate Forms attachments", "when a new response is submitted", "Microsoft Forms group form Power Automate"],
  published,
  updated: published,
  quickAnswer: "The Forms connector has one trigger, When a new response is submitted, and one action, Get response details. The trigger returns only the ID of the response, so every Forms flow starts with those two steps together. Pick the same form in both and pass the trigger's Response Id to the action. The answers then appear as dynamic content, one item per question.",
  sections: [
    section(
      "two-steps",
      "Two steps that always go together",
      p("The trigger **When a new response is submitted** tells the flow that a response exists. It returns the response's ID and nothing else. The answers come from the action **Get response details**."),
      ol(
        "Add the trigger **When a new response is submitted** and pick the form in **Form Id**.",
        "Add the action **Get response details**. Pick the same form in **Form Id**.",
        "In **Response Id**, pick **Response Id** from the trigger's dynamic content."
      ),
      p("After that, each question in the form is listed in dynamic content under Get response details, named by its question text. The list also has **Responders' Email**, **Submission time** and **Start time**."),
      note("If you later change a question's text in the form, the flow keeps working, because answers are stored by question ID. New questions appear after you reopen the flow in the designer.")
    ),
    section(
      "group-forms",
      "Personal forms and group forms",
      p("The **Form Id** dropdown lists forms that you own. A form that belongs to a Microsoft 365 group, such as one created in a team, is not in the list."),
      ol(
        "Open the group form in the browser for editing.",
        "Copy the value after `id=` in the address bar. It is a long string of letters, numbers, hyphens and underscores.",
        "In the flow, open the **Form Id** dropdown, choose **Enter custom value** and paste the ID.",
        "Do the same in **Get response details**."
      ),
      p("Use a group form for anything that should outlive one person. A personal form belongs to its creator, and when that account is removed, the form and its flow stop. A form can be moved to a group from the Forms home page. After the move, copy the ID from the address bar again and update both steps of the flow.")
    ),
    section(
      "worked-flow",
      "A complete flow: save each response to a list and confirm by email",
      p("A form named Equipment request has three questions: Item (text), Quantity (number) and Needed by (date). The list has matching columns."),
      ol(
        "Create an **Automated cloud flow** with the trigger **When a new response is submitted** and pick the form.",
        "Add **Get response details** with the same form and the trigger's **Response Id**.",
        "Add the SharePoint action **Create item** and pick the site and list.",
        "Map **Title** to the Item answer and **Needed by** to the Needed by answer.",
        "For **Quantity**, use the expression below, because Forms returns numbers as text.",
        "Add **Send an email (V2)**. Set **To** to **Responders' Email** and list the answers in the body."
      ),
      code(`int(outputs('Get_response_details')?['body/r3f8b2c1d4e5a6978b0c1d2e3f4a5b6c7'])`, "Expression"),
      p("The long name starting with `r` is the question's ID. You do not type it. In the expression editor, switch to the **Dynamic content** tab and select the Quantity answer, and the editor inserts the right reference inside `int( )`.")
    ),
    section(
      "answer-types",
      "How each answer type arrives",
      table(
        ["Question type", "Arrives as", "What to do"],
        ["Text", "Text", "Use it directly"],
        ["Choice, one answer", "Text of the chosen option", "Use it directly"],
        ["Choice, several answers", "Text that holds a JSON array", "Convert with `json()`"],
        ["Number", "Text", "Convert with `int()` or `float()`"],
        ["Date", "Text in the form `2026-11-20`", "Use it directly in a date column"],
        ["Rating", "Text holding the number", "Convert with `int()`"],
        ["Ranking", "Text that holds a JSON array, in ranked order", "Convert with `json()`"],
        ["File upload", "Text that holds a JSON array of file details", "Convert with `json()`, then loop"]
      ),
      p("Every answer is text, which is the source of most Forms flow errors. A number column, a Yes/No column or a loop needs a conversion first."),
      p("An optional question that was skipped arrives empty. Wrapping an empty answer in `int()` fails, so give it a default."),
      code(`int(coalesce(outputs('Get_response_details')?['body/r3f8b2c1d4e5a6978b0c1d2e3f4a5b6c7'], '0'))`, "Expression"),
      p("If the answer can also be an empty string, use the form with `empty()` shown in the [null handling pattern](/patterns/coalesce-empty-null-handling-power-automate).")
    ),
    section(
      "multi-choice",
      "Multi-choice answers",
      p("A question that allows several answers returns one piece of text that looks like an array."),
      code(`["Laptop","Monitor","Keyboard"]`, "Answer as received"),
      p("To show it as a readable list, convert it and join the values."),
      code(`join(json(outputs('Get_response_details')?['body/r9a8b7c6d5e4f30112233445566778899']), ', ')`, "Expression"),
      p("That returns `Laptop, Monitor, Keyboard`. To act on each choice, pass the `json(...)` expression to an **Apply to each**."),
      p("To save the choices to a SharePoint Choice column that allows several values, build an array of objects with a **Select** action. Set **From** to the `json(...)` expression, switch the map to text mode, and enter the line below."),
      code(`{
  "Value": "@{item()}"
}`, "Select: Map")
    ),
    section(
      "files",
      "File upload answers",
      p("A file upload question saves the files before the flow runs. The answer is a JSON array with the details of each file."),
      ul(
        "For a **personal form**, files are in the form owner's OneDrive, under **Apps**, **Microsoft Forms**, the form's name, then the question's name.",
        "For a **group form**, files are in the group's SharePoint site, in the **Documents** library under the same folders."
      ),
      p("To copy the files somewhere else, parse the answer and read each file by its ID."),
      ol(
        "Add **Parse JSON**. Set **Content** to the file upload answer and use the schema below.",
        "Add an **Apply to each** over the Parse JSON **Body**.",
        "Inside it, add **Get file content**. For a personal form use the OneDrive for Business action and pass the file's **id**. For a group form use the SharePoint action **Get file content using path** with the path to the file.",
        "Add **Create file** in the destination library, with the file's **name** and the content from the previous step."
      ),
      code(`{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "link": { "type": "string" },
      "id": { "type": "string" },
      "size": { "type": "integer" }
    }
  }
}`, "Schema"),
      tool("parse-json-schema-generator", "Paste the answer from a test run to generate a schema that matches your form exactly."),
      p("The [Forms file upload pattern](/patterns/microsoft-forms-file-upload-to-sharepoint-flow) has the full flow for both form types.")
    ),
    section(
      "email",
      "The responder's email",
      p("**Responders' Email** holds an address only when the form records names, which is the setting **Only people in my organization can respond** with **Record name** turned on. For a form that anyone can answer, the value is `anonymous`."),
      p("If the form is anonymous and you need to reply, add an email question to the form and use that answer. Check it before you send, because a mistyped address fails the email action.")
    ),
    section(
      "mistakes",
      "Three mistakes to avoid on day one",
      ul(
        "**Skipping Get response details.** The trigger alone has no answers, so the dynamic content list looks empty.",
        "**Building on a personal form.** Move the form to a group first, then build the flow with the group form's ID.",
        "**Treating every answer as its column's type.** Numbers, ratings and multi-choice answers are text until you convert them."
      ),
      p("The trigger starts once per response. A form that receives a burst of responses starts a burst of runs, and each run uses its own requests. The [limits reference](/guides/power-automate-limits) has the daily numbers.")
    )
  ],
  faqs: [
    {
      question: "Why do I need Get response details in a Forms flow?",
      answer: "The trigger When a new response is submitted returns only the ID of the response. Get response details uses that ID to load the answers, which then appear as dynamic content."
    },
    {
      question: "Why is my form missing from the Form Id dropdown?",
      answer: "The dropdown lists forms you own personally. For a group form, open the form in the browser, copy the value after id= in the address, and paste it into Form Id with Enter custom value."
    },
    {
      question: "How do I read a multi-choice answer from Microsoft Forms in a flow?",
      answer: "The answer arrives as text that holds a JSON array. Convert it with the json() expression. Use join() to turn it into a comma-separated list, or pass it to an Apply to each to handle each choice."
    },
    {
      question: "Where are files uploaded to a Microsoft Form stored?",
      answer: "For a personal form they are in the form owner's OneDrive under Apps, Microsoft Forms, then the form name. For a group form they are in the group's SharePoint site in the Documents library, under the same folder names."
    },
    {
      question: "Why is Responders' Email set to anonymous?",
      answer: "The form does not record names. Either restrict the form to people in your organisation and turn on Record name, or add a question that asks for an email address."
    }
  ],
  relatedTools: ["parse-json-schema-generator", "power-automate-expression-builder"],
  relatedPatterns: ["microsoft-forms-file-upload-to-sharepoint-flow", "coalesce-empty-null-handling-power-automate", "power-automate-approval-with-sharepoint-status-sync"],
  relatedLinks: [
    { href: "/guides/power-automate-parse-json-guide", label: "Use Parse JSON, and when to skip it" },
    { href: "/guides/power-automate-sharepoint-quick-start", label: "SharePoint connector quick start" },
    { href: "/errors/template-function-expects-string-provided-value-null", label: "Error: The provided value is of type Null" }
  ],
  sources: [
    automateDoc("forms/overview", "Overview of flows with Microsoft Forms"),
    learnDoc("connectors/microsoftforms", "Microsoft Forms connector reference"),
    automateDoc("data-operations", "Use data operations")
  ]
};

export const dataverseQuickStartGuide: Guide = {
  slug: "power-automate-dataverse-quick-start",
  title: "Dataverse in Power Automate: triggers, rows, lookups and choices",
  shortTitle: "Dataverse connector quick start",
  description: "How the Dataverse trigger's change type, scope, select columns and filter rows work, how to set and read lookup and choice columns, and one complete flow built step by step.",
  eyebrow,
  keywords: ["Power Automate Dataverse tutorial", "Power Automate Dataverse trigger", "Power Automate Dataverse lookup column", "when a row is added modified or deleted", "Dataverse update a row Power Automate"],
  published,
  updated: published,
  quickAnswer: "Use the trigger When a row is added, modified or deleted, and narrow it with Change type, Scope, Select columns and Filter rows so it runs only when it should. To set a lookup column, write the table's set name and the row's ID in the form contacts(00000000-0000-0000-0000-000000000000). To read a lookup, use the column named _columnname_value. Choice columns hold a number, and the label is in a separate formatted value.",
  sections: [
    section(
      "trigger",
      "One trigger, four settings",
      p("Most Dataverse flows start with **When a row is added, modified or deleted**. Four settings decide when it runs."),
      table(
        ["Setting", "What it controls"],
        ["Change type", "Which changes start the flow: Added, Modified, Deleted, or a combination"],
        ["Table name", "The table to watch"],
        ["Scope", "Whose rows count: User, Business unit, Parent: Child business unit, or Organization"],
        ["Select columns", "For updates, the flow runs only when one of these columns is in the change"],
        ["Filter rows", "An OData condition the row must meet after the change is saved"]
      ),
      p("**Scope** is about who owns the row. **User** means rows that you own, so a flow left on User ignores every row owned by someone else. A flow that should run for everyone's rows needs **Organization**."),
      p("**Select columns** takes logical column names separated by commas, such as `statuscode,cr1a2_duedate`. Without it, an update to any column starts the flow. It applies to updates only. Lookup columns are not supported there, so a change to a lookup listed in Select columns does not start the flow."),
      code(`statuscode eq 2 and cr1a2_amount gt 1000`, "Filter rows"),
      p("The flow also runs when an update writes the same value that was already there, and it runs once per update, so three quick saves start three runs."),
      p("To tell which change started a run, read the message name. It is `Create`, `Update` or `Delete`."),
      code(`triggerOutputs()?['body/SdkMessage']`, "Expression"),
      p("The [trigger filter pattern](/patterns/dataverse-trigger-filter-select-columns) has more filter examples.")
    ),
    section(
      "actions",
      "Actions worth knowing",
      table(
        ["Action", "What it does"],
        ["Add a new row", "Creates a row"],
        ["Update a row", "Changes a row by its ID. Creates the row if no row has that ID."],
        ["Get a row by ID", "Reads one row"],
        ["List rows", "Reads many rows, with Filter rows, Select columns, Sort by and Expand Query"],
        ["Delete a row", "Removes a row by its ID"],
        ["Relate rows", "Links two rows through a relationship"],
        ["Unrelate rows", "Removes that link"],
        ["Perform a bound action, Perform an unbound action", "Calls a Dataverse action, such as one that qualifies a lead"]
      ),
      p("**Update a row** skips the columns you leave empty, so you fill in only what changes. Because it creates a row when the ID is not found, a wrong ID does not fail. It quietly adds a row. Take the ID from the trigger or from an earlier action, and never type one by hand."),
      p("**List rows** returns up to 5,000 rows. Turn on **Pagination** in the action's settings for more. The [List rows filter guide](/guides/dataverse-list-rows-filter-rows) covers the filter syntax for each column type.")
    ),
    section(
      "lookups-set",
      "Set a lookup column",
      p("A lookup box in **Add a new row** or **Update a row** does not accept a bare ID. It needs the **set name** of the table it points to, followed by the ID in brackets."),
      code(`contacts(aaaaaaaa-0000-1111-2222-bbbbbbbbbbbb)

contacts(@{triggerOutputs()?['body/_primarycontactid_value']})`, "Lookup value"),
      p("The set name is usually the plural of the table's logical name, but not always, so look it up."),
      ol(
        "Sign in to Power Apps and select **Tables**.",
        "Set the filter to **All**, then find and open the table.",
        "Under **Table properties**, open the **Tools** menu.",
        "Select **Copy set name**."
      ),
      p("A custom table named Project with the prefix `cr1a2` usually has the set name `cr1a2_projects`. To clear a lookup, use the **Unrelate rows** action, since an empty box means \"do not change\"."),
      p("A wrong set name fails with [Resource not found for the segment](/errors/resource-not-found-for-the-segment-dataverse). The [lookup binding pattern](/patterns/dataverse-set-lookup-odata-bind-power-automate) covers customer and other multi-table lookups.")
    ),
    section(
      "lookups-read",
      "Read a lookup column",
      p("In the output of a trigger or action, a lookup appears as a column whose name starts with an underscore and ends with `_value`. It holds the ID of the related row."),
      code(`triggerOutputs()?['body/_parentcustomerid_value']`, "Expression"),
      p("The related row's name is in a separate annotation next to it."),
      code(`triggerOutputs()?['body/_parentcustomerid_value@OData.Community.Display.V1.FormattedValue']`, "Expression"),
      p("To read other columns of the related row, either add **Get a row by ID** with that ID, or ask for them in the first call with **Expand Query**. The [expand related rows pattern](/patterns/dataverse-expand-related-rows-power-automate) shows the syntax.")
    ),
    section(
      "choices",
      "Choice columns",
      p("A choice column stores a whole number. A status of Approved might be stored as `100000001`. The dynamic content for the column gives you the number."),
      p("The label is in the formatted value annotation, the same one that lookups use."),
      code(`triggerOutputs()?['body/cr1a2_status@OData.Community.Display.V1.FormattedValue']`, "Expression"),
      p("When you set a choice column in an action, the dropdown shows the labels. To set it from dynamic content, choose **Enter custom value** and pass the number, not the label."),
      p("Filters need the number too: `cr1a2_status eq 100000001`. The [formatted values pattern](/patterns/dataverse-formatted-values-labels-power-automate) lists every place the label is available.")
    ),
    section(
      "worked-flow",
      "A complete flow: copy the account's primary contact to a new case",
      p("When a case is created for an account, the flow reads the account and sets the case's Contact lookup to the account's primary contact."),
      ol(
        "Create an **Automated cloud flow** with the trigger **When a row is added, modified or deleted**.",
        "Set **Change type** to Added, **Table name** to Cases and **Scope** to Organization.",
        "Add **Get a row by ID**. Set **Table name** to Accounts and **Row ID** to the expression for the case's customer, shown below.",
        "In the advanced parameters of Get a row by ID, set **Select columns** to `_primarycontactid_value` so the action returns only what is needed.",
        "Add a **Condition** that checks that the primary contact is not empty.",
        "Under **If yes**, add **Update a row**. Set **Table name** to Cases and **Row ID** to the trigger's **Case** unique identifier.",
        "In the **Contact** lookup box, enter the set name and the contact's ID, shown below."
      ),
      code(`triggerOutputs()?['body/_customerid_value']`, "Row ID for Get a row by ID"),
      code(`empty(outputs('Get_a_row_by_ID')?['body/_primarycontactid_value'])`, "Condition: is equal to false"),
      code(`contacts(@{outputs('Get_a_row_by_ID')?['body/_primarycontactid_value']})`, "Contact lookup"),
      p("The Customer column of a case can point to an account or a contact. If the case's customer is a contact, Get a row by ID on Accounts fails with a not found error. To handle both, check the type first with the annotation below, which returns `account` or `contact`."),
      code(`triggerOutputs()?['body/_customerid_value@Microsoft.Dynamics.CRM.lookuplogicalname']`, "Expression"),
      p("This flow triggers on Added only, so its own update does not start it again. A flow that triggers on Modified and updates the same row must use **Select columns** to watch a column that the flow itself does not write.")
    ),
    section(
      "run-as",
      "Whose permissions the flow uses",
      p("Dataverse actions run as the owner of the connection, which is normally the person who built the flow. If that person cannot read a table, the flow cannot either, and it fails with a [missing privilege error](/errors/principal-user-is-missing-privilege-dataverse)."),
      p("The trigger has a **Run as** setting with the options **Flow owner**, **Row owner** and **Modifying user**. With one of the last two, Dataverse actions that are set to use the invoker's connection act as that user. The flow's owner needs the Dataverse privilege **Act on Behalf of Another User**, which the Delegate security role includes."),
      p("For production, a flow that many people rely on is better owned by a service account or a service principal than by one maker. See [service principals for deployments](/patterns/service-principal-application-user-deployments).")
    ),
    section(
      "mistakes",
      "Three mistakes to avoid on day one",
      ul(
        "**Leaving Scope on User.** The flow works in testing with your own rows and never runs for anyone else's.",
        "**No Select columns on a Modified trigger.** The flow runs on every save of every column, and loops if it updates the row itself.",
        "**Using display names.** Filter rows, Select columns and expressions use logical names, in lower case, such as `cr1a2_duedate`. A wrong name fails with [Could not find a property named](/errors/could-not-find-a-property-named-dataverse)."
      )
    ),
    section(
      "limits",
      "Limits to know",
      ul(
        "List rows returns 5,000 rows per page. With Pagination on, the most a flow can collect is 5,000 rows on low-profile licences and 100,000 on premium ones.",
        "Dataverse is a premium connector, so the flow's owner needs a licence that includes premium connectors.",
        "Dataverse applies its own service protection limits per user, and returns a 429 error when a flow sends too many requests in a few minutes. See [429 rate limit](/errors/429-rate-limit-exceeded-power-automate).",
        "The trigger does not start on changes to relationships. Associating two rows in a many-to-many relationship does not run a flow on either table."
      ),
      p("If a Dataverse trigger never fires, check that the flow is on, that the row passes Filter rows, and that the environment is not in administration mode with background operations turned off. The [limits reference](/guides/power-automate-limits) lists the flow-level limits.")
    )
  ],
  faqs: [
    {
      question: "How do I set a lookup column in Dataverse with Power Automate?",
      answer: "Enter the set name of the related table followed by the row ID in brackets, for example contacts(aaaaaaaa-0000-1111-2222-bbbbbbbbbbbb). Find the set name in Power Apps under Tables, in the Tools menu of the table, with Copy set name."
    },
    {
      question: "Why does my Dataverse trigger not fire for other users' rows?",
      answer: "The trigger's Scope is set to User, which covers only rows that the flow's owner owns. Change Scope to Organization to include every row in the environment."
    },
    {
      question: "How do I get the label of a choice column in a flow?",
      answer: "The column itself returns a number. The label is in the annotation named after the column with @OData.Community.Display.V1.FormattedValue added, for example cr1a2_status@OData.Community.Display.V1.FormattedValue."
    },
    {
      question: "How do I trigger a Dataverse flow only when one column changes?",
      answer: "Set Change type to Modified and enter the column's logical name in Select columns. The flow then runs only for updates that include that column. Lookup columns are not supported in Select columns."
    },
    {
      question: "Does Update a row create a row if the ID does not exist?",
      answer: "Yes. If no row has the ID you pass, the action creates a new row with that ID. This is an upsert, and it means a wrong ID adds a row and does not fail."
    }
  ],
  relatedTools: ["odata-filter-query-builder", "dataverse-table-naming-helper", "power-automate-expression-builder"],
  relatedPatterns: ["dataverse-set-lookup-odata-bind-power-automate", "dataverse-trigger-filter-select-columns", "dataverse-expand-related-rows-power-automate", "dataverse-formatted-values-labels-power-automate", "dataverse-alternate-key-upsert-power-automate"],
  relatedLinks: [
    { href: "/guides/dataverse-list-rows-filter-rows", label: "Filter Dataverse rows with List rows" },
    { href: "/errors/resource-not-found-for-the-segment-dataverse", label: "Error: Resource not found for the segment" },
    { href: "/errors/undeclared-property-only-has-property-annotations-dataverse", label: "Error: An undeclared property" },
    { href: "/errors/principal-user-is-missing-privilege-dataverse", label: "Error: Principal user is missing privilege" }
  ],
  sources: [
    automateDoc("dataverse/overview", "Overview of how to integrate flows with Dataverse"),
    automateDoc("dataverse/create-update-delete-trigger", "Trigger flows when a row is added, modified, or deleted"),
    automateDoc("dataverse/update", "Use a flow to update a row"),
    automateDoc("dataverse/known-issues", "Troubleshoot known issues with Dataverse"),
    automateDoc("dataverse/list-rows", "Use lists of rows in flows")
  ]
};
