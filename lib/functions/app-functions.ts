import { canvasDoc, code, note, p, section, table, ul } from "../guides/types";
import { fxRef, type FunctionPage } from "./types";

const published = "2026-11-21";
const category = "Variables, screens and messages" as const;
const variablesDoc = canvasDoc("working-with-variables", "Understand canvas app variables");

export const setFunction: FunctionPage = {
  slug: "set",
  name: "Set",
  category,
  title: "Set function in Power Apps: create and update global variables",
  description: "How the Power Fx Set function creates a global variable that every screen can read, what it can hold, how to clear it, and when a named formula or With is the better choice.",
  keywords: ["Power Apps Set function", "global variable Power Apps", "Set variable OnStart", "clear variable Power Apps", "Set record variable"],
  published,
  updated: published,
  quickAnswer: "Set(Name, Value) creates a global variable, or changes it if it exists, and every screen in the app can read it by name. It can hold a value, a record or a table. Set works only in behaviour formulas, such as OnSelect or OnVisible, and the variable keeps its value until it is set again or the app closes. Clear it with Set(Name, Blank()).",
  syntax: `Set( VariableName, Value )`,
  arguments: [
    ["`VariableName`", "Required", "The name of the global variable. It cannot be the same as a collection or a control."],
    ["`Value`", "Required", "The value to store: a number, text, record, table, control reference or any formula result."]
  ],
  returns: "Nothing.",
  usableIn: "Behaviour formulas only",
  delegation: "A table stored in a variable is held in memory, so later filters on it are not delegated.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A flag
Set(varShowHelp, true)

// Toggle it
Set(varShowHelp, !varShowHelp)

// A record: the signed-in user's profile
Set(varMe, LookUp(Employees, Email = User().Email))

// Increment a counter
Set(varClicks, varClicks + 1)

// Clear it
Set(varMe, Blank())`),
      p("Read the variable anywhere by its name, such as `varMe.Department` in a label or `varShowHelp` in a panel's `Visible` property. A prefix such as `var` or `gbl` makes variables easy to tell apart from controls and columns.")
    ),
    section(
      "change-a-field",
      "Changing one field of a record variable",
      p("Set replaces the whole value. To change one field and keep the rest, merge with `Patch`."),
      code(`Set(varFilter, Patch(varFilter, { Status: "Open" }))`)
    ),
    section(
      "which",
      "Set, a named formula, or With",
      table(
        ["You need", "Use"],
        ["A value that is always the result of the same formula, like the user's profile or a theme colour", "A [named formula](/guides/power-fx-named-formulas-explained) in App.Formulas"],
        ["A value the user changes, like a selected tab or a toggle", "`Set`"],
        ["A value only one screen uses", "`Set` or [UpdateContext](/functions/updatecontext)"],
        ["A value only one formula uses", "[With](/functions/with)"]
      ),
      p("Microsoft points out that a variable does not update on its own when the data behind it changes, which is why a formula is often the better choice. The [Set vs UpdateContext vs With guide](/guides/power-fx-set-vs-updatecontext-vs-with) has more.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Using Set in a property like Text or Items.** It only works in behaviour formulas. Use a named formula or With instead.",
        "**Loading many variables in App.OnStart.** It delays the first screen. Named formulas are calculated when first needed.",
        "**Giving a variable the same name as a collection or control.** Set rejects it."
      )
    )
  ],
  faqs: [
    { question: "What is the difference between Set and UpdateContext?", answer: "Set creates a global variable that every screen can read. UpdateContext creates a context variable that only its own screen can read. Set takes a name and a value; UpdateContext takes a record of names and values." },
    { question: "How do I clear a variable in Power Apps?", answer: "Set it to Blank(), as in Set(varMe, Blank()). If you remove every Set for a variable, the variable stops existing." },
    { question: "Where can I see the value of a variable?", answer: "In Power Apps Studio, open Variables in the left pane. It lists global variables, context variables and collections with their current values and where they are used." }
  ],
  relatedFunctions: ["updatecontext", "with", "navigate", "collect"],
  relatedGuides: ["power-fx-set-vs-updatecontext-vs-with", "power-fx-named-formulas-explained", "power-apps-faster-app-start-concurrent-onstart"],
  relatedErrors: [],
  relatedPatterns: ["use-named-formulas-for-app-constants", "power-apps-current-user-profile-cache"],
  relatedTools: ["power-fx-formatter", "power-apps-naming-linter"],
  sources: [fxRef("function-set", "Set function"), variablesDoc]
};

export const updateContextFunction: FunctionPage = {
  slug: "updatecontext",
  name: "UpdateContext",
  category,
  title: "UpdateContext function in Power Apps: screen variables",
  description: "How the Power Fx UpdateContext function creates and changes variables that belong to one screen, how to set several at once, and how to pass values to another screen with Navigate.",
  keywords: ["Power Apps UpdateContext", "context variable Power Apps", "UpdateContext vs Set", "local variable screen Power Apps", "UpdateContext multiple variables"],
  published,
  updated: published,
  quickAnswer: "UpdateContext({ name: value }) creates or changes a context variable that only the current screen can read. You can set several in one call by listing more names in the record. The value survives switching screens and coming back. To set a context variable on another screen, pass the record as the third argument of Navigate.",
  syntax: `UpdateContext( { ContextVariable1: Value1 [, ContextVariable2: Value2, ... ] } )`,
  arguments: [
    ["`ContextVariable1`", "Required", "The name of a context variable to create or change."],
    ["`Value1`", "Required", "The value to give it."],
    ["`ContextVariable2: Value2`, ...", "Optional", "More variables to set in the same call. Variables you do not list keep their values."]
  ],
  returns: "Nothing.",
  usableIn: "Behaviour formulas only",
  delegation: "A table stored in a variable is held in memory, so later filters on it are not delegated.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Show a panel
UpdateContext({ locShowPanel: true })

// Several at once
UpdateContext({ locSelected: ThisItem, locShowPanel: true, locMode: "Edit" })

// Toggle
UpdateContext({ locShowPanel: !locShowPanel })

// Clear
UpdateContext({ locSelected: Blank() })`),
      p("Read the variable by its name on the same screen: `locShowPanel` in a container's `Visible`, `locSelected.Title` in a label. Formulas on other screens cannot see it.")
    ),
    section(
      "navigate",
      "Passing a value to another screen",
      p("A context variable can only be set on its own screen, with one exception: `Navigate` takes a record as its third argument and sets those context variables on the screen it opens."),
      code(`// On the list screen
Navigate(scrDetails, ScreenTransition.Cover, { locRequest: ThisItem })

// On scrDetails, a form's Item
locRequest`)
    ),
    section(
      "which",
      "Context variable or global variable",
      table(
        ["", "UpdateContext", "Set"],
        ["Seen by", "One screen", "Every screen"],
        ["Set several at once", "Yes, in one record", "One per call"],
        ["Set from another screen", "Only through Navigate", "Anywhere"]
      ),
      p("Use context variables for things that belong to a screen, such as which panel is open, so they cannot clash with other screens. The [comparison guide](/guides/power-fx-set-vs-updatecontext-vs-with) covers With as a third option.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Forgetting the curly brackets.** UpdateContext takes a record: `UpdateContext({ x: 1 })`, not `UpdateContext(x, 1)`.",
        "**Reading the variable from another screen.** It is not visible there. Use Set, or pass it with Navigate.",
        "**Giving a context variable and a global variable the same name.** It is allowed, but confusing. Use prefixes such as `loc` and `gbl`."
      )
    )
  ],
  faqs: [
    { question: "Can I use a context variable on another screen?", answer: "No. A context variable belongs to its screen. To pass a value to another screen, use the third argument of Navigate, or use a global variable with Set." },
    { question: "Do context variables keep their value when I leave the screen?", answer: "Yes. They keep their value until it is changed or the app closes, so returning to the screen shows the same state." },
    { question: "How do I set more than one context variable at once?", answer: "List them all in one record: UpdateContext({ a: 1, b: \"text\", c: true })." }
  ],
  relatedFunctions: ["set", "navigate", "with"],
  relatedGuides: ["power-fx-set-vs-updatecontext-vs-with"],
  relatedErrors: [],
  relatedPatterns: [],
  relatedTools: ["power-fx-formatter", "power-apps-naming-linter"],
  sources: [fxRef("function-updatecontext", "UpdateContext function"), variablesDoc]
};

export const navigateFunction: FunctionPage = {
  slug: "navigate",
  name: "Navigate and Back",
  category,
  title: "Navigate and Back in Power Apps: move between screens",
  description: "How the Power Fx Navigate and Back functions change screens, which transitions are available, how to pass values to the next screen, and how Back chooses its transition.",
  keywords: ["Power Apps Navigate function", "Power Apps Back function", "Navigate pass parameters", "ScreenTransition Power Apps", "Navigate context variable"],
  published,
  updated: published,
  quickAnswer: "Navigate(Screen, Transition, { name: value }) shows another screen, with an optional transition and an optional record of context variables for that screen. Back() returns to the previous screen, using the reverse of the transition that brought you there. Both are behaviour functions, so use them in OnSelect and similar properties.",
  syntax: `Navigate( Screen [, Transition [, UpdateContextRecord ] ] )
Back( [ Transition ] )`,
  arguments: [
    ["`Screen`", "Required", "The screen to show. A control on that screen also works."],
    ["`Transition`", "Optional", "`ScreenTransition.None` (the default), `Fade`, `Cover`, `CoverRight`, `UnCover` or `UnCoverRight`."],
    ["`UpdateContextRecord`", "Optional", "A record of context variables to set on the new screen, as if passed to UpdateContext."]
  ],
  returns: "`true`, or `false` if there was an error. `Back` returns `false` if there is no previous screen.",
  usableIn: "Behaviour formulas only",
  delegation: "Not relevant: these functions change screens.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Open the details screen
Navigate(scrDetails)

// With a transition and the selected record
Navigate(scrDetails, ScreenTransition.Cover, { locRequest: ThisItem })

// Back to where the user came from
Back()

// After saving a form, in its OnSuccess
Back()`)
    ),
    section(
      "transitions",
      "Transitions",
      table(
        ["Transition", "Effect"],
        ["`ScreenTransition.None`", "The new screen replaces the old one at once"],
        ["`ScreenTransition.Fade`", "The old screen fades out"],
        ["`ScreenTransition.Cover`", "The new screen slides in from the right, covering the old one"],
        ["`ScreenTransition.CoverRight`", "The new screen slides in from the left"],
        ["`ScreenTransition.UnCover`", "The old screen slides off to the left"],
        ["`ScreenTransition.UnCoverRight`", "The old screen slides off to the right"]
      ),
      p("`Back` uses the reverse of the transition the screen opened with: Microsoft's example is a screen opened with `CoverRight`, which goes back with `UnCover`. `Fade` and `None` are their own reverse. Pass a transition to Back to override it.")
    ),
    section(
      "passing",
      "Passing values to the next screen",
      p("The third argument sets context variables on the new screen, which is the only way to set a context variable from outside its screen. It is how you pass a selected record or a mode."),
      code(`// List screen: a gallery's OnSelect
Navigate(scrEdit, ScreenTransition.None, { locRecord: ThisItem, locMode: "Edit" })

// List screen: a New button
Navigate(scrEdit, ScreenTransition.None, { locRecord: Blank(), locMode: "New" })`),
      note("Screens that are not showing keep running in the background, and formulas can read controls on other screens, such as `galRequests.Selected` from the details screen. Passing the record explicitly is clearer and keeps working if the gallery changes.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Navigate in a non-behaviour property.** It only works in OnSelect, OnVisible, OnSuccess and similar.",
        "**Navigating before a save finishes.** Put Navigate in the form's OnSuccess, or in the success branch of IfError after Patch.",
        "**Using Navigate to go back.** It adds another step to the history, so Back no longer returns where the user expects. Use Back.",
        "**Running heavy work in the new screen's OnVisible.** It runs on every visit. Load data once, or use named formulas."
      )
    )
  ],
  faqs: [
    { question: "How do I pass data to another screen in Power Apps?", answer: "Give Navigate a record as its third argument, as in Navigate(scrDetails, ScreenTransition.None, { locRequest: ThisItem }). On scrDetails, locRequest is a context variable you can use in any formula." },
    { question: "What is the difference between Navigate and Back?", answer: "Navigate goes to the screen you name and remembers where you came from. Back returns to the previous screen in that history, using the reverse transition." },
    { question: "How do I set which screen the app opens on?", answer: "Set the StartScreen property of the App object to the screen, or a formula that picks one, such as If(Param(\"id\") <> \"\", scrDetails, scrHome)." }
  ],
  relatedFunctions: ["updatecontext", "set", "submitform"],
  relatedGuides: ["power-apps-faster-app-start-concurrent-onstart"],
  relatedErrors: [],
  relatedPatterns: ["power-apps-form-mode-new-edit-view", "refresh-selected-request-after-patch"],
  relatedTools: ["power-fx-formatter"],
  sources: [fxRef("function-navigate", "Back and Navigate functions")]
};

export const notifyFunction: FunctionPage = {
  slug: "notify",
  name: "Notify",
  category,
  title: "Notify function in Power Apps: show a message banner",
  description: "How the Power Fx Notify function shows a success, error, warning or information banner, how long it stays, the 500-character limit, and how to pair it with IfError.",
  keywords: ["Power Apps Notify", "Notify NotificationType", "Notify timeout", "show message Power Apps", "Notify error IfError"],
  published,
  updated: published,
  quickAnswer: "Notify(Message, NotificationType.Success) shows a banner at the top of the screen. The types are Success, Error, Warning and Information, which is the default. The banner closes after 10 seconds unless you give a timeout in milliseconds as the third argument, and a timeout of 0 keeps it until the user closes it. The message can be up to 500 characters.",
  syntax: `Notify( Message [, NotificationType [, Timeout ] ] )`,
  arguments: [
    ["`Message`", "Required", "The text to show, up to 500 characters."],
    ["`NotificationType`", "Optional", "`NotificationType.Information` (the default), `Success`, `Warning` or `Error`. Sets the colour and icon."],
    ["`Timeout`", "Optional", "Milliseconds before the banner closes. 10,000 (10 seconds) by default. 0 keeps it open until the user closes it."]
  ],
  returns: "Always `true`.",
  usableIn: "Behaviour formulas only",
  delegation: "Not relevant.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`Notify("Saved", NotificationType.Success)

Notify("Fill in the required fields", NotificationType.Warning)

// Stays until closed
Notify("You are offline. Changes will not be saved.", NotificationType.Error, 0)

// Short, three seconds
Notify("Copied", NotificationType.Information, 3000)`)
    ),
    section(
      "iferror",
      "Reporting a failed save",
      code(`IfError(
    Patch(Requests, galRequests.Selected, { Status: { Value: "Closed" } }),
    Notify("Could not save: " & FirstError.Message, NotificationType.Error),
    Notify("Request closed", NotificationType.Success)
)`),
      p("`FirstError.Message` is the data source's own message. It is accurate but not always friendly, so many apps show a plain sentence and log the detail. See [IfError](/functions/iferror).")
    ),
    section(
      "limits",
      "What Notify is not",
      ul(
        "**Not a dialog.** It does not wait for the user or ask a question. Build a confirmation panel for that.",
        "**Not a push notification.** To reach a user outside the app, Power Apps has a separate push notification connector.",
        "**Shown to everyone who runs the formula**, including you in Studio, which helps when testing."
      ),
      note("In custom pages and Power Fx commands in model-driven apps, Microsoft says the defaults for type and timeout can differ. Give both explicitly if the behaviour matters.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Using Notify in a property like Text or Visible.** It only works in behaviour formulas.",
        "**Showing success before the save finishes.** Put the success message in OnSuccess or in the last argument of IfError.",
        "**Writing the timeout in seconds.** It is milliseconds: 5 seconds is 5000."
      )
    )
  ],
  faqs: [
    { question: "How long does a Notify message stay on screen?", answer: "10 seconds by default. Pass a timeout in milliseconds as the third argument to change it, or 0 to keep the message until the user closes it." },
    { question: "How do I show an error message in Power Apps?", answer: "Use Notify(\"Your message\", NotificationType.Error). After a save, wrap the save in IfError and show FirstError.Message, or your own text, in the error branch." },
    { question: "Is there a limit on Notify message length?", answer: "Yes. Microsoft gives a limit of 500 characters." }
  ],
  relatedFunctions: ["iferror", "patch", "submitform"],
  relatedGuides: ["power-fx-iferror-and-app-onerror"],
  relatedErrors: [],
  relatedPatterns: ["power-apps-error-handling-iferror-patch"],
  relatedTools: ["power-fx-formatter"],
  sources: [fxRef("function-showerror", "Notify function"), fxRef("function-iferror", "Error, IfError, IsError and IsBlankOrError functions")]
};

export const appFunctions: FunctionPage[] = [setFunction, updateContextFunction, navigateFunction, notifyFunction];
