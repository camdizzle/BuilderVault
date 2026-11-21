import { automateDoc, code, learnDoc, note, ol, p, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-20";
const eyebrow = "Power Automate connectors";

export const sharePointQuickStartGuide: Guide = {
  slug: "power-automate-sharepoint-quick-start",
  title: "SharePoint in Power Automate: a quick start with one complete flow",
  shortTitle: "SharePoint connector quick start",
  description: "The SharePoint triggers and actions worth knowing, one list flow built step by step, how to stop a flow from triggering itself, and the limits that catch new flows.",
  eyebrow,
  keywords: ["Power Automate SharePoint tutorial", "Power Automate SharePoint list flow", "when an item is created Power Automate", "Update item Power Automate", "SharePoint connector Power Automate"],
  published,
  updated: published,
  quickAnswer: "Start with the trigger When an item is created, pick the site and list, and use the trigger's dynamic content in later steps. Use Get items to read many items with a Filter Query, Get item to read one by ID, and Update item to write back, filling every required column. If the flow updates the item that triggered it, use the created-only trigger or add a trigger condition, or the flow will run in a loop.",
  sections: [
    section(
      "what-for",
      "What the connector does",
      p("The SharePoint connector reads and writes list items, files and folders, and starts flows when they change. It is a standard connector, so it is included with Microsoft 365 licences."),
      p("Every trigger and action begins with two boxes: **Site Address** and **List Name** or **Library Name**. Pick both from the dropdowns when you can. If the site is not listed, choose **Enter custom value** and paste the site URL, up to and including the site name.")
    ),
    section(
      "triggers",
      "Triggers worth knowing",
      table(
        ["Trigger", "Starts when", "Use it for"],
        ["When an item is created", "A new item is added to a list", "Intake, notifications, first-time processing"],
        ["When an item is created or modified", "An item is added or any column changes", "Status changes and syncing, with a trigger condition"],
        ["When a file is created (properties only)", "A file is added to a library", "Document intake"],
        ["When a file is created or modified (properties only)", "A file is added or its columns or content change", "Document review flows"],
        ["For a selected item", "Someone picks the flow from the list's menu", "Actions a person starts by hand"]
      ),
      p("The item triggers check the list on a schedule, so a flow starts a short time after the change and not at the same instant. The delay depends on the owner's licence."),
      p("\"Properties only\" means the trigger returns the file's columns and not its content. Add **Get file content** with the file's **Identifier** when you need the content.")
    ),
    section(
      "actions",
      "Actions worth knowing",
      table(
        ["Action", "What it does"],
        ["Get items", "Reads many items. Takes a Filter Query, Order By and Top Count."],
        ["Get item", "Reads one item when you know its ID."],
        ["Create item", "Adds an item."],
        ["Update item", "Changes an item, identified by its ID."],
        ["Get files (properties only)", "Reads the columns of many files or folders in a library."],
        ["Get file content", "Reads the content of one file."],
        ["Create file", "Saves content as a file in a folder."],
        ["Send an HTTP request to SharePoint", "Calls the SharePoint REST API for anything the other actions cannot do."]
      ),
      p("**Get items** returns an array, even when it finds one item, so any value you pick from it puts your action inside an **Apply to each**. **Get item** returns a single item with no loop. If you already have the ID, always choose Get item.")
    ),
    section(
      "worked-flow",
      "A complete flow: act on new high-priority requests",
      p("The list is called Requests. It has a Title, a Choice column named Priority and a Choice column named Status. When a new item has a Priority of High, the flow sets Status to In review and emails the person who created it."),
      ol(
        "Create an **Automated cloud flow** and choose the trigger **When an item is created**. Pick the site and the Requests list.",
        "Add a **Condition**. On the left, pick **Priority Value** from dynamic content. Choose **is equal to** and type `High` on the right.",
        "Under **If yes**, add **Update item**. Pick the same site and list. In **Id**, pick **ID** from the trigger.",
        "Fill in **Title** with the trigger's **Title**. Update item needs every required column, even the ones you are not changing.",
        "Set **Status Value** to `In review`.",
        "Add **Send an email (V2)** from Office 365 Outlook. In **To**, pick **Created By Email**. Use the trigger's **Title** in the subject and **Link to item** in the body.",
        "Save, then add a test item with Priority set to High."
      ),
      p("Two details in those steps cause most first-day problems."),
      ul(
        "**Pick the Value of a Choice column.** A Choice column appears twice in dynamic content, as **Priority** and **Priority Value**. The first is an object and the second is the text. Conditions and emails need the Value.",
        "**Person columns have parts too.** **Created By** offers Email, DisplayName and Claims. Use **Created By Email** in an email's To box."
      ),
      p("The guide to [Choice, Person and Lookup values](/guides/power-automate-choice-person-lookup-values) covers every column type, including the multi-select ones.")
    ),
    section(
      "loop",
      "Stop the flow from triggering itself",
      p("The flow above is safe, because it starts on created items only and its update does not create an item. Change the trigger to **When an item is created or modified** and the flow's own **Update item** starts the flow again, and again."),
      p("The fix is a **trigger condition**, which is an expression the trigger checks before it starts a run. Open the trigger's **Settings** and add one under **Trigger conditions**."),
      code(`@equals(triggerBody()?['Status']?['Value'], 'New')`, "Trigger condition"),
      p("With that condition the flow starts only while Status is New. Once the flow sets Status to In review, its own update no longer passes the condition."),
      tool("trigger-condition-builder", "Build the condition by picking the column type and the comparison. The builder writes the expression with the right path for Choice, Person and Yes/No columns."),
      p("The [avoid an infinite update loop pattern](/patterns/power-automate-avoid-infinite-update-loop) shows two more ways, and the [trigger conditions guide](/guides/power-automate-trigger-conditions-guide) explains how to test one.")
    ),
    section(
      "reading",
      "Reading many items",
      p("**Get items** with no settings reads the first 100 items of the list. Three boxes control what comes back."),
      ul(
        "**Filter Query** asks SharePoint for matching items only. It uses OData syntax and internal column names.",
        "**Top Count** sets how many items to return.",
        "**Order By** sorts the result, for example `Created desc`."
      ),
      code(`Status eq 'New' and Priority eq 'High'`, "Filter Query"),
      tool("odata-filter-query-builder", "Build a Filter Query for any column type without remembering the syntax."),
      p("Column names in a Filter Query are the **internal** names, which differ from the names on screen when a column was renamed or has spaces. A column shown as Due Date is often `Due_x0020_Date` or `DueDate`. The [internal names guide](/guides/sharepoint-internal-column-names-power-automate) shows how to find them, and the [Filter Query guide](/guides/sharepoint-get-items-filter-query) has the syntax for each column type.")
    ),
    section(
      "files",
      "Files and folders",
      p("Libraries use their own actions. **Create file** takes a **Folder Path**, a **File Name** and **File Content**. The content must be the file itself, such as the **File Content** output of another action or the content of an email attachment."),
      p("Create file fails if a file with that name already exists. Add something unique to the name, such as a date and time."),
      code(`concat(formatDateTime(utcNow(), 'yyyyMMdd-HHmmss'), '-', triggerOutputs()?['body/{FilenameWithExtension}'])`, "Expression"),
      p("To set columns on a new file, follow Create file with **Update file properties** and pass the **ItemId** that Create file returns."),
      p("The patterns for [moving and copying files](/patterns/move-copy-sharepoint-files-rename-conflict-power-automate) and [list attachments](/patterns/attach-sharepoint-list-attachments-email-power-automate) go further.")
    ),
    section(
      "mistakes",
      "Three mistakes to avoid on day one",
      ul(
        "**Filtering after the fact.** A Get items with no Filter Query followed by a Condition in a loop reads the whole list and checks one item at a time. Put the condition in the Filter Query. See [where to filter data](/guides/filter-query-vs-filter-array-vs-condition).",
        "**Leaving a required column empty in Update item.** The action fails or, worse, clears a value. Fill required columns from the trigger or from a Get item.",
        "**Using the display name in a query or expression.** Filter Query, Order By and expressions all need the internal name."
      )
    ),
    section(
      "limits",
      "Limits to know",
      ul(
        "Get items returns 100 items by default. Set **Top Count** up to 5,000, or turn on **Pagination** in the action's settings for more.",
        "A query that has to examine more than 5,000 items fails unless the filtered column is indexed. See [exceeds the list view threshold](/errors/exceeds-list-view-threshold-power-automate).",
        "Heavy flows can be throttled by SharePoint and return a [429 error](/errors/429-rate-limit-exceeded-power-automate).",
        "A SharePoint connection that is not used for 90 days expires and has to be signed in again."
      ),
      p("The [limits reference](/guides/power-automate-limits) lists the flow-level limits that apply on top of these.")
    )
  ],
  faqs: [
    {
      question: "What is the difference between Get item and Get items in Power Automate?",
      answer: "Get item reads one item by its ID and returns a single object. Get items reads many items, optionally filtered, and returns an array, so values taken from it are used inside an Apply to each."
    },
    {
      question: "Why does my SharePoint flow keep triggering itself?",
      answer: "The trigger is When an item is created or modified and the flow updates the same item, which counts as a modification. Add a trigger condition so the flow starts only when a column has a specific value, or use the created-only trigger."
    },
    {
      question: "Why does Get items return only 100 items?",
      answer: "100 is the default page size. Set Top Count to a number up to 5,000, or turn on Pagination in the action's settings and set a threshold to get more."
    },
    {
      question: "How fast does a SharePoint trigger start a flow?",
      answer: "The item and file triggers check the list on a schedule, so there is a short delay between the change and the run. The length of the delay depends on the licence of the flow's owner."
    },
    {
      question: "Why does Update item ask for the Title when I only want to change one column?",
      answer: "Update item needs a value for every required column of the list. Pass the existing value from the trigger or from a Get item action for any column you are not changing."
    }
  ],
  relatedTools: ["odata-filter-query-builder", "trigger-condition-builder", "sharepoint-internal-name-helper", "sharepoint-column-formatting-builder"],
  relatedPatterns: ["power-automate-avoid-infinite-update-loop", "get-more-than-5000-items-power-automate", "send-http-request-to-sharepoint-power-automate", "sharepoint-batch-create-update-items-power-automate"],
  relatedLinks: [
    { href: "/guides/sharepoint-get-items-filter-query", label: "Get items Filter Query by column type" },
    { href: "/guides/power-automate-choice-person-lookup-values", label: "Read Choice, Person and Lookup values" },
    { href: "/errors/column-does-not-exist-deleted-by-another-user", label: "Error: Column does not exist" },
    { href: "/errors/exceeds-list-view-threshold-power-automate", label: "Error: Exceeds the list view threshold" }
  ],
  sources: [
    automateDoc("sharepoint-overview", "Get started with Power Automate and SharePoint"),
    learnDoc("connectors/sharepointonline", "SharePoint connector reference"),
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows"),
    learnDoc("troubleshoot/power-platform/power-automate/connections/troubleshoot-broken-connections", "Troubleshoot broken connections")
  ]
};

export const outlookQuickStartGuide: Guide = {
  slug: "power-automate-outlook-quick-start",
  title: "Outlook in Power Automate: send email, read email and save attachments",
  shortTitle: "Outlook connector quick start",
  description: "How to send formatted email from a flow, send from a shared mailbox, start a flow when email arrives, and save attachments to SharePoint, with one complete flow built step by step.",
  eyebrow,
  keywords: ["Power Automate send email", "Power Automate Outlook tutorial", "Power Automate save email attachments", "send email from shared mailbox Power Automate", "when a new email arrives Power Automate"],
  published,
  updated: published,
  quickAnswer: "Use Send an email (V2) from the Office 365 Outlook connector to send mail as yourself, and Send an email from a shared mailbox (V2) to send from a shared address. To act on incoming mail, use the trigger When a new email arrives (V3) and narrow it with the folder, From and Subject Filter options. To save attachments, turn on Include Attachments in the trigger, loop over the attachments and pass each one's name and content to Create file.",
  sections: [
    section(
      "which",
      "Which Outlook connector to use",
      p("Power Automate has two connectors with Outlook in the name."),
      ul(
        "**Office 365 Outlook** is for work and school mailboxes in Microsoft 365. This guide uses it.",
        "**Outlook.com** is for personal accounts such as outlook.com and hotmail.com."
      ),
      p("The flow sends and reads mail as the person whose connection it uses. An email sent by a flow you built comes from you, unless you send from a shared mailbox.")
    ),
    section(
      "send",
      "Send an email",
      p("**Send an email (V2)** has three required boxes: **To**, **Subject** and **Body**. Separate several addresses with semicolons."),
      p("The Body box is a rich text editor. To write your own HTML, select the code view button, shown as `</>`, and paste the HTML. This is how you send a table or a button."),
      code(`<p>Hello <strong>@{triggerBody()?['Author']?['DisplayName']}</strong>,</p>
<p>Your request <strong>@{triggerBody()?['Title']}</strong> was approved.</p>
<p><a href="@{triggerBody()?['{Link}']}">Open the request</a></p>`, "Email body (HTML)"),
      p("The advanced parameters add **CC**, **BCC**, **Attachments**, **Importance** and **Reply To**. Set Reply To when answers should go to a team address and not to you."),
      p("The patterns for an [HTML table in an email](/patterns/power-automate-email-html-table) and an [HTML button link](/patterns/power-automate-html-email-button-link) have complete bodies to copy.")
    ),
    section(
      "shared",
      "Send from a shared mailbox",
      p("Use **Send an email from a shared mailbox (V2)** and put the shared address in **Original Mailbox Address**. The person who owns the flow's connection must have access to that mailbox in Exchange. The email arrives from the shared address."),
      p("The ordinary Send an email (V2) action also has a **From (Send as)** box. It works only if the connection's owner has Send As or Send on Behalf permission for that address. Without it, the action fails with a permissions error."),
      note("A Microsoft 365 administrator grants mailbox permissions. A new permission can take a while to reach the connector, so wait before deciding it did not work.")
    ),
    section(
      "trigger",
      "Start a flow when an email arrives",
      p("The trigger **When a new email arrives (V3)** watches one folder of your mailbox. Its options decide which emails start a run. Set them tightly, because a trigger that fires on every email uses runs and requests for nothing."),
      table(
        ["Option", "What it does"],
        ["Folder", "The folder to watch. Inbox by default. Subfolders are not included."],
        ["From, To, CC", "Only emails from or to these addresses."],
        ["Subject Filter", "Only emails whose subject contains this text."],
        ["Importance", "Any, High, Normal or Low."],
        ["Only with Attachments", "Skip emails that have no attachments."],
        ["Include Attachments", "Put the attachment content in the trigger's output."]
      ),
      p("For a shared mailbox, use **When a new email arrives in a shared mailbox (V2)**, which adds a box for the mailbox address."),
      p("For rules the options cannot express, such as \"subject starts with\", add a [trigger condition](/guides/power-automate-trigger-conditions-guide)."),
      code(`@startsWith(triggerOutputs()?['body/subject'], 'Invoice')`, "Trigger condition")
    ),
    section(
      "worked-flow",
      "A complete flow: save attachments to SharePoint and reply",
      p("Emails with invoices arrive in a folder named Invoices. The flow saves every attachment to a document library and replies to the sender."),
      ol(
        "Create an **Automated cloud flow** with the trigger **When a new email arrives (V3)**.",
        "Set **Folder** to Invoices, **Only with Attachments** to Yes and **Include Attachments** to Yes.",
        "Add an **Apply to each** and pick **Attachments** from the trigger as its input.",
        "Inside the loop, add the SharePoint action **Create file**. Pick the site and the folder.",
        "Set **File Name** to an expression that puts the time in front of the attachment's name, shown below. This stops two files with the same name from colliding.",
        "Set **File Content** to **Attachments Content** from dynamic content.",
        "After the loop, add **Reply to email (V3)**. Set **Message Id** to the trigger's **Message Id** and write the reply in **Body**."
      ),
      code(`concat(formatDateTime(utcNow(), 'yyyyMMdd-HHmmss'), '-', items('Apply_to_each')?['name'])`, "File Name"),
      p("Pictures in a signature count as attachments. To skip them, add a **Condition** inside the loop that checks the attachment's `isInline` property and saves only when it is false."),
      code(`items('Apply_to_each')?['isInline']`, "Expression"),
      p("The [shared mailbox attachments pattern](/patterns/save-email-attachments-sharepoint-shared-mailbox-flow) builds the same flow for a shared mailbox, with folders by sender.")
    ),
    section(
      "more-actions",
      "Other actions worth knowing",
      table(
        ["Action", "What it does"],
        ["Get emails (V3)", "Reads emails from a folder on a schedule, with the same filters as the trigger."],
        ["Move email (V2)", "Moves a message to another folder, for example Processed."],
        ["Mark as read or unread (V3)", "Changes the read state."],
        ["Flag email (V2)", "Flags a message for follow-up."],
        ["Get Attachment (V2)", "Reads one attachment when you have the message and attachment IDs."],
        ["Create event (V4)", "Adds a calendar event, with attendees if you list them."]
      ),
      p("Moving a processed email out of the watched folder is a simple way to see what the flow has handled and what it missed.")
    ),
    section(
      "mistakes",
      "Three mistakes to avoid on day one",
      ul(
        "**Leaving Include Attachments off.** The trigger then lists the attachments without their content, and Create file saves empty or broken files.",
        "**Triggering on the whole Inbox.** Use a folder with an Outlook rule that moves the right emails into it, or set From and Subject Filter.",
        "**Sending a reply that triggers the flow again.** If the flow replies into a mailbox it also watches, add a Subject Filter or a trigger condition that excludes its own replies."
      )
    ),
    section(
      "limits",
      "Limits to know",
      ul(
        "Exchange Online limits how many emails and recipients one mailbox can send per day and per minute. A flow that sends in a loop reaches these limits quickly. For bulk mail, send one email with many recipients in BCC, or use a mailing service.",
        "One flow message can be 100 MB at most, and email attachments are usually limited to much less by the mailbox's own settings.",
        "If a message is moved or deleted between the trigger and a later action, that action fails with [the specified object was not found in the store](/errors/specified-object-was-not-found-in-the-store)."
      ),
      p("The [limits reference](/guides/power-automate-limits) lists the flow-level limits.")
    )
  ],
  faqs: [
    {
      question: "How do I send an email from a shared mailbox in Power Automate?",
      answer: "Use the action Send an email from a shared mailbox (V2) and enter the shared address in Original Mailbox Address. The owner of the flow's Outlook connection must have access to the shared mailbox."
    },
    {
      question: "How do I save email attachments to SharePoint with Power Automate?",
      answer: "Use the trigger When a new email arrives (V3) with Include Attachments set to Yes. Add an Apply to each over the Attachments output, and inside it use the SharePoint action Create file with the attachment's name and content."
    },
    {
      question: "Why are the saved attachments empty or corrupt?",
      answer: "Include Attachments is set to No in the trigger, so the content was never loaded. Set it to Yes, or add Get Attachment (V2) inside the loop to load each attachment's content."
    },
    {
      question: "How do I send an HTML email from a flow?",
      answer: "In Send an email (V2), switch the Body box to code view with the </> button and paste the HTML. Dynamic content can be inserted anywhere in the HTML."
    },
    {
      question: "Who does the email come from when a flow sends it?",
      answer: "It comes from the account that owns the Office 365 Outlook connection used by the action, which is normally the person who built the flow. Use a shared mailbox action to send from a team address."
    }
  ],
  relatedTools: ["trigger-condition-builder", "power-automate-expression-builder"],
  relatedPatterns: ["save-email-attachments-sharepoint-shared-mailbox-flow", "power-automate-email-html-table", "power-automate-html-email-button-link", "attach-sharepoint-list-attachments-email-power-automate"],
  relatedLinks: [
    { href: "/errors/specified-object-was-not-found-in-the-store", label: "Error: The specified object was not found in the store" },
    { href: "/guides/power-automate-trigger-conditions-guide", label: "Write and test a trigger condition" },
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" }
  ],
  sources: [
    automateDoc("email-overview", "Overview of using Outlook and Power Automate"),
    automateDoc("create-email-flows", "Create flows to manage email"),
    learnDoc("connectors/office365", "Office 365 Outlook connector reference"),
    learnDoc("office365/servicedescriptions/exchange-online-service-description/exchange-online-limits", "Exchange Online limits")
  ]
};

export const teamsQuickStartGuide: Guide = {
  slug: "power-automate-teams-quick-start",
  title: "Microsoft Teams in Power Automate: post messages, mention people and send adaptive cards",
  shortTitle: "Teams connector quick start",
  description: "How to post a message to a channel or chat from a flow, choose between Flow bot and User, mention a person, and post an adaptive card that waits for an answer, with one complete flow.",
  eyebrow,
  keywords: ["Power Automate post message in Teams", "Power Automate Teams adaptive card", "post adaptive card and wait for a response", "Flow bot vs User Teams", "mention user Teams Power Automate"],
  published,
  updated: published,
  quickAnswer: "Use Post message in a chat or channel. Choose who posts in Post as, either Flow bot or User, and where in Post in, either Channel, Chat with Flow bot or Group chat. To mention someone, add Get an @mention token for a user first and insert its token in the message. To ask a question and act on the answer, use Post adaptive card and wait for a response and read the answer from the action's outputs.",
  sections: [
    section(
      "post",
      "Post a message",
      p("**Post message in a chat or channel** is the action for almost every notification. Two choices at the top decide the rest of the form."),
      table(
        ["Post as", "Post in", "Result"],
        ["Flow bot", "Channel", "A message in a channel, shown as coming from Workflows or Power Automate"],
        ["Flow bot", "Chat with Flow bot", "A private message to one person from the bot"],
        ["Flow bot", "Group chat", "A message in an existing group chat, from the bot"],
        ["User", "Channel", "A message in a channel that appears to come from you"],
        ["User", "Group chat", "A message in a chat that appears to come from you"]
      ),
      p("For a channel, pick the **Team** and the **Channel**. For a chat with the bot, enter the **Recipient** as an email address."),
      p("The message box accepts formatted text. Switch to code view to write HTML such as bold text, links and line breaks."),
      p("The [Flow bot or User pattern](/patterns/teams-post-as-flow-bot-user-choose) compares the two in detail.")
    ),
    section(
      "bot-or-user",
      "Flow bot or User",
      ul(
        "**Flow bot** is the right default for notifications. The message is clearly automated and does not depend on one person's name.",
        "**User** posts as the owner of the connection. Use it when the message should read as coming from a person, and remember that it will carry that person's name for as long as the flow runs.",
        "Messages posted as **User** do not notify the person who posted them. If you post as yourself to yourself, you see no alert."
      ),
      p("Flow bot cannot post everywhere. Private and shared channels have restrictions that the standard channels do not. If a post to such a channel fails as Flow bot, post as User, or use a standard channel for automated messages.")
    ),
    section(
      "mention",
      "Mention a person or a tag",
      p("Typing @ and a name in the message box does not notify anyone. A real mention needs a token."),
      ol(
        "Add **Get an @mention token for a user** before the post action. Put the person's email address in **User**.",
        "In the message, insert the **@mention** output from dynamic content where the name should appear."
      ),
      p("The person gets a notification, and their name is highlighted in the message. For a tag, use **Get an @mention token for a tag** with the team and the tag."),
      p("To mention several people, get a token for each one. Inside an Apply to each, add each token to a string variable, then use the variable in one message after the loop."),
      p("The patterns for [mentioning a user in an adaptive card](/patterns/mention-a-user-in-teams-adaptive-card) and [mentioning a tag, a team or a channel](/patterns/teams-mention-tag-team-channel-flow) cover the other cases.")
    ),
    section(
      "cards",
      "Adaptive cards",
      p("An adaptive card is a message with layout: headings, facts, images, inputs and buttons. It is written as JSON. Two actions post one."),
      table(
        ["Action", "Use it when"],
        ["Post card in a chat or channel", "The card is for information only, or its buttons open links"],
        ["Post adaptive card and wait for a response", "The flow needs the person's answer before it continues"]
      ),
      p("A small card with a heading and two facts looks like this."),
      code(`{
  "type": "AdaptiveCard",
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "version": "1.4",
  "body": [
    { "type": "TextBlock", "text": "New high-priority request", "weight": "Bolder", "size": "Medium" },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Title", "value": "@{triggerBody()?['Title']}" },
        { "title": "Raised by", "value": "@{triggerBody()?['Author']?['DisplayName']}" }
      ]
    }
  ]
}`, "Adaptive card"),
      p("Teams supports adaptive card features up to a certain schema version, and newer features are ignored or fail. Version 1.4 is a safe choice for cards posted from a flow."),
      p("Templating with `${...}` placeholders is not fully supported for cards in Power Automate. Build the card's JSON with dynamic content and with actions such as Select and Compose. The [card table pattern](/patterns/adaptive-card-table-from-array-select) shows how to turn an array into rows.")
    ),
    section(
      "worked-flow",
      "A complete flow: ask a question in a channel and act on the answer",
      p("When a request is added to a SharePoint list, the flow asks a channel whether to accept it and records the answer."),
      ol(
        "Start with the SharePoint trigger **When an item is created**.",
        "Add **Post adaptive card and wait for a response**. Set **Post as** to Flow bot and **Post in** to Channel, then pick the team and channel.",
        "Paste the card below into **Message**.",
        "Set **Update message** to a short sentence such as `Thanks, your answer was recorded.` The card is replaced by this text after someone answers.",
        "Add a **Condition** that checks which button was pressed, using the expression under the card.",
        "Under **If yes**, add the SharePoint action **Update item** and set the status to Accepted. Under **If no**, set it to Declined. Save the comment in both branches."
      ),
      code(`{
  "type": "AdaptiveCard",
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "version": "1.4",
  "body": [
    { "type": "TextBlock", "text": "Accept this request?", "weight": "Bolder", "size": "Medium" },
    { "type": "TextBlock", "text": "@{triggerBody()?['Title']}", "wrap": true },
    { "type": "Input.Text", "id": "comment", "placeholder": "Comment (optional)", "isMultiline": true }
  ],
  "actions": [
    { "type": "Action.Submit", "title": "Accept", "id": "accept" },
    { "type": "Action.Submit", "title": "Decline", "id": "decline" }
  ]
}`, "Adaptive card"),
      code(`body('Post_adaptive_card_and_wait_for_a_response')?['submitActionId']

body('Post_adaptive_card_and_wait_for_a_response')?['data']?['comment']`, "Expression"),
      p("The first expression returns `accept` or `decline`, the id of the button. The second returns the text typed into the input whose id is `comment`. The action's outputs also include the name and email of the person who answered. The action name in the expression must match your action's name, with underscores in place of spaces."),
      p("The first person to press a button ends the wait. For a card that several people must each answer, send it to each person in a chat with the Flow bot from inside a loop."),
      p("The [post a card and wait pattern](/patterns/post-adaptive-card-and-wait-for-response) adds a timeout branch, and [update a card after an action](/patterns/update-adaptive-card-after-action-teams) shows how to replace the card with a result.")
    ),
    section(
      "triggers",
      "Triggers worth knowing",
      table(
        ["Trigger", "Starts when"],
        ["When a new channel message is added", "Someone posts a new message in a channel. Replies do not start it."],
        ["When keywords are mentioned", "A message in the chosen chats or channels contains one of your keywords"],
        ["When I'm @mentioned", "Someone mentions you in a channel message"],
        ["For a selected message", "Someone picks the flow from a message's menu in Teams"],
        ["When someone responds to an adaptive card", "A person submits a card posted without waiting"],
        ["When a new team member is added", "Someone joins a team"]
      ),
      p("The patterns for the [keyword trigger](/patterns/teams-keyword-mention-trigger-flow) and the [selected message trigger](/patterns/teams-selected-message-flow-create-task) build flows on two of these.")
    ),
    section(
      "mistakes",
      "Three mistakes to avoid on day one",
      ul(
        "**Waiting on a card for longer than a run can last.** A flow run ends after 30 days, and a card nobody answers fails the run. Set a timeout on the action's settings and handle it. See the [limits reference](/guides/power-automate-limits).",
        "**Hard-coding the team and channel by name in an expression.** The actions store IDs behind the dropdowns. If you must enter custom values, use the IDs, which you can copy from the channel's link.",
        "**Posting one message per item in a loop.** Twenty messages in a channel get muted. Build one message or one card with a row per item."
      )
    ),
    section(
      "limits",
      "Limits to know",
      ul(
        "Teams limits how many messages a connection can post in a short time. Loops that post are the usual cause of throttling.",
        "A posted message has a size limit of about 28 KB, including the card's JSON. Large cards with many rows can exceed it, so keep cards short and link to the detail.",
        "Action names in this connector have changed over the years. If you follow an older tutorial and cannot find an action, search for the keywords **post message** or **post card** and choose the current one."
      )
    )
  ],
  faqs: [
    {
      question: "How do I post a message to a Teams channel from Power Automate?",
      answer: "Add the action Post message in a chat or channel. Set Post as to Flow bot, Post in to Channel, pick the team and channel, and write the message."
    },
    {
      question: "What is the difference between Flow bot and User in the Teams action?",
      answer: "Flow bot posts the message as an automated account, which suits notifications. User posts the message as the owner of the flow's Teams connection, so it appears to come from that person."
    },
    {
      question: "How do I @mention someone in a Teams message from a flow?",
      answer: "Add the action Get an @mention token for a user with the person's email address, then insert the token it returns into the message. Typing @ and a name as plain text does not create a mention."
    },
    {
      question: "How do I read the answer from an adaptive card in Power Automate?",
      answer: "Use Post adaptive card and wait for a response. Its outputs include submitActionId, which is the id of the button pressed, and a data object with the value of each input by its id."
    },
    {
      question: "Which adaptive card version works in Teams from Power Automate?",
      answer: "Version 1.4 is a safe choice. Features from newer versions may be ignored or may stop the card from appearing."
    }
  ],
  relatedTools: ["adaptive-card-preview-snippets", "power-automate-expression-builder", "trigger-condition-builder"],
  relatedPatterns: ["post-adaptive-card-and-wait-for-response", "mention-a-user-in-teams-adaptive-card", "teams-post-as-flow-bot-user-choose", "adaptive-card-input-form-teams-collect-data", "teams-reply-in-thread-channel-message"],
  relatedLinks: [
    { href: "/guides/power-automate-expressions-explained", label: "Read and write flow expressions" },
    { href: "/guides/power-automate-limits", label: "Power Automate limits reference" },
    { href: "/errors/429-rate-limit-exceeded-power-automate", label: "Error: 429 Rate limit is exceeded" }
  ],
  sources: [
    automateDoc("teams/overview", "Use flows in Microsoft Teams"),
    automateDoc("create-adaptive-cards", "Create flows that post adaptive cards to Microsoft Teams"),
    automateDoc("approvals-known-issues", "Known issues: adaptive cards and data templating"),
    learnDoc("connectors/teams", "Microsoft Teams connector reference")
  ]
};
