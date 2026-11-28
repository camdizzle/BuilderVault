import { code, learnDoc, note, ol, p, section, table, tool, ul, type Guide } from "./types";

// Checked against Microsoft's connection reference, environment variable and deployment settings
// pages on the date below. The deployment settings generator (lib/tools/deployment-settings.ts)
// writes the file this guide describes.

const published = "2026-11-28";

export const connectionReferencesEnvironmentVariablesGuide: Guide = {
  slug: "power-platform-connection-references-environment-variables",
  title: "Connection references and environment variables: move apps and flows between environments",
  shortTitle: "Connection references and environment variables",
  description: "What connection references and environment variables are, which one each setting needs, how canvas apps and flows use them differently, how to set them on import by hand or with a deployment settings file, and how to fix flows that are off afterwards.",
  eyebrow: "ALM and deployment",
  keywords: [
    "connection references Power Platform",
    "environment variables Power Platform",
    "connection reference vs environment variable",
    "Power Automate environment variables",
    "SharePoint environment variables canvas app",
    "deployment settings file"
  ],
  published,
  updated: published,
  quickAnswer: "A connection reference says which connection a flow uses, and an environment variable holds a setting such as a SharePoint site, a list, an email address or an API address. Both are solution components, so the app and flow stay the same while each environment supplies its own connections and values. Create them in the solution before you build, leave the current values out of the exported solution, and supply the values for each environment on import, either in the import wizard or in a deployment settings file.",
  sections: [
    section(
      "what-they-are",
      "Three things that sound alike",
      table(
        ["Thing", "What it holds", "Lives in"],
        ["Connection", "The sign-in for one connector, such as your SharePoint account", "One environment. It isn't part of a solution"],
        ["Connection reference", "A pointer to a connection for one connector", "The solution. Each environment points it at its own connection"],
        ["Environment variable", "A value: text, a number, JSON, yes/no, a data source such as a SharePoint site or list, or a secret held in Azure Key Vault", "The solution holds the definition. Each environment has its own value"]
      ),
      p("A connection has no idea which site or list you mean. A SharePoint connection only proves who you are, so a flow that moves from development to production needs both: a connection reference for the sign-in and environment variables for the site and list."),
      p("Environment variables have a **default value** and a **current value**. The current value wins when both exist. Keep the current value out of the solution you export, so each environment can be given its own.")
    ),
    section(
      "which-one",
      "Which one does each setting need?",
      table(
        ["What changes between environments", "Use", "Data type"],
        ["The account a flow's SharePoint, Outlook or Teams actions run as", "Connection reference", "-"],
        ["The SharePoint site and list an app or flow uses", "Two environment variables, one for the site and one for the list", "Data source"],
        ["A support mailbox, a team name, an approval threshold", "Environment variable", "Text, Decimal number or Two options"],
        ["A block of settings read together", "Environment variable", "JSON"],
        ["An API key or password", "Environment variable that reads from Azure Key Vault", "Secret"],
        ["A Dataverse table in the same environment", "Nothing", "-"],
        ["The server and database for SQL Server with SQL authentication", "Connection reference", "-"]
      ),
      p("Dataverse tables don't need a variable, because the app looks for a table with the same name in whichever environment it is in. SQL Server with SQL authentication keeps the server and database inside the connection, so the connection reference covers it. With a Microsoft Entra sign-in to SQL Server, use data source environment variables for the server and the database instead."),
      note("Values are limited to 2,000 characters. For related configuration rows, such as a list of offices with their managers, use a table and move it with the Configuration Migration tool rather than a pile of variables.")
    ),
    section(
      "apps-vs-flows",
      "Canvas apps and flows use them differently",
      p("This is the part that surprises most teams."),
      ul(
        "**Flows** use connection references for every connector. Each action in a solution flow points at a reference, and whoever turns the flow on needs permission to use the connections behind it.",
        "**Canvas apps** only use connection references for connections that are shared with the app, such as SQL Server authentication. For SharePoint, Outlook and most other connectors, each person who opens the app signs in with their own account, so there is no connection to map.",
        "A canvas app picks up a connection reference or a data source variable only when the data source is added. An app built before you set them up keeps its old connection until you remove the data source and add it again."
      ),
      p("For SharePoint in a canvas app, turn on **Settings**, **General**, **Automatically create environment variables when adding data sources** before you add the list. Power Apps then creates a site variable and a list variable for you. To reuse variables you made yourself, add the data source and pick them on the **Advanced** tab."),
      p("A SharePoint list variable stores the list's ID, not its name. The list in each environment must have the same columns with the same internal names, which is easiest when the production site is copied from the development one rather than rebuilt by hand.")
    ),
    section(
      "set-up",
      "Set them up in development",
      ol(
        "Create the solution first and build the app and flows inside it. Flows built outside a solution keep their plain connections when you add them later.",
        "In the solution, choose **New**, **More**, **Connection reference**. Make one per connector and purpose, named for what it does, such as `Requests - SharePoint`, not one per flow and never named after a person.",
        "Choose **New**, **More**, **Environment variable** for each setting. Give each a clear display name and a schema name with your publisher prefix. Don't name one `$authentication` or `$connection`, because flows that use those names can't be saved.",
        "Fill in a default value only if it is safe in every environment. Otherwise leave it empty.",
        "Before you export, open each variable and under **Current Value** choose **...**, **Remove from this solution**. The value stays in development but isn't exported, so the import asks for a new one.",
        "Use **Show dependencies** on a variable to see which apps and flows read it before you change or delete it."
      ),
      p("In a flow, pick the variable from **Dynamic content** in any action or trigger. For a lookup field such as a SharePoint list name, scroll to the bottom of the dropdown, choose **Enter custom value**, then pick the variable."),
      code(`// A Text variable read in a flow expression. The display name and schema name
// both appear, exactly as the dynamic content picker inserts them.
parameters('Support Email (contoso_SupportEmail)')`, "Flow expression")
    ),
    section(
      "import",
      "Supply the values on import",
      p("When you import the solution by hand, the import wizard asks for a connection for each connection reference and a value for each environment variable that has none. Variables that already have a value show where it came from, so check them rather than clicking through. Pipelines in Power Platform show the environment variable values in the same way."),
      p("For an automated import with the Power Platform CLI or Azure DevOps, put the values in a deployment settings file instead:"),
      code(`{
  "EnvironmentVariables": [
    { "SchemaName": "contoso_RequestsSite", "Value": "https://contoso.sharepoint.com/sites/requests" },
    { "SchemaName": "contoso_SupportEmail", "Value": "it-support@contoso.com" }
  ],
  "ConnectionReferences": [
    {
      "LogicalName": "contoso_sharedsharepointonline_requests",
      "ConnectionId": "ef3d1cbb2c3b4e7987e02486584689d3",
      "ConnectorId": "/providers/Microsoft.PowerApps/apis/shared_sharepointonline"
    }
  ]
}`, "deploymentSettings.Production.json"),
      tool("deployment-settings-generator", "Paste the file that pac solution create-settings writes, fill in a column per environment, and download one settings file for each, with checks for missing values and display names used by mistake."),
      code(`pac solution create-settings --solution-zip ./Requests_managed.zip --settings-file ./deploymentSettings.Production.json
pac solution import --path ./Requests_managed.zip --settings-file ./deploymentSettings.Production.json`, "Create the starting file, then import with it"),
      ul(
        "Each environment has its own connections, so a connection ID copied from development won't work in production. Open the connection in the target environment and copy the ID from the address bar.",
        "The import checks that the owner of each connection reference can use the connection it points at. Use connections owned by the account that runs the import, usually a service account, or share them with it first.",
        "A value left empty in the file is imported as empty. It doesn't make the import stop and ask."
      )
    ),
    section(
      "changing-values",
      "Changing a value later",
      ul(
        "Changing a value can take up to an hour to reach running apps and flows.",
        "If you change a value directly in the environment, rather than through a solution import, flows keep using the old value until each flow is saved, or turned off and on again.",
        "In a managed solution the value isn't shown in the solution itself, because the value is an unmanaged record. Open the **Default solution** to see and edit it.",
        "If a value was shipped inside a managed solution, the only way to delete it is to export a new version without the value and import it as an upgrade."
      )
    ),
    section(
      "troubleshooting",
      "When it goes wrong",
      table(
        ["What you see", "Likely cause", "Fix"],
        ["Flows are off after import", "A connection reference has no connection, or the person turning the flow on can't use one of its connections", "Edit the connection reference in the solution and pick a connection, then turn the flow on as the owner of those connections"],
        ["`ConnectionAuthorizationFailed` when turning a flow on", "You don't have permission to at least one of the flow's connections", "Have the connection owner turn the flow on, or share every connection with you"],
        ["A red exclamation mark next to a connection reference", "The connection behind it is broken, often an expired password or a deleted account", "Fix or replace the connection, then edit the reference to use it"],
        ["Production is reading development data", "The current value was exported with the solution", "Remove the current value from the solution, export again, and give production its own value"],
        ["Your variable is missing from the **Advanced** tab", "The picker only reads the first page of matching variables, or a SharePoint site variable has no value", "Give the site variable a value, check that a list variable holds the list's ID, and remove variables nothing uses"],
        ["A custom connector's reference breaks after import", "Canvas apps don't recognize connection references on custom connectors, and custom connectors must be imported first", "Import the custom connector in its own solution first, then remove and add its connection in the app"]
      ),
      p("For the full fix for flows that are off after an import, see [Flows not turned on after solution import](/errors/flows-not-turned-on-after-solution-import-connection-references).")
    )
  ],
  faqs: [
    {
      question: "What is the difference between a connection reference and an environment variable?",
      answer: "A connection reference says which connection, meaning which sign-in, a flow uses for one connector. An environment variable holds a value such as a SharePoint site address, a list, an email address or an API key. A flow that reads a SharePoint list in production usually needs both."
    },
    {
      question: "Do canvas apps use connection references?",
      answer: "Only for connections that are shared with the app, such as SQL Server authentication. For SharePoint, Outlook and most other connectors, each user signs in with their own account, so the app uses data source environment variables for the site and list instead."
    },
    {
      question: "Should the environment variable value be in my solution?",
      answer: "No. Include the definition and leave the current value out, using Remove from this solution before export. Each environment then gets its own value when the solution is imported."
    },
    {
      question: "Why does my flow still use the old environment variable value?",
      answer: "If the value was changed directly in the environment rather than by importing a solution, flows keep the old value until each one is saved, or turned off and on again. Changes can also take up to an hour to reach running apps and flows."
    },
    {
      question: "Do environment variables need a premium license?",
      answer: "No. They need Dataverse in the environment, because solutions do, but using them in apps and flows doesn't need premium connectors."
    }
  ],
  relatedTools: ["deployment-settings-generator", "solution-layering-checklist-generator"],
  relatedPatterns: [
    "connection-references-for-solution-flows",
    "dataverse-environment-variables-canvas-apps-flows",
    "deployment-settings-file-pac-cli",
    "environment-variable-secrets-azure-key-vault"
  ],
  relatedLinks: [
    { href: "/errors/flows-not-turned-on-after-solution-import-connection-references", label: "Error: flows not turned on after solution import" },
    { href: "/errors/connectionauthorizationfailed-power-apps-flow", label: "Error: ConnectionAuthorizationFailed" },
    { href: "/alm/solutions", label: "Solution and deployment patterns" },
    { href: "/guides/hand-over-power-automate-flows-when-someone-leaves", label: "Hand over flows when someone leaves" }
  ],
  sources: [
    learnDoc("power-apps/maker/data-platform/create-connection-reference", "Use a connection reference in a solution"),
    learnDoc("power-apps/maker/data-platform/environmentvariables", "Environment variables overview"),
    learnDoc("power-apps/maker/data-platform/environmentvariables-data-source-canvas-apps", "Use data source environment variables in canvas apps"),
    learnDoc("power-apps/maker/data-platform/environmentvariables-power-automate", "Use environment variables in solution cloud flows"),
    learnDoc("power-platform/alm/conn-ref-env-variables-build-tools", "Pre-populate connection references and environment variables")
  ]
};
