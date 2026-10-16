"use client";

import { useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { FigureFrame, MonoLabel } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { useSequence } from "@/components/brand-identity/use-sequence";
import { cn } from "@/lib/utils";
import { Tau, fmt, linePath } from "../plot";
import { useTween } from "../use-tween";

type Mode = "before" | "after";

const SHARED_TAU = 6;
const SPLITS = [
  { id: "A", path: "reflection · P1", q: 3.1, tau: 4.2, wave: [0.9, 3] },
  { id: "B", path: "reflection · P2", q: 6.8, tau: 7.5, wave: [1.4, 5] },
  { id: "C", path: "transmission · P1→P2", q: 5.6, tau: 5.1, wave: [0.6, 7] },
] as const;

const caption =
  "Per-split NND calibration changes the decision boundaries while retaining the fitted nominal distance models. Features, fitted parameters, and distances are identical in both views; outputs stop at the path level.";

function Slice({ wave: [phase, freq] }: { wave: readonly [number, number] }) {
  const d = linePath(Array.from({ length: 40 }, (_, i) => [i * 2, 10 + 6 * Math.sin(i / freq + phase) * Math.cos(i / 9)] as [number, number]));
  return (
    <svg viewBox="0 0 78 20" className="h-5 w-16 shrink-0" aria-hidden>
      <path d={d} className="pal-trace" data-tone="model" />
    </svg>
  );
}

function SplitRow({ split, tau, mode, highlighted }: { split: (typeof SPLITS)[number]; tau: number; mode: Mode; highlighted: boolean }) {
  const flagged = split.q > tau;
  return (
    <tr className={cn("pal-split-row transition-colors duration-200", highlighted && "bg-white/[0.05]")}>
      <th scope="row" className="py-2 pr-3 text-left font-normal">
        <span className="block text-sm text-zinc-200">Split {split.id}</span>
        <span className="block font-mono text-[0.66rem] whitespace-nowrap text-zinc-600">{split.path}</span>
      </th>
      <td className="hidden py-2 pr-3 @xl:table-cell">
        <Slice wave={split.wave} />
      </td>
      <td className="py-2 pr-3 font-mono text-zinc-300">{fmt(split.q, 1)}</td>
      <td className="py-2 pr-3 font-mono whitespace-nowrap">
        <span className="text-zinc-500">{fmt(split.q, 1)} &gt; </span>
        <span className="bi-tone-text" data-tone={mode === "after" ? "user" : undefined}>
          {fmt(tau, 1)}
        </span>
      </td>
      <td className="py-2 font-mono">
        <span className="bi-tone-text inline-flex items-center gap-1.5" data-tone={flagged ? "error" : "model"}>
          <span aria-hidden>{flagged ? "×" : "○"}</span>
          {flagged ? "beyond" : "inside"}
        </span>
      </td>
    </tr>
  );
}

export function PerSplitThresholds({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({
    length: 2,
    stepMs: [1800, 600],
    rootRef: ref,
    threshold: 0.6,
  });
  const [chosenMode, setChosenMode] = useState<Mode | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const mode: Mode = chosenMode ?? (sequence.step >= 1 ? "after" : "before");
  const taus = [
    useTween(mode === "after" ? SPLITS[0].tau : SHARED_TAU, 700),
    useTween(mode === "after" ? SPLITS[1].tau : SHARED_TAU, 700),
    useTween(mode === "after" ? SPLITS[2].tau : SHARED_TAU, 700),
  ];

  return (
    <FigureFrame
      ref={ref}
      id={id}
      number={number}
      title={title}
      badge="Synthetic"
      caption={caption}
      announcement={announcement}
      controls={
        <SegmentedControl
          label="Threshold assignment"
          value={mode}
          onChange={(value) => {
            setChosenMode(value);
            setAnnouncement(
              value === "after"
                ? `Per-split thresholds: ${SPLITS.map((s) => `split ${s.id} ${s.tau}`).join(", ")}. Split C is now beyond its boundary; split B is inside.`
                : `One shared threshold of ${SHARED_TAU} for every split. Split B is beyond the boundary.`,
            );
          }}
          options={[
            { value: "before", label: "Shared τ" },
            { value: "after", label: "Per-split τ" },
          ]}
        />
      }
    >
      <div className="grid gap-4 p-4 @2xl:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="space-y-2">
          <div className="pal-card rounded-md border p-3" data-state={mode === "after" ? "active" : "muted"} data-tone="user">
            <MonoLabel>Calibration</MonoLabel>
            <p className="mt-1.5 text-[0.75rem] leading-snug text-zinc-400">Labeled validation distances per split</p>
            <ArrowDown className="my-1 h-3.5 w-3.5 text-zinc-600" aria-hidden />
            <p className="text-[0.75rem] text-zinc-400">Choose τ for each split</p>
          </div>

          {mode === "before" ? (
            <div className="pal-card rounded-md border p-3" data-state="active">
              <MonoLabel>Threshold config</MonoLabel>
              <p className="mt-1.5 font-mono text-sm text-zinc-200">
                <Tau /> = {SHARED_TAU.toFixed(1)}
              </p>
              <p className="mt-1 text-[0.7rem] leading-snug text-zinc-500">One shared threshold for every path, from the nominal model.</p>
            </div>
          ) : (
            <div className="pal-card rounded-md border p-3" data-state="active" data-tone="user">
              <MonoLabel>Path thresholds</MonoLabel>
              <div className="mt-2 flex flex-col gap-1 font-mono text-[0.75rem]">
                {SPLITS.map((split) => (
                  <button
                    key={split.id}
                    type="button"
                    onMouseEnter={() => setHovered(split.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(split.id)}
                    onBlur={() => setHovered(null)}
                    aria-label={`Threshold for split ${split.id}, ${split.path}: ${split.tau}`}
                    className={cn(
                      "bi-control flex cursor-default items-baseline justify-between gap-2 rounded border px-1.5 py-0.5 text-left transition-colors duration-200",
                      hovered === split.id ? "border-zinc-500 text-white" : "border-zinc-800 text-zinc-300",
                    )}
                  >
                    <span>
                      Path {split.id}
                    </span>
                    <span>
                      <Tau /> {split.tau.toFixed(1)}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[0.7rem] leading-snug text-zinc-500">
                Each path uses a threshold informed by its own validation behavior.
              </p>
            </div>
          )}
        </div>

        <div className="min-w-0 overflow-x-auto">
          <table className="w-full border-collapse text-[0.75rem]">
            <thead>
              <tr className="border-b border-zinc-800/60 text-left font-mono text-[0.66rem] whitespace-nowrap text-zinc-600 uppercase">
                <th scope="col" className="pr-3 pb-2 font-medium">
                  Split
                </th>
                <th scope="col" className="hidden pr-3 pb-2 font-medium @xl:table-cell">
                  Features
                </th>
                <th scope="col" className="pr-3 pb-2 font-medium normal-case">
                  q
                </th>
                <th scope="col" className="pr-3 pb-2 font-medium normal-case">
                  q &gt; <Tau />
                </th>
                <th scope="col" className="pb-2 font-medium">
                  Path output
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {SPLITS.map((split, index) => (
                <SplitRow key={split.id} split={split} tau={taus[index]} mode={mode} highlighted={hovered === split.id} />
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[0.7rem] text-zinc-600">
            A sample is beyond the nominal boundary only when q &gt; τ. Equality stays inside.
          </p>
        </div>
      </div>
    </FigureFrame>
  );
}
