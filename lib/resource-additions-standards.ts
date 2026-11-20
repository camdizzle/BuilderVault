import type { ResourceAddition } from "./resource-additions.ts";

const ex = (title: string, problem: string, code: string, expectedResult: string, commonMistakes: string[] = []) => ({
  title,
  problem,
  code,
  expectedResult,
  commonMistakes
});

const q = (question: string, answer: string) => ({ question, answer });

export const standardAdditions: Record<string, ResourceAddition> = {
  "power-apps-naming-standards": {
    examples: [
      ex(
        "Control prefix table",
        "Give every control type one prefix so a formula can be read without opening the tree view.",
        `Screen        scr     scrHome, scrRequestForm
Label         lbl     lblRequestTitle
Text input    txt     txtTitle
Button        btn     btnSubmit
Drop down     dd      ddCategory
Combo box     cmb     cmbApprover
Date picker   dp      dpNeededBy
Checkbox      chk     chkUrgent
Toggle        tgl     tglShowClosed
Gallery       gal     galRequests
Form          frm     frmRequest
Icon          ico     icoBack
Image         img     imgLogo
Container     con     conHeader
Timer         tmr     tmrAutosave
Component     cmp     cmpHeader`,
        "Formulas such as ddCategory.Selected.Value read as plain statements about the screen.",
        ["Prefix with no purpose, such as btn1", "Renaming only the first screen", "Two makers using different prefixes in one app"]
      ),
      ex(
        "Variables, collections and named formulas",
        "Show the scope of a value in its name, so nobody has to search for where it was set.",
        `Global variable (Set)              gbl    gblCurrentUser, gblIsAdmin
Context variable (UpdateContext)   loc    locShowDialog, locSaving
Collection                         col    colRequests, colSelectedItems
Named formula (App.Formulas)       nf     nfIsApprover, nfThemePrimary

Booleans read as questions         gblIsAdmin, locHasChanges, locShowConfirm
Single records are singular        gblSelectedRequest
Tables are plural                  colRequests`,
        "A reader can tell where a value lives and what type it holds from the name alone.",
        ["The same name for a global and a context variable", "Collections named after the screen instead of their contents"]
      ),
      ex(
        "Before and after",
        "The same formula with default names and with the standard applied.",
        `// Before
If(Dropdown2_1.Selected.Value = Label14.Text, UpdateContext({ var1: true }))

// After
If(ddCategory.Selected.Value = lblDefaultCategory.Text, UpdateContext({ locShowWarning: true }))`,
        "The second version can be reviewed without clicking through the app."
      ),
      ex(
        "Component properties",
        "Custom properties are the public face of a component, so name them like an API.",
        `Component            cmpHeader
Input property       PascalCase noun      ScreenTitle, ShowBackButton
Output property      PascalCase           SelectedValue
Event property       On + verb            OnBack, OnSave`,
        "Makers using the component can guess its properties without reading its internals."
      )
    ],
    faqs: [
      q("Does renaming a control break formulas?", "No. Renaming in the tree view updates every formula that references the control."),
      q("Should I rename every control, including shapes?", "Rename everything a formula mentions. Decorative shapes that nothing references can keep default names if time is short."),
      q("How do I find controls that still have default names?", "Search the tree view for Label, Button, TextInput or _1, or paste the app's formulas into the naming linter.")
    ]
  },

  "power-automate-naming-standards": {
    examples: [
      ex(
        "Flow names",
        "A flow's name should say which solution it belongs to, what starts it and what it does, so it can be found in a list of hundreds.",
        `Pattern:  <Solution or area> - <Trigger or subject> - <Outcome>

Request Hub - When request submitted - Start approval
Request Hub - Daily 08:00 - Send overdue digest
Request Hub - Child - Run approval
Finance - When invoice uploaded - Route to library
Shared - Child - Send notification`,
        "Flows sort together by solution, and the trigger and purpose are visible without opening them.",
        ["Leaving names such as When an item is created -> Send an email", "Including a maker's name", "Using version numbers in the name instead of solution versions"]
      ),
      ex(
        "Action names",
        "Rename each action as you add it. Keep the action type at the start so the icon and the name agree.",
        `Get items - Open requests for approver
Filter array - Requests over threshold
Compose - Approval email body
Condition - Is amount over 5000
Apply to each - Overdue request
Update item - Set status to Approved
Send an email - Notify requester of decision
Scope - Try
Scope - Catch
Terminate - Failed`,
        "Run history reads as a description of the process, and failed steps can be recognised at a glance.",
        ["Renaming after expressions already reference the action", "Names such as Compose 7 and Condition 3", "Special characters that make expressions hard to write"]
      ),
      ex(
        "Variables, connection references and environment variables",
        "Use the same short prefixes everywhere so expressions are predictable.",
        `Variables                 varRequestId, varApproverEmails, varIsUrgent
Connection references     <prefix>_cr_SharePoint_RequestHub, <prefix>_cr_Outlook_Notifications
Environment variables     <prefix>_SiteUrl, <prefix>_RequestsListId, <prefix>_SupportEmail
Child flow inputs         PascalCase: RequestId, ApproverEmail, TimeoutDays`,
        "Anyone writing an expression can guess the name: variables('varRequestId')."
      ),
      ex(
        "How names appear in expressions",
        "Spaces in action names become underscores in expressions. Rename before you reference an action, because later renames do not always update hand-typed expressions.",
        `Action name:   Get items - Open requests
Expression:    body('Get_items_-_Open_requests')?['value']

Action name:   Compose - Approval email body
Expression:    outputs('Compose_-_Approval_email_body')`,
        "Expressions stay readable, and nothing breaks because an action was renamed late."
      )
    ],
    faqs: [
      q("Can I rename an action after other steps use it?", "Yes. The designer updates dynamic content references. Check hand-typed expressions afterwards, since those are the ones most likely to be missed."),
      q("Should the trigger be renamed too?", "Yes, with what starts the flow, such as When request is submitted. triggerOutputs() works whatever the trigger is called."),
      q("How long should an action name be?", "Long enough to state the business purpose, usually three to seven words after the action type.")
    ]
  },

  "sharepoint-list-design-standards": {
    examples: [
      ex(
        "Column type decisions",
        "Pick the type for what the value is, not for how it will be typed in.",
        `A person                          Person column, never text
One of a short fixed list         Choice
One of a list with its own data   Lookup to another list
Shared across sites               Managed metadata
A date                            Date (date only unless the time matters)
Money                             Currency
A count or measure                Number with decimal places set
True or false                     Yes/No (three states is a Choice)
Long notes                        Multiple lines, plain text unless formatting is needed
An identifier                     Single line of text with enforce unique values`,
        "Filters, sorting, validation and Power Apps controls all work with the column type instead of against it.",
        ["Text columns for people and dates", "Multi-select columns where one value would do", "Calculated columns for values an app or flow needs to write"]
      ),
      ex(
        "Internal names",
        "The internal name is set when the column is created and never changes. Create it clean, then rename the display name.",
        `Create as:       AssignedTo        then rename display name to:  Assigned to
Create as:       DueDate           then rename display name to:  Due date

Created with spaces:  "Due Date"   internal name becomes  Due_x0020_Date
Avoid reserved names: Title, Name, Author, Editor, Created, Modified, ID`,
        "Flows, OData filters and formulas use short predictable names.",
        ["Creating columns with spaces or symbols", "Recreating a column to fix its name after data exists"]
      ),
      ex(
        "Indexing and the 5,000 item threshold",
        "Views and queries that filter or sort on an unindexed column fail once the list passes 5,000 items. Index early.",
        `Index: every column used in a view filter, view sort, Power Apps Filter or flow filter query
Typical set: Status, AssignedTo, DueDate, parent ID columns, Created
Limit: 20 indexes per list
Add indexes before the list reaches 5,000 items. Above 20,000 an index cannot be added through the browser.
First filter in a view should be on an indexed column and return fewer than 5,000 items.`,
        "The list keeps working as it grows.",
        ["Waiting for the threshold error before indexing", "Filtering on a lookup or calculated column first"]
      ),
      ex(
        "Standard views",
        "Create the views support and operations will need before go-live, so nobody builds private ones from memory.",
        `All items (admin)        every column support needs, sorted by Modified descending
My items                 Created By = [Me] or AssignedTo = [Me]
Open                     Status not equal to closed values, sorted by DueDate
Overdue                  DueDate < [Today] and Status open
Unassigned               AssignedTo is empty
Recently changed         Modified >= [Today]-7
Each view: indexed first filter, 12 or fewer lookup, person and managed metadata columns`,
        "Common questions about the data have a view that answers them."
      ),
      ex(
        "Permissions and versioning",
        "Decide who can do what at list level, and turn on history where changes matter.",
        `Permissions: use SharePoint groups, break inheritance at list level only when needed, avoid item-level
             permissions for more than a few thousand items
Views are not security. Anyone with read access can see every item they have permission to.
Versioning: on, keep 50 to 100 major versions
Attachments: off unless needed. Prefer a document library for files.
Record: owner, backup owner, purpose, connected apps and flows, retention`,
        "Access is explainable, and there is a history when someone asks who changed a value."
      )
    ],
    faqs: [
      q("How many items can a SharePoint list hold?", "Up to 30 million. The practical limit is the 5,000 item view threshold, which indexing and well-designed views deal with."),
      q("When should I move from SharePoint lists to Dataverse?", "When you need relationships across many tables, row-level security, large volumes with complex queries, or model-driven apps."),
      q("Are views a way to restrict what users see?", "No. Views only filter the display. Users can still reach any item they have permission to read.")
    ]
  },

  "dataverse-table-design-standards": {
    examples: [
      ex(
        "Naming tables and columns",
        "Schema names cannot be changed after creation, so apply the standard from the first table.",
        `Publisher prefix     your own, 3 to 8 lower-case letters:  cnt
Table display name   singular noun:              Service Request
Table plural name                                Service Requests
Table schema name    prefix_PascalCase:          cnt_ServiceRequest
Column display name  sentence case:              Due date
Column schema name   prefix_PascalCase:          cnt_DueDate
Lookup column        named for the related row:  cnt_Account, cnt_AssignedTeam
Boolean              reads as a question:        cnt_IsUrgent
Choice (global)      cnt_Priority`,
        "Schema names are consistent across the solution and safe to reference from flows, code and reports.",
        ["Building with the default publisher prefix", "Plural schema names", "Abbreviations only the author understands"]
      ),
      ex(
        "Choosing a column type",
        "Each type has consequences for filtering, reporting and security.",
        `Short fixed list, same everywhere          Choice (global when reused across tables)
List users must maintain, or with details  Lookup to a table
Yes or no                                  Yes/No
Money                                      Currency (adds exchange rate and base columns)
Whole numbers, counts                      Whole number
Measures with decimals                     Decimal (not Float) for exact values
Dates without time                         Date only, behaviour Date Only
Dates with time                            Date and time, behaviour User Local
Long text                                  Multiline text, plain unless rich text is required
Files and images                           File or Image column
Computed values                            Formula column (Power Fx) before calculated or rollup`,
        "Columns behave correctly in views, filters, apps and Power BI.",
        ["Text columns holding numbers or dates", "A local choice duplicated on several tables", "Changing date behaviour after data exists"]
      ),
      ex(
        "Table settings to decide at creation",
        "Some settings cannot be changed later.",
        `Ownership        User or team (row-level security possible), or Organization (all or nothing).
                 Cannot be changed after creation.
Table type       Standard, Activity, Virtual or Elastic. Cannot be changed.
Primary column   A name people recognise. Fill it automatically if users would not type one.
Auditing         On for business data. Also enable at environment level.
Track changes    On if the table will sync to Synapse, Fabric or other systems.
Attachments, notes, activities, queues   Once enabled, most cannot be disabled.`,
        "The table supports the security and integration the solution needs without a rebuild."
      ),
      ex(
        "Relationships and alternate keys",
        "Model real relationships as lookups, and give integration a stable key.",
        `One-to-many      Lookup on the many side:  Service Request > Account
Many-to-many     Native N:N for simple links. A manual intersect table when the link has its own columns.
Behaviour        Referential (remove link) by default. Parental only when child rows should follow the parent
                 for assign, share and delete. Restrict delete where children must not be orphaned.
Alternate key    A column or set of columns that is unique outside Dataverse, such as cnt_RequestNumber.
                 Lets flows and imports upsert without knowing the GUID.
Autonumber       cnt_RequestNumber  format REQ-{SEQNUM:6}`,
        "Rows relate properly, cascade behaviour is deliberate, and integrations can match rows without GUIDs.",
        ["Copying a parent's name into a text column", "Parental behaviour on every relationship", "No alternate key on tables loaded from other systems"]
      )
    ],
    faqs: [
      q("Can I change a table's ownership type later?", "No. Choose user or team ownership if there is any chance you will need row-level security."),
      q("Should I use a choice or a lookup?", "Use a choice for a short stable list. Use a lookup when business users maintain the values, when values carry extra data, or when the list is long."),
      q("Why does the publisher prefix matter?", "It marks every component as yours, avoids name clashes with other solutions and cannot be changed afterwards.")
    ]
  },

  "environment-variable-standards": {
    examples: [
      ex(
        "Naming and types",
        "Name each variable for what it holds, and choose the type that validates it.",
        `Display name               Schema name                Type          Example value
Request Hub Site URL       cnt_RequestHubSiteUrl      Data source   https://contoso.sharepoint.com/sites/requests
Requests List              cnt_RequestsList           Data source   (list picked for the site)
Support Email              cnt_SupportEmail           Text          support@contoso.com
Approval Threshold         cnt_ApprovalThreshold      Decimal       5000
Enable Reminders           cnt_EnableReminders        Yes/No        Yes
Routing Rules              cnt_RoutingRules           JSON          { "Finance": "fin@contoso.com" }
API Key                    cnt_ApiKey                 Secret        Azure Key Vault reference`,
        "Each value that changes between environments has one named home.",
        ["One JSON variable holding every setting", "Secrets stored as text", "Names that include the environment, such as SiteUrlProd"]
      ),
      ex(
        "Default value and current value",
        "The default travels with the solution. The current value belongs to one environment. Keep them apart.",
        `Default value    Leave empty for values that must be set per environment (URLs, IDs, addresses).
                 Set a default only when the same value is right everywhere.
Current value    Set in each environment at import, or through a deployment settings file.

Before export from Dev:
  Solution > the variable > Current value > Remove from this solution
Otherwise the Dev value is carried into Test and Production.`,
        "Importing a solution prompts for the values the target environment needs, and never brings Dev values with it.",
        ["Exporting with Dev current values included", "A default that points at a development site"]
      ),
      ex(
        "Using variables in flows and apps",
        "Reference the variable. Never copy its value into an action.",
        `Flow, dynamic content:      Environment Variables > Request Hub Site URL
Flow, expression:           parameters('Request Hub Site URL (cnt_RequestHubSiteUrl)')
SharePoint action:          Site Address > Enter custom value > pick the variable

Canvas app:                 add SharePoint data sources through the solution with environment variables on
                            (Settings > General > Automatically create environment variables when adding data sources)
Canvas app, text values:    LookUp('Environment Variable Values',
                                'Environment Variable Definition'.'Schema Name' = "cnt_SupportEmail").Value`,
        "Moving the solution to another environment changes behaviour only through the variable values.",
        ["Typing a site URL into an action as a custom value", "Canvas apps reading variable tables without the users having read access to them"]
      ),
      ex(
        "Deployment settings file",
        "For pipeline deployments, supply values per environment from a file instead of typing them at import.",
        `pac solution create-settings --solution-zip RequestHub_managed.zip --settings-file prod.json

{
  "EnvironmentVariables": [
    { "SchemaName": "cnt_RequestHubSiteUrl", "Value": "https://contoso.sharepoint.com/sites/requests" },
    { "SchemaName": "cnt_SupportEmail", "Value": "support@contoso.com" }
  ],
  "ConnectionReferences": [
    { "LogicalName": "cnt_cr_SharePoint_RequestHub", "ConnectionId": "<connection id>", "ConnectorId": "/providers/Microsoft.PowerApps/apis/shared_sharepointonline" }
  ]
}

pac solution import --path RequestHub_managed.zip --settings-file prod.json`,
        "Deployments are repeatable, and the values for each environment are reviewed in a file."
      )
    ],
    faqs: [
      q("What should be an environment variable?", "Anything that differs between Dev, Test and Production: site URLs, list and table identifiers, email addresses, endpoints, thresholds and feature switches."),
      q("Why did my flow keep using the old value after I changed the variable?", "Flows read the value when they are saved or turned on. Turn the flow off and on, or save it again, after changing a value."),
      q("Where should secrets go?", "In Azure Key Vault, referenced by a Secret type environment variable. Do not store keys or passwords as text values.")
    ]
  },

  "connection-reference-standards": {
    examples: [
      ex(
        "One reference per connector and purpose",
        "A connection reference is a named pointer to a connection. Share one across the flows that should use the same account, and create a second only when a different account is needed.",
        `Pattern:  <prefix>_cr_<Connector>_<Purpose>

cnt_cr_SharePoint_RequestHub          all flows reading and writing the Request Hub site
cnt_cr_Outlook_Notifications          sends mail from the shared mailbox
cnt_cr_Approvals_RequestHub           approval actions
cnt_cr_Dataverse_RequestHub           Dataverse actions as the service account
cnt_cr_Teams_Notifications            posts to channels

Avoid: a new reference created automatically for every flow (SharePoint-1a2b3, SharePoint-4c5d6).
       Pick the existing reference when adding an action.`,
        "At import there are five connections to set instead of fifty, and it is clear what each one is for.",
        ["Generated reference names left as they are", "A separate reference in every flow for the same connector and account", "Personal connections behind production references"]
      ),
      ex(
        "Who owns the connection",
        "The reference is only as durable as the connection behind it.",
        `Production connections are created by a service account or service principal, not a maker.
Service account needs: a licence that covers the connectors used, access to every site, mailbox and table,
                       a password and MFA arrangement the identity team supports, and a named owning team.
Service principal:     supported for Dataverse, and for a growing list of connectors. No password expiry or MFA prompts.
Record for each reference: connector, account, what it reaches, who can repair it, expiry or rotation dates.`,
        "Flows keep running when a maker leaves or changes role.",
        ["Connections created under the deploying person's own account", "A service account with no licence for premium connectors"]
      ),
      ex(
        "Import and repair",
        "Set the connections during import, then confirm each flow is on.",
        `Manual import:    the wizard lists each connection reference. Pick the service account's connection or create one.
Pipeline import:  supply ConnectionId values in the deployment settings file.
After import:     Solution > Cloud flows > any flow that is Off > Turn on
Later repair:     Solution > Connection references > open the reference > choose a working connection.
                  Every flow using that reference is fixed in one step.`,
        "A broken or expired connection is repaired once, not flow by flow."
      ),
      ex(
        "Review before each release",
        "A quick check that prevents most import problems.",
        `[ ] No flow in the solution uses a direct connection (flow details show only connection references)
[ ] No duplicate references for the same connector and purpose
[ ] Reference names follow the standard
[ ] Child flows use embedded connections through references
[ ] Target environment has a connection ready for each reference, owned by the service account
[ ] Connectors used are allowed by the target environment's DLP policy`,
        "The solution imports cleanly, and flows turn on the first time."
      )
    ],
    faqs: [
      q("What is the difference between a connection and a connection reference?", "A connection holds the sign-in to a service in one environment. A connection reference is a solution component that points to a connection, so flows can move between environments without being edited."),
      q("Do canvas apps use connection references?", "No. Canvas apps connect as the signed-in user, or use data source environment variables. Connection references are used by flows."),
      q("Why do flows import turned off?", "A flow cannot be turned on until every connection reference it uses has a valid connection. Set the connections, then turn the flows on.")
    ]
  },

  "error-handling-standards": {
    examples: [
      ex(
        "Canvas app: every save handles failure",
        "A save that fails silently is the most common production defect in canvas apps.",
        `UpdateContext({ locSaving: true });
IfError(
    Set(gblSavedRequest, Patch(Requests, Defaults(Requests), { Title: txtTitle.Text }));
    Notify("Request saved", NotificationType.Success);
    Navigate(scrConfirmation),
    Notify("We could not save your request. " & FirstError.Message, NotificationType.Error)
);
UpdateContext({ locSaving: false })

// Forms: frmRequest.OnFailure
Notify("We could not save your request. " & frmRequest.Error, NotificationType.Error)`,
        "Users always learn whether the save worked, and success actions never run after a failure.",
        ["Notify success placed after the Patch without IfError", "Navigating away before checking the result", "Showing raw error codes with no next step"]
      ),
      ex(
        "Flow: Try, Catch, Finally",
        "Wrap the working actions in a scope and handle failure in a second scope that runs only when the first fails.",
        `Scope - Try              all normal actions
Scope - Catch            Configure run after: Try has failed, has timed out
  Filter array           From: result('Scope_-_Try')   where  item()?['status'] is equal to Failed
  Compose - Error        first(body('Filter_array'))?['error']?['message']
  Create item            log to the Flow Failures list with flow name, run link, record key, error
  Send notification      to the support channel for critical flows
  Terminate              Status: Failed
Scope - Finally          Configure run after: Catch is successful, is skipped, has failed
  clean-up that must always happen`,
        "Every failure is logged with enough context to act on, and the run still shows as failed.",
        ["A catch scope that ends in success, hiding the failure", "Logging only that something failed, without the record it concerned"]
      ),
      ex(
        "Retry policy",
        "Transient errors fix themselves if the action tries again. Set the policy on actions that call other services.",
        `Action > Settings > Retry policy
  Default            4 retries, exponential interval. Suitable for most connector actions.
  Exponential        Count 4 to 6, Interval PT10S, Minimum PT5S, Maximum PT1H   for throttled services (429)
  Fixed              Count 3, Interval PT30S   for services that recover quickly
  None               for actions that must not run twice, such as non-idempotent posts
Retries apply to 408, 429 and 5xx responses. A 400 or 404 is not retried: fix the data or the flow.`,
        "Brief outages and throttling do not turn into failed runs or duplicate work."
      ),
      ex(
        "Messages users can act on",
        "Tell the user what happened, whether their work is safe and what to do next.",
        `Say what happened in plain words         "We could not save your request."
Say whether their input is kept          "Your entries are still on this screen."
Say what to do                           "Check your connection and select Save again."
Give support a handle                    "If this continues, contact support and quote REQ-1042."

Avoid: "An error occurred", raw connector text on its own, and blaming the user.`,
        "Users recover without raising a ticket, and when they do raise one it contains what support needs."
      )
    ],
    faqs: [
      q("What is the minimum error handling for a production flow?", "A Try scope, a Catch scope that logs the failure and notifies an owner, and a Terminate with Failed status so the run is recorded as failed."),
      q("Should I use IfError or the Errors function in Power Apps?", "IfError for Patch and other calls in formulas. The form's OnFailure and Error properties for Edit forms. Errors() to inspect a data source after an operation."),
      q("How do I stop users pressing Save twice?", "Set a saving flag before the call, disable the button while it is true and clear it afterwards.")
    ]
  },

  "logging-standards": {
    examples: [
      ex(
        "Log list schema",
        "One list that every flow and app in the solution writes to, with columns that make a failure findable.",
        `List: Solution Log
Title            Single line     Short event summary
Source           Single line     Flow or app name                         indexed
EventType        Choice          Info | Warning | Error                   indexed
RecordKey        Single line     Business identifier, such as REQ-1042    indexed
Message          Multiple lines  Plain text
RunUrl           Hyperlink       Link to the flow run
UserEmail        Single line     Who triggered it
CorrelationId    Single line     Shared by all entries for one process instance
OccurredOn       Date and time   UTC                                      indexed
ResolvedOn       Date and time
ResolutionNotes  Multiple lines`,
        "Support can find every event for a request, a user or a day with a filter.",
        ["Logging only errors, so there is no trail of what worked before the failure", "No business identifier", "Free-text source names that differ per maker"]
      ),
      ex(
        "Flow run link and context",
        "Build the link to the run and capture the flow's own name without hard-coding either.",
        `Flow name       workflow()?['tags']?['flowDisplayName']
Run link        concat('https://make.powerautomate.com/environments/', workflow()?['tags']?['environmentName'],
                       '/flows/', workflow()?['name'], '/runs/', workflow()?['run']?['name'])
Correlation     coalesce(triggerBody()?['CorrelationId'], guid())      pass it to child flows
Failed action   first(body('Filter_array_-_Failed'))?['name']
Error text      first(body('Filter_array_-_Failed'))?['error']?['message']`,
        "A log row links straight to the run that wrote it.",
        ["Pasting a fixed environment or flow ID into the link"]
      ),
      ex(
        "Logging from a canvas app",
        "Write app errors to the same list, and use Trace for detail you only need while investigating.",
        `// In the failure branch of IfError
Patch('Solution Log', Defaults('Solution Log'), {
    Title: "Save failed",
    Source: "Request Hub app - scrRequestForm",
    EventType: { Value: "Error" },
    RecordKey: Text(gblSelectedRequest.ID),
    Message: FirstError.Message,
    UserEmail: Lower(User().Email),
    OccurredOn: Now()
});

// Diagnostic detail, visible in Monitor and Application Insights
Trace("Save failed", TraceSeverity.Error, { Screen: "scrRequestForm", RequestId: gblSelectedRequest.ID })`,
        "App and flow problems appear in one place, in the same shape."
      ),
      ex(
        "What not to log, and how long to keep it",
        "A log is data too, with privacy and storage costs.",
        `Never log:   passwords, tokens, API keys, full request bodies with personal or financial data
Log instead: record identifiers, field names, status values, counts
Access:      support team can read and edit. Makers can add. Users cannot read.
Retention:   Info 30 days, Warning 90 days, Error 12 months, trimmed by a scheduled flow
Volume:      index before 5,000 rows. Above about 100,000 rows a year, use Dataverse or Application Insights.`,
        "The log stays useful, lawful and within list limits.",
        ["Logging whole payloads for convenience", "No trimming, so the list passes the view threshold"]
      )
    ],
    faqs: [
      q("Where should Power Platform logs be stored?", "A SharePoint list suits small solutions. Use a Dataverse table for higher volumes and Application Insights for telemetry across many apps and flows."),
      q("How do I link a log entry to the flow run?", "Build the run URL from the workflow() function's environment name, flow name and run name, and store it in a hyperlink column."),
      q("Should successful runs be logged?", "Log key business events such as submitted, approved and completed. Skip routine technical steps, which run history already records for 28 days.")
    ]
  }
};
