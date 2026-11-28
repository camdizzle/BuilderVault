// Splits Power Fx into coloured pieces for display. This is only for colouring the formatter's
// output: it never changes the text, and joining every token's text gives back the input exactly.

export type HighlightKind = "comment" | "string" | "number" | "function" | "keyword" | "enum" | "variable" | "name" | "punctuation" | "plain";

export type HighlightToken = { kind: HighlightKind; text: string };

const keywords = new Set(["true", "false", "and", "or", "not", "in", "exactin", "as", "self", "parent", "thisitem", "thisrecord"]);

const enums = new Set([
  "notificationtype", "color", "displaymode", "screentransition", "align", "verticalalign", "fontweight", "font",
  "borderstyle", "direction", "errorkind", "textformat", "sortorder", "layout", "texttype", "datetimeformat",
  "imageposition", "overflow", "pentype", "teamstheme", "transition", "zoom", "virtualkeyboardmode", "startofweek",
  "timeunit", "formpattern", "listitemtemplate", "loadingspinner", "match", "matchoptions", "json", "jsonformat",
  "calendar", "clock", "location", "acceleration", "compass", "connection", "app", "host", "environment"
]);

const variablePrefix = /^(gbl|var|loc|col|ctx|nf)[A-Z_]/;

/** Splits a formula into tokens. Unknown characters become plain tokens, so nothing is ever lost. */
export function highlightPowerFx(source: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let index = 0;

  const push = (kind: HighlightKind, text: string) => {
    if (!text) return;
    const last = tokens[tokens.length - 1];
    if (last && last.kind === kind && (kind === "plain" || kind === "punctuation")) last.text += text;
    else tokens.push({ kind, text });
  };

  while (index < source.length) {
    const rest = source.slice(index);
    const char = source[index];

    if (rest.startsWith("//")) {
      const end = source.indexOf("\n", index);
      const stop = end === -1 ? source.length : end;
      push("comment", source.slice(index, stop));
      index = stop;
      continue;
    }

    if (rest.startsWith("/*")) {
      const end = source.indexOf("*/", index + 2);
      const stop = end === -1 ? source.length : end + 2;
      push("comment", source.slice(index, stop));
      index = stop;
      continue;
    }

    if (char === '"' || (char === "$" && source[index + 1] === '"')) {
      // A string runs to the next quote that isn't doubled ("" is an escaped quote).
      let cursor = index + (char === "$" ? 2 : 1);
      while (cursor < source.length) {
        if (source[cursor] === '"') {
          if (source[cursor + 1] === '"') {
            cursor += 2;
            continue;
          }
          cursor += 1;
          break;
        }
        cursor += 1;
      }
      push("string", source.slice(index, cursor));
      index = cursor;
      continue;
    }

    if (char === "'") {
      // A quoted name such as 'Request Status'. '' inside is an escaped quote.
      let cursor = index + 1;
      while (cursor < source.length) {
        if (source[cursor] === "'") {
          if (source[cursor + 1] === "'") {
            cursor += 2;
            continue;
          }
          cursor += 1;
          break;
        }
        if (source[cursor] === "\n") break;
        cursor += 1;
      }
      push("name", source.slice(index, cursor));
      index = cursor;
      continue;
    }

    const number = /^\d+(\.\d+)?([eE][+-]?\d+)?/.exec(rest);
    if (number && !/[A-Za-z0-9_]/.test(source[index - 1] ?? "")) {
      push("number", number[0]);
      index += number[0].length;
      continue;
    }

    const word = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (word) {
      const text = word[0];
      const lower = text.toLowerCase();
      const after = source.slice(index + text.length);
      const previous = source.slice(0, index).trimEnd();
      const isMember = previous.endsWith(".");
      if (/^\s*\(/.test(after) && !isMember) push("function", text);
      else if (!isMember && keywords.has(lower)) push("keyword", text);
      else if (!isMember && enums.has(lower) && after.startsWith(".")) push("enum", text);
      else if (!isMember && variablePrefix.test(text)) push("variable", text);
      else push("plain", text);
      index += text.length;
      continue;
    }

    if (/[(){}[\],;.:!=<>&+\-*/^%@|]/.test(char)) {
      push("punctuation", char);
      index += 1;
      continue;
    }

    push("plain", char);
    index += 1;
  }

  return tokens;
}

/** Splits tokens into lines so each line can be numbered. Tokens that span lines are cut at each newline. */
export function highlightLines(source: string): HighlightToken[][] {
  const lines: HighlightToken[][] = [[]];
  for (const token of highlightPowerFx(source)) {
    const parts = token.text.split("\n");
    parts.forEach((part, partIndex) => {
      if (partIndex > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ kind: token.kind, text: part });
    });
  }
  return lines;
}
