// The ordered learning path for new Power Apps makers, shown at /start.
// Every href must point to a page that exists on the site.

export type PathLink = {
  href: string;
  label: string;
  kind: "Guide" | "Tool" | "Function" | "Reference" | "Pattern" | "Library";
  note: string;
};

export type PathStep = {
  id: string;
  title: string;
  summary: string;
  learn: string[];
  links: PathLink[];
  checkpoint: string;
};

export const learningPathPath = "/start";

export const learningPath: PathStep[] = [
  {
    id: "data-source",
    title: "Choose where the data lives",
    summary:
      "Every canvas app reads and writes data through a connector, and the choice of source decides your licensing, how large the data can grow and how you secure it. For most first apps in a Microsoft 365 organization, that source is a SharePoint list.",
    learn: [
      "Why SharePoint lists are covered by Microsoft 365 licenses and Dataverse needs a premium license",
      "Why Excel is fine for a prototype but not for data that grows past 500 rows",
      "How to name columns so formulas and flows don't break later"
    ],
    links: [
      { href: "/guides/choose-data-source-power-apps", label: "Choose a data source for your first app", kind: "Guide", note: "SharePoint, Dataverse, Dataverse for Teams and Excel compared" },
      { href: "/tools/sharepoint-internal-name-helper", label: "SharePoint internal name helper", kind: "Tool", note: "See the internal name a column will get before you create it" },
      { href: "/patterns/sharepoint-lookup-vs-choice-design", label: "Choose lookup columns vs choice columns", kind: "Pattern", note: "The column decision new lists get wrong most often" }
    ],
    checkpoint: "You can say which data source your app will use and why, and you have a list or table with a few sample rows in it."
  },
  {
    id: "first-app",
    title: "Build your first canvas app",
    summary:
      "Build a two-screen app by hand: a gallery that lists items and a form that adds and edits them. It's the shape of most business apps, and it introduces the properties you'll use every day, such as Items, Item, DataSource and OnSelect.",
    learn: [
      "How a gallery's Items property and ThisItem show one row per record",
      "How a form's DataSource and Item decide what it shows and where it saves",
      "How Navigate, EditForm, NewForm and SubmitForm connect two screens"
    ],
    links: [
      { href: "/guides/build-first-canvas-app-sharepoint-list", label: "Build your first canvas app from a SharePoint list", kind: "Guide", note: "Six steps from an empty list to a published app" },
      { href: "/functions/navigate", label: "Navigate", kind: "Function", note: "Move between screens" },
      { href: "/functions/submitform", label: "SubmitForm", kind: "Function", note: "Save a form and handle success or failure" },
      { href: "/standards/power-apps-naming-standards", label: "Power Apps naming standards", kind: "Reference", note: "Prefixes for screens, controls and variables" }
    ],
    checkpoint: "Your app lists items from the data source, opens one in a form, and saves a change that you can see in the list."
  },
  {
    id: "power-fx",
    title: "Learn the Power Fx basics",
    summary:
      "Power Fx is the formula language behind every property in a canvas app. It looks like Excel, and much of it works the same way, but formulas belong to controls instead of cells, and variables work differently.",
    learn: [
      "What carries over from Excel formulas and what doesn't",
      "When to use Set, UpdateContext or With for a variable",
      "How If and Switch make decisions, and how to keep long formulas readable"
    ],
    links: [
      { href: "/guides/power-fx-for-excel-users", label: "Power Fx for Excel users", kind: "Guide", note: "What works differently from Excel" },
      { href: "/guides/power-fx-set-vs-updatecontext-vs-with", label: "Set, UpdateContext or With", kind: "Guide", note: "Pick the right kind of variable" },
      { href: "/functions/if", label: "If", kind: "Function", note: "Decisions in a formula" },
      { href: "/guides/power-fx-commas-vs-semicolons", label: "Commas or semicolons", kind: "Guide", note: "Make a copied formula work in your region" },
      { href: "/tools/power-fx-formatter", label: "Power Fx formatter", kind: "Tool", note: "Paste a formula to indent it and check it" }
    ],
    checkpoint: "You can read a formula like If(IsBlank(txtName.Text), \"Required\", \"\") and explain what it does, and you know which variable function to reach for."
  },
  {
    id: "find-data",
    title: "Find and show the right records",
    summary:
      "Most apps need a search box, a few filters and a way to look up one record. This is also where delegation appears: the rule that decides whether your data source filters the whole list or Power Apps only looks at the first 500 rows.",
    learn: [
      "When to use Filter, LookUp or Search",
      "What the delegation warning means and how to write formulas that avoid it",
      "How to add a search box and filters that show everything when they're empty"
    ],
    links: [
      { href: "/guides/power-fx-lookup-vs-filter-vs-search", label: "LookUp, Filter or Search", kind: "Guide", note: "Find one record or many" },
      { href: "/guides/power-apps-delegation-warning-explained", label: "Delegation warnings explained", kind: "Guide", note: "What the warning means and how to clear it" },
      { href: "/guides/power-apps-searchable-filterable-gallery-sharepoint", label: "Searchable, filterable gallery on SharePoint", kind: "Guide", note: "Search, status, my items and date range in one formula" },
      { href: "/tools/power-apps-delegation-checker", label: "Delegation checker", kind: "Tool", note: "Paste a formula to see which parts can't be delegated" },
      { href: "/tools/gallery-search-filter-builder", label: "Gallery search and filter builder", kind: "Tool", note: "Generate the gallery's Items formula" }
    ],
    checkpoint: "Your gallery has a working search box and at least one filter, with no delegation warning on its Items formula."
  },
  {
    id: "save-data",
    title: "Save data, and handle errors",
    summary:
      "Forms are the quickest way to save, but many screens need Patch to save values from individual controls or to update several records. Saves can fail, so the next skill is telling users what went wrong instead of failing silently.",
    learn: [
      "When to use Patch, SubmitForm or Collect",
      "How to write choice, person and lookup columns back to SharePoint",
      "How to catch and report a failed save with IfError"
    ],
    links: [
      { href: "/guides/power-apps-patch-vs-submitform-vs-collect", label: "Patch, SubmitForm or Collect", kind: "Guide", note: "Three ways to save, and when each fits" },
      { href: "/functions/patch", label: "Patch", kind: "Function", note: "Create and update records" },
      { href: "/tools/patch-formula-builder", label: "Patch formula builder", kind: "Tool", note: "Generate a Patch for each SharePoint column type" },
      { href: "/guides/power-fx-iferror-and-app-onerror", label: "Error handling with IfError and App.OnError", kind: "Guide", note: "Show users a useful message when a save fails" }
    ],
    checkpoint: "Your app saves a new record with Patch, writes a choice column correctly, and shows a message if the save fails."
  },
  {
    id: "flows",
    title: "Add automation with Power Automate",
    summary:
      "Some work belongs outside the app: sending an email, starting an approval, or running something on a schedule. A Power Automate flow can start from a button in your app, or from a change to the SharePoint list itself.",
    learn: [
      "How to call a flow from Power Apps and use the values it sends back",
      "How SharePoint triggers and actions work in a flow",
      "How to read a failed run and find the step that broke"
    ],
    links: [
      { href: "/guides/call-power-automate-flow-from-power-apps", label: "Call a flow from Power Apps", kind: "Guide", note: "Pass values in and get values back" },
      { href: "/guides/power-automate-sharepoint-quick-start", label: "SharePoint in Power Automate", kind: "Guide", note: "One complete flow on a list" },
      { href: "/guides/power-automate-approvals-quick-start", label: "Approvals in Power Automate", kind: "Guide", note: "Send a request for approval and read the outcome" },
      { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run", kind: "Guide", note: "Read the run history" }
    ],
    checkpoint: "A button in your app runs a flow that sends an email or starts an approval, and you can find the run in the flow's history."
  },
  {
    id: "ship",
    title: "Fix, tidy and share your app",
    summary:
      "Before other people rely on the app, clear the errors, make it open quickly, and share both the app and its data. Sharing the app alone isn't enough: every user needs access to the data source too.",
    learn: [
      "How to read the formula errors makers hit most",
      "How to make an app open faster",
      "How to share an app and its data, and publish updates safely"
    ],
    links: [
      { href: "/guides/fix-common-power-fx-formula-errors", label: "Fix common Power Fx formula errors", kind: "Guide", note: "The errors makers hit most" },
      { href: "/errors", label: "Error library", kind: "Library", note: "Look up a specific error message" },
      { href: "/guides/power-apps-faster-app-start-concurrent-onstart", label: "Make an app open faster", kind: "Guide", note: "Concurrent, named formulas and less App.OnStart" },
      { href: "/guides/share-power-apps-canvas-app", label: "Share a canvas app", kind: "Guide", note: "Users, co-owners, data access and licenses" },
      { href: "/tools/power-apps-naming-linter", label: "Naming convention checker", kind: "Tool", note: "Check names before you hand the app over" }
    ],
    checkpoint: "Your app has no formula errors, it's shared with its users and a co-owner, and someone else has used it successfully."
  }
];

export const learningPathFaqs = [
  {
    question: "How long does it take to learn Power Apps?",
    answer: "It depends on how much time you spend building. The steps are ordered so each one uses what the previous one taught, and each ends with a checkpoint you can test in your own app. Skills such as delegation and error handling keep growing as your apps and data get bigger."
  },
  {
    question: "Do I need to know how to code to use Power Apps?",
    answer: "No. Canvas apps use Power Fx, a formula language similar to Excel formulas. If you can write an Excel formula such as =IF(A1>10, \"High\", \"Low\"), you can learn Power Fx."
  },
  {
    question: "What license do I need to learn Power Apps?",
    answer: "Many Microsoft 365 work accounts can already build apps on SharePoint and other standard connectors. To practise with Dataverse and premium features, Microsoft offers a free Power Apps Developer Plan."
  },
  {
    question: "Should I learn canvas apps or model-driven apps first?",
    answer: "Most makers start with canvas apps, because they work with SharePoint lists and give full control over the screens. Model-driven apps are built on Dataverse tables and suit data-heavy business systems. This path covers canvas apps."
  }
];
