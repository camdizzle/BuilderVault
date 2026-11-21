import { commonErrorsGuide, delegationWarningGuide, formatFormulasGuide, missingBracketGuide } from "./formatter-guides-1";
import { excelUsersGuide, nestedIfGuide, separatorsGuide, slowFormulasGuide } from "./formatter-guides-2";
import { dataverseFilterRowsGuide, filterByDateGuide, getItemsFilterQueryGuide, triggerConditionsGuide, whereToFilterGuide } from "./flow-guides-1";
import { complexColumnsGuide, expressionsExplainedGuide, internalNamesGuide, parseJsonGuide, troubleshootFailedRunGuide } from "./flow-guides-2";
import type { Guide } from "./types";

export type { Guide, GuideBlock, GuideLink, GuideSection } from "./types";

export const guides: Guide[] = [
  commonErrorsGuide,
  missingBracketGuide,
  delegationWarningGuide,
  formatFormulasGuide,
  slowFormulasGuide,
  separatorsGuide,
  nestedIfGuide,
  excelUsersGuide,
  getItemsFilterQueryGuide,
  filterByDateGuide,
  dataverseFilterRowsGuide,
  whereToFilterGuide,
  triggerConditionsGuide,
  parseJsonGuide,
  expressionsExplainedGuide,
  internalNamesGuide,
  complexColumnsGuide,
  troubleshootFailedRunGuide
];

export const guidePath = (guide: Pick<Guide, "slug">) => `/guides/${guide.slug}`;

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

/** Guides that name this tool in relatedTools. Shown on the tool's own page. */
export function getGuidesForTool(toolSlug: string) {
  return guides.filter((guide) => guide.relatedTools.includes(toolSlug));
}
