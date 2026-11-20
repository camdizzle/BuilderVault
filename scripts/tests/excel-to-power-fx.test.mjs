import assert from "node:assert/strict";
import test from "node:test";
import { criteriaToComparison, parseReferenceMap, tokenizeExcel, translateExcelFormula } from "../../lib/tools/excel-to-power-fx.ts";

const flat = (formula, map) => translateExcelFormula(formula, map).formula.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")");

test("tokenizer separates refs, names, and strings", () => {
  const kinds = tokenizeExcel('=IF(A2>10,"He said ""hi""",Sheet1!$B$3)').map((token) => token.kind);
  assert.deepEqual(kinds, ["name", "lparen", "ref", "op", "number", "comma", "string", "comma", "ref", "rparen"]);
  assert.equal(tokenizeExcel("LOG10(5)")[0].kind, "name");
  assert.equal(tokenizeExcel("A:A")[0].kind, "ref");
});

test("renames functions and booleans", () => {
  assert.equal(flat('=IF(AND(A1>0,B1<>""),UPPER(C1),"n/a")', "A1=numQty.Value\nB1=txtName.Text\nC1=txtName.Text"), 'If(And(numQty.Value > 0, txtName.Text <> ""), Upper(txtName.Text), "n/a")');
  assert.equal(flat("=IFS(A1>90,\"A\",TRUE,\"B\")", "A1=Score"), 'If(Score > 90, "A", true, "B")');
  assert.equal(flat("=ROUND(A1*1.2,2)&\" USD\"", "a1 = Price"), 'Round(Price * 1.2, 2) & " USD"');
});

test("unary minus and percent", () => {
  assert.equal(flat("=-A1*10%", "A1=x"), "-x * 10%");
});

test("date functions", () => {
  assert.equal(flat('=DATEDIF(A1,B1,"d")', "A1=StartDate\nB1=EndDate"), "DateDiff(StartDate, EndDate, TimeUnit.Days)");
  assert.equal(flat("=DAYS(B1,A1)", "A1=StartDate\nB1=EndDate"), "DateDiff(StartDate, EndDate, TimeUnit.Days)");
  assert.equal(flat("=EOMONTH(TODAY(),0)"), "EOMonth(Today(), 0)");
});

test("lookups become LookUp with placeholders and a note", () => {
  const result = translateExcelFormula("=VLOOKUP(A2,Products!A:C,3,FALSE)", "A2=cmbProduct.Selected.Value");
  assert.equal(result.formula.replace(/\s+/g, " "), "LookUp(YourTable, KeyColumn = cmbProduct.Selected.Value, ResultColumn)");
  assert.ok(result.notes.some((note) => note.includes("VLOOKUP becomes LookUp")));
  assert.deepEqual(result.unmappedReferences, []);
  assert.equal(flat('=XLOOKUP(A2,B:B,C:C,"None")', "A2=v"), 'Coalesce(LookUp(YourTable, KeyColumn = v, ResultColumn), "None")');
});

test("criteria and conditional aggregates", () => {
  assert.equal(criteriaToComparison("Col", '">10"'), "Col > 10");
  assert.equal(criteriaToComparison("Col", '"Open"'), 'Col = "Open"');
  assert.equal(criteriaToComparison("Col", '"<>Closed"'), 'Col <> "Closed"');
  assert.equal(criteriaToComparison("Col", "varStatus"), "Col = varStatus");
  assert.equal(flat('=SUMIF(A:A,"Open",B:B)'), 'Sum(Filter(YourTable, CriteriaColumn = "Open"), ValueColumn)');
  assert.equal(flat('=COUNTIFS(A:A,"Open",B:B,">5")'), 'CountIf(YourTable, CriteriaColumn1 = "Open" && CriteriaColumn2 > 5)');
  assert.equal(flat("=SUM(B2:B10)"), "Sum(YourTable, ColumnName)");
  assert.equal(flat("=SUM(A1,B1)", "A1=x\nB1=y"), "Sum(x, y)");
});

test("unmapped references and unknown functions are reported", () => {
  const result = translateExcelFormula("=A1+$B$2");
  assert.deepEqual(result.unmappedReferences, ["A1", "B2"]);
  assert.ok(result.notes[0].includes("A1, B2"));
  const unknown = translateExcelFormula("=OFFSET(A1,1,1)", "A1=x");
  assert.ok(unknown.notes.some((note) => note.startsWith("OFFSET has no translation")));
  assert.ok(unknown.formula.includes("OFFSET("));
});

test("search, unbalanced brackets, and empty input", () => {
  assert.equal(flat('=SEARCH("a",A1)', "A1=t"), 'Find(Lower("a"), Lower(t))');
  assert.ok(translateExcelFormula("=IF(A1>1,2").notes.some((note) => note.includes("don't balance")));
  assert.equal(translateExcelFormula("  ").formula, "");
});

test("reference map parsing", () => {
  const map = parseReferenceMap("A2 = txtPrice.Value\n$b$3=varRate\nnot a mapping");
  assert.equal(map.get("A2"), "txtPrice.Value");
  assert.equal(map.get("B3"), "varRate");
  assert.equal(map.size, 2);
});
