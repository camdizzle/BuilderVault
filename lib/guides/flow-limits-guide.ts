import { automateDoc, code, learnDoc, note, p, section, table, ul, type Guide } from "./types";

const published = "2026-11-20";

export const flowLimitsGuide: Guide = {
  slug: "power-automate-limits",
  title: "Power Automate limits: every number in one place",
  shortTitle: "Power Automate limits reference",
  description: "A lookup table of Power Automate cloud flow limits: run duration, Apply to each and Do until, actions per flow, message size, request limits by licence, timeouts and retries, and when flows are switched off.",
  eyebrow: "Power Automate how-to",
  keywords: ["Power Automate limits", "Power Automate apply to each limit", "Power Automate flow run duration limit", "Power Automate actions per day limit", "Do until limit Power Automate", "Power Platform request limits"],
  published,
  updated: published,
  quickAnswer: "A cloud flow run can last 30 days. A flow can hold 500 actions, nested 8 levels deep. Apply to each handles 5,000 items on Microsoft 365 and other low-profile licences and 100,000 on premium licences, and runs one item at a time unless you raise concurrency, up to 50. Do until stops after 60 loops or one hour by default and can be raised to 5,000 loops. One message can be 100 MB, and a request to a connector times out after 120 seconds. These values were checked against Microsoft's limits page on 20 November 2026.",
  sections: [
    section(
      "lookup",
      "Quick lookup table",
      p("The limits people search for most, in one table. Each row is explained in the sections below. Several limits depend on the flow's **performance profile**, which comes from the licence of the flow's owner. The next section shows which profile you have."),
      table(
        ["Limit", "Value", "Can you change it?"],
        ["Run duration", "30 days", "No"],
        ["Run history kept", "30 days", "No"],
        ["Actions per flow", "500", "No. Split the flow into child flows."],
        ["Nesting depth", "8 levels", "No. Move inner levels into a child flow."],
        ["Variables per flow", "250", "No"],
        ["Cases in a Switch", "25", "No"],
        ["Apply to each items", "5,000 on Low, 100,000 on all others", "Only by changing licence"],
        ["Apply to each concurrency", "1 by default", "Yes, from 1 to 50 in the loop's settings"],
        ["Do until loops", "60 by default", "Yes, up to 5,000 in **Change limits**"],
        ["Items returned with pagination on", "5,000 on Low, 100,000 on all others", "Only by changing licence"],
        ["Message size", "100 MB, or 1 GB with chunking", "Chunking is a setting on actions that support it"],
        ["Outbound request timeout", "120 seconds", "No. Use an asynchronous pattern."],
        ["Recurrence interval", "60 seconds to 500 days", "No"],
        ["Flows owned by one user", "600", "No. Flows in solutions do not count."]
      ),
      note("Microsoft changes these values from time to time. This page was checked on 20 November 2026 against the limits page linked under Sources. If a number matters to a design decision, confirm it there.")
    ),
    section(
      "profiles",
      "Which performance profile a flow has",
      p("A cloud flow takes the plan of its **owner**, and the plan sets the profile. If the owner has more than one plan, the flow gets the higher profile."),
      table(
        ["Profile", "Licences that give it"],
        ["Low", "Free, Microsoft 365 plans, Power Apps per app plans, all licence trials, Dynamics 365 Team Member, Power Apps for Developer"],
        ["Medium", "Power Automate Premium, Power Apps per user, Dynamics 365 Enterprise and Professional plans, and flows triggered from Power Apps, manual flows and child flows"],
        ["High", "Power Automate Process licence, and the older per flow plan"],
        ["Unlimited Extended", "Pay-as-you-go flows"]
      ),
      p("To see your own plan, select **Settings** on the Power Automate title bar, then **View My Licenses**."),
      p("One consequence is easy to miss. If the owner leaves the organisation, the flow falls back to the Low profile. A flow that handled 20,000 items in a loop can start failing at 5,000 with no change to the flow itself. The pattern for [reassigning flows when a maker leaves](/patterns/reassign-apps-flows-when-maker-leaves) covers the handover.")
    ),
    section(
      "runs",
      "Run duration and history",
      table(
        ["Limit", "Value"],
        ["Run duration", "30 days"],
        ["Run history kept", "30 days"],
        ["Shortest recurrence", "60 seconds"],
        ["Longest recurrence", "500 days"],
        ["Shortest delay", "5 seconds on Low, 1 second on all others"]
      ),
      p("Both 30 day limits count from the moment the run **starts**, not from when a step begins waiting. A run that waits on an approval, a Delay or a **Wait for** action is still running. After 30 days any step that is still waiting times out."),
      p("Approvals deserve extra margin. Microsoft's known issues page for approvals says that an approval flow can wait for 28 days. Design any approval that can take weeks so that it finishes or escalates well before then. The [approval timeout page](/errors/approval-timed-out-after-30-days-power-automate) shows two designs."),
      p("Run history is also removed 30 days after the run started. If you need a longer record, write the details you care about to a list or table as the flow runs.")
    ),
    section(
      "loops",
      "Apply to each, Do until and concurrency",
      table(
        ["Limit", "Value"],
        ["Apply to each items", "5,000 on Low, 100,000 on all others"],
        ["Apply to each concurrency", "1 by default, adjustable from 1 to 50"],
        ["Do until loops", "60 by default, 5,000 at most"],
        ["Trigger concurrency", "Off by default. From 1 to 100 when on, starting at 25."],
        ["Waiting runs with trigger concurrency on", "10 plus the concurrency value"],
        ["Split On items", "5,000 on Low, 100,000 on all others, 100 with trigger concurrency on"]
      ),
      p("**Apply to each** runs one item at a time by default, which is slow and safe. To run items in parallel, open the loop's **Settings**, turn on **Concurrency control** and set the degree of parallelism. Do not raise it if the loop sets a variable, because parallel branches overwrite each other. The [concurrency and variables pattern](/patterns/apply-to-each-concurrency-variables-power-automate) explains the safe alternatives."),
      p("**Do until** has two limits that stop it, whichever comes first: a **Count** of 60 and a **Timeout** of one hour, written as `PT1H`. Both are under **Change limits** on the action. A polling loop with a five minute Delay inside reaches the one hour timeout after 12 loops, long before the count. Raise the timeout when you raise the count. The timeout uses the ISO 8601 duration format."),
      code(`PT1H     one hour (the default)
PT12H    twelve hours
P1D      one day
P7D      seven days`, "Do until Timeout"),
      p("When Do until reaches a limit it stops and is marked as succeeded, so the flow carries on as if the condition had been met. Check the condition again after the loop. The [polling loop pattern](/patterns/do-until-polling-loop-timeout-power-automate) shows how."),
      p("**Trigger concurrency** limits how many runs of the flow happen at once. Turning it on cannot be undone without deleting and adding the trigger again, so decide before you switch it on.")
    ),
    section(
      "definition",
      "Limits on the flow definition",
      table(
        ["Limit", "Value"],
        ["Actions per flow", "500"],
        ["Nesting depth", "8"],
        ["Cases in a Switch", "25"],
        ["Variables per flow", "250"],
        ["Action or trigger name", "80 characters"],
        ["Characters in one expression", "8,192"],
        ["Flow description", "256 characters"],
        ["Flows owned by one user", "600"]
      ),
      p("Nesting depth counts every container: Condition, Switch, Apply to each, Do until and Scope. A Condition inside an Apply to each inside a Scope is three levels. The designer refuses to save a ninth level."),
      p("The designer gets slow long before 500 actions. When a flow is hard to scroll, move a self-contained part into a **child flow** and call it with **Run a Child Flow**. A child flow also resets the nesting count, since it starts again at level one."),
      p("The limit of 600 flows applies to flows under **My flows**. Flows created inside a solution are not counted.")
    ),
    section(
      "data",
      "Message size, paging and source limits",
      table(
        ["Limit", "Value"],
        ["Message size", "100 MB"],
        ["Message size with chunking", "1 GB"],
        ["Result of `concat`, `base64` or `string`", "131,072 characters"],
        ["Request URL", "16,384 characters"],
        ["Items returned with pagination on", "5,000 on Low, 100,000 on all others"]
      ),
      p("The 100 MB limit is on the whole message, not on the file alone. A 90 MB file sent as base64 inside a JSON body is larger than 100 MB. Actions that support chunking have an **Allow chunking** switch in their settings. Many connectors set a lower limit of their own."),
      p("Three limits that people meet in flows belong to the data source and not to Power Automate."),
      ul(
        "**SharePoint Get items** returns 100 items unless you set **Top Count**, and a query that must examine more than 5,000 items needs an indexed column. See [exceeds the list view threshold](/errors/exceeds-list-view-threshold-power-automate).",
        "**Dataverse List rows** returns up to 5,000 rows in one page. Turn on **Pagination** in the action's settings to get more.",
        "**Excel List rows present in a table** returns 256 rows unless you turn on **Pagination**. See the [Excel quick start](/guides/power-automate-excel-quick-start)."
      ),
      p("With pagination on, set the **Threshold** to the number of items you want. The most a flow can collect this way is 5,000 on the Low profile and 100,000 on the others. The [5,000 items pattern](/patterns/get-more-than-5000-items-power-automate) covers lists beyond that.")
    ),
    section(
      "requests",
      "Request limits by licence",
      p("Every action a flow runs counts as one **Power Platform request**: connector actions, HTTP calls and built-in steps such as Compose and Initialize variable. Failed actions count. Retries and the extra calls made by pagination count too."),
      table(
        ["Licence", "Requests per 24 hours"],
        ["Power Automate Premium, Power Apps per user, Dynamics 365 Enterprise and Professional", "40,000 per user"],
        ["Microsoft 365 plans with Power Platform access, Power Apps per app, Dynamics 365 Team Member", "6,000 per user"],
        ["Power Automate Process licence, or the older per flow plan", "250,000 per flow"]
      ),
      p("Those are the licensed amounts. During what Microsoft calls the licensing transition period, enforcement is looser. The limits page gives approximate daily figures of 10,000 for Low, 200,000 for Medium and 500,000 for High, and says they are not guarantees. Plan against the licensed amounts and treat the transition figures as headroom that can be withdrawn."),
      p("One limit does not depend on licence: a flow can make at most 100,000 requests in any five minutes."),
      p("To see how many actions a flow runs, open the flow's details page, select **Analytics**, then the **Actions** tab."),
      p("A loop is where the count grows. A flow that reads 2,000 items and runs four actions on each uses more than 8,000 requests in one run. The usual fixes are to filter at the source and to replace the loop with **Filter array** and **Select**. See [where to filter data](/guides/filter-query-vs-filter-array-vs-condition) and the [Filter array pattern](/patterns/filter-array-instead-of-apply-to-each)."),
      p("When a flow goes over a limit, it is slowed down and not stopped. Actions wait and are retried, and runs take longer. The run history shows the delays, and the owner gets an email if it continues. Individual connectors also have their own limits, which are often reached first. Those produce a [429 error](/errors/429-rate-limit-exceeded-power-automate).")
    ),
    section(
      "timeouts",
      "Timeouts and retries",
      table(
        ["Limit", "Value"],
        ["Outbound synchronous request", "120 seconds"],
        ["Outbound asynchronous request", "Up to 30 days"],
        ["Inbound request, including a manual trigger", "120 seconds"],
        ["Default retries", "2 on Low, 12 on Medium and High"],
        ["Most retries you can set", "90"],
        ["Retry delay", "From 5 seconds to 1 day"]
      ),
      p("A connector action that takes longer than two minutes fails with a timeout, unless the connector answers asynchronously. A flow called from Power Apps or from an HTTP request must reach its **Respond** action within the same two minutes, or the caller gets a timeout while the flow continues in the background."),
      p("The default retry policy is exponential. On the Low profile it makes up to two retries, with the last about ten minutes later. On Medium and High it makes up to 12, with the last about an hour later. This is why a failing action can appear to hang for a long time before the run fails. To change it, open the action's **Settings** and set the **Retry policy**."),
      p("If you test a flow that runs for more than ten minutes, the test pane can show a timeout message while the flow carries on. Open the run from the history to see its real state.")
    ),
    section(
      "turned-off",
      "When Power Automate switches a flow off",
      table(
        ["Situation", "After"],
        ["The trigger or actions fail continuously", "14 days"],
        ["The flow is consistently throttled", "14 days"],
        ["The flow has not been triggered", "90 days"]
      ),
      p("The 90 day rule does not apply to flows whose owner has a premium licence, or to flows with a Process or per flow licence. Owners and co-owners are told 30 days before the flow is suspended, and can turn it back on."),
      p("Turning a flow off stops new runs and lets runs in progress finish. Deleting a flow cancels them."),
      p("Add at least one co-owner to every flow that matters, so that someone else receives these warnings when the owner is away.")
    ),
    section(
      "which-limit",
      "Which limit did I hit?",
      table(
        ["What you see", "Likely limit", "Where to go"],
        ["An approval or wait step shows **Timed out**", "30 day run duration", "[Approval timed out](/errors/approval-timed-out-after-30-days-power-automate)"],
        ["A loop stops at exactly 5,000 or 100,000 items", "Apply to each items", "Filter earlier, or split the work across runs"],
        ["Do until ends early and the flow carries on", "Count of 60 or timeout of one hour", "[Polling loop pattern](/patterns/do-until-polling-loop-timeout-power-automate)"],
        ["Only 100, 256 or 5,000 rows come back", "The data source's page size", "Top Count or Pagination on the action"],
        ["\"exceeds the list view threshold\"", "SharePoint's 5,000 item query limit", "[List view threshold](/errors/exceeds-list-view-threshold-power-automate)"],
        ["\"429\" or \"Rate limit is exceeded\"", "A connector's own limit", "[429 rate limit](/errors/429-rate-limit-exceeded-power-automate)"],
        ["Runs are slow, with long gaps between actions", "Power Platform request limits", "Reduce actions per run, or move to a higher licence"],
        ["An action fails after two minutes", "120 second request timeout", "Make the call asynchronous, or do less in one call"],
        ["The designer will not save another nested action", "Nesting depth of 8", "Move the inner part into a child flow"],
        ["The flow is off and nobody turned it off", "14 days of failures, or 90 days without a trigger", "Fix the cause, then turn it on"]
      ),
      p("For any failed run, start with the run history. The guide to [troubleshooting a failed flow run](/guides/troubleshoot-failed-flow-run) shows how to read it.")
    )
  ],
  faqs: [
    {
      question: "How long can a Power Automate flow run?",
      answer: "A single run can last 30 days, counted from when the run started. Any step that is still waiting after 30 days times out. Microsoft's approvals documentation says an approval flow can wait for 28 days, so plan approvals to finish before then."
    },
    {
      question: "What is the Apply to each limit in Power Automate?",
      answer: "Apply to each can process 5,000 items on the Low performance profile, which includes Microsoft 365 licences, and 100,000 items on all other profiles. It runs one item at a time by default, and concurrency can be raised to 50."
    },
    {
      question: "How many actions can a flow have?",
      answer: "A flow can have 500 actions, nested up to 8 levels deep. Move part of a large flow into a child flow to stay under both limits."
    },
    {
      question: "Why does my Do until loop stop after 60 runs or one hour?",
      answer: "Do until has a default count of 60 and a default timeout of one hour, and stops at whichever comes first. Open Change limits on the action to raise the count, up to 5,000, and the timeout, which uses the ISO 8601 format such as PT12H or P1D."
    },
    {
      question: "How many actions can a flow run per day?",
      answer: "The licensed limit is 40,000 Power Platform requests per user in 24 hours for Power Automate Premium and similar licences, 6,000 for Microsoft 365 licences, and 250,000 per flow with a Process licence. Every action counts as a request, including failed actions and retries."
    },
    {
      question: "What happens when a flow goes over its request limit?",
      answer: "The flow is slowed down. Actions wait and are retried, so runs take longer. A flow that stays over the limit for 14 days is turned off, and the owner is emailed first."
    }
  ],
  relatedTools: ["odata-filter-query-builder", "power-automate-expression-builder", "recurrence-schedule-planner"],
  relatedPatterns: ["get-more-than-5000-items-power-automate", "do-until-polling-loop-timeout-power-automate", "apply-to-each-concurrency-variables-power-automate", "filter-array-instead-of-apply-to-each", "chunk-array-into-batches-power-automate"],
  relatedLinks: [
    { href: "/errors/429-rate-limit-exceeded-power-automate", label: "Error: 429 Rate limit is exceeded" },
    { href: "/errors/exceeds-list-view-threshold-power-automate", label: "Error: Exceeds the list view threshold" },
    { href: "/errors/approval-timed-out-after-30-days-power-automate", label: "Error: Approval timed out after 30 days" },
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  sources: [
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows"),
    learnDoc("power-platform/admin/api-request-limits-allocations", "Requests limits and allocations"),
    automateDoc("approvals-known-issues", "Approvals: known issues"),
    automateDoc("dataverse/list-rows", "Use lists of rows in flows")
  ]
};
