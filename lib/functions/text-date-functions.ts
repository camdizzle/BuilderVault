import { canvasDoc, code, note, p, section, table, ul } from "../guides/types";
import { fxRef, type FunctionPage } from "./types";

const published = "2026-11-21";
const category = "Text and dates" as const;

export const textFunction: FunctionPage = {
  slug: "text",
  name: "Text",
  category,
  title: "Text function in Power Apps: format numbers and dates as text",
  description: "How the Power Fx Text function formats numbers, currency and dates with format codes or built-in formats, sets the language of the result, and converts any value to text.",
  keywords: ["Power Apps Text function", "format date Power Apps", "format number Power Apps", "Text currency format", "DateTimeFormat Power Apps"],
  published,
  updated: published,
  quickAnswer: "Text(Value, Format) turns a number or date into text in the format you give. Use a custom format such as \"dd/mm/yyyy\" or \"$#,##0.00\", or a built-in one such as DateTimeFormat.ShortDate, which follows the user's language. Add a language tag, such as \"en-GB\", as the third argument to fix the language. Text(Value) on its own converts any value to text.",
  syntax: `Text( NumberOrDateTime, DateTimeFormatEnum [, ResultLanguageTag ] )
Text( NumberOrDateTime, CustomFormat [, ResultLanguageTag ] )
Text( AnyValue )`,
  arguments: [
    ["`NumberOrDateTime`", "Required", "The number, date or time to format."],
    ["`DateTimeFormatEnum`", "Required (first form)", "A built-in format, such as `DateTimeFormat.ShortDate` or `DateTimeFormat.LongDateTime`."],
    ["`CustomFormat`", "Required (second form)", "A format code in quotation marks, such as `\"yyyy-mm-dd\"` or `\"#,##0.00\"`."],
    ["`ResultLanguageTag`", "Optional", "The language of the result, such as `\"en-US\"` or `\"fr-FR\"`. The user's language by default."],
    ["`AnyValue`", "Required (third form)", "Any value to convert to text with no formatting."]
  ],
  returns: "Text.",
  usableIn: "Any formula",
  delegation: "Text around a column inside Filter is not delegated. Format the value you compare with, not the column.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// Dates
Text(ThisItem.DueDate, "dd mmm yyyy")              // 07 Apr 2026
Text(ThisItem.DueDate, DateTimeFormat.ShortDate)   // follows the user's language
Text(Now(), "yyyy-mm-dd hh:mm")                    // 2026-04-07 20:26

// Numbers and currency
Text(1234.5, "#,##0.00")        // 1,234.50
Text(0.256 * 100, "0.0") & "%"  // 25.6%
Text(ThisItem.Amount, "$#,##0") // $1,235

// A fixed language for the result
Text(ThisItem.DueDate, "dddd d mmmm", "fr-FR")     // mardi 7 avril`)
    ),
    section(
      "codes",
      "Format codes",
      table(
        ["Code", "Shows"],
        ["`d`, `dd`", "Day: 7, 07"],
        ["`ddd`, `dddd`", "Weekday: Tue, Tuesday"],
        ["`m`, `mm`, `mmm`, `mmmm`", "Month: 4, 04, Apr, April"],
        ["`yy`, `yyyy`", "Year: 26, 2026"],
        ["`h`, `hh`", "Hour, 24-hour unless the format has AM/PM"],
        ["`mm` after `h` or before `ss`", "Minutes"],
        ["`ss`", "Seconds"],
        ["`AM/PM`", "12-hour clock with AM or PM"],
        ["`0`", "A digit, with leading or trailing zeros kept"],
        ["`#`", "A digit, without extra zeros"],
        ["`,` and `.`", "Thousands separator and decimal point"]
      ),
      p("`m` means month unless it comes right after an hour or right before seconds, when it means minutes. That is why `\"hh:mm\"` gives minutes and `\"mm/dd\"` gives the month.")
    ),
    section(
      "built-in",
      "Built-in formats",
      p("The `DateTimeFormat` values follow the user's language and region, so one formula shows 07/04/2026 to a UK user and 4/7/2026 to a US user. They are the safer choice for apps used in more than one country."),
      table(
        ["Format", "Gives"],
        ["`ShortDate`, `LongDate`", "The date, as numbers or with names"],
        ["`ShortTime`, `LongTime`", "The time on a 12-hour clock"],
        ["`ShortTime24`, `LongTime24`", "The time on a 24-hour clock"],
        ["`ShortDateTime`, `LongDateTime`", "Date and time, 12-hour"],
        ["`ShortDateTime24`, `LongDateTime24`", "Date and time, 24-hour"],
        ["`UTC`", "The date and time converted to UTC, in ISO 8601 form"]
      ),
      note("`Text(Now(), DateTimeFormat.UTC)` is the usual way to send a timestamp to a flow or an API, because ISO 8601 text is understood everywhere.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Formatting before doing maths.** `Text` returns text, so `Text(Price, \"0.00\") * 2` converts back. Do the maths first and format last.",
        "**Wrapping the column in Text inside a Filter.** It stops delegation. Compare the column with a value.",
        "**Copying Power Automate format codes.** Power Automate's `formatDateTime` uses .NET codes, where `MM` is month and `mm` is minutes. In Power Fx both are `m`, told apart by position, so check a format copied from a flow."
      )
    )
  ],
  faqs: [
    { question: "How do I format a date as dd/mm/yyyy in Power Apps?", answer: "Use Text(DateValue, \"dd/mm/yyyy\"). If the app is used in several countries, consider Text(DateValue, DateTimeFormat.ShortDate), which follows each user's region." },
    { question: "How do I show a number as currency in Power Apps?", answer: "Give a format with the currency symbol, as in Text(Amount, \"$#,##0.00\"). Add a language tag as the third argument if the separators must not change with the user's language." },
    { question: "How do I convert a number to text without formatting?", answer: "Use Text(Value) with one argument, or join it to text with &, as in \"Total: \" & Value." }
  ],
  relatedFunctions: ["dateadd-datediff", "concat", "coalesce"],
  relatedGuides: ["power-fx-text-function-format-dates-numbers-currency", "power-fx-commas-vs-semicolons"],
  relatedErrors: ["datetime-string-must-match-iso-8601-format"],
  relatedPatterns: ["power-apps-multi-language-labels-localisation"],
  relatedTools: ["power-fx-formatter"],
  sources: [fxRef("function-text", "Text function")]
};

export const dateAddDiffFunction: FunctionPage = {
  slug: "dateadd-datediff",
  name: "DateAdd and DateDiff",
  category,
  title: "DateAdd and DateDiff in Power Apps: add to dates and count the gap",
  description: "How the Power Fx DateAdd and DateDiff functions add days, months or hours to a date, count whole units between two dates, convert between local time and UTC, and count working days.",
  keywords: ["Power Apps DateAdd", "Power Apps DateDiff", "DateDiff days hours Power Apps", "add business days Power Apps", "TimeZoneOffset Power Apps"],
  published,
  updated: published,
  quickAnswer: "DateAdd(Date, Number, Unit) adds that many units to a date, or subtracts them when the number is negative. DateDiff(Start, End, Unit) returns the whole number of units from start to end, negative when end is earlier. Units are TimeUnit.Days (the default), Months, Hours, Minutes and so on. DateDiff counts whole units only, so for hours and minutes, count in a smaller unit and divide.",
  syntax: `DateAdd( DateTime, Addition [, Units ] )
DateDiff( StartDateTime, EndDateTime [, Units ] )
TimeZoneOffset( [ DateTime ] )`,
  arguments: [
    ["`DateTime`", "Required", "The date or date and time to add to."],
    ["`Addition`", "Required", "How many units to add. Negative to subtract."],
    ["`StartDateTime`, `EndDateTime`", "Required (DateDiff)", "The two dates. The result is end minus start."],
    ["`Units`", "Optional", "`TimeUnit.Milliseconds`, `Seconds`, `Minutes`, `Hours`, `Days`, `Months`, `Quarters` or `Years`. Days if you leave it out."]
  ],
  returns: "`DateAdd` returns a date and time. `DateDiff` returns a whole number. `TimeZoneOffset` returns the minutes between the user's local time and UTC.",
  usableIn: "Any formula",
  delegation: "On a column inside Filter, not delegated. Work out the date first, as in `DueDate < DateAdd(Today(), 7)`, which delegates.",
  sections: [
    section(
      "examples",
      "Examples",
      code(`// A week from today, and a month ago
DateAdd(Today(), 7)
DateAdd(Today(), -1, TimeUnit.Months)

// Days until due, negative when overdue
DateDiff(Today(), ThisItem.DueDate)

// Age in whole years, roughly
DateDiff(ThisItem.BirthDate, Today(), TimeUnit.Years)

// Requests due in the next seven days (delegable)
Filter(Requests, DueDate >= Today(), DueDate < DateAdd(Today(), 7))`)
    ),
    section(
      "whole-units",
      "DateDiff counts whole units",
      p("DateDiff returns a whole number in the unit you ask for, and ignores the smaller parts. Between 09:45 and 10:15, DateDiff in hours is 1, because it compares the hours, 9 and 10."),
      code(`// 0.5 hours, from minutes
DateDiff(TimeValue("09:45"), TimeValue("10:15"), TimeUnit.Minutes) / 60

// Hours and minutes as text, such as 2h 05m
With(
    { mins: DateDiff(ThisItem.Start, ThisItem.End, TimeUnit.Minutes) },
    RoundDown(mins / 60, 0) & "h " & Text(Mod(mins, 60), "00") & "m"
)`),
      p("The same applies to years. `DateDiff` in years compares the years only, so someone born in December is counted a year older in January. For an exact age, compare months and days as well.")
    ),
    section(
      "utc",
      "Local time and UTC",
      p("`TimeZoneOffset()` is the minutes between the user's local time and UTC. Adding it converts local time to UTC, and subtracting it converts UTC to local time."),
      code(`// Local to UTC
DateAdd(Now(), TimeZoneOffset(), TimeUnit.Minutes)

// UTC to local
DateAdd(varUtc, -TimeZoneOffset(varUtc), TimeUnit.Minutes)`),
      note("Most data sources already convert between UTC and the user's time zone for you. Only convert yourself when a value really arrives as UTC text, for example from a flow. The [Dataverse date-only pattern](/patterns/dataverse-date-only-time-zone-behavior) explains a common trap.")
    ),
    section(
      "working-days",
      "Working days",
      p("Power Fx has no built-in working-days function. Count the weekdays between two dates with a Sequence of days."),
      code(`// Weekdays from Start up to, but not including, End
With(
    { days: DateDiff(ThisItem.Start, ThisItem.End) },
    CountRows(
        Filter(
            ForAll(Sequence(Max(days, 0)), DateAdd(ThisItem.Start, Value - 1)),
            Weekday(Value, StartOfWeek.Monday) <= 5
        )
    )
)`),
      p("To skip public holidays as well, keep them in a list and add `Not(Value in Holidays.Date)` to the filter.")
    ),
    section(
      "mistakes",
      "Common mistakes",
      ul(
        "**Swapping the arguments of DateDiff.** The result is end minus start, so the later date goes second for a positive number.",
        "**Expecting fractions.** DateDiff gives whole units. Use a smaller unit and divide.",
        "**DateAdd on a column in a Filter.** Move it to the other side of the comparison.",
        "**Writing `TimeUnit.Day`.** The names are plural: `TimeUnit.Days`, `TimeUnit.Months`."
      )
    )
  ],
  faqs: [
    { question: "How do I add days to a date in Power Apps?", answer: "Use DateAdd(Date, Days), as in DateAdd(Today(), 30). Days is the default unit. Use a negative number to go back." },
    { question: "How do I calculate hours between two times in Power Apps?", answer: "Use DateDiff in minutes and divide by 60: DateDiff(Start, End, TimeUnit.Minutes) / 60. DateDiff in hours returns a whole number and ignores the minutes." },
    { question: "Why is my DateDiff result negative?", answer: "The end date is earlier than the start date. DateDiff returns end minus start, so put the earlier date first." }
  ],
  relatedFunctions: ["text", "filter", "forall"],
  relatedGuides: ["power-fx-text-function-format-dates-numbers-currency"],
  relatedErrors: ["datetime-string-must-match-iso-8601-format"],
  relatedPatterns: ["delegation-safe-date-range-filter", "dataverse-date-only-time-zone-behavior"],
  relatedTools: ["power-fx-formatter", "power-apps-delegation-checker"],
  sources: [fxRef("function-dateadd-datediff", "DateAdd, DateDiff and TimeZoneOffset functions"), canvasDoc("show-text-dates-times", "Show text, dates and times in canvas apps")]
};

export const textDateFunctions: FunctionPage[] = [textFunction, dateAddDiffFunction];
