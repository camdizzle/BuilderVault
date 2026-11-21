import { randomBytes } from "node:crypto";
import { proEnabled } from "@/lib/pro/config";
import { isSameOrigin, jsonNoStore, notFoundResponse } from "@/lib/pro/http";
import { addHistoryEntry, historyEntryMaxLength } from "@/lib/pro/plan";
import { currentViewer } from "@/lib/pro/session";
import { updateAccount } from "@/lib/pro/store";

export const dynamic = "force-dynamic";

/** Tools that keep a saved history. More tools can be added here as they get history panels. */
const historyTools = new Set(["power-fx-formatter"]);

function toolFrom(request: Request) {
  const tool = new URL(request.url).searchParams.get("tool") ?? "";
  return historyTools.has(tool) ? tool : null;
}

export async function GET(request: Request) {
  if (!proEnabled()) return notFoundResponse();
  const tool = toolFrom(request);
  if (!tool) return jsonNoStore({ error: "Unknown tool" }, { status: 400 });
  const viewer = await currentViewer();
  if (!viewer?.pro) return jsonNoStore({ error: "Pro required" }, { status: 403 });
  return jsonNoStore({ entries: viewer.account?.history?.[tool] ?? [] });
}

/** Saves one entry. Body: { text }. */
export async function POST(request: Request) {
  if (!proEnabled()) return notFoundResponse();
  if (!isSameOrigin(request)) return jsonNoStore({ error: "Bad origin" }, { status: 403 });
  const tool = toolFrom(request);
  if (!tool) return jsonNoStore({ error: "Unknown tool" }, { status: 400 });
  const viewer = await currentViewer();
  if (!viewer?.pro) return jsonNoStore({ error: "Pro required" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text : "";
  if (!text.trim()) return jsonNoStore({ error: "Nothing to save" }, { status: 400 });
  if (text.length > historyEntryMaxLength) return jsonNoStore({ error: "Too long to save" }, { status: 413 });

  const account = await updateAccount(viewer.email, (current) => {
    current.history = current.history ?? {};
    current.history[tool] = addHistoryEntry(current.history[tool] ?? [], { id: randomBytes(8).toString("hex"), savedAt: Date.now(), text });
  });
  return jsonNoStore({ entries: account.history[tool] });
}

/** Deletes one entry (?id=) or the whole list for the tool (no id). */
export async function DELETE(request: Request) {
  if (!proEnabled()) return notFoundResponse();
  if (!isSameOrigin(request)) return jsonNoStore({ error: "Bad origin" }, { status: 403 });
  const tool = toolFrom(request);
  if (!tool) return jsonNoStore({ error: "Unknown tool" }, { status: 400 });
  const viewer = await currentViewer();
  if (!viewer?.pro) return jsonNoStore({ error: "Pro required" }, { status: 403 });

  const id = new URL(request.url).searchParams.get("id");
  const account = await updateAccount(viewer.email, (current) => {
    current.history = current.history ?? {};
    current.history[tool] = id ? (current.history[tool] ?? []).filter((entry) => entry.id !== id) : [];
  });
  return jsonNoStore({ entries: account.history[tool] });
}
