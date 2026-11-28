import { automateDoc, learnDoc, note, ol, p, section, table, ul, type Guide } from "./types";

const published = "2026-11-26";

export const firstFlowGuide: Guide = {
  slug: "create-first-power-automate-cloud-flow",
  title: "Create your first Power Automate cloud flow: triggers, actions and the three flow types",
  shortTitle: "Create your first cloud flow",
  description: "What a cloud flow is, how automated, instant and scheduled flows differ, and one small instant flow built and tested step by step, with the connections, run history and ownership every new flow maker needs to understand.",
  eyebrow: "Power Automate basics",
  keywords: ["create first flow Power Automate", "Power Automate for beginners", "Power Automate tutorial", "automated vs instant vs scheduled flow", "Manually trigger a flow", "what is a cloud flow"],
  published,
  updated: published,
  quickAnswer: "A cloud flow is a trigger followed by actions. The trigger decides when the flow runs: an event such as a new SharePoint item for an automated flow, a button for an instant flow, or a time for a scheduled flow. To build one, sign in to make.powerautomate.com, select Create, choose Instant cloud flow, pick the Manually trigger a flow trigger, add the Send an email (V2) action, and save. Select Test, then Manually, then Run flow, and open the run from the flow's run history to see what each step did.",
  sections: [
    section(
      "what-a-flow-is",
      "What a cloud flow is",
      p("A cloud flow is an automation that runs in Microsoft's cloud, not on your computer. Every cloud flow has the same two parts:"),
      ul(
        "**One trigger:** the event that starts the flow, such as an email arriving, an item being added to a SharePoint list, someone selecting a button, or a time of day.",
        "**One or more actions:** the steps the flow takes after the trigger, such as sending an email, creating a Planner task, updating an item or starting an approval."
      ),
      p("Each action can use values from the trigger and from earlier actions. These values appear in the designer as **dynamic content**, such as the title of the item that started the flow or the email address of the person who selected the button."),
      note("Power Automate also has desktop flows, which automate apps on a Windows PC by clicking and typing, like a recording. This guide and the rest of the [Power Automate learning path](/start/flows) cover cloud flows.")
    ),
    section(
      "flow-types",
      "Automated, instant or scheduled",
      p("When you create a flow without Copilot, Power Automate asks which of three types you want. The type only decides how the flow starts. The actions available after the trigger are the same."),
      table(
        ["Type", "Starts when", "Examples"],
        ["**Automated cloud flow**", "An event happens in a connected service", "A new item in a SharePoint list, an email from a particular person, a form response"],
        ["**Instant cloud flow**", "Someone selects a button", "Send a reminder to the team, start an approval from a SharePoint item, run from a button in a Power Apps app"],
        ["**Scheduled cloud flow**", "A time and a repeat interval", "A daily summary email, a weekly cleanup of old items, a month-end report"]
      ),
      p("If you're not sure, start with an instant flow. You run it yourself, so you can test it as often as you like without waiting for an event or a schedule. It's what the next section builds.")
    ),
    section(
      "build",
      "Build an instant flow that emails you",
      p("This flow asks for a message when you run it and sends that message to your own mailbox. It's small on purpose: it touches every part of the designer you'll use in real flows."),
      ol(
        "Sign in to [Power Automate](https://make.powerautomate.com) with your work account.",
        "In the navigation on the left, select **Create**.",
        "Under **Start from blank**, select **Instant cloud flow**.",
        "Enter a flow name, such as *Send myself a note*, select the trigger **Manually trigger a flow**, and select **Create**. The designer opens with the trigger in place.",
        "Select the trigger, then **Add an input**, choose **Text**, and name the input *Message*. The flow will ask for it each time it runs.",
        "Below the trigger, select **+** (or **+ New step** in the classic designer), search for **Send an email (V2)**, and select it under **Microsoft 365 Outlook**.",
        "In **To**, enter your own email address. In **Subject**, enter *A note from my first flow*.",
        "Select the **Body** box, open the dynamic content list, and pick **Message** from the trigger.",
        "Select **Save**. A message under the title bar confirms the flow is saved."
      ),
      p("The first time you add an action for a service, such as Outlook, Power Automate creates a **connection** that signs in to that service as you. That's why the flow can send mail without asking for a password."),
      note("Microsoft's documentation describes two designers, a new one, which is the default, and the classic designer. The steps are the same in both, but buttons have slightly different names. Copilot, if your organization has it turned on, can build a flow from a sentence, but you'll still need to read and fix the trigger and actions it chooses.")
    ),
    section(
      "test",
      "Test the flow and read the run",
      ol(
        "On the toolbar, select **Test**.",
        "In the **Test flow** pane, select **Manually**, then **Test**.",
        "Enter a message, then select **Run flow**, then **Done**.",
        "Check your inbox for the email."
      ),
      p("Every time a flow runs, Power Automate records it. Open the flow's details page and look at the **run history**: each run shows when it started, how long it took, and whether it succeeded or failed. Select a run to see every step with its inputs and outputs. That's where you'll look whenever a flow doesn't do what you expect."),
      p("A failed step has a red mark and an error message. The [failed flow run guide](/guides/troubleshoot-failed-flow-run) explains how to read the common errors. Microsoft keeps run history for 30 days, and the details page shows the most recent 28 days.")
    ),
    section(
      "connections",
      "Connections and ownership: who the flow runs as",
      p("A flow's actions run with the connections of the person who added them, which for a new flow is you. The email in your test was sent from your mailbox, and a SharePoint action would have your permissions on the list. That has three consequences worth knowing from day one:"),
      ul(
        "**The flow can only do what you can do.** If you can't edit a list, neither can a flow that uses your SharePoint connection.",
        "**Emails and updates appear to come from you.** Use a shared or service account for flows that send mail on behalf of a team.",
        "**If you leave, your connections stop working.** Add a co-owner to any flow other people rely on. The [flow handover guide](/guides/hand-over-power-automate-flows-when-someone-leaves) covers what to change before someone leaves."
      ),
      p("Flows that use standard connectors, such as SharePoint, Outlook and Teams, are usually covered by Microsoft 365 licenses that include Power Automate. Premium connectors, such as HTTP, SQL Server and custom connectors, need a premium Power Automate license.")
    ),
    section(
      "next",
      "Turn it into a real flow",
      p("The instant flow you built has the same shape as useful ones. Change the trigger and the actions, and keep the habits: test, read the run, add a co-owner."),
      table(
        ["To make a flow that", "Start with", "Read next"],
        ["Runs when an item is added to a SharePoint list", "An automated flow with **When an item is created**", "[SharePoint in Power Automate](/guides/power-automate-sharepoint-quick-start)"],
        ["Runs every weekday morning", "A scheduled flow with **Recurrence**", "[Schedule a flow](/guides/power-automate-schedule-flow-recurrence)"],
        ["Asks a manager to approve something", "Any trigger, then **Start and wait for an approval**", "[Approvals in Power Automate](/guides/power-automate-approvals-quick-start)"],
        ["Runs from a button in a Power Apps app", "An instant flow with the **Power Apps (V2)** trigger", "[Call a flow from Power Apps](/guides/call-power-automate-flow-from-power-apps)"]
      )
    ),
    section(
      "mistakes",
      "Mistakes new flow makers make",
      ul(
        "**Testing an automated flow by waiting.** Select Test and create the event yourself, such as adding an item to the list, so the run happens while you watch.",
        "**Leaving the default action names.** Rename actions, such as *Get open requests*, before you write expressions. Expressions use the action's name, and renaming later breaks them.",
        "**Building everything on a personal account.** If other people depend on the flow, plan who owns it and which account its connections use before it goes live.",
        "**Ignoring failed runs.** A flow that fails quietly is worse than no flow. Check the run history after the first few real runs, and whenever someone says the flow didn't do its job."
      )
    )
  ],
  faqs: [
    { question: "What is the difference between an automated, instant and scheduled flow?", answer: "Only the trigger. An automated flow starts when something happens in a connected service, such as a new SharePoint item. An instant flow starts when someone selects a button. A scheduled flow starts at a set time and repeats at an interval. The actions after the trigger work the same in all three." },
    { question: "Is Power Automate free with Microsoft 365?", answer: "Many Microsoft 365 business plans include Power Automate for flows that use standard connectors, such as SharePoint, Outlook and Teams. Flows that use premium connectors, such as HTTP or SQL Server, need a premium Power Automate license." },
    { question: "How do I test a flow in Power Automate?", answer: "Save the flow, select Test, choose Manually and select Test again, then cause the trigger: run the flow for an instant flow, or create the event, such as a new list item, for an automated flow. The run appears in the flow's run history with each step's inputs and outputs." },
    { question: "Who does a Power Automate flow run as?", answer: "Each action runs with the connection it uses, which by default belongs to the person who added the action. An email action sends from that person's mailbox, and a SharePoint action has that person's permissions." },
    { question: "What is the difference between a cloud flow and a desktop flow?", answer: "A cloud flow runs in Microsoft's cloud and works with services through connectors. A desktop flow runs on a Windows computer and automates desktop apps and websites by clicking and typing." }
  ],
  relatedTools: ["power-automate-expression-builder", "trigger-condition-builder"],
  relatedPatterns: [],
  relatedLinks: [
    { href: "/start/flows", label: "Learn Power Automate step by step" },
    { href: "/guides/power-automate-sharepoint-quick-start", label: "SharePoint in Power Automate: a quick start" },
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }
  ],
  sources: [
    automateDoc("overview-cloud", "Overview of cloud flows"),
    automateDoc("create-cloud-flow-without-copilot", "Create your first cloud flow without Copilot"),
    automateDoc("get-started-with-cloud-flows", "Get started with cloud flows: test your cloud flow"),
    automateDoc("triggers-introduction", "Get started with triggers")
  ]
};

export const modelDrivenVsCanvasGuide: Guide = {
  slug: "model-driven-vs-canvas-apps",
  title: "Model-driven vs canvas apps in Power Apps: which one to build",
  shortTitle: "Model-driven vs canvas apps",
  description: "How canvas and model-driven apps differ in data, design, licensing, mobile and offline use, and moving between environments, with a scenario table to help you choose, and how custom pages let you use both in one app.",
  eyebrow: "Power Apps basics",
  keywords: ["model-driven vs canvas app", "canvas app vs model-driven app", "what is a model-driven app", "when to use model-driven app", "Power Apps app types", "model-driven app license"],
  published,
  updated: published,
  quickAnswer: "A canvas app starts from the screen: you place every control and write Power Fx formulas, and it can use SharePoint, Excel, Dataverse and hundreds of other sources. A model-driven app starts from the data: you build Dataverse tables and relationships, add forms, views, charts and dashboards, and Power Apps generates a consistent, responsive interface. Choose canvas for a tailored app on SharePoint or Microsoft 365 data. Choose model-driven for data-heavy processes with many related tables, when every user has a license that includes Dataverse.",
  sections: [
    section(
      "compare",
      "The two app types side by side",
      p("Microsoft's own comparison comes down to one difference: in a canvas app the maker controls the layout, and in a model-driven app the layout mostly follows from the components you add."),
      table(
        ["", "Canvas app", "Model-driven app"],
        ["Where you start", "A blank screen, a template or a data source", "Dataverse tables and their relationships"],
        ["Data sources", "Dataverse plus many others through connectors, such as SharePoint, Excel and SQL Server", "Dataverse only"],
        ["How you build", "Place controls and set their properties with Power Fx formulas", "Add forms, views, charts and dashboards in the app designer, mostly without code"],
        ["Control over the interface", "Full", "Limited, mostly customization of the generated interface"],
        ["Responsive layout", "Only if you design it that way", "Automatic"],
        ["Moving between related records", "Wherever you build it with formulas", "Automatic, when relationships exist"],
        ["Accessibility", "Designed into each app by the maker", "Built in"],
        ["Moving between environments", "Can be complex, because data source connections may need updating", "Simple with solutions"],
        ["Licensing for users", "Microsoft 365 licenses cover standard connectors such as SharePoint; premium sources need a premium license", "A license that includes Dataverse, such as Power Apps Premium"]
      )
    ),
    section(
      "canvas",
      "Canvas apps: you design every screen",
      p("A canvas app is like a slide you can program. You drag galleries, forms, buttons and inputs onto screens, then write formulas such as `Filter(Requests, Status.Value = \"Open\")` to decide what each control shows and does. Microsoft describes canvas apps as able to connect to more than 200 data sources, and you can build them for web, tablet and phone."),
      ul(
        "**Good fit:** a task-focused app with a few screens, such as a request form, an inspection checklist, a booking app or a Teams app for one department.",
        "**Strength:** it works with the data your organization already has, most often a SharePoint list, and many users can run it with their Microsoft 365 license.",
        "**Cost:** you build and maintain every screen, every relationship between records and every responsive layout yourself."
      ),
      p("Most of this site, including the [Power Apps learning path](/start), covers canvas apps. Start with [choosing a data source](/guides/choose-data-source-power-apps) and [building your first canvas app](/guides/build-first-canvas-app-sharepoint-list).")
    ),
    section(
      "model-driven",
      "Model-driven apps: the data decides the interface",
      p("A model-driven app is built on Microsoft Dataverse. You design the data first: tables, columns and the relationships between them. Then you compose the app from components such as forms, views, charts and dashboards, and Power Apps draws the screens. Every model-driven app looks and works much the same way, with navigation on the left, lists of records, and forms that open related records."),
      ul(
        "**Good fit:** data-dense, process-driven apps where people move between related records, such as case management, employee onboarding, asset tracking with many related tables, or a sales process. Dynamics 365 apps such as Sales and Customer Service are built on Dataverse in the same way.",
        "**Strength:** once the data model exists, building is quick. Business rules, business process flows and security roles come from Dataverse, and the app is responsive and accessible without extra work.",
        "**Cost:** you can't create one without Dataverse, so every user needs a license that includes it. You also give up pixel-level control of the layout."
      ),
      note("Dataverse for Teams, the lighter version of Dataverse included with most Teams licenses, supports canvas apps but not model-driven apps. A model-driven app needs a full Dataverse environment.")
    ),
    section(
      "mobile-offline",
      "Mobile and offline",
      p("Both kinds of app run in a browser and in the Power Apps mobile app. Model-driven apps have a built-in mobile offline mode: a maker chooses which Dataverse tables are available offline, the data is downloaded to the device, and changes sync automatically when the device is back online."),
      p("Canvas apps can also work offline, but the maker designs that behaviour, deciding what data to keep on the device and when to send changes. If working without a connection is a core requirement and the data is in Dataverse, that's a strong point in favour of model-driven.")
    ),
    section(
      "choose",
      "Choose by scenario",
      table(
        ["Scenario", "Usually build", "Why"],
        ["A form to submit requests to a SharePoint list", "Canvas", "SharePoint data, a custom layout, Microsoft 365 licensing"],
        ["A tablet app for site inspections with photos", "Canvas", "Camera and a layout designed for one task"],
        ["Case management with customers, cases, notes and tasks", "Model-driven", "Many related tables, views and forms generated for each"],
        ["An internal system that will grow over years, with role-based access", "Model-driven", "Dataverse security roles and solutions for moving between environments"],
        ["A Teams app for one team, on Dataverse for Teams", "Canvas", "Dataverse for Teams doesn't support model-driven apps"],
        ["Users only have Microsoft 365 licenses", "Canvas on SharePoint", "Model-driven apps need a license that includes Dataverse"]
      ),
      p("If two rows fit, ask the licensing question first. It rules out more options than any feature does. The [data source guide](/guides/choose-data-source-power-apps) walks through it.")
    ),
    section(
      "both",
      "Using both: custom pages",
      p("You don't always have to choose. A **custom page** is a canvas-style page, built in Power Apps Studio with controls and Power Fx, that you add to a model-driven app. It suits one screen that needs a custom layout, such as a dashboard or a guided form, inside an app that is otherwise model-driven. Microsoft lists custom pages as generally available, with a few scenarios, such as custom pages in Teams model-driven apps, still in preview."),
      p("Both app types can also share the same Dataverse tables and be packaged together in one solution, so a team can use a model-driven app in the office and a canvas app on phones in the field.")
    )
  ],
  faqs: [
    { question: "What is the difference between a canvas app and a model-driven app?", answer: "In a canvas app the maker designs every screen and writes Power Fx formulas, and the app can use many data sources. In a model-driven app the maker builds Dataverse tables and adds forms, views and dashboards, and Power Apps generates the interface. Model-driven apps work only with Dataverse." },
    { question: "Can a model-driven app use SharePoint data?", answer: "Not as its data source. Model-driven apps are built on Dataverse tables. To work with SharePoint data, build a canvas app, or move the data into Dataverse." },
    { question: "Do model-driven apps need a premium license?", answer: "Model-driven apps always use Dataverse, so every user needs a license that includes Dataverse, such as Power Apps Premium. Microsoft 365 licenses on their own don't cover them." },
    { question: "Should beginners learn canvas or model-driven apps first?", answer: "Most makers start with canvas apps, because they work with SharePoint lists and Microsoft 365 licenses. Learn model-driven apps when you work with Dataverse and need many related tables, forms and views." },
    { question: "Can I put a canvas app inside a model-driven app?", answer: "Yes. A custom page is a canvas-style page built with controls and Power Fx that you add to a model-driven app. Microsoft lists custom pages as generally available." }
  ],
  relatedTools: ["dataverse-table-naming-helper"],
  relatedPatterns: [],
  relatedLinks: [
    { href: "/start", label: "Learn Power Apps step by step" },
    { href: "/guides/choose-data-source-power-apps", label: "Choose a data source for your first app" },
    { href: "/guides/build-first-canvas-app-sharepoint-list", label: "Build your first canvas app from a SharePoint list" }
  ],
  sources: [
    learnDoc("power-apps/maker/model-driven-apps/model-driven-app-overview", "What are model-driven apps in Power Apps?"),
    learnDoc("power-apps/maker/", "Overview of creating apps in Power Apps"),
    learnDoc("power-apps/maker/model-driven-apps/model-app-page-overview", "Overview of custom pages for model-driven apps"),
    learnDoc("power-apps/teams/data-platform-compare", "Dataverse for Teams and Dataverse compared"),
    learnDoc("power-apps/mobile/mobile-offline-overview", "Mobile offline for model-driven apps overview"),
    learnDoc("power-platform/admin/pricing-billing-skus", "Licensing overview for Microsoft Power Platform")
  ]
};
