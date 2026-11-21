import { automateDoc, code, learnDoc, note, ol, p, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-20";
const eyebrow = "Power Automate connectors";

export const approvalsQuickStartGuide: Guide = {
  slug: "power-automate-approvals-quick-start",
  title: "Approvals in Power Automate: approval types, reading the outcome, custom responses and attachments",
  shortTitle: "Approvals connector quick start",
  description: "How to send an approval from a flow, choose between the five approval types, branch on the outcome, read comments, format the request with Markdown and attach files, with one complete flow.",
  eyebrow,
  keywords: ["Power Automate approval tutorial", "Start and wait for an approval", "Power Automate approval outcome", "approval custom responses Power Automate", "Power Automate approval types"],
  published,
  updated: published,
  quickAnswer: "Add Start and wait for an approval, choose an approval type, and fill in Title and Assigned to with email addresses separated by semicolons. The flow pauses until people respond. Then add a Condition on the Outcome, which is Approve or Reject for the standard types and the chosen option for custom responses. Comments and the names of the people who answered are in the Responses list. The connector is standard, so a Microsoft 365 licence is enough.",
  sections: [
    section(
      "actions",
      "The three actions",
      table(
        ["Action", "What it does"],
        ["Start and wait for an approval", "Sends the request and pauses the flow until it is answered"],
        ["Create an approval", "Sends the request and moves straight on to the next step"],
        ["Wait for an approval", "Pauses the flow until an approval that was created earlier is answered"]
      ),
      p("**Start and wait for an approval** is the one to use in most flows. The other two are the same job cut in half. They let a flow do something between sending the request and waiting for it, such as posting the approval link in Teams or saving the approval's ID to a list."),
      p("Approvals are stored in Dataverse. The first approval sent in an environment sets up that storage, which takes a few minutes and needs an administrator of the environment to run the first flow. If the first run fails, see [the Dataverse database is not ready](/errors/approvals-dataverse-database-not-ready).")
    ),
    section(
      "types",
      "Choose an approval type",
      table(
        ["Approval type", "When the flow continues"],
        ["Approve/Reject - First to respond", "As soon as any one approver answers"],
        ["Approve/Reject - Everyone must approve", "When every approver has approved, or as soon as one rejects"],
        ["Custom Responses - Wait for one response", "As soon as any one approver picks one of your options"],
        ["Custom Responses - Wait for all responses", "When every approver has picked an option"],
        ["Sequential approval", "When each approver in turn has answered, one after another"]
      ),
      p("Pick **First to respond** when any member of a group can decide. Pick **Everyone must approve** when each named person has to agree. Pick **Sequential approval** for a chain such as manager, then finance, then director, where each step sees the request only after the step before it."),
      p("The type cannot be changed by dynamic content at run time. A flow that needs different types for different requests uses a **Switch** with one approval action per branch.")
    ),
    section(
      "fields",
      "Fill in the request",
      table(
        ["Field", "What to put in it"],
        ["Title", "One line that names the thing to approve, such as `Leave request: Ana Silva, 3 days`"],
        ["Assigned to", "Email addresses of people in your organisation, separated by semicolons"],
        ["Details", "The facts the approver needs to decide, with Markdown formatting"],
        ["Item link", "A web address the approver can open, such as the list item"],
        ["Item link description", "The text shown for that link"],
        ["Requestor", "The email address of the person asking, if it is not the flow's owner"],
        ["Enable notifications", "Whether the approver gets an email"],
        ["Enable reassignment", "Whether the approver can pass the request to someone else"]
      ),
      p("**Assigned to** needs user accounts. A display name, a shared mailbox or a distribution list fails with [no valid users in the organisation](/errors/required-field-assignedto-contained-no-valid-users). To send a request to a group, list the group's members first and join their addresses with semicolons."),
      p("Write the **Title** for an inbox. Approvers see it as the email subject and in the Teams notification, and many decide from the title and the first two lines of the details.")
    ),
    section(
      "outcome",
      "Read the outcome",
      p("The action returns an **Outcome** and a list named **Responses**. What the outcome holds depends on the type."),
      table(
        ["Approval type", "Outcome"],
        ["First to respond", "`Approve` or `Reject`"],
        ["Everyone must approve", "One `Approve` or `Reject` entry per response"],
        ["Custom responses, wait for one", "The text of the option that was picked"],
        ["Custom responses, wait for all", "One entry per response"]
      ),
      p("For **First to respond**, add a **Condition** that checks that **Outcome** is equal to `Approve`. The word is `Approve`, not `Approved`, and the comparison is exact."),
      p("For **Everyone must approve**, do not test for equality, because the outcome can hold one entry per approver. Test that it does not contain a rejection."),
      code(`not(contains(string(outputs('Start_and_wait_for_an_approval')?['body/outcome']), 'Reject'))`, "Condition"),
      p("For **custom responses**, use a **Switch** on the Outcome with one case per option. The case text must match the option exactly, including capital letters and spaces.")
    ),
    section(
      "responses",
      "Comments and who answered",
      p("Each entry in **Responses** holds one person's answer. Selecting a Responses item from dynamic content places the next action inside an **Apply to each**, because there can be several."),
      table(
        ["Dynamic content", "What it holds"],
        ["Responses Approver name", "The display name of the person who answered"],
        ["Responses Approver email", "Their email address"],
        ["Responses Response", "What that person chose"],
        ["Responses Comments", "The comment that person typed, if any"],
        ["Responses Response date", "When they answered"]
      ),
      p("When only one person can answer, skip the loop and read the first response with an expression."),
      code(`first(outputs('Start_and_wait_for_an_approval')?['body/responses'])?['comments']`, "Expression"),
      p("To write every comment into one field, build the text with a **Select** action over Responses and join the result."),
      code(`join(body('Select'), decodeUriComponent('%0A'))`, "Expression")
    ),
    section(
      "worked-flow",
      "A complete flow: approve a SharePoint list item",
      p("A list named Requests has a Choice column named Status with the values Pending, Approved and Rejected, a Person column named Approver, and a multi-line text column named ApproverComments."),
      ol(
        "Create an **Automated cloud flow** with the SharePoint trigger **When an item is created**. Pick the site and the Requests list.",
        "Add **Start and wait for an approval** and choose **Approve/Reject - First to respond**.",
        "Set **Title** to `Request:` followed by the item's Title. Set **Assigned to** to **Approver Email** from the trigger.",
        "In **Details**, list the facts from the item. Set **Item link** to **Link to item**.",
        "Add a **Condition** that checks that **Outcome** is equal to `Approve`.",
        "In the **True** branch, add **Update item** and set Status to Approved. In the **False** branch, add **Update item** and set Status to Rejected.",
        "In both Update item actions, set ApproverComments to the first-response expression from the section above."
      ),
      p("Use the trigger **When an item is created**, not **created or modified**. The flow updates the item, and a modified trigger would start a second approval for the flow's own change. The [status sync pattern](/patterns/power-automate-approval-with-sharepoint-status-sync) shows the same flow with a guard against repeats."),
      p("If the Approver column can be empty, check it before the approval and send the request to a fallback address. The [manager approval pattern](/patterns/power-automate-get-manager-approval-route) routes a request to the requester's manager.")
    ),
    section(
      "markdown-attachments",
      "Format the details and attach files",
      p("The **Details** box accepts Markdown. Use it to make the request easy to scan."),
      code(`**Amount:** 1,250.00 EUR
**Supplier:** Contoso Ltd
**Needed by:** 12 December 2026

| Item | Qty | Price |
|---|---|---|
| Laptop stand | 5 | 250.00 |`, "Details"),
      p("Not every place an approver reads the request shows Markdown in the same way. Microsoft's Markdown page says that headers, tables and bold text appear in Outlook and in Power Automate but not in Teams, and that images are not supported anywhere. Keep the layout simple, and leave a blank line between paragraphs so that Outlook breaks the lines."),
      p("To attach a file, open the advanced parameters and fill in **Attachments Name**, with the file extension, and **Attachments Content**, with the file content from an earlier action such as **Get file content**. For a large file, send a link in **Item link** instead, so that the approver always opens the current version.")
    ),
    section(
      "limits",
      "Time limits",
      p("A flow run can last 30 days, and an approval that is still waiting then ends as [timed out](/errors/approval-timed-out-after-30-days-power-automate). Plan for requests that nobody answers."),
      ul(
        "Open the approval action's **Settings** and set a **Timeout** such as `P7D`, which is seven days in ISO 8601 form.",
        "Add a step after the approval and set its **Run after** to **has timed out**, then remind the approver or pass the request to someone else.",
        "For approvals that can take longer than a month, split the work into a flow that creates the approval and a flow that reacts to the answer."
      ),
      p("The [approval timeout pattern](/patterns/power-automate-approval-timeout-escalation) has the full design."),
      note("If approvers say the email never arrived, the request is still in the Approvals app in Teams and in the Approvals page of Power Automate. See [approval email not received](/errors/approval-email-not-received-power-automate).")
    ),
    section(
      "mistakes",
      "Three mistakes to avoid on day one",
      ul(
        "**Comparing the outcome with `Approved`.** The value is `Approve`. The condition is false every time and every request is treated as rejected.",
        "**Separating approvers with commas.** The separator is a semicolon.",
        "**Starting the flow on created or modified.** The flow's own update starts it again. Trigger on created, or add a trigger condition on the status column."
      ),
      tool("trigger-condition-builder", "Build a trigger condition that runs the flow only while Status is Pending.")
    )
  ],
  faqs: [
    {
      question: "What does the Outcome of a Power Automate approval contain?",
      answer: "For Approve/Reject - First to respond it is the text Approve or Reject. For Everyone must approve and for custom responses that wait for all responses, it holds one entry per response. For custom responses that wait for one response, it is the text of the option that was picked."
    },
    {
      question: "How do I get the approver's comments in Power Automate?",
      answer: "Comments are in the Responses list returned by the approval action. Use the Responses Comments item inside an Apply to each, or read the first response with first(outputs('Start_and_wait_for_an_approval')?['body/responses'])?['comments']."
    },
    {
      question: "Do approvers need a Power Automate licence?",
      answer: "The Approvals connector is a standard connector, so a Microsoft 365 licence that includes Power Automate is enough to create approval flows and to respond to requests."
    },
    {
      question: "Can I send a Power Automate approval to several people?",
      answer: "Yes. Put their email addresses in Assigned to, separated by semicolons, and choose a type. First to respond needs one answer, Everyone must approve needs all of them, and Sequential approval asks each person in turn."
    },
    {
      question: "How long can a Power Automate approval wait?",
      answer: "A flow run can last 30 days, so an approval that is not answered in that time ends as timed out. Set a shorter timeout on the action and add a step that runs after a timeout to remind or escalate."
    }
  ],
  relatedTools: ["trigger-condition-builder", "power-automate-expression-builder", "adaptive-card-preview-snippets"],
  relatedPatterns: ["power-automate-approval-with-sharepoint-status-sync", "power-automate-get-manager-approval-route", "power-automate-approval-timeout-escalation", "power-automate-start-approval-from-power-apps"],
  relatedLinks: [
    { href: "/errors/required-field-assignedto-contained-no-valid-users", label: "Error: 'assignedTo' contained no valid users" },
    { href: "/errors/approval-timed-out-after-30-days-power-automate", label: "Error: Approval timed out after 30 days" },
    { href: "/guides/power-automate-teams-quick-start", label: "Teams connector quick start" }
  ],
  sources: [
    automateDoc("get-started-approvals", "Get started with approvals"),
    automateDoc("all-assigned-must-approve", "Create an approval flow that requires everyone to approve"),
    automateDoc("create-approval-response-options", "Create approval flows with custom responses"),
    automateDoc("approvals-markdown-support", "Use Markdown in approval requests"),
    automateDoc("approval-attachments", "Create approval flows with attachments"),
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows")
  ]
};

export const httpQuickStartGuide: Guide = {
  slug: "power-automate-http-quick-start",
  title: "HTTP in Power Automate: call an API with the HTTP action and start a flow from an HTTP request",
  shortTitle: "HTTP action and trigger quick start",
  description: "How to call a web API from a flow, read the JSON it returns, start a flow from an HTTP request, restrict who can call it, and send a response back, with the licence, timeout and security rules that apply.",
  eyebrow,
  keywords: ["Power Automate HTTP action", "When an HTTP request is received", "Power Automate call REST API", "Power Automate webhook trigger", "Power Automate HTTP request authentication"],
  published,
  updated: published,
  quickAnswer: "The HTTP action calls any web address with a method, headers and a body, and returns the status code and the response body. The trigger When an HTTP request is received gives the flow its own web address that other systems can call. Both are premium, so the flow's owner needs a Power Automate Premium licence. A call must be answered within 120 seconds. Keep keys and secrets out of the run history with secure inputs, and restrict the trigger to users in your tenant unless an outside system has to call it.",
  sections: [
    section(
      "two-parts",
      "Two different things named HTTP",
      table(
        ["", "HTTP action", "When an HTTP request is received"],
        ["Direction", "The flow calls another system", "Another system calls the flow"],
        ["Typical use", "Read or send data through a web API", "Receive a webhook, or let an app start a flow"],
        ["Licence", "Premium", "Premium"],
        ["Paired with", "Parse JSON, to read the answer", "Response, to answer the caller"]
      ),
      p("Before you reach for either, check whether a connector already does the job. A connector handles sign-in for you and is easier to maintain. For SharePoint, the standard action **Send an HTTP request to SharePoint** calls the SharePoint API on the existing connection with no premium licence. The [SharePoint HTTP pattern](/patterns/send-http-request-to-sharepoint-power-automate) shows how, and the [SharePoint HTTP request builder](/tools/sharepoint-http-request-builder) writes the request for you."),
      note("Administrators can block the HTTP connectors with a data loss prevention policy. If the flow will not save or is switched off as soon as you add one, see [the DLP error page](/errors/app-not-compliant-data-loss-prevention-policies).")
    ),
    section(
      "http-action",
      "Call an API with the HTTP action",
      table(
        ["Field", "What to put in it"],
        ["Method", "GET to read, POST to create, PATCH or PUT to change, DELETE to remove"],
        ["URI", "The full web address, starting with `https://`"],
        ["Headers", "One row per header, such as `Content-Type` and `application/json`"],
        ["Queries", "One row per query string value, so that you do not have to build the address by hand"],
        ["Body", "The content to send, for POST, PATCH and PUT"]
      ),
      p("A POST that sends JSON needs the header `Content-Type` set to `application/json`. Without it, many APIs reject the body or read it as plain text."),
      code(`{
  "title": "@{triggerBody()?['Title']}",
  "amount": @{triggerBody()?['Amount']},
  "requestedBy": "@{triggerBody()?['Author']?['Email']}"
}`, "Body"),
      p("Text values need quotation marks around the dynamic content. Numbers and true or false values do not. Put values in the **Queries** rows where you can, because the action encodes spaces and symbols for you there. In the URI you have to encode them yourself."),
      code(`encodeUriComponent(triggerBody()?['Title'])`, "Expression")
    ),
    section(
      "read-response",
      "Read what comes back",
      p("The action returns a **Status code**, **Headers** and a **Body**. To use values from a JSON body as dynamic content, add a **Parse JSON** action with the Body as its content and a schema that describes it."),
      tool("parse-json-schema-generator", "Paste a sample response and get a Parse JSON schema that tolerates empty values."),
      p("For one or two values, an expression is quicker than Parse JSON."),
      code(`body('HTTP')?['data']?['id']`, "Expression"),
      p("The question marks matter. Without them, a missing property stops the flow with an error. With them, the expression returns null and the flow carries on. The [Parse JSON guide](/guides/power-automate-parse-json-guide) covers arrays and optional values.")
    ),
    section(
      "authentication",
      "Authentication on the HTTP action",
      p("Open the action's advanced parameters and choose an **Authentication type**."),
      table(
        ["Type", "Use it when"],
        ["None", "The API is public, or you send a key in a header yourself"],
        ["Basic", "The API takes a user name and a password"],
        ["Client certificate", "The API identifies callers by a certificate"],
        ["Active Directory OAuth", "The API is protected by Microsoft Entra ID, such as Microsoft Graph"],
        ["Raw", "You already have the full value of the Authorization header"]
      ),
      p("For **Active Directory OAuth**, an administrator registers an application in Microsoft Entra ID and gives you a tenant ID, a client ID, a secret and an audience, which is the address of the API. The [Graph client credentials pattern](/patterns/http-oauth-client-credentials-graph-power-automate) walks through each box."),
      p("**Do not type a key or secret straight into the action.** Anyone who can open the flow or its run history can read it. Keep the value in an environment variable that points at Azure Key Vault, and turn on **Secure inputs** and **Secure outputs** in the action's settings so the run history hides it. See the [Key Vault pattern](/patterns/environment-variable-secrets-azure-key-vault) and the [secure inputs pattern](/patterns/secure-inputs-outputs-hide-run-history-power-automate).")
    ),
    section(
      "errors-retries",
      "Failures, retries and timeouts",
      ul(
        "A status code from 200 to 299 counts as success. Anything else makes the action fail.",
        "The action retries on its own when the call times out or the API answers with 408, 429 or a 5xx code. You can change or switch off the retry policy in the action's **Settings**.",
        "A call must be answered within **120 seconds**. An API that takes longer needs to answer straight away with 202 and a `Location` header that the flow can check for the result. The action follows that pattern by default while **Asynchronous pattern** is on in its settings.",
        "One call can carry up to 100 MB."
      ),
      p("To handle a failure yourself, add a step after the HTTP action and set its **Run after** to **has failed** and **has timed out**. Inside it, the status code tells you what went wrong."),
      code(`outputs('HTTP')?['statusCode']`, "Expression"),
      p("A 401 means the credentials were not accepted and a 403 means they were accepted but lack permission. The [try, catch and finally pattern](/patterns/power-automate-try-catch-scope-error-handling) shows how to group steps and handle their errors in one place.")
    ),
    section(
      "request-trigger",
      "Start a flow from an HTTP request",
      ol(
        "Create an **Instant cloud flow** and choose the trigger **When an HTTP request is received**.",
        "Set **Who can trigger the flow**. The choices are explained in the next section.",
        "Select **Use sample payload to generate schema** and paste an example of the JSON the caller will send. The properties then appear as dynamic content.",
        "Set **Method** in the advanced parameters, usually POST, so that other methods are refused.",
        "Add at least one action and **save** the flow. The **HTTP URL** appears on the trigger only after the first save."
      ),
      p("Values that are not in the body are read with expressions."),
      table(
        ["Value", "Expression"],
        ["A header", "`triggerOutputs()?['headers']?['x-request-id']`"],
        ["A query string value such as `?id=42`", "`triggerOutputs()?['queries']?['id']`"],
        ["The whole body", "`triggerBody()`"]
      ),
      p("The schema is a convenience for the designer and not a gatekeeper. A caller that leaves out a property still starts the flow, and the missing value arrives as null. Check the values you depend on before you use them.")
    ),
    section(
      "who-can-call",
      "Control who can call the flow",
      table(
        ["Setting", "Who can start the flow"],
        ["Any user in my tenant", "Any caller that presents a valid Microsoft Entra ID token from your tenant. This is the default for new flows."],
        ["Specific users in my tenant", "Only the users or service principals you list"],
        ["Anyone", "Any caller that has the URL"]
      ),
      p("With **Anyone**, the web address is the only protection. It contains a signature after `sig=` that works like a password, so treat the whole address as a secret: do not paste it into chats, tickets or source code. Outside systems that cannot sign in to Microsoft Entra ID, such as most webhook senders, need this setting."),
      p("With the two tenant settings, the caller has to send a bearer token in the `Authorization` header. Microsoft's documentation gives the audience for the public cloud as `https://service.flow.microsoft.com/`. Another flow in the same tenant can do this with the HTTP action and Active Directory OAuth."),
      ul(
        "Check a shared secret in a header as the first step of an **Anyone** flow, and end the run with a 401 response when it is missing.",
        "If an address leaks, the signature can be regenerated. Microsoft documents the steps under Regenerate the SAS key.",
        "To post into Teams from another system, use the Teams workflow built for it. See the [Teams webhook pattern](/patterns/teams-workflows-webhook-post-to-channel)."
      )
    ),
    section(
      "response",
      "Send a response",
      p("If the flow has no **Response** action, the caller gets `202 Accepted` at once and never learns what happened next. To return data or a real status, add a **Response** action."),
      table(
        ["Field", "What to put in it"],
        ["Status Code", "200 for success, 400 for a bad request, 401 for a missing secret"],
        ["Headers", "`Content-Type` and `application/json` when the body is JSON"],
        ["Body", "The JSON or text to return"]
      ),
      code(`{
  "status": "created",
  "itemId": @{outputs('Create_item')?['body/ID']}
}`, "Body"),
      p("The flow has to reach the Response action within 120 seconds of the request, or the caller gets a timeout. Do the slow work after the Response: answer first with the fact that the request was accepted, then carry on."),
      p("Every path through the flow needs its own Response. If a step fails before the Response is reached, the caller receives an error with no detail, so add a second Response that runs after a failure and returns a 500 with a short message.")
    ),
    section(
      "mistakes",
      "Three mistakes to avoid on day one",
      ul(
        "**Leaving a secret in plain sight.** A key typed into a header is visible in the designer and in every run. Use a secured environment variable and secure inputs.",
        "**Using Anyone when a tenant setting would do.** If every caller is inside your organisation, require a token.",
        "**Building on HTTP when a connector exists.** The flow becomes premium and you take on the sign-in and error handling the connector would have done."
      ),
      p("The [limits reference](/guides/power-automate-limits) lists the timeouts and size limits that apply to HTTP calls.")
    )
  ],
  faqs: [
    {
      question: "Is the HTTP action in Power Automate premium?",
      answer: "Yes. The HTTP action and the trigger When an HTTP request is received are both premium, so a flow that uses them needs a Power Automate Premium licence or a Power Automate Process licence on the flow. The SharePoint action Send an HTTP request to SharePoint is standard."
    },
    {
      question: "Where do I find the URL of a When an HTTP request is received flow?",
      answer: "Save the flow first. The HTTP URL then appears on the trigger, with a button to copy it. It does not exist until the flow has been saved once."
    },
    {
      question: "How do I secure a Power Automate HTTP trigger?",
      answer: "Set Who can trigger the flow to Any user in my tenant or Specific users in my tenant, so that callers need a Microsoft Entra ID token. If an outside system must call it and Anyone is the only choice, treat the URL as a secret and check a shared secret in a header as the first step."
    },
    {
      question: "What is the timeout for an HTTP request in Power Automate?",
      answer: "120 seconds for both an outgoing call from the HTTP action and an incoming request to the HTTP trigger. For longer work, answer with 202 straight away and let the caller check for the result later."
    },
    {
      question: "Why does my HTTP flow return 202 with an empty body?",
      answer: "The flow has no Response action, or the run did not reach it. Without a Response, Power Automate answers 202 Accepted as soon as the request arrives. Add a Response action with the status code and body you want to return."
    }
  ],
  relatedTools: ["parse-json-schema-generator", "power-automate-expression-builder"],
  relatedPatterns: ["http-oauth-client-credentials-graph-power-automate", "send-http-request-to-sharepoint-power-automate", "secure-inputs-outputs-hide-run-history-power-automate", "environment-variable-secrets-azure-key-vault", "teams-workflows-webhook-post-to-channel", "power-automate-try-catch-scope-error-handling"],
  relatedLinks: [
    { href: "/guides/power-automate-parse-json-guide", label: "Parse JSON in Power Automate" },
    { href: "/errors/401-unauthorized-power-automate", label: "Error: 401 Unauthorized" },
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" }
  ],
  sources: [
    automateDoc("oauth-authentication", "Add OAuth authentication for HTTP request triggers"),
    automateDoc("regenerate-sas-key", "Regenerate the SAS key used in HTTP trigger flows"),
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows"),
    learnDoc("azure/connectors/connectors-native-http", "Call external HTTP or HTTPS endpoints from workflows"),
    learnDoc("azure/connectors/connectors-native-reqres", "Receive and respond to inbound HTTPS calls to workflows")
  ]
};
