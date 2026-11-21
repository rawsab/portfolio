"use client";

import { useState } from "react";
import { ControlButton, FigureFrame, MonoLabel } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { AxisLeft, ResponsiveDiagram, linear } from "@/components/palitronica/plot";
import { useTween } from "@/components/palitronica/use-tween";
import { cn } from "@/lib/utils";
import { StrategyId, strategies } from "../fixture";

type Metric = "acc1" | "acc3" | "acc5" | "mrr" | "contamination";

/** Reported values from the controlled synthetic benchmark (500 queries). */
const RESULTS: Record<Metric, Record<StrategyId, number>> = {
  acc1: { A: 0.41, B: 0.32, C: 0.67, D: 0.74, E: 0.81 },
  acc3: { A: 0.57, B: 0.48, C: 0.82, D: 0.88, E: 0.92 },
  acc5: { A: 0.64, B: 0.55, C: 0.89, D: 0.93, E: 0.96 },
  mrr: { A: 0.54, B: 0.46, C: 0.78, D: 0.84, E: 0.89 },
  contamination: { A: 0.28, B: 0.17, C: 0.06, D: 0.03, E: 0.01 },
};

/** Reported median search-stage latency in milliseconds. */
const LATENCY: Record<StrategyId, number> = { A: 12.4, B: 6.3, C: 11.8, D: 8.1, E: 7.4 };

const METRICS: { value: Metric; label: string; name: string; higher: boolean; definition: string }[] = [
  { value: "acc1", label: "Acc@1", name: "Accuracy@1", higher: true, definition: "Share of queries whose first result is relevant." },
  { value: "acc3", label: "Acc@3", name: "Accuracy@3", higher: true, definition: "Share of queries with at least one relevant item in the first three results." },
  { value: "acc5", label: "Acc@5", name: "Accuracy@5", higher: true, definition: "Share of queries with at least one relevant item in the first five results." },
  { value: "mrr", label: "MRR", name: "Mean reciprocal rank", higher: true, definition: "Reciprocal rank of the first relevant result, averaged across queries." },
  {
    value: "contamination",
    label: "Contam.",
    name: "Cross-campaign contamination",
    higher: false,
    definition: "Average fraction of the first five results that belong to another campaign.",
  },
];

const IDS = strategies.map((item) => item.id);

const WIDE = { w: 560, h: 236, x0: 44, x1: 548, y0: 200, y1: 24 };
const NARROW = { w: 340, h: 236, x0: 34, x1: 332, y0: 200, y1: 24 };

const caption =
  "Results from the controlled synthetic study. Retrieval hits measure relevant evidence, not complete answer correctness. The aggregate results do not include confidence intervals.";

function Chart({ frame, values, metric, compare }: { frame: typeof WIDE; values: number[]; metric: Metric; compare: boolean }) {
  const y = linear([0, 1], [frame.y0, frame.y1]);
  const slot = (frame.x1 - frame.x0) / IDS.length;
  const barW = Math.min(52, slot * 0.56);
  const cx = (i: number) => frame.x0 + slot * (i + 0.5);
  const target = RESULTS[metric];
  const delta = Math.abs(target.E - target.A);
  const bracketY = y(Math.max(values[0], values[4])) - 22;

  return (
    <svg viewBox={`0 0 ${frame.w} ${frame.h}`} className="bi-diagram" aria-hidden>
      <AxisLeft scale={y} values={[0, 0.25, 0.5, 0.75, 1]} at={frame.x0} grid={frame.x1 - frame.x0} format={(v) => v.toFixed(2)} />
      {IDS.map((strategy, i) => {
        const dim = compare && strategy !== "A" && strategy !== "E";
        return (
          <g key={strategy} className="sr-bar" data-dim={dim || undefined} data-best={strategy === "E" || undefined}>
            <rect x={cx(i) - barW / 2} y={y(values[i])} width={barW} height={Math.max(0, frame.y0 - y(values[i]))} rx={2} />
            <text x={cx(i)} y={y(values[i]) - 6} textAnchor="middle" className="sr-bar-value">
              {target[strategy].toFixed(2)}
            </text>
            <text x={cx(i)} y={frame.y0 + 16} textAnchor="middle" className="sr-bar-label">
              {strategy}
            </text>
          </g>
        );
      })}
      {compare && (
        <g className="sr-bracket">
          <path d={`M${cx(0)} ${bracketY + 8}V${bracketY}H${cx(4)}V${bracketY + 8}`} />
          <text x={(cx(0) + cx(4)) / 2} y={bracketY - 6} textAnchor="middle">
            {`Δ ${delta.toFixed(2)} absolute`}
          </text>
        </g>
      )}
    </svg>
  );
}

export function BenchmarkResults({ id, number, title }: { id: string; number: number; title: string }) {
  const [metric, setMetric] = useState<Metric>("acc1");
  const [compare, setCompare] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const meta = METRICS.find((item) => item.value === metric)!;
  const values = [
    useTween(RESULTS[metric].A, 650),
    useTween(RESULTS[metric].B, 650),
    useTween(RESULTS[metric].C, 650),
    useTween(RESULTS[metric].D, 650),
    useTween(RESULTS[metric].E, 650),
  ];
  const maxLatency = 14;

  const summary = (m: Metric) => IDS.map((s) => `${s} ${RESULTS[m][s].toFixed(2)}`).join(", ");

  return (
    <FigureFrame
      id={id}
      number={number}
      title={title}
      badge="Reported results"
      caption={caption}
      announcement={announcement}
      controls={
        <>
          <SegmentedControl
            label="Metric"
            value={metric}
            onChange={(value) => {
              setMetric(value);
              const next = METRICS.find((item) => item.value === value)!;
              setAnnouncement(`${next.name}, ${next.higher ? "higher" : "lower"} is better: ${summary(value)}.`);
            }}
            options={METRICS.map(({ value, label }) => ({ value, label }))}
          />
          <ControlButton
            pressed={compare}
            onClick={() => {
              setCompare(!compare);
              setAnnouncement(compare ? "Comparison cleared." : `A versus E: ${Math.abs(RESULTS[metric].E - RESULTS[metric].A).toFixed(2)} absolute difference in ${meta.name}.`);
            }}
          >
            A vs E
          </ControlButton>
        </>
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-800/50 px-4 py-2.5">
        <span className="font-mono text-[0.7rem] text-zinc-400">Controlled synthetic benchmark · 500 queries</span>
        <span className="bi-tone-text font-mono text-[0.7rem]" data-tone={meta.higher ? "code" : "user"}>
          {meta.higher ? "↑ higher is better" : "↓ lower is better"}
        </span>
      </div>

      <div className="px-4 pt-3">
        <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm text-zinc-100">{meta.name}</span>
          <span className="text-[0.75rem] text-zinc-500">{meta.definition}</span>
        </div>
        <ResponsiveDiagram
          bleed="tight"
          wide={<Chart frame={WIDE} values={values} metric={metric} compare={compare} />}
          narrow={<Chart frame={NARROW} values={values} metric={metric} compare={compare} />}
        />
        <ul className="mt-1 mb-3 grid grid-cols-1 gap-x-4 gap-y-0.5 text-[0.7rem] text-zinc-500 @md:grid-cols-2 @2xl:grid-cols-5" aria-label="Strategies">
          {strategies.map((item) => (
            <li key={item.id}>
              <span className="font-mono text-zinc-300">{item.id}</span> {item.name}
            </li>
          ))}
        </ul>
        <p className="sr-only">
          {meta.name}: {summary(metric)}.
        </p>
      </div>

      <div className="border-t border-zinc-800/50 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <MonoLabel>Search-stage latency · reported median</MonoLabel>
          <span className="text-[0.68rem] text-zinc-600">excludes query embedding and answer generation</span>
        </div>
        <ul className="mt-3 space-y-1.5" aria-label="Reported median search-stage latency">
          {IDS.map((strategy) => (
            <li key={strategy} className="grid grid-cols-[1.25rem_minmax(0,1fr)_3.5rem] items-center gap-2">
              <span className="font-mono text-[0.7rem] text-zinc-400">{strategy}</span>
              <span className="relative h-2.5 rounded-sm bg-white/[0.03]">
                <span
                  className={cn("sr-latency absolute inset-y-0 left-0 rounded-sm", strategy === "B" && "sr-latency-fast")}
                  style={{ width: `${(LATENCY[strategy] / maxLatency) * 100}%` }}
                />
              </span>
              <span className="text-right font-mono text-[0.7rem] text-zinc-300 tabular-nums">{LATENCY[strategy].toFixed(1)} ms</span>
            </li>
          ))}
        </ul>
        <div className="mt-1 grid grid-cols-[1.25rem_minmax(0,1fr)_3.5rem] gap-2 font-mono text-[0.62rem] text-zinc-600" aria-hidden>
          <span />
          <span className="flex justify-between">
            {[0, 7, 14].map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </span>
          <span className="text-right">ms</span>
        </div>
        <p className="mt-2 text-[0.72rem] leading-snug text-zinc-500">
          B searches the smallest collection and is fastest, while scoring lowest on retrieval. These timings are separate from the production service&apos;s P95 response latency.
        </p>
      </div>
    </FigureFrame>
  );
}
