import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = process.cwd();
const sourcePath = path.join(root, "lib", "pmo-toolkit.ts");
const outputDir = path.join(root, "public", "pmo-guides");

const source = fs.readFileSync(sourcePath, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020
  }
}).outputText;

const sandbox = {
  exports: {},
  module: { exports: {} },
  require,
  console
};
sandbox.exports = sandbox.module.exports;

vm.runInNewContext(transpiled, sandbox, { filename: sourcePath });
const toolkit = sandbox.module.exports;

const deploymentChecklist = [
  "Create development, test, and production environments or sites before build-out.",
  "Create publisher prefix, solution shell, environment variables, and connection references first.",
  "Build tables and choices before apps and flows.",
  "Import sample template rows, then test with non-admin users.",
  "Run approval, rejection, revision, escalation, and overdue scenarios before release.",
  "Publish Power BI pages after validating relationships, date fields, status definitions, and security trimming.",
  "Document owners, support mailbox, release notes, and rollback steps."
];

function heading(level, text) {
  return `${"#".repeat(level)} ${text}`;
}

function bullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(" | ")} |`)
  ].join("\n");
}

function escapeCell(value) {
  return String(value).replaceAll("\n", "<br>").replaceAll("|", "\\|");
}

function codeBlock(code) {
  return ["```powerfx", code.trim(), "```"].join("\n");
}

function buildGuide(stage) {
  const deepDive = toolkit.getPmoDeepDiveBySlug(stage.slug);
  const tableSpecs = toolkit.getPmoTableSpecsBySlug(stage.slug);
  const screens = toolkit.getPmoScreenBlueprintsBySlug(stage.slug);
  const solutionMap = toolkit.getPmoSolutionMapBySlug(stage.slug);
  const formulas = toolkit.getPmoFormulaSnippetsBySlug(stage.slug);
  const flows = toolkit.getPmoFlowSnippetsBySlug(stage.slug);

  const sections = [
    heading(1, `${stage.title} Implementation Guide`),
    `BuilderVault PMO toolkit guide for ${stage.title.toLowerCase()}.`,
    heading(2, "Outcome"),
    stage.outcome,
    heading(2, "Business Problem"),
    stage.businessProblem,
    heading(2, "Build Checklist"),
    bullets(stage.implementationRoadmap),
    heading(2, "Core Lists Or Tables"),
    bullets(stage.coreLists)
  ];

  if (deepDive) {
    sections.push(heading(2, "Workflow Map"), bullets(deepDive.workflowMap.map((step, index) => `${index + 1}. ${step}`)));
  }

  sections.push(heading(2, "Data Model"));
  for (const spec of tableSpecs) {
    sections.push(
      heading(3, spec.name),
      `Platform: ${spec.platform}`,
      spec.purpose,
      table(
        ["Column", "Type", "Required", "Notes"],
        spec.columns.map((column) => [column.name, column.type, column.required ? "Yes" : "No", column.notes])
      ),
      heading(4, "Relationships"),
      bullets(spec.relationships),
      heading(4, "Indexes"),
      bullets(spec.indexes)
    );
  }

  sections.push(heading(2, "Power Apps Screen Blueprints"));
  for (const screen of screens) {
    sections.push(
      heading(3, screen.name),
      `Persona: ${screen.persona}`,
      screen.purpose,
      heading(4, "Layout"),
      bullets(screen.layout),
      heading(4, "Controls"),
      bullets(screen.controls),
      heading(4, "Formula Notes"),
      bullets(screen.formulas),
      heading(4, "Data Sources"),
      bullets(screen.dataSources)
    );
  }

  sections.push(heading(2, "Power Fx Starter Snippets"));
  for (const formula of formulas) {
    sections.push(
      heading(3, formula.title),
      `Location: ${formula.location}`,
      codeBlock(formula.code),
      heading(4, "Notes"),
      bullets(formula.notes)
    );
  }

  sections.push(heading(2, "Power Automate Recipes"));
  for (const flow of flows) {
    sections.push(
      heading(3, flow.name),
      `Trigger: ${flow.trigger}`,
      heading(4, "Steps"),
      bullets(flow.steps),
      heading(4, "Expressions"),
      bullets(flow.expressions)
    );
  }

  if (solutionMap) {
    sections.push(
      heading(2, "Dataverse Solution Component Map"),
      `Solution name: ${solutionMap.solutionName}`,
      `Publisher prefix: ${solutionMap.publisherPrefix}`,
      heading(3, "Tables"),
      bullets(solutionMap.tables),
      heading(3, "Choices"),
      bullets(solutionMap.choices),
      heading(3, "Apps"),
      bullets(solutionMap.apps),
      heading(3, "Cloud Flows"),
      bullets(solutionMap.flows),
      heading(3, "Security Roles"),
      bullets(solutionMap.securityRoles),
      heading(3, "Environment Variables"),
      bullets(solutionMap.environmentVariables),
      heading(3, "Dashboards"),
      bullets(solutionMap.dashboards)
    );
  }

  sections.push(
    heading(2, "Power BI Reporting Ideas"),
    bullets(stage.powerBi),
    deepDive ? heading(2, "Starter DAX Measures") : "",
    deepDive ? bullets(deepDive.powerBiMeasures) : "",
    heading(2, "Governance Notes"),
    bullets(stage.governanceNotes),
    heading(2, "Deployment Checklist"),
    bullets(deploymentChecklist),
    "---",
    "Generated from the BuilderVault PMO toolkit content."
  );

  return sections.filter(Boolean).join("\n\n") + "\n";
}

function buildMasterRoadmapGuide() {
  const sections = [
    heading(1, "PMO 30/60/90-Day Implementation Roadmap"),
    "A practical BuilderVault rollout plan for PMO teams that want to build their own Microsoft 365 and Power Platform PMO system before investing in a large enterprise PMO platform.",
    heading(2, "Rollout Principle"),
    "Build behavior change before building platform weight. The first 90 days should prove that the PMO can capture demand, route decisions, control lifecycle movement, and communicate portfolio health.",
    heading(2, "Recommended Build Sequence"),
    bullets([
      "Start with intake so all new demand is visible.",
      "Add charter approval so approved work has scope, value, sponsor, and owner alignment.",
      "Add stage gates so lifecycle movement is controlled and auditable.",
      "Add RAID and change control so delivery risks, issues, decisions, and changes stop living in meeting notes.",
      "Add communications and reporting so stakeholders see decisions needed, exceptions, and portfolio health."
    ])
  ];

  for (const phase of toolkit.pmoRoadmapPhases) {
    sections.push(
      heading(2, `${phase.phase}: ${phase.timebox}`),
      phase.goal,
      heading(3, "Modules"),
      bullets(phase.modules.map((slug) => {
        const stage = toolkit.getPmoStageBySlug(slug);
        return stage ? `${stage.title}: /pmo/packages/${stage.slug}` : slug;
      })),
      heading(3, "Deliverables"),
      bullets(phase.deliverables),
      heading(3, "Build Activities"),
      bullets(phase.activities),
      heading(3, "Exit Criteria"),
      bullets(phase.exitCriteria),
      heading(3, "Adoption Risks"),
      bullets(phase.adoptionRisks)
    );
  }

  sections.push(heading(2, "Operating Model"));
  for (const item of toolkit.pmoOperatingModel) {
    sections.push(
      heading(3, item.area),
      `Owner: ${item.owner}`,
      `Cadence: ${item.cadence}`,
      bullets(item.responsibilities)
    );
  }

  sections.push(
    heading(2, "Definition Of Done For The 90-Day Build"),
    bullets([
      "New demand has a single submission path and triage queue.",
      "Approved work has a charter, sponsor decision, and initial project record.",
      "Projects move through stages with gate evidence and approval history.",
      "Risks, issues, actions, decisions, escalations, and change requests have owners and due dates.",
      "Executives can see portfolio health, exceptions, decisions needed, and trends without opening raw lists.",
      "The PMO has named owners for triage, sponsor approval, gate governance, RAID/change control, and executive reporting."
    ]),
    "---",
    "Generated from the BuilderVault PMO toolkit content."
  );

  return sections.filter(Boolean).join("\n\n") + "\n";
}
function buildDataDictionaryGuide() {
  const sections = [
    heading(1, "PMO Data Dictionary"),
    "A consolidated technical reference for PMO tables, fields, relationships, indexes, status models, Power BI measures, and Dataverse solution components.",
    heading(2, "Module Data Dictionary")
  ];

  for (const stage of toolkit.pmoLifecycleStages) {
    const deepDive = toolkit.getPmoDeepDiveBySlug(stage.slug);
    const tables = toolkit.getPmoTableSpecsBySlug(stage.slug);
    const solution = toolkit.getPmoSolutionMapBySlug(stage.slug);

    sections.push(heading(2, stage.title), stage.summary);

    if (deepDive) {
      sections.push(
        heading(3, "Status Model"),
        bullets(deepDive.statusModel),
        heading(3, "Power BI Measures"),
        bullets(deepDive.powerBiMeasures)
      );
    }

    if (solution) {
      sections.push(
        heading(3, "Dataverse Components"),
        heading(4, "Tables"),
        bullets(solution.tables),
        heading(4, "Choices"),
        bullets(solution.choices)
      );
    }

    for (const spec of tables) {
      sections.push(
        heading(3, spec.name),
        `Platform: ${spec.platform}`,
        spec.purpose,
        table(
          ["Field", "Type", "Required", "Notes"],
          spec.columns.map((column) => [column.name, column.type, column.required ? "Yes" : "No", column.notes])
        ),
        heading(4, "Relationships"),
        bullets(spec.relationships),
        heading(4, "Recommended Indexes"),
        bullets(spec.indexes)
      );
    }
  }

  sections.push("---", "Generated from the BuilderVault PMO toolkit content.");
  return sections.filter(Boolean).join("\n\n") + "\n";
}
function buildArchitectureBrief() {
  const sections = [
    heading(1, "PMO Solution Architecture Brief"),
    "A technical planning artifact for building the BuilderVault PMO toolkit with Microsoft 365 and Power Platform.",
    heading(2, "Reference Architecture Layers")
  ];

  for (const layer of toolkit.pmoArchitectureLayers) {
    sections.push(
      heading(3, layer.layer),
      layer.purpose,
      heading(4, "Components"),
      bullets(layer.components),
      heading(4, "Design Notes"),
      bullets(layer.designNotes)
    );
  }

  sections.push(
    heading(2, toolkit.pmoArchitectureDecisionGuide.decision),
    heading(3, "Use SharePoint When"),
    bullets(toolkit.pmoArchitectureDecisionGuide.useSharePointWhen),
    heading(3, "Use Dataverse When"),
    bullets(toolkit.pmoArchitectureDecisionGuide.useDataverseWhen),
    heading(2, "Security Roles")
  );

  for (const role of toolkit.pmoArchitectureSecurityRoles) {
    sections.push(
      heading(3, role.role),
      role.access,
      bullets(role.notes)
    );
  }

  sections.push(heading(2, "Environment Path"));
  for (const step of toolkit.pmoArchitectureEnvironmentPath) {
    sections.push(
      heading(3, step.stage),
      step.purpose,
      bullets(step.requiredPractices)
    );
  }

  sections.push(
    heading(2, "Recommended Technical Release Sequence"),
    bullets(toolkit.pmoArchitectureReleasePath.map((step, index) => `${index + 1}. ${step}`)),
    "---",
    "Generated from the BuilderVault PMO toolkit content."
  );

  return sections.filter(Boolean).join("\n\n") + "\n";
}
function buildMockupBrief(mockup) {
  const stage = toolkit.getPmoStageBySlug(mockup.moduleSlug);
  const sections = [
    heading(1, `${mockup.title} Build Brief`),
    `Module: ${stage ? stage.title : mockup.moduleSlug}`,
    `Persona: ${mockup.persona}`,
    heading(2, "Purpose"),
    mockup.purpose,
    heading(2, "Layout Pattern"),
    bullets(mockup.layout),
    heading(2, "Metrics To Show"),
    bullets(mockup.metrics.map((metric) => `${metric.label}: ${metric.value}`)),
    heading(2, "Core Fields"),
    bullets(mockup.fields),
    heading(2, "Queue Examples"),
    table(
      ["Item", "Meta", "Status"],
      mockup.queueItems.map((item) => [item.title, item.meta, item.status])
    ),
    heading(2, "Primary Actions"),
    bullets(mockup.actions),
    heading(2, "Build Notes"),
    bullets(mockup.buildNotes),
    heading(2, "Recommended Build Order"),
    bullets([
      "Create the backing table or list and choices first.",
      "Build the read-only queue view before the edit form.",
      "Add command buttons only after status transitions are clear.",
      "Wire automations for notifications, approvals, and history writes.",
      "Add reporting measures after records have consistent owner, status, and date fields."
    ]),
    "---",
    "Generated from the BuilderVault PMO toolkit content."
  ];

  return sections.filter(Boolean).join("\n\n") + "\n";
}
fs.mkdirSync(outputDir, { recursive: true });

for (const stage of toolkit.pmoLifecycleStages) {
  const filePath = path.join(outputDir, `${stage.slug}-implementation-guide.md`);
  fs.writeFileSync(filePath, buildGuide(stage), "utf8");
  console.log(`Wrote ${path.relative(root, filePath)}`);
}

const roadmapPath = path.join(outputDir, "pmo-30-60-90-master-roadmap.md");
fs.writeFileSync(roadmapPath, buildMasterRoadmapGuide(), "utf8");
console.log(`Wrote ${path.relative(root, roadmapPath)}`);

const architecturePath = path.join(outputDir, "pmo-solution-architecture-brief.md");
fs.writeFileSync(architecturePath, buildArchitectureBrief(), "utf8");
console.log(`Wrote ${path.relative(root, architecturePath)}`);

const dataDictionaryPath = path.join(outputDir, "pmo-data-dictionary.md");
fs.writeFileSync(dataDictionaryPath, buildDataDictionaryGuide(), "utf8");
console.log(`Wrote ${path.relative(root, dataDictionaryPath)}`);

for (const mockup of toolkit.pmoPortalMockups) {
  const filePath = path.join(outputDir, `${mockup.slug}-mockup-brief.md`);
  fs.writeFileSync(filePath, buildMockupBrief(mockup), "utf8");
  console.log(`Wrote ${path.relative(root, filePath)}`);
}
