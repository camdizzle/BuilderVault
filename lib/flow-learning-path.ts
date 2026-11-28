// The ordered learning path for new Power Automate makers, shown at /start/flows.
// Every href must point to a page that exists on the site.

import type { PathStep } from "./learning-path";

export const flowLearningPathPath = "/start/flows";

export const flowLearningPath: PathStep[] = [
  {
    id: "first-flow",
    title: "Understand flows and build your first one",
    summary:
      "Every cloud flow is a trigger followed by actions. Build a small instant flow that you run yourself, so you learn the designer, dynamic content, testing and run history before an event or a schedule is involved.",
    learn: [
      "How automated, instant and scheduled flows differ, and which to pick",
      "How a trigger's values reach later actions as dynamic content",
      "How to test a flow and read each step of a run"
    ],
    links: [
      { href: "/guides/create-first-power-automate-cloud-flow", label: "Create your first cloud flow", kind: "Guide", note: "Triggers, actions and the three flow types" },
      { href: "/guides/power-automate-schedule-flow-recurrence", label: "Schedule a flow", kind: "Guide", note: "Weekdays, business hours and month end" }
    ],
    checkpoint: "You've run an instant flow, received the email it sent, and opened that run in the flow's run history."
  },
  {
    id: "sharepoint",
    title: "Start a flow from a SharePoint list",
    summary:
      "Most business flows start when something changes in a list. Build an automated flow that runs when an item is created, and learn why choice, person and lookup columns need a little more than plain text columns.",
    learn: [
      "How the SharePoint triggers and the Get item and Update item actions work",
      "How to read the text of a choice column and the email of a person column",
      "Why flows use a column's internal name, not its display name"
    ],
    links: [
      { href: "/guides/power-automate-sharepoint-quick-start", label: "SharePoint in Power Automate", kind: "Guide", note: "One complete flow on a list" },
      { href: "/guides/power-automate-choice-person-lookup-values", label: "Choice, Person and Lookup values", kind: "Guide", note: "Read the columns that aren't plain text" },
      { href: "/guides/sharepoint-internal-column-names-power-automate", label: "SharePoint internal column names", kind: "Guide", note: "Find the name a flow needs" },
      { href: "/tools/sharepoint-internal-name-helper", label: "SharePoint internal name helper", kind: "Tool", note: "See a column's internal name before you create it" }
    ],
    checkpoint: "Adding an item to your list starts a flow that sends an email containing the item's title and the text of a choice column."
  },
  {
    id: "filter",
    title: "Get only the items you need",
    summary:
      "Flows slow down and hit limits when they read a whole list and loop over it. Filter at the source with a Filter Query, and use a trigger condition so the flow only starts for the items it should handle.",
    learn: [
      "How to write a Get items Filter Query for each column type",
      "When to filter with a Filter Query, Filter array or a Condition",
      "How a trigger condition stops a flow from running when it doesn't need to"
    ],
    links: [
      { href: "/guides/sharepoint-get-items-filter-query", label: "Get items Filter Query", kind: "Guide", note: "A working query for every column type" },
      { href: "/guides/filter-query-vs-filter-array-vs-condition", label: "Filter Query, Filter array or Condition", kind: "Guide", note: "Where to filter data in a flow" },
      { href: "/tools/odata-filter-query-builder", label: "OData Filter Query builder", kind: "Tool", note: "Build a Filter Query from your columns" },
      { href: "/guides/power-automate-trigger-conditions-guide", label: "Trigger conditions", kind: "Guide", note: "Write and test one" },
      { href: "/tools/trigger-condition-builder", label: "Trigger condition builder", kind: "Tool", note: "Generate a trigger condition expression" }
    ],
    checkpoint: "A Get items action returns only the open items, using a Filter Query rather than a Condition inside a loop."
  },
  {
    id: "expressions",
    title: "Read and write expressions",
    summary:
      "Dynamic content covers the simple cases. Expressions handle the rest: formatting dates, choosing a default for an empty value, and reading a value deep inside an action's output.",
    learn: [
      "How body, outputs, items and the question mark find a value",
      "How to filter and format dates in a flow",
      "When Parse JSON helps and when an expression is simpler"
    ],
    links: [
      { href: "/guides/power-automate-expressions-explained", label: "Power Automate expressions explained", kind: "Guide", note: "body, outputs, items and the question mark" },
      { href: "/tools/power-automate-expression-builder", label: "Expression builder", kind: "Tool", note: "Build and check an expression" },
      { href: "/guides/power-automate-filter-query-by-date", label: "Filter items by date", kind: "Guide", note: "Today, the last 7 days or a date range" },
      { href: "/guides/power-automate-parse-json-guide", label: "Parse JSON", kind: "Guide", note: "Use it, or skip it" }
    ],
    checkpoint: "You can write an expression that formats today's date, and you can find the path to any value by reading a past run's outputs."
  },
  {
    id: "approvals",
    title: "Send approvals and notifications",
    summary:
      "Approvals, emails and Teams messages are what most people notice about a flow. Send an approval, branch on the outcome, and tell people the result where they already work.",
    learn: [
      "How Start and wait for an approval works, and how to read the outcome and comments",
      "How to send a useful email with the Outlook connector",
      "How to post a message or card in Teams"
    ],
    links: [
      { href: "/guides/power-automate-approvals-quick-start", label: "Approvals in Power Automate", kind: "Guide", note: "Send a request and read the outcome" },
      { href: "/guides/power-automate-outlook-quick-start", label: "Outlook in Power Automate", kind: "Guide", note: "Send and react to email" },
      { href: "/guides/power-automate-teams-quick-start", label: "Teams in Power Automate", kind: "Guide", note: "Post messages and cards" }
    ],
    checkpoint: "A flow sends an approval, follows a different branch for Approve and Reject, and writes the outcome back to the list item."
  },
  {
    id: "support",
    title: "Run flows from apps, and keep them running",
    summary:
      "A flow other people rely on needs more than a working first run. Call it from a Power Apps app, know how to read a failed run, stay inside the limits, and make sure it doesn't stop when its maker leaves.",
    learn: [
      "How to call a flow from Power Apps and use the values it returns",
      "How to read a failed run and resubmit it",
      "Which limits and ownership problems stop flows in production"
    ],
    links: [
      { href: "/guides/call-power-automate-flow-from-power-apps", label: "Call a flow from Power Apps", kind: "Guide", note: "Pass values in and get values back" },
      { href: "/functions/refresh", label: "Refresh", kind: "Function", note: "Show the flow's changes in the app" },
      { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run", kind: "Guide", note: "Read the run history" },
      { href: "/guides/power-automate-limits", label: "Power Automate limits", kind: "Reference", note: "Every number in one place" },
      { href: "/guides/hand-over-power-automate-flows-when-someone-leaves", label: "Hand over flows when someone leaves", kind: "Guide", note: "Owners and connections" }
    ],
    checkpoint: "A button in an app runs your flow and shows its result, you've resubmitted a failed run, and the flow has a co-owner."
  }
];

export const flowLearningPathFaqs = [
  {
    question: "How do I start learning Power Automate?",
    answer: "Build one small instant flow that you run yourself, then an automated flow on a SharePoint list. Once you can test a flow and read its run history, learn to filter data, write expressions and send approvals, in that order."
  },
  {
    question: "Do I need to know how to code to use Power Automate?",
    answer: "No. Flows are built from triggers and actions in a visual designer. Expressions, which look like Excel formulas, help with dates and values the designer can't pick directly, and you can learn them as you go."
  },
  {
    question: "Is Power Automate included with Microsoft 365?",
    answer: "Many Microsoft 365 business plans include Power Automate for flows that use standard connectors, such as SharePoint, Outlook and Teams. Premium connectors, such as HTTP and SQL Server, need a premium Power Automate license."
  },
  {
    question: "Should I learn Power Apps or Power Automate first?",
    answer: "Either works, and they're often used together. If your goal is an app people fill in, start with the Power Apps learning path and add flows at step six. If your goal is automating emails, approvals or list updates, start with this path."
  }
];
