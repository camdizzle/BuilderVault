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
    case "beforeNow":
      return `less(ticks(${ref}), ticks(utcNow()))`;
    case "afterNow":
      return `greater(ticks(${ref}), ticks(utcNow()))`;
    case "before":
      return `less(ticks(${ref}), ticks(${dateLiteral(rule.value)}))`;
    case "after":
      return `greater(ticks(${ref}), ticks(${dateLiteral(rule.value)}))`;
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
  guard: TriggerGuard
): TriggerConditionResult {
  const active = rules.filter((rule) => rule.field.trim());
  const parts = active.map((rule) => buildRule(source, rule));
  const guardExpression = buildGuard(source, guard);
  const notes = rules.flatMap((rule, index) => ruleNotes(source, rule, index));

  if (guard.enabled && source !== "other") {
    if (!guard.value.trim()) notes.push("Enter the account to ignore, or turn off the loop guard.");
    else if (source === "sharepoint" && !guard.value.includes("@")) notes.push("The loop guard compares the Modified By email address.");
    else if (source === "dataverse" && !guidPattern.test(guard.value.trim())) notes.push("The loop guard compares the Modified By user's GUID (systemuserid).");
  }

  // With "and", the guard is just one more rule. With "or", it must wrap the whole group.
  const all = join === "and" ? [...parts, ...(guardExpression ? [guardExpression] : [])] : parts;
  let combinedBody = "";
  if (all.length === 1) combinedBody = all[0];
  else if (all.length > 1) combinedBody = `${join}(${all.join(", ")})`;

  if (join === "or" && guardExpression) combinedBody = combinedBody ? `and(${combinedBody}, ${guardExpression})` : guardExpression;

  const combined = combinedBody ? "@" + combinedBody : "";
  const separate = join === "and" || parts.length <= 1 ? [...parts, ...(guardExpression ? [guardExpression] : [])].map((part) => "@" + part) : [];
  return { combined, separate, notes };
}
