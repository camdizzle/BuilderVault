import type { ResourceAddition } from "./resource-additions.ts";

const ex = (title: string, problem: string, code: string, expectedResult: string, commonMistakes: string[] = []) => ({
  title,
  problem,
  code,
  expectedResult,
  commonMistakes
});

const q = (question: string, answer: string) => ({ question, answer });

export const guideAdditions: Record<string, ResourceAddition> = {
  // ---------- Cheat sheets ----------
  "patch-sharepoint-columns-cheat-sheet": {
    examples: [
      ex(
        "Text, number, date and Yes/No",
        "Simple columns take plain values of the matching type.",
        `Patch(Requests, Defaults(Requests), {
    Title: txtTitle.Text,
    Quantity: Value(txtQuantity.Text),
    Amount: Value(txtAmount.Text),
    DueDate: dpDueDate.SelectedDate,
    StartTime: dpStart.SelectedDate + Time(Value(ddHour.Selected.Value), Value(ddMinute.Selected.Value), 0),
    IsUrgent: tglUrgent.Checked,
    Notes: txtNotes.Text
})`,
        "Each value is stored with its own type, so views and filters work on it.",
        ["Passing txtQuantity.Text to a number column without Value()", "Patching a date as text"]
      ),
      ex(
        "Multi-select choice",
        "A multi-select choice column takes a table of records, each with a Value.",
        `// From a combo box bound to Choices(Requests.Systems)
Patch(Requests, ThisItem, { Systems: cmbSystems.SelectedItems })

// From text values
Patch(Requests, ThisItem, { Systems: Table({ Value: "CRM" }, { Value: "Finance" }) })

// Clear all selections
Patch(Requests, ThisItem, { Systems: Blank() })`,
        "The selected values replace whatever was stored before."
      ),
      ex(
        "Lookup column",
        "A lookup needs the Id of the item in the other list. Value is the text shown.",
        `Patch(Requests, ThisItem, {
    Department: { Id: cmbDepartment.Selected.ID, Value: cmbDepartment.Selected.Title }
})

// When only the ID is known
Patch(Requests, ThisItem, { Department: { Id: 12, Value: "" } })

// Multi-value lookup
Patch(Requests, ThisItem, {
    RelatedProjects: ForAll(cmbProjects.SelectedItems, { Id: ID, Value: Title })
})`,
        "The item links to the chosen row in the lookup list.",
        ["Passing only the title text", "Using the lookup list's Title where the Id is expected"]
      ),
      ex(
        "Person column",
        "A person column takes a record with Claims built from the email address. The current user and a selected user follow the same shape.",
        `// Selected in a combo box bound to Office365Users.SearchUser
Patch(Requests, ThisItem, {
    AssignedTo: {
        Claims: "i:0#.f|membership|" & Lower(cmbAssignee.Selected.Mail),
        DisplayName: cmbAssignee.Selected.DisplayName,
        Email: Lower(cmbAssignee.Selected.Mail),
        Department: "", JobTitle: "", Picture: ""
    }
})

// Current user
Patch(Requests, ThisItem, {
    Reviewer: {
        Claims: "i:0#.f|membership|" & Lower(User().Email),
        DisplayName: User().FullName,
        Email: Lower(User().Email),
        Department: "", JobTitle: "", Picture: ""
    }
})

// Several people
Patch(Requests, ThisItem, {
    Watchers: ForAll(cmbWatchers.SelectedItems, {
        Claims: "i:0#.f|membership|" & Lower(Mail), DisplayName: DisplayName, Email: Lower(Mail),
        Department: "", JobTitle: "", Picture: ""
    })
})`,
        "SharePoint resolves the claims to the user and shows their name.",
        ["Leaving out the i:0#.f|membership| prefix", "Using a display name in Claims"]
      ),
      ex(
        "Hyperlink, managed metadata and clearing values",
        "The remaining column types, and how to empty a column.",
        `// Hyperlink column: SharePoint stores the URL, and the same value is used as the description
Patch(Requests, ThisItem, { SpecLink: "https://contoso.sharepoint.com/sites/specs/spec-12.pdf" })

// Managed metadata
Patch(Requests, ThisItem, {
    Topic: { Label: cmbTopic.Selected.Label, TermGuid: cmbTopic.Selected.TermGuid, WssId: 0, Path: "", Value: "" }
})

// Clear values
Patch(Requests, ThisItem, { DueDate: Blank(), AssignedTo: Blank(), Department: Blank(), Notes: "" })`,
        "Every common SharePoint column type can be written and cleared from the app."
      )
    ],
    faqs: [
      q("Why does Patch say it expects a Record value?", "The column is a choice, lookup, person or managed metadata column. Pass a record such as { Value: \"High\" } instead of text."),
      q("How do I patch a calculated column?", "You cannot. Calculated columns are read-only. Patch the columns the calculation uses."),
      q("How do I patch attachments?", "Attachments cannot be written with Patch. Use an Edit form with the attachments control, or send the file to a flow.")
    ]
  },

  "power-apps-gallery-filtering-cheat-sheet": {
    examples: [
      ex(
        "Filter by status, drop-down and current user",
        "The everyday filters, written so SharePoint and Dataverse can run them on the server.",
        `// Choice column equals a value
Filter(Requests, Status.Value = "Open")

// Drop-down with an "All" option
Filter(Requests, ddStatus.Selected.Value = "All" || Status.Value = ddStatus.Selected.Value)

// Items created by the current user (store the email first so the filter stays delegable)
// App.OnStart or App.Formulas:  nfMe = Lower(User().Email)
Filter(Requests, Author.Email = nfMe)

// Items assigned to the current user, using a text column kept alongside the person column
Filter(Requests, AssignedToEmail = nfMe)`,
        "The gallery shows the right rows however large the list grows.",
        ["Calling User().Email inside the Filter", "Comparing a choice column without .Value"]
      ),
      ex(
        "Search box",
        "StartsWith is delegable on SharePoint. Search and the in operator are not, so they only look at the first 500 to 10,000 rows.",
        `// Delegable on SharePoint and Dataverse
Filter(Requests, StartsWith(Title, txtSearch.Text))

// Search across two columns, still delegable
Filter(Requests, StartsWith(Title, txtSearch.Text) || StartsWith(RequestNumber, txtSearch.Text))

// Dataverse: Search is delegable when the columns are in the table's Quick Find view
Search('Service Requests', txtSearch.Text, "cnt_name", "cnt_requestnumber")

// Text input: set DelayOutput to true so the query runs when typing pauses`,
        "Search results come from the whole list, not just the first page of rows.",
        ["Using Search() on a large SharePoint list", "No DelayOutput, so every keystroke sends a query"]
      ),
      ex(
        "Date ranges",
        "Work out the boundary dates outside the Filter, then compare the column with them.",
        `// This month
With(
    { fromDate: Date(Year(Today()), Month(Today()), 1), toDate: DateAdd(Date(Year(Today()), Month(Today()), 1), 1, TimeUnit.Months) },
    Filter(Requests, DueDate >= fromDate && DueDate < toDate)
)

// Between two date pickers, inclusive of the end day
Filter(Requests, DueDate >= dpFrom.SelectedDate && DueDate < DateAdd(dpTo.SelectedDate, 1, TimeUnit.Days))

// Overdue
With({ today: Today() }, Filter(Requests, DueDate < today && Status.Value <> "Closed"))`,
        "Date filters delegate and include the right boundary days.",
        ["Wrapping the column in a function, such as Year(DueDate) = 2026", "Calling Today() or Now() inside the Filter on SharePoint"]
      ),
      ex(
        "Combine filters, sort and handle empty inputs",
        "Each optional input is skipped when empty, and the result is sorted on an indexed column.",
        `SortByColumns(
    Filter(
        Requests,
        (IsBlank(ddStatus.Selected.Value) || Status.Value = ddStatus.Selected.Value),
        (IsBlank(txtSearch.Text) || StartsWith(Title, txtSearch.Text)),
        (!tglMine.Checked || AssignedToEmail = nfMe)
    ),
    "Created",
    If(locSortDescending, SortOrder.Descending, SortOrder.Ascending)
)`,
        "One Items formula serves every combination of filters.",
        ["Nested If statements that return different Filter calls", "Sorting on a column that is not indexed in a large list"]
      ),
      ex(
        "What delegates and what does not",
        "A quick reference for SharePoint. Anything not delegable is applied only to the rows already downloaded.",
        `Delegable on SharePoint:     =  <>  <  >  <=  >=  &&  ||  StartsWith  IsBlank (as = Blank())
                             Sort and SortByColumns on simple columns
Not delegable on SharePoint: Search, in, exactin, EndsWith, Not on some comparisons, Len, Left, Mid, Lower, Upper,
                             CountRows, Sum, Average, Distinct, GroupBy, AddColumns before Filter, Last, FirstN beyond the limit
Person columns:              Email and DisplayName comparisons delegate. Other properties do not.
Yes/No columns:              compare with true or false directly.
ID column:                   only = delegates.
Data row limit:              Settings > General. 500 by default, 10,000 at most. Keep it at 500 while testing.`,
        "Delegation warnings can be predicted before they appear."
      )
    ],
    faqs: [
      q("What does the delegation warning mean?", "Part of the formula cannot be run by the data source, so Power Apps downloads rows up to the data row limit and filters those. Rows beyond the limit are ignored."),
      q("How do I search a large SharePoint list by text in the middle of a field?", "SharePoint cannot delegate a contains search. Use StartsWith, add a narrower delegable filter first, or call a flow that uses the SharePoint search API."),
      q("Should I raise the data row limit to 10,000?", "Only as a deliberate choice for small lists. It hides the problem until the list grows past the limit.")
    ]
  },

  "power-automate-trigger-conditions-cheat-sheet": {
    examples: [
      ex(
        "Choice, text, number and Yes/No columns",
        "The condition goes in the trigger's Settings under Trigger conditions. It must start with @ and return true.",
        `@equals(triggerOutputs()?['body/Status/Value'], 'Approved')
@not(equals(triggerOutputs()?['body/Status/Value'], 'Draft'))
@equals(triggerOutputs()?['body/Title'], 'Weekly report')
@contains(toLower(triggerOutputs()?['body/Title']), 'urgent')
@startsWith(triggerOutputs()?['body/Title'], 'INV-')
@greater(triggerOutputs()?['body/Amount'], 5000)
@lessOrEquals(triggerOutputs()?['body/Quantity'], 10)
@equals(triggerOutputs()?['body/IsUrgent'], true)`,
        "The flow starts only for items that match.",
        ["Leaving out /Value on a choice column", "Quoting true or a number as text"]
      ),
      ex(
        "Empty and not empty",
        "Wait for a value to be present, or process an item only once.",
        `@not(empty(triggerOutputs()?['body/AssignedTo']))
@empty(triggerOutputs()?['body/ProcessedOn'])
@not(equals(triggerOutputs()?['body/DueDate'], null))
@not(empty(triggerOutputs()?['body/AssignedTo/Email']))
@greater(length(triggerOutputs()?['body/Systems']), 0)`,
        "Runs are skipped until the item has what the flow needs."
      ),
      ex(
        "People and dates",
        "Compare the editor, the author or a date with today.",
        `@not(equals(triggerOutputs()?['body/Editor/Email'], 'svc-flow@contoso.com'))
@equals(toLower(triggerOutputs()?['body/Author/Email']), 'someone@contoso.com')
@endsWith(toLower(triggerOutputs()?['body/Author/Email']), '@contoso.com')
@less(triggerOutputs()?['body/DueDate'], utcNow())
@greaterOrEquals(triggerOutputs()?['body/DueDate'], addDays(utcNow(), 7))
@equals(formatDateTime(triggerOutputs()?['body/Created'], 'yyyy-MM-dd'), formatDateTime(triggerOutputs()?['body/Modified'], 'yyyy-MM-dd'))`,
        "The flow ignores its own edits and reacts only to the dates that matter."
      ),
      ex(
        "Combine with and, or",
        "Several separate conditions are joined with AND. Put OR logic inside a single condition.",
        `@and(equals(triggerOutputs()?['body/Status/Value'], 'Submitted'), greater(triggerOutputs()?['body/Amount'], 1000))
@or(equals(triggerOutputs()?['body/Priority/Value'], 'High'), equals(triggerOutputs()?['body/IsUrgent'], true))
@and(equals(triggerOutputs()?['body/Status/Value'], 'Approved'), empty(triggerOutputs()?['body/NotifiedOn']))`,
        "One trigger handles the whole rule."
      ),
      ex(
        "Files, email and schedules",
        "Property names differ by trigger. Copy them from a test run's trigger outputs.",
        `// Document library
@endsWith(toLower(triggerOutputs()?['body/{FilenameWithExtension}']), '.pdf')
@startsWith(triggerOutputs()?['body/{Path}'], 'Shared Documents/Invoices/')
@equals(triggerOutputs()?['body/{IsFolder}'], false)

// Outlook: When a new email arrives (V3)
@contains(toLower(triggerOutputs()?['body/subject']), 'invoice')
@equals(triggerOutputs()?['body/hasAttachments'], true)

// Recurrence: weekdays only
@and(greater(dayOfWeek(utcNow()), 0), less(dayOfWeek(utcNow()), 6))`,
        "The same technique works on any trigger."
      )
    ],
    faqs: [
      q("Where do I add a trigger condition?", "Select the trigger, open Settings and add the expression under Trigger conditions. Each line is one condition."),
      q("Do skipped triggers count as runs?", "No. When the condition is false no run is created, so nothing appears in run history and no actions are counted."),
      q("How do I test a trigger condition?", "Paste the expression without the leading @ into a Compose action in a test flow and check that it returns true or false for sample items.")
    ]
  },

  "dataverse-security-roles-cheat-sheet": {
    examples: [
      ex(
        "Privileges and access levels",
        "Every table privilege in a role has an access level that sets how far it reaches.",
        `Privileges     Create  Read  Write  Delete  Append  Append To  Assign  Share
Access levels  None < User < Business Unit < Parent: Child Business Units < Organization

User              rows the user owns, plus rows shared with them or owned by their teams
Business Unit     rows owned by anyone in the user's business unit
Parent: Child     the user's business unit and all beneath it
Organization      all rows
Organization-owned tables: None or Organization only`,
        "You can read a role's grid and say exactly which rows a user can touch."
      ),
      ex(
        "What each task needs",
        "The privileges behind common actions.",
        `Open a model-driven app          Read on the app's tables, plus a role that includes the app
See a row                        Read
Create a row                     Create, plus Read to see it afterwards
Set a lookup                     Append on the row being saved, Append To on the row it points at
Add a note or attachment         Create and Append on Note, Append To on the parent table
Change the owner                 Assign
Share a row with someone         Share
Run a flow on the user's behalf  the privileges the flow's actions need, for the connection's user
Export to Excel                  Export to Excel privilege (miscellaneous privileges)
Bulk delete                      Bulk Delete privilege`,
        "Permission errors can be traced to a missing privilege quickly.",
        ["Granting Create without Read", "Forgetting Append To on the related table"]
      ),
      ex(
        "Roles combine",
        "A user's access is the most generous combination of every role they hold, directly and through teams.",
        `User has:   Requester role   Service Request Read: User
            Agent role       Service Request Read: Business Unit   (through the team "Request Agents")
Effective:  Service Request Read: Business Unit

There is no deny. To reduce access, remove a role or lower the level in every role that grants it.
Team roles: set "Member's privilege inheritance" to Direct User (Basic) access level and Team privileges
            so User-level privileges apply to rows the member owns.`,
        "Unexpected access can be explained by listing every role a user has."
      ),
      ex(
        "Common errors",
        "What the message means and what to change.",
        `"You do not have permission to access these records" / missing prvRead<Table>
    > add Read on the table at a level that covers the row
"SecLib::AccessCheckEx failed ... prvAppendTo<Table>"
    > add Append To on the table the lookup points at
"The user is not a member of the organization" / user not listed
    > add the user to the environment (security group) and wait for sync, or use Add user
"...does not have a security role" when opening an app
    > assign at least one role, directly or through a team
App opens but lists are empty
    > Read is granted at User level and the user owns no rows`,
        "Most access tickets can be resolved from the error text."
      ),
      ex(
        "Good practice",
        "Habits that keep security manageable.",
        `Create custom roles for your tables. Assign them together with Basic User or App Opener.
Do not edit the standard roles. Do not hand out System Administrator or System Customizer to users.
Assign roles to Entra group teams, not to individuals.
Keep roles in the solution and deploy them. Do not edit roles in Production.
Test with an account that has only the role under test.
Use column security profiles for sensitive columns, not separate tables.`,
        "Access can be audited, deployed and reasoned about."
      )
    ],
    faqs: [
      q("What is the difference between Append and Append To?", "Append lets a row be attached to another row. Append To lets other rows be attached to this one. Setting a lookup needs Append on the row with the lookup and Append To on the target."),
      q("Can a security role deny access?", "No. Roles only grant. Access is the union of all roles a user holds."),
      q("Why can a user see the app but no rows?", "They have Read at User level and own no rows, or they have no Read privilege on the table at all.")
    ]
  },

  "power-automate-date-formatting-cheat-sheet": {
    examples: [
      ex(
        "Common formats",
        "formatDateTime takes a date and a format string. Format strings are case sensitive: MM is month, mm is minutes, HH is 24-hour, hh is 12-hour.",
        `formatDateTime(utcNow(), 'yyyy-MM-dd')                 2026-03-09
formatDateTime(utcNow(), 'dd/MM/yyyy')                 09/03/2026
formatDateTime(utcNow(), 'MM/dd/yyyy')                 03/09/2026
formatDateTime(utcNow(), 'd MMMM yyyy')                9 March 2026
formatDateTime(utcNow(), 'ddd, d MMM yyyy')            Mon, 9 Mar 2026
formatDateTime(utcNow(), 'dddd')                       Monday
formatDateTime(utcNow(), 'HH:mm')                      14:05
formatDateTime(utcNow(), 'h:mm tt')                    2:05 PM
formatDateTime(utcNow(), 'yyyy-MM-ddTHH:mm:ssZ')       2026-03-09T14:05:00Z
formatDateTime(utcNow(), 'yyyyMMdd-HHmmss')            20260309-140500
formatDateTime(utcNow(), 'MMMM yyyy')                  March 2026
formatDateTime(utcNow(), 'd MMMM yyyy', 'fr-FR')       9 mars 2026`,
        "Dates appear the way the reader expects.",
        ["mm where MM was meant, which prints minutes", "hh without tt, which hides AM and PM"]
      ),
      ex(
        "Time zones",
        "Dates in flows are UTC. Convert before formatting anything a person will read.",
        `convertFromUtc(utcNow(), 'Eastern Standard Time', 'dd/MM/yyyy HH:mm')
convertFromUtc(utcNow(), 'GMT Standard Time', 'd MMMM yyyy, HH:mm')
convertTimeZone(triggerOutputs()?['body/Start'], 'UTC', 'AUS Eastern Standard Time', 'dddd d MMMM, h:mm tt')
convertToUtc('2026-03-09T09:00:00', 'Pacific Standard Time')

Time zone names are Windows names: 'GMT Standard Time' (UK), 'W. Europe Standard Time', 'Central Standard Time',
'India Standard Time', 'Singapore Standard Time'. Daylight saving is applied automatically.`,
        "Times in emails and messages match the reader's clock.",
        ["Formatting a UTC value and calling it local time", "IANA names such as Europe/London, which these functions do not accept"]
      ),
      ex(
        "Add, subtract and compare",
        "Date arithmetic for due dates, reminders and filters.",
        `addDays(utcNow(), 7)                                    a week from now
addDays(utcNow(), -30, 'yyyy-MM-dd')                    30 days ago, formatted
addHours(utcNow(), 2)
addToTime(utcNow(), 1, 'Month')
startOfDay(utcNow())      startOfMonth(utcNow())      startOfHour(utcNow())
dayOfWeek(utcNow())       0 = Sunday ... 6 = Saturday
dayOfMonth(utcNow())      dayOfYear(utcNow())

Days between two dates:
div(sub(ticks(variables('varEnd')), ticks(variables('varStart'))), 864000000000)

Compare:
less(triggerOutputs()?['body/DueDate'], utcNow())
greaterOrEquals(triggerOutputs()?['body/DueDate'], startOfDay(utcNow()))`,
        "Reminder and overdue logic works on real dates, not text."
      ),
      ex(
        "Dates in SharePoint filter queries",
        "OData filters need ISO dates in single quotes.",
        `DueDate lt '@{utcNow()}'
DueDate le '@{formatDateTime(addDays(utcNow(), 7), 'yyyy-MM-dd')}'
Created ge '@{startOfDay(utcNow())}'
Modified ge '@{addDays(utcNow(), -1)}'
DueDate ge '@{startOfMonth(utcNow())}' and DueDate lt '@{addToTime(startOfMonth(utcNow()), 1, 'Month')}'`,
        "Get items returns only the rows in the date range."
      ),
      ex(
        "Blank dates and odd inputs",
        "Guard against empty values and convert dates that arrive as text or numbers.",
        `if(empty(triggerOutputs()?['body/DueDate']), 'No due date', formatDateTime(triggerOutputs()?['body/DueDate'], 'd MMMM yyyy'))

Excel serial number to date:
addDays('1899-12-30', int(item()?['Date']), 'yyyy-MM-dd')

Text such as 09/03/2026 (day first) to a date:
parseDateTime(triggerBody()?['text'], 'en-GB', 'dd/MM/yyyy')

Unix seconds to a date:
addSeconds('1970-01-01T00:00:00Z', int(triggerBody()?['timestamp']))`,
        "The flow does not fail on an empty or unusual date.",
        ["formatDateTime on a null value", "Assuming day/month order in text dates"]
      )
    ],
    faqs: [
      q("Why does formatDateTime fail with 'the datetime string must match ISO 8601 format'?", "The input is not a date the function recognises, often text such as 09/03/2026 or an empty value. Convert it with parseDateTime or guard against blanks first."),
      q("How do I show the month name?", "Use MMM for the short name and MMMM for the full name, for example formatDateTime(utcNow(), 'd MMMM yyyy')."),
      q("How do I get the user's local time?", "Convert from UTC with convertFromUtc and the Windows time zone name for that user or site.")
    ]
  },

  "adaptive-card-payload-cheat-sheet": {
    examples: [
      ex(
        "Card skeleton",
        "Every card has a type, a schema version and a body. Teams supports version 1.4 and 1.5 for most scenarios.",
        `{
  "type": "AdaptiveCard",
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "version": "1.4",
  "body": [
    { "type": "TextBlock", "text": "Request approved", "weight": "Bolder", "size": "Medium", "wrap": true },
    { "type": "TextBlock", "text": "Your laptop request has been approved.", "wrap": true }
  ],
  "actions": [
    { "type": "Action.OpenUrl", "title": "Open request", "url": "https://contoso.sharepoint.com/sites/requests" }
  ]
}`,
        "A valid card that posts to a Teams chat or channel.",
        ["Leaving out wrap, so long text is cut off", "Using a version the host does not support"]
      ),
      ex(
        "Facts and columns",
        "A FactSet lays out label and value pairs. ColumnSet puts content side by side.",
        `{
  "type": "FactSet",
  "facts": [
    { "title": "Requester", "value": "Dana Lee" },
    { "title": "Amount", "value": "1,250.00" },
    { "title": "Due", "value": "9 March 2026" }
  ]
},
{
  "type": "ColumnSet",
  "columns": [
    { "type": "Column", "width": "auto", "items": [ { "type": "Image", "url": "https://contoso.com/logo.png", "size": "Small" } ] },
    { "type": "Column", "width": "stretch", "items": [ { "type": "TextBlock", "text": "Purchase request", "weight": "Bolder" } ] }
  ]
}`,
        "Details are easy to scan on desktop and phone."
      ),
      ex(
        "Inputs and submit",
        "Use with Post adaptive card and wait for a response. Each input's id becomes a property in the response.",
        `"body": [
  { "type": "Input.ChoiceSet", "id": "decision", "label": "Decision", "isRequired": true, "errorMessage": "Choose a decision",
    "style": "expanded", "choices": [ { "title": "Approve", "value": "Approve" }, { "title": "Reject", "value": "Reject" } ] },
  { "type": "Input.Text", "id": "comments", "label": "Comments", "isMultiline": true, "maxLength": 500 },
  { "type": "Input.Date", "id": "effectiveDate", "label": "Effective date" },
  { "type": "Input.Toggle", "id": "notify", "title": "Notify the requester", "value": "true" }
],
"actions": [ { "type": "Action.Submit", "title": "Submit" } ]

Read the response in the flow:
body('Post_adaptive_card_and_wait_for_a_response')?['data']?['decision']
body('Post_adaptive_card_and_wait_for_a_response')?['data']?['comments']
body('Post_adaptive_card_and_wait_for_a_response')?['responder']?['email']`,
        "The flow receives the person's choices as named values.",
        ["Two inputs with the same id", "Reading the value from the wrong path"]
      ),
      ex(
        "Dynamic values from a flow",
        "Insert flow values into the JSON with expressions. Text that may contain quotes or line breaks must be made safe first.",
        `{ "type": "TextBlock", "text": "@{triggerOutputs()?['body/Title']}", "wrap": true }
{ "title": "Amount", "value": "@{formatNumber(triggerOutputs()?['body/Amount'], 'N2')}" }
{ "title": "Due", "value": "@{formatDateTime(triggerOutputs()?['body/DueDate'], 'd MMMM yyyy')}" }

Make free text safe for JSON:
@{replace(replace(replace(coalesce(triggerOutputs()?['body/Details'], ''), '\\', '\\\\'), '"', '\\"'), decodeUriComponent('%0A'), '\\n')}

Build a list of facts from items with a Select action, then insert the output:
Select  From: body('Get_items')?['value']   Map: title = item()?['Title'], value = item()?['Status/Value']
"facts": @{body('Select')}`,
        "Cards are valid whatever users typed into the source fields.",
        ["Inserting multi-line text straight into the JSON", "Null values producing invalid JSON"]
      ),
      ex(
        "Mention a person",
        "A mention needs the at-tag in the text and a matching entity in msteams.entities.",
        `{
  "type": "AdaptiveCard", "version": "1.4",
  "body": [ { "type": "TextBlock", "text": "<at>Dana Lee</at> please review this request.", "wrap": true } ],
  "msteams": {
    "entities": [
      { "type": "mention", "text": "<at>Dana Lee</at>",
        "mentioned": { "id": "dana.lee@contoso.com", "name": "Dana Lee" } }
    ]
  }
}`,
        "The person is notified in Teams and their name is highlighted.",
        ["Text in the entity not matching the at-tag exactly"]
      )
    ],
    faqs: [
      q("Which Adaptive Card version should I use for Teams?", "Version 1.4 is the safe choice for cards sent by Power Automate. Version 1.5 features work in most current Teams clients."),
      q("Why does my card fail with a JSON error?", "A dynamic value contains a quote, backslash or line break, or is null. Escape free text and use coalesce to supply an empty string."),
      q("How do I design a card visually?", "Use the Adaptive Cards Designer, choose Microsoft Teams as the host app, then copy the JSON into the flow.")
    ]
  },

  // ---------- Cookbooks ----------
  "power-apps-patch-cookbook": {
    examples: [
      ex(
        "Create or update with one formula",
        "A form screen that handles both new and existing records without separate buttons.",
        `Set(
    gblSavedRequest,
    Patch(
        Requests,
        Coalesce(LookUp(Requests, ID = gblSelectedRequest.ID), Defaults(Requests)),
        { Title: txtTitle.Text, Priority: { Value: ddPriority.Selected.Value } }
    )
)`,
        "A blank selection creates a row. An existing one is updated.",
        ["Using Defaults() for edits, which creates duplicates"]
      ),
      ex(
        "Save a parent and its child rows",
        "Save the parent first, capture its ID, then write all child rows in one call.",
        `IfError(
    Set(gblOrder, Patch(Orders, Defaults(Orders), { Title: txtOrderRef.Text, Customer: txtCustomer.Text }));
    Patch(
        'Order Lines',
        ForAll(colLines As line, { Title: line.Item, Quantity: line.Qty, UnitPrice: line.Price, OrderId: gblOrder.ID })
    );
    Notify("Order saved", NotificationType.Success),
    Notify("Could not save the order: " & FirstError.Message, NotificationType.Error)
)`,
        "The lines are linked to the new order by its ID.",
        ["Saving children before the parent has an ID", "ForAll with a Patch per row, which is slow"]
      ),
      ex(
        "Bulk update selected rows",
        "Let users tick rows in a gallery and change them all at once.",
        `// Checkbox in the gallery
// chkSelect.OnCheck   : Collect(colSelected, ThisItem)
// chkSelect.OnUncheck : Remove(colSelected, LookUp(colSelected, ID = ThisItem.ID))

// btnApproveSelected.OnSelect
Patch(
    Requests,
    ForAll(colSelected As row, { ID: row.ID, Status: { Value: "Approved" }, ApprovedOn: Now() })
);
Clear(colSelected)`,
        "All selected rows change in one request to the data source."
      ),
      ex(
        "Avoid overwriting someone else's change",
        "Re-read the row before saving, and stop if it changed since the user opened it.",
        `With(
    { latest: LookUp(Requests, ID = gblSelectedRequest.ID) },
    If(
        latest.Modified > gblSelectedRequest.Modified,
        Notify("This request was changed by " & latest.'Modified By'.DisplayName & ". Reload before saving.", NotificationType.Warning),
        Set(gblSelectedRequest, Patch(Requests, latest, { Details: txtDetails.Text }))
    )
)`,
        "Two people editing the same row do not silently overwrite each other."
      ),
      ex(
        "Soft delete",
        "Mark a row as deleted instead of removing it, so it can be restored and audited.",
        `// Delete
Patch(Requests, galRequests.Selected, { IsDeleted: true, DeletedOn: Now(), DeletedBy: User().Email });

// Gallery
Filter(Requests, !IsDeleted)

// Restore
Patch(Requests, galDeleted.Selected, { IsDeleted: false, DeletedOn: Blank(), DeletedBy: Blank() })`,
        "Nothing is lost when a user deletes by mistake."
      )
    ],
    faqs: [
      q("Is Patch faster than SubmitForm?", "They are similar for a single record. Patch is much faster for many rows, because it can send a table of changes in one call."),
      q("How do I know which row failed in a bulk Patch?", "Wrap the call in IfError and read FirstError, or check Errors(DataSource) afterwards for the affected records."),
      q("Can Patch update two data sources in one transaction?", "No. Each Patch is separate. Save the most important record first and handle failure of the second explicitly.")
    ]
  },

  "power-apps-collections-cookbook": {
    examples: [
      ex(
        "Cache reference data at start",
        "Load small lists once so drop-downs and lookups do not query the source each time.",
        `// App.OnStart
Concurrent(
    ClearCollect(colCategories, Filter(Categories, IsActive)),
    ClearCollect(colDepartments, Departments),
    ClearCollect(colSettings, 'App Settings')
)

// ddCategory.Items
SortByColumns(colCategories, "SortOrder")

// In a gallery row, a local lookup instead of a call per row
LookUp(colCategories, ID = ThisItem.CategoryId).Title`,
        "Screens open faster and galleries make no extra calls per row.",
        ["Collecting large transaction tables at start", "Never refreshing the cache after reference data changes"]
      ),
      ex(
        "Shopping cart",
        "Add items, change quantities, remove lines and show a total.",
        `// Add
If(
    IsBlank(LookUp(colCart, ProductId = ThisItem.ID)),
    Collect(colCart, { ProductId: ThisItem.ID, Name: ThisItem.Title, Qty: 1, Price: ThisItem.Price }),
    UpdateIf(colCart, ProductId = ThisItem.ID, { Qty: Qty + 1 })
);

// Change quantity (in the cart gallery)
Patch(colCart, ThisItem, { Qty: Value(txtQty.Text) });

// Remove
Remove(colCart, ThisItem);

// Totals
Sum(colCart, Qty * Price)
CountRows(colCart) & " items"`,
        "The cart behaves as users expect, with no duplicate lines."
      ),
      ex(
        "Editable grid with staged changes",
        "Edit many rows locally and save only what changed.",
        `// Load
ClearCollect(colEdit, AddColumns(Filter(Tasks, ProjectId = gblProject.ID), IsChanged, false));

// txtHours.OnChange in the gallery
Patch(colEdit, ThisItem, { Hours: Value(txtHours.Text), IsChanged: true });

// Save
Patch(Tasks, ForAll(Filter(colEdit, IsChanged) As row, { ID: row.ID, Hours: row.Hours }));
UpdateIf(colEdit, IsChanged, { IsChanged: false });

// Unsaved changes indicator
CountRows(Filter(colEdit, IsChanged)) > 0`,
        "One save writes every edited row, and unchanged rows are left alone."
      ),
      ex(
        "Summaries with GroupBy",
        "Turn detail rows into counts and totals for a summary gallery or chart.",
        `ClearCollect(
    colSummary,
    AddColumns(
        GroupBy(colRequests, Status, Rows),
        Total, CountRows(Rows),
        Amount, Sum(Rows, Amount)
    )
);

// Distinct values for a filter drop-down
Distinct(colRequests, Department)`,
        "Totals by status are ready for display without another query."
      ),
      ex(
        "Offline storage",
        "Keep a collection on the device so the app has data without a connection.",
        `// Save after loading or changing
SaveData(colRequests, "requests");

// Load at start when offline
If(Connection.Connected,
    ClearCollect(colRequests, Filter(Requests, AssignedToEmail = nfMe)); SaveData(colRequests, "requests"),
    LoadData(colRequests, "requests", true)
)`,
        "The last loaded data is available when the device has no signal.",
        ["Expecting SaveData to sync changes back. That needs your own queue and Patch when online."]
      )
    ],
    faqs: [
      q("Do collections slow an app down?", "Small collections speed it up. Large ones use memory and take time to load, so collect only what the screen needs."),
      q("Is a collection delegable?", "A collection is local, so filters on it run in the app. Delegation matters when filling the collection: a non-delegable query brings back at most the data row limit."),
      q("How do I refresh a collection after saving?", "Patch the same change into the collection, or run the ClearCollect again for small lists.")
    ]
  },

  "power-automate-expressions-cookbook": {
    examples: [
      ex(
        "Safe values for emails and approvals",
        "Stop blank fields producing empty lines or failed actions.",
        `coalesce(triggerOutputs()?['body/Notes'], 'No notes were entered.')
if(empty(triggerOutputs()?['body/DueDate']), 'No due date', formatDateTime(triggerOutputs()?['body/DueDate'], 'd MMMM yyyy'))
coalesce(triggerOutputs()?['body/AssignedTo/Email'], triggerOutputs()?['body/Author/Email'])
formatNumber(coalesce(triggerOutputs()?['body/Amount'], 0), 'N2')`,
        "Messages read properly whatever is missing from the item.",
        ["Leaving out the question mark, so a missing property fails the action"]
      ),
      ex(
        "Build a list of email addresses",
        "Collect addresses from a multi-person column or from items, remove duplicates and join them.",
        `Select        From: triggerOutputs()?['body/Watchers']     Map (text mode): item()?['Email']
join(union(body('Select'), body('Select')), ';')

From Get items, one address per owner:
Select        From: body('Get_items')?['value']             Map: item()?['Owner/Email']
union(body('Select_owners'), body('Select_owners'))`,
        "One clean recipient string with no repeats."
      ),
      ex(
        "Filter and count without a loop",
        "Filter array, length and first replace most Apply to each loops.",
        `Filter array   From: body('Get_items')?['value']    Condition: @greater(item()?['Amount'], 1000)
length(body('Filter_array'))
first(body('Filter_array'))?['Title']
if(equals(length(body('Filter_array')), 0), 'None', string(length(body('Filter_array'))))

Sum a column (no loop):
xpath(xml(json(concat('{"r":{"i":', string(body('Select_amounts')), '}}'))), 'sum(/r/i)')`,
        "The flow runs in seconds instead of minutes on long lists.",
        ["Apply to each with a variable to count matching items"]
      ),
      ex(
        "Text handling",
        "Split names and file names, trim input and build identifiers.",
        `first(split(triggerOutputs()?['body/Author/DisplayName'], ' '))
last(split(triggerOutputs()?['body/{FilenameWithExtension}'], '.'))
replace(triggerOutputs()?['body/{FilenameWithExtension}'], concat('.', last(split(triggerOutputs()?['body/{FilenameWithExtension}'], '.'))), '')
trim(triggerBody()?['text'])
concat('REQ-', formatNumber(triggerOutputs()?['body/ID'], '000000'))
substring(variables('varText'), 0, min(length(variables('varText')), 255))
if(contains(variables('varEmail'), '@'), toLower(variables('varEmail')), '')`,
        "Values are tidy before they are stored or sent."
      ),
      ex(
        "Links and run details",
        "Build links people can select, and capture details of the current run.",
        `Link to the item:     triggerOutputs()?['body/{Link}']
Link to the run:      concat('https://make.powerautomate.com/environments/', workflow()?['tags']?['environmentName'], '/flows/', workflow()?['name'], '/runs/', workflow()?['run']?['name'])
Flow name:            workflow()?['tags']?['flowDisplayName']
HTML link in email:   concat('<a href="', triggerOutputs()?['body/{Link}'], '">', triggerOutputs()?['body/Title'], '</a>')
Encode for a URL:     encodeUriComponent(triggerOutputs()?['body/Title'])`,
        "Notifications take the reader straight to the record or the run."
      )
    ],
    faqs: [
      q("When should I use a Compose action for an expression?", "When the value is used more than once or the expression is long. Name the Compose for what it produces, then reference its output."),
      q("How do I debug an expression?", "Put it in a Compose action, run the flow and read the output. Break long expressions into several Compose steps."),
      q("Why does my expression work in one flow and not another?", "Action names differ. An expression such as body('Get_items') must match the action's name with spaces replaced by underscores.")
    ]
  },

  "sharepoint-list-schema-cookbook": {
    examples: [
      ex(
        "Request tracking list",
        "The standard shape for work that is submitted, assigned and completed.",
        `Title            Single line     required
RequestType      Choice          indexed
Details          Multiple lines  plain text
Priority         Choice          Low | Normal | High    default Normal
Status           Choice          New | In progress | Waiting | Done | Declined    default New, indexed
AssignedTo       Person          indexed
AssignedToEmail  Single line     kept in step by a flow, for delegable app filters
DueDate          Date only       indexed
ClosedOn         Date and time
Views: My requests, Unassigned, Open by type, Overdue, Closed this month`,
        "A list that works for the form, the team's queue and reporting.",
        ["No index on Status and AssignedTo", "Status as free text"]
      ),
      ex(
        "Parent and child lists",
        "Repeating details belong in their own list, linked to the parent.",
        `Orders (parent):       Title, Customer, OrderDate, Status
Order Lines (child):   Title, OrderId (Number, indexed), Quantity, UnitPrice, LineTotal (Calculated =[Quantity]*[UnitPrice])

Number column link:    simplest for Power Apps and flows.  Filter('Order Lines', OrderId = gblOrder.ID)
Lookup column link:    shows the relationship in SharePoint and can enforce cascade or restrict delete.
                       Counts toward the 12 lookup columns per view limit.`,
        "Any number of lines per order, with totals that can be summed.",
        ["Line1, Line2, Line3 columns on the parent", "Storing lines as text in a multi-line column"]
      ),
      ex(
        "Approval columns",
        "Record the approval on the item so apps, views and reports can use it.",
        `ApprovalStatus     Choice     Not submitted | Pending | Approved | Rejected     indexed
Approver           Person
SubmittedOn        Date and time
DecisionOn         Date and time
DecisionBy         Person
DecisionComments   Multiple lines, plain text
ApprovalRunUrl     Hyperlink`,
        "The decision, who made it and when are visible without opening flow history."
      ),
      ex(
        "Settings and reference lists",
        "Small lists that let owners change behaviour without editing the app or flow.",
        `App Settings:   Title (key, unique), SettingValue (text), Description, IsEnabled (Yes/No)
Categories:     Title (unique), Code (unique), IsActive (Yes/No, default Yes), SortOrder (Number), Owner (Person)
Routing Rules:  Title, Category (Lookup), MinAmount (Currency), ApproverEmail, IsActive

Power Apps:     Value(LookUp('App Settings', Title = "ApprovalThreshold").SettingValue)
Power Automate: Get items, Filter Query: Title eq 'ApprovalThreshold', Top Count 1`,
        "Thresholds, addresses and lists are data that the business owner maintains."
      ),
      ex(
        "History list",
        "An append-only record of what happened to each item.",
        `Request History:  Title (event), RequestId (Number, indexed), FromValue, ToValue, Comment (plain text),
                  EventOn (Date and time, default today)

Written by the app after each status change, or by a flow on item modified with Get changes for an item.
View: grouped by RequestId, sorted by EventOn descending.`,
        "A timeline for each request that does not depend on version history."
      )
    ],
    faqs: [
      q("Should related data be in one list or several?", "Use one list per kind of thing. If a group of columns repeats, such as line items or history entries, move it to a child list."),
      q("Is a lookup column or a number column better for linking lists?", "A number column holding the parent ID is simplest for apps and flows. A lookup column is better when users work in SharePoint directly and you want delete rules."),
      q("How do I plan a schema before building?", "List the questions the data must answer and the views needed, then choose columns and indexes to support them.")
    ]
  }
};
