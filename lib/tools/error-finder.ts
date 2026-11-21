/** One error page, cut down to what the finder needs. Built on the server and passed to the tool. */
export type ErrorEntry = {
  slug: string;
  href: string;
  title: string;
  product: string;
  message: string;
  variants: string[];
  keywords: string[];
  quickAnswer: string;
};

export type ErrorMatch = { entry: ErrorEntry; score: number; matched: string[] };

const stopWords = new Set(
  "a an and are as at be been but by can could did do does for from had has have if in into is it its not of on or our please so that the their then there these this to was were what when which while will with you your".split(" ")
);

/** Lower-case words, with ids, GUIDs, URLs, emails and quoted names taken out, because they differ every time. */
export function errorTokens(text: string): string[] {
  const cleaned = text
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\S+@\S+\.\S+/g, " ")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, " ")
    .replace(/'[^'\s]{1,80}'/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
  const words = cleaned.match(/0x[0-9a-f]+|[a-z][a-z0-9]*|\d{3}/g) ?? [];
  return words.filter((word) => word.length > 1 && !stopWords.has(word));
}

const unique = <T,>(items: T[]) => [...new Set(items)];

/** Error codes and names that point at one page on their own, such as 0x80040220 or InvalidTemplate. */
function codes(text: string) {
  return unique((text.match(/0x[0-9a-fA-F]{6,8}|\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g) ?? []).map((code) => code.toLowerCase()));
}

/** Names in quotes, such as an action or function name, differ between runs. */
const quotedAsX = (text: string) => text.replace(/'[^'\s]{0,80}'/g, "'x'");

export function createErrorFinder(entries: ErrorEntry[]) {
  const pageTokens = entries.map((entry) =>
    unique(errorTokens([entry.message, ...entry.variants, entry.title, ...entry.keywords].join(" ")))
  );
  const pageCodes = entries.map((entry) => codes([entry.message, ...entry.variants].join(" ")));
  const documentCount = new Map<string, number>();
  for (const tokens of pageTokens) for (const token of tokens) documentCount.set(token, (documentCount.get(token) ?? 0) + 1);
  const phraseOf = (text: string) => quotedAsX(text).toLowerCase().replace(/\s+/g, " ").replace(/[.…]+$/, "").slice(0, 70);
  const phraseCount = new Map<string, number>();
  const pagePhrases = entries.map((entry) => unique([entry.message, ...entry.variants].map(phraseOf).filter((text) => text.length >= 20)));
  for (const phrases of pagePhrases) for (const phrase of phrases) phraseCount.set(phrase, (phraseCount.get(phrase) ?? 0) + 1);
  // A phrase that starts several messages, such as "Unable to process template language expressions", proves nothing.
  const distinctPhrases = pagePhrases.map((phrases) => phrases.filter((phrase) => ![...phraseCount.keys()].some((other) => other !== phrase && other.startsWith(phrase))));
  const idf = (token: string) => Math.log((entries.length + 1) / ((documentCount.get(token) ?? 0) + 0.5));

  return function find(input: string, limit = 5): ErrorMatch[] {
    const tokens = unique(errorTokens(input)).filter((token) => documentCount.has(token));
    if (tokens.length === 0) return [];
    const inputWeight = tokens.reduce((sum, token) => sum + idf(token), 0);
    const inputCodes = codes(input);
    const normalizedInput = quotedAsX(input).toLowerCase().replace(/\s+/g, " ");

    const results = entries.map((entry, index) => {
      const pageSet = new Set(pageTokens[index]);
      const matched = tokens.filter((token) => pageSet.has(token));
      let score = matched.reduce((sum, token) => sum + idf(token), 0) / inputWeight;
      if (inputCodes.some((code) => pageCodes[index].includes(code))) score += 0.5;
      // A message found word for word is strong evidence, shared between the pages that quote it.
      let phrase: { start: number; end: number; bonus: number } | null = null;
      for (const text of distinctPhrases[index]) {
        const start = normalizedInput.indexOf(text);
        const bonus = 1 / (phraseCount.get(text) ?? 1);
        if (start >= 0 && (!phrase || bonus > phrase.bonus)) phrase = { start, end: start + text.length, bonus };
      }
      if (phrase) score += phrase.bonus;
      return { entry, score, matched, phrase };
    });

    // Flow errors wrap the specific reason inside a general message, such as "Unable to process template language
    // expressions ... : 'The template language function ...'". When one quoted message ends before another starts,
    // the later one is the reason, so the general one drops below it.
    for (const result of results) {
      if (result.phrase && results.some((other) => other.phrase && other.phrase.start >= result.phrase!.end)) result.score -= 0.8;
    }

    return results
      .filter((result) => result.score >= 0.25 && result.matched.length > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ entry, score, matched }) => ({ entry, score, matched }));
  };
}

/** A plain hint when nothing matches, based on an HTTP status code in the text. */
export function statusHint(input: string): string | null {
  const status = input.match(/\b(400|401|403|404|408|409|412|429|500|502|503|504)\b/)?.[1];
  const hints: Record<string, string> = {
    "400": "400 means the request was malformed. Check the inputs of the failing action, especially expressions, dates and IDs.",
    "401": "401 means the connection's sign-in was not accepted. Fix or re-create the connection used by the failing action.",
    "403": "403 means the account was recognized but lacks permission. Check the connection account's access to the site, list, table or mailbox.",
    "404": "404 means the item, file, list or URL was not found. Check the IDs and names the action uses, and whether the item was deleted or moved.",
    "408": "408 means the request took too long. Reduce what the action asks for, or add a filter or pagination.",
    "409": "409 is a conflict, often an item changed by someone else or a file that already exists. Retry, or check before creating.",
    "412": "412 means the item changed since it was read. Get the item again before updating it.",
    "429": "429 means the connector is throttling you. Slow the flow down with concurrency limits or a delay, and let the retry policy work.",
    "500": "500 is an error inside the service. Retry, and if it keeps failing, check the inputs and the service health page.",
    "502": "502 usually means the request took too long behind a gateway. Make the request smaller or run it in a child flow.",
    "503": "503 means the service is busy or down. Let the retry policy handle it and check service health.",
    "504": "504 means the service did not answer in time. Make the request smaller, or filter before you fetch."
  };
  return status ? `HTTP ${status}: ${hints[status]}` : null;
}
