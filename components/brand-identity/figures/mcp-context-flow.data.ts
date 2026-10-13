import type { DiagramEdge, DiagramLayout, DiagramNode, DiagramPacket } from "../diagram";

export const steps = [
  {
    label: "Prompt",
    detail: "The writer asks for a launch email. The request stays in the AI client's conversation.",
  },
  {
    label: "Tool selection",
    detail: "The client exposes its tool definitions to the model, and the model selects the context tool from the registry.",
  },
  {
    label: "tools/call",
    detail: "A tools/call request crosses the MCP boundary to the connected service's context tool.",
  },
  {
    label: "Brand context",
    detail: "The context tool reads brand guidance: voice and tone, audience, products, and messaging.",
  },
  {
    label: "Tool result",
    detail: "The result returns across the boundary and joins the model's working context in the conversation.",
  },
  {
    label: "Draft",
    detail: "Drafting begins only after the brand context has arrived.",
  },
] as const;

/** The step each selectable node jumps to. */
export const nodeStep: Record<string, number> = {
  conversation: 0,
  registry: 1,
  tool: 2,
  store: 3,
  voice: 3,
  audience: 3,
  products: 3,
  messaging: 3,
  draft: 5,
};

export const nodes = (draftReady: boolean): DiagramNode[] => [
  { id: "conversation", title: "Conversation", lines: ["“Write a launch email for our", "new analytics feature.”"], tone: "user" },
  { id: "registry", title: "Tool registry", lines: ["Definitions exposed to the model"], tone: "model" },
  {
    id: "draft",
    title: "Draft",
    lines: draftReady ? ["Drafting with", "brand context"] : ["Waits for", "context"],
    tone: "model",
  },
  { id: "tool", title: "Context tool", lines: ["Retrieves brand guidance"], tone: "code" },
  { id: "store", title: "Brand context", tone: "code", label: "Brand context: voice and tone, audience, products, messaging" },
  { id: "voice", title: "Voice & tone", tone: "code" },
  { id: "audience", title: "Audience", tone: "code" },
  { id: "products", title: "Products", tone: "code" },
  { id: "messaging", title: "Messaging", tone: "code" },
];

export const edges: DiagramEdge[] = [
  { id: "select", tone: "model" },
  { id: "call", tone: "code" },
  { id: "read", tone: "code" },
  { id: "result", tone: "code" },
  { id: "draft", tone: "model" },
];

/** Step index during which each edge carries data. */
export const edgeStep: Record<string, number> = { select: 1, call: 2, read: 3, result: 4, draft: 5 };

export const packets: DiagramPacket[] = [
  { id: "select", edge: "select", step: 1 },
  { id: "call", edge: "call", step: 2, label: "tools/call", tone: "code" },
  { id: "read", edge: "read", step: 3 },
  { id: "result", edge: "result", step: 4, label: "tool result", tone: "code" },
  { id: "draft", edge: "draft", step: 5 },
];

export const wide: DiagramLayout = {
  width: 800,
  height: 404,
  boundaries: [
    { id: "client", x: 16, y: 16, w: 400, h: 372, label: "AI client" },
    { id: "service", x: 500, y: 16, w: 284, h: 372, label: "HubSpot", sublabel: "Conceptual Brand Identity integration" },
  ],
  rules: [{ x1: 458, y1: 44, x2: 458, y2: 380, label: "MCP", lx: 458, ly: 34 }],
  nodes: {
    conversation: { x: 36, y: 56, w: 250, h: 86 },
    registry: { x: 36, y: 176, w: 250, h: 70 },
    draft: { x: 36, y: 300, w: 250, h: 72 },
    tool: { x: 520, y: 176, w: 244, h: 70 },
    store: { x: 520, y: 268, w: 244, h: 104, top: true },
    voice: { x: 534, y: 300, w: 104, h: 28, align: "middle" },
    audience: { x: 646, y: 300, w: 104, h: 28, align: "middle" },
    products: { x: 534, y: 334, w: 104, h: 28, align: "middle" },
    messaging: { x: 646, y: 334, w: 104, h: 28, align: "middle" },
  },
  edges: {
    select: { points: [[161, 142], [161, 176]], label: { x: 170, y: 163, text: "model selects a tool", anchor: "start" } },
    call: { points: [[286, 211], [520, 211]], label: { x: 372, y: 203, text: "tools/call" } },
    read: { points: [[642, 246], [642, 268]] },
    result: { points: [[642, 176], [642, 99], [286, 99]], label: { x: 372, y: 91, text: "tool result" } },
    draft: { points: [[286, 128], [340, 128], [340, 336], [286, 336]], label: { x: 348, y: 236, text: "then", anchor: "start" } },
  },
};

export const narrow: DiagramLayout = {
  width: 360,
  height: 566,
  boundaries: [
    { id: "client", x: 8, y: 8, w: 344, h: 236, label: "AI client" },
    { id: "service", x: 8, y: 292, w: 344, h: 266, label: "HubSpot", sublabel: "Conceptual Brand Identity integration" },
  ],
  rules: [{ x1: 8, y1: 268, x2: 352, y2: 268, label: "MCP", lx: 24, ly: 262, anchor: "start" }],
  nodes: {
    conversation: { x: 24, y: 40, w: 312, h: 78 },
    registry: { x: 24, y: 150, w: 150, h: 76, lines: ["Definitions", "exposed to model"] },
    draft: { x: 188, y: 150, w: 148, h: 76 },
    tool: { x: 24, y: 340, w: 300, h: 60 },
    store: { x: 24, y: 424, w: 300, h: 120, top: true },
    voice: { x: 38, y: 456, w: 132, h: 32, align: "middle" },
    audience: { x: 178, y: 456, w: 132, h: 32, align: "middle" },
    products: { x: 38, y: 496, w: 132, h: 32, align: "middle" },
    messaging: { x: 178, y: 496, w: 132, h: 32, align: "middle" },
  },
  edges: {
    select: { points: [[99, 118], [99, 150]] },
    call: { points: [[99, 226], [99, 340]], label: { x: 108, y: 300, text: "tools/call", anchor: "start" } },
    read: { points: [[174, 400], [174, 424]] },
    result: { points: [[324, 360], [342, 360], [342, 80], [336, 80]], label: { x: 334, y: 300, text: "tool result", anchor: "end" } },
    draft: { points: [[262, 118], [262, 150]] },
  },
};

export const requestPayload = `{
  "method": "tools/call",
  "params": {
    "name": "get_brand_context_before_writing"
  }
}`;

export const resultPayload = `{
  "voice": "direct, grounded",
  "audience": "technical teams",
  "avoid": ["exaggerated claims"]
}`;

export const caption =
  "A writing assistant retrieves brand guidance through an MCP tool and uses the returned context when generating a draft. Tool names and payload keys are illustrative, not an internal or public schema, and the boundaries are a conceptual overview rather than a deployment topology.";
