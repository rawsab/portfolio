import type { DiagramEdge, DiagramLayout, DiagramNode, DiagramPacket } from "../diagram";

export type Mode = "full" | "unavailable" | "failed";

export const modes: { value: Mode; label: string; summary: string }[] = [
  { value: "full", label: "Full review", summary: "Every stage succeeds. The review carries revised text, segments, explanations, and a score." },
  {
    value: "unavailable",
    label: "Explanation unavailable",
    summary:
      "The explanation stage fails after the rewrite and diff succeed. The review still returns revised text and segments; no explanation or score is shown in their place.",
  },
  {
    value: "failed",
    label: "Rewrite failed",
    summary: "A required stage fails, so there is no revised document to diff and the review could not complete.",
  },
];

export const steps = ["Rewrite", "Deterministic diff", "Explanations", "Review result"];

export const nodes = (mode: Mode): DiagramNode[] => [
  { id: "rewrite", title: "Rewrite", lines: mode === "failed" ? ["failed"] : ["required", "transformation"], tone: mode === "failed" ? "error" : "model" },
  { id: "diff", title: "Deterministic diff", lines: ["required contract"], tone: "code" },
  { id: "explain", title: "Explanations", lines: mode === "unavailable" ? ["unavailable"] : ["optional", "enrichment"], tone: mode === "unavailable" ? "error" : "model" },
  {
    id: "result",
    title: "Review result",
    lines: mode === "full" ? ["text + segments", "+ explanations"] : mode === "unavailable" ? ["text + segments", "no explanations"] : ["not produced"],
  },
  { id: "failed", title: "Review could not complete", lines: ["required stage failed"], tone: "error" },
];

export const edges: DiagramEdge[] = [
  { id: "rewrite-diff", tone: "model" },
  { id: "diff-result", tone: "code" },
  { id: "diff-explain", dashed: true, tone: "code" },
  { id: "explain-result", dashed: true, tone: "model" },
  { id: "to-failed", tone: "error" },
];

export const packets: DiagramPacket[] = [
  { id: "p1", edge: "rewrite-diff", step: 0, window: [0.4, 0.9] },
  { id: "p2", edge: "diff-explain", step: 1, window: [0.4, 0.9] },
  { id: "p3", edge: "diff-result", step: 1, window: [0.4, 0.9] },
  { id: "p4", edge: "explain-result", step: 2, window: [0.4, 0.9] },
];

export const wide: DiagramLayout = {
  width: 640,
  height: 232,
  nodes: {
    rewrite: { x: 8, y: 80, w: 140, h: 68 },
    diff: { x: 178, y: 86, w: 158, h: 56 },
    explain: { x: 352, y: 8, w: 144, h: 68 },
    result: { x: 466, y: 86, w: 166, h: 68 },
    failed: { x: 178, y: 172, w: 214, h: 52 },
  },
  edges: {
    "rewrite-diff": { points: [[148, 114], [178, 114]] },
    "diff-result": { points: [[336, 120], [466, 120]], label: { x: 401, y: 112, text: "direct" } },
    "diff-explain": { points: [[250, 86], [250, 42], [352, 42]], label: { x: 256, y: 34, text: "+ brand context", anchor: "start" } },
    "explain-result": { points: [[496, 42], [560, 42], [560, 86]] },
    "to-failed": { points: [[78, 148], [78, 198], [178, 198]] },
  },
};

export const narrow: DiagramLayout = {
  width: 320,
  height: 448,
  nodes: {
    rewrite: { x: 22, y: 8, w: 210, h: 68 },
    diff: { x: 22, y: 102, w: 210, h: 52 },
    explain: { x: 22, y: 180, w: 210, h: 68 },
    result: { x: 22, y: 274, w: 210, h: 68 },
    failed: { x: 22, y: 384, w: 210, h: 52 },
  },
  edges: {
    "rewrite-diff": { points: [[127, 76], [127, 102]] },
    "diff-result": { points: [[232, 128], [276, 128], [276, 308], [232, 308]], label: { x: 284, y: 220, text: "direct", anchor: "start" } },
    "diff-explain": { points: [[127, 154], [127, 180]], label: { x: 136, y: 172, text: "+ brand context", anchor: "start" } },
    "explain-result": { points: [[127, 248], [127, 274]] },
    "to-failed": { points: [[22, 42], [10, 42], [10, 410], [22, 410]] },
  },
};

export const caption =
  "Successful rewriting and diffing still produce a usable review when optional explanation generation fails, while a failure in a required stage prevents the review from completing. Dashed edges mark optional enrichment.";
