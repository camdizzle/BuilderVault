import { automateDoc, code, learnDoc, note, ol, p, section, table, ul, type Guide } from "./types";

const published = "2026-11-21";
const eyebrow = "Power Automate connectors";

export const outlookCalendarQuickStartGuide: Guide = {
  slug: "power-automate-outlook-calendar-quick-start",
  title: "Outlook calendar in Power Automate: event triggers, create events and find free times",
  shortTitle: "Outlook calendar quick start",
  description: "How to start a flow from a calendar event, create and update meetings, read a day's events including repeats, handle time zones, and build a flow that books a meeting from a SharePoint request.",
  eyebrow,
  keywords: ["Power Automate create calendar event", "Power Automate Outlook calendar", "When an upcoming event is starting soon", "Get calendar view of events", "Power Automate meeting time zone"],
  published,
  updated: published,
  quickAnswer: "The calendar actions are part of the Office 365 Outlook connector and work on the calendars of the account in the connection. Create event adds a meeting, Get calendar view of events lists what is on between two times with recurring meetings expanded, and When an upcoming event is starting soon fires shortly before each event. Set the time zone on Create event explicitly, because times you pass in are read in that zone, and treat times that come back as UTC unless you convert them.",
  sections: [
    section(
      "where",
      "Where the calendar actions are",
      p("There is no separate calendar connector. Open **Office 365 Outlook** and you find the calendar triggers and actions alongside the email ones. The [Outlook email quick start](/guides/power-automate-outlook-quick-start) covers the mail side."),
      p("Every action works as the account that signed in to the connection. Events you create appear as sent by that account, and attendees see that person as the organiser. For a team process, use a shared mailbox's calendar the account has access to, or a service account, so meetings do not come from one person's calendar.")
    ),
    section(
      "triggers",
      "Triggers",
      table(
        ["Trigger", "Fires when"],
        ["When an event is created (V3)", "A new event appears in the chosen calendar"],
        ["When an event is modified (V3)", "An event in the calendar changes"],
        ["When an event is added, updated or deleted (V3)", "Any of the three, with the kind of change in the output"],
        ["When an upcoming event is starting soon (V3)", "An event is about to start, a set number of minutes ahead"]
      ),
      p("Each trigger watches one calendar, chosen by **Calendar id**. The \"starting soon\" trigger is the usual way to send a reminder or prepare a Teams post before a meeting."),
      note("A flow that creates or updates events in the calendar it watches can start itself again. Add a trigger condition, or write to a different calendar. The [trigger conditions guide](/guides/power-automate-trigger-conditions-guide) shows how.")
    ),
    section(
      "actions",
      "Actions worth knowing",
      table(
        ["Action", "What it does"],
        ["Create event (V4)", "Adds an event, with attendees, location, body and reminders"],
        ["Update event (V4)", "Changes an event by its id"],
        ["Delete event (V2)", "Removes an event by its id"],
        ["Get event (V3)", "Reads one event by its id"],
        ["Get events (V4)", "Lists events in a calendar, with optional filter and order"],
        ["Get calendar view of events (V3)", "Lists events between a start and end time, with each occurrence of a repeating meeting as its own item"],
        ["Find meeting times (V2)", "Suggests times when the attendees are free"],
        ["Respond to an event invite (V2)", "Accepts, tentatively accepts or declines an invitation"]
      ),
      p("For \"what is on today\" or \"this week\", use **Get calendar view of events**. **Get events** returns a repeating meeting as one series, so a weekly meeting does not appear once per week.")
    ),
    section(
      "time-zones",
      "Time zones",
      p("This is where most calendar flows go wrong."),
      ul(
        "**Create event** and **Update event** have a **Time zone** field. The start and end times you pass are read in that zone. Choose it explicitly rather than leaving it to the default.",
        "Pass times without an offset, in the form `yyyy-MM-ddTHH:mm:ss`, so the time zone field decides what they mean.",
        "Times returned by the triggers and the list actions are in UTC in most cases. Convert them with `convertFromUtc()` or the **Convert time zone** action before you show them to people."
      ),
      code(`convertFromUtc(triggerOutputs()?['body/start'], 'GMT Standard Time', 'dd MMM yyyy HH:mm')`, "Expression"),
      p("The [time zone conversion pattern](/patterns/convert-time-zone-format-date-power-automate) has more examples, and the [expressions guide](/guides/power-automate-expressions-explained) explains the functions.")
    ),
    section(
      "example",
      "Example: book a meeting from a SharePoint request",
      p("A SharePoint list holds meeting requests with a title, a requester, a date and a duration. When an item is approved, the flow books the meeting and writes the event id back to the item."),
      ol(
        "Trigger: SharePoint **When an item is created or modified**, with a trigger condition so it only runs when Status is Approved and EventId is empty.",
        "**Compose** the start time from the item's date and start time, such as `formatDateTime(triggerBody()?['MeetingDate'], 'yyyy-MM-ddT') & triggerBody()?['StartTime'] & ':00'`.",
        "**Create event (V4)**: calendar, subject from the title, start from the Compose, end as `addMinutes(outputs('Compose'), triggerBody()?['Duration'])` formatted the same way, time zone set to your office's zone, required attendees from the requester's email.",
        "SharePoint **Update item**: write the event's id to EventId, so the trigger condition stops the flow running again and a later flow can update or cancel the meeting."
      ),
      p("Store the event id whenever you create an event. Without it, a later change or cancellation has to search the calendar by subject and time, which is unreliable.")
    ),
    section(
      "free-times",
      "Finding a free slot",
      p("**Find meeting times (V2)** takes the attendees, a time window and a duration, and returns suggestions with a confidence score. Use the first suggestion to create the event, or send the options to the requester in an approval or a Teams adaptive card. The [adaptive card pattern](/patterns/post-adaptive-card-and-wait-for-response) shows how to ask and wait for an answer.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Leaving the time zone to chance.** Meetings land an hour or more out after a daylight saving change.",
        "**Using Get events for a day's agenda.** Repeating meetings are returned once, as a series. Use the calendar view.",
        "**Not storing the event id.** Updates and cancellations then need fragile searches.",
        "**Creating events from a personal connection** for a team process. When that person leaves, the meetings and the flow break. See [handing over flows](/guides/hand-over-power-automate-flows-when-someone-leaves)."
      )
    )
  ],
  faqs: [
    { question: "How do I create a calendar event in Power Automate?", answer: "Use Create event (V4) from the Office 365 Outlook connector. Choose the calendar, give a subject, a start and end time without an offset, and set the Time zone field to the zone those times are in." },
    { question: "Why is my Power Automate meeting at the wrong time?", answer: "The start and end were read in a different time zone from the one you meant. Set the Time zone field on Create event explicitly and pass times without a UTC offset." },
    { question: "How do I get today's meetings including recurring ones?", answer: "Use Get calendar view of events with today's start and end. It returns each occurrence of a repeating meeting. Get events returns the series instead." }
  ],
  relatedTools: ["power-automate-expression-builder", "trigger-condition-builder"],
  relatedPatterns: ["convert-time-zone-format-date-power-automate", "power-automate-compose-date-formatting", "post-adaptive-card-and-wait-for-response", "power-automate-reminder-before-due-date"],
  relatedLinks: [
    { href: "/guides/power-automate-outlook-quick-start", label: "Outlook email quick start" },
    { href: "/guides/power-automate-sharepoint-quick-start", label: "SharePoint quick start" }
  ],
  sources: [
    learnDoc("connectors/office365/", "Office 365 Outlook connector reference"),
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows")
  ]
};

export const sqlServerQuickStartGuide: Guide = {
  slug: "power-automate-sql-server-quick-start",
  title: "SQL Server in Power Automate: gateways, row triggers, queries and stored procedures",
  shortTitle: "SQL Server connector quick start",
  description: "How to connect a flow to SQL Server or Azure SQL, when you need an on-premises data gateway, what the row triggers need from your table, how to read and write rows, and when to call a stored procedure instead.",
  eyebrow,
  keywords: ["Power Automate SQL Server", "Power Automate on-premises data gateway SQL", "SQL Server When an item is created", "Power Automate execute stored procedure", "Power Automate Get rows SQL"],
  published,
  updated: published,
  quickAnswer: "The SQL Server connector is premium and works with SQL Server, Azure SQL Database and Azure SQL Managed Instance. A database inside your network needs an on-premises data gateway; an Azure SQL database does not. Use Get rows (V2) with a filter to read, Insert row and Update row to write, and Execute stored procedure for anything that touches several tables. The row triggers need an identity column to detect new rows and a rowversion column to detect changes.",
  sections: [
    section(
      "connect",
      "Connect, with or without a gateway",
      table(
        ["Database", "Gateway needed", "Typical sign-in"],
        ["SQL Server on your own network", "Yes, an on-premises data gateway", "SQL Server authentication or Windows authentication"],
        ["Azure SQL Database or Managed Instance", "No", "Microsoft Entra ID or SQL Server authentication"]
      ),
      p("An **on-premises data gateway** is a Windows service you install on a machine that can reach the database. It relays requests between Power Automate and the database, so you do not open the database to the internet. One gateway can serve several data sources and several people. Install it on a server that stays on, not a laptop, and add a second gateway admin so you are not the only person who can manage it."),
      p("SQL Server is a premium connector, so the flow's owner needs a premium Power Automate licence.")
    ),
    section(
      "triggers",
      "Row triggers and what your table needs",
      table(
        ["Trigger", "Needs a column of type"],
        ["When an item is created (V2)", "`IDENTITY`, to know which rows are new"],
        ["When an item is modified (V2)", "`ROWVERSION` (also called timestamp), to know which rows changed"]
      ),
      p("The triggers poll the table. Without the right column they cannot tell what is new or changed, and the table does not appear or the trigger never fires. If you cannot change the table, schedule the flow instead and select rows with a filter on a date column you control."),
      code(`ALTER TABLE dbo.Requests ADD RowVer ROWVERSION;`, "SQL")
    ),
    section(
      "read-write",
      "Reading and writing rows",
      table(
        ["Action", "Use it to"],
        ["Get rows (V2)", "Read rows, with Filter Query, Order By, Top Count and Select Query"],
        ["Get row (V2)", "Read one row by its primary key"],
        ["Insert row (V2)", "Add a row"],
        ["Update row (V2)", "Change a row by its primary key"],
        ["Delete row (V2)", "Remove a row by its primary key"],
        ["Execute stored procedure (V2)", "Run a stored procedure with parameters and get its result sets"],
        ["Execute a SQL query (V2)", "Run a query you write"]
      ),
      p("**Filter in the action, not afterwards.** Get rows takes an OData filter, such as `Status eq 'Open' and DueDate lt '2026-12-01'`, which the connector runs in the database. Pulling every row and filtering with **Filter array** is slower and stops at the page size. Turn on **Pagination** in the action's settings when you expect many rows."),
      p("Get row, Update row and Delete row work by primary key, so the table needs one. Views can be read but usually not written to.")
    ),
    section(
      "procedures",
      "When to use a stored procedure",
      p("Use a stored procedure when the work involves several tables, needs a transaction, or has business rules the database team already owns. The flow passes parameters and the procedure does the rest in one call, so you are not looping through rows in the flow."),
      code(`CREATE PROCEDURE dbo.CloseRequest @RequestId INT, @ClosedBy NVARCHAR(200)
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Requests SET Status = 'Closed', ClosedBy = @ClosedBy, ClosedOn = SYSUTCDATETIME()
  WHERE RequestId = @RequestId;
  INSERT INTO dbo.RequestLog (RequestId, Action, ActionBy) VALUES (@RequestId, 'Closed', @ClosedBy);
END`, "SQL"),
      note("Give the connection's account only the rights it needs: execute on the procedures the flow calls, and read or write on specific tables, rather than a database owner role.")
    ),
    section(
      "example",
      "Example: copy approved SharePoint requests into SQL",
      ol(
        "Trigger: SharePoint **When an item is created or modified**, with a trigger condition for Status equal to Approved.",
        "SQL Server **Get rows (V2)** with Filter Query `SharePointId eq @{triggerBody()?['ID']}` and Top Count 1, to see whether the request is already in the table.",
        "**Condition** on `length(body('Get_rows_(V2)')?['value'])` equal to 0.",
        "Yes branch: **Insert row (V2)** with the SharePoint ID, title, requester email and dates.",
        "No branch: **Update row (V2)** using the primary key returned by Get rows."
      ),
      p("Storing the SharePoint ID in its own column is what makes the flow safe to run twice. A unique index on that column stops duplicates even if two runs overlap.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Expecting a trigger on a table without identity or rowversion columns.** Add the column, or use a schedule.",
        "**Installing the gateway on a personal laptop.** Flows stop whenever it sleeps.",
        "**Looping through rows to update them one at a time.** Use a filter, a stored procedure or a set-based query.",
        "**Building a SQL query by joining text from user input.** Pass values as stored procedure parameters instead."
      )
    )
  ],
  faqs: [
    { question: "Do I need a gateway to use SQL Server in Power Automate?", answer: "Only for a database on your own network. Azure SQL Database and Azure SQL Managed Instance connect directly. An on-premises SQL Server needs an on-premises data gateway installed on a machine that can reach it." },
    { question: "Why does the SQL Server trigger not show my table?", answer: "When an item is created needs an IDENTITY column and When an item is modified needs a ROWVERSION column. Add the column or run the flow on a schedule instead." },
    { question: "Is the SQL Server connector premium?", answer: "Yes. The flow's owner needs a premium Power Automate licence, or the flow needs a per-flow or Process licence." }
  ],
  relatedTools: ["odata-filter-query-builder", "trigger-condition-builder"],
  relatedPatterns: ["chunk-array-into-batches-power-automate", "power-automate-try-catch-scope-error-handling", "secure-inputs-outputs-hide-run-history-power-automate"],
  relatedLinks: [
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" },
    { href: "/guides/filter-query-vs-filter-array-vs-condition", label: "Where to filter data in a flow" }
  ],
  sources: [
    automateDoc("gateway-reference", "What is an on-premises data gateway?"),
    automateDoc("gateway-manage", "Manage your on-premises data gateways"),
    learnDoc("connectors/sql/", "SQL Server connector reference")
  ]
};

export const customConnectorQuickStartGuide: Guide = {
  slug: "power-automate-custom-connector-quick-start",
  title: "Custom connectors in Power Automate: wrap an API so every flow can use it",
  shortTitle: "Custom connector quick start",
  description: "When a custom connector beats the HTTP action, the five steps of the wizard, choosing an authentication type, defining an action from a sample request, testing, sharing and moving it between environments.",
  eyebrow,
  keywords: ["Power Automate custom connector", "create custom connector OpenAPI", "custom connector OAuth 2.0", "custom connector vs HTTP action", "share custom connector"],
  published,
  updated: published,
  quickAnswer: "A custom connector describes an API once, its address, sign-in and actions, so makers can use it in flows and apps like any built-in connector, with dynamic content and no headers to type. Create it in Power Automate from blank, from an OpenAPI file or from a Postman collection, then fill in General, Security, Definition, optionally Code, and Test. Custom connectors are premium. Use one when several flows or apps call the same API; for a single call, the HTTP action is quicker.",
  sections: [
    section(
      "when",
      "Custom connector or HTTP action",
      table(
        ["", "HTTP action", "Custom connector"],
        ["Setup", "None: type the request in the flow", "Define the API once"],
        ["Sign-in", "Headers and secrets in each flow", "A connection, like any connector"],
        ["Output", "Raw JSON you parse yourself", "Named fields as dynamic content"],
        ["Reuse", "Copy the action between flows", "Every maker who has it shared with them"],
        ["Works in Power Apps", "Only through a flow", "Yes, directly"]
      ),
      p("Both are premium. The [HTTP quick start](/guides/power-automate-http-quick-start) covers the HTTP action. Pick a custom connector when an API will be used by more than a couple of flows, or by a canvas app.")
    ),
    section(
      "steps",
      "The five steps",
      ol(
        "**Create.** In Power Automate, open **Custom connectors** (under **Data**, or **More** in the left menu, depending on your version) and choose **New custom connector**. Start from blank, or import an OpenAPI definition or a Postman collection if the API provider publishes one.",
        "**General.** The host, such as `api.contoso.com`, the base path, an icon and a description.",
        "**Security.** How callers sign in: no authentication, an API key, basic authentication or OAuth 2.0.",
        "**Definition.** The actions and triggers, each with a request and a response.",
        "**Test.** Create a connection and call each action with real values."
      ),
      p("A **Code** step between Definition and Test lets you transform requests and responses in C#. Most connectors do not need it.")
    ),
    section(
      "security",
      "Choosing the authentication type",
      table(
        ["Type", "Use when", "Watch out for"],
        ["API key", "The API takes a key in a header or query", "Each person's connection holds a key. Decide whether everyone shares one."],
        ["Basic authentication", "An older API with a username and password", "The password is stored in each connection."],
        ["OAuth 2.0", "The API uses sign-in, as Microsoft Graph and most SaaS APIs do", "You need an app registration and its redirect URL, which the wizard shows after you save."],
        ["No authentication", "A public API", "Anyone with the URL can call it anyway."]
      ),
      p("For OAuth 2.0 with a Microsoft Entra ID app, register the app, copy the client id and secret into the Security step, save, then add the redirect URL that the connector shows to the app registration. A mismatch there is the most common reason the first sign-in fails.")
    ),
    section(
      "definition",
      "Defining an action from a sample",
      ol(
        "In **Definition**, choose **New action** and give it a summary and an operation id, such as `GetCustomer`. The summary is what makers see.",
        "Under **Request**, choose **Import from sample**, pick the method, paste a full example URL such as `https://api.contoso.com/v1/customers/{id}`, and any headers and body.",
        "Under **Response**, choose the default response and **Import from sample**, then paste a real response body.",
        "Open each parameter to give it a friendly name, mark it required or not, and set its visibility, so the action is easy to fill in."
      ),
      p("The response sample becomes the dynamic content makers pick from. Paste a full, realistic response, including fields that are sometimes empty, so they all appear.")
    ),
    section(
      "share",
      "Testing, sharing and moving it",
      ul(
        "**Test** in the wizard with a real connection and read the raw response if a call fails.",
        "**Share** the connector with the people or groups who build flows with it. Each of them still creates their own connection.",
        "**Solutions:** create or add the connector inside a solution so it moves to test and production with the flows that use it.",
        "**Data policies:** administrators can classify custom connectors in data loss prevention policies, and can allow or block them by host. Check your environment's policy before you build."
      ),
      note("Store the client secret or API key in an environment variable backed by Azure Key Vault where your platform team supports it, rather than typing it into each environment. See the [Key Vault pattern](/patterns/environment-variable-secrets-azure-key-vault).")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Building a connector for one call.** The HTTP action is quicker to set up and maintain.",
        "**Skipping the redirect URL** in the app registration, so OAuth sign-in fails.",
        "**A thin response sample**, so fields that are sometimes missing never appear as dynamic content.",
        "**Creating it outside a solution**, then rebuilding it by hand in each environment."
      )
    )
  ],
  faqs: [
    { question: "Are custom connectors premium in Power Automate?", answer: "Yes. A flow that uses a custom connector needs its owner to have a premium licence, or the flow to have a per-flow or Process licence." },
    { question: "Can I create a custom connector from an OpenAPI file?", answer: "Yes. Choose Import an OpenAPI file or Import an OpenAPI from URL when creating the connector, then review each step of the wizard. A Postman collection works too." },
    { question: "Do people need their own connection to a shared custom connector?", answer: "Yes. Sharing the connector lets people use its definition. Each person still creates a connection with their own sign-in, unless a connection is shared with them as well." }
  ],
  relatedTools: ["parse-json-schema-generator"],
  relatedPatterns: ["http-oauth-client-credentials-graph-power-automate", "environment-variable-secrets-azure-key-vault", "dlp-connector-endpoint-filtering-action-control"],
  relatedLinks: [
    { href: "/guides/power-automate-http-quick-start", label: "HTTP action and trigger quick start" },
    { href: "/errors/401-unauthorized-power-automate", label: "Error: 401 Unauthorized" }
  ],
  sources: [
    learnDoc("connectors/custom-connectors/", "Custom connectors overview"),
    learnDoc("connectors/custom-connectors/define-blank", "Create a custom connector from scratch"),
    learnDoc("troubleshoot/power-platform/power-automate/connections/verify-oauth-configuration", "Verify OAuth configuration for custom connectors"),
    learnDoc("power-platform/admin/dlp-custom-connector-parity", "Data policies for custom connectors")
  ]
};
