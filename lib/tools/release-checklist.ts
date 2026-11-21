// Builds a release checklist for a Power Platform solution from what the release contains.

export type ReleaseTarget = "Test" | "Production" | "Training";

export type ReleaseContents = {
  canvasApps: boolean;
  modelDrivenApps: boolean;
  cloudFlows: boolean;
  dataverse: boolean;
  plugins: boolean;
  powerPages: boolean;
  environmentVariables: boolean;
  connectionReferences: boolean;
};

export const releaseContentLabels: Record<keyof ReleaseContents, string> = {
  canvasApps: "Canvas apps",
  modelDrivenApps: "Model-driven apps",
  cloudFlows: "Cloud flows",
  dataverse: "Dataverse tables",
  plugins: "Plug-ins",
  powerPages: "Power Pages site",
  environmentVariables: "Environment variables",
  connectionReferences: "Connection references"
};

type Section = { title: string; items: string[] };

export function buildReleaseChecklist(target: ReleaseTarget, contents: ReleaseContents): Section[] {
  const before: string[] = [
    "Export the solution from development as managed, with a new version number",
    "Keep the unmanaged export in source control as the source of truth",
    "Check the solution includes every changed component and its required dependencies",
    `Check the ${target} environment for unmanaged layers on the components you are changing (Solution layers on each component). Remove active customizations, or the import won't take effect over them.`
  ];
  if (contents.environmentVariables) before.push(`Prepare the ${target} value for each environment variable, in a deployment settings file or ready to enter on import`);
  if (contents.connectionReferences) before.push(`Make sure the ${target} connections exist and are owned by a service account, not a person`);
  if (contents.plugins) before.push("Confirm plug-in assemblies and steps are registered in the solution, not only in development");
  if (target === "Production") before.push("Agree a release window and tell users", "Write down how to roll back: the previous managed version and where it is stored");

  const during: string[] = [`Import the managed solution into ${target}, as an upgrade if an earlier version is already installed`];
  if (contents.environmentVariables) during.push("Enter or confirm environment variable values");
  if (contents.connectionReferences) during.push("Bind each connection reference to a connection in the target environment");

  const after: string[] = ["Check the import history for warnings", "Check that no component has a new unmanaged layer"];
  if (contents.cloudFlows) after.push("Turn on cloud flows that are off after import", "Run each important flow once and check the run history", "Check flow ownership and the run-only users of manually triggered flows");
  if (contents.canvasApps) after.push("Share canvas apps with the right users or security groups", "Open each app as a non-admin user and test the main screens");
  if (contents.modelDrivenApps) after.push("Assign security roles to the model-driven app", "Open the app as a non-admin user and check forms, views and the site map");
  if (contents.dataverse) after.push("Test security roles with a real user of each persona", "Check new columns, relationships and choice values arrived");
  if (contents.plugins) after.push("Test a create and an update that fire each plug-in step, and check the plug-in trace log");
  if (contents.powerPages) after.push("Sync and check table permissions and web roles on the site", "Test the site signed out and signed in as an external user");

  return [
    { title: "Before import", items: before },
    { title: "Import", items: during },
    { title: "After import", items: after }
  ];
}

export function checklistText(target: ReleaseTarget, sections: Section[]) {
  return [`${target} release checklist`, ...sections.flatMap((section) => ["", section.title, ...section.items.map((item) => `- [ ] ${item}`)])].join("\n");
}
