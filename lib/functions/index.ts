import { findFunctions } from "./find-functions";
import { shapeFunctions } from "./shape-functions";
import { saveFunctions } from "./save-functions";
import { logicFunctions } from "./logic-functions";
import { textDateFunctions } from "./text-date-functions";
import { appFunctions } from "./app-functions";
import type { FunctionCategory, FunctionPage } from "./types";

export type { FunctionCategory, FunctionPage } from "./types";
export { categoryIntro, functionCategories } from "./types";

export const functionPages: FunctionPage[] = [...findFunctions, ...shapeFunctions, ...saveFunctions, ...logicFunctions, ...textDateFunctions, ...appFunctions];

export const functionPath = (page: Pick<FunctionPage, "slug">) => `/functions/${page.slug}`;

export function getFunctionBySlug(slug: string) {
  return functionPages.find((page) => page.slug === slug);
}

export function getFunctionsByCategory(category: FunctionCategory) {
  return functionPages.filter((page) => page.category === category);
}

/** Function pages that name this tool in relatedTools. Shown on the tool's own page. */
export function getFunctionsForTool(toolSlug: string) {
  return functionPages.filter((page) => page.relatedTools.includes(toolSlug));
}
