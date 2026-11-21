// Builds SharePoint list column formatting JSON for common Power Platform list patterns.

export const columnFormattingSchema = "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json";

export type PillColor = "green" | "amber" | "red" | "blue" | "grey" | "purple";

export const pillColors: Record<PillColor, { background: string; text: string; label: string }> = {
  green: { background: "#dff6dd", text: "#0b5a08", label: "Green" },
  amber: { background: "#fff4ce", text: "#6d5700", label: "Amber" },
  red: { background: "#fde7e9", text: "#a4262c", label: "Red" },
  blue: { background: "#deecf9", text: "#004578", label: "Blue" },
  grey: { background: "#edebe9", text: "#323130", label: "Grey" },
  purple: { background: "#ede3f6", text: "#5c2e91", label: "Purple" }
};

export type StatusRule = { value: string; color: PillColor };

/** Quotes a value for a SharePoint formatting expression. */
export function expressionString(value: string) {
  return "'" + value.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

/** Parses "Value|color" lines. Unknown colors fall back to grey. */
export function parseStatusRules(text: string): StatusRule[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.lastIndexOf("|");
      const value = (separator >= 0 ? line.slice(0, separator) : line).trim();
      const colorName = (separator >= 0 ? line.slice(separator + 1) : "").trim().toLowerCase();
      const color = (colorName in pillColors ? colorName : "grey") as PillColor;
      return { value, color };
    })
    .filter((rule) => rule.value);
}

function nestedIf(rules: StatusRule[], pick: (rule: StatusRule) => string, fallback: string) {
  return "=" + rules.reduceRight((otherwise, rule) => `if(@currentField == ${expressionString(rule.value)}, '${pick(rule)}', ${otherwise})`, `'${fallback}'`);
}

export function statusPillFormat(rules: StatusRule[]) {
  return {
    $schema: columnFormattingSchema,
    elmType: "div",
    txtContent: "@currentField",
    style: {
      display: "=if(@currentField == '', 'none', 'inline-block')",
      padding: "2px 10px",
      "border-radius": "12px",
      "font-weight": "600",
      "background-color": rules.length > 0 ? nestedIf(rules, (rule) => pillColors[rule.color].background, pillColors.grey.background) : pillColors.grey.background,
      color: rules.length > 0 ? nestedIf(rules, (rule) => pillColors[rule.color].text, pillColors.grey.text) : pillColors.grey.text
    }
  };
}

const dayInMs = 86400000;

export function dueDateFormat(warningDays: number) {
  const days = Math.max(0, Math.floor(warningDays));
  const soon = `@now + ${days * dayInMs}`;
  const pick = (overdue: string, dueSoon: string) =>
    `=if(Number(@currentField) == 0, '', if(@currentField < @now, '${overdue}', ${days > 0 ? `if(@currentField <= ${soon}, '${dueSoon}', '')` : "''"}))`;
  return {
    $schema: columnFormattingSchema,
    elmType: "div",
    txtContent: "=if(Number(@currentField) == 0, '', toLocaleDateString(@currentField))",
    style: {
      display: "inline-block",
      padding: "2px 8px",
      "border-radius": "4px",
      "background-color": pick(pillColors.red.background, pillColors.amber.background),
      color: pick(pillColors.red.text, pillColors.amber.text),
      "font-weight": "=if(Number(@currentField) != 0 && @currentField < @now, '600', '400')"
    }
  };
}

export function progressBarFormat(scale: "percent" | "fraction", barColor: string) {
  const value = scale === "fraction" ? "(@currentField * 100)" : "@currentField";
  const color = /^#[0-9a-f]{6}$/i.test(barColor.trim()) ? barColor.trim() : "#0f766e";
  return {
    $schema: columnFormattingSchema,
    elmType: "div",
    style: { display: "flex", "align-items": "center", width: "100%" },
    children: [
      {
        elmType: "div",
        style: {
          "flex-grow": "1",
          height: "12px",
          "border-radius": "6px",
          "background-color": "#edebe9",
          overflow: "hidden",
          "margin-right": "8px"
        },
        children: [
          {
            elmType: "div",
            style: {
              height: "100%",
              "background-color": color,
              width: `=if(${value} >= 100, '100%', if(${value} <= 0, '0%', toString(${value}) + '%'))`
            }
          }
        ]
      },
      {
        elmType: "span",
        txtContent: `=toString(floor(${value} + 0.5)) + '%'`,
        style: { "min-width": "40px", "text-align": "right" }
      }
    ]
  };
}

export function personEmailFormat(subject: string, includeTitle: boolean) {
  const subjectParts: string[] = [];
  if (subject.trim()) subjectParts.push(expressionString(subject.trim() + (includeTitle ? " " : "")));
  if (includeTitle) subjectParts.push("[$Title]");
  // The subject is URL-encoded so characters such as & and # don't cut it short.
  const subjectExpression = subjectParts.length > 0 ? ` + '?subject=' + encodeURIComponent(${subjectParts.join(" + ")})` : "";
  return {
    $schema: columnFormattingSchema,
    elmType: "a",
    txtContent: "@currentField.title",
    attributes: {
      href: `=if(@currentField.email == '', '', 'mailto:' + @currentField.email${subjectExpression})`,
      target: "_blank"
    },
    style: { color: "#0f6cbd", "text-decoration": "none" }
  };
}

export function powerAppsButtonFormat(appUrl: string, label: string, parameterName: string, buttonColor: string) {
  const url = appUrl.trim();
  const param = parameterName.trim().replace(/[^A-Za-z0-9_]/g, "") || "ID";
  const joiner = url.includes("?") ? "&" : "?";
  const color = /^#[0-9a-f]{6}$/i.test(buttonColor.trim()) ? buttonColor.trim() : "#0f766e";
  return {
    $schema: columnFormattingSchema,
    elmType: "a",
    txtContent: label.trim() || "Open in app",
    attributes: {
      href: `=${expressionString(url + joiner + param + "=")} + [$ID]`,
      target: "_blank"
    },
    style: {
      display: "inline-block",
      padding: "4px 12px",
      "border-radius": "4px",
      "background-color": color,
      color: "#ffffff",
      "text-decoration": "none",
      "font-weight": "600"
    }
  };
}

export function isPowerAppsPlayUrl(url: string) {
  return /^https:\/\/apps\.powerapps\.com\/play\//i.test(url.trim());
}
