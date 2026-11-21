"use client";

import { useMemo, useRef, useState } from "react";
import { Diagram, DiagramPacket, ElementState } from "@/components/brand-identity/diagram";
import { FigureFrame, MonoLabel, SequenceControls } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { useSequence } from "@/components/brand-identity/use-sequence";
import * as data from "./retrieval-architecture.data";

const INGEST = new Set(["facts", "aggregates", "reps", "embed", "pinecone"]);

export function RetrievalArchitecture({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const [scenario, setScenario] = useState<data.Scenario>("explain");
  const [selected, setSelected] = useState<string | null>("scope");
  const [announcement, setAnnouncement] = useState("");
  const path = data.paths[scenario];
  const sequence = useSequence({ length: path.length, stepMs: 900, rootRef: ref, threshold: 0.4 });
  const meta = data.scenarios.find((item) => item.value === scenario)!;
  const steps = useMemo(() => path.map((edge) => ({ label: `${data.sourceOf(edge)} to ${data.targetOf(edge)}` })), [path]);

  const packets: DiagramPacket[] = useMemo(
    () => path.map((edge, step) => ({ id: `${scenario}-${edge}`, edge, step, tone: edge === "scope-answer" ? "error" : undefined, window: [0.05, 0.85] })),
    [path, scenario],
  );

  const step = sequence.step;
  const done = sequence.status === "done";
  const onPath = new Set(path.flatMap((edge) => [data.sourceOf(edge), data.targetOf(edge)]));
  const unavailable = scenario === "unavailable";

  const nodeState = (nodeId: string): ElementState => {
    if (unavailable && nodeId === "answer" && (done || step >= 1)) return "error";
    if (!onPath.has(nodeId)) return INGEST.has(nodeId) ? "idle" : "muted";
    if (step < 0) return "idle";
    if (done) return nodeId === "answer" ? "active" : "visited";
    const current = path[step];
    if (data.targetOf(current) === nodeId) return "active";
    const seen = path.slice(0, step).some((edge) => data.targetOf(edge) === nodeId) || nodeId === data.sourceOf(path[0]) || data.sourceOf(current) === nodeId;
    return seen ? "visited" : "idle";
  };

  const edgeState = (edgeId: string): ElementState => {
    const index = path.indexOf(edgeId);
    if (index < 0) {
      const ingest = INGEST.has(data.sourceOf(edgeId)) && INGEST.has(data.targetOf(edgeId));
      return ingest && !unavailable ? "idle" : "muted";
    }
    if (step < 0) return "idle";
    if (done) return edgeId === "scope-answer" ? "error" : "visited";
    if (index === step) return "active";
    return index < step ? "visited" : "idle";
  };

  const detail = selected ? data.details[selected] : null;
  const selectedNode = data.nodes.find((node) => node.id === selected);

  return (
    <FigureFrame
      ref={ref}
      id={id}
      number={number}
      title={title}
      badge="Proposed architecture"
      caption={data.caption}
      announcement={announcement}
      controls={
        <>
          <SegmentedControl
            label="Question"
            value={scenario}
            onChange={(value) => {
              setScenario(value);
              sequence.replay();
              const next = data.scenarios.find((item) => item.value === value)!;
              setAnnouncement(`${next.question} ${next.outcome}`);
            }}
            options={data.scenarios.map(({ value, label }) => ({ value, label }))}
          />
          <SequenceControls sequence={sequence} steps={steps} name="the query path" showSteps={false} />
        </>
      }
    >
      <div className="border-b border-zinc-800/50 px-4 py-2.5">
        <MonoLabel>Question</MonoLabel>
        <p className="mt-0.5 font-mono text-[0.8rem] text-zinc-200">“{meta.question}”</p>
      </div>

      <div className="pal-hub-type pal-drift p-4">
        <Diagram
          title="Proposed multi-tier retrieval architecture"
          description="An ingestion lane turns validated facts in MySQL into scoped aggregates, three tiers of representations, OpenAI embeddings, and a Pinecone index. A query lane resolves authorization and scope, routes to a tier or to exact computation, fetches source values from MySQL, assembles evidence, and answers."
          nodes={data.nodes}
          edges={data.edges}
          layouts={{ wide: data.wide, narrow: data.narrow }}
          nodeText={{ gap: 16 }}
          nodeState={nodeState}
          edgeState={edgeState}
          selectedId={selected}
          onSelect={(nodeId) => {
            setSelected(nodeId);
            const node = data.nodes.find((item) => item.id === nodeId);
            setAnnouncement(`${node?.title} selected. ${data.details[nodeId].checks}.`);
          }}
          packets={packets}
          sequence={sequence}
        />
      </div>

      <div className="grid gap-px border-t border-zinc-800/50 bg-zinc-800/50 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="bg-[#0d0d0f] p-4">
          <MonoLabel>Path · {meta.label}</MonoLabel>
          <ol className="mt-2 space-y-1 text-[0.75rem] leading-snug text-zinc-400">
            {meta.steps.map((text, i) => (
              <li key={text} className="flex gap-2">
                <span className="font-mono text-zinc-600">{i + 1}</span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[0.75rem] leading-snug text-zinc-300">{meta.outcome}</p>
        </div>
        <div className="bg-[#0d0d0f] p-4">
          <MonoLabel>Node · {selectedNode?.title ?? "select a node"}</MonoLabel>
          {detail && (
            <dl className="pal-manifest mt-2">
              <dt>inputs</dt>
              <dd>{detail.inputs}</dd>
              <dt>outputs</dt>
              <dd>{detail.outputs}</dd>
              <dt>checks</dt>
              <dd>{detail.checks}</dd>
            </dl>
          )}
        </div>
      </div>
    </FigureFrame>
  );
}
