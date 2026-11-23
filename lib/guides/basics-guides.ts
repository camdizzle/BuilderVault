import { canvasDoc, code, learnDoc, note, ol, p, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-22";

export const chooseDataSourceGuide: Guide = {
  slug: "choose-data-source-power-apps",
  title: "Choose a data source for your first Power Apps app: SharePoint, Dataverse or Excel",
  shortTitle: "Choose a data source",
  description: "Where to keep the data behind a canvas app, compared on licensing, list size, security and how well each source works with Power Fx, so you pick once and don't have to move the data later.",
  eyebrow: "Power Apps basics",
  keywords: ["Power Apps data source", "SharePoint vs Dataverse Power Apps", "Power Apps Excel data source", "Dataverse for Teams vs Dataverse", "Power Apps premium license Dataverse", "best data source for Power Apps"],
  published,
  updated: published,
  quickAnswer: "If your organization has Microsoft 365 and the app is a simple list of records, use a SharePoint list: it's covered by Microsoft 365 licenses and SharePoint can filter and sort large lists for the app. Choose Dataverse when you need related tables, row-level security or advanced search, and every user has a premium Power Apps license. Use Dataverse for Teams if the app only needs to run inside one team in Microsoft Teams. Keep Excel for prototypes and small reference tables, because Microsoft's list of sources that support delegation doesn't include it.",
  sections: [
    section(
      "why-it-matters",
      "Why the first choice matters",
      p("A canvas app reads and writes data through a connector. The app's screens and controls can move to a new source later, but every formula that names a column, every Patch and every filter has to be checked again when the data moves. Picking a source that fits the app's size, security and licensing saves that rework."),
      p("Three questions settle most cases: what licenses your users already have, how many rows the data will grow to, and who is allowed to see which rows.")
    ),
    section(
      "compare",
      "The options side by side",
      table(
        ["", "SharePoint list", "Dataverse", "Dataverse for Teams", "Excel in OneDrive"],
        ["License for app users", "Covered by Microsoft 365 use rights", "Premium Power Apps license, such as Power Apps Premium", "Included in most Teams licenses", "Covered by Microsoft 365 use rights"],
        ["Large data", "Yes, when formulas are delegable", "Yes, with the widest delegation support", "Up to 1 million rows and 2 GB per team", "No delegation, so formulas see the first 500 rows, or up to 10,000"],
        ["Related tables", "Lookup columns, with limits", "Relationships between tables", "Relationships between tables", "No"],
        ["Security", "List and item permissions", "Security roles, down to individual rows", "Team membership", "Whoever can open the file"],
        ["Where the app runs", "Browser, mobile, Teams", "Browser, mobile, Teams", "Inside Teams", "Browser, mobile, Teams"]
      ),
      p("The license row is the one that most often decides it. Microsoft 365 licenses include Power Apps use rights for apps built on Microsoft 365 data and standard connectors, such as SharePoint and Excel. They don't cover standalone apps that use Dataverse or premium connectors such as SQL Server. Check with whoever manages licenses in your organization before you build on a premium source.")
    ),
    section(
      "sharepoint",
      "SharePoint lists: the usual first choice",
      p("Most organizations that use Microsoft 365 already have SharePoint, and makers can create a list without asking an admin. SharePoint can run `Filter`, `Sort`, `LookUp` and comparisons such as `=`, `<` and `>` on the server, so a gallery can cover a list of many thousands of items, as long as the formula sticks to what SharePoint supports."),
      ul(
        "**Good fit:** request trackers, inventories, booking lists, checklists, anything that looks like one table with a few lookups.",
        "**Watch out for:** `Search` and the `in` operator, which SharePoint can't run on the server. Use `StartsWith` instead. The [delegation warning guide](/guides/power-apps-delegation-warning-explained) explains what changes past 500 items.",
        "**Plan the columns first:** a column's internal name is fixed when you create it, and formulas and flows use it. Name columns without spaces or symbols when you first add them."
      ),
      tool("sharepoint-internal-name-helper", "Check what internal name SharePoint will give a column before you create it.")
    ),
    section(
      "dataverse",
      "Dataverse: when the app outgrows a list",
      p("Dataverse is the database built into Power Platform. Tables have typed columns, real relationships, business rules and role-based security that can limit each user to their own rows. It supports more delegable functions than SharePoint, including `Search` and the `in` operator on columns of the table you're querying."),
      ul(
        "**Good fit:** apps with several related tables, data that only some users may see, model-driven apps, or anything that will grow into a business system.",
        "**Licensing:** every user of a standalone app that uses Dataverse needs a premium license. If you only want to learn, the free Power Apps Developer Plan gives you an environment with Dataverse to practise in.",
        "**Dataverse for Teams** is a lighter version that lives inside one team. It's included in most Teams licenses and holds up to 1 million rows and 2 GB per team. Apps built on it run inside Teams, and the environment can be upgraded to full Dataverse later."
      ),
      tool("dataverse-table-naming-helper", "Generate consistent display, schema and logical names for a new Dataverse table.")
    ),
    section(
      "excel",
      "Excel: good for trying ideas, risky for real use",
      p("An Excel file in OneDrive or another cloud store works as a data source if the data is formatted as a table. It's the quickest way to turn an existing spreadsheet into an app you can click through."),
      ul(
        "Excel isn't on Microsoft's list of data sources that support delegation, so a query works on only the first 500 rows by default, and never more than 10,000.",
        "Calculated columns in the table can't be used in the app.",
        "Every app user needs access to the file itself. In OneDrive for Business, share the file, not the folder.",
        "For a small table that never changes, such as a list of office locations, you can import the workbook as static data instead. It's then stored in the app and needs no connection."
      ),
      note("If the spreadsheet is the real system today, move the data to a SharePoint list before you build. The [Power Fx for Excel users guide](/guides/power-fx-for-excel-users) covers the formula differences you'll meet next.")
    ),
    section(
      "decide",
      "Decide in four questions",
      ol(
        "Do all your users have a premium Power Apps license, or will the organization buy them? If not, rule out Dataverse and SQL Server and pick SharePoint, or Dataverse for Teams for a Teams-only app.",
        "Will the data pass 500 rows? If yes, rule out Excel.",
        "Do some users need to be stopped from seeing some rows? If yes, Dataverse security roles do this properly. In SharePoint, item-level permissions are harder to manage at scale.",
        "Does the data have several tables that point at each other, such as orders, order lines and products? Dataverse relationships handle that better than SharePoint lookup columns."
      ),
      p("For a first app, a SharePoint list with five or six columns is the right place to start. The next step in the [learning path](/start) builds an app on one.")
    )
  ],
  faqs: [
    { question: "Is SharePoint or Dataverse better for Power Apps?", answer: "SharePoint is the better start when users only have Microsoft 365 licenses and the data is one main table. Dataverse is better for related tables, row-level security and large, complex apps, but every user of a standalone Dataverse app needs a premium Power Apps license." },
    { question: "Do I need a premium license to use Dataverse in Power Apps?", answer: "For a standalone canvas app, yes. Microsoft 365 licenses cover apps that use Microsoft 365 data and standard connectors. Dataverse for Teams is the exception: it is included in most Teams licenses, but its apps run inside Teams." },
    { question: "Can I use Excel as a data source for Power Apps?", answer: "Yes, if the data is formatted as a table and stored in a cloud service such as OneDrive. Excel doesn't support delegation, so formulas only see the first 500 rows by default, up to a maximum of 10,000. It suits prototypes and small reference tables." },
    { question: "Can I move my app from SharePoint to Dataverse later?", answer: "Yes. You add the Dataverse table as a new data source and update the formulas that use the old list. Column names and types often differ, so plan time to retest every screen." },
    { question: "How many items can a SharePoint list have for Power Apps?", answer: "SharePoint lists can hold far more items than an app will usually need. The limit that matters is delegation: if a formula is delegable, SharePoint filters the whole list; if not, Power Apps only works on the first 500 items, or up to 10,000 if you raise the data row limit." }
  ],
  relatedTools: ["sharepoint-internal-name-helper", "dataverse-table-naming-helper"],
  relatedPatterns: ["sharepoint-lookup-vs-choice-design", "sharepoint-internal-name-safe-column-design", "sharepoint-calculated-column-vs-power-apps-formula", "sharepoint-list-view-threshold-5000-items"],
  relatedLinks: [
    { href: "/start", label: "Learn Power Apps step by step" },
    { href: "/guides/build-first-canvas-app-sharepoint-list", label: "Build your first canvas app from a SharePoint list" },
    { href: "/guides/power-apps-delegation-warning-explained", label: "Power Apps delegation warning explained" }
  ],
  sources: [
    learnDoc("power-platform/admin/pricing-billing-skus", "Licensing overview for Microsoft Power Platform"),
    canvasDoc("delegation-overview", "Understand delegation in a canvas app"),
    canvasDoc("connections/cloud-storage-blob-connections", "Connect to cloud storage from Power Apps: Excel known limitations"),
    learnDoc("power-apps/maker/data-platform/data-platform-intro", "What is Microsoft Dataverse?"),
    learnDoc("power-apps/teams/overview-data-platform", "Dataverse for Teams overview"),
    canvasDoc("connections-list", "Overview of canvas app connectors")
  ]
};

export const firstCanvasAppGuide: Guide = {
  slug: "build-first-canvas-app-sharepoint-list",
  title: "Build your first canvas app from a SharePoint list",
  shortTitle: "Build your first canvas app",
  description: "Make a two-screen Power Apps app on a SharePoint list from a blank canvas: a gallery of items, a form to add and edit them, and the handful of formulas that connect the two.",
  eyebrow: "Power Apps basics",
  keywords: ["build first Power Apps app", "Power Apps SharePoint list app", "Power Apps tutorial for beginners", "Power Apps gallery and form", "canvas app from blank SharePoint", "Power Apps SubmitForm Navigate"],
  published,
  updated: published,
  quickAnswer: "Create a SharePoint list, create a blank canvas app, and add the list as a data source. On the first screen, add a vertical gallery with Items set to the list. On a second screen, add an edit form with DataSource set to the list and Item set to the gallery's Selected record. Make the gallery open the form with EditForm and Navigate, give the second screen a Save button that runs SubmitForm, and set the form's OnSuccess to Back(). Preview, save and publish.",
  sections: [
    section(
      "what-you-build",
      "What you'll build",
      p("A small request tracker with two screens. The first lists every request and has a button for a new one. The second shows one request in a form the user can edit and save. That's the shape of most business apps, and building it by hand teaches the pieces that Power Apps otherwise generates for you."),
      table(
        ["Screen", "Controls", "Job"],
        ["`scrRequests`", "Gallery `galRequests`, button `btnNew`", "List the requests and open one"],
        ["`scrRequest`", "Edit form `frmRequest`, buttons `btnSave` and `btnCancel`", "Add or edit one request"]
      ),
      note("Power Apps can also build an app for you from a list, from the Power Apps home page or from the list's Integrate menu in SharePoint. The generated layout depends on the template your environment offers. Building it yourself once makes the generated version much easier to read and change.")
    ),
    section(
      "list",
      "Step 1: Create the SharePoint list",
      p("In a SharePoint site you can edit, create a list named **Requests** with these columns. Name each column without spaces when you create it, then rename the display name if you want spaces. The first name becomes the internal name that formulas and flows use, and it can't be changed later."),
      table(
        ["Column", "Type", "Notes"],
        ["Title", "Single line of text", "Every list has it already. Use it for the request summary"],
        ["Status", "Choice", "New, In progress, Done"],
        ["DueDate", "Date and time", "Date only"],
        ["Details", "Multiple lines of text", "Plain text"]
      ),
      p("Add three or four sample items so the app has something to show.")
    ),
    section(
      "app",
      "Step 2: Create a blank app and add the list",
      ol(
        "Sign in to Power Apps and create a blank canvas app. Give it a name your users will recognise, such as Request tracker.",
        "In the **Data** pane, select **Add data**, choose the **SharePoint** connector, pick your site and tick the **Requests** list.",
        "Rename the first screen to `scrRequests`, then add a second blank screen and rename it `scrRequest`. Short prefixes like `scr`, `gal` and `frm` make formulas easier to read later."
      ),
      tool("power-apps-naming-linter", "Paste your control and variable names to check them against a common naming convention.")
    ),
    section(
      "gallery",
      "Step 3: List the requests in a gallery",
      p("On `scrRequests`, insert a vertical gallery and name it `galRequests`. Set its **Items** property to the list, sorted so the soonest due date is first:"),
      code(`Sort(Requests, DueDate, SortOrder.Ascending)`),
      p("Inside the gallery, select the first label and set its **Text** to `ThisItem.Title`. Set a second label to show the status and due date. `ThisItem` is the record for that row, so each row shows its own values:"),
      code(`ThisItem.Status.Value & " · due " & Text(ThisItem.DueDate, "dd mmm yyyy")`),
      p("A choice column holds a record, so the text is in `.Value`. SharePoint can sort a date column on the server, so this gallery still works when the list grows past 500 items. The [Text function guide](/guides/power-fx-text-function-format-dates-numbers-currency) covers other date formats.")
    ),
    section(
      "form",
      "Step 4: Add the form",
      p("On `scrRequest`, insert an **Edit form** and name it `frmRequest`. Set two properties:"),
      table(
        ["Property", "Value", "What it does"],
        ["**DataSource**", "`Requests`", "Which list the form saves to"],
        ["**Item**", "`galRequests.Selected`", "Which item the form shows: the one the user picked in the gallery"]
      ),
      p("Open **Edit fields** and make sure Title, Status, DueDate and Details are in the form. Power Apps picks a suitable control for each column type, such as a date picker for DueDate and a drop-down or combo box for Status.")
    ),
    section(
      "connect",
      "Step 5: Connect the screens",
      p("Now add the formulas that move the user between screens and put the form in the right mode."),
      table(
        ["Control", "Property", "Formula"],
        ["`galRequests`", "**OnSelect**", "`EditForm(frmRequest); Navigate(scrRequest)`"],
        ["`btnNew`", "**OnSelect**", "`NewForm(frmRequest); Navigate(scrRequest)`"],
        ["`btnSave`", "**OnSelect**", "`SubmitForm(frmRequest)`"],
        ["`frmRequest`", "**OnSuccess**", "`Back()`"],
        ["`btnCancel`", "**OnSelect**", "`ResetForm(frmRequest); Back()`"]
      ),
      ul(
        "`EditForm` puts the form in edit mode for the selected item. `NewForm` clears it so saving creates a new item.",
        "`SubmitForm` checks the fields and saves them to SharePoint. `OnSuccess` only runs if the save worked, so the user stays on the form if something fails, and the form shows the error.",
        "`ResetForm` throws away unsaved changes before going back.",
        "The semicolon runs one formula after the other. If your region uses commas as the decimal separator, Power Apps shows `;;` instead. The [commas and semicolons guide](/guides/power-fx-commas-vs-semicolons) explains why."
      )
    ),
    section(
      "test",
      "Step 6: Preview, save and publish",
      ol(
        "Press **F5**, or select the play button, to preview. Open an item, change its status, save, and check the change appears in the SharePoint list. Then add a new request.",
        "Close the preview and select **Save**. Saving keeps your changes for you and other editors, but app users don't see them yet.",
        "Select **Publish**. Publishing makes the saved version live for everyone the app is shared with. Repeat save and publish after every change you want users to see."
      ),
      p("Sharing the app with colleagues, and giving them access to the list, is covered in [share a Power Apps canvas app](/guides/share-power-apps-canvas-app).")
    ),
    section(
      "next",
      "Where to take it next",
      ul(
        "Add a search box and filters above the gallery with the [searchable gallery guide](/guides/power-apps-searchable-filterable-gallery-sharepoint).",
        "Learn when to save with `Patch` instead of a form in [Patch, SubmitForm or Collect](/guides/power-apps-patch-vs-submitform-vs-collect).",
        "Read about every function this app uses in the [function reference](/functions), starting with [Navigate](/functions/navigate) and [SubmitForm](/functions/submitform).",
        "Keep long formulas readable with the [Power Fx formatter](/tools/power-fx-formatter)."
      )
    )
  ],
  faqs: [
    { question: "Should I start a Power Apps app from blank or from data?", answer: "Starting from data is faster and gives you a working app in a minute. Starting from blank once teaches how galleries, forms and navigation fit together, which makes generated apps much easier to change. Many makers do both: build one small app by hand, then generate the next." },
    { question: "Why does my form show no data?", answer: "The form's Item property is probably empty or pointing at the wrong control. Set Item to the gallery's Selected record, such as galRequests.Selected, and make sure DataSource is the same list the gallery uses." },
    { question: "What is the difference between EditForm and NewForm?", answer: "EditForm puts a form in edit mode, showing the record in its Item property. NewForm puts it in new mode with default values, so SubmitForm creates a new record instead of changing one." },
    { question: "Why don't my users see my latest changes?", answer: "Saving only stores your changes. Select Publish to make the saved version live, and ask users to reload the app if they already have it open." },
    { question: "Why does a label show an error when I point it at a choice column?", answer: "A SharePoint choice column holds a record, not text. Show its .Value, for example ThisItem.Status.Value." }
  ],
  relatedTools: ["power-apps-naming-linter", "power-fx-formatter", "sharepoint-internal-name-helper"],
  relatedPatterns: ["build-modal-edit-form", "power-apps-empty-state-gallery", "sharepoint-internal-name-safe-column-design", "patch-sharepoint-choice-field"],
  relatedLinks: [
    { href: "/start", label: "Learn Power Apps step by step" },
    { href: "/guides/choose-data-source-power-apps", label: "Choose a data source" },
    { href: "/guides/share-power-apps-canvas-app", label: "Share a Power Apps canvas app" }
  ],
  sources: [
    canvasDoc("app-from-sharepoint", "Create a canvas app with data from a list"),
    canvasDoc("add-gallery", "Show a list of items in a canvas app"),
    canvasDoc("add-form", "Show, edit, or add a record in a canvas app"),
    canvasDoc("working-with-forms", "Understand canvas app forms"),
    canvasDoc("save-publish-app", "Save and publish canvas apps")
  ]
};

export const shareAppGuide: Guide = {
  slug: "share-power-apps-canvas-app",
  title: "Share a Power Apps canvas app with your team, and the data it uses",
  shortTitle: "Share a canvas app",
  description: "Publish an app, share it with users or co-owners, and give them access to the SharePoint list, Excel file, Dataverse tables and flows behind it, so the app works for them and not only for you.",
  eyebrow: "Power Apps basics",
  keywords: ["share Power Apps app", "Power Apps share with users", "Power Apps co-owner", "Power Apps share SharePoint list permissions", "Power Apps app not working for other users", "publish Power Apps app"],
  published,
  updated: published,
  quickAnswer: "Save and publish the app, then select it in Power Apps, choose Share, and add people or a Microsoft Entra security group as User or Co-owner. Sharing the app doesn't share its data: give the same people access to the SharePoint list, share the Excel file itself, or assign Dataverse security roles in the share panel. Use a security group for more than 100 users, and remember that users need a premium license if the app uses premium connectors or components.",
  sections: [
    section(
      "before",
      "Before you share",
      ul(
        "**Save and publish.** Users only ever run the published version. Every later change needs another save and publish before they see it.",
        "**Name and describe the app.** In the app's settings, give it a clear name and a one-line description. That's what users see in their app list and in the invitation email.",
        "**Test as someone else if you can.** An app that works for you may fail for a user who can't reach the data. A colleague with the same access as your users is the best test."
      )
    ),
    section(
      "share",
      "Share the app",
      ol(
        "Sign in to Power Apps and open **Apps** in the left pane.",
        "Select the app, then select **Share** on the command bar.",
        "Enter the names of people, or a Microsoft Entra security group. Distribution lists can't be used.",
        "Choose **User** for people who will run the app, or **Co-owner** for people who will also edit and share it.",
        "Add a message if you want, then select **Share**."
      ),
      table(
        ["Permission", "Can run", "Can edit and share", "Can delete or change owner"],
        ["User", "Yes", "No", "No"],
        ["Co-owner", "Yes", "Yes", "No"],
        ["Owner (you)", "Yes", "Yes", "Yes"]
      ),
      note("For more than 100 users, share with a security group rather than with each person. Microsoft recommends it to avoid a slow sharing experience, and it means people who join the group get the app automatically.")
    ),
    section(
      "data",
      "Share the data separately",
      p("This is the step people miss. The app is only the screens and formulas. Each user connects to the data with their own account, so they need their own access to every data source."),
      table(
        ["Data source", "What to do"],
        ["SharePoint list", "Give users access to the site or the list in SharePoint: read access for an app that only shows data, edit access if they add or change items"],
        ["Excel file in OneDrive for Business", "Share the file itself, not the folder it's in"],
        ["Dataverse", "Choose security roles for the users in the share panel, which shows the option when the app uses a Dataverse table"],
        ["Flows the app calls", "Users are asked to confirm the connections the flow uses the first time it runs"]
      ),
      p("If a user opens the app and sees empty galleries or errors that you don't see, missing data access is the first thing to check. The [error library](/errors) lists the connection and permission messages users report most.")
    ),
    section(
      "licenses",
      "Licenses for the people you share with",
      p("Apps that only use Microsoft 365 data and standard connectors, such as SharePoint, Excel and Outlook, run on the Power Apps use rights in Microsoft 365 licenses. If the app uses Dataverse, a premium connector such as SQL Server, or premium components such as the map or address input controls, each user needs a premium Power Apps license. In the classic share panel, you can select **Request licenses** to send a request to your admin."),
      p("Not sure which connectors your app uses? The [data source guide](/guides/choose-data-source-power-apps) covers the common ones.")
    ),
    section(
      "updates",
      "Publishing updates after you share",
      ul(
        "Users get the new version the next time they open or refresh the app. People with the app open in a browser see a message asking them to refresh.",
        "Every save creates a version. If an update breaks something, open the app's **Details**, go to **Versions** and restore the last good one.",
        "Add a co-owner before you go on leave or change roles, so someone else can fix the app. For flows, the [flow handover guide](/guides/hand-over-power-automate-flows-when-someone-leaves) covers the same problem."
      )
    ),
    section(
      "checklist",
      "Sharing checklist",
      code(`[ ] App saved and published
[ ] Clear app name and description
[ ] Shared with a security group (or named users)
[ ] Co-owner added
[ ] Users can open the SharePoint list, Excel file or Dataverse tables
[ ] Premium licenses confirmed, if the app uses premium connectors
[ ] Tested by someone with the same access as your users`, "Before you send the link")
    )
  ],
  faqs: [
    { question: "Why can't other people see data in my Power Apps app?", answer: "Sharing an app doesn't share its data. Each user connects with their own account, so they need access to the SharePoint list, the Excel file, or the right Dataverse security role." },
    { question: "What is the difference between a user and a co-owner in Power Apps?", answer: "A user can run the app. A co-owner can also edit and share it, but can't delete it or change its owner." },
    { question: "Can I share a Power Apps app with a distribution list?", answer: "No. Share with people by name or with a Microsoft Entra security group. Microsoft recommends a security group for more than 100 users." },
    { question: "Do users need a license to use my Power Apps app?", answer: "Users need a license that includes Power Apps. Microsoft 365 licenses cover apps that use standard connectors such as SharePoint. Apps that use Dataverse, premium connectors or premium components need a premium Power Apps license for each user." },
    { question: "How do users get the latest version of my app?", answer: "Publish the app after saving. Users get the published version the next time they open or refresh it." }
  ],
  relatedTools: ["error-message-finder", "power-apps-naming-linter"],
  relatedPatterns: ["role-based-button-visibility-sharepoint-security-list", "sharepoint-permissions-request-list-pattern"],
  relatedLinks: [
    { href: "/start", label: "Learn Power Apps step by step" },
    { href: "/guides/build-first-canvas-app-sharepoint-list", label: "Build your first canvas app" },
    { href: "/standards/power-apps-naming-standards", label: "Power Apps naming standards" }
  ],
  sources: [
    canvasDoc("share-app", "Share a canvas app with your organization"),
    canvasDoc("share-app-data", "Share Excel data used by your app"),
    canvasDoc("share-app-resources", "Share canvas app resources"),
    canvasDoc("save-publish-app", "Save and publish canvas apps"),
    learnDoc("power-platform/admin/pricing-billing-skus", "Licensing overview for Microsoft Power Platform")
  ]
};
