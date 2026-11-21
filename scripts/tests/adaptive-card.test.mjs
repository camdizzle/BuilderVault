import assert from "node:assert/strict";
import test from "node:test";
import { buildCard, parseFacts, parseLines, responseExpressions } from "../../lib/tools/adaptive-card.ts";

const base = { title: "Approval needed", body: "Please decide.", facts: [], actions: ["Approve", "Reject"], viewUrl: "", withComment: false, choiceLabel: "", choices: [], withDate: false, dateLabel: "", twoColumns: false };

test("facts and lines are parsed", () => {
  assert.deepEqual(parseFacts("Request|A|B\n|x\nOwner|Ana"), [{ title: "Request", value: "A|B" }, { title: "Owner", value: "Ana" }]);
  assert.deepEqual(parseLines("Low\n\nHigh\nLow"), ["Low", "High"]);
});

test("buttons become submit actions with the decision", () => {
  const card = buildCard(base);
  assert.deepEqual(card.actions[0], { type: "Action.Submit", title: "Approve", data: { decision: "Approve" } });
  assert.equal(card.body.length, 2);
});

test("dropdown, date and comment inputs", () => {
  const card = buildCard({ ...base, choices: ["Low", "High"], choiceLabel: "Priority", withDate: true, withComment: true });
  const types = card.body.map((element) => element.type);
  assert.deepEqual(types.slice(-3), ["Input.ChoiceSet", "Input.Date", "Input.Text"]);
  assert.deepEqual(card.body.at(-3).choices, [{ title: "Low", value: "Low" }, { title: "High", value: "High" }]);
});

test("two columns only when there is a message and facts", () => {
  assert.equal(buildCard({ ...base, twoColumns: true }).body[1].type, "TextBlock");
  assert.equal(buildCard({ ...base, twoColumns: true, facts: [{ title: "A", value: "1" }] }).body[1].type, "ColumnSet");
});

test("response expressions follow the inputs", () => {
  const lines = responseExpressions({ ...base, choices: ["Low"], withComment: true });
  assert.deepEqual(lines.map((line) => line.label), ["Button chosen", "Dropdown value", "Comment", "Who responded"]);
  assert.equal(lines[0].expression, "body('Post_adaptive_card_and_wait_for_a_response')?['data']?['decision']");
});
