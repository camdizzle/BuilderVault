import { automateDoc, canvasDoc, code, learnDoc, note, ol, p, table, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Power Apps" as const, published: "2026-11-21", updated: "2026-11-21" };

const flowIntegrationDoc = learnDoc("troubleshoot/power-platform/power-apps/connections/best-practices-when-updating-a-flow", "Troubleshoot Power Apps flow integration errors");
const workingWithFlowsDoc = canvasDoc("working-with-flows", "Use the Power Automate pane in Power Apps");
const limitsDoc = automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows");
const solutionLayersDoc = learnDoc("power-apps/maker/data-platform/solution-layers", "Solution layers");
const flowAccessDoc = automateDoc("guidance/coding-guidelines/understand-access-to-flows", "Understand flow ownership and access");
const turnOnFlowDoc = automateDoc("disable-flow", "Turn a flow on or off");

const flowsGuide = { href: "/guides/hand-over-power-automate-flows-when-someone-leaves", label: "Hand over flows when someone leaves" };
const troubleshootGuide = { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" };
const callFlowGuide = { href: "/guides/call-power-automate-flow-from-power-apps", label: "Call a flow from Power Apps" };

/** The fix Microsoft gives for most of these errors: make the app read the flow's current definition again. */
const readdFlowSteps = ol(
  "Open the app in Power Apps Studio.",
  "Select **Power Automate** on the app authoring menu to open the Power Automate pane.",
  "Select **...** to the right of the flow, then **Remove from app**. The flow itself is not deleted.",
  "Select **Add a flow** and pick the same flow from **Add a flow from this environment**.",
  "Check the formulas that call the flow. If the flow's inputs changed, the `Run` call needs the new arguments.",
  "Save and publish the app."
);

const refreshNote = note(
  "The pane also has a **Refresh** option on the same **...** menu, which pulls the flow's latest changes. Try it first. If the error stays, remove and add the flow as above, which is the fix Microsoft documents for these errors."
);

const liveAppNote = note(
  "If the app is already published and in use, Microsoft recommends changing a copy of the flow instead. Use **Save As** on the flow, change the copy, point the app at the copy, and turn off the original once everyone has the new app version."
);

const invokerConnection: ErrorPage = {
  ...base,
  slug: "invokerconnectionoverridefailed-power-apps-flow",
  message: "Failed to parse invoker connections from trigger 'manual' outputs. Exception: Could not find any valid connection for connection reference name 'shared_sharepointonline' in APIM tokens header.",
  title: "Fix \"InvokerConnectionOverrideFailed\" when Power Apps runs a flow",
  shortTitle: "InvokerConnectionOverrideFailed",
  description: "Why a flow called from Power Apps fails with InvokerConnectionOverrideFailed after the flow's connections changed, and how to refresh the app's copy of the flow.",
  keywords: ["InvokerConnectionOverrideFailed", "Failed to parse invoker connections from trigger", "Could not find any valid connection for connection reference name", "Power Apps flow fails after update", "Install flow failed"],
  quickAnswer: "The flow now uses a different connection, but the app still holds the flow's old definition, so it sends the wrong connections when it runs the flow. Open the app in Studio, remove the flow from the app, add it again, then save and publish. If the app and flow are in a solution, do this in the development environment and deploy the solution again.",
  variants: [
    "InvokerConnectionOverrideFailed",
    "Could not find any valid connection for connection reference name",
    "Install flow failed."
  ],
  meaning: [
    p("When you add a flow to an app, Power Apps stores three things about it in the app: the inputs it takes, the connections it needs, and the outputs it returns. Each time the app runs the flow it sends connections that match what it stored."),
    p("This error means the flow asked for a connection the app did not send. The flow changed after it was added to the app, and the app was not told.")
  ],
  causes: [
    ol(
      "An action in the flow was switched to a different connection, or a new connection was created for it.",
      "An action from a connector the flow did not use before was added, such as a first SharePoint action in a flow that only used Outlook.",
      "In a solution, the flow in the target environment has changes the source environment does not have, often from an unmanaged layer."
    )
  ],
  fixes: [
    p("**Refresh the app's copy of the flow.** This is Microsoft's documented fix."),
    readdFlowSteps,
    refreshNote,
    liveAppNote,
    p("**For a solution,** make the change in the development environment, export the solution and import it again into test and production. Changing the app directly in production adds an unmanaged layer, which causes the next error on the next deployment.")
  ],
  prevention: [
    ul(
      "After you change a flow's connections, inputs or outputs, remove and add it again in every app that calls it.",
      "Keep a note in the flow's description of which apps call it.",
      "Never edit flows directly in test or production when they come from a solution."
    )
  ],
  faqs: [
    { question: "What does InvokerConnectionOverrideFailed mean?", answer: "The app ran a flow with the connections it stored when the flow was added, but the flow now needs different ones. The app's copy of the flow is out of date." },
    { question: "How do I fix a flow that stopped working from Power Apps after I edited it?", answer: "In Power Apps Studio, open the Power Automate pane, remove the flow from the app, add it again, then save and publish the app." },
    { question: "Why does the error mention Install flow failed?", answer: "Microsoft notes that the same problem can appear as Install flow failed when the flow is installed through Dataverse, for example while a solution is imported. The fix is the same." }
  ],
  relatedTools: [],
  relatedPatterns: ["respond-to-power-app-return-values-from-flow", "connection-references-for-solution-flows"],
  relatedLinks: [callFlowGuide, troubleshootGuide, flowsGuide],
  relatedErrors: ["missingconnectionreference-connection-reference-was-not-given-by-invoker", "connectionauthorizationfailed-power-apps-flow", "flow-connection-property-doesnt-exist-available-properties"],
  sources: [flowIntegrationDoc, workingWithFlowsDoc]
};

const connectionAuthorization: ErrorPage = {
  ...base,
  slug: "connectionauthorizationfailed-power-apps-flow",
  message: "The caller with object id '00000000-0000-0000-0000-000000000000' does not have the minimum required permission to perform the requested operation on connection 'shared-office365-00000000' under API 'shared_office365'.",
  title: "Fix \"ConnectionAuthorizationFailed\" when adding or running a flow from Power Apps",
  shortTitle: "ConnectionAuthorizationFailed",
  description: "Why Power Apps can't use a flow whose actions run on connections the maker can't use, and how to give the maker access to each connection.",
  keywords: ["ConnectionAuthorizationFailed", "does not have the minimum required permission to perform the requested operation on connection", "Power Apps add flow permission error", "flow connection permission Power Apps"],
  quickAnswer: "You can edit the flow, but you do not have permission to one of the connections its actions use. Power Apps needs the person who adds the flow to the app to be able to use every connection in it. Have the connection's owner share it with you, or switch those actions to your own connection, then add the flow to the app again.",
  variants: ["ConnectionAuthorizationFailed", "does not have the minimum required permission to perform the requested operation on connection"],
  meaning: [
    p("A flow is made of actions, and each action runs on a connection that belongs to someone. Being a co-owner of the flow lets you edit it. It does not give you the right to use another person's connections."),
    p("Microsoft describes this as a limitation of how Power Apps and Power Automate work together: the person adding the flow to an app must be authorized on every connection the flow uses.")
  ],
  causes: [
    ol(
      "The flow was built by a colleague, and its actions use their connections. You were added as a co-owner, which doesn't share the connections.",
      "The flow uses a connection that was shared with someone else, but not with you.",
      "The flow is in a solution, and the connection references point at connections owned by another account."
    )
  ],
  fixes: [
    p("**Find the connections the flow uses.** Open the flow in Power Automate and look at each action: the connection and its account are shown under the action's **...** menu in **My connections**."),
    p("**Then do one of these for each connection you can't use:**"),
    table(
      ["Option", "When to choose it"],
      ["Ask the owner to share the connection with you", "The connection is a service account that the team shares, and the connector allows sharing."],
      ["Switch the action to your own connection", "The flow should run as the person who maintains the app. Edit the action and pick or create your connection."],
      ["Use connection references in a solution", "The flow is deployed between environments. Set the references to connections you can use in each environment."]
    ),
    p("Then remove the flow from the app and add it again so the app stores the new connections. Save and publish.")
  ],
  prevention: [
    ul(
      "Run shared business flows on a service account, and keep its connections in a solution with connection references.",
      "When someone hands a flow over, move its connections too. Being made co-owner is not enough on its own."
    )
  ],
  faqs: [
    { question: "I'm a co-owner of the flow. Why can't I add it to my app?", answer: "Co-ownership lets you edit the flow, but each action runs on a connection that belongs to one account. You also need permission to use each of those connections." },
    { question: "Does the app user need access to the connections too?", answer: "It depends on how the flow is set up. This error is about the maker adding the flow. Whether each user signs in with their own connection or uses an embedded one is set in the flow's run-only user settings." }
  ],
  relatedTools: [],
  relatedPatterns: ["connection-references-for-solution-flows", "service-principal-application-user-deployments"],
  relatedLinks: [callFlowGuide, flowsGuide, troubleshootGuide],
  relatedErrors: ["invokerconnectionoverridefailed-power-apps-flow", "permission-denied-due-to-missing-connection-acl", "missingconnectionreference-connection-reference-was-not-given-by-invoker"],
  sources: [flowIntegrationDoc, flowAccessDoc]
};

const triggerNotEnabled: ErrorPage = {
  ...base,
  slug: "workflowtriggerisnotenabled-power-apps-flow",
  message: "Could not execute workflow '00000000-0000-0000-0000-000000000000' trigger 'manual' with state 'Disabled': trigger is not enabled.",
  title: "Fix \"WorkflowTriggerIsNotEnabled\" when Power Apps runs a flow",
  shortTitle: "WorkflowTriggerIsNotEnabled",
  description: "Why Power Apps can't run a flow that is turned off, how flows get turned off without anyone noticing, and how to turn it back on.",
  keywords: ["WorkflowTriggerIsNotEnabled", "trigger is not enabled", "Could not execute workflow trigger manual with state Disabled", "Power Apps flow turned off", "flow suspended Power Apps"],
  quickAnswer: "The flow the app calls is turned off. Open the flow in Power Automate, select Turn on, and run it once from the app to check. Then find out why it was off: flows are turned off automatically after 14 days of continuous failures or throttling, and some are turned off after 90 days without a run.",
  variants: ["WorkflowTriggerIsNotEnabled", "trigger is not enabled", "with state 'Disabled'"],
  meaning: [
    p("A flow that is off still exists, and Power Apps can still see it, but its trigger does not accept new runs. When the app calls `Run`, the trigger refuses and the app gets this error.")
  ],
  causes: [
    ol(
      "Someone turned the flow off by hand, often while fixing it.",
      "Power Automate turned it off because its trigger or actions failed continuously for 14 days.",
      "It was consistently throttled for 14 days.",
      "It wasn't triggered for 90 days and its owner has no premium licence. Owners are emailed 30 days before.",
      "It was imported in a solution and not turned on afterwards."
    ),
    p("The 14 and 90 day rules come from Microsoft's [flow limits](/guides/power-automate-limits).")
  ],
  fixes: [
    ol(
      "Open the flow in Power Automate and select **Turn on**.",
      "If it doesn't stay on, open the run history and fix the failure that keeps it off.",
      "Run the flow from the app to confirm it works."
    ),
    p("If the flow comes from a solution, turn it on in the target environment after each import, or use a deployment that turns flows on for you.")
  ],
  prevention: [
    ul(
      "Read the emails Power Automate sends to flow owners about failing or expiring flows.",
      "Add a co-owner who can turn the flow on when the owner is away.",
      "Show a friendly message in the app when the flow call fails, using `IfError` around the `Run` call."
    ),
    code(`IfError(
    MyFlow.Run(txtTitle.Text),
    Notify("The approval service is not available. Please try again later.", NotificationType.Error)
)`, "Power Fx")
  ],
  faqs: [
    { question: "Why was my flow turned off when nobody touched it?", answer: "Power Automate turns off flows that fail or are throttled continuously for 14 days. Flows that aren't triggered for 90 days can also be turned off unless the owner has a premium licence or the flow has its own capacity." },
    { question: "Do I need to add the flow to the app again after turning it on?", answer: "No. Turning the flow on is enough, as long as its inputs, outputs and connections didn't change." }
  ],
  relatedTools: [],
  relatedPatterns: ["power-automate-error-handling-kit"],
  relatedLinks: [callFlowGuide, { href: "/guides/power-automate-limits", label: "Power Automate limits" }, troubleshootGuide],
  relatedErrors: ["flows-not-turned-on-after-solution-import-connection-references", "problem-with-the-flows-trigger", "invokerconnectionoverridefailed-power-apps-flow"],
  sources: [flowIntegrationDoc, turnOnFlowDoc, limitsDoc]
};

const responseTimeout: ErrorPage = {
  ...base,
  slug: "responsetimeout-power-apps-flow-120-seconds",
  message: "The server did not receive a timely response from the upstream server. Request tracking id '08585000000000000000000000000CU00'.",
  title: "Fix \"ResponseTimeout\" when Power Apps waits for a flow",
  shortTitle: "ResponseTimeout: no timely response from the upstream server",
  description: "Why a flow called from Power Apps fails with ResponseTimeout or 504 BadGateway after two minutes, and how to respond to the app sooner.",
  keywords: ["ResponseTimeout", "The server did not receive a timely response from the upstream server", "Power Apps flow timeout", "Respond to a PowerApp or flow timeout", "flow 120 seconds Power Apps"],
  quickAnswer: "Power Apps waits at most 120 seconds for a flow to answer. If the flow hasn't reached its Respond to a PowerApp or flow action by then, the call fails with ResponseTimeout inside a 504 BadGateway. Move the Respond action as early as you can and let the slow work continue after it, or make the slow steps faster.",
  variants: ["ResponseTimeout", "BadGateway", "504"],
  meaning: [
    p("When an app calls `MyFlow.Run(...)` and the flow returns values, the app waits for the answer. Microsoft limits that wait to 120 seconds. After that the gateway in between gives up and reports a 504 with the inner code `ResponseTimeout`."),
    p("The flow itself may still finish. Only the app stopped waiting for it.")
  ],
  causes: [
    ol(
      "The Respond action is at the end of a flow that loops over many items or waits on a slow service.",
      "An **Apply to each** runs one item at a time where it could run in parallel.",
      "A connector is throttling the flow, so each action waits before it runs.",
      "The flow waits for something that takes minutes, such as an approval or a delay."
    )
  ],
  fixes: [
    p("**Answer the app first.** Actions after **Respond to a PowerApp or flow** keep running after the app has its answer. Put the Respond action right after the steps that produce what the app needs."),
    table(
      ["Flow shape", "What to change"],
      ["Validate, respond, then do the slow work", "Nothing. This shape stays inside the limit."],
      ["Slow work, then respond", "Move Respond up. Return an ID or a status, and let the app check for the result later."],
      ["Loop over many items", "Turn on concurrency in the loop's settings, or filter the items before the loop."],
      ["Wait for an approval or a person", "Don't make the app wait. Respond straight away and update the record when the approval is done."]
    ),
    p("**Find the slow step.** Open the failed run and look at the duration of each action. The longest one is where to start.")
  ],
  prevention: [
    ul(
      "Design flows called from apps to answer within a few seconds.",
      "Keep long work out of the app's path: return quickly and write the result to a list or table the app reads.",
      "Test with the largest amount of data the app will send, not a single item."
    )
  ],
  faqs: [
    { question: "How long can a flow run when Power Apps calls it?", answer: "The flow can run much longer, but the app waits at most 120 seconds for the Respond to a PowerApp or flow action. Anything after that action can keep running." },
    { question: "Can I raise the 120 second limit?", answer: "No. It's a fixed limit on synchronous requests. Respond earlier instead." }
  ],
  relatedTools: [],
  relatedPatterns: ["respond-to-power-app-return-values-from-flow", "do-until-polling-loop-timeout-power-automate"],
  relatedLinks: [callFlowGuide, { href: "/guides/power-automate-limits", label: "Power Automate limits" }, troubleshootGuide],
  relatedErrors: ["badgateway-502-power-automate", "429-rate-limit-exceeded-power-automate", "workflowtriggerisnotenabled-power-apps-flow"],
  sources: [flowIntegrationDoc, limitsDoc]
};

const missingConnectionReference: ErrorPage = {
  ...base,
  slug: "missingconnectionreference-connection-reference-was-not-given-by-invoker",
  message: "Connection reference 'shared_commondataserviceforapps' was not given by invoker.",
  title: "Fix \"Connection reference was not given by invoker\" in Power Apps",
  shortTitle: "Connection reference was not given by invoker",
  description: "Why a flow called from Power Apps fails with MissingConnectionReference or NotAllowedConnectionReference, often only after a solution is deployed, and how to fix it.",
  keywords: ["MissingConnectionReference", "NotAllowedConnectionReference", "was not given by invoker", "Connection not configured for this service", "Power Apps flow fails in production"],
  quickAnswer: "The app and the flow disagree about which connections the flow needs. It often works in development and fails after deployment, because the flow in the target environment changed. In the development environment, remove the flow from the app and add it again, save and publish. Then remove any unmanaged layers from the app and flow in the target environment, and deploy the solution again.",
  variants: ["MissingConnectionReference", "NotAllowedConnectionReference", "Connection not configured for this service."],
  meaning: [
    p("The app passes the flow the connections it stored when the flow was added. The error says the flow expected a connection reference the app did not pass. The app's copy of the flow and the real flow are out of step.")
  ],
  causes: [
    ol(
      "The flow gained or changed a connection after it was added to the app.",
      "Someone edited the flow or the app directly in the target environment. The edit created an unmanaged layer that sits on top of the solution and keeps different connection references.",
      "The app expects a specific connection reference, such as one for SQL Server, that the deployed flow no longer has."
    )
  ],
  fixes: [
    p("Microsoft's fix has three steps, and the order matters."),
    ol(
      "In the **source** environment, open the app, remove the flow from it and add it again. Save and publish.",
      "In the **target** environment, open **Solution layers** for the app and for the flow, and remove any unmanaged layer.",
      "Export the solution from the source environment and import it into the target environment."
    ),
    p("If the error shows up only in production, check step 2 first. An unmanaged layer there means someone fixed production by hand, and that fix now blocks every deployment.")
  ],
  prevention: [
    ul(
      "Never edit managed apps or flows in test or production.",
      "Re-add a flow to the app in development every time its inputs, outputs or connections change, before exporting.",
      "Check for unmanaged layers as part of each release."
    )
  ],
  faqs: [
    { question: "Why does the flow work in development but not after deployment?", answer: "The app and flow in the target environment are out of step, usually because one of them has an unmanaged layer from a change made directly in that environment." },
    { question: "What is the difference between MissingConnectionReference and NotAllowedConnectionReference?", answer: "Both show the same message and have the same fix. Microsoft lists NotAllowedConnectionReference for the case where the app expects a particular connection reference that the flow's current definition doesn't match." }
  ],
  relatedTools: ["solution-layering-checklist-generator"],
  relatedPatterns: ["connection-references-for-solution-flows"],
  relatedLinks: [callFlowGuide, troubleshootGuide],
  relatedErrors: ["invokerconnectionoverridefailed-power-apps-flow", "flows-not-turned-on-after-solution-import-connection-references", "failed-to-install-the-flow-0x80040265"],
  sources: [flowIntegrationDoc, solutionLayersDoc, workingWithFlowsDoc]
};

const failedToInstall: ErrorPage = {
  ...base,
  slug: "failed-to-install-the-flow-0x80040265",
  message: "Failed to install the flow.",
  title: "Fix \"Failed to install the flow\" (0x80040265 or 0x80048d0b)",
  shortTitle: "Failed to install the flow",
  description: "What Failed to install the flow with code 0x80040265 or 0x80048d0b means for a flow used by Power Apps, and the checks that fix it.",
  keywords: ["Failed to install the flow", "0x80040265 flow", "0x80048d0b", "Power Apps flow install error", "flow install failed solution"],
  quickAnswer: "The flow couldn't be set up for the app. Microsoft gives no single cause for this code and points to three others with the same roots: the flow is turned off, you can't use one of its connections, or the app holds an old copy of the flow. Check them in that order: turn the flow on, make sure you can use every connection in it, then remove the flow from the app and add it again.",
  variants: ["0x80040265", "0x80048d0b", "Install flow failed."],
  meaning: [
    p("Installing a flow is the step where Power Apps or Dataverse links a flow to the app and its connections. The two codes are general Dataverse codes, so the message tells you where it failed but not why.")
  ],
  causes: [
    ol(
      "The flow is turned off. See [WorkflowTriggerIsNotEnabled](/errors/workflowtriggerisnotenabled-power-apps-flow).",
      "You aren't allowed to use one of the flow's connections. See [ConnectionAuthorizationFailed](/errors/connectionauthorizationfailed-power-apps-flow).",
      "The app's copy of the flow is out of date. See [InvokerConnectionOverrideFailed](/errors/invokerconnectionoverridefailed-power-apps-flow)."
    )
  ],
  fixes: [
    ol(
      "Open the flow in Power Automate and check it is on.",
      "Check that each connection the flow's actions use belongs to you or is shared with you.",
      "In Power Apps Studio, remove the flow from the app and add it again. Save and publish.",
      "If the app and flow are in a solution, make these changes in development and deploy again."
    )
  ],
  prevention: [
    ul("Keep the app and its flows in the same solution, and deploy them together.", "Use connection references owned by a service account so installs don't depend on one person.")
  ],
  faqs: [
    { question: "What does 0x80040265 mean?", answer: "It is a general Dataverse code, named IsvAborted, which means custom logic stopped the operation. When it appears with Failed to install the flow, Microsoft suggests checking whether the flow is on, whether you can use its connections, and whether the app has an old copy of the flow." }
  ],
  relatedTools: ["solution-layering-checklist-generator"],
  relatedPatterns: ["connection-references-for-solution-flows"],
  relatedLinks: [callFlowGuide, troubleshootGuide],
  relatedErrors: ["workflowtriggerisnotenabled-power-apps-flow", "connectionauthorizationfailed-power-apps-flow", "invokerconnectionoverridefailed-power-apps-flow", "isv-code-aborted-the-operation-dataverse"],
  sources: [flowIntegrationDoc, learnDoc("power-apps/developer/data-platform/reference/web-service-error-codes", "Dataverse web service error codes")]
};

export const appFlowErrors: ErrorPage[] = [invokerConnection, connectionAuthorization, triggerNotEnabled, responseTimeout, missingConnectionReference, failedToInstall];
