// Turns brand hex colors into Power Fx color tokens, and checks text contrast for each color.

export type TokenOutputMode = "namedFormulas" | "themeRecord" | "variables";

export type ColorToken = {
  /** The token name as typed, cleaned into a Power Fx name such as Primary. */
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  /** 0 to 1. */
  alpha: number;
  contrastWithWhite: number;
  contrastWithBlack: number;
};

export type TokenResult = { tokens: ColorToken[]; issues: string[] };

/** Parses #rgb, #rrggbb and #rrggbbaa. Returns null for anything else. */
export function parseHex(value: string) {
  const cleaned = value.trim().replace(/^#/, "");
  if (!/^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(cleaned)) return null;
  const full = cleaned.length === 3 ? [...cleaned].map((char) => char + char).join("") : cleaned;
  const channel = (index: number) => Number.parseInt(full.slice(index, index + 2), 16);
  const alpha = full.length === 8 ? Math.round((channel(6) / 255) * 100) / 100 : 1;
  return { r: channel(0), g: channel(2), b: channel(4), alpha, hex: "#" + full.slice(0, 6).toLowerCase() };
}

function luminance(r: number, g: number, b: number) {
  const linear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** The WCAG contrast ratio between two colors, from 1 to 21. */
export function contrastRatio(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  const first = luminance(a.r, a.g, a.b);
  const second = luminance(b.r, b.g, b.b);
  const ratio = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  return Math.round(ratio * 100) / 100;
}

/** Cleans a typed name into a Power Fx name: "primary dark" becomes PrimaryDark. */
export function tokenName(value: string) {
  const words = value.split(/[^A-Za-z0-9]+/).filter(Boolean);
  const name = words.map((word) => word[0].toUpperCase() + word.slice(1)).join("");
  return /^[A-Za-z]/.test(name) ? name : name ? "Color" + name : "";
}

/** Reads lines such as "Primary #0f766e", "Primary: #0f766e" or "Primary|#0f766e". */
export function parseTokens(text: string): TokenResult {
  const tokens: ColorToken[] = [];
  const issues: string[] = [];
  const seen = new Set<string>();
  text.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const match = /^(.*?)[\s:|=,]+(#?[0-9a-fA-F]{3,8})$/.exec(trimmed);
    if (!match) {
      issues.push(`Line ${index + 1}: write a name and a hex color, such as Primary #0f766e.`);
      return;
    }
    const color = parseHex(match[2]);
    if (!color) {
      issues.push(`Line ${index + 1}: "${match[2]}" isn't a hex color. Use 3, 6 or 8 hex digits, such as #0f766e.`);
      return;
    }
    const name = tokenName(match[1]);
    if (!name) {
      issues.push(`Line ${index + 1}: add a name before the color, such as Primary.`);
      return;
    }
    if (seen.has(name.toLowerCase())) {
      issues.push(`Line ${index + 1}: ${name} is used twice. Each token needs its own name.`);
      return;
    }
    seen.add(name.toLowerCase());
    tokens.push({
      name,
      ...color,
      contrastWithWhite: contrastRatio(color, { r: 255, g: 255, b: 255 }),
      contrastWithBlack: contrastRatio(color, { r: 0, g: 0, b: 0 })
    });
  });
  return { tokens, issues };
}

export function rgba(token: Pick<ColorToken, "r" | "g" | "b" | "alpha">) {
  return `RGBA(${token.r}, ${token.g}, ${token.b}, ${token.alpha})`;
}

/** The Power Fx for a set of tokens. Names get the prefix, such as Color or gblColor. */
export function tokensFormula(tokens: ColorToken[], mode: TokenOutputMode, prefix: string) {
  const cleanPrefix = prefix.trim().replace(/[^A-Za-z0-9_]/g, "");
  if (mode === "themeRecord") {
    const name = /^[A-Za-z_]/.test(cleanPrefix) ? cleanPrefix : "Theme";
    return `${name} = {\n${tokens.map((token) => `    ${token.name}: ${rgba(token)}`).join(",\n")}\n};`;
  }
  if (mode === "variables") {
    const start = /^[A-Za-z_]/.test(cleanPrefix) ? cleanPrefix : "gblColor";
    return tokens.map((token) => `Set(${start}${token.name}, ${rgba(token)});`).join("\n");
  }
  const start = /^[A-Za-z_]/.test(cleanPrefix) ? cleanPrefix : "Color";
  return tokens.map((token) => `${start}${token.name} = ${rgba(token)};`).join("\n");
}

/** The text color with more contrast on this background, and whether it passes WCAG AA for normal text (4.5:1). */
export function textAdvice(token: ColorToken) {
  const useWhite = token.contrastWithWhite >= token.contrastWithBlack;
  const ratio = useWhite ? token.contrastWithWhite : token.contrastWithBlack;
  return { text: useWhite ? "white" : "black", ratio, passesNormal: ratio >= 4.5, passesLarge: ratio >= 3 };
}
