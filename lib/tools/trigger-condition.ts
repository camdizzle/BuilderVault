// Builds trigger conditions for Power Automate triggers (Settings > Trigger conditions).

export type TriggerSource = "sharepoint" | "dataverse" | "other";
export type TriggerJoin = "and" | "or";
export type TriggerFieldType = "text" | "choice" | "number" | "boolean" | "date" | "person" | "lookup";
export type TriggerOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "greater"
  | "greaterOrEquals"
  | "less"
  | "lessOrEquals"
  | "isTrue"
  | "isFalse"
  | "beforeNow"
  | "afterNow"
  | "before"
  | "after"
  | "empty"
  | "notEmpty";

export type TriggerRule = {
  field: string;
  type: TriggerFieldType;
  operator: TriggerOperator;
  value: string;
  /** Rules with the same group number are joined together first. */
  group?: number;
};

export type TriggerGuard = {
  enabled: boolean;
  /** SharePoint: the service account's email. Dataverse: the service account's user GUID. */
  value: string;
};

export type TriggerConditionResult = {
  /** One condition to paste into a single trigger condition box. */
  combined: string;
  /** One condition per line, for separate boxes (only when all rules must match). */
  separate: string[];
  notes: string[];
};

export const triggerOperatorLabels: Record<TriggerOperator, string> = {
  equals: "equals",
  notEquals: "does not equal",
  contains: "contains",
  startsWith: "starts with",
  greater: "greater than",
  greaterOrEquals: "greater than or equal",
  less: "less than",
  lessOrEquals: "less than or equal",
  isTrue: "is Yes",
  isFalse: "is No",
  beforeNow: "is before now",
  afterNow: "is after now",
  before: "is before date",
  after: "is after date",
  empty: "is empty",
  notEmpty: "is not empty"
};

export const triggerFieldTypeLabels: Record<TriggerFieldType, string> = {
  text: "Text",
  choice: "Choice",
  number: "Number",
  boolean: "Yes/No",
  date: "Date",
  person: "Person",
  lookup: "Lookup"
};

export function fieldTypesFor(source: TriggerSource): TriggerFieldType[] {
  if (source === "sharepoint") return ["text", "choice", "number", "boolean", "date", "person"];
  if (source === "dataverse") return ["text", "choice", "number", "boolean", "date", "lookup"];
  return ["text", "number", "boolean", "date"];
}

export function triggerOperatorsFor(type: TriggerFieldType): TriggerOperator[] {
  switch (type) {
    case "text":
      return ["equals", "notEquals", "contains", "startsWith", "empty", "notEmpty"];
    case "number":
      return ["equals", "notEquals", "greater", "greaterOrEquals", "less", "lessOrEquals", "empty", "notEmpty"];
    case "boolean":
      return ["isTrue", "isFalse"];
    case "date":
      return ["beforeNow", "afterNow", "before", "after", "empty", "notEmpty"];
    default:
      return ["equals", "notEquals", "empty", "notEmpty"];
  }
}

export function operatorNeedsValue(operator: TriggerOperator) {
  return !["isTrue", "isFalse", "beforeNow", "afterNow", "empty", "notEmpty"].includes(operator);
}

function quote(value: string) {
  return "'" + value.replace(/'/g, "''") + "'";
}

/** The expression that reads a field from the trigger output. */
export function fieldReference(source: TriggerSource, rule: Pick<TriggerRule, "field" | "type">) {
  const field = rule.field.trim().replace(/'/g, "''");
  if (source === "other") return `triggerBody()?['${field}']`;
  if (source === "sharepoint") {
    if (rule.type === "choice") return `triggerOutputs()?['body/${field}/Value']`;
    if (rule.type === "person") return `triggerOutputs()?['body/${field}/Email']`;
    return `triggerOutputs()?['body/${field}']`;
  }
  if (rule.type === "lookup") {
    const logical = /^_.*_value$/.test(field) ? field : `_${field}_value`;
    return `triggerOutputs()?['body/${logical}']`;
  }
  return `triggerOutputs()?['body/${field}']`;
}

function literal(source: TriggerSource, rule: TriggerRule) {
  const value = rule.value.trim();
  if (rule.type === "number") return value;
  if (rule.type === "choice" && source === "dataverse") return value;
  if (rule.type === "person") return quote(value.toLowerCase());
  return quote(rule.value);
}

function dateLiteral(value: string) {
  const trimmed = value.trim();
  return quote(/^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed + "T00:00:00Z" : trimmed);
}

export function buildRule(source: TriggerSource, rule: TriggerRule) {
  const ref = fieldReference(source, rule);
  const textRef = `coalesce(${ref}, '')`;
  switch (rule.operator) {
    case "empty":
      return `empty(${ref})`;
    case "notEmpty":
      return `not(empty(${ref}))`;
    case "isTrue":
      return `equals(${ref}, true)`;
    case "isFalse":
      return `not(equals(${ref}, true))`;
    // ticks() fails on an empty date, and a trigger condition that fails stops the flow from running,
    // so an empty date is checked first. if() only works out the branch it returns.
    case "beforeNow":
      return `if(empty(${ref}), false, less(ticks(${ref}), ticks(utcNow())))`;
    case "afterNow":
      return `if(empty(${ref}), false, greater(ticks(${ref}), ticks(utcNow())))`;
    case "before":
      return `if(empty(${ref}), false, less(ticks(${ref}), ticks(${dateLiteral(rule.value)})))`;
    case "after":
      return `if(empty(${ref}), false, greater(ticks(${ref}), ticks(${dateLiteral(rule.value)})))`;
    case "contains":
      return `contains(${textRef}, ${literal(source, rule)})`;
    case "startsWith":
      return `startsWith(${textRef}, ${literal(source, rule)})`;
    case "greater":
    case "greaterOrEquals":
    case "less":
    case "lessOrEquals":
      return `${rule.operator}(${ref}, ${literal(source, rule)})`;
    case "notEquals":
      return rule.type === "person"
        ? `not(equals(toLower(${textRef}), ${literal(source, rule)}))`
        : `not(equals(${ref}, ${literal(source, rule)}))`;
    default:
      return rule.type === "person" ? `equals(toLower(${textRef}), ${literal(source, rule)})` : `equals(${ref}, ${literal(source, rule)})`;
  }
}

export function buildGuard(source: TriggerSource, guard: TriggerGuard) {
  if (!guard.enabled || source === "other" || !guard.value.trim()) return "";
  if (source === "sharepoint") {
    return `not(equals(toLower(coalesce(triggerOutputs()?['body/Editor/Email'], '')), ${quote(guard.value.trim().toLowerCase())}))`;
  }
  return `not(equals(triggerOutputs()?['body/_modifiedby_value'], ${quote(guard.value.trim().toLowerCase())}))`;
}

const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ruleNotes(source: TriggerSource, rule: TriggerRule, index: number) {
  const label = `Rule ${index + 1}`;
  const field = rule.field.trim();
  const value = rule.value.trim();
  const notes: string[] = [];
  if (!field) notes.push(`${label}: enter a column name.`);
  if (source === "sharepoint" && /\s/.test(field)) {
    notes.push(`${label}: "${field}" has a space. Use the internal name, for example ${field.replace(/ /g, "_x0020_")}.`);
  }
  if (source === "dataverse" && field !== field.toLowerCase()) notes.push(`${label}: Dataverse logical names are lowercase. Use ${field.toLowerCase()}.`);
  if (operatorNeedsValue(rule.operator)) {
    if (!value) notes.push(`${label}: enter a value.`);
    else if (rule.type === "number" && Number.isNaN(Number(value))) notes.push(`${label}: "${value}" is not a number.`);
    else if (source === "dataverse" && rule.type === "choice" && !/^-?\d+$/.test(value)) {
      notes.push(`${label}: Dataverse choices are compared by number value (for example 100000000), not by label.`);
    } else if (rule.type === "lookup" && !guidPattern.test(value)) notes.push(`${label}: Dataverse lookups are compared by the related row's GUID.`);
    else if ((rule.operator === "before" || rule.operator === "after") && Number.isNaN(Date.parse(value))) {
      notes.push(`${label}: use an ISO date such as 2026-01-31.`);
    }
  }
  return notes;
}

export function buildTriggerCondition(
  source: TriggerSource,
  rules: TriggerRule[],
  join: TriggerJoin,
  guard: TriggerGuard,
  groupJoin: TriggerJoin = "and"
): TriggerConditionResult {
  const active = rules.filter((rule) => rule.field.trim());
  const guardExpression = buildGuard(source, guard);
  const notes = rules.flatMap((rule, index) => ruleNotes(source, rule, index));

  if (guard.enabled && source !== "other") {
    if (!guard.value.trim()) notes.push("Enter the account to ignore, or turn off the loop guard.");
    else if (source === "sharepoint" && !guard.value.includes("@")) notes.push("The loop guard compares the Modified By email address.");
    else if (source === "dataverse" && !guidPattern.test(guard.value.trim())) notes.push("The loop guard compares the Modified By user's GUID (systemuserid).");
  }

  // Rules are joined within each group first, then the groups are joined with groupJoin.
  const groupNumbers = [...new Set(active.map((rule) => rule.group ?? 1))].sort((a, b) => a - b);
  const groups = groupNumbers.map((group) => active.filter((rule) => (rule.group ?? 1) === group).map((rule) => buildRule(source, rule)));
  const joinAll = (operator: TriggerJoin, parts: string[]) => (parts.length === 1 ? parts[0] : `${operator}(${parts.join(", ")})`);
  const grouped = groups.length > 1;
  const groupBodies = groups.map((parts) => joinAll(join, parts));
  const parts = grouped ? groupBodies : groups[0] ?? [];
  const partsJoin = grouped ? groupJoin : join;

  // With "and", the guard is just one more rule. With "or", it must wrap the whole condition.
  const all = partsJoin === "and" ? [...parts, ...(guardExpression ? [guardExpression] : [])] : parts;
  let combinedBody = all.length > 0 ? joinAll(partsJoin, all) : "";
  if (partsJoin === "or" && guardExpression) combinedBody = combinedBody ? `and(${combinedBody}, ${guardExpression})` : guardExpression;

  const combined = combinedBody ? "@" + combinedBody : "";
  const separate = partsJoin === "and" || parts.length <= 1 ? [...parts, ...(guardExpression ? [guardExpression] : [])].map((part) => "@" + part) : [];
  if (grouped && join === groupJoin) notes.push(`Groups only matter when the join inside a group differs from the join between groups. Both are "${join}" now.`);
  return { combined, separate, notes };
}

export type ChangedColumnsHelp = { label: string; value: string; notes: string[] };

/**
 * How to run a flow only when particular columns change. A trigger condition only sees the item as
 * it is now, so it can't tell what changed. Each connector has its own way to do this.
 */
export function changedColumnsHelp(source: TriggerSource, columns: string): ChangedColumnsHelp | null {
  const names = columns.split(",").map((name) => name.trim()).filter(Boolean);
  if (names.length === 0 || source === "other") return null;
  if (source === "dataverse") {
    return {
      label: "Select columns (on the trigger)",
      value: names.map((name) => name.toLowerCase()).join(","),
      notes: [
        "Paste this into Select columns on the When a row is added, modified or deleted trigger. The flow then runs only when one of these columns changes.",
        "Use logical names, separated by commas with no spaces."
      ]
    };
  }
  const first = names[0].replace(/'/g, "''");
  return {
    label: "Expression for a Condition after Get changes for an item or a file (properties only)",
    value: names.length === 1
      ? `equals(body('Get_changes_for_an_item_or_a_file_(properties_only)')?['ColumnHasChanged']?['${first}'], true)`
      : `or(${names.map((name) => `equals(body('Get_changes_for_an_item_or_a_file_(properties_only)')?['ColumnHasChanged']?['${name.replace(/'/g, "''")}'], true)`).join(", ")})`,
    notes: [
      "A SharePoint trigger condition can't tell which column changed, because it only sees the item as it is now.",
      "Add the Get changes for an item or a file (properties only) action. Set Id to the trigger's ID, and Since to the trigger's Trigger Window Start Token.",
      "Then add a Condition with this expression on the left, is equal to, and true on the right. Put the rest of the flow in its If yes branch.",
      "Get changes needs versioning turned on for the list, which is the default."
    ]
  };
}
