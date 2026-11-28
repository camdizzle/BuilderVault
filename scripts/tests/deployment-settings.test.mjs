import assert from "node:assert/strict";
import test from "node:test";
import { buildSettings, cleanConnectionId, connectorId, pacCommands, parseSettings, settingsFileName, settingsWarnings } from "../../lib/tools/deployment-settings.ts";

const input = {
  environments: ["Test", "Production"],
  envVars: [{ schemaName: "contoso_SiteUrl", values: ["https://contoso.sharepoint.com/sites/test", "https://contoso.sharepoint.com/sites/prod"] }],
  connRefs: [{ logicalName: "contoso_SharePoint", connector: "shared_sharepointonline", connectionIds: ["ef3d1cbb2c3b4e7987e02486584689d3", "4445162937b84457a3465d2f0c2cab7e"] }]
};

test("buildSettings writes Microsoft's file shape for each environment", () => {
  const test0 = JSON.parse(buildSettings(input, 0));
  assert.deepEqual(test0, {
    EnvironmentVariables: [{ SchemaName: "contoso_SiteUrl", Value: "https://contoso.sharepoint.com/sites/test" }],
    ConnectionReferences: [{ LogicalName: "contoso_SharePoint", ConnectionId: "ef3d1cbb2c3b4e7987e02486584689d3", ConnectorId: "/providers/Microsoft.PowerApps/apis/shared_sharepointonline" }]
  });
  const prod = JSON.parse(buildSettings(input, 1));
  assert.equal(prod.ConnectionReferences[0].ConnectionId, "4445162937b84457a3465d2f0c2cab7e");
  assert.deepEqual(settingsWarnings(input), []);
});

test("connector ids and pasted connection addresses are cleaned up", () => {
  assert.equal(connectorId("shared_teams"), "/providers/Microsoft.PowerApps/apis/shared_teams");
  assert.equal(connectorId("/providers/Microsoft.PowerApps/apis/shared_github"), "/providers/Microsoft.PowerApps/apis/shared_github");
  assert.equal(cleanConnectionId(" https://make.powerapps.com/environments/abc/connections/shared_sharepointonline/ef3d1cbb2c3b/details "), "ef3d1cbb2c3b");
  assert.equal(cleanConnectionId(" 123abc "), "123abc");
  assert.equal(settingsFileName("User acceptance"), "deploymentSettings.Useracceptance.json");
});

test("parseSettings reads a pac create-settings file", () => {
  const file = JSON.stringify({
    EnvironmentVariables: [{ SchemaName: "tst_Deployment_env", Value: "" }],
    ConnectionReferences: [{ LogicalName: "tst_GHConn", ConnectionId: "", ConnectorId: "/providers/Microsoft.PowerApps/apis/shared_github" }]
  });
  const parsed = parseSettings(file, 2);
  assert.equal(parsed.error, undefined);
  assert.deepEqual(parsed.envVars, [{ schemaName: "tst_Deployment_env", values: ["", ""] }]);
  assert.deepEqual(parsed.connRefs, [{ logicalName: "tst_GHConn", connector: "shared_github", connectionIds: ["", ""] }]);
  assert.match(parseSettings("{", 2).error, /valid JSON/);
  assert.match(parseSettings("{}", 2).error, /No EnvironmentVariables/);
});

test("settingsWarnings flags missing values, display names and duplicates", () => {
  const warnings = settingsWarnings({
    environments: ["Test", "Production"],
    envVars: [{ schemaName: "Site Url", values: ["x", ""] }, { schemaName: "SiteUrl", values: ["x", "y"] }],
    connRefs: [
      { logicalName: "contoso_Teams", connector: "", connectionIds: ["has a space", ""] },
      { logicalName: "contoso_Teams", connector: "shared_teams", connectionIds: ["a", "b"] }
    ]
  });
  const text = warnings.join("\n");
  assert.match(text, /contoso_Teams is listed more than once/);
  assert.match(text, /Site Url has a space/);
  assert.match(text, /SiteUrl has no publisher prefix/);
  assert.match(text, /Site Url has no value for Production/);
  assert.match(text, /contoso_Teams needs a connector/);
  assert.match(text, /no connection ID for Production/);
  assert.match(text, /doesn't look like an ID/);
});

test("pacCommands names the zip and the settings file", () => {
  const commands = pacCommands("Requests_1_0_0_2_managed.zip", "Test");
  assert.match(commands, /pac solution create-settings --solution-zip \.\/Requests_1_0_0_2_managed\.zip --settings-file \.\/deploymentSettings\.Test\.json/);
  assert.match(commands, /pac solution import --path \.\/Requests_1_0_0_2_managed\.zip --settings-file \.\/deploymentSettings\.Test\.json/);
});
