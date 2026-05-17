export type ExampleGuide = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  keywords: string[];
  intro: string;
  steps: string[];
  code: string;
  mistakes: string[];
  relatedLinks: { href: string; label: string }[];
};

const baseExampleGuides: ExampleGuide[] = [
  {
    slug: "power-apps-patch-examples",
    title: "Power Apps Patch examples for SharePoint and Dataverse",
    eyebrow: "Power Apps examples",
    description: "Practical Patch examples for choice fields, people fields, lookups, validation, and safe save behavior.",
    keywords: ["Power Apps Patch examples", "Patch SharePoint Power Apps", "Patch Dataverse Power Apps"],
    intro: "Use these examples when you need a reliable save formula that handles validation, user feedback, and the field shapes Power Apps expects.",
    steps: ["Validate required controls before saving.", "Patch field records in the shape expected by the connector.", "Wrap important saves in IfError.", "Capture the saved record when later steps need the ID."],
    code: `IfError(
    Set(
        varSavedRequest,
        Patch(
            Requests,
            Defaults(Requests),
            {
                Title: txtTitle.Text,
                Priority: { Value: cmbPriority.Selected.Value },
                AssignedTo: {
                    Claims: "i:0#.f|membership|" & Lower(cmbAssignee.Selected.Mail),
                    DisplayName: cmbAssignee.Selected.DisplayName,
                    Email: Lower(cmbAssignee.Selected.Mail),
                    Department: "",
                    JobTitle: "",
                    Picture: ""
                }
            }
        )
    );
    Notify("Request " & varSavedRequest.ID & " saved.", NotificationType.Success),
    Notify("The request could not be saved.", NotificationType.Error)
);`,
    mistakes: ["Patching complex SharePoint fields as plain text.", "Skipping IfError on production save buttons.", "Testing only with the maker account.", "Forgetting to disable double-submit behavior."],
    relatedLinks: [{ href: "/cookbooks/power-apps-patch-cookbook", label: "Power Apps Patch Cookbook" }, { href: "/cheat-sheets/patch-sharepoint-columns-cheat-sheet", label: "Patch SharePoint Columns Cheat Sheet" }, { href: "/power-apps/patch", label: "Power Apps Patch patterns" }]
  },
  {
    slug: "power-apps-collections-examples",
    title: "Power Apps Collections examples for galleries and staged edits",
    eyebrow: "Power Apps examples",
    description: "Examples for ClearCollect, AddColumns, staged edits, review queues, and collection-backed galleries.",
    keywords: ["Power Apps collections examples", "ClearCollect examples", "Power Apps collection gallery"],
    intro: "Collections are best when you need a local working set, a staging area, or a transformed table for a user experience.",
    steps: ["Load only the rows and columns needed for the task.", "Add display-friendly calculated columns once.", "Track changed rows explicitly.", "Patch only the rows that changed."],
    code: `ClearCollect(
    colReviewQueue,
    AddColumns(
        ShowColumns(Filter(Requests, RequestStatus.Value = "Ready for Review"), "ID", "Title", "Priority", "Modified"),
        "AgeInDays",
        DateDiff(Modified, Now(), TimeUnit.Days),
        "IsChanged",
        false
    )
);`,
    mistakes: ["Loading an entire large list into a collection.", "Treating collection data as always current.", "Losing the original record ID.", "Repeating the same display formulas in every gallery control."],
    relatedLinks: [{ href: "/cookbooks/power-apps-collections-cookbook", label: "Power Apps Collections Cookbook" }, { href: "/cheat-sheets/power-apps-gallery-filtering-cheat-sheet", label: "Gallery Filtering Cheat Sheet" }, { href: "/power-apps/delegation", label: "Power Apps delegation patterns" }]
  },
  {
    slug: "power-automate-expressions-examples",
    title: "Power Automate expressions examples for dates, nulls, and arrays",
    eyebrow: "Power Automate examples",
    description: "Common Power Automate expression examples for formatDateTime, coalesce, trigger outputs, arrays, and email-safe values.",
    keywords: ["Power Automate expressions examples", "formatDateTime", "coalesce Power Automate"],
    intro: "Good expressions make flows shorter, clearer, and easier to support when a field is blank or a date needs user-friendly formatting.",
    steps: ["Normalize optional values before they reach emails or approvals.", "Use Compose actions for expressions reused more than once.", "Format dates for display but keep stored dates as dates.", "Name expression actions by the value they produce."],
    code: `coalesce(triggerOutputs()?['body/ReviewerNotes'], 'No reviewer notes were entered.')
formatDateTime(triggerOutputs()?['body/DueDate'], 'MMM d, yyyy')
join(body('Select_-_approver_emails'), ';')`,
    mistakes: ["Assuming every dynamic field has a value.", "Putting long expressions directly inside email bodies.", "Comparing formatted date strings instead of date values.", "Leaving Compose actions with default names."],
    relatedLinks: [{ href: "/cookbooks/power-automate-expressions-cookbook", label: "Power Automate Expressions Cookbook" }, { href: "/tools/power-automate-expression-builder", label: "Expression Builder" }, { href: "/power-automate/error-handling", label: "Power Automate error handling" }]
  },
  {
    slug: "power-automate-trigger-conditions-examples",
    title: "Power Automate trigger conditions examples",
    eyebrow: "Power Automate examples",
    description: "Trigger condition examples for SharePoint status changes, blank checks, approvals, and reducing noisy flow runs.",
    keywords: ["Power Automate trigger conditions examples", "SharePoint trigger condition", "flow trigger condition"],
    intro: "Trigger conditions are best for reducing noise before a flow starts. Keep them small enough that another builder can understand them later.",
    steps: ["Use trigger conditions for simple run/no-run checks.", "Keep complex process logic inside the flow.", "Document the condition in the trigger notes.", "Test create, update, and unrelated edit scenarios."],
    code: `@equals(triggerOutputs()?['body/RequestStatus/Value'], 'Submitted')
@not(empty(triggerOutputs()?['body/AssignedTo/Email']))
@and(equals(triggerOutputs()?['body/RequestStatus/Value'], 'Approved'), not(empty(triggerOutputs()?['body/ApprovedDate'])))`,
    mistakes: ["Hiding complex business rules in the trigger.", "Using the wrong dynamic path for choice fields.", "Forgetting to test list item creation.", "Creating conditions that are impossible to troubleshoot."],
    relatedLinks: [{ href: "/cheat-sheets/power-automate-trigger-conditions-cheat-sheet", label: "Trigger Conditions Cheat Sheet" }, { href: "/power-automate/trigger-conditions", label: "Trigger condition patterns" }, { href: "/tools/power-automate-expression-builder", label: "Expression Builder" }]
  },
  {
    slug: "sharepoint-list-schema-examples",
    title: "SharePoint list schema examples for Power Apps",
    eyebrow: "SharePoint examples",
    description: "Example SharePoint list schemas for request apps, review queues, approvals, support logs, and Power Automate backends.",
    keywords: ["SharePoint list schema examples", "Power Apps SharePoint list", "SharePoint columns Power Apps"],
    intro: "A good list schema makes Power Apps and Power Automate easier to build, support, and migrate later.",
    steps: ["Define the business process before creating columns.", "Use typed columns for status, people, dates, and lookups.", "Add views for support and operations.", "Index columns that drive common filters."],
    code: `RequestStatus: Choice (Draft, Submitted, In Review, Approved, Rejected, Closed)
SubmittedBy: Person
AssignedTo: Person
DueDate: Date only
Priority: Choice (Low, Normal, High, Urgent)
FlowRunUrl: Hyperlink
SupportNotes: Multiple lines of text`,
    mistakes: ["Using text columns for every field.", "Renaming columns after apps and flows depend on them.", "Skipping indexed queue columns.", "Using SharePoint views as security boundaries."],
    relatedLinks: [{ href: "/cookbooks/sharepoint-list-schema-cookbook", label: "SharePoint List Schema Cookbook" }, { href: "/tools/sharepoint-internal-name-helper", label: "Internal Name Helper" }, { href: "/sharepoint/list-schemas", label: "SharePoint list schema patterns" }]
  },
  {
    slug: "dataverse-security-roles-examples",
    title: "Dataverse security roles examples for app sharing",
    eyebrow: "Dataverse examples",
    description: "Examples for thinking through Dataverse table privileges, app sharing, teams, business units, and test-user validation.",
    keywords: ["Dataverse security roles examples", "model-driven app sharing", "Dataverse permissions"],
    intro: "Security roles control what users can do after they open an app. App sharing and environment access are only part of the release checklist.",
    steps: ["Confirm table ownership and business-unit needs.", "Map each persona to create, read, write, delete, append, and append-to privileges.", "Share the app and assign security roles.", "Test with a real user account, not a system admin."],
    code: `Requester:
- Create own Service Request
- Read own Service Request
- Write own draft Service Request

Reviewer:
- Read team Service Requests
- Write review fields
- Append notes to related records

Support Admin:
- Read organization records
- Assign records
- Review audit history`,
    mistakes: ["Testing only as system admin.", "Sharing the app but not assigning roles.", "Ignoring team ownership.", "Granting delete privileges too broadly."],
    relatedLinks: [{ href: "/cheat-sheets/dataverse-security-roles-cheat-sheet", label: "Dataverse Security Roles Cheat Sheet" }, { href: "/dataverse/security-roles", label: "Dataverse security role patterns" }, { href: "/standards/dataverse-table-design-standards", label: "Dataverse table standards" }]
  },
  {
    slug: "power-platform-alm-checklist",
    title: "Power Platform ALM checklist for solutions and releases",
    eyebrow: "ALM examples",
    description: "A release checklist for solutions, environment variables, connection references, managed imports, smoke tests, and rollback notes.",
    keywords: ["Power Platform ALM checklist", "solution deployment checklist", "managed solution import"],
    intro: "Use this checklist before moving a solution into test or production. The goal is to make release readiness visible before import time.",
    steps: ["Export from a clean development solution.", "Review environment variables and connection references.", "Import managed into test before production.", "Run smoke tests with a non-admin user.", "Capture rollback and support-owner notes."],
    code: `Pre-release:
- Solution exported from clean dev environment
- Environment variables documented
- Connection references reviewed
- Cloud flows checked for owner and enabled state
- Test import completed
- Smoke test completed by non-admin user
- Rollback notes captured`,
    mistakes: ["Moving unmanaged customizations by hand.", "Forgetting to turn flows on after import.", "Using personal production connections.", "Skipping test-user smoke testing."],
    relatedLinks: [{ href: "/tools/solution-layering-checklist-generator", label: "Solution Layering Checklist Generator" }, { href: "/alm/solutions", label: "Solution patterns" }, { href: "/standards/environment-variable-standards", label: "Environment variable standards" }]
  }
];

const expandedExampleGuides: ExampleGuide[] = [
  {
    "slug": "patch-sharepoint-person-field-examples",
    "title": "Patch SharePoint Person Field Examples",
    "eyebrow": "Power Apps examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Patch SharePoint Person Field Examples",
      "patch sharepoint person field examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Patch(Requests, ThisItem, { AssignedTo: { Claims: \"i:0#.f|membership|\" & Lower(cmbUser.Selected.Mail), DisplayName: cmbUser.Selected.DisplayName, Email: Lower(cmbUser.Selected.Mail), Department: \"\", JobTitle: \"\", Picture: \"\" } });",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "patch-sharepoint-choice-field-examples",
    "title": "Patch SharePoint Choice Field Examples",
    "eyebrow": "Power Apps examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Patch SharePoint Choice Field Examples",
      "patch sharepoint choice field examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Patch(Requests, ThisItem, { Priority: { Value: cmbPriority.Selected.Value }, ImpactedSystems: ForAll(cmbSystems.SelectedItems, { Value: Value }) });",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "patch-sharepoint-lookup-field-examples",
    "title": "Patch SharePoint Lookup Field Examples",
    "eyebrow": "Power Apps examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Patch SharePoint Lookup Field Examples",
      "patch sharepoint lookup field examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Patch(Requests, Defaults(Requests), { Department: { Id: cmbDepartment.Selected.ID, Value: cmbDepartment.Selected.Title } });",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "power-apps-delegation-filter-examples",
    "title": "Power Apps Delegation Filter Examples",
    "eyebrow": "Power Apps examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Power Apps Delegation Filter Examples",
      "power apps delegation filter examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Power Apps formula example:\nIfError(Patch(Requests, ThisItem, { Title: txtTitle.Text }), Notify(\"Saved\", Success), Notify(\"Save failed\", Error))",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "power-apps-form-validation-examples",
    "title": "Power Apps Form Validation Examples",
    "eyebrow": "Power Apps examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Power Apps Form Validation Examples",
      "power apps form validation examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Power Apps formula example:\nIfError(Patch(Requests, ThisItem, { Title: txtTitle.Text }), Notify(\"Saved\", Success), Notify(\"Save failed\", Error))",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "power-apps-gallery-search-sort-examples",
    "title": "Power Apps Gallery Search Sort Examples",
    "eyebrow": "Power Apps examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Power Apps Gallery Search Sort Examples",
      "power apps gallery search sort examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Power Apps formula example:\nIfError(Patch(Requests, ThisItem, { Title: txtTitle.Text }), Notify(\"Saved\", Success), Notify(\"Save failed\", Error))",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "power-automate-approval-examples",
    "title": "Power Automate Approval Examples",
    "eyebrow": "Power Automate examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Power Automate Approval Examples",
      "power automate approval examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Trigger condition: @equals(triggerOutputs()?[body/Status/Value], Submitted)\nUse named Compose actions, run-after settings, and a support log item.",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "power-automate-html-email-examples",
    "title": "Power Automate Html Email Examples",
    "eyebrow": "Power Automate examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Power Automate Html Email Examples",
      "power automate html email examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Trigger condition: @equals(triggerOutputs()?[body/Status/Value], Submitted)\nUse named Compose actions, run-after settings, and a support log item.",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "power-automate-error-handling-examples",
    "title": "Power Automate Error Handling Examples",
    "eyebrow": "Power Automate examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Power Automate Error Handling Examples",
      "power automate error handling examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Trigger condition: @equals(triggerOutputs()?[body/Status/Value], Submitted)\nUse named Compose actions, run-after settings, and a support log item.",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "power-automate-array-select-filter-examples",
    "title": "Power Automate Array Select Filter Examples",
    "eyebrow": "Power Automate examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Power Automate Array Select Filter Examples",
      "power automate array select filter examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Trigger condition: @equals(triggerOutputs()?[body/Status/Value], Submitted)\nUse named Compose actions, run-after settings, and a support log item.",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "sharepoint-internal-name-examples",
    "title": "SharePoint Internal Name Examples",
    "eyebrow": "SharePoint examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "SharePoint Internal Name Examples",
      "sharepoint internal name examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "SharePoint schema example:\nStatus choice, AssignedTo person, DueDate date, FlowRunUrl hyperlink, indexed queue views.",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "sharepoint-view-index-examples",
    "title": "SharePoint View Index Examples",
    "eyebrow": "SharePoint examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "SharePoint View Index Examples",
      "sharepoint view index examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "SharePoint schema example:\nStatus choice, AssignedTo person, DueDate date, FlowRunUrl hyperlink, indexed queue views.",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "dataverse-relationship-examples",
    "title": "Dataverse Relationship Examples",
    "eyebrow": "Dataverse examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Dataverse Relationship Examples",
      "dataverse relationship examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Dataverse example:\nAccount 1:N Request, Request N:1 Category, security role tested with non-admin user.",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "dataverse-choice-column-examples",
    "title": "Dataverse Choice Column Examples",
    "eyebrow": "Dataverse examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Dataverse Choice Column Examples",
      "dataverse choice column examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "Dataverse example:\nAccount 1:N Request, Request N:1 Category, security role tested with non-admin user.",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "alm-environment-variable-examples",
    "title": "ALM Environment Variable Examples",
    "eyebrow": "ALM examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "ALM Environment Variable Examples",
      "alm environment variable examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "ALM example:\nEnvironment variables, connection references, managed import, flow enablement, smoke test, rollback note.",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "connection-reference-examples",
    "title": "Connection Reference Examples",
    "eyebrow": "ALM examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Connection Reference Examples",
      "connection reference examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "ALM example:\nEnvironment variables, connection references, managed import, flow enablement, smoke test, rollback note.",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  },
  {
    "slug": "adaptive-card-teams-approval-examples",
    "title": "Adaptive Card Teams Approval Examples",
    "eyebrow": "Teams examples",
    "description": "Practical example with starter code, implementation steps, and common mistakes for Power Platform developers.",
    "keywords": [
      "Adaptive Card Teams Approval Examples",
      "adaptive card teams approval examples",
      "BuilderVault example"
    ],
    "intro": "Use this example as a working starting point, then replace the sample names with your own app, flow, list, table, or solution names.",
    "steps": [
      "Confirm the real data source, columns, and permissions.",
      "Paste the starter code into a test build first.",
      "Replace sample names with production names.",
      "Test blank values, failures, non-admin access, and support handoff."
    ],
    "code": "{ \"type\": \"AdaptiveCard\", \"version\": \"1.4\", \"actions\": [{ \"type\": \"Action.Submit\", \"title\": \"Approve\", \"data\": { \"decision\": \"Approve\" } }] }",
    "mistakes": [
      "Copying sample names without matching the real schema.",
      "Testing only as the maker or system admin.",
      "Skipping blank-value and failure-path tests.",
      "Leaving the implementation undocumented for the next builder."
    ],
    "relatedLinks": [
      {
        "href": "/examples",
        "label": "More examples"
      },
      {
        "href": "/patterns",
        "label": "Pattern library"
      }
    ]
  }
];

export const exampleGuides: ExampleGuide[] = [...baseExampleGuides, ...expandedExampleGuides];

export function getExampleGuideBySlug(slug: string) {
  return exampleGuides.find((guide) => guide.slug === slug);
}
