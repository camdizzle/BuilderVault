import { automateDoc, code, learnDoc, note, ol, p, table, tool, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Power Automate" as const, published: "2026-11-20", updated: "2026-11-20" };

const limitsDoc = automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows");
const troubleshootDoc = automateDoc("fix-flow-failures", "Troubleshoot a cloud flow");
const sharePointConnectorDoc = learnDoc("connectors/sharepointonline", "SharePoint connector reference");
const errorHandlingDoc = automateDoc("guidance/coding-guidelines/error-handling", "Employ robust error handling");

const listViewThreshold: ErrorPage = {
  ...base,
  slug: "exceeds-list-view-threshold-power-automate",
  message: "The attempted operation is prohibited because it exceeds the list view threshold.",
  title: "Fix \"exceeds the list view threshold\" in a Power Automate flow",
  shortTitle: "Exceeds the list view threshold",
  description: "Why Get items fails on a SharePoint list with more than 5,000 items, and how to fix it with indexed columns, filter order and smaller queries.",
  keywords: ["exceeds the list view threshold", "Get items 5000 items", "list view threshold Power Automate", "SharePoint indexed column", "large list flow"],
  quickAnswer: "The list has more than 5,000 items and the flow filtered or sorted on a column that has no index. Add an index to that column in List settings under Indexed columns, and write the Filter Query so the first condition uses an indexed column and matches fewer than 5,000 items. Raising Top Count or turning on pagination does not fix this error.",
  variants: [
    "The attempted operation is prohibited because it exceeds the list view threshold enforced by the administrator.",
    "The query cannot be completed because the number of lookup columns it contains exceeds the lookup column threshold."
  ],
  meaning: [
    p("SharePoint will not run a query that has to examine more than 5,000 items at once. The limit is on how many items SharePoint must look through to answer, not on how many it returns. A filter that returns three items still fails if SharePoint has to scan the whole list to find them."),
    p("An index lets SharePoint jump straight to the matching items without scanning. That is why the same filter works on an indexed column and fails on one without an index.")
  ],
  causes: [
    ol(
      "The Filter Query uses a column that is not indexed, on a list with more than 5,000 items.",
      "**Order By** uses a column that is not indexed.",
      "The first condition in the filter is indexed but still matches more than 5,000 items.",
      "The filter joins conditions with `or`, which can stop SharePoint from using the index.",
      "The action uses **Limit Columns by View** with a view that itself breaks the threshold."
    ),
    p("The second variant above is a different limit. It appears when a query touches more than twelve lookup, person or managed metadata columns. The fix for that one is to set **Limit Columns by View** to a view with fewer of those columns.")
  ],
  fixes: [
    p("**Index the columns you filter and sort on.**"),
    ol(
      "Open the list, select the gear icon, then **List settings**.",
      "Under **Columns**, select **Indexed columns**.",
      "Select **Create a new index** and choose the column."
    ),
    p("SharePoint may refuse to create an index by hand on a very large list. In that case, filter on a column that is already indexed, such as ID, Created or Modified, or reduce the list first."),
    p("**Put the most selective indexed condition first.** SharePoint applies the first condition using its index, and that step must bring the count under 5,000."),
    code(`// Status eq 'Open' matches 12,000 items, so this can still fail
Status eq 'Open' and Created ge '2026-11-01'

// Created in the last month matches 800 items, so this works
Created ge '2026-11-01' and Status eq 'Open'`, "Filter Query"),
    p("**Query in slices.** When no single condition is selective enough, read the list in ranges of the ID column, which is always indexed."),
    code(`ID gt 0 and ID le 5000
ID gt 5000 and ID le 10000`, "Filter Query"),
    p("The [5,000 items pattern](/patterns/get-more-than-5000-items-power-automate) shows how to loop through ranges and how pagination fits in."),
    tool("odata-filter-query-builder", "Build the filter with the indexed condition first. The builder keeps the order you choose.")
  ],
  prevention: [
    ul(
      "Add indexes when a list is designed, on every column a flow or view will filter on. It is much easier before the list grows.",
      "Archive old items to a second list on a schedule so the working list stays small.",
      "Avoid `or` across different columns in a Filter Query on a large list. Run two queries and combine the results with `union`."
    ),
    p("The [list design standards](/standards/sharepoint-list-design-standards) cover indexes and list size.")
  ],
  faqs: [
    { question: "What is the SharePoint list view threshold?", answer: "It is a limit of 5,000 items on how many items a single query may examine. A list can hold far more items than that. Queries just need an index so they do not have to scan them all." },
    { question: "Does turning on pagination fix the list view threshold error?", answer: "No. Pagination controls how many items are returned in total. The threshold error is about how many items SharePoint has to examine to apply the filter or sort, which needs an indexed column." },
    { question: "Which SharePoint columns can be indexed?", answer: "Most single-value columns can, including text, number, date, choice, person and lookup columns. Multiple lines of text, multi-value choice and calculated columns cannot." }
  ],
  relatedTools: ["odata-filter-query-builder"],
  relatedPatterns: ["get-more-than-5000-items-power-automate", "use-odata-filters-sharepoint-text-fields"],
  relatedLinks: [
    { href: "/guides/sharepoint-get-items-filter-query", label: "Get items Filter Query by column type" },
    { href: "/standards/sharepoint-list-design-standards", label: "SharePoint List Design Standards" }
  ],
  relatedErrors: ["the-query-is-not-valid-get-items", "column-does-not-exist-deleted-by-another-user", "429-rate-limit-exceeded-power-automate"],
  sources: [
    learnDoc("sharepoint/dev/sp-add-ins/use-odata-query-operations-in-sharepoint-rest-requests", "Use OData query operations in SharePoint REST requests"),
    sharePointConnectorDoc,
    limitsDoc
  ]
};

const rateLimit: ErrorPage = {
  ...base,
  slug: "429-rate-limit-exceeded-power-automate",
  message: "429 (Too Many Requests). Rate limit is exceeded. Try again in 27 seconds.",
  title: "Fix \"429 Rate limit is exceeded. Try again in N seconds\" in Power Automate",
  shortTitle: "429 Rate limit is exceeded",
  description: "What a 429 throttling error means in a flow, where the limit comes from, and how to stay under it with fewer calls, lower concurrency and delays.",
  keywords: ["Rate limit is exceeded. Try again in", "429 Too Many Requests Power Automate", "Power Automate throttling", "TooManyRequests flow", "connector throttling limit"],
  quickAnswer: "The flow called a connector more often than the connector allows in a short period. Power Automate retries a 429 by itself, so an occasional one only slows the flow down. If runs fail or crawl, make fewer calls: filter earlier, replace loops with Filter array and Select, lower the concurrency on Apply to each, and add a short Delay inside large loops.",
  variants: [
    "TooManyRequests. Rate limit is exceeded. Try again in 60 seconds.",
    "Status code 429. Too many requests."
  ],
  meaning: [
    p("A 429 is a service saying slow down. Each connector limits how many calls one connection may make in a period of time, and the limits are published in the Throttling section of each connector's reference page."),
    p("Power Automate also limits how many actions a flow may run, based on the licence of its owner. When a flow goes over that allowance its actions are slowed down, which looks like a flow that takes hours without failing.")
  ],
  causes: [
    ol(
      "An Apply to each with many items and several connector actions inside it.",
      "Concurrency turned up on a loop, so many calls are sent at the same moment.",
      "Many runs of the same flow starting together, for example after a bulk import into a list.",
      "Several flows sharing one connection, all busy at once.",
      "A loop that calls the service once per item where one filtered call would do."
    )
  ],
  fixes: [
    p("**Make fewer calls.** This is the fix that lasts."),
    ul(
      "Filter at the source so the loop has fewer items. See [where to filter in a flow](/guides/filter-query-vs-filter-array-vs-condition).",
      "Replace a loop that builds a list with a **Select** action, and a loop that picks items with **Filter array**. Neither calls a connector.",
      "Get related data once before the loop instead of once per item.",
      "For hundreds of SharePoint updates, send them in one request. See the [SharePoint batch pattern](/patterns/sharepoint-batch-create-update-items-power-automate)."
    ),
    p("**Spread the calls out.**"),
    ul(
      "Open the Apply to each settings and lower **Degree of parallelism**, or turn concurrency off.",
      "Add a **Delay** of a second or two inside a large loop.",
      "In the trigger settings, turn on **Concurrency control** so a burst of triggers runs a few at a time instead of all together."
    ),
    p("**Let retries work.** Connector actions retry automatically after a 429, waiting longer each time. A run only fails when the retries run out. If you changed an action's retry policy to None, set it back to Default."),
    note("Do not copy limits from a blog post, including this one. They change. Check the Throttling section of the connector's reference page and Microsoft's limits page for current numbers.")
  ],
  prevention: [
    ul(
      "Estimate calls before building: items multiplied by connector actions per item. If the number is in the thousands per run, redesign before it is in production.",
      "Give heavy flows their own connection so they do not use up a limit that other flows share.",
      "Review the flow's analytics for throttled actions after go-live."
    ),
    p("The [request limits pattern](/patterns/power-platform-request-limits-monitor) explains the licence-based allowance and how to monitor it.")
  ],
  faqs: [
    { question: "Does Power Automate retry after a 429 error?", answer: "Yes. With the default retry policy, an action that receives a 429 waits and tries again several times. The run fails only if every retry is also refused." },
    { question: "Why is my flow slow but not failing?", answer: "It is probably being throttled. Either a connector is refusing calls and the flow is waiting between retries, or the flow has gone over its action allowance and Power Automate is slowing it down." },
    { question: "Will a premium licence remove throttling?", answer: "A higher licence raises the Power Platform request allowance for the flow. It does not change the limits of an individual connector, such as the number of calls SharePoint accepts from one connection per minute." }
  ],
  relatedTools: ["odata-filter-query-builder"],
  relatedPatterns: ["power-platform-request-limits-monitor", "apply-to-each-concurrency-variables-power-automate", "sharepoint-batch-create-update-items-power-automate", "filter-array-instead-of-apply-to-each"],
  relatedLinks: [{ href: "/guides/filter-query-vs-filter-array-vs-condition", label: "Filter Query vs Filter array vs Condition" }],
  relatedErrors: ["badgateway-502-power-automate", "exceeds-list-view-threshold-power-automate"],
  sources: [
    learnDoc("troubleshoot/power-platform/power-automate/flow-run-issues/troubleshoot-slow-running-flows", "Troubleshoot slow-running flows"),
    limitsDoc,
    sharePointConnectorDoc
  ]
};

const badGateway: ErrorPage = {
  ...base,
  slug: "badgateway-502-power-automate",
  message: "BadGateway",
  title: "Fix a \"BadGateway\" (502) error in a Power Automate flow",
  shortTitle: "BadGateway (502)",
  description: "What a 502 BadGateway error means in a flow run, how to tell a passing fault from a real problem, and how to set a retry policy for the ones that pass.",
  keywords: ["BadGateway Power Automate", "502 Bad Gateway flow", "Power Automate 502", "retry policy Power Automate", "BadGateway SharePoint"],
  quickAnswer: "A 502 means the connector reached the service behind it and got an error or no usable answer back. It is usually temporary: resubmit the run. If the same action fails every time, open its outputs and read the body, because a real error message is often inside. For actions that fail now and then, keep the default retry policy or set a longer one.",
  variants: [
    "Status code 502. BadGateway.",
    "BadGateway. The request failed. Error code: '502'. Error message: 'BadGateway'.",
    "InternalServerError (500)"
  ],
  meaning: [
    p("Every connector action passes through a gateway on its way to the real service, such as SharePoint, Outlook or your own API. `BadGateway` is the gateway reporting that the service on the other side failed. The flow did nothing wrong in how it asked, as far as the gateway can tell."),
    p("Microsoft's own guidance is that 500 and 502 errors are temporary or transient, and that resubmitting the run is the first step.")
  ],
  causes: [
    ol(
      "A short service interruption. The next attempt works.",
      "The request was too slow. Connector calls have a time limit of two minutes, and a query that takes longer is cut off.",
      "The request was too large: a very big file, or a query returning a huge result.",
      "An error inside the service that the connector reports as 502. The real message is in the action's output body.",
      "A custom connector or an HTTP action whose target API is down or returned an error.",
      "An on-premises data gateway that is offline or overloaded."
    )
  ],
  fixes: [
    ol(
      "Open the failed action and select **Show raw outputs**. Read the `body`. If it contains a specific message, such as a missing column or a permission problem, fix that instead.",
      "Select **Resubmit**. If the run succeeds, the fault was temporary.",
      "If it fails again in the same place, check whether the request is slow or large. Add a filter, lower Top Count, or request fewer columns.",
      "For a custom connector, HTTP action or on-premises source, check that the target is running and reachable."
    ),
    p("**Set a retry policy for unreliable actions.** In the action's settings, find **Retry policy**. Default retries automatically with growing waits. For an action that fails in bursts, choose Exponential interval and set your own count and intervals."),
    p("**Catch what retries cannot fix.** Put the action in a scope and add a second scope that runs when the first one fails, to log the error and tell someone. See the [Try and Catch pattern](/patterns/power-automate-try-catch-scope-error-handling).")
  ],
  prevention: [
    ul(
      "Keep requests small: filter, select only the columns you need, and page through large results.",
      "Leave retry policies on Default unless you have a reason to change them.",
      "For work that takes longer than two minutes on the other side, start it and poll for the result. See the [Do until polling pattern](/patterns/do-until-polling-loop-timeout-power-automate)."
    )
  ],
  faqs: [
    { question: "Is a BadGateway error my fault?", answer: "Usually not. It normally means the service behind the connector had a temporary problem. If the same action fails on every run, look in the action's raw outputs for a more specific error in the body." },
    { question: "How do I retry a failed flow run?", answer: "Open the failed run and select Resubmit. The flow runs again with the same trigger data." },
    { question: "How do I make a flow action retry automatically?", answer: "Open the action's settings and check the Retry policy. Default already retries on temporary failures. You can choose Exponential interval or Fixed interval to set the number of retries and the wait between them." }
  ],
  relatedTools: [],
  relatedPatterns: ["power-automate-try-catch-scope-error-handling", "do-until-polling-loop-timeout-power-automate"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" },
    { href: "/standards/error-handling-standards", label: "Power Platform Error Handling Standards" }
  ],
  relatedErrors: ["429-rate-limit-exceeded-power-automate", "actionfailed-no-dependent-actions-succeeded"],
  sources: [troubleshootDoc, limitsDoc, errorHandlingDoc]
};

const actionFailed: ErrorPage = {
  ...base,
  slug: "actionfailed-no-dependent-actions-succeeded",
  message: "ActionFailed. An action failed. No dependent actions succeeded.",
  title: "Fix \"ActionFailed. An action failed. No dependent actions succeeded\" in Power Automate",
  shortTitle: "ActionFailed. No dependent actions succeeded",
  description: "What this message on a scope, condition or loop means, how to find the action that really failed, and how to capture its error in the flow.",
  keywords: ["ActionFailed. An action failed. No dependent actions succeeded", "Power Automate ActionFailed", "scope failed Power Automate", "apply to each failed", "result function scope"],
  quickAnswer: "This message is a pointer, not the error. It appears on a container, such as a Scope, Condition or Apply to each, when an action inside it failed. Open the container in the run history and keep opening the red items until you reach an ordinary action. That action holds the real error message.",
  variants: [
    "ActionFailed. An action failed. No dependent actions succeeded. (on Apply to each)",
    "ActionFailed. An action failed. No dependent actions succeeded. (on Scope)",
    "An action failed. No dependent actions succeeded."
  ],
  meaning: [
    p("Scopes, conditions, switches and loops contain other actions. When something inside fails and nothing after it handles the failure, the container is marked as failed too, with this message."),
    p("It tells you where to look and nothing about why. The cause is always one level down, or several.")
  ],
  causes: [
    ol(
      "An action inside the container failed with its own error.",
      "An action inside a loop failed on one item out of many.",
      "A container inside the container failed, so the message repeats at each level.",
      "A Terminate action with status Failed ran inside the container."
    )
  ],
  fixes: [
    ol(
      "Open the failed run and select the container with the red mark to expand it.",
      "Find the red item inside. If it is another container, expand that as well.",
      "In an Apply to each, use the arrows at the top of the loop to move to the iteration that failed. The loop shows how many iterations there were.",
      "Select the failed action and read its error, inputs and outputs.",
      "Look that error up. The [troubleshooting guide](/guides/troubleshoot-failed-flow-run) has an index of messages."
    ),
    p("**Capture the real error in the flow.** A catch scope can read what failed inside a try scope with the `result` function, so the notification you send contains the real message instead of this one."),
    ol(
      "In the catch scope, add a **Filter array** action. In **From**, enter the expression `result('Try')`, where Try is the name of the scope that failed.",
      "Select **Edit in advanced mode** and enter the condition below.",
      "Read the message of the first failed action with the second expression."
    ),
    code(`@equals(item()?['status'], 'Failed')`, "Filter array, advanced mode"),
    code(`first(body('Filter_array'))?['error']?['message']`, "Expression"),
    p("Set the catch scope to run after the try scope has failed, using **Run after** in its settings. The [Try and Catch pattern](/patterns/power-automate-try-catch-scope-error-handling) has the complete layout.")
  ],
  prevention: [
    ul(
      "Name scopes and loops for what they do. `Create_order_records` in a failure email is far more useful than `Scope_2`.",
      "Keep loops shallow. A loop inside a loop inside a condition takes a long time to open in the run history.",
      "Send the inner error message, the action name and a link to the run in every failure notification."
    ),
    p("The [error handling standards](/standards/error-handling-standards) describe what a failure notification should include.")
  ],
  faqs: [
    { question: "What does No dependent actions succeeded mean?", answer: "An action inside this scope, condition or loop failed, and no later action was set up to handle the failure. The message marks the container. The real error is on the action inside it." },
    { question: "How do I find which Apply to each iteration failed?", answer: "Open the loop in the run history and use the arrows at the top to step through the iterations. Failed iterations are marked, and selecting the failed action inside shows its error." },
    { question: "How do I get the real error message from a failed scope?", answer: "In a scope that runs after the failure, filter the output of result('ScopeName') for items whose status is Failed, then read the error message of the first one." }
  ],
  relatedTools: [],
  relatedPatterns: ["power-automate-try-catch-scope-error-handling"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" },
    { href: "/standards/error-handling-standards", label: "Power Platform Error Handling Standards" },
    { href: "/power-automate/error-handling", label: "Power Automate error handling patterns" }
  ],
  relatedErrors: ["invalidtemplate-unable-to-process-template-language-expressions", "badgateway-502-power-automate"],
  sources: [errorHandlingDoc, troubleshootDoc, learnDoc("azure/logic-apps/workflow-definition-language-functions-reference", "Reference guide to workflow expression functions")]
};

const fileLocked: ErrorPage = {
  ...base,
  slug: "file-is-locked-for-shared-use-power-automate",
  message: "The file \"https://contoso.sharepoint.com/sites/Finance/Shared Documents/Budget.xlsx\" is locked for shared use by sam@contoso.com.",
  title: "Fix \"The file is locked for shared use\" in a Power Automate flow",
  shortTitle: "The file is locked for shared use",
  description: "Why a flow cannot update, move or delete a SharePoint file that someone has open, and how to make the flow wait and retry until the lock is released.",
  keywords: ["The file is locked for shared use", "file locked Power Automate", "SharePoint file locked flow", "update file properties locked", "locked for exclusive use"],
  quickAnswer: "Someone, or an Office app, has the file open, and SharePoint will not let the flow change it until the lock is released. Locks clear by themselves shortly after the file is closed. Make the flow wait and try again: put the action in a Do until loop with a Delay, and stop after a set number of attempts.",
  variants: [
    "The file ... is locked for exclusive use by ...",
    "The file ... is checked out for editing by ...",
    "The file is currently checked out or locked for editing by another user."
  ],
  meaning: [
    p("When a file is opened for editing, SharePoint puts a lock on it so that two sets of changes do not collide. While the lock is held, actions that change the file or its columns are refused. The message names the account that holds the lock."),
    p("A lock can remain for a while after the person has closed the file, particularly when it was open in a desktop Office app.")
  ],
  causes: [
    ol(
      "A person has the file open in Word, Excel or PowerPoint.",
      "The file was closed moments ago and the lock has not expired yet.",
      "The flow itself just created or changed the file, and the next action arrived before SharePoint had finished with the first.",
      "Another flow, or a sync client, is working on the same file.",
      "The library requires check-out and the file is checked out, which is the third variant above."
    )
  ],
  fixes: [
    p("**Wait and retry.** This handles every cause except a required check-out."),
    ol(
      "Add a variable called `varDone`, type Boolean, set to false.",
      "Add a **Do until** loop that runs until `varDone` is equal to true. In its limits, set a count such as 10.",
      "Inside the loop, add the action that changes the file.",
      "After it, add **Set variable** to make `varDone` true. This runs only when the action succeeded.",
      "Add a **Delay** of one or two minutes, and set it to run after the file action has failed, using **Run after** in its settings."
    ),
    p("The loop tries the action, waits when it fails, and leaves as soon as it succeeds. After the loop, check `varDone` and send a notification if it is still false. The [Do until pattern](/patterns/do-until-polling-loop-timeout-power-automate) covers the loop limits."),
    p("**When the flow locks its own file.** Add a short Delay between creating a file and updating its properties, or set the properties in the same action that creates it where the action allows."),
    p("**When the library requires check-out.** Use the **Check out file** action before the change and **Check in file** after it. If someone else has it checked out, the flow has to wait for them, or a library owner can discard the check-out.")
  ],
  prevention: [
    ul(
      "Trigger on a column that marks the file as ready, such as a status set to Final, not on every modification. People are less likely to still have the file open.",
      "Avoid flows that update the properties of a file on every save. Each update can collide with the editing session that caused it.",
      "Give the flow's notification the name of the account holding the lock, taken from the error message, so someone can ask them to close the file."
    )
  ],
  faqs: [
    { question: "How long does a SharePoint file lock last?", answer: "It is released shortly after the file is closed, but not always at once. A lock from a desktop Office app can stay for several minutes, and longer if the app closed unexpectedly. A retry loop with a delay of a minute or two handles most cases." },
    { question: "Can a flow force a locked file to unlock?", answer: "No. The lock belongs to the editing session. The flow can only wait and retry, or tell someone that the file is open." },
    { question: "Why is the file locked by the same account the flow uses?", answer: "An earlier action in the flow, or another flow using the same connection, has just changed the file. Add a short delay between the two actions, or combine them." }
  ],
  relatedTools: [],
  relatedPatterns: ["do-until-polling-loop-timeout-power-automate", "move-copy-sharepoint-files-rename-conflict-power-automate", "power-automate-try-catch-scope-error-handling"],
  relatedLinks: [{ href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }],
  relatedErrors: ["412-precondition-failed-etag-mismatch", "badgateway-502-power-automate"],
  sources: [sharePointConnectorDoc, automateDoc("sharepoint-overview", "Use SharePoint and Power Automate to build workflows"), errorHandlingDoc]
};

const preconditionFailed: ErrorPage = {
  ...base,
  slug: "412-precondition-failed-etag-mismatch",
  message: "Status code 412. Precondition Failed. The request ETag value does not match the object's ETag value.",
  title: "Fix a 412 \"Precondition Failed\", ETag mismatch or save conflict in Power Automate",
  shortTitle: "412 Precondition Failed and save conflicts",
  description: "Why a flow's update is refused because the item changed in the meantime, and how to fix it by reading the item again, reducing parallel runs or retrying.",
  keywords: ["412 Precondition Failed Power Automate", "ETag mismatch", "Save Conflict Power Automate", "Your changes conflict with those made concurrently by another user", "version of the existing record doesn't match"],
  quickAnswer: "The item was changed by someone or something else between the moment the flow read it and the moment the flow tried to update it. Read the item again immediately before the update so the flow works from the current version, stop several runs from updating the same item at once, and retry the update when a conflict does happen.",
  variants: [
    "Save Conflict. Your changes conflict with those made concurrently by another user. If you want your changes to be applied, click Back in your Web browser, refresh the page, and resubmit your changes.",
    "The version of the existing record doesn't match the RowVersion property provided.",
    "ETag mismatch"
  ],
  meaning: [
    p("SharePoint and Dataverse give every item a version marker, called an ETag, that changes on each save. An update can carry the marker of the version it was based on. If the item has moved on since then, the service refuses the update so that the newer changes are not overwritten."),
    p("The wording depends on the service and the action. A 412 with an ETag message usually comes from an HTTP request. A save conflict comes from SharePoint actions. The RowVersion message comes from Dataverse. The cause is the same.")
  ],
  causes: [
    ol(
      "Two runs of the same flow updating the same item at the same time. A trigger on created or modified often fires twice in quick succession.",
      "An Apply to each with concurrency turned on, where several iterations update one item, such as a running total on a parent.",
      "A person saving the item while the flow is partway through.",
      "A long wait between reading and updating, such as an approval, during which the item changed.",
      "A Send an HTTP request action with an `If-Match` header that holds an old ETag."
    )
  ],
  fixes: [
    p("**Read again just before the update.** After any long step, add a Get item action and build the update from its values, not from the trigger's."),
    p("**Stop runs colliding.** In the trigger's settings, turn on **Concurrency control** and set the degree of parallelism to 1 when runs must not overlap. In an Apply to each that updates a shared item, turn concurrency off."),
    p("**Calculate once, update once.** If a loop adds to a total on a parent item, add up the values in a variable inside the loop and write the total with a single update after it."),
    p("**Retry on conflict.** Put the Get item and the update together in a Do until loop that leaves when the update succeeds, with a short Delay that runs after a failure. Reading inside the loop matters, so each attempt uses the current version."),
    p("**For an HTTP request,** send the current ETag or accept any version on purpose."),
    code(`// Only update if the item is still the version you read
If-Match: "3"

// Update whatever the current version is
If-Match: *`, "Request header"),
    note("Accepting any version means the flow's values replace whatever was saved in the meantime. Use it only when the flow is the one that should win.")
  ],
  prevention: [
    ul(
      "Add a trigger condition so the flow does not start on its own updates. A flow that triggers itself is the most common source of colliding runs.",
      "Update only the columns the flow owns. The [update without overwriting pattern](/patterns/power-automate-sharepoint-update-item-with-etag-awareness) shows how.",
      "Keep the time between reading and writing short."
    )
  ],
  faqs: [
    { question: "What is an ETag in SharePoint?", answer: "It is a version marker on an item that changes every time the item is saved. An update can include the ETag it was based on, and SharePoint refuses the update if the item has a newer one." },
    { question: "Why do I get a save conflict when only my flow updates the item?", answer: "The flow is probably running more than once at the same time, or it triggers itself with its own update. Limit the trigger's concurrency to 1 and add a trigger condition that ignores the flow's own changes." },
    { question: "Should I use If-Match with an asterisk?", answer: "Only when the flow's values should replace any other change. The asterisk turns off the version check, so changes made by someone else in the meantime are overwritten." }
  ],
  relatedTools: ["trigger-condition-builder"],
  relatedPatterns: ["power-automate-sharepoint-update-item-with-etag-awareness", "power-automate-avoid-infinite-update-loop", "apply-to-each-concurrency-variables-power-automate", "send-http-request-to-sharepoint-power-automate"],
  relatedLinks: [{ href: "/guides/power-automate-trigger-conditions-guide", label: "Write and test a trigger condition" }],
  relatedErrors: ["file-is-locked-for-shared-use-power-automate", "patch-conflicts-exist-with-changes-on-the-server"],
  sources: [
    learnDoc("sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest", "Working with lists and list items with REST"),
    learnDoc("power-apps/developer/data-platform/optimistic-concurrency", "Optimistic concurrency"),
    limitsDoc
  ]
};

const variableType: ErrorPage = {
  ...base,
  slug: "variable-cannot-be-initialized-or-updated-with-value-of-type",
  message: "The variable 'varCount' of type 'Integer' cannot be initialized or updated with value of type 'String'. The variable 'varCount' only supports values of types 'Integer'.",
  title: "Fix \"The variable cannot be initialized or updated with value of type\" in Power Automate",
  shortTitle: "The variable cannot be initialized or updated with value of type",
  description: "Why a flow variable rejects a value of the wrong type, and the conversion function to use for integers, decimals, text, true or false, arrays and objects.",
  keywords: ["cannot be initialized or updated with value of type", "variable only supports values of types", "Power Automate variable type", "int function Power Automate", "set variable error"],
  quickAnswer: "A variable has one type, set when it is initialized, and it was given a value of another type. Convert the value with the matching function, such as int(...) for an Integer variable, float(...) for a Float, string(...) for a String or json(...) for an Object or Array. If the variable really should hold the other type, change its type in the Initialize variable action.",
  variants: [
    "The variable 'varTotal' of type 'Float' cannot be initialized or updated with value of type 'String'.",
    "The variable 'varItems' of type 'Array' cannot be initialized or updated with value of type 'Object'.",
    "The variable 'varName' of type 'String' cannot be initialized or updated with value of type 'Null'."
  ],
  meaning: [
    p("**Initialize variable** asks for a type: Boolean, Integer, Float, String, Object or Array. From then on, every **Set variable**, **Increment variable** and **Append to variable** must supply a value of that type."),
    p("The message names three things: the variable, its type, and the type of the value that was refused. The fix is to make the second and third match.")
  ],
  causes: [
    ol(
      "A number that arrives as text. Values from Forms, text inputs, CSV files, Excel and anything written inside `@{...}` are text, even when they look like numbers.",
      "A decimal given to an Integer variable.",
      "An empty value. The message then ends with `of type 'Null'`.",
      "A single record given to an Array variable, or a list given to an Object variable.",
      "Text that contains JSON given to an Object or Array variable without converting it."
    )
  ],
  fixes: [
    table(
      ["Variable type", "Convert with", "Example"],
      ["Integer", "`int()`", "`int(triggerBody()?['Quantity'])`"],
      ["Float", "`float()`", "`float(triggerBody()?['Price'])`"],
      ["String", "`string()`", "`string(body('Get_item')?['ID'])`"],
      ["Boolean", "`bool()` or a comparison", "`equals(triggerBody()?['Approved'], 'Yes')`"],
      ["Array", "`json()`, `split()` or `createArray()`", "`split(triggerBody()?['Emails'], ';')`"],
      ["Object", "`json()`", "`json(triggerBody()?['Payload'])`"]
    ),
    p("Enter the conversion as an expression in the **Value** box of the Set variable action. Typing a number into the box alongside dynamic content can turn the whole value into text."),
    p("**Empty values.** `int` fails on null and on empty text. Give a fallback first."),
    code(`int(coalesce(triggerBody()?['Quantity'], 0))`, "Expression"),
    p("If the value can be empty text as well as null, test for both."),
    code(`if(empty(triggerBody()?['Quantity']), 0, int(triggerBody()?['Quantity']))`, "Expression"),
    p("**Decimals.** `int('4.5')` fails. Use a Float variable and `float()`, or round on purpose before converting."),
    p("**To change a variable's type,** edit the Initialize variable action. You may need to remove the variable from later actions first, since the designer blocks a type change while the variable is in use."),
    tool("power-automate-expression-builder", "Use the empty value templates to write the coalesce and if(empty()) forms around a conversion.")
  ],
  prevention: [
    ul(
      "Start variable names with a hint of their type, such as `varCount` for a number and `varIsUrgent` for true or false.",
      "Convert values once, where they enter the flow, and use the converted variable afterwards.",
      "Prefer Compose over a variable when the value is set once and never changed. Compose accepts any type."
    ),
    p("The [naming standards](/standards/power-automate-naming-standards) have a prefix set for variables.")
  ],
  faqs: [
    { question: "How do I convert a string to an integer in Power Automate?", answer: "Use the int function, for example int(triggerBody()?['Quantity']). For decimals use float. Both fail on empty values, so add a fallback with coalesce or an if(empty()) check first." },
    { question: "Can I change the type of a variable after it is initialized?", answer: "Not while the flow runs. A variable keeps the type from its Initialize variable action. You can edit that action to choose a different type, after removing uses of the variable that depend on the old type." },
    { question: "Why is my number treated as a string?", answer: "Values from text inputs, forms, CSV and Excel arrive as text, and anything placed inside text with the @{...} form becomes text. Wrap the value in int() or float()." }
  ],
  relatedTools: ["power-automate-expression-builder"],
  relatedPatterns: ["coalesce-empty-null-handling-power-automate", "apply-to-each-concurrency-variables-power-automate"],
  relatedLinks: [
    { href: "/guides/power-automate-expressions-explained", label: "Read and write flow expressions" },
    { href: "/standards/power-automate-naming-standards", label: "Power Automate Naming Standards" }
  ],
  relatedErrors: ["template-function-expects-string-provided-value-null", "invalidtemplate-unable-to-process-template-language-expressions"],
  sources: [automateDoc("create-variable-store-values", "Store and manage values in variables"), learnDoc("azure/logic-apps/workflow-definition-language-functions-reference", "Reference guide to workflow expression functions")]
};

const notFoundInStore: ErrorPage = {
  ...base,
  slug: "specified-object-was-not-found-in-the-store",
  message: "The specified object was not found in the store.",
  title: "Fix \"The specified object was not found in the store\" in an Outlook flow",
  shortTitle: "The specified object was not found in the store",
  description: "Why an Office 365 Outlook action cannot find a mailbox, folder or message, and how to fix shared mailbox permissions, addresses and stale message IDs.",
  keywords: ["The specified object was not found in the store", "shared mailbox Power Automate error", "Default folder Root not found", "send email from shared mailbox flow", "Outlook connector error"],
  quickAnswer: "Outlook could not find the mailbox, folder or message the action asked for. For a shared mailbox, check that the address is the mailbox's real email address and that the account behind the connection has Full Access to it. For a message, the email was probably moved or deleted after the trigger fired. For a folder, pick the folder again in the action.",
  variants: [
    "The specified object was not found in the store., Default folder Root not found.",
    "The specified object was not found in the store., The process failed to get the correct properties.",
    "ErrorItemNotFound. The specified object was not found in the store."
  ],
  meaning: [
    p("The store is the mailbox. The Office 365 Outlook connector asked Exchange for a mailbox, a folder in it or a message by ID, and Exchange replied that nothing matches. The text after the comma, when there is any, hints at which of the three it was.")
  ],
  causes: [
    ol(
      "**No access to the shared mailbox.** The account that owns the connection is not a member, or was given Send As rights only. The connector's shared mailbox actions need Full Access.",
      "**A wrong mailbox address.** A display name, an alias that is not the primary address, or a distribution list in place of a shared mailbox.",
      "**The wrong action for the mailbox.** A shared mailbox needs the actions with **shared mailbox** in their name. The ordinary actions look in the connection owner's own mailbox.",
      "**The message is gone.** Between the trigger and a later action such as Get email or Move email, a person or an inbox rule moved or deleted it. Moving a message changes its ID.",
      "**The folder is gone.** A folder the action points at was deleted, renamed or moved.",
      "**The mailbox is not in Exchange Online.** A mailbox that is still on premises may not be reachable by the connector."
    )
  ],
  fixes: [
    p("**Check the mailbox and its permissions.**"),
    ol(
      "Confirm the address by opening the shared mailbox in Outlook on the web with the account the connection uses. If it does not open, the flow cannot use it either.",
      "Ask an Exchange administrator to grant that account **Full Access** to the shared mailbox. Send As is needed as well if the flow sends from it.",
      "Wait a while after the permission is granted before testing. Mailbox permissions are not always effective at once.",
      "In the action, enter the mailbox's full primary email address."
    ),
    p("**Check the connection.** Open the flow's connections and confirm which account the Outlook connection signs in as. A flow that was exported, imported or handed to a new owner may be using a different account from the one that was given access."),
    p("**Handle messages that move.** Use the values the trigger already supplies, such as the body and attachments, instead of fetching the message again by ID. If a rule files incoming mail into a folder, point the trigger at that folder."),
    p("**Re-pick the folder.** Open the action, clear the folder field and choose the folder again from the picker, so the action stores the current folder ID.")
  ],
  prevention: [
    ul(
      "Run mailbox flows under a service account whose access is recorded, not under a person who may change role.",
      "Write down the permissions each flow needs. The [connection reference standards](/standards/connection-reference-standards) have a layout for it.",
      "Avoid inbox rules that move the same messages a flow acts on.",
      "Put mailbox actions in a scope with error handling so a missing message is logged and does not stop the rest of the run."
    ),
    p("For saving attachments from a shared mailbox, see the [shared mailbox attachments pattern](/patterns/save-email-attachments-sharepoint-shared-mailbox-flow).")
  ],
  faqs: [
    { question: "What permissions does a flow need for a shared mailbox?", answer: "The account used by the Office 365 Outlook connection needs Full Access to the shared mailbox to read it, and Send As or Send on Behalf to send from it. An Exchange administrator grants these." },
    { question: "Why does Get email fail right after the trigger found the message?", answer: "The message was moved or deleted in between, often by an inbox rule. A moved message gets a new ID, so the ID from the trigger no longer finds it." },
    { question: "Can a flow use a shared mailbox that is on premises?", answer: "The Office 365 Outlook connector is built for mailboxes in Exchange Online. A mailbox that has not been moved there may not be found. Check the connector reference for the current position on hybrid setups." }
  ],
  relatedTools: [],
  relatedPatterns: ["save-email-attachments-sharepoint-shared-mailbox-flow", "power-automate-try-catch-scope-error-handling", "reassign-apps-flows-when-maker-leaves"],
  relatedLinks: [
    { href: "/standards/connection-reference-standards", label: "Connection Reference Standards" },
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  relatedErrors: ["problem-with-the-flows-trigger", "actionfailed-no-dependent-actions-succeeded"],
  sources: [
    learnDoc("connectors/office365", "Office 365 Outlook connector reference"),
    learnDoc("troubleshoot/power-platform/power-automate/flow-run-issues/issues-triggering-emails-with-attachments-from-shared-mailbox", "Issues triggering emails with attachments from shared mailbox"),
    troubleshootDoc
  ]
};

const triggerProblem: ErrorPage = {
  ...base,
  slug: "problem-with-the-flows-trigger",
  message: "There's a problem with the flow's trigger. Fix the trigger.",
  title: "Fix \"There's a problem with the flow's trigger\" in Power Automate",
  shortTitle: "There's a problem with the flow's trigger",
  description: "What the trigger banner on a flow's details page means, how to read the underlying error, and the fix for expired connections, deleted lists and blocked network access.",
  keywords: ["There is a problem with the flow's trigger", "Fix the trigger Power Automate", "flow not triggering", "trigger failed Power Automate", "flow trigger error"],
  quickAnswer: "The flow's trigger is failing, so the flow will not start until it is fixed. Select Fix the trigger on the banner, then select the trigger to read the real error. A 4xx code means something you can fix: an expired connection, or a site, list, folder or column the trigger points at that no longer exists. A 5xx code is usually a temporary service problem that clears by itself.",
  variants: [
    "There is a problem with the flow's trigger."
  ],
  meaning: [
    p("A trigger is not passive. Power Automate either checks the source on a schedule or registers with it to be told about changes. This banner appears on the flow's details page when that check or registration fails."),
    p("It is especially useful for a flow that has never run, where there is no run history to look at. While the trigger is failing, no events start the flow.")
  ],
  causes: [
    ol(
      "The connection the trigger uses has expired or its password changed.",
      "The site, list, library, folder, mailbox or table the trigger points at was deleted, renamed or moved.",
      "The account behind the connection lost access to it.",
      "A column or view named in the trigger's settings no longer exists.",
      "The trigger could not register, because the organization's network does not allow the Power Automate service addresses.",
      "A temporary service problem, shown by a 5xx status code."
    )
  ],
  fixes: [
    ol(
      "On the flow's details page, select **Fix the trigger** on the banner.",
      "Select the trigger to open it and read the error message and status code.",
      "Fix what the message points at, using the table below.",
      "Save the flow. Saving registers the trigger again."
    ),
    table(
      ["The error says", "Fix"],
      ["Unauthorized, 401, 403", "Open the flow's connections and repair the one with a warning, or restore the account's access to the source."],
      ["Not found, 404", "Edit the trigger and pick the site, list, folder or table again."],
      ["Bad request, 400", "A trigger input is invalid. Check each setting, including any folder path, view and trigger condition."],
      ["500, 502, 503", "Wait. These usually clear without action."]
    ),
    p("If the trigger looks correct and the banner stays, make a small edit to the flow, save it, undo the edit and save again. The flow sees that its setup changed and registers the trigger a second time."),
    p("Microsoft notes that the banner can remain for a while after the trigger has recovered. If the flow is running successfully again, the banner can be ignored."),
    p("If the trigger opens without any error and the flow still does not start, the cause is more likely a trigger condition that is never true. See [write and test a trigger condition](/guides/power-automate-trigger-conditions-guide)."),
    tool("trigger-condition-builder", "Rebuild the trigger condition to rule it out as the reason the flow is not starting.")
  ],
  prevention: [
    ul(
      "Use a service account for connections on important flows, so a password change or a leaver does not stop them.",
      "Put flows in solutions with connection references, which makes a broken connection quicker to replace. See the [connection reference pattern](/patterns/connection-references-for-solution-flows).",
      "Before renaming or deleting a list or library, check which flows trigger from it.",
      "Add a co-owner to every production flow so someone can repair it when the owner is away."
    )
  ],
  faqs: [
    { question: "Why is my Power Automate flow not triggering?", answer: "Check the flow's details page for a trigger banner first. If there is one, the trigger is failing and its error explains why. If there is none, check that the flow is turned on, that the trigger points at the right list or mailbox, and that any trigger condition is true for the item you tested with." },
    { question: "How do I fix an expired connection on a flow?", answer: "Open the flow's details page and look at its connections. Select the connection that shows a warning and sign in again. Then save the flow so the trigger registers again." },
    { question: "The banner is still there after I fixed the trigger. Is something wrong?", answer: "Not necessarily. The banner can stay for a time after the trigger recovers. If new events are starting the flow and the runs succeed, the trigger is working." }
  ],
  relatedTools: ["trigger-condition-builder"],
  relatedPatterns: ["connection-references-for-solution-flows", "turn-on-flows-after-solution-import", "reassign-apps-flows-when-maker-leaves"],
  relatedLinks: [
    { href: "/guides/power-automate-trigger-conditions-guide", label: "Write and test a trigger condition" },
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  relatedErrors: ["specified-object-was-not-found-in-the-store", "column-does-not-exist-deleted-by-another-user"],
  sources: [
    learnDoc("troubleshoot/power-platform/power-automate/flow-run-issues/there-is-a-problem-with-the-flows-trigger", "There is a problem with the flow's trigger"),
    learnDoc("troubleshoot/power-platform/power-automate/flow-run-issues/triggers-troubleshoot", "Troubleshoot Power Automate trigger problems and errors"),
    automateDoc("ip-address-configuration", "IP address configuration")
  ]
};

export const flowErrorsTwo: ErrorPage[] = [
  listViewThreshold,
  rateLimit,
  badGateway,
  actionFailed,
  fileLocked,
  preconditionFailed,
  variableType,
  notFoundInStore,
  triggerProblem
];
