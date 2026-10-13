import type { DiagramEdge, DiagramLayout, DiagramNode, DiagramPacket } from "../diagram";

export const prompt = "Write a launch email for our new analytics feature.";

export const states = [
  {
    label: "Data-oriented tool",
    name: "retrieve_brand_identity",
    description: "Returns the company's brand identity.",
    changed: [] as ("name" | "description")[],
    detail:
      "The name and description say what the tool returns. A writing request gives the model a weak reason to call it, so a direct path to generation is possible.",
    path: "direct" as const,
  },
  {
    label: "Stronger description",
    name: "retrieve_brand_identity",
    description: "Retrieve brand guidance before creating or rewriting company content.",
    changed: ["description"] as ("name" | "description")[],
    detail:
      "The description ties retrieval to content creation, so context retrieval reads as the relevant action even without the phrase “brand voice.” Two overlapping context tools become one.",
    path: "context" as const,
  },
  {
    label: "Workflow-oriented tool",
    name: "get_brand_context_before_writing",
    description: "Load brand context before writing or rewriting content for this company.",
    changed: ["name", "description"] as ("name" | "description")[],
    detail: "The name carries the workflow cue: get context before writing. The trace runs tool call, context result, then generation.",
    path: "context" as const,
  },
];

export const nodes: DiagramNode[] = [
  { id: "prompt", title: "Launch-email prompt", lines: ["Same in every state"], tone: "user" },
  { id: "call", title: "Context tool call", lines: ["tools/call"], tone: "code" },
  { id: "result", title: "Context result", lines: ["Brand guidance"], tone: "code" },
  { id: "draft", title: "Generation", lines: ["Draft"], tone: "model" },
];

export const edges: DiagramEdge[] = [
  { id: "direct", dashed: true, tone: "model" },
  { id: "call", tone: "code" },
  { id: "result", tone: "code" },
  { id: "generate", tone: "model" },
];

export const packets: DiagramPacket[] = [
  { id: "direct", edge: "direct", step: 0, window: [0.1, 0.6] },
  ...[1, 2].flatMap((step) => [
    { id: `call-${step}`, edge: "call", step, label: step === 2 ? "before writing" : undefined, window: [0.05, 0.3] as [number, number], tone: "code" as const },
    { id: `result-${step}`, edge: "result", step, window: [0.33, 0.58] as [number, number] },
    { id: `generate-${step}`, edge: "generate", step, window: [0.61, 0.86] as [number, number] },
  ]),
];

export const wide: DiagramLayout = {
  width: 760,
  height: 150,
  nodes: {
    prompt: { x: 8, y: 54, w: 164, h: 60 },
    call: { x: 204, y: 54, w: 160, h: 60 },
    result: { x: 396, y: 54, w: 160, h: 60 },
    draft: { x: 588, y: 54, w: 164, h: 60 },
  },
  edges: {
    direct: { points: [[90, 54], [90, 22], [670, 22], [670, 54]], label: { x: 380, y: 16, text: "direct to generation" } },
    call: { points: [[172, 84], [204, 84]] },
    result: { points: [[364, 84], [396, 84]] },
    generate: { points: [[556, 84], [588, 84]] },
  },
};

export const narrow: DiagramLayout = {
  width: 360,
  height: 330,
  nodes: {
    prompt: { x: 8, y: 8, w: 270, h: 56 },
    call: { x: 8, y: 92, w: 270, h: 56 },
    result: { x: 8, y: 176, w: 270, h: 56 },
    draft: { x: 8, y: 260, w: 270, h: 56 },
  },
  edges: {
    direct: { points: [[278, 36], [326, 36], [326, 288], [278, 288]], label: { x: 336, y: 166, text: "direct", anchor: "start" } },
    call: { points: [[143, 64], [143, 92]] },
    result: { points: [[143, 148], [143, 176]] },
    generate: { points: [[143, 232], [143, 260]] },
  },
};

export type ContextField = "voice" | "audience" | "avoid";

export const contextFields: { value: ContextField; label: string; text: string }[] = [
  { value: "voice", label: "voice", text: "direct, grounded" },
  { value: "audience", label: "audience", text: "technical teams" },
  { value: "avoid", label: "avoid", text: "exaggerated claims" },
];

type DraftPiece = string | { text: string; field: ContextField };

export const drafts: Record<"without" | "with", DraftPiece[]> = {
  without: [
    "Introducing our ",
    { text: "revolutionary", field: "avoid" },
    " analytics platform. It ",
    { text: "transforms reporting", field: "avoid" },
    " for ",
    { text: "everyone", field: "audience" },
    ".",
  ],
  with: [
    "Our ",
    { text: "analytics workspace", field: "voice" },
    " helps ",
    { text: "technical teams", field: "audience" },
    " understand their data.",
  ],
};

export const fieldNotes: Record<"without" | "with", Record<ContextField, string>> = {
  without: {
    voice: "No voice guidance was loaded, so nothing anchors the tone.",
    audience: "Without an audience, the draft addresses everyone.",
    avoid: "Superlatives the guidance would avoid.",
  },
  with: {
    voice: "Concrete product language in a direct voice.",
    audience: "Addressed to the audience named in the context.",
    avoid: "Nothing to flag: the draft makes no exaggerated claims.",
  },
};

export const caption =
  "Three tool definitions make the link between writing and brand-context retrieval progressively more explicit. This is a scripted illustration of the design rationale, not a live model run, benchmark, or guarantee of selection behavior. Drafts are synthetic.";
