export type ReportStatus = "Green" | "Yellow" | "Red";
export type ReportTone = "concise" | "balanced" | "detailed";
export type ReportAudience = "executive" | "PMO" | "project team" | "client/stakeholder";

export interface StatusReportInput {
  projectName: string;
  reportingPeriod: string;
  projectManager: string;
  sponsor: string;
  overallStatus: ReportStatus;
  scopeStatus: ReportStatus;
  scheduleStatus: ReportStatus;
  budgetStatus: ReportStatus;
  accomplishments: string;
  plannedWork: string;
  risks: string;
  issues: string;
  decisionsNeeded: string;
  actionItems: string;
  milestones: string;
  blockers: string;
  tone: ReportTone;
  audience: ReportAudience;
}
