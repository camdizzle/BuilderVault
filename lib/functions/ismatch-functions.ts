import { code, note, p, section, table, ul } from "../guides/types";
import { fxRef, type FunctionPage } from "./types";

// Checked against Microsoft's IsMatch, Match and MatchAll reference and "Regular expressions in
// Power Fx" on 2026-11-28. The regex tester (lib/tools/regex-tester.ts) uses the same defaults.

const published = "2026-11-28";

export const isMatchFunction: FunctionPage = {
  slug: "ismatch",
  name: "IsMatch, Match, MatchAll",
  category: "Text and dates",
  title: "IsMatch, Match and MatchAll in Power Apps: check text and pull values out of it",
  description: "How the Power Fx IsMatch function checks text against a pattern, and how Match and MatchAll return the parts that matched. Covers the Power Apps defaults, MatchOptions, the Match enum, named submatches and why the pattern must be a constant.",
  keywords: ["Power Apps IsMatch", "IsMatch function", "Power Apps Match function", "MatchAll Power Apps", "Power Fx regular expression", "IsMatch email Power Apps"],
  published,
  updated: published,
  quickAnswer: "IsMatch(Text, Pattern) returns true when the text fits the pattern. In Power Apps it checks the whole text by default, so IsMatch(txtCode.Text, \"CC-[0-9]{4}\") is true for CC-1234 and false for CC-12345. Match returns the first match as a record with FullMatch, StartMatch and any named submatches, or blank when nothing matches. MatchAll returns every match as a table. Matching is case-sensitive unless you add MatchOptions.IgnoreCase, and the pattern must be a constant written in the formula.",
  syntax: `IsMatch( Text, Pattern [, Options ] )
Match( Text, Pattern [, Options ] )
MatchAll( Text, Pattern [, Options ] )`,
  arguments: [
    ["`Text`", "Required", "The text to test or search, such as `txtEmail.Text`."],
    ["`Pattern`", "Required", "A regular expression in quotes, `Match` enum values such as `Match.Email`, or both joined with `&`. It must be a constant: not a variable, a column or a control's value."],
    ["`Options`", "Optional", "`MatchOptions` values joined with `&`, such as `MatchOptions.Complete & MatchOptions.IgnoreCase`. Also a constant."]
  ],
  returns: "**IsMatch:** true or false. **Match:** a record with `FullMatch`, `StartMatch`, `SubMatches` and a column per named submatch, or blank when nothing matches. **MatchAll:** a table of those records, empty when nothing matches.",
  usableIn: "Any formula",
  delegation: "Not delegable. Use these on text in the app, such as a control's value or a column of a small, already-filtered table, not inside a Filter on a large data source.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Is the cost centre in the form CC-1234? (whole text, case-sensitive)
IsMatch(txtCostCentre.Text, "CC-[0-9]{4}")

// The same, ignoring case. Name Complete as well once you pass options
IsMatch(txtCostCentre.Text, "CC-[0-9]{4}", MatchOptions.Complete & MatchOptions.IgnoreCase)

// A predefined pattern from the Match enum
IsMatch(txtEmail.Text, Match.Email)

// The first request number in a subject line, or blank
Match(txtSubject.Text, "REQ-[0-9]{5}").FullMatch

// Every request number in a notes field, as one line of text
Concat(MatchAll(txtNotes.Text, "REQ-[0-9]{5}"), FullMatch, ", ")`),
      table(
        ["Formula", "Text", "Result"],
        ["`IsMatch(t, \"CC-[0-9]{4}\")`", "CC-1234", "true"],
        ["`IsMatch(t, \"CC-[0-9]{4}\")`", "cc-1234", "false, because matching is case-sensitive"],
        ["`IsMatch(t, \"CC-[0-9]{4}\")`", "CC-12345", "false, because the whole text must match"],
        ["`Match(t, \"REQ-[0-9]{5}\").FullMatch`", "RE: REQ-00042 laptop", "REQ-00042"],
        ["`CountRows(MatchAll(t, \"REQ-[0-9]{5}\"))`", "REQ-00042 and REQ-00051", "2"]
      )
    ),
    section(
      "defaults",
      "Where the pattern has to match",
      p("The three functions start from different defaults in Power Apps, which is the most common source of surprises:"),
      table(
        ["Function", "Default", "Means"],
        ["`IsMatch`", "`MatchOptions.Complete`", "The pattern must cover the whole text, as if it had `^` at the start and `$` at the end"],
        ["`Match`, `MatchAll`", "`MatchOptions.Contains`", "The pattern can match anywhere in the text"]
      ),
      p("So you don't need `^` and `$` in an IsMatch pattern. To check that text only starts with something, use `MatchOptions.BeginsWith`. To find a word anywhere, use `MatchOptions.Contains`."),
      table(
        ["Option", "What it does"],
        ["`MatchOptions.Complete`", "Match the whole text"],
        ["`MatchOptions.Contains`", "Match anywhere in the text"],
        ["`MatchOptions.BeginsWith`", "Match from the start"],
        ["`MatchOptions.EndsWith`", "Match up to the end"],
        ["`MatchOptions.IgnoreCase`", "Treat upper and lower case as the same"],
        ["`MatchOptions.Multiline`", "Let `^` and `$` match at the start and end of each line"]
      ),
      note("Microsoft's reference lists MatchOptions.DotAll and MatchOptions.FreeSpacing too, but they aren't available in Power Apps.")
    ),
    section(
      "match-enum",
      "Predefined patterns",
      p("The `Match` enum gives names to common pieces, which you join with `&` to your own text. For example `\"A\" & Match.MultipleDigits` matches A followed by one or more digits."),
      table(
        ["Enum value", "Matches"],
        ["`Match.Digit`, `Match.MultipleDigits`, `Match.OptionalDigits`", "One digit, one or more, zero or more"],
        ["`Match.Letter`, `Match.MultipleLetters`, `Match.OptionalLetters`", "One letter, one or more, zero or more"],
        ["`Match.Space`, `Match.MultipleSpaces`, `Match.OptionalSpaces`", "Whitespace: one, one or more, zero or more"],
        ["`Match.NonSpace`, `Match.MultipleNonSpaces`", "Anything but whitespace"],
        ["`Match.Email`", "An address with an @ and a domain that contains a dot"],
        ["`Match.Period`, `Match.Comma`, `Match.Hyphen`, `Match.LeftParen`, `Match.RightParen`", "That one character"],
        ["`Match.Any`, `Match.Tab`", "Any character, a tab"]
      ),
      p("`Match.Email` checks the shape of an address, not whether the mailbox exists.")
    ),
    section(
      "submatches",
      "Reading parts of a match",
      p("Name a part of the pattern with `(?<name>...)` and Match returns it as a column of that name:"),
      code(`// "Sam Lee <sam.lee@contoso.com>" gives name "Sam Lee" and email "sam.lee@contoso.com"
With(
    { m: Match(txtFrom.Text, "(?<name>[^<]+?)\\s*<(?<email>[^>]+)>") },
    If(IsBlank(m), "No address found", m.name & " (" & m.email & ")")
)`),
      p("Match returns blank when nothing matches, so test it with `IsBlank` before reading a column. MatchAll returns an empty table, so test that with `IsEmpty`. Wrapping the Match in `With` runs it once instead of once per use.")
    ),
    section(
      "constant",
      "The pattern must be a constant",
      p("Power Apps checks the pattern when you write the formula, so it can't come from a variable, a column or what a user typed. Text in quotes, `Match` enum values and `&` between them are all fine. If different records need different formats, use `Switch` over a few fixed `IsMatch` calls."),
      code(`Switch(
    drpCountry.Selected.Value,
    "UK", IsMatch(txtPostcode.Text, "[A-Za-z]{1,2}[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}"),
    "US", IsMatch(txtPostcode.Text, "[0-9]{5}(-[0-9]{4})?"),
    true
)`, "A different format per country")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Typing backslashes twice.** Power Fx text has no escape characters, so `\\d` is typed once, not as `\\\\d`.",
        "**Leaving a hyphen unescaped inside [ ].** The stricter Power Fx 1.0 rules need `[0-9 \\-]`, not `[0-9 -]`.",
        "**Forgetting the dot is special.** `contoso.com` also matches `contosoXcom`. Write `contoso\\.com`.",
        "**Testing Match with IsEmpty or MatchAll with IsBlank.** It's the other way round.",
        "**Using IsMatch inside Filter on a big list.** It isn't delegated, so only the first rows are checked."
      )
    )
  ],
  faqs: [
    {
      question: "Do I need ^ and $ in an IsMatch pattern in Power Apps?",
      answer: "No. In Power Apps, IsMatch uses MatchOptions.Complete by default, so the pattern already has to match the whole text. Match and MatchAll default to Contains and find the pattern anywhere."
    },
    {
      question: "Is IsMatch case-sensitive?",
      answer: "Yes. Add MatchOptions.IgnoreCase to treat upper and lower case as the same, for example IsMatch(txtCode.Text, \"CC-[0-9]{4}\", MatchOptions.Complete & MatchOptions.IgnoreCase)."
    },
    {
      question: "Can the IsMatch pattern come from a variable?",
      answer: "No. The pattern and the options must be constants written in the formula. Use Switch over a few fixed IsMatch calls when the format depends on another value."
    },
    {
      question: "What does Match return when nothing matches?",
      answer: "Blank. Check it with IsBlank before reading FullMatch or a named submatch. MatchAll returns an empty table instead, which you check with IsEmpty."
    },
    {
      question: "Can I use IsMatch in a Filter on SharePoint or Dataverse?",
      answer: "Not on a large table. IsMatch, Match and MatchAll aren't delegated, so the filter only sees the first rows up to the data row limit. Filter with delegable conditions first, then apply IsMatch to the smaller result."
    }
  ],
  relatedFunctions: ["text", "with", "filter"],
  relatedGuides: ["power-apps-delegation-warning-explained"],
  relatedErrors: [],
  relatedPatterns: ["validate-power-apps-form-with-ismatch", "extract-text-with-match-matchall-power-apps", "sharepoint-column-list-validation-formulas"],
  relatedTools: ["power-fx-regex-tester"],
  sources: [
    fxRef("function-ismatch", "IsMatch, Match and MatchAll functions"),
    { href: "https://learn.microsoft.com/en-us/power-platform/power-fx/regular-expressions", label: "Regular expressions in Power Fx" }
  ]
};
