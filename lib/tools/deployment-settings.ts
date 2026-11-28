// Builds the deployment settings file that pac solution import --settings-file and the Power Platform
// Build Tools import task read, so connection references and environment variables are set on import.
// The file shape follows Microsoft's "Pre-populate connection references and environment variables
// for automated deployments" page.

export type EnvVarRow = { schemaName: string; values: string[] };
export type ConnRefRow = { logicalName: string; connector: string; connectionIds: string[] };

export type DeploymentSettingsInput = {
  environments: string[];
  envVars: EnvVarRow[];
  connRefs: ConnRefRow[];
};

export const connectorPrefix = "/providers/Microsoft.PowerApps/apis/";

/** Common connectors, by the API name that ends their ConnectorId. */
export const commonConnectors: Array<{ api: string; label: string }> = [
  { api: "shared_sharepointonline", label: "SharePoint" },
  { api: "shared_commondataserviceforapps", label: "Microsoft Dataverse" },
  { api: "shared_office365", label: "Office 365 Outlook" },
  { api: "shared_office365users", label: "Office 365 Users" },
  { api: "shared_teams", label: "Microsoft Teams" },
  { api: "shared_approvals", label: "Approvals" },
  { api: "shared_onedriveforbusiness", label: "OneDrive for Business" },
  { api: "shared_excelonlinebusiness", label: "Excel Online (Business)" },
  { api: "shared_sql", label: "SQL Server" }
];

/** Turns an API name such as shared_sharepointonline into a full ConnectorId. A full id is kept as it is. */
export function connectorId(connector: string) {
  const value = connector.trim();
  if (!value) return "";
  if (value.startsWith("/providers/")) return value;
  return connectorPrefix + value;
}

/**
 * Pulls the connection ID out of a pasted connection page address, such as
 * .../connections/shared_sharepointonline/1a2b3c.../details. Other text is returned trimmed.
 */
export function cleanConnectionId(value: string) {
  const trimmed = value.trim();
  const match = /\/connections\/[^/]+\/([^/?#]+)/.exec(trimmed);
  return match ? match[1] : trimmed;
}

/** A file name for one environment, such as deploymentSettings.Test.json. */
export function settingsFileName(environment: string) {
  const name = environment.trim().replace(/[^A-Za-z0-9_-]+/g, "");
  return `deploymentSettings${name ? "." + name : ""}.json`;
}

/** The settings file for the environment at this position, as formatted JSON. */
export function buildSettings(input: DeploymentSettingsInput, environmentIndex: number) {
  const settings = {
    EnvironmentVariables: input.envVars
      .filter((row) => row.schemaName.trim())
      .map((row) => ({ SchemaName: row.schemaName.trim(), Value: row.values[environmentIndex] ?? "" })),
    ConnectionReferences: input.connRefs
      .filter((row) => row.logicalName.trim())
      .map((row) => ({
        LogicalName: row.logicalName.trim(),
        ConnectionId: cleanConnectionId(row.connectionIds[environmentIndex] ?? ""),
        ConnectorId: connectorId(row.connector)
      }))
  };
  return JSON.stringify(settings, null, 2);
}

type ParsedSettings = { envVars: EnvVarRow[]; connRefs: ConnRefRow[]; error?: string };

/**
 * Reads a settings file, such as the one pac solution create-settings writes. Values go into the first
 * environment, and the other environments start empty.
 */
export function parseSettings(text: string, environmentCount: number): ParsedSettings {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { envVars: [], connRefs: [], error: "That isn't valid JSON. Paste the whole settings file, from { to }." };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { envVars: [], connRefs: [], error: "Expected an object with EnvironmentVariables and ConnectionReferences." };
  }
  const record = data as Record<string, unknown>;
  const list = (key: string) => (Array.isArray(record[key]) ? (record[key] as unknown[]) : []);
  const text_ = (value: unknown) => (typeof value === "string" ? value : value === undefined || value === null ? "" : String(value));
  const spread = (first: string) => Array.from({ length: Math.max(environmentCount, 1) }, (_, index) => (index === 0 ? first : ""));

  const envVars = list("EnvironmentVariables").flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    return [{ schemaName: text_(row.SchemaName), values: spread(text_(row.Value)) }];
  });
  const connRefs = list("ConnectionReferences").flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const connector = text_(row.ConnectorId);
    return [{
      logicalName: text_(row.LogicalName),
      connector: connector.startsWith(connectorPrefix) ? connector.slice(connectorPrefix.length) : connector,
      connectionIds: spread(text_(row.ConnectionId))
    }];
  });
  if (envVars.length === 0 && connRefs.length === 0) {
    return { envVars, connRefs, error: "No EnvironmentVariables or ConnectionReferences were found in that file." };
  }
  return { envVars, connRefs };
}

/** Things to fix before the files are used. */
export function settingsWarnings(input: DeploymentSettingsInput): string[] {
  const warnings: string[] = [];
  const environments = input.environments.map((name, index) => name.trim() || `environment ${index + 1}`);

  const schemaNames = input.envVars.map((row) => row.schemaName.trim()).filter(Boolean);
  const logicalNames = input.connRefs.map((row) => row.logicalName.trim()).filter(Boolean);
  for (const name of new Set(schemaNames.filter((name, index) => schemaNames.indexOf(name) !== index))) {
    warnings.push(`The environment variable ${name} is listed more than once.`);
  }
  for (const name of new Set(logicalNames.filter((name, index) => logicalNames.indexOf(name) !== index))) {
    warnings.push(`The connection reference ${name} is listed more than once.`);
  }
  for (const name of schemaNames) {
    if (/\s/.test(name)) warnings.push(`${name} has a space in it. Use the schema name, such as contoso_SiteUrl, not the display name.`);
    else if (!name.includes("_")) warnings.push(`${name} has no publisher prefix. Schema names look like contoso_SiteUrl.`);
  }
  for (const name of logicalNames) {
    if (/\s/.test(name)) warnings.push(`${name} has a space in it. Use the connection reference's logical name, not its display name.`);
  }

  input.envVars.forEach((row) => {
    if (!row.schemaName.trim()) return;
    const missing = environments.filter((_, index) => !(row.values[index] ?? "").trim());
    if (missing.length > 0) warnings.push(`${row.schemaName.trim()} has no value for ${missing.join(" and ")}.`);
  });
  input.connRefs.forEach((row) => {
    if (!row.logicalName.trim()) return;
    if (!row.connector.trim()) warnings.push(`${row.logicalName.trim()} needs a connector.`);
    const missing = environments.filter((_, index) => !(row.connectionIds[index] ?? "").trim());
    if (missing.length > 0) warnings.push(`${row.logicalName.trim()} has no connection ID for ${missing.join(" and ")}.`);
    row.connectionIds.forEach((value, index) => {
      const cleaned = cleanConnectionId(value);
      if (cleaned && /[\s/:]/.test(cleaned)) {
        warnings.push(`The connection ID for ${row.logicalName.trim()} in ${environments[index]} doesn't look like an ID. Copy only the ID from the connection's address.`);
      }
    });
  });
  return warnings;
}

/** The pac commands that create a starting file and import with the finished one. */
export function pacCommands(solutionZip: string, environment: string) {
  const zip = solutionZip.trim() || "MySolution_managed.zip";
  const file = settingsFileName(environment);
  return [
    "# Create a starting file from your exported solution",
    `pac solution create-settings --solution-zip ./${zip} --settings-file ./${file}`,
    "",
    "# Import into the environment your pac auth profile points at, using the finished file",
    `pac solution import --path ./${zip} --settings-file ./${file}`
  ].join("\n");
}
