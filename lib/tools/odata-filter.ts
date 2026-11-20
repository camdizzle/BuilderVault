// Builds OData filter queries for the SharePoint "Get items" action and the
// Dataverse "List rows" action in Power Automate.

export type FilterTarget = "sharepoint" | "dataverse";
export type FilterJoin = "and" | "or";

export type FilterColumnType = "text" | "number" | "date" | "boolean" | "choice" | "lookup" | "person";

export type FilterOperator =
  | "eq"
  | "ne"
  | "gt"
  | "ge"
  | "lt"
  | "le"
  | "contains"
  | "startswith"
  | "endswith"
  | "null"
  | "notnull";

export type FilterCondition = {
  column: string;
  type: FilterColumnType;
  operator: FilterOperator;
  value: string;
};

export type FilterResult = {
  query: string;
  notes: string[];
};

export const operatorLabels: Record<FilterOperator, string> = {
  eq: "equals",
  ne: "does not equal",
  gt: "greater than",
  ge: "greater than or equal",
  lt: "less than",
  le: "less than or equal",
  contains: "contains",
  startswith: "starts with",
  endswith: "ends with",
  null: "is empty",
  notnull: "is not empty"
};

export const columnTypeLabels: Record<FilterColumnType, string> = {
  text: "Text",
  number: "Number or currency",
  date: "Date and time",
  boolean: "Yes/No",
  choice: "Choice",
  lookup: "Lookup",
  person: "Person"
};

const comparison: FilterOperator[] = ["eq", "ne", "gt", "ge", "lt", "le", "null", "notnull"];

/** The operators that make sense for a column type on a given data source. */
export function operatorsFor(target: FilterTarget, type: FilterColumnType): FilterOperator[] {
  if (type === "text") {
    return target === "sharepoint"
      ? ["eq", "ne", "contains", "startswith", "null", "notnull"]
      : ["eq", "ne", "contains", "startswith", "endswith", "null", "notnull"];
  }
  if (type === "number" || type === "date") return comparison;
  if (type === "boolean") return ["eq", "ne"];
  return ["eq", "ne", "null", "notnull"];
}

/** Wraps a text value in single quotes, doubling any quotes inside it. Flow expressions (@{...}) are kept as typed. */
export function quoteText(value: string) {
  return "'" + value.replace(/'/g, "''") + "'";
}

function isFlowExpression(value: string) {
  return /^@\{[\s\S]*\}$/.test(value.trim());
}

function textLiteral(value: string) {
  const trimmed = value.trim();
  return isFlowExpression(trimmed) ? "'" + trimmed + "'" : quoteText(value);
}

const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function booleanLiteral(target: FilterTarget, value: string) {
  const yes = /^(true|yes|1)$/i.test(value.trim());
  if (target === "sharepoint") return yes ? "1" : "0";
  return yes ? "true" : "false";
}

function dateLiteral(target: FilterTarget, value: string) {
  const trimmed = value.trim();
  if (isFlowExpression(trimmed)) return target === "sharepoint" ? "'" + trimmed + "'" : trimmed;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed + "T00:00:00Z" : trimmed;
  return target === "sharepoint" ? "'" + normalized + "'" : normalized;
}

/** The left-hand side of a condition: the column name, plus any sub-field the data source needs. */
export function columnPath(target: FilterTarget, condition: FilterCondition) {
  const column = condition.column.trim();
  if (target === "dataverse") {
    if (condition.type === "lookup" || condition.type === "person") {
      return /^_.*_value$/.test(column) ? column : `_${column}_value`;
    }
    return column;
  }
  if (condition.type === "person") return condition.operator === "null" || condition.operator === "notnull" ? column + "Id" : column + "/EMail";
  if (condition.type === "lookup") return condition.operator === "null" || condition.operator === "notnull" ? column + "Id" : column + "/Title";
  return column;
}

function valueLiteral(target: FilterTarget, condition: FilterCondition) {
  const value = condition.value;
  const trimmed = value.trim();
  switch (condition.type) {
    case "number":
      return trimmed;
    case "boolean":
      return booleanLiteral(target, value);
    case "date":
      return dateLiteral(target, value);
    case "choice":
      return target === "dataverse" ? trimmed : textLiteral(value);
    case "lookup":
    case "person":
      if (target === "dataverse") return trimmed;
      return textLiteral(condition.type === "person" && !isFlowExpression(trimmed) ? trimmed.toLowerCase() : value);
    default:
      return textLiteral(value);
  }
}

export function buildCondition(target: FilterTarget, condition: FilterCondition) {
  const path = columnPath(target, condition);
  const { operator } = condition;
  if (operator === "null") return `${path} eq null`;
  if (operator === "notnull") return `${path} ne null`;
  const literal = valueLiteral(target, condition);
  if (operator === "contains") {
    return target === "sharepoint" ? `substringof(${literal}, ${path})` : `contains(${path}, ${literal})`;
  }
  if (operator === "startswith") return `startswith(${path}, ${literal})`;
  if (operator === "endswith") return `endswith(${path}, ${literal})`;
  return `${path} ${operator} ${literal}`;
}

function conditionNotes(target: FilterTarget, condition: FilterCondition, index: number) {
  const notes: string[] = [];
  const label = `Condition ${index + 1}`;
  const column = condition.column.trim();
  const value = condition.value.trim();
  const needsValue = condition.operator !== "null" && condition.operator !== "notnull";

  if (!column) notes.push(`${label}: enter a column name.`);
  if (/\s/.test(column)) {
    notes.push(
      target === "sharepoint"
        ? `${label}: "${column}" has a space. Filter Query needs the internal name, for example ${column.replace(/ /g, "_x0020_")}.`
        : `${label}: "${column}" has a space. Use the column's logical name, for example cr123_${column.replace(/\s+/g, "").toLowerCase()}.`
    );
  }
  if (target === "dataverse" && column !== column.toLowerCase()) {
    notes.push(`${label}: Dataverse logical names are lowercase. Use ${column.toLowerCase()}.`);
  }
  if (needsValue && !value && condition.type !== "boolean") notes.push(`${label}: enter a value.`);
  if (needsValue && value && !isFlowExpression(value)) {
    if (condition.type === "number" && Number.isNaN(Number(value))) notes.push(`${label}: "${value}" is not a number.`);
    if (target === "dataverse" && condition.type === "choice" && !/^-?\d+$/.test(value)) {
      notes.push(`${label}: Dataverse choices are filtered by their number value (for example 100000000), not by label.`);
    }
    if (target === "dataverse" && (condition.type === "lookup" || condition.type === "person") && !guidPattern.test(value)) {
      notes.push(`${label}: Dataverse lookups are filtered by the related row's GUID.`);
    }
    if (condition.type === "date" && Number.isNaN(Date.parse(value))) {
      notes.push(`${label}: use an ISO date such as 2026-01-31 or 2026-01-31T09:00:00Z.`);
    }
    if (target === "sharepoint" && condition.type === "person" && !value.includes("@")) {
      notes.push(`${label}: SharePoint person filters compare the email address.`);
    }
  }
  return notes;
}

export function buildFilterQuery(target: FilterTarget, conditions: FilterCondition[], join: FilterJoin): FilterResult {
  const active = conditions.filter((condition) => condition.column.trim() || condition.value.trim());
  const parts = active.map((condition) => buildCondition(target, condition));
  const notes = active.flatMap((condition, index) => conditionNotes(target, condition, index));

  if (target === "sharepoint") {
    if (active.some((condition) => condition.type === "lookup" || condition.type === "person")) {
      notes.push("Lookup filters compare the related item's Title, and person filters compare EMail (with a capital M). To filter by ID instead, use the column name followed by Id, such as AssignedToId eq 12.");
    }
  }

  const query = parts.length > 1 ? parts.join(` ${join} `) : parts[0] ?? "";
  return { query, notes };
}
