"use client";

import Link from "next/link";
import { useState } from "react";
import { Toggle, ToolNotes, ToolShell } from "@/components/resources/tool-shell";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { buildExpression, expressionTemplates, templateGroups, type TemplateGroup } from "@/lib/tools/expression-templates";

export function ExpressionBuilder() {
  const [group, setGroup] = useState<TemplateGroup>("Dates and times");
  const [templateId, setTemplateId] = useState(expressionTemplates[0].id);
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const inGroup = expressionTemplates.filter((template) => template.group === group);
  const template = expressionTemplates.find((candidate) => candidate.id === templateId) ?? inGroup[0];
  const typed = values[template.id] ?? {};
  const result = buildExpression(template, typed);

  function pickGroup(next: TemplateGroup) {
    setGroup(next);
    setTemplateId(expressionTemplates.find((candidate) => candidate.group === next)?.id ?? expressionTemplates[0].id);
  }

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [template.id]: { ...(current[template.id] ?? {}), [key]: value } }));
  }

  const isTriggerCondition = result.expression.startsWith("@");

  return (
    <ToolShell
      title="Expression builder"
      description="Pick what you need to do, fill in your own values, and copy an expression that handles empty values and quotes for you. Each template explains its inputs and links to the error it helps you avoid."
    >
      <div className="badge-row" role="group" aria-label="Expression groups">
        {templateGroups.map((name) => (
          <Toggle checked={group === name} key={name} label={name} onChange={() => pickGroup(name)} />
        ))}
      </div>
      <label className="field">
        <span>Expression</span>
        <select onChange={(event) => setTemplateId(event.target.value)} value={template.id}>
          {inGroup.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>{candidate.title}</option>
          ))}
        </select>
      </label>
      <p style={{ color: "#415049", lineHeight: 1.6, margin: 0 }}>{template.summary}</p>
      {template.inputs.length > 0 ? (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {template.inputs.map((input) => {
            const value = typed[input.key] ?? input.defaultValue;
            return (
              <label className="field" key={input.key} style={{ minWidth: 0 }}>
                <span>{input.label}</span>
                {input.kind === "choice" ? (
                  <select onChange={(event) => setValue(input.key, event.target.value)} value={value}>
                    {(input.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    inputMode={input.kind === "number" ? "numeric" : undefined}
                    onChange={(event) => setValue(input.key, event.target.value)}
                    spellCheck={false}
                    value={value}
                  />
                )}
                <small style={{ color: "var(--muted)", lineHeight: 1.5 }}>{input.help}</small>
              </label>
            );
          })}
        </div>
      ) : null}
      <CopyCodeBlock code={result.expression} copyEvent="Expression Copied" label={isTriggerCondition ? "Trigger condition" : "Expression"} />
      <ToolNotes notes={result.notes} />
      <div className="stat-tile">
        <div className="eyebrow">How to use it</div>
        <ul style={{ color: "#415049", lineHeight: 1.6, margin: 0, paddingLeft: 20 }}>
          {isTriggerCondition ? (
            <li>Open the trigger&apos;s Settings, add a trigger condition, and paste it with the @ at the start.</li>
          ) : (
            <li>Paste it into the expression editor (fx) in any action field, without adding @ or {"@{ }"} around it.</li>
          )}
          {template.notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
        {template.links.length > 0 ? (
          <div className="badge-row" style={{ marginTop: 10 }}>
            {template.links.map((link) => (
              <Link className="badge" href={link.href} key={link.href}>{link.label}</Link>
            ))}
          </div>
        ) : null}
      </div>
    </ToolShell>
  );
}
