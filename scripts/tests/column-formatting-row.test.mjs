import assert from "node:assert/strict";
import test from "node:test";
import { multiChoicePillsFormat, rowHighlightFormat } from "../../lib/tools/column-formatting.ts";

const rules = [
  { value: "Late", color: "red" },
  { value: "Done", color: "green" },
  { value: "Draft", color: "grey" }
];

test("multi-choice pills loop over each selected value", () => {
  const format = multiChoicePillsFormat(rules);
  const pill = format.children[0];
  assert.equal(pill.forEach, "choice in @currentField");
  assert.equal(pill.txtContent, "[$choice]");
  assert.ok(pill.style["background-color"].startsWith("=if([$choice] == 'Late', '#fde7e9'"));
});

test("row formatting uses SharePoint's highlight classes and skips colors without one", () => {
  const format = rowHighlightFormat("Status", rules);
  assert.equal(format.$schema, "https://developer.microsoft.com/json-schemas/sp/v2/row-formatting.schema.json");
  assert.equal(
    format.additionalRowClass,
    "=if([$Status] == 'Late', 'sp-field-severity--severeWarning', if([$Status] == 'Done', 'sp-field-severity--good', ''))"
  );
});

test("row formatting cleans the column name", () => {
  assert.ok(rowHighlightFormat("Request Status", rules).additionalRowClass.includes("[$RequestStatus]"));
  assert.equal(rowHighlightFormat("Status", [{ value: "Draft", color: "grey" }]).additionalRowClass, "");
});
