import { canvasDoc, code, note, ol, p, powerFxDoc, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-20";

export const slowFormulasGuide: Guide = {
  slug: "speed-up-slow-power-fx-formulas",
  title: "Speed up slow Power Fx formulas",
  shortTitle: "Speed up slow Power Fx formulas",
  description: "Six formula habits that make canvas apps slow and what to write instead: lookups inside gallery rows, repeated calculations, row-by-row saves, heavy App.OnStart, loading too much data and searching on every keystroke.",
  eyebrow: "Power Fx how-to",
  keywords: ["Power Apps slow formula", "Power Apps performance tips", "Power Apps gallery slow", "App.OnStart performance"],
  published,
  updated: published,
  quickAnswer: "Most slow canvas apps are slow because of data calls, not calculation. Look for formulas that call the data source once per row, repeat the same call, save rows one at a time, or load everything when the app starts. Fix those first: move lookups out of gallery rows, hold repeated values with With or a named formula, save many rows with one Patch, and move start-up work from App.OnStart to App.Formulas.",
  sections: [
    section(
      "find-the-slow-part",
      "First, find out what is slow",
      p("Arithmetic and text functions on values already in the app take almost no time. What takes time is a trip to SharePoint, Dataverse or another connector, and an app can make far more of those than its maker realises."),
      p("Before changing formulas, measure. Open **Advanced tools**, then **Monitor**, run the slow screen, and sort the events by duration. You are looking for three things:"),
      ul(
        "**The same request repeated many times.** This is a lookup inside a gallery row.",
        "**One request that takes seconds.** This is too much data, or a query the data source cannot run efficiently.",
        "**A long run of requests when the app opens.** This is work in `App.OnStart`."
      ),
      p("The [Monitor and Trace pattern](/patterns/power-apps-monitor-debug-performance-trace) shows how to read the results. The advice below says what is slower and why. How much faster your app gets depends on your data, so measure again after each change."),
      tool("power-fx-formatter", "Paste a long formula to see its structure. The review notes point out ForAll combined with Patch, deep nesting and likely delegation problems, which are the usual places to look.")
    ),
    section(
      "lookups-in-galleries",
      "1. LookUp inside a gallery row",
      p("A gallery shows requests, and each row needs the department name from another list. The natural formula for the label is a `LookUp`."),
      code(`// In a label inside the gallery: one request to Departments for every row
LookUp(Departments, ID = ThisItem.DepartmentId, Title)`),
      p("With 50 rows on screen, that is 50 requests, and more as the user scrolls. Microsoft's guidance calls this the N+1 problem. There are three ways out, in order of preference."),
      ul(
        "**Let the data source do the join.** A SharePoint lookup column or a Dataverse lookup brings the related value with the row, so the label is just `ThisItem.Department.Value` or `ThisItem.Department.Name`. A view on the server does the same for SQL and Dataverse.",
        "**Load a small reference table once** and look up in memory.",
        "**Store the value on the row** when it rarely changes, and accept the copy."
      ),
      code(`// Screen OnVisible: load the reference list once
ClearCollect(colDepartments, ShowColumns(Departments, ID, Title));

// In the gallery label: no request, the data is already in the app
LookUp(colDepartments, ID = ThisItem.DepartmentId, Title)`),
      p("The second option only suits small tables. A collection holds at most the data row limit, so it is right for a list of departments and wrong for a list of customers.")
    ),
    section(
      "repeated-calculations",
      "2. The same call written several times",
      p("Each time a formula says `LookUp(Requests, ID = varRequestId)`, Power Apps may ask the data source again. Formulas that read three fields this way make three requests."),
      code(`// Three requests for the same record
"Request " & LookUp(Requests, ID = varRequestId).Title &
    " for " & LookUp(Requests, ID = varRequestId).Requester.DisplayName &
    ", due " & Text(LookUp(Requests, ID = varRequestId).DueDate, "d mmm yyyy")

// One request, used three times
With(
    {request: LookUp(Requests, ID = varRequestId)},
    "Request " & request.Title &
        " for " & request.Requester.DisplayName &
        ", due " & Text(request.DueDate, "d mmm yyyy")
)`),
      p("`With` holds a value for one formula. When several controls or screens need the same value, use a named formula in `App.Formulas`. It is calculated when first needed and kept up to date, and every control refers to it by name."),
      code(`// App.Formulas
CurrentRequest = LookUp(Requests, ID = varRequestId);`),
      p("The [With pattern](/patterns/with-function-readable-power-fx-formulas) and the [named formulas pattern](/patterns/use-named-formulas-for-app-constants) go further into each.")
    ),
    section(
      "row-by-row-saves",
      "3. Saving rows one at a time",
      p("`ForAll` with `Patch` inside sends one request per row. Twenty checked rows means twenty round trips, and the user waits for all of them."),
      code(`// One request per row
ForAll(
    Filter(colTasks, IsDirty) As task,
    Patch(Tasks, LookUp(Tasks, ID = task.ID), {Done: task.Done})
)

// One Patch call for all rows
With(
    {changed: Filter(colTasks, IsDirty)},
    Patch(
        Tasks,
        ShowColumns(changed, ID),
        ForAll(changed, {Done: Done})
    )
)`),
      p("`Patch` accepts a table of records to change and a matching table of changes. The two tables must have the same number of rows in the same order. The [ForAll and Patch pattern](/patterns/forall-patch-multiple-records-power-apps) covers creating rows, error handling and the cases where row-by-row is still the right choice."),
      p("A related habit from Microsoft's guidance: when you build a collection in a loop, put `Collect` outside the `ForAll`. `Collect(colResult, ForAll(source, {…}))` updates the collection once. `ForAll(source, Collect(colResult, {…}))` updates it on every row, and everything that depends on the collection recalculates each time.")
    ),
    section(
      "app-onstart",
      "4. Too much work in App.OnStart",
      p("Everything in `App.OnStart` must finish before the user sees the first screen. Apps collect this work over time: variables, colours, user details and several collections, all loaded whether or not the first screen uses them."),
      ul(
        "**Move fixed values and calculations to `App.Formulas`.** A named formula is calculated only when something needs it, so values used on the fifth screen cost nothing at start-up.",
        "**Set the first screen with `App.StartScreen`**, not with `Navigate` in `OnStart`.",
        "**Load a screen's data in that screen's `OnVisible`**, so users who never open the screen never wait for it.",
        "**Run the remaining data calls side by side with `Concurrent`.** Calls that would run one after another start together, so the wait is closer to the longest call than to the total."
      ),
      code(`// Before: App.OnStart
Set(varBrandColor, ColorValue("#0F766E"));
Set(varUserEmail, Lower(User().Email));
ClearCollect(colStatuses, Choices(Requests.Status));

// After: App.Formulas
BrandColor = ColorValue("#0F766E");
UserEmail = Lower(User().Email);
Statuses = Choices(Requests.Status);`),
      tool("onstart-to-named-formulas", "Paste your App.OnStart formula and get the named formulas version, with a note for anything that has to stay a variable."),
      p("Microsoft describes the gain from `Concurrent` as modest and warns against using it for calls that depend on each other. The [Concurrent pattern](/patterns/power-apps-concurrent-load-data-faster) shows a safe layout.")
    ),
    section(
      "too-much-data",
      "5. Loading more data than the screen needs",
      p("The fastest request is a small one. Three checks keep requests small."),
      ul(
        "**Filter at the source.** A delegated `Filter` returns only matching rows. A non-delegated one downloads rows up to the limit and filters them on the device, which is both slower and incomplete. See [what a delegation warning means](/guides/power-apps-delegation-warning-explained).",
        "**Do not copy a data source into a collection out of habit.** `ClearCollect(colRequests, Requests)` downloads rows and columns the gallery could have fetched as needed. Point the gallery at the data source with a delegable filter. Use a collection when you need to edit rows locally before saving.",
        "**Leave explicit column selection on.** With this setting, which is on by default, Power Apps asks only for the columns your formulas use. If someone turned it off to work around a missing column, name the columns you need with `ShowColumns` and turn it back on."
      ),
      tool("power-apps-delegation-checker", "See which functions your data source can run on the server, so the filter you write is one it can delegate.")
    ),
    section(
      "search-and-galleries",
      "6. Searching on every keystroke, and reading AllItems",
      p("A gallery filtered by a search box runs a new query each time the text changes. Typing an eight-letter word sends eight queries, and seven of them are wasted."),
      ul(
        "Set the text input's **DelayOutput** property to `true`. The control then reports new text after a short delay instead of on every keystroke, so far fewer queries run.",
        "Do not filter until there is something to search for: `If(Len(txtSearch.Text) < 2, Blank(), Filter(…))` shows an empty gallery until two characters are typed.",
        "To show how many rows a gallery has loaded, use `galRequests.AllItemsCount`. Reading `galRequests.AllItems` builds a new table each time, so use it only when you need the values users entered in the rows."
      )
    ),
    section(
      "order",
      "What to fix first",
      ol(
        "Requests repeated per gallery row. This is usually the largest single gain.",
        "Work in `App.OnStart` that the first screen does not need.",
        "Non-delegated queries over large tables.",
        "Row-by-row saves.",
        "Repeated calls inside one formula.",
        "Search boxes without `DelayOutput`."
      ),
      note("Formatting, comments and the length of a formula make no difference to speed. Shortening a formula helps only when it removes a data call.")
    )
  ],
  faqs: [
    {
      question: "Why is my Power Apps gallery slow?",
      answer: "The usual cause is a formula inside the gallery row that calls the data source, such as a LookUp in a label. That runs once for every row on screen. Bring the related value in with a lookup column, or load a small reference table into a collection once and look it up in memory."
    },
    {
      question: "Does a long formula run slower than a short one?",
      answer: "Not because of its length. Line breaks, comments and spacing have no effect. A formula is slow when it makes many data calls or processes a large table on the device. A short formula with a LookUp in every gallery row is much slower than a long one that works on values already in the app."
    },
    {
      question: "Is With faster than repeating a LookUp?",
      answer: "Yes, when the repeated part calls a data source. With evaluates the value once and the rest of the formula reuses it. Three identical LookUp calls can mean three requests."
    },
    {
      question: "Should I use named formulas or App.OnStart?",
      answer: "Use named formulas in App.Formulas for fixed values and calculations. They are calculated only when needed, so they do not delay start-up. Keep App.OnStart for the few things that must run once as actions and cannot be expressed as a formula."
    },
    {
      question: "Does Concurrent make an app faster?",
      answer: "It can shorten loading when several independent data calls run at start-up, because they start together and the wait is close to the longest call. Microsoft describes the gain as modest. Do not put calls that depend on each other in the same Concurrent."
    },
    {
      question: "Is ForAll with Patch always slow?",
      answer: "It sends one request per row, so it is slow for many rows and fine for a handful. When every row gets the same kind of change, one Patch call with a table of records and a table of changes does the same work in a single call."
    }
  ],
  relatedTools: ["power-fx-formatter", "onstart-to-named-formulas", "power-apps-delegation-checker"],
  relatedPatterns: ["power-apps-monitor-debug-performance-trace", "power-apps-concurrent-load-data-faster", "forall-patch-multiple-records-power-apps", "with-function-readable-power-fx-formulas", "use-named-formulas-for-app-constants"],
  relatedLinks: [
    { href: "/guides/power-apps-delegation-warning-explained", label: "What a delegation warning means" },
    { href: "/cookbooks/power-apps-collections-cookbook", label: "Power Apps Collections Cookbook" }
  ],
  sources: [
    canvasDoc("create-performant-apps-overview", "Overview of creating performant apps"),
    canvasDoc("fast-app-page-load", "Optimize app or page load for peak performance"),
    canvasDoc("efficient-calculations", "Fast calculations"),
    canvasDoc("optimized-query-data-patterns", "Optimized query data patterns"),
    canvasDoc("small-data-payloads", "Small data payloads"),
    powerFxDoc("reference/function-concurrent", "Concurrent function"),
    powerFxDoc("reference/function-patch", "Patch function")
  ]
};

export const separatorsGuide: Guide = {
  slug: "power-fx-commas-vs-semicolons",
  title: "Commas or semicolons in Power Fx: make a copied formula work in your region",
  shortTitle: "Commas or semicolons in Power Fx",
  description: "Why Power Apps formulas use commas in some regions and semicolons in others, the three characters that change, and how to convert a formula copied from a blog or forum so it works in your Studio.",
  eyebrow: "Power Fx how-to",
  keywords: ["Power Apps semicolon instead of comma", "Power Apps formula separator", "Power Apps double semicolon", "Power Fx decimal separator"],
  published,
  updated: published,
  quickAnswer: "If your language uses a comma as the decimal separator, Power Apps expects a semicolon between arguments and a double semicolon between actions. A formula copied from an English page uses commas and single semicolons, so it fails. Convert in this order: change each ; to ;;, then each , between arguments to ;, then the decimal point in numbers to a comma.",
  sections: [
    section(
      "why",
      "Why the same formula is written two ways",
      p("Power Fx follows Excel's regional convention. In languages where `3,14` is how you write the number, the comma is taken, so it cannot also separate arguments. Power Apps moves each separator along by one."),
      table(
        ["", "Decimal point languages", "Decimal comma languages"],
        ["Examples", "English, Japanese", "French, German, Spanish, Dutch"],
        ["Decimal separator", "`.` as in `12.5`", "`,` as in `12,5`"],
        ["Between arguments, fields and list items", "`,`", "`;`"],
        ["Between actions (chaining)", "`;`", "`;;`"]
      ),
      p("The semicolon replaces the comma in three places: between function arguments, between the fields of a record, and between the items of a table."),
      p("Here is one formula in both styles."),
      code(`If(
    sldAmount.Value > 12.59,
    Notify("Valid", NotificationType.Success); Navigate(scrNext, ScreenTransition.None),
    Notify("Invalid, try again", NotificationType.Error)
)`, "Decimal point style"),
      code(`If(
    sldAmount.Value > 12,59;
    Notify("Valid"; NotificationType.Success);; Navigate(scrNext; ScreenTransition.None);
    Notify("Invalid, try again"; NotificationType.Error)
)`, "Decimal comma style")
    ),
    section(
      "what-does-not-change",
      "What does not change",
      ul(
        "**The dot in a property or field name.** `sldAmount.Value` and `ThisItem.Title` are the same everywhere.",
        "**Function names.** `Filter`, `Patch` and `If` are not translated.",
        "**Anything inside double quotes.** Text is left exactly as written, including commas and semicolons in it.",
        "**Operators** such as `&&`, `||`, `<>` and `&`."
      )
    ),
    section(
      "symptoms",
      "How to recognise a separator problem",
      p("You paste a formula from a blog, a forum answer or this site, and Studio underlines most of it. The messages are general: `Unexpected characters`, `Expected operator`, or `Invalid number of arguments`. The formula looks correct, and it is, for a different region."),
      p("Two quick checks confirm it:"),
      ul(
        "Type a simple formula such as `If(true` and look at the hint under the formula bar. It shows the separator your Studio expects.",
        "Look at a formula Studio generated for you, such as the `Items` of a new gallery. If it uses semicolons, you are in decimal comma style."
      )
    ),
    section(
      "convert-to-semicolons",
      "Convert a comma-style formula to semicolon style",
      p("Order matters. If you change commas to semicolons first, you can no longer tell the new semicolons from the ones that separate actions."),
      ol(
        "Change every `;` that separates actions to `;;`.",
        "Change every `,` that separates arguments, record fields or list items to `;`.",
        "Change the decimal point in numbers to a comma: `0.5` becomes `0,5`.",
        "Leave everything inside double quotes alone."
      ),
      code(`// Copied from an English page
Set(varRate, 0.2); Patch(Orders, galOrders.Selected, {Tax: Round(galOrders.Selected.Net * varRate, 2)})

// Converted for a decimal comma language
Set(varRate; 0,2);; Patch(Orders; galOrders.Selected; {Tax: Round(galOrders.Selected.Net * varRate; 2)})`),
      p("A find and replace in a text editor works for the first two steps. Check any text values by hand afterwards, because `Notify(\"Saved, thank you\")` contains a comma that must stay a comma.")
    ),
    section(
      "convert-to-commas",
      "Convert a semicolon-style formula to comma style",
      p("Going the other way, for example to post a formula on an English-language forum, reverse the steps and the order."),
      ol(
        "Change the decimal comma in numbers to a point: `0,5` becomes `0.5`.",
        "Change every single `;` to `,`.",
        "Change every `;;` to `;`."
      ),
      p("In a text editor, do step 3 in two moves so the steps do not collide: replace `;;` with a marker that appears nowhere else, such as `@@`, then replace `;` with `,`, then replace `@@` with `;`."),
      tool("power-fx-formatter", "The formatter reads both styles. Turn on Semicolon separators before pasting a formula written with ; and ;; and it will format it and check its brackets without changing the separators.")
    ),
    section(
      "where-the-setting-comes-from",
      "Where the setting comes from",
      p("The separators follow the language of the person editing the app. In Studio on the web, that is the language your browser reports. The style is a display setting, not part of the app."),
      p("This has three practical consequences:"),
      ul(
        "**You never convert formulas inside an app.** Power Apps stores formulas in a neutral form. A colleague in London and a colleague in Paris can open the same app, and each sees and types their own separators.",
        "**Changing what the app's users see does not change your formula bar.** Functions such as `Language` and `Text` control how the running app formats values. The formula bar follows the maker.",
        "**You can choose to author in the other style.** Set your browser's display language to English (United States), reload Studio, and the formula bar uses commas. Pasted formulas from English sources then work without conversion. Menus and control names change language too."
      ),
      note("Default control names follow the authoring language as well, so a control that would be Label1 in English gets a translated name. Renaming controls with a consistent prefix avoids mixed names when a team works in more than one language.")
    ),
    section(
      "numbers-users-type",
      "A separate matter: numbers that users type",
      p("The formula bar setting is about how you write formulas. How the app reads a number typed by a user is a different setting, and it follows the user's language."),
      code(`// Reads the text using the current user's language
Value(txtAmount.Text)

// Always reads the text as French: "12,5" is twelve and a half
Value("12,5", "fr-FR")

// Always shows the number with English separators
Text(1234.5, "#,##0.00", "en-US")`),
      p("If an app is used in several countries, pass the language to `Value` and `Text` wherever the format has to be fixed, such as a number that goes into a file or an email."),
      tool("date-format-tester", "Dates have the same issue. Try a format string against different languages before you use it in Text.")
    )
  ],
  faqs: [
    {
      question: "Why does Power Apps use semicolons instead of commas?",
      answer: "Because your language uses a comma as the decimal separator. The comma is then reserved for numbers such as 12,5, so Power Apps uses a semicolon between arguments and a double semicolon between actions. This follows the same convention as Excel."
    },
    {
      question: "What does a double semicolon mean in Power Apps?",
      answer: "It is the chaining operator in decimal comma languages. It separates two actions that run one after the other, such as Set(varA; 1);; Navigate(scrNext). In decimal point languages the same job is done by a single semicolon."
    },
    {
      question: "How do I make a formula from a blog work in my Power Apps?",
      answer: "If the formula uses commas and your Studio expects semicolons, change each semicolon between actions to a double semicolon, then each comma between arguments to a semicolon, then the decimal point in numbers to a comma. Do not change anything inside double quotes."
    },
    {
      question: "Can I change Power Apps to use commas?",
      answer: "The formula bar follows the language of the maker, which on the web comes from the browser. Setting the browser's display language to English (United States) and reloading Studio switches the formula bar to commas. The app itself is not changed."
    },
    {
      question: "Will my app break if someone in another country edits it?",
      answer: "No. Formulas are stored in a language-neutral form. Each maker sees the separators for their own language, and both can edit the same formula."
    },
    {
      question: "Does the separator affect users of the app?",
      answer: "No. Users never see formulas. How numbers and dates are shown and read in the running app depends on the user's language and on the language you pass to functions such as Text and Value."
    }
  ],
  relatedTools: ["power-fx-formatter", "date-format-tester", "csv-to-power-fx-table"],
  relatedPatterns: ["power-apps-multi-language-labels-localisation"],
  relatedLinks: [
    { href: "/guides/fix-common-power-fx-formula-errors", label: "Fix the most common Power Fx formula errors" },
    { href: "/guides/power-fx-for-excel-users", label: "Power Fx for Excel users" }
  ],
  sources: [
    canvasDoc("global-apps", "Build global support into canvas apps"),
    powerFxDoc("global", "Global support in Power Fx"),
    powerFxDoc("reference/operators", "Operators and identifiers"),
    powerFxDoc("reference/function-value", "Value function")
  ]
};

export const nestedIfGuide: Guide = {
  slug: "replace-nested-if-power-fx",
  title: "Replace nested If formulas with Switch, With and named formulas",
  shortTitle: "Replace nested If formulas",
  description: "Six ways to flatten nested If formulas in Power Apps: several conditions in one If, Switch, plain true or false formulas, Coalesce, a lookup table and With, with a long formula reduced step by step.",
  eyebrow: "Power Fx how-to",
  keywords: ["Power Apps nested If", "Power Apps If multiple conditions", "Power Apps Switch vs If", "Power Fx Switch function"],
  published,
  updated: published,
  quickAnswer: "You rarely need to nest If in Power Fx. One If accepts any number of condition and result pairs: If(Score >= 90, \"A\", Score >= 80, \"B\", \"C\"). When you are testing one value against several possible matches, use Switch. When the result is true or false, drop the If and write the condition on its own.",
  sections: [
    section(
      "if-takes-many-conditions",
      "One If, many conditions",
      p("Excel taught a generation of people to nest `IF` inside `IF`. Power Fx does not need it. After the first condition and result, you can add more pairs, and finish with a default."),
      code(`// Nested, Excel style
If(Score >= 90, "A", If(Score >= 80, "B", If(Score >= 70, "C", "F")))

// One If
If(
    Score >= 90, "A",
    Score >= 80, "B",
    Score >= 70, "C",
    "F"
)`),
      p("Conditions are checked from the top and the first true one wins, so order them from most specific to least. If no condition is true and there is no default, the result is blank."),
      p("This one change removes most nesting. The rest of this guide covers the cases where a different function says it better.")
    ),
    section(
      "switch",
      "Switch: one value, several matches",
      p("When every condition compares the same thing, `Switch` states that thing once."),
      code(`// If repeats the value on every line
If(
    ThisItem.Status.Value = "Open", Color.Green,
    ThisItem.Status.Value = "On hold", Color.Orange,
    ThisItem.Status.Value = "Closed", Color.Gray,
    Color.Black
)

// Switch names it once
Switch(
    ThisItem.Status.Value,
    "Open", Color.Green,
    "On hold", Color.Orange,
    "Closed", Color.Gray,
    Color.Black
)`),
      table(
        ["Use", "When"],
        ["`If` with one condition", "A plain yes or no decision."],
        ["`If` with several pairs", "The conditions are unrelated, or use ranges such as `>=`."],
        ["`Switch`", "One value is compared for an exact match against a list."]
      ),
      p("`Switch` evaluates its first argument once. That matters when the value comes from a `LookUp`, which the `If` version would run on every line."),
      p("`Switch` also works with ranges through a small trick: `Switch(true, Score >= 90, \"A\", Score >= 80, \"B\", \"C\")`. It is valid, but the multi-pair `If` says the same thing more plainly.")
    ),
    section(
      "true-false",
      "When the answer is true or false, drop the If",
      p("A condition already produces true or false. Wrapping it in `If` to return true or false adds nothing."),
      code(`// Visible property
If(varIsManager = true, true, false)

// The same thing
varIsManager

// DisplayMode property: one If is right here, because the results are not true and false
If(IsBlank(txtTitle.Text) || varSaving, DisplayMode.Disabled, DisplayMode.Edit)`),
      p("Nested conditions that all lead to the same result collapse into one condition with `&&` (and) or `||` (or)."),
      code(`// Nested
If(varIsManager, If(ThisItem.Status.Value = "Submitted", If(ThisItem.Amount > 1000, true, false), false), false)

// One condition
varIsManager && ThisItem.Status.Value = "Submitted" && ThisItem.Amount > 1000`),
      p("The same rule applies inside `Filter`, where it also affects delegation. `If` is not delegable, so `Filter(Requests, If(varShowAll, true, Owner.Email = varUserEmail))` downloads rows and filters them on the device. `Filter(Requests, varShowAll || Owner.Email = varUserEmail)` can be delegated.")
    ),
    section(
      "coalesce",
      "Coalesce: the first value that is not blank",
      p("A chain of `If(IsBlank(…))` that falls back from one value to the next is what `Coalesce` is for. It returns its first argument that is not blank."),
      code(`// Nested
If(
    IsBlank(ThisItem.PreferredName),
    If(IsBlank(ThisItem.FullName), "Unknown", ThisItem.FullName),
    ThisItem.PreferredName
)

// Coalesce
Coalesce(ThisItem.PreferredName, ThisItem.FullName, "Unknown")`)
    ),
    section(
      "lookup-table",
      "A lookup table in place of a long list of branches",
      p("When each branch returns several related values, such as a colour, an icon and a label for each status, the branches are really data. Put them in a table and look the row up."),
      code(`// App.Formulas
StatusStyles = Table(
    {Status: "Open",    Fill: Color.Green,  Label: "In progress"},
    {Status: "On hold", Fill: Color.Orange, Label: "Waiting"},
    {Status: "Closed",  Fill: Color.Gray,   Label: "Done"}
);

// Fill property of the badge
LookUp(StatusStyles, Status = ThisItem.Status.Value, Fill)

// Text property of the badge
LookUp(StatusStyles, Status = ThisItem.Status.Value, Label)`),
      p("Adding a status is now one new row, not an edit to every formula that branches on status. `StatusStyles` is a named formula, so it is defined once for the whole app. If the values should be editable without republishing the app, keep the table in a SharePoint list or Dataverse table and load it once.")
    ),
    section(
      "with",
      "With: name a value that several branches use",
      p("Branches often repeat the same calculation. `With` works it out once and gives it a name, which shortens every branch."),
      code(`// The date difference is written three times
If(
    DateDiff(Today(), ThisItem.DueDate, TimeUnit.Days) < 0, "Overdue",
    DateDiff(Today(), ThisItem.DueDate, TimeUnit.Days) <= 3, "Due soon",
    "On track"
)

// Named once
With(
    {daysLeft: DateDiff(Today(), ThisItem.DueDate, TimeUnit.Days)},
    If(
        daysLeft < 0, "Overdue",
        daysLeft <= 3, "Due soon",
        "On track"
    )
)`),
      p("The [With pattern](/patterns/with-function-readable-power-fx-formulas) has more examples. When the same branching is needed in many places with different inputs, a [user-defined function](/patterns/power-apps-user-defined-functions-reuse-logic) lets you write it once and call it by name.")
    ),
    section(
      "worked-example",
      "Worked example: a button label reduced in three steps",
      p("This formula sets the text of an action button. It was written one case at a time, which is how nested formulas grow."),
      code(`If(varIsManager = true, If(ThisItem.Status.Value = "Submitted", "Approve", If(ThisItem.Status.Value = "Approved", "Reopen", If(ThisItem.Status.Value = "Rejected", "Reopen", "View"))), If(ThisItem.Status.Value = "Draft", "Submit", "View"))`, "Start: five If calls on one line"),
      p("**Step 1: format it.** Nothing changes except the layout, and the two halves become visible: what a manager sees and what everyone else sees."),
      tool("power-fx-formatter", "Paste the formula to format it. The review notes flag formulas with three or more If calls and formulas nested six or more levels deep."),
      p("**Step 2: replace each chain with `Switch`.** Every inner `If` tests the same value, the status."),
      code(`If(
    varIsManager,
    Switch(
        ThisItem.Status.Value,
        "Submitted", "Approve",
        "Approved", "Reopen",
        "Rejected", "Reopen",
        "View"
    ),
    Switch(ThisItem.Status.Value, "Draft", "Submit", "View")
)`, "After step 2"),
      p("**Step 3: flatten to one list of conditions.** Read top to bottom, each line is now one rule."),
      code(`With(
    {status: ThisItem.Status.Value},
    If(
        varIsManager && status = "Submitted", "Approve",
        varIsManager && status in ["Approved", "Rejected"], "Reopen",
        !varIsManager && status = "Draft", "Submit",
        "View"
    )
)`, "After step 3"),
      p("Steps 2 and 3 are both good places to stop. Choose the one your team reads more easily. Test each rule against the original before you replace it, with one row for each combination of role and status.")
    ),
    section(
      "behavior-formulas",
      "Nested If in a button's OnSelect",
      p("In behavior formulas the nesting usually comes from validation: check one thing, then inside that check the next. Turn it round. List the problems first, each with its message, and put the real action last as the default."),
      code(`If(
    IsBlank(txtTitle.Text),
        Notify("Enter a title.", NotificationType.Error),
    IsBlank(dpDueDate.SelectedDate),
        Notify("Choose a due date.", NotificationType.Error),
    dpDueDate.SelectedDate < Today(),
        Notify("The due date is in the past.", NotificationType.Error),
    // All checks passed
    SubmitForm(frmRequest)
)`),
      p("Only one branch runs. The first failed check shows its message and the form is not submitted.")
    )
  ],
  faqs: [
    {
      question: "How do I write multiple If conditions in Power Apps?",
      answer: "Add more condition and result pairs to one If, followed by a default: If(Score >= 90, \"A\", Score >= 80, \"B\", \"C\"). Conditions are checked in order and the first true one decides the result. You do not need to nest one If inside another."
    },
    {
      question: "When should I use Switch instead of If?",
      answer: "Use Switch when one value is compared for an exact match against several possibilities, such as a status or a category. Use If when the conditions are unrelated or use ranges such as greater than."
    },
    {
      question: "Is there an IFS function in Power Fx?",
      answer: "There is no separate function, because If already does the job. If accepts any number of condition and result pairs, so Excel's IFS(a, x, b, y) becomes If(a, x, b, y)."
    },
    {
      question: "How many conditions can one If have?",
      answer: "As many as you need. If takes condition and result pairs one after another, with an optional default at the end. Once a formula has more than about six pairs, a lookup table is usually easier to maintain."
    },
    {
      question: "Does Switch work with greater than or less than?",
      answer: "Not directly, because Switch looks for an exact match. Switch(true, Score >= 90, \"A\", \"B\") works as a workaround, but If with several condition and result pairs is the clearer way to write range checks."
    },
    {
      question: "Does a nested If slow my app down?",
      answer: "Not by itself. It becomes slow when the conditions repeat a data call such as a LookUp. Put the repeated value in With so it is worked out once."
    }
  ],
  relatedTools: ["power-fx-formatter", "excel-to-power-fx", "onstart-to-named-formulas"],
  relatedPatterns: ["with-function-readable-power-fx-formulas", "use-named-formulas-for-app-constants", "power-apps-user-defined-functions-reuse-logic", "use-a-status-transition-matrix-in-power-apps"],
  relatedLinks: [
    { href: "/guides/format-power-fx-formulas", label: "Format Power Fx formulas so they are easy to review" },
    { href: "/guides/power-fx-for-excel-users", label: "Power Fx for Excel users" }
  ],
  sources: [
    powerFxDoc("reference/function-if", "If and Switch functions"),
    powerFxDoc("reference/function-with", "With function"),
    powerFxDoc("reference/object-app", "App object and named formulas"),
    canvasDoc("delegation-overview", "Understand delegation in a canvas app")
  ]
};

export const excelUsersGuide: Guide = {
  slug: "power-fx-for-excel-users",
  title: "Power Fx for Excel users: what works differently",
  shortTitle: "Power Fx for Excel users",
  description: "What carries over from Excel formulas to Power Apps and what changes: no cell references, LookUp in place of VLOOKUP, records and tables, blanks, and formulas that take action. Includes eight Excel formulas translated.",
  eyebrow: "Power Fx how-to",
  keywords: ["Power Fx vs Excel formulas", "Excel formula in Power Apps", "VLOOKUP in Power Apps", "SUMIF Power Apps"],
  published,
  updated: published,
  quickAnswer: "Power Fx was designed to feel like Excel, so operators, text in double quotes and many functions carry over. Four things change: you refer to controls and columns by name instead of cells, lookups use LookUp and Filter on tables instead of VLOOKUP on ranges, a formula never starts with an equals sign, and some formulas take action when a button is selected, which Excel formulas cannot do.",
  sections: [
    section(
      "same-idea",
      "The idea is the same: properties are cells",
      p("In Excel you type a formula into a cell, and the cell shows the result and recalculates when the cells it refers to change. In a canvas app, every property of every control works like that cell."),
      code(`// Text property of a label. It recalculates as the user types.
Value(txtQuantity.Text) * Value(txtUnitPrice.Text)`),
      p("You do not write code to refresh the label. As in a worksheet, you state what the value is and Power Apps keeps it current. If you can build a worksheet with formulas, you already know the hard part.")
    ),
    section(
      "what-carries-over",
      "What carries over unchanged",
      ul(
        "**Operators**: `+`, `-`, `*`, `/`, `^`, `&` for joining text, and `=`, `<>`, `<`, `>`, `<=`, `>=` for comparing.",
        "**Text in double quotes**, and a double quote inside text written twice.",
        "**Everyday functions** with the same arguments: `Sum`, `Average`, `Min`, `Max`, `Round`, `Abs`, `Left`, `Mid`, `Right`, `Len`, `Trim`, `Upper`, `Lower`, `Today`, `Now`, `Year`, `Month`, `Day`, `And`, `Or`, `Not`.",
        "**`If` for a simple test**: `If(Amount > 100, \"Large\", \"Small\")`.",
        "**Regional separators.** If your Excel uses semicolons between arguments, so does your Power Apps. See [commas or semicolons](/guides/power-fx-commas-vs-semicolons)."
      ),
      p("Three small differences in how things are written:"),
      ul(
        "**No leading equals sign.** Type `Sum(1, 2)`, not `=Sum(1, 2)`.",
        "**Function names are mixed case and case-sensitive.** It is `If`, `IsBlank` and `LookUp`, not `IF`, `ISBLANK` and `LOOKUP`.",
        "**`true` and `false` are lower case.**"
      )
    ),
    section(
      "no-cell-references",
      "No cell references: everything has a name",
      p("There is no `A1`. A formula refers to a control's property, a variable, or a column of a table."),
      table(
        ["In Excel", "In Power Fx", "What it refers to"],
        ["`B2`", "`txtQuantity.Text`", "What the user typed in a text input"],
        ["`B2` (a number)", "`Value(txtQuantity.Text)`", "The same, converted to a number"],
        ["`$F$1`", "`varTaxRate` or a named formula", "A value used across the app"],
        ["`C2` in a table row", "`ThisItem.Amount`", "A column of the current row in a gallery"],
        ["`A2:D500`", "`Orders`", "A whole table, by name"]
      ),
      p("Two things follow from this. A text input always gives you text, so use `Value` before arithmetic. And a column name with a space needs single quotes: `ThisItem.'Unit Price'`.")
    ),
    section(
      "lookups",
      "Lookups: LookUp and Filter in place of VLOOKUP",
      p("`VLOOKUP` finds a row by matching the first column of a range, then returns a column by number. `LookUp` finds a row by any condition you write, and returns a column by name."),
      code(`// Excel
=VLOOKUP(A2, Products!A:D, 3, FALSE)

// Power Fx
LookUp(Products, SKU = txtSku.Text, Price)`),
      p("There is no column counting and the lookup column does not have to be first. The condition can combine columns: `LookUp(Prices, SKU = txtSku.Text && Region = drpRegion.Selected.Value, Price)`. When nothing matches, `LookUp` returns blank, not an error."),
      p("`Filter` returns every matching row as a table. The conditional totals are built from it."),
      table(
        ["Excel", "Power Fx"],
        ["`=SUMIF(Orders!B:B, \"West\", Orders!D:D)`", "`Sum(Filter(Orders, Region = \"West\"), Amount)`"],
        ["`=COUNTIF(Orders!B:B, \"West\")`", "`CountRows(Filter(Orders, Region = \"West\"))`"],
        ["`=AVERAGEIF(Orders!B:B, \"West\", Orders!D:D)`", "`Average(Filter(Orders, Region = \"West\"), Amount)`"],
        ["`=XLOOKUP(A2, Products!A:A, Products!B:B, \"None\")`", "`Coalesce(LookUp(Products, SKU = txtSku.Text, Name), \"None\")`"]
      ),
      tool("excel-to-power-fx", "Paste an Excel formula and say what each cell stands for. The translator renames the functions, rewrites the lookups and conditional totals, and lists anything you need to finish by hand."),
      note("One thing Excel never made you think about: on a large SharePoint list or Dataverse table, a total over a filter may only cover the first rows. Read [what a delegation warning means](/guides/power-apps-delegation-warning-explained) before you rely on Sum or CountRows over a data source.")
    ),
    section(
      "records-and-tables",
      "Records and tables are values",
      p("An Excel formula returns one value, or a block of cells. A Power Fx formula can return a whole row or a whole table, and pass it to another function."),
      ul(
        "A **record** is one row of named values, written in curly braces: `{Title: \"New laptop\", Amount: 1200}`.",
        "A **table** is a list of records. `[10, 20, 30]` is a one-column table, and `Filter(Orders, Amount > 100)` returns a table.",
        "The **dot** reads a field from a record: `galOrders.Selected.Amount`, or `LookUp(Products, SKU = \"A-100\").Price`."
      ),
      p("This is why a gallery's `Items` property can be a formula. It is one formula that returns the table to show, where Excel would need a formula filled down a column.")
    ),
    section(
      "same-name-different-behaviour",
      "Same name, different behaviour",
      table(
        ["Function or feature", "In Excel", "In Power Fx"],
        ["`IF` with several tests", "Nested `IF`, or `IFS`", "One `If` with several condition and result pairs"],
        ["`SEARCH`", "Finds text inside text, ignoring case", "`Search` filters a table. To find text in text, use `Find`, which is case-sensitive, or the `in` operator, which ignores case"],
        ["Empty cell", "Counts as 0 or as empty text", "Is blank. Test it with `IsBlank`, replace it with `Coalesce`"],
        ["`DATEDIF`", "`DATEDIF(start, end, \"d\")`", "`DateDiff(start, end, TimeUnit.Days)`"],
        ["`EDATE`", "`EDATE(date, 3)`", "`DateAdd(date, 3, TimeUnit.Months)`"],
        ["`CONCAT` and `TEXTJOIN` on a range", "Joins cells", "`Concat(Orders, Title, \", \")` joins a column of a table"],
        ["Errors", "`#N/A`, `#VALUE!` in the cell", "Blank or an error value. Catch with `IfError`"]
      ),
      p("Dates behave as you would hope. `Today() + 7` is a week from today, and `Text(Today(), \"dd mmm yyyy\")` formats a date with the format codes you know from Excel."),
      tool("date-format-tester", "Check a date format string and see the result in different languages and time zones.")
    ),
    section(
      "behavior-formulas",
      "The new idea: formulas that take action",
      p("An Excel formula can only calculate. A canvas app also has to save a record, move to another screen and show a message. Power Fx handles this with behavior formulas. These go in properties that start with On, such as a button's `OnSelect`, and they run when the event happens."),
      code(`// OnSelect of a Save button
Patch(Orders, Defaults(Orders), {Title: txtTitle.Text, Amount: Value(txtAmount.Text)});
Notify("Order saved.", NotificationType.Success);
Navigate(scrOrders)`),
      p("The semicolon runs the actions in order. This is the one place Power Fx reads like a list of instructions. Functions that change things, such as `Patch`, `Set`, `Collect` and `Navigate`, are only allowed here. Put one in a `Text` or `Visible` property and Studio reports an error, because those properties must stay pure calculations, like cells."),
      p("Variables are the other new idea. `Set(varTaxRate, 0.2)` stores a value you can read anywhere. Excel users tend to overuse them. If a value can be calculated from other values, write it as a formula, or as a named formula in `App.Formulas`, and let it recalculate on its own, as a cell would.")
    ),
    section(
      "translations",
      "Eight Excel formulas translated",
      table(
        ["Task", "Excel", "Power Fx"],
        ["Join text", "`=A2 & \" \" & B2`", "`txtFirst.Text & \" \" & txtLast.Text`"],
        ["Grade bands", "`=IFS(A2>=90,\"A\",A2>=80,\"B\",TRUE,\"C\")`", "`If(Score >= 90, \"A\", Score >= 80, \"B\", \"C\")`"],
        ["Look up a price", "`=VLOOKUP(A2,Products!A:C,3,FALSE)`", "`LookUp(Products, SKU = txtSku.Text, Price)`"],
        ["Total for a region", "`=SUMIF(B:B,\"West\",D:D)`", "`Sum(Filter(Orders, Region = \"West\"), Amount)`"],
        ["Fallback on error", "`=IFERROR(A2/B2,0)`", "`IfError(Value(txtA.Text) / Value(txtB.Text), 0)`"],
        ["Days until a date", "`=A2-TODAY()`", "`DateDiff(Today(), dpDue.SelectedDate, TimeUnit.Days)`"],
        ["Is the cell empty", "`=ISBLANK(A2)`", "`IsBlank(txtTitle.Text)`"],
        ["First three letters, upper case", "`=UPPER(LEFT(A2,3))`", "`Upper(Left(txtCode.Text, 3))`"]
      ),
      p("Once a translated formula grows past a line or two, format it so the structure is visible."),
      tool("power-fx-formatter", "Paste any Power Fx formula to lay it out with one argument per line and check its brackets.")
    )
  ],
  faqs: [
    {
      question: "Is Power Fx the same as Excel formulas?",
      answer: "It is based on Excel and shares its operators, its way of writing text and many function names. The main differences are that Power Fx refers to controls and columns by name instead of cells, works with whole records and tables, and has behavior formulas that take actions such as saving data."
    },
    {
      question: "What is the Power Apps equivalent of VLOOKUP?",
      answer: "LookUp. It takes a table, a condition and the column to return: LookUp(Products, SKU = txtSku.Text, Price). The lookup column does not need to be first, the result column is named instead of counted, and a missing match returns blank."
    },
    {
      question: "How do I write SUMIF in Power Apps?",
      answer: "Combine Sum with Filter: Sum(Filter(Orders, Region = \"West\"), Amount). COUNTIF becomes CountRows(Filter(Orders, Region = \"West\")), or CountIf(Orders, Region = \"West\")."
    },
    {
      question: "Why does my Excel formula not work when I paste it into Power Apps?",
      answer: "Three things usually need changing. Remove the equals sign at the start, replace cell references with control or column names, and correct the function names, which are mixed case in Power Fx. Lookup and conditional total functions need rewriting with LookUp and Filter."
    },
    {
      question: "Are Power Fx function names case-sensitive?",
      answer: "Yes. Write If, IsBlank and LookUp exactly like that. Studio suggests the right name as you type, so picking from the list avoids the problem."
    },
    {
      question: "Can I use cell references such as A1 in Power Apps?",
      answer: "No. Power Apps has no grid of cells. A formula refers to a control property such as txtQuantity.Text, a variable, or a column of a table such as ThisItem.Amount."
    }
  ],
  relatedTools: ["excel-to-power-fx", "power-fx-formatter", "date-format-tester", "csv-to-power-fx-table"],
  relatedPatterns: ["with-function-readable-power-fx-formulas", "power-apps-error-handling-iferror-patch", "groupby-sum-count-gallery-power-apps"],
  relatedLinks: [
    { href: "/guides/replace-nested-if-power-fx", label: "Replace nested If formulas" },
    { href: "/guides/fix-common-power-fx-formula-errors", label: "Fix the most common Power Fx formula errors" },
    { href: "/cookbooks/power-apps-collections-cookbook", label: "Power Apps Collections Cookbook" }
  ],
  sources: [
    powerFxDoc("overview", "Microsoft Power Fx overview"),
    powerFxDoc("reference/function-filter-lookup", "Filter, Search and LookUp functions"),
    powerFxDoc("reference/function-if", "If and Switch functions"),
    canvasDoc("working-with-formulas-in-depth", "Understand behavior formulas"),
    powerFxDoc("data-types", "Data types in Power Fx")
  ]
};
