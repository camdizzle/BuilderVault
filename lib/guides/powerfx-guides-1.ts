import { canvasDoc, code, note, ol, p, powerFxDoc, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-20";
const eyebrow = "Power Fx how-to";

export const variablesGuide: Guide = {
  slug: "power-fx-set-vs-updatecontext-vs-with",
  title: "Set, UpdateContext or With: which Power Fx variable to use",
  shortTitle: "Set vs UpdateContext vs With",
  description: "The difference between global variables, context variables and With in Power Apps, with a decision table, the rules each one follows, how to pass a value to another screen, and the mistakes that cause stale or blank values.",
  eyebrow,
  keywords: ["Set vs UpdateContext Power Apps", "Power Apps global variable vs context variable", "Power Fx With function", "Power Apps pass variable between screens", "UpdateContext multiple variables"],
  published,
  updated: published,
  quickAnswer: "Use With when the value is needed inside one formula only. Use UpdateContext when one screen needs to remember something, such as whether a dialog is open. Use Set when several screens need the same value, such as the selected record. If the value never changes while the app runs, do not use a variable at all: write a named formula in App.Formulas. Variables do not recalculate on their own, so every extra variable is one more value that can go out of date.",
  sections: [
    section(
      "decision-table",
      "The short version",
      table(
        ["", "With", "UpdateContext", "Set", "Named formula"],
        ["Lives in", "One formula", "One screen", "The whole app", "The whole app"],
        ["Changed by", "Nothing: fixed for that formula", "UpdateContext or Navigate", "Set", "Nothing: it recalculates itself"],
        ["Works in a property such as Text or Items", "Yes", "No, behavior properties only", "No, behavior properties only", "Yes"],
        ["Typical use", "Naming a value used several times in a formula", "Dialog open or closed, the tab that is selected", "The selected record, the signed-in user's role", "Constants, theme colours, the user's profile"]
      ),
      p("Work from left to right and stop at the first column that does the job. The further right a value lives, the more places can read it, and for variables the more places can change it without you noticing."),
      p("A **behavior property** is one that runs when something happens, such as `OnSelect`, `OnVisible` or `OnChange`. `Set` and `UpdateContext` can only be called there.")
    ),
    section(
      "with",
      "With: a name that lasts for one formula",
      p("`With` takes a record of named values and a formula that uses them. The names exist only inside that formula."),
      code(`With(
    {
        subtotal: Sum(colLines, Quantity * UnitPrice),
        taxRate: 0.2
    },
    Text(subtotal * (1 + taxRate), "#,##0.00")
)`),
      p("Nothing is stored, so nothing can go out of date. `With` also works in properties where `Set` is not allowed, such as a label's `Text` or a gallery's `Items`. Microsoft's reference says that using `With` is preferred over context or global variables because it is self-contained and easy to understand."),
      p("One `With` cannot use its own names inside the same record. To build one value from another, nest a second `With` inside the first."),
      code(`With(
    {request: LookUp(Requests, ID = varRequestId)},
    With(
        {daysLeft: DateDiff(Today(), request.DueDate, TimeUnit.Days)},
        If(daysLeft < 0, "Overdue", daysLeft & " days left")
    )
)`),
      p("The [With pattern](/patterns/with-function-readable-power-fx-formulas) has more examples."),
      tool("power-fx-formatter", "Format a long With formula so that each named value sits on its own line.")
    ),
    section(
      "updatecontext",
      "UpdateContext: a value for one screen",
      p("A context variable belongs to the screen where it is set. Other screens cannot read it or change it. `UpdateContext` takes a record, so one call can set several variables."),
      code(`// Button OnSelect: open a dialog and remember which row was chosen
UpdateContext({locShowDialog: true, locRow: ThisItem});

// Dialog container Visible
locShowDialog

// Close button OnSelect
UpdateContext({locShowDialog: false})`),
      p("Use the record form, `{name: value}`, to set the variable, and the plain name to read it. A common first mistake is writing `UpdateContext(locShowDialog = true)`, which compares instead of assigning."),
      p("A context variable keeps its value when the user leaves the screen and comes back. If the screen should start fresh each time, reset the variables in the screen's `OnVisible`."),
      code(`// Screen OnVisible
UpdateContext({locShowDialog: false, locRow: Blank()})`)
    ),
    section(
      "set",
      "Set: a value for the whole app",
      p("A global variable can be read and changed from any screen. `Set` takes a name and a value."),
      code(`// Gallery OnSelect on the list screen
Set(gblSelectedRequest, ThisItem);
Navigate(scrRequestDetail)

// Label Text on the detail screen
gblSelectedRequest.Title`),
      p("That reach is the reason to use it and the reason to be careful with it. Any formula on any screen can call `Set` on the same name, so when a global variable holds the wrong value, the cause can be anywhere in the app. Keep the list of global variables short, and give each one a single place where it is set if you can.")
    ),
    section(
      "pass-to-screen",
      "Pass a value to another screen",
      p("There are two ways to hand a value to the next screen."),
      code(`// 1. A global variable: simple, and readable from every screen
Set(gblSelectedRequest, ThisItem);
Navigate(scrRequestDetail)

// 2. The third argument of Navigate: sets context variables on the target screen
Navigate(scrRequestDetail, ScreenTransition.None, {locRequest: ThisItem})`),
      p("The second form keeps the value private to the detail screen, which is tidier when only that screen uses it. `Navigate` is the only way to set another screen's context variables from outside."),
      p("Both forms pass a copy of the record as it was at that moment. If the record is saved on the detail screen, the copy does not change. Update it with the record that `Patch` returns, as the [refresh after Patch pattern](/patterns/refresh-selected-request-after-patch) shows.")
    ),
    section(
      "rules",
      "Rules that all variables follow",
      ul(
        "**A variable starts as blank.** Until the first `Set` or `UpdateContext` runs, reading it gives blank and not an error.",
        "**A variable has one type.** If one formula sets `gblTotal` to a number and another sets it to text, Studio reports an error on one of them. Decide the type and keep to it.",
        "**A variable does not recalculate.** It holds what it was given until a formula sets it again. A label that shows `Sum(colLines, Amount)` updates itself. A variable that was set to that sum does not.",
        "**A variable holds data in memory.** A table stored in a variable is a copy, limited by the data row limit when it was loaded, and a `Filter` over it runs in the app and not at the data source."
      ),
      p("If a context variable and a global variable share a name, the context variable wins on its own screen. To reach the global one, write `[@gblName]`. It is simpler to never share names: the [naming standards](/standards/power-apps-naming-standards) suggest a prefix such as `gbl` for global and `loc` for context variables."),
      p("To see every variable, where it is set and its current value, open **Variables** in the left-hand menu of Studio.")
    ),
    section(
      "when-not",
      "When not to use a variable",
      p("Formulas in a canvas app recalculate on their own, like cells in a spreadsheet. A variable switches that off for the value it holds. Before you add one, check whether a formula can do the job."),
      table(
        ["Instead of", "Write"],
        ["Setting `locTotal` every time a line changes", "A label whose `Text` is the `Sum` formula"],
        ["Setting `gblUserEmail` in `App.OnStart`", "A named formula: `UserEmail = User().Email;`"],
        ["Setting `locIsValid` in each input's `OnChange`", "A button `DisplayMode` formula that reads the inputs directly"],
        ["Setting `gblSelected` from a gallery on the same screen", "`galRequests.Selected`"]
      ),
      p("Variables are the right tool when the app has to remember something the user did: a choice, a step in a process, a record picked on another screen. The [named formulas guide](/guides/power-fx-named-formulas-explained) covers the values that never need to be set at all."),
      tool("onstart-to-named-formulas", "Paste your App.OnStart and see which Set calls can become named formulas.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Using Set for everything.** An app with sixty global variables is hard to change, because nobody knows which screens rely on which values.",
        "**Reading a variable before it is set.** With the default start-up settings, a screen can appear before `App.OnStart` has finished, and a variable set there can still be blank. Named formulas do not have this problem.",
        "**Storing a whole table to filter later.** The copy is cut off at the data row limit and shows no delegation warning. Filter the data source directly.",
        "**Expecting a variable to follow its source.** After a save, set the variable again from the saved record."
      )
    )
  ],
  faqs: [
    {
      question: "What is the difference between Set and UpdateContext in Power Apps?",
      answer: "Set creates a global variable that every screen can read and change. UpdateContext creates a context variable that exists only on the screen where it is set. Use UpdateContext for things one screen needs, such as showing a dialog, and Set for values several screens share."
    },
    {
      question: "Can UpdateContext set more than one variable?",
      answer: "Yes. UpdateContext takes a record, so UpdateContext({locA: 1, locB: \"text\"}) sets two context variables in one call."
    },
    {
      question: "How do I pass a variable to another screen in Power Apps?",
      answer: "Either set a global variable with Set before calling Navigate, or pass a record as the third argument of Navigate, which sets context variables on the target screen: Navigate(Screen2, ScreenTransition.None, {locItem: ThisItem})."
    },
    {
      question: "When should I use With instead of a variable?",
      answer: "Use With when the value is needed in one formula only. With stores nothing, so it cannot go out of date, and it works in properties such as Text and Items where Set and UpdateContext are not allowed."
    },
    {
      question: "Why is my Power Apps variable blank?",
      answer: "A variable is blank until a formula sets it. The usual causes are that the formula that sets it has not run yet, such as App.OnStart still loading, or that a context variable is being read on a different screen from the one where it was set."
    }
  ],
  relatedTools: ["power-fx-formatter", "onstart-to-named-formulas", "power-apps-naming-linter"],
  relatedPatterns: ["with-function-readable-power-fx-formulas", "use-named-formulas-for-app-constants", "refresh-selected-request-after-patch", "power-apps-current-user-profile-cache"],
  relatedLinks: [
    { href: "/guides/power-fx-named-formulas-explained", label: "Named formulas explained" },
    { href: "/standards/power-apps-naming-standards", label: "Power Apps naming standards" },
    { href: "/guides/speed-up-slow-power-fx-formulas", label: "Speed up slow Power Fx formulas" }
  ],
  sources: [
    canvasDoc("working-with-variables", "Understand variables in canvas apps"),
    powerFxDoc("reference/function-with", "With function"),
    powerFxDoc("reference/function-set", "Set function"),
    powerFxDoc("reference/function-updatecontext", "UpdateContext function"),
    canvasDoc("delegation-overview", "Understand delegation in a canvas app")
  ]
};

export const namedFormulasGuide: Guide = {
  slug: "power-fx-named-formulas-explained",
  title: "Named formulas in Power Apps: what App.Formulas is and when to use it",
  shortTitle: "Named formulas explained",
  description: "What a named formula is, how it differs from a variable set in App.OnStart, what to move into App.Formulas and what has to stay a variable, with syntax, examples and the limits to know.",
  eyebrow,
  keywords: ["Power Apps named formulas", "App.Formulas", "named formulas vs variables Power Apps", "App.OnStart vs App.Formulas", "Power Fx named formula example"],
  published,
  updated: published,
  quickAnswer: "A named formula is a name for a calculation, written in the app's Formulas property as Name = formula; with a semicolon at the end. Unlike a variable, it is never set. Power Apps works out its value the first time something uses it and again whenever the things it depends on change. Use named formulas for constants, theme values, the signed-in user's details and other values that are calculated and not chosen. Keep variables for what the user does while the app runs.",
  sections: [
    section(
      "what",
      "What a named formula is",
      p("Select **App** in the tree view and choose **Formulas** from the property list. Each named formula is a name, an equals sign, a formula and a semicolon."),
      code(`// App.Formulas
BrandColor = ColorValue("#0B5CAD");
PagePadding = 24;
UserEmail = Lower(User().Email);
IsManager = !IsBlank(LookUp(Managers, Lower(Email) = UserEmail));`),
      p("Once defined, the name works everywhere in the app, in any property, exactly like a built-in value."),
      code(`// Any control's Fill
BrandColor

// Approve button Visible
IsManager`),
      p("It is the same idea as a named cell in Excel. You do not tell it when to calculate. You say what it is, and the app keeps it right.")
    ),
    section(
      "vs-variables",
      "How it differs from a variable",
      table(
        ["", "Variable set in App.OnStart", "Named formula"],
        ["Defined by", "A `Set` call that has to run", "A definition that always exists"],
        ["Ready when", "After `App.OnStart` reaches that line", "Whenever something uses it"],
        ["Changes when", "Some formula calls `Set` again", "The values it depends on change"],
        ["Can be changed elsewhere", "Yes, by any formula", "No. The definition is the only source."],
        ["Costs time at start-up", "Yes, even if never used", "No. It is calculated only when needed."]
      ),
      p("Microsoft's reference lists these as the advantages: the value is always available, always up to date, cannot be changed somewhere else, and can be calculated only when needed. The last one helps start-up time, because a value used only on the third screen is not worked out until the user gets there.")
    ),
    section(
      "move",
      "What to move out of App.OnStart",
      p("Look at each `Set` in `App.OnStart` and ask whether anything else in the app ever sets that name again. If nothing does, it is a named formula in disguise."),
      code(`// Before: App.OnStart
Set(gblUserEmail, Lower(User().Email));
Set(gblUserProfile, LookUp(Employees, Lower(Email) = Lower(User().Email)));
Set(gblIsAdmin, gblUserProfile.Role.Value = "Admin");
Set(gblAppVersion, "2.4.1");

// After: App.Formulas
UserEmail = Lower(User().Email);
UserProfile = LookUp(Employees, Lower(Email) = UserEmail);
IsAdmin = UserProfile.Role.Value = "Admin";
AppVersion = "2.4.1";`),
      p("The order of the lines does not matter. Named formulas can refer to each other in any order, as long as two of them do not depend on each other in a circle."),
      tool("onstart-to-named-formulas", "Paste your App.OnStart. The converter rewrites the Set calls that qualify and lists the ones that have to stay."),
      p("After the move, rename or search for the old variable names across the app. The [named formulas pattern](/patterns/use-named-formulas-for-app-constants) covers a naming approach for constants.")
    ),
    section(
      "stay",
      "What has to stay a variable or a collection",
      ul(
        "**Anything the user changes.** A selected record, a step number, a dialog flag. A named formula cannot be set.",
        "**Anything that is edited in memory.** A collection that the app adds rows to with `Collect` or changes with `Patch` has to be a collection.",
        "**Anything that causes an action.** A named formula cannot call behavior functions such as `Set`, `Collect`, `Patch`, `Notify` or `Navigate`.",
        "**A snapshot on purpose.** If a value must stay exactly as it was at one moment, such as a copy of a record before the user edits it, set a variable at that moment."
      ),
      p("The first screen to show is also not a named formula. Use the `App.StartScreen` property for that, in place of a `Navigate` call in `App.OnStart`.")
    ),
    section(
      "data",
      "Named formulas that read data",
      p("A named formula can read from a data source, and this is where the largest start-up savings are."),
      code(`// App.Formulas
OpenRequests = Filter(Requests, Status.Value = "Open");
MyRequests = Filter(OpenRequests, Lower(Requester.Email) = UserEmail);`),
      p("Two things are worth knowing before you rely on this."),
      ul(
        "**The usual delegation rules apply.** The formula is sent to the data source like any other. If part of it cannot be delegated, only the first rows up to the data row limit are used. See the [delegation guide](/guides/power-apps-delegation-warning-explained).",
        "**It can recalculate.** When something it depends on changes, such as the search text it reads, Power Apps works it out again. That is the point of it, but it means a named formula is not a fixed cache. Where the app must hold one copy and edit it, load a collection instead."
      ),
      p("If no control uses a named formula, its query is never sent. There is no cost to defining one that some users never reach.")
    ),
    section(
      "functions-types",
      "User-defined functions and types",
      p("The same Formulas property also holds your own functions. A user-defined function is a named formula with parameters. Each parameter and the result need a type."),
      code(`// App.Formulas
FullName(first: Text, last: Text): Text = Trim(first & " " & last);
DaysLeft(due: Date): Number = DateDiff(Today(), due, TimeUnit.Days);`),
      code(`// A label's Text
FullName(ThisItem.FirstName, ThisItem.LastName) & ": " & DaysLeft(ThisItem.DueDate) & " days"`),
      p("Use a function when the same calculation is written out in several places with different inputs. Microsoft's reference notes that a function cannot call itself. The [user-defined functions pattern](/patterns/power-apps-user-defined-functions-reuse-logic) goes further, including functions that take a record.")
    ),
    section(
      "limits",
      "Limits and habits",
      ul(
        "Every definition ends with a **semicolon**. In regions that use a comma as the decimal separator, the end mark is two semicolons, as the [separators guide](/guides/power-fx-commas-vs-semicolons) explains.",
        "A named formula cannot use behavior functions or change anything in the app.",
        "Two named formulas cannot refer to each other in a circle.",
        "The name must not clash with a control, a variable, a collection or a data source."
      ),
      note("Formulas grow. When App.Formulas reaches a few dozen lines, group them under comment lines such as `// Theme`, `// Current user` and `// Reference data`, so the next maker can find things."),
      tool("power-fx-formatter", "Format App.Formulas so that each definition starts on its own line.")
    )
  ],
  faqs: [
    {
      question: "What are named formulas in Power Apps?",
      answer: "Named formulas are definitions in the App object's Formulas property, written as Name = formula; . The name can be used anywhere in the app. Power Apps calculates the value when it is needed and recalculates it when the values it depends on change."
    },
    {
      question: "Should I use named formulas instead of App.OnStart?",
      answer: "For values that are calculated once and never set again, yes. Microsoft's documentation recommends named formulas over setting global variables in App.OnStart, because they are always available and do not slow down start-up. Keep App.OnStart for work that really is an action."
    },
    {
      question: "Can a named formula be changed with Set?",
      answer: "No. A named formula's definition is its only source and it cannot be assigned a value. If the user needs to change a value while the app runs, use a variable."
    },
    {
      question: "Do named formulas slow down the app?",
      answer: "No. A named formula is calculated only when something uses it, so one that is defined and never used costs nothing. Moving start-up work from App.OnStart to named formulas usually makes the app open faster."
    },
    {
      question: "Can named formulas use Patch or Collect?",
      answer: "No. Named formulas cannot call behavior functions or cause side effects. They can read data with functions such as Filter and LookUp, but they cannot write it."
    }
  ],
  relatedTools: ["onstart-to-named-formulas", "power-fx-formatter", "power-apps-color-token-generator"],
  relatedPatterns: ["use-named-formulas-for-app-constants", "power-apps-user-defined-functions-reuse-logic", "power-apps-current-user-profile-cache", "power-apps-concurrent-load-data-faster"],
  relatedLinks: [
    { href: "/guides/power-fx-set-vs-updatecontext-vs-with", label: "Set, UpdateContext or With" },
    { href: "/guides/worked-example-excel-to-power-fx-named-formulas", label: "Worked example: OnStart to named formulas and StartScreen" },
    { href: "/guides/power-apps-faster-app-start-concurrent-onstart", label: "Faster app start with Concurrent and App.OnStart" },
    { href: "/guides/speed-up-slow-power-fx-formulas", label: "Speed up slow Power Fx formulas" }
  ],
  sources: [
    powerFxDoc("reference/object-app", "App object: Formulas, OnStart and StartScreen properties"),
    canvasDoc("working-with-variables", "Understand variables in canvas apps"),
    canvasDoc("delegation-overview", "Understand delegation in a canvas app")
  ]
};

export const saveDataGuide: Guide = {
  slug: "power-apps-patch-vs-submitform-vs-collect",
  title: "Patch, SubmitForm or Collect: how to save data in Power Apps",
  shortTitle: "Patch vs SubmitForm vs Collect",
  description: "When to save with a form and SubmitForm, when to write a Patch formula, and what Collect is for, with a comparison table, the code for creating and updating records, and how each one reports errors.",
  eyebrow,
  keywords: ["Patch vs SubmitForm Power Apps", "Power Apps Patch vs Collect", "Power Apps save data to SharePoint", "SubmitForm OnSuccess", "Patch Defaults create record"],
  published,
  updated: published,
  quickAnswer: "Use an Edit form with SubmitForm when one screen edits one record and the standard layout is good enough: it validates required fields and reports errors for you. Use Patch when you need control: saving without a form, saving a few columns, saving from several screens, or saving many rows. Use Collect to add rows to a collection in memory. Collect can also add a row to a data source, but it cannot update one, so Patch is the clearer choice there.",
  sections: [
    section(
      "comparison",
      "Side by side",
      table(
        ["", "SubmitForm", "Patch", "Collect"],
        ["Creates a record", "Yes, in New mode", "Yes, with `Defaults`", "Yes"],
        ["Updates a record", "Yes, in Edit mode", "Yes", "No"],
        ["Needs a form control", "Yes", "No", "No"],
        ["Checks required fields first", "Yes", "No. The data source rejects the save.", "No"],
        ["Reports the result through", "`OnSuccess` and `OnFailure`", "Its return value, with `IfError`", "Its return value, with `IfError`"],
        ["Saves many records at once", "No", "Yes, with a table", "Yes, new records only"],
        ["Typical target", "A data source", "A data source or a collection", "A collection"]
      ),
      p("None of the three is better. They suit different screens. Most apps use a form for the main record and `Patch` for everything around it: status changes, bulk actions and child rows.")
    ),
    section(
      "submitform",
      "SubmitForm: let the form do the work",
      p("An **Edit form** control knows its data source, its record and its mode. `SubmitForm` gathers the values from the cards, checks them and saves."),
      code(`// Save button OnSelect
SubmitForm(frmRequest)

// frmRequest OnSuccess
Notify("Request saved", NotificationType.Success);
Set(gblSelectedRequest, frmRequest.LastSubmit);
Back()

// frmRequest OnFailure
Notify(frmRequest.Error, NotificationType.Error)`),
      p("Before it saves, `SubmitForm` checks every field that is required or has a rule in the data source, and the form's `Valid` property. If something is wrong, nothing is sent, the cards show their messages, and `OnFailure` runs. If the save works, `OnSuccess` runs and `LastSubmit` holds the saved record, including values the data source filled in, such as the ID."),
      ul(
        "`NewForm(frmRequest)` switches the form to create a record. `EditForm(frmRequest)` switches it to change the record in its `Item` property.",
        "`frmRequest.Unsaved` is true while the user has changes that are not saved. Use it to warn before leaving the screen.",
        "`ResetForm(frmRequest)` throws away the user's changes."
      ),
      p("Put the follow-up steps in `OnSuccess`, not after `SubmitForm` in the button. The lines after `SubmitForm` run straight away, before the save has finished. The [form mode pattern](/patterns/power-apps-form-mode-new-edit-view) shows one form used for new, edit and view.")
    ),
    section(
      "patch",
      "Patch: say exactly what to save",
      p("`Patch` takes a data source, a record to change, and a record of new values. Only the columns you name are changed."),
      code(`// Update one column of an existing record
Patch(Requests, gblSelectedRequest, {Status: {Value: "Approved"}})

// Create a record
Patch(
    Requests,
    Defaults(Requests),
    {
        Title: txtTitle.Text,
        DueDate: dpDue.SelectedDate,
        Status: {Value: "New"}
    }
)`),
      p("`Defaults(Requests)` is the signal to create. It returns an empty record with the data source's default values. For an update, the second argument has to be a record that came from the data source, such as a gallery's selected item or the result of a `LookUp`."),
      p("`Patch` returns the record as saved. Keep it when you need the new ID or want the screen to show the saved values."),
      code(`Set(
    gblSelectedRequest,
    Patch(Requests, Defaults(Requests), {Title: txtTitle.Text})
)`),
      p("`Patch` does not check required fields before it sends the data, and it does not show a message when the save fails unless you ask it to. Wrap it in `IfError`, as the [error handling guide](/guides/power-fx-iferror-and-app-onerror) explains. Choice, Person and Lookup columns need a particular record shape. The [Patch cheat sheet](/cheat-sheets/patch-sharepoint-columns-cheat-sheet) lists each one.")
    ),
    section(
      "collect",
      "Collect: add rows to a collection",
      p("A collection is a table held in the app's memory. `Collect` adds rows to it, and creates the collection if it does not exist. `ClearCollect` empties it first."),
      code(`// Add one line to a basket
Collect(colBasket, {ProductId: ThisItem.ID, Name: ThisItem.Title, Quantity: 1});

// Replace the whole collection
ClearCollect(colDepartments, ShowColumns(Departments, ID, Title))`),
      p("`Collect` also accepts a data source as its first argument and adds a record to it. It cannot update a record, and its return value is the whole data source and not the new row, so use `Patch` with `Defaults` when you write to a data source. Reading `Collect(Requests, …)` in a formula, the next maker cannot tell at a glance whether Requests is a list or a collection."),
      p("Rows in a collection are not saved anywhere until a formula writes them to a data source. The [collections cookbook](/cookbooks/power-apps-collections-cookbook) has recipes for the common jobs.")
    ),
    section(
      "many-rows",
      "Save many rows",
      p("When the user edits several rows in a gallery, or a basket holds several lines, save them in one call. `Patch` accepts a table of records as its second argument."),
      code(`// Create every basket line as an order line, in one call
Patch(
    OrderLines,
    ForAll(
        colBasket,
        {
            Title: Name,
            OrderId: gblOrder.ID,
            Quantity: Quantity
        }
    )
)`),
      p("To update existing rows this way, each record in the table has to include the key of the row it changes, such as the ID. The [ForAll and Patch pattern](/patterns/forall-patch-multiple-records-power-apps) covers both cases, and [UpdateIf and RemoveIf](/patterns/updateif-removeif-bulk-changes-power-apps) change every row that matches a condition."),
      p("Calling `Patch` inside `ForAll`, once per row, also works and is slower, because each row is its own request.")
    ),
    section(
      "which",
      "Which one for which screen",
      table(
        ["Situation", "Use"],
        ["A standard new or edit screen for one record", "A form and `SubmitForm`"],
        ["A record with file attachments in a SharePoint list", "A form, because the attachments card saves the files"],
        ["An Approve button that changes the status only", "`Patch` with one column"],
        ["A custom layout that a form cannot give you", "`Patch`, with your own checks"],
        ["One record spread over several screens", "`Patch` at the end, or several forms as in the [multiple forms pattern](/patterns/submit-multiple-power-apps-forms)"],
        ["Lines in a basket before the order is placed", "`Collect` into a collection, then `Patch` the table"],
        ["Offline entry to send later", "`Collect` and `SaveData`, then `Patch` when online"]
      ),
      p("If you start with a form and later need `Patch` for one extra column, you can mix them. The form's `Updates` property holds the values from its cards as a record, which `Patch` accepts."),
      code(`Patch(Requests, gblSelectedRequest, frmRequest.Updates, {ReviewedOn: Now()})`)
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Navigating straight after SubmitForm.** `SubmitForm(frm); Back()` leaves the screen before the result is known, and a failed save goes unseen. Move `Back()` to `OnSuccess`.",
        "**Patch with no error handling.** A save that fails on a required column, a permission or a lost connection leaves the user thinking it worked.",
        "**Patching with a record from a collection copy.** A record that has passed through `AddColumns` or `ShowColumns` may no longer be traceable to the data source. Look the record up again, or patch by ID.",
        "**Using Collect to update.** It adds a second row. Use `Patch` on the existing row."
      ),
      tool("power-fx-formatter", "Format a long Patch so that each column sits on its own line and a missing bracket is easy to see.")
    )
  ],
  faqs: [
    {
      question: "What is the difference between Patch and SubmitForm in Power Apps?",
      answer: "SubmitForm saves the values of an Edit form control, checks required fields first and reports the result through the form's OnSuccess and OnFailure properties. Patch is a formula that saves the columns you name, with or without a form, and returns the saved record. Patch gives more control and leaves validation and error messages to you."
    },
    {
      question: "How do I create a new record with Patch?",
      answer: "Pass Defaults of the data source as the second argument: Patch(Requests, Defaults(Requests), {Title: \"New request\"}). Defaults tells Patch to create a record and not to update one."
    },
    {
      question: "What is the difference between Patch and Collect?",
      answer: "Collect adds new rows and is mainly used with collections held in memory. Patch can both create and update records, in a data source or a collection, and returns the record it saved. Collect cannot change an existing row."
    },
    {
      question: "How do I get the ID of a record after saving it in Power Apps?",
      answer: "With a form, read FormName.LastSubmit.ID in the form's OnSuccess property. With Patch, use the record it returns, for example Set(varSaved, Patch(...)) and then varSaved.ID."
    },
    {
      question: "Can I use Patch and a form together?",
      answer: "Yes. The form's Updates property returns the values of its cards as a record, so Patch(DataSource, Record, FormName.Updates, {ExtraColumn: value}) saves the form's values plus your own in one call."
    }
  ],
  relatedTools: ["power-fx-formatter", "patch-sharepoint-columns-cheat-sheet", "power-apps-patch-cookbook"],
  relatedPatterns: ["power-apps-form-mode-new-edit-view", "forall-patch-multiple-records-power-apps", "power-apps-error-handling-iferror-patch", "submit-multiple-power-apps-forms", "refresh-selected-request-after-patch", "updateif-removeif-bulk-changes-power-apps"],
  relatedLinks: [
    { href: "/guides/power-fx-iferror-and-app-onerror", label: "Error handling with IfError and App.OnError" },
    { href: "/cheat-sheets/patch-sharepoint-columns-cheat-sheet", label: "Patch SharePoint columns cheat sheet" },
    { href: "/errors/function-patch-has-some-invalid-arguments", label: "Error: The function 'Patch' has some invalid arguments" }
  ],
  sources: [
    powerFxDoc("reference/function-patch", "Patch function"),
    powerFxDoc("reference/function-form", "EditForm, NewForm, SubmitForm, ResetForm and ViewForm functions"),
    powerFxDoc("reference/function-clear-collect-clearcollect", "Collect, Clear and ClearCollect functions"),
    powerFxDoc("reference/function-defaults", "Defaults function"),
    canvasDoc("working-with-forms", "Understand canvas app forms")
  ]
};

export const errorHandlingGuide: Guide = {
  slug: "power-fx-iferror-and-app-onerror",
  title: "Error handling in Power Apps with IfError and App.OnError",
  shortTitle: "IfError and App.OnError",
  description: "How errors travel through Power Fx formulas, how to catch them with IfError, what FirstError tells you, how App.OnError handles everything you did not catch, and how to raise your own errors, with a save formula you can reuse.",
  eyebrow,
  keywords: ["Power Apps IfError", "App.OnError Power Apps", "Power Apps error handling Patch", "FirstError.Message", "Power Fx IsError"],
  published,
  updated: published,
  quickAnswer: "Wrap a formula that can fail in IfError and give it something to do when it does: IfError(Patch(...), Notify(FirstError.Message, NotificationType.Error)). Inside the second argument, FirstError holds the message and the source of the error. For everything you did not wrap, write a formula in App.OnError, which runs for every unhandled error in the app and replaces the default red banner. IfError can replace a failed value. App.OnError can only decide how the error is reported.",
  sections: [
    section(
      "how-errors-move",
      "How an error moves through an app",
      p("In Power Fx an error is a kind of value. When a calculation fails, such as a division by zero or a save the data source refuses, the result of that formula is an error value. Anything calculated from it is also an error."),
      ol(
        "If the formula is wrapped in `IfError`, your replacement is used and the error stops there.",
        "If not, the control cannot show the value, so it shows blank.",
        "`App.OnError` runs. If it is empty, the user sees the default banner with the error's message."
      ),
      p("So there are two places to act: close to the formula with `IfError`, and once for the whole app with `App.OnError`."),
      note("The functions in this guide depend on the app setting named Formula-level error management. It is on for apps today, and Microsoft's reference lists it under the retired settings, so only an old app that has it switched off needs attention.")
    ),
    section(
      "iferror",
      "IfError: catch an error where it happens",
      p("`IfError` tries a value. If the value is an error, it returns the replacement instead."),
      code(`// A calculation: show 0 in place of a division by zero
IfError(Value(txtTotal.Text) / Value(txtCount.Text), 0)

// A save: tell the user what went wrong
IfError(
    Patch(Requests, gblSelectedRequest, {Status: {Value: "Approved"}}),
    Notify("Could not save: " & FirstError.Message, NotificationType.Error),
    Notify("Request approved", NotificationType.Success)
)`),
      p("The last argument in the second example is the default result. It runs only when nothing failed, which makes it the right place for the success message."),
      p("The replacement has to be the same type as the value. `IfError(1 / x, \"n/a\")` does not work, because the first argument is a number and the replacement is text. Convert the first argument so that both are text."),
      code(`IfError(Text(1 / x), "n/a")`)
    ),
    section(
      "stop-chain",
      "Stop a chain of actions at the first failure",
      p("Actions joined with a semicolon all run, even when an earlier one fails. In this formula the email is sent and the screen closes even if the save did not work."),
      code(`// Each line runs whether or not the one before it worked
Patch(Orders, Defaults(Orders), {Title: txtTitle.Text});
Office365Outlook.SendEmailV2(User().Email, "Order saved", "Thank you");
Back()`),
      p("`IfError` accepts several value and replacement pairs. It works through them in order and stops at the first error."),
      code(`IfError(
    Patch(Orders, Defaults(Orders), {Title: txtTitle.Text}),
    Notify("The order was not saved: " & FirstError.Message, NotificationType.Error),

    Office365Outlook.SendEmailV2(User().Email, "Order saved", "Thank you"),
    Notify("Saved, but the confirmation email failed", NotificationType.Warning),

    Back()
)`),
      p("If the `Patch` fails, the first message is shown and nothing else runs. If it works, the email is tried. `Back()` runs only when both worked."),
      tool("power-fx-formatter", "Format a multi-step IfError so that each action and its replacement are easy to pair up.")
    ),
    section(
      "firsterror",
      "What FirstError tells you",
      p("Inside a replacement, and inside `App.OnError`, the record `FirstError` describes what went wrong. `AllErrors` is a table of the same records, for the cases where more than one thing failed."),
      table(
        ["Field", "What it holds"],
        ["Message", "A description of the error that can be shown to the user"],
        ["Kind", "The category of the error, as a value of the `ErrorKind` enumeration"],
        ["Source", "Where the error started, such as `btnSave.OnSelect`"],
        ["Observed", "Where the error surfaced to the user"],
        ["Details", "For network errors, a record with `HttpStatusCode` and `HttpResponse`"]
      ),
      p("`Kind` lets a formula treat different failures differently."),
      code(`IfError(
    Patch(Requests, gblSelectedRequest, {Title: txtTitle.Text}),
    Switch(
        FirstError.Kind,
        ErrorKind.Conflict, Notify("Someone else changed this request. Reload and try again.", NotificationType.Warning),
        ErrorKind.Network, Notify("No connection. Your change was not saved.", NotificationType.Error),
        Notify(FirstError.Message, NotificationType.Error)
    )
)`),
      p("Messages from a data source can be long and can include internal column names. For errors you expect, write your own wording, and keep `FirstError.Message` for the unexpected ones.")
    ),
    section(
      "onerror",
      "App.OnError: one handler for everything else",
      p("Select **App** in the tree view and choose **OnError**. The formula there runs for every error that no `IfError` caught, with the same `FirstError` and `AllErrors`. Once it has a formula, the default banner no longer appears, so the formula decides what the user sees."),
      code(`// App.OnError
Trace(
    "Unhandled error",
    TraceSeverity.Error,
    {
        Message: FirstError.Message,
        Source: FirstError.Source,
        Screen: App.ActiveScreen.Name,
        User: User().Email
    }
);
Notify("Something went wrong. Please try again.", NotificationType.Error)`),
      p("`Trace` writes to Monitor, and to Application Insights if the app is connected to it, so you can see errors that users never report. The [Monitor pattern](/patterns/power-apps-monitor-debug-performance-trace) shows where to read the entries."),
      p("To keep the default banner for some errors and stay quiet for others, pass the error on with the `Error` function."),
      code(`// App.OnError: log everything, show the banner except for one known case
Trace("Unhandled error: " & FirstError.Message);
If(
    FirstError.Kind <> ErrorKind.Div0,
    Error(FirstError)
)`),
      ul(
        "`App.OnError` cannot replace a value. By the time it runs, the formula has already produced its error. It controls reporting only.",
        "It runs once per error, and several can run at the same time. Do not use a global variable to carry information from one line of it to the next. Use `With`."
      )
    ),
    section(
      "test-raise",
      "Test for errors and raise your own",
      table(
        ["Function", "Use"],
        ["`IsError(value)`", "True when the value is an error"],
        ["`IsBlankOrError(value)`", "True when the value is blank or an error"],
        ["`Error({Kind, Message})`", "Creates an error of your own"],
        ["`Errors(DataSource)`", "A table of errors from earlier changes to that data source"]
      ),
      p("Raise an error when your own rule is broken. It then travels like any other error, to the nearest `IfError` or to `App.OnError`."),
      code(`If(
    dpEnd.SelectedDate < dpStart.SelectedDate,
    Error({Kind: ErrorKind.Validation, Message: "The end date must be on or after the start date."}),
    Patch(Bookings, Defaults(Bookings), {Start: dpStart.SelectedDate, End: dpEnd.SelectedDate})
)`),
      p("For rules about what the user typed, it is kinder to stop the mistake earlier: disable the Save button until the inputs are valid, and show the reason next to the field.")
    ),
    section(
      "reusable-save",
      "A save formula to reuse",
      p("This is a sound default for a Save button that uses `Patch`. It saves, keeps the saved record, tells the user, and leaves the screen only on success."),
      code(`// btnSave.OnSelect
UpdateContext({locSaving: true});
IfError(
    Set(
        gblSelectedRequest,
        Patch(
            Requests,
            Coalesce(gblSelectedRequest, Defaults(Requests)),
            {
                Title: txtTitle.Text,
                DueDate: dpDue.SelectedDate
            }
        )
    ),
    Notify("Could not save the request. " & FirstError.Message, NotificationType.Error),
    Notify("Request saved", NotificationType.Success);
    Back()
);
UpdateContext({locSaving: false})`),
      p("Set the button's `DisplayMode` to `If(locSaving, DisplayMode.Disabled, DisplayMode.Edit)` so that a second tap cannot save twice. The [IfError and Patch pattern](/patterns/power-apps-error-handling-iferror-patch) adds a retry, and the [error handling standards](/standards/error-handling-standards) set out what every app should do.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Hiding errors.** `IfError(Patch(...), Blank())` makes a failed save look like a successful one. Always tell the user or log it.",
        "**Checking only with IsBlank.** A failed `LookUp` returns an error and not blank. Use `IsBlankOrError` where either can happen.",
        "**Leaving App.OnError empty in a production app.** Users see raw messages, and you never learn that errors happened.",
        "**Catching errors a form already handles.** `SubmitForm` reports through the form's `OnFailure` and `Error` properties. Put the message there."
      )
    )
  ],
  faqs: [
    {
      question: "How do I handle errors from Patch in Power Apps?",
      answer: "Wrap the Patch in IfError and give it a replacement that tells the user: IfError(Patch(...), Notify(FirstError.Message, NotificationType.Error)). Add a third argument for what should happen when the save works, such as a success message and Back()."
    },
    {
      question: "What is App.OnError in Power Apps?",
      answer: "App.OnError is a property of the App object. Its formula runs whenever an error occurs that no IfError handled. It can log the error with Trace and show your own message. When it is empty, Power Apps shows a default banner with the error's message."
    },
    {
      question: "What is the difference between IfError and App.OnError?",
      answer: "IfError wraps one formula and can replace a failed value with another, so later calculations continue. App.OnError is a single handler for the whole app that runs after an unhandled error has already happened. It controls how the error is reported and cannot change the value."
    },
    {
      question: "What does FirstError contain?",
      answer: "FirstError is a record with the fields Kind, Message, Source, Observed and Details. Message is text suitable for the user, Kind is a value of the ErrorKind enumeration, and Source names the control and property where the error started."
    },
    {
      question: "How do I create a custom error in Power Fx?",
      answer: "Call the Error function with a record that has a Kind and a Message, for example Error({Kind: ErrorKind.Validation, Message: \"The end date must be after the start date.\"}). The error can then be caught by IfError or App.OnError."
    }
  ],
  relatedTools: ["power-fx-formatter", "error-handling-standards"],
  relatedPatterns: ["power-apps-error-handling-iferror-patch", "power-apps-monitor-debug-performance-trace", "refresh-selected-request-after-patch", "power-apps-optimistic-local-update-after-patch"],
  relatedLinks: [
    { href: "/guides/power-apps-patch-vs-submitform-vs-collect", label: "Patch, SubmitForm or Collect" },
    { href: "/standards/error-handling-standards", label: "Error handling standards" },
    { href: "/guides/fix-common-power-fx-formula-errors", label: "Fix common Power Fx formula errors" },
    { href: "/errors/patch-conflicts-exist-with-changes-on-the-server", label: "Error: Conflicts exist with changes on the server" }
  ],
  sources: [
    powerFxDoc("reference/function-iferror", "Error, IfError, IsError and IsBlankOrError functions"),
    powerFxDoc("reference/object-app", "App object: OnError property"),
    powerFxDoc("reference/function-errors", "Errors function"),
    powerFxDoc("error-handling", "Error handling in Power Fx"),
    powerFxDoc("reference/function-trace", "Trace function")
  ]
};
