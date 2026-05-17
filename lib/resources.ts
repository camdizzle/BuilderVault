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
  item({ slug: "power-fx-formatter", kind: "tool", title: "Power Fx Formatter", eyebrow: "Free tool concept", description: "A planned client-side helper for making long Power Fx formulas easier to read before code review or handoff.", keywords: ["Power Fx formatter", "Power Apps formula formatter", "Power Fx review"], audience: "Makers cleaning up formulas before handoff.", summaryBullets: ["Normalize indentation around If, Patch, With, and ForAll.", "Highlight common readability issues.", "Keep formulas local in the browser.", "Link formatting issues to standards pages."], examples: [{ title: "Formatter checklist", problem: "Know what the tool should flag once interactive behavior is added.", code: `Checks:
- Long formulas without With blocks
- Nested If statements over three levels
- Patch without IfError
- Control references to other screens
- Unclear variable names`, expectedResult: "The page is ready to become an interactive utility without changing the route later.", commonMistakes: ["Trying to auto-fix business logic", "Sending formulas to a server unnecessarily"] }], relatedPatterns: ["document-a-canvas-app-code-review-checklist", "standardize-a-maker-handoff-checklist"] }),
  item({ slug: "sharepoint-internal-name-helper", kind: "tool", title: "SharePoint Internal Name Helper", eyebrow: "Free tool concept", description: "An interactive helper for predicting and documenting SharePoint internal column names before formulas and flows depend on them.", keywords: ["SharePoint internal name", "Power Automate SharePoint column", "Power Apps SharePoint columns"], audience: "Builders creating list schemas used by apps and flows.", summaryBullets: ["Explain why display names and internal names diverge.", "Provide naming rules for new columns.", "Encourage schema documentation before build.", "Link to SharePoint list schema patterns."], examples: [{ title: "Naming rule", problem: "Avoid awkward internal names created by spaces and renamed columns.", code: `Preferred display name: RequestStatus
Avoid first creating: Request Status
Then renaming to: Status`, expectedResult: "Makers avoid internal names such as Request_x0020_Status in formulas and flow outputs.", commonMistakes: ["Renaming columns after flows are built", "Using punctuation in first column names"] }], relatedPatterns: ["design-a-sharepoint-list-schema-for-power-apps", "document-a-sharepoint-column-internal-name-map"] }),
  item({ slug: "power-automate-expression-builder", kind: "tool", title: "Power Automate Expression Builder", eyebrow: "Free tool concept", description: "An interactive helper for assembling common Power Automate expressions for dates, null checks, arrays, and trigger conditions.", keywords: ["Power Automate expression builder", "flow expressions", "trigger conditions"], audience: "Flow builders who reuse the same expressions across business processes.", summaryBullets: ["Start with common expression templates.", "Explain what each placeholder means.", "Link templates to cookbook examples.", "Keep generated snippets copy-ready."], examples: [{ title: "Expression templates", problem: "Give makers a safe starting point.", code: `Date: formatDateTime(<dateValue>, 'MMM d, yyyy')
Null fallback: coalesce(<value>, '<fallback>')
Choice trigger: @equals(triggerOutputs()?['body/<ChoiceColumn>/Value'], '<Choice>')`, expectedResult: "Makers can adapt snippets without hunting through run history for syntax.", commonMistakes: ["Copying expressions without replacing placeholders", "Using expressions in the wrong connector context"] }], relatedPatterns: ["configure-a-trigger-condition-for-status-changed", "build-a-daily-exception-digest"] }),
  item({ slug: "dataverse-table-naming-helper", kind: "tool", title: "Dataverse Table Naming Helper", eyebrow: "Free tool concept", description: "A naming worksheet for Dataverse tables, columns, choices, relationships, and solution prefixes.", keywords: ["Dataverse naming", "Dataverse table design", "solution publisher prefix"], audience: "Developers planning Dataverse data models.", summaryBullets: ["Separate display names from schema strategy.", "Use consistent publisher prefixes.", "Name relationships by business relationship.", "Capture plural and singular names before build."], examples: [{ title: "Naming worksheet", problem: "Design names before tables are created.", code: `Publisher prefix: bv
Table display name: Service Request
Schema name: bv_ServiceRequest
Primary column: bv_RequestName
Relationship: bv_Customer_ServiceRequests`, expectedResult: "The data model stays consistent across apps, flows, and solutions.", commonMistakes: ["Changing schema names late", "Using generic table names", "Ignoring relationship names"] }], relatedPatterns: ["design-a-dataverse-table-relationship-model", "standardize-a-solution-publisher-prefix"] }),
  item({ slug: "adaptive-card-preview-snippets", kind: "tool", title: "Adaptive Card Preview Snippets", eyebrow: "Free tool concept", description: "A snippet library for Teams Adaptive Card layouts used by approval, notification, and request review flows.", keywords: ["Adaptive Card snippets", "Teams card Power Automate", "approval card"], audience: "Flow builders who send Teams cards from Power Automate.", summaryBullets: ["Start from small, testable card blocks.", "Use consistent headings and facts.", "Keep action buttons aligned to flow outcomes.", "Document payload owners and test channels."], examples: [{ title: "Fact block", problem: "Show scannable request metadata.", code: `{ "type": "FactSet", "facts": [
  { "title": "Request", "value": "@{triggerBody()?['Title']}" },
  { "title": "Owner", "value": "@{triggerBody()?['Author']?['Email']}" }
] }`, expectedResult: "Teams cards remain compact and readable.", commonMistakes: ["Testing only in desktop Teams", "Forgetting JSON escaping", "Using too many facts"] }], relatedPatterns: ["send-an-adaptive-card-approval-to-teams", "build-a-user-mention-notification-pattern"] }),
  item({ slug: "power-apps-color-token-generator", kind: "tool", title: "Power Apps Color Token Generator", eyebrow: "Free tool concept", description: "An interactive helper for turning brand colors into reusable Power Fx color variables and theme notes.", keywords: ["Power Apps colors", "Power Apps theme", "RGBA Power Fx"], audience: "Makers standardizing app colors across screens and components.", summaryBullets: ["Define named color variables once.", "Generate RGBA formulas from hex values.", "Document accessible contrast decisions.", "Link theme choices to component patterns."], examples: [{ title: "Color token pattern", problem: "Avoid hardcoded colors throughout screens.", code: `Set(gblColorPrimary, RGBA(15, 118, 110, 1));
Set(gblColorSurface, RGBA(255, 255, 255, 1));
Set(gblColorDanger, RGBA(185, 28, 28, 1));`, expectedResult: "Makers update color choices in one place instead of editing each control.", commonMistakes: ["Hardcoding colors in every property", "Ignoring contrast", "Using color names that describe hue instead of purpose"] }], relatedPatterns: ["standardize-a-canvas-app-theme", "build-a-reusable-command-bar-component"] }),
  item({ slug: "solution-layering-checklist-generator", kind: "tool", title: "Solution Layering Checklist Generator", eyebrow: "Free tool concept", description: "An interactive deployment checklist helper for solution layering, managed imports, environment variables, and connection references.", keywords: ["solution layering", "Power Platform ALM checklist", "managed solution import"], audience: "Developers and admins preparing releases across environments.", summaryBullets: ["Review unmanaged changes before export.", "Confirm environment variables and connection references.", "Capture dependency and rollback notes.", "Link deployment findings to ALM patterns."], examples: [{ title: "Deployment checklist", problem: "Prevent avoidable release failures.", code: `- Solution exported from clean dev environment
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
