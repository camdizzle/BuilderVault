import { resourceAdditions } from "./resource-additions.ts";

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
  const extra = resourceAdditions[input.slug];
  return {
    ...input,
    examples: [...input.examples, ...(extra?.examples ?? [])],
    faqs: input.faqs ?? extra?.faqs,
    path: `/${parent}/${input.slug}`
  };
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
    relatedPatterns: ["build-a-queue-dashboard-gallery", "groupby-sum-count-gallery-power-apps", "calculate-totals-gallery-collection"]
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
    relatedPatterns: ["power-automate-trigger-condition-status-changed", "coalesce-empty-null-handling-power-automate", "power-automate-compose-date-formatting"]
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
    relatedPatterns: ["sharepoint-list-schema-for-project-intake", "create-a-sharepoint-view-for-upcoming-milestones", "sharepoint-internal-name-safe-column-design"]
  })
];

export const standards: ResourceItem[] = [
  item({ slug: "power-apps-naming-standards", kind: "standard", title: "Power Apps Naming Standards", eyebrow: "Standards", description: "Naming guidance for screens, controls, variables, collections, components, and formulas in maintainable canvas apps.", keywords: ["Power Apps naming standards", "canvas app standards", "Power Fx variables"], audience: "Teams building apps that more than one maker will maintain.", summaryBullets: ["Use predictable prefixes for controls and variables.", "Name screens around user tasks.", "Avoid abbreviations only one maker understands.", "Document exceptions in app notes."], examples: [{ title: "Recommended prefixes", problem: "Keep formulas readable across screens.", code: `Screens: scrRequestList, scrRequestDetail
Galleries: galRequests, galApprovers
Forms: frmRequest
Inputs: txtTitle, cmbPriority, dpDueDate
Variables: varSaving, varCurrentRequest
Collections: colReviewQueue, colSelectedApprovers`, expectedResult: "A new maker can infer purpose before opening every control property.", commonMistakes: ["Leaving default names like Button12", "Using different prefixes per maker", "Encoding business rules into cryptic names"] }], relatedPatterns: ["use-named-formulas-for-app-constants", "power-apps-componentized-header-pattern"] }),
  item({ slug: "power-automate-naming-standards", kind: "standard", title: "Power Automate Naming Standards", eyebrow: "Standards", description: "Naming guidance for triggers, scopes, actions, variables, Compose steps, and child flows.", keywords: ["Power Automate naming standards", "cloud flow standards", "flow action names"], audience: "Flow builders who need supportable run history and readable troubleshooting.", summaryBullets: ["Name actions by business intent.", "Prefix scopes by stage such as Try, Catch, Finally.", "Use Compose names that describe transformed values.", "Keep flow names searchable by system and outcome."], examples: [{ title: "Readable flow action names", problem: "Make run history understandable without opening every action.", code: `Flow: Requests - Send approval reminder
Scope: Try - build reminder email
Compose: Compose - formatted due date
Condition: Condition - request is still pending
Scope: Catch - log reminder failure`, expectedResult: "Support owners can scan failed runs quickly.", commonMistakes: ["Leaving action names as Compose 7", "Renaming only the first few actions", "Using vague names such as Process Data"] }], relatedPatterns: ["power-automate-document-flow-inventory", "create-a-power-automate-flow-documentation-template"] }),
  item({ slug: "sharepoint-list-design-standards", kind: "standard", title: "SharePoint List Design Standards", eyebrow: "Standards", description: "Standards for SharePoint lists used as Power Apps and Power Automate data sources.", keywords: ["SharePoint list design", "Power Apps SharePoint standards", "SharePoint list governance"], audience: "Teams using SharePoint as a lightweight app backend.", summaryBullets: ["Choose column types intentionally.", "Create support views before go-live.", "Index high-use filter columns.", "Document list ownership and retention."], examples: [{ title: "Minimum list design notes", problem: "Capture design decisions that affect future maintenance.", code: `List owner: Operations Applications
Primary app: Request Intake
Primary flows: Request approval, overdue reminder
Indexed columns: RequestStatus, AssignedTo, DueDate
Retention: Archive closed requests after 24 months`, expectedResult: "The list has enough context for future support and migration decisions.", commonMistakes: ["Treating SharePoint like Excel", "Skipping ownership", "Using views as permission controls"] }], relatedPatterns: ["sharepoint-list-schema-for-project-intake", "govern-sharepoint-list-naming-standards"] }),
  item({ slug: "dataverse-table-design-standards", kind: "standard", title: "Dataverse Table Design Standards", eyebrow: "Standards", description: "Table, column, relationship, choice, and ownership standards for Dataverse-backed business apps.", keywords: ["Dataverse table design", "Dataverse standards", "model-driven app data model"], audience: "Developers designing Dataverse tables before app and flow build-out.", summaryBullets: ["Name tables around business entities.", "Use relationships instead of duplicated text where lifecycle matters.", "Separate security ownership from display labels.", "Plan solution transport from the start."], examples: [{ title: "Table design brief", problem: "Clarify the table before adding columns.", code: `Table: Service Request
Owner type: User or team
Primary column: Request Name
Relationships: Customer, Request Category, Assigned Team
Choices: Priority, Request Status
Audit: Enabled for production tables`, expectedResult: "The model supports security, reporting, automation, and future model-driven apps.", commonMistakes: ["Creating one mega table", "Using text where lookup relationships are needed", "Ignoring ownership model"] }], relatedPatterns: ["solution-publisher-prefix-naming-standard", "patch-dataverse-lookup-and-choice-columns"] }),
  item({ slug: "environment-variable-standards", kind: "standard", title: "Environment Variable Standards", eyebrow: "Standards", description: "Naming, ownership, and deployment standards for Power Platform environment variables.", keywords: ["Power Platform environment variables", "ALM standards", "solution deployment"], audience: "Teams shipping solutions across dev, test, and production.", summaryBullets: ["Use environment variables for values that change by environment.", "Avoid hiding business rules in variables.", "Document default and production values.", "Review values during deployment checklists."], examples: [{ title: "Environment variable register", problem: "Keep deployment values discoverable.", code: `Name: bv_SupportMailbox
Type: Text
Dev value: powerplatform-dev@contoso.com
Prod value: powerplatform-support@contoso.com
Used by: Request notification flow
Owner: Platform team`, expectedResult: "Deployments no longer depend on someone remembering which email address to change.", commonMistakes: ["Hardcoding tenant-specific values", "Creating variables without ownership", "Using unclear schema names"] }], relatedPatterns: ["dataverse-environment-variables-canvas-apps-flows", "deployment-settings-file-pac-cli"] }),
  item({ slug: "connection-reference-standards", kind: "standard", title: "Connection Reference Standards", eyebrow: "Standards", description: "Standards for connection references used by flows, apps, solutions, and service accounts.", keywords: ["connection references", "Power Platform ALM", "service account connections"], audience: "Admins and developers responsible for production flow ownership.", summaryBullets: ["Prefer durable service ownership for production automation.", "Name references by connector and purpose.", "Document what breaks if a connection expires.", "Review references before managed solution import."], examples: [{ title: "Connection reference naming", problem: "Make references understandable during import.", code: `cr_SharePoint_RequestLists
cr_Outlook_Notifications
cr_Dataverse_CoreTables
cr_Teams_Approvals`, expectedResult: "Admins know which connection to bind without opening each flow.", commonMistakes: ["Using personal maker connections in production", "Leaving generated names", "Not documenting connector licensing"] }], relatedPatterns: ["connection-references-for-solution-flows", "govern-power-automate-service-account-ownership"] }),
  item({ slug: "error-handling-standards", kind: "standard", title: "Power Platform Error Handling Standards", eyebrow: "Standards", description: "Shared expectations for canvas app errors, flow failures, retry behavior, logging, and support notifications.", keywords: ["Power Platform error handling", "Power Automate try catch", "Power Apps IfError"], audience: "Teams preparing apps and flows for real users and support owners.", summaryBullets: ["Every production flow should have a failure path.", "Every important save formula should use IfError or Errors.", "User messages should explain what happened and what to do next.", "Support logs should include enough context to reproduce the issue."], examples: [{ title: "Flow error scope model", problem: "Handle failed automation without silent loss.", code: flowScopeSnippet, expectedResult: "Failures become visible and supportable instead of buried in run history.", commonMistakes: ["No run-after configuration", "Emailing raw error JSON to users", "Retrying non-idempotent updates blindly"] }], relatedPatterns: ["power-automate-try-catch-scope-error-handling", "power-apps-error-handling-iferror-patch"] }),
  item({ slug: "logging-standards", kind: "standard", title: "Power Platform Logging Standards", eyebrow: "Standards", description: "Practical logging standards for request IDs, flow run links, app errors, and operational support history.", keywords: ["Power Platform logging", "flow run logging", "app support logs"], audience: "Support owners who need evidence when automations fail or users report issues.", summaryBullets: ["Log business identifiers, not just technical errors.", "Capture flow run URLs for support review.", "Separate user notifications from support logs.", "Keep logs searchable by request, user, and date."], examples: [{ title: "Support log columns", problem: "Create a lightweight list or table for operational issues.", code: `RequestId
SourceSystem
EventType
Severity
Message
FlowRunUrl
UserEmail
OccurredOn
ResolvedOn`, expectedResult: "Support can search for failures by request or user without reverse-engineering every flow.", commonMistakes: ["Logging sensitive data", "Only logging failures", "No retention plan"] }], relatedPatterns: ["create-a-flow-run-logging-list", "create-audit-rows-for-status-changes"] })
];

export const cheatSheets: ResourceItem[] = [
  item({ slug: "patch-sharepoint-columns-cheat-sheet", kind: "cheat-sheet", title: "Patch SharePoint Columns Cheat Sheet", eyebrow: "Cheat sheet", description: "Quick examples for patching text, choice, person, lookup, date, yes/no, and metadata columns from Power Apps.", keywords: ["Patch SharePoint columns", "Power Apps person field", "Power Apps choice field"], audience: "Makers who know the field they need to save and want the correct Patch shape quickly.", summaryBullets: ["Person fields need claims-shaped records.", "Choice fields need records with Value.", "Lookup fields need Id and Value.", "Dates should be validated before save."], examples: [{ title: "Choice field", problem: "Patch a SharePoint choice column from a combo box.", code: `Patch(Requests, galRequests.Selected, { Priority: { Value: cmbPriority.Selected.Value } })`, expectedResult: "Priority stores the selected choice value.", commonMistakes: ["Patching only text when SharePoint expects a choice record"] }, { title: "Lookup field", problem: "Patch a lookup column from a selected record.", code: `Patch(Requests, galRequests.Selected, { Customer: { Id: cmbCustomer.Selected.ID, Value: cmbCustomer.Selected.Title } })`, expectedResult: "The lookup points to the selected customer item.", commonMistakes: ["Using ID instead of Id", "Omitting the display value"] }], relatedPatterns: ["patch-sharepoint-choice-field", "patch-sharepoint-lookup-field", "patch-sharepoint-people-picker-power-apps"] }),
  item({
    slug: "patch-dataverse-columns-cheat-sheet",
    kind: "cheat-sheet",
    title: "Patch Dataverse Columns Cheat Sheet",
    eyebrow: "Cheat sheet",
    description: "The Patch value for every Dataverse column type in Power Apps: text, numbers, dates, Yes/No, choices, multi-select choices, lookups, Owner and Customer, images, and how to clear a value.",
    keywords: ["Patch Dataverse choice column", "Patch Dataverse lookup Power Apps", "Patch Owner Dataverse", "Patch Yes/No Dataverse", "Patch multi-select choice Dataverse"],
    audience: "Makers saving to Dataverse with Patch, especially anyone who learned Patch on SharePoint, where choices and people need different shapes.",
    summaryBullets: [
      "Choices take the option itself, such as 'Status (Requests)'.Approved, never text and never a { Value: } record.",
      "Yes/No columns take true or false.",
      "Lookups take a whole row from the related table, from LookUp or a combo box's Selected.",
      "Owner and Customer are polymorphic lookups: they take a row from either of their tables.",
      "Use the column's display name in Power Apps, in single quotes when it has spaces."
    ],
    examples: [
      {
        title: "Text, numbers and dates",
        problem: "Read values from text inputs and a date picker. Text inputs always give text, so numbers need Value.",
        code: `Patch(
    Requests,
    Defaults(Requests),
    {
        Title: txtTitle.Text,
        Amount: Value(txtAmount.Text),
        Quantity: Round(Value(txtQuantity.Text), 0),
        'Due Date': dpDue.SelectedDate
    }
)`,
        expectedResult: "A new row with the text, the amount, a whole number quantity and the due date.",
        commonMistakes: ["Passing txtAmount.Text to a number or currency column.", "Sending a decimal to a whole number column. Round it first."]
      },
      {
        title: "Yes/No",
        problem: "A Yes/No column stores a boolean, so it takes true or false.",
        code: `Patch(Requests, galRequests.Selected, { Urgent: tglUrgent.Value })

// or a fixed value
Patch(Requests, galRequests.Selected, { Urgent: true })`,
        expectedResult: "Urgent is set from the toggle, or to Yes.",
        commonMistakes: ["Patching the label text, such as \"Yes\"."]
      },
      {
        title: "Choice",
        problem: "Dataverse stores a choice as a number, and Power Apps names each option. Patch the option, not its label.",
        code: `// A choice that belongs to this table
Patch(Requests, galRequests.Selected, { Status: 'Status (Requests)'.Approved })

// A global choice uses its own name
Patch(Requests, galRequests.Selected, { Priority: Priority.High })

// From a combo box whose Items is Choices(Requests.Status)
Patch(Requests, galRequests.Selected, { Status: cmbStatus.Selected.Value })`,
        expectedResult: "The status is stored as the option, in every language the app is used in.",
        commonMistakes: ["Status: \"Approved\" (text) or Status: { Value: \"Approved\" } (the SharePoint shape).", "Filling the combo box from a hard-coded list of text instead of Choices()."]
      },
      {
        title: "Multi-select choice",
        problem: "A multi-select choice takes a table of options.",
        code: `// From a combo box whose Items is Choices(Requests.Tags)
Patch(Requests, galRequests.Selected, { Tags: cmbTags.SelectedItems })

// Fixed options
Patch(Requests, galRequests.Selected, { Tags: [ 'Tags (Requests)'.Finance, 'Tags (Requests)'.Urgent ] })`,
        expectedResult: "The row holds exactly the options given. Options not listed are removed.",
        commonMistakes: ["Passing one option where a table is expected.", "Forgetting that Patch replaces the whole set, so add the existing options if you mean to append."]
      },
      {
        title: "Lookup",
        problem: "A lookup takes a row from the related table, not its ID or name.",
        code: `// A row found by a value
Patch(
    Requests,
    galRequests.Selected,
    { Account: LookUp(Accounts, 'Account Name' = "Contoso") }
)

// From a combo box whose Items is the Accounts table
Patch(Requests, galRequests.Selected, { Account: cmbAccount.Selected })`,
        expectedResult: "The request points to the chosen account.",
        commonMistakes: ["Passing the account's GUID or name as text.", "Using a combo box that lists text values instead of rows."]
      },
      {
        title: "Owner",
        problem: "Owner can be a user or a team, and Patch accepts a row from either table.",
        code: `// The signed-in user
Patch(
    Requests,
    galRequests.Selected,
    { Owner: LookUp(Users, 'Primary Email' = User().Email) }
)

// A team
Patch(Requests, galRequests.Selected, { Owner: LookUp(Teams, 'Team Name' = "Finance") })`,
        expectedResult: "The row is assigned to the user or the team.",
        commonMistakes: ["Passing an email address as text.", "Looking the user up inside a loop. Look the user up once, for example in a named formula."]
      },
      {
        title: "Customer",
        problem: "A Customer column is a lookup to an account or a contact.",
        code: `Patch(Contacts, galContacts.Selected, { 'Company Name': cmbAccount.Selected })

// or a contact
Patch(Cases, galCases.Selected, { Customer: LookUp(Contacts, 'Full Name' = "Sam Lee") })`,
        expectedResult: "The customer points to the chosen account or contact.",
        commonMistakes: ["Assuming the column only takes accounts."]
      },
      {
        title: "Image",
        problem: "An image column takes an image value, such as a photo from the camera or the image picker.",
        code: `Patch(Requests, galRequests.Selected, { Photo: Camera1.Photo })

// From an Add picture control
Patch(Requests, galRequests.Selected, { Photo: AddMediaButton1.Media })`,
        expectedResult: "The image is saved to the row's image column.",
        commonMistakes: ["Patching the image's file name instead of the image."]
      },
      {
        title: "Clear a value",
        problem: "Set a column back to empty.",
        code: `Patch(
    Requests,
    galRequests.Selected,
    {
        'Due Date': Blank(),
        Account: Blank(),
        Status: Blank()
    }
)`,
        expectedResult: "The due date, account and status are empty. Required columns can't be cleared.",
        commonMistakes: ["Using an empty string \"\" for a date, lookup or choice."]
      }
    ],
    relatedPatterns: ["patch-dataverse-lookup-and-choice-columns", "dataverse-polymorphic-lookup-patch-power-apps", "power-apps-error-handling-iferror-patch"],
    relatedTools: ["patch-formula-builder", "dataverse-table-naming-helper"],
    faqs: [
      {
        question: "How do I Patch a choice column in Dataverse?",
        answer: "Patch the option, such as 'Status (Requests)'.Approved for a choice that belongs to the table, or the global choice's name followed by the option, such as Priority.High. Don't patch the label text."
      },
      {
        question: "How do I Patch a lookup column in Dataverse?",
        answer: "Give it a whole row from the related table, for example LookUp(Accounts, 'Account Name' = \"Contoso\") or a combo box's Selected when the combo box lists that table."
      },
      {
        question: "Why does my SharePoint Patch formula fail on Dataverse?",
        answer: "SharePoint uses records such as { Value: \"Approved\" } for choices and a claims record for people. Dataverse uses the option itself for choices and a row from the Users table for people. The column shapes are different even when the column names match."
      },
      {
        question: "What is the name of my choice in the formula?",
        answer: "For a choice that belongs to one table, Power Apps names it after the column and the table, such as 'Status (Requests)'. For a global choice, it uses the choice's own name. Type the name and a dot in the formula bar, and Power Apps lists the options."
      }
    ]
  }),
  item({ slug: "power-apps-gallery-filtering-cheat-sheet", kind: "cheat-sheet", title: "Power Apps Gallery Filtering Cheat Sheet", eyebrow: "Cheat sheet", description: "Delegation-aware gallery filter formulas for search boxes, status chips, date ranges, user filters, and queue screens.", keywords: ["Power Apps gallery filter", "delegation", "Search gallery"], audience: "Makers building galleries that need to keep working after the list gets large.", summaryBullets: ["Start with delegable filters first.", "Use StartsWith for SharePoint search when possible.", "Combine status and ownership filters carefully.", "Avoid wrapping columns in non-delegable transformations."], examples: [{ title: "Status and search", problem: "Filter a request gallery by status and title search.", code: `Filter(
    Requests,
    RequestStatus.Value = cmbStatus.Selected.Value,
    StartsWith(Title, txtSearch.Text)
)`, expectedResult: "The gallery filters by selected status and typed title prefix.", commonMistakes: ["Using Search on large SharePoint lists", "Lowercasing the column in the filter", "Ignoring delegation warnings"] }], relatedPatterns: ["power-apps-search-with-multiple-fields", "build-a-queue-dashboard-gallery"] }),
  item({ slug: "power-automate-trigger-conditions-cheat-sheet", kind: "cheat-sheet", title: "Power Automate Trigger Conditions Cheat Sheet", eyebrow: "Cheat sheet", description: "Common trigger condition patterns for status changes, empty checks, approvals, recurrence guards, and noisy list updates.", keywords: ["Power Automate trigger conditions", "flow trigger condition", "SharePoint trigger condition"], audience: "Flow builders trying to reduce unnecessary runs and avoid infinite loops.", summaryBullets: ["Keep trigger conditions small and readable.", "Use them to reduce noise, not to hide complex process logic.", "Document every condition in the flow notes.", "Test create and update events separately."], examples: [{ title: "Only run for submitted requests", problem: "Start a flow only when a SharePoint choice field is Submitted.", code: `@equals(triggerOutputs()?['body/RequestStatus/Value'], 'Submitted')`, expectedResult: "The flow ignores draft and closed updates.", commonMistakes: ["Using the wrong dynamic path", "Forgetting choice /Value", "Adding too many conditions at the trigger"] }], relatedPatterns: ["power-automate-trigger-condition-status-changed", "power-automate-avoid-infinite-update-loop"] }),
  item({ slug: "dataverse-security-roles-cheat-sheet", kind: "cheat-sheet", title: "Dataverse Security Roles Cheat Sheet", eyebrow: "Cheat sheet", description: "Fast guidance for table privileges, ownership, business units, teams, app sharing, and test-user validation.", keywords: ["Dataverse security roles", "model-driven app access", "Power Platform permissions"], audience: "Developers and admins configuring secure access for Dataverse apps.", summaryBullets: ["Confirm table ownership before designing roles.", "Share the app and assign the right security role.", "Test with a real non-admin user.", "Document team-based access separately from record ownership."], examples: [{ title: "Role review checklist", problem: "Validate access before production release.", code: `- Can create own request
- Can read team requests
- Cannot delete closed requests
- Can run related flows
- Can open model-driven app
- Can access required environment`, expectedResult: "Security issues are found before users report missing buttons or inaccessible records.", commonMistakes: ["Testing only as system admin", "Sharing the app but not assigning roles", "Ignoring environment access"] }], relatedPatterns: ["check-dataverse-security-role-in-canvas-app", "power-pages-table-permissions-web-roles"] }),
  item({ slug: "power-automate-date-formatting-cheat-sheet", kind: "cheat-sheet", title: "Power Automate Date Formatting Cheat Sheet", eyebrow: "Cheat sheet", description: "Date and time expressions for email, SharePoint filters, approvals, time zones, filenames, and scheduled reminders.", keywords: ["Power Automate date formatting", "formatDateTime", "convertTimeZone"], audience: "Flow builders who need date expressions that do not surprise users.", summaryBullets: ["Format dates for users, but store dates as dates.", "Be explicit about time zones.", "Use sortable date formats in filenames.", "Test daylight saving transitions when timing matters."], examples: [{ title: "Sortable filename date", problem: "Add a stable timestamp to exported files.", code: `formatDateTime(utcNow(), 'yyyy-MM-dd-HHmm')`, expectedResult: "Generated filenames sort chronologically.", commonMistakes: ["Using slash characters in filenames", "Mixing local and UTC times", "Formatting too early before comparisons"] }], relatedPatterns: ["power-automate-compose-date-formatting", "convert-time-zone-format-date-power-automate"] }),
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
}`, expectedResult: "Reviewers receive a structured Teams message with the key request facts.", commonMistakes: ["Overloading the card with every field", "Not testing mobile Teams", "Using action labels that do not match flow logic"] }], relatedPatterns: ["post-adaptive-card-and-wait-for-response", "mention-a-user-in-teams-adaptive-card"] })
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
      "Flags unbalanced brackets and quotes, and checks delegation for the data source you pick: SharePoint, Dataverse, SQL Server, or Excel.",
      "Links each function in the formula to its page in the Power Fx function reference.",
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
        expectedResult: "The data source filters the rows on the server instead of only checking the first 500 to 10,000.",
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
        answer: "No. Formatting runs entirely in your browser, and the formula is not uploaded or stored. Copy share link puts the formula in the part of the link after #, which browsers don't send to the server, but anyone you give the link to can read it."
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
        answer: "It is a guide, not a guarantee. Pick the data source the formula runs against, and the formatter uses the same rules as the delegation checker to flag functions and operators that source can't delegate, such as Lower or the in operator inside Filter on SharePoint. Column types matter too, so always confirm with the warnings in Studio."
      }
    ]
  }),
  item({ slug: "sharepoint-internal-name-helper", kind: "tool", title: "SharePoint Internal Name Helper", eyebrow: "Free tool", description: "See the internal name SharePoint will create for a column, including _x0020_ encoding for spaces and symbols, and the cleaner name to create it with instead.", keywords: ["SharePoint internal name", "Power Automate SharePoint column", "Power Apps SharePoint columns"], audience: "Builders creating list schemas used by apps and flows.", summaryBullets: ["Type a column name to see the internal name SharePoint will give it.", "Spaces and symbols are shown with their _x0020_ style encoding.", "Get a clean name to create the column with, then rename the display name afterwards.", "Use the internal name in flow filter queries, trigger outputs and column formatting JSON."], examples: [{ title: "Naming rule", problem: "Avoid awkward internal names created by spaces and renamed columns.", code: `Preferred display name: RequestStatus
Avoid first creating: Request Status
Then renaming to: Status`, expectedResult: "Makers avoid internal names such as Request_x0020_Status in formulas and flow outputs.", commonMistakes: ["Renaming columns after flows are built", "Using punctuation in first column names"] }], relatedPatterns: ["sharepoint-internal-name-safe-column-design", "sharepoint-list-schema-for-project-intake"] }),
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
      "Groups conditions in brackets, such as (Status is Open or In Review) and Priority is High.",
      "Adds Dataverse date functions such as LastXDays and ThisMonth, and ContainValues for multi-select choices.",
      "Fills in sort order, row count and columns to return, and warns about the 100-item default on Get items.",
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
  item({
    slug: "date-format-tester",
    kind: "tool",
    title: "Date Format and Time Zone Tester for Power Automate and Power Apps",
    eyebrow: "Free tool",
    description: "Test formatDateTime and convertTimeZone format strings on a sample date, pick a time zone by its exact name, and get the matching Power Fx Text() formula for Power Apps.",
    keywords: ["Power Automate formatDateTime", "convertTimeZone time zone names", "Power Automate date format", "Power Apps Text date format", "Power Automate date format examples"],
    audience: "Flow and app builders who need a date to look right in an email, a file name, a Teams message, or a label, and don't want to run the flow ten times to find the right format string.",
    summaryBullets: [
      "Shows the result of a format string on a sample date as you type.",
      "Lists the exact time zone names convertTimeZone expects, such as Eastern Standard Time.",
      "Handles daylight saving time in the preview for the date you enter.",
      "Writes the Power Automate expression and the equivalent Power Fx Text() formula.",
      "Points out where the two differ, such as MM for months in flows and mm in Power Fx."
    ],
    examples: [
      {
        title: "A readable date in the reader's time zone",
        problem: "SharePoint and Dataverse return UTC. Convert before you format, or the email shows the wrong hour, and near midnight the wrong day.",
        code: `convertTimeZone(triggerOutputs()?['body/Created'], 'UTC', 'Eastern Standard Time', 'MMM d, yyyy h:mm tt')`,
        expectedResult: "Mar 9, 2026 10:05 AM for a value of 2026-03-09T14:05:07Z.",
        commonMistakes: ["Using a name such as EST or America/New_York. convertTimeZone needs the Windows name, such as Eastern Standard Time.", "Writing mm for the month. In Power Automate, MM is the month and mm is minutes."]
      },
      {
        title: "The same format in Power Apps",
        problem: "Power Fx uses lowercase m for both months and minutes, and AM/PM where flows use tt.",
        code: `Text(ThisItem.Created, "mmm d, yyyy h:mm AM/PM")`,
        expectedResult: "Mar 9, 2026 10:05 AM, shown in the app user's own time zone.",
        commonMistakes: ["Copying a Power Automate format string into Text() unchanged.", "Expecting Text() to convert to a specific time zone. Power Apps always shows the user's local time."]
      },
      {
        title: "A sortable stamp for file names",
        problem: "File names can't contain slashes or colons, and should sort in date order.",
        code: `formatDateTime(utcNow(), 'yyyyMMdd_HHmmss')`,
        expectedResult: "20260309_140507",
        commonMistakes: ["Using hh, which is 12-hour time, so morning and afternoon files get the same stamp."]
      }
    ],
    relatedPatterns: ["power-automate-compose-date-formatting", "delegation-safe-date-range-filter"],
    relatedTools: ["power-fx-formatter", "power-automate-expression-builder", "odata-filter-query-builder"],
    faqs: [
      {
        question: "Why is my flow's time off by a few hours?",
        answer: "Power Automate works in UTC. Use convertTimeZone to move the value to your time zone before formatting it. The tool writes that expression when you pick a time zone."
      },
      {
        question: "Does convertTimeZone handle daylight saving time?",
        answer: "Yes. Names such as Eastern Standard Time cover both standard and daylight time, and the right offset is used for each date. Don't switch to a Daylight Time name in summer."
      },
      {
        question: "What is the difference between MM and mm?",
        answer: "In Power Automate, MM is the month and mm is minutes, HH is 24-hour time and hh is 12-hour time. Power Fx uses lowercase m for both months and minutes and works out which one you mean from the letters around it."
      },
      {
        question: "Are month and day names always in English?",
        answer: "The preview uses English names. In Power Automate you can add a locale as a third argument to formatDateTime, such as 'de-DE'. In Power Apps, Text() takes a language tag as its third argument."
      },
      {
        question: "Is my data sent anywhere?",
        answer: "No. The preview runs in your browser, and nothing you type is uploaded or stored."
      }
    ]
  }),
  item({
    slug: "power-automate-expression-builder",
    kind: "tool",
    title: "Power Automate Expression Builder",
    eyebrow: "Free tool",
    description: "Build Power Automate expressions for dates, time zones, empty values, text, numbers, arrays, trigger conditions and approvals. Fill in your own values and copy an expression that handles nulls and quotes for you.",
    keywords: ["Power Automate expression builder", "Power Automate expressions", "formatDateTime null", "coalesce Power Automate", "trigger condition expression"],
    audience: "Flow builders who need a working expression quickly and don't want to debug a null or a missing quote in run history.",
    summaryBullets: [
      "Choose from 28 templates in seven groups: dates and times, text, numbers, arrays and loops, trigger conditions, approvals, and flow details.",
      "Replace the sample values with your own trigger or action outputs. Text is quoted for you, with single quotes doubled.",
      "Date and text templates check for empty values first, so the flow doesn't fail when a column is blank.",
      "Each template explains its inputs and links to the error page for the mistake it avoids.",
      "Nothing you type leaves your browser."
    ],
    examples: [
      {
        title: "Format a date that can be empty",
        problem: "formatDateTime fails with a null error when a SharePoint date column is blank.",
        code: `if(empty(triggerOutputs()?['body/DueDate']), '', formatDateTime(triggerOutputs()?['body/DueDate'], 'MMM d, yyyy'))`,
        expectedResult: "A formatted date when there is one, and empty text when there isn't, with no failed run.",
        commonMistakes: ["Formatting the date without checking it first", "Using coalesce, which doesn't catch empty text"]
      },
      {
        title: "Read the first item without a loop",
        problem: "Get items returns an array, so reading one column normally adds an Apply to each.",
        code: `first(body('Get_items')?['value'])?['Title']`,
        expectedResult: "The Title of the first row, or null when no rows came back.",
        commonMistakes: ["Forgetting the ['value'] part", "Typing the action name with spaces instead of underscores"]
      }
    ],
    relatedPatterns: ["power-automate-trigger-condition-status-changed", "coalesce-empty-null-handling-power-automate"],
    relatedTools: ["date-format-tester", "trigger-condition-builder", "odata-filter-query-builder"],
    faqs: [
      {
        question: "Where do I paste the expression?",
        answer: "Click into an action field, open the expression editor (fx), paste it and select Add or OK. Don't add @ or @{ } around it there. Trigger conditions are the exception: they go in the trigger's Settings and start with @."
      },
      {
        question: "Why does my expression fail when a column is empty?",
        answer: "Functions such as formatDateTime, toLower and ticks fail when they are given null. The templates check with empty() or coalesce() first, so a blank column returns a fallback instead of failing the run."
      },
      {
        question: "What is the difference between coalesce and empty?",
        answer: "coalesce returns the first value that isn't null, so empty text still comes back as empty text. empty() is true for null, empty text, an empty array and an empty object, so if(empty(value), fallback, value) catches both."
      },
      {
        question: "Why do action names have underscores?",
        answer: "Expressions refer to actions by their internal name, which replaces spaces with underscores. An action shown as Get items is body('Get_items') in an expression."
      },
      {
        question: "Is anything I type sent anywhere?",
        answer: "No. The expressions are built in your browser, and nothing you type is uploaded or stored."
      }
    ]
  }),
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
  item({
    slug: "excel-to-power-fx",
    kind: "tool",
    title: "Excel Formula to Power Fx Translator",
    eyebrow: "Free tool",
    description: "Translate Excel formulas into Power Fx for Power Apps. Renames functions, rewrites VLOOKUP, XLOOKUP, SUMIF, COUNTIF, and DATEDIF, swaps cell references for your controls and columns, and lists what to finish by hand.",
    keywords: ["Excel to Power Fx", "Excel formula to Power Apps", "VLOOKUP in Power Apps", "SUMIF Power Apps", "convert Excel formula Power Fx"],
    audience: "Excel users building their first canvas apps, and makers rebuilding a spreadsheet as an app who have a workbook full of formulas to carry over.",
    summaryBullets: [
      "Renames more than 60 Excel functions to their Power Fx names, such as IFERROR to IfError and EOMONTH to EOMonth.",
      "Rewrites lookups (VLOOKUP, HLOOKUP, XLOOKUP) as LookUp, and SUMIF, COUNTIF, and AVERAGEIF as Filter-based formulas.",
      "Converts DATEDIF and DAYS to DateDiff, IFS to If, and SEARCH to a case-insensitive Find.",
      "Replaces cell references with the controls, variables, or columns you list.",
      "Never guesses silently. Anything it can't translate is left as written and listed under Finish by hand."
    ],
    examples: [
      {
        title: "A lookup",
        problem: "Excel looks up a value in a range by position. Power Fx looks up a record in a table by column name.",
        code: `// Excel
=VLOOKUP(A2, Rates!A:B, 2, FALSE)

// Power Fx
LookUp(Rates, Region = cmbRegion.Selected.Value, Rate)`,
        expectedResult: "The tool writes LookUp(YourTable, KeyColumn = ..., ResultColumn). You replace the three names with your table and its columns.",
        commonMistakes: ["Looking for a column number. Power Fx uses the column's name instead.", "Using LookUp for approximate matches. It only matches exactly."]
      },
      {
        title: "A conditional total",
        problem: "SUMIF takes ranges. Power Fx filters a table first, then sums a column.",
        code: `// Excel
=SUMIF(C:C, "Approved", D:D)

// Power Fx
Sum(Filter(Requests, Status = "Approved"), Amount)`,
        expectedResult: "The total of Amount for approved requests.",
        commonMistakes: ["Running this against a large SharePoint list. Sum isn't delegated there, so only the first rows are added up."]
      },
      {
        title: "Days between two dates",
        problem: "DATEDIF and DAYS both become DateDiff, which takes the start date first.",
        code: `// Excel
=DATEDIF(A2, B2, "d")

// Power Fx
DateDiff(dpStart.SelectedDate, dpEnd.SelectedDate, TimeUnit.Days)`,
        expectedResult: "The number of whole days between the two dates.",
        commonMistakes: ["Keeping the Excel order for DAYS, which takes the end date first."]
      }
    ],
    relatedPatterns: ["calculate-totals-gallery-collection", "avoid-delegation-warnings-sharepoint-filters", "delegation-safe-date-range-filter"],
    relatedTools: ["power-fx-formatter", "csv-to-power-fx-table"],
    faqs: [
      {
        question: "Is Power Fx the same as Excel formulas?",
        answer: "It is based on Excel, and many functions have the same names and arguments. The big difference is data: Excel works with cells and ranges, and Power Fx works with controls, variables, and tables with named columns. That's why lookups and conditional totals need to be rewritten, not just renamed."
      },
      {
        question: "What do I put in the cell references box?",
        answer: "One line per cell, such as B2 = Value(txtAmount.Text). Use whatever holds that value in your app: a control property, a variable, or a column such as ThisItem.Amount. Cells you don't list are left in the result and named in the notes."
      },
      {
        question: "Which functions aren't translated?",
        answer: "Functions that depend on the grid, such as OFFSET, INDIRECT, INDEX, and MATCH, have no direct equivalent. The tool leaves them as written and tells you. INDEX with MATCH is usually replaced by a single LookUp."
      },
      {
        question: "My Excel uses semicolons between arguments. Does that work?",
        answer: "Yes for the input. Semicolons are read as argument separators. The result uses commas. If your Power Apps region uses semicolons, convert it with the semicolon option in the Power Fx Formatter."
      },
      {
        question: "Is my formula sent anywhere?",
        answer: "No. The translation runs in your browser, and nothing you paste is uploaded or stored."
      }
    ]
  }),
  item({ slug: "dataverse-table-naming-helper", kind: "tool", title: "Dataverse Table Naming Helper", eyebrow: "Free tool", description: "Generate consistent Dataverse schema and logical names for tables, columns, and relationships from your publisher prefix, before names are locked in.", keywords: ["Dataverse naming", "Dataverse table design", "solution publisher prefix"], audience: "Developers planning Dataverse data models.", summaryBullets: ["Enter your publisher prefix and a table name to get display, plural, schema and logical names.", "Column and relationship names follow the same prefix and casing.", "Schema names are permanent, so settle them before creating the table.", "Copy the names into your data model notes or straight into the maker portal."], examples: [{ title: "Naming worksheet", problem: "Design names before tables are created.", code: `Publisher prefix: bv
Table display name: Service Request
Schema name: bv_ServiceRequest
Primary column: bv_RequestName
Relationship: bv_Customer_ServiceRequests`, expectedResult: "The data model stays consistent across apps, flows, and solutions.", commonMistakes: ["Changing schema names late", "Using generic table names", "Ignoring relationship names"] }], relatedPatterns: ["solution-publisher-prefix-naming-standard", "patch-dataverse-lookup-and-choice-columns"] }),
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
      "Compares dates with ticks() so date and time formats don't matter, and checks for an empty date first so the condition can't fail.",
      "Groups rules in brackets, such as (Status is Open or In Review) and Urgent is Yes.",
      "Can add a loop guard that ignores changes made by the flow's own account.",
      "Shows how to run only when a column changes: Select columns for Dataverse, and Get changes for SharePoint."
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
  item({
    slug: "onstart-to-named-formulas",
    kind: "tool",
    title: "App.OnStart to Named Formulas Converter",
    eyebrow: "Free tool",
    description: "Convert Power Apps App.OnStart code into named formulas for App.Formulas. Moves Set and ClearCollect statements that only calculate values, keeps actions in OnStart, and explains every statement it leaves behind.",
    keywords: ["Power Apps named formulas", "App.Formulas", "App.OnStart to named formulas", "Power Apps OnStart slow", "convert Set to named formula"],
    audience: "Makers with a long App.OnStart who want the app to open faster and the startup logic to be easier to maintain.",
    summaryBullets: [
      "Turns Set(name, value) into name = value; when the value is only calculated, never changed.",
      "Can turn ClearCollect of static data into a read-only named formula.",
      "Keeps anything that changes data or state in OnStart, such as Patch, Collect, Navigate, and flow calls.",
      "Keeps values that must be captured once, such as Now() and Rand().",
      "Unwraps Concurrent() and rebuilds it around the statements that stay."
    ],
    examples: [
      {
        title: "Before and after",
        problem: "OnStart runs every statement before the first screen appears, even for values a user may never need.",
        code: `// App.OnStart, before
Set(varCurrentUser, LookUp(Employees, Email = Lower(User().Email)));
Set(varIsLoading, false);
Navigate(HomeScreen)

// App.Formulas, after
varCurrentUser = LookUp(Employees, Email = Lower(User().Email));

// App.OnStart, after
Set(varIsLoading, false);
Navigate(HomeScreen)`,
        expectedResult: "varCurrentUser is only looked up when a screen first uses it, and it stays up to date on its own.",
        commonMistakes: ["Converting a variable that is Set again later in the app. Named formulas can't be reassigned.", "Leaving the old Set in OnStart as well, which causes a name conflict."]
      },
      {
        title: "Use StartScreen instead of Navigate",
        problem: "Navigate in OnStart is a common reason OnStart can't be emptied. App.StartScreen does the same job without blocking startup.",
        code: `// App.StartScreen
If(varIsAdmin, AdminScreen, HomeScreen)`,
        expectedResult: "The app opens on the right screen, and varIsAdmin can be a named formula.",
        commonMistakes: ["Calling Navigate in App.StartScreen. It takes a screen, not an action."]
      }
    ],
    relatedPatterns: ["power-apps-error-handling-iferror-patch", "calculate-totals-gallery-collection"],
    relatedTools: ["power-fx-formatter", "csv-to-power-fx-table", "power-apps-color-token-generator"],
    faqs: [
      {
        question: "What is a named formula?",
        answer: "A named formula is a name with a formula attached, written in App.Formulas as Name = Formula;. Power Apps works out the value when it is first needed and keeps it current when the data behind it changes. Unlike a variable, you can't assign it a new value with Set."
      },
      {
        question: "How do I know a variable is safe to convert?",
        answer: "It is safe when the app only reads it. Search the app for Set( followed by the variable name. If the only match is in OnStart, it can become a named formula. This tool can only see the code you paste, so it can't check the rest of the app for you."
      },
      {
        question: "Why are Now() and Rand() left in OnStart?",
        answer: "Set captures the value once. A named formula can be worked out again later, so a start time or a random number could change while the app is open."
      },
      {
        question: "Can a collection be a named formula?",
        answer: "Yes, when it is only read. The named formula returns a table you can use in galleries and dropdowns. If the app uses Collect, Patch, Remove, or Clear on it, keep it as a collection."
      },
      {
        question: "Is my formula sent anywhere?",
        answer: "No. The conversion runs in your browser, and nothing you paste is uploaded or stored."
      }
    ]
  }),
  item({ slug: "adaptive-card-preview-snippets", kind: "tool", title: "Adaptive Card Builder for Teams", eyebrow: "Free tool", description: "Build Teams Adaptive Card JSON for approval, notification, and review flows. Edit the text, facts, and buttons, preview the layout, and copy the payload into Power Automate.", keywords: ["Adaptive Card snippets", "Teams card Power Automate", "approval card"], audience: "Flow builders who send Teams cards from Power Automate.", summaryBullets: ["Start from an approval, notification or review layout.", "Edit the heading, message, facts and buttons and see the preview change.", "Add a dropdown, a date picker or a comment box, and put the message and facts side by side.", "Copy the JSON into Post card in a chat or channel, or Post adaptive card and wait for a response.", "Copy the expressions that read the button, dropdown, date and comment from the response."], examples: [{ title: "Fact block", problem: "Show scannable request metadata.", code: `{ "type": "FactSet", "facts": [
  { "title": "Request", "value": "@{triggerBody()?['Title']}" },
  { "title": "Owner", "value": "@{triggerBody()?['Author']?['Email']}" }
] }`, expectedResult: "Teams cards remain compact and readable.", commonMistakes: ["Testing only in desktop Teams", "Forgetting JSON escaping", "Using too many facts"] }], relatedPatterns: ["post-adaptive-card-and-wait-for-response", "adaptive-card-fact-set-from-sharepoint-items"] }),
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
  item({ slug: "power-apps-color-token-generator", kind: "tool", title: "Power Apps Color Token Generator", eyebrow: "Free tool", description: "Turn brand hex colors into Power Fx color tokens. Enter your colors, then copy named formulas or variables to use across screens and components.", keywords: ["Power Apps colors", "Power Apps theme", "RGBA Power Fx"], audience: "Makers standardizing app colors across screens and components.", summaryBullets: ["Enter hex values from your brand guide, one per line with a name, to get RGBA formulas.", "Copy the set as named formulas, one theme record, or Set() variables.", "Reference the token names in Fill, Color and BorderColor so a brand change is one edit.", "See whether white or black text meets WCAG AA contrast on each color before you ship."], examples: [{ title: "Color token pattern", problem: "Avoid hardcoded colors throughout screens.", code: `// App.Formulas
ColorPrimary = RGBA(15, 118, 110, 1);
ColorSurface = RGBA(255, 255, 255, 1);
ColorDanger = RGBA(185, 28, 28, 1);

// On a button
Fill = ColorPrimary`, expectedResult: "Makers update color choices in one place instead of editing each control.", commonMistakes: ["Hardcoding colors in every property", "Ignoring contrast", "Using color names that describe hue instead of purpose"] }], relatedPatterns: ["power-apps-accessible-status-text", "power-apps-componentized-header-pattern"] }),
  item({
    slug: "sharepoint-column-formatting-builder",
    kind: "tool",
    title: "SharePoint Column Formatting JSON Builder",
    eyebrow: "Free tool",
    description: "Build SharePoint list column formatting JSON without writing it by hand. Create status pills, due date highlights, progress bars, email links for people, and a button that opens the item in a Power Apps app.",
    keywords: ["SharePoint column formatting JSON", "SharePoint JSON formatting", "SharePoint status pill JSON", "SharePoint progress bar column", "open Power Apps from SharePoint list"],
    audience: "Makers who use SharePoint lists behind Power Apps and Power Automate and want the list itself to be easy to scan.",
    summaryBullets: [
      "Seven layouts that cover the most common list needs: status, multiple choices, whole-row colors, due date, progress, person, and an app button.",
      "Status pills take your own values and colors, with a grey fallback for anything else. Multi-select choice columns get one pill per value.",
      "Row formatting colors the whole row in a view, using SharePoint's built-in highlight colors.",
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
  item({
    slug: "power-apps-delegation-checker",
    kind: "tool",
    title: "Power Apps Delegation Checker by Data Source",
    eyebrow: "Free tool",
    description: "Check a Power Apps formula for delegation problems against SharePoint, Dataverse, SQL Server, or Excel. See which functions and operators are delegated for your data source, what the limits are, and how to rewrite the ones that aren't.",
    keywords: ["Power Apps delegation", "delegation warning Power Apps", "SharePoint delegation", "Dataverse delegation", "Power Apps 2000 row limit"],
    audience: "Makers whose apps work in testing and then miss records once the list grows past 500 (or the data row limit you set, up to 10,000) rows, and anyone who wants to check a formula before it reaches production.",
    summaryBullets: [
      "Checks the formula against the data source you pick, because each source delegates a different set of functions.",
      "Flags functions applied to a column inside Filter, LookUp, and CountIf, and skips ones applied to a value such as User().Email or a text box.",
      "Covers Search, the in and ! operators, IsBlank, text functions, aggregates, FirstN and LastN, and table shaping functions.",
      "Separates hard problems from limits, such as Dataverse aggregates that stop at 50,000 rows.",
      "Includes a reference table of what each data source delegates."
    ],
    examples: [
      {
        title: "One formula, different results",
        problem: "Search is sent to Dataverse and SQL Server, but SharePoint can't run it.",
        code: `// Not delegated to SharePoint
Search(Requests, txtSearch.Text, "Title")

// Delegated to SharePoint
Filter(Requests, StartsWith(Title, txtSearch.Text))`,
        expectedResult: "On SharePoint, the second formula searches the whole list instead of the first 500 to 10,000 rows.",
        commonMistakes: ["Testing with a small list, where the problem never shows.", "Raising the data row limit to 10,000 and calling it fixed."]
      },
      {
        title: "Move the work off the column",
        problem: "A function applied to a column has to run on every row, so the data source can't do the filtering.",
        code: `// Not delegated: Year() runs on every row
Filter(Requests, Year(Created) = 2026)

// Delegated: the column is compared with fixed dates
Filter(
    Requests,
    Created >= Date(2026, 1, 1) && Created < Date(2027, 1, 1)
)`,
        expectedResult: "The data source returns only the rows from 2026.",
        commonMistakes: ["Wrapping the column in Text() or Value() to make the types match. Convert the other side instead."]
      }
    ],
    relatedPatterns: ["avoid-delegation-warnings-sharepoint-filters", "delegation-safe-date-range-filter", "use-odata-filters-sharepoint-text-fields"],
    relatedTools: ["power-fx-formatter", "odata-filter-query-builder"],
    faqs: [
      {
        question: "What is delegation?",
        answer: "Delegation means Power Apps hands the filtering, sorting, or totalling to the data source, which returns only the rows you need. When a formula can't be delegated, Power Apps downloads the first 500 rows (10,000 at most, if you raise the limit) and works on those. Rows beyond that are ignored without an error."
      },
      {
        question: "How is this different from the check in the Power Fx Formatter?",
        answer: "Both use the same rules. The formatter shows the findings while it formats your formula. This tool adds the full support table for each data source, so you can see what is delegated before you write the formula."
      },
      {
        question: "How accurate is it?",
        answer: "The support table was checked row by row against Microsoft's delegation tables for SharePoint, Dataverse and SQL Server in November 2026. The tool reads your formula as text, so it can't see your column types, and connectors change over time. Treat it as a first pass and confirm with the warning triangle in Power Apps Studio."
      },
      {
        question: "Why isn't Lower(User().Email) flagged?",
        answer: "It doesn't depend on the row, so Power Apps works it out once and sends the result to the data source. Only functions applied to a column are a problem. The tool recognizes User(), literals, and controls or variables named with a common prefix such as txt or var."
      },
      {
        question: "Does delegation matter for collections?",
        answer: "No. A collection is already in the app's memory, so every function works on all of its rows. The limit applies when the collection is filled: ClearCollect loads at most the data row limit from a data source, so use a delegated Filter inside it to bring back the right rows."
      },
      {
        question: "Is my formula sent anywhere?",
        answer: "No. The check runs in your browser, and nothing you paste is uploaded or stored."
      }
    ]
  }),
  item({
    slug: "patch-formula-builder",
    kind: "tool",
    title: "Power Apps Patch Formula Builder for SharePoint and Dataverse",
    eyebrow: "Free tool",
    description: "Build a Power Apps Patch formula for SharePoint or Dataverse. List the columns and the controls they come from, and get the right record shape for choice, person, lookup, multi-choice, date and yes/no columns, wrapped in IfError.",
    keywords: ["Power Apps Patch formula", "Patch SharePoint person column", "Patch choice column Power Apps", "Patch lookup column", "Patch Dataverse choice"],
    audience: "Makers who save data with Patch instead of a form, and anyone whose Patch fails on a choice, person or lookup column.",
    summaryBullets: [
      "Create a record, update the one selected in a gallery, or update one found by its ID.",
      "Writes the record shape each column type needs, which differs between SharePoint and Dataverse.",
      "Reads the value from the control's right property, such as Text, Selected or SelectedDate, based on the control's prefix.",
      "Wraps the save in IfError so the user sees the data source's own reason when it fails.",
      "Can keep the saved record in a variable and clear the controls after a successful save."
    ],
    examples: [
      {
        title: "Choice and person columns on SharePoint",
        problem: "SharePoint expects a record for a choice and a claims record for a person, not plain text.",
        code: `Patch(
    Requests,
    Defaults(Requests),
    {
        Title: txtTitle.Text,
        Status: { Value: "Submitted" },
        'Assigned To': {
            Claims: "i:0#.f|membership|" & Lower(User().Email),
            DisplayName: User().FullName,
            Email: Lower(User().Email),
            Department: "",
            JobTitle: "",
            Picture: ""
        }
    }
)`,
        expectedResult: "A new item is created with the status set and the current user in Assigned To.",
        commonMistakes: ["Setting a choice column to text, such as Status: \"Submitted\".", "Leaving out Claims on a person column."]
      },
      {
        title: "The same columns on Dataverse",
        problem: "Dataverse takes the choice itself and a row from the Users table.",
        code: `Patch(
    Requests,
    Defaults(Requests),
    {
        Title: txtTitle.Text,
        Status: 'Status (Requests)'.Submitted,
        'Assigned To': LookUp(Users, 'Primary Email' = User().Email)
    }
)`,
        expectedResult: "A new row is created with the choice and the user set.",
        commonMistakes: ["Copying a SharePoint record shape such as { Value: \"Submitted\" } into a Dataverse Patch."]
      }
    ],
    relatedPatterns: ["patch-sharepoint-choice-field", "patch-sharepoint-lookup-field", "patch-sharepoint-people-picker-power-apps", "patch-dataverse-lookup-and-choice-columns", "power-apps-error-handling-iferror-patch"],
    relatedTools: ["power-fx-formatter", "gallery-search-filter-builder"],
    faqs: [
      {
        question: "Why does my Patch say a choice or person column has the wrong type?",
        answer: "SharePoint stores choices, people and lookups as records, so Patch needs a record such as { Value: \"Approved\" } for a choice and a record with Claims for a person. Dataverse takes the choice itself and a row from the related table. Pick the data source and column type in the tool to get the shape that fits."
      },
      {
        question: "Should I use Patch or SubmitForm?",
        answer: "SubmitForm is simpler when the screen is a form bound to one data source, because the form handles validation and column types. Use Patch when you save from controls outside a form, save to more than one place, or need to set columns the user doesn't see."
      },
      {
        question: "How does the tool know which property of a control to use?",
        answer: "It reads the control's name prefix: txt for text inputs, cmb or drp for combo boxes and dropdowns, dp for date pickers, and tgl or chk for toggles and checkboxes. If your controls use other names, type the full value, such as TextInput1.Text."
      },
      {
        question: "Why can't I save ID, Created or Modified?",
        answer: "The data source sets those columns itself. The tool warns you if you add one. This also explains a common error: patching a whole record from a gallery sends those read-only columns back."
      },
      {
        question: "Is my formula sent anywhere?",
        answer: "No. The formula is built in your browser, and nothing you type is uploaded or stored."
      }
    ]
  }),
  item({
    slug: "error-message-finder",
    kind: "tool",
    title: "Power Platform Error Message Finder",
    eyebrow: "Free tool",
    description: "Paste a Power Automate, Power Apps, Dataverse or solution import error message and find the page that explains it and how to fix it. Names, IDs and GUIDs in the message are ignored.",
    keywords: ["Power Automate error message", "Power Apps error lookup", "flow failed error meaning", "Power Platform error codes", "Dataverse error code"],
    audience: "Anyone looking at a failed flow run, a red banner in an app, or a failed solution import who wants the fix without searching.",
    summaryBullets: [
      "Matches the whole message against every page in the BuilderVault error library.",
      "Ignores the parts that change every time, such as action names in quotes, IDs, GUIDs, emails and links.",
      "Finds the specific reason inside a general message, such as the function named inside an InvalidTemplate error.",
      "Recognizes error codes such as 0x80040220 and explains HTTP status codes such as 401, 403, 404 and 429.",
      "Shows the short answer from each matching page, with a link to the full fix."
    ],
    examples: [
      {
        title: "A flow error inside a general message",
        problem: "Power Automate puts the real reason after the general InvalidTemplate text.",
        code: `Unable to process template language expressions in action 'Compose' inputs at line '0' and column '0': 'The template language function 'split' expects its first parameter to be of type string. The provided value is of type 'Null'.'`,
        expectedResult: "The finder ranks the page for the null value first, and the general InvalidTemplate page after it.",
        commonMistakes: ["Searching only for the first line, which is the same for dozens of different problems."]
      }
    ],
    relatedPatterns: [],
    relatedTools: ["power-automate-expression-builder", "parse-json-schema-generator"],
    faqs: [
      {
        question: "Which errors does the finder know?",
        answer: "Every page in the BuilderVault error library: Power Automate flow and approval errors, connection and sign-in errors, Power Apps formula and save errors, solution imports, Dataverse, desktop flows and Power Pages. The library grows over time, and the finder uses all of it."
      },
      {
        question: "What should I paste?",
        answer: "The full error text. In a failed flow run, open the failed action and copy the message from its outputs, because the banner at the top often shows only the general part. You don't need to remove names, IDs or links."
      },
      {
        question: "What if nothing matches?",
        answer: "Try pasting only the first sentence. If the message includes an HTTP status code, the finder still explains what the code means. You can also browse the error library by product."
      },
      {
        question: "Is the error I paste sent anywhere?",
        answer: "No. The library is loaded with the page and the search runs in your browser. Nothing you paste is uploaded or stored."
      }
    ]
  }),
  item({
    slug: "gallery-search-filter-builder",
    kind: "tool",
    title: "Power Apps Gallery Search and Filter Builder",
    eyebrow: "Free tool",
    description: "Build a delegation-friendly Items formula for a Power Apps gallery with a search box, dropdown filters, a my-items toggle, a date range and sorting. Each filter shows everything while it's empty. Works for SharePoint, Dataverse and SQL Server.",
    keywords: ["Power Apps gallery filter", "Power Apps search gallery", "filter gallery by dropdown", "Power Apps multiple filters", "gallery search SharePoint delegation"],
    audience: "Makers building a list screen with a search box and filters, especially on SharePoint, where the obvious formula stops finding rows once the list grows.",
    summaryBullets: [
      "Combines a search box, choice, text and lookup dropdowns, a my-items toggle, a yes/no toggle and a date range in one Items formula.",
      "Each filter is skipped while its control is empty or off, so users only narrow the list when they want to.",
      "On SharePoint the search uses StartsWith, which is delegated. On Dataverse and SQL Server it uses Search, which finds text anywhere.",
      "Also gives the Items for each dropdown, DelayOutput for the search box, and AllowEmptySelection for dropdowns.",
      "Notes which parts aren't delegated, such as Distinct for a dropdown's values."
    ],
    examples: [
      {
        title: "Search and filters on SharePoint",
        problem: "Search and the in operator aren't delegated to SharePoint, and a filter with nothing picked should show every item.",
        code: `Sort(
    Filter(
        Requests,
        StartsWith(Title, txtSearch.Text) &&
        (IsBlank(cmbStatus.Selected.Value) || Status.Value = cmbStatus.Selected.Value) &&
        (tglMyItems.Value = false || 'Assigned To'.Email = User().Email)
    ),
    Created,
    SortOrder.Descending
)`,
        expectedResult: "The gallery searches and filters the whole list, newest first, and shows everything while the filters are empty.",
        commonMistakes: ["Using Search on a SharePoint list, which only searches the first 500 items, or up to 10,000 if you raise the data row limit.", "Writing If(IsBlank(...), Requests, Filter(...)) for each filter, which grows quickly as filters are added."]
      }
    ],
    relatedPatterns: ["power-apps-search-with-multiple-fields", "avoid-delegation-warnings-sharepoint-filters", "delegation-safe-date-range-filter", "dataverse-delegation-filter-search-large-tables", "sort-gallery-by-column-header-power-apps"],
    relatedTools: ["power-apps-delegation-checker", "power-fx-formatter", "patch-formula-builder"],
    faqs: [
      {
        question: "Why does the SharePoint search only match the start of a column?",
        answer: "SharePoint can't run Search or the in operator, so Power Apps would only search the first 500 items, or up to 10,000 if you raise the data row limit. StartsWith is delegated, so it searches the whole list. If you need to match text anywhere, keep a smaller list or move the data to Dataverse."
      },
      {
        question: "How does a filter show everything when nothing is picked?",
        answer: "Each condition starts with a check on the control, such as IsBlank(cmbStatus.Selected.Value) || .... While the control is empty that part is true for every row, so the filter lets everything through. The check doesn't depend on the row, so the rest of the formula is still sent to the data source."
      },
      {
        question: "Why does the my-items toggle use = false instead of Not?",
        answer: "Both work the same, but the ! and Not operators are not delegated to SharePoint when they are applied to a column. Writing tglMyItems.Value = false keeps the formula easy to check in the delegation checker, which flags Not inside a filter."
      },
      {
        question: "Is my formula sent anywhere?",
        answer: "No. The formula is built in your browser, and nothing you type is uploaded or stored."
      }
    ]
  }),
  item({
    slug: "recurrence-schedule-planner",
    kind: "tool",
    title: "Power Automate Recurrence Schedule Planner",
    eyebrow: "Free tool",
    description: "Preview the next 10 runs of a Power Automate Recurrence trigger in your time zone and in UTC. Set the interval, frequency, start time, days, hours and minutes, see what daylight saving time does, and copy the trigger definition.",
    keywords: ["Power Automate recurrence trigger", "Power Automate schedule flow time zone", "recurrence trigger daylight saving", "Power Automate run every weekday", "scheduled cloud flow start time"],
    audience: "Anyone setting up a scheduled cloud flow who wants to know exactly when it will run before saving it, especially across time zones and daylight saving changes.",
    summaryBullets: [
      "Shows the next 10 run times in the trigger's time zone and in UTC.",
      "Covers Minute, Hour, Day, Week and Month, with days, hours and minutes for Day and Week schedules.",
      "Flags daylight saving changes, times between 2:00 and 3:00 AM, and months without the start day.",
      "Explains the documented rules: no start time means the first run is immediate, and a time zone only applies with a start time.",
      "Gives the trigger definition, so you can check it against Peek code in your flow."
    ],
    examples: [
      {
        title: "Weekdays at 9 AM Eastern Time",
        problem: "Run a report every weekday morning, at the same local time all year.",
        code: `{
  "type": "Recurrence",
  "recurrence": {
    "frequency": "Week",
    "interval": 1,
    "schedule": {
      "hours": [9],
      "minutes": [0],
      "weekDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    },
    "startTime": "2027-01-04T00:00:00",
    "timeZone": "Eastern Standard Time"
  }
}`,
        expectedResult: "The flow runs at 9:00 AM Eastern on weekdays. The UTC time moves by an hour when daylight saving starts and ends, so the local time doesn't.",
        commonMistakes: ["Leaving At these minutes empty, so the runs use the start time's minute.", "Leaving the time zone empty, so 9:00 means 9:00 UTC."]
      }
    ],
    relatedPatterns: [],
    relatedTools: ["date-format-tester", "trigger-condition-builder", "power-automate-expression-builder"],
    faqs: [
      {
        question: "Why did my scheduled flow run as soon as I saved it?",
        answer: "With no start time, the Recurrence trigger runs once straight away, then counts on from that run. Set a start time to control the first run."
      },
      {
        question: "Why does my scheduled flow run an hour early or late in summer?",
        answer: "The trigger has no time zone, so its times are UTC and don't move with daylight saving time. Select your time zone and a start time, and the trigger keeps the same local time all year."
      },
      {
        question: "Why does the start time need a Z at the end?",
        answer: "Only when no time zone is selected. The Z marks the time as UTC. With a time zone selected, leave the Z off, because Microsoft says a Z makes the trigger ignore the time zone."
      },
      {
        question: "How accurate is the preview?",
        answer: "It follows Microsoft's documented Recurrence rules. Microsoft notes runs can start up to a minute late, and simple schedules count from the last run, so they can drift. For schedules every two or more weeks, compare with the preview the trigger shows."
      },
      {
        question: "Is anything sent anywhere?",
        answer: "No. The run times are worked out in your browser."
      }
    ]
  }),
  item({ slug: "solution-layering-checklist-generator", kind: "tool", title: "Solution Layering Checklist Generator", eyebrow: "Free tool", description: "Build a deployment checklist for a Power Platform solution release. Choose what the release contains and copy a checklist covering layering, managed import, environment variables and connection references.", keywords: ["solution layering", "Power Platform ALM checklist", "managed solution import"], audience: "Developers and admins preparing releases across environments.", summaryBullets: ["Choose the components in your release to get a checklist that fits it.", "Covers export from development, import to test and production, and checks afterwards.", "Includes environment variables, connection references, flows and unmanaged layer checks.", "Copy the checklist into your release notes or work item."], examples: [{ title: "Deployment checklist", problem: "Prevent avoidable release failures.", code: `- Solution exported from clean dev environment
- Managed solution imported to test
- Environment variables reviewed
- Connection references rebound
- Cloud flows turned on
- Test user smoke test completed`, expectedResult: "Release owners have a repeatable preflight before production import.", commonMistakes: ["Exporting unmanaged changes accidentally", "Forgetting to enable flows", "Skipping test-user validation"] }], relatedPatterns: ["export-import-managed-solution-pac-cli", "power-platform-pipelines-dev-test-prod"] })
];

export const resourceGroups = [
  { slug: "cookbooks", title: "Cookbooks", eyebrow: "Copy-ready recipes", description: "Task-based recipes with problem statements, starter code, expected results, and common mistakes.", path: "/cookbooks", items: cookbooks },
  { slug: "standards", title: "Standards", eyebrow: "Team conventions", description: "Opinionated standards for naming, data design, ALM, error handling, and supportability.", path: "/standards", items: standards },
  { slug: "cheat-sheets", title: "Cheat Sheets", eyebrow: "Fast lookup", description: "Short, search-friendly references for common Power Platform formulas, expressions, and setup decisions.", path: "/cheat-sheets", items: cheatSheets },
  { slug: "tools", title: "Free Tools", eyebrow: "Builder utilities", description: "Browser tools for formulas, expressions, filter queries, naming, and deployment checks. Nothing you paste leaves your browser.", path: "/tools", items: tools }
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
