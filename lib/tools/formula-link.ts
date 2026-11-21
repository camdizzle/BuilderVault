// Links that open the Power Fx formatter with a formula already filled in. The formula goes in the
// part of the URL after #, which browsers never send to the server.

export const formatterPath = "/tools/power-fx-formatter";

/** Longer formulas make links that some chat and email apps cut short. */
export const maxLinkedFormulaLength = 6000;

export function formatterLink(formula: string) {
  return `${formatterPath}#formula=${encodeURIComponent(formula)}`;
}

/** Reads a formula from a hash such as #formula=If(...). Returns null when there is none. */
export function formulaFromHash(hash: string) {
  const match = /^#formula=([\s\S]*)$/.exec(hash);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}
