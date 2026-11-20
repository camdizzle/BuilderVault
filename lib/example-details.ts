export type ExampleSection = {
  heading: string;
  body: string;
  code: string;
};

type ExampleDetail = {
  sections: ExampleSection[];
  faqs: { question: string; answer: string }[];
};

export const exampleDetails: Record<string, ExampleDetail> = {
  "power-apps-patch-examples": {
    sections: [
      {
        heading: "Create a new record",
        body: "Defaults() gives Patch an empty record for the data source, so a new row is created. Capture the result in a variable when a later step needs the new ID.",
        code: `Set(
    varNewRequest,
    Patch(
        Requests,
        Defaults(Requests),
        {
            Title: txtTitle.Text,
            Details: txtDetails.Text,
            DueDate: dpDueDate.SelectedDate
        }
    )
);
Navigate(scrConfirmation, ScreenTransition.None, { locRequestId: varNewRequest.ID })`
      },
      {
        heading: "Update an existing record",
        body: "Pass the record to change as the second argument. Only the columns you list are written. Everything else on the row is left alone.",
        code: `// From a gallery
Patch(Requests, galRequests.Selected, { Status: { Value: "In review" } })

// By ID, when the record is not in a gallery
Patch(Requests, LookUp(Requests, ID = varRequestId), { Status: { Value: "Closed" }, ClosedOn: Now() })`
      },
      {
        heading: "Create or update with one formula",
        body: "When a screen handles both new and existing records, choose the base record with Coalesce. A blank lookup falls back to Defaults(), which creates the row.",
        code: `Patch(
    Requests,
    Coalesce(LookUp(Requests, ID = varRequestId), Defaults(Requests)),
    {
        Title: txtTitle.Text,
        Priority: { Value: ddPriority.Selected.Value }
    }
)`
      },
      {
        heading: "SharePoint choice, lookup and person columns",
        body: "Complex SharePoint columns are records, not text. A choice needs a Value, a lookup needs an Id and Value, and a person needs Claims with the email address.",
        code: `Patch(
    Requests,
    galRequests.Selected,
    {
        // Choice
        Priority: { Value: ddPriority.Selected.Value },
        // Multi-select choice
        Systems: ForAll(cmbSystems.SelectedItems, { Value: Value }),
        // Lookup to the Departments list
        Department: { Id: cmbDepartment.Selected.ID, Value: cmbDepartment.Selected.Title },
        // Person
        AssignedTo: {
            Claims: "i:0#.f|membership|" & Lower(cmbAssignee.Selected.Mail),
            DisplayName: cmbAssignee.Selected.DisplayName,
            Email: Lower(cmbAssignee.Selected.Mail),
            Department: "",
            JobTitle: "",
            Picture: ""
        },
        // Yes/No
        IsUrgent: tglUrgent.Checked
    }
)`
      },
      {
        heading: "Dataverse choice and lookup columns",
        body: "Dataverse takes the choice enum value directly and a whole record for a lookup. No Value wrapper is needed.",
        code: `Patch(
    'Service Requests',
    Defaults('Service Requests'),
    {
        Name: txtTitle.Text,
        // Choice: use the enum, or the selected item from a control bound to Choices()
        Priority: 'Priority (Service Requests)'.High,
        // Lookup: pass the related record
        Account: cmbAccount.Selected,
        // Clear a lookup
        'Primary Contact': Blank()
    }
)`
      },
      {
        heading: "Clear a column",
        body: "Patching Blank() clears a value. For SharePoint, the formula-level error management setting must be on, which is the default in new apps.",
        code: `Patch(
    Requests,
    galRequests.Selected,
    {
        DueDate: Blank(),
        AssignedTo: Blank(),
        Notes: ""
    }
)`
      },
      {
        heading: "Update many rows in one call",
        body: "Patch accepts a table of changes. One call with a table is much faster than ForAll with a Patch inside, because the rows are sent together.",
        code: `// Approve every selected row
Patch(
    Requests,
    ForAll(
        Filter(colRequests, IsSelected) As row,
        { ID: row.ID, Status: { Value: "Approved" }, ApprovedOn: Now() }
    )
)

// Create several rows from a collection
Patch(
    'Request Lines',
    ForAll(colLines As line, { Title: line.Item, Quantity: line.Qty, RequestId: varNewRequest.ID })
)`
      },
      {
        heading: "Handle errors and stop double submits",
        body: "Wrap the save in IfError so the user sees what happened, and use a saving flag to disable the button while the call runs.",
        code: `// btnSave.OnSelect
UpdateContext({ locSaving: true });
IfError(
    Patch(Requests, Defaults(Requests), { Title: txtTitle.Text });
    Notify("Saved", NotificationType.Success);
    Navigate(scrHome),
    Notify("Could not save: " & FirstError.Message, NotificationType.Error)
);
UpdateContext({ locSaving: false })

// btnSave.DisplayMode
If(locSaving || IsBlank(txtTitle.Text), DisplayMode.Disabled, DisplayMode.Edit)`
      }
    ],
    faqs: [
      {
        question: "What is the difference between Patch and SubmitForm?",
        answer: "SubmitForm saves an Edit form control and runs its built-in validation and OnSuccess or OnFailure. Patch writes the columns you name from any controls, which suits custom screens, partial updates and bulk changes."
      },
      {
        question: "How do I get the ID of a record I just created with Patch?",
        answer: "Patch returns the saved record. Store it with Set or UpdateContext and read its ID, for example Set(varNew, Patch(...)) then varNew.ID."
      },
      {
        question: "Why does my Patch say the column expects a record?",
        answer: "The column is a choice, lookup or person column. Pass a record in the right shape, such as { Value: \"High\" } for a SharePoint choice, instead of plain text."
      },
      {
        question: "Does Patch overwrite columns I do not mention?",
        answer: "No. Patch changes only the columns in the change record. Other columns keep their current values."
      }
    ]
  },

  "power-apps-collections-examples": {
    sections: [
      {
        heading: "Collect, ClearCollect and Clear",
        body: "ClearCollect replaces the collection's contents. Collect adds to it. Clear empties it. Use ClearCollect for loading and Collect for adding rows as the user works.",
        code: `// Load, replacing anything already in the collection
ClearCollect(colCategories, Filter(Categories, IsActive));

// Add one row
Collect(colCart, { ProductId: ThisItem.ID, Name: ThisItem.Title, Qty: 1, Price: ThisItem.Price });

// Empty it
Clear(colCart)`
      },
      {
        heading: "Build a collection by hand",
        body: "Table() with records is a quick way to create fixed lists for menus, tabs and test data without a data source.",
        code: `ClearCollect(
    colTabs,
    Table(
        { Key: "open",   Label: "Open",   Order: 1 },
        { Key: "mine",   Label: "Mine",   Order: 2 },
        { Key: "closed", Label: "Closed", Order: 3 }
    )
)`
      },
      {
        heading: "Update and remove rows",
        body: "Patch changes one row, UpdateIf changes every row that matches a condition, and Remove or RemoveIf deletes rows.",
        code: `// Change one row
Patch(colCart, ThisItem, { Qty: ThisItem.Qty + 1 });

// Change every matching row
UpdateIf(colCart, ProductId = varProductId, { Qty: 0 });

// Remove one row, or all matching rows
Remove(colCart, ThisItem);
RemoveIf(colCart, Qty = 0)`
      },
      {
        heading: "Add to a cart without duplicates",
        body: "Check whether the item is already in the collection. Increase its quantity if so, otherwise add a new row.",
        code: `If(
    IsBlank(LookUp(colCart, ProductId = ThisItem.ID)),
    Collect(colCart, { ProductId: ThisItem.ID, Name: ThisItem.Title, Qty: 1, Price: ThisItem.Price }),
    UpdateIf(colCart, ProductId = ThisItem.ID, { Qty: Qty + 1 })
)

// Cart total
Sum(colCart, Qty * Price)`
      },
      {
        heading: "Load several collections at once",
        body: "Concurrent runs independent loads in parallel, which shortens start-up when the app needs more than one reference list.",
        code: `Concurrent(
    ClearCollect(colCategories, Filter(Categories, IsActive)),
    ClearCollect(colDepartments, Departments),
    ClearCollect(colMyRequests, Filter(Requests, Author.Email = User().Email))
)`
      },
      {
        heading: "Stage edits and save them together",
        body: "Copy rows into a collection, let the user edit locally, mark changed rows and write only those back in one Patch.",
        code: `// Load with a change flag
ClearCollect(colEdit, AddColumns(Filter(Tasks, ProjectId = varProjectId), IsChanged, false));

// In the gallery, when a value changes (txtHours.OnChange)
Patch(colEdit, ThisItem, { Hours: Value(txtHours.Text), IsChanged: true });

// Save all changes
Patch(
    Tasks,
    ForAll(Filter(colEdit, IsChanged) As row, { ID: row.ID, Hours: row.Hours })
);
UpdateIf(colEdit, IsChanged, { IsChanged: false })`
      },
      {
        heading: "Group and summarise",
        body: "GroupBy with AddColumns turns detail rows into totals for a summary gallery or chart.",
        code: `ClearCollect(
    colByStatus,
    AddColumns(
        GroupBy(colRequests, Status, Rows),
        Total, CountRows(Rows),
        Hours, Sum(Rows, EstimatedHours)
    )
)`
      },
      {
        heading: "Send a collection to a flow",
        body: "JSON() turns the collection into text a flow can parse. Keep only the columns the flow needs.",
        code: `SubmitLines.Run(
    JSON(ShowColumns(colCart, ProductId, Qty, Price), JSONFormat.IgnoreUnsupportedTypes)
)`
      }
    ],
    faqs: [
      {
        question: "What is the difference between Collect and ClearCollect?",
        answer: "Collect adds rows to whatever is already in the collection. ClearCollect empties the collection first, then adds the rows."
      },
      {
        question: "How many rows can a Power Apps collection hold?",
        answer: "A collection can hold many thousands of rows in memory, but loading from a data source is limited by delegation: a non-delegable query returns at most the data row limit, 500 by default and 2,000 at most."
      },
      {
        question: "Are collections saved when the app closes?",
        answer: "No. Collections live in memory for the session. Write changes back to the data source with Patch, or use SaveData and LoadData for offline storage on the device."
      },
      {
        question: "When should I use a collection instead of querying the data source directly?",
        answer: "Use a collection for small reference lists, staged edits, carts and data shaped for display. Query the source directly for large tables so filtering is delegated."
      }
    ]
  },

  "power-automate-expressions-examples": {
    sections: [
      {
        heading: "Handle blank and null values",
        body: "coalesce returns the first value that is not null. empty is true for null, an empty string, an empty array and an empty object. The question mark makes a missing property return null instead of failing.",
        code: `coalesce(triggerOutputs()?['body/Notes'], 'No notes')
if(empty(triggerOutputs()?['body/Notes']), 'No notes', triggerOutputs()?['body/Notes'])
coalesce(triggerOutputs()?['body/AssignedTo/Email'], triggerOutputs()?['body/Author/Email'])
equals(triggerOutputs()?['body/DueDate'], null)`
      },
      {
        heading: "Format dates and convert time zones",
        body: "Flow dates are UTC. Convert to the reader's time zone before formatting for an email or a message.",
        code: `formatDateTime(utcNow(), 'yyyy-MM-dd')
formatDateTime(triggerOutputs()?['body/DueDate'], 'd MMMM yyyy')
convertFromUtc(utcNow(), 'Eastern Standard Time', 'dd/MM/yyyy HH:mm')
convertTimeZone(triggerOutputs()?['body/Start'], 'UTC', 'GMT Standard Time', 'dddd d MMMM, h:mm tt')`
      },
      {
        heading: "Date arithmetic",
        body: "Add or subtract time, find the start of a period, and work out the days between two dates.",
        code: `addDays(utcNow(), 7)
addDays(utcNow(), -30, 'yyyy-MM-dd')
addToTime(utcNow(), 1, 'Month')
startOfDay(utcNow())
startOfMonth(utcNow())
dayOfWeek(utcNow())
div(sub(ticks(triggerOutputs()?['body/DueDate']), ticks(utcNow())), 864000000000)`
      },
      {
        heading: "Work with text",
        body: "Join, split, trim and change case. Arrays and strings are zero-based.",
        code: `concat('REQ-', string(triggerOutputs()?['body/ID']))
toUpper(triggerOutputs()?['body/Title'])
trim(triggerOutputs()?['body/Title'])
replace(triggerOutputs()?['body/Title'], '/', '-')
substring(triggerOutputs()?['body/Title'], 0, min(length(triggerOutputs()?['body/Title']), 50))
first(split(triggerOutputs()?['body/Author/Email'], '@'))
last(split(triggerOutputs()?['body/{FilenameWithExtension}'], '.'))
contains(toLower(triggerOutputs()?['body/Title']), 'urgent')
formatNumber(triggerOutputs()?['body/Amount'], 'C2', 'en-US')`
      },
      {
        heading: "Work with arrays",
        body: "Count items, take the first or last, join values into one string and remove duplicates with union.",
        code: `length(body('Get_items')?['value'])
first(body('Get_items')?['value'])?['Title']
last(body('Get_items')?['value'])?['ID']
join(body('Select_emails'), ';')
union(body('Select_emails'), body('Select_emails'))
contains(body('Select_emails'), 'someone@contoso.com')
take(body('Get_items')?['value'], 10)
skip(body('Get_items')?['value'], 1)
createArray('Low', 'Normal', 'High')`
      },
      {
        heading: "Conditions inside an expression",
        body: "if returns one of two values. Combine tests with and, or and not.",
        code: `if(greater(triggerOutputs()?['body/Amount'], 1000), 'Director', 'Manager')
if(and(equals(triggerOutputs()?['body/Status/Value'], 'Approved'), not(empty(triggerOutputs()?['body/ApprovedBy']))), 'Complete', 'Incomplete')
if(or(equals(dayOfWeek(utcNow()), 0), equals(dayOfWeek(utcNow()), 6)), 'Weekend', 'Weekday')`
      },
      {
        heading: "Convert between types",
        body: "Values from forms and files usually arrive as text. Convert before comparing or calculating.",
        code: `int(triggerBody()?['text'])
float(triggerBody()?['amount'])
string(triggerOutputs()?['body/ID'])
bool('true')
json(body('Get_file_content'))
base64ToString(triggerBody()?['$content'])
add(int(variables('varCount')), 1)
mul(float(triggerBody()?['price']), int(triggerBody()?['qty']))`
      },
      {
        heading: "Read SharePoint column values",
        body: "Choice, person and lookup columns are objects. Read the property you need. Multi-select columns are arrays, so use a Select action to pull out the values and join them.",
        code: `triggerOutputs()?['body/Status/Value']
triggerOutputs()?['body/AssignedTo/Email']
triggerOutputs()?['body/AssignedTo/DisplayName']
triggerOutputs()?['body/Department/Value']
triggerOutputs()?['body/Department/Id']
triggerOutputs()?['body/{Link}']

Select: From = triggerOutputs()?['body/Systems'], Map = item()?['Value']
join(body('Select'), ', ')`
      }
    ],
    faqs: [
      {
        question: "Where do I type an expression in Power Automate?",
        answer: "Select a field, open the dynamic content panel and choose the Expression tab, or select the fx button in the new designer. Type the expression and select Add or OK."
      },
      {
        question: "What does the question mark mean in an expression?",
        answer: "It makes the lookup safe. If the property does not exist, the expression returns null instead of failing the action."
      },
      {
        question: "Why is my date an hour or more out?",
        answer: "Flow works in UTC. Use convertFromUtc or convertTimeZone with the reader's time zone before formatting the date."
      },
      {
        question: "How do I find the right path for a value?",
        answer: "Run the flow once, open the run and copy the property names from the trigger or action outputs. The path in the expression follows the same structure."
      }
    ]
  },

  "power-automate-trigger-conditions-examples": {
    sections: [
      {
        heading: "Where trigger conditions go",
        body: "Open the trigger, choose Settings and add each condition under Trigger conditions. Every condition starts with @ and must return true for the flow to run. Several separate conditions are combined with AND.",
        code: `@equals(triggerOutputs()?['body/Status/Value'], 'Submitted')`
      },
      {
        heading: "Run only for one status",
        body: "The most common use. The flow starts only when the choice column holds the value you care about.",
        code: `@equals(triggerOutputs()?['body/Status/Value'], 'Approved')

// Any of several values
@or(equals(triggerOutputs()?['body/Status/Value'], 'Approved'), equals(triggerOutputs()?['body/Status/Value'], 'Rejected'))

// Anything except Draft
@not(equals(triggerOutputs()?['body/Status/Value'], 'Draft'))`
      },
      {
        heading: "Run only when a field is filled in or empty",
        body: "Useful for waiting until required information is present, or for processing an item only once.",
        code: `// A person has been assigned
@not(empty(triggerOutputs()?['body/AssignedTo']))

// Not yet processed
@empty(triggerOutputs()?['body/ProcessedOn'])

// A date has been entered
@not(equals(triggerOutputs()?['body/DueDate'], null))`
      },
      {
        heading: "Stop the flow triggering itself",
        body: "When a flow updates the item that triggered it, the update fires the trigger again. Skip runs caused by the flow's own account, or use a flag column.",
        code: `// Ignore edits made by the service account
@not(equals(triggerOutputs()?['body/Editor/Email'], 'svc-flow@contoso.com'))

// Or: run only while a flag is set, and clear it as the flow's last step
@equals(triggerOutputs()?['body/NeedsProcessing'], true)`
      },
      {
        heading: "Numbers, Yes/No and text",
        body: "Compare numbers with greater and less, test Yes/No columns against true or false, and match text with contains or startsWith.",
        code: `@greater(triggerOutputs()?['body/Amount'], 5000)
@greaterOrEquals(triggerOutputs()?['body/Quantity'], 1)
@equals(triggerOutputs()?['body/IsUrgent'], true)
@contains(toLower(triggerOutputs()?['body/Title']), 'urgent')
@startsWith(triggerOutputs()?['body/Title'], 'INV-')`
      },
      {
        heading: "Files and folders",
        body: "For document library triggers, filter by file type, by folder path, or skip folders altogether.",
        code: `// PDF files only
@endsWith(toLower(triggerOutputs()?['body/{FilenameWithExtension}']), '.pdf')

// Only files in one folder
@startsWith(triggerOutputs()?['body/{Path}'], 'Shared Documents/Invoices/')

// Ignore folders
@equals(triggerOutputs()?['body/{IsFolder}'], false)

// Wait until the file is checked in
@empty(triggerOutputs()?['body/CheckoutUser'])`
      },
      {
        heading: "Combine conditions",
        body: "Use and and or inside one condition, or add separate conditions, which all have to be true.",
        code: `@and(
    equals(triggerOutputs()?['body/Status/Value'], 'Submitted'),
    greater(triggerOutputs()?['body/Amount'], 1000),
    not(empty(triggerOutputs()?['body/CostCentre']))
)`
      },
      {
        heading: "Email, Forms and schedules",
        body: "Other triggers expose different properties. Check the trigger's outputs from a test run to find the names.",
        code: `// Outlook: subject contains a word, sender is in a domain
@contains(toLower(triggerOutputs()?['body/subject']), 'invoice')
@endsWith(toLower(triggerOutputs()?['body/from']), '@contoso.com')

// Recurrence: weekdays only
@and(greater(dayOfWeek(utcNow()), 0), less(dayOfWeek(utcNow()), 6))

// Dataverse: a choice column equals a value
@equals(triggerOutputs()?['body/statuscode'], 100000001)`
      }
    ],
    faqs: [
      {
        question: "What is a trigger condition in Power Automate?",
        answer: "An expression on the trigger that must be true for the flow to start. When it is false, no run is created, so nothing appears in run history and no actions are used."
      },
      {
        question: "Why does my flow not run after adding a trigger condition?",
        answer: "The condition returned false or has an error. Check the property path against a previous run's trigger outputs, and remember that choice columns need /Value."
      },
      {
        question: "Can a trigger condition detect that a column changed?",
        answer: "Not by itself. It sees only the current values. Compare against a column that stores the last processed value, or use the Get changes for an item or a file action inside the flow."
      },
      {
        question: "Do several trigger conditions use AND or OR?",
        answer: "Separate conditions are combined with AND. For OR logic, put the tests inside a single condition with the or function."
      }
    ]
  },

  "sharepoint-list-schema-examples": {
    sections: [
      {
        heading: "Request or intake list",
        body: "The standard shape for anything people submit and a team works through: who asked, what for, who owns it, where it stands and when it is due.",
        code: `List: Requests
Title              Single line of text    Short summary                        required
RequestType        Choice                 Access | Equipment | Change | Other  required, indexed
Details            Multiple lines         Plain text
Priority           Choice                 Low | Normal | High                  default Normal
Status             Choice                 New | In progress | Waiting | Done | Declined   default New, indexed
AssignedTo         Person                 Single                               indexed
DueDate            Date only
ResolutionNotes    Multiple lines         Plain text
ClosedOn           Date and time
Created By and Created give the requester and the submitted date.`
      },
      {
        heading: "Parent and child lists",
        body: "Keep repeating details in a second list linked by the parent's ID. A number column is the simplest link for Power Apps filters. Use a lookup column when you want SharePoint to show the relationship.",
        code: `List: Orders (parent)
Title              Single line of text    Order reference
Customer           Single line of text
OrderDate          Date only
Status             Choice                 Draft | Submitted | Fulfilled

List: Order Lines (child)
Title              Single line of text    Item description
OrderId            Number                 ID of the parent order    indexed
Quantity           Number                 0 decimal places
UnitPrice          Currency
LineTotal          Calculated             =[Quantity]*[UnitPrice]

Power Apps: Filter('Order Lines', OrderId = galOrders.Selected.ID)`
      },
      {
        heading: "Approval tracking columns",
        body: "Store the decision on the item so views, apps and reports can use it without reading flow history.",
        code: `ApprovalStatus     Choice                 Not submitted | Pending | Approved | Rejected   indexed
Approver           Person
ApproverEmail      Single line of text    For delegable filters in Power Apps
SubmittedOn        Date and time
DecisionOn         Date and time
DecisionBy         Person
DecisionComments   Multiple lines         Plain text
ApprovalRunUrl     Hyperlink              Link to the flow run for support`
      },
      {
        heading: "Reference data list",
        body: "Lists that feed drop-downs need an active flag and a sort order, so values can be retired and ordered without deleting anything.",
        code: `List: Categories
Title              Single line of text    Display name                 enforce unique values
Code               Single line of text    Short stable key             enforce unique values
IsActive           Yes/No                 default Yes
SortOrder          Number
Owner              Person                 Who approves changes

Power Apps: SortByColumns(Filter(Categories, IsActive), "SortOrder")`
      },
      {
        heading: "Settings list for an app",
        body: "A key and value list lets you change thresholds, email addresses and feature switches without republishing the app or editing a flow.",
        code: `List: App Settings
Title              Single line of text    Setting key, for example ApprovalThreshold   enforce unique values
SettingValue       Single line of text    Stored as text, converted where used
Description        Multiple lines         What it controls
IsEnabled          Yes/No

Power Apps: Value(LookUp('App Settings', Title = "ApprovalThreshold").SettingValue)`
      },
      {
        heading: "Audit or history list",
        body: "An append-only list of what happened to each record. Write to it from the app or a flow whenever status changes.",
        code: `List: Request History
Title              Single line of text    Event, for example Status changed
RequestId          Number                 ID of the request            indexed
FromValue          Single line of text
ToValue            Single line of text
Comment            Multiple lines         Plain text
EventOn            Date and time          default Today, include time
Created By gives the person who made the change.`
      },
      {
        heading: "Naming and indexing rules",
        body: "Decisions made when the list is created are hard to change later, so settle them first.",
        code: `Create columns without spaces (AssignedTo), then rename the display name (Assigned to).
  The internal name is fixed at creation and is what flows and formulas use.
Index every column used to filter or sort a view or an app query. Up to 20 indexes per list.
Add indexes before the list reaches 5,000 items.
Keep lookup, person and managed metadata columns to 12 or fewer per view.
Use Choice for short fixed lists, Lookup for values with their own details, Person for people.
Turn on versioning for lists where changes need a history.`
      }
    ],
    faqs: [
      {
        question: "How many columns should a SharePoint list have?",
        answer: "As few as the process needs. Lists with dozens of columns are slower in Power Apps and harder to maintain. Move repeating groups into a child list."
      },
      {
        question: "Should I use a Choice or a Lookup column?",
        answer: "Use Choice for a short list that rarely changes. Use Lookup when the values have their own columns, change often or are shared by several lists."
      },
      {
        question: "Can I rename a SharePoint column after building an app on it?",
        answer: "You can rename the display name safely. The internal name never changes, so existing formulas and flows keep working, though the two names will no longer match."
      },
      {
        question: "Which columns should I index?",
        answer: "Any column used in a filter or sort by a view, a Power Apps query or a flow's filter query, particularly status, owner, date and parent ID columns."
      }
    ]
  },

  "dataverse-security-roles-examples": {
    sections: [
      {
        heading: "How privileges and access levels fit together",
        body: "A role grants privileges per table, and each privilege has an access level that sets how far it reaches. A user's effective access is the combination of all their roles, directly assigned and through teams.",
        code: `Privileges   Create, Read, Write, Delete, Append, Append To, Assign, Share
Access level
  None                 no access
  User                 rows the user owns, or shared with them or their team
  Business Unit        rows owned by anyone in the user's business unit
  Parent: Child BUs    the user's business unit and those beneath it
  Organization         every row in the environment
Organization-owned tables have only None or Organization.`
      },
      {
        heading: "Requester role: work only with your own rows",
        body: "People who submit and track their own requests need user-level access on the main table and read access to reference data.",
        code: `Role: Request - Requester
Service Request    Create: User   Read: User   Write: User   Delete: None
                   Append: User   Append To: User   Assign: None   Share: None
Category           Read: Organization
Note               Create: User   Read: User   Append: User
Account, Contact   Read: Organization   Append To: Organization
Also assign: Basic User (or App Opener for a minimal base)`
      },
      {
        heading: "Team worker role: work with the team's rows",
        body: "Staff who process requests need to read and update everything owned in their business unit, and reassign work.",
        code: `Role: Request - Agent
Service Request    Create: Business Unit   Read: Business Unit   Write: Business Unit   Delete: None
                   Append: Business Unit   Append To: Business Unit   Assign: Business Unit   Share: User
Category           Read: Organization
Note               Create: Business Unit   Read: Business Unit   Write: User   Append: Business Unit
Queue items, activities and other related tables as the process requires`
      },
      {
        heading: "Manager and administrator roles",
        body: "Managers see across business units and can delete. Application administrators maintain reference data without being system administrators.",
        code: `Role: Request - Manager
Service Request    all privileges: Parent: Child Business Units, Delete: Business Unit
Category           Read: Organization

Role: Request - App Admin
Service Request    all privileges: Organization
Category           Create, Read, Write, Delete: Organization
App Setting        Create, Read, Write, Delete: Organization`
      },
      {
        heading: "Append and Append To",
        body: "Linking two rows needs a privilege on each side. This pair is the most common cause of a save failing with a permission error.",
        code: `To set the Account lookup on a Service Request, the user needs:
  Append     on Service Request   (the row that holds the lookup)
  Append To  on Account           (the row being pointed at)

To add a Note to a Service Request:
  Append     on Note
  Append To  on Service Request`
      },
      {
        heading: "Assign roles through teams",
        body: "Link a Microsoft Entra security group to a Dataverse team and give the team the role. Membership is then managed in one place, and access follows people as they join and leave the group.",
        code: `1. Entra ID: security group "App - Request Agents"
2. Power Platform admin centre > Environment > Settings > Users + permissions > Teams > Create team
     Team type: Microsoft Entra ID Security Group     Group: App - Request Agents
     Membership type: Members
3. Manage security roles on the team: Request - Agent
4. Role setting "Member's privilege inheritance": Direct User (Basic) access level and Team privileges,
   so user-level privileges apply to rows the member owns personally.
5. Share the app with the same security group.`
      },
      {
        heading: "Column security and row sharing",
        body: "Roles work at table level. Protect a sensitive column with a column security profile, and grant access to single rows by sharing or access teams.",
        code: `Column security
  Column > Advanced options > Enable column security
  Column security profile "Salary - HR": Read Allowed, Update Allowed, Create Allowed
  Add users or teams to the profile. Everyone else sees the column as blank.

Share one row
  Row > Share > add a user or team > choose Read, Write, Delete, Append, Assign, Share

Access team (per-row team without ownership change)
  Enable access teams on the table, create an access team template, add users on the row's sub-grid.`
      },
      {
        heading: "Test checklist",
        body: "Roles are only proven by signing in as someone who holds them and nothing else.",
        code: `[ ] Test user holds only the role under test plus Basic User. No System Administrator or System Customizer.
[ ] Open the app. It loads without a privilege error.
[ ] Create a row. Set every lookup on the form.
[ ] Read: own rows visible. Other users' rows visible or hidden as designed.
[ ] Edit and save own row. Attempt to edit another user's row.
[ ] Delete, assign and share behave as designed.
[ ] Flows the user triggers run without permission failures.
[ ] Secured columns show values only to profile members.
[ ] Roles are in the solution and deployed with it. No manual role edits in production.`
      }
    ],
    faqs: [
      {
        question: "Why can a user open the app but see no data?",
        answer: "Sharing the app gives access to the app only. The user also needs a security role with Read privilege on the tables at an access level that covers the rows."
      },
      {
        question: "What does a missing prvAppendTo privilege error mean?",
        answer: "The user is setting a lookup to a table they lack Append To on. Grant Append on the table with the lookup and Append To on the table it points at."
      },
      {
        question: "Should I copy the Basic User role or create a new one?",
        answer: "Create a new role for your tables and assign it together with Basic User or App Opener. That keeps your custom role small and unaffected by changes to the standard roles."
      },
      {
        question: "Is it better to assign roles to users or to teams?",
        answer: "Teams linked to Entra security groups. Access is then managed by group membership, and no one has to edit users in each environment."
      }
    ]
  },

  "power-platform-alm-checklist": {
    sections: [
      {
        heading: "Before you build",
        body: "Decisions that are cheap now and expensive after the first release.",
        code: `[ ] Separate environments exist: Dev, Test, Production (Dataverse database in each)
[ ] A publisher is created with your own prefix. The default publisher is not used.
[ ] One unmanaged solution holds the work. Nothing is built in the Default solution.
[ ] Apps and flows are created inside the solution, not added afterwards.
[ ] A service account or service principal will own production connections and flows.
[ ] Naming rules agreed for solutions, tables, flows, connection references and environment variables.
[ ] Source of truth agreed: Dev environment plus source control, or Dev environment plus exported solutions.`
      },
      {
        heading: "While you build",
        body: "Habits that keep the solution deployable.",
        code: `[ ] Every connection in a flow uses a connection reference. One reference per connector and purpose.
[ ] Every value that differs by environment is an environment variable:
      site URLs, list IDs, email addresses, API endpoints, feature switches
[ ] Environment variable current values are removed from the solution before export.
[ ] No hard-coded GUIDs, URLs or email addresses in flows or formulas.
[ ] Only needed table components are added to the solution (not "include all objects").
[ ] Security roles, column security profiles and model-driven app modules are in the solution.
[ ] Solution checker runs clean of critical and high issues.
[ ] Canvas app has no errors in App checker.`
      },
      {
        heading: "Export from Dev",
        body: "Produce a managed solution with a version number that says what it is.",
        code: `[ ] Publish all customizations.
[ ] Version increased: major.minor.build.revision, for example 1.4.0.0
[ ] Export as managed for Test and Production. Keep an unmanaged export as a backup of Dev.
[ ] Run solution checker on the export.
[ ] Store the files, or unpack to source control:
      pac solution export --name RequestHub --path ./out/RequestHub_managed.zip --managed
      pac solution unpack --zipfile ./out/RequestHub.zip --folder ./src/RequestHub --packagetype Both
[ ] Release notes written: what changed, manual steps, data changes.`
      },
      {
        heading: "Deploy to Test",
        body: "The import in Test rehearses the production import, including every manual step.",
        code: `[ ] Import the managed solution. Choose Upgrade for normal releases.
[ ] Set connection references to the test connections owned by the service account.
[ ] Set environment variable values for Test, or supply a deployment settings file:
      pac solution create-settings --solution-zip ./out/RequestHub_managed.zip --settings-file ./test.json
      pac solution import --path ./out/RequestHub_managed.zip --settings-file ./test.json
[ ] Turn on flows that imported as off.
[ ] Share apps and assign security roles to test groups.
[ ] Load or refresh reference data.
[ ] Record every manual step. Each one goes into the production plan.`
      },
      {
        heading: "Test",
        body: "Prove the release with the people and permissions it will have in production.",
        code: `[ ] Smoke test as a non-admin user for each role.
[ ] User acceptance test scenarios run and signed off against this version number.
[ ] Flows triggered end to end, including approvals and notifications.
[ ] Regression check of features not changed in this release.
[ ] Performance checked with realistic data volume.
[ ] Defects fixed in Dev and redeployed. Nothing is edited in Test.`
      },
      {
        heading: "Deploy to Production",
        body: "Same file, same steps, with a way back.",
        code: `[ ] Change approved and users told the release window.
[ ] Backup taken: Power Platform admin centre > Environments > Backups > Create
[ ] Previous managed solution version kept for rollback.
[ ] Import the same managed file that passed Test.
[ ] Connection references set to production connections owned by the service account.
[ ] Environment variables set for Production.
[ ] Flows turned on and their owners confirmed.
[ ] Apps shared with production groups. Security roles assigned through teams.
[ ] Data migration or reference data steps run.`
      },
      {
        heading: "After release",
        body: "Confirm it works and leave the trail for the next person.",
        code: `[ ] Smoke test in Production as a normal user.
[ ] Flow run history checked after the first real runs.
[ ] Release recorded: version, date, who deployed, link to release notes.
[ ] Support guide updated with new components, settings and known issues.
[ ] Dev environment kept in step. No hotfixes made directly in Production.
[ ] Rollback, if needed: restore the backup, or import the previous managed version and reverse data changes.`
      },
      {
        heading: "Automate when ready",
        body: "Power Platform pipelines give one-click promotion inside the product. Azure DevOps or GitHub Actions suit teams that want source control and approvals in their existing tools.",
        code: `Pipelines in Power Platform
  Host environment with the Pipelines app > define Dev, Test, Prod stages > Deploy from the solution's Pipelines page
  Handles connection references and environment variables at deploy time.

Azure DevOps (Power Platform Build Tools) or GitHub Actions (microsoft/powerplatform-actions)
  Export from Dev > unpack to the repository > pull request review
  Build: pack managed solution > solution checker
  Release: import to Test > approval gate > import to Production with a deployment settings file
  Authenticate with a service principal that is an application user in each environment.`
      }
    ],
    faqs: [
      {
        question: "Should I deploy managed or unmanaged solutions?",
        answer: "Managed to Test and Production, so components are locked, layered cleanly and removed when the solution is uninstalled. Unmanaged belongs in development environments only."
      },
      {
        question: "What is the difference between Upgrade and Update when importing?",
        answer: "Upgrade replaces the solution and deletes components that are no longer in the new version. Update adds and changes components but leaves removed ones behind. Upgrade is the usual choice."
      },
      {
        question: "Do I need Azure DevOps to do ALM properly?",
        answer: "No. Manual export and import with this checklist, or pipelines in Power Platform, both work. Automation helps most when releases are frequent or several makers work on one solution."
      },
      {
        question: "Why are my flows off after import?",
        answer: "Flows import turned off when their connection references have no connection yet, or when the importing user cannot activate them. Set the connections, then turn the flows on."
      }
    ]
  }
};
