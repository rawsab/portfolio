"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Diagram, ElementState } from "../diagram";
import { FigureFrame, MonoLabel, SequenceControls } from "../figure-frame";
import { SegmentedControl } from "../segmented-control";
import { useSequence } from "../use-sequence";
import * as data from "./mcp-context-flow.data";

const NAME = "the brand context sequence";

export function McpContextFlow({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({ length: data.steps.length, stepMs: [1500, 1700, 1900, 1900, 1900, 1700], rootRef: ref });
  const [tabChoice, setTabChoice] = useState<"request" | "result" | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const { step } = sequence;
  const stateAt = (activeAt: number): ElementState => (step < 0 || step < activeAt ? "idle" : step === activeAt ? "active" : "visited");
  const tab = tabChoice ?? (step >= 3 ? "result" : "request");

  const selectStep = (index: number) => {
    sequence.goTo(index);
    setTabChoice(null);
    setAnnouncement(`Step ${index + 1} of ${data.steps.length}, ${data.steps[index].label}. ${data.steps[index].detail}`);
  };

  const current = step >= 0 ? data.steps[step] : null;

  return (
    <FigureFrame
      ref={ref}
      id={id}
      number={number}
      title={title}
      badge="Illustrative context"
      caption={data.caption}
      announcement={announcement}
      controls={
        <SequenceControls
          sequence={{
            ...sequence,
            toggle: () => {
              setAnnouncement(sequence.status === "playing" ? "Paused." : "Playing the sequence.");
              sequence.toggle();
            },
            replay: () => {
              setTabChoice(null);
              setAnnouncement("Replaying from the prompt.");
              sequence.replay();
            },
          }}
          steps={[...data.steps]}
          name={NAME}
          showSteps={false}
        />
      }
    >
      <div className="p-4 sm:p-5">
        <Diagram
          title="Brand context across the MCP boundary"
          description="Inside the AI client, a writing prompt enters the conversation, the model selects a context tool from the tool registry, and a tools/call request crosses the MCP boundary to a context tool in the connected HubSpot service. The tool reads brand context covering voice and tone, audience, products, and messaging. The tool result returns to the conversation, and the draft begins after the context arrives."
          nodes={data.nodes(step >= 5)}
          edges={data.edges}
          layouts={{ wide: data.wide, narrow: data.narrow }}
          nodeState={(nodeId) => stateAt(nodeId === "conversation" && step === 4 ? 4 : data.nodeStep[nodeId])}
          edgeState={(edgeId) => stateAt(data.edgeStep[edgeId])}
          selectedId={null}
          onSelect={(nodeId) => selectStep(data.nodeStep[nodeId])}
          packets={data.packets}
          sequence={sequence}
        />
      </div>

      <div className="grid gap-px border-t border-zinc-800/50 bg-zinc-800/50 @xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="bg-[#0d0d0f] p-4">
          <MonoLabel>Steps</MonoLabel>
          <ol className="mt-2.5 space-y-0.5">
            {data.steps.map((item, index) => {
              const active = step === index;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => selectStep(index)}
                    className={cn(
                      "bi-control flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors duration-200",
                      active ? "bg-zinc-800/50 text-white" : step > index ? "text-zinc-400 hover:bg-zinc-800/30" : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300",
                    )}
                  >
                    <span className="w-4 font-mono text-xs text-zinc-600">{index + 1}</span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex min-h-[17rem] flex-col bg-[#0d0d0f] p-4">
          <p className="min-h-[3rem] text-sm leading-relaxed text-[#8F8F8F]">
            {current ? (
              <>
                <span className="text-zinc-200">{current.label}.</span> {current.detail}
              </>
            ) : (
              "Press play, or choose a step or a node in the diagram, to follow the request."
            )}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <MonoLabel>Payload inspector</MonoLabel>
            <SegmentedControl
              label="Payload"
              value={tab}
              onChange={setTabChoice}
              options={[
                { value: "request", label: "Request" },
                { value: "result", label: "Result" },
              ]}
            />
          </div>
          <pre className="bi-payload mt-3 flex-1 rounded-md border border-zinc-800/50 bg-black/40 p-3">
            {tab === "request" ? data.requestPayload : data.resultPayload}
          </pre>
          <p className="mt-2 text-xs text-zinc-600">Synthetic payload. Keys are illustrative and are not an API schema.</p>
        </div>
      </div>
    </FigureFrame>
  );
}
