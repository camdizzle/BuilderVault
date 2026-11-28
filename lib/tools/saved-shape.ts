// Checks that a value read back from browser storage still fits the tool that saved it.

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * True when a saved value has the same shape as the starting value, so a stale or edited value
 * can't break a tool. Rows inside a list are checked more loosely: a row may leave out a key the
 * first starting row has (some row fields are optional), but any key it has must match.
 */
export function sameShape(initial: unknown, saved: unknown, isRow = false): boolean {
  if (Array.isArray(initial)) {
    if (!Array.isArray(saved)) return false;
    const model = initial[0];
    if (model === undefined) return true;
    return saved.every((entry) => sameShape(model, entry, true));
  }
  if (isPlainObject(initial)) {
    if (!isPlainObject(saved)) return false;
    return Object.keys(initial).every((key) => (key in saved ? sameShape(initial[key], saved[key]) : isRow));
  }
  return typeof initial === typeof saved;
}
