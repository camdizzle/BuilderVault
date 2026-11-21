import assert from "node:assert/strict";
import test from "node:test";
import {
  createSessionToken,
  createSignInToken,
  readSessionToken,
  readSignInToken,
  safeNextPath,
  sessionLifetimeMs,
  signInLinkLifetimeMs
} from "../../lib/pro/tokens.ts";
import { addHistoryEntry, cleanFormatterPrefs, emptyAccount, historyLimit, isComplimentary, isProAccount, periodEndOf } from "../../lib/pro/plan.ts";

const secret = "a-test-secret-that-is-long-enough-123456";

test("a session token round-trips and normalizes the email", () => {
  const token = createSessionToken("  Dev@Example.com ", secret, 1000);
  assert.deepEqual(readSessionToken(token, secret, 2000), { email: "dev@example.com", expiresAt: 1000 + sessionLifetimeMs });
});

test("session tokens reject a wrong secret, tampering, and expiry", () => {
  const token = createSessionToken("dev@example.com", secret, 1000);
  assert.equal(readSessionToken(token, "another-secret-that-is-long-enough-9999", 2000), null);
  assert.equal(readSessionToken(token.slice(0, -2) + "xx", secret, 2000), null);
  const [body, sig] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ e: "boss@example.com", x: 9e15 })).toString("base64url");
  assert.equal(readSessionToken(forged + "." + sig, secret, 2000), null);
  assert.equal(readSessionToken(body + "." + sig, secret, 1000 + sessionLifetimeMs + 1), null);
  assert.equal(readSessionToken(token, "", 2000), null);
});

test("a sign-in link token can't be used as a session, or the other way round", () => {
  const link = createSignInToken("dev@example.com", "/pro", secret, 1000);
  const session = createSessionToken("dev@example.com", secret, 1000);
  assert.equal(readSessionToken(link, secret, 2000), null);
  assert.equal(readSignInToken(session, secret, 2000), null);
  const read = readSignInToken(link, secret, 2000);
  assert.equal(read.email, "dev@example.com");
  assert.equal(read.next, "/pro");
  assert.equal(read.expiresAt, 1000 + signInLinkLifetimeMs);
  assert.equal(readSignInToken(link, secret, 1000 + signInLinkLifetimeMs + 1), null);
});

test("two sign-in links for the same email carry different nonces", () => {
  const a = readSignInToken(createSignInToken("dev@example.com", "/", secret, 1000), secret, 2000);
  const b = readSignInToken(createSignInToken("dev@example.com", "/", secret, 1000), secret, 2000);
  assert.notEqual(a.nonce, b.nonce);
});

test("only same-site paths are allowed after sign-in", () => {
  assert.equal(safeNextPath("/pro"), "/pro");
  assert.equal(safeNextPath("//evil.example"), "/account");
  assert.equal(safeNextPath("https://evil.example"), "/account");
  assert.equal(safeNextPath("/\\evil.example"), "/account");
  assert.equal(safeNextPath(undefined), "/account");
});

test("Pro is on for active, trialing and past-due subscriptions and for complimentary emails", () => {
  const account = emptyAccount("dev@example.com");
  assert.equal(isProAccount(account, account.email, ""), false);
  for (const [status, expected] of [["active", true], ["trialing", true], ["past_due", true], ["canceled", false], ["unpaid", false], ["incomplete", false]]) {
    account.subscription = { id: "sub_1", status, plan: "monthly", currentPeriodEnd: null, cancelAtPeriodEnd: false, updatedAt: 0 };
    assert.equal(isProAccount(account, account.email, ""), expected, status);
  }
  assert.equal(isComplimentary("Me@Example.com", "other@example.com, me@example.com"), true);
  assert.equal(isComplimentary("me@example.com", ""), false);
  assert.equal(isComplimentary("", ","), false);
});

test("history keeps the newest first, drops repeats, and stops at the limit", () => {
  let list = [];
  for (let index = 0; index < historyLimit + 5; index += 1) list = addHistoryEntry(list, { id: String(index), savedAt: index, text: "f" + index });
  assert.equal(list.length, historyLimit);
  assert.equal(list[0].text, "f" + (historyLimit + 4));
  list = addHistoryEntry(list, { id: "again", savedAt: 999, text: "f10" });
  assert.equal(list[0].id, "again");
  assert.equal(list.filter((entry) => entry.text === "f10").length, 1);
});

test("formatter settings accept only the formatter's own options", () => {
  assert.deepEqual(cleanFormatterPrefs({ indent: 2, width: 120, locale: "eu", source: "dataverse" }), { indent: 2, width: 120, locale: "eu", source: "dataverse" });
  assert.deepEqual(cleanFormatterPrefs({ indent: 7, width: "<script>", locale: "fr", source: "oracle" }), { indent: 4, width: 80, locale: "en", source: "sharepoint" });
  assert.deepEqual(cleanFormatterPrefs(null), { indent: 4, width: 80, locale: "en", source: "sharepoint" });
});

test("the billing period end is read from the subscription item first", () => {
  assert.equal(periodEndOf({ items: { data: [{ current_period_end: 200 }] }, current_period_end: 100 }), 200000);
  assert.equal(periodEndOf({ current_period_end: 100 }), 100000);
  assert.equal(periodEndOf({}), null);
});
