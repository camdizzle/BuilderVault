import { appErrors } from "./app-errors";
import { connectionErrorsOne } from "./connection-errors-1";
import { connectionErrorsTwo } from "./connection-errors-2";
import { approvalErrors } from "./approval-errors";
import { dataverseErrors } from "./dataverse-errors";
import { desktopFlowErrors } from "./desktop-flow-errors";
import { powerPagesErrors } from "./power-pages-errors";
import { flowErrorsOne } from "./flow-errors-1";
import { flowErrorsTwo } from "./flow-errors-2";
import { solutionErrors } from "./solution-errors";
import { appFlowErrors } from "./app-flow-errors";
import { dataverseErrorsTwo } from "./dataverse-errors-2";
import { flowErrorsThree } from "./flow-errors-3";
import type { ErrorPage, ErrorProduct } from "./types";

export type { ErrorPage, ErrorProduct } from "./types";
export { errorSections } from "./types";

export const errorPages: ErrorPage[] = [...flowErrorsOne, ...flowErrorsTwo, ...flowErrorsThree, ...approvalErrors, ...dataverseErrors, ...connectionErrorsOne, ...connectionErrorsTwo, ...appErrors, ...appFlowErrors, ...dataverseErrorsTwo, ...solutionErrors, ...desktopFlowErrors, ...powerPagesErrors];

export const errorProducts: ErrorProduct[] = ["Power Automate", "Connections and sign-in", "Power Apps", "Dataverse", "Solution import", "Desktop flows", "Power Pages"];

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
