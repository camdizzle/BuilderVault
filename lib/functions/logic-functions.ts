import { canvasDoc, code, note, p, powerFxDoc, section, table, ul } from "../guides/types";
import { fxRef, type FunctionPage } from "./types";

const published = "2026-11-21";
const category = "Logic, blanks and errors" as const;
const ifDoc = fxRef("function-if", "If and Switch functions");
const blankDoc = fxRef("function-isblank-isempty", "Blank, Coalesce, IsBlank and IsEmpty functions");
const errorDoc = fxRef("function-iferror", "Error, IfError, IsError and IsBlankOrError functions");

export const ifFunction: FunctionPage = {
  slug: "if",
  name: "If",
  category,
  title: "If function in Power Apps: conditions, else, and several branches",
  description: "How the Power Fx If function returns a value or runs actions based on conditions, how to test several conditions without nesting, and how to combine conditions with And and Or.",
  keywords: ["Power Apps If function", "If else Power Apps", "If multiple conditions Power Apps", "If And Or Power Fx", "nested If Power Apps"],
  published,
  updated: published,
  quickAnswer: "If(Condition, ThenResult, ElseResult) returns ThenResult when the condition is true and ElseResult otherwise. For several conditions, list them in pairs, If(C1, R1, C2, R2, Default), instead of nesting one If inside another. The first true condition wins. With no else result and no true condition, If returns blank. In a button's OnSelect, the results can be actions, and only the chosen branch runs.",
  syntax: `If( Condition, ThenResult [, DefaultResult ] )
If( Condition1, ThenResult1 [, Condition2, ThenResult2, ... [, DefaultResult ] ] )`,
  arguments: [
    ["`Condition`", "Required", "A formula that gives true or false, usually a comparison such as `Score >= 50`."],
    ["`ThenResult`", "Required", "What to return or do when the matching condition is true."],
    ["`DefaultResult`", "Optional", "What to return or do when no condition is true. Blank if you leave it out."]
  ],
  returns: "The result of the branch chosen, or blank.",
  usableIn: "Any formula",
  delegation: "`If` around a column inside `Filter` is not delegated. Inside Filter, use `&&` and `||` instead.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A label's Text
If(ThisItem.DueDate < Today(), "Overdue", "On time")

// A colour from several conditions, no nesting
If(
    ThisItem.Score >= 80, Color.Green,
    ThisItem.Score >= 50, Color.Orange,
    Color.Red
)

// Actions in a button
If(
    frmRequest.Valid,
    SubmitForm(frmRequest),
    Notify("Fill in the required fields", NotificationType.Warning)
)`),
      p("Conditions are checked in order and checking stops at the first true one. In the colour example, a score of 85 is green and never reaches the second test, which is why the highest threshold comes first.")
    ),
    section(
      "and-or",
      "Combining conditions",
      table(
        ["You mean", "Write", "Or"],
        ["Both", "`a && b`", "`And(a, b)`"],
        ["Either", "`a || b`", "`Or(a, b)`"],
        ["Not", "`!a`", "`Not(a)`"]
      ),
      code(`If(
    ThisItem.Status.Value = "Open" && ThisItem.DueDate < Today(),
    "Overdue",
    ""
)`),
      p("When every condition compares the same value with fixed values, [Switch](/functions/switch) is shorter. The [nested If guide](/guides/replace-nested-if-power-fx) shows how to turn a deep stack of If into a flat one.")
    ),
    section(
      "types",
      "Both branches should return the same type",
      p("A property such as `Text` or `Fill` expects one type. If one branch returns text and the other a number, Power Apps converts where it can, or shows a type error where it cannot. Keep both branches the same type, and use `Blank()` for \"nothing\" rather than an empty string when the property is not text.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Nesting If inside If** for a list of conditions. Use the flat form with pairs.",
        "**Comparing with `=` to blank.** `If(txtName.Text = \"\", ...)` misses blank values from data sources. Use `IsBlank`.",
        "**Using If inside Filter on a large source.** It stops delegation. Use `||` and `&&`.",
        "**Wrong order of thresholds.** The first true condition wins, so test the narrowest case first."
      )
    )
  ],
  faqs: [
    { question: "How do I write If else in Power Apps?", answer: "Give a third argument: If(Condition, ValueIfTrue, ValueIfFalse). Without it, If returns blank when the condition is false." },
    { question: "How do I use If with multiple conditions in Power Apps?", answer: "For several outcomes, list condition and result pairs: If(C1, R1, C2, R2, Default). For one outcome that needs two things to be true, join them with &&, or with || for either." },
    { question: "Can If run more than one action?", answer: "Yes. In a behaviour formula, separate actions with a semicolon inside the branch, as in If(x, Set(a, 1); Notify(\"Done\"), Back()). In regions that use a comma as the decimal separator, the chaining operator is a double semicolon." }
  ],
  relatedFunctions: ["switch", "isblank", "iferror", "with"],
  relatedGuides: ["replace-nested-if-power-fx", "power-fx-commas-vs-semicolons"],
  relatedErrors: ["incompatible-types-for-comparison-power-apps"],
  relatedPatterns: ["use-a-status-transition-matrix-in-power-apps"],
  relatedTools: ["power-fx-formatter"],
  sources: [ifDoc, fxRef("function-logicals", "And, Or and Not functions")]
};

export const switchFunction: FunctionPage = {
  slug: "switch",
  name: "Switch",
  category,
  title: "Switch function in Power Apps: match one value against many",
  description: "How the Power Fx Switch function compares one value with a list of matches, when to use it instead of If, how to set a default, and how to match ranges with Switch(true, ...).",
  keywords: ["Power Apps Switch function", "Switch vs If Power Apps", "Switch default value", "Switch true Power Fx", "Switch status colour"],
  published,
  updated: published,
  quickAnswer: "Switch(Value, Match1, Result1, Match2, Result2, Default) works out the value once and returns the result for the first match that equals it exactly, or the default when nothing matches. Use it instead of If when every test compares the same value with fixed values, such as a status or a screen name.",
  syntax: `Switch( Formula, Match1, Result1 [, Match2, Result2, ... [, DefaultResult ] ] )`,
  arguments: [
    ["`Formula`", "Required", "The value to test. It is evaluated once."],
    ["`Match1`, ...", "Required", "Values to compare with it. The comparison is an exact match."],
    ["`Result1`, ...", "Required", "What to return or do for that match."],
    ["`DefaultResult`", "Optional", "What to return or do when nothing matches. Blank if you leave it out."]
  ],
  returns: "The result for the first match, the default, or blank.",
  usableIn: "Any formula",
  delegation: "Not delegated when used on a column inside `Filter`.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A status colour
Switch(
    ThisItem.Status.Value,
    "Approved", Color.Green,
    "Rejected", Color.Red,
    "Pending", Color.Orange,
    Color.Gray
)

// The same with If, repeating the value each time
If(
    ThisItem.Status.Value = "Approved", Color.Green,
    ThisItem.Status.Value = "Rejected", Color.Red,
    ThisItem.Status.Value = "Pending", Color.Orange,
    Color.Gray
)`),
      p("Both give the same result. Switch names the value once and evaluates it once, which is shorter and avoids repeating a slow formula, such as a `LookUp`.")
    ),
    section(
      "ranges",
      "Ranges and other conditions",
      p("Switch matches exact values, so a range such as \"80 or more\" needs a condition. A common trick is to switch on `true` and write a condition as each match."),
      code(`Switch(
    true,
    ThisItem.Score >= 80, "A",
    ThisItem.Score >= 50, "B",
    "C"
)`),
      p("This works, but it is the flat form of `If` in disguise. Many teams prefer `If` for ranges and keep Switch for exact matches, so the intent is clear.")
    ),
    section(
      "actions",
      "Actions",
      code(`// A menu gallery's OnSelect
Switch(
    ThisItem.Screen,
    "Home", Navigate(scrHome),
    "Requests", Navigate(scrRequests),
    "Settings", Navigate(scrSettings)
)`),
      p("Only the matching branch runs.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Switching on a Choice record.** `Switch(ThisItem.Status, \"Approved\", ...)` compares a record with text. Use `ThisItem.Status.Value`.",
        "**Expecting a partial or case-insensitive match.** Matches are exact. Use `Lower()` on the value and the matches if users type it.",
        "**Forgetting the default.** Without one, an unexpected value gives blank, which may hide a control or leave a colour empty."
      )
    )
  ],
  faqs: [
    { question: "When should I use Switch instead of If in Power Apps?", answer: "Use Switch when every test compares one value with a fixed value, such as a status. Use If when the tests are different conditions, ranges, or involve more than one value." },
    { question: "Does Switch have a default?", answer: "Yes. Add one more argument after the last match and result pair. It is returned when nothing matches. Without it, Switch returns blank." },
    { question: "Can Switch match more than one value to the same result?", answer: "Not in one match. Repeat the result for each value, or use If with || for the values that share a result." }
  ],
  relatedFunctions: ["if", "navigate", "coalesce"],
  relatedGuides: ["replace-nested-if-power-fx"],
  relatedErrors: [],
  relatedPatterns: ["use-a-status-transition-matrix-in-power-apps"],
  relatedTools: ["power-fx-formatter"],
  sources: [ifDoc]
};

export const isBlankFunction: FunctionPage = {
  slug: "isblank",
  name: "IsBlank, IsEmpty and Blank",
  category,
  title: "IsBlank and IsEmpty in Power Apps: test for missing values",
  description: "How the Power Fx IsBlank, IsEmpty and Blank functions test for empty values and empty tables, why IsBlank treats empty text as blank, and what to use in a delegable SharePoint filter.",
  keywords: ["Power Apps IsBlank", "IsEmpty Power Apps", "IsBlank vs IsEmpty", "Blank function Power Apps", "IsBlank delegation SharePoint"],
  published,
  updated: published,
  quickAnswer: "IsBlank(Value) is true when a value is blank or empty text, which is what you want for text inputs, dropdowns and nullable columns. IsEmpty(Table) is true when a table has no records. Blank() returns a blank value, which you can patch into a column to clear it. IsBlank is not delegated to SharePoint, so in a filter over a large list write Column = Blank().",
  syntax: `IsBlank( Value )
IsEmpty( Table )
Blank()`,
  arguments: [
    ["`Value`", "Required (IsBlank)", "The value to test."],
    ["`Table`", "Required (IsEmpty)", "The table to test for records."]
  ],
  returns: "`IsBlank` and `IsEmpty` return true or false. `Blank` returns a blank value.",
  usableIn: "Any formula",
  delegation: "`IsBlank` delegates to Dataverse, except on choice columns, but not to SharePoint. On SharePoint, `Column = Blank()` delegates.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Disable Save until a title is typed
If(IsBlank(txtTitle.Text), DisplayMode.Disabled, DisplayMode.Edit)

// Nothing selected in a dropdown
IsBlank(drpStatus.Selected.Value)

// No results in a gallery: show an empty-state label
IsEmpty(galRequests.AllItems)

// Clear a column
Patch(Requests, galRequests.Selected, { DueDate: Blank() })`)
    ),
    section(
      "blank-vs-empty",
      "Blank, empty text and empty tables",
      table(
        ["Value", "`IsBlank`", "`= Blank()`", "`IsEmpty`"],
        ["Blank, such as a null column", "true", "true", "not for values"],
        ["Empty text `\"\"`", "true", "false", "not for values"],
        ["A table with no records", "false", "false", "true"],
        ["A table with records", "false", "false", "false"]
      ),
      p("`IsBlank` counts empty text as blank on purpose, because some controls and data sources use an empty string for \"nothing\". `= Blank()` does not. That difference matters in the SharePoint workaround below, because a text column that holds an empty string is not matched by `= Blank()`.")
    ),
    section(
      "sharepoint",
      "Filtering for blanks in SharePoint",
      code(`// Not delegated to SharePoint
Filter(Requests, IsBlank(AssignedTo))

// Delegated
Filter(Requests, AssignedTo = Blank())`),
      p("Microsoft's SharePoint connector page lists `IsBlank` as not delegable and suggests the `= Blank()` form, with the caveat above about empty strings.")
    ),
    section(
      "errors",
      "Blank or error?",
      p("Before formula-level error handling was turned on for all apps, an error often showed up as blank, so older apps used `IsBlank` to catch failures. Errors are now separate values. If an older formula relied on that, `IsBlankOrError` keeps the old behaviour, and [IfError](/functions/iferror) is the modern way to handle failures.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Using IsBlank on a table.** An empty table is not blank. Use IsEmpty.",
        "**Using IsBlank in a large SharePoint filter.** Use `= Blank()`.",
        "**Testing `txtName.Text = \"\"`.** It misses blank values. IsBlank covers both."
      )
    )
  ],
  faqs: [
    { question: "What is the difference between IsBlank and IsEmpty?", answer: "IsBlank tests a single value for blank or empty text. IsEmpty tests a table for having no records. An empty table is not blank, so IsBlank returns false for it." },
    { question: "How do I set a column to blank with Patch?", answer: "Patch the column with Blank(), as in Patch(Requests, ThisItem, { DueDate: Blank() }). The data source must allow empty values in that column." },
    { question: "Why is IsBlank not delegable to SharePoint?", answer: "SharePoint does not support it on the server. Use Column = Blank() inside Filter instead, which SharePoint can run, keeping in mind that it does not match empty text." }
  ],
  relatedFunctions: ["coalesce", "if", "iferror", "filter"],
  relatedGuides: ["power-apps-delegation-warning-explained"],
  relatedErrors: [],
  relatedPatterns: ["power-apps-empty-state-gallery", "avoid-delegation-warnings-sharepoint-filters"],
  relatedTools: ["power-fx-formatter", "power-apps-delegation-checker"],
  sources: [blankDoc, canvasDoc("connections/connection-sharepoint-online", "Connect to SharePoint from a canvas app: delegable functions")]
};

export const coalesceFunction: FunctionPage = {
  slug: "coalesce",
  name: "Coalesce",
  category,
  title: "Coalesce function in Power Apps: use a fallback when a value is blank",
  description: "How the Power Fx Coalesce function returns the first value that is not blank or empty text, how it replaces If(IsBlank(...)), and the type rule that catches people out.",
  keywords: ["Power Apps Coalesce", "Coalesce default value Power Apps", "If IsBlank alternative", "Coalesce empty string", "Power Fx null fallback"],
  published,
  updated: published,
  quickAnswer: "Coalesce(Value1, Value2, ...) returns the first argument that is not blank and not empty text. Coalesce(ThisItem.Nickname, ThisItem.FullName) shows the nickname when there is one and the full name otherwise. All the arguments must be the same type. If every one is blank, Coalesce returns blank.",
  syntax: `Coalesce( Value1 [, Value2, ... ] )`,
  arguments: [
    ["`Value1`, `Value2`, ...", "At least one", "Values to try in order. Evaluation stops at the first that is not blank or empty text, so later values are not worked out."]
  ],
  returns: "The first value that is not blank or empty text, or blank. The result has the arguments' common type.",
  usableIn: "Any formula",
  delegation: "Not relevant on its own. Like any function, wrapping a column in Coalesce inside a Filter stops delegation.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A fallback for a missing value
Coalesce(ThisItem.Nickname, ThisItem.FullName)

// A default for an optional input
Coalesce(txtQuantity.Text, "1")

// A setting from the app, then a default
Coalesce(varTheme, Param("theme"), "Light")

// Turn empty text into a real blank before saving
Patch(Contacts, ThisItem, { Phone: Coalesce(txtPhone.Text) })`),
      p("The last example uses one argument. Because Coalesce returns blank when every argument is blank or empty, `Coalesce(\"\")` is blank, so the column is cleared instead of being set to an empty string.")
    ),
    section(
      "vs-if",
      "Coalesce instead of If and IsBlank",
      code(`// Long form
If(Not(IsBlank(ThisItem.Nickname)), ThisItem.Nickname, ThisItem.FullName)

// Same result
Coalesce(ThisItem.Nickname, ThisItem.FullName)`),
      p("Microsoft describes Coalesce as the shorter equivalent, and it evaluates each value only once, which matters when the value is a `LookUp`.")
    ),
    section(
      "types",
      "Every argument must be the same type",
      p("You cannot mix a number with text, or a date with text. `Coalesce(ThisItem.Amount, \"Not set\")` is an error. Convert first, so both arguments are text."),
      code(`Coalesce(Text(ThisItem.Amount, "#,##0"), "Not set")`),
      note("Coalesce treats empty text as blank, like `IsBlank`. If you need to keep an intentional empty string, test with `= Blank()` instead.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Mixing types.** Convert numbers and dates with `Text` first.",
        "**Expecting 0 or false to be skipped.** Only blank and empty text are skipped. Zero and false are real values.",
        "**Using it in Power Automate.** Power Automate has its own `coalesce` expression, which skips null but not empty text. See the [Power Automate coalesce pattern](/patterns/coalesce-empty-null-handling-power-automate)."
      )
    )
  ],
  faqs: [
    { question: "What does Coalesce do in Power Apps?", answer: "It returns the first of its arguments that is not blank and not empty text. Use it to give a fallback value without writing If(IsBlank(...))." },
    { question: "Does Coalesce treat 0 as blank?", answer: "No. Zero, false and a date are all values, so Coalesce returns them. Only blank and empty text are skipped." },
    { question: "Why does Coalesce show a type error?", answer: "All arguments must be the same type. Mixing a number column and a text default fails. Convert the number with Text so both are text." }
  ],
  relatedFunctions: ["isblank", "if", "text"],
  relatedGuides: [],
  relatedErrors: [],
  relatedPatterns: ["coalesce-empty-null-handling-power-automate"],
  relatedTools: ["power-fx-formatter"],
  sources: [blankDoc]
};

export const ifErrorFunction: FunctionPage = {
  slug: "iferror",
  name: "IfError and IsError",
  category,
  title: "IfError function in Power Apps: catch errors and stop on failure",
  description: "How the Power Fx IfError and IsError functions replace an error with a value, stop a chain of saves at the first failure, report the message with FirstError, and how they differ from App.OnError.",
  keywords: ["Power Apps IfError", "IfError Patch", "FirstError Message", "IsError Power Apps", "error handling Power Fx"],
  published,
  updated: published,
  quickAnswer: "IfError(Value, Fallback) returns the value, or the fallback if the value is an error. With pairs, IfError(Action1, OnFail1, Action2, OnFail2, OnSuccess), it runs the actions in order and stops at the first that fails, which is the cleanest way to save and only move on when the save worked. Inside a fallback, FirstError.Message holds the error text. IsError(Value) just tests.",
  syntax: `IfError( Value1, Replacement1 [, Value2, Replacement2, ... [, DefaultResult ] ] )
IsError( Value )
IsBlankOrError( Value )`,
  arguments: [
    ["`Value1`, ...", "Required", "Formulas to try, in order."],
    ["`Replacement1`, ...", "Required", "What to return or do if the matching value is an error. Evaluation stops there."],
    ["`DefaultResult`", "Optional", "What to return or do if no value was an error. Without it, the last value is returned."],
    ["`Value`", "Required (IsError)", "The formula to test."]
  ],
  returns: "A value or the result of the replacement chosen. `IsError` and `IsBlankOrError` return true or false.",
  usableIn: "Any formula",
  delegation: "Not relevant: IfError handles results, not queries.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A safe calculation
IfError(Value(txtAmount.Text) / Value(txtCount.Text), 0)

// Save, then go back only if it worked
IfError(
    Patch(Requests, galRequests.Selected, { Status: { Value: "Closed" } }),
    Notify("Could not save: " & FirstError.Message, NotificationType.Error),
    Notify("Saved", NotificationType.Success); Back()
)

// Two saves: the second runs only if the first worked
IfError(
    Patch(Orders, Defaults(Orders), { Title: txtTitle.Text }),
    Notify("Order not saved", NotificationType.Error),
    Patch(AuditLog, Defaults(AuditLog), { Action: "Order created" }),
    Notify("Order saved but not logged", NotificationType.Warning)
)`),
      p("Without IfError, formulas chained with `;` all run even if one fails: the scope of an error is the formula it happened in. IfError is how you make the second step depend on the first.")
    ),
    section(
      "first-error",
      "Reading the error",
      p("Inside a replacement, `FirstError` is the first error found and `AllErrors` is a table of all of them. Each has `Message`, `Kind`, `Source` and `Observed`."),
      code(`IfError(
    Patch(Requests, varRecord, { Title: txtTitle.Text }),
    Notify(
        "Save failed (" & Text(FirstError.Kind) & "): " & FirstError.Message,
        NotificationType.Error
    )
)`),
      p("`ErrorKind` values include `ErrorKind.Network`, `ErrorKind.Validation`, `ErrorKind.Conflict` and `ErrorKind.MissingRequired`. Test them when different failures need different messages.")
    ),
    section(
      "types",
      "Type matching",
      p("IfError returns one of its arguments, so they must be compatible types. `IfError(1/x, \"#DIV/0!\")` fails, because the fallback text is converted to the number type of the first argument. Convert the first argument instead: `IfError(Text(1/x), \"#DIV/0!\")`. When the results are actions, as in the save examples, the types do not matter because nothing is returned to a property.")
    ),
    section(
      "app-onerror",
      "IfError or App.OnError",
      table(
        ["", "IfError", "App.OnError"],
        ["Where", "Around one formula", "Once, on the App object"],
        ["Runs when", "That formula fails", "Any error is not handled elsewhere"],
        ["Good for", "Saves and steps that need a specific message or must stop", "Logging and a general message for everything else"]
      ),
      p("The [IfError and App.OnError guide](/guides/power-fx-iferror-and-app-onerror) covers both, and the [IfError with Patch pattern](/patterns/power-apps-error-handling-iferror-patch) is a ready-made save button.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Putting the success steps after IfError with `;`.** They run even after a failure. Put them in the last argument.",
        "**Mismatched types** in a value-returning IfError. Convert so both sides are the same type.",
        "**Swallowing the error.** A fallback of `false` with no message leaves the user guessing. Show `FirstError.Message` or log it."
      )
    )
  ],
  faqs: [
    { question: "How do I check if Patch failed in Power Apps?", answer: "Wrap it in IfError: IfError(Patch(...), Notify(FirstError.Message, NotificationType.Error), Notify(\"Saved\")). The second argument runs on failure and the last on success." },
    { question: "What is FirstError in Power Apps?", answer: "Inside the replacement argument of IfError, FirstError is a record describing the first error, with Message, Kind, Source and Observed. AllErrors is a table of every error." },
    { question: "What is the difference between IfError and IsError?", answer: "IsError only tests and returns true or false. IfError tests and also supplies a replacement value or action, and can stop a sequence of actions at the first failure." }
  ],
  relatedFunctions: ["patch", "notify", "if", "isblank"],
  relatedGuides: ["power-fx-iferror-and-app-onerror"],
  relatedErrors: ["network-error-patch-requested-operation-is-invalid", "patch-conflicts-exist-with-changes-on-the-server"],
  relatedPatterns: ["power-apps-error-handling-iferror-patch"],
  relatedTools: ["power-fx-formatter", "patch-formula-builder"],
  sources: [errorDoc, powerFxDoc("error-handling", "Error handling in Power Fx")]
};

export const withFunction: FunctionPage = {
  slug: "with",
  name: "With",
  category,
  title: "With function in Power Apps: name values inside a formula",
  description: "How the Power Fx With function gives names to values for one formula, avoids repeating a LookUp, holds the result of Patch, and when to use it instead of a variable.",
  keywords: ["Power Apps With function", "With vs Set Power Apps", "local variable Power Fx", "With LookUp Power Apps", "readable Power Fx formulas"],
  published,
  updated: published,
  quickAnswer: "With({ name: value, ... }, Formula) works out the values once and lets the formula use them by name. The names exist only inside that formula, so nothing leaks into the rest of the app. Use it to avoid repeating a LookUp, to break a long formula into named steps, and to hold the record returned by Patch. Unlike Set, it works in any property.",
  syntax: `With( Record, Formula )`,
  arguments: [
    ["`Record`", "Required", "A record whose fields become names, usually written inline as `{ name1: value1, name2: value2 }`."],
    ["`Formula`", "Required", "The formula that uses the names. It can return a value or, in a behaviour formula, take actions."]
  ],
  returns: "The result of `Formula`. If `Record` is an error, that error is returned and the formula is not evaluated.",
  usableIn: "Any formula",
  delegation: "With holds its values in memory, so a table named in With is not delegated when you filter it later in the formula.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Look up once, use twice
With(
    { me: LookUp(Employees, Email = User().Email) },
    me.FirstName & " (" & me.Department & ")"
)

// Named steps in a calculation
With(
    { net: ThisItem.Quantity * ThisItem.UnitPrice, rate: 0.2 },
    Text(net * (1 + rate), "$#,##0.00")
)

// Hold the record Patch returns
With(
    { saved: Patch(Requests, Defaults(Requests), { Title: txtTitle.Text }) },
    Navigate(scrDetails, ScreenTransition.None, { selectedID: saved.ID })
)`)
    ),
    section(
      "vs-variables",
      "With, Set or UpdateContext",
      table(
        ["", "With", "Set", "UpdateContext"],
        ["Scope", "One formula", "Whole app", "One screen"],
        ["Where it works", "Any property", "Behaviour formulas", "Behaviour formulas"],
        ["Keeps its value", "Only while the formula runs", "Until changed or the app closes", "Until changed or the app closes"]
      ),
      p("Microsoft prefers With over variables where it fits, because it is self-contained. The [comparison guide](/guides/power-fx-set-vs-updatecontext-vs-with) goes through when each is right.")
    ),
    section(
      "delegation",
      "A note on tables",
      p("Microsoft's delegation article says With, Set and UpdateContext hold tables as in-memory collections. `With({ open: Filter(Requests, Status.Value = \"Open\") }, Filter(open, DueDate < Today()))` delegates the first Filter but not the second, and there is no warning. Keep filters on large sources in one Filter call instead.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Expecting the name outside the formula.** With names exist only inside With. Use Set for a value other formulas need.",
        "**Naming a value the same as a column** in a table used inside the formula. The inner name wins, which is confusing. Use distinct names.",
        "**Filtering a With table** from a large source and expecting delegation."
      )
    )
  ],
  faqs: [
    { question: "What is the With function used for?", answer: "To give names to values inside one formula, so a LookUp or calculation is worked out once and the formula reads more clearly. The names do not exist outside the formula." },
    { question: "Is With better than Set?", answer: "When the value is only needed in one formula, yes: With works in any property, needs no button or OnVisible, and cannot be changed by other formulas. Use Set when several formulas or screens need the value." },
    { question: "Can I nest With functions?", answer: "Yes. An inner With can use names from the outer one, which is useful when a later value depends on an earlier one." }
  ],
  relatedFunctions: ["set", "updatecontext", "lookup", "forall"],
  relatedGuides: ["power-fx-set-vs-updatecontext-vs-with", "power-fx-named-formulas-explained"],
  relatedErrors: [],
  relatedPatterns: ["with-function-readable-power-fx-formulas", "use-named-formulas-for-app-constants"],
  relatedTools: ["power-fx-formatter"],
  sources: [fxRef("function-with", "With function"), canvasDoc("delegation-overview", "Understand delegation in a canvas app")]
};

export const forAllFunction: FunctionPage = {
  slug: "forall",
  name: "ForAll",
  category,
  title: "ForAll function in Power Apps: repeat a formula for every record",
  description: "How the Power Fx ForAll function builds a new table or runs actions for every record, why records may run in any order, what you cannot do inside it, and faster alternatives for bulk saves.",
  keywords: ["Power Apps ForAll", "ForAll Patch Power Apps", "ForAll Collect", "ForAll Sequence", "ForAll ThisRecord"],
  published,
  updated: published,
  quickAnswer: "ForAll(Table, Formula) evaluates the formula for each record and returns a table of the results. The formula can also take actions, such as Patch or Collect, for each record. Records may be processed in any order and in parallel, so do not rely on order, and you cannot use UpdateContext, Clear or ClearCollect inside it. ForAll is not delegable.",
  syntax: `ForAll( Table, Formula )`,
  arguments: [
    ["`Table`", "Required", "The table to go through. You cannot change this table inside the formula."],
    ["`Formula`", "Required", "Evaluated for each record. Refer to the record's columns by name or with `ThisRecord`."]
  ],
  returns: "A table of the formula's results, in the same order as the input. Blank results are left out, so the result can have fewer rows.",
  usableIn: "Any formula",
  delegation: "Not delegable. It works on the records already in the app.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Build a table: square numbers 1 to 5
ForAll(Sequence(5), Value * Value)

// Build records from another table
ForAll(colLines, { Product: Title, Total: Quantity * UnitPrice })

// An action for each ticked row
ForAll(
    Filter(galTasks.AllItems, chkDone.Value),
    Patch(Tasks, LookUp(Tasks, ID = ThisRecord.ID), { Done: true })
)`),
      p("`Sequence(n)` makes a table of the numbers 1 to n in a column named `Value`, which is how you loop a set number of times.")
    ),
    section(
      "order",
      "Order and what is not allowed",
      p("Microsoft is explicit that records can be processed in any order and, where possible, in parallel. The first record may finish after the last. For that reason UpdateContext, Clear and ClearCollect cannot be used inside ForAll. Collect can, but the order records are added in is undefined."),
      note("When you need a running total or a counter, work it out without ForAll, with `Sum` or `CountRows` on the table, or build the table with ForAll and then use it.")
    ),
    section(
      "faster",
      "Faster bulk saves",
      p("A Patch inside ForAll is one call per record. For more than a few dozen rows, pass a table to Patch instead, which saves them together."),
      code(`With(
    { ticked: Filter(galTasks.AllItems, chkDone.Value) },
    Patch(Tasks, ticked, ForAll(ticked, { Done: true }))
)`),
      p("Here ForAll only builds the table of changes and Patch does the saving. The [ForAll and Patch pattern](/patterns/forall-patch-multiple-records-power-apps) and the [ForAll guide](/guides/power-fx-forall-explained) cover both approaches.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Expecting records to run in order.** They may not. Do not depend on one record's result in another.",
        "**Using ForAll where a function takes a table already.** `Lower(colNames.Name)` returns a table of lower-case names without ForAll. Many functions work on a single-column table directly.",
        "**Patching the table being looped.** You cannot modify the table that ForAll is going through.",
        "**Ignoring the result.** ForAll returns a table even when used for actions, and returning large tables from Collect or Patch for every record uses memory."
      )
    )
  ],
  faqs: [
    { question: "How do I loop through a collection in Power Apps?", answer: "Use ForAll(colItems, Formula). Inside the formula, refer to the current record's columns by name or with ThisRecord." },
    { question: "Why can't I use UpdateContext inside ForAll?", answer: "Because ForAll may process records in any order and in parallel, so a variable changed inside it would have an unpredictable value. Microsoft blocks UpdateContext, Clear and ClearCollect there for that reason." },
    { question: "How do I run a loop a set number of times?", answer: "Pass Sequence(n) as the table: ForAll(Sequence(10), Value) runs for 1 to 10, with the number in Value." }
  ],
  relatedFunctions: ["patch", "with", "collect", "addcolumns"],
  relatedGuides: ["power-fx-forall-explained", "speed-up-slow-power-fx-formulas"],
  relatedErrors: [],
  relatedPatterns: ["forall-patch-multiple-records-power-apps", "power-apps-bulk-update-selected-gallery-items"],
  relatedTools: ["power-fx-formatter"],
  sources: [fxRef("function-forall", "ForAll function"), fxRef("function-sequence", "Sequence function")]
};

export const logicFunctions: FunctionPage[] = [ifFunction, switchFunction, isBlankFunction, coalesceFunction, ifErrorFunction, withFunction, forAllFunction];
