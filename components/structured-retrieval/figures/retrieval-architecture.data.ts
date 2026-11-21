import type { DiagramEdge, DiagramLayout, DiagramNode } from "@/components/brand-identity/diagram";

export type Scenario = "explain" | "total" | "unavailable";

export const nodes: DiagramNode[] = [
  { id: "facts", title: "MySQL facts", lines: ["validated posts"], tone: "code" },
  { id: "aggregates", title: "Aggregates", lines: ["scoped compute"], tone: "code" },
  { id: "reps", title: "Representations", lines: ["3 tiers + context"], tone: "model" },
  { id: "embed", title: "Embeddings", lines: ["OpenAI API"], tone: "model" },
  { id: "pinecone", title: "Pinecone", lines: ["vectors + metadata"], tone: "model" },
  { id: "question", title: "Question", lines: ["synthetic"], tone: "user" },
  { id: "scope", title: "Scope", lines: ["auth + campaign"], tone: "user" },
  { id: "route", title: "Routing", lines: ["pick a tier"], tone: "model" },
  { id: "fetch", title: "Fetch", lines: ["exact values"], tone: "code" },
  { id: "evidence", title: "Evidence", lines: ["assembly"], tone: "code" },
  { id: "answer", title: "Answer", lines: ["scoped, cited"], tone: "user" },
];

const INGEST = ["facts", "aggregates", "reps", "embed", "pinecone"];
const QUERY = ["question", "scope", "route", "fetch", "evidence", "answer"];

const chain = (ids: string[]) => ids.slice(1).map((id, i) => `${ids[i]}-${id}`);

export const edges: DiagramEdge[] = [
  ...chain(INGEST).map((id) => ({ id, tone: "model" as const })),
  ...chain(QUERY).map((id) => ({ id, tone: "user" as const })),
  { id: "route-pinecone", tone: "model" },
  { id: "fetch-facts", tone: "code" },
  { id: "scope-answer", tone: "error", dashed: true },
];

export const paths: Record<Scenario, string[]> = {
  explain: ["question-scope", "scope-route", "route-pinecone", "route-fetch", "fetch-facts", "fetch-evidence", "evidence-answer"],
  total: ["question-scope", "scope-route", "route-fetch", "fetch-facts", "fetch-evidence", "evidence-answer"],
  unavailable: ["question-scope", "scope-answer"],
};

export const targetOf = (edge: string) => edge.split("-")[1];
export const sourceOf = (edge: string) => edge.split("-")[0];

export const scenarios: { value: Scenario; label: string; question: string; steps: string[]; outcome: string }[] = [
  {
    value: "explain",
    label: "Explain",
    question: "Explain Cedar's TikTok performance.",
    steps: [
      "Resolve the reader's authorized scope and the Cedar campaign.",
      "Route to the campaign tier, then to creator context and contextual posts.",
      "Search Pinecone inside the authorized scope.",
      "Fetch the matching source records and aggregates from MySQL.",
      "Assemble evidence with metric definitions and the scope used.",
    ],
    outcome: "An explanation grounded in campaign context, creator comparisons, and specific posts.",
  },
  {
    value: "total",
    label: "Total",
    question: "What are Cedar's total TikTok views?",
    steps: [
      "Resolve the reader's authorized scope and the Cedar campaign.",
      "Recognize an exact aggregate; no similarity search is needed.",
      "Sum views over every eligible stored record in MySQL.",
      "Return the total with its scope and record count.",
    ],
    outcome: "A deterministic total over the complete eligible population.",
  },
  {
    value: "unavailable",
    label: "Unavailable",
    question: "How did the Aspen launch perform?",
    steps: ["Resolve scope: no Aspen campaign exists within the reader's authorized data.", "Return a missing-data response instead of searching nearby campaigns."],
    outcome: "A clear statement that the campaign is unavailable, with no substituted evidence.",
  },
];

export const details: Record<string, { inputs: string; outputs: string; checks: string }> = {
  facts: { inputs: "Validated extraction results", outputs: "Post facts with creator and campaign relationships", checks: "Source of truth for exact values" },
  aggregates: { inputs: "Post facts", outputs: "Creator-in-campaign and campaign aggregates", checks: "Each aggregate is labeled with its population" },
  reps: { inputs: "Facts and compact aggregates", outputs: "Campaign, creator, and contextual-post text", checks: "Context stays within one scope; versioned against its sources" },
  embed: { inputs: "Representation text", outputs: "Vectors", checks: "One fixed embedding model per index" },
  pinecone: { inputs: "Vectors and filterable metadata", outputs: "Scoped nearest neighbors", checks: "Authorization filter applied to every search" },
  question: { inputs: "Natural-language question", outputs: "Question text", checks: "None yet" },
  scope: { inputs: "Question and reader identity", outputs: "Authorized scope plus campaign and platform constraints", checks: "Unknown or unauthorized campaigns stop here" },
  route: { inputs: "Question and resolved scope", outputs: "A plan: search a tier, compute exactly, or both", checks: "Exact arithmetic never routes through similarity alone" },
  fetch: { inputs: "Record identifiers or aggregate requests", outputs: "Source records and computed values", checks: "Authorization re-checked against MySQL" },
  evidence: { inputs: "Retrieved and computed results", outputs: "Evidence bundle with provenance", checks: "Every number carries its scope and definition" },
  answer: { inputs: "Evidence bundle", outputs: "Answer or missing-data response", checks: "States scope and metric definitions" },
};

const box = (x: number, y: number, w: number, h: number) => ({ x, y, w, h });

/* Wide: two horizontal lanes. */
const IW = 106;
const IG = 16;
const QW = 88;
const QG = 14;
const IY = 44;
const QY = 186;
const NH = 50;
const ix = (i: number) => 24 + i * (IW + IG);
const qx = (i: number) => 24 + i * (QW + QG);
const icx = (i: number) => ix(i) + IW / 2;
const qcx = (i: number) => qx(i) + QW / 2;

const wideEdges: DiagramLayout["edges"] = {};
INGEST.slice(1).forEach((id, i) => {
  wideEdges[`${INGEST[i]}-${id}`] = { points: [[ix(i) + IW, IY + NH / 2], [ix(i + 1), IY + NH / 2]] };
});
QUERY.slice(1).forEach((id, i) => {
  wideEdges[`${QUERY[i]}-${id}`] = { points: [[qx(i) + QW, QY + NH / 2], [qx(i + 1), QY + NH / 2]] };
});
wideEdges["route-pinecone"] = {
  points: [[qcx(2), QY], [qcx(2), 134], [icx(4), 134], [icx(4), IY + NH]],
  label: { x: 420, y: 128, text: "scoped vector search" },
};
wideEdges["fetch-facts"] = {
  points: [[qcx(3), QY + NH], [qcx(3), 256], [15, 256], [15, IY + NH / 2], [ix(0), IY + NH / 2]],
  label: { x: 196, y: 270, text: "source fetch · exact values" },
};
wideEdges["scope-answer"] = {
  points: [[qcx(1), QY], [qcx(1), 172], [qcx(5), 172], [qcx(5), QY]],
  label: { x: 470, y: 167, text: "campaign unavailable" },
};

export const wide: DiagramLayout = {
  width: 640,
  height: 284,
  boundaries: [
    { id: "ingest", x: 6, y: 8, w: 626, h: 104, label: "Ingestion" },
    { id: "query", x: 6, y: 150, w: 626, h: 128, label: "Query" },
  ],
  nodes: Object.fromEntries([
    ...INGEST.map((id, i) => [id, { ...box(ix(i), IY, IW, NH), align: "middle" as const }]),
    ...QUERY.map((id, i) => [id, { ...box(qx(i), QY, QW, NH), align: "middle" as const }]),
  ]),
  edges: wideEdges,
};

/* Narrow: two vertical lanes side by side. */
const NW = 140;
const NRH = 46;
const rowY = (i: number) => 70 + i * 70;
const lx = 16;
const rx = 184;
const nmid = (i: number) => rowY(i) + NRH / 2;

const narrowEdges: DiagramLayout["edges"] = {};
INGEST.slice(1).forEach((id, i) => {
  narrowEdges[`${INGEST[i]}-${id}`] = { points: [[lx + NW / 2, rowY(i) + NRH], [lx + NW / 2, rowY(i + 1)]] };
});
QUERY.slice(1).forEach((id, i) => {
  narrowEdges[`${QUERY[i]}-${id}`] = { points: [[rx + NW / 2, rowY(i) + NRH], [rx + NW / 2, rowY(i + 1)]] };
});
narrowEdges["route-pinecone"] = { points: [[rx, nmid(2)], [170, nmid(2)], [170, nmid(4)], [lx + NW, nmid(4)]] };
narrowEdges["fetch-facts"] = { points: [[rx + NW, nmid(3)], [335, nmid(3)], [335, 20], [lx + NW / 2, 20], [lx + NW / 2, rowY(0)]] };
narrowEdges["scope-answer"] = { points: [[rx + NW, nmid(1)], [329, nmid(1)], [329, nmid(5)], [rx + NW, nmid(5)]] };

export const narrow: DiagramLayout = {
  width: 340,
  height: 490,
  boundaries: [
    { id: "ingest", x: 8, y: 36, w: 156, h: 372, label: "Ingestion" },
    { id: "query", x: 176, y: 36, w: 156, h: 442, label: "Query" },
  ],
  nodes: Object.fromEntries([
    ...INGEST.map((id, i) => [id, { ...box(lx, rowY(i), NW, NRH), align: "middle" as const }]),
    ...QUERY.map((id, i) => [id, { ...box(rx, rowY(i), NW, NRH), align: "middle" as const }]),
  ]),
  edges: narrowEdges,
};

export const caption =
  "Proposed architecture combining scoped hierarchical retrieval with structured source data and deterministic aggregation. Authorization constrains both the vector search and the source fetch. Questions and identifiers are synthetic.";
