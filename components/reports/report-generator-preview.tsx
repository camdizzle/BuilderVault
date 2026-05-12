"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { ReportAudience, ReportStatus, ReportTone, StatusReportInput } from "@/types/report";

const initialReport: StatusReportInput = {
  projectName: "SharePoint Intake Modernization",
  reportingPeriod: "Week of May 10, 2026",
  projectManager: "Camdin",
  sponsor: "Operations Leadership",
  overallStatus: "Yellow",
  scopeStatus: "Green",
  scheduleStatus: "Yellow",
  budgetStatus: "Green",
  accomplishments:
    "Completed intake list schema, drafted Power Apps form layout, and reviewed approval lifecycle with PMO stakeholders.",
  plannedWork:
    "Finish dashboard views, validate required fields with request owners, and prepare pilot feedback checklist.",
  risks:
    "Approver routing rules are not finalized. Pilot group availability may delay feedback.",
  issues:
    "No open blocking issues. One list permission question needs SharePoint owner confirmation.",
  decisionsNeeded:
    "Confirm whether department managers or PMO reviewers approve initial submissions.",
  actionItems:
    "SharePoint owner to confirm permission model. PMO lead to approve status choices. Builder to prepare pilot script.",
  milestones:
    "Schema review complete. Pilot readiness target remains next week.",
  blockers: "No technical blockers, but approval ownership needs a decision.",
  tone: "balanced",
  audience: "executive"
};

const statuses: ReportStatus[] = ["Green", "Yellow", "Red"];
const tones: ReportTone[] = ["concise", "balanced", "detailed"];
const audiences: ReportAudience[] = ["executive", "PMO", "project team", "client/stakeholder"];

export function ReportGeneratorPreview() {
  const [report, setReport] = useState<StatusReportInput>(initialReport);
  const [copied, setCopied] = useState(false);
  const [manualEdits, setManualEdits] = useState<Partial<GeneratedReport>>({});
  const [savedReports, setSavedReports] = useState<string[]>(() => readSavedReports());

  const generated = useMemo(() => buildReport(report), [report]);
  const editable = useMemo(() => rebuildPlainText({ ...generated, ...manualEdits }), [generated, manualEdits]);

  function updateField<K extends keyof StatusReportInput>(field: K, value: StatusReportInput[K]) {
    setReport((current) => ({ ...current, [field]: value }));
  }

  async function copyReport() {
    await navigator.clipboard.writeText(editable.plainText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function saveLocalDraft() {
    const nextReports = [
      `${report.projectName || "Untitled project"} - ${report.reportingPeriod}`,
      ...savedReports
    ].slice(0, 5);

    setSavedReports(nextReports);
    window.localStorage.setItem("buildervault.localReports", JSON.stringify(nextReports));
  }

  function downloadMarkdown() {
    const blob = new Blob([editable.plainText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(report.projectName || "status-report")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function applyTemplate(template: "executive" | "pmo" | "client") {
    if (template === "executive") {
      setReport((current) => ({ ...current, audience: "executive", tone: "concise" }));
    } else if (template === "pmo") {
      setReport((current) => ({ ...current, audience: "PMO", tone: "detailed" }));
    } else {
      setReport((current) => ({ ...current, audience: "client/stakeholder", tone: "balanced" }));
    }
  }

  return (
    <div className="split-grid" style={{ alignItems: "start" }}>
      <form className="card" style={{ display: "grid", gap: 16, padding: 22 }}>
        <div className="badge-row">
          <button className="chip-button" onClick={() => applyTemplate("executive")} type="button">
            Executive
          </button>
          <button className="chip-button" onClick={() => applyTemplate("pmo")} type="button">
            PMO
          </button>
          <button className="chip-button" onClick={() => applyTemplate("client")} type="button">
            Client
          </button>
        </div>
        <div className="field">
          <label htmlFor="projectName">Project name</label>
          <input
            id="projectName"
            onChange={(event) => updateField("projectName", event.target.value)}
            value={report.projectName}
          />
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <TextField label="Reporting period" name="reportingPeriod" report={report} updateField={updateField} />
          <TextField label="Project manager" name="projectManager" report={report} updateField={updateField} />
          <TextField label="Sponsor" name="sponsor" report={report} updateField={updateField} />
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
          <SelectField label="Overall" value={report.overallStatus} options={statuses} onChange={(value) => updateField("overallStatus", value as ReportStatus)} />
          <SelectField label="Scope" value={report.scopeStatus} options={statuses} onChange={(value) => updateField("scopeStatus", value as ReportStatus)} />
          <SelectField label="Schedule" value={report.scheduleStatus} options={statuses} onChange={(value) => updateField("scheduleStatus", value as ReportStatus)} />
          <SelectField label="Budget" value={report.budgetStatus} options={statuses} onChange={(value) => updateField("budgetStatus", value as ReportStatus)} />
        </div>
        <TextArea label="Accomplishments this period" name="accomplishments" report={report} updateField={updateField} />
        <TextArea label="Planned work next period" name="plannedWork" report={report} updateField={updateField} />
        <TextArea label="Key risks" name="risks" report={report} updateField={updateField} />
        <TextArea label="Key issues" name="issues" report={report} updateField={updateField} />
        <TextArea label="Decisions needed" name="decisionsNeeded" report={report} updateField={updateField} />
        <TextArea label="Open action items" name="actionItems" report={report} updateField={updateField} />
        <TextArea label="Milestones" name="milestones" report={report} updateField={updateField} />
        <TextArea label="Blockers" name="blockers" report={report} updateField={updateField} />
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <SelectField label="Tone" value={report.tone} options={tones} onChange={(value) => updateField("tone", value as ReportTone)} />
          <SelectField label="Audience" value={report.audience} options={audiences} onChange={(value) => updateField("audience", value as ReportAudience)} />
        </div>
      </form>

      <aside className="report-output">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between" }}>
          <div>
            <h2>{report.projectName || "Untitled project"}</h2>
            <p style={{ margin: "6px 0 0" }}>{report.reportingPeriod}</p>
          </div>
          <button className="button secondary" onClick={copyReport} type="button">
            {copied ? "Copied" : "Copy report"}
          </button>
          <button className="button secondary" onClick={downloadMarkdown} type="button">
            Markdown
          </button>
          <button className="button" onClick={saveLocalDraft} type="button">
            Save local draft
          </button>
          <button className="button secondary" onClick={() => setManualEdits({})} type="button">
            Reset edits
          </button>
        </div>
        <div className="badge-row">
          <StatusPill label={`Overall: ${report.overallStatus}`} status={report.overallStatus} />
          <StatusPill label={`Scope: ${report.scopeStatus}`} status={report.scopeStatus} />
          <StatusPill label={`Schedule: ${report.scheduleStatus}`} status={report.scheduleStatus} />
          <StatusPill label={`Budget: ${report.budgetStatus}`} status={report.budgetStatus} />
        </div>
        <EditableSection
          label="Executive summary"
          onChange={(value) => setManualEdits((current) => ({ ...current, executiveSummary: value }))}
          value={editable.executiveSummary}
        />
        <EditableSection
          label="Weekly status report"
          onChange={(value) => setManualEdits((current) => ({ ...current, weeklyStatus: value }))}
          value={editable.weeklyStatus}
        />
        <EditableSection
          label="Steering committee summary"
          onChange={(value) => setManualEdits((current) => ({ ...current, steeringSummary: value }))}
          value={editable.steeringSummary}
        />
        <EditableSection
          label="Email update"
          onChange={(value) => setManualEdits((current) => ({ ...current, emailUpdate: value }))}
          value={editable.emailUpdate}
        />
        <Section title="Risks, issues, and actions">
          <ul>
            {editable.risksIssuesActions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
        {savedReports.length > 0 ? (
          <Section title="Local draft history">
            <ul>
              {savedReports.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        ) : null}
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
          Local deterministic preview only. No AI service is called, and nothing is saved to a server.
        </p>
      </aside>
    </div>
  );
}

type GeneratedReport = ReturnType<typeof buildReport>;

function EditableSection({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <section className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} onChange={(event) => onChange(event.target.value)} value={value} />
    </section>
  );
}

function rebuildPlainText(report: GeneratedReport): GeneratedReport {
  return {
    ...report,
    plainText: [
      "Executive summary",
      report.executiveSummary,
      "",
      "Weekly status report",
      report.weeklyStatus,
      "",
      "Steering committee summary",
      report.steeringSummary,
      "",
      "Email update",
      report.emailUpdate,
      "",
      "Risks, issues, and actions",
      ...report.risksIssuesActions
    ].join("\n")
  };
}

function TextField({
  label,
  name,
  report,
  updateField
}: {
  label: string;
  name: keyof StatusReportInput;
  report: StatusReportInput;
  updateField: <K extends keyof StatusReportInput>(field: K, value: StatusReportInput[K]) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        onChange={(event) => updateField(name, event.target.value as never)}
        value={String(report[name])}
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  report,
  updateField
}: {
  label: string;
  name: keyof StatusReportInput;
  report: StatusReportInput;
  updateField: <K extends keyof StatusReportInput>(field: K, value: StatusReportInput[K]) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <textarea
        id={name}
        onChange={(event) => updateField(name, event.target.value as never)}
        value={String(report[name])}
      />
    </div>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusPill({ label, status }: { label: string; status: ReportStatus }) {
  return <span className={`status-pill ${status.toLowerCase()}`}>{label}</span>;
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section>
      <h3>{title}</h3>
      {typeof children === "string" ? <p>{children}</p> : children}
    </section>
  );
}

function buildReport(report: StatusReportInput) {
  const projectName = report.projectName || "the project";
  const riskPhrase = report.overallStatus === "Green"
    ? "The project is tracking within expected tolerances."
    : `The project is currently ${report.overallStatus}, with schedule, risk, or decision items requiring active attention.`;
  const toneIntro = report.tone === "concise"
    ? "Briefly:"
    : report.tone === "detailed"
      ? "Detailed update:"
      : "Update:";

  const executiveSummary = `${toneIntro} ${projectName} is ${report.overallStatus} for ${report.reportingPeriod}. ${riskPhrase} Recent progress includes ${clean(report.accomplishments)} Next focus areas are ${clean(report.plannedWork)}`;
  const weeklyStatus = `PM: ${report.projectManager || "Not specified"}. Sponsor: ${report.sponsor || "Not specified"}. Scope is ${report.scopeStatus}, schedule is ${report.scheduleStatus}, and budget is ${report.budgetStatus}. Accomplishments: ${clean(report.accomplishments)} Planned work: ${clean(report.plannedWork)}`;
  const steeringSummary = `For the ${report.audience} audience, the main governance message is that ${projectName} is ${report.overallStatus}. Decisions needed: ${clean(report.decisionsNeeded)} Blockers: ${clean(report.blockers)}`;
  const emailUpdate = `Hello, here is the ${report.reportingPeriod} update for ${projectName}. Overall status is ${report.overallStatus}. This period, ${clean(report.accomplishments)} Next period, ${clean(report.plannedWork)} Decisions or support needed: ${clean(report.decisionsNeeded)}`;
  const risksIssuesActions = [
    `Risks: ${clean(report.risks)}`,
    `Issues: ${clean(report.issues)}`,
    `Actions: ${clean(report.actionItems)}`,
    `Milestones: ${clean(report.milestones)}`
  ];

  return {
    emailUpdate,
    executiveSummary,
    plainText: [
      `Project: ${projectName}`,
      `Reporting period: ${report.reportingPeriod}`,
      `Overall status: ${report.overallStatus}`,
      "",
      "Executive summary",
      executiveSummary,
      "",
      "Weekly status report",
      weeklyStatus,
      "",
      "Steering committee summary",
      steeringSummary,
      "",
      "Email update",
      emailUpdate,
      "",
      "Risks, issues, and actions",
      ...risksIssuesActions
    ].join("\n"),
    risksIssuesActions,
    steeringSummary,
    weeklyStatus
  };
}

function clean(value: string) {
  return value.trim().length > 0 ? value.trim() : "not provided.";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readSavedReports() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem("buildervault.localReports");
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}
