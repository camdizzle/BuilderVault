// Tests for lib/tools/power-fx-format.ts.
// Run with: npm run test:formatter (Node 22.6+ strips the TypeScript types).
import assert from "node:assert/strict";
import {
  findDelegationHints,
  formatPowerFxFormula,
  minifyPowerFxFormula,
  significantTokens
} from "../lib/tools/power-fx-format.ts";

let failures = 0;
let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failures += 1;
    console.error("FAIL " + name);
    console.error("  " + String(error.message).split("\n").join("\n  "));
  }
}

const corpus = [
  `IfError(
Set(varSavedRequest,Patch(Requests,Defaults(Requests),{Title:txtTitle.Text,RequestStatus:{Value:"Submitted"},DueDate:dpDueDate.SelectedDate}));Notify("Request saved.",NotificationType.Success),Notify("The request could not be saved.",NotificationType.Error))`,
  `If(CountRows(colItems)>=5&&varMode<>"View",Set(varTooMany,true),Set(varTooMany,false))`,
  `Filter('Project Requests',Status.Value="Open"||Status.Value="In Review",Owner.Email=Lower(User().Email))`,
  `Patch(Requests,ThisItem,{'Due Date':DateAdd(Today(),-7,TimeUnit.Days),Score:-1*varScore,Ratio:50%})`,
  `// Save the request
Set(varX, 1); /* block comment */ Notify("Done ""quoted"" text", NotificationType.Success)`,
  `$"Hello {User().FullName}, you have {CountRows(Filter(Tasks, Owner = "Me {x}"))} tasks"`,
  `With({total:Sum(colLines,Amount*Quantity),tax:0.0825},Text(total*(1+tax),"[$-en-US]$#,##0.00"))`,
  `Switch(varStatus,"Draft",Color.Gray,"Submitted",RGBA(0,120,212,1),"Approved",Color.Green,Color.Black)`,
  `ClearCollect(colTable,[1,2,3]);ForAll(colTable As row,Collect(colOut,{Value:row.Value^2}))`,
  `Navigate(scrDetails,ScreenTransition.Fade,{selected:galRequests.Selected})`,
  `Not(IsBlank(txtName.Text)) And !IsEmpty(colItems) Or 1e-3 > .5`,
  `Set(a, "path\\to\\file"); Set(b, "C:\\")`,
  `If(x = 1, // first branch
"one", "other")`,
  `Filter(Tasks, Title in ["A", "B"], Priority exactin colPriorities)`,
  ``,
  `Patch(Requests, Defaults(Requests), {Title: "Unclosed"`
];

for (const [index, formula] of corpus.entries()) {
  test(`format is lossless #${index}`, () => {
    const { output } = formatPowerFxFormula(formula);
    assert.deepEqual(significantTokens(output), significantTokens(formula));
  });

  test(`format is idempotent #${index}`, () => {
    const once = formatPowerFxFormula(formula).output;
    const twice = formatPowerFxFormula(once).output;
    assert.equal(twice, once);
  });

  test(`minify is lossless #${index}`, () => {
    const { output } = minifyPowerFxFormula(formula);
    assert.deepEqual(significantTokens(output), significantTokens(formula));
    assert.ok(!output.includes("\n"), "minified output should be one line");
  });

  for (const width of [40, 120]) {
    for (const indent of [0, 2]) {
      test(`format is lossless at width ${width}, indent ${indent} #${index}`, () => {
        const { output } = formatPowerFxFormula(formula, { width, indent });
        assert.deepEqual(significantTokens(output), significantTokens(formula));
      });
    }
  }
}

test("multi-character operators stay intact", () => {
  const { output } = formatPowerFxFormula(`If(a>=1&&b<>2||c<=3,x,y)`);
  assert.equal(output, `If(a >= 1 && b <> 2 || c <= 3, x, y)`);
});

test("comments are not split", () => {
  const { output } = formatPowerFxFormula(`// keep me\nSet(a,1)`);
  assert.equal(output, `// keep me\nSet(a, 1)`);
});

test("unary minus and percent", () => {
  const { output } = formatPowerFxFormula(`Set(a,-1*b+50%)`);
  assert.equal(output, `Set(a, -1 * b + 50%)`);
});

test("quoted names and dotted access", () => {
  const { output } = formatPowerFxFormula(`ThisItem.'Due Date'`);
  assert.equal(output, `ThisItem.'Due Date'`);
});

test("short calls stay on one line", () => {
  const { output } = formatPowerFxFormula(`Lower(User().Email)`);
  assert.equal(output, `Lower(User().Email)`);
});

test("chained statements go on separate lines", () => {
  const { output } = formatPowerFxFormula(`Set(a,1);Set(b,2)`);
  assert.equal(output, `Set(a, 1);\nSet(b, 2)`);
});

test("long calls break one argument per line", () => {
  const { output } = formatPowerFxFormula(
    `Patch(Requests,Defaults(Requests),{Title:txtTitle.Text,RequestStatus:{Value:"Submitted"},DueDate:dpDueDate.SelectedDate})`
  );
  assert.equal(
    output,
    [
      "Patch(",
      "    Requests,",
      "    Defaults(Requests),",
      "    {",
      "        Title: txtTitle.Text,",
      '        RequestStatus: {Value: "Submitted"},',
      "        DueDate: dpDueDate.SelectedDate",
      "    }",
      ")"
    ].join("\n")
  );
});

test("European separators", () => {
  const { output } = formatPowerFxFormula(`Set(a;1,5);;Set(b;2)`, { locale: "eu" });
  assert.equal(output, `Set(a; 1,5);;\nSet(b; 2)`);
});

test("unbalanced brackets are reported", () => {
  const { issues } = formatPowerFxFormula(`Patch(Requests, {Title: "x"`);
  assert.ok(issues.length > 0);
});

test("unclosed text is reported", () => {
  const { issues } = formatPowerFxFormula(`Notify("oops)`);
  assert.ok(issues.some((issue) => issue.message.includes("double quote")));
});

test("balanced formula has no issues", () => {
  const { issues } = formatPowerFxFormula(corpus[0]);
  assert.equal(issues.length, 0);
});

test("delegation: Lower inside Filter", () => {
  const hints = findDelegationHints(`Filter(Tasks, Lower(Title) = "x")`);
  assert.ok(hints.some((hint) => hint.title.startsWith("Lower")));
});

test("delegation: in operator", () => {
  const hints = findDelegationHints(`Filter(Tasks, "abc" in Title)`);
  assert.ok(hints.some((hint) => hint.title.includes('"in"')));
});

test("delegation: Search and CountRows", () => {
  const hints = findDelegationHints(`CountRows(Search(Tasks, txtSearch.Text, "Title"))`);
  assert.ok(hints.some((hint) => hint.title === "Search()"));
});

test("delegation: plain equality has no hints", () => {
  const hints = findDelegationHints(`Filter(Tasks, Status = "Open", Owner.Email = varUserEmail)`);
  assert.equal(hints.length, 0);
});

test("delegation: AddColumns on a data source", () => {
  const hints = findDelegationHints(`AddColumns(Tasks, "Days", DateDiff(Created, Today()))`);
  assert.ok(hints.some((hint) => hint.title.startsWith("AddColumns")));
});

console.log(`${passed} passed, ${failures} failed`);
if (failures > 0) process.exit(1);
