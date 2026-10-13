"use client";

import { KeyboardEvent, ReactNode, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ControlButton, FigureFrame, MonoLabel } from "../figure-frame";
import { SegmentedControl } from "../segmented-control";
import * as data from "./segment-debugger.data";

const KIND: Record<data.Segment["type"], string> = {
  UNCHANGED: "unchanged",
  MODIFIED: "modified",
  ADDED: "added",
  REMOVED: "removed",
};

function renderText(text: string, whitespace: boolean): ReactNode {
  if (!whitespace) return text;
  const out: ReactNode[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer) out.push(buffer);
    buffer = "";
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === " ") {
      flush();
      out.push(
        <span key={i} className="bi-ws bi-ws-space">
          {" "}
        </span>,
      );
    } else if (char === "\n" || char === "\r") {
      flush();
      out.push(
        <span key={`m${i}`} className="bi-ws-marker" aria-hidden>
          {char === "\n" ? "LF" : "CR"}
        </span>,
      );
      out.push(char);
    } else {
      buffer += char;
    }
  }
  flush();
  return out;
}

const formatRange = ([start, end]: [number, number]) => `[${start}, ${end})`;
const show = (value: string) => JSON.stringify(value);

function Pane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col bg-[#0d0d0f] p-4">
      <MonoLabel>{label}</MonoLabel>
      {children}
    </div>
  );
}

export function SegmentDebugger({ id, number, title }: { id: string; number: number; title: string }) {
  const [fixtureId, setFixtureId] = useState<data.Fixture["id"]>("primary");
  const [whitespace, setWhitespace] = useState(false);
  const [selected, setSelected] = useState(1);
  const [reconstructed, setReconstructed] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const fixture = data.fixtures.find((item) => item.id === fixtureId)!;
  const ranges = useMemo(() => data.computeRanges(fixture.segments), [fixture]);
  const active = Math.min(selected, fixture.segments.length - 1);
  const range = ranges[active];

  const highlight = (text: string, [start, end]: [number, number], kind: string) => (
    <>
      {renderText(text.slice(0, start), whitespace)}
      {start === end ? (
        <span aria-hidden className="bi-ws-marker select-none" data-kind={kind}>
          ∅
        </span>
      ) : (
        <mark className="bi-mark bg-transparent text-zinc-100" data-kind={kind} data-selected="true">
          {renderText(text.slice(start, end), whitespace)}
        </mark>
      )}
      {renderText(text.slice(end), whitespace)}
    </>
  );

  const choose = (index: number) => {
    setSelected(index);
    const segment = fixture.segments[index];
    setAnnouncement(
      `Segment ${index}, ${segment.type}. Original ${formatRange(ranges[index].original)}, revised ${formatRange(ranges[index].revised)}.`,
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLLIElement>, index: number) => {
    const last = fixture.segments.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? Math.min(index + 1, last)
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? Math.max(index - 1, 0)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    choose(next);
    optionRefs.current[next]?.focus();
  };

  const result = reconstructed !== null ? reconstructed === fixture.revised : null;

  return (
    <FigureFrame
      id={id}
      number={number}
      title={title}
      caption={data.caption}
      announcement={announcement}
      controls={
        <>
          <SegmentedControl
            label="Display"
            value={whitespace ? "whitespace" : "text"}
            onChange={(value) => {
              setWhitespace(value === "whitespace");
              setAnnouncement(value === "whitespace" ? "Whitespace markers shown." : "Plain text shown.");
            }}
            options={[
              { value: "text", label: "Text" },
              { value: "whitespace", label: "Whitespace" },
            ]}
          />
          <ControlButton
            onClick={() => {
              const value = data.renderRevised(fixture.segments);
              setReconstructed(value);
              setAnnouncement(`Reconstructed. reconstructed equals revisedContent: ${value === fixture.revised}.`);
            }}
          >
            Reconstruct
          </ControlButton>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800/50 px-4 py-3">
        <span className="text-xs text-zinc-600">Fixture</span>
        <SegmentedControl
          label="Fixture"
          value={fixtureId}
          onChange={(value) => {
            setFixtureId(value);
            setSelected(1);
            setReconstructed(null);
            setAnnouncement(`${data.fixtures.find((item) => item.id === value)?.label} fixture loaded.`);
          }}
          options={data.fixtures.map((item) => ({ value: item.id, label: item.label }))}
        />
      </div>

      <div className="grid gap-px bg-zinc-800/50 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)]">
        <Pane label="Original">
          <pre className="bi-payload mt-2.5 text-[0.8rem] text-zinc-400">{highlight(fixture.original, range.original, KIND[fixture.segments[active].type])}</pre>
        </Pane>

        <Pane label="Segments">
          <ul role="listbox" aria-label="Ordered segments" className="mt-2.5 space-y-1">
            {fixture.segments.map((segment, index) => (
              <li
                key={`${fixture.id}-${index}`}
                id={`${id}-segment-${index}`}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                role="option"
                aria-selected={index === active}
                tabIndex={index === active ? 0 : -1}
                onClick={() => choose(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={cn(
                  "bi-focusable cursor-pointer rounded-md border px-2.5 py-1.5 font-mono text-[0.7rem] leading-relaxed transition-colors duration-200",
                  index === active ? "border-zinc-600 bg-white/5 text-zinc-200" : "border-zinc-800/60 text-zinc-500 hover:border-zinc-700",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>
                    <span className="text-zinc-600">{index}</span>{" "}
                    <span data-tone={segment.type === "MODIFIED" ? "model" : segment.type === "ADDED" ? "code" : segment.type === "REMOVED" ? "error" : undefined} className="bi-tone-text">
                      {segment.type}
                    </span>
                  </span>
                </div>
                {index === active && (
                  <dl className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 text-zinc-400">
                    <dt className="text-zinc-600">old</dt>
                    <dd className="break-all">{segment.type === "ADDED" ? "—" : show(data.originalValue(segment))}</dd>
                    <dt className="text-zinc-600">new</dt>
                    <dd className="break-all">{segment.type === "REMOVED" ? "— omitted" : show(data.revisedValue(segment))}</dd>
                    <dt className="text-zinc-600">orig</dt>
                    <dd>{formatRange(ranges[index].original)}</dd>
                    <dt className="text-zinc-600">rev</dt>
                    <dd>{formatRange(ranges[index].revised)}</dd>
                  </dl>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[0.7rem] text-zinc-600">Arrow keys move between segments.</p>
        </Pane>

        <Pane label="Reconstructed revision">
          <pre className="bi-payload mt-2.5 min-h-[4.5rem] text-[0.8rem] text-zinc-400">
            {reconstructed !== null ? (
              highlight(reconstructed, range.revised, KIND[fixture.segments[active].type])
            ) : (
              <span className="text-zinc-600">Press Reconstruct to combine the revised values in order.</span>
            )}
          </pre>
          <p className="mt-3 font-mono text-[0.7rem] text-zinc-500" aria-hidden={result === null}>
            reconstructed === revisedContent{" "}
            <span data-tone={result ? "code" : result === false ? "error" : undefined} className={result === null ? "text-zinc-700" : "bi-tone-text"}>
              {result === null ? "…" : String(result)}
            </span>
          </p>
        </Pane>
      </div>
    </FigureFrame>
  );
}
