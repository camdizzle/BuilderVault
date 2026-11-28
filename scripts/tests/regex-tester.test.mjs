import assert from "node:assert/strict";
import test from "node:test";
import { buildRegex, powerFxFormula, powerFxString, regexWarnings, runRegex } from "../../lib/tools/regex-tester.ts";

const base = { anchor: "default", ignoreCase: false, multiline: false };

test("IsMatch matches the whole text by default, like Power Apps", () => {
  assert.equal(runRegex({ ...base, fn: "IsMatch", pattern: "\\d+" }, "986").isMatch, true);
  assert.equal(runRegex({ ...base, fn: "IsMatch", pattern: "\\d+" }, "986 apples").isMatch, false);
  assert.equal(runRegex({ ...base, fn: "IsMatch", pattern: "\\d+", anchor: "Contains" }, "986 apples").isMatch, true);
  assert.equal(runRegex({ ...base, fn: "IsMatch", pattern: "\\d+(\\.\\d\\d)?" }, "1.02").isMatch, true);
  assert.equal(runRegex({ ...base, fn: "IsMatch", pattern: "\\d+(\\.\\d\\d)?" }, "3.1").isMatch, false);
});

test("Match finds the first match anywhere, with a 1-based StartMatch", () => {
  const result = runRegex({ ...base, fn: "Match", pattern: "REQ-(\\d{5})" }, "See REQ-00042 and REQ-00043");
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].fullMatch, "REQ-00042");
  assert.equal(result.matches[0].startMatch, 5);
  assert.deepEqual(result.matches[0].subMatches, ["00042"]);
});

test("MatchAll returns every match, with named submatches", () => {
  const result = runRegex({ ...base, fn: "MatchAll", pattern: "(?<key>\\w+)=(?<value>\\d+)" }, "a=1, b=22, c=x");
  assert.equal(result.matches.length, 2);
  assert.deepEqual(result.matches[1].named, [{ name: "key", value: "b" }, { name: "value", value: "22" }]);
});

test("MatchAll stops on empty matches instead of looping", () => {
  const result = runRegex({ ...base, fn: "MatchAll", pattern: "\\d*" }, "a1b");
  assert.ok(result.matches.length <= 4);
});

test("options and inline options", () => {
  assert.equal(runRegex({ ...base, fn: "IsMatch", pattern: "hello", ignoreCase: true }, "HELLO").isMatch, true);
  assert.equal(runRegex({ ...base, fn: "IsMatch", pattern: "(?i)hello" }, "HELLO").isMatch, true);
  assert.match(buildRegex({ ...base, fn: "IsMatch", pattern: "(?s)a.b" }).error ?? "", /isn't available in Power Apps/);
  assert.equal(runRegex({ ...base, fn: "MatchAll", pattern: "^\\w+$", multiline: true }, "one\ntwo").matches.length, 2);
});

test("Unicode categories work", () => {
  assert.equal(runRegex({ ...base, fn: "IsMatch", pattern: "\\p{L}+" }, "Zoë").isMatch, true);
});

test("invalid patterns report an error", () => {
  assert.match(runRegex({ ...base, fn: "IsMatch", pattern: "(abc" }, "abc").error ?? "", /isn't valid/);
});

test("warnings for Power Fx rules", () => {
  assert.ok(regexWarnings("[-a]").some((w) => w.includes("hyphen")));
  assert.ok(regexWarnings("(?<a>x)\\1").some((w) => w.includes("mixed")));
  assert.ok(regexWarnings("a++").some((w) => w.includes("Possessive")));
  assert.deepEqual(regexWarnings("^\\d{3}-\\d{4}$"), []);
  assert.deepEqual(regexWarnings("[a-z]+"), []);
});

test("formula output", () => {
  assert.equal(powerFxString('say "hi"'), '"say ""hi"""');
  assert.equal(powerFxFormula({ ...base, fn: "IsMatch", pattern: "\\d+" }, "txtAmount.Text"), 'IsMatch(txtAmount.Text, "\\d+")');
  assert.equal(
    powerFxFormula({ ...base, fn: "Match", pattern: "a", anchor: "BeginsWith", ignoreCase: true }, ""),
    'Match(txtInput.Text, "a", MatchOptions.BeginsWith & MatchOptions.IgnoreCase)'
  );
});
