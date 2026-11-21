import { automateDoc, code, learnDoc, note, ol, p, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-20";
const eyebrow = "Power Automate connectors";

export const oneDriveQuickStartGuide: Guide = {
  slug: "power-automate-onedrive-quick-start",
  title: "OneDrive for Business in Power Automate: file triggers, create and convert files, and share links",
  shortTitle: "OneDrive connector quick start",
  description: "How to start a flow from a OneDrive file, create, read, move and convert files, make a share link, pick the right OneDrive connector, and decide when a file belongs in SharePoint, with one complete flow.",
  eyebrow,
  keywords: ["Power Automate OneDrive tutorial", "OneDrive for Business connector", "Power Automate convert file to PDF", "when a file is created OneDrive", "Power Automate create file OneDrive"],
  published,
  updated: published,
  quickAnswer: "Use the OneDrive for Business connector with a work or school account. The connector named OneDrive is for personal Microsoft accounts and rejects a work sign-in. Start a flow with When a file is created (properties only), which gives you the file's name and identifier, then pass the identifier to actions such as Get file content, Convert file and Move or rename a file. The connection reads and writes the OneDrive of the person who signed in, so team processes are safer in a SharePoint library.",
  sections: [
    section(
      "which-connector",
      "Pick the right connector first",
      p("Two connectors have almost the same name, and choosing the wrong one is the most common first problem."),
      table(
        ["Connector", "Account it accepts", "Where the files live"],
        ["OneDrive for Business", "A work or school account", "The OneDrive that comes with Microsoft 365"],
        ["OneDrive", "A personal Microsoft account, such as an outlook.com address", "Personal OneDrive"]
      ),
      p("If you sign in to the personal connector with a work account, the sign-in window answers **Sorry, we can't sign you in here with your account**. The [error page for that message](/errors/sorry-we-cant-sign-you-in-here-with-your-account-onedrive) shows how to swap the connector without rebuilding the flow."),
      p("Every action runs against one OneDrive: the one that belongs to the account in the connection. A flow cannot browse a colleague's OneDrive through this connector. To work with files that many people share, use the [SharePoint connector](/guides/power-automate-sharepoint-quick-start) and a document library.")
    ),
    section(
      "triggers",
      "Triggers",
      table(
        ["Trigger", "What it gives you"],
        ["When a file is created", "The file's content"],
        ["When a file is created (properties only)", "The file's name, path, identifier and dates, without the content"],
        ["When a file is modified", "The file's content"],
        ["When a file is modified (properties only)", "The file's properties, without the content"],
        ["For a selected file", "Runs when a person picks a file in OneDrive and chooses the flow from the Automate menu"]
      ),
      p("**Start with a properties only trigger.** It hands you the file's name and identifier as plain dynamic content, and you fetch the content in a later step only when the flow needs it. The triggers that return content give you the bytes of the file and little else, so the name has to be dug out of the trigger's headers."),
      p("Each trigger watches one **Folder**. Open the trigger's advanced parameters and set **Include subfolders** to **Yes** if files arrive in folders below it."),
      note("A flow that creates or changes a file in the folder it watches starts itself again. Write results to a different folder, outside the watched one. The [infinite loop pattern](/patterns/power-automate-avoid-infinite-update-loop) shows other ways to break the cycle.")
    ),
    section(
      "actions",
      "Actions worth knowing",
      table(
        ["Action", "What it does"],
        ["Create file", "Creates a file from a folder path, a file name and content"],
        ["Get file content", "Reads a file by its identifier"],
        ["Get file content using path", "Reads a file by its path, such as `/Reports/May.xlsx`"],
        ["Get file metadata", "Returns the name, path, size and dates of a file"],
        ["List files in folder", "Lists the files and folders directly inside a folder"],
        ["Find files in folder", "Searches a folder for files by name"],
        ["Update file", "Replaces the content of a file"],
        ["Copy file", "Copies a file to another path in the same OneDrive"],
        ["Move or rename a file", "Moves a file, renames it, or both"],
        ["Delete file", "Sends a file to the recycle bin"],
        ["Convert file", "Returns the file in another format, most often PDF"],
        ["Create share link", "Creates a link that other people can open"]
      )
    ),
    section(
      "id-or-path",
      "Identifier or path",
      p("Actions find a file in one of two ways. The plain actions take a **File** identifier, which is a long string that OneDrive assigns. The actions whose names end in **using path** take a path that you can type."),
      ul(
        "Use the **identifier** when an earlier step returned the file. It still works after the file is renamed or moved.",
        "Use the **path** when the file always has the same name and place, such as a template or a log file."
      ),
      p("The identifier is the item named **Id** or **File identifier** in dynamic content. Do not put a file name in a File box: the designer accepts it and the run fails with a not found error."),
      code(`/Reports/@{formatDateTime(utcNow(), 'yyyy-MM')}/summary.csv`, "File Path"),
      p("A path starts with a forward slash at the root of the OneDrive. It does not include the site address or the word Documents.")
    ),
    section(
      "create-files",
      "Create and update files",
      p("**Create file** needs a **Folder Path**, a **File Name** with its extension, and **File Content**. If the folder path does not exist, the action creates the folders for you."),
      p("Create file fails when a file with that name is already there. Two designs avoid the clash."),
      ul(
        "Put something unique in the name, such as a timestamp or a record ID.",
        "Check for the file first, then choose **Update file** when it exists and **Create file** when it does not."
      ),
      code(`concat('Order-', triggerBody()?['ID'], '-', formatDateTime(utcNow(), 'yyyyMMdd-HHmmss'), '.pdf')`, "File Name"),
      tool("date-format-tester", "Check the date format string before you put it in a file name."),
      p("Characters such as `/`, `\\`, `:`, `*`, `?`, `\"`, `<`, `>` and `|` are not allowed in a file name. When the name comes from a list title or an email subject, strip them first. A slash in a title is read as a folder, so the file lands somewhere you did not expect.")
    ),
    section(
      "worked-flow",
      "A complete flow: turn a Word file into a PDF and email it",
      p("A folder named Quotes receives Word documents. The flow saves a PDF copy in a second folder and emails it to you."),
      ol(
        "Create an **Automated cloud flow** with the trigger **When a file is created (properties only)** from OneDrive for Business. Set **Folder** to `/Quotes`.",
        "Add a **Condition** that checks that **Name** ends with `.docx`, so that other file types are left alone.",
        "In the **True** branch, add **Convert file**. Set **File** to the trigger's **Id** and **Target type** to **PDF**.",
        "Add **Create file**. Set **Folder Path** to `/Quotes PDF`, set **File Name** to the expression below, and set **File Content** to the **File content** from Convert file.",
        "Add **Send an email (V2)** from Office 365 Outlook. Under **Attachments**, set the name to the same expression and the content to the **File content** from Convert file.",
        "Save, then drop a Word file into the Quotes folder to test."
      ),
      code(`replace(triggerOutputs()?['body/Name'], '.docx', '.pdf')`, "Expression"),
      p("The PDF goes to a different folder on purpose. If it were saved into Quotes, the trigger would start a second run for the PDF, and the Condition would be the only thing stopping it."),
      p("To fill a Word template with data before converting it, see the [Word template to PDF pattern](/patterns/populate-word-template-convert-pdf-power-automate).")
    ),
    section(
      "share-links",
      "Share links",
      p("**Create share link** returns a web address for a file. It has two settings that matter."),
      table(
        ["Setting", "Choices"],
        ["Link type", "View or Edit"],
        ["Link scope", "Anonymous, for anyone who has the link, or Organization, for signed-in people in your tenant"]
      ),
      p("Choose **Organization** unless the file really is meant for the public. Many tenants switch off anonymous links, and the action then fails for that scope. The link is the item named **Web URL** in dynamic content."),
      p("A share link from a personal OneDrive stops working when the owner's account is removed. For links that must last, store the file in SharePoint.")
    ),
    section(
      "onedrive-or-sharepoint",
      "OneDrive or SharePoint",
      p("A OneDrive belongs to one person. That makes it a good place for a flow that serves that person, and a risky place for a process a team depends on."),
      table(
        ["Use OneDrive for Business when", "Use a SharePoint library when"],
        ["The flow is personal, such as filing your own attachments", "Several people add or read the files"],
        ["The files are working copies or temporary files", "The files are records that must outlive any one employee"],
        ["You need Convert file for a quick PDF", "You need columns, views, versions or approval on the files"]
      ),
      p("When the owner leaves the organisation, their account is disabled and their OneDrive is later deleted. Every flow on that connection stops with a [connection error](/errors/user-account-is-disabled-power-automate-connection). Flows that matter should use a library and a connection that is not tied to one employee.")
    ),
    section(
      "limits",
      "Limits to know",
      ul(
        "The connector reference says that the file triggers skip files larger than 50 MB.",
        "A single action can carry up to 100 MB. Larger content needs chunking, which is a setting on the action where the connector supports it.",
        "Files that are still syncing or are open for editing can be locked for a short time. A retry a minute later usually succeeds.",
        "The triggers check for new files on a schedule, so a run can start a few minutes after the file arrives."
      ),
      p("The [limits reference](/guides/power-automate-limits) lists the flow-level limits, and the [file is locked page](/errors/file-is-locked-for-shared-use-power-automate) covers lock errors.")
    ),
    section(
      "mistakes",
      "Three mistakes to avoid on day one",
      ul(
        "**Building a team process on your own OneDrive.** It works until you change roles or leave, and then it stops for everyone.",
        "**Saving output into the watched folder.** The flow triggers itself, and each run creates another file.",
        "**Passing a file name where an identifier is needed.** Use the **Id** from the trigger or from Get file metadata using path."
      )
    )
  ],
  faqs: [
    {
      question: "What is the difference between the OneDrive and OneDrive for Business connectors?",
      answer: "OneDrive for Business works with a work or school account and the OneDrive that comes with Microsoft 365. The connector named OneDrive works with personal Microsoft accounts. A work account cannot sign in to the personal connector."
    },
    {
      question: "How do I convert a Word document to PDF in Power Automate?",
      answer: "Store the document in OneDrive for Business, add the Convert file action, set File to the file's identifier and Target type to PDF. The action returns the PDF as file content, which you can save with Create file or attach to an email."
    },
    {
      question: "Why does my OneDrive flow keep triggering itself?",
      answer: "The flow creates or changes a file inside the folder its trigger watches, so each run starts another. Save the output to a folder outside the watched one, or add a condition that ends the run for files the flow created."
    },
    {
      question: "Can a flow read files from another person's OneDrive?",
      answer: "Not with the OneDrive for Business connector. It works only with the OneDrive of the account in the connection. Put shared files in a SharePoint library and use the SharePoint connector."
    },
    {
      question: "Why did my OneDrive trigger not fire for a large file?",
      answer: "Microsoft's connector reference says the OneDrive for Business triggers skip files larger than 50 MB. For large files, run the flow on a schedule and use List files in folder to find new files."
    }
  ],
  relatedTools: ["date-format-tester", "power-automate-expression-builder"],
  relatedPatterns: ["populate-word-template-convert-pdf-power-automate", "power-automate-avoid-infinite-update-loop", "move-copy-sharepoint-files-rename-conflict-power-automate", "save-email-attachments-sharepoint-shared-mailbox-flow"],
  relatedLinks: [
    { href: "/guides/power-automate-sharepoint-quick-start", label: "SharePoint connector quick start" },
    { href: "/errors/sorry-we-cant-sign-you-in-here-with-your-account-onedrive", label: "Error: Sorry, we can't sign you in here with your account" },
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" }
  ],
  sources: [
    learnDoc("connectors/onedriveforbusiness", "OneDrive for Business connector reference"),
    learnDoc("troubleshoot/power-platform/power-automate/authentication-or-sign-in/cannot-sign-in-to-onedrive-connector-when-using-office-365-account-during-flow-creation", "Can't sign in to the OneDrive connector with an Office 365 account"),
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows")
  ]
};

export const plannerQuickStartGuide: Guide = {
  slug: "power-automate-planner-quick-start",
  title: "Planner in Power Automate: create tasks, assign people, set details and report on a plan",
  shortTitle: "Planner connector quick start",
  description: "How to create and update Planner tasks from a flow, why the description and checklist need a second action, how to assign people and set dates, and how to list and filter a plan's tasks, with one complete flow.",
  eyebrow,
  keywords: ["Power Automate Planner tutorial", "Power Automate create Planner task", "Planner task description Power Automate", "Update task details Planner", "List tasks Planner Power Automate"],
  published,
  updated: published,
  quickAnswer: "Use Create a task with a Group Id, a Plan Id and a Title. That action sets the bucket, dates, assignees, labels and priority. The description, checklist and attachments are set by a second action, Update task details, which takes the Id that Create a task returns. The connector has triggers for a new task, a task assigned to you and a completed task, but none for an edited task. List tasks returns every task in a plan with no filter, so narrow the result with a Filter array action.",
  sections: [
    section(
      "what-you-need",
      "What you need before you start",
      ul(
        "A plan that belongs to a **Microsoft 365 group**. Every team in Microsoft Teams has one, and so does every plan created in Planner with a new or existing group.",
        "A connection whose account is a **member of that group**. A flow can only see plans its account can see.",
        "The standard Planner connector, which is included with Microsoft 365 licences."
      ),
      p("Each action asks for a **Group Id** first and then a **Plan Id**. Pick the group from the dropdown and the list of plans fills in. Premium plans that were created in Project are not available through this connector.")
    ),
    section(
      "triggers",
      "Triggers",
      table(
        ["Trigger", "Starts when"],
        ["When a new task is created", "A task is added to the plan you pick"],
        ["When a task is assigned to me", "A task is assigned to the account in the connection"],
        ["When a task is completed", "A task in the plan you pick is marked complete"]
      ),
      p("**There is no trigger for a changed task.** A flow cannot start when someone edits a title, moves a task to another bucket or changes a due date. To react to those changes, run a flow on a schedule, read the tasks with **List tasks** and compare them with what you stored last time."),
      p("The triggers check the plan on a schedule, so a run can start a few minutes after the task changes.")
    ),
    section(
      "actions",
      "Actions worth knowing",
      table(
        ["Action", "What it does"],
        ["Create a task", "Adds a task with a title, bucket, dates, assignees, labels and priority"],
        ["Update a task", "Changes the title, dates, progress, bucket, labels or priority"],
        ["Update task details", "Sets the description, checklist and attached links"],
        ["Get a task", "Reads one task by its Id"],
        ["Get task details", "Reads the description, checklist and links of one task"],
        ["List tasks", "Returns every task in a plan"],
        ["List buckets", "Returns the buckets of a plan with their Ids"],
        ["Create a bucket", "Adds a bucket to a plan"],
        ["Add assignees to a task", "Assigns more people to a task"],
        ["Remove assignees from a task", "Unassigns people from a task"],
        ["Delete a task", "Removes a task"]
      ),
      p("Planner splits a task into two parts. The **task** holds what you see on the board card. The **task details** hold what you see when you open the card. That split is why two actions are needed to create a task with a description.")
    ),
    section(
      "create",
      "Create a task with a description and checklist",
      ol(
        "Add **Create a task**. Pick the **Group Id** and **Plan Id** and enter a **Title**.",
        "Pick a **Bucket Id**. If you leave it empty, the task lands in the plan without a bucket and is easy to miss on the board.",
        "Add **Update task details**. Set **Task Id** to the **Id** from Create a task.",
        "Fill in **Description**. Under **Checklist**, add one item per step with its **Title**, and under **References** add any links with an **Alias** to show as the link text."
      ),
      p("The title is limited to 255 characters. When the title comes from an email subject or a long list title, trim it."),
      code(`take(triggerBody()?['Title'], 255)`, "Title"),
      p("The description is plain text. Line breaks are kept, and formatting such as bold or HTML tags is shown as typed.")
    ),
    section(
      "assign-dates",
      "Assign people and set dates",
      p("**Assigned User Ids** accepts email addresses or user object IDs, separated by semicolons. Each person must be a member of the plan's group, or Planner rejects the assignment."),
      code(`ana@contoso.com;ben@contoso.com`, "Assigned User Ids"),
      p("For a SharePoint Person column, use the item ending in **Email**. For a multi-person column, map the people to their emails with a **Select** action and join the result with semicolons."),
      code(`join(body('Select'), ';')`, "Expression"),
      p("**Start Date Time** and **Due Date Time** are read as UTC. A date sent as midnight can appear as the day before for people west of Greenwich. Send the date with a time in the middle of the day and it shows as the same date in every time zone."),
      code(`formatDateTime(triggerBody()?['DueDate'], 'yyyy-MM-ddT12:00:00Z')`, "Due Date Time"),
      tool("date-format-tester", "Check the date format string before you use it in the flow."),
      p("**Progress** and **Priority** are set in **Update a task**. Progress offers Not started, In progress and Completed. Priority offers Urgent, Important, Medium and Low.")
    ),
    section(
      "list-filter",
      "List and filter tasks",
      p("**List tasks** has no filter box. It returns every task in the plan, finished or not, and you narrow the list in the flow. Each task carries these useful properties."),
      table(
        ["Property", "Meaning"],
        ["title", "The task's title"],
        ["percentComplete", "0 for not started, 50 for in progress, 100 for completed"],
        ["dueDateTime", "The due date in UTC, or empty when no date is set"],
        ["bucketId", "The Id of the bucket, which you match against List buckets"],
        ["priority", "1 for urgent, 3 for important, 5 for medium, 9 for low"],
        ["_assignments", "The people the task is assigned to, as user Ids"]
      ),
      p("Add a **Filter array** action with **value** from List tasks as its input. Switch it to advanced mode to combine conditions."),
      code(`@and(less(item()?['percentComplete'], 100), not(empty(item()?['dueDateTime'])), less(item()?['dueDateTime'], utcNow()))`, "Filter array"),
      p("That filter keeps the tasks that are not complete, have a due date, and are past it. The [filter guide](/guides/filter-query-vs-filter-array-vs-condition) explains when Filter array is the right tool.")
    ),
    section(
      "worked-flow",
      "A complete flow: a weekly email of overdue tasks",
      ol(
        "Create a **Scheduled cloud flow** that runs every Monday at 08:00.",
        "Add **List tasks** and pick the group and plan.",
        "Add **Filter array** with **value** from List tasks, in advanced mode, with the expression from the section above.",
        "Add **Select** with the **Body** of Filter array as its input. Map `Task` to the title and `Due` to the formatted due date, using the expressions below.",
        "Add **Create HTML table** with the output of Select as its input.",
        "Add a **Condition** that checks that the length of the Filter array body is greater than 0, so that no email goes out in a week with nothing overdue.",
        "In the **True** branch, add **Send an email (V2)** and put the **Output** of Create HTML table in the body."
      ),
      code(`item()?['title']`, "Task"),
      code(`formatDateTime(item()?['dueDateTime'], 'dd MMM yyyy')`, "Due"),
      code(`length(body('Filter_array'))`, "Condition"),
      p("To create tasks from list items, see the [Planner task from SharePoint pattern](/patterns/power-automate-create-planner-task-from-sharepoint). To send a reminder to each owner before a due date, see the [reminder pattern](/patterns/power-automate-reminder-before-due-date).")
    ),
    section(
      "mistakes",
      "Three mistakes to avoid on day one",
      ul(
        "**Looking for the description in Create a task.** It is in Update task details, with the checklist and links.",
        "**Assigning someone who is not in the group.** Add the person to the Microsoft 365 group first, or the action fails.",
        "**Typing a bucket's name into Bucket Id.** The box needs the Id. Pick the bucket from the dropdown, or find its Id with List buckets and a Filter array on the name."
      ),
      note("Planner limits how many tasks a plan can hold and how many requests an account can send in a short time. A flow that creates hundreds of tasks in a loop should run the loop one item at a time, and a plan that is used as a log of every request will fill up. Archive finished work to a list instead.")
    )
  ],
  faqs: [
    {
      question: "How do I add a description to a Planner task in Power Automate?",
      answer: "Create the task with Create a task, then add Update task details and pass it the Id of the new task. The Description, Checklist and References boxes are in Update task details."
    },
    {
      question: "Can a flow trigger when a Planner task is updated?",
      answer: "No. The Planner connector has triggers for a new task, a task assigned to you and a completed task. To detect edits, run a scheduled flow that lists the tasks and compares them with stored values."
    },
    {
      question: "How do I assign a Planner task to several people from a flow?",
      answer: "Put their email addresses in Assigned User Ids, separated by semicolons. Each person must be a member of the Microsoft 365 group that owns the plan."
    },
    {
      question: "Why does my Planner due date show one day early?",
      answer: "Planner reads the date as UTC. A value at midnight UTC falls on the previous day for people in time zones behind UTC. Send the date with a midday time, such as 2026-12-01T12:00:00Z."
    },
    {
      question: "How do I get only incomplete Planner tasks in Power Automate?",
      answer: "List tasks returns every task. Add a Filter array action on its value and keep the items where percentComplete is less than 100."
    }
  ],
  relatedTools: ["date-format-tester", "power-automate-expression-builder"],
  relatedPatterns: ["power-automate-create-planner-task-from-sharepoint", "power-automate-reminder-before-due-date", "teams-selected-message-flow-create-task", "filter-array-instead-of-apply-to-each"],
  relatedLinks: [
    { href: "/guides/filter-query-vs-filter-array-vs-condition", label: "Filter Query, Filter array or Condition" },
    { href: "/guides/power-automate-teams-quick-start", label: "Teams connector quick start" },
    { href: "/guides/power-automate-choice-person-lookup-values", label: "Read Choice, Person and Lookup values" }
  ],
  sources: [
    learnDoc("connectors/planner", "Planner connector reference"),
    learnDoc("graph/api/resources/plannertask", "plannerTask resource type in Microsoft Graph"),
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows")
  ]
};
