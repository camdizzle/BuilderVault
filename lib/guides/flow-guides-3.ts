import { automateDoc, canvasDoc, code, learnDoc, note, ol, p, powerFxDoc, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-21";

const flowIntegrationDoc = learnDoc("troubleshoot/power-platform/power-apps/connections/best-practices-when-updating-a-flow", "Troubleshoot Power Apps flow integration errors");
const v2KnownIssuesDoc = learnDoc("troubleshoot/power-platform/power-automate/flow-creation/known-issues-power-apps-v2-trigger", "Known issues with the Power Apps V2 trigger");

export const callFlowFromPowerAppsGuide: Guide = {
  slug: "call-power-automate-flow-from-power-apps",
  title: "Call a Power Automate flow from Power Apps and get values back",
  shortTitle: "Call a flow from Power Apps",
  description: "Step by step: start a flow from a button, pass it values, return an ID and a message to the app, handle failures, stay inside the two-minute limit, and change the flow later without breaking the live app.",
  eyebrow: "Power Automate how-to",
  keywords: ["call flow from Power Apps", "Power Apps run flow with parameters", "Respond to a PowerApp or flow", "return value from flow to Power Apps", "Power Apps V2 trigger", "Power Apps flow Run"],
  published,
  updated: published,
  quickAnswer: "Start the flow with the Power Apps (V2) trigger and add an input for each value the app sends. End the app's part of the flow with Respond to a PowerApp or flow, which returns named outputs. Add the flow to the app from the Power Automate pane, then call it with Set(varResult, MyFlow.Run(txtTitle.Text, Value(txtAmount.Text))) inside IfError. The app waits at most 120 seconds for the Respond action, so put it as early as you can. When you change the flow's inputs, outputs or connections, refresh it in the app, or remove it and add it again.",
  sections: [
    section(
      "what-you-build",
      "What you'll build",
      p("A **Submit** button that sends a title and an amount to a flow. The flow creates a SharePoint item and returns three values: a status, the new item's ID and a message. The app shows the message and opens the new item."),
      p("The same shape works for anything a flow can do that an app can't, such as sending mail from a shared mailbox, calling a premium connector, or doing work the user doesn't have permission to do directly.")
    ),
    section(
      "create",
      "Step 1: Create the flow from Power Apps Studio",
      ol(
        "In Power Apps Studio, select **Power Automate** on the app authoring menu.",
        "Select **Create new flow**, then **Create from blank**.",
        "Check that the flow starts with the **Power Apps (V2)** trigger. It lets you name each input and choose its type, such as Text or Number.",
        "Add an input for each value the app sends. In this example, a Text input named **title** and a Number input named **amount**.",
        "Add the steps that do the work, such as **Create item** in SharePoint, using the inputs from dynamic content.",
        "Save the flow. It appears in the pane under **In your app**."
      ),
      note("The app passes values in the order the inputs appear in the trigger. If you add an input later, every call to the flow needs updating, and the app has to pick up the change first. Step 6 explains how.")
    ),
    section(
      "respond",
      "Step 2: Return values with Respond to a PowerApp or flow",
      p("Add **Respond to a PowerApp or flow** and give it the outputs the app needs. Keep the names short and the same in every branch."),
      table(
        ["Output", "Type", "Value"],
        ["status", "Text", "`ok`"],
        ["itemid", "Number", "The ID from **Create item**"],
        ["message", "Text", "`Request created`"]
      ),
      p("**Answer the app quickly.** Microsoft gives a flow 120 seconds to reach its Respond action when an app is waiting. Actions after the Respond action keep running after the app has its answer, so put Respond straight after the steps that produce what the app needs, and do slow work, such as approvals or emails to many people, after it."),
      p("**Answer when something fails, too.** Put the work in a **Scope**. Add a second Respond action after the Scope, set to run when the Scope has failed or timed out, that returns `error` as the status and a message. Use the same output names in both, so the app can read either answer. The [return values pattern](/patterns/respond-to-power-app-return-values-from-flow) has the full flow.")
    ),
    section(
      "call",
      "Step 3: Call the flow from a button",
      p("If the flow was made somewhere else, add it from the Power Automate pane with **Add a flow**. The pane keeps whatever formula the button already has, so you add the call yourself. Set the button's **OnSelect** to:"),
      code(`UpdateContext({ locBusy: true });
IfError(
    Set(varResult, SubmitRequest.Run(txtTitle.Text, Value(txtAmount.Text)));
    If(
        varResult.status = "ok",
        Notify(varResult.message, NotificationType.Success);
        Set(varSelectedRequest, LookUp(Requests, ID = varResult.itemid));
        Navigate(scrDetail),
        Notify(varResult.message, NotificationType.Error)
    ),
    Notify("The request couldn't be sent: " & FirstError.Message, NotificationType.Error)
);
UpdateContext({ locBusy: false })`),
      ul(
        "**SubmitRequest** is the flow's name as the pane shows it, without spaces.",
        "**IfError** catches the flow failing to start or to answer in time. The `If` handles the answer your flow sends back on purpose.",
        "Set the button's **DisplayMode** to `If(locBusy, DisplayMode.Disabled, DisplayMode.Edit)`, so a second tap can't start a second run."
      ),
      note("Arguments are sent over the network and can be changed by someone who intercepts them. Microsoft recommends checking them in the flow, for example that an email address belongs to your organization, before acting on them.")
    ),
    section(
      "tables",
      "Step 4: Send and return a table",
      p("The trigger takes single values, so send a table as JSON text. Keep only the columns the flow uses:"),
      code(`SubmitLines.Run(
    JSON(ShowColumns(colCart, ProductId, Qty, Price), JSONFormat.IgnoreUnsupportedTypes)
)`),
      p("In the flow, read the text with **Parse JSON**. The [Parse JSON schema generator](/tools/parse-json-schema-generator) writes the schema from a sample."),
      p("To return a table, add a Text output and put the array in it, for example with `string(body('Select'))`. In the app, turn it back into a table with ParseJSON and ForAll:"),
      code(`Set(varResult, GetOpenRequests.Run());
ClearCollect(
    colOpen,
    ForAll(
        ParseJSON(varResult.items),
        { ID: Value(ThisRecord.ID), Title: Text(ThisRecord.Title) }
    )
)`)
    ),
    section(
      "connections",
      "Step 5: Decide whose connections the flow uses",
      p("Each connection in the flow either belongs to the person using the app, or is a fixed connection that belongs to the flow's owner. The Power Apps (V2) trigger supports both."),
      table(
        ["Connection", "Who the actions run as", "Use it when"],
        ["Provided by the person using the app", "That person", "The flow should only do what the user could do themselves, such as sending mail as them"],
        ["The owner's connection", "The flow's owner or a service account", "The flow needs access the users don't have, such as writing to a locked list"]
      ),
      ul(
        "With the user's own connections, they need permission for everything the flow does, or the flow fails.",
        "With the owner's connection, anyone who can run the app can make the flow act with the owner's access, so check the inputs in the flow.",
        "After changing which connections the trigger uses, refresh the flow in the app, or remove it and add it again, then save the app."
      )
    ),
    section(
      "change",
      "Step 6: Change the flow without breaking the app",
      p("The app saves what it knows about the flow when you add it: its inputs, its connections and its outputs. Microsoft lists the changes most likely to break apps that call a flow:"),
      ul(
        "Adding a new input to the trigger.",
        "Adding a connector the flow didn't use before, such as SharePoint.",
        "Changing an existing connection to a new one.",
        "Removing an output from the Respond action."
      ),
      p("After changing a flow outside Studio, open the app, select **...** next to the flow in the Power Automate pane, and select **Refresh**. If that doesn't clear the error, select **Remove from app**, add the flow again with **Add a flow**, and save and publish the app."),
      p("**If the app is already live,** don't change the flow people are using. Make a copy with **Save As**, change the copy, point a new version of the app at it, and turn off the old flow once everyone has the new version.")
    ),
    section(
      "errors",
      "When it fails: the error messages",
      table(
        ["Error", "Usual cause"],
        ["[ResponseTimeout](/errors/responsetimeout-power-apps-flow-120-seconds)", "The flow didn't reach its Respond action within 120 seconds"],
        ["[InvokerConnectionOverrideFailed](/errors/invokerconnectionoverridefailed-power-apps-flow)", "The flow's connections changed and the app has the old details"],
        ["[MissingConnectionReference](/errors/missingconnectionreference-connection-reference-was-not-given-by-invoker)", "The app and the flow disagree about a connection, often after a solution import"],
        ["[ConnectionAuthorizationFailed](/errors/connectionauthorizationfailed-power-apps-flow)", "The person adding the flow doesn't have access to one of its connections"],
        ["[WorkflowTriggerIsNotEnabled](/errors/workflowtriggerisnotenabled-power-apps-flow)", "The flow is turned off"],
        ["[Failed to install the flow](/errors/failed-to-install-the-flow-0x80040265)", "One of the causes above, reported while adding the flow"]
      ),
      tool("error-message-finder", "Paste any other error from the app or the flow's run history to find its page.")
    )
  ],
  faqs: [
    { question: "How do I pass parameters from Power Apps to a flow?", answer: "Add an input for each value to the Power Apps (V2) trigger, then pass the values to Run in the same order, for example MyFlow.Run(txtTitle.Text, Value(txtAmount.Text))." },
    { question: "How do I get a value back from a flow in Power Apps?", answer: "Add the Respond to a PowerApp or flow action with named outputs, then keep the result of Run in a variable, for example Set(varResult, MyFlow.Run(...)), and read varResult.message." },
    { question: "How long can a flow run when Power Apps calls it?", answer: "The app waits at most 120 seconds for the Respond action. Actions after the Respond action keep running, so respond first and do slow work afterwards." },
    { question: "Why did my app stop working after I edited the flow?", answer: "The app keeps the flow's inputs, connections and outputs from when it was added. After adding an input or a connection, or removing an output, refresh the flow in the Power Automate pane, or remove it and add it again, then publish the app." },
    { question: "Can I send a table or collection to a flow?", answer: "Yes, as text. Use JSON(ShowColumns(colItems, ...)) in the app and the Parse JSON action in the flow. To return a table, return the JSON as a Text output and read it with ParseJSON and ForAll." }
  ],
  relatedTools: ["error-message-finder", "parse-json-schema-generator", "power-fx-formatter"],
  relatedPatterns: ["respond-to-power-app-return-values-from-flow", "power-automate-parse-json-from-power-apps", "power-automate-start-approval-from-power-apps", "power-apps-submit-button-disable-while-saving", "power-automate-try-catch-scope-error-handling"],
  relatedLinks: [
    { href: "/guides/power-fx-iferror-and-app-onerror", label: "IfError and App.OnError in Power Fx" },
    { href: "/guides/power-automate-parse-json-guide", label: "Parse JSON in Power Automate" },
    { href: "/guides/power-automate-limits", label: "Power Automate limits" },
    { href: "/errors", label: "Error library" }
  ],
  sources: [
    canvasDoc("working-with-flows", "Use the Power Automate pane in Power Apps"),
    flowIntegrationDoc,
    v2KnownIssuesDoc,
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows: request timeouts"),
    automateDoc("guidance/coding-guidelines/understand-access-to-flows", "Understand flow ownership and access"),
    powerFxDoc("reference/function-parsejson", "ParseJSON function"),
    powerFxDoc("reference/function-iferror", "IfError function")
  ]
};

const recurrenceDoc = learnDoc("azure/connectors/connectors-native-recurrence", "Schedule and run recurring workflows with the Recurrence trigger");
const scheduleConceptsDoc = learnDoc("azure/logic-apps/concepts-schedule-automated-recurring-tasks-workflows", "Schedules for recurring workflows: patterns and daylight saving time");

export const scheduleFlowGuide: Guide = {
  slug: "power-automate-schedule-flow-recurrence",
  title: "Schedule a flow in Power Automate: weekdays, business hours and month end",
  shortTitle: "Schedule a flow with Recurrence",
  description: "Recurrence trigger settings for the schedules people actually need: weekdays only, every 15 minutes in business hours, every other week, a day of the month, the last day of the month, and skipping holidays.",
  eyebrow: "Power Automate how-to",
  keywords: ["Power Automate run only on weekdays", "Power Automate recurrence business hours", "Power Automate last day of month", "Power Automate every other week", "Power Automate scheduled flow time zone", "Power Automate skip holidays"],
  published,
  updated: published,
  quickAnswer: "Use the Recurrence trigger with Frequency set to Week, pick the days under On these days, and set At these hours and At these minutes. Always pick a time zone and a start time, so the flow keeps the same local time through daylight saving changes. The designer has no setting for the last day of the month, so run the flow every day and stop it unless tomorrow is the 1st.",
  sections: [
    section(
      "settings",
      "The settings that matter",
      table(
        ["Setting", "What it does"],
        ["Interval and Frequency", "How often: every 1 Day, every 2 Weeks, every 3 Months. Minute, Hour, Day, Week and Month are allowed."],
        ["Time zone", "The zone the start time and the hours are in. With a zone, the flow keeps the same local time when daylight saving changes."],
        ["Start time", "The first run. With no start time, the flow runs as soon as you save it. A start time in the past skips ahead to the next future run."],
        ["On these days", "Week frequency only. The days to run."],
        ["At these hours, At these minutes", "Day and Week frequency only. The times to run. Hours or minutes you leave empty come from the start time."]
      ),
      note("With a time zone selected, write the start time without a Z at the end, such as 2027-01-04T08:00:00. A Z marks the time as UTC.")
    ),
    section(
      "recipes",
      "Schedules people ask for",
      table(
        ["Schedule", "Interval and frequency", "On these days", "At these hours", "At these minutes"],
        ["Every weekday at 8:00 AM", "1 Week", "Monday to Friday", "8", "0"],
        ["Every hour in business hours, 8 AM to 5 PM", "1 Week", "Monday to Friday", "8, 9, 10, 11, 12, 13, 14, 15, 16, 17", "0"],
        ["Every 15 minutes in business hours", "1 Week", "Monday to Friday", "8, 9, 10, 11, 12, 13, 14, 15, 16", "0, 15, 30, 45"],
        ["Every other Monday at 9:00 AM", "2 Week", "Monday", "9", "0"],
        ["Weekends only, at 6:00 PM", "1 Week", "Saturday, Sunday", "18", "0"],
        ["On the 15th of every month at 9:00 AM", "1 Month", "Not available", "Not available", "Not available"],
        ["Every quarter", "3 Month", "Not available", "Not available", "Not available"]
      ),
      ul(
        "**Every other week:** the start time sets which weeks count. Put it in the first week you want a run.",
        "**A day of the month:** Month schedules have no days or hours to pick. The runs follow the start time, so set it to the 15th at 9:00 AM in your time zone.",
        "**Days 29, 30 and 31:** not every month has them. Choose an earlier day, or use the month-end check below."
      ),
      tool("recurrence-schedule-planner", "Check any of these schedules before you save it. The planner shows the next 10 runs in your time zone and in UTC, and flags daylight saving changes.")
    ),
    section(
      "month-end",
      "Run on the last day of the month",
      p("The trigger's definition has a `monthDays` setting that can mean the last day, documented for Azure Logic Apps, but the Power Automate designer has no field for it. Run the flow every day instead, and stop the run unless tomorrow is the 1st."),
      ol(
        "Set the Recurrence trigger to **1 Day**, with your time zone, a start time and the hour you want.",
        "Add a **Condition** with this expression on the left, **is equal to** in the middle, and `01` on the right.",
        "Put the month-end steps in the **True** branch and leave **False** empty."
      ),
      code("addDays(convertFromUtc(utcNow(), 'Eastern Standard Time'), 1, 'dd')"),
      p("The expression works out tomorrow's day of the month in your time zone. Use the same zone name as the trigger. Without convertFromUtc, the check uses UTC, which can be a different day from yours in the evening."),
      note("The runs on other days are short, but they still count toward your daily Power Platform request limits, and they appear in the run history.")
    ),
    section(
      "holidays",
      "Skip public holidays",
      ol(
        "Keep a SharePoint list named **Holidays** with a date column named **HolidayDate**.",
        "At the start of the flow, use **Get items** on that list with a filter query for today's date in your time zone.",
        "Add a Condition: if the number of items, `length(outputs('Get_items')?['body/value'])`, is greater than 0, add **Terminate** with the status **Cancelled**."
      ),
      p("Date filters in SharePoint compare times in UTC, so read [Filter Get items by date](/guides/power-automate-filter-query-by-date) before writing the filter.")
    ),
    section(
      "time-zones",
      "Time zones and daylight saving time",
      ul(
        "**Pick a time zone.** Without one, the flow runs on UTC, and in summer it runs an hour earlier or later in local time.",
        "**Avoid start times from 2:00 to 3:00 AM.** Clocks change at 2:00 AM, so Microsoft warns a start time in that hour can become invalid or ambiguous on the nights they change. Use 3:00 AM or later.",
        "**Set it up ahead of a future start.** For a Day, Week or Month schedule with a start time in the future, Microsoft advises setting it up at least 24 hours, 7 days or one month ahead, or the first run might be skipped.",
        "**Expect small delays.** A scheduled run can start a little after its time. Don't rely on it to the second."
      )
    ),
    section(
      "check",
      "Check it before you rely on it",
      ol(
        "Paste your settings into the [Recurrence schedule planner](/tools/recurrence-schedule-planner) and read the next runs.",
        "After saving, open the trigger's **Peek code** and compare it with the planner's trigger definition.",
        "After the first few runs, check the run history to confirm the times."
      )
    )
  ],
  faqs: [
    { question: "How do I run a Power Automate flow only on weekdays?", answer: "Set the Recurrence trigger's Frequency to Week, select Monday to Friday under On these days, and set At these hours and At these minutes to the time you want." },
    { question: "How do I run a flow every 15 minutes during business hours?", answer: "Use Frequency Week with Monday to Friday, the hours from 8 to 16 under At these hours, and 0, 15, 30, 45 under At these minutes. The last run is at 4:45 PM." },
    { question: "Can Power Automate run a flow on the last day of the month?", answer: "Not directly from the designer. Run the flow daily and add a Condition that continues only when addDays(convertFromUtc(utcNow(), 'your time zone'), 1, 'dd') equals 01." },
    { question: "Why does my scheduled flow run at the wrong time?", answer: "Usually the time zone is empty, so the times are UTC, or the start time ends in Z, which marks it as UTC. Pick your time zone and write the start time without a Z." },
    { question: "Why did my flow run as soon as I saved it?", answer: "The trigger has no start time, so the first run happens straight away. Add a start time to control the first run." }
  ],
  relatedTools: ["recurrence-schedule-planner", "power-automate-expression-builder", "date-format-tester"],
  relatedPatterns: ["power-automate-reminder-before-due-date", "convert-time-zone-format-date-power-automate", "power-automate-compose-date-formatting", "pmo-weekly-report-email-template"],
  relatedLinks: [
    { href: "/guides/power-automate-filter-query-by-date", label: "Filter Get items by date" },
    { href: "/guides/power-automate-limits", label: "Power Automate limits" },
    { href: "/cheat-sheets/power-automate-date-formatting-cheat-sheet", label: "Power Automate date formatting cheat sheet" }
  ],
  sources: [automateDoc("run-scheduled-tasks", "Run a cloud flow on a schedule"), recurrenceDoc, scheduleConceptsDoc, automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows")]
};
