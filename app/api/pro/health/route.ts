import { proConfigStatus } from "@/lib/pro/config";
import { jsonNoStore } from "@/lib/pro/http";
import { dataDirWritable } from "@/lib/pro/store";

export const dynamic = "force-dynamic";

/** A setup check: which Pro settings are present (true or false only) and whether account files can be saved. */
export async function GET() {
  const status = proConfigStatus();
  if (!status.enabled) return jsonNoStore({ enabled: false });
  return jsonNoStore({ ...status, dataFolderWritable: await dataDirWritable() });
}
