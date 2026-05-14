import type { Pattern, PatternFaq } from "@/types/pattern";

export type PatternSeo = {
  seoTitle: string;
  seoDescription: string;
  searchIntent: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  intro: string[];
  finishedOutcome: string[];
  implementationChecklist: string[];
  faqs: PatternFaq[];
  topicPath: string;
  topicLabel: string;
  seoPriority: "high" | "standard" | "support";
};

const highIntentTerms = [
  "patch",
  "delegation",
  "approval",
  "trigger condition",
  "error handling",
  "try catch",
  "dataverse",
  "security role",
  "solution",
  "connection reference",
  "sharepoint list",
  "adaptive card",
  "data loss prevention",
  "dlp",
  "lookup",
  "people picker",
  "choice field"
];

const categoryTopicMap: Record<string, { label: string; path: string }> = {
  "ALM & Governance": { label: "ALM & governance", path: "/alm" },
  Dataverse: { label: "Dataverse", path: "/dataverse" },
  "Power Apps": { label: "Power Apps", path: "/power-apps" },
  "Power Automate": { label: "Power Automate", path: "/power-automate" },
  "Power Pages": { label: "Power Pages", path: "/power-pages" },
  "Power Platform Admin": { label: "Power Platform admin", path: "/alm" },
  SharePoint: { label: "SharePoint", path: "/sharepoint" },
  "Teams & Adaptive Cards": { label: "Teams and Adaptive Cards", path: "/power-automate" }
};

const deepTopicRules = [
  { label: "Power Apps patching", path: "/power-apps/patch", terms: ["patch", "people picker", "choice field", "lookup", "save"] },
  { label: "Power Apps delegation", path: "/power-apps/delegation", terms: ["delegation", "filter", "gallery", "search"] },
  { label: "Power Apps forms", path: "/power-apps/forms", terms: ["form", "screen", "wizard", "validation"] },
  { label: "Power Automate approvals", path: "/power-automate/approvals", terms: ["approval", "approvals", "manager", "route"] },
  { label: "Power Automate trigger conditions", path: "/power-automate/trigger-conditions", terms: ["trigger condition", "status changed", "trigger"] },
  { label: "Power Automate error handling", path: "/power-automate/error-handling", terms: ["try catch", "error", "failed run", "retry", "exception"] },
  { label: "SharePoint list schemas", path: "/sharepoint/list-schemas", terms: ["list schema", "schema", "internal name", "column", "view", "index"] },
  { label: "Dataverse table design", path: "/dataverse/table-design", terms: ["table", "relationship", "choice", "data model", "migration"] },
  { label: "Dataverse security roles", path: "/dataverse/security-roles", terms: ["security role", "role", "permission", "web role"] },
  { label: "Power Platform solutions", path: "/alm/solutions", terms: ["solution", "managed", "unmanaged", "deployment", "connection reference"] },
  { label: "Power Platform governance", path: "/alm/governance", terms: ["govern", "dlp", "data loss", "environment", "tenant", "maker"] },
  { label: "Teams Adaptive Cards", path: "/power-automate/adaptive-cards", terms: ["adaptive card", "card", "teams"] }
];

export function getPatternSeo(pattern: Pattern): PatternSeo {
  const title = cleanTitle(pattern.title);
  const primaryKeyword = pattern.primaryKeyword ?? buildPrimaryKeyword(pattern);
  const secondaryKeywords = pattern.secondaryKeywords ?? buildSecondaryKeywords(pattern, primaryKeyword);
  const topic = getTopic(pattern);
  const seoPriority = getSeoPriority(pattern, primaryKeyword);

  return {
    seoTitle: pattern.seoTitle ?? buildSeoTitle(pattern, primaryKeyword),
    seoDescription: pattern.seoDescription ?? buildSeoDescription(pattern, primaryKeyword),
    searchIntent: pattern.searchIntent ?? buildSearchIntent(pattern, primaryKeyword),
    primaryKeyword,
    secondaryKeywords,
    intro: buildIntro(pattern, primaryKeyword, title),
    finishedOutcome: buildFinishedOutcome(pattern),
    implementationChecklist: buildImplementationChecklist(pattern),
    faqs: pattern.faqs ?? buildFaqs(pattern, primaryKeyword),
    topicLabel: topic.label,
    topicPath: topic.path,
    seoPriority
  };
}

export function getTopic(pattern: Pattern) {
  const searchable = searchableText(pattern);
  const deepTopic = deepTopicRules.find((rule) => rule.terms.some((term) => searchable.includes(term)));

  if (deepTopic) {
    return { label: deepTopic.label, path: deepTopic.path };
  }

  return categoryTopicMap[pattern.category] ?? { label: "Power Platform patterns", path: "/patterns" };
}

function buildSeoTitle(pattern: Pattern, primaryKeyword: string) {
  if (primaryKeyword.toLowerCase().startsWith(pattern.category.toLowerCase())) {
    return `${primaryKeyword}: pattern, steps, and mistakes`;
  }

  return `${primaryKeyword} for ${pattern.category}: pattern and steps`;
}

function buildSeoDescription(pattern: Pattern, primaryKeyword: string) {
  return `Learn how to use ${primaryKeyword} with practical ${pattern.category} guidance, implementation steps, common mistakes, troubleshooting, and related BuilderVault patterns.`;
}

function buildSearchIntent(pattern: Pattern, primaryKeyword: string) {
  return `Help a Power Platform builder understand when to use ${primaryKeyword}, how to implement it, and what mistakes to avoid before using it in a production business app.`;
}

function buildPrimaryKeyword(pattern: Pattern) {
  const title = cleanTitle(pattern.title);

  if (pattern.category === "Power Apps") {
    return `Power Apps ${title}`;
  }

  if (pattern.category === "Power Automate") {
    return `Power Automate ${title}`;
  }

  if (pattern.category === "SharePoint") {
    return `SharePoint ${title}`;
  }

  if (pattern.category === "Dataverse") {
    return `Dataverse ${title}`;
  }

  if (pattern.category === "ALM & Governance") {
    return `Power Platform ALM ${title}`;
  }

  if (pattern.category === "Power Platform Admin") {
    return `Power Platform admin ${title}`;
  }

  if (pattern.category === "Power Pages") {
    return `Power Pages ${title}`;
  }

  if (pattern.category === "Teams & Adaptive Cards") {
    return `Teams Adaptive Cards ${title}`;
  }

  return title;
}

function buildSecondaryKeywords(pattern: Pattern, primaryKeyword: string) {
  return [
    primaryKeyword,
    `${pattern.category} pattern`,
    pattern.subCategory,
    ...pattern.platform.map((platform) => `${platform} implementation`),
    ...pattern.tags
  ]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .slice(0, 10);
}

function buildIntro(pattern: Pattern, primaryKeyword: string, title: string) {
  return [
    `${primaryKeyword} is a practical BuilderVault pattern for makers and developers who need a repeatable way to handle ${title.toLowerCase()} inside a real Microsoft business app. The goal is to move past trial-and-error and give the builder a clear structure they can adapt to their own screens, flows, lists, tables, or environments.`,
    `Use this page when you are deciding how the pattern should work, what supporting data or permissions are needed, and what should happen when the happy path fails. The notes below focus on implementation fit, common mistakes, troubleshooting, and internal links to adjacent patterns so the build stays consistent.`
  ];
}

function buildFinishedOutcome(pattern: Pattern) {
  if (pattern.category === "Power Apps") {
    return [
      "A maker can explain the control, formula, validation, and save behavior before release.",
      "The app gives users clear feedback for successful saves, missing values, and failed updates.",
      "The pattern can be handed to another builder without relying on hidden assumptions."
    ];
  }

  if (pattern.category === "Power Automate" || pattern.category === "Teams & Adaptive Cards") {
    return [
      "The flow has a clear trigger, scoped actions, tracked outcomes, and an exception path.",
      "Notifications or approvals tell users what happened and what action is required.",
      "Support owners can review failed runs without reverse-engineering the workflow."
    ];
  }

  if (pattern.category === "Dataverse") {
    return [
      "Tables, columns, relationships, and security assumptions are documented before build-out.",
      "The pattern works with solutions, environments, and future app or flow extensions.",
      "Builders know when Dataverse is a better fit than a SharePoint list backend."
    ];
  }

  if (pattern.category === "SharePoint") {
    return [
      "The list or library structure supports Power Apps and Power Automate without avoidable rework.",
      "Views, permissions, ownership, and lifecycle rules are clear to the support team.",
      "The backend can scale beyond the first demo scenario."
    ];
  }

  return [
    "The owner, source of truth, implementation steps, risks, and support path are clear.",
    "The pattern can be reused across similar Power Platform work without starting over.",
    "Governance and delivery expectations are visible before the pattern reaches production."
  ];
}

function buildImplementationChecklist(pattern: Pattern) {
  return [
    `Confirm the ${pattern.category} scenario and the business user this pattern supports.`,
    "Identify the data source, owner, security model, and exception path before building.",
    "Build the smallest reusable version first, then add optional branches or polish.",
    "Test with realistic data, permissions, edge cases, and handoff expectations.",
    "Link this pattern to its collection, topic hub, and related implementation patterns."
  ];
}

function buildFaqs(pattern: Pattern, primaryKeyword: string): PatternFaq[] {
  const platformList = pattern.platform.join(", ");

  return [
    {
      question: `When should I use ${primaryKeyword}?`,
      answer: `Use ${primaryKeyword} when the same ${pattern.category} scenario is likely to appear in more than one app, flow, list, table, or environment and needs a repeatable implementation approach.`
    },
    {
      question: `Does this pattern work with ${platformList}?`,
      answer: `Yes. This pattern is written for ${platformList} scenarios, but you should still confirm connectors, licensing, permissions, delegation limits, and environment rules before using it in production.`
    },
    {
      question: `What usually causes this ${pattern.category} pattern to fail?`,
      answer: "The most common failure points are unclear ownership, missing validation, weak exception handling, undocumented permissions, and testing only the happy path."
    },
    {
      question: `Is ${primaryKeyword} beginner friendly?`,
      answer: `This pattern is rated ${pattern.difficulty}. Beginners can use the fit guidance and checklist first, while experienced builders can move directly into the formula, flow, schema, or governance details.`
    }
  ];
}

function getSeoPriority(pattern: Pattern, primaryKeyword: string): "high" | "standard" | "support" {
  const searchable = `${primaryKeyword} ${searchableText(pattern)}`;

  if (highIntentTerms.some((term) => searchable.includes(term))) {
    return "high";
  }

  if (pattern.isPremium) {
    return "support";
  }

  return "standard";
}

function cleanTitle(value: string) {
  return value.replace(/^Create |^Build |^Design |^Configure |^Standardize |^Validate |^Document |^Optimize |^Troubleshoot |^Govern /, "");
}

function searchableText(pattern: Pattern) {
  return [
    pattern.title,
    pattern.slug,
    pattern.shortDescription,
    pattern.fullDescription,
    pattern.category,
    pattern.subCategory,
    pattern.problemStatement,
    ...pattern.tags,
    ...pattern.platform
  ]
    .join(" ")
    .toLowerCase();
}
