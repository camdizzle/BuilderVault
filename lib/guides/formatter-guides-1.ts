import { canvasDoc, code, note, ol, p, powerFxDoc, section, table, tool, ul, type Guide } from "./types";

const published = "2026-11-20";

export const commonErrorsGuide: Guide = {
  slug: "fix-common-power-fx-formula-errors",
  title: "Fix the most common Power Fx formula errors",
  shortTitle: "Fix common Power Fx formula errors",
  description: "What the twelve most common Power Apps formula errors mean, a formula that causes each one, and the corrected version. Covers Name isn't valid, Invalid argument type, Expected operator and more.",
  eyebrow: "Power Fx how-to",
  keywords: ["Power Apps formula error", "Name isn't valid", "Invalid argument type", "Expected operator", "Incompatible types for comparison"],
  published,
  updated: published,
  quickAnswer: "Hover over the red underline to read the error, then fix the innermost error first. Most Power Fx errors come from one of four causes: a name Power Apps does not recognize, a value of the wrong type, the wrong number of arguments, or a missing bracket, comma or operator. The outer message, such as \"The function 'Patch' has some invalid arguments\", is usually a side effect of a more specific error inside it.",
  sections: [
    section(
      "read-the-error",
      "How to read a formula error",
      p("Power Apps Studio checks a formula as you type. When something is wrong you get three signals: a red wavy line under part of the formula, a red icon on the control, and a message when you hover over the underlined text."),
      p("Two habits save most of the time people lose here."),
      ul(
        "**Read the innermost error first.** A single mistake often produces two or three messages. The message on the whole function is a summary. The message on one argument tells you what is wrong.",
        "**Look left of the underline.** Power Apps marks the place where it stopped understanding the formula. With missing brackets and commas, the real mistake is usually just before that point."
      ),
      p("Studio's wording changes slightly between releases, so match an error on its first few words. The messages below are the common forms."),
      tool("power-fx-formatter", "Paste a long formula into the formatter before you start. It puts each argument on its own line and flags unbalanced brackets and quotes, which removes one whole class of error.")
    ),
    section(
      "name-isnt-valid",
      "Name isn't valid",
      p("The message reads `Name isn't valid. 'txtTitel' isn't recognized.` Power Apps found a word that is not a control, variable, column, data source or function it knows."),
      code(`// Error: the control is called txtTitle
Patch(Requests, Defaults(Requests), {Title: txtTitel.Text})

// Fixed
Patch(Requests, Defaults(Requests), {Title: txtTitle.Text})`),
      p("Check these causes in order:"),
      ol(
        "A typing mistake in a control, variable or column name.",
        "A control that was renamed or deleted after the formula was written.",
        "A variable that no formula sets. A variable exists only once a `Set` or `UpdateContext` call for it exists somewhere in the app.",
        "A context variable used on a screen other than the one that created it.",
        "A data source that was removed from the app, or a column that was renamed or deleted in the source. Refresh the data source and check the column list.",
        "A column whose name contains a space, written without single quotes. Write `'Due Date'`, not `Due Date`."
      ),
      tool("power-apps-naming-linter", "Consistent prefixes such as txt, gal and var make a misspelled name obvious. The naming checker lists the names in an app that break the convention.")
    ),
    section(
      "invalid-argument-type",
      "Invalid argument type",
      p("The message reads `Invalid argument type (Text). Expecting a Number value instead.` A function received a value of one type and needs another. The most common case is a text input, which always returns text, even when the user typed digits."),
      code(`// Error: txtQuantity.Text is text
Set(varTotal, txtQuantity.Text * 4.5)

// Fixed: convert the text to a number
Set(varTotal, Value(txtQuantity.Text) * 4.5)`),
      p("The same message appears with other type pairs. These conversions cover most of them:"),
      table(
        ["You have", "You need", "Use"],
        ["Text", "Number", "`Value(txtQuantity.Text)`"],
        ["Number or date", "Text", "`Text(varTotal, \"0.00\")`"],
        ["Text", "Date", "`DateValue(txtDate.Text)`"],
        ["Record", "Table", "`Table(galRequests.Selected)`"],
        ["Table", "Record", "`First(colRequests)` or `LookUp(colRequests, ID = 12)`"]
      ),
      p("Record against table is worth a second look. `Filter` always returns a table, even when one row matches. `LookUp` returns one record. If a function such as `Patch` expects a record and you give it the result of `Filter`, switch to `LookUp`.")
    ),
    section(
      "invalid-number-of-arguments",
      "Invalid number of arguments",
      p("The message reads `Invalid number of arguments: received 3, expected 2.` You gave a function more or fewer arguments than it accepts. The cause is rarely a real extra argument. It is usually a bracket that closes in the wrong place, so an argument meant for an inner function lands in the outer one."),
      code(`// Error: the bracket after txtName.Text is missing, so Left receives three arguments
Left(Upper(txtName.Text, 1), 3)

// Fixed
Left(Upper(txtName.Text), 3)`),
      p("A second cause is the separator. In regions that use a comma as the decimal separator, Power Apps expects a semicolon between arguments. A formula copied from an English-language page then fails with argument and operator errors. See [commas or semicolons](/guides/power-fx-commas-vs-semicolons).")
    ),
    section(
      "incompatible-types-for-comparison",
      "Incompatible types for comparison",
      p("The message reads `Incompatible types for comparison. These types can't be compared: Record, Text.` The two sides of `=`, `<>`, `<` or `>` are different types."),
      p("The classic case is a choice column. A SharePoint choice column holds a record, and the text you want is in its `Value` field."),
      code(`// Error: Status is a choice column, so it is a record
Filter(Requests, Status = "Open")

// Fixed for SharePoint
Filter(Requests, Status.Value = "Open")`),
      p("A Dataverse choice column is compared with its named option instead of text, in the form `'Status (Requests)'.Open`. Start typing the choice name and pick the option from the list Studio offers."),
      p("Other pairs that cause this error:"),
      ul(
        "Text against number: `txtAge.Text > 18`. Convert with `Value(txtAge.Text) > 18`.",
        "A whole combo box selection against text: `cmbOwner.Selected = \"Sam\"`. Compare one field, such as `cmbOwner.Selected.DisplayName = \"Sam\"`.",
        "A person or lookup column against text. Compare a field of the column, such as `Owner.Email`."
      )
    ),
    section(
      "function-has-invalid-arguments",
      "The function has some invalid arguments",
      p("The message reads `The function 'Patch' has some invalid arguments.` This is the summary message. It tells you which function failed and nothing about why. There is always a second, narrower underline inside the brackets. Hover over that one."),
      p("With `Patch`, the inner message is usually a type mismatch on one column, such as `The type of this argument 'Priority' does not match the expected type 'Record'. Found type 'Text'.`"),
      code(`// Error: Priority is a choice column and needs a record
Patch(Requests, Defaults(Requests), {Title: txtTitle.Text, Priority: "High"})

// Fixed
Patch(Requests, Defaults(Requests), {Title: txtTitle.Text, Priority: {Value: "High"}})`),
      p("If you cannot find the inner error, remove the columns from the record one at a time until the error clears. The last column you removed is the one with the wrong shape. The [Patch SharePoint columns cheat sheet](/cheat-sheets/patch-sharepoint-columns-cheat-sheet) has the right shape for each column type.")
    ),
    section(
      "expected-operator",
      "Expected operator",
      p("The message reads `Expected operator. We expect an operator such as +, *, or & at this point in the formula.` Power Apps found two values next to each other with nothing joining them."),
      code(`// Error: nothing joins the text and the name
"Hello " User().FullName

// Fixed
"Hello " & User().FullName`),
      p("In a behavior formula such as `OnSelect`, the missing piece is often the semicolon between two actions."),
      code(`// Error: two actions with nothing between them
Set(varSaving, true) SubmitForm(frmRequest)

// Fixed
Set(varSaving, true); SubmitForm(frmRequest)`),
      p("A missing comma between two arguments produces the same message.")
    ),
    section(
      "unexpected-characters",
      "Unexpected characters",
      p("The message reads `Unexpected characters. Characters are used in the formula in an unexpected way.` It usually appears together with other errors and has three common causes."),
      ul(
        "**Curly quotes.** Formulas copied from Word, email or some web pages contain “curly” quotes. Power Fx only accepts straight quotes. Retype the quotes in the formula bar.",
        "**The wrong separator for your region.** A comma where your Studio expects a semicolon, or the reverse.",
        "**A stray character**, such as a second closing bracket, a trailing comma before a closing bracket, or an `=` at the start of the formula. Unlike Excel, a Power Fx formula does not start with an equals sign."
      )
    ),
    section(
      "invalid-use-of-dot",
      "Invalid use of '.'",
      p("The message reads `Invalid use of '.'`. You asked for a field or property of something that does not have one. The value on the left of the dot is text, a number or a table, not a record or a control."),
      code(`// Error: Value is already text, so it has no Title field
cmbCategory.Selected.Value.Title

// Fixed: read the field from the selected record
cmbCategory.Selected.Title`),
      p("It also appears when you read a field straight from a table. `Filter(Requests, ID = 12).Title` returns a column, not one value. Use `LookUp(Requests, ID = 12).Title`, or the shorter `LookUp(Requests, ID = 12, Title)`.")
    ),
    section(
      "behavior-function",
      "Behavior function in a non-behavior property",
      p("The message reads `Behavior function in a non-behavior property. You can't use this property to change values elsewhere in the app.` Functions that change something, such as `Set`, `Patch`, `Collect`, `Navigate` and `Notify`, only run in behavior properties. Those are the properties that start with On, such as `OnSelect`, `OnChange` and `OnVisible`."),
      p("Properties such as `Text`, `Items`, `Visible` and `Fill` describe a value. Power Apps recalculates them whenever it needs to, so they are not allowed to change anything."),
      code(`// Error: in a label's Text property
Set(varTotal, Sum(colLines, Amount)); varTotal

// Fixed: the Text property calculates the value directly
Sum(colLines, Amount)`),
      p("If several controls need the same value, put the calculation in a named formula in `App.Formulas` and refer to its name. Named formulas recalculate on their own and need no `Set`.")
    ),
    section(
      "incompatible-type-variable",
      "Incompatible type on a variable",
      p("The message reads `Incompatible type. We can't evaluate your formula because the context variable types are incompatible with the types of values in other places in your app.` A variable has one type for the whole app. This error means two formulas set the same variable to different types."),
      code(`// On one button
Set(varSelected, galRequests.Selected)

// Error on another button: the same variable is now text
Set(varSelected, "")

// Fixed: clear the record with Blank()
Set(varSelected, Blank())`),
      p("Search the app for the variable name to find every place it is set. Use `Blank()` to clear a variable of any type. If the two uses are different things, give them different names.")
    ),
    section(
      "circular-reference",
      "Circular reference",
      p("The message reads `This rule creates a circular reference between properties, which is not allowed.` A property depends on itself, directly or through another property."),
      code(`// Error: the label's Width depends on its own Width
lblTitle.Width + 20

// Error across two controls
// txtNet.Default:   Value(txtGross.Text) / 1.2
// txtGross.Default: Value(txtNet.Text) * 1.2`),
      p("Decide which value is the source and calculate the other one from it. When two inputs must update each other, set a variable in each control's `OnChange` and read the variable from both `Default` properties.")
    ),
    section(
      "runtime-errors",
      "Errors that appear only when the app runs",
      p("Everything above is caught while you write the formula. A formula that is valid can still fail when it runs: a required column is empty, the user has no permission, or the connection drops. These errors appear as a red banner at the top of the app, not as a red underline."),
      p("Wrap the save in `IfError` so the user gets a clear message and the formula stops cleanly. The [IfError pattern](/patterns/power-apps-error-handling-iferror-patch) has the full formula, and the [error handling standards](/standards/error-handling-standards) describe what to log.")
    ),
    section(
      "routine",
      "A five-step routine for any formula error",
      ol(
        "Format the formula so each argument is on its own line.",
        "Fix any bracket or quote that is flagged. See [find a missing bracket or quote](/guides/find-missing-bracket-power-fx-formula).",
        "Hover over the innermost red underline and read that message, not the summary.",
        "Check the type of each value involved. Select a name in the formula bar and Studio shows its type and current value underneath.",
        "If the error stays, cut the formula down. Replace arguments with simple fixed values until the error clears, then put them back one at a time."
      )
    )
  ],
  faqs: [
    {
      question: "Why does one mistake produce several errors in Power Apps?",
      answer: "Power Apps reports the specific problem and then reports every function that contains it. A wrong column type inside Patch gives one message on the column and a second message saying the Patch function has some invalid arguments. Fix the innermost message and the others clear."
    },
    {
      question: "Why does Power Apps say a name isn't recognized when the control exists?",
      answer: "Check the spelling first, then check that the control was not renamed. If the name is a variable, it only exists once a Set or UpdateContext call for it exists in the app. If the name is a column with a space in it, wrap it in single quotes."
    },
    {
      question: "Why is my text input not accepted as a number?",
      answer: "The Text property of a text input is always text, even when the user typed digits. Convert it with Value(txtQuantity.Text) before doing arithmetic or comparing it with a number."
    },
    {
      question: "Why does the same formula work for a colleague and fail for me?",
      answer: "Power Apps shows formulas with the separators for the author's language. If your region uses a comma as the decimal separator, arguments are separated by semicolons. A formula pasted from an English source has to be converted first."
    },
    {
      question: "Can a tool find Power Fx type errors outside Power Apps Studio?",
      answer: "Only in part. Type errors depend on your controls and data sources, which only Studio knows. A formatter can find unbalanced brackets and quotes and lay the formula out so the structure is visible, which removes the syntax errors before you paste the formula back."
    }
  ],
  relatedTools: ["power-fx-formatter", "power-apps-naming-linter"],
  relatedPatterns: ["power-apps-error-handling-iferror-patch", "patch-sharepoint-choice-field", "with-function-readable-power-fx-formulas"],
  relatedLinks: [
    { href: "/standards/error-handling-standards", label: "Power Platform Error Handling Standards" },
    { href: "/cheat-sheets/patch-sharepoint-columns-cheat-sheet", label: "Patch SharePoint Columns Cheat Sheet" }
  ],
  sources: [
    powerFxDoc("data-types", "Data types in Power Fx"),
    powerFxDoc("reference/operators", "Operators and identifiers"),
    canvasDoc("working-with-formulas-in-depth", "Understand behavior formulas"),
    canvasDoc("working-with-variables", "Understand variables in canvas apps"),
    powerFxDoc("error-handling", "Error handling in Power Fx")
  ]
};

export const missingBracketGuide: Guide = {
  slug: "find-missing-bracket-power-fx-formula",
  title: "Find a missing bracket or quote in a long Power Fx formula",
  shortTitle: "Find a missing bracket or quote",
  description: "How to find the unbalanced parenthesis, curly brace or quote in a long Power Apps formula, with a worked example and the habits that stop it happening.",
  eyebrow: "Power Fx how-to",
  keywords: ["Power Apps missing closing parenthesis", "Power Fx unbalanced brackets", "Expected closing bracket", "Power Apps formula syntax error"],
  published,
  updated: published,
  quickAnswer: "Paste the formula into a formatter that checks brackets. It tells you which bracket is never closed or which closing bracket has no partner, and the indented layout shows where the nesting goes wrong. Fix quotes first, then curly braces, then round brackets, because an unclosed quote hides every bracket after it.",
  sections: [
    section(
      "why-it-is-hard",
      "Why one missing bracket is so hard to see",
      p("A formula with a missing bracket rarely says so plainly. Power Apps reads to the end of the formula looking for the partner, then reports errors where it gave up. You see `Expected operator`, `Unexpected characters` or `Invalid number of arguments`, often underlining the whole formula."),
      p("Studio's bracket highlighting helps on short formulas. Put the cursor next to a bracket and its partner is highlighted. On a save formula with five levels of nesting on one line, that is slow, and it does not tell you which bracket is the wrong one.")
    ),
    section(
      "find-it-with-the-formatter",
      "Find it with the formatter",
      ol(
        "Copy the whole formula from the formula bar.",
        "Paste it into the [Power Fx Formatter](/tools/power-fx-formatter).",
        "Read the syntax warnings. Each one names the bracket or quote and where it is.",
        "Look at the formatted result. The line where the indentation stops making sense is where the bracket belongs.",
        "Fix the formula, check that the warnings are gone, and copy it back."
      ),
      p("The formatter reports four kinds of problem:"),
      table(
        ["Warning", "What it means"],
        ["`\"(\" is never closed.`", "An opening bracket has no partner. The formula is one closing bracket short."],
        ["`Unexpected \")\" with no matching opening bracket.`", "There is one closing bracket too many."],
        ["`Expected \"}\" but found \")\".`", "A record was opened with a curly brace and something else tried to close it."],
        ["`Text value is missing its closing double quote.`", "A text value was never closed, so the rest of the formula is being read as text."]
      ),
      tool("power-fx-formatter", "The check runs in your browser as you type. Nothing is uploaded.")
    ),
    section(
      "worked-example",
      "Worked example: a save button that will not save",
      p("This is a typical `OnSelect` formula, written on one line. Studio underlines all of it."),
      code(`IfError(Patch(Requests,Defaults(Requests),{Title:txtTitle.Text,DueDate:dpDueDate.SelectedDate};Notify("Saved",NotificationType.Success),Notify("Could not save",NotificationType.Error))`),
      p("The formatter reports `\"(\" is never closed.` and lays the formula out like this:"),
      code(`IfError(
    Patch(
        Requests,
        Defaults(Requests),
        {Title: txtTitle.Text, DueDate: dpDueDate.SelectedDate};
        Notify("Saved", NotificationType.Success),
        Notify("Could not save", NotificationType.Error)
    )`, "Formatted, still broken"),
      p("The layout shows the mistake. Both `Notify` calls are indented inside `Patch`, as if they were its fourth and fifth arguments. They belong to `IfError`. So `Patch` was never closed: the bracket is missing after the record, before the semicolon."),
      code(`IfError(
    Patch(
        Requests,
        Defaults(Requests),
        {Title: txtTitle.Text, DueDate: dpDueDate.SelectedDate}
    );
    Notify("Saved", NotificationType.Success),
    Notify("Could not save", NotificationType.Error)
)`, "Fixed"),
      p("The fix was one character. Without the layout you would have counted brackets by hand.")
    ),
    section(
      "three-kinds-of-bracket",
      "The three kinds of bracket, and quotes",
      p("Power Fx uses each bracket for one job. Knowing the jobs tells you which one to expect at any point."),
      table(
        ["Symbol", "Used for", "Example"],
        ["`( )`", "Function arguments and grouping", "`Filter(Requests, Amount > (Limit * 2))`"],
        ["`{ }`", "A record", "`{Title: \"New\", Amount: 10}`"],
        ["`[ ]`", "A table of values", "`[\"Open\", \"Closed\"]`"],
        ["`\" \"`", "Text", "`\"Submitted\"`"],
        ["`' '`", "A name with spaces or symbols", "`'Due Date'`"]
      ),
      p("Three details catch people out:"),
      ul(
        "**A record inside a record needs both braces closed.** `{Owner: {Value: cmbOwner.Selected.Value}}` ends with two closing braces. Dropping one is the most common brace mistake in `Patch`.",
        "**A double quote inside text is written twice.** `\"She said \"\"yes\"\"\"` is valid. A single quote mark in the middle of a text value ends it early.",
        "**Single quotes are for names, not text.** `'Open'` is a name Power Apps will not recognize. Text needs double quotes."
      ),
      p("When the formatter reports a quote and a bracket together, fix the quote first. An unclosed quote turns everything after it into text, including the brackets, so the bracket warning often disappears with it.")
    ),
    section(
      "which-end",
      "Is the bracket missing or extra?",
      p("Count is not enough. A formula can have the right number of brackets in the wrong places. Use the warning to decide."),
      ul(
        "**Never closed** means you are short of a closing bracket. Find the function whose arguments run on too far in the formatted layout, and close it where its last real argument ends.",
        "**No matching opening bracket** means there is one too many. It is usually at the very end of the formula or just before a semicolon. Delete it.",
        "**Expected one bracket but found another** means two kinds are crossed. Look at the line the formatter points to: a record is missing its `}` before a `)`."
      ),
      code(`// One closing bracket too many, before the semicolon
Set(varTotal, Sum(colLines, Qty * Price)));
Navigate(scrDone)

// Fixed
Set(varTotal, Sum(colLines, Qty * Price));
Navigate(scrDone)`)
    ),
    section(
      "habits",
      "Habits that prevent it",
      ul(
        "**Type both brackets, then fill in the middle.** When Studio adds the closing bracket for you, leave it there and type between the pair.",
        "**Put one argument on each line** once a formula has more than two levels. A missing bracket then shows up as bad indentation as you type. See [how to format Power Fx formulas](/guides/format-power-fx-formulas).",
        "**Build long formulas from the inside out.** Get the `Patch` working on its own, then wrap it in `IfError`.",
        "**Move repeated pieces into `With` or a named formula.** Fewer levels of nesting means fewer brackets to lose. See the [With pattern](/patterns/with-function-readable-power-fx-formulas).",
        "**Format before you paste a formula into a ticket or forum post.** Other people can only help with a formula they can read."
      )
    )
  ],
  faqs: [
    {
      question: "How do I find a missing parenthesis in a Power Apps formula?",
      answer: "Paste the formula into a formatter that checks brackets. It reports which opening bracket is never closed and shows the formula indented by nesting level. The function whose arguments run on too far is the one missing its closing bracket."
    },
    {
      question: "Does Power Apps Studio highlight matching brackets?",
      answer: "Yes. Put the cursor next to a bracket in the formula bar and Studio highlights its partner. This works well on short formulas. On long single-line formulas a formatter is faster because it checks every bracket at once."
    },
    {
      question: "Why does Power Apps show Expected operator when the problem is a bracket?",
      answer: "Power Apps reads the formula from left to right and reports the place where it could no longer make sense of it. With a missing bracket, that place is later than the mistake, and the message describes what it found there, not what caused it."
    },
    {
      question: "What is the difference between curly braces and square brackets in Power Fx?",
      answer: "Curly braces make a record, which is one row of named values, such as {Title: \"New\", Amount: 10}. Square brackets make a table, which is a list of values or records, such as [\"Open\", \"Closed\"]."
    },
    {
      question: "How do I put a double quote inside a text value?",
      answer: "Write it twice. In Power Fx, \"She said \"\"yes\"\"\" produces the text She said \"yes\". A single double quote in the middle of a text value ends the text early and causes a syntax error."
    }
  ],
  relatedTools: ["power-fx-formatter"],
  relatedPatterns: ["with-function-readable-power-fx-formulas", "power-apps-error-handling-iferror-patch"],
  relatedLinks: [
    { href: "/guides/fix-common-power-fx-formula-errors", label: "Fix the most common Power Fx formula errors" },
    { href: "/guides/format-power-fx-formulas", label: "Format Power Fx formulas so they are easy to review" }
  ],
  sources: [
    powerFxDoc("expression-grammar", "Power Fx expression grammar"),
    powerFxDoc("reference/operators", "Operators and identifiers"),
    powerFxDoc("data-types", "Data types in Power Fx")
  ]
};

export const delegationWarningGuide: Guide = {
  slug: "power-apps-delegation-warning-explained",
  title: "What a Power Apps delegation warning means and how to clear it",
  shortTitle: "Delegation warnings explained",
  description: "How to read a Power Apps delegation warning, the five causes behind most of them with a before and after formula for each, how to test with the data row limit, and when a warning is safe to leave.",
  eyebrow: "Power Fx how-to",
  keywords: ["Power Apps delegation warning", "delegation warning Filter", "data row limit", "blue underline Power Apps"],
  published,
  updated: published,
  quickAnswer: "A delegation warning means part of your formula cannot be run by the data source, so Power Apps downloads only the first rows (500 by default) and works on those. With more rows than the limit, results are silently incomplete. To clear it, find the part with the blue underline and replace it with something the data source can run, most often by removing a function wrapped around a column.",
  sections: [
    section(
      "what-it-means",
      "What the warning is telling you",
      p("When a gallery shows `Filter(Requests, Status.Value = \"Open\")`, Power Apps does not download the list and filter it. It sends the filter to SharePoint, Dataverse or SQL, and the data source returns only the matching rows. That hand-off is called delegation."),
      p("Delegation only works when the data source can run every part of the query. If one part cannot be translated, Power Apps does not delegate any of it. It downloads the first rows up to the data row limit and runs the formula on those rows on the device."),
      p("The limit is 500 rows by default. You can change it under **Settings**, **General**, **Data row limit**. For years the ceiling was 2,000 rows and Microsoft's current documentation gives 10,000, so check what your Studio allows."),
      note("The danger is that nothing fails. A list with 480 rows works perfectly. The same app on a list with 5,000 rows shows a gallery that looks complete and is missing most of the matches.")
    ),
    section(
      "read-the-warning",
      "How to read the warning",
      p("Power Apps shows a delegation warning in three places:"),
      ul(
        "A **yellow triangle** on the control, and on the screen thumbnail.",
        "A **blue wavy line** under one part of the formula. This is the important one. It marks the part that cannot be delegated.",
        "A **message** when you hover over either, which starts `Delegation warning.` and names the part of the formula that might not work correctly on large data sets."
      ),
      p("It is a warning and not an error because the formula does work on small data. Blue means partial results are possible. Red means the formula is invalid."),
      p("Two facts about the warning are easy to miss:"),
      ul(
        "**Warnings only appear for data sources that support delegation.** A formula over a collection never shows one, because a collection is already in memory.",
        "**No warning does not prove delegation.** Values held by `With`, `Set` and `UpdateContext` are in memory. A table stored that way has already been cut to the row limit, and later formulas over it show no warning."
      ),
      tool("power-fx-formatter", "The formatter adds delegation hints when you paste a formula. It points at functions inside Filter and LookUp that commonly break delegation, which is useful when you are reviewing a formula outside Studio.")
    ),
    section(
      "cause-function-on-column",
      "Cause 1: a function wrapped around a column",
      p("This is the most common cause. Functions such as `Lower`, `Upper`, `Left`, `Mid`, `Len`, `Text` and `Value` cannot be delegated when they are applied to a column, because the data source would have to calculate them for every row."),
      code(`// Warning: Lower() has to run on every row
Filter(Requests, Lower(Owner.Email) = Lower(User().Email))

// Delegable: the column is compared as it is
With(
    {me: Lower(User().Email)},
    Filter(Requests, Owner.Email = me)
)`),
      p("The rule is that the column must stand alone on its side of the comparison. Anything that does not depend on the row, such as `User().Email`, `Today()` or a control value, is worked out once and sent as a constant, so functions around those are fine."),
      p("The same applies to dates. `Text(DueDate, \"yyyy-mm\") = \"2026-11\"` cannot be delegated. A range can: `DueDate >= Date(2026, 11, 1) && DueDate < Date(2026, 12, 1)`. See the [delegation-safe date range filter](/patterns/delegation-safe-date-range-filter).")
    ),
    section(
      "cause-in-operator",
      "Cause 2: the in operator",
      p("`in` tests whether text contains other text, or whether a value is in a list. SharePoint cannot delegate it. Dataverse can delegate `in` against a list of values for columns on the table you are filtering."),
      code(`// Warning on SharePoint: "contains" search
Filter(Requests, txtSearch.Text in Title)

// Delegable on SharePoint: "starts with" search
Filter(Requests, StartsWith(Title, txtSearch.Text))`),
      p("`StartsWith` is the usual replacement on SharePoint. It changes the behaviour, because it only matches the beginning of the column, so tell users. If you need a true contains search over a large list, that points to Dataverse, or to a Power Automate flow that runs the search.")
    ),
    section(
      "cause-search",
      "Cause 3: Search on SharePoint",
      p("`Search` is delegable to Dataverse and SQL Server. It is not delegable to SharePoint lists."),
      code(`// Warning on SharePoint
Search(Requests, txtSearch.Text, Title, RequesterName)

// Delegable on SharePoint
Filter(
    Requests,
    StartsWith(Title, txtSearch.Text) || StartsWith(RequesterName, txtSearch.Text)
)`),
      p("The [search with multiple fields pattern](/patterns/power-apps-search-with-multiple-fields) builds this out with an empty search box and a status filter.")
    ),
    section(
      "cause-aggregates",
      "Cause 4: totals and counts over a whole list",
      p("`CountRows`, `Sum`, `Average`, `Min` and `Max` are delegable to some data sources and not to others. Dataverse and SQL Server run them on the server. SharePoint does not, so the total covers only the first rows."),
      code(`// Warning on SharePoint: counts at most the row limit
CountRows(Filter(Requests, Status.Value = "Open"))`),
      p("There is no formula fix for this on SharePoint. The options are to keep the number somewhere it can be read directly, such as a summary list that a flow updates, to count in a flow, or to narrow the filter so the result is always well under the limit and say so in the app.")
    ),
    section(
      "cause-shaping",
      "Cause 5: reshaping the table before filtering it",
      p("`AddColumns`, `DropColumns`, `RenameColumns`, `ShowColumns`, `Distinct` and `GroupBy` work on rows that have already been downloaded. Applied straight to a data source, they receive only the first rows."),
      code(`// Warning: AddColumns sees only the first rows of Requests
Filter(
    AddColumns(Requests, IsLate, DueDate < Today()),
    IsLate
)

// Delegable filter first, then shape the smaller result
AddColumns(
    Filter(Requests, DueDate < Today()),
    IsLate, true
)`),
      p("Filter first, then shape. The filter is delegated and returns only matching rows. The shaping then runs on that smaller set. It is still capped at the row limit, so this only works when the filter narrows the data enough.")
    ),
    section(
      "check-your-data-source",
      "Check what your data source supports",
      p("Delegation is decided by the combination of function, column type and data source. The same formula can be fine on Dataverse and warn on SharePoint."),
      tool("power-apps-delegation-checker", "Pick your data source and see which functions and operators it can delegate, before you design the gallery filter."),
      p("For ready-made filters, the [gallery filtering cheat sheet](/cheat-sheets/power-apps-gallery-filtering-cheat-sheet) and the [delegation patterns](/power-apps/delegation) cover search boxes, status filters and date ranges.")
    ),
    section(
      "test-with-row-limit",
      "Test it: set the data row limit to 1",
      p("Microsoft recommends this test, and it takes a minute."),
      ol(
        "Open **Settings**, **General** and set **Data row limit** to 1.",
        "Run each screen. Anything delegated still works, because the data source does the work.",
        "Anything not delegated now returns one row, which is impossible to miss.",
        "Fix what broke, then set the limit back."
      ),
      p("This finds the cases that show no warning, such as a table held in a variable.")
    ),
    section(
      "when-safe",
      "When a warning is safe to leave",
      p("A warning matters only if the data can pass the row limit. It is reasonable to leave one when:"),
      ul(
        "The table is small and will stay small, such as a list of departments or status values.",
        "The formula runs on the result of a delegated filter that is always small, such as one user's open requests.",
        "The data is a collection you loaded on purpose and know the size of."
      ),
      p("Do not clear a warning by raising the data row limit. That makes every non-delegated query download more rows, slows the app, and only moves the point where results go missing. Write down why each remaining warning is safe, so the next maker does not have to work it out again. The [delegation review worksheet](/patterns/create-a-delegation-review-worksheet) is a format for that.")
    )
  ],
  faqs: [
    {
      question: "What does a delegation warning mean in Power Apps?",
      answer: "It means part of the formula cannot be run by the data source. Power Apps then downloads only the first rows, 500 by default, and runs the formula on those. If the data source has more rows than the limit, the results can be incomplete without any error."
    },
    {
      question: "What is the blue underline in a Power Apps formula?",
      answer: "A blue wavy line is a delegation warning. It marks the exact part of the formula that cannot be delegated to the data source. A red wavy line is different: it marks a formula error."
    },
    {
      question: "Can I ignore a delegation warning?",
      answer: "Only when the data cannot pass the data row limit, for example a small reference list or the result of a delegated filter that is always small. If the table can grow past the limit, the app will start returning partial results."
    },
    {
      question: "Does raising the data row limit fix delegation?",
      answer: "No. It makes the app download more rows for every non-delegated query, which slows it down, and results are still incomplete once the data passes the new limit. Change the formula so the data source can run it."
    },
    {
      question: "Why is there no delegation warning on my collection?",
      answer: "Warnings only appear for data sources that support delegation. A collection is already in memory, so there is nothing to delegate. If the collection was filled from a large data source without a delegable filter, it was cut to the row limit when it was loaded."
    },
    {
      question: "Which functions cause delegation warnings most often?",
      answer: "Functions applied to a column inside Filter or LookUp, such as Lower, Left, Len and Text. Next come the in operator and Search on SharePoint, totals such as CountRows and Sum on SharePoint, and table-shaping functions such as AddColumns applied directly to a data source."
    }
  ],
  relatedTools: ["power-fx-formatter", "power-apps-delegation-checker"],
  relatedPatterns: ["avoid-delegation-warnings-sharepoint-filters", "delegation-safe-date-range-filter", "power-apps-search-with-multiple-fields", "create-a-delegation-review-worksheet"],
  relatedLinks: [
    { href: "/power-apps/delegation", label: "Power Apps delegation patterns" },
    { href: "/cheat-sheets/power-apps-gallery-filtering-cheat-sheet", label: "Power Apps Gallery Filtering Cheat Sheet" },
    { href: "/guides/speed-up-slow-power-fx-formulas", label: "Speed up slow Power Fx formulas" }
  ],
  sources: [
    canvasDoc("delegation-overview", "Understand delegation in a canvas app"),
    powerFxDoc("reference/function-filter-lookup", "Filter, Search and LookUp functions"),
    canvasDoc("small-data-payloads", "Small data payloads")
  ]
};

export const formatFormulasGuide: Guide = {
  slug: "format-power-fx-formulas",
  title: "Format Power Fx formulas so they are easy to review",
  shortTitle: "Format Power Fx formulas",
  description: "How to format a Power Apps formula in Studio and outside it, with layout rules for arguments, records and chained actions, plus guidance on comments and minifying.",
  eyebrow: "Power Fx how-to",
  keywords: ["how to format Power Apps formula", "Power Fx formatting best practices", "Power Apps Format text", "Power Fx comments"],
  published,
  updated: published,
  quickAnswer: "In Power Apps Studio, expand the formula bar and select Format text. It puts each argument on its own line. Outside Studio, paste the formula into a formatter. For formulas you maintain, follow four rules: one argument per line once a call is long, four spaces per level, one action per line in behavior formulas, and a comment only where the reason is not obvious.",
  sections: [
    section(
      "format-in-studio",
      "Format a formula in Studio",
      ol(
        "Select the control and the property.",
        "Expand the formula bar with the arrow at its right-hand end, or drag its lower edge down.",
        "Select **Format text** under the formula bar.",
        "To put the formula back on one line, select **Remove formatting**."
      ),
      p("Formatting changes spaces and line breaks only. The formula does the same thing before and after."),
      p("Studio's command is all or nothing. It breaks calls across lines whatever their length, so a short call such as `Notify(\"Saved\", NotificationType.Success)` takes four lines and a ten-line formula can become forty. It also only works inside Studio, on one property at a time.")
    ),
    section(
      "format-outside-studio",
      "Format a formula outside Studio",
      p("You often need a readable formula somewhere Studio is not: a code review, a design document, a support ticket, a forum question, or a formula read from exported source files."),
      tool("power-fx-formatter", "Paste a formula to format it. Short calls stay on one line and long calls break with one argument per line. You can set the indent and line width, and it flags unbalanced brackets and likely delegation problems."),
      p("The difference from Studio is the line width. A call that fits within the width stays on one line. That keeps simple parts compact and gives the space to the parts that need reading.")
    ),
    section(
      "layout-rules",
      "Layout rules that make formulas reviewable",
      p("These rules match what Studio and the formatter produce, so a team can apply them by tool and not by hand."),
      ul(
        "**Short calls stay on one line.** `Notify(\"Saved\", NotificationType.Success)` does not need three lines.",
        "**Long calls get one argument per line**, indented four spaces, with the closing bracket on its own line under the function name.",
        "**Records follow the same rule.** A short record stays inline. A record with many fields gets one field per line.",
        "**Put a space after each comma and around operators.** `Amount > 100 && Status.Value = \"Open\"` reads faster than the version without spaces.",
        "**Break long conditions before `&&` and `||`**, so each condition starts a line."
      ),
      code(`// Before
If(IsBlank(txtTitle.Text)||IsBlank(dpDueDate.SelectedDate),Notify("Enter a title and a due date.",NotificationType.Error),Patch(Requests,Defaults(Requests),{Title:txtTitle.Text,DueDate:dpDueDate.SelectedDate,Priority:{Value:cmbPriority.Selected.Value},Owner:{Value:cmbOwner.Selected.Value}}))

// After
If(
    IsBlank(txtTitle.Text) || IsBlank(dpDueDate.SelectedDate),
    Notify("Enter a title and a due date.", NotificationType.Error),
    Patch(
        Requests,
        Defaults(Requests),
        {
            Title: txtTitle.Text,
            DueDate: dpDueDate.SelectedDate,
            Priority: {Value: cmbPriority.Selected.Value},
            Owner: {Value: cmbOwner.Selected.Value}
        }
    )
)`),
      p("In the second version a reviewer can answer three questions at a glance: what is checked, what the user is told, and which columns are written.")
    ),
    section(
      "behavior-formulas",
      "Chained actions: one per line",
      p("Behavior formulas such as `OnSelect` run several actions in order, separated by semicolons. Give each action its own line and end the line with the semicolon."),
      code(`Set(varSaving, true);
Patch(Requests, galRequests.Selected, {Status: {Value: "Closed"}});
Refresh(Requests);
Set(varSaving, false);
Notify("Request closed.", NotificationType.Success)`),
      p("When a behavior formula passes about fifteen lines, it is doing more than one job. Split it: move calculations into named formulas, and repeated steps into a hidden button you trigger with `Select`, or into a user-defined function. Formatting makes a long formula readable. It does not make it short.")
    ),
    section(
      "comments",
      "Comments: what to write and where",
      p("Power Fx has two kinds of comment."),
      code(`// A line comment runs to the end of the line.

/* A block comment
   can cover several lines. */

Filter(
    Requests,
    // Managers see every request. Everyone else sees their own.
    varIsManager || Owner.Email = varUserEmail
)`),
      p("Write a comment for the reason, not the action. `// Filter requests` adds nothing. A comment is worth writing when it records:"),
      ul(
        "**A business rule**: why this status, this threshold, this group of people.",
        "**A workaround**: what limitation the formula is working around, so nobody simplifies it and breaks it.",
        "**A deliberate delegation choice**: why a warning is safe to leave.",
        "**Units and formats**: that a number is in minutes, or a date is stored in UTC."
      ),
      p("Comments are saved with the app and add nothing to its running cost, so there is no reason to strip them. A comment that describes old behaviour is worse than none, so update the comment when you change the formula.")
    ),
    section(
      "names",
      "Names do more than layout",
      p("Layout shows the structure of a formula. Names tell the reader what the parts are. `Filter(Requests, Owner.Email = varUserEmail)` needs no comment. `Filter(DataSource1, Column3 = Variable2)` cannot be saved by formatting."),
      tool("power-apps-naming-linter", "Check the control, variable and collection names in an app against a naming convention."),
      p("The [Power Apps naming standards](/standards/power-apps-naming-standards) list the prefixes. Inside a formula, `With` gives a name to a value used more than once, which is covered in the [With pattern](/patterns/with-function-readable-power-fx-formulas).")
    ),
    section(
      "sharing",
      "Formatting a formula to share it",
      ul(
        "**In a forum post or ticket**, format the formula and paste it as a code block. Say which property it is in and which data source it uses. You will get an answer faster.",
        "**In a design document**, keep the formatted version and note the control and property above it.",
        "**In a code review**, format both the old and the new version the same way, so a comparison shows the real change and not the whitespace.",
        "**Before sharing outside your organisation**, replace real list names, site addresses and email addresses."
      ),
      p("The [formula review checklist](/patterns/create-a-formula-review-checklist) lists what a reviewer should check once the formula is readable.")
    ),
    section(
      "minify",
      "Minifying: when one line is useful",
      p("Minifying is the reverse of formatting. It removes line breaks and extra spaces. It is useful when a formula has to fit in a spreadsheet cell, a single-line field in a document template, or a chat message."),
      p("One detail matters. A `//` comment runs to the end of the line, so once the line breaks are removed it would swallow the rest of the formula. The formatter's minify option converts `//` comments to block comments so the result is still valid. Do not minify formulas inside an app. It makes no difference to speed and makes them harder to maintain.")
    )
  ],
  faqs: [
    {
      question: "How do I format a formula in Power Apps?",
      answer: "Expand the formula bar and select Format text underneath it. Power Apps puts each argument on its own line with indentation. Select Remove formatting to turn the formula back into one line."
    },
    {
      question: "Does formatting a Power Fx formula change how it runs?",
      answer: "No. Formatting only changes spaces and line breaks. The formula is calculated in exactly the same way and runs at the same speed."
    },
    {
      question: "How do I add a comment to a Power Apps formula?",
      answer: "Use two forward slashes for a comment that runs to the end of the line, or wrap the comment in /* and */ to cover several lines. Comments are saved with the app and do not affect how the formula runs."
    },
    {
      question: "How many spaces should Power Fx be indented?",
      answer: "Four spaces per level is what Power Apps Studio uses and what most teams follow. The exact number matters less than using the same one everywhere, which is easiest if a formatter applies it."
    },
    {
      question: "Can I format formulas for a whole app at once?",
      answer: "Not inside Studio, where Format text works on one property at a time. For a review, you can copy formulas from the app's exported source or from code view and format each one outside Studio."
    },
    {
      question: "Should I remove comments and formatting to make an app faster?",
      answer: "No. Line breaks, spaces and comments have no effect on how fast a formula runs. Removing them only makes the app harder to maintain."
    }
  ],
  relatedTools: ["power-fx-formatter", "power-apps-naming-linter"],
  relatedPatterns: ["with-function-readable-power-fx-formulas", "create-a-formula-review-checklist", "power-apps-user-defined-functions-reuse-logic"],
  relatedLinks: [
    { href: "/standards/power-apps-naming-standards", label: "Power Apps Naming Standards" },
    { href: "/guides/find-missing-bracket-power-fx-formula", label: "Find a missing bracket or quote" },
    { href: "/guides/replace-nested-if-power-fx", label: "Replace nested If formulas" }
  ],
  sources: [
    powerFxDoc("expression-grammar", "Power Fx expression grammar"),
    canvasDoc("working-with-large-apps", "Build large and complex canvas apps"),
    canvasDoc("working-with-formulas", "Get started with formulas in canvas apps")
  ]
};
