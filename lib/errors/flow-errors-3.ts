import { learnDoc, note, ol, p, table, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Power Automate" as const, published: "2026-11-21", updated: "2026-11-21" };

const flowIntegrationDoc = learnDoc("troubleshoot/power-platform/power-apps/connections/best-practices-when-updating-a-flow", "Troubleshoot Power Apps flow integration errors");
const excelTableDoc = learnDoc("troubleshoot/power-platform/power-automate/flow-creation/unable-to-find-excel-online-table-in-microsoft-flow", "Can't find Excel Online table in Power Automate");
const excelConnectorDoc = learnDoc("connectors/excelonlinebusiness", "Excel Online (Business) connector reference");

const connectionProperty: ErrorPage = {
  ...base,
  slug: "flow-connection-property-doesnt-exist-available-properties",
  message: "Unable to process template language expressions in action 'Send_an_email' inputs at line '1' and column '1899': 'The template language expression 'json(decodeBase64(triggerOutputs().headers['X-MS-APIM-Tokens']))['$connections']['shared_office365']['connectionId']' cannot be evaluated because property 'shared_office365' doesn't exist, available properties are 'shared_flowpush'.",
  title: "Fix \"property 'shared_...' doesn't exist\" in a flow called from Power Apps",
  shortTitle: "X-MS-APIM-Tokens: property 'shared_...' doesn't exist",
  description: "Why a flow run from Power Apps fails with X-MS-APIM-Tokens and property 'shared_office365' doesn't exist after you add or change a connection, and how to fix the app.",
  keywords: ["X-MS-APIM-Tokens", "property 'shared_office365' doesn't exist", "available properties are 'shared_flowpush'", "flow fails from Power Apps after adding action", "Power Apps flow connection error"],
  quickAnswer: "You added an action from a new connector to a flow that Power Apps calls, or changed one of its connections, and the app still sends the old set of connections. The flow looks for the new connection among the ones the app passed and doesn't find it. In Power Apps Studio, remove the flow from the app and add it again, then save and publish.",
  variants: [
    "cannot be evaluated because property 'shared_sharepointonline' doesn't exist",
    "triggerOutputs().headers['X-MS-APIM-Tokens']",
    "The template language expression 'triggerBody()['Sendmeamobilenotification_Text']' cannot be evaluated because property 'Sendmeamobilenotification_Text' cannot be selected."
  ],
  meaning: [
    p("When Power Apps runs a flow, it passes the flow the connections to use in a request header named `X-MS-APIM-Tokens`. Each connector in the flow reads its connection from that header by name, such as `shared_office365` for Outlook."),
    p("The error says the flow asked for one connector's connection and the header only had others. The list after available properties shows what the app actually sent."),
    note("The third variant above is the same problem with an input instead of a connection: a new **Ask in Power Apps** input was added, and the app doesn't send it yet.")
  ],
  causes: [
    ol(
      "An action from a connector the flow didn't use before was added, for example the first Outlook or SharePoint action.",
      "An existing action was switched to a different connection.",
      "A new input was added to the Power Apps trigger.",
      "An output was removed from **Respond to a PowerApp or flow**. That doesn't fail the run, but the app reads the missing value as blank."
    )
  ],
  fixes: [
    p("**Update the app's copy of the flow.**"),
    ol(
      "Open the app in Power Apps Studio and select **Power Automate** on the app authoring menu.",
      "Select **...** to the right of the flow, then **Remove from app**.",
      "Select **Add a flow** and add the same flow again.",
      "Update the formula that calls `Run` if the inputs changed.",
      "Save and publish."
    ),
    p("**If the app is live,** Microsoft recommends a safer order: save a copy of the flow with **Save As**, make the change in the copy, point the app at the copy, publish, and turn the original off once everyone has the new version.")
  ],
  prevention: [
    table(
      ["Change to the flow", "Breaks apps that call it?"],
      ["Adding an Ask in Power Apps input", "Yes"],
      ["Adding a connector the flow didn't use", "Yes"],
      ["Changing an existing connection", "Yes"],
      ["Removing an output from the Respond action", "The app gets blank for that value"],
      ["Changing actions that use the same connections", "No"]
    ),
    ul("After any change in the first four rows, remove and add the flow in every app that calls it.")
  ],
  faqs: [
    { question: "What is X-MS-APIM-Tokens in a flow error?", answer: "It is the request header Power Apps uses to pass connections to a flow. An error that mentions it means the flow wanted a connection the app didn't pass." },
    { question: "Why did my flow break when I only added one action?", answer: "If that action uses a connector the flow didn't use before, the flow now needs a connection the app doesn't know about. Remove the flow from the app and add it again." }
  ],
  relatedTools: [],
  relatedPatterns: ["respond-to-power-app-return-values-from-flow"],
  relatedLinks: [{ href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" }],
  relatedErrors: ["invokerconnectionoverridefailed-power-apps-flow", "missingconnectionreference-connection-reference-was-not-given-by-invoker", "property-cannot-be-selected-power-automate", "invalidtemplate-unable-to-process-template-language-expressions"],
  sources: [flowIntegrationDoc]
};

const excelNoTable: ErrorPage = {
  ...base,
  slug: "excel-error-executing-the-api-no-table",
  message: "Error executing the api",
  title: "Fix \"Error executing the api\" when Excel has no table in Power Automate",
  shortTitle: "Excel: Error executing the api, or no table to pick",
  description: "Why the Excel Online (Business) actions show no tables, or fail with an error that starts Error executing the api, and how to format the data as a table.",
  keywords: ["Error executing the api Excel", "Power Automate Excel no table", "Excel table not showing Power Automate", "List rows present in a table no table", "Excel Online table dropdown empty"],
  quickAnswer: "The Excel actions in Power Automate only work with data formatted as an Excel table, not a plain range of cells. If the Table box shows nothing, or a typed table name fails with an error that begins Error executing the api, open the workbook, select the data, and use Insert > Table. Then pick the table from the list.",
  variants: [],
  meaning: [
    p("**List rows present in a table**, **Add a row into a table** and most other Excel Online (Business) actions read and write named tables. A sheet of cells with headings looks like a table but isn't one until it is formatted as a table."),
    p("Microsoft notes that typing a table name that doesn't exist, or leaving the Table box empty, produces an error that begins **Error executing the api**.")
  ],
  causes: [
    ol(
      "The data isn't formatted as a table.",
      "A table name was typed by hand and doesn't match, or the table was renamed.",
      "The Table box was left empty, or filled from dynamic content that was blank for this run."
    )
  ],
  fixes: [
    ol(
      "Open the workbook in Excel.",
      "Select any cell in the data, then **Insert** > **Table**, and confirm that the first row has headers.",
      "Optionally rename the table on the **Table Design** tab so it is easy to find.",
      "In the flow, select the Table box again and pick the table from the list."
    ),
    note("If the flow picks the file or table from dynamic content, check the failed run's inputs to see the exact name that was sent.")
  ],
  prevention: [
    ul("Give every table a clear name, and don't rename it once flows use it.", "Keep files that flows use in a fixed location, so the file picker still finds them.")
  ],
  faqs: [
    { question: "Why doesn't Power Automate show my Excel table?", answer: "The data is probably a plain range of cells. Format it as a table in Excel with Insert, Table, and it appears in the list." },
    { question: "Can Power Automate read Excel data that isn't a table?", answer: "The standard Excel Online (Business) actions need a table. An Office Script run from the flow can read a range, but formatting the data as a table is simpler." }
  ],
  relatedTools: [],
  relatedPatterns: ["excel-list-rows-large-table-filter-power-automate", "office-scripts-run-script-excel-power-automate", "excel-date-serial-number-power-automate"],
  relatedLinks: [{ href: "/guides/power-automate-excel-quick-start", label: "Excel connector quick start" }],
  relatedErrors: ["file-is-locked-for-shared-use-power-automate", "429-rate-limit-exceeded-power-automate"],
  sources: [excelTableDoc, excelConnectorDoc]
};

export const flowErrorsThree: ErrorPage[] = [connectionProperty, excelNoTable];
