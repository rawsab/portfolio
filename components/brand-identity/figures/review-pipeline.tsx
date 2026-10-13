"use client";

import { ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Diagram, ElementState } from "../diagram";
import { FigureFrame, MonoLabel, SequenceControls } from "../figure-frame";
import { useSequence } from "../use-sequence";
import * as data from "./review-pipeline.data";

const LEGEND = [
  { tone: "model", label: "Model call" },
  { tone: "code", label: "Deterministic code" },
  { tone: "user", label: "User-facing" },
] as const;

function Artifact({ label, children, optional }: { label: string; children: ReactNode; optional?: boolean }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-2 text-xs text-zinc-600">
        {label}
        {optional && <span className="rounded-full border border-dashed border-zinc-700 px-1.5 text-[0.65rem] text-zinc-500">optional</span>}
      </p>
      {children}
    </div>
  );
}

const Pre = ({ children, scroll }: { children: ReactNode; scroll?: boolean }) => (
  <pre
    className={cn(
      "bi-payload rounded-md border border-zinc-800/50 bg-black/40 px-3 py-2",
      scroll &&
        "max-h-36 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#3f3f46_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700",
    )}
  >
    {children}
  </pre>
);

function Inspector({ nodeId }: { nodeId: string }) {
  switch (nodeId) {
    case "context":
      return (
        <Artifact label="Synthetic voice guidance">
          <Pre>{data.guidance}</Pre>
        </Artifact>
      );
    case "original":
      return (
        <Artifact label="Original">
          <Pre>{data.original}</Pre>
        </Artifact>
      );
    case "rewrite":
      return (
        <>
          <Artifact label="Inputs">
            <Pre>{`guidance: ${data.guidance}\noriginal: ${data.original}`}</Pre>
          </Artifact>
          <Artifact label="Candidate revision">
            <Pre>{data.revised}</Pre>
          </Artifact>
        </>
      );
    case "diff":
      return (
        <>
          <Artifact label="Ordered segments">
            <Pre scroll>{JSON.stringify(data.segments, null, 2)}</Pre>
          </Artifact>
          <Artifact label="Reconstruction property">
            <Pre>{`renderRevised(segments) === revised  // ${data.reconstructs}`}</Pre>
          </Artifact>
        </>
      );
    case "explain":
      return (
        <>
          <Artifact label="Per-change reasoning" optional>
            <Pre>{data.explanations.map((item) => `segment ${item.segment}: ${item.text}`).join("\n")}</Pre>
          </Artifact>
          <Artifact label="Summary and score" optional>
            <Pre>{`${data.summary}\nscore: ${data.score} / 100  // model-estimated, illustrative`}</Pre>
          </Artifact>
        </>
      );
    default:
      return (
        <>
          <Artifact label="Revised text">
            <Pre>{data.revised}</Pre>
          </Artifact>
          <Artifact label="Segments">
            <Pre>{`${data.segments.length} ordered segments`}</Pre>
          </Artifact>
          <Artifact label="Explanations, summary, score" optional>
            <Pre>attached when the explanation stage succeeds</Pre>
          </Artifact>
        </>
      );
  }
}

const defaultNode = ["rewrite", "diff", "explain", "assembly"];

export function ReviewPipeline({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({ length: data.stages.length, stepMs: 2600, rootRef: ref });
  const [selected, setSelected] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const { step } = sequence;

  const stateAt = (stage: number): ElementState => (step < 0 || step < stage ? "idle" : step === stage ? "active" : "visited");
  const inspected = selected ?? (step >= 0 ? defaultNode[step] : "rewrite");
  const inspectedNode = data.nodes.find((node) => node.id === inspected);

  return (
    <FigureFrame
      ref={ref}
      id={id}
      number={number}
      title={title}
      caption={data.caption}
      announcement={announcement}
      controls={
        <SequenceControls
          sequence={{
            ...sequence,
            toggle: () => {
              setSelected(null);
              setAnnouncement(sequence.status === "playing" ? "Paused." : "Playing the review pipeline.");
              sequence.toggle();
            },
            replay: () => {
              setSelected(null);
              setAnnouncement("Replaying from the rewrite stage.");
              sequence.replay();
            },
          }}
          steps={data.stages}
          name="the review pipeline"
          onStep={(index) => {
            setSelected(null);
            setAnnouncement(`Stage ${index + 1}, ${data.stages[index].label}. ${data.stages[index].detail}`);
          }}
        />
      }
    >
      <div className="p-4 sm:p-5">
        <Diagram
          title="Rewrite, diff, and explanation pipeline"
          description="Inside the connected review service, brand context and the original document enter a rewrite model. The original and revised strings enter a deterministic diff engine. Changed segments and brand guidance enter an explanation model. Segments go directly to response assembly, and explanations join as optional enrichment. The structured review reaches the review UI in the AI client."
          nodes={data.nodes}
          edges={data.edges}
          layouts={{ wide: data.wide, narrow: data.narrow }}
          nodeState={(nodeId) => stateAt(data.nodeStage[nodeId])}
          edgeState={(edgeId) => stateAt(data.edgeStage[edgeId])}
          selectedId={inspected}
          onSelect={(nodeId) => {
            setSelected(nodeId);
            const node = data.nodes.find((item) => item.id === nodeId);
            setAnnouncement(`Inspecting ${node?.title}.`);
          }}
          packets={data.packets}
          sequence={sequence}
        />
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500" aria-label="Legend">
          {LEGEND.map((item) => (
            <li key={item.tone} data-tone={item.tone} className="bi-chip inline-flex items-center gap-1.5 border-0">
              <span className="bi-swatch" aria-hidden />
              {item.label}
            </li>
          ))}
          <li className="inline-flex items-center gap-1.5">
            <svg width="18" height="6" aria-hidden>
              <line x1="0" y1="3" x2="18" y2="3" stroke="#71717a" strokeDasharray="4 3" />
            </svg>
            Optional enrichment
          </li>
        </ul>
      </div>

      <div className="grid gap-px border-t border-zinc-800/50 bg-zinc-800/50 @xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="bg-[#0d0d0f] p-4">
          <MonoLabel>Stages</MonoLabel>
          <ol className="mt-2.5 space-y-1">
            {data.stages.map((stage, index) => {
              const active = step === index;
              return (
                <li key={stage.label}>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-expanded={active}
                    onClick={() => {
                      setSelected(null);
                      sequence.goTo(index);
                      setAnnouncement(`Stage ${index + 1}, ${stage.label}. ${stage.detail}`);
                    }}
                    className={cn(
                      "bi-control flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-200",
                      active ? "bg-zinc-800/50 text-white" : step > index ? "text-zinc-400 hover:bg-zinc-800/30" : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300",
                    )}
                  >
                    <span className="w-4 font-mono text-xs text-zinc-600">{index + 1}</span>
                    {stage.label}
                  </button>
                  {active && (
                    <p className="mt-1 mb-1.5 rounded-md border border-zinc-800/50 bg-black/40 px-3 py-2 text-[0.8rem] leading-relaxed text-[#8F8F8F]">
                      {stage.detail}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
        <div className="min-h-[19rem] space-y-3 bg-[#0d0d0f] p-4">
          <div className="flex items-center justify-between gap-2">
            <MonoLabel>Inspector · {inspectedNode?.title}</MonoLabel>
            <span className="text-xs text-zinc-600">Select a node to inspect it</span>
          </div>
          <Inspector nodeId={inspected} />
        </div>
      </div>
    </FigureFrame>
  );
}
