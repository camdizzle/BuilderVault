import { automateDoc, learnDoc, note, ol, p, table, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Connections and sign-in" as const, published: "2026-11-20", updated: "2026-11-20" };

const brokenConnectionsDoc = learnDoc("troubleshoot/power-platform/power-automate/connections/troubleshoot-broken-connections", "Troubleshoot broken connections in Microsoft Power Platform");
const conditionalAccessDoc = learnDoc("troubleshoot/power-platform/power-automate/administration/conditional-access-and-multi-factor-authentication-in-flow", "Recommendations for conditional access and multifactor authentication in Power Automate");
const fixConnectionsDoc = automateDoc("fix-connection-failures", "Fix connection failures in cloud flows");
const manageConnectionsDoc = automateDoc("add-manage-connections", "Manage connections in Power Automate");
const errorCodesDoc = learnDoc("entra/identity-platform/reference-error-codes", "Microsoft Entra authentication and authorization error codes");
const refreshTokensDoc = learnDoc("entra/identity-platform/refresh-tokens", "Refresh tokens in the Microsoft identity platform");
const changeOwnerDoc = automateDoc("change-cloud-flow-owner", "Change the owner of a cloud flow");

const repairSteps = ol(
  "Sign in to Power Automate as the person who owns the connection.",
  "Open **Connections** from the left-hand menu. It may be under **More** or **Data**.",
  "Find the connection that shows an error, select the three dots next to it, and choose **Fix connection** or **Switch account**.",
  "Sign in when the window opens, and complete any extra verification it asks for.",
  "Open the flow, check that each action shows a working connection, and run a test.",
  "Open the run history and **Resubmit** the runs that failed, if their work still needs doing."
);

const refreshFailed: ErrorPage = {
  ...base,
  slug: "failed-to-refresh-access-token-for-service",
  message: "Failed to refresh access token for service",
  title: "Fix \"Failed to refresh access token for service\" on a Power Automate connection",
  shortTitle: "Failed to refresh access token for service",
  description: "Why a Power Automate connection stops with a token refresh failure, how to repair it in a few clicks, how to tell which of the seven usual causes applies, and how to stop it happening again.",
  keywords: ["Failed to refresh access token for service", "Power Automate connection broken", "Power Automate fix connection", "connection is not authenticated Power Automate", "flow failed connection error"],
  quickAnswer: "A connection stores a sign-in that Power Automate renews quietly in the background. This message means the renewal was refused, so the connection can no longer act for you. Open Connections, choose Fix connection on the one that shows the error, and sign in again. The flows that use it start working at once. The renewal is refused when a password changed, a security policy was added, the connection went unused for about 90 days, or the account was disabled.",
  variants: [
    "Failed to refresh access token for service: office365. Correlation Id=…, UTC TimeStamp=…, Error: Failed to acquire token from AAD.",
    "Invalid connection, please update your connection to load complete details."
  ],
  meaning: [
    p("When you create a connection to a Microsoft service, you sign in once. Power Automate keeps a refresh token from that sign-in and uses it to get a fresh access token whenever a flow runs. You never see this happen."),
    p("The message appears as the status of a connection, and in failed runs, when Microsoft Entra ID refuses to issue a new token. Nothing is wrong with the flow's logic. The flow has lost its permission to act, and every flow that uses the same connection is affected."),
    p("The text after the service name usually holds a second, more exact error with a code that starts with `AADSTS`. That code tells you the cause, so read to the end of the message.")
  ],
  causes: [
    table(
      ["Cause", "Code or text that goes with it", "Page"],
      ["The account's password was changed or reset", "AADSTS50173, the provided grant has expired due to it being revoked", "[Grant revoked](/errors/provided-grant-has-expired-due-to-it-being-revoked)"],
      ["A multifactor or location rule now applies", "AADSTS50076, you must use multi-factor authentication", "[MFA required](/errors/aadsts50076-multi-factor-authentication-power-automate)"],
      ["A Conditional Access policy blocks the sign-in", "AADSTS53003, access has been blocked by Conditional Access policies", "[Blocked by Conditional Access](/errors/access-blocked-by-conditional-access-policies-power-automate)"],
      ["The connection was not used for about 90 days", "AADSTS700082, the refresh token has expired due to inactivity", "[Expired due to inactivity](/errors/refresh-token-expired-due-to-inactivity-power-automate)"],
      ["The account was disabled or deleted", "AADSTS50057, the user account is disabled", "[Account disabled](/errors/user-account-is-disabled-power-automate-connection)"],
      ["A Terms of Use policy was added or its consent expired", "No specific code. Sign-in logs show AADSTS50158 or AADSTS53003.", "This page"],
      ["A service principal's secret expired", "The connection was made with a client ID and secret", "This page"]
    ),
    p("Microsoft's troubleshooting article singles out the **Terms of Use** case because the message gives no hint of it. A Terms of Use page needs a person to accept it, and a background renewal cannot show a page, so the connection breaks the next time its token is renewed, even for flows that ran for months before the policy existed.")
  ],
  fixes: [
    p("**Repair the connection.** This fixes most cases and takes a minute."),
    repairSteps,
    p("**If the sign-in window closes and the error stays,** the account still does not meet a policy. Sign in to Power Automate itself under the conditions the policy asks for, such as with multifactor authentication or from the office network, and repair the connection again."),
    p("**If a Terms of Use policy is the cause,** the connection's owner has to sign in to the Power Automate portal in a browser, accept the terms when prompted, and then repair the connection. If the consent expires on a schedule, this has to be repeated each time."),
    p("**If the connection uses a service principal,** create a new client secret for the app registration in Microsoft Entra ID, then edit the connection and enter the new secret."),
    p("**If you do not own the connection,** you cannot repair it. Ask the owner to, or create your own connection to the same service, open the flow, and choose your connection on each action that used the old one.")
  ],
  prevention: [
    ul(
      "Run important flows on a connection that belongs to a dedicated service account, not to one employee, so that a personal password change does not stop them.",
      "Ask your administrator to exclude service accounts and dedicated connection owners from Conditional Access policies that require Terms of Use. Microsoft's guidance recommends this.",
      "Record the expiry date of every client secret and renew it before that date.",
      "Add a failure alert to flows that matter, so that a broken connection is noticed within minutes. The [try, catch and finally pattern](/patterns/power-automate-try-catch-scope-error-handling) shows how.",
      "In solutions, use connection references so that one repair fixes every flow. See the [connection reference standards](/standards/connection-reference-standards)."
    )
  ],
  faqs: [
    { question: "How do I fix a broken connection in Power Automate?", answer: "Open Connections in Power Automate, find the connection that shows an error, select the three dots, choose Fix connection and sign in again. The flows that use the connection work again straight away, and failed runs can be resubmitted from the run history." },
    { question: "Why do my Power Automate connections keep breaking?", answer: "The stored sign-in is being rejected. The usual reasons are a changed password, a multifactor or Conditional Access policy, a Terms of Use policy, about 90 days without use, or a disabled account. The code that starts with AADSTS in the full message tells you which one." },
    { question: "Do I need to rebuild my flow after fixing a connection?", answer: "No. The flow keeps pointing at the same connection, so repairing the connection is enough. You only need to edit the flow if you replace the connection with a different one." },
    { question: "Can someone else fix my connection for me?", answer: "No. A connection holds your sign-in, so only you can repair it. Another person can create their own connection and switch the flow's actions to it." }
  ],
  relatedTools: [],
  relatedPatterns: ["connection-references-for-solution-flows", "power-automate-try-catch-scope-error-handling", "service-principal-application-user-deployments"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" },
    { href: "/standards/connection-reference-standards", label: "Connection reference standards" }
  ],
  relatedErrors: ["provided-grant-has-expired-due-to-it-being-revoked", "aadsts50076-multi-factor-authentication-power-automate", "refresh-token-expired-due-to-inactivity-power-automate", "401-unauthorized-power-automate"],
  sources: [brokenConnectionsDoc, conditionalAccessDoc, fixConnectionsDoc, manageConnectionsDoc]
};

const mfaRequired: ErrorPage = {
  ...base,
  slug: "aadsts50076-multi-factor-authentication-power-automate",
  message: "AADSTS50076: Due to a configuration change made by your administrator, or because you moved to a new location, you must use multi-factor authentication to access",
  title: "Fix AADSTS50076 \"you must use multi-factor authentication\" in Power Automate",
  shortTitle: "AADSTS50076: you must use multi-factor authentication",
  description: "Why a flow or connection fails with AADSTS50076 after a multifactor authentication change, what the flow's owner can do in two minutes, and what an administrator should change so that it stops happening.",
  keywords: ["AADSTS50076", "you must use multi-factor authentication to access", "Power Automate MFA connection error", "Due to a configuration change made by your administrator", "Power Automate conditional access MFA"],
  quickAnswer: "The connection was created with a sign-in that did not use multifactor authentication, and a policy now requires it. Sign out of Power Automate, sign in again and complete the multifactor prompt, then open Connections and repair the connection so that it stores a sign-in that meets the policy. If the error appears only when a flow is opened from SharePoint, Teams or Excel, an administrator needs to make the policy the same for those apps and for Power Automate.",
  variants: [
    "AADSTS50076: Due to a configuration change made by your administrator, or because you moved to a new location, you must use multi-factor authentication to access '00000003-0000-0000-c000-000000000000'.",
    "AADSTS50079: Due to a configuration change made by your administrator, or because you moved to a new location, you must enroll in multi-factor authentication.",
    "UserStrongAuthClientAuthNRequired"
  ],
  meaning: [
    p("Microsoft Entra ID refused to issue a token because the sign-in behind the request was made with a password only, and a rule now asks for a second factor. The rule is usually a Conditional Access policy or per-user multifactor enforcement."),
    p("The long number or GUID at the end of the message names the service that was being reached. `00000003-0000-0000-c000-000000000000` is Microsoft Graph and `00000003-0000-0ff1-ce00-000000000000` is SharePoint Online."),
    p("Microsoft's support article describes three places where this shows up: in failed runs of flows that worked before the policy was turned on, when a person tries to create a connection, and when a flow is opened from inside another app.")
  ],
  causes: [
    ol(
      "An administrator turned on a multifactor requirement after the connection was created. The stored sign-in no longer satisfies it, and runs fail from then on.",
      "The person signed in to Power Automate without multifactor authentication and then tried to create a connection to a service that requires it.",
      "The flow is opened from SharePoint, Teams or Excel, and the policy asks for multifactor authentication for Power Automate but not for that app, or the other way round. The app swaps its own token for a Power Automate token, and the swap fails when the requirements differ.",
      "The account moved to a location the policy treats differently, such as outside the office network.",
      "The tenant uses the setting that remembers multifactor authentication on trusted devices. Microsoft's article says this shortens token lifetimes so that connections expire every 14 days."
    )
  ],
  fixes: [
    p("**What the connection's owner can do.**"),
    ol(
      "Sign out of Power Automate completely, or open a private browser window.",
      "Sign in again and complete the multifactor prompt. If no prompt appears, sign in from the network or device the policy expects.",
      "Open **Connections**, find the connection with the error, and choose **Fix connection**.",
      "Test the flow and resubmit any failed runs that still matter."
    ),
    p("The repair works only if the new sign-in meets the policy. Repairing the connection from a session that itself skipped multifactor authentication stores another sign-in that will be refused."),
    p("**AADSTS50079 is different.** It means the account has not registered a second factor yet. Set up the authenticator app or phone number at the security info page of your account, then repair the connection."),
    p("**What an administrator can do.** For errors that appear in SharePoint, Teams or Excel, Microsoft's guidance is to target the **Office 365** app or **All cloud apps** in the Conditional Access policy, so that the same requirement applies to Power Automate and to the apps that embed it. If the policy has to list apps one by one, include **Microsoft Flow Service**, application ID `7df0a125-d3be-4c96-aa54-591f83ff541c`, alongside the host apps, with the same requirements. Affected users then sign out and in again.")
  ],
  prevention: [
    ul(
      "Tell flow owners before a multifactor policy goes live, so that they can repair their connections on the day instead of finding out from failed runs.",
      "Always sign in to Power Automate under the same conditions your services require.",
      "Ask your administrator to avoid the remember multifactor authentication setting for trusted devices. Microsoft recommends against it for tenants that use Power Automate.",
      "Keep production flows on a small number of service accounts whose policy is known and stable, and document who can complete their multifactor prompt."
    ),
    note("A service account that needs a person with a phone to approve every repair is a single point of failure. Agree with your administrator who holds the second factor and who covers for them.")
  ],
  faqs: [
    { question: "What does AADSTS50076 mean in Power Automate?", answer: "Microsoft Entra ID refused the request because a policy requires multifactor authentication and the sign-in stored in the connection was made without it. Sign in again with multifactor authentication and repair the connection." },
    { question: "Why did my flow start failing with AADSTS50076 when nothing changed?", answer: "Something changed outside the flow. An administrator turned on or widened a multifactor or Conditional Access policy, or the account now signs in from a location the policy treats differently. Connections created before the change stop working until they are repaired." },
    { question: "Why do I only get the MFA error when I open a flow from SharePoint or Teams?", answer: "The policy for that app and the policy for Power Automate ask for different things, so the token exchange between them fails. An administrator needs to apply the same requirement to both, most simply by targeting the Office 365 app or All cloud apps." },
    { question: "Can a flow complete an MFA prompt?", answer: "No. A flow runs in the background and cannot answer a prompt. A person completes multifactor authentication once when the connection is created or repaired, and the flow reuses that sign-in." }
  ],
  relatedTools: [],
  relatedPatterns: ["connection-references-for-solution-flows", "power-platform-admin-roles-least-privilege"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  relatedErrors: ["failed-to-refresh-access-token-for-service", "access-blocked-by-conditional-access-policies-power-automate", "provided-grant-has-expired-due-to-it-being-revoked"],
  sources: [conditionalAccessDoc, brokenConnectionsDoc, errorCodesDoc]
};

const inactiveToken: ErrorPage = {
  ...base,
  slug: "refresh-token-expired-due-to-inactivity-power-automate",
  message: "The refresh token has expired due to inactivity. The token was issued on … and was inactive for 90.00:00:00.",
  title: "Fix \"The refresh token has expired due to inactivity\" in Power Automate",
  shortTitle: "Refresh token expired due to inactivity",
  description: "Why a connection that has not been used for about 90 days stops working, how to repair it, and how to keep seldom-used flows such as yearly or emergency processes from failing on the day they are needed.",
  keywords: ["The refresh token has expired due to inactivity", "AADSTS700082", "was inactive for 90.00:00:00", "Power Automate connection expired 90 days", "AADSTS70008"],
  quickAnswer: "A connection stays signed in only while it is used. If no flow or app uses it for about 90 days, Microsoft Entra ID retires the stored sign-in and the next run fails with this message. Open Connections, choose Fix connection and sign in again. To prevent it, make sure every connection that matters is used by something at least once a month.",
  variants: [
    "AADSTS700082: The refresh token has expired due to inactivity. The token was issued on 2026-08-01T09:15:00.0000000Z and was inactive for 90.00:00:00.",
    "AADSTS70008: The provided authorization code or refresh token has expired due to inactivity. Send a new interactive authorization request for this user and resource.",
    "ExpiredOrRevokedGrantInactiveToken"
  ],
  meaning: [
    p("A connection holds a refresh token. Each time it is used, the token is exchanged for a new one, and the clock starts again. A refresh token that is not used at all for the inactivity period, which is 90 days by default, stops being valid."),
    p("Microsoft's list of error codes describes AADSTS700082 as an expected part of the token's life: the user went a long time without using the application, so the token had expired when the app tried to renew it. Nobody did anything wrong. The connection was simply left alone for too long.")
  ],
  causes: [
    ol(
      "The flow runs rarely: a year-end process, a quarterly report, or a flow that someone starts by hand a few times a year.",
      "The flow was turned off for a few months and has now been turned on again.",
      "The connection belongs to a test or backup flow that nobody has run since it was built.",
      "A flow has a branch that uses a different connection, such as an escalation email from another account, and that branch has not been reached for months.",
      "The trigger has not fired for a long time because the thing it watches is quiet, such as a list that receives no new items."
    ),
    p("Cause 4 is the one that catches people out. The flow runs every day, so it looks healthy, but one of its connections is used only when something unusual happens, and that is exactly the day it fails.")
  ],
  fixes: [
    ol(
      "Open **Connections** in Power Automate.",
      "Find the connection with the error and choose **Fix connection**.",
      "Sign in. The connection gets a new token and a new 90 days.",
      "Open the failed run and **Resubmit** it."
    ),
    p("If the connection belongs to someone who has left or cannot be reached, create your own connection to the same service and switch the flow's actions to it. In a solution, edit the connection reference so that every flow using it changes at once.")
  ],
  prevention: [
    ul(
      "**Give seldom-used connections regular work.** A small scheduled flow that runs once a week and makes one harmless call on each connection, such as reading one item, keeps the tokens alive.",
      "**Test rare flows before they are needed.** Put a reminder in the calendar a week before the yearly run, and run a test then.",
      "**Check the Connections page now and then.** A connection that needs attention is marked there before any run has failed.",
      "**Use fewer connections.** Ten flows that share one service account's connection keep it active between them. Ten separate connections each have their own clock."
    ),
    p("The [connection reference pattern](/patterns/connection-references-for-solution-flows) shows how to share one connection across the flows in a solution.")
  ],
  faqs: [
    { question: "Do Power Automate connections expire?", answer: "A connection to a Microsoft service keeps working for as long as it is used. If it is not used for about 90 days, its stored sign-in expires and it has to be repaired by signing in again. Password changes and security policies can also end it sooner." },
    { question: "How do I stop a Power Automate connection from expiring?", answer: "Use it. Any flow run or app session that uses the connection renews its token. For connections used by rare flows, add a small weekly scheduled flow that makes one simple call with each connection." },
    { question: "What is the difference between AADSTS700082 and AADSTS70008?", answer: "Both report a refresh token that expired because it was not used. AADSTS700082 is the newer and more specific code. The fix is the same for both: sign in again to repair the connection." },
    { question: "Can an administrator make connections last longer than 90 days?", answer: "The 90 days is Microsoft Entra ID's default inactivity period for refresh tokens. Administrators have limited control over it, and security policies such as sign-in frequency can make it shorter. Keeping the connection in use is the dependable fix." }
  ],
  relatedTools: [],
  relatedPatterns: ["connection-references-for-solution-flows", "power-automate-try-catch-scope-error-handling"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" },
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" }
  ],
  relatedErrors: ["failed-to-refresh-access-token-for-service", "provided-grant-has-expired-due-to-it-being-revoked", "problem-with-the-flows-trigger"],
  sources: [brokenConnectionsDoc, errorCodesDoc, refreshTokensDoc, fixConnectionsDoc]
};

const grantRevoked: ErrorPage = {
  ...base,
  slug: "provided-grant-has-expired-due-to-it-being-revoked",
  message: "The provided grant has expired due to it being revoked, a fresh auth token is needed. The user might have changed or reset their password.",
  title: "Fix \"The provided grant has expired due to it being revoked\" after a password change in Power Automate",
  shortTitle: "Grant revoked after a password change",
  description: "Why flows stop after a password change or reset with AADSTS50173, how to repair every affected connection, and how to set up service accounts so that a password change does not take production flows down.",
  keywords: ["The provided grant has expired due to it being revoked", "AADSTS50173", "Power Automate password change connection", "a fresh auth token is needed", "TokensValidFrom"],
  quickAnswer: "The password of the account behind the connection was changed or reset, or an administrator revoked its sessions. That cancels every sign-in the account had stored, including the ones inside Power Automate connections. Open Connections and choose Fix connection on each connection that shows an error, signing in with the new password. Every connection made with that account is affected, not only the one in the flow that failed first.",
  variants: [
    "AADSTS50173: The provided grant has expired due to it being revoked, a fresh auth token is needed. The user might have changed or reset their password. The grant was issued on '2026-09-02T08:11:45.0000000Z' and the TokensValidFrom date (before which tokens are not valid) for this user is '2026-11-18T14:03:21.0000000Z'.",
    "The user could not be authenticated as the grant is expired. The user must sign in again."
  ],
  meaning: [
    p("The message contains two dates. The first is when the connection's sign-in was issued. The second, **TokensValidFrom**, is a line that Microsoft Entra ID draws for the account: any token issued before it is refused. The line moves forward when the password changes or when sessions are revoked."),
    p("So the connection is holding a sign-in from before the line. It is not damaged and the flow is not wrong. The account simply has to sign in again."),
    p("The second date is useful evidence. It tells you when the password change or revocation happened, to the second.")
  ],
  causes: [
    ol(
      "The account's owner changed the password, by choice or because a password expiry policy forced it.",
      "The password was reset by the help desk or through self-service reset.",
      "An administrator revoked the account's sessions, which is a standard step when an account may have been compromised or a device was lost.",
      "A security product flagged the account as at risk and forced a password change.",
      "The account is a shared service account, and one of the people who use it changed its password without telling the others."
    )
  ],
  fixes: [
    p("**Repair every connection that the account owns.**"),
    ol(
      "Sign in to Power Automate as that account.",
      "Open **Connections**. Each connection made with the account that needs attention is marked with an error.",
      "Choose **Fix connection** on each one and sign in with the new password.",
      "Switch to each other environment the account uses and repeat. Connections are kept per environment.",
      "Resubmit the failed runs that still matter."
    ),
    p("Canvas apps use the same connections. A person who opens an app after changing their password is asked to sign in again, which repairs their own connections. Flows have nobody to ask, so they fail until someone does the repair."),
    p("**If the password of a service account was changed by someone else,** find out the new password through your normal process before doing anything. Repeated sign-in attempts with the old one can lock the account.")
  ],
  prevention: [
    ul(
      "**Do not run production flows on personal accounts.** Every routine password change by that person stops the flows.",
      "**Give service accounts a planned password process.** Decide who changes the password, when, and who repairs the connections straight afterwards, and treat it as one task.",
      "**Consider a service principal for Dataverse and other connectors that support it.** It signs in with a secret or certificate that has a known expiry date and is not affected by password policy. The [service principal pattern](/patterns/service-principal-application-user-deployments) explains the set-up.",
      "**Keep a list of what each service account connects to,** so that a repair after a change takes minutes. The [inventory pattern](/patterns/export-power-platform-inventory-powershell) exports flows and their connections."
    )
  ],
  faqs: [
    { question: "Do I have to fix Power Automate connections after changing my password?", answer: "Yes, for connections to Microsoft services made with that account. Changing or resetting the password cancels the stored sign-ins, so each connection has to be repaired by signing in again with the new password." },
    { question: "What does TokensValidFrom mean in the AADSTS50173 error?", answer: "It is the date and time before which Microsoft Entra ID no longer accepts tokens for the account. It is set when the password changes or when sessions are revoked, so it tells you when that happened." },
    { question: "Why did all my flows fail at the same time?", answer: "They share connections made with one account, and that account's password was changed or its sessions were revoked. Every connection the account owns stops at the same moment. Repair them from the Connections page." },
    { question: "How do I stop password changes from breaking flows?", answer: "Move production flows to a dedicated service account with a planned password process, or to a service principal where the connector supports it. Then a person's own password change no longer affects the flows." }
  ],
  relatedTools: [],
  relatedPatterns: ["service-principal-application-user-deployments", "export-power-platform-inventory-powershell", "connection-references-for-solution-flows"],
  relatedLinks: [
    { href: "/standards/connection-reference-standards", label: "Connection reference standards" },
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  relatedErrors: ["failed-to-refresh-access-token-for-service", "user-account-is-disabled-power-automate-connection", "401-unauthorized-power-automate"],
  sources: [brokenConnectionsDoc, errorCodesDoc, fixConnectionsDoc]
};

const blockedByPolicy: ErrorPage = {
  ...base,
  slug: "access-blocked-by-conditional-access-policies-power-automate",
  message: "Access has been blocked by Conditional Access policies. The access policy does not allow token issuance.",
  title: "Fix \"Access has been blocked by Conditional Access policies\" in Power Automate",
  shortTitle: "Blocked by Conditional Access policies",
  description: "Why a flow fails with AADSTS53003 or a device compliance message, why a cloud flow can never satisfy a device rule, what to send your administrator, and the policy changes Microsoft recommends.",
  keywords: ["Access has been blocked by Conditional Access policies", "AADSTS53003", "The access policy does not allow token issuance", "Device is not in required device state", "Power Automate conditional access"],
  quickAnswer: "A Conditional Access policy in your organisation refused the sign-in that the connection depends on. Unlike a missing multifactor step, this is not something you can fix by signing in again from the same place. Try repairing the connection from a managed work device on the office network. If it still fails, an administrator has to look at the sign-in log to see which policy applied and adjust it, most often by excluding the service account or by removing a device or location rule that a cloud service cannot meet.",
  variants: [
    "AADSTS53003: Access has been blocked by Conditional Access policies. The access policy does not allow token issuance.",
    "AADSTS53000: Device is not in required device state: compliant. Conditional Access policy requires a compliant device, and the device is not compliant. The user must enroll their device with an approved MDM provider like Intune.",
    "Device is not in required device state: domain_joined. Conditional Access policy requires a domain joined device, and the device is not domain joined.",
    "Device object was not found in the tenant directory.",
    "AADSTS50158: External security challenge not satisfied."
  ],
  meaning: [
    p("Conditional Access is the set of rules an organisation uses to decide when a sign-in is allowed: from which locations, on which devices, with which extra checks. This message means a rule said no."),
    p("A person at a desk can usually satisfy the rule by moving to a managed laptop or the office network. A cloud flow cannot. It runs on Microsoft's servers, not on your device and not on your network, so a rule that demands a compliant device or a company IP address can never be met by the flow's background token renewal. The connection works when a person creates it and fails later, when the service renews it without them.")
  ],
  causes: [
    ol(
      "A policy requires a **compliant or domain-joined device**, and it applies to the account that owns the connection.",
      "A policy allows sign-ins only from **named locations**, such as office IP ranges.",
      "A policy **blocks** an app, a group of users or a kind of client outright, and the connection's account or service falls inside it.",
      "A policy requires acceptance of **Terms of Use**, which a background renewal cannot show. Microsoft's article notes that the sign-in log then shows AADSTS50158 or AADSTS53003.",
      "A **sign-in risk** policy judged the account risky, for example after sign-ins from unusual places.",
      "The device that was used to create the connection has since been disabled or removed from management."
    )
  ],
  fixes: [
    p("**What you can try yourself.**"),
    ol(
      "Use a managed work device, connected to the office network or VPN.",
      "Sign in to Power Automate there, open **Connections** and choose **Fix connection**.",
      "Run the flow. If it works now and fails again within days, the policy is one the flow cannot satisfy on its own, and the repair will not last."
    ),
    p("**What to send your administrator.** The fix is in the policy, and the administrator needs to find the right one. Copy these from the failed run or the sign-in window:"),
    ul(
      "The full error text, including the **AADSTS** code.",
      "The **Correlation ID** and **Timestamp** shown with the error.",
      "The account that owns the connection, and the service it connects to."
    ),
    p("With the correlation ID, the administrator can open the entry in the Microsoft Entra sign-in logs. Its **Conditional Access** tab lists each policy that was evaluated and which one failed."),
    p("**What the administrator can change.** Microsoft's recommendations for tenants that use Power Automate are:"),
    ul(
      "Target the **Office 365** app or **All cloud apps** so that Power Automate and the services it connects to have the same requirements.",
      "Exclude service accounts and dedicated connection owners from policies with a **Terms of Use** control.",
      "Never use per-device Terms of Use for applications that Power Automate connects to, because flows do not run on a user's registered device."
    ),
    p("An exclusion for a service account is a security decision. It is reasonable to ask for one, and reasonable for the administrator to ask for compensating controls, such as a long random password and a restricted set of permissions.")
  ],
  prevention: [
    ul(
      "Involve whoever owns Conditional Access before a flow goes into production, and agree which account it will run as.",
      "Keep production connections on service accounts that the policies were designed around, not on staff accounts whose devices and locations change.",
      "Ask to be told before policy changes go live, so that owners can test and repair connections on the day.",
      "Where a connector supports it, use a service principal. Policies for workload identities are managed separately from policies for people."
    )
  ],
  faqs: [
    { question: "What does AADSTS53003 mean in Power Automate?", answer: "A Conditional Access policy in your organisation blocked the sign-in that the connection relies on. The message does not say which policy. An administrator can find it in the Microsoft Entra sign-in logs using the correlation ID from the error." },
    { question: "Why does my connection work when I create it and fail a few days later?", answer: "You met the policy when you signed in from your managed device or office network. When Power Automate later renews the sign-in in the background, the request comes from Microsoft's cloud and cannot meet a device or location rule, so it is refused." },
    { question: "Can a Power Automate flow satisfy a compliant device policy?", answer: "No. Cloud flows run on Microsoft's infrastructure, not on a registered device. A policy that requires a compliant or domain-joined device has to exclude the account the flow uses, or the connection will keep breaking." },
    { question: "Can I fix a Conditional Access error myself?", answer: "Sometimes. Repairing the connection from a managed device on the office network works when the policy only needed to be met at sign-in. If the error returns, the policy has to be changed by an administrator." }
  ],
  relatedTools: [],
  relatedPatterns: ["power-platform-admin-roles-least-privilege", "service-principal-application-user-deployments", "tenant-isolation-cross-tenant-connections"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  relatedErrors: ["aadsts50076-multi-factor-authentication-power-automate", "failed-to-refresh-access-token-for-service", "app-not-compliant-data-loss-prevention-policies"],
  sources: [brokenConnectionsDoc, conditionalAccessDoc, errorCodesDoc]
};

const accountDisabled: ErrorPage = {
  ...base,
  slug: "user-account-is-disabled-power-automate-connection",
  message: "The user account is disabled.",
  title: "Fix \"The user account is disabled\" when a flow's connection owner has left",
  shortTitle: "The user account is disabled",
  description: "What to do when flows fail because the person who created the connections has left or been disabled: how to find every affected flow, replace the connections, move ownership, and set flows up so that a leaver never breaks them.",
  keywords: ["The user account is disabled", "AADSTS50057", "flow owner left the company Power Automate", "has been deleted from the directory", "orphaned flow connection"],
  quickAnswer: "The account that created the flow's connection has been disabled or deleted, usually because the person left. The connection cannot be repaired, because nobody can sign in as that account. A current owner of the flow has to create new connections with a working account and choose them on each action, or on the connection reference if the flow is in a solution. If the flow has no remaining owner, an administrator has to add one first.",
  variants: [
    "AADSTS50057: The user account is disabled.",
    "The user account {EUII Hidden} has been deleted from the directory. To sign into this application, the account must be added to the directory.",
    "AADSTS50034: The user account {EUII Hidden} does not exist in the directory. To sign into this application, the account must be added to the directory."
  ],
  meaning: [
    p("Every connection belongs to the account that signed in to create it, and a flow acts as that account each time it runs. When the account is disabled or deleted in Microsoft Entra ID, it can no longer get a token, and every action that uses its connections fails."),
    p("This is what happens to flows when their maker leaves and nobody planned for it. The flow is still there and may still be turned on. Its triggers and actions fail until the connections are replaced."),
    p("Microsoft's troubleshooting article notes that this affects everyone who shares the connection, not only the person who left.")
  ],
  causes: [
    ol(
      "The person who built the flow left the organisation, and their account was disabled as part of leaving.",
      "The account was deleted after the retention period that follows disabling.",
      "The account was disabled temporarily, for long leave or a security investigation.",
      "The account was renamed or moved to another tenant in a merger, so the original no longer exists.",
      "The flow ran as a shared account that was closed in a clean-up of unused accounts."
    )
  ],
  fixes: [
    p("**If you are an owner or co-owner of the flow.**"),
    ol(
      "Open the flow for editing. Actions with a broken connection show a warning.",
      "On each of those actions, open the connection menu and choose **Add new connection**, or pick one of your own existing connections.",
      "If the **trigger** used the old account, fix it too. A trigger with a dead connection stops the flow from starting at all.",
      "Save the flow and run a test.",
      "Check that the new account can reach everything the old one could: the SharePoint sites, mailboxes and tables the flow touches."
    ),
    p("**If the flow is in a solution,** the actions point at connection references. Open the solution, edit each connection reference, and choose a working connection. Every flow that uses the reference changes with it. This is a single repair for many flows."),
    p("**If nobody who is left owns the flow,** an administrator of the environment can open the flow from the Power Platform admin center and add an owner. For a flow in a solution, an owner, a co-owner or an administrator can change the owner to another user."),
    p("**If the account is only disabled for a while,** the connections work again when it is enabled, though they may need **Fix connection** if the password was also reset."),
    note("Permissions go with the account. After you switch a flow to your own connections, emails come from you, list items show you as the editor, and anything the old account could reach and you cannot will fail with a [403 Forbidden](/errors/403-forbidden-power-automate).")
  ],
  prevention: [
    ul(
      "**Add a second owner to every flow that matters.** A flow with one owner is one resignation away from being stuck.",
      "**Run shared processes on a service account,** not on a person's account. People leave. Service accounts are handed over.",
      "**Build in solutions with connection references.** Replacing a leaver's connections is then one edit per reference.",
      "**Add flows to the leaver process.** Before an account is disabled, list the flows and connections it owns and reassign them. The [inventory pattern](/patterns/export-power-platform-inventory-powershell) produces that list.",
      "**Avoid personal OneDrive for shared files.** The files go when the account goes. The [OneDrive quick start](/guides/power-automate-onedrive-quick-start) compares it with SharePoint."
    )
  ],
  faqs: [
    { question: "What happens to Power Automate flows when the owner leaves the company?", answer: "The flows stay in the environment, but when the owner's account is disabled their connections stop working and the flows fail. A co-owner or an administrator has to replace the connections with ones from a working account." },
    { question: "Can I fix a connection that belonged to someone who left?", answer: "No. Repairing a connection means signing in as its account, which is no longer possible. Create a new connection with a current account and select it in the flow or in the solution's connection reference." },
    { question: "How do I take over a flow from a former employee?", answer: "If you are already a co-owner, edit the flow and replace the connections. If not, ask a Power Platform administrator to add you as an owner. For flows in a solution, the owner can be changed on the flow's details page." },
    { question: "How do I find all flows owned by a disabled user?", answer: "A Power Platform administrator can list flows by owner in the admin center, or export an inventory with the PowerShell cmdlets for Power Platform administrators and filter it by the creator's account." }
  ],
  relatedTools: [],
  relatedPatterns: ["connection-references-for-solution-flows", "export-power-platform-inventory-powershell", "service-principal-application-user-deployments"],
  relatedLinks: [
    { href: "/standards/connection-reference-standards", label: "Connection reference standards" },
    { href: "/guides/power-automate-onedrive-quick-start", label: "OneDrive connector quick start" }
  ],
  relatedErrors: ["approvals-connection-owner-was-not-found-in-graph", "flows-not-turned-on-after-solution-import-connection-references", "permission-denied-due-to-missing-connection-acl", "failed-to-refresh-access-token-for-service"],
  sources: [brokenConnectionsDoc, changeOwnerDoc, errorCodesDoc, manageConnectionsDoc]
};

export const connectionErrorsOne: ErrorPage[] = [refreshFailed, mfaRequired, inactiveToken, grantRevoked, blockedByPolicy, accountDisabled];
