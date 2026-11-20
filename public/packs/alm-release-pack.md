# Power Platform Release Pack

From BuilderVault (buildervault.camwow.tv). Free to use and share inside your team.

Use this pack each time you move a solution from development to test and production. Build a checklist that fits your release with the free Solution Layering Checklist Generator: https://buildervault.camwow.tv/tools/solution-layering-checklist-generator

---

## 1. Release checklist

### Before export (Dev)

- [ ] All work is in one unmanaged solution with your own publisher.
- [ ] Apps and flows were created inside the solution.
- [ ] Every flow connection uses a connection reference.
- [ ] Every value that differs by environment is an environment variable.
- [ ] Environment variable current values are removed from the solution.
- [ ] No hard-coded URLs, GUIDs or email addresses.
- [ ] Only needed table components are included.
- [ ] Solution checker shows no critical or high issues.
- [ ] App checker shows no errors.
- [ ] Version number increased.
- [ ] All customizations published.

### Export

- [ ] Exported as managed.
- [ ] Unmanaged copy kept as a backup of Dev, or unpacked to source control.
- [ ] Release notes written.

### Test

- [ ] Managed solution imported with Upgrade.
- [ ] Connection references set to test connections owned by the service account.
- [ ] Environment variables set for Test.
- [ ] Flows turned on.
- [ ] Apps shared and security roles assigned to test groups.
- [ ] Reference data loaded.
- [ ] Smoke test passed as a non-admin user, for each role.
- [ ] User acceptance scenarios passed and signed off against this version.
- [ ] Every manual step noted for the production plan.

### Production

- [ ] Change approved. Users told the release window.
- [ ] Environment backup taken.
- [ ] Previous managed version kept for rollback.
- [ ] The same file that passed Test is imported.
- [ ] Connection references and environment variables set for Production.
- [ ] Flows turned on. Owners confirmed.
- [ ] Apps shared with production groups.
- [ ] Data steps run.

### After

- [ ] Smoke test passed in Production as a normal user.
- [ ] First real flow runs checked.
- [ ] No unmanaged layer sits above the solution on key components.
- [ ] Release recorded. Support guide updated.

---

## 2. Release notes template

```
Solution:            Version:            Date:            Deployed by:

Summary (two sentences a business owner can read):

Changes
  New:
  Changed:
  Fixed:
  Removed:

Components touched (apps, flows, tables, roles):

Environment variables added or changed:
  Name | Purpose | Test value | Production value

Connection references added:
  Name | Connector | Account

Manual steps before import:
Manual steps after import:
Data changes:

Testing
  Smoke test by:            UAT signed off by:            Date:

Rollback plan:
Known issues:
```

---

## 3. Environment variable register

| Display name | Schema name | Type | Dev | Test | Production | Used by | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Request Hub Site URL | cnt_RequestHubSiteUrl | Data source | | | | App, approval flow | |
| Support Email | cnt_SupportEmail | Text | | | | Notification flows | |

Rules: leave the default empty for values that must be set per environment. Store secrets in Azure Key Vault and reference them with a Secret variable.

---

## 4. Connection reference register

| Name | Connector | Purpose | Account in Production | Who can repair it |
| --- | --- | --- | --- | --- |
| cnt_cr_SharePoint_RequestHub | SharePoint | Request Hub site | svc-requesthub | Platform team |
| cnt_cr_Outlook_Notifications | Office 365 Outlook | Shared mailbox | svc-requesthub | Platform team |

One reference per connector and purpose, shared by every flow that should use the same account.

---

## 5. Commands

```
pac auth create --environment https://contoso-dev.crm.dynamics.com

pac solution export --name RequestHub --path ./out/RequestHub_managed.zip --managed
pac solution export --name RequestHub --path ./out/RequestHub.zip
pac solution unpack --zipfile ./out/RequestHub.zip --folder ./src/RequestHub --packagetype Both

pac solution check --path ./out/RequestHub_managed.zip

pac solution create-settings --solution-zip ./out/RequestHub_managed.zip --settings-file ./settings/prod.json

pac auth create --environment https://contoso.crm.dynamics.com
pac solution import --path ./out/RequestHub_managed.zip --settings-file ./settings/prod.json --stage-and-upgrade
```

Deployment settings file:

```
{
  "EnvironmentVariables": [
    { "SchemaName": "cnt_SupportEmail", "Value": "support@contoso.com" }
  ],
  "ConnectionReferences": [
    {
      "LogicalName": "cnt_cr_SharePoint_RequestHub",
      "ConnectionId": "<connection id from the target environment>",
      "ConnectorId": "/providers/Microsoft.PowerApps/apis/shared_sharepointonline"
    }
  ]
}
```

---

## 6. Smoke test script

| Step | Expected | Pass |
| --- | --- | --- |
| Open the app as a normal user | Home screen loads, no permission error | |
| Create a record with all required fields | Saved, confirmation shown | |
| Edit and save the record | Change is kept | |
| Trigger the main flow | Run succeeds, notification arrives | |
| Complete an approval | Status updates, requester is told | |
| Open the app as a second role | Sees only what that role should | |
| Check flow run history | No failed runs since import | |

---

## 7. Rollback plan

```
Trigger for rollback (what counts as a failed release):
Decision maker:
Option A: import the previous managed version (location: )
Option B: restore the environment backup taken at (time: )   Note: loses data entered since the backup
Data changes to reverse:
Who tells users:
Time needed:
```

---

## 8. When a deployed change does not appear

1. Open the managed solution and select the component.
2. Choose Advanced, then See solution layers.
3. An Active layer at the top is an unmanaged change made directly in that environment.
4. Copy anything worth keeping back to Dev.
5. Select the Active layer and choose Remove active customizations.
6. Publish and check again.

---

More patterns, tools and examples: https://buildervault.camwow.tv
