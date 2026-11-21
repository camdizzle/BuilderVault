// Account files for BuilderVault Pro: one JSON file per account in DATA_DIR/accounts,
// named by a hash of the email so file names never contain an address. Writes are atomic.
// Stripe stays the record of who has paid; these files cache it and hold saved settings.
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { proSettings } from "./config";
import { emptyAccount, type Account } from "./plan";
import { normalizeEmail } from "./tokens";

export function accountKey(email: string) {
  return createHash("sha256").update(normalizeEmail(email)).digest("hex").slice(0, 40);
}

function accountsDir() {
  return path.join(proSettings().dataDir, "accounts");
}

function accountPath(key: string) {
  if (!/^[a-f0-9]{40}$/.test(key)) throw new Error("Invalid account key");
  return path.join(accountsDir(), key + ".json");
}

async function readByKey(key: string): Promise<Account | null> {
  try {
    return JSON.parse(await fs.readFile(accountPath(key), "utf8")) as Account;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function writeByKey(key: string, account: Account) {
  await fs.mkdir(accountsDir(), { recursive: true });
  const file = accountPath(key);
  const temp = file + "." + randomBytes(6).toString("hex") + ".tmp";
  await fs.writeFile(temp, JSON.stringify(account, null, 2));
  await fs.rename(temp, file);
}

// Changes to one account run one after another, so two requests can't overwrite each other's edits.
const queues = new Map<string, Promise<unknown>>();

function serialized<T>(key: string, work: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(work);
  queues.set(key, next);
  next.finally(() => {
    if (queues.get(key) === next) queues.delete(key);
  }).catch(() => undefined);
  return next;
}

export async function getAccount(email: string) {
  return readByKey(accountKey(email));
}

export async function getAccountByKey(key: string) {
  return readByKey(key);
}

/** Loads the account (creating it if needed), applies the change, and saves it. */
export async function updateAccount(email: string, change: (account: Account) => Account | void) {
  const normalized = normalizeEmail(email);
  const key = accountKey(normalized);
  return serialized(key, async () => {
    const account = (await readByKey(key)) ?? emptyAccount(normalized);
    const result = change(account) ?? account;
    await writeByKey(key, result);
    return result;
  });
}

/** Same as updateAccount, for the webhook, which only knows the account key. Missing accounts are skipped. */
export async function updateAccountByKey(key: string, change: (account: Account) => Account | void) {
  return serialized(key, async () => {
    const account = await readByKey(key);
    if (!account) return null;
    const result = change(account) ?? account;
    await writeByKey(key, result);
    return result;
  });
}

/** True when the data folder can be written, for the setup check. */
export async function dataDirWritable() {
  try {
    await fs.mkdir(accountsDir(), { recursive: true });
    await fs.access(accountsDir(), fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}
