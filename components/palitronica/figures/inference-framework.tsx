"use client";

import { ReactNode, useRef, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FigureFrame, MonoLabel, SequenceControls } from "@/components/brand-identity/figure-frame";
import { useSequence } from "@/components/brand-identity/use-sequence";
import { linePath, seeded } from "../plot";
import * as data from "./inference-framework.data";

type CardState = "idle" | "active" | "visited" | "muted";

function Card({ state, label, children, className }: { state: CardState; label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("pal-card min-w-0 rounded-md border p-3", className)} data-state={state}>
      <MonoLabel>{label}</MonoLabel>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex items-center justify-center text-zinc-600" aria-hidden>
      <ArrowDown className="h-4 w-4 @xl:hidden" />
      <ArrowRight className="hidden h-4 w-4 @xl:block" />
    </div>
  );
}

const sparkline = (() => {
  const rng = seeded(5);
  const points: [number, number][] = Array.from({ length: 60 }, (_, i) => {
    const t = i / 59;
    return [t * 160, 24 + 10 * Math.sin(t * 9) * Math.exp(-t) + 5 * Math.sin(t * 23) + rng.normal() * 1.2];
  });
  return linePath(points);
})();

/**
 * Unitless CSS numbers are re-serialized by some browsers (about six significant digits).
 * A short decimal round-trips through that step, so server HTML matches hydration.
 */
function cssOpacity(value: number) {
  return value.toFixed(4).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

/** A smooth synthetic covariance: correlation decays with distance between frequency bins. */
function CovarianceMap({ seed }: { seed: number }) {
  const n = 8;
  return (
    <svg viewBox={`0 0 ${n * 6} ${n * 6}`} className="h-12 w-12 shrink-0" aria-hidden>
      {Array.from({ length: n * n }, (_, k) => {
        const i = Math.floor(k / n);
        const j = k % n;
        const value = Math.exp(-Math.abs(i - j) * seed) * (0.55 + 0.45 * Math.cos((i + j) * 0.4));
        return (
          <rect key={k} x={j * 6} y={i * 6} width={5.4} height={5.4} rx={0.8} className="pal-cov-cell" style={{ opacity: cssOpacity(0.12 + 0.8 * Math.abs(value)) }} />
        );
      })}
    </svg>
  );
}

export function InferenceFramework({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({
    length: data.steps.length,
    stepMs: 1900,
    rootRef: ref,
    threshold: 0.5,
  });
  const [model, setModel] = useState<data.ModelId>("nnd");
  const [announcement, setAnnouncement] = useState("");
  const step = sequence.step;

  const stateAt = (at: number): CardState => (step < at ? "idle" : step === at ? "active" : "visited");
  const expanded = step >= 2;
  const current = data.steps[Math.max(step, 0)];

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
          sequence={sequence}
          steps={data.steps}
          name="the inference walkthrough"
          onStep={(index) => setAnnouncement(`Step ${index + 1}: ${data.steps[index].label}. ${data.steps[index].summary}`)}
        />
      }
    >
      <div className="space-y-3 p-4">
        <div className="grid gap-2 @xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.25fr)_auto_minmax(0,1fr)]">
          <Card state={stateAt(0)} label="RF capture">
            <svg viewBox="0 0 160 48" className="h-12 w-full" aria-hidden preserveAspectRatio="none">
              <path d={sparkline} className="pal-trace" data-tone="model" vectorEffect="non-scaling-stroke" />
            </svg>
            <p className="font-mono text-[0.68rem] text-zinc-500">capture 0042 · synthetic</p>
          </Card>
          <Connector />
          <Card state={stateAt(0)} label="Feature array">
            <div className="flex flex-wrap items-center gap-1 font-mono text-[0.7rem] text-zinc-400">
              {data.featureAxes.map((axis, index) => (
                <span key={axis.name} className="inline-flex items-center gap-1">
                  {index > 0 && <span className="text-zinc-700">×</span>}
                  <span className="rounded border border-zinc-800 bg-black/30 px-1.5 py-0.5">
                    {axis.name} <span className="text-zinc-600">{axis.size}</span>
                  </span>
                </span>
              ))}
            </div>
          </Card>
          <Connector />
          <Card state={stateAt(1)} label="Inference config">
            <pre className="bi-payload text-[0.72rem]">
              {"detector: "}
              <span className="text-zinc-200">{model}</span>
              {"\nsplit_by: rf_path"}
            </pre>
          </Card>
        </div>

        <div className="pal-card rounded-md border p-3" data-state={stateAt(1)}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <MonoLabel>Supported detectors</MonoLabel>
            <span className="text-[0.7rem] text-zinc-600">Select one</span>
          </div>
          <div role="radiogroup" aria-label="Detector" className="grid grid-cols-1 gap-2 @xl:grid-cols-2">
            {data.models.map((item) => {
              const selected = item.id === model;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setModel(item.id);
                    if (step < 1) sequence.goTo(1);
                    setAnnouncement(`${item.name} selected in the inference configuration.`);
                  }}
                  className={cn(
                    "bi-control cursor-pointer rounded-md border px-3 py-2 text-left transition-colors duration-200",
                    selected ? "border-zinc-500 bg-white/[0.06]" : "border-zinc-800 bg-black/20 hover:border-zinc-700",
                  )}
                >
                  <span className={cn("block text-sm", selected ? "text-white" : "text-zinc-400")}>{item.name}</span>
                  <span className="block text-[0.7rem] leading-snug text-zinc-600">{item.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pal-expand" data-open={expanded}>
          <div className="pal-expand-clip">
            {model === "nnd" ? (
              <div className="grid gap-2 pt-1 @xl:grid-cols-3">
                {data.splits.map((split) => (
                  <div key={split.id} className="pal-card rounded-md border p-3" data-state={step === 2 ? "active" : "visited"} data-tone="model">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-zinc-200">{split.label}</span>
                      <span className="font-mono text-[0.68rem] text-zinc-500">{split.path}</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-3">
                      <CovarianceMap seed={split.seed} />
                      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 font-mono text-[0.7rem] text-zinc-400">
                        <dt className="text-zinc-600">μ</dt>
                        <dd>fitted nominal mean</dd>
                        <dt className="text-zinc-600">Σ</dt>
                        <dd>fitted covariance</dd>
                        <dt className="text-zinc-600">q</dt>
                        <dd className="text-zinc-200">{split.q.toFixed(1)}</dd>
                      </dl>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pal-card rounded-md border p-3" data-state="visited">
                <MonoLabel>{data.models.find((item) => item.id === model)?.name}</MonoLabel>
                <p className="mt-1.5 text-sm text-zinc-500">Model-specific scoring stage. Its internals are outside the scope of this article.</p>
              </div>
            )}
          </div>
        </div>

        <p className="min-h-[2.75rem] text-sm leading-relaxed text-[#8F8F8F]" aria-hidden>
          <span className="text-zinc-200">{current.label}.</span> {current.summary}
        </p>
      </div>
    </FigureFrame>
  );
}
