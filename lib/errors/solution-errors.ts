import { automateDoc, code, learnDoc, note, ol, p, table, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Solution import" as const, published: "2026-11-20", updated: "2026-11-20" };

const support = (page: string, label: string) => learnDoc(`troubleshoot/power-platform/dataverse/working-with-solutions/${page}`, label);
const importDoc = learnDoc("power-apps/maker/data-platform/import-update-export-solutions", "Import solutions");
const updateDoc = learnDoc("power-apps/maker/data-platform/update-solutions", "Upgrade or update a solution");
const removeDependenciesDoc = learnDoc("power-platform/alm/removing-dependencies", "Removing dependencies overview");
const connectionReferenceDoc = learnDoc("power-apps/maker/data-platform/create-connection-reference", "Use a connection reference in a solution");

const missingDependencies: ErrorPage = {
  ...base,
  slug: "import-failed-due-to-missing-dependencies",
  message: "Import failed due to missing dependencies.",
  title: "Fix \"Import failed due to missing dependencies\" when importing a solution",
  shortTitle: "Import failed due to missing dependencies",
  description: "How to read the missing dependencies list during a solution import, fix each kind of dependency at its source, and stop the same error on the next deployment.",
  keywords: ["Import failed due to missing dependencies", "solution import missing dependencies", "The following solution cannot be imported", "Some dependencies are missing", "MissingDependencies solution.xml"],
  quickAnswer: "The solution uses components that exist in the environment it was exported from and not in the one you are importing into. Select Show dependencies on the import page to see the list, which is grouped into Applications, Managed Solutions and Unmanaged Components. Install or update the applications, import the other managed solutions first, and for unmanaged components go back to the source environment, add them to the solution and export it again.",
  variants: [
    "The following solution cannot be imported: ProjectTracker. Some dependencies are missing.",
    "This solution was exported from an environment with a more recent version of Dataverse than the current environment. This can cause issues with missing dependencies."
  ],
  meaning: [
    p("A solution is a list of components: tables, columns, apps, flows, roles and more. Components refer to each other. A view refers to a column, an app refers to a table, a flow refers to a connection reference. When a solution refers to something it does not contain, that thing is a **dependency**, and it must already exist in the target environment."),
    p("The import checks this before it changes anything. If a dependency is missing, the import stops and nothing is imported, so the target environment is left as it was."),
    p("The last variant above is a warning and not a failure. It tells you that the source environment runs a newer version of Dataverse than the target, which makes missing dependencies more likely.")
  ],
  causes: [
    table(
      ["Group on the Missing dependencies page", "What is missing", "Typical reason"],
      ["Applications", "A Microsoft app, or a newer version of one", "The source environment has an app or update that the target does not"],
      ["Managed Solutions", "Another managed solution", "Your solution builds on a base solution that was not deployed first, or an older version is installed"],
      ["Unmanaged Components", "A component that exists only as a customization in the source", "Someone used an existing table, column or other component and did not add it to the solution"]
    ),
    p("The third group is the most common in everyday work. A maker adds a column to a table from the default solution, uses it in a form inside the project's solution, and never adds the column itself to the solution.")
  ],
  fixes: [
    p("**Open the list.** On the import page, select **Show dependencies**. Expand each group to see the component, its type and the solution it should come from."),
    p("You can also read the list from the file. Unzip the solution, open `solution.xml` and find the `MissingDependencies` element."),
    p("**Applications.** Each entry has an **Install** or **Update** button that opens the Power Platform admin center. A system administrator installs or updates the app there. If you are not an administrator, use **Copy Install Link** or **Copy Update Link** and send it to one. Start the import again when the app is ready."),
    p("**Managed Solutions.** Import the solution named in the list first, in the same version that the source environment has. Then import yours. When several solutions build on each other, always deploy them in the same order."),
    p("**Unmanaged Components.** These have to be fixed in the source environment."),
    ol(
      "In the source environment, open your unmanaged solution.",
      "Select **Add existing** and add each component from the list. For a column, add its table and choose only that column, not every object in the table.",
      "With the solution open, select **Advanced**, then **Add required objects** on the components that were flagged, to pick up anything else they need.",
      "Raise the version number, export the solution again and import the new file."
    ),
    note("Do not create the missing component by hand in the target environment to get the import through. It becomes an unmanaged customization there, with a different ID from the source, and causes harder problems on later imports.")
  ],
  prevention: [
    ul(
      "Create new components from inside the solution, so they are added automatically.",
      "Run **Solution checker** and the dependency check before each export. See [solution checker as a quality gate](/patterns/solution-checker-quality-gate-pac-cli).",
      "Add only the parts of a table that the solution uses. Adding every table object pulls in dependencies you did not intend.",
      "Keep development, test and production on the same apps and versions, and install Microsoft's base apps in each target before a dependent solution.",
      "Deploy through a pipeline, which imports to a test environment first and shows the same error before production does. See [Power Platform pipelines](/patterns/power-platform-pipelines-dev-test-prod)."
    ),
    p("The [missing dependencies pattern](/patterns/solution-missing-dependencies-fix) has a checklist for each component type.")
  ],
  faqs: [
    { question: "What is a dependency in a Power Platform solution?", answer: "It is a component that the solution uses and does not contain, such as a column on a standard table or a table from another solution. It has to exist in the target environment before the solution can be imported." },
    { question: "Does a failed import leave the environment half changed?", answer: "No. The dependency check runs before the import changes anything, so when it fails with missing dependencies the target environment is unchanged." },
    { question: "Where do I see which dependencies are missing?", answer: "Select Show dependencies on the import page. The list is also inside the solution file, in the MissingDependencies element of solution.xml." },
    { question: "Can I create the missing component in the target environment by hand?", answer: "It can get the import through, but it is not recommended. The hand-made component is an unmanaged customization with its own ID, which leads to layering and dependency problems later. Add the component to the solution in the source environment." }
  ],
  relatedTools: [],
  relatedPatterns: ["solution-missing-dependencies-fix", "solution-segmentation-base-and-app-solutions", "solution-checker-quality-gate-pac-cli", "power-platform-pipelines-dev-test-prod"],
  relatedLinks: [],
  relatedErrors: ["solution-cannot-be-deleted-due-to-dependencies", "solution-already-installed-as-managed-solution-unmanaged-mode", "holding-solution-upgrade-exists-cannot-update-solution"],
  sources: [
    support("missing-dependency-on-solution-import", "Missing dependencies error during solution import"),
    support("version-mismatch-on-solution-import", "Environment version mismatch warning during solution import"),
    importDoc
  ]
};

const managedModeMismatch: ErrorPage = {
  ...base,
  slug: "solution-already-installed-as-managed-solution-unmanaged-mode",
  message: "The solution is already installed on this system as a managed solution and the package supplied is attempting to install it in unmanaged mode. Import can only update solutions when the modes match. Uninstall the current solution and try again.",
  title: "Fix \"The solution is already installed on this system as a managed solution\" on import",
  shortTitle: "Solution already installed as managed",
  description: "Why a solution import fails when the installed copy is managed and the file is unmanaged, or the reverse, and how to fix each direction without losing data.",
  keywords: ["The solution is already installed on this system as a managed solution", "attempting to install it in unmanaged mode", "attempting to install it in managed mode", "Import can only update solutions when the modes match", "80048041"],
  quickAnswer: "The environment already has this solution in one mode, managed or unmanaged, and the file you are importing is the other mode. Import can only update a solution with a file of the same mode. In most cases the fix is to export the solution again in the mode that matches the target and import that file. Do not follow the error's advice to uninstall a managed solution until you know what that deletes.",
  variants: [
    "The solution is already installed on this system as an unmanaged solution and the package supplied is attempting to install it in managed mode. Import can only update solutions when the modes match. Uninstall the current solution and try again.",
    "Error code 80048041"
  ],
  meaning: [
    p("Every solution file is exported as **managed** or **unmanaged**. An unmanaged solution is for development: its components can be edited. A managed solution is for test and production: its components are locked and are removed when the solution is uninstalled."),
    p("An environment holds a solution in one mode only. When a file with the same solution name arrives in the other mode, Dataverse refuses it. The message has two forms, one for each direction.")
  ],
  causes: [
    table(
      ["Installed in the target", "File being imported", "How it usually happens"],
      ["Managed", "Unmanaged", "Someone exported unmanaged from development and imported it into test or production by mistake"],
      ["Unmanaged", "Managed", "The solution was first moved to this environment as unmanaged, and the team has now switched to managed deployments"],
      ["Unmanaged", "Managed", "The file is being imported into the development environment the solution was built in"]
    )
  ],
  fixes: [
    p("**Installed as managed, importing unmanaged.** This is nearly always the wrong file."),
    ol(
      "In the source environment, export the solution again and choose **Managed**.",
      "Import that file into the target. It updates the installed solution."
    ),
    p("**Installed as unmanaged, importing managed.** First decide whether the target should hold the managed copy at all."),
    ul(
      "If the target is your development environment, do not import the managed file there. Development keeps the unmanaged solution.",
      "If the target is a test or production environment that was set up with an unmanaged copy, the unmanaged copy has to be converted."
    ),
    p("To convert, the unmanaged solution and its components must be removed before the managed file can be installed. Deleting an unmanaged solution removes only the container and leaves its components in place as unmanaged customizations, so deleting the solution alone is not enough. The components have to be deleted too, and deleting tables deletes their data."),
    ol(
      "Back up the environment in the Power Platform admin center.",
      "Export any data that lives in the solution's custom tables.",
      "Delete the unmanaged solution, then delete its components from the environment, starting with those that depend on others.",
      "Import the managed file.",
      "Import the data back into the new tables."
    ),
    note("Uninstalling a managed solution deletes every component in it and all the data in its tables. Take a backup before any uninstall, and never uninstall in production only to clear this error.")
  ],
  prevention: [
    ul(
      "Keep one rule: unmanaged in development only, managed everywhere else.",
      "Name exported files so the mode is obvious, such as `ProjectTracker_1_2_0_0_managed.zip`. Power Apps adds `_managed` to the file name by default, so keep it.",
      "Deploy with a pipeline or a script that always exports managed, so nobody picks the mode by hand. See [export and import with the CLI](/patterns/export-import-managed-solution-pac-cli).",
      "Set up new test and production environments with the managed file from the first import."
    ),
    p("The [upgrade, update and patch pattern](/patterns/solution-upgrade-update-patch-difference) explains what each import option does once the modes match.")
  ],
  faqs: [
    { question: "What is the difference between a managed and an unmanaged solution?", answer: "An unmanaged solution is editable and is used in development. A managed solution is locked, is used in test and production, and removes its components when it is uninstalled." },
    { question: "Can I convert an unmanaged solution to managed in the same environment?", answer: "Not directly. The unmanaged solution and its components have to be removed before the managed version can be installed, which deletes data in its tables. Back up and export the data first." },
    { question: "Does deleting an unmanaged solution delete its components?", answer: "No. Deleting an unmanaged solution removes only the solution container. The components stay in the environment as unmanaged customizations and have to be deleted separately." },
    { question: "How do I tell whether a solution file is managed?", answer: "The file name normally ends in _managed. To be sure, unzip it and open solution.xml, where the Managed element is 1 for managed and 0 for unmanaged." }
  ],
  relatedTools: [],
  relatedPatterns: ["export-import-managed-solution-pac-cli", "solution-upgrade-update-patch-difference", "managed-properties-lock-solution-components", "production-hotfix-process-managed-solutions"],
  relatedLinks: [],
  relatedErrors: ["import-failed-due-to-missing-dependencies", "holding-solution-upgrade-exists-cannot-update-solution", "solution-cannot-be-deleted-due-to-dependencies"],
  sources: [
    support("the-solution-is-installed-a-managed-one", "\"The solution is already installed on this system as a managed solution\" error"),
    importDoc,
    updateDoc
  ]
};

const pendingUpgrade: ErrorPage = {
  ...base,
  slug: "holding-solution-upgrade-exists-cannot-update-solution",
  message: "Solution manifest import: FAILURE: Holding solution ProjectTracker_Upgrade exists. Cannot update solution.",
  title: "Fix \"Holding solution ..._Upgrade exists. Cannot update solution\" on a solution upgrade",
  shortTitle: "Holding solution _Upgrade exists",
  description: "Why a solution upgrade is blocked by an earlier upgrade that never finished, how to complete or remove the pending upgrade safely, and how to avoid leaving one behind.",
  keywords: ["Holding solution exists. Cannot update solution", "Solution manifest import: FAILURE", "_Upgrade solution pending", "Apply Solution Upgrade", "The imported solution and the existing solution must both be managed for upgrade"],
  quickAnswer: "An earlier upgrade of this solution was staged or failed part of the way, and left a second solution named after yours with _Upgrade on the end. No new upgrade or patch can be imported while it is there. Either finish it, by selecting the base solution and choosing Apply Solution Upgrade, or delete the _Upgrade solution and import your new version again. Deleting it can remove data that arrived in tables the upgrade added.",
  variants: [
    "The imported solution and the existing solution must both be managed for upgrade.",
    "Solution manifest import: FAILURE: Holding solution ..._Upgrade exists. Cannot update solution."
  ],
  meaning: [
    p("A managed solution can be upgraded in two steps. The new version is first imported next to the old one as a **holding solution**, named with the suffix `_Upgrade`. Then the upgrade is **applied**, which removes the old version and anything the new version no longer contains, and renames the holding solution."),
    p("Between those steps both solutions are installed. If the second step never happens, the holding solution stays. The error means you tried to import another version while one is still waiting.")
  ],
  causes: [
    ol(
      "A previous import used **Stage for Upgrade** and nobody applied the upgrade.",
      "A previous upgrade failed while it was being applied, often because a component it tried to delete still had a dependency.",
      "A deployment tool was cancelled or timed out between the import and the apply step.",
      "Two deployments of the same solution ran at the same time."
    )
  ],
  fixes: [
    p("**See what is pending.** In Power Apps, open **Solutions** in the target environment. Look for two entries: your solution and one with the same name ending in `_Upgrade`. Select **See history** to read why the earlier upgrade stopped."),
    p("**Option 1: finish the pending upgrade.** This is the right choice when the pending version is good and you want it."),
    ol(
      "Select the base solution, the one without the suffix.",
      "Select **Apply Solution Upgrade**.",
      "If it fails, read the message. It normally names a component that cannot be deleted because something depends on it. Remove that dependency and apply again.",
      "When it succeeds, import your newer version."
    ),
    p("**Option 2: delete the pending upgrade.** This is the right choice when the pending version is broken or out of date."),
    ol(
      "Take a backup of the environment.",
      "Delete the solution that ends in `_Upgrade`.",
      "Fix the problem in the source environment, raise the version number and export again.",
      "Import the new file."
    ),
    note("Deleting the _Upgrade solution removes the components that only the new version added. If those include tables or columns that have already received data, the data is deleted with them.")
  ],
  prevention: [
    ul(
      "Use the default **Upgrade** option for ordinary deployments. Use **Stage for Upgrade** only when you need both versions installed to migrate data, and apply it the same day.",
      "Do not leave a failed upgrade in place. Microsoft's advice is to delete it straight away, fix the cause in the source, and import again.",
      "Add a check to your deployment that fails early if a solution ending in `_Upgrade` is already installed.",
      "Run one deployment of a solution at a time."
    ),
    p("See the patterns for [upgrade, update and patch](/patterns/solution-upgrade-update-patch-difference) and [deploying with pipelines](/patterns/power-platform-pipelines-dev-test-prod).")
  ],
  faqs: [
    { question: "What is a holding solution?", answer: "It is the new version of a managed solution, installed next to the old version while an upgrade is in progress. Its name is the solution's name with _Upgrade added. It is removed and renamed when the upgrade is applied." },
    { question: "What does Apply Solution Upgrade do?", answer: "It completes a staged upgrade. It uninstalls the old version and any patches, deletes components that the new version no longer includes, and renames the holding solution to the original name." },
    { question: "Is it safe to delete the _Upgrade solution?", answer: "It is safe for components that exist in both versions. Components that only the new version added are removed, along with any data stored in them, so take a backup first." },
    { question: "What is the difference between Upgrade and Stage for Upgrade?", answer: "Upgrade installs the new version and removes the old one in a single step. Stage for Upgrade installs the new version and waits, keeping both installed until you apply the upgrade." }
  ],
  relatedTools: [],
  relatedPatterns: ["solution-upgrade-update-patch-difference", "solution-version-numbering-scheme", "power-platform-pipelines-dev-test-prod", "production-hotfix-process-managed-solutions"],
  relatedLinks: [],
  relatedErrors: ["solution-cannot-be-deleted-due-to-dependencies", "import-failed-due-to-missing-dependencies", "solution-already-installed-as-managed-solution-unmanaged-mode"],
  sources: [
    support("upgrade-fails-pending-upgrade", "Solution upgrade fails due to a previously pending upgrade"),
    updateDoc,
    removeDependenciesDoc
  ]
};

const flowsOffAfterImport: ErrorPage = {
  ...base,
  slug: "flows-not-turned-on-after-solution-import-connection-references",
  message: "The flows in the solution are turned off after the import.",
  title: "Fix flows that are turned off after a solution import",
  shortTitle: "Flows are off after solution import",
  description: "Why cloud flows arrive switched off in the target environment, how connection references and connection ownership decide it, and how to turn the flows on and keep them on in later deployments.",
  keywords: ["flows turned off after solution import", "connection reference not set", "cannot turn on flow after import", "connection references solution import", "flow off after deployment"],
  quickAnswer: "A flow in a solution is turned on by the import only if it was on when it was exported and every connection reference it uses was given a connection during the import. If a connection was skipped, or the person importing does not own or have permission to use a connection, the flow stays off. Open each connection reference in the target environment, select a valid connection, then turn the flow on from its details page.",
  variants: [
    "A flow cannot be turned on after the import.",
    "A connection reference in the solution has no connection.",
    "The flow was on before the update and is now off."
  ],
  meaning: [
    p("A flow in a solution does not store connections. Each action points to a **connection reference**, which is a small solution component that names a connector. The connection reference in turn points to a real **connection** in the environment, and that link is different in each environment."),
    p("During import, Power Apps asks for a connection for each connection reference. Microsoft's documentation describes the rule: the import tries to return each flow to the state it had when exported, and turns it on if it was on and its connection references received connections."),
    p("Whoever imports the solution becomes the owner of the flows and connection references in it.")
  ],
  causes: [
    ol(
      "The flow was off in the source environment when the solution was exported.",
      "The connections step of the import was skipped or left incomplete, so a connection reference has no connection.",
      "The import ran through a script or pipeline with no settings file, so no connections were supplied.",
      "The connections belong to someone other than the person turning the flow on, and were not shared.",
      "The flow already existed in the target and was off. An update does not change the state of an existing flow.",
      "The option to enable plug-in steps and flows was cleared under **Advanced settings** on the import page.",
      "A data loss prevention policy in the target environment blocks the combination of connectors the flow uses."
    )
  ],
  fixes: [
    p("**Give every connection reference a connection.**"),
    ol(
      "In the target environment, open **Solutions** and select **Default Solution**, or open your own solution if it is unmanaged.",
      "Filter the objects to **Connection references**.",
      "Open each one that the flows use and select a connection in the **Connection** box, or create a new one.",
      "Save."
    ),
    p("**Turn the flows on.** Open each flow's details page and select **Turn on**. If it fails, the message names the connection or the connector that is the problem."),
    p("**Sort out who owns the connections.** The person turning a flow on must own every connection it uses, or have permission to use them. The simple arrangement is that one account, ideally a service account, creates the connections, imports the solution and turns the flows on. Where a service principal turns flows on, each connection has to be shared with it with the **Can use** permission."),
    p("**For scripted deployments, supply a settings file.** A deployment settings file lists each connection reference with the ID of the connection to use in the target. The import then sets them without anyone being asked."),
    code(`{
  "EnvironmentVariables": [],
  "ConnectionReferences": [
    {
      "LogicalName": "cr1a2_sharedsharepointonline_4f2a1",
      "ConnectionId": "shared-sharepointonl-00000000-0000-0000-0000-000000000000",
      "ConnectorId": "/providers/Microsoft.PowerApps/apis/shared_sharepointonline"
    }
  ]
}`, "Deployment settings file"),
    p("The [deployment settings file pattern](/patterns/deployment-settings-file-pac-cli) shows how to generate the file and where to find each connection ID."),
    p("**Check data policies.** If a flow turns on in development and is refused in production, ask an administrator whether a data loss prevention policy in production separates the connectors it uses.")
  ],
  prevention: [
    ul(
      "Make sure every flow is on in the source environment before you export.",
      "Use one connection reference per connector in a solution, with a clear name, so the import asks for few connections.",
      "Create the connections in each target environment once, with a service account, and reuse them in every deployment.",
      "Add a step after each deployment that lists flows that are off and turns them on. See [turn on flows after import](/patterns/turn-on-flows-after-solution-import).",
      "Keep solutions small. Microsoft notes that flows are turned off and on again while their solution is being imported, so a smaller solution interrupts fewer flows."
    ),
    p("The [connection references pattern](/patterns/connection-references-for-solution-flows) covers naming and reuse.")
  ],
  faqs: [
    { question: "Why are my flows off after importing a solution?", answer: "Either the flows were off when the solution was exported, or at least one connection reference did not get a connection during the import, or the person importing does not have permission to use a connection. The import only turns on flows that were on and whose connection references are all set." },
    { question: "What is a connection reference?", answer: "It is a solution component that stands between a flow's actions and a connection. The flow points to the connection reference, and each environment points the connection reference to its own connection, so the flow does not need editing after deployment." },
    { question: "Who owns the flows after a solution import?", answer: "The user who performs the import owns the flows, connection references and other components in the solution." },
    { question: "Does importing an update turn my flows off?", answer: "Flows in the solution are turned off and on again during the import. A flow that was already off in the target environment stays off after an update." }
  ],
  relatedTools: ["deployment-settings-generator"],
  relatedPatterns: ["connection-references-for-solution-flows", "turn-on-flows-after-solution-import", "deployment-settings-file-pac-cli", "service-principal-application-user-deployments"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" },
    { href: "/errors/app-not-compliant-data-loss-prevention-policies", label: "Error: App isn't compliant with data loss prevention policies" }
  ],
  relatedErrors: ["approvals-connection-owner-was-not-found-in-graph", "import-failed-due-to-missing-dependencies", "problem-with-the-flows-trigger"],
  sources: [
    automateDoc("import-flow-solution", "Import a solution (Power Automate)"),
    connectionReferenceDoc,
    importDoc
  ]
};

const cannotDelete: ErrorPage = {
  ...base,
  slug: "solution-cannot-be-deleted-due-to-dependencies",
  message: "Solution cannot be deleted due to dependencies from other components in the system.",
  title: "Fix \"Solution cannot be deleted due to dependencies from other components in the system\"",
  shortTitle: "Solution cannot be deleted due to dependencies",
  description: "Why a managed solution will not uninstall, how to read the dependency list, and how to remove unmanaged and managed dependencies in the right order.",
  keywords: ["Solution cannot be deleted due to dependencies from other components in the system", "cannot uninstall solution dependencies", "Show dependencies solution", "cannot delete component required by another component", "remove solution dependencies"],
  quickAnswer: "Something outside the solution uses a component that the uninstall would delete, so Dataverse blocks the uninstall. Select the solution and choose Show dependencies to see each blocked component and what depends on it. Remove the reference from the dependent component, or delete the dependent component, then uninstall again. If the dependent component belongs to another managed solution, that solution has to be updated or uninstalled first.",
  variants: [
    "The uninstall operation will delete the base layer for the component ... The operation cannot continue because there are other managed layers over the base layer."
  ],
  meaning: [
    p("Uninstalling a managed solution deletes its components. Dataverse records which components use which others, and refuses to delete a component while another one still needs it. The component being used is the **required** component. The one using it is the **dependent** component."),
    p("Dependencies block deletion only. They never block an import or an edit. One dependency is enough to stop the whole uninstall, and nothing is removed until all of them are cleared.")
  ],
  causes: [
    ol(
      "An unmanaged customization uses a component of the solution. A view, form, app or flow made directly in the environment refers to one of its columns or tables.",
      "Another managed solution was built on top of this one and uses its components.",
      "A cloud flow, business rule or classic workflow refers to a table or column of the solution.",
      "A model-driven app outside the solution includes one of its tables, forms or views.",
      "Another solution, from a different publisher, has added its own layer over a component that this solution created. This produces the base layer variant above."
    )
  ],
  fixes: [
    p("**List the dependencies.** In **Solutions**, select the solution and choose **Show dependencies**. For a single component, open the solution, select the component, then **Advanced**, **Show dependencies**. Each row shows the required component, the dependent component and the solution the dependent component belongs to."),
    p("**Read the solution column.** It decides the fix."),
    table(
      ["Dependent component's solution", "What it means", "Fix"],
      ["Active", "An unmanaged customization in this environment", "Edit or delete the dependent component here"],
      ["A managed solution's name", "Another managed solution depends on this one", "Change that solution in its source and upgrade it, or uninstall it first"]
    ),
    p("**Unmanaged dependencies.** Open the dependent component from the list and remove the reference: take the column off the form or view, remove the table from the app, or change the flow so it no longer uses the table. If the dependent component is not needed, delete it. Publish the changes."),
    p("**Managed dependencies.** You cannot edit a managed component in the target environment to remove the reference."),
    ol(
      "In the target, use **Solution layers** on the dependent component to find the topmost solution that contains it.",
      "In that solution's source environment, remove the dependent component or the reference inside it.",
      "Export a new version and import it into the target with the **Upgrade** option, so the removed component is deleted there.",
      "Uninstall the original solution."
    ),
    p("If the other solution is not needed at all, uninstall it first. Uninstall solutions in the reverse of the order they were installed."),
    p("**Clear every dependency before you try again.** Work through the whole list in one go, because any one row stops the uninstall."),
    note("Uninstalling a managed solution deletes its tables and all the data in them. Back up the environment and export the data you need before you start removing dependencies.")
  ],
  prevention: [
    ul(
      "Do not customize managed components directly in test or production. Each such change is a dependency waiting to block an uninstall.",
      "Keep a record of which solutions build on which, and of the install order.",
      "Split shared tables into a base solution, with apps and flows in solutions above it. See [base and app solutions](/patterns/solution-segmentation-base-and-app-solutions).",
      "To retire one component, remove it from the solution in development and deploy an upgrade, in place of uninstalling the solution."
    )
  ],
  faqs: [
    { question: "How do I see what is blocking a solution from being deleted?", answer: "Select the solution in the Solutions list and choose Show dependencies. The page lists each component that cannot be deleted, the component that depends on it, and the solution the dependent component belongs to." },
    { question: "What does Active mean in the dependency list?", answer: "Active is the unmanaged layer of the environment. A dependent component in Active is an unmanaged customization made in that environment, which you can edit or delete there." },
    { question: "Can I force a solution to uninstall with dependencies in place?", answer: "No. Dataverse does not delete a component that another component still needs. Every dependency has to be removed first." },
    { question: "Does deleting a managed solution delete data?", answer: "Yes. Uninstalling a managed solution deletes all of its components, including tables and the rows stored in them." }
  ],
  relatedTools: [],
  relatedPatterns: ["solution-segmentation-base-and-app-solutions", "solution-upgrade-update-patch-difference", "managed-properties-lock-solution-components", "solution-missing-dependencies-fix"],
  relatedLinks: [],
  relatedErrors: ["import-failed-due-to-missing-dependencies", "holding-solution-upgrade-exists-cannot-update-solution", "solution-already-installed-as-managed-solution-unmanaged-mode"],
  sources: [
    support("solution-cannot-be-deleted-due-to-dependencies", "\"Solution cannot be deleted due to dependencies from other components\" message"),
    removeDependenciesDoc,
    support("multiple-publisher-shared-component-failure", "Solution upgrade or deletion fails when a shared component has multiple publishers"),
    updateDoc
  ]
};

const columnTypeMismatch: ErrorPage = {
  ...base,
  slug: "solution-import-failed-attribute-is-a-boolean-but-a-picklist-type-was-specified",
  message: "Attribute cr1a2_priority is a Boolean, but a Picklist type was specified.",
  title: "Fix \"Attribute ... is a Boolean, but a Picklist type was specified\" on solution import",
  shortTitle: "Attribute type mismatch on import",
  description: "Why a solution import fails when a column already exists in the target with a different data type, and the supported ways to change a column's type across environments.",
  keywords: ["Attribute is a Boolean, but a Picklist type was specified", "Fields that are not valid were specified for the entity", "The import of solution failed", "80041A06", "change column data type Dataverse solution import"],
  quickAnswer: "The target environment already has a column with the same name as one in the solution, and the two have different data types. A column's data type cannot be changed by an import. Either create a new column with a different name for the new type, or delete the existing column in the target if its data is not needed, then import again.",
  variants: [
    "The import of solution: ProjectTracker failed.",
    "Fields that are not valid were specified for the entity.",
    "Attribute cr1a2_amount is a Money, but a Decimal type was specified.",
    "Error code 80041A06"
  ],
  meaning: [
    p("In Dataverse a column's data type is fixed when the column is created. Yes/No, Choice, Text, Whole number and the others are stored differently, so one cannot be turned into another."),
    p("During import, Dataverse matches columns by name. When it finds a column with the same name and a different type, it stops. The first two variants above are what the import page shows. The message naming the two types is in the log, under **Download Log File**."),
    p("The message uses the older type names. Boolean is a Yes/No column, Picklist is a Choice column, and Attribute means column.")
  ],
  causes: [
    ol(
      "A maker deleted a column in development and made a new one with the same name and a different type. The target still has the old column.",
      "A column with that name was created by hand in the target environment, with a different type from the one in development.",
      "Two development environments each created a column with the same name and different types.",
      "A solution from another team or vendor uses the same publisher prefix and column name for something else."
    ),
    p("The first cause is by far the most common. It works in development because the old column is gone there, and fails in every environment that received the earlier version.")
  ],
  fixes: [
    p("**Find the column.** Select **Download Log File** on the failed import and open the file in Excel. The failed row names the table and the column."),
    p("**Option 1: use a new column name.** This keeps the existing data and is the safer route."),
    ol(
      "In development, create the column again with a different name, such as `cr1a2_prioritylevel`, and the new type.",
      "Update forms, views, flows and formulas to use the new column.",
      "Remove the old column from development if it is still there.",
      "Export and import. The target now has both columns.",
      "If the old values are needed, copy them into the new column in the target with a flow or a dataflow.",
      "Remove the old column from the target with a later upgrade."
    ),
    p("**Option 2: delete the column in the target.** Use this only when the data in that column is not needed."),
    ol(
      "Back up the target environment.",
      "Remove the column from every form, view, chart and flow that uses it in the target. Use **Show dependencies** on the column to find them.",
      "Delete the column. If it is part of a managed solution, it has to be removed by an upgrade of that solution that no longer contains it.",
      "Import the new version."
    ),
    p("For a managed target, option 2 becomes two deployments: one upgrade that removes the old column, then one that adds the new column with the same name. Use the **Upgrade** import option for the first, because **Update** does not delete components."),
    note("Deleting a column deletes every value stored in it, in every row. There is no undo outside a restore of the environment.")
  ],
  prevention: [
    ul(
      "Treat a column's type as permanent once it has left development. To change the type, add a new column with a new name.",
      "Choose Choice over Yes/No when a third option is likely later. It is the change of mind behind most of these errors.",
      "Never create columns by hand in test or production.",
      "Give each team its own publisher prefix so column names cannot collide. See the [publisher prefix standard](/patterns/solution-publisher-prefix-naming-standard)."
    ),
    p("The [status reason pattern](/patterns/dataverse-status-reason-transitions) is one alternative to a custom status column that tends to change type.")
  ],
  faqs: [
    { question: "Can I change the data type of a Dataverse column?", answer: "No. A column's data type is fixed when it is created. To use a different type, create a new column, move the data across if needed, and remove the old column." },
    { question: "Why does the import work in one environment and fail in another?", answer: "The failing environment still has the column with its original type, from an earlier version of the solution. An environment that never had the old column accepts the new one." },
    { question: "What do Boolean and Picklist mean in the error?", answer: "They are the older names of column types. Boolean is a Yes/No column and Picklist is a Choice column. Attribute is the older word for column." },
    { question: "Where is the detailed error for a failed solution import?", answer: "Select Download Log File on the import result. The file opens in Excel and lists each component with its result. Solution history on the Solutions page shows the same details for past imports." }
  ],
  relatedTools: ["dataverse-table-naming-helper"],
  relatedPatterns: ["solution-publisher-prefix-naming-standard", "solution-upgrade-update-patch-difference", "dataverse-choices-combo-box-canvas-app", "developer-environments-per-maker-branching"],
  relatedLinks: [],
  relatedErrors: ["import-failed-due-to-missing-dependencies", "solution-cannot-be-deleted-due-to-dependencies", "could-not-find-a-property-named-dataverse"],
  sources: [
    support("the-import-of-solution-failed-error-when-importing-solution", "\"The import of solution failed\" error"),
    support("troubleshoot-solution-import-errors-in-dynamics-365", "Resources to help troubleshoot solution import errors"),
    updateDoc,
    importDoc
  ]
};

export const solutionErrors: ErrorPage[] = [
  missingDependencies,
  managedModeMismatch,
  pendingUpgrade,
  flowsOffAfterImport,
  cannotDelete,
  columnTypeMismatch
];
