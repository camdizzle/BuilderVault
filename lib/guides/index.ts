import { commonErrorsGuide, delegationWarningGuide, formatFormulasGuide, missingBracketGuide } from "./formatter-guides-1";
import { excelUsersGuide, nestedIfGuide, separatorsGuide, slowFormulasGuide } from "./formatter-guides-2";
import { dataverseFilterRowsGuide, filterByDateGuide, getItemsFilterQueryGuide, triggerConditionsGuide, whereToFilterGuide } from "./flow-guides-1";
import { complexColumnsGuide, expressionsExplainedGuide, internalNamesGuide, parseJsonGuide, troubleshootFailedRunGuide } from "./flow-guides-2";
import { flowLimitsGuide } from "./flow-limits-guide";
import { callFlowFromPowerAppsGuide, scheduleFlowGuide } from "./flow-guides-3";
import { outlookQuickStartGuide, sharePointQuickStartGuide, teamsQuickStartGuide } from "./connector-guides-1";
import { dataverseQuickStartGuide, excelQuickStartGuide, formsQuickStartGuide } from "./connector-guides-2";
import { oneDriveQuickStartGuide, plannerQuickStartGuide } from "./connector-guides-3";
import { approvalsQuickStartGuide, httpQuickStartGuide } from "./connector-guides-4";
import { customConnectorQuickStartGuide, outlookCalendarQuickStartGuide, sqlServerQuickStartGuide } from "./connector-guides-5";
import { flowHandoverGuide } from "./flow-handover-guide";
import { errorHandlingGuide, namedFormulasGuide, saveDataGuide, variablesGuide } from "./powerfx-guides-1";
import { appStartGuide, findRecordsGuide, forAllGuide, textFormatGuide } from "./powerfx-guides-2";
import { sharePointGalleryGuide } from "./powerfx-guides-3";
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
  variablesGuide,
  namedFormulasGuide,
  saveDataGuide,
  errorHandlingGuide,
  findRecordsGuide,
  sharePointGalleryGuide,
  forAllGuide,
  appStartGuide,
  textFormatGuide,
  getItemsFilterQueryGuide,
  filterByDateGuide,
  dataverseFilterRowsGuide,
  whereToFilterGuide,
  triggerConditionsGuide,
  parseJsonGuide,
  expressionsExplainedGuide,
  internalNamesGuide,
  complexColumnsGuide,
  troubleshootFailedRunGuide,
  callFlowFromPowerAppsGuide,
  scheduleFlowGuide,
  flowLimitsGuide,
  flowHandoverGuide,
  sharePointQuickStartGuide,
  outlookQuickStartGuide,
  teamsQuickStartGuide,
  excelQuickStartGuide,
  formsQuickStartGuide,
  dataverseQuickStartGuide,
  oneDriveQuickStartGuide,
  plannerQuickStartGuide,
  approvalsQuickStartGuide,
  httpQuickStartGuide,
  outlookCalendarQuickStartGuide,
  sqlServerQuickStartGuide,
  customConnectorQuickStartGuide
];

export const guidePath = (guide: Pick<Guide, "slug">) => `/guides/${guide.slug}`;

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

/** Guides that name this tool in relatedTools. Shown on the tool's own page. */
export function getGuidesForTool(toolSlug: string) {
  return guides.filter((guide) => guide.relatedTools.includes(toolSlug));
}
