import { automateDoc, code, learnDoc, ol, p, table, tool, ul } from "../guides/types";
import type { ErrorPage } from "./types";

const base = { product: "Power Automate" as const, published: "2026-11-20", updated: "2026-11-20" };

const functionsDoc = learnDoc("azure/logic-apps/workflow-definition-language-functions-reference", "Reference guide to workflow expression functions");
const nullFieldsDoc = learnDoc("troubleshoot/power-platform/power-automate/flow-run-issues/getting-errors-null-fields", "Errors and unexpected behaviors with null fields in flows");
const troubleshootDoc = automateDoc("fix-flow-failures", "Troubleshoot a cloud flow");
const sharePointODataDoc = learnDoc("sharepoint/dev/sp-add-ins/use-odata-query-operations-in-sharepoint-rest-requests", "Use OData query operations in SharePoint REST requests");

const invalidTemplate: ErrorPage = {
  ...base,
  slug: "invalidtemplate-unable-to-process-template-language-expressions",
  message: "InvalidTemplate. Unable to process template language expressions in action 'Compose' inputs at line '0' and column '0'",
  title: "Fix \"InvalidTemplate. Unable to process template language expressions\" in Power Automate",
  shortTitle: "InvalidTemplate. Unable to process template language expressions",
  description: "What the InvalidTemplate error means in a flow run, how to read the rest of the message to find the expression at fault, and where to go for each specific cause.",
  keywords: ["InvalidTemplate", "Unable to process template language expressions", "Power Automate InvalidTemplate", "template language expression cannot be evaluated"],
  quickAnswer: "InvalidTemplate means an expression in the named action could not be worked out when the flow ran. The first sentence only tells you which action. The cause is in the sentence after it, in single quotes: usually a null value passed to a function, a property that does not exist, or a value of the wrong type. Read that second sentence, then check the action's inputs in the run history.",
  variants: [
    "Unable to process template language expressions in action 'Apply_to_each' inputs at line '0' and column '0': 'The template language expression ... cannot be evaluated because property ... cannot be selected.'",
    "Unable to process template language expressions for action 'Condition' at line '0' and column '0'",
    "InvalidTemplate. Unable to process template language expressions. The provided value is of type 'Null'."
  ],
  meaning: [
    p("Every flow is stored as a template, and every dynamic value in it is an expression. When an action is about to run, Power Automate works out its expressions first. If one of them cannot be evaluated, the action fails with `InvalidTemplate` before it does anything."),
    p("The message has two parts. The first names the action and is the same for every cause. The second, after the colon, is the real error. Treat `InvalidTemplate` as a heading and read on.")
  ],
  causes: [
    table(
      ["The second sentence says", "Cause", "Page"],
      ["expects its parameter to be a string. The provided value is of type 'Null'", "A function was given an empty value", "[Value is of type Null](/errors/template-function-expects-string-provided-value-null)"],
      ["The result must be a valid array", "A loop was given something that is not a list", "[Must be a valid array](/errors/foreach-expression-result-must-be-valid-array)"],
      ["property '...' cannot be selected", "A path reads a property from text or from a list", "[Property cannot be selected](/errors/property-cannot-be-selected-power-automate)"],
      ["The datetime string must match ISO 8601 format", "A date function was given a date it cannot read", "[ISO 8601 format](/errors/datetime-string-must-match-iso-8601-format)"],
      ["The variable ... cannot be initialized or updated with value of type", "A variable was given the wrong type", "[Variable type mismatch](/errors/variable-cannot-be-initialized-or-updated-with-value-of-type)"],
      ["property '...' doesn't exist, available properties are", "A path names a property that is not there", "See the fix below"],
      ["The action '...' is not defined, or referenced by a later action", "An expression names an action that does not run before this one", "See the fix below"]
    )
  ],
  fixes: [
    ol(
      "Open the failed run and select the action named in the message.",
      "Read the full error in the pane. Copy the part in single quotes after the colon.",
      "Find the expression it quotes. It is shown in the message itself, starting with `@`.",
      "Look at the outputs of the action that expression reads from. Check whether the value is there, and what type it is.",
      "Fix the expression, save, and resubmit the run."
    ),
    p("**Property doesn't exist.** The message lists the properties that are available. Compare them with your path. The usual causes are a different capital letter, a missing level such as `body` or `value`, and a property that is left out of the data when it is empty. Add a question mark before the bracket so a missing property returns null."),
    code(`// Fails when Manager is missing
body('Get_item')['Manager']['Email']

// Returns null when Manager is missing
body('Get_item')?['Manager']?['Email']`, "Expression"),
    p("**Action is not defined.** The name in the expression must be the action's name with underscores for spaces, and the action must run before this one on the same path. An action inside a different branch of a condition cannot be read from the other branch."),
    tool("power-automate-expression-builder", "Rebuild the expression from a template and compare it with the one in the error message.")
  ],
  prevention: [
    ul(
      "Keep the question marks the designer writes, and add them to paths you type by hand.",
      "Give a fallback to values that can be empty, with `coalesce`, at the point they enter the flow.",
      "Test a new expression in a Compose action with an item that has empty columns, not only a fully filled one.",
      "Rename actions before you write expressions that refer to them."
    ),
    p("For how expressions are put together, see [read and write flow expressions](/guides/power-automate-expressions-explained).")
  ],
  faqs: [
    { question: "What does InvalidTemplate mean in Power Automate?", answer: "It means an expression in the action named in the message could not be evaluated at run time. The specific reason is in the second half of the message, after the colon." },
    { question: "Why does the flow save but fail with InvalidTemplate when it runs?", answer: "Saving checks that an expression is written correctly. It cannot know what data the flow will receive. The error appears at run time when a value is empty, missing or of a different type from the one the expression expects." },
    { question: "What do line 0 and column 0 mean in the error?", answer: "They refer to a position in the flow's stored definition and are nearly always 0. They do not help find the problem. Use the action name and the quoted expression instead." }
  ],
  relatedTools: ["power-automate-expression-builder"],
  relatedPatterns: ["coalesce-empty-null-handling-power-automate", "power-automate-try-catch-scope-error-handling"],
  relatedLinks: [
    { href: "/guides/troubleshoot-failed-flow-run", label: "Troubleshoot a failed flow run" },
    { href: "/guides/power-automate-expressions-explained", label: "Read and write flow expressions" }
  ],
  relatedErrors: ["template-function-expects-string-provided-value-null", "foreach-expression-result-must-be-valid-array", "property-cannot-be-selected-power-automate", "the-expression-is-invalid-power-automate"],
  sources: [nullFieldsDoc, functionsDoc, troubleshootDoc]
};

const nullParameter: ErrorPage = {
  ...base,
  slug: "template-function-expects-string-provided-value-null",
  message: "The template language function 'split' expects its first parameter to be of type string. The provided value is of type 'Null'.",
  title: "Fix \"expects its parameter to be a string. The provided value is of type 'Null'\" in Power Automate",
  shortTitle: "The provided value is of type 'Null'",
  description: "Why a Power Automate function fails when it is given an empty value, and three ways to fix it: coalesce, the question mark, and a condition.",
  keywords: ["The provided value is of type Null", "template language function expects its parameter to be a string", "Power Automate null error", "coalesce Power Automate"],
  quickAnswer: "A function such as split, replace, formatDateTime or length was given an empty value. Wrap the value in coalesce with a fallback, for example split(coalesce(triggerBody()?['Tags'], ''), ','). If the action should not run at all when the value is empty, put it inside a condition that checks for the value first.",
  variants: [
    "The template language function 'replace' expects its first parameter 'string' to be a string. The provided value is of type 'Null'.",
    "The template language function 'length' expects its parameter to be an array or a string. The provided value is of type 'Null'.",
    "The template language function 'formatDateTime' expects its first parameter to be of type string. The provided value is of type 'Null'."
  ],
  meaning: [
    p("Most expression functions need a real value to work on. `split` needs text to split, `length` needs a list or text to measure, `formatDateTime` needs a date. When the value is empty, the function receives null and stops the action."),
    p("The flow worked in testing because the test item had every column filled in. The failing run met an item where one was left empty.")
  ],
  causes: [
    ol(
      "An optional column, such as a date or a comment, is empty on this item.",
      "The path in the expression is slightly wrong, so it finds nothing. A wrong capital letter or a missing `/Value` returns null without any other warning.",
      "An earlier action returned no result, for example a Get items that matched nothing, and the expression reads its first item.",
      "The value comes from an action in a branch that did not run."
    ),
    p("Check the second cause before adding a fallback. If the path is wrong, `coalesce` hides the error and the flow uses the fallback every time.")
  ],
  fixes: [
    p("**Give the value a fallback with coalesce.** `coalesce` returns the first of its arguments that is not null."),
    code(`// Fails when Tags is empty
split(triggerBody()?['Tags'], ',')

// Splits empty text instead, which gives one empty item
split(coalesce(triggerBody()?['Tags'], ''), ',')`, "Expression"),
    p("**Skip the function when there is nothing to work on.** For a date, an empty result is usually better than a made-up date."),
    code(`if(
  empty(triggerBody()?['DueDate']),
  '',
  formatDateTime(triggerBody()?['DueDate'], 'd MMM yyyy')
)`, "Expression"),
    p("**Use a condition for whole steps.** If several actions make no sense without the value, add a Condition that checks the value is not equal to `null`, entered as an expression, and put those actions in the Yes branch."),
    p("**Keep the question marks.** If coalesce still fails, the error may come from the path, not the function. `triggerBody()['Manager']['Email']` fails when Manager is missing. `triggerBody()?['Manager']?['Email']` returns null, which coalesce can then handle."),
    tool("power-automate-expression-builder", "The empty value templates write the coalesce and if(empty()) forms for you.")
  ],
  prevention: [
    ul(
      "Test with an item that has every optional column empty.",
      "Handle empty values once, near the trigger, by putting cleaned values in variables or Compose actions and using those later.",
      "Make columns required in the list or form when the flow cannot work without them."
    ),
    p("The [null handling pattern](/patterns/coalesce-empty-null-handling-power-automate) covers null, empty text and empty arrays, which behave differently.")
  ],
  faqs: [
    { question: "How do I check for null in a Power Automate expression?", answer: "Use empty(value) to test for null, empty text or an empty list in one go, or equals(value, null) for null only. Use coalesce(value, fallback) to replace a null with a fallback." },
    { question: "Why does coalesce not fix my null error?", answer: "The error is probably raised by the path before coalesce runs. A path without question marks fails when a level is missing. Write each step as ?['Name'] so it returns null, and coalesce can then supply the fallback." },
    { question: "What is the difference between null and empty in Power Automate?", answer: "Null means there is no value at all. Empty text is a value with nothing in it. The empty function returns true for both, while coalesce only replaces null." }
  ],
  relatedTools: ["power-automate-expression-builder"],
  relatedPatterns: ["coalesce-empty-null-handling-power-automate"],
  relatedLinks: [{ href: "/guides/power-automate-expressions-explained", label: "Read and write flow expressions" }],
  relatedErrors: ["invalidtemplate-unable-to-process-template-language-expressions", "datetime-string-must-match-iso-8601-format", "foreach-expression-result-must-be-valid-array"],
  sources: [nullFieldsDoc, functionsDoc]
};

const validArray: ErrorPage = {
  ...base,
  slug: "foreach-expression-result-must-be-valid-array",
  message: "The execution of template action 'Apply_to_each' failed: the result of the evaluation of 'foreach' expression '@triggerBody()?['Attachments']' is of type 'Null'. The result must be a valid array.",
  title: "Fix \"The result must be a valid array\" in an Apply to each",
  shortTitle: "The result must be a valid array",
  description: "Why Apply to each fails with a result of type Null, Object or String, and how to give the loop a real list every time.",
  keywords: ["The result must be a valid array", "foreach expression is of type Null", "Apply to each failed", "Apply to each null", "foreach expression is of type Object"],
  quickAnswer: "Apply to each was given something that is not a list. If the type in the message is Null, the list is missing on this run, so use coalesce with an empty list: coalesce(triggerBody()?['Attachments'], json('[]')). If the type is Object, you picked a whole response instead of the list inside it, which is usually the value property. If the type is String, convert the text to a list with json or split.",
  variants: [
    "... is of type 'Object'. The result must be a valid array.",
    "... is of type 'String'. The result must be a valid array.",
    "ExpressionEvaluationFailed. The execution of template action 'Apply_to_each' failed"
  ],
  meaning: [
    p("**Apply to each** runs its actions once for every item in a list. The box at the top of the loop must resolve to an array. The message tells you what it resolved to instead: `Null`, `Object` or `String`."),
    p("That one word decides the fix, so read it first.")
  ],
  causes: [
    table(
      ["Type in the message", "What happened"],
      ["`Null`", "The list does not exist on this run. A column was empty, a form had no file uploads, or the path is wrong."],
      ["`Object`", "The loop was given a whole record. For Get items, List rows and most connectors, the list is in the `value` property of the body."],
      ["`String`", "The loop was given text. It may be text that looks like a list, such as `[\"a\",\"b\"]` or `a;b;c`."]
    )
  ],
  fixes: [
    p("**Null: supply an empty list.** The loop then runs zero times and the flow carries on."),
    code(`coalesce(triggerBody()?['Attachments'], json('[]'))`, "Expression in the Apply to each box"),
    p("If the list should never be empty, check the path instead. Open the outputs of the source action in the run history and follow the path one step at a time."),
    p("**Object: point at the list inside it.**"),
    code(`// The whole response, an object
body('Get_items')

// The list of items
body('Get_items')?['value']`, "Expression"),
    p("For an HTTP response, the list may be under another name such as `items` or `results`. Read the raw outputs to find it."),
    p("**String: convert it.**"),
    code(`// Text that holds JSON
json(variables('varListText'))

// Text with a separator
split(triggerBody()?['Emails'], ';')`, "Expression"),
    p("If you need to loop over a single record on purpose, wrap it in a list with `createArray(...)`.")
  ],
  prevention: [
    ul(
      "Wrap any list that can be absent in `coalesce(..., json('[]'))`.",
      "Before a loop over search results, check `length(...)` in a condition when an empty result needs different handling, such as a notification.",
      "Ask whether you need the loop. A Select or Filter array takes the whole list in one action."
    ),
    p("See the [Filter array pattern](/patterns/filter-array-instead-of-apply-to-each) for replacing loops.")
  ],
  faqs: [
    { question: "Why does Apply to each say the result is of type Null?", answer: "The value given to the loop does not exist on this run. A multi-select column was empty, no files were attached, or the path to the list is wrong. Use coalesce with an empty list so the loop runs zero times." },
    { question: "How do I create an empty array in Power Automate?", answer: "Use json('[]') or createArray() inside an expression. Either gives a list with no items." },
    { question: "Why does my loop work in testing and fail later?", answer: "The test item had at least one value in the list. A later item had none, and the connector left the property out or returned null instead of an empty list." }
  ],
  relatedTools: ["power-automate-expression-builder"],
  relatedPatterns: ["filter-array-instead-of-apply-to-each", "coalesce-empty-null-handling-power-automate", "apply-to-each-concurrency-variables-power-automate"],
  relatedLinks: [{ href: "/guides/power-automate-choice-person-lookup-values", label: "Read Choice, Person and Lookup values" }],
  relatedErrors: ["invalidtemplate-unable-to-process-template-language-expressions", "template-function-expects-string-provided-value-null", "property-cannot-be-selected-power-automate"],
  sources: [functionsDoc, automateDoc("apply-to-each", "Use the Apply to each action to process a list of items"), nullFieldsDoc]
};

const parseJsonValidation: ErrorPage = {
  ...base,
  slug: "parse-json-schema-validation-failed-expected-string-got-null",
  message: "ValidationFailed. The schema validation failed.\nInvalid type. Expected String but got Null.",
  title: "Fix \"The schema validation failed. Expected String but got Null\" in Parse JSON",
  shortTitle: "Parse JSON: Expected String but got Null",
  description: "Why the Parse JSON action fails schema validation, and the exact schema edits that fix null values, decimals, missing properties and arrays.",
  keywords: ["Expected String but got Null", "The schema validation failed", "Parse JSON ValidationFailed", "Invalid type Expected Integer but got Number", "Parse JSON null"],
  quickAnswer: "The schema says a property is always text, and this run's content has null there. Open the Parse JSON schema, find the property and change \"type\": \"string\" to \"type\": [\"string\", \"null\"]. Do the same for every property that can be empty. The schema generator tool writes these for you.",
  variants: [
    "Invalid type. Expected Integer but got Number.",
    "Invalid type. Expected Object but got Array.",
    "Invalid type. Expected Array but got Object.",
    "Required properties are missing from object: phone."
  ],
  meaning: [
    p("**Parse JSON** compares the content it receives with its schema and fails when they differ. The schema was generated from one sample, so it describes that sample exactly: every property present, every value of the type it happened to have."),
    p("Real data is less tidy. The action's outputs list each mismatch with the property path, which tells you where in the schema to look.")
  ],
  causes: [
    table(
      ["Message", "Cause"],
      ["Expected String but got Null", "A property that had text in the sample is empty in this content."],
      ["Expected Integer but got Number", "The sample had a whole number. This content has a decimal."],
      ["Required properties are missing", "A property in the sample is left out of this content."],
      ["Expected Object but got Array, or the reverse", "The content has a different top-level shape, or a property holds one record on some runs and a list on others."],
      ["Expected Object but got String", "The Content is text that holds JSON, or it is an error page from a failed call."]
    )
  ],
  fixes: [
    p("**Allow null.** Change the type to a list of the real type and null."),
    code(`// Before
"phone": { "type": "string" }

// After
"phone": { "type": ["string", "null"] }`, "Schema"),
    p("**Allow decimals.** Change `integer` to `number`. Number accepts whole numbers as well."),
    code(`"total": { "type": ["number", "null"] }`, "Schema"),
    p("**Stop requiring optional properties.** Find the `required` list in the schema and remove the property named in the message. Nested objects have their own `required` list."),
    p("**Fix a shape mismatch.** If the schema starts with `\"type\": \"array\"` and the content is one object, regenerate the schema from a sample with the right shape. If the Content is text, wrap it in `json()` in the Content box."),
    p("To find every problem in one pass, open the failed action's outputs. Each entry has a `path` such as `customer.phone` and the line in the schema that rejected it."),
    tool("parse-json-schema-generator", "Paste a sample and the generator writes a schema with null allowed where you choose and number in place of integer.")
  ],
  prevention: [
    ul(
      "Generate the schema from the fullest sample you can find, then loosen it: allow null on anything optional and trim `required`.",
      "If you only read a few values, skip Parse JSON and use an expression such as `body('HTTP')?['customer']?['phone']`. There is no schema to fail.",
      "If the content comes from your own Power Apps app or another flow, send empty text instead of leaving values out."
    ),
    p("See [use Parse JSON, and when to skip it](/guides/power-automate-parse-json-guide) for the full approach.")
  ],
  faqs: [
    { question: "How do I make a Parse JSON property accept null?", answer: "In the schema, replace the property's single type with a list that includes null, for example \"type\": [\"string\", \"null\"]." },
    { question: "Can I remove the schema validation in Parse JSON?", answer: "Not with a setting, but an empty schema of {} accepts any content. You then lose the dynamic content entries, so reading the values with expressions and removing the Parse JSON action is usually cleaner." },
    { question: "Why does Parse JSON say Expected Integer but got Number?", answer: "The sample used to generate the schema had a whole number, so the schema says integer. The content now has a decimal. Change the type to number." }
  ],
  relatedTools: ["parse-json-schema-generator", "power-automate-expression-builder"],
  relatedPatterns: ["power-automate-parse-json-from-power-apps", "coalesce-empty-null-handling-power-automate"],
  relatedLinks: [{ href: "/guides/power-automate-parse-json-guide", label: "Use Parse JSON, and when to skip it" }],
  relatedErrors: ["property-cannot-be-selected-power-automate", "template-function-expects-string-provided-value-null"],
  sources: [automateDoc("data-operations", "Use data operations"), functionsDoc]
};

const propertyCannotBeSelected: ErrorPage = {
  ...base,
  slug: "property-cannot-be-selected-power-automate",
  message: "The template language expression 'body('HTTP')['customer']['name']' cannot be evaluated because property 'customer' cannot be selected. Property selection is not supported on values of type 'String'.",
  title: "Fix \"property cannot be selected. Property selection is not supported on values of type 'String'\"",
  shortTitle: "Property cannot be selected",
  description: "Why a Power Automate expression cannot read a property from text or from a list, and the fix for each case: json(), an index, first(), or a question mark.",
  keywords: ["property cannot be selected", "Property selection is not supported on values of type String", "Array elements can only be selected using an integer index", "cannot be evaluated because property"],
  quickAnswer: "The expression asks for a named property of something that is not a record. If the type is String, the data is still text, so wrap it in json() first. If the message mentions an array, add an index such as ?[0] or use first() to pick one item before reading the property. If the property is sometimes absent, write the step as ?['name'] so it returns null instead of failing.",
  variants: [
    "... cannot be evaluated because property 'Title' cannot be selected. Array elements can only be selected using an integer index.",
    "... cannot be evaluated because property 'Email' cannot be selected. Property selection is not supported on values of type 'Null'.",
    "... cannot be evaluated because property 'value' doesn't exist, available properties are 'statusCode, headers, body'."
  ],
  meaning: [
    p("A path such as `['customer']['name']` works on a record: a set of named properties. The error says that at the step named in the message, the expression was holding something else. The last few words say what: text, a list, or nothing.")
  ],
  causes: [
    table(
      ["The message ends with", "The expression is holding", "Typical source"],
      ["values of type 'String'", "Text that may contain JSON", "An HTTP body returned as text, a text input from Power Apps, file content, a string variable"],
      ["Array elements can only be selected using an integer index", "A list", "The `value` of Get items, an array from Parse JSON, a multi-select column"],
      ["values of type 'Null'", "Nothing", "An empty column, or a wrong step earlier in the path"],
      ["doesn't exist, available properties are", "A record without that property", "A missing level such as `body`, or a different capital letter"]
    )
  ],
  fixes: [
    p("**String: turn the text into a record.**"),
    code(`// Fails: the body is text
body('HTTP')['customer']['name']

// Works
json(body('HTTP'))?['customer']?['name']`, "Expression"),
    p("Look at the raw outputs first. If the body starts with a quote and has backslashes before the inner quotes, it is JSON stored as text."),
    p("**Array: pick an item first.**"),
    code(`// Fails: value is a list of items
body('Get_items')?['value']?['Title']

// The first item
first(body('Get_items')?['value'])?['Title']

// The same, by position
body('Get_items')?['value']?[0]?['Title']`, "Expression"),
    p("If you want the property from every item, use a Select action or an Apply to each instead of an index."),
    p("**Null: make the path safe.** Put a question mark before every bracket. The expression then returns null when a level is missing, and you can add a fallback with `coalesce`."),
    p("**Doesn't exist: compare with the list in the message.** The message names the properties that are available. Add the missing level or correct the spelling."),
    tool("power-automate-expression-builder", "Use the array and empty value templates to write the first(), index and coalesce forms.")
  ],
  prevention: [
    ul(
      "Before writing a path, open the raw outputs of the source action and note whether each level uses curly brackets, which is a record, or square brackets, which is a list.",
      "Write every step with a question mark.",
      "Store parsed data once. Put `json(...)` in a Compose action and read from that, instead of repeating the conversion in every expression."
    ),
    p("See [read and write flow expressions](/guides/power-automate-expressions-explained) for how paths are built.")
  ],
  faqs: [
    { question: "What does Property selection is not supported on values of type String mean?", answer: "The expression tried to read a named property from text. The data has not been converted to JSON yet. Wrap the text in json() and then read the property." },
    { question: "What does Array elements can only be selected using an integer index mean?", answer: "The expression tried to read a named property from a list. Pick one item first with an index such as ?[0] or with first(), then read the property from that item." },
    { question: "How do I get the first item from Get items without an Apply to each?", answer: "Use first(body('Get_items')?['value']) followed by the property path, for example first(body('Get_items')?['value'])?['Title']." }
  ],
  relatedTools: ["power-automate-expression-builder", "parse-json-schema-generator"],
  relatedPatterns: ["coalesce-empty-null-handling-power-automate", "select-union-remove-duplicates-power-automate"],
  relatedLinks: [
    { href: "/guides/power-automate-expressions-explained", label: "Read and write flow expressions" },
    { href: "/guides/power-automate-parse-json-guide", label: "Use Parse JSON, and when to skip it" }
  ],
  relatedErrors: ["invalidtemplate-unable-to-process-template-language-expressions", "foreach-expression-result-must-be-valid-array", "parse-json-schema-validation-failed-expected-string-got-null"],
  sources: [functionsDoc, learnDoc("azure/logic-apps/logic-apps-workflow-definition-language", "Workflow Definition Language schema: operators"), nullFieldsDoc]
};

const iso8601: ErrorPage = {
  ...base,
  slug: "datetime-string-must-match-iso-8601-format",
  message: "In function 'formatDateTime', the value provided for date time string '14/03/2026' was not valid. The datetime string must match ISO 8601 format.",
  title: "Fix \"The datetime string must match ISO 8601 format\" in Power Automate",
  shortTitle: "The datetime string must match ISO 8601 format",
  description: "Why formatDateTime, addDays and convertTimeZone reject a date, and how to fix dates in local format, Excel serial numbers and empty values.",
  keywords: ["The datetime string must match ISO 8601 format", "formatDateTime not valid", "value provided for date time string was not valid", "Power Automate date format error"],
  quickAnswer: "Date functions only accept dates written year first, such as 2026-03-14 or 2026-03-14T09:30:00Z. The message quotes the value that was rejected. If it is a date in day and month order, convert it with parseDateTime and the right locale. If it is a number such as 46095, it is an Excel serial date. If it is empty, check for an empty value before formatting.",
  variants: [
    "In function 'addDays', the value provided for date time string '' was not valid.",
    "In function 'convertTimeZone', the value provided for date time string '46095' was not valid.",
    "The template language function 'formatDateTime' expects its first parameter to be of type string. The provided value is of type 'Null'."
  ],
  meaning: [
    p("`formatDateTime`, `addDays`, `convertTimeZone` and the other date functions read their input as text in ISO 8601 form: year, month, day, then an optional time. Anything else is rejected."),
    p("The message includes the rejected value between quotes. That value is the fastest clue to the cause.")
  ],
  causes: [
    table(
      ["The quoted value looks like", "Cause"],
      ["`14/03/2026` or `3/14/2026`", "A date typed by a person, or read from a text column, a CSV file or an email."],
      ["`46095` or `46095.5`", "A date from an Excel table, which Excel stores as a count of days."],
      ["Nothing between the quotes", "The date column is empty on this item."],
      ["`14 March 2026 09:30`", "A date that was already formatted by an earlier step."]
    )
  ],
  fixes: [
    p("**A local-format date: parse it with a locale.** `parseDateTime` reads text in the format of the locale you name and returns an ISO date."),
    code(`formatDateTime(parseDateTime(triggerBody()?['StartDate'], 'en-GB'), 'yyyy-MM-dd')`, "Expression"),
    p("Use `en-GB` for day first and `en-US` for month first. You can pass an exact format as a third argument when the text is unusual."),
    code(`parseDateTime('14-03-2026 09:30', 'en-GB', 'dd-MM-yyyy HH:mm')`, "Expression"),
    p("**An Excel serial number: convert it.** The simplest fix is in the Excel action: set **DateTime Format** to ISO 8601 in its advanced options. To convert in an expression, see the [Excel date pattern](/patterns/excel-date-serial-number-power-automate)."),
    p("**An empty value: check before formatting.**"),
    code(`if(
  empty(triggerBody()?['DueDate']),
  '',
  formatDateTime(triggerBody()?['DueDate'], 'd MMM yyyy')
)`, "Expression"),
    p("**An already formatted date: go back to the original.** Format a date once, at the point where it is shown to a person. Keep the ISO value for every calculation."),
    tool("date-format-tester", "Try a format string against a sample date and see the result before putting it in the flow.")
  ],
  prevention: [
    ul(
      "Collect dates with date pickers and date columns, not free text.",
      "Do all date arithmetic on ISO values and format last.",
      "Test with an item whose date is empty and one whose day is greater than 12. The second exposes day and month confusion that the first twelve days of a month hide."
    ),
    p("The [date formatting cheat sheet](/cheat-sheets/power-automate-date-formatting-cheat-sheet) lists the format strings.")
  ],
  faqs: [
    { question: "What is ISO 8601 format in Power Automate?", answer: "A date written from largest unit to smallest: year, month, day, and optionally a time, such as 2026-03-14 or 2026-03-14T09:30:00Z. The Z marks the time as UTC." },
    { question: "How do I convert a dd/MM/yyyy date in Power Automate?", answer: "Use parseDateTime with a locale that reads day first, such as parseDateTime(value, 'en-GB'). The result is an ISO date that formatDateTime and the other date functions accept." },
    { question: "Why does my flow fail only on some dates?", answer: "A date such as 03/04/2026 can be read either way, so it passes. A date such as 14/03/2026 cannot be read month first and fails. The flow was misreading the earlier dates as well." }
  ],
  relatedTools: ["date-format-tester", "power-automate-expression-builder"],
  relatedPatterns: ["excel-date-serial-number-power-automate", "convert-time-zone-format-date-power-automate", "power-automate-compose-date-formatting"],
  relatedLinks: [
    { href: "/cheat-sheets/power-automate-date-formatting-cheat-sheet", label: "Power Automate Date Formatting Cheat Sheet" },
    { href: "/guides/power-automate-filter-query-by-date", label: "Filter SharePoint items by date" }
  ],
  relatedErrors: ["template-function-expects-string-provided-value-null", "invalidtemplate-unable-to-process-template-language-expressions"],
  sources: [functionsDoc, automateDoc("date-time-values", "Work with date and time values"), automateDoc("convert-time-zone", "Convert a time zone")]
};

const expressionInvalid: ErrorPage = {
  ...base,
  slug: "the-expression-is-invalid-power-automate",
  message: "The expression is invalid.",
  title: "Fix \"The expression is invalid\" in the Power Automate expression editor",
  shortTitle: "The expression is invalid",
  description: "A checklist for the expression editor's least helpful message: quotes, brackets, the @ sign, commas, renamed actions and pasted characters.",
  keywords: ["The expression is invalid", "Power Automate expression invalid", "expression editor error", "invalid expression Power Automate"],
  quickAnswer: "The editor could not read what you typed. Work through five checks: text values use straight single quotes, every opening bracket has a closing one, there is no @ at the start, arguments are separated by commas, and function names are spelled correctly. Most cases are a double quote or a curly quote pasted from somewhere else.",
  variants: [
    "The expression is invalid. Fix the expression and try again.",
    "Flow save failed with code 'InvalidTemplate' and message 'The template validation failed'",
    "The template function 'formatDate' is not defined or not valid."
  ],
  meaning: [
    p("This message appears when you select **Add**, **OK** or **Update** in the expression editor, before the flow is saved or run. It is a syntax check. The editor does not say which character is wrong, so the fix is a checklist.")
  ],
  causes: [
    ol(
      "Double quotes around text. Expressions use single quotes.",
      "Curly quotes pasted from a document, an email or a web page.",
      "A missing or extra bracket.",
      "An `@` at the start. The editor adds it for you.",
      "A semicolon between arguments. Expressions always use commas, whatever your regional settings.",
      "A misspelled function name, such as `formatDate` for `formatDateTime`.",
      "A dynamic content token dropped inside quotes.",
      "A reference to an action that was renamed or does not exist."
    )
  ],
  fixes: [
    p("**Quotes.** Retype every quote in the expression by hand as a straight single quote. To put an apostrophe inside text, write it twice."),
    code(`// Invalid
concat("Hello ", triggerBody()?['Name'])

// Valid
concat('Hello ', triggerBody()?['Name'])

// An apostrophe inside text
concat('It''s ready, ', triggerBody()?['Name'])`, "Expression"),
    p("**Brackets.** Count them, or paste the expression into a text editor that highlights matching brackets. Every function needs round brackets, every property step needs square ones."),
    p("**The @ sign.** Remove it in the expression editor. It belongs only in trigger conditions, Filter array advanced mode and code view."),
    p("**Dynamic content inside quotes.** A token is already an expression. Do not wrap it in quotes inside another expression."),
    code(`// Invalid: the token is inside quotes
formatDateTime('triggerBody()?['Created']', 'yyyy-MM-dd')

// Valid
formatDateTime(triggerBody()?['Created'], 'yyyy-MM-dd')`, "Expression"),
    p("**Cut it down.** If the expression is long, build it from the inside out. Enter the innermost function alone and confirm the editor accepts it, then wrap it in the next function."),
    tool("power-automate-expression-builder", "Start from a working template and change one value at a time, so you always know which edit broke the expression.")
  ],
  prevention: [
    ul(
      "Type expressions in the editor or a plain text editor, not in a word processor.",
      "Build long expressions in stages, with a Compose action for each stage. Shorter expressions are easier to check and to read later.",
      "Rename actions before writing expressions that mention them."
    ),
    p("See [read and write flow expressions](/guides/power-automate-expressions-explained).")
  ],
  faqs: [
    { question: "Why does Power Automate say the expression is invalid?", answer: "The expression has a syntax problem. The most common are double or curly quotes in place of straight single quotes, an unbalanced bracket, an @ sign at the start, and a misspelled function name." },
    { question: "Do Power Automate expressions use single or double quotes?", answer: "Single quotes. Text inside an expression is always wrapped in straight single quotes, and an apostrophe inside the text is written as two single quotes." },
    { question: "Do I type the @ sign in the expression editor?", answer: "No. The editor adds it when the expression is stored. Type the @ yourself only in trigger conditions, in Filter array advanced mode and in code view." }
  ],
  relatedTools: ["power-automate-expression-builder", "trigger-condition-builder"],
  relatedPatterns: ["coalesce-empty-null-handling-power-automate"],
  relatedLinks: [
    { href: "/guides/power-automate-expressions-explained", label: "Read and write flow expressions" },
    { href: "/cookbooks/power-automate-expressions-cookbook", label: "Power Automate Expressions Cookbook" }
  ],
  relatedErrors: ["invalidtemplate-unable-to-process-template-language-expressions", "property-cannot-be-selected-power-automate"],
  sources: [functionsDoc, automateDoc("use-expressions-in-conditions", "Use expressions in conditions to check multiple values"), automateDoc("expressions-copilot", "Create, update and fix expressions with Copilot expression assistant")]
};

const columnDoesNotExist: ErrorPage = {
  ...base,
  slug: "column-does-not-exist-deleted-by-another-user",
  message: "Column 'Due Date' does not exist. It may have been deleted by another user.",
  title: "Fix \"Column does not exist. It may have been deleted by another user\" in Get items",
  shortTitle: "Column does not exist. It may have been deleted by another user",
  description: "Why a SharePoint Filter Query or Order By fails with a column that plainly exists, and how to find the internal name the flow needs.",
  keywords: ["Column does not exist. It may have been deleted by another user", "Get items column does not exist", "Filter Query internal name", "SharePoint internal column name"],
  quickAnswer: "Nobody deleted the column. The Filter Query or Order By uses the column's display name, and SharePoint needs its internal name. Open List settings, select the column and read the name after Field= at the end of the page address. A column titled Due Date is usually DueDate or Due_x0020_Date. Use that name in the filter.",
  variants: [
    "Column 'DueDate' does not exist. It may have been deleted by another user. clientRequestId: ...",
    "Field 'Due Date' does not exist",
    "The expression \"Due Date eq '2026-12-31'\" is not valid. Creating query failed."
  ],
  meaning: [
    p("SharePoint looked for a column with exactly the name in the message and did not find one. The second sentence is a guess on SharePoint's part and is almost never the real reason."),
    p("The message quotes the name it searched for. Compare that with the column's internal name and the difference is the bug.")
  ],
  causes: [
    ol(
      "The filter uses the display name. Display names can have spaces. Internal names cannot.",
      "The column was renamed. The internal name is still the original one.",
      "The column was created with a space, so its internal name has `_x0020_` in it, and the filter has the name without it. Or the reverse.",
      "The internal name starts with an underscore and needs the `OData_` prefix.",
      "The action points at a different list or site from the one you checked, such as a test copy.",
      "The filter reads a field of a person or lookup column that does not exist, such as `AssignedTo/Email`. The field is `EMail`, with a capital M."
    )
  ],
  fixes: [
    ol(
      "Open the list, select the gear icon, then **List settings**.",
      "Under **Columns**, select the column named in the error.",
      "Copy the text after `Field=` at the end of the page address.",
      "Replace the name in the Filter Query or Order By with it."
    ),
    code(`// Fails
Due Date lt '2026-12-31'

// Works, depending on how the column was created
DueDate lt '2026-12-31'
Due_x0020_Date lt '2026-12-31'`, "Filter Query"),
    p("A quicker check: run the flow once with the filter removed and open the Get items raw outputs. The property names there are the internal names, including any `OData_` prefix."),
    tool("sharepoint-internal-name-helper", "Type the column title to see the internal name SharePoint creates for it, including the codes for spaces and symbols.")
  ],
  prevention: [
    ul(
      "Create columns with a short name and no spaces, then rename them. The internal name stays readable.",
      "Keep a list of internal names with the list's design notes.",
      "Build filters with the Filter Query builder and paste in the internal name, so only one thing can be wrong."
    ),
    p("The [internal column names guide](/guides/sharepoint-internal-column-names-power-automate) explains the codes and the `OData_` prefix.")
  ],
  faqs: [
    { question: "Why does Power Automate say my column does not exist when it does?", answer: "The Filter Query or Order By is using the display name. SharePoint needs the internal name, which has no spaces and does not change when the column is renamed." },
    { question: "How do I write a column with a space in a Filter Query?", answer: "Use the internal name. For a column created as Due Date this is often Due_x0020_Date, where _x0020_ stands for the space, or DueDate. Check the name in List settings to be sure." },
    { question: "Does the error mean someone deleted the column?", answer: "Rarely. If the column is visible in the list, the cause is a name mismatch. Check for a deleted column only if the flow worked before and nobody changed the filter." }
  ],
  relatedTools: ["sharepoint-internal-name-helper", "odata-filter-query-builder"],
  relatedPatterns: ["use-odata-filters-sharepoint-text-fields"],
  relatedLinks: [
    { href: "/guides/sharepoint-internal-column-names-power-automate", label: "SharePoint internal column names in flows" },
    { href: "/guides/sharepoint-get-items-filter-query", label: "Get items Filter Query by column type" }
  ],
  relatedErrors: ["the-query-is-not-valid-get-items", "exceeds-list-view-threshold-power-automate"],
  sources: [sharePointODataDoc, automateDoc("sharepoint-overview", "Use SharePoint and Power Automate to build workflows")]
};

const queryNotValid: ErrorPage = {
  ...base,
  slug: "the-query-is-not-valid-get-items",
  message: "The query is not valid.",
  title: "Fix \"The query is not valid\" in a SharePoint Get items Filter Query",
  shortTitle: "The query is not valid",
  description: "Five broken SharePoint Filter Queries and their corrected versions: missing quotes, wrong operators, unsupported functions, apostrophes and empty dynamic values.",
  keywords: ["The query is not valid", "Get items query is not valid", "Filter Query error", "Creating query failed", "SharePoint OData filter error"],
  quickAnswer: "SharePoint could not read the Filter Query. Check that text and dates are in single quotes, that operators are the words eq, ne, gt, ge, lt and le and not symbols, that you are using substringof and not contains, and that no dynamic value is empty or contains an apostrophe. Then test the filter with fixed values before adding dynamic content back.",
  variants: [
    "The expression \"Status = 'Open'\" is not valid. Creating query failed.",
    "The query is not valid. clientRequestId: ...",
    "Bad Request. The query is not valid."
  ],
  meaning: [
    p("The Filter Query on a Get items or Get files action is not valid OData as SharePoint understands it. The action returns status 400 and the flow stops. The message does not point at the mistake, so compare your filter with the five cases below.")
  ],
  causes: [
    table(
      ["Broken filter", "Problem", "Fixed"],
      ["`Status eq Open`", "Text without quotes", "`Status eq 'Open'`"],
      ["`Status = 'Open'`", "A symbol in place of an operator", "`Status eq 'Open'`"],
      ["`contains(Title, 'urgent')`", "A function SharePoint does not support", "`substringof('urgent', Title)`"],
      ["`Title eq 'O'Brien'`", "An apostrophe ends the text early", "`Title eq 'O''Brien'`"],
      ["`DueDate lt 2026-12-31`", "A date without quotes", "`DueDate lt '2026-12-31'`"]
    ),
    p("Three more causes do not show in the filter as you typed it."),
    ul(
      "**An empty dynamic value.** `Amount gt ` followed by nothing is not valid. Open the action's inputs in the failed run to see the filter as it was sent.",
      "**Capital letters in operators.** `EQ` and `AND` are not recognized. Operators are lowercase.",
      "**A column that cannot be filtered**, such as a calculated column or a multiple lines of text column."
    )
  ],
  fixes: [
    ol(
      "Open the failed run, select the Get items action and read **Filter Query** under inputs. This is the filter after every dynamic value was filled in.",
      "Look for a missing value, a missing quote or an apostrophe in a value.",
      "Replace dynamic values with fixed ones and run again. If it now works, the value is the problem, not the structure.",
      "Remove conditions one at a time until the query is accepted. The last one removed is the broken one."
    ),
    p("For a value that may contain an apostrophe, double it with `replace`."),
    code(`Title eq '@{replace(triggerBody()?['Title'], '''', '''''')}'`, "Filter Query"),
    p("For a value that may be empty, either give it a fallback with `coalesce` or put the Get items action inside a condition that checks the value first."),
    tool("odata-filter-query-builder", "Rebuild the filter in the builder. It adds the quotes, uses substringof for contains and writes the right path for person and lookup columns.")
  ],
  prevention: [
    ul(
      "Build the filter with fixed values first, then swap in dynamic content one value at a time.",
      "Use choice columns for values you filter on, so there are no stray apostrophes or spellings.",
      "Keep the filter in the Filter Query as simple as SharePoint needs, and do the rest in a Filter array."
    ),
    p("The [Filter Query guide](/guides/sharepoint-get-items-filter-query) lists the operators that work and the form for each column type.")
  ],
  faqs: [
    { question: "Why is my Get items Filter Query not valid?", answer: "The usual causes are text or a date without single quotes, a symbol such as = in place of eq, the contains function in place of substringof, an apostrophe inside a value, and a dynamic value that was empty when the flow ran." },
    { question: "How do I see the Filter Query that was actually sent?", answer: "Open the failed run, select the Get items action and look at its inputs. The Filter Query shown there has every dynamic value filled in." },
    { question: "How do I filter on a value that contains an apostrophe?", answer: "Write the apostrophe twice inside the quoted value. For a dynamic value, use replace to double every apostrophe before it goes into the filter." }
  ],
  relatedTools: ["odata-filter-query-builder", "sharepoint-internal-name-helper"],
  relatedPatterns: ["use-odata-filters-sharepoint-text-fields", "filter-array-instead-of-apply-to-each"],
  relatedLinks: [
    { href: "/guides/sharepoint-get-items-filter-query", label: "Get items Filter Query by column type" },
    { href: "/guides/power-automate-filter-query-by-date", label: "Filter SharePoint items by date" }
  ],
  relatedErrors: ["column-does-not-exist-deleted-by-another-user", "exceeds-list-view-threshold-power-automate"],
  sources: [sharePointODataDoc, troubleshootDoc]
};

export const flowErrorsOne: ErrorPage[] = [
  invalidTemplate,
  nullParameter,
  validArray,
  parseJsonValidation,
  propertyCannotBeSelected,
  iso8601,
  expressionInvalid,
  columnDoesNotExist,
  queryNotValid
];
