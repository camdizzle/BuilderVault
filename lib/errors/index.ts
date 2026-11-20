import { appErrors } from "./app-errors";
import { approvalErrors } from "./approval-errors";
import { dataverseErrors } from "./dataverse-errors";
import { flowErrorsOne } from "./flow-errors-1";
import { flowErrorsTwo } from "./flow-errors-2";
import { solutionErrors } from "./solution-errors";
import type { ErrorPage, ErrorProduct } from "./types";

export type { ErrorPage, ErrorProduct } from "./types";
export { errorSections } from "./types";

export const errorPages: ErrorPage[] = [...flowErrorsOne, ...flowErrorsTwo, ...approvalErrors, ...dataverseErrors, ...appErrors, ...solutionErrors];

export const errorProducts: ErrorProduct[] = ["Power Automate", "Power Apps", "Solution import"];

export const errorPath = (page: Pick<ErrorPage, "slug">) => `/errors/${page.slug}`;

export function getErrorBySlug(slug: string) {
  return errorPages.find((page) => page.slug === slug);
}

export function getErrorsByProduct(product: ErrorProduct) {
  return errorPages.filter((page) => page.product === product);
}

/** Error pages that name this tool in relatedTools. Shown on the tool's own page. */
export function getErrorsForTool(toolSlug: string) {
  return errorPages.filter((page) => page.relatedTools.includes(toolSlug));
}
