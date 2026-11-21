import { automateDoc, code, learnDoc, note, ol, p, table, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Power Automate" as const, published: "2026-11-20", updated: "2026-11-20" };

const approvalErrorsDoc = learnDoc("troubleshoot/power-platform/power-automate/approvals/common-errors-creating-and-assigning-flow-approvals", "Common errors creating and assigning Power Automate Approvals");
const provisioningDoc = learnDoc("troubleshoot/power-platform/power-automate/approvals/flow-approval-cds-provisioning-errors", "Approvals Dataverse provisioning errors and recommendations");
const knownIssuesDoc = automateDoc("approvals-known-issues", "Approvals: known issues");
const getStartedDoc = automateDoc("get-started-approvals", "Get started with approvals");
const limitsDoc = automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows");

const assignedToInvalid: ErrorPage = {
  ...base,
  slug: "required-field-assignedto-contained-no-valid-users",
  message: "Required field 'assignedTo' contained no valid users in the organization",
  title: "Fix \"Required field 'assignedTo' contained no valid users in the organization\" in a Power Automate approval",
  shortTitle: "'assignedTo' contained no valid users",
  description: "Why an approval action fails on its Assigned to value, and how to fix empty values, wrong separators, display names, guests and groups.",
  keywords: ["Required field 'assignedTo' contained no valid users", "Required field 'assignedTo' is missing or empty", "InvalidApprovalCreateRequestAssignedToNoValidUsers", "approval Assigned to error Power Automate", "Start and wait for an approval failed"],
  quickAnswer: "The Assigned to box of the approval action did not contain a user that Microsoft 365 could find. The value was empty, was a display name and not an email address, used a comma where a semicolon is needed, or named a group or an outside address. Open the failed run, look at the inputs of the approval action to see the exact value, and make sure it is one or more email addresses of people in your organisation, separated by semicolons.",
  variants: [
    "Required field 'assignedTo' is missing or empty.",
    "InvalidApprovalCreateRequestAssignedToNoValidUsers",
    "InvalidApprovalCreateRequestAssignedToMissing",
    "Found multiple matching users for 'name@contoso.com'."
  ],
  meaning: [
    p("An approval has to be assigned to at least one real user account. When the action runs, Power Automate looks up each value in **Assigned to** in your organisation's directory. This error means none of them matched."),
    p("The designer does not let you save the action with an empty box, so the error almost always appears when **Assigned to** is filled from dynamic content, such as a Person column or a manager lookup, and that content was empty or in the wrong form for this run.")
  ],
  causes: [
    ol(
      "The dynamic content was empty. The Person column had no value, or the user has no manager.",
      "The value is a display name such as `Ana Silva` and not an email address.",
      "Several approvers are separated by commas. The action needs semicolons.",
      "The value is a Person column's whole object, or its Claims, and not its Email.",
      "The address belongs to a distribution list, a Microsoft 365 group or a shared mailbox, which are not user accounts.",
      "The address is outside your organisation and is not a guest in your directory.",
      "The account was deleted or renamed after the value was stored."
    ),
    p("The variant **is missing or empty** means cause 1. The variant **Found multiple matching users** means two accounts in the directory share that email address or sign-in name, and an administrator has to resolve the duplicate.")
  ],
  fixes: [
    p("**See what was sent.** Open the failed run, select the approval action and read **Assigned to** under the inputs. An empty string, a name, or a block of JSON tells you which cause applies."),
    p("**Pick the Email part of a Person column.** A SharePoint Person column offers several items in dynamic content. Choose the one ending in **Email**."),
    code(`triggerBody()?['Approver']?['Email']`, "Expression"),
    p("**Join several approvers with semicolons.** For a multi-person column, build the list with a **Select** action that maps each person to their Email, then join the result."),
    code(`join(body('Select'), ';')`, "Expression"),
    p("**Give an empty value a fallback.** If the approver can be missing, fall back to a fixed address so the request still reaches someone."),
    code(`if(empty(triggerBody()?['Approver']?['Email']), 'approvals@contoso.com', triggerBody()?['Approver']?['Email'])`, "Expression"),
    p("The fallback must itself be a user account. A shared mailbox address fails in the same way."),
    p("**Replace groups with their members.** To send an approval to a group, add **List group members** from the Office 365 Groups connector, map the members to their email addresses with Select, and join them with semicolons.")
  ],
  prevention: [
    ul(
      "Add a **Condition** before the approval that checks the approver value is not empty, and handle the empty case on purpose.",
      "Make the approver column required in the list or form.",
      "Use **Get manager (V2)** inside a scope with error handling, because it fails for users who have no manager. The [manager approval pattern](/patterns/power-automate-get-manager-approval-route) shows the route.",
      "Store approvers as email addresses or Person columns, never as typed names."
    )
  ],
  faqs: [
    { question: "What format does Assigned to need in a Power Automate approval?", answer: "One or more email addresses or sign-in names of users in your organisation, separated by semicolons. A Microsoft Entra object ID also works. Display names, groups and shared mailboxes do not." },
    { question: "Can I assign a Power Automate approval to a group or distribution list?", answer: "Not directly. The Assigned to box accepts user accounts only. List the group's members with the Office 365 Groups connector and pass their email addresses, separated by semicolons." },
    { question: "Can I assign an approval to a guest user?", answer: "Yes, if the guest exists in your directory. Microsoft's documentation says the guest also needs a Power Automate licence to view or respond to the approval." },
    { question: "Why does the approval work in testing and fail for some items?", answer: "The Assigned to value comes from dynamic content that is filled for your test item and empty or different for others. Open a failed run and read the action's inputs to see the value that was sent." }
  ],
  relatedTools: ["power-automate-expression-builder"],
  relatedPatterns: ["power-automate-get-manager-approval-route", "power-automate-approval-with-sharepoint-status-sync", "coalesce-empty-null-handling-power-automate"],
  relatedLinks: [
    { href: "/guides/power-automate-choice-person-lookup-values", label: "Read Choice, Person and Lookup values" },
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  relatedErrors: ["approvals-connection-owner-was-not-found-in-graph", "approval-remote-endpoint-returned-error-http-403", "template-function-expects-string-provided-value-null"],
  sources: [approvalErrorsDoc, knownIssuesDoc, getStartedDoc]
};

const approvalTimedOut: ErrorPage = {
  ...base,
  slug: "approval-timed-out-after-30-days-power-automate",
  message: "ActionTimedOut",
  title: "Fix an approval that timed out after 30 days in Power Automate",
  shortTitle: "Approval timed out after 30 days",
  description: "Why Start and wait for an approval shows Timed out, what happens to the request, and two designs that keep long approvals working: a timeout with escalation, and separate create and respond flows.",
  keywords: ["Power Automate approval timed out", "approval 30 days limit", "Start and wait for an approval timed out", "ActionTimedOut approval", "approval expire Power Automate"],
  quickAnswer: "A flow run can last 30 days, counted from when the run started, and Microsoft's approvals documentation says an approval flow can wait for 28 days. When nobody answers in that time, the approval step shows Timed out and the run fails. The fix is in the design: set a shorter timeout on the approval action and add a branch that reminds or escalates, or split the work so that one flow creates the approval and another reacts to the response.",
  variants: [
    "Start and wait for an approval: Timed out",
    "Cannot wait on this approval in its current state."
  ],
  meaning: [
    p("The run reached its maximum duration while the approval step was still waiting. The limit applies to the whole run, so time spent before the approval counts too."),
    p("The flow stops, but the approval request does not disappear. Microsoft's known issues page notes that the request stays in the approvals centre with no flow waiting on it. The approver can still open it, and nothing happens when they answer."),
    p("The last variant above comes from the **Wait for an approval** action. It means the approval it was asked to wait on had already expired or been abandoned.")
  ],
  causes: [
    ol(
      "The approver did not respond within the limit.",
      "The approver never saw the request. See [approval email not received](/errors/approval-email-not-received-power-automate).",
      "The approval was assigned to someone who has left or is on long leave.",
      "The flow has several approvals in sequence, and together they took longer than the limit.",
      "A long Delay before the approval used up part of the 30 days."
    )
  ],
  fixes: [
    p("**Fix one stuck request now.** The timed out run cannot be resumed. Start the flow again for that item, and tell the approver to ignore the earlier request. The requestor or an environment administrator can delete the abandoned request from the approvals centre."),
    p("**Design 1: time out early and escalate.** Give the approval action its own timeout, well under the limit, and add a step that runs only when it times out."),
    ol(
      "Open the **Settings** of **Start and wait for an approval**.",
      "Under **Timeout**, enter a duration in ISO 8601 format, such as the seven days below.",
      "Add the next action, for example a reminder email or a second approval assigned to the approver's manager.",
      "Open that action's **Settings**, select **Run after**, and tick **has timed out** only."
    ),
    code(`P7D     seven days
P14D    fourteen days
PT48H   forty-eight hours`, "Timeout"),
    p("The [timeout and escalation pattern](/patterns/power-automate-approval-timeout-escalation) builds this with a reminder loop."),
    p("**Design 2: split create and respond.** For approvals that can take months, do not make a run wait at all."),
    ol(
      "In the first flow, use **Create an approval** and save the approval's ID on the item. End the flow there.",
      "In a second flow, start from the Dataverse trigger **When a row is added, modified or deleted** on the table that stores approvals, filtered to rows that have been completed.",
      "Look up the item by the saved approval ID and record the outcome."
    ),
    p("Microsoft recommends this approach, storing approvals in Dataverse, for any flow that might run for more than 30 days. The Dataverse trigger is a premium connector.")
  ],
  prevention: [
    ul(
      "Set a timeout on every approval action. A request that waits a month has usually been forgotten.",
      "Send a reminder before the timeout, not only after it. See [reminder before a due date](/patterns/power-automate-reminder-before-due-date).",
      "Assign approvals to more than one person, or to a role with a deputy, so absence does not stall them.",
      "Keep long Delay steps out of approval flows, or put them after the approval."
    ),
    p("The [limits reference](/guides/power-automate-limits) lists the run duration and related limits.")
  ],
  faqs: [
    { question: "How long can a Power Automate approval wait?", answer: "A flow run can last 30 days from when it started, and Microsoft's approvals documentation says an approval flow can wait for 28 days. Plan for a response well before then." },
    { question: "Can I extend the 30 day approval limit?", answer: "No. The run duration limit cannot be changed. For longer approvals, create the approval in one flow and handle the response in a second flow that triggers when the approval is completed in Dataverse." },
    { question: "What happens to the approval request after the flow times out?", answer: "It stays in the approvals centre, but no flow is waiting for it, so responding to it does nothing. The requestor or an environment administrator can delete it." },
    { question: "How do I run an action only when an approval times out?", answer: "Set a Timeout in the approval action's settings. On the next action, open Settings, select Run after and tick has timed out." }
  ],
  relatedTools: ["power-automate-expression-builder"],
  relatedPatterns: ["power-automate-approval-timeout-escalation", "power-automate-reminder-before-due-date", "power-automate-approval-with-sharepoint-status-sync", "power-automate-try-catch-scope-error-handling"],
  relatedLinks: [
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" },
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  relatedErrors: ["approval-email-not-received-power-automate", "actionfailed-no-dependent-actions-succeeded", "approval-remote-endpoint-returned-error-http-403"],
  sources: [limitsDoc, knownIssuesDoc, automateDoc("modern-approvals", "Create and test an approval workflow"), approvalErrorsDoc]
};

const approvalsDatabaseNotReady: ErrorPage = {
  ...base,
  slug: "approvals-dataverse-database-not-ready",
  message: "The Common Data Service database for this environment is not yet ready.",
  title: "Fix \"The Common Data Service database for this environment is not yet ready\" in a Power Automate approval",
  shortTitle: "Approvals database is not yet ready",
  description: "Why the first approval in an environment fails while its Dataverse database is being set up, what each provisioning error means, and who can fix it.",
  keywords: ["The Common Data Service database for this environment is not yet ready", "approvals provisioning error", "ViralServicePlanRequired", "CdsInstanceNotReady", "first approval fails Power Automate"],
  quickAnswer: "Approvals store their data in a Dataverse database. The first approval flow that runs in an environment creates that database and installs the Approvals solution, which takes several minutes. If the flow fails with this message, wait about ten minutes and run it again. If it keeps failing, the setup did not complete, and the exact wording of the error says why: a missing permission, a disabled database, a missing licence or a disabled application.",
  variants: [
    "The Dataverse Database for this environment is not ready yet.",
    "A Common Data Service database for this environment has not completed provisioning or does not support the requested approvals functionality.",
    "The current user does not have permissions to create a Common Data Service database for this environment. Please ask an environment administrator to create the database.",
    "The Common Data Service database for this environment is disabled",
    "Failed to create the Common Data Service database in this environment with status code 'ViralServicePlanRequired'."
  ],
  meaning: [
    p("The approval action could not use the environment's Dataverse database. Either the database is still being created, or its creation failed part of the way through."),
    p("This is an environment problem and not a problem with your flow. The same flow works once the database and the Approvals solution are in place. Older messages say Common Data Service, which is the former name of Dataverse.")
  ],
  causes: [
    table(
      ["Message says", "Cause", "Who fixes it"],
      ["not yet ready", "Setup is still running, or it failed", "Anyone: wait and run the flow again"],
      ["has not completed provisioning", "The database exists but the Approvals solution is not fully installed", "A database administrator saves a flow that uses approvals"],
      ["does not have permissions to create", "In an environment other than the default one, only an environment administrator can create the database", "An environment administrator"],
      ["database ... is disabled", "The database was disabled, often because every Power Automate and Dataverse plan in the tenant expired", "A tenant administrator"],
      ["ViralServicePlanRequired", "Self-service sign-up is turned off for the tenant, so the plan needed for setup cannot be assigned", "A tenant administrator"],
      ["has been disabled by your tenant administrator", "A Microsoft Entra application that approvals depend on is disabled or blocked by Conditional Access", "A tenant administrator"]
    )
  ],
  fixes: [
    p("**Wait, then run the flow again.** Setup starts with the first approval and can take around ten minutes. Running a flow that uses approvals again also retries a setup that failed."),
    p("**Check the database's state.** An administrator can open the Power Platform admin center, select the environment and confirm that a Dataverse database exists and that its state is **Ready**. Backup and restore operations can leave it disabled or in administration mode, and approvals do not work in either state."),
    p("**Check that the Approvals solutions are installed.** In Power Automate or Power Apps, open **Solutions** in that environment and look for the Approvals solutions in the list."),
    p("**Missing permission.** An environment administrator can create the database from the admin center, or build and run one approval flow themselves, which sets everything up for other makers."),
    p("**ViralServicePlanRequired.** Microsoft lists three ways forward: an administrator turns on self-service sign-up for the tenant, assigns a paid Power Automate plan to the person running the first approval, or creates the database directly in the admin center. Trial plans are not enough for this step."),
    p("**Disabled application.** A tenant administrator opens **Enterprise applications** in Microsoft Entra ID and checks that Dataverse (also shown as Dynamics CRM Online), Microsoft Flow Service and the Flow Dataverse integration service are enabled for sign-in, and that Conditional Access does not block them."),
    note("When you ask an administrator for help, send the full error text from the run. The status code inside it tells them which of these cases applies.")
  ],
  prevention: [
    ul(
      "When a new environment is created, have an administrator run one test approval in it before makers start building.",
      "Create environments with a Dataverse database from the start if approvals will be used there.",
      "After restoring or copying an environment, confirm that administration mode is off before flows are expected to run."
    )
  ],
  faqs: [
    { question: "Why does the first approval in an environment take so long or fail?", answer: "The first approval creates a Dataverse database and installs the Approvals solution in that environment. This takes several minutes, and a flow that runs before it finishes can fail. Run the flow again after about ten minutes." },
    { question: "Do approvals need Dataverse?", answer: "Yes. Approval requests and responses are stored in Dataverse tables in the same environment as the flow. Power Automate creates the database automatically the first time an approval runs, if the person has permission to do so." },
    { question: "Who can create the approvals database?", answer: "In the default environment, the first person to run an approval flow can trigger it. In any other environment, only an environment administrator can create the database, either in the Power Platform admin center or by running an approval flow." },
    { question: "What does Common Data Service mean in the error?", answer: "Common Data Service is the former name of Microsoft Dataverse. The error refers to the Dataverse database of the environment." }
  ],
  relatedTools: [],
  relatedPatterns: ["environment-request-provisioning-flow", "power-automate-approval-with-sharepoint-status-sync"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" },
    { href: "/guides/power-automate-dataverse-quick-start", label: "Dataverse connector quick start" }
  ],
  relatedErrors: ["approvals-connection-owner-was-not-found-in-graph", "required-field-assignedto-contained-no-valid-users", "principal-user-is-missing-privilege-dataverse"],
  sources: [provisioningDoc, approvalErrorsDoc, getStartedDoc]
};

const approvalEmailNotReceived: ErrorPage = {
  ...base,
  slug: "approval-email-not-received-power-automate",
  message: "The approver did not receive the approval email or Teams notification.",
  title: "Fix approval emails and notifications that do not arrive in Power Automate",
  shortTitle: "Approval email not received",
  description: "Where to look when an approver says no approval request arrived: the approvals centre, junk and mail filtering, the notification setting on the action, and Outlook's actionable messages.",
  keywords: ["Power Automate approval email not received", "approval notification not sent", "approval email missing buttons", "approval email junk", "flow-noreply@microsoft.com"],
  quickAnswer: "First confirm the request exists: ask the approver to open Approvals in Power Automate or in Teams, where every request assigned to them is listed whether or not the email arrived. If it is there, the approval worked and only the email is missing. Check the junk folder and any mail filtering for messages from flow-noreply@microsoft.com, check that the address in Assigned to is the approver's real mailbox, and check that Enable notifications on the action is set to Yes.",
  variants: [
    "The approval email arrives without Approve and Reject buttons.",
    "The approval email arrives hours late.",
    "The approver gets the email but not a Teams notification."
  ],
  meaning: [
    p("Creating an approval and telling the approver about it are separate steps. Power Automate creates the request in Dataverse, then places a request for the email, and the email goes into a queue. The approval action then waits. It does not fail if the email is delayed, filtered or never read."),
    p("So a flow that sits on **Start and wait for an approval** with no response is working as designed. The question is whether the approver knows.")
  ],
  causes: [
    ol(
      "The email is in the approver's junk or quarantine. Approval emails are sent from outside your organisation, from the address `flow-noreply@microsoft.com`, and pass through your inbound mail filtering like any external message.",
      "**Enable notifications** is set to No in the approval action's advanced parameters.",
      "The **Assigned to** address is an account with no mailbox, or a sign-in name that differs from the person's email address.",
      "A third-party mail filter in front of Microsoft 365 holds or delays the message.",
      "The approver is a guest without the licence needed to see approvals.",
      "The approver looked for a Teams notification, but the flow sends email only. Approvals appear in the Approvals app in Teams, and a chat message needs its own action."
    ),
    p("**No buttons in the email.** The Approve and Reject buttons are an Outlook feature called actionable messages. They are missing when the organisation has turned actionable messages off, when the mailbox is on an on-premises server, when the mail client does not support them, or when the email was delayed by more than about an hour on its way in. The approver then sees a plain email with a link.")
  ],
  fixes: [
    p("**Send the approver to the approvals centre.** In Power Automate, select **Approvals** in the left menu, then the **Received** tab. In Teams, open the **Approvals** app. The request can be answered there straight away."),
    p("**Search the mailbox and junk folder** for the sender `flow-noreply@microsoft.com` and for the approval's title."),
    p("**Ask the mail administrator to allow the sender.** Microsoft publishes the sending servers in an SPF record and recommends allowing that record, not single IP addresses. If a filtering service sits in front of Microsoft 365, the rule has to be added there."),
    p("**Check the action.** Open **Start and wait for an approval**, show the advanced parameters and confirm **Enable notifications** is Yes."),
    p("**Check the run.** Open the flow run and read the inputs of the approval action. Confirm that **Assigned to** holds the address you expect."),
    p("**Add your own notification.** For approvers who live in Teams, split the action in two so you can post the link yourself."),
    ol(
      "Replace the single action with **Create an approval**.",
      "Add **Post message in a chat or channel**, as Flow bot in a chat with the approver, and include the approval's **Respond link** from dynamic content.",
      "Add **Wait for an approval** with the **Approval ID** from the create action."
    ),
    p("Keep the create and wait actions close together. Microsoft notes that if the approver responds before the flow reaches the wait step, the flow can get stuck.")
  ],
  prevention: [
    ul(
      "Tell approvers about the approvals centre and the Teams Approvals app when you launch a flow, so email is not the only route.",
      "Have the mail administrator allow the approval sender before the first real request goes out.",
      "Set a timeout and a reminder on every approval, so a missed email does not become a stalled process. See [approval timed out](/errors/approval-timed-out-after-30-days-power-automate).",
      "If you post an adaptive card to Teams as well as the email, expect the card not to update when the approver answers by email. Microsoft suggests turning off the default email in that design."
    )
  ],
  faqs: [
    { question: "Where can an approver see requests if the email did not arrive?", answer: "In Power Automate, under Approvals and the Received tab, or in the Approvals app in Microsoft Teams. Every request assigned to the person is listed there, with or without the email." },
    { question: "What address do Power Automate approval emails come from?", answer: "Microsoft's documentation gives the sender as flow-noreply@microsoft.com for commercial tenants. The messages come from outside your organisation, so inbound mail filtering applies to them." },
    { question: "Why does the approval email have no Approve and Reject buttons?", answer: "The buttons need Outlook actionable messages. They do not appear if the feature is disabled for the organisation, the mail client does not support it, the mailbox is on-premises, or the email was delayed by more than about an hour. The email then contains a link to respond in the browser." },
    { question: "Does the flow fail if the approval email is not delivered?", answer: "No. The approval is created and the flow waits for a response. It fails only when the run reaches its time limit with no answer." }
  ],
  relatedTools: ["adaptive-card-preview-snippets"],
  relatedPatterns: ["power-automate-approval-timeout-escalation", "power-automate-teams-notification-for-high-risk", "post-adaptive-card-and-wait-for-response"],
  relatedLinks: [
    { href: "/guides/power-automate-teams-quick-start", label: "Teams connector quick start" },
    { href: "/guides/power-automate-outlook-quick-start", label: "Outlook connector quick start" }
  ],
  relatedErrors: ["approval-timed-out-after-30-days-power-automate", "approval-remote-endpoint-returned-error-http-403", "required-field-assignedto-contained-no-valid-users"],
  sources: [
    knownIssuesDoc,
    learnDoc("troubleshoot/power-platform/power-automate/approvals/power-automate-approval-email-information", "Power Automate approval email delivery information"),
    learnDoc("troubleshoot/power-platform/power-automate/approvals/issues-with-flow-approval-emails-in-outlook", "Issues with flow approval emails in Outlook"),
    getStartedDoc
  ]
};

const connectionOwnerNotFound: ErrorPage = {
  ...base,
  slug: "approvals-connection-owner-was-not-found-in-graph",
  message: "The Approvals connection owner was not found in Graph. Object Id: '00000000-0000-0000-0000-000000000000'",
  title: "Fix \"The Approvals connection owner was not found in Graph\" in Power Automate",
  shortTitle: "Approvals connection owner was not found",
  description: "Why an approval flow starts failing after its builder leaves or is disabled, and how to replace the Approvals connection and hand the flow over.",
  keywords: ["The Approvals connection owner was not found in Graph", "The Approvals connection owner was found in Graph, but the account is not enabled", "ApprovalConnectionOwnerNotFoundInGraph", "approval flow fails after user left", "replace approvals connection"],
  quickAnswer: "The approval action uses a connection that belongs to a user account that has been deleted or disabled, usually because the person who built the flow left. An owner of the flow must open it, create a new Approvals connection with an active account, select that connection on every approval action, and save. Runs that failed have to be started again.",
  variants: [
    "The Approvals connection owner was found in Graph, but the account is not enabled. Object Id: '...'",
    "ApprovalConnectionOwnerNotFoundInGraph",
    "ApprovalConnectionOwnerNotEnabledInGraph",
    "The approval requestor must be a single, valid user account within your organization"
  ],
  meaning: [
    p("Every approval is sent on behalf of the account that owns the flow's **Approvals** connection. Before it creates a request, Power Automate looks that account up in Microsoft Graph, the directory of your organisation."),
    p("**Not found** means the account no longer exists. **Found, but the account is not enabled** means it exists and sign-in is blocked. Either way the approval cannot be created, and the action fails at once."),
    p("The Object Id in the message is the directory ID of the account that owned the connection. An administrator can use it to identify who that was.")
  ],
  causes: [
    ol(
      "The person who built the flow left, and their account was deleted or disabled.",
      "The flow was built with a test or temporary account that has been removed.",
      "The account was deleted and created again. The new account has a different ID, so the old connection does not match it.",
      "The **Requestor** box of the approval names an account that is invalid or holds more than one user. This produces the last variant above."
    )
  ],
  fixes: [
    p("**Replace the connection.** This needs someone who is an owner of the flow."),
    ol(
      "Open the flow for editing.",
      "Select the first approval action. Open its menu and choose to change or add a connection.",
      "Select **Add new** and sign in with an account that will stay active.",
      "Repeat for every other approval action in the flow, selecting the new connection.",
      "Save the flow and run a test."
    ),
    p("For a flow in a solution, the action uses a **connection reference**. Open the connection reference from the solution and point it at a connection that belongs to an active account. Every action that uses the reference then follows. See [connection references](/patterns/connection-references-for-solution-flows)."),
    p("**If nobody can edit the flow.** When the only owner has gone, a Power Platform administrator can add a new owner from the admin center, under the environment's flows. Microsoft documents this under managing orphaned flows."),
    p("**Fix the Requestor.** If the message is about the approval requestor, open the approval action and make sure **Requestor** holds one email address of a user in your organisation, or leave it empty so the connection's owner is used."),
    p("**Run the failed items again.** Approvals that failed were never created. Use **Resubmit** on each failed run, or start the flow again for those items.")
  ],
  prevention: [
    ul(
      "Add at least one co-owner to every approval flow, so someone can repair it.",
      "Own production flows and their connections with a service account that does not leave with a person.",
      "Include flows in the checklist for people leaving a team. The [reassign apps and flows pattern](/patterns/reassign-apps-flows-when-maker-leaves) lists the steps.",
      "Find flows with no active owner before they fail. See [find orphaned apps and flows](/patterns/find-orphaned-apps-and-flows-powershell)."
    )
  ],
  faqs: [
    { question: "What is the Approvals connection owner?", answer: "It is the user account that signed in when the flow's Approvals connection was created, normally the person who built the flow. Approval requests are created on behalf of that account." },
    { question: "Why did my approval flow stop working when someone left the company?", answer: "The flow's Approvals connection belonged to that person. When the account was disabled or deleted, Power Automate could no longer find an active owner for the connection, so each approval action fails." },
    { question: "Does adding a new flow owner fix the error?", answer: "Not by itself. The new owner must also replace the Approvals connection on each approval action with one that belongs to an active account." },
    { question: "Will failed approvals be sent after I fix the connection?", answer: "No. Requests from failed runs were never created. Resubmit the failed runs or start the flow again for those items." }
  ],
  relatedTools: [],
  relatedPatterns: ["reassign-apps-flows-when-maker-leaves", "find-orphaned-apps-and-flows-powershell", "connection-references-for-solution-flows"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" },
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" }
  ],
  relatedErrors: ["required-field-assignedto-contained-no-valid-users", "flows-not-turned-on-after-solution-import-connection-references", "problem-with-the-flows-trigger"],
  sources: [
    approvalErrorsDoc,
    learnDoc("troubleshoot/power-platform/power-automate/flow-management/manage-orphan-flow-when-owner-leaves-org", "Manage orphaned flows when the owner leaves the organization"),
    learnDoc("troubleshoot/power-platform/power-automate/connections/troubleshoot-broken-connections", "Troubleshoot broken connections")
  ]
};

const approvalHttp403: ErrorPage = {
  ...base,
  slug: "approval-remote-endpoint-returned-error-http-403",
  message: "The remote endpoint returned an error HTTP 403. Please try again later.",
  title: "Fix \"The remote endpoint returned an error HTTP 403\" when responding to an approval",
  shortTitle: "Approval response fails with HTTP 403",
  description: "Why an approver cannot approve or reject from the email, with the guest user case and the other reasons a response does not go through, and where to respond instead.",
  keywords: ["The remote endpoint returned an error HTTP 403", "guest user cannot approve Power Automate", "cannot respond to approval", "approval email error try again later", "Sorry an error occurred approval"],
  quickAnswer: "The approver pressed Approve or Reject in the email and the response was refused. Microsoft documents this for guest users, who cannot respond from the card in the email. The workaround is to respond in the Power Automate portal, under Approvals. If the approver is not a guest, the request has probably been completed, cancelled or reassigned already, or the flow behind it has ended.",
  variants: [
    "Sorry an error occurred please try again later.",
    "Cannot wait on this approval in its current state."
  ],
  meaning: [
    p("The buttons in an approval email send the response from Outlook to Power Automate. HTTP 403 means Power Automate received it and refused it, because the person is not allowed to respond in that way or the request is no longer open."),
    p("The flow is not at fault and usually shows no error at all. It is still waiting, and the approver is the one who sees the message.")
  ],
  causes: [
    ol(
      "The approver is a guest user. Guests cannot respond from the card in the email.",
      "The guest has no Power Automate licence. Microsoft's documentation says a guest needs one to view or respond to an approval.",
      "Someone else already answered. With the type **First to respond**, the first answer completes the request for everyone.",
      "The requestor cancelled the request, or it was reassigned to another person.",
      "The flow run ended or timed out, so nothing is waiting for the answer.",
      "The approver opened the email in a shared mailbox or as a delegate. The response is sent as the signed-in person, who is not the assigned approver.",
      "An old version of Outlook for Windows. Microsoft fixed a \"Sorry an error occurred\" problem in later builds and recommends Outlook on the web as the workaround."
    )
  ],
  fixes: [
    p("**Respond in the portal.** This works for guests and is the quickest test for everyone else."),
    ol(
      "Open the Power Automate portal and sign in. A guest must switch to the organisation that sent the request, using the account menu at the top right.",
      "Select **Approvals** in the left menu, then the **Received** tab.",
      "Open the request and respond."
    ),
    p("If the request is not listed under Received, it is no longer open for that person. Look under **History** to see who answered it and when."),
    p("**Check the licence for guests.** If the guest cannot see the request in the portal at all, an administrator needs to assign the guest a licence that includes Power Automate."),
    p("**Check the run.** As the flow's owner, open the run history. A run that has succeeded, failed or timed out is no longer waiting, and the approver's answer has nowhere to go. Start the flow again for that item if an answer is still needed."),
    p("**Shared mailboxes.** Assign approvals to people, not to a mailbox that several people read. If a team must share the work, assign the request to each member and use **First to respond**.")
  ],
  prevention: [
    ul(
      "Tell guest approvers from the start to respond in the portal, and include the approval's link in your own message to them.",
      "For frequent outside approvers, consider collecting the answer another way, such as a form, so that they do not need a licence in your tenant.",
      "With **First to respond**, send a short follow-up to the other approvers when the request is completed, so they do not try to answer a closed request.",
      "Set a timeout on the approval and tell the approver when it expires. See [approval timed out](/errors/approval-timed-out-after-30-days-power-automate)."
    )
  ],
  faqs: [
    { question: "Can guest users approve Power Automate approvals?", answer: "Yes, with two conditions from Microsoft's documentation. The guest needs a Power Automate licence to view or respond, and must respond in the Power Automate portal, because the buttons in the approval email return an HTTP 403 error for guests." },
    { question: "Why can a second approver not respond?", answer: "Another approver responded first on a First to respond approval, or the request was cancelled. The History tab under Approvals shows who responded." },
    { question: "Does an HTTP 403 on the approval email mean the flow failed?", answer: "No. The flow is normally still waiting. The error is shown to the approver, and the approval can still be completed in the portal while the run is active." },
    { question: "Why does approving from a shared mailbox fail?", answer: "The response is sent as the person who is signed in to Outlook, not as the shared mailbox. If that person is not one of the assigned approvers, the response is refused." }
  ],
  relatedTools: [],
  relatedPatterns: ["power-automate-approval-timeout-escalation", "power-automate-approval-with-sharepoint-status-sync", "tenant-isolation-cross-tenant-connections"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" },
    { href: "/guides/power-automate-outlook-quick-start", label: "Outlook connector quick start" }
  ],
  relatedErrors: ["approval-email-not-received-power-automate", "approval-timed-out-after-30-days-power-automate", "required-field-assignedto-contained-no-valid-users"],
  sources: [
    learnDoc("troubleshoot/power-platform/power-automate/approvals/guest-approval-email-error", "Error when guest users approve or reject a request in the email"),
    knownIssuesDoc,
    learnDoc("troubleshoot/power-platform/power-automate/approvals/issues-with-flow-approval-emails-in-outlook", "Issues with flow approval emails in Outlook"),
    approvalErrorsDoc
  ]
};

export const approvalErrors: ErrorPage[] = [
  assignedToInvalid,
  approvalTimedOut,
  approvalsDatabaseNotReady,
  approvalEmailNotReceived,
  connectionOwnerNotFound,
  approvalHttp403
];
