import type { PatternCategory, PatternPlatform } from "@/types/pattern";

type ImplementationInput = {
  category: PatternCategory;
  platform: PatternPlatform[];
  subCategory: string;
  title: string;
};

export function buildImplementationSnippet({
  category,
  platform,
  subCategory,
  title
}: ImplementationInput) {
  if (category === "Power Apps") {
    return buildPowerAppsSnippet(title, subCategory);
  }

  if (category === "Power Automate") {
    return buildPowerAutomateSnippet(title, subCategory);
  }

  if (category === "SharePoint") {
    return buildSharePointSnippet(title, subCategory);
  }

  if (category === "Dataverse") {
    return buildDataverseSnippet(title, subCategory);
  }

  if (category === "ALM & Governance") {
    return buildAlmSnippet(title);
  }

  if (category === "Power Platform Admin") {
    return buildAdminSnippet(title);
  }

  if (category === "Power Pages") {
    return buildPowerPagesSnippet(title);
  }

  if (category === "Teams & Adaptive Cards") {
    return buildAdaptiveCardSnippet(title);
  }

  return buildChecklistTemplate(title, platform);
}

export function buildStepInstructions({
  category,
  subCategory,
  title
}: ImplementationInput) {
  if (category === "Power Apps") {
    return [
      `Add the controls, variables, and data source references needed for ${title}.`,
      "Validate required fields before running Patch, Collect, or SubmitForm logic.",
      "Wrap the save behavior in IfError so users see success and failure feedback.",
      "Test with a new record, an existing record, blank optional values, and a failed connector call."
    ];
  }

  if (category === "Power Automate") {
    return [
      `Create or update the trigger for ${title} and add a trigger condition where possible.`,
      "Initialize tracking values such as SourceItemId, RunStatus, OwnerEmail, and ErrorMessage.",
      "Place core actions in a Try scope, failure handling in a Catch scope, and logging in a Finally scope.",
      "Run one happy-path test and one failure-path test, then confirm the source record is updated correctly."
    ];
  }

  if (category === "SharePoint") {
    return [
      `Create the list, library, view, or governance artifact for ${title}.`,
      "Use stable internal column names, clear required fields, and indexed views for common filters.",
      "Set list ownership, permission expectations, default views, and lifecycle review notes.",
      "Test the structure with Power Apps or Power Automate before treating it as production-ready."
    ];
  }

  if (category === "Dataverse") {
    return [
      `Define the Dataverse table, relationship, role, or solution element for ${title}.`,
      "Add columns, keys, views, forms, and security assumptions to a managed solution.",
      "Validate the design with a model-driven or canvas app scenario and one automation scenario.",
      "Document ownership, environment variables, migration notes, and support expectations."
    ];
  }

  if (category === "ALM & Governance") {
    return [
      `Add ${title} to the solution delivery checklist or governance review path.`,
      "Confirm environment, publisher, connection reference, and environment variable assumptions.",
      "Run the validation in a build/test environment before managed promotion.",
      "Record rollback, support owner, and release note details before production deployment."
    ];
  }

  if (category === "Power Platform Admin") {
    return [
      `Create the admin review artifact for ${title}.`,
      "Capture environment, owner, connector, risk, and policy fields in a structured inventory.",
      "Review exceptions with the platform owner and document the decision outcome.",
      "Schedule the next review cadence and define the support queue for follow-up."
    ];
  }

  if (category === "Power Pages") {
    return [
      `Map the portal user journey and Dataverse tables needed for ${title}.`,
      "Configure table permissions, web roles, forms, page templates, and validation messages.",
      "Test anonymous and authenticated access with realistic user roles.",
      "Document launch checks, ownership, and content publishing responsibilities."
    ];
  }

  if (category === "Teams & Adaptive Cards") {
    return [
      `Build the Adaptive Card payload and routing logic needed for ${title}.`,
      "Post the card from Power Automate to the correct chat, channel, or user.",
      "Parse the response and update the source record with outcome, responder, and timestamp.",
      "Test timeout, retry, duplicate response, and missing user scenarios."
    ];
  }

  return [
    `Define the purpose, owner, and expected output for ${title}.`,
    `Create the structured ${subCategory.toLowerCase()} template with required fields and decision points.`,
    "Review the template with a realistic example and one exception scenario.",
    "Document the support path, review cadence, and handoff expectations."
  ];
}

function buildPowerAppsSnippet(title: string, subCategory: string) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("gallery") || normalizedTitle.includes("dashboard") || normalizedTitle.includes("queue")) {
    return `// ${title}
// Use these formulas on the queue/dashboard screen.

// Screen.OnVisible
ClearCollect(
    colQueueStatuses,
    Table(
        { Label: "All", Value: Blank() },
        { Label: "New", Value: "New" },
        { Label: "In progress", Value: "In Progress" },
        { Label: "Blocked", Value: "Blocked" },
        { Label: "Complete", Value: "Complete" }
    )
);
Set(varSelectedStatus, "All");
Set(varSelectedPriority, "All");

// Gallery.Items
galQueue.Items =
SortByColumns(
    Filter(
        Requests,
        (varSelectedStatus = "All" || Status.Value = varSelectedStatus) &&
        (varSelectedPriority = "All" || Priority.Value = varSelectedPriority) &&
        (IsBlank(txtQueueSearch.Text) || StartsWith(Title, txtQueueSearch.Text))
    ),
    "Modified",
    SortOrder.Descending
);

// Summary labels
lblOpenCount.Text = CountRows(Filter(galQueue.AllItems, Status.Value <> "Complete"));
lblBlockedCount.Text = CountRows(Filter(galQueue.AllItems, Status.Value = "Blocked"));
lblHighPriorityCount.Text = CountRows(Filter(galQueue.AllItems, Priority.Value = "High"));

// Gallery.OnSelect
Set(varSelectedRequest, ThisItem);
Navigate(scrRequestDetail, ScreenTransition.Cover);`;
  }

  if (normalizedTitle.includes("filter")) {
    return `// ${title}
// Filter panel variables and gallery pattern.

// Screen.OnVisible
Set(varShowFilters, false);
Set(varStatusFilter, "All");
Set(varOwnerFilter, "All");
Set(varSearchText, Blank());

// Filter icon OnSelect
Set(varShowFilters, !varShowFilters);

// Reset filters OnSelect
Set(varStatusFilter, "All");
Set(varOwnerFilter, "All");
Reset(txtSearch);

// Gallery.Items
Filter(
    Requests,
    (varStatusFilter = "All" || Status.Value = varStatusFilter) &&
    (varOwnerFilter = "All" || Owner.Email = User().Email) &&
    (IsBlank(txtSearch.Text) || StartsWith(Title, txtSearch.Text))
)`;
  }

  if (normalizedTitle.includes("form") || normalizedTitle.includes("wizard") || normalizedTitle.includes("screen")) {
    return `// ${title}
// Use this as a screen/form state pattern.

// New button OnSelect
NewForm(frmRequest);
Set(varFormMode, "New");
Navigate(scrRequestForm, ScreenTransition.Cover);

// Edit button OnSelect
EditForm(frmRequest);
Set(varFormMode, "Edit");
Navigate(scrRequestForm, ScreenTransition.Cover);

// Save button OnSelect
If(
    frmRequest.Valid,
    SubmitForm(frmRequest),
    Notify("Review required fields before saving.", NotificationType.Warning)
);

// Form.OnSuccess
Set(varSelectedRequest, frmRequest.LastSubmit);
Notify("Request saved successfully.", NotificationType.Success);
Back();

// Form.OnFailure
Notify("Unable to save request: " & frmRequest.Error, NotificationType.Error);`;
  }

  if (normalizedTitle.includes("validation") || normalizedTitle.includes("required")) {
    return `// ${title}
// Use before calling Patch or SubmitForm.

Clear(colValidationErrors);
If(IsBlank(txtTitle.Text), Collect(colValidationErrors, { Message: "Title is required" }));
If(IsBlank(ddStatus.Selected.Value), Collect(colValidationErrors, { Message: "Status is required" }));
If(IsBlank(dpDueDate.SelectedDate), Collect(colValidationErrors, { Message: "Due date is required" }));

If(
    CountRows(colValidationErrors) > 0,
    Notify(Concat(colValidationErrors, Message, Char(10)), NotificationType.Warning),
    IfError(
        Patch(Requests, Coalesce(varSelectedRequest, Defaults(Requests)), frmRequest.Updates),
        Notify("Save failed: " & FirstError.Message, NotificationType.Error),
        Notify("Saved successfully.", NotificationType.Success)
    )
);`;
  }

  return `// ${title}
// Use on the primary Save, Submit, or action button.
Set(varSaving, true);
Set(varErrorMessage, Blank());
If(
    IsBlank(txtTitle.Text),
    Notify("Enter the required title before saving.", NotificationType.Warning),
    IfError(
        Patch(
            Requests,
            Coalesce(varSelectedRequest, Defaults(Requests)),
            {
                Title: txtTitle.Text,
                Status: { Value: ddStatus.Selected.Value },
                OwnerEmail: User().Email,
                PatternType: "${escapeSnippet(subCategory)}",
                LastAction: "${escapeSnippet(title)}"
            }
        ),
        Set(varErrorMessage, FirstError.Message);
        Notify("The record could not be saved: " & varErrorMessage, NotificationType.Error),
        Notify("Saved successfully.", NotificationType.Success)
    )
);
Set(varSaving, false);`;
}
function buildPowerAutomateSnippet(title: string, subCategory: string) {
  return `Power Automate implementation for ${title}:
1. Trigger: When an item is created or modified, When a row is added, or Power Apps (V2).
2. Trigger condition: @not(equals(triggerBody()?['Status']?['Value'], 'Draft'))
3. Try scope:
   - Get source record
   - Validate required fields
   - Execute ${escapeSnippet(subCategory)} actions
   - Update Status, LastProcessedOn, LastProcessedBy, and FlowRunUrl
4. Catch scope configured after Try has failed, timed out, or skipped:
   - Update ProcessingStatus = Failed
   - Store ErrorMessage = outputs('Compose_Error_Message')
   - Notify the support owner
5. Finally scope:
   - Append an audit row with SourceItemId, Outcome, RunId, and Timestamp`;
}

function buildSharePointSnippet(title: string, subCategory: string) {
  return `SharePoint configuration for ${title}:
List or library purpose: ${escapeSnippet(subCategory)}
Required columns:
- Title: Single line of text
- Status: Choice (Draft, Active, Blocked, Complete, Archived)
- Owner: Person
- DueDate: Date and time
- Priority: Choice (Low, Normal, High)
- SupportNotes: Multiple lines of text
Recommended views:
- Active items: Status is not Complete or Archived
- My ownership: Owner is [Me]
- Overdue: DueDate is before today and Status is not Complete
Governance notes:
- Keep internal names stable.
- Index Status, Owner, and DueDate for common filters.
- Document the site owner and backup owner before launch.`;
}

function buildDataverseSnippet(title: string, subCategory: string) {
  return `Dataverse design for ${title}:
Solution: BuilderVault Core
Table: bv_RequestPattern
Columns:
- bv_name: Text, required
- bv_status: Choice (Draft, Active, Blocked, Complete, Archived)
- bv_owner: Lookup to User or Team
- bv_priority: Choice (Low, Normal, High)
- bv_patterncategory: Text, default "${escapeSnippet(subCategory)}"
Security:
- Makers can create and update records they own.
- Support owners can read all active records.
- Admins can archive and reassign ownership.
Validation:
- Require owner before Active status.
- Prevent Complete status when required checklist rows are open.
ALM:
- Store table, choices, forms, views, and flows in one managed solution.`;
}

function buildAlmSnippet(title: string) {
  return `ALM checklist for ${title}:
- Solution name: bv_core_[feature]
- Publisher prefix confirmed before table or column creation
- Connection references created for SharePoint, Office 365 Users, Teams, and Dataverse
- Environment variables created for SiteUrl, ListName, SupportOwnerEmail, and FeatureFlag
- Unmanaged customizations reviewed before export
- Build validation completed in test
- Managed solution imported to production
- Rollback plan documented with previous solution version and owner
- Release notes include changed apps, flows, tables, and known support impacts`;
}

function buildAdminSnippet(title: string) {
  return `Power Platform admin review for ${title}:
Inventory fields:
- EnvironmentName
- AppOrFlowName
- OwnerEmail
- ConnectorList
- BusinessCriticality
- DataClassification
- PremiumConnectorUsed
- LastModifiedOn
- SupportQueue
Review actions:
1. Confirm owner and backup owner.
2. Check connector and DLP policy fit.
3. Flag orphaned or inactive assets.
4. Record exception decision and next review date.
5. Notify maker and support owner of required changes.`;
}

function buildPowerPagesSnippet(title: string) {
  return `Power Pages implementation for ${title}:
- Dataverse table selected for the portal scenario
- Site visibility and authentication mode confirmed
- Web roles mapped to user types
- Table permissions created with least privilege
- Basic form or multistep form configured with required validation
- Anonymous access reviewed before launch
- Content owner assigned for pages and navigation
- Launch checklist includes mobile test, permission test, and broken-link review`;
}

function buildAdaptiveCardSnippet(title: string) {
  return `Adaptive Card workflow for ${title}:
Trigger -> Get source record -> Compose card JSON -> Post card in Teams -> Wait for response -> Update source record

Card payload starter:
{
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    { "type": "TextBlock", "weight": "Bolder", "text": "${escapeSnippet(title)}" },
    { "type": "TextBlock", "wrap": true, "text": "Review the request and choose an outcome." }
  ],
  "actions": [
    { "type": "Action.Submit", "title": "Approve", "data": { "outcome": "Approved" } },
    { "type": "Action.Submit", "title": "Reject", "data": { "outcome": "Rejected" } }
  ]
}`;
}

function buildChecklistTemplate(title: string, platform: PatternPlatform[]) {
  return `Implementation template for ${title}:
Platforms: ${platform.join(", ")}
- Purpose: define the business outcome and primary user.
- Source of truth: name the app, list, table, flow, or workspace that owns the data.
- Required fields: owner, status, priority, due date, notes, and audit details.
- Normal path: document the expected happy-path steps.
- Exception path: document missing data, access issues, failed updates, and escalation.
- Support handoff: name the owner, backup owner, and review cadence.`;
}

function escapeSnippet(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

