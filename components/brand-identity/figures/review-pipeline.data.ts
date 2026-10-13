import type { DiagramEdge, DiagramLayout, DiagramNode, DiagramPacket } from "../diagram";

export const original = "Our revolutionary analytics platform transforms reporting.";
export const revised = "Our analytics workspace helps teams understand their data.";
export const guidance = "Prefer concrete product language. Avoid exaggerated claims.";

type Segment =
  | { type: "UNCHANGED"; text: string }
  | { type: "REMOVED"; text: string }
  | { type: "MODIFIED"; original: string; revised: string };

export const segments: Segment[] = [
  { type: "UNCHANGED", text: "Our " },
  { type: "REMOVED", text: "revolutionary " },
  { type: "UNCHANGED", text: "analytics " },
  { type: "MODIFIED", original: "platform transforms reporting.", revised: "workspace helps teams understand their data." },
];

export const renderRevised = (list: Segment[]) =>
  list.map((segment) => (segment.type === "UNCHANGED" ? segment.text : segment.type === "MODIFIED" ? segment.revised : "")).join("");

export const reconstructs = renderRevised(segments) === revised;

export const explanations = [
  { segment: 1, text: "Guidance favors concrete product language over superlatives." },
  { segment: 3, text: "Names the product plainly and says what it helps teams do." },
];
export const summary = "Replaced promotional wording with concrete product language.";
export const score = 84;

export const stages = [
  { label: "Rewrite", detail: "Brand context and the original document enter the first model call, which writes a candidate revision." },
  { label: "Diff", detail: "Application code compares the original and revised strings and produces ordered segments." },
  { label: "Explain", detail: "Changed segments and the relevant guidance enter a second model call for explanations, a summary, and a score." },
  { label: "Respond", detail: "The structured review reaches the client UI. Segments have a direct path, because explanations are optional." },
];

export const nodes: DiagramNode[] = [
  { id: "context", title: "Brand context", lines: ["guidance"] },
  { id: "original", title: "Original", lines: ["document"], tone: "user" },
  { id: "rewrite", title: "Rewrite", lines: ["model call 1"], tone: "model" },
  { id: "diff", title: "Diff engine", lines: ["deterministic"], tone: "code" },
  { id: "explain", title: "Explanations", lines: ["model call 2"], tone: "model" },
  { id: "assembly", title: "Response", lines: ["assembly"] },
  { id: "ui", title: "Review UI", lines: ["embedded"], tone: "user" },
];

/** Stage in which each node is the active work. */
export const nodeStage: Record<string, number> = { context: 0, original: 0, rewrite: 0, diff: 1, explain: 2, assembly: 3, ui: 3 };

export const edges: DiagramEdge[] = [
  { id: "ctx-rewrite" },
  { id: "orig-rewrite" },
  { id: "rewrite-diff", tone: "model" },
  { id: "orig-diff" },
  { id: "diff-explain", tone: "code" },
  { id: "ctx-explain" },
  { id: "diff-assembly", tone: "code" },
  { id: "explain-assembly", dashed: true, tone: "model" },
  { id: "assembly-ui", tone: "user" },
];

export const edgeStage: Record<string, number> = {
  "ctx-rewrite": 0,
  "orig-rewrite": 0,
  "rewrite-diff": 1,
  "orig-diff": 1,
  "diff-explain": 2,
  "ctx-explain": 2,
  "diff-assembly": 3,
  "explain-assembly": 3,
  "assembly-ui": 3,
};

export const packets: DiagramPacket[] = [
  { id: "p-context", edge: "ctx-rewrite", step: 0, window: [0.05, 0.55] },
  { id: "p-original", edge: "orig-rewrite", step: 0, label: "context + original", window: [0.05, 0.55] },
  { id: "p-revised", edge: "rewrite-diff", step: 1, label: "original + revised", window: [0.05, 0.6], tone: "model" },
  { id: "p-orig-diff", edge: "orig-diff", step: 1, window: [0.05, 0.6] },
  { id: "p-segments", edge: "diff-explain", step: 2, label: "changed segments", window: [0.05, 0.6], tone: "code" },
  { id: "p-guidance", edge: "ctx-explain", step: 2, window: [0.05, 0.6] },
  { id: "p-direct", edge: "diff-assembly", step: 3, window: [0.02, 0.4], tone: "code" },
  { id: "p-enrich", edge: "explain-assembly", step: 3, label: "optional enrichment", window: [0.02, 0.4], tone: "model" },
  { id: "p-review", edge: "assembly-ui", step: 3, label: "structured review", window: [0.45, 0.9], tone: "user" },
];

export const wide: DiagramLayout = {
  width: 800,
  height: 420,
  boundaries: [
    { id: "service", x: 16, y: 16, w: 614, h: 388, label: "Connected review service" },
    { id: "client", x: 646, y: 16, w: 138, h: 388, label: "AI client" },
  ],
  nodes: {
    context: { x: 32, y: 92, w: 120, h: 56 },
    original: { x: 32, y: 212, w: 120, h: 56 },
    rewrite: { x: 180, y: 152, w: 120, h: 56 },
    diff: { x: 328, y: 152, w: 120, h: 56 },
    explain: { x: 476, y: 84, w: 136, h: 56 },
    assembly: { x: 476, y: 244, w: 136, h: 56 },
    ui: { x: 662, y: 244, w: 106, h: 56 },
  },
  edges: {
    "ctx-rewrite": { points: [[152, 120], [166, 120], [166, 172], [180, 172]] },
    "orig-rewrite": { points: [[152, 240], [166, 240], [166, 190], [180, 190]] },
    "rewrite-diff": { points: [[300, 180], [328, 180]] },
    "orig-diff": { points: [[92, 268], [92, 330], [388, 330], [388, 208]], label: { x: 240, y: 324, text: "original" } },
    "diff-explain": { points: [[418, 152], [418, 112], [476, 112]] },
    "ctx-explain": { points: [[92, 92], [92, 62], [544, 62], [544, 84]], label: { x: 320, y: 56, text: "brand guidance" } },
    "diff-assembly": { points: [[418, 208], [418, 272], [476, 272]], label: { x: 424, y: 264, text: "segments", anchor: "start" } },
    "explain-assembly": { points: [[544, 140], [544, 244]], label: { x: 552, y: 196, text: "optional", anchor: "start" } },
    "assembly-ui": { points: [[612, 272], [662, 272]] },
  },
};

export const narrow: DiagramLayout = {
  width: 360,
  height: 604,
  boundaries: [
    { id: "service", x: 8, y: 8, w: 344, h: 470, label: "Connected review service" },
    { id: "client", x: 8, y: 500, w: 344, h: 96, label: "AI client" },
  ],
  nodes: {
    context: { x: 24, y: 44, w: 148, h: 52 },
    original: { x: 188, y: 44, w: 148, h: 52 },
    rewrite: { x: 24, y: 136, w: 220, h: 52 },
    diff: { x: 24, y: 224, w: 220, h: 52 },
    explain: { x: 24, y: 312, w: 220, h: 52 },
    assembly: { x: 24, y: 400, w: 220, h: 52 },
    ui: { x: 24, y: 534, w: 220, h: 48 },
  },
  edges: {
    "ctx-rewrite": { points: [[98, 96], [98, 136]] },
    "orig-rewrite": { points: [[262, 96], [262, 116], [200, 116], [200, 136]] },
    "rewrite-diff": { points: [[134, 188], [134, 224]] },
    "orig-diff": { points: [[336, 70], [344, 70], [344, 240], [244, 240]], label: { x: 338, y: 160, text: "original", anchor: "end" } },
    "diff-explain": { points: [[134, 276], [134, 312]] },
    "ctx-explain": { points: [[24, 70], [15, 70], [15, 338], [24, 338]] },
    "diff-assembly": { points: [[244, 262], [300, 262], [300, 426], [244, 426]], label: { x: 294, y: 350, text: "segments", anchor: "end" } },
    "explain-assembly": { points: [[134, 364], [134, 400]], label: { x: 142, y: 386, text: "optional", anchor: "start" } },
    "assembly-ui": { points: [[134, 452], [134, 534]] },
  },
};

export const caption =
  "A model rewrites the document, deterministic code computes the exact changes, and a second model adds optional explanations before the review is rendered. Boxes group conceptual responsibilities, not deployment boundaries. Payloads are generalized and illustrative.";
