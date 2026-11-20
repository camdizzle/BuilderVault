// Generates a JSON schema for the Power Automate Parse JSON action from a sample payload.
// Unlike "Generate from sample", it can make every property accept null, which avoids the
// "Invalid type. Expected String but got Null" error when a field is sometimes empty.

export type SchemaOptions = {
  /** Let every property also accept null. */
  allowNulls: boolean;
  /** Use "number" for whole numbers too, so a later decimal value doesn't fail validation. */
  numbersAsNumber: boolean;
  /** Add "required" lists for properties present in every sample object. */
  includeRequired: boolean;
};

export type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
};

type Kind = "string" | "integer" | "number" | "boolean" | "null" | "object" | "array";

type Shape = {
  kinds: Set<Kind>;
  properties: Map<string, Shape>;
  keyCounts: Map<string, number>;
  objectCount: number;
  items?: Shape;
};

function emptyShape(): Shape {
  return { kinds: new Set(), properties: new Map(), keyCounts: new Map(), objectCount: 0 };
}

function observe(shape: Shape, value: unknown) {
  if (value === null || value === undefined) {
    shape.kinds.add("null");
  } else if (Array.isArray(value)) {
    shape.kinds.add("array");
    shape.items ??= emptyShape();
    for (const element of value) observe(shape.items, element);
  } else if (typeof value === "object") {
    shape.kinds.add("object");
    shape.objectCount += 1;
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      shape.keyCounts.set(key, (shape.keyCounts.get(key) ?? 0) + 1);
      let childShape = shape.properties.get(key);
      if (!childShape) {
        childShape = emptyShape();
        shape.properties.set(key, childShape);
      }
      observe(childShape, child);
    }
  } else if (typeof value === "number") {
    shape.kinds.add(Number.isInteger(value) ? "integer" : "number");
  } else if (typeof value === "boolean") {
    shape.kinds.add("boolean");
  } else {
    shape.kinds.add("string");
  }
}

const kindOrder: Kind[] = ["object", "array", "string", "number", "integer", "boolean"];

function toSchema(shape: Shape, options: SchemaOptions, isRoot: boolean): JsonSchema {
  const kinds = new Set<Kind>([...shape.kinds].filter((kind) => kind !== "null"));
  if (kinds.has("integer") && (kinds.has("number") || options.numbersAsNumber)) {
    kinds.delete("integer");
    kinds.add("number");
  }
  // A value that was only ever null tells us nothing about its type, so accept anything.
  if (kinds.size === 0) return {};

  const types: string[] = kindOrder.filter((kind) => kinds.has(kind));
  if (!isRoot && (options.allowNulls || shape.kinds.has("null"))) types.push("null");

  const schema: JsonSchema = { type: types.length === 1 ? types[0] : types };
  if (kinds.has("object")) {
    schema.properties = {};
    for (const [key, child] of shape.properties) schema.properties[key] = toSchema(child, options, false);
    if (options.includeRequired) {
      const required = [...shape.keyCounts].filter(([, count]) => count === shape.objectCount).map(([key]) => key);
      if (required.length > 0) schema.required = required;
    }
  }
  if (kinds.has("array")) schema.items = shape.items ? toSchema(shape.items, options, false) : {};
  return schema;
}

export function generateSchema(sample: unknown, options: SchemaOptions): JsonSchema {
  const shape = emptyShape();
  observe(shape, sample);
  return toSchema(shape, options, true);
}

export type SchemaReport = {
  schema: JsonSchema;
  /** Paths whose sample value was always null, so the schema accepts any type there. */
  nullOnlyPaths: string[];
  /** Copy-ready expressions for reading values from the Parse JSON output. */
  expressions: Array<{ path: string; expression: string }>;
};

/** Power Automate replaces spaces in action names with underscores in expressions. */
export function toActionReference(actionName: string) {
  const trimmed = actionName.trim() || "Parse JSON";
  return trimmed.replace(/ /g, "_").replace(/'/g, "''");
}

function quoteKey(key: string) {
  return "'" + key.replace(/'/g, "''") + "'";
}

function collect(
  shape: Shape,
  path: string,
  accessor: string,
  report: SchemaReport,
  limit: number
) {
  if (report.expressions.length >= limit) return;
  const kinds = [...shape.kinds];
  if (kinds.length > 0 && kinds.every((kind) => kind === "null") && path) report.nullOnlyPaths.push(path);
  if (shape.kinds.has("object")) {
    for (const [key, child] of shape.properties) {
      const childPath = path ? `${path}.${key}` : key;
      const childAccessor = `${accessor}?[${quoteKey(key)}]`;
      const isContainer = child.kinds.has("object") && !child.kinds.has("array");
      if (!isContainer) report.expressions.push({ path: childPath, expression: childAccessor });
      if (report.expressions.length >= limit) return;
      collect(child, childPath, childAccessor, report, limit);
    }
  } else if (shape.kinds.has("array") && shape.items && path) {
    // Inside a loop over this array, each element is read with items('Apply_to_each').
    for (const [key, child] of shape.items.properties) {
      if (report.expressions.length >= limit) return;
      const childPath = `${path}[].${key}`;
      if (child.kinds.size > 0 && [...child.kinds].every((kind) => kind === "null")) report.nullOnlyPaths.push(childPath);
      report.expressions.push({ path: childPath, expression: `items('Apply_to_each')?[${quoteKey(key)}]` });
    }
  }
}

export function analyzeSample(json: string, options: SchemaOptions, actionName = "Parse JSON", limit = 40): SchemaReport {
  const sample = JSON.parse(json) as unknown;
  const shape = emptyShape();
  observe(shape, sample);
  const report: SchemaReport = { schema: toSchema(shape, options, true), nullOnlyPaths: [], expressions: [] };
  const root = `body('${toActionReference(actionName)}')`;
  if (shape.kinds.has("array") && !shape.kinds.has("object")) {
    report.expressions.push({ path: "(root array)", expression: root });
    if (shape.items) collect({ ...emptyShape(), kinds: new Set<Kind>(["array"]), items: shape.items }, "(root array)", root, report, limit);
  } else {
    collect(shape, "", root, report, limit);
  }
  return report;
}
