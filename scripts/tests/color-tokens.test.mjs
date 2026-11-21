import assert from "node:assert/strict";
import test from "node:test";
import { contrastRatio, parseHex, parseTokens, textAdvice, tokenName, tokensFormula } from "../../lib/tools/color-tokens.ts";

test("hex parsing", () => {
  assert.deepEqual(parseHex("#0f766e"), { r: 15, g: 118, b: 110, alpha: 1, hex: "#0f766e" });
  assert.deepEqual(parseHex("fff"), { r: 255, g: 255, b: 255, alpha: 1, hex: "#ffffff" });
  assert.equal(parseHex("#0f766e80").alpha, 0.5);
  assert.equal(parseHex("#zz1"), null);
  assert.equal(parseHex("#12345"), null);
});

test("contrast ratios match WCAG", () => {
  assert.equal(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }), 21);
  assert.equal(contrastRatio({ r: 255, g: 255, b: 255 }, { r: 255, g: 255, b: 255 }), 1);
  assert.equal(contrastRatio({ r: 118, g: 118, b: 118 }, { r: 255, g: 255, b: 255 }), 4.54);
});

test("names are cleaned", () => {
  assert.equal(tokenName("primary dark"), "PrimaryDark");
  assert.equal(tokenName("500"), "Color500");
});

test("lines are parsed and bad ones reported", () => {
  const { tokens, issues } = parseTokens("Primary #0f766e\nSurface: #fff\nBad #zz1\n#123456\nPrimary #000000");
  assert.deepEqual(tokens.map((token) => token.name), ["Primary", "Surface"]);
  assert.equal(issues.length, 3);
});

test("three output formats", () => {
  const { tokens } = parseTokens("Primary #0f766e\nSurface #ffffff");
  assert.equal(tokensFormula(tokens, "namedFormulas", "Color"), "ColorPrimary = RGBA(15, 118, 110, 1);\nColorSurface = RGBA(255, 255, 255, 1);");
  assert.equal(tokensFormula(tokens, "themeRecord", "Theme"), "Theme = {\n    Primary: RGBA(15, 118, 110, 1),\n    Surface: RGBA(255, 255, 255, 1)\n};");
  assert.equal(tokensFormula(tokens, "variables", ""), "Set(gblColorPrimary, RGBA(15, 118, 110, 1));\nSet(gblColorSurface, RGBA(255, 255, 255, 1));");
});

test("text advice picks the better text color", () => {
  const { tokens } = parseTokens("Primary #0f766e\nYellow #ffd400");
  assert.equal(textAdvice(tokens[0]).text, "white");
  assert.equal(textAdvice(tokens[0]).passesNormal, true);
  assert.equal(textAdvice(tokens[1]).text, "black");
});
