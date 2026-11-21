import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { actionName, buildExpression, expressionTemplates, quote, templateGroups } from "../../lib/tools/expression-templates.ts";

const byId = (id) => expressionTemplates.find((template) => template.id === id);
const errorSlugs = new Set(
  readdirSync("lib/errors")
    .filter((file) => file.endsWith(".ts"))
    .flatMap((file) => [...readFileSync(`lib/errors/${file}`, "utf8").matchAll(/slug: "([a-z0-9-]+)"/g)].map((match) => match[1]))
);
const toolSlugs = new Set([...readFileSync("lib/resources.ts", "utf8").matchAll(/slug: "([a-z0-9-]+)"/g)].map((match) => match[1]));

test("template ids are unique and every group has templates", () => {
  assert.equal(new Set(expressionTemplates.map((template) => template.id)).size, expressionTemplates.length);
  for (const group of templateGroups) assert.ok(expressionTemplates.some((template) => template.group === group), group);
});

test("every template builds with its defaults and has notes", () => {
  for (const template of expressionTemplates) {
    const { expression } = buildExpression(template, {});
    assert.ok(expression.length > 0, template.id);
    assert.ok(template.notes.length > 0, template.id);
    assert.equal(expression.split("(").length, expression.split(")").length, `${template.id} has balanced brackets`);
  }
});

test("links point to pages that exist", () => {
  for (const template of expressionTemplates) {
    for (const link of template.links) {
      const [, section, slug] = link.href.split("/");
      if (section === "errors") assert.ok(errorSlugs.has(slug), `${template.id} links to missing error ${slug}`);
      else if (section === "tools") assert.ok(toolSlugs.has(slug), `${template.id} links to missing tool ${slug}`);
      else assert.fail(`${template.id} has an unexpected link ${link.href}`);
    }
  }
});

test("text is quoted with doubled single quotes", () => {
  assert.equal(quote("O'Brien"), "'O''Brien'");
  const { expression } = buildExpression(byId("fallback-null"), { fallback: "Not set by O'Brien" });
  assert.equal(expression, "coalesce(triggerOutputs()?['body/Title'], 'Not set by O''Brien')");
});

test("the date format template is safe when the date is empty", () => {
  const { expression } = buildExpression(byId("format-date-safe"), {});
  assert.equal(expression, "if(empty(triggerOutputs()?['body/DueDate']), '', formatDateTime(triggerOutputs()?['body/DueDate'], 'MMM d, yyyy'))");
});

test("action names use underscores", () => {
  assert.equal(actionName("Get items 2"), "Get_items_2");
  assert.equal(buildExpression(byId("count-items"), { action: "Get open requests" }).expression, "length(body('Get_open_requests')?['value'])");
});

test("trigger conditions start with @", () => {
  assert.equal(buildExpression(byId("trigger-choice"), { column: "RequestStatus", choice: "Submitted" }).expression, "@equals(triggerOutputs()?['body/RequestStatus/Value'], 'Submitted')");
});

test("escape template doubles quotes", () => {
  assert.equal(buildExpression(byId("escape-odata"), {}).expression, "replace(triggerOutputs()?['body/Title'], '''', '''''')");
});

test("a value wrapped in @{ } is unwrapped with a note", () => {
  const result = buildExpression(byId("clean-email"), { value: "@{triggerOutputs()?['body/Email']}" });
  assert.equal(result.expression, "toLower(trim(coalesce(triggerOutputs()?['body/Email'], '')))");
  assert.equal(result.notes.length, 1);
});

test("a number that isn't whole falls back to the default", () => {
  const result = buildExpression(byId("add-days"), { days: "seven" });
  assert.ok(result.expression.includes(", 7, "));
  assert.equal(result.notes.length, 1);
});

test("days between uses ticks per day", () => {
  assert.equal(buildExpression(byId("days-between"), { start: "a", end: "b" }).expression, "div(sub(ticks(b), ticks(a)), 864000000000)");
});
