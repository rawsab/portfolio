import type { DiagramEdge, DiagramLayout, DiagramNode, DiagramPacket } from "@/components/brand-identity/diagram";

export const nodes: DiagramNode[] = [
  { id: "measurements", title: "New measurements", lines: ["incoming group"], tone: "user" },
  { id: "reference", title: "Select reference", lines: ["reference dataset"], tone: "model" },
  { id: "features", title: "Comparable features", lines: ["same extraction"], tone: "code" },
  { id: "drift", title: "Calculate drift", lines: ["group comparison"], tone: "code" },
  { id: "history", title: "History", lines: ["result + provenance"], tone: "user" },
  { id: "prometheus", title: "Prometheus" },
  { id: "grafana", title: "Grafana" },
];

/** Order in which one window's evaluation travels through the system. */
export const flow = [
  "measurements-reference",
  "reference-features",
  "features-drift",
  "drift-history",
  "history-prometheus",
  "prometheus-grafana",
];

const flowTargets: Record<string, string> = Object.fromEntries(flow.map((edge) => [edge, edge.split("-")[1]]));
export const targetOf = (edge: string) => flowTargets[edge];

export const edges: DiagramEdge[] = flow.map((id) => ({ id }));

export const packets: DiagramPacket[] = [0, 1, 2].flatMap((step) =>
  flow.map((edge, index) => ({
    id: `${step}-${edge}`,
    edge,
    step,
    window: [index / flow.length, (index + 0.9) / flow.length] as [number, number],
  })),
);

export const wide: DiagramLayout = {
  width: 640,
  height: 336,
  boundaries: [
    { id: "tracking", x: 8, y: 8, w: 624, h: 214, label: "Tracking" },
    { id: "monitoring", x: 8, y: 234, w: 624, h: 90, label: "Monitoring" },
  ],
  nodes: {
    measurements: { x: 24, y: 40, w: 196, h: 48 },
    reference: { x: 252, y: 40, w: 176, h: 48 },
    features: { x: 24, y: 124, w: 188, h: 48 },
    drift: { x: 236, y: 124, w: 168, h: 48 },
    history: { x: 428, y: 124, w: 180, h: 48 },
    prometheus: { x: 176, y: 262, w: 148, h: 34, align: "middle" },
    grafana: { x: 348, y: 262, w: 140, h: 34, align: "middle" },
  },
  edges: {
    "measurements-reference": {
      points: [
        [220, 64],
        [252, 64],
      ],
    },
    "reference-features": {
      points: [
        [340, 88],
        [340, 106],
        [118, 106],
        [118, 124],
      ],
    },
    "features-drift": {
      points: [
        [212, 148],
        [236, 148],
      ],
    },
    "drift-history": {
      points: [
        [404, 148],
        [428, 148],
      ],
    },
    "history-prometheus": {
      points: [
        [518, 172],
        [518, 246],
        [250, 246],
        [250, 262],
      ],
    },
    "prometheus-grafana": {
      points: [
        [324, 279],
        [348, 279],
      ],
    },
  },
};

const col = { x: 36, w: 248 };
const nodeH = 42;
const rowY = (i: number) => (i < 5 ? 40 + i * 56 : 396 + (i - 5) * 56);

export const narrow: DiagramLayout = {
  width: 320,
  height: 508,
  boundaries: [
    { id: "tracking", x: 8, y: 8, w: 304, h: 340, label: "Tracking" },
    { id: "monitoring", x: 8, y: 360, w: 304, h: 136, label: "Monitoring" },
  ],
  nodes: Object.fromEntries(
    ["measurements", "reference", "features", "drift", "history", "prometheus", "grafana"].map((id, i) => [
      id,
      { x: col.x, y: rowY(i), w: col.w, h: nodeH, align: "middle" as const },
    ]),
  ),
  edges: Object.fromEntries(
    flow.map((id, i) => [
      id,
      {
        points: [
          [160, rowY(i) + nodeH],
          [160, rowY(i + 1)],
        ],
      },
    ]),
  ),
};

export interface WindowRecord {
  day: number;
  bounds: string;
  current: { label: string; group: string; captures: number };
  reference: { label: string; captures: number };
  drift: {
    reflection: number;
    reflectionPath: string;
    transmission: number;
    transmissionPath: string;
  };
}

const extraction = {
  paths: "A, B, C",
  representations: "magnitude, phase",
  grid: "1–6 GHz · 161 bins",
};
export { extraction };

export function windows(referenceChanged: boolean): WindowRecord[] {
  const base: WindowRecord[] = [
    {
      day: 12,
      bounds: "Day 12 00:00 → Day 13 00:00",
      current: { label: "Day 12 measurements", group: "device family A · fixture 1", captures: 38 },
      reference: { label: "Reference dataset", captures: 120 },
      drift: { reflection: 0.412, reflectionPath: "A", transmission: 0.287, transmissionPath: "C" },
    },
    {
      day: 13,
      bounds: "Day 13 00:00 → Day 14 00:00",
      current: { label: "Day 13 measurements", group: "device family A · fixture 1", captures: 41 },
      reference: { label: "Reference dataset", captures: 120 },
      drift: { reflection: 0.438, reflectionPath: "A", transmission: 0.301, transmissionPath: "C" },
    },
    {
      day: 14,
      bounds: "Day 14 00:00 → Day 15 00:00",
      current: { label: "Day 14 measurements", group: "device family A · fixture 1", captures: 29 },
      reference: { label: "Reference dataset", captures: 120 },
      drift: { reflection: 0.451, reflectionPath: "A", transmission: 0.296, transmissionPath: "C" },
    },
  ];
  if (!referenceChanged) return base;
  return base.map((record) =>
    record.day === 14
      ? {
          ...record,
          reference: { label: "Different reference", captures: 64 },
          drift: { reflection: 0.236, reflectionPath: "B", transmission: 0.214, transmissionPath: "C" },
        }
      : record,
  );
}

export const checks = ["RF paths", "Representations", "Frequency coordinates"];

export const caption =
  "Each historical drift point connects a time window, the measurements being compared, a reference dataset, and the settings used to reconstruct them. Labels are synthetic.";
