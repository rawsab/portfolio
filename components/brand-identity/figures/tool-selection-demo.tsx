"use client";

import { useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Diagram, ElementState } from "../diagram";
import { ControlButton, FigureFrame, MonoLabel } from "../figure-frame";
import { SegmentedControl } from "../segmented-control";
import { useSequence } from "../use-sequence";
import * as data from "./tool-selection.data";

export function ToolSelectionDemo({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({ length: data.states.length, stepMs: 3400, rootRef: ref });
  const [draftChoice, setDraftChoice] = useState<"without" | "with" | null>(null);
  const [field, setField] = useState<data.ContextField | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const index = Math.max(sequence.step, 0);
  const state = data.states[index];
  const started = sequence.step >= 0;
  const viaContext = state.path === "context";
  const draft = draftChoice ?? (viaContext && started ? "with" : "without");

  const nodeState = (nodeId: string): ElementState => {
    if (!started) return "idle";
    if (nodeId === "call" || nodeId === "result") return viaContext ? "active" : "muted";
    return "active";
  };
  const edgeState = (edgeId: string): ElementState => {
    if (!started) return "idle";
    if (edgeId === "direct") return viaContext ? "muted" : "active";
    return viaContext ? "active" : "muted";
  };

  const choose = (next: number) => {
    sequence.goTo(next);
    setDraftChoice(null);
    setAnnouncement(`State ${next + 1}: ${data.states[next].label}. ${data.states[next].detail}`);
  };

  return (
    <FigureFrame
      ref={ref}
      id={id}
      number={number}
      title={title}
      badge="Scripted illustration"
      caption={data.caption}
      announcement={announcement}
      controls={
        <>
          {data.states.map((item, i) => (
            <ControlButton
              key={item.label}
              className="font-mono"
              pressed={sequence.step === i}
              aria-label={`State ${i + 1}: ${item.label}`}
              onClick={() => choose(i)}
            >
              {i + 1}
            </ControlButton>
          ))}
          <ControlButton
            icon
            aria-label={sequence.status === "playing" ? "Pause the tool-selection trace" : "Play the tool-selection trace"}
            onClick={() => {
              setAnnouncement(sequence.status === "playing" ? "Paused." : "Playing the three states.");
              sequence.toggle();
            }}
          >
            {sequence.status === "playing" ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
          </ControlButton>
          <ControlButton
            icon
            aria-label="Reset the tool-selection trace"
            onClick={() => {
              sequence.reset();
              setDraftChoice(null);
              setField(null);
              setAnnouncement("Reset.");
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </ControlButton>
        </>
      }
    >
      <div className="border-b border-zinc-800/50 px-5 py-3.5">
        <MonoLabel>User prompt · identical in every state</MonoLabel>
        <p className="mt-1 text-[0.95rem] text-zinc-200">“{data.prompt}”</p>
      </div>

      <div className="px-4 pt-4 pb-3 sm:px-5">
        <Diagram
          title="Selection path for the launch-email prompt"
          description="The prompt either goes directly to generation, or calls the context tool, receives a context result, and then generates. In state 1 the direct path is shown; in states 2 and 3 the path goes through context retrieval."
          nodes={data.nodes}
          edges={data.edges}
          layouts={{ wide: data.wide, narrow: data.narrow }}
          nodeState={nodeState}
          edgeState={edgeState}
          packets={data.packets}
          sequence={sequence}
        />
        <p className="mt-3 min-h-[2.75rem] text-sm leading-relaxed text-[#8F8F8F]">
          {started ? (
            <>
              <span className="text-zinc-200">
                State {index + 1}: {state.label}.
              </span>{" "}
              {state.detail}
            </>
          ) : (
            "Choose a state, or press play, to compare the three definitions."
          )}
        </p>
      </div>

      <div className="grid gap-px border-t border-zinc-800/50 bg-zinc-800/50 @2xl:grid-cols-2">
        <div className="bg-[#0d0d0f] p-5">
          <MonoLabel>Tool definition{started ? ` · state ${index + 1}` : ""}</MonoLabel>
          <dl className="mt-3 space-y-3 font-mono text-xs">
            {(["name", "description"] as const).map((key) => {
              const changed = started && state.changed.includes(key);
              return (
                <div key={key}>
                  <dt className="flex items-center gap-2 text-zinc-600">
                    {key}
                    {changed && (
                      <span data-tone="user" className="bi-tone-text rounded-full border border-current/30 px-1.5 text-[0.65rem]">
                        changed
                      </span>
                    )}
                  </dt>
                  <dd className={cn("mt-1 leading-relaxed", changed ? "text-zinc-100" : "text-zinc-400")}>{state[key]}</dd>
                </div>
              );
            })}
          </dl>
          <div className="mt-4 min-h-[3.5rem] border-t border-zinc-800/50 pt-3 text-xs leading-relaxed text-zinc-500">
            {started && index === 1 && <>Two overlapping context tools are consolidated into one discoverable tool.</>}
            {started && index === 2 && (
              <>
                <span className="text-zinc-400">Compatibility:</span> retrieve_brand_identity is no longer listed in discovery, but remains callable
                for existing integrations.
              </>
            )}
            {(!started || index === 0) && <>One of several context tools listed in discovery.</>}
          </div>
        </div>

        <div className="bg-[#0d0d0f] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <MonoLabel>Example draft</MonoLabel>
            <SegmentedControl
              label="Brand context"
              value={draft}
              onChange={(value) => {
                setDraftChoice(value);
                setAnnouncement(value === "with" ? "Showing the draft with brand context." : "Showing the draft without brand context.");
              }}
              options={[
                { value: "without", label: "Without context" },
                { value: "with", label: "With context" },
              ]}
            />
          </div>
          <p className="mt-3 min-h-[3.25rem] text-[0.95rem] leading-relaxed text-[#8F8F8F]">
            {data.drafts[draft].map((piece, i) =>
              typeof piece === "string" ? (
                piece
              ) : (
                <mark
                  key={i}
                  data-kind={field === piece.field ? (draft === "with" ? "added" : "removed") : undefined}
                  className={cn("bi-mark bg-transparent text-inherit", field === piece.field && "text-zinc-100")}
                >
                  {piece.text}
                </mark>
              ),
            )}
          </p>
          <div className="mt-4 border-t border-zinc-800/50 pt-3">
            <p className="mb-2 text-xs text-zinc-600">Inspect a context field</p>
            <div role="group" aria-label="Context fields" className="flex flex-wrap gap-1.5">
              {data.contextFields.map((item) => (
                <ControlButton
                  key={item.value}
                  pressed={field === item.value}
                  onClick={() => {
                    const next = field === item.value ? null : item.value;
                    setField(next);
                    if (next) setAnnouncement(`${item.label}: ${item.text}. ${data.fieldNotes[draft][next]}`);
                  }}
                  className="font-mono"
                >
                  {item.label}: {item.text}
                </ControlButton>
              ))}
            </div>
            <p className="mt-2 min-h-[1.25rem] text-xs text-zinc-500">{field ? data.fieldNotes[draft][field] : "\u00a0"}</p>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}
