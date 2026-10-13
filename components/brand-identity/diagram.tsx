"use client";

import { KeyboardEvent, useEffect, useId, useRef } from "react";
import type { Sequence } from "./use-sequence";

export type Tone = "model" | "code" | "user" | "error" | "neutral";
export type ElementState = "idle" | "active" | "visited" | "muted" | "error";
export type Point = [number, number];

export interface DiagramNode {
  id: string;
  title: string;
  lines?: string[];
  tone?: Tone;
  /** Accessible name when the node is selectable. */
  label?: string;
}

export interface NodeBox {
  x: number;
  y: number;
  w: number;
  h: number;
  lines?: string[];
  align?: "start" | "middle";
  /** Pin the title to the top edge, for container nodes. */
  top?: boolean;
}

export interface DiagramLayout {
  width: number;
  height: number;
  nodes: Record<string, NodeBox>;
  edges: Record<string, { points: Point[]; label?: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end" } }>;
  boundaries?: { id: string; x: number; y: number; w: number; h: number; label: string; sublabel?: string }[];
  notes?: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end"; tone?: Tone }[];
  rules?: { x1: number; y1: number; x2: number; y2: number; label: string; lx: number; ly: number; anchor?: "start" | "middle" | "end" }[];
}

export interface DiagramEdge {
  id: string;
  dashed?: boolean;
  tone?: Tone;
}

export interface DiagramPacket {
  id: string;
  edge: string;
  step: number;
  label?: string;
  tone?: Tone;
  /** Portion of the step's progress used for travel. */
  window?: [number, number];
}

interface DiagramProps {
  title: string;
  description: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  layouts: { wide: DiagramLayout; narrow?: DiagramLayout };
  nodeState?: (id: string) => ElementState;
  edgeState?: (id: string) => ElementState;
  selectable?: (id: string) => boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  packets?: DiagramPacket[];
  sequence?: Sequence;
}

export function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

function segmentLengths(points: Point[]) {
  const lengths: number[] = [];
  for (let i = 1; i < points.length; i++) {
    lengths.push(Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  return lengths;
}

export function pointAlong(points: Point[], t: number): Point {
  const lengths = segmentLengths(points);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let distance = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] || i === lengths.length - 1) {
      const ratio = lengths[i] === 0 ? 0 : distance / lengths[i];
      return [
        points[i][0] + (points[i + 1][0] - points[i][0]) * ratio,
        points[i][1] + (points[i + 1][1] - points[i][1]) * ratio,
      ];
    }
    distance -= lengths[i];
  }
  return points[points.length - 1];
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Fraction of the travel window used for fade-in and fade-out. */
const PACKET_FADE = 0.2;

export function Packet({ points, packet, sequence }: { points: Point[]; packet: DiagramPacket; sequence: Sequence }) {
  const ref = useRef<SVGGElement>(null);
  const [from, to] = packet.window ?? [0.05, 0.75];

  useEffect(
    () =>
      sequence.subscribe((step, progress) => {
        const node = ref.current;
        if (!node) return;
        if (step !== packet.step || progress < from || progress > to) {
          node.style.opacity = "0";
          return;
        }
        const local = (progress - from) / (to - from);
        const faded =
          local < PACKET_FADE ? local / PACKET_FADE : local > 1 - PACKET_FADE ? (1 - local) / PACKET_FADE : 1;
        const [x, y] = pointAlong(points, ease(local));
        node.style.opacity = faded.toFixed(3);
        node.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      }),
    [from, packet.step, points, sequence, to],
  );

  const labelWidth = packet.label ? packet.label.length * 6.4 + 12 : 0;

  return (
    <g ref={ref} className="bi-packet" data-tone={packet.tone ?? "neutral"} style={{ opacity: 0 }} aria-hidden="true">
      <circle r={4.5} />
      {packet.label && (
        <>
          <rect x={9} y={-21} width={labelWidth} height={17} rx={3} className="bi-packet-label-bg" />
          <text x={15} y={-9} className="bi-packet-label">
            {packet.label}
          </text>
        </>
      )}
    </g>
  );
}

function DiagramSvg({
  layout,
  variant,
  title,
  description,
  nodes,
  edges,
  nodeState,
  edgeState,
  selectable,
  selectedId,
  onSelect,
  packets,
  sequence,
}: DiagramProps & { layout: DiagramLayout; variant: "wide" | "narrow" }) {
  const uid = useSvgId(`bi-${variant}`);
  const interactive = Boolean(onSelect);

  const onKeyDown = (event: KeyboardEvent<SVGGElement>, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(id);
    }
  };

  return (
    <svg
      className={`bi-diagram bi-layout-${variant}`}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role={interactive ? "group" : "img"}
      aria-labelledby={`${uid}-title ${uid}-desc`}
    >
      <title id={`${uid}-title`}>{title}</title>
      <desc id={`${uid}-desc`}>{description}</desc>
      <defs>
        {(["idle", "active"] as const).map((kind) => (
          <marker
            key={kind}
            id={`${uid}-arrow-${kind}`}
            viewBox="0 0 8 8"
            markerWidth="7"
            markerHeight="7"
            refX="7"
            refY="4"
            orient="auto-start-reverse"
          >
            <path d="M1 1L7 4L1 7" fill="none" className={`bi-arrow-${kind}`} strokeWidth="1.3" />
          </marker>
        ))}
      </defs>

      {layout.boundaries?.map((boundary) => (
        <g key={boundary.id} className="bi-boundary">
          <rect x={boundary.x} y={boundary.y} width={boundary.w} height={boundary.h} rx={8} />
          <text x={boundary.x + 14} y={boundary.y + 20} className="bi-boundary-label">
            {boundary.label.toUpperCase()}
          </text>
          {boundary.sublabel && (
            <text x={boundary.x + 14} y={boundary.y + 35} className="bi-boundary-sublabel">
              {boundary.sublabel}
            </text>
          )}
        </g>
      ))}

      {layout.rules?.map((rule) => (
        <g key={rule.label} className="bi-rule">
          <line x1={rule.x1} y1={rule.y1} x2={rule.x2} y2={rule.y2} />
          <text x={rule.lx} y={rule.ly} textAnchor={rule.anchor ?? "middle"}>
            {rule.label}
          </text>
        </g>
      ))}

      {edges.map((edge) => {
        const geometry = layout.edges[edge.id];
        if (!geometry) return null;
        const state = edgeState?.(edge.id) ?? "idle";
        return (
          <g key={edge.id} className="bi-edge" data-state={state} data-tone={edge.tone ?? "neutral"} data-dashed={edge.dashed || undefined}>
            <polyline
              points={geometry.points.map((p) => p.join(",")).join(" ")}
              markerEnd={`url(#${uid}-arrow-${state === "active" || state === "visited" ? "active" : "idle"})`}
            />
            {geometry.label && (
              <text x={geometry.label.x} y={geometry.label.y} textAnchor={geometry.label.anchor ?? "middle"} className="bi-edge-label">
                {geometry.label.text}
              </text>
            )}
          </g>
        );
      })}

      {nodes.map((node) => {
        const box = layout.nodes[node.id];
        if (!box) return null;
        const state = nodeState?.(node.id) ?? "idle";
        const canSelect = interactive && (selectable?.(node.id) ?? true);
        const lines = box.lines ?? node.lines ?? [];
        const middle = box.align === "middle";
        const textX = middle ? box.x + box.w / 2 : box.x + 14;
        const blockHeight = 16 + lines.length * 17;
        const titleY = box.top ? box.y + 22 : box.y + (box.h - blockHeight) / 2 + 14;

        return (
          <g
            key={node.id}
            className="bi-node"
            data-tone={node.tone ?? "neutral"}
            data-state={state}
            data-selected={selectedId === node.id || undefined}
            {...(canSelect
              ? {
                  role: "button",
                  tabIndex: 0,
                  "aria-label": node.label ?? `${node.title}${lines.length ? `. ${lines.join(" ")}` : ""}`,
                  "aria-pressed": selectedId === node.id,
                  onClick: () => onSelect?.(node.id),
                  onKeyDown: (event: KeyboardEvent<SVGGElement>) => onKeyDown(event, node.id),
                }
              : {})}
          >
            <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={6} />
            <text x={textX} y={titleY} textAnchor={middle ? "middle" : "start"} className="bi-node-title">
              {node.title}
            </text>
            {lines.map((line, index) => (
              <text key={line} x={textX} y={titleY + 18 + index * 17} textAnchor={middle ? "middle" : "start"} className="bi-node-line">
                {line}
              </text>
            ))}
          </g>
        );
      })}

      {layout.notes?.map((note) => (
        <text key={`${note.x}-${note.y}`} x={note.x} y={note.y} textAnchor={note.anchor ?? "start"} className="bi-note" data-tone={note.tone}>
          {note.text}
        </text>
      ))}

      {sequence && !sequence.reducedMotion &&
        packets?.map((packet) => {
          const geometry = layout.edges[packet.edge];
          return geometry ? <Packet key={packet.id} points={geometry.points} packet={packet} sequence={sequence} /> : null;
        })}
    </svg>
  );
}

/** Renders a wide and an optional narrow arrangement; CSS container queries choose one. */
export function Diagram(props: DiagramProps) {
  const { layouts } = props;
  return (
    <div className="bi-diagram-wrap" data-responsive={layouts.narrow ? "true" : undefined}>
      <DiagramSvg {...props} layout={layouts.wide} variant="wide" />
      {layouts.narrow && <DiagramSvg {...props} layout={layouts.narrow} variant="narrow" />}
    </div>
  );
}
