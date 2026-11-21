// What a BuilderVault account looks like on disk, and when it counts as Pro.
// Pure code with no Next.js imports, so the tests can load it directly.

export type ProPlan = "monthly" | "yearly";

export const proPrices: Record<ProPlan, { label: string; amount: string; interval: string }> = {
  monthly: { label: "Monthly", amount: "$3", interval: "month" },
  yearly: { label: "Yearly", amount: "$30", interval: "year" }
};

export type StoredSubscription = {
  id: string;
  status: string;
  plan: ProPlan | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: number;
};

export type FormatterPrefs = { indent: number; width: number; locale: "en" | "eu"; source: string };

export type HistoryEntry = { id: string; savedAt: number; text: string };

export type Account = {
  email: string;
  createdAt: number;
  stripeCustomerId: string | null;
  subscription: StoredSubscription | null;
  prefs: { formatter?: FormatterPrefs };
  history: Record<string, HistoryEntry[]>;
};

/** Stripe keeps a subscription "past_due" while it retries a failed payment, so Pro stays on during the retries. */
const proStatuses = new Set(["active", "trialing", "past_due"]);

export function hasActiveSubscription(account: Pick<Account, "subscription"> | null) {
  return Boolean(account?.subscription && proStatuses.has(account.subscription.status));
}

export function isComplimentary(email: string, compList: string) {
  const wanted = email.trim().toLowerCase();
  if (!wanted) return false;
  return compList
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(wanted);
}

export function isProAccount(account: Account | null, email: string, compList: string) {
  return isComplimentary(email, compList) || hasActiveSubscription(account);
}

export function emptyAccount(email: string, now = Date.now()): Account {
  return { email, createdAt: now, stripeCustomerId: null, subscription: null, prefs: {}, history: {} };
}

export const historyLimit = 50;
export const historyEntryMaxLength = 20000;

/** Newest first, no exact repeats of the latest entry, capped at the history limit. */
export function addHistoryEntry(list: HistoryEntry[], entry: HistoryEntry) {
  const withoutRepeat = list.filter((item) => item.text !== entry.text);
  return [entry, ...withoutRepeat].slice(0, historyLimit);
}

const allowedIndents = new Set([0, 2, 4]);
const allowedWidths = new Set([60, 80, 100, 120]);
const allowedSources = new Set(["sharepoint", "dataverse", "sql", "excel"]);

/** Accepts only the options the formatter offers; anything else falls back to the formatter's defaults. */
export function cleanFormatterPrefs(value: unknown): FormatterPrefs {
  const input = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    indent: allowedIndents.has(Number(input.indent)) ? Number(input.indent) : 4,
    width: allowedWidths.has(Number(input.width)) ? Number(input.width) : 80,
    locale: input.locale === "eu" ? "eu" : "en",
    source: typeof input.source === "string" && allowedSources.has(input.source) ? input.source : "sharepoint"
  };
}

/** Stripe moved the billing period onto subscription items in 2025; older API versions keep it on the subscription. */
export function periodEndOf(subscription: { current_period_end?: number | null; items?: { data?: Array<{ current_period_end?: number | null }> } }) {
  const fromItem = subscription.items?.data?.[0]?.current_period_end;
  const value = fromItem ?? subscription.current_period_end ?? null;
  return typeof value === "number" ? value * 1000 : null;
}
