export type ResourceKind = "cookbook" | "standard" | "cheat-sheet" | "tool";

export type ResourceExample = {
  title: string;
  problem: string;
  code: string;
  expectedResult: string;
  commonMistakes: string[];
};

export type ResourceItem = {
  slug: string;
  kind: ResourceKind;
  title: string;
  eyebrow: string;
  description: string;
  keywords: string[];
  audience: string;
  path: string;
  summaryBullets: string[];
  examples: ResourceExample[];
  relatedPatterns: string[];
  /** Slugs of other tools to link from this page. Links are shown in both directions. */
  relatedTools?: string[];
  faqs?: Array<{ question: string; answer: string }>;
};

function item(input: Omit<ResourceItem, "path">): ResourceItem {
  const parent = input.kind === "cheat-sheet" ? "cheat-sheets" : input.kind === "cookbook" ? "cookbooks" : input.kind === "standard" ? "standards" : "tools";
  return { ...input, path: `/${parent}/${input.slug}` };
}

const patchSnippet = `IfError(
    Patch(
        Requests,
        Defaults(Requests),
        {
            Title: txtTitle.Text,
            RequestStatus: { Value: "Submitted" },
            SubmittedBy: {
                Claims: "i:0#.f|membership|" & Lower(User().Email),
                DisplayName: User().FullName,
                Email: Lower(User().Email),
                Department: "",
                JobTitle: "",
                Picture: ""
            }
        }
    );
    Notify("Request submitted.", NotificationType.Success),
    Notify("The request could not be saved.", NotificationType.Error)
);`;

const flowScopeSnippet = `Scope - Try
  Create approval
  Update request status
Scope - Catch
  Log failed run
  Notify support owner
Scope - Finally
  Write processing timestamp`;

export const cookbooks: ResourceItem[] = [
  item({
    slug: "power-apps-patch-cookbook",
    kind: "cookbook",
    title: "Power Apps Patch Cookbook",
    eyebrow: "Cookbook",
    description: "Copy-ready Patch patterns for SharePoint, Dataverse, validation, generated IDs, and reliable save behavior in canvas apps.",
    keywords: ["Power Apps Patch", "Patch SharePoint", "Patch Dataverse", "Power Fx save formula"],
    audience: "Power Apps makers who need dependable save formulas instead of one-off trial-and-error code.",
    summaryBullets: ["Choose the correct Patch shape before wiring a submit button.", "Handle SharePoint person, choice, lookup, and metadata fields explicitly.", "Return saved records and show meaningful success or failure messages.", "Pair save formulas with validation and post-save navigation."],
    examples: [
      { title: "Create a SharePoint request", problem: "Create a new request and handle success or failure in one place.", code: patchSnippet, expectedResult: "The item is created, user feedback is clear, and the saved record can be reused for navigation or audit labels.", commonMistakes: ["Patching person fields as plain text", "Showing success before Patch finishes", "Ignoring IfError"] },
      { title: "Validate before save", problem: "Block incomplete submissions before data reaches the list or table.", code: `If(
    Or(IsBlank(txtTitle.Text), IsBlank(cmbPriority.Selected), IsBlank(dpDueDate.SelectedDate)),
    Notify("Add a title, priority, and due date before submitting.", NotificationType.Warning),
    Patch(Requests, Defaults(Requests), { Title: txtTitle.Text, Priority: cmbPriority.Selected, DueDate: dpDueDate.SelectedDate })
);`, expectedResult: "Users cannot submit incomplete records, and required-field logic is easy to maintain.", commonMistakes: ["Using vague error messages", "Letting duplicate saves happen", "Hiding validation across many controls"] }
    ],
    relatedPatterns: ["patch-sharepoint-choice-field", "patch-sharepoint-lookup-field", "patch-sharepoint-people-picker-power-apps"]
  }),
  item({
    slug: "power-apps-collections-cookbook",
    kind: "cookbook",
    title: "Power Apps Collections Cookbook",
    eyebrow: "Cookbook",
    description: "Collection recipes for staging data, shaping tables, grouping rows, creating carts, and preparing records for Patch.",
    keywords: ["Power Apps collections", "ClearCollect", "GroupBy", "Power Fx table shaping"],
    audience: "Makers who need local working sets, temporary edits, grouped summaries, and repeatable table transformations.",
    summaryBullets: ["Use collections intentionally as local working data.", "Shape columns before galleries and patch operations consume them.", "Group, summarize, and rank rows with clear formulas.", "Keep memory use and delegation tradeoffs visible."],
    examples: [
      { title: "Create a review queue", problem: "Load a manageable set of records for triage work.", code: `ClearCollect(
    colReviewQueue,
    ShowColumns(
        Filter(Requests, RequestStatus.Value = "Ready for Review"),
        "ID",
        "Title",
        "Priority",
        "AssignedTo",
        "Modified"
    )
);`, expectedResult: "The gallery works against a smaller local table with only the columns needed for review.", commonMistakes: ["Loading entire lists", "Keeping unused columns", "Forgetting data can become stale"] },
      { title: "Patch staged edits", problem: "Save only rows changed in a local review cart.", code: `ForAll(
    Filter(colReviewQueue, IsChanged = true) As changedRow,
    Patch(Requests, LookUp(Requests, ID = changedRow.ID), { ReviewerNotes: changedRow.ReviewerNotes })
);`, expectedResult: "Only edited rows are written back, reducing unnecessary updates.", commonMistakes: ["Patching every row", "Losing the source ID", "Treating local data as the source of truth"] }
    ],
    relatedPatterns: ["build-a-queue-dashboard-gallery", "configure-a-review-queue", "optimize-a-gallery-search-experience"]
  }),
  item({
    slug: "power-automate-expressions-cookbook",
    kind: "cookbook",
    title: "Power Automate Expressions Cookbook",
    eyebrow: "Cookbook",
    description: "Expression recipes for dates, arrays, trigger conditions, null handling, email formatting, and safe data shaping.",
    keywords: ["Power Automate expressions", "trigger conditions", "Select action", "formatDateTime"],
    audience: "Flow builders who need reliable expressions they can adapt without breaking production runs.",
    summaryBullets: ["Normalize dates, text, arrays, and null values early.", "Move repeated transformations into named Compose or Select steps.", "Pair expressions with run-after scopes.", "Keep trigger conditions small and documented."],
    examples: [
      { title: "Format a due date", problem: "Turn a raw date into a readable email value.", code: `formatDateTime(triggerOutputs()?['body/DueDate'], 'MMM d, yyyy')`, expectedResult: "The email shows a clean date such as May 16, 2026.", commonMistakes: ["Formatting null dates", "Mixing regional formats", "Putting long expressions directly in emails"] },
      { title: "Safe null fallback", problem: "Avoid failed expressions when optional fields are blank.", code: `coalesce(triggerOutputs()?['body/ReviewerNotes'], 'No reviewer notes were entered.')`, expectedResult: "The flow continues with a useful fallback value.", commonMistakes: ["Assuming every field has a value", "Testing only the happy path", "Using empty string checks only"] }
    ],
    relatedPatterns: ["configure-a-trigger-condition-for-status-changed", "build-a-daily-exception-digest", "standardize-a-flow-error-handling-scope"]
  }),
  item({
    slug: "sharepoint-list-schema-cookbook",
    kind: "cookbook",
    title: "SharePoint List Schema Cookbook",
    eyebrow: "Cookbook",
    description: "SharePoint list schema recipes for Power Apps and Power Automate backends, including columns, views, indexes, and ownership notes.",
    keywords: ["SharePoint list schema", "Power Apps backend", "SharePoint columns", "list indexes"],
    audience: "Builders who need SharePoint lists that survive beyond the first demo app.",
    summaryBullets: ["Design columns around app and flow behavior.", "Use choice, person, lookup, date, and yes/no columns intentionally.", "Add indexes and views before volume creates issues.", "Document ownership, retention, and migration assumptions."],
    examples: [
      { title: "Request intake schema", problem: "Create a reliable backend for an app and approval flow.", code: `Title: Single line of text
RequestStatus: Choice (Draft, Submitted, In Review, Approved, Rejected, Closed)
SubmittedBy: Person
AssignedTo: Person
DueDate: Date only
Priority: Choice (Low, Normal, High, Urgent)
ReviewerNotes: Multiple lines of text`, expectedResult: "The app has clear fields for save, review, filtering, and support.", commonMistakes: ["Using plain text for statuses", "Skipping person fields", "Not defining status values before flows"] },
      { title: "Queue indexes", problem: "Support filtered galleries and scheduled flows as list volume grows.", code: `Recommended indexes:
- RequestStatus
- AssignedTo
- DueDate
- Modified`, expectedResult: "Makers have stable indexed columns for common filters.", commonMistakes: ["Waiting for threshold problems", "Indexing every column", "Using views as security boundaries"] }
    ],
    relatedPatterns: ["design-a-sharepoint-list-schema-for-power-apps", "create-a-sharepoint-view-for-upcoming-milestones", "standardize-a-document-retention-checklist"]
  })
];

export const standards: ResourceItem[] = [
  item({ slug: "power-apps-naming-standards", kind: "standard", title: "Power Apps Naming Standards", eyebrow: "Standards", description: "Naming guidance for screens, controls, variables, collections, components, and formulas in maintainable canvas apps.", keywords: ["Power Apps naming standards", "canvas app standards", "Power Fx variables"], audience: "Teams building apps that more than one maker will maintain.", summaryBullets: ["Use predictable prefixes for controls and variables.", "Name screens around user tasks.", "Avoid abbreviations only one maker understands.", "Document exceptions in app notes."], examples: [{ title: "Recommended prefixes", problem: "Keep formulas readable across screens.", code: `Screens: scrRequestList, scrRequestDetail
Galleries: galRequests, galApprovers
Forms: frmRequest
Inputs: txtTitle, cmbPriority, dpDueDate
Variables: varSaving, varCurrentRequest
Collections: colReviewQueue, colSelectedApprovers`, expectedResult: "A new maker can infer purpose before opening every control property.", commonMistakes: ["Leaving default names like Button12", "Using different prefixes per maker", "Encoding business rules into cryptic names"] }], relatedPatterns: ["document-a-canvas-app-control-naming-standard", "standardize-a-maker-handoff-checklist"] }),
  item({ slug: "power-automate-naming-standards", kind: "standard", title: "Power Automate Naming Standards", eyebrow: "Standards", description: "Naming guidance for triggers, scopes, actions, variables, Compose steps, and child flows.", keywords: ["Power Automate naming standards", "cloud flow standards", "flow action names"], audience: "Flow builders who need supportable run history and readable troubleshooting.", summaryBullets: ["Name actions by business intent.", "Prefix scopes by stage such as Try, Catch, Finally.", "Use Compose names that describe transformed values.", "Keep flow names searchable by system and outcome."], examples: [{ title: "Readable flow action names", problem: "Make run history understandable without opening every action.", code: `Flow: Requests - Send approval reminder
Scope: Try - build reminder email
Compose: Compose - formatted due date
Condition: Condition - request is still pending
Scope: Catch - log reminder failure`, expectedResult: "Support owners can scan failed runs quickly.", commonMistakes: ["Leaving action names as Compose 7", "Renaming only the first few actions", "Using vague names such as Process Data"] }], relatedPatterns: ["standardize-a-flow-error-handling-scope", "document-a-production-flow-support-model"] }),
  item({ slug: "sharepoint-list-design-standards", kind: "standard", title: "SharePoint List Design Standards", eyebrow: "Standards", description: "Standards for SharePoint lists used as Power Apps and Power Automate data sources.", keywords: ["SharePoint list design", "Power Apps SharePoint standards", "SharePoint list governance"], audience: "Teams using SharePoint as a lightweight app backend.", summaryBullets: ["Choose column types intentionally.", "Create support views before go-live.", "Index high-use filter columns.", "Document list ownership and retention."], examples: [{ title: "Minimum list design notes", problem: "Capture design decisions that affect future maintenance.", code: `List owner: Operations Applications
Primary app: Request Intake
Primary flows: Request approval, overdue reminder
Indexed columns: RequestStatus, AssignedTo, DueDate
Retention: Archive closed requests after 24 months`, expectedResult: "The list has enough context for future support and migration decisions.", commonMistakes: ["Treating SharePoint like Excel", "Skipping ownership", "Using views as permission controls"] }], relatedPatterns: ["design-a-sharepoint-list-schema-for-power-apps", "govern-a-sharepoint-list-backed-app"] }),
  item({ slug: "dataverse-table-design-standards", kind: "standard", title: "Dataverse Table Design Standards", eyebrow: "Standards", description: "Table, column, relationship, choice, and ownership standards for Dataverse-backed business apps.", keywords: ["Dataverse table design", "Dataverse standards", "model-driven app data model"], audience: "Developers designing Dataverse tables before app and flow build-out.", summaryBullets: ["Name tables around business entities.", "Use relationships instead of duplicated text where lifecycle matters.", "Separate security ownership from display labels.", "Plan solution transport from the start."], examples: [{ title: "Table design brief", problem: "Clarify the table before adding columns.", code: `Table: Service Request
Owner type: User or team
Primary column: Request Name
Relationships: Customer, Request Category, Assigned Team
Choices: Priority, Request Status
Audit: Enabled for production tables`, expectedResult: "The model supports security, reporting, automation, and future model-driven apps.", commonMistakes: ["Creating one mega table", "Using text where lookup relationships are needed", "Ignoring ownership model"] }], relatedPatterns: ["design-a-dataverse-table-relationship-model", "configure-a-dataverse-security-role"] }),
  item({ slug: "environment-variable-standards", kind: "standard", title: "Environment Variable Standards", eyebrow: "Standards", description: "Naming, ownership, and deployment standards for Power Platform environment variables.", keywords: ["Power Platform environment variables", "ALM standards", "solution deployment"], audience: "Teams shipping solutions across dev, test, and production.", summaryBullets: ["Use environment variables for values that change by environment.", "Avoid hiding business rules in variables.", "Document default and production values.", "Review values during deployment checklists."], examples: [{ title: "Environment variable register", problem: "Keep deployment values discoverable.", code: `Name: bv_SupportMailbox
Type: Text
Dev value: powerplatform-dev@contoso.com
Prod value: powerplatform-support@contoso.com
Used by: Request notification flow
Owner: Platform team`, expectedResult: "Deployments no longer depend on someone remembering which email address to change.", commonMistakes: ["Hardcoding tenant-specific values", "Creating variables without ownership", "Using unclear schema names"] }], relatedPatterns: ["configure-a-connection-reference-and-environment-variable", "document-a-solution-deployment-checklist"] }),
  item({ slug: "connection-reference-standards", kind: "standard", title: "Connection Reference Standards", eyebrow: "Standards", description: "Standards for connection references used by flows, apps, solutions, and service accounts.", keywords: ["connection references", "Power Platform ALM", "service account connections"], audience: "Admins and developers responsible for production flow ownership.", summaryBullets: ["Prefer durable service ownership for production automation.", "Name references by connector and purpose.", "Document what breaks if a connection expires.", "Review references before managed solution import."], examples: [{ title: "Connection reference naming", problem: "Make references understandable during import.", code: `cr_SharePoint_RequestLists
cr_Outlook_Notifications
cr_Dataverse_CoreTables
cr_Teams_Approvals`, expectedResult: "Admins know which connection to bind without opening each flow.", commonMistakes: ["Using personal maker connections in production", "Leaving generated names", "Not documenting connector licensing"] }], relatedPatterns: ["configure-a-connection-reference-and-environment-variable", "govern-a-production-flow-support-model"] }),
  item({ slug: "error-handling-standards", kind: "standard", title: "Power Platform Error Handling Standards", eyebrow: "Standards", description: "Shared expectations for canvas app errors, flow failures, retry behavior, logging, and support notifications.", keywords: ["Power Platform error handling", "Power Automate try catch", "Power Apps IfError"], audience: "Teams preparing apps and flows for real users and support owners.", summaryBullets: ["Every production flow should have a failure path.", "Every important save formula should use IfError or Errors.", "User messages should explain what happened and what to do next.", "Support logs should include enough context to reproduce the issue."], examples: [{ title: "Flow error scope model", problem: "Handle failed automation without silent loss.", code: flowScopeSnippet, expectedResult: "Failures become visible and supportable instead of buried in run history.", commonMistakes: ["No run-after configuration", "Emailing raw error JSON to users", "Retrying non-idempotent updates blindly"] }], relatedPatterns: ["standardize-a-flow-error-handling-scope", "build-a-daily-exception-digest"] }),
  item({ slug: "logging-standards", kind: "standard", title: "Power Platform Logging Standards", eyebrow: "Standards", description: "Practical logging standards for request IDs, flow run links, app errors, and operational support history.", keywords: ["Power Platform logging", "flow run logging", "app support logs"], audience: "Support owners who need evidence when automations fail or users report issues.", summaryBullets: ["Log business identifiers, not just technical errors.", "Capture flow run URLs for support review.", "Separate user notifications from support logs.", "Keep logs searchable by request, user, and date."], examples: [{ title: "Support log columns", problem: "Create a lightweight list or table for operational issues.", code: `RequestId
SourceSystem
EventType
Severity
Message
FlowRunUrl
UserEmail
OccurredOn
ResolvedOn`, expectedResult: "Support can search for failures by request or user without reverse-engineering every flow.", commonMistakes: ["Logging sensitive data", "Only logging failures", "No retention plan"] }], relatedPatterns: ["build-a-flow-run-log", "create-a-support-handoff-dashboard"] })
];

export const cheatSheets: ResourceItem[] = [
  item({ slug: "patch-sharepoint-columns-cheat-sheet", kind: "cheat-sheet", title: "Patch SharePoint Columns Cheat Sheet", eyebrow: "Cheat sheet", description: "Quick examples for patching text, choice, person, lookup, date, yes/no, and metadata columns from Power Apps.", keywords: ["Patch SharePoint columns", "Power Apps person field", "Power Apps choice field"], audience: "Makers who know the field they need to save and want the correct Patch shape quickly.", summaryBullets: ["Person fields need claims-shaped records.", "Choice fields need records with Value.", "Lookup fields need Id and Value.", "Dates should be validated before save."], examples: [{ title: "Choice field", problem: "Patch a SharePoint choice column from a combo box.", code: `Patch(Requests, galRequests.Selected, { Priority: { Value: cmbPriority.Selected.Value } })`, expectedResult: "Priority stores the selected choice value.", commonMistakes: ["Patching only text when SharePoint expects a choice record"] }, { title: "Lookup field", problem: "Patch a lookup column from a selected record.", code: `Patch(Requests, galRequests.Selected, { Customer: { Id: cmbCustomer.Selected.ID, Value: cmbCustomer.Selected.Title } })`, expectedResult: "The lookup points to the selected customer item.", commonMistakes: ["Using ID instead of Id", "Omitting the display value"] }], relatedPatterns: ["patch-sharepoint-choice-field", "patch-sharepoint-lookup-field", "patch-sharepoint-people-picker-power-apps"] }),
  item({ slug: "power-apps-gallery-filtering-cheat-sheet", kind: "cheat-sheet", title: "Power Apps Gallery Filtering Cheat Sheet", eyebrow: "Cheat sheet", description: "Delegation-aware gallery filter formulas for search boxes, status chips, date ranges, user filters, and queue screens.", keywords: ["Power Apps gallery filter", "delegation", "Search gallery"], audience: "Makers building galleries that need to keep working after the list gets large.", summaryBullets: ["Start with delegable filters first.", "Use StartsWith for SharePoint search when possible.", "Combine status and ownership filters carefully.", "Avoid wrapping columns in non-delegable transformations."], examples: [{ title: "Status and search", problem: "Filter a request gallery by status and title search.", code: `Filter(
    Requests,
    RequestStatus.Value = cmbStatus.Selected.Value,
    StartsWith(Title, txtSearch.Text)
)`, expectedResult: "The gallery filters by selected status and typed title prefix.", commonMistakes: ["Using Search on large SharePoint lists", "Lowercasing the column in the filter", "Ignoring delegation warnings"] }], relatedPatterns: ["optimize-a-gallery-search-experience", "build-a-queue-dashboard-gallery"] }),
  item({ slug: "power-automate-trigger-conditions-cheat-sheet", kind: "cheat-sheet", title: "Power Automate Trigger Conditions Cheat Sheet", eyebrow: "Cheat sheet", description: "Common trigger condition patterns for status changes, empty checks, approvals, recurrence guards, and noisy list updates.", keywords: ["Power Automate trigger conditions", "flow trigger condition", "SharePoint trigger condition"], audience: "Flow builders trying to reduce unnecessary runs and avoid infinite loops.", summaryBullets: ["Keep trigger conditions small and readable.", "Use them to reduce noise, not to hide complex process logic.", "Document every condition in the flow notes.", "Test create and update events separately."], examples: [{ title: "Only run for submitted requests", problem: "Start a flow only when a SharePoint choice field is Submitted.", code: `@equals(triggerOutputs()?['body/RequestStatus/Value'], 'Submitted')`, expectedResult: "The flow ignores draft and closed updates.", commonMistakes: ["Using the wrong dynamic path", "Forgetting choice /Value", "Adding too many conditions at the trigger"] }], relatedPatterns: ["configure-a-trigger-condition-for-status-changed", "prevent-a-flow-infinite-loop"] }),
  item({ slug: "dataverse-security-roles-cheat-sheet", kind: "cheat-sheet", title: "Dataverse Security Roles Cheat Sheet", eyebrow: "Cheat sheet", description: "Fast guidance for table privileges, ownership, business units, teams, app sharing, and test-user validation.", keywords: ["Dataverse security roles", "model-driven app access", "Power Platform permissions"], audience: "Developers and admins configuring secure access for Dataverse apps.", summaryBullets: ["Confirm table ownership before designing roles.", "Share the app and assign the right security role.", "Test with a real non-admin user.", "Document team-based access separately from record ownership."], examples: [{ title: "Role review checklist", problem: "Validate access before production release.", code: `- Can create own request
- Can read team requests
- Cannot delete closed requests
- Can run related flows
- Can open model-driven app
- Can access required environment`, expectedResult: "Security issues are found before users report missing buttons or inaccessible records.", commonMistakes: ["Testing only as system admin", "Sharing the app but not assigning roles", "Ignoring environment access"] }], relatedPatterns: ["configure-a-dataverse-security-role", "share-a-model-driven-app-with-a-security-group"] }),
  item({ slug: "power-automate-date-formatting-cheat-sheet", kind: "cheat-sheet", title: "Power Automate Date Formatting Cheat Sheet", eyebrow: "Cheat sheet", description: "Date and time expressions for email, SharePoint filters, approvals, time zones, filenames, and scheduled reminders.", keywords: ["Power Automate date formatting", "formatDateTime", "convertTimeZone"], audience: "Flow builders who need date expressions that do not surprise users.", summaryBullets: ["Format dates for users, but store dates as dates.", "Be explicit about time zones.", "Use sortable date formats in filenames.", "Test daylight saving transitions when timing matters."], examples: [{ title: "Sortable filename date", problem: "Add a stable timestamp to exported files.", code: `formatDateTime(utcNow(), 'yyyy-MM-dd-HHmm')`, expectedResult: "Generated filenames sort chronologically.", commonMistakes: ["Using slash characters in filenames", "Mixing local and UTC times", "Formatting too early before comparisons"] }], relatedPatterns: ["build-a-scheduled-reminder-flow", "create-a-monthly-report-export"] }),
  item({ slug: "adaptive-card-payload-cheat-sheet", kind: "cheat-sheet", title: "Adaptive Card Payload Cheat Sheet", eyebrow: "Cheat sheet", description: "Reusable Adaptive Card payload ideas for Teams approvals, request summaries, task cards, and action buttons.", keywords: ["Adaptive Cards Teams", "Power Automate adaptive card", "Teams approval card"], audience: "Flow builders sending actionable Teams messages from Power Automate.", summaryBullets: ["Keep cards short and action-oriented.", "Show the business identifier near the top.", "Use facts for scannable metadata.", "Make button actions match the flow branch names."], examples: [{ title: "Request review card skeleton", problem: "Send a clear Teams card for a request approval.", code: `{
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    { "type": "TextBlock", "text": "Request review needed", "weight": "Bolder" },
    { "type": "FactSet", "facts": [
      { "title": "Request", "value": "@{triggerBody()?['Title']}" },
      { "title": "Priority", "value": "@{triggerBody()?['Priority']?['Value']}" }
    ] }
  ]
}`, expectedResult: "Reviewers receive a structured Teams message with the key request facts.", commonMistakes: ["Overloading the card with every field", "Not testing mobile Teams", "Using action labels that do not match flow logic"] }], relatedPatterns: ["send-an-adaptive-card-approval-to-teams", "build-a-user-mention-notification-pattern"] })
];

export const tools: ResourceItem[] = [
  item({
    slug: "power-fx-formatter",
    kind: "tool",
    title: "Power Fx Formatter",
    eyebrow: "Free tool",
    description: "Format, minify, and review Power Apps formulas in your browser. Breaks long Power Fx into readable lines, flags unbalanced brackets, and points out likely delegation problems.",
    keywords: ["Power Fx formatter", "Power Apps formula formatter", "Power Fx beautifier", "Power Fx minify", "Power Apps delegation check"],
    audience: "Power Apps makers cleaning up formulas before code review, documentation, or handoff, and anyone pasting a formula into a forum post or support ticket.",
    summaryBullets: [
      "Short calls stay on one line, and long calls break with one argument per line.",
      "Operators such as <>, >=, && and || stay intact, along with comments, quoted names, and text values.",
      "Supports comma locales and semicolon locales (; for arguments, ;; for chaining).",
      "Flags unbalanced brackets and quotes, and common delegation risks inside Filter, LookUp, and Search.",
      "Nothing is uploaded. The formula never leaves your browser."
    ],
    examples: [
      {
        title: "Before and after",
        problem: "A save button formula written on one line is hard to review. The formatter keeps short calls inline and breaks the long ones.",
        code: `IfError(
    Set(
        varSavedRequest,
        Patch(
            Requests,
            Defaults(Requests),
            {
                Title: txtTitle.Text,
                RequestStatus: {Value: "Submitted"},
                DueDate: dpDueDate.SelectedDate
            }
        )
    );
    Notify("Request saved.", NotificationType.Success),
    Notify("The request could not be saved.", NotificationType.Error)
)`,
        expectedResult: "Each argument sits on its own line, so a reviewer can see what Patch writes and what the error branch does.",
        commonMistakes: ["Formatting a formula that has an unbalanced bracket. Fix the syntax warning first.", "Expecting the formatter to change logic. It only changes whitespace."]
      },
      {
        title: "Delegation hint",
        problem: "Lower() applied to a column inside Filter can't be delegated, so on a large SharePoint list only the first rows are checked.",
        code: `// Flagged: Lower() runs on every row, so the filter isn't delegated
Filter(Requests, Lower(Owner.Email) = Lower(User().Email))

// Better: compare against a value worked out once
With(
    {me: Lower(User().Email)},
    Filter(Requests, Owner.Email = me)
)`,
        expectedResult: "The data source filters the rows on the server instead of only checking the first 500 to 2,000.",
        commonMistakes: ["Assuming no blue underline means no delegation issue on every data source.", "Raising the data row limit instead of fixing the predicate."]
      }
    ],
    relatedPatterns: ["power-apps-error-handling-iferror-patch", "avoid-delegation-warnings-sharepoint-filters"],
    faqs: [
      {
        question: "Does Power Apps Studio have a built-in formatter?",
        answer: "Yes. The formula bar has a Format text command, and Remove formatting turns a formula back into one line. This tool does the same job outside Studio, for formulas in documentation, code reviews, forum posts, or exported source, and adds syntax and delegation checks."
      },
      {
        question: "Is my formula sent anywhere?",
        answer: "No. Formatting runs entirely in your browser, and the formula is not uploaded or stored."
      },
      {
        question: "Can formatting change what my formula does?",
        answer: "No. The formatter only changes spaces and line breaks. It does not reorder, remove, or rewrite any part of the formula. Minify can turn // comments into /* */ comments so the result fits on one line."
      },
      {
        question: "My region uses semicolons. Is that supported?",
        answer: "Yes. Turn on semicolon separators to read ; as the argument separator and ;; as the chaining operator, with a comma as the decimal separator."
      },
      {
        question: "How accurate is the delegation check?",
        answer: "It is a heuristic. It looks for functions and operators that commonly break delegation, such as Lower, Len, or the in operator inside Filter, and Search against SharePoint. Delegation depends on the data source and column type, so always confirm with the warnings in Studio."
      }
    ]
  }),
  item({ slug: "sharepoint-internal-name-helper", kind: "tool", title: "SharePoint Internal Name Helper", eyebrow: "Free tool", description: "See the internal name SharePoint will create for a column, including _x0020_ encoding for spaces and symbols, and the cleaner name to create it with instead.", keywords: ["SharePoint internal name", "Power Automate SharePoint column", "Power Apps SharePoint columns"], audience: "Builders creating list schemas used by apps and flows.", summaryBullets: ["Explain why display names and internal names diverge.", "Provide naming rules for new columns.", "Encourage schema documentation before build.", "Link to SharePoint list schema patterns."], examples: [{ title: "Naming rule", problem: "Avoid awkward internal names created by spaces and renamed columns.", code: `Preferred display name: RequestStatus
Avoid first creating: Request Status
Then renaming to: Status`, expectedResult: "Makers avoid internal names such as Request_x0020_Status in formulas and flow outputs.", commonMistakes: ["Renaming columns after flows are built", "Using punctuation in first column names"] }], relatedPatterns: ["design-a-sharepoint-list-schema-for-power-apps", "document-a-sharepoint-column-internal-name-map"] }),
  item({
    slug: "odata-filter-query-builder",
    kind: "tool",
    title: "Filter Query Builder for SharePoint and Dataverse",
    eyebrow: "Free tool",
    description: "Build the OData Filter Query for SharePoint Get items or Dataverse List rows in Power Automate. Pick columns, types, and operators, and get correctly quoted text, dates, yes/no, choice, lookup, and person filters.",
    keywords: ["Power Automate filter query", "SharePoint Get items filter", "Dataverse List rows filter", "OData filter builder", "ODATA filter query examples"],
    audience: "Flow builders who want Get items or List rows to return only the rows they need, instead of filtering a large list inside the flow.",
    summaryBullets: [
      "Builds filters for SharePoint Get items and Dataverse List rows, which use different syntax.",
      "Quotes text and dates the way each connector expects, and doubles single quotes inside values.",
      "Handles yes/no (1 and 0 in SharePoint, true and false in Dataverse), choice, lookup, and person columns.",
      "Accepts flow expressions such as @{utcNow()} as values.",
      "Warns about display names with spaces, uppercase Dataverse names, and values in the wrong format."
    ],
    examples: [
      {
        title: "SharePoint: approved items that are overdue",
        problem: "Return only approved requests whose due date has passed, so the flow doesn't loop through the whole list.",
        code: `Status eq 'Approved' and DueDate lt '@{utcNow()}'`,
        expectedResult: "Get items returns only the overdue approved rows.",
        commonMistakes: ["Using the display name, such as Due Date, instead of the internal name DueDate.", "Leaving the quotes off the date in a SharePoint filter."]
      },
      {
        title: "SharePoint: items assigned to the person who started the flow",
        problem: "Person columns are filtered on the email address of the person, through the EMail sub-field.",
        code: `AssignedTo/EMail eq '@{toLower(triggerOutputs()?['headers']?['x-ms-user-email'])}'`,
        expectedResult: "Only items assigned to that person are returned.",
        commonMistakes: ["Writing Email instead of EMail.", "Comparing against the display name, which isn't unique."]
      },
      {
        title: "Dataverse: active rows created this year",
        problem: "Dataverse uses logical names, unquoted dates, and number values for choices.",
        code: `statecode eq 0 and createdon ge 2026-01-01T00:00:00Z`,
        expectedResult: "List rows returns active rows created on or after January 1.",
        commonMistakes: ["Filtering a choice by its label instead of its number value.", "Filtering a lookup by name instead of _column_value and the row GUID."]
      }
    ],
    relatedPatterns: ["use-odata-filters-sharepoint-text-fields", "delegation-safe-date-range-filter", "avoid-delegation-warnings-sharepoint-filters"],
    relatedTools: ["power-fx-formatter", "sharepoint-internal-name-helper", "dataverse-table-naming-helper"],
    faqs: [
      {
        question: "Why does my filter fail with \"column does not exist\"?",
        answer: "Filter Query uses the internal name, which can differ from the name you see in the list. A column created as Due Date has the internal name Due_x0020_Date. Open the column settings and read the Field= value at the end of the URL, or use the SharePoint Internal Name Helper."
      },
      {
        question: "Is the filter the same for SharePoint and Dataverse?",
        answer: "No. Both use OData, but SharePoint quotes dates and uses 1 and 0 for yes/no, while Dataverse leaves dates unquoted, uses true and false, filters choices by number, and filters lookups with _name_value and a GUID. Pick the action at the top of the tool and it switches the syntax for you."
      },
      {
        question: "Can I use contains in a SharePoint filter?",
        answer: "Not with that name. SharePoint uses substringof('text', Column), which this tool writes for you. Dataverse supports contains, startswith, and endswith."
      },
      {
        question: "What about lists with more than 5,000 items?",
        answer: "SharePoint applies the list view threshold to filters. On large lists, index the columns you filter on, or the query can be rejected."
      },
      {
        question: "Is my data sent anywhere?",
        answer: "No. The query is built in your browser, and nothing you type is uploaded or stored."
      }
    ]
  }),
  item({ slug: "power-automate-expression-builder", kind: "tool", title: "Power Automate Expression Builder", eyebrow: "Free tool", description: "An interactive helper for assembling common Power Automate expressions for dates, null checks, arrays, and trigger conditions.", keywords: ["Power Automate expression builder", "flow expressions", "trigger conditions"], audience: "Flow builders who reuse the same expressions across business processes.", summaryBullets: ["Start with common expression templates.", "Explain what each input token means.", "Link templates to cookbook examples.", "Keep generated snippets copy-ready."], examples: [{ title: "Expression templates", problem: "Give makers a safe starting point.", code: `Date: formatDateTime(<dateValue>, 'MMM d, yyyy')
Null fallback: coalesce(<value>, '<fallback>')
Choice trigger: @equals(triggerOutputs()?['body/<ChoiceColumn>/Value'], '<Choice>')`, expectedResult: "Makers can adapt snippets without hunting through run history for syntax.", commonMistakes: ["Copying expressions without replacing sample tokens", "Using expressions in the wrong connector context"] }], relatedPatterns: ["configure-a-trigger-condition-for-status-changed", "build-a-daily-exception-digest"] }),
  item({
    slug: "parse-json-schema-generator",
    kind: "tool",
    title: "Parse JSON Schema Generator for Power Automate",
    eyebrow: "Free tool",
    description: "Generate a Parse JSON schema from a sample payload that won't fail on empty fields. Allows null where you need it, avoids integer-only numbers, and lists the expression for every value.",
    keywords: ["Parse JSON schema", "Power Automate Parse JSON", "Expected String but got Null", "Parse JSON null", "generate JSON schema from sample"],
    audience: "Flow builders who parse responses from HTTP calls, Power Apps, Forms, or other flows, and keep hitting schema validation errors when a field is empty.",
    summaryBullets: [
      "Builds a schema from any sample JSON, including nested objects and arrays of objects.",
      "Can let every property accept null, so empty fields don't fail the run.",
      "Can use number instead of integer, so a value such as 12.5 doesn't fail a schema built from 12.",
      "Merges all items in a sample array, so properties that only appear in some items are still included.",
      "Lists a copy-ready expression for every value, including items('Apply_to_each') for array items."
    ],
    examples: [
      {
        title: "The error this avoids",
        problem: "A schema made with Generate from sample types every field from one sample. When a later run has an empty field, the action fails.",
        code: `ValidationFailed. The schema validation failed.
Invalid type. Expected String but got Null.
Path 'manager'.`,
        expectedResult: "With Allow null on every property turned on, the same run passes and manager is simply null.",
        commonMistakes: ["Editing the schema by hand in the designer and missing a nested property.", "Removing the schema entirely, which loses dynamic content for later actions."]
      },
      {
        title: "A property that accepts null",
        problem: "Each property lists null as an extra allowed type.",
        code: `"manager": {
  "type": ["string", "null"]
}`,
        expectedResult: "Parse JSON accepts both a text value and null for manager.",
        commonMistakes: ["Writing \"type\": \"string, null\" as one text value instead of a list."]
      },
      {
        title: "Reading a value after Parse JSON",
        problem: "Use the ?[] syntax so a missing property returns null instead of failing the flow.",
        code: `body('Parse_JSON')?['requester']?['email']`,
        expectedResult: "Returns the requester's email, or null when it is missing.",
        commonMistakes: ["Using spaces in the action name inside body(). Power Automate uses underscores, such as Parse_JSON."]
      }
    ],
    relatedPatterns: ["power-automate-parse-json-from-power-apps", "parse-json-sharepoint-power-apps-collection", "save-gallery-rows-json-multiline-text"],
    relatedTools: ["power-fx-formatter", "power-automate-expression-builder"],
    faqs: [
      {
        question: "How is this different from Generate from sample?",
        answer: "Generate from sample types each property from the one value it sees, so a field that is empty in a later run fails validation. This tool can allow null on every property, can use number instead of integer, merges every item in a sample array, and leaves out required lists unless you ask for them."
      },
      {
        question: "Why does a null value in my sample become an empty schema?",
        answer: "A null tells the generator nothing about the real type, so the schema accepts any type there. The tool lists those properties. Paste a sample where they have a value to get a typed schema."
      },
      {
        question: "Should I turn off Allow null on every property?",
        answer: "Turn it off when you want Parse JSON to stop the flow if a value is missing, for example to catch a broken integration early. Leave it on when empty fields are normal."
      },
      {
        question: "Is my JSON sent anywhere?",
        answer: "No. The schema is generated in your browser, and the sample is not uploaded or stored."
      }
    ]
  }),
  item({ slug: "dataverse-table-naming-helper", kind: "tool", title: "Dataverse Table Naming Helper", eyebrow: "Free tool", description: "Generate consistent Dataverse schema and logical names for tables, columns, and relationships from your publisher prefix, before names are locked in.", keywords: ["Dataverse naming", "Dataverse table design", "solution publisher prefix"], audience: "Developers planning Dataverse data models.", summaryBullets: ["Separate display names from schema strategy.", "Use consistent publisher prefixes.", "Name relationships by business relationship.", "Capture plural and singular names before build."], examples: [{ title: "Naming worksheet", problem: "Design names before tables are created.", code: `Publisher prefix: bv
Table display name: Service Request
Schema name: bv_ServiceRequest
Primary column: bv_RequestName
Relationship: bv_Customer_ServiceRequests`, expectedResult: "The data model stays consistent across apps, flows, and solutions.", commonMistakes: ["Changing schema names late", "Using generic table names", "Ignoring relationship names"] }], relatedPatterns: ["design-a-dataverse-table-relationship-model", "standardize-a-solution-publisher-prefix"] }),
  item({
    slug: "trigger-condition-builder",
    kind: "tool",
    title: "Trigger Condition Builder for Power Automate",
    eyebrow: "Free tool",
    description: "Build Power Automate trigger conditions for SharePoint and Dataverse triggers. Combine rules with and or or, check choice, person, date, and number columns, and stop a flow from re-triggering on its own updates.",
    keywords: ["Power Automate trigger conditions", "trigger condition SharePoint", "trigger condition Dataverse", "stop flow infinite loop", "trigger condition examples"],
    audience: "Flow builders who want a flow to start only for the items that matter, instead of running on every change and ending early with a Condition action.",
    summaryBullets: [
      "Builds conditions for SharePoint, Dataverse, and any other trigger that returns a body.",
      "Reads choice values through /Value and people through /Email for SharePoint, and lookups through _name_value for Dataverse.",
      "Wraps text in coalesce() so an empty column doesn't make contains() or startsWith() fail.",
      "Compares dates with ticks() so date and time formats don't matter.",
      "Can add a loop guard that ignores changes made by the flow's own account."
    ],
    examples: [
      {
        title: "Status is Submitted and the amount is over 1,000",
        problem: "Only start an approval flow for large submitted requests.",
        code: `@and(equals(triggerOutputs()?['body/Status/Value'], 'Submitted'), greater(triggerOutputs()?['body/Amount'], 1000))`,
        expectedResult: "The flow doesn't start at all for other items, so they don't show up in run history.",
        commonMistakes: ["Comparing the choice column itself instead of its /Value.", "Leaving out the @ at the start of the condition."]
      },
      {
        title: "Stop a flow from triggering itself",
        problem: "A flow that updates the same item it was triggered by can start itself again in a loop.",
        code: `@not(equals(toLower(coalesce(triggerOutputs()?['body/Editor/Email'], '')), 'flow-service@contoso.com'))`,
        expectedResult: "Updates made by the flow's connection account no longer start a new run.",
        commonMistakes: ["Using the account of the person who built the flow, when the connection runs as a different account.", "Forgetting that every person who edits items through that same account is ignored too."]
      },
      {
        title: "Several boxes or one",
        problem: "Each trigger condition box must be true for the flow to start, so separate boxes act like and.",
        code: `@equals(triggerOutputs()?['body/Status/Value'], 'Submitted')
@greater(triggerOutputs()?['body/Amount'], 1000)`,
        expectedResult: "Same result as the and() version, and each rule is easier to read.",
        commonMistakes: ["Putting or rules in separate boxes. They still act like and. Use one box with or() instead."]
      }
    ],
    relatedPatterns: ["power-automate-trigger-condition-status-changed", "sharepoint-list-schema-for-project-intake"],
    relatedTools: ["power-fx-formatter", "power-automate-expression-builder", "sharepoint-internal-name-helper"],
    faqs: [
      {
        question: "Where do I paste a trigger condition?",
        answer: "Open the trigger, go to Settings, and add it under Trigger conditions. In the classic designer, select the three dots on the trigger, then Settings."
      },
      {
        question: "Can a trigger condition check whether a column changed?",
        answer: "Not on its own. The trigger only sees the item as it is now, not the previous value. A common approach is to keep a copy of the value in a second column and compare the two, or to check the change in the flow with Get changes for an item or a file."
      },
      {
        question: "Why does my condition never fire?",
        answer: "Check that you used the internal name of the column, that choice columns end in /Value, and that the condition starts with @. If an expression errors, for example because a column is empty, the flow doesn't start. That's why this tool wraps text in coalesce()."
      },
      {
        question: "Is my data sent anywhere?",
        answer: "No. The condition is built in your browser, and nothing you type is uploaded or stored."
      }
    ]
  }),
  item({ slug: "adaptive-card-preview-snippets", kind: "tool", title: "Adaptive Card Builder for Teams", eyebrow: "Free tool", description: "Build Teams Adaptive Card JSON for approval, notification, and review flows. Edit the text, facts, and buttons, preview the layout, and copy the payload into Power Automate.", keywords: ["Adaptive Card snippets", "Teams card Power Automate", "approval card"], audience: "Flow builders who send Teams cards from Power Automate.", summaryBullets: ["Start from small, testable card blocks.", "Use consistent headings and facts.", "Keep action buttons aligned to flow outcomes.", "Document payload owners and test channels."], examples: [{ title: "Fact block", problem: "Show scannable request metadata.", code: `{ "type": "FactSet", "facts": [
  { "title": "Request", "value": "@{triggerBody()?['Title']}" },
  { "title": "Owner", "value": "@{triggerBody()?['Author']?['Email']}" }
] }`, expectedResult: "Teams cards remain compact and readable.", commonMistakes: ["Testing only in desktop Teams", "Forgetting JSON escaping", "Using too many facts"] }], relatedPatterns: ["send-an-adaptive-card-approval-to-teams", "build-a-user-mention-notification-pattern"] }),
  item({
    slug: "csv-to-power-fx-table",
    kind: "tool",
    title: "CSV and JSON to Power Fx Table Converter",
    eyebrow: "Free tool",
    description: "Convert CSV, Excel rows, or JSON into a Power Fx Table() or ClearCollect formula. Detects numbers, true/false, and dates, handles quoted values and blank cells, and supports semicolon locales.",
    keywords: ["CSV to Power Fx", "Power Apps ClearCollect table", "Power Apps collection from Excel", "JSON to Power Fx table", "Power Apps sample data"],
    audience: "Makers who need test data, lookup lists, or menu options inside a canvas app without setting up a data source first.",
    summaryBullets: [
      "Reads comma, semicolon, and tab separated data, including rows pasted straight from Excel.",
      "Reads a JSON array of objects, including nested records and tables.",
      "Types each column: numbers stay numbers, true and false become booleans, and yyyy-mm-dd becomes Date().",
      "Keeps values such as 00123 as text, so leading zeros in codes and ZIP codes aren't lost.",
      "Outputs ClearCollect, Set, a named formula, or a plain Table(), for comma or semicolon locales."
    ],
    examples: [
      {
        title: "From CSV to a collection",
        problem: "Two rows of product data pasted from Excel.",
        code: `ClearCollect(
    colProducts,
    Table(
        {Product: "Laptop 14", Price: 1299.5, 'In Stock': true, Added: Date(2026, 1, 15)},
        {Product: "USB-C Dock", Price: 189, 'In Stock': true, Added: Blank()}
    )
)`,
        expectedResult: "colProducts has typed columns, so Sum(colProducts, Price) and Filter(colProducts, 'In Stock') work without conversion.",
        commonMistakes: ["Leaving numbers as text, which breaks Sum and sorting.", "Mixing text and numbers in one column. Power Fx needs one type per column."]
      },
      {
        title: "Static lists as a named formula",
        problem: "For data that never changes while the app runs, a named formula in App.Formulas loads only when it is first used.",
        code: `StatusOptions = Table(
    {Label: "Draft", Sort: 1},
    {Label: "Submitted", Sort: 2},
    {Label: "Approved", Sort: 3}
);`,
        expectedResult: "StatusOptions is available on every screen without adding work to App.OnStart.",
        commonMistakes: ["Trying to Collect into a named formula. Named formulas are read-only."]
      }
    ],
    relatedPatterns: ["calculate-totals-gallery-collection", "patch-collection-checklist-items", "parse-json-sharepoint-power-apps-collection"],
    relatedTools: ["power-fx-formatter", "power-apps-color-token-generator"],
    faqs: [
      {
        question: "Can I paste directly from Excel?",
        answer: "Yes. Copy the cells including the header row and paste them in. Excel copies cells as tab separated text, which the tool detects."
      },
      {
        question: "How many rows should I keep in a formula?",
        answer: "A few hundred at most. Large tables inside formulas make the app slower to open and harder to maintain. For bigger or changing data, use a SharePoint list, a Dataverse table, or import the Excel file as static data."
      },
      {
        question: "Why did a column stay as text?",
        answer: "A column is only typed as number, true/false, or date when every filled value fits. One value such as n/a keeps the whole column as text, and so do values with leading zeros such as 00123."
      },
      {
        question: "My region uses semicolons in formulas. Is that supported?",
        answer: "Yes. Turn on semicolon separators to use ; between arguments and fields, and a comma as the decimal separator."
      },
      {
        question: "Is my data sent anywhere?",
        answer: "No. The conversion runs in your browser, and the data is not uploaded or stored."
      }
    ]
  }),
  item({
    slug: "power-apps-naming-linter",
    kind: "tool",
    title: "Power Apps Naming Convention Checker",
    eyebrow: "Free tool",
    description: "Check control, screen, and variable names in a Power Apps canvas app against a naming convention. Paste the YAML source to find default names such as Button1 and Label2_1, missing prefixes, and a suggested name for each.",
    keywords: ["Power Apps naming conventions", "Power Apps control naming", "Power Apps code review", "pa.yaml", "Power Apps variable naming"],
    audience: "Makers tidying up an app before handover, reviewers checking someone else's app, and teams that want one naming standard across their apps.",
    summaryBullets: [
      "Reads .pa.yaml source files and the YAML from View code in Power Apps Studio.",
      "Finds default names such as Button1, Label2_1, and Screen1.",
      "Checks control prefixes such as btn, lbl, txt, gal, and drp, for classic and modern controls.",
      "Checks variables found in Set, UpdateContext, Collect, and ClearCollect: var or gbl, loc, and col.",
      "Lets you swap in your own prefixes, and gives a rename list you can paste into Excel."
    ],
    examples: [
      {
        title: "Why names matter",
        problem: "Default names make every formula that refers to a control hard to read and easy to break.",
        code: `// Before
If(IsBlank(TextInput4.Text), Notify("Enter a title"), SubmitForm(Form2))

// After
If(IsBlank(txtTitle.Text), Notify("Enter a title"), SubmitForm(frmRequest))`,
        expectedResult: "A reviewer can tell what the formula does without opening the tree view.",
        commonMistakes: ["Renaming only the controls you can see and leaving the ones inside galleries and containers.", "Using the prefix but keeping the number, such as btn1."]
      },
      {
        title: "A common prefix set",
        problem: "The prefix tells you the control type, and the rest tells you its purpose.",
        code: `btnSubmit      Button
lblTitle       Label or Text
txtSearch      Text input
galRequests    Gallery
frmRequest     Form
drpStatus      Drop down
cmbOwner       Combo box
conHeader      Container
varCurrentUser Global variable
locShowPanel   Context variable
colRequests    Collection`,
        expectedResult: "Typing a prefix in the formula bar lists every control of that type.",
        commonMistakes: ["Mixing several conventions in one app. Pick one and apply it everywhere."]
      }
    ],
    relatedPatterns: ["power-apps-error-handling-iferror-patch", "patch-collection-checklist-items"],
    relatedTools: ["power-fx-formatter", "dataverse-table-naming-helper", "sharepoint-internal-name-helper"],
    faqs: [
      {
        question: "Where do I get the YAML?",
        answer: "In Power Apps Studio, right-click a screen or control in the tree view and choose View code, then copy it. If your app is in source control, you can paste the contents of a .pa.yaml file instead."
      },
      {
        question: "Does this change my app?",
        answer: "No. It only reads the text you paste and lists what to rename. Rename controls in Studio, which updates every formula that refers to them."
      },
      {
        question: "We use different prefixes. Can I change them?",
        answer: "Yes. Add one line per control type, such as Label = lab. Your prefixes replace the defaults for those types."
      },
      {
        question: "Why are data card controls skipped?",
        answer: "Names such as DataCardValue3 and ErrorMessage2 are generated by forms, and most teams leave them alone. Rename a data card value only when your formulas refer to it."
      },
      {
        question: "Is there one official naming standard?",
        answer: "No. Microsoft's canvas app coding guidelines suggest three-letter prefixes for controls and prefixes for variables and collections, and most teams follow a variation of that. What matters is that the whole app uses the same one."
      },
      {
        question: "Is my app's code sent anywhere?",
        answer: "No. The check runs in your browser, and nothing you paste is uploaded or stored."
      }
    ]
  }),
  item({ slug: "power-apps-color-token-generator", kind: "tool", title: "Power Apps Color Token Generator", eyebrow: "Free tool", description: "An interactive helper for turning brand colors into reusable Power Fx color variables and theme notes.", keywords: ["Power Apps colors", "Power Apps theme", "RGBA Power Fx"], audience: "Makers standardizing app colors across screens and components.", summaryBullets: ["Define named color variables once.", "Generate RGBA formulas from hex values.", "Document accessible contrast decisions.", "Link theme choices to component patterns."], examples: [{ title: "Color token pattern", problem: "Avoid hardcoded colors throughout screens.", code: `Set(gblColorPrimary, RGBA(15, 118, 110, 1));
Set(gblColorSurface, RGBA(255, 255, 255, 1));
Set(gblColorDanger, RGBA(185, 28, 28, 1));`, expectedResult: "Makers update color choices in one place instead of editing each control.", commonMistakes: ["Hardcoding colors in every property", "Ignoring contrast", "Using color names that describe hue instead of purpose"] }], relatedPatterns: ["standardize-a-canvas-app-theme", "build-a-reusable-command-bar-component"] }),
  item({
    slug: "sharepoint-column-formatting-builder",
    kind: "tool",
    title: "SharePoint Column Formatting JSON Builder",
    eyebrow: "Free tool",
    description: "Build SharePoint list column formatting JSON without writing it by hand. Create status pills, due date highlights, progress bars, email links for people, and a button that opens the item in a Power Apps app.",
    keywords: ["SharePoint column formatting JSON", "SharePoint JSON formatting", "SharePoint status pill JSON", "SharePoint progress bar column", "open Power Apps from SharePoint list"],
    audience: "Makers who use SharePoint lists behind Power Apps and Power Automate and want the list itself to be easy to scan.",
    summaryBullets: [
      "Five layouts that cover the most common list needs: status, due date, progress, person, and an app button.",
      "Status pills take your own values and colors, with a grey fallback for anything else.",
      "Due date highlights turn red when overdue and amber a set number of days before.",
      "Progress bars work with 0 to 100 numbers and with percentage columns stored as 0 to 1.",
      "The Power Apps button passes the item ID to your app as a URL parameter."
    ],
    examples: [
      {
        title: "Status pill",
        problem: "Color a choice column so approvers can scan the list.",
        code: `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "div",
  "txtContent": "@currentField",
  "style": {
    "display": "=if(@currentField == '', 'none', 'inline-block')",
    "padding": "2px 10px",
    "border-radius": "12px",
    "font-weight": "600",
    "background-color": "=if(@currentField == 'Approved', '#dff6dd', if(@currentField == 'Rejected', '#fde7e9', '#edebe9'))",
    "color": "=if(@currentField == 'Approved', '#0b5a08', if(@currentField == 'Rejected', '#a4262c', '#323130'))"
  }
}`,
        expectedResult: "Approved shows as a green pill, Rejected as red, and everything else as grey.",
        commonMistakes: ["Typing a value with different capital letters than the choice.", "Pasting the JSON into Format view instead of Format this column."]
      },
      {
        title: "Open the item in a Power Apps app",
        problem: "Give list users a button that opens the right record in your canvas app.",
        code: `// App.StartScreen or the screen's OnVisible
Set(
    varItem,
    LookUp(Requests, ID = Value(Param("ID")))
)`,
        expectedResult: "The button adds ?ID=42 (or &ID=42) to the app link, and the app loads that item.",
        commonMistakes: ["Forgetting Value(), so a text parameter is compared with a number column.", "Using the Studio edit link instead of the app's Web link."]
      }
    ],
    relatedPatterns: ["sharepoint-json-status-pill-formatting", "format-sharepoint-hyperlink-field-json", "sharepoint-list-schema-for-project-intake"],
    relatedTools: ["power-fx-formatter", "sharepoint-internal-name-helper", "power-apps-color-token-generator"],
    faqs: [
      {
        question: "Where do I paste the JSON?",
        answer: "In the list, select the column header, then Column settings, then Format this column. Choose Advanced mode, paste the JSON, and save."
      },
      {
        question: "Does column formatting change my data?",
        answer: "No. It only changes how the column is shown in list views. The stored values, Power Apps, and Power Automate are not affected, and you can remove the format at any time."
      },
      {
        question: "SharePoint already has a format designer. Why use this?",
        answer: "The built-in designer handles simple background colors for choice and date columns. This builder adds layouts it doesn't offer, such as progress bars, mailto links, and a button that opens a Power Apps app, and gives you JSON you can reuse across lists."
      },
      {
        question: "How close is the preview?",
        answer: "It shows the layout and colors, not an exact copy of SharePoint. Fonts, spacing, and dark themes differ, so check the result in your list."
      },
      {
        question: "Is my data sent anywhere?",
        answer: "No. The JSON is built in your browser, and nothing you type is uploaded or stored."
      }
    ]
  }),
  item({ slug: "solution-layering-checklist-generator", kind: "tool", title: "Solution Layering Checklist Generator", eyebrow: "Free tool", description: "An interactive deployment checklist helper for solution layering, managed imports, environment variables, and connection references.", keywords: ["solution layering", "Power Platform ALM checklist", "managed solution import"], audience: "Developers and admins preparing releases across environments.", summaryBullets: ["Review unmanaged changes before export.", "Confirm environment variables and connection references.", "Capture dependency and rollback notes.", "Link deployment findings to ALM patterns."], examples: [{ title: "Deployment checklist", problem: "Prevent avoidable release failures.", code: `- Solution exported from clean dev environment
- Managed solution imported to test
- Environment variables reviewed
- Connection references rebound
- Cloud flows turned on
- Test user smoke test completed`, expectedResult: "Release owners have a repeatable preflight before production import.", commonMistakes: ["Exporting unmanaged changes accidentally", "Forgetting to enable flows", "Skipping test-user validation"] }], relatedPatterns: ["design-a-solution-layering-checklist", "document-a-solution-deployment-checklist"] })
];

export const resourceGroups = [
  { slug: "cookbooks", title: "Cookbooks", eyebrow: "Copy-ready recipes", description: "Task-based recipes with problem statements, starter code, expected results, and common mistakes.", path: "/cookbooks", items: cookbooks },
  { slug: "standards", title: "Standards", eyebrow: "Team conventions", description: "Opinionated standards for naming, data design, ALM, error handling, and supportability.", path: "/standards", items: standards },
  { slug: "cheat-sheets", title: "Cheat Sheets", eyebrow: "Fast lookup", description: "Short, search-friendly references for common Power Platform formulas, expressions, and setup decisions.", path: "/cheat-sheets", items: cheatSheets },
  { slug: "tools", title: "Free Tools", eyebrow: "Builder utilities", description: "Static utility pages and planned client-side helpers for formulas, expressions, naming, and deployment checks.", path: "/tools", items: tools }
];

export const allResources = [...cookbooks, ...standards, ...cheatSheets, ...tools];

export function getResourceBySlug(kind: ResourceKind, slug: string) {
  return allResources.find((resource) => resource.kind === kind && resource.slug === slug);
}

/** Tools linked from a tool page: the ones it lists, plus every tool that lists it. */
export function getRelatedTools(resource: ResourceItem) {
  const slugs = new Set(resource.relatedTools ?? []);
  for (const tool of tools) {
    if (tool.relatedTools?.includes(resource.slug)) slugs.add(tool.slug);
  }
  slugs.delete(resource.slug);
  return tools.filter((tool) => slugs.has(tool.slug));
}
