import { automateDoc, code, learnDoc, note, ol, p, table, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Connections and sign-in" as const, published: "2026-11-20", updated: "2026-11-20" };

const brokenConnectionsDoc = learnDoc("troubleshoot/power-platform/power-automate/connections/troubleshoot-broken-connections", "Troubleshoot broken connections in Microsoft Power Platform");
const fixConnectionsDoc = automateDoc("fix-connection-failures", "Fix connection failures in cloud flows");
const manageConnectionsDoc = automateDoc("add-manage-connections", "Manage connections in Power Automate");
const servicePrincipalDoc = automateDoc("service-principal-support", "Support for service principal owned flows");
const changeOwnerDoc = automateDoc("change-cloud-flow-owner", "Change the owner of a cloud flow");
const oauthVerifyDoc = learnDoc("troubleshoot/power-platform/power-automate/connections/verify-oauth-configuration", "Verify OAuth configuration for custom connectors");
const httpOAuthDoc = automateDoc("oauth-authentication", "Add OAuth authentication for HTTP request triggers");
const servicePlanDoc = learnDoc("troubleshoot/power-platform/power-automate/connections/user-does-not-have-a-service-plan-error", "The user does not have a service plan adequate for the non-Standard connection");
const triggersDoc = learnDoc("troubleshoot/power-platform/power-automate/flow-run-issues/triggers-troubleshoot", "Troubleshoot common issues with triggers");
const failedFetchDoc = learnDoc("troubleshoot/power-platform/power-automate/connections/client-request-aborted-failed-fetch", "Failed to Fetch, Client Request Aborted or Network Error in Power Automate");
const ipConfigDoc = automateDoc("ip-address-configuration", "IP address configuration for Power Automate");
const oneDriveSignInDoc = learnDoc("troubleshoot/power-platform/power-automate/authentication-or-sign-in/cannot-sign-in-to-onedrive-connector-when-using-office-365-account-during-flow-creation", "Can't sign in to the OneDrive connector with an Office 365 account");

const missingAcl: ErrorPage = {
  ...base,
  slug: "permission-denied-due-to-missing-connection-acl",
  message: "Error from token exchange: Permission denied due to missing connection ACL",
  title: "Fix \"Permission denied due to missing connection ACL\" in Power Automate",
  shortTitle: "Permission denied due to missing connection ACL",
  description: "Why a flow fails because the account running it has no rights to a connection that someone else created, how to tell who owns what, and the two fixes: share the connection or replace it with your own.",
  keywords: ["Permission denied due to missing connection ACL", "Error from token exchange", "Power Automate connection not shared", "service principal flow connection error", "flow owner changed connection error"],
  quickAnswer: "The flow is trying to use a connection that the account running the flow has not been given access to. It usually follows a change of owner: the flow now runs as a new owner or a service principal, but its actions still point at connections that belong to the previous person. Either the connection's owner shares it with the account that runs the flow, or the new owner creates their own connections and selects them on the actions or the connection references.",
  variants: [
    "Error from token exchange: Permission denied due to missing connection ACL: User = 'ana@contoso.com', connection = 'shared-sharepointonl-…'.",
    "Error from token exchange. Permission denied due to missing connection ACL.",
    "The caller with object id '…' does not have permission for connection '…' under Api 'shared_sharepointonline'."
  ],
  meaning: [
    p("ACL stands for access control list. Each connection has one: the list of accounts that are allowed to use it. It starts with only the person who created the connection."),
    p("When an action runs, Power Automate exchanges the identity that is running the flow for a token on the connection. If that identity is not on the connection's list, the exchange is refused with this message. The message names the user and the connection, which tells you exactly which pair to fix."),
    p("The connection itself is healthy. Its owner could use it without any error. The problem is who is asking.")
  ],
  causes: [
    ol(
      "The flow's owner was changed, and the flow still uses the previous owner's connections.",
      "The flow is owned by a **service principal**, and the connections it uses were not shared with that service principal. Microsoft's documentation says this sharing is required for flows that are not in a solution.",
      "A solution was imported or deployed by one account, and its connection references were pointed at connections owned by another.",
      "A co-owner edited the flow, and an action picked up a connection that belongs to a different co-owner.",
      "A flow that is started from a canvas app or with run-only access is set to use a connection that the person starting it cannot use.",
      "The connection was shared in the past and the share has since been removed."
    )
  ],
  fixes: [
    p("**Find out who owns what.** Read the user and the connection named in the error. Then open the flow's details page: the **Connections** or **Connection references** section lists each connection with the account behind it."),
    p("**Fix 1: replace the connection with one the running account owns.** This is the dependable fix and works for every connector."),
    ol(
      "Sign in as the account that the flow runs as, which is its owner for automated and scheduled flows.",
      "Edit the flow. On each action that uses someone else's connection, open the connection menu and choose **Add new connection** or one of your own.",
      "For a flow in a solution, open the solution instead, edit each **connection reference** and choose your own connection there.",
      "Save, and test."
    ),
    p("**Fix 2: share the connection.** The connection's owner opens **Connections**, selects the connection and chooses **Share**, then adds the account that needs it. Not every connection can be shared with a person. Connections that sign in with a Microsoft account, such as SharePoint and Outlook, are personal, and for those the Share option is there to add a service principal."),
    p("**For a service principal that owns a flow,** have each connection's owner share it with the service principal's application user, or move the flow into a solution, where Microsoft's documentation says that step is not required."),
    note("Sharing a connection lets the other account act as you through it. Share only what a flow needs, and prefer a service account's connection over a person's.")
  ],
  prevention: [
    ul(
      "Change the owner and the connections together. A handover is not finished until the flow has run successfully as the new owner.",
      "Build flows in solutions and use connection references, so that the connections for an environment are chosen in one place. See the [connection reference standards](/standards/connection-reference-standards).",
      "Deploy with the same account, or the same service principal, that will own the flows. The [service principal pattern](/patterns/service-principal-application-user-deployments) covers deployments.",
      "Use a deployment settings file to set connection references for each environment, as the [deployment settings pattern](/patterns/deployment-settings-file-pac-cli) shows."
    )
  ],
  faqs: [
    { question: "What does missing connection ACL mean in Power Automate?", answer: "The account running the flow is not on the list of accounts allowed to use one of the flow's connections. The connection belongs to someone else and has not been shared. Share the connection with that account, or replace it with a connection the account owns." },
    { question: "Why did my flow break after I changed its owner?", answer: "The flow now runs as the new owner but still points at the previous owner's connections, which the new owner has no rights to. The new owner should edit the flow or its connection references and select their own connections." },
    { question: "Can I share a SharePoint or Outlook connection with a colleague?", answer: "Not with another person. Connections that sign in with a Microsoft account are personal. Your colleague creates their own connection. Such connections can be shared with a service principal that owns a flow." },
    { question: "Do service principal flows need shared connections?", answer: "For a flow that is not in a solution, yes. Microsoft's documentation says the flow's connections need to be shared with the service principal application user. For a solution flow, that step is not required." }
  ],
  relatedTools: [],
  relatedPatterns: ["connection-references-for-solution-flows", "service-principal-application-user-deployments", "deployment-settings-file-pac-cli"],
  relatedLinks: [
    { href: "/standards/connection-reference-standards", label: "Connection reference standards" },
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  relatedErrors: ["flows-not-turned-on-after-solution-import-connection-references", "user-account-is-disabled-power-automate-connection", "403-forbidden-power-automate"],
  sources: [brokenConnectionsDoc, servicePrincipalDoc, changeOwnerDoc, manageConnectionsDoc]
};

const unauthorized: ErrorPage = {
  ...base,
  slug: "401-unauthorized-power-automate",
  message: "Unauthorized",
  title: "Fix 401 Unauthorized in Power Automate",
  shortTitle: "401 Unauthorized",
  description: "What a 401 status means on a flow action, how it differs from 403, and how to fix it for a standard connector, the HTTP action, a custom connector and an HTTP request trigger.",
  keywords: ["Power Automate 401 Unauthorized", "Unauthorized flow action failed", "HTTP 401 Power Automate", "custom connector 401 Unauthorized", "status code 401 flow"],
  quickAnswer: "401 means the service did not accept the credentials that came with the request. It does not know who is calling. For a standard connector, the connection's sign-in has expired or the password changed: open Connections, choose Fix connection and sign in again. For the HTTP action or a custom connector, the key, token or OAuth setting is wrong or out of date. A 403 is a different problem: the service knows who you are and has refused permission.",
  variants: [
    "401 Unauthorized",
    "InvalidAuthenticationToken: Access token has expired or is not yet valid.",
    "Access is denied due to invalid credentials."
  ],
  meaning: [
    p("Every call a flow makes carries proof of identity: a token from a connection, a key in a header, or a user name and password. A `401` status is the service saying that the proof was missing, expired or not valid."),
    table(
      ["Status", "The service is saying", "Where to look"],
      ["401 Unauthorized", "I do not know who you are", "The credentials: connection, key, token or secret"],
      ["403 Forbidden", "I know who you are, and you may not do this", "The permissions of that account. See [403 Forbidden](/errors/403-forbidden-power-automate)."]
    ),
    p("Open the failed run, select the action marked in red and read the **Outputs**. The status code is there, and the body often says more, such as which part of the token was rejected.")
  ],
  causes: [
    p("**On a standard connector action**, such as SharePoint, Outlook or Dataverse:"),
    ul(
      "The connection's stored sign-in is no longer valid. Microsoft's guide gives an expired token or a changed password as the meaning of a 401.",
      "The connection's account was disabled or its sessions were revoked."
    ),
    p("**On the HTTP action:**"),
    ul(
      "An API key or secret was rotated, expired or pasted with a stray space.",
      "The **Authorization** header is in the wrong form. Most APIs expect the word `Bearer`, a space, and then the token.",
      "With **Active Directory OAuth**, the **Audience** does not match the API being called, so the token is for a different service.",
      "The client secret of the app registration has passed its expiry date."
    ),
    p("**On a custom connector:**"),
    ul(
      "The OAuth settings are wrong. Microsoft's article lists the usual ones: the authorize endpoint used where the token endpoint is needed, a redirect URI that does not match the app registration, missing scopes, and v1.0 and v2.0 endpoints mixed together.",
      "The scope `offline_access` is missing, so no refresh token is issued and the connection works briefly and then fails at a regular interval."
    ),
    p("**When something calls your flow's HTTP trigger and gets a 401:** the trigger is set to allow only users in your tenant, and the caller did not send a valid Microsoft Entra ID token.")
  ],
  fixes: [
    p("**Standard connector.**"),
    ol(
      "Open **Connections** in Power Automate.",
      "Choose **Fix connection** on the connection the failed action uses, and sign in.",
      "Resubmit the failed run."
    ),
    p("If the connection shows a more exact message, such as [the provided grant has expired](/errors/provided-grant-has-expired-due-to-it-being-revoked), follow that page."),
    p("**HTTP action.** Test the same call outside the flow, with a tool such as Postman or curl, using the same key or token. If it fails there too, the credential is the problem and not the flow. Then check, in this order: the value itself, the header's name and form, and the expiry date of the secret."),
    code(`Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOi...`, "Header"),
    p("For Active Directory OAuth, the **Audience** is the address of the API and not of your app. For Microsoft Graph it is `https://graph.microsoft.com`. The [Graph client credentials pattern](/patterns/http-oauth-client-credentials-graph-power-automate) shows each field."),
    p("**Custom connector.** Open the connector's **Security** tab and compare each value with the app registration: the token endpoint, the client ID, the scopes including `offline_access`, and the redirect URI that the connector shows after you save. Then delete the old connection and create a new one, because an existing connection keeps the settings it was made with."),
    p("**HTTP request trigger.** Either have the caller send a bearer token for the audience Microsoft documents for the trigger, or, if the caller cannot sign in to Microsoft Entra ID, change **Who can trigger the flow** on purpose. The [HTTP quick start](/guides/power-automate-http-quick-start) explains the three settings and their risks.")
  ],
  prevention: [
    ul(
      "Record the expiry date of every client secret and key, with an owner and a reminder two weeks before.",
      "Keep secrets in an environment variable backed by Azure Key Vault, so that a rotated secret is updated in one place. See the [Key Vault pattern](/patterns/environment-variable-secrets-azure-key-vault).",
      "Add a step that runs after the action **has failed**, and alert someone when the status code is 401. Retrying does not help, because the same credential is sent each time.",
      "Use a connector in place of the HTTP action where one exists. The connector renews its own sign-in."
    )
  ],
  faqs: [
    { question: "What does 401 Unauthorized mean in Power Automate?", answer: "The service the action called did not accept the credentials sent with the request. For a connector, the connection's sign-in has expired or been revoked. For the HTTP action or a custom connector, the key, token or OAuth setting is wrong or out of date." },
    { question: "What is the difference between 401 and 403 in a flow?", answer: "401 means the service could not confirm who is calling, so the fix is in the credentials. 403 means the service knows who is calling and that account is not allowed to do the action, so the fix is in the permissions." },
    { question: "Will retrying fix a 401 error?", answer: "No. A retry sends the same credential and gets the same answer. Repair the connection or correct the key, token or secret, then resubmit the run." },
    { question: "Why does my custom connector work for an hour and then return 401?", answer: "The connection has an access token but no refresh token, so it cannot renew itself when the access token expires. Add the offline_access scope to the connector's security settings, check the token endpoint, and create a new connection." }
  ],
  relatedTools: [],
  relatedPatterns: ["http-oauth-client-credentials-graph-power-automate", "environment-variable-secrets-azure-key-vault", "power-automate-try-catch-scope-error-handling"],
  relatedLinks: [
    { href: "/guides/power-automate-http-quick-start", label: "HTTP action and trigger quick start" },
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  relatedErrors: ["403-forbidden-power-automate", "failed-to-refresh-access-token-for-service", "provided-grant-has-expired-due-to-it-being-revoked"],
  sources: [fixConnectionsDoc, oauthVerifyDoc, httpOAuthDoc, manageConnectionsDoc]
};

const forbidden: ErrorPage = {
  ...base,
  slug: "403-forbidden-power-automate",
  message: "Forbidden",
  title: "Fix 403 Forbidden in Power Automate",
  shortTitle: "403 Forbidden",
  description: "What a 403 status means on a flow action, how to find which account was refused and what it was refused, and the fix for SharePoint, mailboxes, Dataverse, Microsoft Graph and data loss prevention policies.",
  keywords: ["Power Automate 403 Forbidden", "Forbidden flow action failed", "Access denied Power Automate SharePoint", "status code 403 flow", "flow does not have permission"],
  quickAnswer: "403 means the service recognised the account behind the connection and refused the request, because that account is not allowed to do it. Signing in again does not help. Find the account the action runs as, find the exact item it tried to reach, and give that account the permission it lacks, or switch the action to a connection whose account already has it. If many flows started failing at once with no change of your own, ask your administrator whether a data loss prevention policy changed.",
  variants: [
    "403 Forbidden",
    "Access denied. You do not have permission to perform this action or access this resource.",
    "Attempted to perform an unauthorized operation.",
    "Insufficient privileges to complete the operation."
  ],
  meaning: [
    p("A flow does not have permissions of its own. Each action runs as the account that signed in to its connection, with exactly the rights that account has. If the account cannot open a site, send from a mailbox or change a row by hand, the flow cannot either."),
    p("Microsoft's guide to connection failures gives two meanings for a 403: the account does not have permission to access the resource, or a data loss prevention policy is blocking the connector."),
    p("Compare this with a [401](/errors/401-unauthorized-power-automate), where the service does not accept the sign-in at all. With a 403 the sign-in is fine and the answer is no.")
  ],
  causes: [
    table(
      ["Service", "Usual reason for a 403"],
      ["SharePoint", "The account is not a member of the site, has read access but the action writes, or the item has its own permissions"],
      ["Outlook", "The account has no Send As or full access rights on the shared mailbox it is using"],
      ["Dataverse", "The account's security role lacks a privilege on the table. See [missing privilege](/errors/principal-user-is-missing-privilege-dataverse)."],
      ["Teams", "The account is not a member of the team or private channel"],
      ["Microsoft Graph through HTTP", "The app registration lacks an API permission, or admin consent was not granted"],
      ["Approvals", "The approver is a guest or is outside the environment. See [approvals 403](/errors/approval-remote-endpoint-returned-error-http-403)."],
      ["Any connector", "A data loss prevention policy blocks the connector or the endpoint"]
    ),
    p("Two situations produce a 403 in a flow that used to work: the account lost access, for example when it was removed from a site or group, or the flow was switched to a different connection whose account never had it.")
  ],
  fixes: [
    p("**1. Find the account.** Open the flow's details page and look at the **Connections** section, or open the failed action in the designer and read the connection shown at the bottom. That email address is who the service refused."),
    p("**2. Find the exact item.** In the failed run, open the action's **Inputs**. The site address, list, mailbox or row ID is there. With dynamic content, the value for this run may be different from the one you tested with."),
    p("**3. Try it by hand.** Sign in as that account in a browser and do the same thing: open the site, edit the item, send from the mailbox. If it fails by hand, you have confirmed a permission problem and the service's own message will say what is missing."),
    p("**4. Grant the permission or change the account.**"),
    ul(
      "**SharePoint:** add the account to the site with at least Edit rights for actions that write. Actions that change permissions, such as stopping inheritance, need a site owner.",
      "**Shared mailbox:** have an Exchange administrator give the account Send As and full access, and use the action that is made for shared mailboxes.",
      "**Dataverse:** have an administrator add the missing privilege to the account's security role.",
      "**Microsoft Graph:** add the permission to the app registration and have an administrator grant consent. An application permission is needed for calls that sign in with a client secret."
    ),
    p("**5. If nothing about the account changed,** ask your Power Platform administrator about data loss prevention. Microsoft's guide notes that policy changes take effect at once and that several flows breaking together is the sign. The [DLP error page](/errors/app-not-compliant-data-loss-prevention-policies) explains the policy groups.")
  ],
  prevention: [
    ul(
      "Decide which account a flow runs as before you build it, and give that account its permissions on purpose. Do not rely on the maker's personal access.",
      "Give access through groups that are managed, so that the service account is not removed by accident during a tidy-up of site members.",
      "When a flow is handed to a new owner, check the new account against every site, mailbox and table the flow touches before switching the connections.",
      "Handle the failure in the flow: a step that runs after **has failed** can tell the support team which action and which account were refused. See the [try, catch and finally pattern](/patterns/power-automate-try-catch-scope-error-handling)."
    ),
    note("Giving a service account owner rights everywhere makes 403 errors go away and makes a compromised account far more damaging. Grant what the flow needs and no more.")
  ],
  faqs: [
    { question: "What does 403 Forbidden mean in Power Automate?", answer: "The service recognised the account behind the connection and refused the request, because that account lacks permission for the action or because a data loss prevention policy blocks it. The fix is to grant the permission or to use a connection whose account has it." },
    { question: "Why does my flow get 403 when I have access to the site?", answer: "The flow runs as the account in the action's connection, which may not be you. Check which account that is on the flow's details page. Also check that the access is enough for the action: reading is not enough to create or update." },
    { question: "Does fixing the connection solve a 403 error?", answer: "No. Fix connection renews the sign-in, and a 403 is not a sign-in problem. The account needs more permission, or the action needs a different account." },
    { question: "Why did several flows start returning 403 at the same time?", answer: "Something they share has changed. Either the account they run as lost access, for example by being removed from a group, or an administrator changed a data loss prevention policy that covers a connector they use." }
  ],
  relatedTools: [],
  relatedPatterns: ["power-automate-try-catch-scope-error-handling", "sharepoint-item-level-permissions-break-inheritance-flow", "dlp-connector-endpoint-filtering-action-control", "http-oauth-client-credentials-graph-power-automate"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" },
    { href: "/guides/power-automate-sharepoint-quick-start", label: "SharePoint connector quick start" }
  ],
  relatedErrors: ["401-unauthorized-power-automate", "app-not-compliant-data-loss-prevention-policies", "principal-user-is-missing-privilege-dataverse", "approval-remote-endpoint-returned-error-http-403"],
  sources: [fixConnectionsDoc, brokenConnectionsDoc, manageConnectionsDoc]
};

const servicePlan: ErrorPage = {
  ...base,
  slug: "user-does-not-have-a-service-plan-adequate-for-non-standard-connection",
  message: "The user does not have a service plan adequate for the non-Standard connection.",
  title: "Fix \"The user does not have a service plan adequate for the non-Standard connection\"",
  shortTitle: "No service plan for the non-Standard connection",
  description: "Why saving, importing or turning on a flow fails with a service plan error, which connectors count as premium, which licence fixes it, and how to redesign a flow so that it needs no premium licence.",
  keywords: ["The user does not have a service plan adequate for the non-Standard connection", "Power Automate premium connector license error", "Power Automate Premium license required", "flow premium connector cannot save", "non-Standard connection"],
  quickAnswer: "The flow uses a premium connector, and the person saving, importing, turning on or running it does not have a Power Automate licence that includes premium connectors. A Microsoft 365 licence covers standard connectors only. Either give that person a Power Automate Premium licence, put a Power Automate Process licence on the flow, start a trial, or replace the premium connector with a standard one.",
  variants: [],
  meaning: [
    p("Connectors come in two groups. **Standard** connectors, such as SharePoint, Outlook, Teams, Excel and Approvals, are included with Microsoft 365. **Premium** connectors, such as HTTP, SQL Server, Dataverse, Azure services and all custom connectors, need a Power Automate licence of their own. In this message, non-Standard means premium."),
    p("Microsoft's support article says the error appears when you import the flow, turn it on or off, save it, or make any other lasting change to it, and that a Power Apps, Dynamics 365 or Office 365 licence is not sufficient."),
    p("In the list of connectors in Power Automate, a premium connector has the word **Premium** under its name.")
  ],
  causes: [
    ol(
      "A premium connector was added to a flow by a maker who has only a Microsoft 365 licence.",
      "The flow was shared with, or imported by, a person without a premium licence. Microsoft's article says each person who edits or manually triggers a flow with premium connectors needs their own licence, unless the flow has its own.",
      "The person's licence or trial has expired. The article points to this when the same person could save the flow before.",
      "The flow's owner was changed to an account without a premium licence.",
      "A licence was assigned minutes ago and has not reached Power Automate yet."
    )
  ],
  fixes: [
    table(
      ["Option", "Fits when"],
      ["Assign **Power Automate Premium** to the person", "A maker builds or runs several premium flows"],
      ["Assign **Power Automate Process** to the flow", "One important flow serves many people, or runs as a service account"],
      ["Start a **trial**", "You need to prove the flow before buying. Microsoft's article gives 90 days for the trial."],
      ["Remove the premium connector", "A standard connector can do the same job"]
    ),
    p("Power Automate Premium was previously named the per user plan, and Power Automate Process was previously the per flow plan. Older articles and error messages use the old names."),
    p("**After a licence is assigned,** sign out and back in, then open the flow and **save** it. Microsoft's trigger troubleshooting article says that opening and saving the flow refreshes the entitlement tied to it."),
    p("**To see what you have,** select the settings icon in Power Automate and choose **View my licenses**."),
    p("**To avoid the premium connector,** look for a standard route to the same data."),
    ul(
      "Calling the SharePoint API does not need the HTTP action. The standard action **Send an HTTP request to SharePoint** does it. See the [SharePoint HTTP pattern](/patterns/send-http-request-to-sharepoint-power-automate).",
      "Data held in SQL Server or Dataverse for a small team process may fit a SharePoint list.",
      "Posting to Teams from another system can use a Teams workflow. See the [Teams webhook pattern](/patterns/teams-workflows-webhook-post-to-channel)."
    )
  ],
  prevention: [
    ul(
      "Check the connector list for the Premium label before you design a flow around a connector.",
      "Decide early who owns production flows. A flow owned by a licensed service account, or carrying a Process licence, does not depend on each maker's licence.",
      "When a flow is handed over, check the new owner's licence first. A scheduled or automated flow runs under its owner's licence.",
      "Keep a note of which flows use premium connectors. The [inventory pattern](/patterns/export-power-platform-inventory-powershell) lists flows and their connectors."
    ),
    note("Licence names, prices and what each plan includes change. Check Microsoft's Power Platform licensing guide for the current terms before you buy.")
  ],
  faqs: [
    { question: "What is a non-Standard connection in Power Automate?", answer: "It is a connection to a premium connector, such as HTTP, SQL Server, Azure services or a custom connector. Premium connectors need a Power Automate Premium licence for the user or a Power Automate Process licence on the flow." },
    { question: "Is a Microsoft 365 licence enough for premium connectors?", answer: "No. Microsoft's support article says a Power Apps, Dynamics 365 or Office 365 licence is not sufficient for saving or changing a flow that uses premium connectors. A Power Automate licence is required." },
    { question: "Does every user of a premium flow need a licence?", answer: "For an automated or scheduled flow, the owner's licence covers the runs. People who edit the flow or start it by hand each need a premium licence, unless the flow itself has a Power Automate Process licence." },
    { question: "I was given a licence but still get the service plan error. Why?", answer: "The new licence may not have reached the flow yet. Sign out and in again, open the flow and save it, which refreshes the licence the flow is tied to." }
  ],
  relatedTools: [],
  relatedPatterns: ["send-http-request-to-sharepoint-power-automate", "teams-workflows-webhook-post-to-channel", "export-power-platform-inventory-powershell", "power-platform-request-limits-monitor"],
  relatedLinks: [
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" },
    { href: "/guides/power-automate-http-quick-start", label: "HTTP action and trigger quick start" }
  ],
  relatedErrors: ["app-not-compliant-data-loss-prevention-policies", "problem-with-the-flows-trigger", "403-forbidden-power-automate"],
  sources: [servicePlanDoc, triggersDoc, changeOwnerDoc]
};

const failedToFetch: ErrorPage = {
  ...base,
  slug: "failed-to-fetch-client-request-aborted-power-automate",
  message: "Failed to Fetch",
  title: "Fix \"Failed to fetch\", \"Client request aborted\" and \"Network error\" in Power Automate",
  shortTitle: "Failed to fetch or Client request aborted",
  description: "Why the Power Automate website shows Failed to fetch, Client request aborted or Network error when you save a flow or create a connection, the checks to run in your own browser, and what to ask your network team to allow.",
  keywords: ["Power Automate Failed to fetch", "Client Request Aborted Power Automate", "Network Error Power Automate save flow", "cannot save flow failed to fetch", "Power Automate firewall allow list"],
  quickAnswer: "These three messages come from your browser, not from the flow. The page tried to reach a Microsoft address and the request was blocked or cut off before an answer came back. Microsoft's support article gives a company firewall blocking the required addresses as the cause. First rule out your own browser: try a private window with extensions off, and another network. If it works there, ask your network team to allow the Power Automate addresses that Microsoft publishes.",
  variants: [
    "Client Request Aborted",
    "Network Error",
    "TypeError: Failed to fetch"
  ],
  meaning: [
    p("The Power Automate designer is a web page that talks to a number of Microsoft services in the background: one to save the flow, others to list connections, load dynamic content and sign you in to each connector. **Failed to fetch** is the browser's own wording for a background request that never got a reply."),
    p("That makes this a different kind of error from the others in this library. Your flow has not run and nothing is wrong with its design. The page could not reach a server."),
    p("Microsoft's article lists the moments it appears: when creating or saving flows or connections, and when moving between pages in Power Automate.")
  ],
  causes: [
    ol(
      "A company **firewall or web proxy** blocks one or more of the addresses the page needs. This is the cause Microsoft's article gives.",
      "A **browser extension**, such as an ad blocker, privacy tool or script blocker, stops the request.",
      "Your **session expired** while the page was open, often after a laptop slept or a long break.",
      "A **VPN** or security agent on the device inspects or reroutes the traffic and drops it.",
      "The **network dropped** for a moment, as on weak Wi-Fi or a mobile connection.",
      "The flow is very large, and the save request takes long enough to be cut off along the way."
    )
  ],
  fixes: [
    p("**Do not lose your work first.** If the designer will not save, keep the tab open. Use **Peek code** or the code view on the actions you changed and copy the important expressions somewhere safe before you refresh."),
    p("**Then narrow it down, quickest checks first.**"),
    ol(
      "Refresh the page and sign in again if asked. An expired session clears this way.",
      "Open a **private or InPrivate window**, where extensions are off by default, and try the same step.",
      "Try a **different browser**, such as a current version of Microsoft Edge or Google Chrome.",
      "Try a **different network**, such as a phone hotspot, with the VPN off if your policy allows it.",
      "Press F12, open the **Network** tab, repeat the step and look for the request shown in red. Its address is the one being blocked."
    ),
    table(
      ["Result", "Meaning"],
      ["Works in a private window", "An extension is blocking the page. Turn extensions off one at a time, or allow the Power Automate site in the extension."],
      ["Works on another network", "The company firewall, proxy or VPN is blocking an address"],
      ["Fails everywhere, for everyone", "A service problem. Check the service health page in the Microsoft 365 admin center."],
      ["Fails only on one large flow", "Split the flow into a parent and child flows, so that each save is smaller"]
    ),
    p("**For a firewall or proxy,** send your network team the blocked address from the Network tab and Microsoft's page on IP address configuration for Power Automate, which lists the addresses and domains that must be allowed. The list changes, so it should be kept up to date and not copied once.")
  ],
  prevention: [
    ul(
      "Ask the network team to allow the published Power Automate endpoints for every maker, not one address at a time as each error appears.",
      "Save often while building, so that a failed save costs minutes and not an afternoon.",
      "Keep flows small. Move repeated groups of actions into child flows.",
      "Keep one browser profile for making flows with no blocking extensions in it."
    )
  ],
  faqs: [
    { question: "Why does Power Automate say Failed to fetch when I save a flow?", answer: "The browser could not reach one of the Microsoft services the designer depends on. The usual causes are a company firewall or proxy, a browser extension that blocks requests, or an expired session. Try a private window and another network to find out which." },
    { question: "Is Failed to fetch a problem with my flow?", answer: "No. It is a problem between your browser and the Power Automate service. The flow has not run, and its actions are not the cause, unless the flow is so large that saving it takes too long." },
    { question: "Which addresses does Power Automate need through a firewall?", answer: "Microsoft publishes the list on its IP address configuration page for Power Automate, and it changes over time. Ask your network team to follow that page instead of a copied list." },
    { question: "Will I lose my changes if the flow will not save?", answer: "Changes that were not saved are lost when the page is refreshed. Before you refresh, copy the expressions and settings you changed, then try again in a private window or on another network." }
  ],
  relatedTools: [],
  relatedPatterns: ["power-platform-environment-strategy"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" },
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" }
  ],
  relatedErrors: ["badgateway-502-power-automate", "429-rate-limit-exceeded-power-automate", "failed-to-refresh-access-token-for-service"],
  sources: [failedFetchDoc, ipConfigDoc, fixConnectionsDoc]
};

const oneDriveSignIn: ErrorPage = {
  ...base,
  slug: "sorry-we-cant-sign-you-in-here-with-your-account-onedrive",
  message: "Sorry, we can't sign you in here with your account.",
  title: "Fix \"Sorry, we can't sign you in here with your account\" on the OneDrive connector",
  shortTitle: "Sorry, we can't sign you in here with your account",
  description: "Why the OneDrive connector refuses a work or school account in Power Automate, how to switch a flow or template to OneDrive for Business, and how to tell the two connectors apart.",
  keywords: ["Sorry, we can't sign you in here with your account", "OneDrive connector sign in error Power Automate", "OneDrive vs OneDrive for Business connector", "cannot sign in OneDrive Power Automate", "OneDrive connector work account"],
  quickAnswer: "The flow uses the connector named OneDrive, which accepts personal Microsoft accounts only, and you tried to sign in with a work or school account. Use the OneDrive for Business connector instead. Delete the OneDrive trigger or action, add the one with the same name from OneDrive for Business, and sign in with your work account. Templates often include the personal connector, so check which one a template uses before you start.",
  variants: [
    "You can't sign in here with a work or school account. Use your personal account instead."
  ],
  meaning: [
    p("Microsoft runs two sign-in systems. Work and school accounts belong to an organisation's Microsoft 365 tenant. Personal Microsoft accounts are the ones people create for themselves, with addresses such as outlook.com or hotmail.com."),
    p("Power Automate has a separate OneDrive connector for each. Microsoft's support article describes the error exactly: while creating a flow that uses any trigger or action from the OneDrive connector, signing in with an Office 365 account gives this message."),
    table(
      ["Connector", "Accepts", "Stores files in"],
      ["OneDrive", "Personal Microsoft accounts", "Personal OneDrive"],
      ["OneDrive for Business", "Work or school accounts", "The OneDrive that comes with Microsoft 365"]
    )
  ],
  causes: [
    ol(
      "You searched for OneDrive in the designer and picked the first result, which was the personal connector.",
      "You started from a **template** that was built with the personal connector.",
      "A colleague exported a flow from a personal set-up and you imported it at work.",
      "Your organisation blocks sign-in with personal accounts, so even a real personal account is refused on a work device."
    ),
    p("The two connectors have almost the same icon and many actions with the same names, which is why this is so easy to do.")
  ],
  fixes: [
    p("**Swap the connector.** There is no setting that makes the personal connector accept a work account."),
    ol(
      "Open the flow in the designer and note the settings of the OneDrive step: the folder, the file name and any expressions.",
      "Add a new step and search for **OneDrive for Business**. Choose the trigger or action with the same name as the one you are replacing.",
      "Sign in with your work or school account when asked.",
      "Copy the settings across. Pick the folder again with the folder picker, because the two services use different identifiers.",
      "Fix the later steps. Dynamic content that came from the old step shows as missing, and has to be selected again from the new step.",
      "Delete the old OneDrive step and save."
    ),
    p("**If the step is the trigger,** you cannot have two triggers. Delete the old trigger first, add the OneDrive for Business trigger, and then repair the dynamic content in the steps below."),
    p("**If you started from a template,** it is often quicker to search the templates again for one that names OneDrive for Business, or to build the few steps from blank."),
    p("**If you really do want personal OneDrive,** sign in with a personal Microsoft account in the sign-in window. In a work browser profile, the window may sign you in as your work account without asking. Open Power Automate in a private window and try again, and be aware that many organisations block personal connectors with a data loss prevention policy."),
    note("Moving company files to a personal OneDrive from a work flow is usually against policy. If the designer stops you with a policy message, see [the DLP error page](/errors/app-not-compliant-data-loss-prevention-policies).")
  ],
  prevention: [
    ul(
      "Type **OneDrive for Business** in full when you search for the connector, and check the name shown under the action before you configure it.",
      "Read the list of connectors a template uses, shown before you create the flow, and look for the word Business.",
      "For files a team shares, skip OneDrive and use a SharePoint library. The [OneDrive quick start](/guides/power-automate-onedrive-quick-start) explains when each one fits."
    )
  ],
  faqs: [
    { question: "Why can't I sign in to the OneDrive connector with my work account?", answer: "The connector named OneDrive is for personal Microsoft accounts only. For a work or school account, use the OneDrive for Business connector, which has triggers and actions with the same names." },
    { question: "How do I change a flow from OneDrive to OneDrive for Business?", answer: "Add the matching trigger or action from OneDrive for Business, sign in with your work account, copy the settings across, reselect the dynamic content in later steps, and delete the old OneDrive step. A connection cannot be converted from one connector to the other." },
    { question: "Is OneDrive for Business a premium connector?", answer: "No. OneDrive for Business is a standard connector and is included with Microsoft 365 licences that include Power Automate." },
    { question: "Can I use a personal OneDrive in a work flow?", answer: "Only if your organisation allows it. The personal OneDrive connector needs a personal Microsoft account, and many organisations block it with a data loss prevention policy to keep company files out of personal storage." }
  ],
  relatedTools: [],
  relatedPatterns: ["move-copy-sharepoint-files-rename-conflict-power-automate", "dlp-connector-endpoint-filtering-action-control"],
  relatedLinks: [
    { href: "/guides/power-automate-onedrive-quick-start", label: "OneDrive connector quick start" },
    { href: "/guides/power-automate-sharepoint-quick-start", label: "SharePoint connector quick start" }
  ],
  relatedErrors: ["app-not-compliant-data-loss-prevention-policies", "failed-to-refresh-access-token-for-service", "user-account-is-disabled-power-automate-connection"],
  sources: [oneDriveSignInDoc, manageConnectionsDoc]
};

export const connectionErrorsTwo: ErrorPage[] = [missingAcl, unauthorized, forbidden, servicePlan, failedToFetch, oneDriveSignIn];
