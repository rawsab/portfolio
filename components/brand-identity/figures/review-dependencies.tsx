"use client";

import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Diagram, ElementState } from "../diagram";
import { ControlButton, FigureFrame } from "../figure-frame";
import { SegmentedControl } from "../segmented-control";
import { useSequence } from "../use-sequence";
import * as data from "./review-dependencies.data";

export function ReviewDependencies({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({ length: data.steps.length, stepMs: 1100, rootRef: ref, threshold: 0.6 });
  const [mode, setMode] = useState<data.Mode>("full");
  const [announcement, setAnnouncement] = useState("");
  const { step } = sequence;

  const reached = (index: number) => step >= index;
  const nodeState = (nodeId: string): ElementState => {
    const at = { rewrite: 0, diff: 1, explain: 2, result: 3, failed: 1 }[nodeId] ?? 0;
    if (mode === "failed") {
      if (nodeId === "rewrite") return reached(0) ? "error" : "idle";
      if (nodeId === "failed") return reached(1) ? "error" : "idle";
      return "muted";
    }
    if (nodeId === "failed") return "muted";
    if (nodeId === "explain" && mode === "unavailable") return reached(2) ? "error" : "idle";
    if (!reached(at)) return "idle";
    return step === at ? "active" : "visited";
  };
  const edgeState = (edgeId: string): ElementState => {
    if (mode === "failed") return edgeId === "to-failed" ? (reached(1) ? "error" : "idle") : "muted";
    if (edgeId === "to-failed") return "muted";
    if (edgeId === "explain-result" && mode === "unavailable") return "muted";
    const at = { "rewrite-diff": 1, "diff-result": 2, "diff-explain": 2, "explain-result": 3 }[edgeId] ?? 0;
    return reached(at) ? "visited" : "idle";
  };

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
          aria-label="Replay the dependency sequence"
          onClick={() => {
            setAnnouncement(`Replaying: ${current.label}.`);
            sequence.replay();
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        </ControlButton>
      }
    >
      <div className="border-b border-zinc-800/50 px-4 py-3">
        <SegmentedControl
          label="Outcome"
          value={mode}
          onChange={(value) => {
            setMode(value);
            sequence.goTo(data.steps.length - 1);
            setAnnouncement(data.modes.find((item) => item.value === value)!.summary);
          }}
          options={data.modes.map(({ value, label }) => ({ value, label }))}
          className="max-w-full flex-wrap"
        />
      </div>
      <div className="p-4">
        <Diagram
          title="Required stages and optional enrichment"
          description="Rewrite leads to a deterministic diff, which leads directly to the review result. An optional branch sends the diff and brand context to explanations, which enrich the review result. If rewrite or diff fails, the review could not complete. If explanations fail, the review still has revised text and segments."
          nodes={data.nodes(mode)}
          edges={data.edges}
          layouts={{ wide: data.wide, narrow: data.narrow }}
          nodeState={nodeState}
          edgeState={edgeState}
          packets={mode === "full" ? data.packets : mode === "failed" ? [] : data.packets.filter((packet) => packet.edge !== "explain-result")}
          sequence={sequence}
        />
        <p className="mt-3 min-h-[2.75rem] text-sm leading-relaxed text-[#8F8F8F]">
          <span className="text-zinc-200">{current.label}.</span> {current.summary}
        </p>
      </div>
    </FigureFrame>
  );
}
