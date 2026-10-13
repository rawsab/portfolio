"use client";

import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { DiagramPacket, Packet, useSvgId } from "../diagram";
import { ControlButton, FigureFrame } from "../figure-frame";
import { SegmentedControl } from "../segmented-control";
import { Sequence, useSequence } from "../use-sequence";
import * as data from "./discovery-semantics.data";

type Layout = (typeof data.layouts)["wide"];

function splitLabel(label: string, narrow: boolean) {
  if (!narrow) return [label];
  const mid = Math.floor(label.length / 2);
  const before = label.lastIndexOf(" ", mid);
  const after = label.indexOf(" ", mid);
  const splitAt = before > 0 ? before : after;
  return splitAt > 0 ? [label.slice(0, splitAt), label.slice(splitAt + 1)] : [label];
}

function SequenceSvg({ layout, variant, mode, sequence }: { layout: Layout; variant: "wide" | "narrow"; mode: data.Mode; sequence: Sequence }) {
  const uid = useSvgId(`bi-seq-${variant}`);
  const narrow = variant === "narrow";
  const discovery = data.discovery(mode);
  const x = (lane: number) => layout.lanes[lane];

  const renderMessage = (message: data.Message) => {
    const x1 = x(message.from);
    const x2 = x(message.to);
    const dir = Math.sign(x2 - x1);
    const mid = (x1 + x2) / 2;
    return (
      <g key={message.id} className="bi-edge" data-state={message.tone === "error" ? "error" : "active"} data-tone={message.tone ?? "neutral"}>
        <polyline points={`${x1 + dir * 4},${message.y} ${x2 - dir * 6},${message.y}`} markerEnd={`url(#${uid}-arrow)`} />
        <text x={mid} y={message.y - 8} textAnchor="middle" className="bi-packet-label">
          {message.label}
        </text>
        {message.sublabel && (
          <text x={mid} y={message.y + 16} textAnchor="middle" className="bi-edge-label">
            {message.sublabel}
          </text>
        )}
      </g>
    );
  };

  const renderNote = (note: data.Note) => {
    const lines = splitLabel(note.label, narrow);
    const lineHeight = 13;
    const padY = 7;
    const height = lines.length * lineHeight + padY * 2;
    const top = note.y - height / 2;
    return (
      <g key={note.label} className="bi-node" data-state="active" data-tone={note.tone}>
        <rect x={x(note.lane) - layout.boxWidth / 2} y={top} width={layout.boxWidth} height={height} rx={4} />
        {lines.map((line, index) => (
          <text
            key={line}
            x={x(note.lane)}
            y={top + padY + lineHeight / 2 + index * lineHeight}
            textAnchor="middle"
            dominantBaseline="central"
            className="bi-node-line"
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  const packets: { points: [number, number][]; packet: DiagramPacket }[] = discovery.messages.map((message, index) => ({
    points: [
      [x(message.from), message.y],
      [x(message.to), message.y],
    ],
    packet: { id: message.id, edge: message.id, step: index, window: [0.1, 0.85] },
  }));

  return (
    <svg className={`bi-diagram bi-layout-${variant}`} viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
      <title id={`${uid}-title`}>Discovery and execution as a protocol trace</title>
      <desc id={`${uid}-desc`}>
        {`Discovery: the client sends tools/list to capability configuration. ${data.modes.find((item) => item.value === mode)?.summary} Execution: the client sends tools/call to tool execution, which checks authorization and returns an allowed result or a denied result.`}
      </desc>
      <defs>
        <marker id={`${uid}-arrow`} viewBox="0 0 8 8" markerWidth="7" markerHeight="7" refX="7" refY="4" orient="auto-start-reverse">
          <path d="M1 1L7 4L1 7" fill="none" className="bi-arrow-active" strokeWidth="1.3" />
        </marker>
      </defs>

      {layout.lanes.map((laneX, lane) => (
        <g key={lane}>
          <line x1={laneX} y1={38} x2={laneX} y2={layout.height - 8} stroke="#3f3f46" strokeDasharray="2 4" />
          <g className="bi-node" data-state="idle">
            <rect x={laneX - layout.boxWidth / 2} y={8} width={layout.boxWidth} height={30} rx={5} />
            <text x={laneX} y={27} textAnchor="middle" className="bi-node-title" style={narrow ? { fontSize: 11 } : undefined}>
              {layout.laneNames[lane]}
            </text>
          </g>
        </g>
      ))}

      <text x={6} y={66} className="bi-boundary-label">
        DISCOVERY
      </text>
      <line x1={0} y1={208} x2={layout.width} y2={208} stroke="#27272a" />
      <text x={6} y={226} className="bi-boundary-label">
        EXECUTION
      </text>

      {discovery.messages.map(renderMessage)}
      {renderNote(discovery.note)}
      {data.execution.messages.map(renderMessage)}
      {renderNote(data.execution.note)}

      {!sequence.reducedMotion && packets.map((item) => <Packet key={item.packet.id} points={item.points} packet={item.packet} sequence={sequence} />)}
    </svg>
  );
}

export function DiscoverySemantics({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({ length: 2, stepMs: 900, rootRef: ref, threshold: 0.6 });
  const [mode, setMode] = useState<data.Mode>("after");
  const [announcement, setAnnouncement] = useState("");
  const current = data.modes.find((item) => item.value === mode)!;

  return (
    <FigureFrame
      ref={ref}
      id={id}
      number={number}
      title={title}
      width="column"
      caption={data.caption}
      announcement={announcement}
      controls={
        <ControlButton
          icon
          aria-label="Replay the discovery packet"
          onClick={() => {
            sequence.replay();
            setAnnouncement(`Replaying: ${current.label}.`);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </ControlButton>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/50 px-4 py-3">
        <SegmentedControl
          label="Discovery behavior"
          value={mode}
          onChange={(value) => {
            setMode(value);
            sequence.replay();
            setAnnouncement(data.modes.find((item) => item.value === value)!.summary);
          }}
          options={data.modes.map(({ value, label }) => ({ value, label }))}
        />
      </div>
      <div className="p-4">
        <p className="mb-4 rounded-md border border-zinc-800/50 bg-black/30 px-3 py-2 text-xs text-zinc-400">
          <span className="text-zinc-500">Precondition:</span> valid authenticated connection{mode === "permitted" ? "; capability available to this user." : "; capability unavailable to this user."}
        </p>
        <div className="bi-diagram-wrap" data-responsive="true">
          <SequenceSvg layout={data.layouts.wide} variant="wide" mode={mode} sequence={sequence} />
          <SequenceSvg layout={data.layouts.narrow} variant="narrow" mode={mode} sequence={sequence} />
        </div>
        <p className="mt-3 min-h-[2.75rem] text-sm leading-relaxed text-[#8F8F8F]">
          <span className="text-zinc-200">{current.label}.</span> {current.summary} An empty list is not permission to execute an unavailable
          tool, and genuine authentication or request failures remain failures.
        </p>
      </div>
    </FigureFrame>
  );
}
