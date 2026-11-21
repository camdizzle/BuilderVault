// Templates for the Power Automate expression builder. Each template turns a few inputs into an
// expression that is safe to paste into the expression editor.

export type TemplateGroup =
  | "Dates and times"
  | "Text"
  | "Numbers"
  | "Arrays and loops"
  | "Trigger conditions"
  | "Approvals"
  | "Flow details";

export const templateGroups: TemplateGroup[] = ["Dates and times", "Text", "Numbers", "Arrays and loops", "Trigger conditions", "Approvals", "Flow details"];

export type TemplateInput = {
  key: string;
  label: string;
  /**
   * expression: a value pasted as written, such as triggerOutputs()?['body/DueDate'].
   * text: plain text, quoted for you.
   * number: a whole number.
   * name: an action, loop or column name, used inside an expression.
   * choice: one of the options.
   */
  kind: "expression" | "text" | "number" | "name" | "choice";
  defaultValue: string;
  help: string;
  options?: Array<{ value: string; label: string }>;
};

export type TemplateLink = { href: string; label: string };

export type ExpressionTemplate = {
  id: string;
  group: TemplateGroup;
  title: string;
  summary: string;
  inputs: TemplateInput[];
  build: (values: Record<string, string>) => string;
  notes: string[];
  links: TemplateLink[];
};

/** Quotes text for an expression, doubling any single quotes inside it. */
export function quote(value: string) {
  return "'" + value.replace(/'/g, "''") + "'";
}

/** Action and loop names are referenced with underscores in place of spaces. */
export function actionName(value: string) {
  return value.trim().replace(/\s+/g, "_").replace(/'/g, "''");
}

/** A column or property name inside a ['...'] path. */
function pathName(value: string) {
  return value.trim().replace(/'/g, "''");
}

const errorLink = (slug: string, label: string): TemplateLink => ({ href: `/errors/${slug}`, label });
const toolLink = (slug: string, label: string): TemplateLink => ({ href: `/tools/${slug}`, label });

const nullError = errorLink("template-function-expects-string-provided-value-null", "Expects a string, but the value is null");
const isoError = errorLink("datetime-string-must-match-iso-8601-format", "The datetime string must match ISO 8601 format");
const templateError = errorLink("invalidtemplate-unable-to-process-template-language-expressions", "Unable to process template language expressions");

const dateValue: TemplateInput = {
  key: "value",
  label: "Date value",
  kind: "expression",
  defaultValue: "triggerOutputs()?['body/DueDate']",
  help: "An expression that returns a date, such as a trigger output or utcNow()."
};

const dateFormat: TemplateInput = {
  key: "format",
  label: "Format",
  kind: "choice",
  defaultValue: "MMM d, yyyy",
  help: "A .NET date format. Test others in the date format tester.",
  options: [
    { value: "MMM d, yyyy", label: "MMM d, yyyy (Jan 31, 2026)" },
    { value: "dd/MM/yyyy", label: "dd/MM/yyyy (31/01/2026)" },
    { value: "M/d/yyyy", label: "M/d/yyyy (1/31/2026)" },
    { value: "yyyy-MM-dd", label: "yyyy-MM-dd (2026-01-31)" },
    { value: "dddd, MMMM d, yyyy", label: "dddd, MMMM d, yyyy (Saturday, January 31, 2026)" },
    { value: "M/d/yyyy h:mm tt", label: "M/d/yyyy h:mm tt (1/31/2026 9:05 AM)" },
    { value: "yyyy-MM-dd HH:mm", label: "yyyy-MM-dd HH:mm (2026-01-31 09:05)" }
  ]
};

const timeZoneInput: TemplateInput = {
  key: "zone",
  label: "Time zone",
  kind: "choice",
  defaultValue: "Eastern Standard Time",
  help: "The Windows time zone name that convertTimeZone expects.",
  options: [
    "Pacific Standard Time",
    "Mountain Standard Time",
    "Central Standard Time",
    "Eastern Standard Time",
    "GMT Standard Time",
    "W. Europe Standard Time",
    "Romance Standard Time",
    "India Standard Time",
    "Singapore Standard Time",
    "Tokyo Standard Time",
    "AUS Eastern Standard Time",
    "New Zealand Standard Time"
  ].map((value) => ({ value, label: value }))
};

const textValue: TemplateInput = {
  key: "value",
  label: "Text value",
  kind: "expression",
  defaultValue: "triggerOutputs()?['body/Title']",
  help: "An expression that returns text, such as a trigger output or an action output."
};

const getItemsAction: TemplateInput = {
  key: "action",
  label: "Action name",
  kind: "name",
  defaultValue: "Get items",
  help: "The action's name exactly as it appears in the designer. Spaces become underscores."
};

const approvalAction: TemplateInput = {
  key: "action",
  label: "Approval action name",
  kind: "name",
  defaultValue: "Start and wait for an approval",
  help: "The approval action's name exactly as it appears in the designer."
};

const columnInput = (defaultValue: string, help = "The column's internal name, not its display name."): TemplateInput => ({
  key: "column",
  label: "Column internal name",
  kind: "name",
  defaultValue,
  help
});

export const expressionTemplates: ExpressionTemplate[] = [
  // Dates and times
  {
    id: "format-date-safe",
    group: "Dates and times",
    title: "Format a date, even when it's empty",
    summary: "Formats a date for an email or a text column, and returns your fallback text instead of failing when the date is empty.",
    inputs: [dateValue, dateFormat, { key: "fallback", label: "Text when the date is empty", kind: "text", defaultValue: "", help: "Leave empty to return no text." }],
    build: (v) => `if(empty(${v.value}), ${quote(v.fallback)}, formatDateTime(${v.value}, ${quote(v.format)}))`,
    notes: [
      "formatDateTime fails when the date is empty, so the empty check comes first. if() only works out the branch it returns.",
      "Dates from SharePoint and Dataverse are in UTC. To show local time, use the time zone template instead."
    ],
    links: [nullError, isoError, toolLink("date-format-tester", "Date format tester")]
  },
  {
    id: "convert-time-zone",
    group: "Dates and times",
    title: "Convert a UTC date to a time zone",
    summary: "Turns a UTC date, such as utcNow() or a SharePoint date, into local time in a chosen time zone and format.",
    inputs: [{ ...dateValue, defaultValue: "utcNow()" }, timeZoneInput, dateFormat],
    build: (v) => `convertTimeZone(${v.value}, 'UTC', ${quote(v.zone)}, ${quote(v.format)})`,
    notes: [
      "The time zone names are Windows names, such as Eastern Standard Time. They handle daylight saving time for you.",
      "If the date can be empty, wrap it the same way as the empty-safe format template."
    ],
    links: [isoError, toolLink("date-format-tester", "Date format tester")]
  },
  {
    id: "add-days",
    group: "Dates and times",
    title: "Add or subtract days",
    summary: "Works out a date a number of days before or after another date, such as a due date or a reminder date.",
    inputs: [
      { ...dateValue, defaultValue: "utcNow()" },
      { key: "days", label: "Days to add (negative to subtract)", kind: "number", defaultValue: "7", help: "A whole number. Use -7 for a week ago." },
      { ...dateFormat, defaultValue: "yyyy-MM-dd" }
    ],
    build: (v) => `addDays(${v.value}, ${v.days}, ${quote(v.format)})`,
    notes: [
      "addHours, addMinutes and addSeconds work the same way.",
      "For a date to compare in a Filter Query, keep the yyyy-MM-dd or full ISO format."
    ],
    links: [isoError]
  },
  {
    id: "days-between",
    group: "Dates and times",
    title: "Days between two dates",
    summary: "Counts the whole days between two dates, for example how many days a request has been open.",
    inputs: [
      { key: "start", label: "Start date", kind: "expression", defaultValue: "triggerOutputs()?['body/Created']", help: "The earlier date." },
      { key: "end", label: "End date", kind: "expression", defaultValue: "utcNow()", help: "The later date." }
    ],
    build: (v) => `div(sub(ticks(${v.end}), ticks(${v.start})), 864000000000)`,
    notes: [
      "ticks() counts 100-nanosecond steps, and a day is 864,000,000,000 of them. div() drops any part day.",
      "Both dates must have a value. ticks() fails on an empty date."
    ],
    links: [nullError]
  },
  {
    id: "is-past",
    group: "Dates and times",
    title: "Check whether a date has passed",
    summary: "Returns true when a date is earlier than now, and false when it is in the future or empty.",
    inputs: [dateValue],
    build: (v) => `if(empty(${v.value}), false, less(ticks(${v.value}), ticks(utcNow())))`,
    notes: ["Use it in a Condition with \"is equal to\" true, or inside a trigger condition with @ in front."],
    links: [nullError]
  },
  {
    id: "is-weekend",
    group: "Dates and times",
    title: "Check whether a date is on a weekend",
    summary: "Returns true for Saturday and Sunday, so a flow can skip or move weekend work.",
    inputs: [{ ...dateValue, defaultValue: "utcNow()" }],
    build: (v) => `or(equals(dayOfWeek(${v.value}), 0), equals(dayOfWeek(${v.value}), 6))`,
    notes: ["dayOfWeek returns 0 for Sunday through 6 for Saturday, in UTC. Convert to local time first if the flow runs near midnight."],
    links: []
  },

  // Text
  {
    id: "fallback-null",
    group: "Text",
    title: "Use a fallback when a value is missing",
    summary: "Returns the value, or your fallback text when the value is null.",
    inputs: [textValue, { key: "fallback", label: "Fallback text", kind: "text", defaultValue: "Not provided", help: "Shown when the value is null." }],
    build: (v) => `coalesce(${v.value}, ${quote(v.fallback)})`,
    notes: ["coalesce only skips null. An empty text value '' is returned as it is. To catch both, use the next template."],
    links: [nullError]
  },
  {
    id: "fallback-empty",
    group: "Text",
    title: "Use a fallback when a value is empty or missing",
    summary: "Returns your fallback text when the value is null or empty text, and the value otherwise.",
    inputs: [textValue, { key: "fallback", label: "Fallback text", kind: "text", defaultValue: "Not provided", help: "Shown when the value is null or empty." }],
    build: (v) => `if(empty(${v.value}), ${quote(v.fallback)}, ${v.value})`,
    notes: ["empty() is true for null, empty text, an empty array and an empty object."],
    links: [nullError]
  },
  {
    id: "contains-ignore-case",
    group: "Text",
    title: "Check whether text contains a word, ignoring case",
    summary: "Returns true when the text contains your word in any mix of upper and lower case.",
    inputs: [textValue, { key: "find", label: "Text to look for", kind: "text", defaultValue: "urgent", help: "Matched without regard to case." }],
    build: (v) => `contains(toLower(coalesce(${v.value}, '')), ${quote(v.find.toLowerCase())})`,
    notes: ["coalesce turns a missing value into empty text, so toLower doesn't fail on null."],
    links: [nullError]
  },
  {
    id: "clean-email",
    group: "Text",
    title: "Trim and lower-case an email address",
    summary: "Removes spaces from both ends and lower-cases the address, so comparisons match.",
    inputs: [{ ...textValue, defaultValue: "triggerOutputs()?['body/Author/Email']" }],
    build: (v) => `toLower(trim(coalesce(${v.value}, '')))`,
    notes: ["Compare email addresses after cleaning both sides the same way."],
    links: []
  },
  {
    id: "first-characters",
    group: "Text",
    title: "First characters of text, without failing on short text",
    summary: "Takes up to a number of characters from the start, for a subject line or a preview.",
    inputs: [textValue, { key: "count", label: "Number of characters", kind: "number", defaultValue: "50", help: "The most characters to keep." }],
    build: (v) => `substring(coalesce(${v.value}, ''), 0, min(length(coalesce(${v.value}, '')), ${v.count}))`,
    notes: ["substring fails when you ask for more characters than the text has, so min() caps the length."],
    links: [templateError, errorLink("the-expression-is-invalid-power-automate", "The expression is invalid")]
  },
  {
    id: "split-part",
    group: "Text",
    title: "Text before or after a separator",
    summary: "Splits text on a separator and keeps the first or the last part, such as the name before an @.",
    inputs: [
      { ...textValue, defaultValue: "triggerOutputs()?['body/Author/Email']" },
      { key: "separator", label: "Separator", kind: "text", defaultValue: "@", help: "The character or text to split on." },
      { key: "part", label: "Part to keep", kind: "choice", defaultValue: "first", help: "Before the first separator, or after the last one.", options: [{ value: "first", label: "Before the separator" }, { value: "last", label: "After the separator" }] }
    ],
    build: (v) => `${v.part === "last" ? "last" : "first"}(split(coalesce(${v.value}, ''), ${quote(v.separator)}))`,
    notes: ["When the separator isn't in the text, both return the whole text."],
    links: []
  },
  {
    id: "line-breaks-html",
    group: "Text",
    title: "Keep line breaks in an HTML email",
    summary: "Replaces line breaks in multi-line text with <br> so they show in an Outlook email body.",
    inputs: [{ ...textValue, defaultValue: "triggerOutputs()?['body/Description']" }],
    build: (v) => `replace(coalesce(${v.value}, ''), decodeUriComponent('%0A'), '<br>')`,
    notes: ["decodeUriComponent('%0A') is a line break character, which you can't type into the expression editor directly."],
    links: []
  },
  {
    id: "escape-odata",
    group: "Text",
    title: "Escape quotes for a Filter Query",
    summary: "Doubles single quotes in a value, so a name such as O'Brien doesn't break a Filter Query.",
    inputs: [textValue],
    build: (v) => `replace(${v.value}, '''', '''''')`,
    notes: ["Inside an expression, one single quote is written as '''' and two as ''''''.", "Put the result inside quotes in the Filter Query, such as Title eq '@{...}'."],
    links: [errorLink("fetching-items-failed-possible-invalid-string-in-filter-query", "Possible invalid string in filter query"), toolLink("odata-filter-query-builder", "Filter Query builder")]
  },

  // Numbers
  {
    id: "text-to-number",
    group: "Numbers",
    title: "Turn text into a number",
    summary: "Converts text such as \"12.5\" into a number, and returns 0 when it is empty.",
    inputs: [{ ...textValue, defaultValue: "triggerOutputs()?['body/Amount']" }],
    build: (v) => `if(empty(${v.value}), 0, float(${v.value}))`,
    notes: ["Use int() instead of float() for whole numbers.", "float fails on thousands separators. Remove them first with replace(value, ',', '')."],
    links: [errorLink("variable-cannot-be-initialized-or-updated-with-value-of-type", "Variable can't be set with a value of this type")]
  },
  {
    id: "format-number",
    group: "Numbers",
    title: "Format a number as currency or with decimals",
    summary: "Shows a number with separators, decimals or a currency symbol, for an email or a document.",
    inputs: [
      { key: "value", label: "Number value", kind: "expression", defaultValue: "triggerOutputs()?['body/Amount']", help: "An expression that returns a number." },
      { key: "format", label: "Format", kind: "choice", defaultValue: "C2", help: "A .NET number format.", options: [{ value: "C2", label: "C2 (currency, 2 decimals)" }, { value: "N2", label: "N2 (1,234.57)" }, { value: "N0", label: "N0 (1,235)" }, { value: "0.00", label: "0.00 (1234.57)" }, { value: "P0", label: "P0 (percent, from 0.25 to 25%)" }] },
      { key: "locale", label: "Locale", kind: "text", defaultValue: "en-US", help: "Sets the currency symbol and separators, such as en-GB or de-DE." }
    ],
    build: (v) => `formatNumber(${v.value}, ${quote(v.format)}, ${quote(v.locale)})`,
    notes: ["The result is text. Keep the original number for any later sums or comparisons."],
    links: []
  },

  // Arrays and loops
  {
    id: "count-items",
    group: "Arrays and loops",
    title: "Count the items an action returned",
    summary: "Counts the rows returned by Get items, List rows or a similar action.",
    inputs: [getItemsAction],
    build: (v) => `length(body('${actionName(v.action)}')?['value'])`,
    notes: ["For a Filter array or Select action, use length(body('Filter_array')) with no ['value']."],
    links: [errorLink("foreach-expression-result-must-be-valid-array", "The foreach expression must be a valid array")]
  },
  {
    id: "no-items",
    group: "Arrays and loops",
    title: "Check that an action returned no items",
    summary: "Returns true when Get items or List rows found nothing, so the flow can stop or take another path.",
    inputs: [getItemsAction],
    build: (v) => `empty(body('${actionName(v.action)}')?['value'])`,
    notes: ["Use it in a Condition with \"is equal to\" true."],
    links: []
  },
  {
    id: "first-item-field",
    group: "Arrays and loops",
    title: "Read a field from the first item, with no loop",
    summary: "Reads one column from the first row an action returned, which avoids an Apply to each when you expect one match.",
    inputs: [getItemsAction, columnInput("Title")],
    build: (v) => `first(body('${actionName(v.action)}')?['value'])?['${pathName(v.column)}']`,
    notes: ["Returns null when no rows came back. Check with the \"no items\" template first if that can happen.", "Set Top Count to 1 on the action so it doesn't fetch more rows than you need."],
    links: []
  },
  {
    id: "loop-item",
    group: "Arrays and loops",
    title: "Read a field of the current loop item",
    summary: "Reads a column from the item an Apply to each loop is on.",
    inputs: [{ key: "loop", label: "Loop name", kind: "name", defaultValue: "Apply to each", help: "The loop's name as it appears in the designer. The new designer names it For each." }, columnInput("Title")],
    build: (v) => `items('${actionName(v.loop)}')?['${pathName(v.column)}']`,
    notes: ["The loop name must match exactly, including any number such as Apply_to_each_2."],
    links: [errorLink("foreach-expression-result-must-be-valid-array", "The foreach expression must be a valid array")]
  },
  {
    id: "join-select",
    group: "Arrays and loops",
    title: "Join a list of values into one line",
    summary: "Turns the output of a Select action into one piece of text, such as a list of emails separated by semicolons.",
    inputs: [{ key: "action", label: "Select action name", kind: "name", defaultValue: "Select emails", help: "A Select action switched to text mode, so it outputs plain values." }, { key: "separator", label: "Separator", kind: "text", defaultValue: ";", help: "Use ; for email recipients, or , for a readable list." }],
    build: (v) => `join(body('${actionName(v.action)}'), ${quote(v.separator)})`,
    notes: ["In the Select action, map a single value and switch to text mode, so the output is a list of text rather than records."],
    links: []
  },

  // Trigger conditions
  {
    id: "trigger-choice",
    group: "Trigger conditions",
    title: "Run only when a choice column has a value",
    summary: "A trigger condition that starts the flow only when a SharePoint choice column equals one value.",
    inputs: [columnInput("Status"), { key: "choice", label: "Choice value", kind: "text", defaultValue: "Submitted", help: "The choice exactly as it is spelled in the column." }],
    build: (v) => `@equals(triggerOutputs()?['body/${pathName(v.column)}/Value'], ${quote(v.choice)})`,
    notes: ["Paste it into Settings > Trigger conditions on the trigger. It must start with @.", "The /Value part reads the choice's text. Leave it out for a plain text column."],
    links: [errorLink("problem-with-the-flows-trigger", "There's a problem with the flow's trigger"), toolLink("trigger-condition-builder", "Trigger condition builder")]
  },
  {
    id: "trigger-not-empty",
    group: "Trigger conditions",
    title: "Run only when a column has a value",
    summary: "A trigger condition that skips items where a column is empty.",
    inputs: [columnInput("AssignedTo")],
    build: (v) => `@not(empty(triggerOutputs()?['body/${pathName(v.column)}']))`,
    notes: ["Paste it into Settings > Trigger conditions. Every condition must be true for the flow to run."],
    links: [toolLink("trigger-condition-builder", "Trigger condition builder")]
  },
  {
    id: "trigger-yes",
    group: "Trigger conditions",
    title: "Run only when a Yes/No column is Yes",
    summary: "A trigger condition that starts the flow only when a Yes/No column is set to Yes.",
    inputs: [columnInput("ReadyForReview")],
    build: (v) => `@equals(triggerOutputs()?['body/${pathName(v.column)}'], true)`,
    notes: ["Compare with true, not with 'Yes'. The trigger output is a true or false value."],
    links: [toolLink("trigger-condition-builder", "Trigger condition builder")]
  },

  // Approvals
  {
    id: "approval-outcome",
    group: "Approvals",
    title: "Read the approval outcome",
    summary: "Reads the result of Start and wait for an approval, for use in a Condition.",
    inputs: [approvalAction],
    build: (v) => `outputs('${actionName(v.action)}')?['body/outcome']`,
    notes: ["For Approve/Reject approvals the outcome is Approve or Reject. For custom responses it is the text of the option chosen."],
    links: [errorLink("approval-timed-out-after-30-days-power-automate", "Approval timed out after 30 days")]
  },
  {
    id: "approval-response",
    group: "Approvals",
    title: "Read the approver's comments or name",
    summary: "Reads the first response of an approval, with no Apply to each loop.",
    inputs: [
      approvalAction,
      { key: "field", label: "Field", kind: "choice", defaultValue: "comments", help: "What to read from the first response.", options: [{ value: "comments", label: "Comments" }, { value: "displayName", label: "Approver's name" }, { value: "email", label: "Approver's email" }] }
    ],
    build: (v) => (v.field === "comments" ? `first(outputs('${actionName(v.action)}')?['body/responses'])?['comments']` : `first(outputs('${actionName(v.action)}')?['body/responses'])?['responder']?['${v.field}']`),
    notes: ["When everyone must approve there is one response per approver. This reads only the first one."],
    links: []
  },

  // Flow details
  {
    id: "run-link",
    group: "Flow details",
    title: "Link to the current flow run",
    summary: "Builds a link to this run's history, for an error email or a support log.",
    inputs: [],
    build: () => "concat('https://make.powerautomate.com/environments/', workflow()?['tags']?['environmentName'], '/flows/', workflow()?['name'], '/runs/', workflow()?['run']?['name'])",
    notes: ["Only people who can see the flow can open the run from the link."],
    links: [errorLink("actionfailed-no-dependent-actions-succeeded", "ActionFailed: no dependent actions succeeded")]
  },
  {
    id: "new-guid",
    group: "Flow details",
    title: "Create a unique ID",
    summary: "Makes a new GUID, for a reference number or a unique file name.",
    inputs: [],
    build: () => "guid()",
    notes: ["Every call gives a new value. Store it in a variable or a Compose action if you need it more than once."],
    links: []
  }
];

export type BuiltExpression = { expression: string; notes: string[] };

/** Builds a template's expression from the values typed, using each input's default for anything left empty. */
export function buildExpression(template: ExpressionTemplate, values: Record<string, string>): BuiltExpression {
  const resolved: Record<string, string> = {};
  const notes: string[] = [];
  for (const input of template.inputs) {
    const raw = values[input.key] ?? input.defaultValue;
    const value = input.kind === "text" ? raw : raw.trim();
    if (input.kind === "number") {
      if (!/^-?\d+$/.test(value)) {
        notes.push(`${input.label}: "${value}" is not a whole number, so ${input.defaultValue} is used.`);
        resolved[input.key] = input.defaultValue;
        continue;
      }
    }
    if ((input.kind === "expression" || input.kind === "name") && !value) {
      resolved[input.key] = input.defaultValue;
      continue;
    }
    if (input.kind === "expression" && /^@\{[\s\S]*\}$/.test(value)) {
      notes.push(`${input.label}: remove the @{ and } around the value. Inside an expression, values are written without them.`);
      resolved[input.key] = value.slice(2, -1).trim();
      continue;
    }
    resolved[input.key] = value;
  }
  return { expression: template.build(resolved), notes };
}
