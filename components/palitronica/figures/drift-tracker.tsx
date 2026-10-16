"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Diagram, ElementState } from "@/components/brand-identity/diagram";
import { ControlButton, FigureFrame, MonoLabel, SequenceControls } from "@/components/brand-identity/figure-frame";
import { useSequence } from "@/components/brand-identity/use-sequence";
import { cn } from "@/lib/utils";
import * as data from "./drift-tracker.data";

const STEPS = [{ label: "Day 12 window" }, { label: "Day 13 window" }, { label: "Day 14 window" }];

export function DriftTracker({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({
    length: STEPS.length,
    stepMs: 4200,
    rootRef: ref,
    threshold: 0.4,
  });
  const [progress, setProgress] = useState(1);
  const [referenceChanged, setReferenceChanged] = useState(false);
  const [selected, setSelected] = useState(2);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => sequence.subscribe((_, value) => setProgress(value)), [sequence]);

  const animating = sequence.status === "playing" || sequence.status === "paused";
  const step = sequence.step;
  const records = data.windows(referenceChanged);
  const completed = (index: number) => step > index || (step === index && (!animating || progress > 0.72));
  const flowIndex = animating ? Math.floor(progress * data.flow.length) : -1;
  const activeEdge = data.flow[flowIndex];
  const activeNode = activeEdge ? data.targetOf(activeEdge) : null;
  const visitedNodes = new Set(data.flow.slice(0, Math.max(0, flowIndex)).map(data.targetOf));

  const nodeState = (nodeId: string): ElementState => {
    if (step < 0) return "idle";
    if (!animating) return "visited";
    if (nodeId === activeNode) return "active";
    if (visitedNodes.has(nodeId) || step > 0) return "visited";
    if (nodeId === "measurements" && progress > 0) return "visited";
    return "idle";
  };
  const edgeState = (edgeId: string): ElementState => {
    if (step < 0) return "idle";
    if (!animating) return "visited";
    if (edgeId === activeEdge) return "active";
    const seen = data.flow.indexOf(edgeId);
    const current = activeEdge ? data.flow.indexOf(activeEdge) : data.flow.length;
    return seen >= 0 && seen < current ? "visited" : "idle";
  };

  const record = records[selected];
  const visibleSelected = completed(selected);

  return (
    <FigureFrame
      ref={ref}
      id={id}
      number={number}
      title={title}
      badge="Synthetic"
      caption={data.caption}
      announcement={announcement}
      controls={
        <>
          <ControlButton
            pressed={referenceChanged}
            onClick={() => {
              setReferenceChanged((value) => !value);
              setSelected(2);
              setAnnouncement(
                referenceChanged
                  ? "Day 14 uses the reference dataset again."
                  : "Day 14 now uses a different reference dataset. Its drift values change even though the current measurements are the same.",
              );
            }}
          >
            Reference changed
          </ControlButton>
          <SequenceControls
            sequence={sequence}
            steps={STEPS}
            name="the catch-up replay"
            onStep={(index) => {
              setSelected(index);
              setAnnouncement(`${STEPS[index].label} evaluated and recorded.`);
            }}
          />
        </>
      }
    >
      <div className="pal-hub-type pal-drift p-4">
        <Diagram
          title="Historical drift-tracking architecture"
          description="New measurements in a time window are compared with a selected reference. Both sides are reconstructed into comparable features, drift is calculated, and the result is stored with its provenance. That history is shown in Prometheus and Grafana."
          nodes={data.nodes}
          edges={data.edges}
          layouts={{ wide: data.wide, narrow: data.narrow }}
          nodeText={{ gap: 16, inset: 12 }}
          nodeState={nodeState}
          edgeState={edgeState}
          packets={data.packets}
          sequence={sequence}
        />
      </div>

      <div className="grid gap-px border-t border-zinc-800/50 bg-zinc-800/50 @2xl:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="bg-[#0d0d0f] p-4">
          <MonoLabel>History</MonoLabel>
          <ul className="mt-2 space-y-1">
            {records.map((item, index) => {
              const done = completed(index);
              const changed = referenceChanged && item.day === 14;
              return (
                <li key={item.day}>
                  <button
                    type="button"
                    disabled={!done}
                    aria-pressed={selected === index}
                    onClick={() => {
                      setSelected(index);
                      setAnnouncement(`Day ${item.day} record selected.`);
                    }}
                    className={cn(
                      "bi-control w-full cursor-pointer rounded-md border px-2.5 py-1.5 text-left font-mono text-[0.7rem] transition-colors duration-200 disabled:cursor-default",
                      selected === index && done ? "border-zinc-600 bg-white/5 text-zinc-200" : "border-zinc-800/60 text-zinc-500 hover:border-zinc-700",
                      !done && "border-dashed opacity-50",
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span>Day {item.day}</span>
                      <span>{done ? `R ${item.drift.reflection.toFixed(3)}` : "pending"}</span>
                    </span>
                    {changed && done && (
                      <span className="mt-0.5 block bi-tone-text" data-tone="user">
                        reference changed
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={cn("bg-[#0d0d0f] p-4 transition-opacity duration-300", !visibleSelected && "opacity-40")}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <MonoLabel>Record · Day {record.day}</MonoLabel>
            <span className="font-mono text-[0.68rem] text-zinc-500">{record.bounds}</span>
          </div>
          <div className="mt-3 grid gap-3 @xl:grid-cols-2">
            <dl className="pal-manifest">
              <dt>current</dt>
              <dd>{record.current.label}</dd>
              <dt>group</dt>
              <dd>{record.current.group}</dd>
              <dt>captures</dt>
              <dd>n = {record.current.captures}</dd>
            </dl>
            <dl className="pal-manifest" data-changed={(referenceChanged && record.day === 14) || undefined}>
              <dt>reference</dt>
              <dd>{record.reference.label}</dd>
              <dt>captures</dt>
              <dd>n = {record.reference.captures}</dd>
            </dl>
            <dl className="pal-manifest">
              <dt>paths</dt>
              <dd>{data.extraction.paths}</dd>
              <dt>reps</dt>
              <dd>{data.extraction.representations}</dd>
              <dt>grid</dt>
              <dd>{data.extraction.grid}</dd>
            </dl>
            <dl className="pal-manifest">
              <dt>max refl.</dt>
              <dd>
                {record.drift.reflection.toFixed(3)} · path {record.drift.reflectionPath}
              </dd>
              <dt>max trans.</dt>
              <dd>
                {record.drift.transmission.toFixed(3)} · path {record.drift.transmissionPath}
              </dd>
            </dl>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] text-zinc-500" aria-label="Compatibility checks">
            {data.checks.map((check) => (
              <li key={check} className="inline-flex items-center gap-1.5">
                <Check className="bi-tone-text h-3 w-3" data-tone="code" aria-hidden />
                {check} match
              </li>
            ))}
          </ul>
          {referenceChanged && record.day === 14 && (
            <p className="mt-2 text-[0.72rem] leading-snug text-zinc-400">
              Same current measurements, different reference: the history point moves because the comparison changed, not because the measurements did.
            </p>
          )}
        </div>
      </div>
    </FigureFrame>
  );
}
