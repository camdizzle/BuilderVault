import { automateDoc, code, learnDoc, note, ol, p, table, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Desktop flows" as const, published: "2026-11-21", updated: "2026-11-21" };
const support = (page: string, label: string) => learnDoc(`troubleshoot/power-platform/power-automate/desktop-flows/${page}`, label);

const runErrorsDoc = support("troubleshoot-errors-running-attended-or-unattended-desktop-flows", "Error codes when running an attended or unattended desktop flow");
const connectionsDoc = automateDoc("desktop-flows/desktop-flow-connections", "Desktop flow connections");
const troubleshooterDoc = automateDoc("desktop-flows/troubleshooter", "Power Automate for desktop troubleshooter");
const failedRunLink = { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" };

const assumeControl: ErrorPage = {
  ...base,
  slug: "failed-to-assume-control-of-microsoft-edge-desktop-flow",
  message: "Failed to assume control of Microsoft Edge (Internal error or communication failure).",
  title: "Fix \"Failed to assume control of Microsoft Edge\" in a desktop flow",
  shortTitle: "Failed to assume control of Microsoft Edge",
  description: "Why a desktop flow's Launch new Microsoft Edge, Chrome or Firefox action fails to take control of the browser, and the fixes: the browser extension, a longer timeout, a retry pattern and running as the same user.",
  keywords: ["Failed to assume control of Microsoft Edge", "Failed to assume control of Chrome", "Power Automate desktop browser extension", "Launch new Microsoft Edge error", "desktop flow web automation fails"],
  quickAnswer: "Power Automate for desktop opened the browser but could not connect to it through its browser extension. Most often the extension is missing, disabled or broken, or the browser took longer to start than the action's timeout. Run the Power Automate for desktop troubleshooter, reinstall and enable the extension, and raise the action's timeouts. If it still fails some of the time, launch the browser, then attach to it with a retry.",
  variants: [
    "Failed to assume control of Chrome (Internal error or communication failure).",
    "Failed to assume control of Firefox (Internal error or communication failure).",
    "Failed to assume control of Microsoft Edge."
  ],
  meaning: [
    p("Browser actions in a desktop flow work through a Power Automate extension installed in the browser. The **Launch new** action starts the browser, then hands control to the extension. This error means the hand-over did not happen: the browser is open, or about to be, but the flow cannot talk to it."),
    p("Because the browser does start, the error can look random. One run works and the next fails, depending on how quickly the browser opened and whether anything else was using it.")
  ],
  causes: [
    ol(
      "The Power Automate extension is not installed, not enabled, or installed but not running in that browser profile.",
      "The browser took longer to start than the action's timeouts, which is common on a busy machine or a virtual machine just after sign-in.",
      "The browser was started by a different Windows user from the one running Power Automate for desktop.",
      "A browser policy in the organization blocks or removes the extension.",
      "An old version of Power Automate for desktop or of the extension."
    )
  ],
  fixes: [
    p("**Start with the troubleshooter.** Microsoft's support article recommends running the **Troubleshoot UI/Web automation issues** diagnostic in the Power Automate for desktop troubleshooter and pressing **Fix** for any issue it finds."),
    p("**Reinstall the extension.** Install it from the Power Automate for desktop designer, under **Tools**, **Browser extensions**. Microsoft's advice is to remove and reinstall it even if it looks installed and enabled, then restart the browser."),
    p("**Raise the timeouts.** In the **Launch new Microsoft Edge** (or Chrome or Firefox) action, increase the timeout for the web page to load and the timeout for the browser to start."),
    p("**Launch, then attach with a retry.** If it still fails some of the time, split the work in two:"),
    ol(
      "Add **Launch new Microsoft Edge** with **Launch new instance** and an initial URL. In its **On error** settings, set it to continue with the next action.",
      "Add a second **Launch new Microsoft Edge** set to **Attach to running instance**, attaching by the same URL, and producing the same browser variable as the first.",
      "In the second action's **On error** settings, turn on **Retry action if an error occurs**. Microsoft's example uses 20 retries, 5 seconds apart.",
      "Add **Go to web page** with that browser variable and your target URL."
    ),
    note("Microsoft also describes a simpler version with a **Wait** action of about 90 seconds between the launch and the attach. The retry version finishes as soon as the browser is ready, so it is usually quicker.")
  ],
  prevention: [
    ul(
      "Include the extension in the build of every machine that runs unattended flows, and check it after browser updates.",
      "Run the browser and the flow as the same Windows user.",
      "Keep Power Automate for desktop up to date on every machine in a machine group.",
      "Close the browser at the end of each flow so the next run starts clean."
    )
  ],
  faqs: [
    { question: "Why does Power Automate for desktop fail to assume control of Edge?", answer: "The flow could not connect to the browser through the Power Automate extension. The extension may be missing or disabled, or the browser took longer to open than the action's timeout. Reinstall the extension and raise the timeouts." },
    { question: "Where do I install the Power Automate browser extension?", answer: "From the Power Automate for desktop designer, under Tools and then Browser extensions, choose the browser. Then enable it in the browser and restart the browser." },
    { question: "The error only happens sometimes. What should I do?", answer: "That usually means the browser is slow to start. Launch the browser, continue on error, then attach to it with an action set to retry, so the flow waits until the browser is ready." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [failedRunLink],
  relatedErrors: ["action-failed-failed-to-get-ui-element-desktop-flow", "sessioncreationtimeout-desktop-flow"],
  sources: [
    support("browser-automation/failed-to-assume-control-of-edge-chrome-firefox-error", "\"Failed to assume control of Microsoft Edge/Chrome/Firefox\" error"),
    troubleshooterDoc
  ]
};

const uiElement: ErrorPage = {
  ...base,
  slug: "action-failed-failed-to-get-ui-element-desktop-flow",
  message: "Action failed (failed to get UI element)",
  title: "Fix \"Failed to get UI element\" and \"Element with selector not found\" in desktop flows",
  shortTitle: "Failed to get UI element",
  description: "Why a desktop flow's UI or browser automation action cannot find the window, control or web element it was recorded against, and how to fix the selector so it keeps working.",
  keywords: ["failed to get UI element", "failed to get window Power Automate desktop", "Element with selector not found", "WebAutomation.ElementNotFoundError", "dynamic selector Power Automate desktop"],
  quickAnswer: "The action looked for the window or element it was built against and did not find it. Either the window or page was not open or not ready yet, or the element's selector no longer matches, often because part of it changes each time, like a window title with a date or a generated id. Make sure the screen is open and loaded first, then recapture the element and edit the selector to drop or wildcard the part that changes.",
  variants: [
    "Action failed (failed to get window)",
    "UIAutomation.ActionFailedError",
    "Element with selector 'xyz' not found",
    "WebAutomation.ElementNotFoundError"
  ],
  meaning: [
    p("Desktop flows find things on screen with **selectors**: a description of the window, then the control or web element inside it, made from attributes like name, id, class and position. When an action runs, Power Automate for desktop searches for something that matches the selector. These messages mean nothing matched."),
    p("\"Failed to get window\" means the parent window was not found. \"Failed to get UI element\" and \"Element with selector not found\" mean the window or page was there, but not the element inside it.")
  ],
  causes: [
    ol(
      "The window or web page was not open yet, or still loading, when the action ran.",
      "The selector is **dynamic**: an attribute such as a title, id or index is different each time the app or page opens.",
      "The application or website changed after the element was captured.",
      "A different screen resolution, scaling or window size changes how the element is exposed.",
      "The element is inside a frame, or in a pop-up that has not appeared yet."
    )
  ],
  fixes: [
    p("**Make sure the screen is there first.** Add a **Wait for window** or **Wait for web page content** action before the failing one, rather than a fixed wait, so the flow continues as soon as it is ready."),
    p("**Check whether the selector is dynamic.** Microsoft's support article gives a simple test:"),
    ol(
      "Capture the element.",
      "Close and reopen the window, or reload the page.",
      "Capture the same element again.",
      "Compare the two selectors, for example in Notepad. Any attribute that differs is the problem."
    ),
    p("**Edit the selector.** Open the selector builder, untick the attribute that changes, or change its operator from **Equal to** to **Contains** or **Starts with**, so it matches every time."),
    code(`Before:  :desktop > window[Name="Invoice 2026-11-21 - Contoso ERP"] > button[Name="Save"]
After:   :desktop > window[Name^="Invoice"] > button[Name="Save"]`, "Selector"),
    p("**Recapture.** If the app has changed, capture the element again as a new UI element and point the action at it. You can also add a second selector with **Selector with recapture**, and the action tries each in turn."),
    p("**Use another way in** when an element cannot be captured reliably: keyboard shortcuts, image recognition, or OCR.")
  ],
  prevention: [
    ul(
      "Build selectors on stable attributes, such as an automation id or a name, rather than position or index.",
      "Wait for windows and pages to load instead of using fixed delays.",
      "Run unattended machines at a fixed screen resolution and scaling.",
      "Retest the flow after the target application or website is updated."
    )
  ],
  faqs: [
    { question: "What does failed to get UI element mean in Power Automate desktop?", answer: "The action could not find the control it was built against. Either the window was not ready, or the element's selector no longer matches. Wait for the window, then fix or recapture the selector." },
    { question: "How do I fix a dynamic selector?", answer: "Capture the element twice, reopening the window in between, and compare the selectors. In the selector builder, remove the attribute that changes or switch its operator to Contains or Starts with." },
    { question: "Why does my desktop flow work when I watch it but fail unattended?", answer: "Unattended runs often use a different screen resolution or start before apps have finished loading. Set a fixed resolution on the machine, wait for windows explicitly and avoid selectors based on position." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [failedRunLink],
  relatedErrors: ["failed-to-assume-control-of-microsoft-edge-desktop-flow"],
  sources: [
    support("ui-automation/failed-get-ui-element", "Error occurs when a desktop flow action fails to get a UI element"),
    support("ui-automation/ui-automation-action-fails-errors", "UI automation action fails with \"Failed to get UI element\" or \"Failed to get window\""),
    automateDoc("desktop-flows/build-custom-selectors", "Build a custom selector")
  ]
};

const windowsIdentity: ErrorPage = {
  ...base,
  slug: "windowsidentityincorrect-credentials-invalid-desktop-flow",
  message: "WindowsIdentityIncorrect: The credentials provided with the request are invalid.",
  title: "Fix \"WindowsIdentityIncorrect\" invalid credentials in desktop flows",
  shortTitle: "WindowsIdentityIncorrect: credentials are invalid",
  description: "Why a desktop flow connection or run fails because its Windows credentials cannot sign in to the machine, how to read the specific error code, and the username formats that work.",
  keywords: ["WindowsIdentityIncorrect", "The credentials provided with the request are invalid", "desktop flow connection failed credentials", "There's an issue with your credentials Power Automate", "desktop flow username format"],
  quickAnswer: "The username and password in the desktop flow connection could not sign in to the target machine. Common reasons are a changed or expired password, the wrong username format for how the machine is joined, a Windows Hello PIN instead of a password, or an account that is disabled or not allowed to sign in there. Sign in to the machine yourself with exactly those credentials to see the real reason, then update the connection.",
  variants: [
    "Connection failed: [Machine …]. There's an issue with your credentials. Check your credentials or use different credentials to connect to the machine.",
    "The credentials provided with the request are invalid.",
    "-1073741715: Bad username or authentication information"
  ],
  meaning: [
    p("A desktop flow connection stores the Windows account that the flow signs in as on the machine. When you create the connection, and again on each run, Power Automate asks the machine to authenticate those credentials. This error means the machine refused them."),
    p("If the connection was created successfully and only runs fail now, something changed since: the password, the account, or the machine.")
  ],
  causes: [
    ol(
      "The account's password was changed or has expired.",
      "The username is in the wrong format for the machine. Microsoft gives `user@domain.com` for Microsoft Entra joined or hybrid machines, and `DOMAIN\\user` for machines joined only to a domain.",
      "A Windows Hello PIN was entered instead of the password. PINs are not supported.",
      "The account is disabled, lost its rights on the machine, or is restricted, for example by sign-in hours.",
      "The machine cannot reach its domain or Microsoft Entra ID, or is not properly joined.",
      "The machine requires smart card sign-in, which desktop flow connections do not support."
    )
  ],
  fixes: [
    p("**Read the specific code.** With Power Automate for desktop 2.24 or later, the error includes a more specific code. Microsoft's article lists these:"),
    table(
      ["Code", "Meaning", "What to do"],
      ["-1073741715", "Bad username or authentication information", "Check the password and the username format"],
      ["-1073741730", "The domain isn't available", "Use the username format for the machine's join type"],
      ["-1073445812", "The user's UPN isn't in the expected format", "Try both `user@domain.com` and `DOMAIN\\user`"],
      ["-1073741477", "Logon type has not been granted", "See [logon type has not been granted](/errors/logon-type-has-not-been-granted-desktop-flow)"],
      ["-1073741714", "User account restriction", "Check sign-in hours and account restrictions"],
      ["-1073741062", "Smart card logon is required", "Use a machine that does not require a smart card"]
    ),
    p("**Test the credentials directly.** Sign in to the machine, locally or with Remote Desktop, using exactly the username and password in the connection. You will see the same refusal Power Automate gets, with a clearer message."),
    p("**Update the connection.** In Power Automate, go to **Data**, **Connections**, select the desktop flow connection, choose **Edit** and enter the corrected credentials.")
  ],
  prevention: [
    ul(
      "Use a dedicated service account for unattended runs, with a password policy your team manages, so passwords do not expire unexpectedly.",
      "Record which username format each machine needs in your runbook.",
      "When a password changes, update every desktop flow connection that uses that account the same day."
    )
  ],
  faqs: [
    { question: "What does WindowsIdentityIncorrect mean?", answer: "The Windows credentials in the desktop flow connection were rejected by the target machine. The password may have changed, the username format may be wrong, or the account may not be allowed to sign in there." },
    { question: "Which username format should I use for a desktop flow connection?", answer: "Microsoft gives user@domain.com for machines joined to Microsoft Entra ID or hybrid joined, and DOMAIN\\user for machines joined only to an Active Directory domain. A local account is just the username." },
    { question: "Can I use a Windows Hello PIN in a desktop flow connection?", answer: "No. Enter the account's password. PINs are not supported." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [failedRunLink],
  relatedErrors: ["logon-type-has-not-been-granted-desktop-flow", "expireddesktopflowconnection-connection-no-longer-valid", "user-account-is-disabled-power-automate-connection"],
  sources: [
    support("invalid-credentials-errors-running-desktop-flows", "Invalid credentials error when running desktop flows"),
    runErrorsDoc,
    connectionsDoc
  ]
};

const logonType: ErrorPage = {
  ...base,
  slug: "logon-type-has-not-been-granted-desktop-flow",
  message: "A user has requested a type of logon (for example, interactive or network) that has not been granted. An administrator has control over who can logon interactively and through the network.",
  title: "Fix \"A user has requested a type of logon that has not been granted\" in desktop flows",
  shortTitle: "Logon type has not been granted",
  description: "Why a desktop flow run or connection fails with error -1073741477 because Windows policy does not let the account sign in to the machine, and which local security policies to check.",
  keywords: ["logon type has not been granted", "-1073741477 Power Automate", "desktop flow Allow log on locally", "Allow log on through Remote Desktop Services desktop flow", "desktop flow local security policy"],
  quickAnswer: "Windows on the target machine does not allow the connection's account to sign in the way Power Automate needs. A local or group policy either leaves the account out of the allow lists, or puts it on a deny list. On the machine, open Local Security Policy, User Rights Assignment, and make sure the account or its group is in Allow log on locally, Access this computer from the network and Allow log on through Remote Desktop Services, and is not in any of the matching Deny policies.",
  variants: [
    "-1073741477",
    "{ \"error\": { \"code\": \"-1073741477\", \"message\": \"A user has requested a type of logon (for example, interactive or network) that has not been granted. …\" } }"
  ],
  meaning: [
    p("To run a desktop flow, Power Automate signs in to the machine as the account in the connection. Windows checks its user rights first. This error means the credentials are fine, but the account is not allowed that kind of sign-in on that machine."),
    p("Microsoft notes that a Deny policy wins over an Allow policy, so an account can be on an allow list and still be refused.")
  ],
  causes: [
    ol(
      "The account, or a group it belongs to, is not in the **Allow log on locally**, **Access this computer from the network** or **Allow log on through Remote Desktop Services** policy.",
      "The account or one of its groups is in a **Deny log on locally**, **Deny access to this computer from the network** or **Deny log on through Remote Desktop Services** policy.",
      "A domain group policy changed these rights after the connection was created."
    )
  ],
  fixes: [
    p("Microsoft's steps, on the affected machine, preferably as an administrator:"),
    ol(
      "Open **Local Security Policy**.",
      "Go to **Security Settings**, **Local Policies**, **User Rights Assignment**.",
      "Open **Allow log on locally** and check that the account or its group is listed. Add it with **Add User or Group** if not.",
      "Do the same for **Access this computer from the network** and **Allow log on through Remote Desktop Services**.",
      "Open **Deny access to this computer from the network**, **Deny log on locally** and **Deny log on through Remote Desktop Services**, and check that the account and its groups are not listed."
    ),
    note("If the machine is managed by domain group policy, a local change may be overwritten. Ask the team that manages group policy to make the change there.")
  ],
  prevention: [
    ul(
      "Put desktop flow service accounts in one security group, and grant that group the three rights through group policy.",
      "Review deny policies before adding robot accounts to broad groups.",
      "Test a connection to each new machine before scheduling flows on it."
    )
  ],
  faqs: [
    { question: "What does error -1073741477 mean in Power Automate desktop?", answer: "The account in the desktop flow connection is not allowed to sign in to the machine in the way Power Automate needs, because of a Windows user rights policy." },
    { question: "Which policies does a desktop flow account need?", answer: "Microsoft lists Allow log on locally, Access this computer from the network and Allow log on through Remote Desktop Services, with the account not on the matching Deny policies." },
    { question: "I added the account but it still fails. Why?", answer: "A Deny policy takes precedence over an Allow policy. Check the three Deny policies for the account and every group it belongs to, and check whether domain group policy is overwriting your local change." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [failedRunLink],
  relatedErrors: ["windowsidentityincorrect-credentials-invalid-desktop-flow", "sessioncreationtimeout-desktop-flow"],
  sources: [
    support("logon-type-has-not-been-granted", "\"Logon type has not been granted\" error when running a desktop flow"),
    support("invalid-credentials-errors-running-desktop-flows", "Invalid credentials error when running desktop flows")
  ]
};

const sessionTimeout: ErrorPage = {
  ...base,
  slug: "sessioncreationtimeout-desktop-flow",
  message: "SessionCreationTimeout",
  title: "Fix \"SessionCreationTimeout\" in unattended desktop flow runs",
  shortTitle: "SessionCreationTimeout",
  description: "Why an unattended desktop flow fails because Windows took too long to open a session, the default three-minute limit, and how to raise it in the registry.",
  keywords: ["SessionCreationTimeout", "unattended desktop flow session timeout", "SessionCreationTimeoutSeconds", "desktop flow remote desktop slow", "unattended run fails Power Automate"],
  quickAnswer: "For an unattended run, Power Automate for desktop opens a new Windows session on the machine and waits up to three minutes for it. If signing in takes longer, for example because of a slow profile load, logon scripts or a busy virtual machine, the run fails with SessionCreationTimeout. Update Power Automate for desktop first. If it still happens, add a SessionCreationTimeoutSeconds value to the registry with a longer limit and restart the Power Automate service.",
  variants: [
    "The desktop flow run failed with error code SessionCreationTimeout."
  ],
  meaning: [
    p("An unattended desktop flow runs with nobody signed in. Power Automate for desktop creates a remote desktop session for the connection's account, waits for Windows to finish signing in, then starts the flow inside it. Microsoft's support article gives the default wait as three minutes."),
    p("This code means the session was not ready in time. The credentials were accepted. The sign-in was just too slow.")
  ],
  causes: [
    ol(
      "Logon scripts, group policy processing or a large roaming profile make sign-in slow.",
      "The machine is short of memory or CPU, often a virtual machine that is also running other work.",
      "Windows updates or start-up apps run at sign-in.",
      "An old version of Power Automate for desktop."
    )
  ],
  fixes: [
    p("**Update Power Automate for desktop** on the machine. Microsoft lists this as the first step."),
    p("**Raise the timeout.** These steps are supported on version 2.21 or later:"),
    ol(
      "Open the Registry Editor on the machine.",
      "Go to `HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Microsoft\\Power Automate Desktop\\Service`.",
      "Create a DWORD named `SessionCreationTimeoutSeconds` with the longest time, in seconds, you want to allow. Microsoft's example is 300, five minutes.",
      "Open **Services**, right-click **Power Automate service** and choose **Restart**."
    ),
    code(`reg add "HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Power Automate Desktop\\Service" /v SessionCreationTimeoutSeconds /t REG_DWORD /d 300 /f`, "Command prompt (as administrator)"),
    note("A longer timeout treats the symptom. If sign-in takes minutes, it is also worth finding out why with the team that manages the machine.")
  ],
  prevention: [
    ul(
      "Give robot accounts a local profile and as few logon scripts as possible.",
      "Size machines for the flows they run, and avoid scheduling many runs at the same moment.",
      "Keep Power Automate for desktop current across the machine group."
    )
  ],
  faqs: [
    { question: "What is SessionCreationTimeout in Power Automate?", answer: "An unattended desktop flow run failed because Windows took longer than the allowed time, three minutes by default, to open a session for the connection's account." },
    { question: "How do I increase the session creation timeout?", answer: "On version 2.21 or later, add a DWORD named SessionCreationTimeoutSeconds under HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Power Automate Desktop\\Service, set it to the number of seconds, and restart the Power Automate service." },
    { question: "Does SessionCreationTimeout mean the password is wrong?", answer: "No. A wrong password gives an invalid credentials error. This code means the sign-in was accepted but did not finish in time." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [failedRunLink],
  relatedErrors: ["logon-type-has-not-been-granted-desktop-flow", "windowsidentityincorrect-credentials-invalid-desktop-flow"],
  sources: [
    support("sessioncreationtimeout-error-code", "Desktop flow fails with the SessionCreationTimeout error code"),
    runErrorsDoc
  ]
};

const expiredConnection: ErrorPage = {
  ...base,
  slug: "expireddesktopflowconnection-connection-no-longer-valid",
  message: "ExpiredDesktopFlowConnection: The connection is no longer valid and needs to be updated.",
  title: "Fix \"ExpiredDesktopFlowConnection\" in Power Automate",
  shortTitle: "ExpiredDesktopFlowConnection",
  description: "Why a desktop flow connection expires after the machine or machine group certificate is renewed, why it cannot recover by itself, and how to update it.",
  keywords: ["ExpiredDesktopFlowConnection", "The connection is no longer valid and needs to be updated", "desktop flow connection expired", "machine group certificate renewal", "update desktop flow connection"],
  quickAnswer: "A desktop flow connection is encrypted with a certificate that belongs to its machine or machine group. When that certificate is renewed and the connection is not used during the renewal period, the connection can no longer be decrypted and expires. It cannot recover by itself. Update Power Automate for desktop on the machines, then edit the connection under Data, Connections and enter its details again.",
  variants: [
    "The connection is no longer valid and needs to be updated. […]",
    "{ \"error\": { \"code\": \"ExpiredDesktopFlowConnection\", \"message\": \"The connection is no longer valid and needs to be updated. […]\" } }"
  ],
  meaning: [
    p("The contents of a desktop flow connection, including the Windows credentials, are encrypted with the certificate of the machine or machine group it targets. Certificates are renewed from time to time. Microsoft's support article explains that if a connection is not used while that happens, it is left encrypted with the old certificate, which can no longer decrypt it."),
    p("The account and password may be perfectly fine. The stored copy simply cannot be read any more.")
  ],
  causes: [
    ol(
      "The machine or machine group certificate was renewed while the connection was not in use, such as a flow that runs monthly.",
      "Machines run an old version of Power Automate for desktop, which Microsoft says can hamper the renewal process."
    )
  ],
  fixes: [
    ol(
      "Update Power Automate for desktop on every machine in the group to a current version.",
      "Sign in to Power Automate, open **Data**, then **Connections**.",
      "Select the expired connection and choose **Edit**.",
      "Enter the connection details again and save.",
      "Run the flow to check it."
    )
  ],
  prevention: [
    ul(
      "Keep Power Automate for desktop current on every machine.",
      "For flows that run rarely, schedule a short test run often enough that the connection is used during certificate renewals.",
      "Keep a list of desktop flow connections and their owners, so an expired one can be fixed quickly."
    )
  ],
  faqs: [
    { question: "Why did my desktop flow connection expire?", answer: "The machine or machine group certificate used to encrypt the connection was renewed while the connection was not in use. The connection can no longer be decrypted and must be edited and saved again." },
    { question: "Will an expired desktop flow connection fix itself?", answer: "No. Microsoft says a connection in this state cannot be recovered automatically and must be updated by hand." },
    { question: "Do I need to change the password?", answer: "Not for this error. Re-enter the same details in the connection. Change the password only if it has also changed on the machine." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [failedRunLink],
  relatedErrors: ["windowsidentityincorrect-credentials-invalid-desktop-flow", "refresh-token-expired-due-to-inactivity-power-automate"],
  sources: [
    support("troubleshoot-expired-desktop-flow-connection", "\"ExpiredDesktopFlowConnection\" error when using or testing a desktop flow connection"),
    automateDoc("desktop-flows/machine-group-certificates-admins", "Machine group certificate renewal for admins"),
    connectionsDoc
  ]
};

export const desktopFlowErrors: ErrorPage[] = [assumeControl, uiElement, windowsIdentity, logonType, sessionTimeout, expiredConnection];
