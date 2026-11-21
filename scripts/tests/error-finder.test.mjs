import assert from "node:assert/strict";
import test from "node:test";
import { createErrorFinder, errorTokens, statusHint } from "../../lib/tools/error-finder.ts";

const entry = (slug, message, variants = [], keywords = []) => ({ slug, href: `/errors/${slug}`, title: slug, product: "Power Automate", message, variants, keywords, quickAnswer: "" });

const entries = [
  entry("invalid-template", "InvalidTemplate. Unable to process template language expressions in action 'Compose' inputs at line '0' and column '0'.", ["Unable to process template language expressions for action 'Apply_to_each'."]),
  entry("null-parameter", "The template language function 'split' expects its first parameter to be of type string. The provided value is of type 'Null'."),
  entry("privilege", "Principal user (Id=00000000-0000-0000-0000-000000000000, type=8) is missing prvReadAccount privilege (Id=0x80040220)", [], ["0x80040220"]),
  entry("throttled", "Rate limit is exceeded. Try again in 30 seconds.", ["429 Too Many Requests"]),
  entry("not-found", "The specified item was not found.")
];
const find = createErrorFinder(entries);

test("tokens drop quoted names, GUIDs, emails and links", () => {
  const tokens = errorTokens("Action 'Get_items' failed for user@contoso.com at https://contoso.sharepoint.com id 8a3d1c3e-1111-2222-3333-444455556666");
  assert.deepEqual(tokens, ["action", "failed", "id"]);
});

test("the specific reason ranks above the general wrapper", () => {
  const matches = find("Unable to process template language expressions in action 'Compose_2' inputs at line '0' and column '0': 'The template language function 'formatDateTime' expects its first parameter to be of type string. The provided value is of type 'Null'.'");
  assert.equal(matches[0].entry.slug, "null-parameter");
  assert.ok(matches.some((match) => match.entry.slug === "invalid-template"));
});

test("error codes match on their own", () => {
  assert.equal(find("SecLib::AccessCheckEx failed 0x80040220")[0].entry.slug, "privilege");
});

test("unrelated text finds nothing", () => {
  assert.deepEqual(find("hello world"), []);
  assert.deepEqual(find(""), []);
});

test("status codes get a plain hint", () => {
  assert.ok(statusHint("Status code: 429")?.startsWith("HTTP 429"));
  assert.equal(statusHint("nothing here"), null);
});
