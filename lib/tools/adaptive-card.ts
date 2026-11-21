// Builds Adaptive Card JSON for Teams cards sent from Power Automate, and the expressions that
// read the response from "Post adaptive card and wait for a response".

export type CardFact = { title: string; value: string };

export type CardOptions = {
  title: string;
  body: string;
  facts: CardFact[];
  /** Button titles. Each becomes an Action.Submit. */
  actions: string[];
  viewUrl: string;
  withComment: boolean;
  /** Dropdown label and options. Empty options mean no dropdown. */
  choiceLabel: string;
  choices: string[];
  withDate: boolean;
  dateLabel: string;
  /** Put the message on the left and the facts on the right. */
  twoColumns: boolean;
};

/** Parses "Label|Value" lines. */
export function parseFacts(text: string): CardFact[] {
  return text
    .split("\n")
    .map((line) => line.split("|"))
    .filter((parts) => parts[0]?.trim())
    .map(([title, ...rest]) => ({ title: title.trim(), value: rest.join("|").trim() }));
}

export function parseLines(text: string) {
  return [...new Set(text.split("\n").map((line) => line.trim()).filter(Boolean))];
}

export function buildCard(options: CardOptions) {
  const message = options.body ? [{ type: "TextBlock", text: options.body, wrap: true }] : [];
  const facts = options.facts.length > 0 ? [{ type: "FactSet", facts: options.facts }] : [];
  const content =
    options.twoColumns && message.length > 0 && facts.length > 0
      ? [{ type: "ColumnSet", columns: [{ type: "Column", width: "stretch", items: message }, { type: "Column", width: "stretch", items: facts }] }]
      : [...message, ...facts];
  const inputs = [
    ...(options.choices.length > 0
      ? [{ type: "Input.ChoiceSet", id: "choice", label: options.choiceLabel || "Choose an option", style: "compact", isRequired: true, errorMessage: "Choose an option.", choices: options.choices.map((choice) => ({ title: choice, value: choice })) }]
      : []),
    ...(options.withDate ? [{ type: "Input.Date", id: "date", label: options.dateLabel || "Date" }] : []),
    ...(options.withComment ? [{ type: "Input.Text", id: "comment", label: "Comment", placeholder: "Add a comment", isMultiline: true }] : [])
  ];
  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.4",
    body: [{ type: "TextBlock", text: options.title, weight: "Bolder", size: "Medium", wrap: true }, ...content, ...inputs],
    actions: [
      ...options.actions.map((action) => ({ type: "Action.Submit", title: action, data: { decision: action } })),
      ...(options.viewUrl.trim() ? [{ type: "Action.OpenUrl", title: "View item", url: options.viewUrl.trim() }] : [])
    ]
  };
}

/** Expressions that read the response after "Post adaptive card and wait for a response". */
export function responseExpressions(options: Pick<CardOptions, "actions" | "withComment" | "choices" | "withDate">, actionName = "Post adaptive card and wait for a response") {
  const body = `body('${actionName.trim().replace(/\s+/g, "_").replace(/'/g, "''")}')`;
  const lines: Array<{ label: string; expression: string }> = [];
  if (options.actions.length > 0) lines.push({ label: "Button chosen", expression: `${body}?['data']?['decision']` });
  if (options.choices.length > 0) lines.push({ label: "Dropdown value", expression: `${body}?['data']?['choice']` });
  if (options.withDate) lines.push({ label: "Date picked", expression: `${body}?['data']?['date']` });
  if (options.withComment) lines.push({ label: "Comment", expression: `${body}?['data']?['comment']` });
  lines.push({ label: "Who responded", expression: `${body}?['responder']?['displayName']` });
  return lines;
}
