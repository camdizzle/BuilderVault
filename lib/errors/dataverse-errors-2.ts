import { code, learnDoc, note, ol, p, table, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Dataverse" as const, published: "2026-11-21", updated: "2026-11-21" };

const pluginErrorsDoc = learnDoc("troubleshoot/power-platform/dataverse/plug-in-execution/dataverse-plug-ins-errors", "Troubleshoot Dataverse plug-ins");
const handleExceptionsDoc = learnDoc("power-apps/developer/data-platform/handle-exceptions", "Handle exceptions in plug-ins");
const tracingDoc = learnDoc("power-apps/developer/data-platform/logging-tracing", "Tracing and logging");
const errorCodesDoc = learnDoc("power-apps/developer/data-platform/reference/web-service-error-codes", "Dataverse web service error codes");
const apiLimitsDoc = learnDoc("power-apps/developer/data-platform/api-limits", "Service protection API limits");
const scalableDoc = learnDoc("power-apps/developer/data-platform/scalable-customization-design/overview", "Scalable customization design in Dataverse");

const dataverseGuide = { href: "/guides/power-automate-dataverse-quick-start", label: "Dataverse connector quick start" };
const limitsGuide = { href: "/guides/power-automate-limits", label: "Power Automate limits" };

/** How a maker finds which plug-in failed, taken from Microsoft's tracing article. */
const findThePlugin = [
  p("**Find out which plug-in failed.** Dataverse can write each plug-in error to the plug-in trace log, which names the plug-in class that threw it."),
  ol(
    "An administrator turns the log on in the classic settings: **Settings** > **Administration** > **System Settings**, then the **Customization** tab, and sets **Enable logging to plug-in trace log** to **Exception**.",
    "Repeat the action that failed.",
    "Open **Settings** in a model-driven app and select the **Plug-in Trace Log** tile. Open the newest row. The type name says which plug-in ran, and the message block holds its trace and error.",
    "Turn the log back off when you're done, because it uses storage."
  ),
  p("In a model-driven app, the error dialog for a synchronous plug-in also has a **Download Log File** button with the same details.")
];

const isvAborted: ErrorPage = {
  ...base,
  slug: "isv-code-aborted-the-operation-dataverse",
  message: "ISV code aborted the operation.",
  title: "Fix \"ISV code aborted the operation\" in Dataverse",
  shortTitle: "ISV code aborted the operation",
  description: "What ISV code aborted the operation (0x80040265) means when a Dataverse save fails in an app or a flow, how to find the plug-in behind it, and what to do next.",
  keywords: ["ISV code aborted the operation", "0x80040265", "-2147220891", "IsvAborted", "Dataverse plug-in error Power Automate"],
  quickAnswer: "Custom code on the table, usually a plug-in, refused the save on purpose. ISV means independent software vendor, which here means any code added to Dataverse, including your own team's and solutions you installed. The text after this message, or the plug-in's own message in the app, says why. Read it, fix the data, or find the plug-in in the plug-in trace log and ask its owner.",
  variants: ["IsvAborted", "0x80040265", "-2147220891", "0x80048d0b"],
  meaning: [
    p("A plug-in is code that runs inside Dataverse when a row is created, updated or deleted. When it decides the change breaks a rule, it stops the operation with an error and a message. Dataverse rolls the whole change back, and the caller receives this code."),
    p("So this is usually not a fault. It is a rule saying no. The useful part is the message the plug-in added, which flows and apps often show after this one or in the error details."),
    note("Microsoft lists several codes with this message, such as IsvAbortedBadRequest (0x80048d0b) and IsvAbortedNotFound. They mean the same thing, with an HTTP-style status added by the plug-in.")
  ],
  causes: [
    ol(
      "The data breaks a rule the plug-in enforces, such as a required combination of values, a date range, or a status change that isn't allowed.",
      "The user or flow account lacks a role or team the plug-in checks for.",
      "A plug-in from an installed solution, such as a Dynamics 365 app or a third-party product, applies its own rules.",
      "The plug-in caught an unexpected error and reported it this way, as Microsoft recommends, for example a missing column in a dictionary lookup."
    )
  ],
  fixes: [
    p("**Read the full error.** In a flow, open the failed action and read the whole output. In Power Apps, show `FirstError.Message` inside `IfError`. The plug-in's own text usually explains the rule."),
    ...findThePlugin,
    p("**Then act on what you find.**"),
    table(
      ["The plug-in says", "Do this"],
      ["A rule about the data", "Change the values your app or flow sends."],
      ["Something about permissions", "Give the account the role or team the rule needs, or run the flow as an account that has it."],
      ["A technical error, such as a missing key", "Send the trace log to the plug-in's developer or vendor."]
    )
  ],
  prevention: [
    ul(
      "Ask whoever owns plug-ins in your environment for the list of rules on the tables your apps and flows write to.",
      "Check those rules in the app before saving, so users get a clear message instead of a failed save.",
      "Plug-in developers should always throw InvalidPluginExecutionException with a clear message, as Microsoft advises."
    )
  ],
  faqs: [
    { question: "What does ISV mean in a Dataverse error?", answer: "Independent software vendor. In Dataverse errors it means custom code, such as a plug-in or custom workflow activity, whoever wrote it." },
    { question: "Is ISV code aborted the operation a bug?", answer: "Usually not. It means a plug-in deliberately stopped the operation, often because the data broke one of its rules. Read the message that comes with it." },
    { question: "How do I find which plug-in stopped the save?", answer: "Turn on the plug-in trace log for exceptions, repeat the action, and open the newest row in the Plug-in Trace Log in Settings. It names the plug-in type." }
  ],
  relatedTools: [],
  relatedPatterns: ["power-apps-error-handling-iferror-patch", "power-automate-try-catch-scope-error-handling"],
  relatedLinks: [dataverseGuide],
  relatedErrors: ["unexpected-error-occurred-from-isv-code-dataverse", "given-key-was-not-present-in-the-dictionary-dataverse", "principal-user-is-missing-privilege-dataverse", "failed-to-install-the-flow-0x80040265"],
  sources: [errorCodesDoc, handleExceptionsDoc, tracingDoc, pluginErrorsDoc]
};

const isvUnexpected: ErrorPage = {
  ...base,
  slug: "unexpected-error-occurred-from-isv-code-dataverse",
  message: "An unexpected error occurred from ISV code.",
  title: "Fix \"An unexpected error occurred from ISV code\" in Dataverse",
  shortTitle: "An unexpected error occurred from ISV code",
  description: "Why a Dataverse save fails with An unexpected error occurred from ISV code, how it differs from ISV code aborted the operation, and how to find the plug-in that crashed.",
  keywords: ["An unexpected error occurred from ISV code", "IsvUnExpected", "-2147220956", "Dataverse plug-in unexpected error", "ISV code error Power Automate"],
  quickAnswer: "A plug-in on the table failed with an error it didn't handle. Unlike ISV code aborted the operation, nothing chose to stop the save: the code broke. Turn on the plug-in trace log for exceptions, repeat the action, and read the newest log row to see which plug-in failed and the real exception. The fix is in the plug-in, so send that log to its developer or vendor.",
  variants: ["IsvUnExpected", "-2147220956"],
  meaning: [
    p("Microsoft asks plug-in developers to catch errors and report them with a clear message. When a plug-in lets any other kind of error escape, Dataverse replaces it with this general text and rolls the change back."),
    p("The message tells you only that custom code failed. The details are in the trace log.")
  ],
  causes: [
    ol(
      "The plug-in reads a column that isn't in the request. On an update, only changed columns are sent, so code that assumes a column is always there fails. See [The given key was not present in the dictionary](/errors/given-key-was-not-present-in-the-dictionary-dataverse).",
      "The plug-in calls an outside web service that is down or slow.",
      "The plug-in hits a null value it didn't expect.",
      "A new version of the plug-in or a solution was deployed with a bug."
    )
  ],
  fixes: [
    ...findThePlugin,
    p("**Check whether the data triggers it.** If it fails only for some rows, compare a failing row with a working one. Empty columns and lookups are the usual difference."),
    p("**Work around it while it's fixed.** If a flow hits it, a retry won't help. Add error handling so the run reports the failure clearly, and keep the item for a later rerun.")
  ],
  prevention: [
    ul(
      "Plug-in developers should wrap their code in try and catch and throw InvalidPluginExecutionException with a useful message.",
      "Test plug-ins with updates that change one column at a time, and with empty values."
    )
  ],
  faqs: [
    { question: "What is the difference between ISV code aborted the operation and An unexpected error occurred from ISV code?", answer: "Aborted means the plug-in stopped the operation on purpose and usually gave a reason. Unexpected means the plug-in failed with an error it didn't handle, so the reason is only in the trace log." }
  ],
  relatedTools: [],
  relatedPatterns: ["power-automate-try-catch-scope-error-handling"],
  relatedLinks: [dataverseGuide],
  relatedErrors: ["isv-code-aborted-the-operation-dataverse", "given-key-was-not-present-in-the-dictionary-dataverse", "sandbox-worker-process-crashed-dataverse"],
  sources: [handleExceptionsDoc, pluginErrorsDoc, tracingDoc]
};

const sandboxCrashed: ErrorPage = {
  ...base,
  slug: "sandbox-worker-process-crashed-dataverse",
  message: "The plug-in execution failed because the Sandbox Worker process crashed. This is typically due to an error in the plug-in code.",
  title: "Fix \"Sandbox Worker process crashed\" in Dataverse",
  shortTitle: "Sandbox Worker process crashed",
  description: "Why a Dataverse plug-in fails with Sandbox Worker process crashed, the four causes Microsoft has found, and why the failing plug-in may not be yours.",
  keywords: ["Sandbox Worker process crashed", "-2147204723", "plug-in execution failed Sandbox Worker", "Dataverse plug-in crash", "Dataverse sandbox error"],
  quickAnswer: "The process that runs plug-ins crashed while your operation was using it. Microsoft has found four usual reasons: an unhandled exception, a background thread that fails, a stack overflow, or running out of memory. The crash may come from another plug-in running at the same time, so if it happens once, retry. If it keeps happening on the same action, the plug-in on that table needs fixing.",
  variants: ["-2147204723", "Sandbox Worker process crashed"],
  meaning: [
    p("Plug-ins run in an isolated sandbox process. When that process crashes, every operation using it at that moment fails with this message. Because the process is gone, Dataverse can't say what crashed it.")
  ],
  causes: [
    ol(
      "**An unhandled exception** in the plug-in, for example from an outside web call.",
      "**A background thread** started by the plug-in fails, with no try and catch around its work.",
      "**A stack overflow**, usually from code that calls itself without end.",
      "**The worker runs out of memory**, for example when a plug-in runs on a query that returns emails with large attachments."
    ),
    p("Microsoft notes that the crash may come from another plug-in running for your organization at the same time.")
  ],
  fixes: [
    table(
      ["What you see", "What to do"],
      ["It happened once", "Run the action again. A crash caused by another plug-in won't repeat."],
      ["It happens every time on one action", "Find the plug-in on that table and message with the trace log, and send it to its developer."],
      ["It happens on actions that read many rows with files", "Read the rows first, then fetch the files one at a time."]
    ),
    p("**For a flow,** set a retry policy on the Dataverse action or wrap it in a scope with error handling, so a one-off crash doesn't fail the whole run.")
  ],
  prevention: [
    ul(
      "Plug-in developers should catch every exception, including in background threads, and avoid recursion without a limit.",
      "Keep plug-ins stateless, as Microsoft recommends, so they don't build up memory."
    )
  ],
  faqs: [
    { question: "Is the Sandbox Worker process crash caused by my plug-in?", answer: "Not always. The worker can be shared, so another plug-in running at the same time can crash it. If the error repeats on the same action, look at the plug-ins on that table first." }
  ],
  relatedTools: [],
  relatedPatterns: ["power-automate-try-catch-scope-error-handling"],
  relatedLinks: [dataverseGuide],
  relatedErrors: ["unexpected-error-occurred-from-isv-code-dataverse", "sql-error-execution-timeout-expired-dataverse"],
  sources: [pluginErrorsDoc, handleExceptionsDoc]
};

const sqlTimeout: ErrorPage = {
  ...base,
  slug: "sql-error-execution-timeout-expired-dataverse",
  message: "Sql error: 'Execution Timeout Expired.  The timeout period elapsed prior to completion of the operation or the server is not responding.'",
  title: "Fix \"Sql error: Execution Timeout Expired\" in Dataverse",
  shortTitle: "Sql error: Execution Timeout Expired",
  description: "Why a Dataverse operation fails with Sql error: Execution Timeout Expired, including blocking, cascading deletes and assigns, and new tables, and how to reduce it.",
  keywords: ["Sql error Execution Timeout Expired", "-2147204783", "Dataverse SQL timeout", "Dataverse timeout plug-in", "Execution Timeout Expired Power Automate Dataverse"],
  quickAnswer: "The database gave up waiting. The most common reason is blocking: another operation held a lock on the rows yours needed. Deletes and assigns that cascade to many related rows, and many flows updating the same rows at once, are the usual sources. Retry first, then reduce what runs at the same moment and what each operation touches.",
  variants: ["-2147204783", "Execution Timeout Expired"],
  meaning: [
    p("Dataverse stores data in SQL. Every operation has a time limit. When an operation waits longer than that, usually for rows another operation has locked, Dataverse stops it to protect everyone else using the environment.")
  ],
  causes: [
    ol(
      "**Blocking.** Another operation is holding locks on the same rows. Microsoft calls this the most common cause, and notes it often appears only when many users or flows run at once.",
      "**Cascade operations.** Deleting or assigning a row can cascade to every related row, locking all of them. Cascade settings can differ between environments, so it may fail in production only.",
      "**A new table or column.** Microsoft notes that indexes may take a few days to settle after a table or column is created."
    )
  ],
  fixes: [
    p("**Retry.** A timeout caused by a brief lock often succeeds on the next try. Leave the default retry policy on Dataverse actions in flows."),
    p("**Reduce work running at the same moment.** If many flow runs update the same rows, lower the trigger's concurrency or the loop's degree of parallelism."),
    p("**Check cascades.** For a delete or assign that times out, look at the table's relationships. Changing a relationship's behavior from cascade to restrict or remove link means fewer rows are locked. Agree that change with whoever owns the data model first."),
    p("**Plug-ins.** If a plug-in does the work, its developer should follow Microsoft's scalable customization guidance and keep each transaction short.")
  ],
  prevention: [
    ul(
      "Spread bulk updates over time, or run them outside working hours.",
      "Avoid many flows that all update one shared row, such as a counter.",
      "Test bulk operations in an environment with production-like data and relationships."
    )
  ],
  faqs: [
    { question: "Why does a Dataverse update time out only sometimes?", answer: "Usually because of blocking. When other operations lock the same rows at the same moment, yours waits and can time out. When nothing else is running, it succeeds." }
  ],
  relatedTools: [],
  relatedPatterns: ["dataverse-bulk-delete-jobs", "chunk-array-into-batches-power-automate"],
  relatedLinks: [dataverseGuide, limitsGuide],
  relatedErrors: ["combined-execution-time-exceeded-limit-dataverse", "sandbox-worker-process-crashed-dataverse", "429-rate-limit-exceeded-power-automate"],
  sources: [pluginErrorsDoc, scalableDoc]
};

const keyNotPresent: ErrorPage = {
  ...base,
  slug: "given-key-was-not-present-in-the-dictionary-dataverse",
  message: "The given key was not present in the dictionary.",
  title: "Fix \"The given key was not present in the dictionary\" in a Dataverse plug-in",
  shortTitle: "The given key was not present in the dictionary",
  description: "Why a Dataverse plug-in fails with The given key was not present in the dictionary, why it often happens only on updates, and the code fix.",
  keywords: ["The given key was not present in the dictionary", "given key wasn't present in the dictionary Dataverse", "plug-in KeyNotFoundException", "Entity Contains Dataverse", "Dataverse plug-in update error"],
  quickAnswer: "A plug-in asked for a column that isn't in the data it received. On an update, Dataverse sends the plug-in only the columns that changed, so code that reads a column without checking for it fails whenever that column wasn't changed. The fix is in the plug-in: check with Contains before reading, or use GetAttributeValue. Users see this message, or ISV code aborted the operation, or An unexpected error occurred from ISV code.",
  variants: ["KeyNotFoundException", "The given key wasn't present in the dictionary."],
  meaning: [
    p("Inside a plug-in, a row's columns are held in a collection that works like a dictionary: each value is found by its column name. Asking for a name that isn't there throws this error."),
    p("Names are case sensitive, so a typo or wrong casing causes it too.")
  ],
  causes: [
    ol(
      "The plug-in runs on update and reads a column that wasn't part of this update.",
      "The column's logical name is misspelled or has the wrong case.",
      "The plug-in expects a column that a flow or app doesn't send, for example because the flow sets only a few columns."
    )
  ],
  fixes: [
    p("**If you can't change the plug-in,** send the column it needs with every save, even when it hasn't changed. That works around the bug but doesn't fix it."),
    p("**In the plug-in,** check the column before reading it, as Microsoft shows."),
    code(`Entity entity = (Entity)context.InputParameters["Target"];

if (entity.Contains("name"))
{
    string name = entity.GetAttributeValue<string>("name");
}`, "C#"),
    note("GetAttributeValue returns the type's default when the column is missing. For a date that is 1/1/0001, not null, so check with Contains when the difference matters."),
    p("For an update where the plug-in needs the full row, register a pre-image on the step so the plug-in has every column's old value.")
  ],
  prevention: [
    ul("Test update plug-ins by changing one unrelated column.", "Copy logical names from the table's column list instead of typing them.")
  ],
  faqs: [
    { question: "Why does the plug-in work on create but fail on update?", answer: "On create, all the columns that were set are sent. On update, only the changed columns are, so a column the plug-in expects may be missing." }
  ],
  relatedTools: ["dataverse-table-naming-helper"],
  relatedPatterns: [],
  relatedLinks: [dataverseGuide],
  relatedErrors: ["unexpected-error-occurred-from-isv-code-dataverse", "isv-code-aborted-the-operation-dataverse", "could-not-find-a-property-named-dataverse"],
  sources: [pluginErrorsDoc, handleExceptionsDoc]
};

const transactionCount: ErrorPage = {
  ...base,
  slug: "isv-code-reduced-the-open-transaction-count-dataverse",
  message: "ISV code reduced the open transaction count. Custom plug-ins should not catch exceptions from OrganizationService calls and continue processing.",
  title: "Fix \"ISV code reduced the open transaction count\" in Dataverse",
  shortTitle: "ISV code reduced the open transaction count",
  description: "Why a Dataverse plug-in fails with ISV code reduced the open transaction count or There is no active transaction, and why a plug-in can't swallow a failed data operation.",
  keywords: ["ISV code reduced the open transaction count", "There is no active transaction", "-2146893812", "-2147220911", "Dataverse plug-in transaction error"],
  quickAnswer: "A plug-in tried something that failed, caught the error and carried on. Inside a synchronous plug-in that isn't possible: any failed data operation ends the whole transaction, so the plug-in can't continue as if nothing happened. The plug-in must stop and report the error. The fix is in its code.",
  variants: ["There is no active transaction. This error is usually caused by custom plug-ins that ignore errors from service calls and continue processing.", "-2146893812", "-2147220911"],
  meaning: [
    p("A synchronous plug-in runs inside the same database transaction as the save that triggered it. If any data operation in that transaction fails, the transaction is ended and rolled back."),
    p("Some developers wrap an operation that might fail in try and catch, then ignore the error. That works in a normal program, but here the transaction is already gone, so the next operation fails with one of these messages.")
  ],
  causes: [
    ol(
      "A plug-in catches an error from a create, update or delete and continues.",
      "A custom workflow activity does the same. Microsoft notes the second message, There is no active transaction, often involves these, and may be caused by another plug-in."
    )
  ],
  fixes: [
    p("**In the plug-in,** don't swallow errors from data operations. Check whether an operation will succeed before trying it, for example by reading the row first, and when one fails, throw InvalidPluginExecutionException with a clear message."),
    p("**If you only call the table,** you can't fix this yourself. Collect the time and the row, then use the plug-in trace log to name the plug-in for its developer.")
  ],
  prevention: [ul("Review plug-in code for empty or logging-only catch blocks around service calls.")],
  faqs: [
    { question: "Can a plug-in try an operation and ignore it if it fails?", answer: "Not in a synchronous plug-in. Any failed data operation ends the transaction for the whole save, so the plug-in must stop and return an error." }
  ],
  relatedTools: [],
  relatedPatterns: [],
  relatedLinks: [dataverseGuide],
  relatedErrors: ["unexpected-error-occurred-from-isv-code-dataverse", "isv-code-aborted-the-operation-dataverse"],
  sources: [pluginErrorsDoc, handleExceptionsDoc, scalableDoc]
};

const numberOfRequests: ErrorPage = {
  ...base,
  slug: "number-of-requests-exceeded-limit-6000-dataverse",
  message: "Number of requests exceeded the limit of 6000 over time window of 300 seconds.",
  title: "Fix \"Number of requests exceeded the limit of 6000\" in Dataverse",
  shortTitle: "Number of requests exceeded the limit of 6000",
  description: "What Dataverse's service protection limit of 6,000 requests in five minutes means for flows, apps and integrations, how Retry-After works, and how to stay under it.",
  keywords: ["Number of requests exceeded the limit of 6000 over time window of 300 seconds", "0x80072322", "Dataverse service protection limit", "Dataverse 429 too many requests", "Dataverse API limit Power Automate"],
  quickAnswer: "One user or account sent more than 6,000 requests to one Dataverse web server in five minutes. Dataverse returns a 429 with a Retry-After time and refuses more requests until then. Flows retry by themselves, so the usual fix is to send fewer requests: filter before looping, avoid a Get a row inside every loop iteration, and spread large jobs out or run them under more than one account.",
  variants: ["0x80072322", "-2147015902", "Number of concurrent requests exceeded the limit of 52.", "429 Too Many Requests"],
  meaning: [
    p("Dataverse protects each environment with service protection limits. They are counted per user, per web server, over a sliding five-minute window."),
    table(
      ["Limit", "Default per web server", "Code"],
      ["Number of requests", "6,000 in five minutes", "0x80072322"],
      ["Combined execution time", "20 minutes in five minutes", "0x80072321"],
      ["Concurrent requests", "52 or more", "0x80072326"]
    ),
    p("With the Web API, the error comes back as HTTP 429 with a Retry-After header in seconds. Microsoft notes that these numbers are defaults and can vary.")
  ],
  causes: [
    ol(
      "A flow loops over thousands of rows and calls Dataverse once or more per row.",
      "Several flows or an integration run under the same account, so their requests add up.",
      "A data load or migration sends rows one at a time.",
      "Concurrency is set high on a loop, which also hits the concurrent request limit."
    )
  ],
  fixes: [
    p("**Let retries work.** Power Automate retries 429 responses by default. Don't turn the retry policy off on Dataverse actions."),
    p("**Send fewer requests.**"),
    ul(
      "Use **List rows** with a filter and select columns instead of **Get a row by ID** inside a loop.",
      "Expand related tables in **List rows** instead of looking each one up.",
      "For bulk changes, use a batch request through the HTTP with Microsoft Entra ID connector, or a dataflow.",
      "Lower the loop's degree of parallelism if you also see the concurrent requests message."
    ),
    p("**Spread the load.** The limit is per account, so heavy integrations can run under more than one application user. Microsoft recommends starting slow and letting Retry-After tell you the pace the server can handle.")
  ],
  prevention: [
    ul("Estimate requests before building a bulk flow: rows times Dataverse actions per row.", "Run large jobs outside working hours so they don't compete with users."),
    note("Power Platform also has separate daily request limits per licence. Those are a different limit from this one.")
  ],
  faqs: [
    { question: "Is the Dataverse limit 6,000 requests per user per five minutes?", answer: "Yes, by default, per web server. Most environments have more than one web server, and Microsoft says the numbers are defaults that can change." },
    { question: "Do plug-in requests count toward the 6,000?", answer: "No. Requests made by plug-ins and custom workflow activities don't count toward the number of requests, but their execution time is added to the request that triggered them." }
  ],
  relatedTools: [],
  relatedPatterns: ["chunk-array-into-batches-power-automate", "dataverse-dataflow-import-excel-upsert", "dataverse-alternate-key-upsert-power-automate"],
  relatedLinks: [limitsGuide, { href: "/guides/dataverse-list-rows-filter-rows", label: "Filter Dataverse rows with List rows" }],
  relatedErrors: ["combined-execution-time-exceeded-limit-dataverse", "429-rate-limit-exceeded-power-automate", "sql-error-execution-timeout-expired-dataverse"],
  sources: [apiLimitsDoc]
};

const executionTime: ErrorPage = {
  ...base,
  slug: "combined-execution-time-exceeded-limit-dataverse",
  message: "Combined execution time of incoming requests exceeded limit of 1,200,000  milliseconds over time window of 300 seconds. Decrease number of concurrent requests or reduce the duration of requests and try again later.",
  title: "Fix \"Combined execution time of incoming requests exceeded limit\" in Dataverse",
  shortTitle: "Combined execution time exceeded limit of 1,200,000 milliseconds",
  description: "Why Dataverse refuses requests once their combined execution time passes 20 minutes in five minutes, what makes requests slow, and how to stay under the limit.",
  keywords: ["Combined execution time of incoming requests exceeded limit", "1,200,000 milliseconds", "0x80072321", "Dataverse execution time limit", "Dataverse service protection execution time"],
  quickAnswer: "The requests one account sent to a Dataverse web server took more than 20 minutes of processing in total within five minutes. Running many slow requests in parallel gets there quickly. Dataverse returns a 429 with Retry-After. Lower parallelism, make each request lighter, and check for plug-ins that add time to every save.",
  variants: ["0x80072321", "-2147015903", "1200000 milliseconds"],
  meaning: [
    p("This is the second of Dataverse's three service protection limits. It counts how long requests take to process, not how many there are. Plug-in time is added to the request that triggered it."),
    p("Microsoft notes you often hit it after working around the request count, for example by sending large batches in parallel.")
  ],
  causes: [
    ol(
      "Large batch requests sent in parallel.",
      "Many parallel flow runs or loop iterations, each doing a slow operation.",
      "Plug-ins on the table that make every save slower.",
      "Complex queries over large tables, or solution imports running at the same time."
    )
  ],
  fixes: [
    ol(
      "Lower concurrency on the trigger and on loops.",
      "Make batches smaller so each request is quicker.",
      "Select only the columns you need and filter on indexed columns.",
      "Ask whoever owns plug-ins on the table whether one is slow."
    ),
    p("Keep the retry policy on, so actions wait for Retry-After and continue.")
  ],
  prevention: [ul("Grow load slowly and let Retry-After set the pace, as Microsoft recommends.", "Schedule heavy jobs away from each other and from working hours.")],
  faqs: [
    { question: "Why do I hit the execution time limit with few requests?", answer: "The limit counts processing time, not requests. A few large batches or slow operations running at once can use 20 minutes of processing time within five minutes." }
  ],
  relatedTools: [],
  relatedPatterns: ["chunk-array-into-batches-power-automate"],
  relatedLinks: [limitsGuide],
  relatedErrors: ["number-of-requests-exceeded-limit-6000-dataverse", "sql-error-execution-timeout-expired-dataverse", "429-rate-limit-exceeded-power-automate"],
  sources: [apiLimitsDoc]
};

export const dataverseErrorsTwo: ErrorPage[] = [isvAborted, isvUnexpected, sandboxCrashed, sqlTimeout, keyNotPresent, transactionCount, numberOfRequests, executionTime];
