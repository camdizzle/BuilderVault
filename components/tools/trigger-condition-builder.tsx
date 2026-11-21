"use client";

import { useState } from "react";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { Toggle, ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import {
  buildTriggerCondition,
  changedColumnsHelp,
  fieldTypesFor,
  operatorNeedsValue,
  triggerFieldTypeLabels,
  triggerOperatorLabels,
  triggerOperatorsFor,
  type TriggerFieldType,
  type TriggerJoin,
  type TriggerOperator,
  type TriggerRule,
  type TriggerSource
} from "@/lib/tools/trigger-condition";

const starterRules: Record<TriggerSource, TriggerRule[]> = {
  sharepoint: [
    { field: "Status", type: "choice", operator: "equals", value: "Submitted" },
    { field: "Amount", type: "number", operator: "greater", value: "1000" }
  ],
  dataverse: [
    { field: "statuscode", type: "choice", operator: "equals", value: "1" },
    { field: "description", type: "text", operator: "notEmpty", value: "" }
  ],
  other: [{ field: "status", type: "text", operator: "equals", value: "Submitted" }]
};

const sourceLabels: Record<TriggerSource, string> = {
  sharepoint: "SharePoint: When an item is created or modified",
  dataverse: "Dataverse: When a row is added, modified or deleted",
  other: "Another trigger (reads triggerBody)"
};

export function TriggerConditionBuilder() {
  const [source, setSource] = useState<TriggerSource>("sharepoint");
  const [join, setJoin] = useState<TriggerJoin>("and");
  const [rules, setRules] = useState<TriggerRule[]>(starterRules.sharepoint);
  const [guardEnabled, setGuardEnabled] = useState(false);
  const [guardValue, setGuardValue] = useState("");
  const [groupJoin, setGroupJoin] = useState<TriggerJoin>("and");
  const [useGroups, setUseGroups] = useState(false);
  const [changedColumns, setChangedColumns] = useState("");
  const result = buildTriggerCondition(source, useGroups ? rules : rules.map((rule) => ({ ...rule, group: 1 })), join, { enabled: guardEnabled, value: guardValue }, groupJoin);
  const changed = changedColumnsHelp(source, changedColumns);
  const groupCount = Math.max(1, ...rules.map((rule) => rule.group ?? 1));

  function switchSource(next: TriggerSource) {
    setSource(next);
    setRules(starterRules[next]);
    setGuardValue("");
    if (next === "other") setGuardEnabled(false);
  }

  function updateRule(index: number, patch: Partial<TriggerRule>) {
    setRules((current) =>
      current.map((rule, ruleIndex) => {
        if (ruleIndex !== index) return rule;
        const next = { ...rule, ...patch };
        const allowed = triggerOperatorsFor(next.type);
        return allowed.includes(next.operator) ? next : { ...next, operator: allowed[0] };
      })
    );
  }

  return (
    <ToolShell
      title="Trigger condition builder"
      description="Choose the trigger, add a rule for each column you want to check, and copy the condition into the trigger's Settings, under Trigger conditions. The flow only starts when the condition is true."
    >
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label className="field" style={{ minWidth: 0 }}>
          <span>Trigger</span>
          <select value={source} onChange={(event) => switchSource(event.target.value as TriggerSource)}>
            {(Object.keys(sourceLabels) as TriggerSource[]).map((key) => (
              <option key={key} value={key}>{sourceLabels[key]}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{useGroups ? "Inside each group, start when" : "Start the flow when"}</span>
          <select value={join} onChange={(event) => setJoin(event.target.value as TriggerJoin)}>
            <option value="and">All rules match (and)</option>
            <option value="or">Any rule matches (or)</option>
          </select>
        </label>
        {useGroups ? (
          <label className="field">
            <span>Between groups, start when</span>
            <select value={groupJoin} onChange={(event) => setGroupJoin(event.target.value as TriggerJoin)}>
              <option value="and">All groups match (and)</option>
              <option value="or">Any group matches (or)</option>
            </select>
          </label>
        ) : null}
      </div>
      <div className="badge-row">
        <Toggle checked={useGroups} label="Group rules, such as (A or B) and C" onChange={setUseGroups} />
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {rules.map((rule, index) => (
          <fieldset key={index} style={{ border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 10, margin: 0, padding: 14 }}>
            <legend style={{ fontWeight: 800, padding: "0 6px" }}>Rule {index + 1}</legend>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
              <label className="field">
                <span>{source === "sharepoint" ? "Internal name" : source === "dataverse" ? "Logical name" : "Property name"}</span>
                <input spellCheck={false} value={rule.field} onChange={(event) => updateRule(index, { field: event.target.value })} />
              </label>
              <label className="field">
                <span>Column type</span>
                <select value={rule.type} onChange={(event) => updateRule(index, { type: event.target.value as TriggerFieldType })}>
                  {fieldTypesFor(source).map((type) => (
                    <option key={type} value={type}>{triggerFieldTypeLabels[type]}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Rule</span>
                <select value={rule.operator} onChange={(event) => updateRule(index, { operator: event.target.value as TriggerOperator })}>
                  {triggerOperatorsFor(rule.type).map((operator) => (
                    <option key={operator} value={operator}>{triggerOperatorLabels[operator]}</option>
                  ))}
                </select>
              </label>
              {useGroups ? (
                <label className="field">
                  <span>Group</span>
                  <select value={rule.group ?? 1} onChange={(event) => updateRule(index, { group: Number(event.target.value) })}>
                    {Array.from({ length: Math.min(groupCount + 1, rules.length) }, (_, group) => (
                      <option key={group + 1} value={group + 1}>Group {group + 1}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              {operatorNeedsValue(rule.operator) ? (
                <label className="field">
                  <span>Value</span>
                  <input
                    placeholder={rule.type === "date" ? "2026-01-31" : rule.type === "person" ? "name@contoso.com" : rule.type === "lookup" ? "Row GUID" : ""}
                    spellCheck={false}
                    value={rule.value}
                    onChange={(event) => updateRule(index, { value: event.target.value })}
                  />
                </label>
              ) : null}
            </div>
            {rules.length > 1 ? (
              <div>
                <button className="link-button" onClick={() => setRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index))} style={{ color: "var(--accent-strong)" }} type="button">
                  Remove rule
                </button>
              </div>
            ) : null}
          </fieldset>
        ))}
        <div>
          <button
            className="button secondary"
            onClick={() => setRules((current) => [...current, { field: "", type: "text", operator: "equals", value: "", group: current[current.length - 1]?.group ?? 1 }])}
            type="button"
          >
            Add rule
          </button>
        </div>
      </div>

      {source !== "other" ? (
        <div style={{ display: "grid", gap: 10 }}>
          <Toggle checked={guardEnabled} label="Ignore changes made by the flow's own account" onChange={setGuardEnabled} />
          {guardEnabled ? (
            <label className="field">
              <span>{source === "sharepoint" ? "Email of the account the flow's connection uses" : "User GUID (systemuserid) of the flow's connection account"}</span>
              <input spellCheck={false} value={guardValue} onChange={(event) => setGuardValue(event.target.value)} placeholder={source === "sharepoint" ? "flow-service@contoso.com" : "00000000-0000-0000-0000-000000000000"} />
            </label>
          ) : null}
        </div>
      ) : null}

      <CopyCodeBlock code={result.combined || "Add a rule to build the condition."} copyEvent="Trigger Condition Copied" label="Trigger condition (one box)" />
      {result.separate.length > 1 ? (
        <CopyCodeBlock
          code={result.separate.join("\n")}
          copyEvent="Trigger Condition Copied"
          label="Or one condition per box (all must be true)"
        />
      ) : null}
      <ToolNotes notes={result.notes} />

      {source !== "other" ? (
        <fieldset style={{ border: "1px solid var(--line)", borderRadius: 8, display: "grid", gap: 10, margin: 0, padding: 14 }}>
          <legend style={{ fontWeight: 800, padding: "0 6px" }}>Only when a column changes (optional)</legend>
          <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>
            A trigger condition sees the item as it is now, not what changed. Enter the columns to watch to get the {source === "dataverse" ? "Select columns value for the trigger" : "steps and expression for SharePoint"}.
          </p>
          <label className="field">
            <span>{source === "dataverse" ? "Logical names, comma separated" : "Internal names, comma separated"}</span>
            <input placeholder={source === "dataverse" ? "statuscode, ownerid" : "Status, Priority"} spellCheck={false} value={changedColumns} onChange={(event) => setChangedColumns(event.target.value)} />
          </label>
          {changed ? (
            <>
              <CopyCodeBlock code={changed.value} copyEvent="Trigger Condition Copied" label={changed.label} />
              <ToolNotes notes={changed.notes} title="How to use it" />
            </>
          ) : null}
        </fieldset>
      ) : null}
    </ToolShell>
  );
}
