import type { ResourceAddition } from "./resource-additions.ts";

const ex = (title: string, problem: string, code: string, expectedResult: string, commonMistakes: string[] = []) => ({
  title,
  problem,
  code,
  expectedResult,
  commonMistakes
});

const q = (question: string, answer: string) => ({ question, answer });

export const toolAdditions: Record<string, ResourceAddition> = {
  "sharepoint-internal-name-helper": {
    examples: [
      ex(
        "How SharePoint encodes characters",
        "Spaces and symbols in the name a column is created with are replaced by hexadecimal codes in the internal name.",
        `Created as           Internal name
Due Date             Due_x0020_Date
Cost (USD)           Cost_x0020__x0028_USD_x0029_
PO #                 PO_x0020__x0023_
Start/End            Start_x002f_End
% Complete           _x0025__x0020_Complete
2026 Budget          _x0032_026_x0020_Budget     (a leading digit is encoded)
Approver's Notes     Approver_x0027_s_x0020_Not  (cut off at 32 characters)`,
        "You can predict the internal name before creating the column.",
        ["Assuming the internal name follows later renames", "Long names with spaces, which are truncated and can collide"]
      ),
      ex(
        "Where the internal name is used",
        "Power Apps mostly shows display names, but flows, OData filters, JSON formatting and REST calls need the internal name.",
        `Power Automate filter query     Due_x0020_Date lt '2026-03-09'
Trigger outputs                 triggerOutputs()?['body/Due_x0020_Date']
Send an HTTP request            "Due_x0020_Date": "2026-03-09"
Column formatting JSON          [$Due_x0020_Date]
PnP PowerShell                  $item["Due_x0020_Date"]
Power Apps                      'Due Date'  (display name in single quotes), or Due_x0020_Date`,
        "Filters and expressions reference the right name the first time."
      ),
      ex(
        "Find the internal name of an existing column",
        "Three quick ways when the column already exists.",
        `List settings > select the column > read the URL:  ...&Field=Due_x0020_Date
Sort or filter the list by the column > read the URL: ...sortField=Due_x0020_Date
REST: <site>/_api/web/lists/getbytitle('Requests')/fields?$select=Title,InternalName,TypeAsString`,
        "No guessing when a flow action reports that a column does not exist.",
        ["Reading the display name from the list header"]
      ),
      ex(
        "Create clean, then rename",
        "Create the column with a short name that has no spaces, then change the display name to something friendly.",
        `1. Create column:  DueDate
2. Column settings > rename to:  Due date
Internal name stays DueDate. Display name shows Due date.

Avoid as names: Title, Name, Author, Editor, Created, Modified, ID, Status, Type, Order`,
        "Readable internal names that never need encoding."
      )
    ],
    faqs: [
      q("Can I change a column's internal name?", "No. It is fixed when the column is created. To change it, create a new column, copy the data across and remove the old one."),
      q("Why does my internal name end in a number, such as Status0?", "The name was already taken by a built-in or site column, so SharePoint added a suffix."),
      q("What does _x0020_ mean?", "It is the encoded form of a space. Each special character is replaced by _x followed by its four-digit hexadecimal code and an underscore.")
    ]
  },

  "power-automate-expression-builder": {
    examples: [
      ex(
        "Null-safe values",
        "Give optional fields a fallback so emails and conditions never see null.",
        `coalesce(triggerOutputs()?['body/Notes'], 'No notes')
if(empty(triggerOutputs()?['body/DueDate']), '', formatDateTime(triggerOutputs()?['body/DueDate'], 'd MMMM yyyy'))
coalesce(triggerOutputs()?['body/Amount'], 0)`,
        "Actions do not fail or print blank lines when a field is empty.",
        ["Leaving out the ? before a property that may not exist"]
      ),
      ex(
        "Dates",
        "Format, shift and convert dates.",
        `formatDateTime(utcNow(), 'yyyy-MM-dd')
convertFromUtc(utcNow(), 'GMT Standard Time', 'dd/MM/yyyy HH:mm')
addDays(utcNow(), 7, 'yyyy-MM-dd')
startOfMonth(utcNow())
div(sub(ticks(variables('varEnd')), ticks(variables('varStart'))), 864000000000)`,
        "Dates display in local time and calculations use real date values."
      ),
      ex(
        "Arrays",
        "Count, pick, join and de-duplicate without a loop.",
        `length(body('Get_items')?['value'])
first(body('Get_items')?['value'])?['Title']
join(body('Select'), '; ')
union(body('Select'), body('Select'))
contains(body('Select'), 'Finance')`,
        "Common list questions are answered in one expression."
      ),
      ex(
        "Conditions",
        "Return one of two values, or combine tests.",
        `if(greater(triggerOutputs()?['body/Amount'], 1000), 'Director', 'Manager')
and(equals(triggerOutputs()?['body/Status/Value'], 'Approved'), not(empty(triggerOutputs()?['body/ApprovedBy'])))
or(equals(variables('varPriority'), 'High'), equals(variables('varIsUrgent'), true))`,
        "Simple branching without adding a Condition action.",
        ["Comparing a number with a quoted value"]
      )
    ],
    faqs: [
      q("How do I add an expression to a flow action?", "Select the field, open the expression editor with the fx button or the Expression tab, paste the expression and select Add."),
      q("Why does my expression show as text in the output?", "It was typed into the field directly. Remove it and add it through the expression editor so it is evaluated."),
      q("Do expressions need an @ sign?", "Only in trigger conditions and when written inline in code view. In the expression editor, leave the @ off.")
    ]
  },

  "dataverse-table-naming-helper": {
    examples: [
      ex(
        "Display, schema and logical names",
        "Each table and column has three names. Only the display name can be changed later.",
        `Display name     Service Request        shown to users, can be changed
Plural name      Service Requests       shown in navigation, can be changed
Schema name      cnt_ServiceRequest     prefix + PascalCase, fixed at creation
Logical name     cnt_servicerequest     schema name in lower case, used by the Web API, flows and code
Entity set name  cnt_servicerequests    used in Web API URLs and the Dataverse connector`,
        "You know which name to use in each tool.",
        ["Plural schema names", "Accepting the generated name after typing a long display name"]
      ),
      ex(
        "Columns",
        "Name the column for what it holds. Lookups are named for the row they point to.",
        `Due date            cnt_DueDate
Is urgent           cnt_IsUrgent           (Yes/No reads as a question)
Priority            cnt_Priority           (choice)
Account             cnt_Account            (lookup: no "Id" or "Lookup" suffix)
Assigned team       cnt_AssignedTeam
Request number      cnt_RequestNumber      (autonumber, alternate key)
Total amount        cnt_TotalAmount        (currency)`,
        "Column names are readable in formulas, flows and reports."
      ),
      ex(
        "Relationships",
        "Relationship schema names should say which tables are linked and how.",
        `One-to-many    cnt_Account_cnt_ServiceRequest          parent_child
Second lookup to the same table: add the role
               cnt_Account_cnt_ServiceRequest_BillingAccount
Many-to-many   cnt_ServiceRequest_cnt_Asset
Intersect table for a manual many-to-many: cnt_ServiceRequestAsset`,
        "Relationships can be recognised in the solution and in Web API queries."
      ),
      ex(
        "Where each name is used",
        "The same column appears under different names depending on the tool.",
        `Canvas app (Power Fx)        'Due date'  or  cnt_duedate
Power Automate dynamic value Due date
Power Automate expression    triggerOutputs()?['body/cnt_duedate']
Filter rows (OData)          cnt_duedate lt 2026-03-09
Lookup in OData              _cnt_account_value eq <guid>
Set a lookup in a flow       accounts(<guid>)
Web API                      /api/data/v9.2/cnt_servicerequests?$select=cnt_duedate`,
        "Filters and expressions use the right name the first time.",
        ["Using the schema name with capitals in an OData filter", "Forgetting the _value suffix when filtering on a lookup"]
      )
    ],
    faqs: [
      q("Can I rename a Dataverse table or column?", "You can change display names at any time. Schema and logical names are permanent."),
      q("What prefix should I use?", "The prefix of your own solution publisher, three to eight lower-case letters that identify your organisation or product. Do not build with the default new_ or cr prefixes."),
      q("Why is the lookup column called _cnt_account_value in a flow?", "That is how the Web API exposes the GUID stored in a lookup column. Use it for filtering, and the navigation property for setting the value.")
    ]
  },

  "adaptive-card-preview-snippets": {
    examples: [
      ex(
        "Notification card",
        "A heading, a short message, key facts and a button that opens the record.",
        `{
  "type": "AdaptiveCard", "version": "1.4",
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "body": [
    { "type": "TextBlock", "text": "New high priority request", "weight": "Bolder", "size": "Medium", "wrap": true },
    { "type": "TextBlock", "text": "Laptop replacement for Dana Lee", "wrap": true },
    { "type": "FactSet", "facts": [
      { "title": "Requested by", "value": "Dana Lee" },
      { "title": "Needed by", "value": "9 March 2026" }
    ] }
  ],
  "actions": [ { "type": "Action.OpenUrl", "title": "Open request", "url": "https://contoso.sharepoint.com/sites/requests" } ]
}`,
        "A compact card for Post card in a chat or channel.",
        ["No wrap on long text", "More than three or four buttons"]
      ),
      ex(
        "Approval card with comments",
        "For Post adaptive card and wait for a response. The flow continues when someone submits.",
        `"body": [
  { "type": "TextBlock", "text": "Approve purchase request?", "weight": "Bolder", "wrap": true },
  { "type": "FactSet", "facts": [ { "title": "Amount", "value": "1,250.00" }, { "title": "Supplier", "value": "Contoso Ltd" } ] },
  { "type": "Input.Text", "id": "comments", "label": "Comments", "isMultiline": true }
],
"actions": [
  { "type": "Action.Submit", "title": "Approve", "style": "positive", "data": { "decision": "Approve" } },
  { "type": "Action.Submit", "title": "Reject", "style": "destructive", "data": { "decision": "Reject" } }
]

In the flow:
body('Post_adaptive_card_and_wait_for_a_response')?['data']?['decision']
body('Post_adaptive_card_and_wait_for_a_response')?['data']?['comments']`,
        "The decision and comments come back to the flow as named values."
      ),
      ex(
        "Insert flow values",
        "Replace sample text with dynamic content or expressions inside the JSON.",
        `{ "type": "TextBlock", "text": "@{triggerOutputs()?['body/Title']}", "wrap": true }
{ "title": "Requested by", "value": "@{triggerOutputs()?['body/Author/DisplayName']}" }
{ "title": "Needed by", "value": "@{formatDateTime(triggerOutputs()?['body/DueDate'], 'd MMMM yyyy')}" }
{ "type": "Action.OpenUrl", "title": "Open request", "url": "@{triggerOutputs()?['body/{Link}']}" }`,
        "Each card shows the details of the item that triggered the flow.",
        ["Free text containing quotes or line breaks inserted without escaping"]
      ),
      ex(
        "Update the card after a decision",
        "Replace the original card so the buttons cannot be used twice.",
        `1. Post card in a chat or channel            keep the Message ID from its output
2. ... wait for the decision ...
3. Update an adaptive card in a chat or channel
     Message ID: outputs('Post_card')?['body/id']
     Adaptive Card: the same layout without actions, with a line such as
       { "type": "TextBlock", "text": "Approved by Sam Patel on 9 March 2026", "color": "Good", "wrap": true }

Post adaptive card and wait for a response has an "Update message" field that does this in one step.`,
        "The channel shows the outcome, and old buttons are gone."
      )
    ],
    faqs: [
      q("Which Power Automate action sends an Adaptive Card?", "Use Post card in a chat or channel for information, and Post adaptive card and wait for a response when the flow needs an answer."),
      q("Why does Teams show 'We're sorry, this card couldn't be displayed'?", "The JSON is invalid or uses a feature the client does not support. Validate it in the Adaptive Cards Designer with the Teams host selected, and use version 1.4."),
      q("Can a card be posted as a person instead of Flow bot?", "Yes. Choose Post as User. Cards that wait for a response must be posted as Flow bot.")
    ]
  },

  "power-apps-color-token-generator": {
    examples: [
      ex(
        "Named formulas for a theme",
        "Define each colour once in App.Formulas and reference the name everywhere.",
        `nfColorPrimary      = ColorValue("#0F766E");
nfColorPrimaryDark  = ColorFade(nfColorPrimary, -0.2);
nfColorPrimaryLight = ColorFade(nfColorPrimary, 0.8);
nfColorText         = ColorValue("#1F2937");
nfColorTextMuted    = ColorValue("#6B7280");
nfColorSurface      = ColorValue("#FFFFFF");
nfColorBackground   = ColorValue("#F3F4F6");
nfColorBorder       = ColorValue("#D1D5DB");
nfColorSuccess      = ColorValue("#15803D");
nfColorWarning      = ColorValue("#B45309");
nfColorError        = ColorValue("#B91C1C");`,
        "Changing a brand colour is a one-line edit.",
        ["Typing RGBA values into every control", "Set() in OnStart for values that never change"]
      ),
      ex(
        "One theme record",
        "Group colours and sizes in a record when you prefer a single name to pass to components.",
        `nfTheme = {
    Primary: ColorValue("#0F766E"),
    OnPrimary: Color.White,
    Text: ColorValue("#1F2937"),
    Surface: Color.White,
    Border: ColorValue("#D1D5DB"),
    Radius: 6,
    FontSize: 11
};

// btnSave.Fill   : nfTheme.Primary
// btnSave.Color  : nfTheme.OnPrimary
// btnSave.RadiusTopLeft : nfTheme.Radius`,
        "Components take one Theme input instead of a dozen colour properties."
      ),
      ex(
        "Button states",
        "Derive hover, pressed and disabled colours from the base colour so the states stay consistent.",
        `btnSave.Fill           : nfColorPrimary
btnSave.HoverFill      : ColorFade(nfColorPrimary, -0.1)
btnSave.PressedFill    : ColorFade(nfColorPrimary, -0.2)
btnSave.DisabledFill   : ColorFade(nfColorPrimary, 0.6)
btnSave.Color          : Color.White
btnSave.BorderColor    : nfColorPrimaryDark
btnSave.FocusedBorderColor     : nfColorText
btnSave.FocusedBorderThickness : 2`,
        "Every button reacts the same way, and focus is visible for keyboard users."
      ),
      ex(
        "Status colours and contrast",
        "Map status values to colours in one formula, and check text is readable against its background.",
        `// lblStatus.Fill
Switch(
    ThisItem.Status.Value,
    "Approved", nfColorSuccess,
    "Rejected", nfColorError,
    "Waiting",  nfColorWarning,
    nfColorTextMuted
)
// lblStatus.Color : Color.White

Contrast targets (WCAG AA): 4.5 to 1 for normal text, 3 to 1 for large text and icons.
White text needs a background at least as dark as #767676.
Do not rely on colour alone. Show the status word as well.`,
        "Status is readable for everyone, including users who cannot tell the colours apart.",
        ["Light text on pale brand colours", "Colour as the only signal"]
      )
    ],
    faqs: [
      q("Should I use ColorValue or RGBA?", "Both produce a colour. ColorValue takes the hex code your brand guide uses. RGBA is handy when you need transparency."),
      q("How do I change the whole app's colours at once?", "Reference named formulas or a theme record in every control. Then edit the definitions in App.Formulas."),
      q("Do modern controls use these colours?", "Modern controls take their colours from the app's modern theme. Set that theme to your brand colour and use these tokens for classic controls and custom elements.")
    ]
  },

  "solution-layering-checklist-generator": {
    examples: [
      ex(
        "How layers work",
        "Each component's behaviour is decided by a stack of layers. The top layer wins.",
        `Top      Unmanaged layer (Active)     any change made directly in the environment
         Managed solution B           imported later
         Managed solution A           imported earlier
Bottom   System

An unmanaged change in Production sits above every managed solution, so later managed updates to that
component appear to have no effect until the unmanaged layer is removed.`,
        "You can explain why an imported change did not show up.",
        ["Editing a managed component in Test or Production", "Importing unmanaged solutions outside development"]
      ),
      ex(
        "Find and remove an unmanaged layer",
        "When a deployed change is not visible, look at the component's layers.",
        `1. Solutions > open the managed solution > select the component (form, view, flow, app)
2. Commands: Advanced > See solution layers
3. An "Active" layer at the top is the unmanaged change
4. Compare its values with the layer beneath
5. Select the Active layer > Remove active customizations
6. Publish, and check the managed behaviour is back

Make the change properly in Dev and deploy it, so the fix is not lost.`,
        "The managed version of the component takes effect again.",
        ["Removing the layer without first copying a needed change back to Dev"]
      ),
      ex(
        "Before export",
        "Checks in the development environment.",
        `[ ] All work is in one unmanaged solution with your publisher
[ ] Only needed components are included. Tables added with selected objects, not all objects.
[ ] No dependencies on components outside the solution, or the dependency is deployed first
      (solution > ... > Show dependencies)
[ ] Environment variable current values removed
[ ] Connection references named and shared across flows
[ ] Solution checker has no critical or high issues
[ ] Version number increased
[ ] Published all customizations`,
        "The export contains what the release needs and nothing else."
      ),
      ex(
        "Import and after",
        "Checks in the target environment.",
        `[ ] Backup taken
[ ] Import managed. Upgrade for normal releases. Update only when components must not be removed.
[ ] Leave "Overwrite customizations" for cases where unmanaged changes must be replaced
[ ] Connection references and environment variables set
[ ] Flows turned on
[ ] See solution layers on two or three key components: no Active layer above your solution
[ ] Smoke test as a non-admin user
[ ] Staged upgrade completed with Apply upgrade, if Stage for upgrade was used`,
        "The release is live, and the environment has no stray unmanaged changes.",
        ["Leaving a staged upgrade unapplied", "Skipping the layer check after a hotfix"]
      )
    ],
    faqs: [
      q("What is an unmanaged layer?", "The set of changes made directly in an environment. It sits above all managed solutions, so it overrides them for the components it touches."),
      q("What is the difference between Upgrade, Stage for upgrade and Update?", "Upgrade replaces the solution and removes components that are no longer in it. Stage for upgrade imports the new version alongside the old so data can be migrated before applying. Update changes components without removing any."),
      q("Should I segment my work into several solutions?", "Start with one. Split only when parts are released on different schedules or shared by several apps, and keep the dependency direction one way.")
    ]
  }
};
