"use client";

import { useState } from "react";
import { Toggle, ToolShell } from "@/components/resources/tool-shell";
import { CopyCodeBlock } from "@/components/ui/copy-code-block";
import { buildCard, parseFacts, parseLines, responseExpressions } from "@/lib/tools/adaptive-card";

const adaptiveCardTemplates = {
  approval: {
    label: "Approval request",
    title: "Approval needed: @{triggerBody()?['Title']}",
    body: "@{triggerBody()?['Author']?['DisplayName']} submitted a request that needs your decision.",
    facts: "Request|@{triggerBody()?['Title']}\nRequested by|@{triggerBody()?['Author']?['DisplayName']}\nDue|@{formatDateTime(triggerBody()?['DueDate'], 'MMM d, yyyy')}",
    actions: "Approve\nReject",
    withComment: true
  },
  notification: {
    label: "Notification",
    title: "Request updated",
    body: "The status of @{triggerBody()?['Title']} changed to @{triggerBody()?['Status']?['Value']}.",
    facts: "Status|@{triggerBody()?['Status']?['Value']}\nUpdated by|@{triggerBody()?['Editor']?['DisplayName']}",
    actions: "",
    withComment: false
  },
  review: {
    label: "Review with comments",
    title: "Please review: @{triggerBody()?['Title']}",
    body: "Add a comment and choose an outcome.",
    facts: "Request|@{triggerBody()?['Title']}\nOwner|@{triggerBody()?['Author']?['Email']}",
    actions: "Submit review",
    withComment: true
  }
} as const;

type CardTemplateKey = keyof typeof adaptiveCardTemplates;

export function AdaptiveCardBuilder() {
  const [templateKey, setTemplateKey] = useState<CardTemplateKey>("approval");
  const template = adaptiveCardTemplates[templateKey];
  const [title, setTitle] = useState<string>(template.title);
  const [body, setBody] = useState<string>(template.body);
  const [factsText, setFactsText] = useState<string>(template.facts);
  const [actionsText, setActionsText] = useState<string>(template.actions);
  const [withComment, setWithComment] = useState<boolean>(template.withComment);
  const [viewUrl, setViewUrl] = useState("");
  const [choicesText, setChoicesText] = useState("");
  const [choiceLabel, setChoiceLabel] = useState("Priority");
  const [withDate, setWithDate] = useState(false);
  const [dateLabel, setDateLabel] = useState("Due date");
  const [twoColumns, setTwoColumns] = useState(false);

  function applyTemplate(key: CardTemplateKey) {
    const next = adaptiveCardTemplates[key];
    setTemplateKey(key);
    setTitle(next.title);
    setBody(next.body);
    setFactsText(next.facts);
    setActionsText(next.actions);
    setWithComment(next.withComment);
  }

  const facts = parseFacts(factsText);
  const actions = parseLines(actionsText);
  const choices = parseLines(choicesText);
  const options = { title, body, facts, actions, viewUrl, withComment, choiceLabel, choices, withDate, dateLabel, twoColumns };
  const card = buildCard(options);
  const responses = responseExpressions(options);
  const json = JSON.stringify(card, null, 2);

  return (
    <ToolShell title="Adaptive Card builder" description="Pick a starting layout, edit the text, facts, and buttons, then copy the JSON into the Post adaptive card in a chat or channel action in Power Automate. The preview is a simplified sketch, not the exact Teams rendering.">
      <div className="badge-row">
        {(Object.keys(adaptiveCardTemplates) as CardTemplateKey[]).map((key) => (
          <Toggle checked={templateKey === key} key={key} label={adaptiveCardTemplates[key].label} onChange={() => applyTemplate(key)} />
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        <div style={{ display: "grid", gap: 12 }}>
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field">
            <span>Body text</span>
            <input value={body} onChange={(event) => setBody(event.target.value)} />
          </label>
          <label className="field">
            <span>Facts, one per line as Label|Value</span>
            <textarea className="tool-textarea" onChange={(event) => setFactsText(event.target.value)} spellCheck={false} value={factsText} />
          </label>
          <label className="field">
            <span>Buttons, one per line (leave empty for none)</span>
            <textarea className="tool-textarea" onChange={(event) => setActionsText(event.target.value)} spellCheck={false} style={{ minHeight: 80 }} value={actionsText} />
          </label>
          <label className="field">
            <span>View item link (optional)</span>
            <input value={viewUrl} onChange={(event) => setViewUrl(event.target.value)} placeholder="@{triggerBody()?['{Link}']}" />
          </label>
          <label className="field">
            <span>Dropdown options, one per line (leave empty for none)</span>
            <textarea className="tool-textarea" onChange={(event) => setChoicesText(event.target.value)} placeholder={"Low\nMedium\nHigh"} spellCheck={false} style={{ minHeight: 80 }} value={choicesText} />
          </label>
          {choices.length > 0 ? (
            <label className="field">
              <span>Dropdown label</span>
              <input value={choiceLabel} onChange={(event) => setChoiceLabel(event.target.value)} />
            </label>
          ) : null}
          <Toggle checked={withComment} label="Include a comment box" onChange={setWithComment} />
          <Toggle checked={withDate} label="Include a date picker" onChange={setWithDate} />
          {withDate ? (
            <label className="field">
              <span>Date picker label</span>
              <input value={dateLabel} onChange={(event) => setDateLabel(event.target.value)} />
            </label>
          ) : null}
          <Toggle checked={twoColumns} label="Message on the left, facts on the right" onChange={setTwoColumns} />
        </div>
        <div className="adaptive-card-preview" aria-label="Card preview">
          <strong style={{ fontSize: "1.05rem" }}>{title}</strong>
          {body ? <p style={{ margin: 0 }}>{body}</p> : null}
          {facts.length > 0 ? (
            <dl style={{ display: "grid", gap: 4, gridTemplateColumns: "auto 1fr", margin: 0 }}>
              {facts.map((fact, index) => (
                <div key={index} style={{ display: "contents" }}>
                  <dt style={{ fontWeight: 700 }}>{fact.title}</dt>
                  <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {choices.length > 0 ? <div className="adaptive-card-input">{choiceLabel || "Choose an option"}: {choices[0]} ▾</div> : null}
          {withDate ? <div className="adaptive-card-input">{dateLabel || "Date"}: pick a date</div> : null}
          {withComment ? <div className="adaptive-card-input">Add a comment</div> : null}
          {actions.length > 0 || viewUrl.trim() ? (
            <div className="badge-row">
              {actions.map((action) => <span className="adaptive-card-button" key={action}>{action}</span>)}
              {viewUrl.trim() ? <span className="adaptive-card-button">View item</span> : null}
            </div>
          ) : null}
        </div>
      </div>
      <CopyCodeBlock code={json} copyEvent="Adaptive Card Copied" label="Adaptive Card JSON (version 1.4)" />
      <div className="stat-tile">
        <div className="eyebrow">Read the response in your flow</div>
        <p style={{ color: "#415049", lineHeight: 1.6, margin: "0 0 8px" }}>
          After Post adaptive card and wait for a response, use these expressions in later actions. Change the action name if yours is different.
        </p>
        <CopyCodeBlock code={responses.map((line) => `${line.label}: ${line.expression}`).join("\n")} label="Response expressions" />
      </div>
    </ToolShell>
  );
}
