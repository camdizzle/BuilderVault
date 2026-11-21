import { automateDoc, code, learnDoc, note, ol, p, table, tool, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Power Automate" as const, published: "2026-11-20", updated: "2026-11-20" };

const webApiErrorsDoc = learnDoc("troubleshoot/power-platform/dataverse/dataverse-web-api-and-sdk/web-api-client-errors", "Troubleshoot Dataverse Web API client errors");
const clientErrorsDoc = learnDoc("troubleshoot/power-platform/dataverse/user-permissions/client-errors", "Troubleshoot Dataverse client errors");
const knownIssuesDoc = automateDoc("dataverse/known-issues", "Troubleshoot known issues with Dataverse");
const updateRowDoc = automateDoc("dataverse/update", "Use a flow to update a row");
const listRowsDoc = automateDoc("dataverse/list-rows", "Use lists of rows in flows");
const triggerDoc = automateDoc("dataverse/create-update-delete-trigger", "Trigger flows when a row is added, modified, or deleted");

const setNameSteps = ol(
  "Sign in to Power Apps and select **Tables**.",
  "Set the filter to **All**, then find and open the table the lookup points to.",
  "Under **Table properties**, open the **Tools** menu.",
  "Select **Copy set name** and paste it into the flow."
);

const resourceNotFound: ErrorPage = {
  ...base,
  slug: "resource-not-found-for-the-segment-dataverse",
  message: "Resource not found for the segment 'contact'.",
  title: "Fix \"Resource not found for the segment\" in a Dataverse flow",
  shortTitle: "Resource not found for the segment",
  description: "Why a Dataverse action fails with Resource not found for the segment, how to find a table's set name, and the correct format for lookup columns and Row ID values.",
  keywords: ["Resource not found for the segment", "0x8006088a", "Dataverse lookup column Power Automate error", "entity set name Dataverse", "Dataverse set name lookup"],
  quickAnswer: "A lookup column was given a table name that Dataverse does not recognise. Lookup values need the table's set name, which is usually the plural logical name, followed by the row's ID in brackets, such as contacts(00000000-0000-0000-0000-000000000000). The name in the error is the one you sent. Replace it with the set name, which you can copy in Power Apps from the table's Tools menu with Copy set name.",
  variants: [
    "Resource not found for the segment 'Account'.",
    "Resource not found for the segment 'cr1a2_project'.",
    "0x8006088a"
  ],
  meaning: [
    p("Dataverse identifies a row by a short address made of two parts: the name of the table's collection and the row's ID. Each part of an address is called a segment. The error says that the first segment, the name in quotes, is not the name of anything Dataverse knows."),
    p("In a flow this almost always comes from a lookup column in **Add a new row** or **Update a row**. The name is case sensitive, so `Accounts` fails where `accounts` works.")
  ],
  causes: [
    ol(
      "The lookup holds the table's logical name, such as `contact`, where the set name `contacts` is needed.",
      "The lookup holds the display name, such as `Contacts` or `Project Tasks`.",
      "The plural was guessed and the guess is wrong. A table named `cr1a2_category` has the set name `cr1a2_categories`, and some tables have irregular set names.",
      "The lookup holds only a bare ID, and part of the ID or surrounding text was read as a name.",
      "A value built from dynamic content was empty, which left a name with nothing after it.",
      "In **Perform a bound action** or an HTTP request, the name of a custom action is wrong, or the action is turned off."
    )
  ],
  fixes: [
    p("**Use the set name.** The format for every lookup box is the set name, then the ID in brackets."),
    code(`contacts(aaaaaaaa-0000-1111-2222-bbbbbbbbbbbb)

cr1a2_projects(@{triggerOutputs()?['body/cr1a2_projectid']})`, "Lookup value"),
    p("**Find the set name, do not guess it.**"),
    setNameSteps,
    p("You can also list every set name by opening your environment's Web API address in a browser: the environment URL followed by `/api/data/v9.2/`. Search the page for the table."),
    p("**Check what was sent.** Open the failed run and read the action's inputs. The lookup shows the final text after dynamic content was filled in. Text such as `contacts()` with nothing in the brackets means the ID was empty for that run."),
    p("**Guard an optional lookup.** If the related row can be missing, do not send an empty address. Put the update in a **Condition** that checks the ID first, or build the value so it is null when there is no ID."),
    code(`if(empty(triggerOutputs()?['body/_cr1a2_project_value']), null, concat('cr1a2_projects(', triggerOutputs()?['body/_cr1a2_project_value'], ')'))`, "Expression"),
    tool("dataverse-table-naming-helper", "Check a table's logical name and likely set name before you build the lookup value.")
  ],
  prevention: [
    ul(
      "Copy set names from Power Apps once and keep them in the flow's notes or in a Compose action at the top.",
      "Take IDs from dynamic content, never from typed text.",
      "Test the flow with a row where each optional lookup is empty."
    ),
    p("The [lookup binding pattern](/patterns/dataverse-set-lookup-odata-bind-power-automate) covers customer and owner lookups, which need more than the set name.")
  ],
  faqs: [
    { question: "What is a segment in a Dataverse error?", answer: "It is one part of the address of a row or operation in the Dataverse Web API. The error names the part that Dataverse could not match to a table collection, function or action." },
    { question: "How do I find the set name of a Dataverse table?", answer: "In Power Apps, open Tables, open the table, expand the Tools menu under Table properties and select Copy set name. The set name is usually the plural of the logical name, but not always." },
    { question: "What is the correct format for a Dataverse lookup column in Power Automate?", answer: "The set name of the related table followed by the row's ID in brackets, for example accounts(00000000-0000-0000-0000-000000000000). There are no quotes around the ID." },
    { question: "Are Dataverse set names case sensitive?", answer: "Yes. Set names are normally all lower case, and Accounts is not the same as accounts." }
  ],
  relatedTools: ["dataverse-table-naming-helper"],
  relatedPatterns: ["dataverse-set-lookup-odata-bind-power-automate", "patch-dataverse-lookup-and-choice-columns", "dataverse-polymorphic-lookup-patch-power-apps"],
  relatedLinks: [
    { href: "/guides/power-automate-dataverse-quick-start", label: "Dataverse connector quick start" },
    { href: "/guides/dataverse-list-rows-filter-rows", label: "Filter Dataverse rows with List rows" }
  ],
  relatedErrors: ["undeclared-property-only-has-property-annotations-dataverse", "could-not-find-a-property-named-dataverse", "entity-with-id-does-not-exist-dataverse"],
  sources: [webApiErrorsDoc, knownIssuesDoc, updateRowDoc]
};

const undeclaredProperty: ErrorPage = {
  ...base,
  slug: "undeclared-property-only-has-property-annotations-dataverse",
  message: "An undeclared property 'parentcustomerid' which only has property annotations in the payload but no property value was found in the payload. In OData, only declared navigation properties and declared named streams can be represented as properties without values.",
  title: "Fix \"An undeclared property ... which only has property annotations in the payload\" in Dataverse",
  shortTitle: "An undeclared property in the payload",
  description: "Why Dataverse rejects a lookup with an undeclared property error, what a navigation property is, and how to find the right name for customer, owner and custom lookups.",
  keywords: ["An undeclared property which only has property annotations in the payload", "Error identified in Payload provided by the user for Entity", "0x80048d19", "odata.bind Dataverse error", "navigation property Dataverse lookup"],
  quickAnswer: "The flow tried to set a lookup using a name that is not a navigation property of the table. This happens with lookups that can point to more than one table, such as Customer, Owner and Regarding, and with custom lookups whose navigation property is the schema name with capital letters. In the designer, fill the box named for the specific table, such as Company Name (Accounts). In an HTTP request, use the navigation property name, such as parentcustomerid_account@odata.bind.",
  variants: [
    "Error identified in Payload provided by the user for Entity :'contacts'",
    "An undeclared property 'cr1a2_project' which only has property annotations in the payload but no property value was found in the payload.",
    "0x80048d19"
  ],
  meaning: [
    p("To set a lookup, a request does not send a value for the lookup column. It sends a link to the related row, attached to a **navigation property**. Each lookup column has one navigation property for every table it can point to."),
    p("The error means the request attached a link to a name that is not a navigation property. Dataverse saw an annotation, the link, on a property it has no declaration for."),
    p("The lookup column's logical name and its navigation property name are often different. That difference is the cause.")
  ],
  causes: [
    ol(
      "The lookup can point to several tables. The Customer column of a contact is `parentcustomerid`, and its navigation properties are `parentcustomerid_account` and `parentcustomerid_contact`.",
      "The lookup is custom. The column's logical name is all lower case, such as `cr1a2_project`, and the navigation property uses the schema name, such as `cr1a2_Project`.",
      "The request body was written by hand for **Send an HTTP request** or **Perform an unbound action** and uses the column name with `@odata.bind`.",
      "The row is passed to the action as JSON, which happens when the table name is dynamic, and the JSON uses column names for lookups."
    )
  ],
  fixes: [
    p("**In the designer, use the box for the right table.** For a lookup that can point to several tables, **Add a new row** and **Update a row** show one box per target, such as **Company Name (Accounts)** and **Company Name (Contacts)**. Fill one, with the set name and ID, and leave the other empty."),
    code(`accounts(aaaaaaaa-0000-1111-2222-bbbbbbbbbbbb)`, "Company Name (Accounts)"),
    p("**In a request body, use the navigation property.**"),
    code(`{
  "firstname": "Ana",
  "lastname": "Silva",
  "parentcustomerid_account@odata.bind": "accounts(aaaaaaaa-0000-1111-2222-bbbbbbbbbbbb)"
}`, "Request body"),
    p("**Find the navigation property name.**"),
    ol(
      "In Power Apps, open the table and select **Relationships**.",
      "Find the many-to-one relationship for the lookup and open it.",
      "For a custom lookup, the navigation property is normally the lookup column's **schema name**, with the same capital letters, such as `cr1a2_Project`."
    ),
    p("To be certain, open the environment's metadata document in a browser, at the environment URL followed by `/api/data/v9.2/$metadata`, and search for the table's entity type. Its navigation properties are listed by name. The document is large and takes a while to load."),
    code(`{
  "cr1a2_name": "Site survey",
  "cr1a2_Project@odata.bind": "cr1a2_projects(bbbbbbbb-1111-2222-3333-cccccccccccc)"
}`, "Request body"),
    note("The part before @odata.bind is the navigation property and is case sensitive. The part in the value is the set name of the target table, in lower case.")
  ],
  prevention: [
    ul(
      "Prefer the Dataverse actions with their per-table lookup boxes to hand-written request bodies.",
      "When you must write a body, copy navigation property names from the metadata document.",
      "Keep a tested example body in the flow's notes for each table you write to."
    ),
    p("The [lookup binding pattern](/patterns/dataverse-set-lookup-odata-bind-power-automate) has worked examples for customer, owner and regarding lookups.")
  ],
  faqs: [
    { question: "What is a navigation property in Dataverse?", answer: "It is the name the Web API uses for a relationship between two tables. To set a lookup you attach a link to the related row to the navigation property, not to the lookup column itself." },
    { question: "Why does parentcustomerid@odata.bind fail?", answer: "The Customer lookup can point to an account or a contact, so it has two navigation properties: parentcustomerid_account and parentcustomerid_contact. Use the one for the table you are linking to." },
    { question: "Is the navigation property name case sensitive?", answer: "Yes. For custom lookups it normally matches the column's schema name, including capital letters, while the column's logical name is all lower case." },
    { question: "What does error code 0x80048d19 mean?", answer: "It is the Dataverse code for an error in the request body. The message that follows it says which property was not accepted." }
  ],
  relatedTools: ["dataverse-table-naming-helper"],
  relatedPatterns: ["dataverse-set-lookup-odata-bind-power-automate", "dataverse-polymorphic-lookup-patch-power-apps", "dataverse-changeset-transaction-power-automate"],
  relatedLinks: [
    { href: "/guides/power-automate-dataverse-quick-start", label: "Dataverse connector quick start" },
    { href: "/guides/power-automate-expressions-explained", label: "Read and write flow expressions" }
  ],
  relatedErrors: ["resource-not-found-for-the-segment-dataverse", "could-not-find-a-property-named-dataverse", "entity-with-id-does-not-exist-dataverse"],
  sources: [
    webApiErrorsDoc,
    learnDoc("power-apps/developer/data-platform/webapi/web-api-navigation-properties", "Web API navigation properties"),
    knownIssuesDoc
  ]
};

const propertyNotFound: ErrorPage = {
  ...base,
  slug: "could-not-find-a-property-named-dataverse",
  message: "Could not find a property named 'Name' on type 'Microsoft.Dynamics.CRM.account'.",
  title: "Fix \"Could not find a property named ... on type 'Microsoft.Dynamics.CRM...'\" in a Dataverse flow",
  shortTitle: "Could not find a property named",
  description: "Why List rows, Get a row and the Dataverse trigger fail on a column name, and how to find the logical name to use in Filter rows, Select columns, Sort by and Expand Query.",
  keywords: ["Could not find a property named on type Microsoft.Dynamics.CRM", "Dataverse Filter rows error", "Dataverse Select columns error", "logical name Dataverse column", "List rows column name error"],
  quickAnswer: "A column name in Filter rows, Select columns, Sort by or Expand Query is not a column of that table. Dataverse expects the logical name, which is all lower case and includes the publisher prefix, such as cr1a2_duedate. The error names the text that was not found. Open the column in Power Apps to read its logical name. For a lookup column, a filter needs the form _cr1a2_project_value.",
  variants: [
    "Could not find a property named 'cr1a2_Project' on type 'Microsoft.Dynamics.CRM.cr1a2_task'.",
    "Invalid property 'Name' was found in entity 'Microsoft.Dynamics.CRM.account'.",
    "Syntax error at position 12 in 'Due Date ge 2026-11-20'."
  ],
  meaning: [
    p("The query named a column that does not exist on the table. Dataverse reports the name it could not match and the table it looked in, shown after `Microsoft.Dynamics.CRM.`."),
    p("Column names are case sensitive. `Name` is not `name`. The second variant above is the same mistake in a row being written, and not in a query.")
  ],
  causes: [
    ol(
      "The display name was used, such as `Due Date`, where the logical name `cr1a2_duedate` is needed.",
      "The schema name was used, with capital letters, such as `cr1a2_DueDate`. Queries need the lower-case logical name.",
      "The column is a lookup and was filtered by its plain name. A lookup is filtered as `_cr1a2_project_value`.",
      "The name is right but belongs to a different table, often a column of a related table.",
      "The column was deleted or renamed since the flow was built.",
      "In **Expand Query**, the column name was used where the relationship's navigation property is needed."
    )
  ],
  fixes: [
    p("**Find the logical name.**"),
    ol(
      "In Power Apps, open **Tables** and open the table.",
      "Select **Columns** and open the column.",
      "Expand **Advanced options** and read **Logical name**."
    ),
    p("**Use the right form for each place.**"),
    table(
      ["Where", "Ordinary column", "Lookup column"],
      ["Filter rows", "`cr1a2_duedate ge 2026-11-20`", "`_cr1a2_project_value eq 00000000-0000-0000-0000-000000000000`"],
      ["Select columns", "`cr1a2_duedate,cr1a2_name`", "`_cr1a2_project_value`"],
      ["Sort by", "`cr1a2_duedate desc`", "`_cr1a2_project_value asc`"],
      ["Expand Query", "Not used", "`cr1a2_Project($select=cr1a2_name)`"]
    ),
    p("Expand Query is the exception to the lower-case rule. It takes the navigation property, which for a custom lookup is normally the schema name with its capital letters."),
    p("**Filter on a column of a related table** by going through the navigation property, not by naming the column directly."),
    code(`cr1a2_Project/cr1a2_status eq 100000001`, "Filter rows"),
    tool("odata-filter-query-builder", "Build the filter with the Dataverse option selected. The builder writes lookup, choice and date conditions in the right form."),
    p("**Check the trigger too.** The same rule applies to **Select columns** and **Filter rows** on the Dataverse trigger. A wrong name there stops the flow from being saved or turned on.")
  ],
  prevention: [
    ul(
      "Copy logical names from Power Apps into the flow. Do not type them from memory.",
      "Before renaming or deleting a column, search your flows for its logical name.",
      "Test a new filter in a List rows action with **Row count** set to 1 before building the rest of the flow on it."
    ),
    p("The [List rows filter guide](/guides/dataverse-list-rows-filter-rows) has the syntax for every column type.")
  ],
  faqs: [
    { question: "What is the difference between a display name, a schema name and a logical name?", answer: "The display name is what people see, such as Due Date. The schema name includes the publisher prefix and capital letters, such as cr1a2_DueDate. The logical name is the schema name in lower case, cr1a2_duedate, and is what queries use." },
    { question: "How do I filter a Dataverse lookup column in List rows?", answer: "Use the lookup's value form: an underscore, the logical name, then _value, compared with the row ID without quotes. For example _cr1a2_project_value eq 00000000-0000-0000-0000-000000000000." },
    { question: "Why does the error mention Microsoft.Dynamics.CRM?", answer: "That is the namespace of every table in the Dataverse Web API. The word after it is the logical name of the table that was searched for the column." },
    { question: "Why does my column name work in Expand Query with capitals but fail in Filter rows?", answer: "Expand Query uses the navigation property, which normally matches the schema name with capitals. Filter rows, Select columns and Sort by use the lower-case logical name." }
  ],
  relatedTools: ["odata-filter-query-builder", "dataverse-table-naming-helper"],
  relatedPatterns: ["dataverse-filter-rows-odata-power-automate", "dataverse-expand-related-rows-power-automate", "dataverse-trigger-filter-select-columns"],
  relatedLinks: [
    { href: "/guides/dataverse-list-rows-filter-rows", label: "Filter Dataverse rows with List rows" },
    { href: "/guides/power-automate-dataverse-quick-start", label: "Dataverse connector quick start" }
  ],
  relatedErrors: ["resource-not-found-for-the-segment-dataverse", "undeclared-property-only-has-property-annotations-dataverse", "the-query-is-not-valid-get-items"],
  sources: [webApiErrorsDoc, listRowsDoc, triggerDoc]
};

const missingPrivilege: ErrorPage = {
  ...base,
  slug: "principal-user-is-missing-privilege-dataverse",
  message: "Principal user (Id=00000000-0000-0000-0000-000000000000, type=8, roleCount=2, privilegeCount=310) is missing prvReadcr1a2_Project privilege (Id=11111111-1111-1111-1111-111111111111) on OTC=10432 for entity 'cr1a2_project'.",
  title: "Fix \"Principal user is missing prv... privilege\" in a Dataverse flow",
  shortTitle: "Principal user is missing privilege",
  description: "How to read a Dataverse missing privilege error, find which user and which table it is about, and fix it with the right security role, without over-granting access.",
  keywords: ["Principal user is missing privilege", "is missing prvRead privilege", "Dataverse security role Power Automate", "0x80040220", "does not have ReadAccess right"],
  quickAnswer: "The account the flow runs as does not have permission for that operation on that table. The privilege name tells you both: prvReadcr1a2_Project is Read on the Project table. The user is the owner of the flow's Dataverse connection, not the person who triggered the flow. An administrator needs to give that account a security role that includes the privilege, at the access level the flow needs.",
  variants: [
    "Principal user is missing privilege on OTC for entity",
    "Principal with ID ... does not have ReadAccess right(s) for record with ID ... of entity ...",
    "CrmCheckPrivilege failed. Returned hr = -2147220839 on UserId: ... and Privilege: ...",
    "0x80040220"
  ],
  meaning: [
    p("Dataverse checks permission in two steps. First a **privilege check**: does any of the user's security roles allow this operation on this table at all? Then an **access check**: does that permission reach this particular row?"),
    p("\"Principal user is missing privilege\" is a failed privilege check. \"Does not have ReadAccess right(s) for record\" is a failed access check: the user has the privilege, but not for a row owned by that person or business unit."),
    p("The message can be read piece by piece."),
    table(
      ["Part", "Meaning"],
      ["Principal user (Id=...)", "The ID of the user or team that was refused"],
      ["prvReadcr1a2_Project", "The privilege: an operation, then the table's schema name"],
      ["for entity 'cr1a2_project'", "The logical name of the table"]
    ),
    p("The operation is one of Create, Read, Write, Delete, Append, AppendTo, Assign or Share.")
  ],
  causes: [
    ol(
      "The owner of the flow's Dataverse connection has no security role that covers the table. This is common with new custom tables, which no existing role includes until someone adds them.",
      "The flow sets a lookup. That needs **Append** on the row being saved and **Append To** on the row it points to, and one of them is missing.",
      "The role has the privilege at **User** level, and the row belongs to someone else.",
      "The flow was imported into another environment, where the connection's account has different roles.",
      "The trigger uses **Run as** with the row owner or modifying user, and that person lacks the privilege.",
      "The connection belongs to a service principal whose application user was given a narrow role."
    )
  ],
  fixes: [
    p("**Identify the user.** The Id in the message is a Dataverse user ID. An administrator can find the account by opening the environment in the Power Platform admin center, under **Settings**, **Users + permissions**, **Users**. In most flows it is simply the person who created the connection, shown on the action under its connection."),
    p("**Add the privilege to a role.** This needs the System Administrator or System Customizer role."),
    ol(
      "In the Power Platform admin center, open the environment, then **Settings**, **Users + permissions**, **Security roles**.",
      "Open the role that the flow's account should have. Copy a standard role first if you would otherwise change one that many people use.",
      "Find the table named in the error.",
      "Set the missing privilege to the level the flow needs: **User** for its own rows, **Business unit** for rows in its unit, **Organization** for all rows.",
      "Save, then assign the role to the account if it does not have it."
    ),
    p("**Lookups need two privileges.** When a flow sets the Project lookup on a Task, the account needs **Append** on Task and **Append To** on Project, as well as Write on Task."),
    p("**Wait, then test again.** A role change can take a few minutes to apply. Resubmit the failed run to confirm."),
    note("Do not fix this by giving the account System Administrator. The flow then has full control of the environment, and so does anyone who can edit the flow.")
  ],
  prevention: [
    ul(
      "Create a security role for automation with exactly the tables each flow touches, and assign it to the account that owns the connections.",
      "Add new custom tables to the right roles as part of creating the table, and ship the roles in the same solution.",
      "Own production connections with a service account or service principal, so permissions do not depend on one maker's roles. See [service principals for deployments](/patterns/service-principal-application-user-deployments).",
      "After importing a solution, check roles in the target environment before turning flows on."
    ),
    p("The pattern for [checking a security role in a canvas app](/patterns/check-dataverse-security-role-in-canvas-app) shows the app side of the same model.")
  ],
  faqs: [
    { question: "Which user is the principal user in a Dataverse flow error?", answer: "It is the account that owns the Dataverse connection used by the failing action, normally the person who built the flow. It is not the person whose change triggered the flow, unless the trigger's Run as setting says otherwise." },
    { question: "What does prvRead mean in the error?", answer: "It is the name of a privilege. prv is the prefix, Read is the operation, and the rest is the table's schema name. prvCreateAccount is permission to create rows in the Account table." },
    { question: "Why does setting a lookup need extra privileges?", answer: "Linking two rows needs Append on the row that holds the lookup and Append To on the row it points to. Without both, the save fails even when the account can write to the table." },
    { question: "What is the difference between a missing privilege and a missing access right?", answer: "A missing privilege means no security role allows the operation on that table. A missing access right means a role allows it, but not at a level that reaches the specific row, for example a row owned by another user." }
  ],
  relatedTools: [],
  relatedPatterns: ["check-dataverse-security-role-in-canvas-app", "dataverse-team-ownership-access-teams", "service-principal-application-user-deployments", "dataverse-column-security-profiles"],
  relatedLinks: [
    { href: "/guides/power-automate-dataverse-quick-start", label: "Dataverse connector quick start" },
    { href: "/errors/you-dont-have-permission-to-view-this-data", label: "Error: You don't have permission to view this data" }
  ],
  relatedErrors: ["entity-with-id-does-not-exist-dataverse", "resource-not-found-for-the-segment-dataverse", "approvals-dataverse-database-not-ready"],
  sources: [
    clientErrorsDoc,
    learnDoc("power-platform/admin/how-record-access-determined", "How access to a record is determined"),
    learnDoc("power-platform/admin/database-security", "Configure user security in an environment"),
    triggerDoc
  ]
};

const rowDoesNotExist: ErrorPage = {
  ...base,
  slug: "entity-with-id-does-not-exist-dataverse",
  message: "Entity 'cr1a2_project' With Id = 00000000-0000-0000-0000-000000000000 Does Not Exist",
  title: "Fix \"Entity ... With Id = ... Does Not Exist\" in a Dataverse flow",
  shortTitle: "Entity With Id Does Not Exist",
  description: "Why a Dataverse action cannot find a row by its ID: deleted rows, IDs from another table or environment, empty values and permissions, and how to handle a missing row without failing the flow.",
  keywords: ["Entity With Id Does Not Exist", "Does Not Exist Dataverse Power Automate", "Get a row by ID not found", "0x80040217", "Dataverse 404 flow"],
  quickAnswer: "The action asked Dataverse for a row by ID, and no row with that ID exists in that table. The row was deleted, the ID belongs to a different table or a different environment, or the value passed was not the row's ID at all. Open the failed run, copy the ID from the action's inputs and check where it came from. If a missing row is a normal case, set the next step to run after failure, or use List rows with a filter, which returns an empty list in place of an error.",
  variants: [
    "Contact With IDs = 00000000-0000-0000-0000-000000000000 Do Not Exist",
    "account With Id = 00000000-0000-0000-0000-000000000000 Does Not Exist",
    "0x80040217"
  ],
  meaning: [
    p("Every Dataverse row has a unique ID, a GUID. **Get a row by ID**, **Delete a row**, **Relate rows** and lookup values all find a row by that ID in one named table."),
    p("The error means the table has no row with that ID. The action normally shows status code 404. Dataverse does not tell you whether the row once existed.")
  ],
  causes: [
    ol(
      "The row was deleted between the trigger and the action. This is common in flows that start on a delete, or that wait before acting.",
      "The ID belongs to another table. A flow passes a contact's ID to an action on Accounts, often through a Customer or Regarding lookup that can point to either.",
      "The ID came from another environment. Rows copied between environments usually get new IDs, so an ID stored in a variable, a list or a configuration row in development does not exist in production.",
      "The value is not the row's ID. It is the row's name, a different column, or the full address of the row.",
      "The trigger is on **Deleted**. The row is already gone, and only its ID is available."
    )
  ],
  fixes: [
    p("**Check the ID that was sent.** Open the failed run, select the action and read **Row ID** in the inputs. Compare it with the ID in the row's address in a model-driven app, which is the value after `id=`."),
    p("**Use the unique identifier from dynamic content.** Each table has one item in dynamic content that is its ID, named after the table, such as **Project** with the description \"Unique identifier\". In an expression it is the table's logical name followed by `id`."),
    code(`triggerOutputs()?['body/cr1a2_projectid']`, "Expression"),
    p("**Check the table for multi-table lookups.** Read the lookup's type before deciding which table to query."),
    code(`triggerOutputs()?['body/_customerid_value@Microsoft.Dynamics.CRM.lookuplogicalname']`, "Expression"),
    p("That returns `account` or `contact`. Use a Condition or Switch on it and query the matching table."),
    p("**Handle a missing row on purpose.** There are two ways."),
    ul(
      "Add the next action, open its **Settings**, select **Run after** and tick **has failed** as well as **is successful**. Then check whether Get a row by ID succeeded before using its outputs.",
      "Replace Get a row by ID with **List rows** and a filter on the ID column, with **Row count** set to 1. No match gives an empty list, which you test with `empty()`."
    ),
    code(`cr1a2_projectid eq @{triggerOutputs()?['body/_cr1a2_project_value']}`, "Filter rows"),
    code(`empty(outputs('List_rows')?['body/value'])`, "Expression"),
    p("**Do not carry IDs between environments.** Find reference rows by something stable, such as a code column or an alternate key, in each environment. The [alternate key pattern](/patterns/dataverse-alternate-key-upsert-power-automate) shows how to address a row by key.")
  ],
  prevention: [
    ul(
      "On a Deleted trigger, do not try to read the row. Use only the values the trigger provides.",
      "Store IDs as lookups, which Dataverse keeps valid, and not as text.",
      "Keep environment-specific values in environment variables, set per environment. See [environment variables](/patterns/dataverse-environment-variables-canvas-apps-flows).",
      "Put row lookups that can miss inside a scope with error handling. See the [Try and Catch pattern](/patterns/power-automate-try-catch-scope-error-handling)."
    ),
    note("Update a row does not raise this error for a missing ID. Microsoft's documentation says it creates a new row with that ID. If rows appear that nobody created, check the IDs passed to Update a row.")
  ],
  faqs: [
    { question: "Why does Get a row by ID fail when the row exists?", answer: "The ID is probably for a different table, or the Table name in the action is wrong. Compare the ID in the action's inputs with the ID in the row's address." },
    { question: "How do I check whether a Dataverse row exists without failing the flow?", answer: "Use List rows with a filter on the ID column and Row count set to 1, then test the result with empty(). An ID that matches nothing returns an empty list and no error." },
    { question: "Why do IDs from my development environment not work in production?", answer: "Rows created or imported in another environment usually have different IDs. Look rows up by a stable value such as a code or an alternate key, or keep the ID in an environment variable that is set in each environment." },
    { question: "Can I read a row in a flow that triggers on delete?", answer: "No. The row is already deleted when the flow runs. The trigger provides the row's ID, and any other details must have been stored somewhere else beforehand." }
  ],
  relatedTools: ["power-automate-expression-builder"],
  relatedPatterns: ["dataverse-alternate-key-upsert-power-automate", "power-automate-try-catch-scope-error-handling", "dataverse-environment-variables-canvas-apps-flows", "configuration-migration-tool-reference-data"],
  relatedLinks: [
    { href: "/guides/power-automate-dataverse-quick-start", label: "Dataverse connector quick start" },
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  relatedErrors: ["resource-not-found-for-the-segment-dataverse", "principal-user-is-missing-privilege-dataverse", "record-with-matching-key-values-already-exists-dataverse"],
  sources: [clientErrorsDoc, automateDoc("dataverse/get-row-id", "Get a row by ID from Dataverse"), updateRowDoc, listRowsDoc]
};

const duplicateKey: ErrorPage = {
  ...base,
  slug: "record-with-matching-key-values-already-exists-dataverse",
  message: "A record with matching key values already exists",
  title: "Fix \"A record with matching key values already exists\" in a Dataverse flow",
  shortTitle: "A record with matching key values already exists",
  description: "Why Dataverse rejects a new row as a duplicate: alternate keys, reused IDs and parallel runs, and how to fix it with an upsert, a check before create, or lower concurrency.",
  keywords: ["A record with matching key values already exists", "Cannot insert duplicate key", "0x80040237", "Dataverse alternate key duplicate Power Automate", "Dataverse upsert flow"],
  quickAnswer: "The flow tried to create a row whose key already belongs to another row. The key is either the row's ID or an alternate key, which is a column or set of columns that the table requires to be unique. If the row is meant to exist once, update it when it is already there, using an upsert addressed by the alternate key. If the error comes and goes, two runs or two loop branches are creating the same row at the same moment.",
  variants: [
    "Cannot insert duplicate key",
    "Entity Key ... violated. A record with the same value for ... already exists. A duplicate record cannot be created.",
    "0x80040237"
  ],
  meaning: [
    p("Dataverse will not store two rows with the same key in one table. Every table has a primary key, the row's ID. A table can also have **alternate keys**: one or more columns, such as an order number, that are defined as unique."),
    p("The error is Dataverse refusing a create or update that would produce a second row with the same key. It normally arrives with status code 412. It protects the data, so the fix is to change what the flow does when the row is already there.")
  ],
  causes: [
    ol(
      "The table has an alternate key, and the flow adds a row with a key value that is already used. Imports that run more than once are the usual source.",
      "The flow passes an explicit row ID to **Add a new row**, and a row with that ID exists.",
      "Two runs of the flow started close together for the same item, and both tried to create the row.",
      "An **Apply to each** with concurrency turned on handles two items with the same key at once.",
      "The error comes from an approval action. Microsoft documents this as a brief timing problem inside the approvals tables."
    )
  ],
  fixes: [
    p("**Find the key.** In Power Apps, open the table and select **Keys**. Each key lists its columns. Compare them with the values in the failed action's inputs."),
    p("**Upsert by alternate key.** One action creates the row if it is missing and updates it if it exists. Use **Update a row**, and in **Row ID** enter the key column and its value in place of a GUID. Then fill in the other columns as usual."),
    code(`cr1a2_ordernumber='SO-10482'

cr1a2_ordernumber='@{items('Apply_to_each')?['OrderNumber']}'`, "Row ID"),
    p("Text values need single quotes and numbers do not. The key must show as **Active** on the table before this works."),
    p("The [alternate key upsert pattern](/patterns/dataverse-alternate-key-upsert-power-automate) builds this step by step, including keys made of several columns."),
    p("**Or check first, then create or update.**"),
    ol(
      "Add **List rows** with a filter on the key column and **Row count** set to 1.",
      "Add a **Condition** that tests whether the result is empty.",
      "If it is empty, **Add a new row**. If not, **Update a row** with the ID of the row that was found."
    ),
    code(`cr1a2_ordernumber eq 'SO-10482'`, "Filter rows"),
    code(`empty(outputs('List_rows')?['body/value'])`, "Condition: is equal to true"),
    p("Check-then-create still fails when two runs check at the same moment. Combine it with the next fix."),
    p("**Stop parallel creates.** Turn off concurrency on the Apply to each that adds rows, or remove duplicates from the array first with `union`. To stop two runs overlapping, open the trigger's **Settings** and set **Concurrency control** to 1. Turning it on cannot be undone without adding the trigger again."),
    code(`union(body('Select'), body('Select'))`, "Expression"),
    p("**For approvals, run it again.** If the failing action is an approval, Microsoft's guidance is to retry the action. Resubmit the run.")
  ],
  prevention: [
    ul(
      "Decide for each flow whether a repeat should update the row or be ignored, and build that in from the start.",
      "Give tables that receive imports an alternate key, and always write to them with an upsert.",
      "Do not pass explicit IDs to Add a new row unless you are copying rows on purpose.",
      "Let the default retry policy handle brief conflicts, and put the create in a scope with error handling for the rest. See the [Try and Catch pattern](/patterns/power-automate-try-catch-scope-error-handling)."
    ),
    p("Alternate keys are different from duplicate detection rules, which warn people in apps and are not enforced on flows by default. The [duplicate detection pattern](/patterns/dataverse-duplicate-detection-rules-keys) compares the two.")
  ],
  faqs: [
    { question: "What is an alternate key in Dataverse?", answer: "It is one or more columns that a table requires to be unique across all rows, such as an order number or an email address. Dataverse rejects any create or update that would give two rows the same key." },
    { question: "What is an upsert in Dataverse?", answer: "It is a single operation that updates the row if it exists and creates it if it does not. In a flow, the Update a row action does this when its Row ID is a GUID or an alternate key value." },
    { question: "Why does the error only happen sometimes?", answer: "Two runs or two parallel loop branches are trying to create the same row at the same time. One succeeds and the other is rejected. Turn off loop concurrency, limit trigger concurrency to 1, or use an upsert." },
    { question: "Why do I get this error from an approval action?", answer: "Microsoft documents it as a temporary timing conflict when an approval is created or updated. Run the action again, for example by resubmitting the flow run." }
  ],
  relatedTools: ["odata-filter-query-builder"],
  relatedPatterns: ["dataverse-alternate-key-upsert-power-automate", "dataverse-duplicate-detection-rules-keys", "apply-to-each-concurrency-variables-power-automate", "dataverse-dataflow-import-excel-upsert"],
  relatedLinks: [
    { href: "/guides/power-automate-dataverse-quick-start", label: "Dataverse connector quick start" },
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" }
  ],
  relatedErrors: ["412-precondition-failed-etag-mismatch", "entity-with-id-does-not-exist-dataverse", "required-field-assignedto-contained-no-valid-users"],
  sources: [
    clientErrorsDoc,
    learnDoc("troubleshoot/power-platform/power-automate/approvals/common-errors-creating-and-assigning-flow-approvals", "Common errors creating and assigning Power Automate Approvals"),
    learnDoc("power-apps/maker/data-platform/define-alternate-keys-portal", "Define alternate keys"),
    updateRowDoc
  ]
};

export const dataverseErrors: ErrorPage[] = [
  resourceNotFound,
  undeclaredProperty,
  propertyNotFound,
  missingPrivilege,
  rowDoesNotExist,
  duplicateKey
];
