import { automateDoc, code, learnDoc, note, ol, p, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-20";
const eyebrow = "Power Automate how-to";

export const parseJsonGuide: Guide = {
  slug: "power-automate-parse-json-guide",
  title: "Use Parse JSON in a flow, and know when to skip it",
  shortTitle: "Use Parse JSON, and when to skip it",
  description: "What the Parse JSON action does, how to generate a schema that survives empty values, how arrays behave, and how to read a value with an expression when Parse JSON is more than you need.",
  eyebrow,
  keywords: ["Power Automate Parse JSON", "Parse JSON schema", "Parse JSON null", "read JSON Power Automate", "Parse JSON array"],
  published,
  updated: published,
  quickAnswer: "Parse JSON does not change the data. It describes the data with a schema so that each property appears in the dynamic content list. Generate the schema from a sample, then edit it so that any property that can be empty allows null, or the action fails on the first empty value. If you need only one or two values, skip the action and read them with an expression such as body('HTTP')?['customer']?['name'].",
  sections: [
    section(
      "what-it-does",
      "What Parse JSON gives you",
      p("Many actions return JSON that the designer knows nothing about: an HTTP call, a response from a custom API, text sent from Power Apps, the body of a webhook. The data is all there, but the dynamic content list shows only **Body**."),
      p("**Parse JSON** takes that content and a schema, which is a description of the properties and their types. After it, every property in the schema appears as its own item in dynamic content, and you can pick `name` or `total` like the output of any other action."),
      p("It also checks the content against the schema. If the content does not match, the action fails. That check is the source of most Parse JSON errors, and the reason the schema needs editing after it is generated.")
    ),
    section(
      "generate",
      "Generate a schema from a sample",
      ol(
        "Run the flow once without Parse JSON and open the run history.",
        "Copy the output of the action whose content you want to read. Copy the body only, not the headers and status code around it.",
        "Add a **Parse JSON** action. In **Content**, pick the body of that earlier action.",
        "Select **Use sample payload to generate schema**, paste the sample and confirm."
      ),
      p("The designer writes a schema from the sample. It is a good first draft and nothing more, because it describes only the one sample you gave it."),
      tool("parse-json-schema-generator", "Paste the same sample into the generator. It writes a schema that already allows null where you choose, uses number in place of integer, and lists the expression for every value.")
    ),
    section(
      "null",
      "Why generated schemas break, and the fix",
      p("In your sample, `phone` held text, so the schema says `phone` is a string. The next run has a customer with no phone number, the value is `null`, and the action fails with **Invalid type. Expected String but got Null**."),
      p("Change the type of any property that can be empty from one type to a list of two."),
      code(`"phone": {
    "type": ["string", "null"]
}`, "Schema"),
      p("Three more edits make a schema hold up in production."),
      ul(
        "**Change `integer` to `number`** for any value that can have decimals. A sample of 10 produces `integer`, and 10.5 then fails.",
        "**Trim the `required` list.** The generator marks every property in the sample as required. Remove any property that is sometimes left out of the content, or delete the list.",
        "**Use a sample with every property filled in.** A property that is `null` in the sample gets no useful type at all."
      ),
      p("The error page for [Expected String but got Null](/errors/parse-json-schema-validation-failed-expected-string-got-null) covers the other forms of this message.")
    ),
    section(
      "arrays",
      "Arrays and the Apply to each that appears by itself",
      p("If the content has an array of objects, such as a list of order lines, picking a property from inside it makes the designer wrap your action in an **Apply to each**. It does this because there are many values, one per item, and the action can only use one at a time."),
      p("That is correct when you want to act on each item. It is a surprise when you wanted one value. To read a single item without a loop, use an expression."),
      code(`first(body('Parse_JSON')?['lines'])?['sku']

body('Parse_JSON')?['lines']?[0]?['sku']`, "Expression"),
      p("Both read the `sku` of the first line. To turn the array into a table or a list of values, pass it to a Select or Create HTML table action, which take the whole array at once.")
    ),
    section(
      "without",
      "Read values without Parse JSON",
      p("Parse JSON is a convenience for the designer. Expressions can read the same content directly, with no schema to maintain and no validation to fail."),
      code(`body('HTTP')?['customer']?['name']`, "Expression"),
      p("Each `?['...']` step moves one level into the data. The question mark means that a missing property returns null instead of failing the action."),
      p("If the content arrives as text, which is common for a text input from Power Apps or a file's content, convert it first with `json`."),
      code(`json(triggerBody()?['text'])?['customer']?['name']`, "Expression"),
      p("The names inside the brackets must match the property names exactly, including capital letters. See [how to read flow expressions](/guides/power-automate-expressions-explained) for the full picture.")
    ),
    section(
      "which",
      "Which approach to use",
      table(
        ["Situation", "Use"],
        ["You need many properties, in several later actions", "Parse JSON"],
        ["Other people will maintain the flow in the designer", "Parse JSON"],
        ["You need one or two values", "An expression"],
        ["The shape of the content varies between runs", "An expression"],
        ["The content must be checked before the flow continues", "Parse JSON, with a strict schema"],
        ["The content is an array you will pass to Select or Filter array", "Neither. Use the array directly."]
      ),
      p("The strict case deserves a note. A schema that rejects bad content can be useful, when you would prefer the flow to stop than to continue with missing data. Do it on purpose, and put the action in a scope with error handling so the failure is reported. The [Try and Catch pattern](/patterns/power-automate-try-catch-scope-error-handling) shows how.")
    ),
    section(
      "checks",
      "Checks when Parse JSON fails",
      ul(
        "**The Content is not JSON.** An error page or an empty body from a failed HTTP call cannot be parsed. Check the status code of the earlier action first.",
        "**The Content is text that holds JSON.** Wrap it in `json()` in the Content box.",
        "**The sample included the outer wrapper.** If the schema starts with `statusCode`, `headers` and `body`, it was generated from the whole output. Use the body only, or point Content at the whole output.",
        "**The top level is an array.** A schema whose first type is `array` describes a list. Content that is a single object then fails, and the reverse."
      )
    )
  ],
  faqs: [
    {
      question: "Do I need Parse JSON to read a JSON response?",
      answer: "No. An expression such as body('HTTP')?['customer']?['name'] reads the value directly. Parse JSON is useful when you want the properties to appear in the dynamic content list, or when you want the content checked against a schema."
    },
    {
      question: "How do I allow null in a Parse JSON schema?",
      answer: "Change the type of the property from a single type to a list that includes null, for example \"type\": [\"string\", \"null\"]. Do this for every property that can be empty."
    },
    {
      question: "Why does Parse JSON add an Apply to each?",
      answer: "The value you picked sits inside an array, so there is one value per item. The designer adds a loop to handle each one. To read a single item without a loop, use an expression with first() or an index such as ?[0]."
    },
    {
      question: "Why does Parse JSON fail with a required property error?",
      answer: "The generated schema lists every property from the sample as required. If the real content sometimes leaves one out, the action fails. Remove that property from the required list in the schema."
    },
    {
      question: "What is the difference between integer and number in the schema?",
      answer: "Integer accepts whole numbers only. Number accepts whole numbers and decimals. If a value can ever have a decimal part, use number."
    }
  ],
  relatedTools: ["parse-json-schema-generator", "power-automate-expression-builder"],
  relatedPatterns: ["power-automate-parse-json-from-power-apps", "coalesce-empty-null-handling-power-automate", "power-automate-try-catch-scope-error-handling"],
  relatedLinks: [
    { href: "/errors/parse-json-schema-validation-failed-expected-string-got-null", label: "Error: Expected String but got Null" },
    { href: "/errors/property-cannot-be-selected-power-automate", label: "Error: Property cannot be selected" },
    { href: "/guides/power-automate-expressions-explained", label: "Read and write flow expressions" }
  ],
  sources: [
    automateDoc("data-operations", "Use data operations"),
    learnDoc("azure/logic-apps/workflow-definition-language-functions-reference", "Reference guide to workflow expression functions"),
    learnDoc("azure/logic-apps/logic-apps-workflow-definition-language", "Workflow Definition Language schema: operators")
  ]
};

export const expressionsExplainedGuide: Guide = {
  slug: "power-automate-expressions-explained",
  title: "Read and write Power Automate expressions: body, outputs, items and the question mark",
  shortTitle: "Read and write flow expressions",
  description: "How dynamic content and expressions relate, what triggerBody, body, outputs, items and variables return, how action names become expression names, and how to find the right path to any value.",
  eyebrow,
  keywords: ["Power Automate expressions explained", "triggerBody", "body outputs Power Automate", "items apply to each expression", "question mark operator Power Automate"],
  published,
  updated: published,
  quickAnswer: "Every piece of dynamic content is an expression underneath. An expression names where the data comes from, such as triggerBody(), body('Get_item') or items('Apply_to_each'), and then a path to the value, such as ?['Title']. Action names are written with underscores in place of spaces. The question mark makes a missing property return null instead of failing the action. To find any path, open a past run and read the action's outputs.",
  sections: [
    section(
      "dynamic-content",
      "Dynamic content is an expression in disguise",
      p("When you pick **Title** from the dynamic content list, the designer shows a coloured token. Behind the token is an expression."),
      code(`triggerBody()?['Title']`, "Expression"),
      p("Hover over a token to see its expression, or open the action's code view. Knowing this removes most of the mystery: an expression you write by hand and a token you pick from the list are the same thing, and you can copy one to learn the other."),
      p("Expressions are needed when the list does not offer what you want: a value inside nested data, a value from a specific item in an array, or a value changed by a function such as `formatDateTime`."),
      tool("power-automate-expression-builder", "Pick a template for dates, empty values, arrays or conditions, fill in your own names and copy the finished expression.")
    ),
    section(
      "sources",
      "Where the data comes from",
      p("An expression starts by naming a source. There are six you will use all the time."),
      table(
        ["Function", "Returns", "Example"],
        ["`triggerBody()`", "The body of the trigger", "`triggerBody()?['Title']`"],
        ["`triggerOutputs()`", "Everything the trigger returned, including headers", "`triggerOutputs()?['body/Title']`"],
        ["`body('Name')`", "The body of an action", "`body('Get_item')?['Title']`"],
        ["`outputs('Name')`", "Everything an action returned", "`outputs('Compose')`"],
        ["`items('Name')`", "The current item of an Apply to each", "`items('Apply_to_each')?['Title']`"],
        ["`variables('name')`", "The value of a variable", "`variables('varTotal')`"]
      ),
      p("`body('Get_item')` is a shortcut for `outputs('Get_item')?['body']`. For most connector actions the body is what you want. **Compose** is the exception people meet first: its result is read with `outputs('Compose')`."),
      p("Inside **Select** and **Filter array**, the current item is `item()` with no name. Inside Apply to each it is `items('Apply_to_each')`, with the name of the loop.")
    ),
    section(
      "action-names",
      "How action names become expression names",
      p("The name in quotes is the name of the action with every space replaced by an underscore. An action called **Get manager details** is `body('Get_manager_details')`."),
      p("Three consequences follow."),
      ul(
        "**Rename actions early.** The designer updates expressions when you rename an action, but expressions kept in notes or copied from another flow keep the old name.",
        "**A name that does not exist stops the flow from saving**, with a message that the action is not defined or the expression is invalid.",
        "**Copies get a number.** A second Compose is `Compose_2`. Give actions real names and expressions become readable: `outputs('Start_of_today')` explains itself."
      )
    ),
    section(
      "paths",
      "The path to a value",
      p("After the source comes the path. Each `['...']` step moves one level deeper into the data."),
      code(`body('Get_item')?['Status']?['Value']`, "Expression"),
      p("That reads the Status property of the item, then the Value property inside it. Square brackets with a number pick an item from an array, counting from zero."),
      code(`body('Get_items')?['value']?[0]?['Title']`, "Expression"),
      p("That reads the list of items, takes the first one, and reads its Title. Some connector outputs also accept a combined path with a slash, as in `triggerOutputs()?['body/Status/Value']`. The two forms return the same value."),
      p("Property names are case sensitive. `['title']` does not find `Title`. It returns null.")
    ),
    section(
      "question-mark",
      "What the question mark does",
      p("Compare these two expressions."),
      code(`body('Get_item')['Manager']['Email']

body('Get_item')?['Manager']?['Email']`, "Expression"),
      p("If the item has no manager, the first one fails the action with an error that the property cannot be selected. The second returns null and the flow carries on."),
      p("Keep the question marks. The designer adds them for a reason. A null still has to be handled if a later function cannot accept one, which is what `coalesce` is for."),
      code(`coalesce(body('Get_item')?['Manager']?['Email'], 'unassigned@contoso.com')`, "Expression"),
      p("The [null handling pattern](/patterns/coalesce-empty-null-handling-power-automate) covers the cases, including the difference between null and empty text.")
    ),
    section(
      "at-signs",
      "The @ sign and the curly brackets",
      p("In the expression editor you type an expression with no `@`. The designer adds it when it stores the flow. You only type it yourself in three places: trigger conditions, Filter array in advanced mode, and code view."),
      table(
        ["Form", "Where it appears", "Meaning"],
        ["`@equals(...)`", "Trigger conditions, advanced mode", "The whole value is this expression."],
        ["`@{utcNow()}`", "Inside text, such as a Filter Query", "Put the result of this expression into the surrounding text."]
      ),
      p("The curly bracket form always produces text. That is why `Amount gt @{variables('varLimit')}` works in a Filter Query, and why a number passed that way into a field that expects a number can arrive as text.")
    ),
    section(
      "find-path",
      "Find the right path for any value",
      ol(
        "Run the flow once, or use a past run.",
        "Open the action that returns the data and look at its outputs. Select **Show raw outputs** to see the full JSON.",
        "Read down from `body` to the value, noting each property name on the way.",
        "Write the source, then one `?['name']` step for each level."
      ),
      p("A shortcut: pick the nearest value from dynamic content, then hover over the token or open code view to see the expression the designer wrote. Change the last step to the property you need."),
      p("Test a new expression in a Compose action before you use it in a condition or a filter. The Compose output in the run history shows exactly what it returned.")
    ),
    section(
      "five",
      "Five expressions every flow builder needs",
      table(
        ["Need", "Expression"],
        ["A fallback for an empty value", "`coalesce(triggerBody()?['Phone'], 'Not given')`"],
        ["A readable date", "`formatDateTime(triggerBody()?['Created'], 'd MMM yyyy')`"],
        ["One of two values", "`if(equals(triggerBody()?['Priority'], 'High'), 'Today', 'This week')`"],
        ["How many items", "`length(body('Get_items')?['value'])`"],
        ["The first item of a list", "`first(body('Get_items')?['value'])?['Title']`"]
      ),
      p("The [expressions cookbook](/cookbooks/power-automate-expressions-cookbook) has many more, grouped by task.")
    )
  ],
  faqs: [
    {
      question: "What is the difference between body and outputs in Power Automate?",
      answer: "outputs('Name') returns everything an action produced, including status code and headers where they exist. body('Name') returns only the body part and is the same as outputs('Name')?['body']. Use outputs for a Compose action and body for most connector actions."
    },
    {
      question: "What does the question mark mean in a Power Automate expression?",
      answer: "It makes the step safe. With ?['Name'], a property that does not exist returns null. Without the question mark, a missing property fails the action."
    },
    {
      question: "What is the difference between triggerBody and triggerOutputs?",
      answer: "triggerOutputs() returns everything the trigger produced, including headers. triggerBody() returns the body part only. triggerBody()?['Title'] and triggerOutputs()?['body/Title'] read the same value."
    },
    {
      question: "How do I reference the current item in an Apply to each?",
      answer: "Use items('Apply_to_each') followed by the path, replacing Apply_to_each with the name of your loop with underscores for spaces. Inside Select and Filter array, use item() with no name."
    },
    {
      question: "Why does my expression say the action is not defined?",
      answer: "The name in quotes does not match an action that runs before this one. Check for spaces that should be underscores, a renamed action, or an action that sits in a different branch or runs later in the flow."
    }
  ],
  relatedTools: ["power-automate-expression-builder", "date-format-tester", "trigger-condition-builder"],
  relatedPatterns: ["coalesce-empty-null-handling-power-automate", "select-union-remove-duplicates-power-automate", "filter-array-instead-of-apply-to-each"],
  relatedLinks: [
    { href: "/cookbooks/power-automate-expressions-cookbook", label: "Power Automate Expressions Cookbook" },
    { href: "/errors/the-expression-is-invalid-power-automate", label: "Error: The expression is invalid" },
    { href: "/errors/invalidtemplate-unable-to-process-template-language-expressions", label: "Error: InvalidTemplate" }
  ],
  sources: [
    automateDoc("use-expressions-in-conditions", "Use expressions in conditions to check multiple values"),
    learnDoc("azure/logic-apps/workflow-definition-language-functions-reference", "Reference guide to workflow expression functions"),
    learnDoc("azure/logic-apps/logic-apps-workflow-definition-language", "Workflow Definition Language schema: operators"),
    automateDoc("data-operations", "Use data operations")
  ]
};

export const internalNamesGuide: Guide = {
  slug: "sharepoint-internal-column-names-power-automate",
  title: "Find and use SharePoint internal column names in a flow",
  shortTitle: "SharePoint internal column names in flows",
  description: "The difference between a column's display name and internal name, four ways to find the internal name, what codes such as _x0020_ mean, and where a flow needs the internal name.",
  eyebrow,
  keywords: ["SharePoint internal column name Power Automate", "_x0020_", "OData__ column", "internal name filter query", "find SharePoint internal name"],
  published,
  updated: published,
  quickAnswer: "Every SharePoint column has a display name, which you can change, and an internal name, which is set when the column is created and never changes. Flows need the internal name in a Filter Query, Order By, trigger conditions, expressions and HTTP requests. Find it at the end of the address of the column's settings page, after Field=. A space appears there as _x0020_, and a name that starts with an underscore needs OData_ in front in a filter.",
  sections: [
    section(
      "two-names",
      "Two names for every column",
      p("The **display name** is the heading you see in the list. It can contain spaces and symbols, and you can change it whenever you like."),
      p("The **internal name** is created once, from the first name the column was given. It has no spaces, it is unique in the list, and it never changes. Renaming a column changes the display name only."),
      p("That is how a column titled Due Date ends up with the internal name `Deadline`: someone created it as Deadline and renamed it later. A flow that filters on `Due Date` or `DueDate` then fails, and the cause is invisible from the list."),
      tool("sharepoint-internal-name-helper", "Type a column title to see the internal name SharePoint would create for it, with each special character encoded.")
    ),
    section(
      "find",
      "Four ways to find the internal name",
      p("**1. The column settings page.** This is the reliable one."),
      ol(
        "Open the list, select the gear icon and choose **List settings**.",
        "Under **Columns**, select the column.",
        "Look at the end of the page address. The internal name follows `Field=`."
      ),
      p("**2. A past flow run.** Open the outputs of a Get items action, or of a SharePoint trigger, and select **Show raw outputs**. The property names in the JSON are the internal names in the form flows use."),
      p("**3. Sort the list by the column.** In some list views the page address then includes the internal name of the sorted column."),
      p("**4. Ask SharePoint.** Paste this address into a browser, with your own site and list title. It returns the display name and internal name of every column."),
      code(`https://contoso.sharepoint.com/sites/Requests/_api/web/lists/getbytitle('Requests')/fields?$select=Title,InternalName&$filter=Hidden eq false`, "Browser address")
    ),
    section(
      "codes",
      "What _x0020_ and the other codes mean",
      p("An internal name cannot contain a space or most symbols. SharePoint replaces each one with a code: an underscore, an x, four characters that identify the symbol, and another underscore."),
      table(
        ["Character", "Code", "Example title", "Internal name"],
        ["Space", "`_x0020_`", "Due Date", "`Due_x0020_Date`"],
        ["Hyphen", "`_x002d_`", "Sign-off", "`Sign_x002d_off`"],
        ["Slash", "`_x002f_`", "Yes/No", "`Yes_x002f_No`"],
        ["Ampersand", "`_x0026_`", "R&D", "`R_x0026_D`"],
        ["Number sign", "`_x0023_`", "PO #", "`PO_x0020__x0023_`"],
        ["Opening bracket", "`_x0028_`", "Cost (USD)", "`Cost_x0020__x0028_USD_x0029_`"],
        ["Full stop", "`_x002e_`", "No.", "`No_x002e_`"],
        ["Question mark", "`_x003f_`", "Approved?", "`Approved_x003f_`"]
      ),
      p("Not every column with a space in its title has `_x0020_` in its internal name. Depending on how the column was created, SharePoint may remove the space instead, so Due Date becomes `DueDate`. Never guess. Look the name up."),
      p("Two more rules produce surprises."),
      ul(
        "**Long names are cut short.** An encoded internal name is limited to 32 characters. A long title with several spaces is cut off in the middle, and a second column that would get the same name has a number added.",
        "**Titles in non-Latin scripts** are encoded character by character, or replaced with a generic name such as `field_1`. The same generic names appear on lists created from a spreadsheet."
      )
    ),
    section(
      "odata-prefix",
      "The OData_ prefix",
      p("An internal name that starts with an underscore cannot be used as it is in a filter. That happens when the title started with a digit or a symbol, because the first character was encoded: a column titled 2nd Reviewer has the internal name `_x0032_nd_x0020_Reviewer`."),
      p("In a Filter Query, Order By or expression, put `OData_` in front of it."),
      code(`OData__x0032_nd_x0020_Reviewer eq 'Sam Rivera'`, "Filter Query"),
      p("There are two underscores in a row: one from the prefix and one from the name. The flow's raw outputs show the name already in this form, which is another reason to check a past run.")
    ),
    section(
      "built-in",
      "Built-in columns with unexpected names",
      table(
        ["Column in the list", "Internal name"],
        ["Created By", "`Author`"],
        ["Modified By", "`Editor`"],
        ["Created", "`Created`"],
        ["Modified", "`Modified`"],
        ["Name, in a library", "`FileLeafRef`"],
        ["Folder path, in a library", "`FileDirRef`"],
        ["Content Type", "`ContentType`"]
      ),
      p("Created By and Modified By are person columns, so a filter reads a field of them: `Author/EMail eq 'sam@contoso.com'`.")
    ),
    section(
      "where",
      "Where a flow needs the internal name",
      table(
        ["Place", "Name to use"],
        ["Dynamic content list", "Display name. The designer handles it for you."],
        ["Filter Query and Order By", "Internal name"],
        ["Trigger conditions", "Internal name"],
        ["Expressions typed by hand", "Internal name"],
        ["Send an HTTP request to SharePoint", "Internal name"],
        ["Column formatting JSON", "Internal name"]
      ),
      p("The split explains a common puzzle. A flow built entirely from dynamic content keeps working when someone renames a column. A filter typed by hand with the new title fails, because the internal name is still the old one.")
    ),
    section(
      "habits",
      "Habits that avoid the problem",
      ul(
        "**Create columns with a short name and no spaces**, such as DueDate, then rename them to the friendly title. The internal name stays clean.",
        "**Record the internal names** in the list's design notes. The [list design standards](/standards/sharepoint-list-design-standards) have a layout for this.",
        "**Check the raw outputs** before writing a filter or a trigger condition on a list someone else built."
      )
    )
  ],
  faqs: [
    {
      question: "How do I find the internal name of a SharePoint column?",
      answer: "Open List settings, select the column, and look at the end of the page address. The internal name is the text after Field=. You can also read it from the raw outputs of a Get items action in a past flow run."
    },
    {
      question: "What does _x0020_ mean in a SharePoint column name?",
      answer: "It is the code for a space. SharePoint internal names cannot contain spaces, so a column created as Due Date can get the internal name Due_x0020_Date."
    },
    {
      question: "Does renaming a SharePoint column change its internal name?",
      answer: "No. Renaming changes the display name only. The internal name is fixed when the column is created."
    },
    {
      question: "Why does my column name need OData_ in front of it?",
      answer: "Internal names that start with an underscore, which happens when the title began with a digit or symbol, must be written with the OData_ prefix in a Filter Query, Order By or expression. The result has two underscores in a row, such as OData__x0032_nd."
    },
    {
      question: "Do I need the internal name when I pick a column from dynamic content?",
      answer: "No. The dynamic content list shows display names and writes the correct reference for you. The internal name is needed wherever you type a column name by hand."
    }
  ],
  relatedTools: ["sharepoint-internal-name-helper", "odata-filter-query-builder", "trigger-condition-builder"],
  relatedPatterns: ["use-odata-filters-sharepoint-text-fields", "send-http-request-to-sharepoint-power-automate"],
  relatedLinks: [
    { href: "/guides/sharepoint-get-items-filter-query", label: "Get items Filter Query by column type" },
    { href: "/errors/column-does-not-exist-deleted-by-another-user", label: "Error: Column does not exist" },
    { href: "/standards/sharepoint-list-design-standards", label: "SharePoint List Design Standards" }
  ],
  sources: [
    learnDoc("sharepoint/dev/sp-add-ins/use-odata-query-operations-in-sharepoint-rest-requests", "Use OData query operations in SharePoint REST requests"),
    learnDoc("sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest", "Working with lists and list items with REST"),
    automateDoc("sharepoint-overview", "Use SharePoint and Power Automate to build workflows")
  ]
};

export const complexColumnsGuide: Guide = {
  slug: "power-automate-choice-person-lookup-values",
  title: "Read Choice, Person, Lookup and multi-select values from SharePoint in a flow",
  shortTitle: "Read Choice, Person and Lookup values",
  description: "What choice, person and lookup columns look like in a flow's outputs, which part to use for what, how to turn a multi-select column into one line of text, and how to write these columns back.",
  eyebrow,
  keywords: ["Power Automate get choice column value", "person column email Power Automate", "lookup column value flow", "multi-select choice Power Automate", "apply to each choice column"],
  published,
  updated: published,
  quickAnswer: "A choice, person or lookup column is not a single value. It is a small record. Read the text of a choice with ?['Status']?['Value'], the email of a person with ?['AssignedTo']?['Email'], and the ID of a looked-up item with ?['Project']?['Id']. A column that allows several selections is an array of those records, which is why the designer adds an Apply to each. Use Select and join to turn it into one line of text.",
  sections: [
    section(
      "shapes",
      "What these columns look like in a flow",
      p("Open the raw outputs of a Get item action and find a choice column. It is not plain text. It is an object with more than one property."),
      code(`"Status": {
    "Id": 2,
    "Value": "Approved"
},
"AssignedTo": {
    "Claims": "i:0#.f|membership|sam@contoso.com",
    "DisplayName": "Sam Rivera",
    "Email": "sam@contoso.com",
    "JobTitle": "Analyst",
    "Department": "Finance"
},
"Project": {
    "Id": 7,
    "Value": "Apollo"
}`, "Raw outputs, shortened"),
      p("The exact properties vary a little between actions, so check your own run. The parts you will use are these."),
      table(
        ["Column type", "Property", "Holds"],
        ["Choice", "`Value`", "The text of the selected choice"],
        ["Person", "`Email`", "The person's email address"],
        ["Person", "`DisplayName`", "The person's name"],
        ["Person", "`Claims`", "The sign-in identifier SharePoint uses to set a person"],
        ["Lookup", "`Id`", "The ID of the item in the other list"],
        ["Lookup", "`Value`", "The text of the looked-up column, usually the Title"]
      )
    ),
    section(
      "read",
      "Read one value",
      p("In the dynamic content list each part appears as its own entry, such as **Status Value**, **AssignedTo Email** and **Project Id**. Pick the part you need, not the entry with the bare column name."),
      p("As expressions, they are a two-step path."),
      code(`triggerBody()?['Status']?['Value']

triggerBody()?['AssignedTo']?['Email']

triggerBody()?['Project']?['Id']`, "Expression"),
      p("Keep the question marks. When the column is empty the whole object is null, and `?['Value']` then returns null instead of failing. Add a fallback where an action needs text."),
      code(`coalesce(triggerBody()?['AssignedTo']?['Email'], 'unassigned@contoso.com')`, "Expression"),
      tool("power-automate-expression-builder", "Start from a template for a choice, person or empty-value expression and replace the column name with your own.")
    ),
    section(
      "multi",
      "Why a multi-select column adds an Apply to each",
      p("When a choice column allows several selections, or a person column allows several people, the value is an array of those records."),
      code(`"Tags": [
    { "Id": 1, "Value": "Finance" },
    { "Id": 4, "Value": "Urgent" }
]`, "Raw outputs"),
      p("Pick **Tags Value** from dynamic content and the designer wraps the action in an Apply to each, because there is one value per selection. An email action placed there sends one email per tag, which is rarely what was wanted.")
    ),
    section(
      "join",
      "Turn a multi-select column into one line of text",
      p("Two steps replace the loop."),
      ol(
        "Add a **Select** action. In **From**, pick the column itself, the entry with the bare name such as Tags.",
        "Switch **Map** to text mode with the small icon on the right, so it shows a single box, and enter the expression `item()?['Value']`.",
        "Where you need the text, use the expression below."
      ),
      code(`join(body('Select'), ', ')`, "Expression"),
      p("The result is `Finance, Urgent`. For several people, map `item()?['Email']` and join with a semicolon, and the result goes straight into the To line of an email."),
      code(`join(body('Select_emails'), ';')`, "Expression"),
      p("To test whether a particular choice is among the selections, use `contains` on the Select output."),
      code(`contains(body('Select'), 'Urgent')`, "Expression")
    ),
    section(
      "write",
      "Write these columns back",
      p("**Create item** and **Update item** show one field for each part that can be set."),
      table(
        ["Column type", "Field in the action", "Give it"],
        ["Choice", "Status Value", "The choice text, picked from the list or entered as a custom value"],
        ["Person", "AssignedTo Claims", "The person's email address"],
        ["Lookup", "Project Id", "The ID of the item in the other list, a number"]
      ),
      p("To set a choice from a value in the flow, open the dropdown, select **Enter custom value** and add the dynamic content. The text must match one of the choices exactly."),
      p("To clear a lookup or person column, leave the field empty. For a multi-select column, switch the field to accept a whole array with the icon beside it, and pass an array of small objects."),
      code(`[
    { "Value": "Finance" },
    { "Value": "Urgent" }
]`, "Array for a multi-select choice"),
      note("Update item rewrites every field shown in the action, including the ones you leave empty. See [updating items without overwriting fields](/patterns/power-automate-sharepoint-update-item-with-etag-awareness) before using it on a list other people edit.")
    ),
    section(
      "filters",
      "Use them in filters and trigger conditions",
      p("The same columns are written differently in each place, which causes a lot of confusion."),
      table(
        ["Place", "Choice", "Person"],
        ["Expression", "`?['Status']?['Value']`", "`?['AssignedTo']?['Email']`"],
        ["Trigger condition", "`triggerOutputs()?['body/Status/Value']`", "`triggerOutputs()?['body/AssignedTo/Email']`"],
        ["Filter Query", "`Status eq 'Approved'`", "`AssignedTo/EMail eq 'sam@contoso.com'`"]
      ),
      p("In a Filter Query the choice has no `/Value`, and the person field is `EMail` with a capital M. See the [Filter Query guide](/guides/sharepoint-get-items-filter-query) and the [trigger condition guide](/guides/power-automate-trigger-conditions-guide).")
    ),
    section(
      "power-apps",
      "The same columns in Power Apps",
      p("Power Apps treats these columns as records too, with different rules for writing them. If you are saving from an app instead of a flow, use the [Patch SharePoint columns cheat sheet](/cheat-sheets/patch-sharepoint-columns-cheat-sheet).")
    )
  ],
  faqs: [
    {
      question: "How do I get the text of a choice column in Power Automate?",
      answer: "Pick the entry named after the column followed by Value from dynamic content, or use an expression such as triggerBody()?['Status']?['Value']. The bare column name returns the whole record, not the text."
    },
    {
      question: "How do I get the email address from a person column?",
      answer: "Pick the column name followed by Email from dynamic content, or use an expression such as triggerBody()?['AssignedTo']?['Email']."
    },
    {
      question: "Why does my flow add an Apply to each when I select a choice column?",
      answer: "The column allows several selections, so its value is an array. The designer adds a loop to handle each selection. Use a Select action and the join function to combine the selections into one line of text without a loop."
    },
    {
      question: "How do I set a person column in Update item?",
      answer: "Put the person's email address in the Claims field for that column. For a column that allows several people, switch the field to array input and pass one object with a Claims property per person."
    },
    {
      question: "How do I set a lookup column from a flow?",
      answer: "Put the numeric ID of the item in the other list into the Id field for the lookup column. If you only know the item's title, add a Get items action with a Filter Query on the other list first and use the ID it returns."
    }
  ],
  relatedTools: ["power-automate-expression-builder", "odata-filter-query-builder", "trigger-condition-builder"],
  relatedPatterns: ["select-union-remove-duplicates-power-automate", "coalesce-empty-null-handling-power-automate", "power-automate-sharepoint-update-item-with-etag-awareness"],
  relatedLinks: [
    { href: "/cheat-sheets/patch-sharepoint-columns-cheat-sheet", label: "Patch SharePoint Columns Cheat Sheet" },
    { href: "/guides/power-automate-expressions-explained", label: "Read and write flow expressions" },
    { href: "/errors/foreach-expression-result-must-be-valid-array", label: "Error: The result must be a valid array" }
  ],
  sources: [
    automateDoc("sharepoint-overview", "Use SharePoint and Power Automate to build workflows"),
    automateDoc("data-operations", "Use data operations"),
    learnDoc("connectors/sharepointonline", "SharePoint connector reference")
  ]
};

export const troubleshootFailedRunGuide: Guide = {
  slug: "troubleshoot-failed-flow-run",
  title: "Troubleshoot a failed flow run from the run history",
  shortTitle: "Troubleshoot a failed flow run",
  description: "A routine for any failed Power Automate run: find the first failed action, read its inputs, outputs and error, decide what kind of failure it is, fix it and resubmit. Includes an index of error messages.",
  eyebrow,
  keywords: ["Power Automate flow failed", "troubleshoot flow run", "flow run history", "resubmit flow run", "Power Automate error"],
  published,
  updated: published,
  quickAnswer: "Open the failed run from the flow's run history and find the first action with a red mark. Read its error message, then its inputs and outputs. A 401 or 403 means a connection or permission problem. A 400 or 404 means the action was given something wrong. A 429 means a limit. A 500 or 502 is usually temporary. Fix the cause, then use Resubmit to run the flow again with the same trigger data.",
  sections: [
    section(
      "open",
      "Open the failed run",
      ol(
        "Sign in to Power Automate and select **My flows**.",
        "Select the flow. The details page shows the run history.",
        "Select the date and time of the failed run."
      ),
      p("The run opens with each action marked. Green ran. Red failed. Grey was skipped, usually because an action before it failed. The first red action from the top is the one to read. Later red marks are often consequences of it."),
      p("For a flow that runs often, select **Edit columns** on the run history and add trigger values such as a title or an ID. The list then shows which item each run was for, and you can find the right run without opening them one by one.")
    ),
    section(
      "read",
      "Read the error, then the inputs and outputs",
      p("Select the failed action. The pane shows three things, and all three matter."),
      ul(
        "**The error message.** It names a status code and usually a sentence about what went wrong.",
        "**Inputs.** What the action was given. Check these first. An empty value where an ID or an email address should be explains most failures.",
        "**Outputs.** What the service replied. The `body` often has a longer message than the summary. Select **Show raw outputs** to see all of it."
      ),
      p("If the failed action is a scope, a condition or an Apply to each, the real failure is inside it. Open it and keep going down until you reach an ordinary action. In a loop, use the arrows at the top of the loop to step to the iteration that failed."),
      p("Flow owners also receive a repair tips email when a flow fails, with a description of the problem and a link to the run.")
    ),
    section(
      "kind",
      "Decide what kind of failure it is",
      table(
        ["Signal", "Kind of failure", "What to do"],
        ["`Unauthorized`, 401, 403", "Connection or permission", "Fix the connection, or give the account access to the site, list or mailbox."],
        ["`Bad request`, 400", "The action was given something invalid", "Check the inputs: an empty value, a wrong type, a bad filter."],
        ["`Not found`, 404", "The thing does not exist", "Check the ID, site address, list or file path in the inputs."],
        ["`InvalidTemplate`", "An expression could not be worked out", "Read the rest of the message for the function and the value type."],
        ["429", "A limit was reached", "Slow the flow down or reduce the number of calls."],
        ["500, 502, `BadGateway`", "The service had a problem", "Usually temporary. Resubmit, and add a retry policy if it repeats."],
        ["Timed out", "The run or an action took too long", "A run can last 30 days at most. Approvals and waits count toward it."]
      ),
      p("For an authentication failure, the error pane has a link to the flow's connections. Fix the connection that shows a warning, then resubmit the run.")
    ),
    section(
      "errors",
      "Find your error message",
      p("Match the start of the message with the table, then open the page for the fix."),
      table(
        ["The message says", "Page"],
        ["Unable to process template language expressions", "[InvalidTemplate](/errors/invalidtemplate-unable-to-process-template-language-expressions)"],
        ["Expects its parameter to be a string. The provided value is of type 'Null'", "[Value is of type Null](/errors/template-function-expects-string-provided-value-null)"],
        ["The result must be a valid array", "[Must be a valid array](/errors/foreach-expression-result-must-be-valid-array)"],
        ["The schema validation failed. Expected String but got Null", "[Parse JSON validation failed](/errors/parse-json-schema-validation-failed-expected-string-got-null)"],
        ["Property cannot be selected", "[Property cannot be selected](/errors/property-cannot-be-selected-power-automate)"],
        ["The datetime string must match ISO 8601 format", "[ISO 8601 format](/errors/datetime-string-must-match-iso-8601-format)"],
        ["The expression is invalid", "[The expression is invalid](/errors/the-expression-is-invalid-power-automate)"],
        ["Column does not exist. It may have been deleted by another user", "[Column does not exist](/errors/column-does-not-exist-deleted-by-another-user)"],
        ["The query is not valid", "[The query is not valid](/errors/the-query-is-not-valid-get-items)"],
        ["Exceeds the list view threshold", "[List view threshold](/errors/exceeds-list-view-threshold-power-automate)"],
        ["Rate limit is exceeded", "[429 Rate limit](/errors/429-rate-limit-exceeded-power-automate)"],
        ["BadGateway", "[BadGateway 502](/errors/badgateway-502-power-automate)"],
        ["An action failed. No dependent actions succeeded", "[ActionFailed](/errors/actionfailed-no-dependent-actions-succeeded)"],
        ["The file is locked for shared use", "[File is locked](/errors/file-is-locked-for-shared-use-power-automate)"],
        ["Precondition failed, ETag, save conflict", "[412 and save conflicts](/errors/412-precondition-failed-etag-mismatch)"],
        ["The variable cannot be initialized or updated with value of type", "[Variable type mismatch](/errors/variable-cannot-be-initialized-or-updated-with-value-of-type)"],
        ["The specified object was not found in the store", "[Object not found in the store](/errors/specified-object-was-not-found-in-the-store)"],
        ["There is a problem with the flow's trigger", "[Problem with the trigger](/errors/problem-with-the-flows-trigger)"]
      ),
      p("The full list, including Power Apps errors, is in the [error library](/errors).")
    ),
    section(
      "fix-and-rerun",
      "Fix, then run again with the same data",
      p("You do not need to wait for the trigger to fire again, or to create another test item."),
      ul(
        "**Resubmit.** On the failed run, select **Resubmit**. The flow runs again with the same trigger data, using the flow as it is now. Use it after fixing a connection or editing the flow.",
        "**Test with a past trigger.** In the designer, select **Test**, choose the automatic option and pick a recent trigger. The run opens live so you can watch each action complete."
      ),
      p("Resubmitting runs every action again. If the first attempt already sent an email or created an item before it failed, the second attempt does it again. Check what the failed run completed before you resubmit.")
    ),
    section(
      "succeeded-but-wrong",
      "When the run succeeded and the result is wrong",
      p("A green run only means that no action failed. Four situations produce a successful run that did nothing useful."),
      ul(
        "**A list action returned no items.** Get items succeeds with an empty list, and an Apply to each over nothing is skipped. Check the action's outputs for the number of items.",
        "**A condition took the other branch.** Open the condition to see the values it compared. Text against a number, or a choice record against text, is always false.",
        "**A filter was too narrow or too wide.** See [where to filter in a flow](/guides/filter-query-vs-filter-array-vs-condition).",
        "**An error was caught and hidden.** An action set to run after a failure turns the run green. Make sure every catch path reports what it caught."
      )
    ),
    section(
      "prevent",
      "Make the next failure easier to read",
      ul(
        "Give actions real names. `Get_manager_details` in an error message tells you where to look. `Compose_7` does not.",
        "Put related actions in a scope, with a second scope that runs when the first fails and reports the error. See the [Try and Catch pattern](/patterns/power-automate-try-catch-scope-error-handling).",
        "Handle empty values where they enter the flow, not where they cause the failure. See the [null handling pattern](/patterns/coalesce-empty-null-handling-power-automate).",
        "Decide what gets logged and who is told. The [error handling standards](/standards/error-handling-standards) describe a simple model."
      ),
      tool("power-automate-expression-builder", "Many failed runs come down to one expression. Rebuild it from a template for dates, empty values or arrays and compare it with yours.")
    )
  ],
  faqs: [
    {
      question: "How do I see why a Power Automate flow failed?",
      answer: "Open the flow from My flows, select the failed run in the run history, and select the first action marked in red. The pane shows the error message along with the inputs the action received and the outputs the service returned."
    },
    {
      question: "How do I rerun a failed flow?",
      answer: "Open the failed run and select Resubmit. The flow runs again with the same trigger data. Any actions that completed before the failure will run again as well."
    },
    {
      question: "How long is flow run history kept?",
      answer: "Run history is retained for 30 days, counted from the start of the run. The flow details page shows the most recent 28 days."
    },
    {
      question: "Why are some actions grey in my failed run?",
      answer: "Grey actions were skipped. By default an action runs only when the one before it succeeded, so everything after a failed action is skipped unless it is configured to run after a failure."
    },
    {
      question: "Why did my flow succeed without doing anything?",
      answer: "The usual cause is a list action that returned no items, so the loop over them had nothing to do, or a condition that took the branch you did not expect. Open each action's outputs in the run to see the values the flow worked with."
    },
    {
      question: "What does a 502 BadGateway error mean in Power Automate?",
      answer: "The connector or the service behind it failed to respond properly. Errors with code 500 or 502 are usually temporary. Resubmit the run, and set a retry policy on the action if it happens regularly."
    }
  ],
  relatedTools: ["power-automate-expression-builder", "parse-json-schema-generator", "odata-filter-query-builder"],
  relatedPatterns: ["power-automate-try-catch-scope-error-handling", "coalesce-empty-null-handling-power-automate", "power-platform-request-limits-monitor"],
  relatedLinks: [
    { href: "/errors", label: "Power Automate and Power Apps error library" },
    { href: "/standards/error-handling-standards", label: "Power Platform Error Handling Standards" },
    { href: "/power-automate/error-handling", label: "Power Automate error handling patterns" }
  ],
  sources: [
    automateDoc("fix-flow-failures", "Troubleshoot a cloud flow"),
    automateDoc("limits-and-config", "Limits of automated, scheduled and instant flows"),
    learnDoc("troubleshoot/power-platform/power-automate/flow-run-issues/triggers-troubleshoot", "Troubleshoot Power Automate trigger problems and errors"),
    automateDoc("guidance/coding-guidelines/error-handling", "Employ robust error handling")
  ]
};
