"use client";

import { useMemo, useRef, useState } from "react";
import { ControlButton, FigureFrame, MonoLabel } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { useSequence } from "@/components/brand-identity/use-sequence";
import { cn } from "@/lib/utils";
import { Objective, candidates as listCandidates, choose, countErrors, formatRatio, isAnomaly } from "../calibration";
import { AxisBottom, Marker, Tau, clamp, fmt, linear, svgDragHandlers, ResponsiveDiagram } from "../plot";
import { useTween } from "../use-tween";

const NOMINAL = [0.8, 1.4, 2.1, 2.8, 3.2];
const ANOMALY = [1.8, 2.5, 3.0, 3.6];
const TIE = 2.6;
const WIDE = { w: 640, h: 168, x0: 92, x1: 624, nominal: 44, anomaly: 96, labelX: 12 };
const NARROW = { w: 360, h: 196, x0: 64, x1: 348, nominal: 56, anomaly: 108, labelX: 6 };

type ObjectiveId = "min-fp" | "ratio-1" | "ratio-2" | "min-fn";
const OBJECTIVES: {
  value: ObjectiveId;
  label: string;
  objective: Objective;
}[] = [
  { value: "min-fp", label: "Minimize FP", objective: { kind: "min-fp" } },
  {
    value: "ratio-1",
    label: "FP/FN ≈ 1",
    objective: { kind: "ratio", target: 1 },
  },
  {
    value: "ratio-2",
    label: "FP/FN ≈ 2",
    objective: { kind: "ratio", target: 2 },
  },
  { value: "min-fn", label: "Minimize FN", objective: { kind: "min-fn" } },
];

const caption =
  "Overlap makes threshold selection a choice about the observed balance of false positives and false negatives. Counts are recomputed from the displayed values with q > τ.";

const interval = (lo: number | null, hi: number | null) => `${lo === null ? "(−∞" : `[${fmt(lo, 1)}`}, ${hi === null ? "∞" : fmt(hi, 1)})`;

function OverlapChart({
  frame,
  nominal,
  anomaly,
  tie,
  tau,
  targetTau,
  settledOnChoice,
  chosen,
  onDrag,
  onDragStart,
  onDragEnd,
}: {
  frame: typeof WIDE;
  nominal: number[];
  anomaly: number[];
  tie: boolean;
  tau: number;
  targetTau: number;
  settledOnChoice: boolean;
  chosen: { lo: number | null; hi: number | null };
  onDrag: (value: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const x = useMemo(() => linear([0, 4.4], [frame.x0, frame.x1]), [frame.x0, frame.x1]);
  const drag = svgDragHandlers((px) => onDrag(x.invert(px)));
  const lanes = { nominal: frame.nominal, anomaly: frame.anomaly };
  const ruleTop = lanes.nominal - 30;
  const ruleBottom = lanes.anomaly + 30;
  return (
    <svg
      className="bi-diagram"
      viewBox={`0 0 ${frame.w} ${frame.h}`}
      role="img"
      aria-label={`Nominal distances ${nominal.join(", ")} and anomaly distances ${anomaly.join(", ")} on a shared q axis, with the threshold at ${fmt(targetTau)}.`}
      onPointerDown={(event) => {
        onDragStart();
        drag.onPointerDown(event);
      }}
      onPointerMove={drag.onPointerMove}
      onPointerUp={onDragEnd}
      onPointerCancel={onDragEnd}
    >
      <rect x={x(tau)} y={lanes.nominal - 28} width={frame.x1 - x(tau)} height={lanes.anomaly + 28 - (lanes.nominal - 28)} className="pal-flagged" />
      <text x={frame.x1 - 4} y={lanes.anomaly + 22} textAnchor="end" className="bi-note">
        flagged · q &gt; <Tau svg />
      </text>
      {settledOnChoice && (
        <rect
          x={x(chosen.lo ?? 0)}
          y={lanes.anomaly + 28}
          width={x(chosen.hi ?? 4.4) - x(chosen.lo ?? 0)}
          height={4}
          rx={2}
          className="pal-interval"
        />
      )}

      {(["nominal", "anomaly"] as const).map((kind) => (
        <g key={kind}>
          <text x={frame.labelX} y={lanes[kind] + 4} className="bi-node-line">
            {kind === "nominal" ? "Nominal" : "Anomaly"}
          </text>
          <line x1={frame.x0} x2={frame.x1} y1={lanes[kind]} y2={lanes[kind]} className="pal-lane" />
          {(kind === "nominal" ? nominal : anomaly).map((q, i) => {
            const wrong = kind === "nominal" ? isAnomaly(q, targetTau) : !isAnomaly(q, targetTau);
            return (
              <g key={`${q}-${i}`}>
                {wrong && <circle cx={x(q)} cy={lanes[kind]} r={9} className="pal-error-ring" />}
                <Marker kind={kind} x={x(q)} y={lanes[kind]} />
                {!(kind === "anomaly" && tie && q === TIE) && (
                  <text x={x(q)} y={lanes[kind] - 13} textAnchor="middle" className="bi-note">
                    {fmt(q, 1)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      ))}
      {tie && <path d={`M${x(TIE)},${lanes.nominal + 8}V${lanes.anomaly - 8}`} className="pal-tie" />}

      <g style={{ touchAction: "none" }} className="cursor-ew-resize">
        <line x1={x(tau)} x2={x(tau)} y1={ruleTop} y2={ruleBottom} className="pal-threshold-cal" />
        <rect x={x(tau) - 10} y={ruleTop} width={20} height={ruleBottom - ruleTop} fill="transparent" />
        <text x={x(tau)} y={lanes.nominal - 34} textAnchor="middle" className="bi-note" data-tone="user">
          <Tau svg /> = {fmt(tau)}
        </text>
      </g>
      <AxisBottom scale={x} values={[0, 1, 2, 3, 4]} at={lanes.anomaly + 40} label="q" />
    </svg>
  );
}

export function OverlapInspector({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const [tie, setTie] = useState(false);
  const [mode, setMode] = useState<"manual" | "calibrate">("manual");
  const [objectiveId, setObjectiveId] = useState<ObjectiveId>("ratio-1");
  const [manualTau, setManualTau] = useState(2.3);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const nominal = useMemo(() => (tie ? [...NOMINAL, TIE].sort((a, b) => a - b) : NOMINAL), [tie]);
  const anomaly = useMemo(() => (tie ? [...ANOMALY, TIE].sort((a, b) => a - b) : ANOMALY), [tie]);
  const candidates = useMemo(() => listCandidates(nominal, anomaly), [nominal, anomaly]);
  const objective = OBJECTIVES.find((item) => item.value === objectiveId)!;
  const chosen = useMemo(() => choose(candidates, objective.objective), [candidates, objective]);

  const sequence = useSequence({
    length: candidates.length + 1,
    stepMs: 520,
    rootRef: ref,
    autoplay: false,
  });
  const visiting = mode === "calibrate" && sequence.step >= 0 && sequence.step < candidates.length && sequence.status !== "done";
  const settledOnChoice = mode === "calibrate" && !visiting;
  const targetTau = mode === "manual" ? manualTau : visiting ? candidates[sequence.step].tau : chosen.tau;
  const tau = useTween(targetTau, dragging ? 0 : 280);
  const counts = countErrors(nominal, anomaly, targetTau);

  const runCalibration = (nextObjective = objectiveId) => {
    setMode("calibrate");
    if (sequence.reducedMotion) sequence.goTo(candidates.length);
    else sequence.replay();
    const pick = choose(candidates, OBJECTIVES.find((item) => item.value === nextObjective)!.objective);
    setAnnouncement(
      `Calibrating for ${OBJECTIVES.find((item) => item.value === nextObjective)!.label}. Selected interval ${interval(pick.lo, pick.hi)}, threshold ${fmt(pick.tau)}.`,
    );
  };

  const setManual = (value: number, announce = false) => {
    const next = clamp(Math.round(value * 100) / 100, 0, 4.4);
    setMode("manual");
    sequence.reset();
    setManualTau(next);
    if (announce) {
      const c = countErrors(nominal, anomaly, next);
      setAnnouncement(`Threshold ${fmt(next)}. FP ${c.fp}, FN ${c.fn}.`);
    }
  };

  const visitedIndex = visiting ? sequence.step : -1;

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
        <>
          <ControlButton
            pressed={tie}
            onClick={() => {
              setTie((value) => !value);
              setMode("manual");
              sequence.reset();
              setAnnouncement(
                tie ? "Equal-distance pair removed." : `Added a nominal and an anomaly example, both at q = ${TIE}. They are always classified together.`,
              );
            }}
          >
            Equal distances
          </ControlButton>
          <ControlButton onClick={() => setManual(2.3, true)}>Reset τ</ControlButton>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800/50 px-4 py-3">
        <SegmentedControl
          label="Calibration objective"
          value={objectiveId}
          onChange={(value) => {
            setObjectiveId(value);
            runCalibration(value);
          }}
          options={OBJECTIVES.map(({ value, label }) => ({ value, label }))}
          className="max-w-full flex-wrap"
        />
        <ControlButton pressed={mode === "calibrate"} onClick={() => runCalibration()}>
          Calibrate
        </ControlButton>
      </div>

      <div>
        <div className="min-w-0 p-4">
          <ResponsiveDiagram
            wide={
              <OverlapChart
                frame={WIDE}
                nominal={nominal}
                anomaly={anomaly}
                tie={tie}
                tau={tau}
                targetTau={targetTau}
                settledOnChoice={settledOnChoice}
                chosen={chosen}
                onDrag={(value) => setManual(value)}
                onDragStart={() => setDragging(true)}
                onDragEnd={() => setDragging(false)}
              />
            }
            narrow={
              <OverlapChart
                frame={NARROW}
                nominal={nominal}
                anomaly={anomaly}
                tie={tie}
                tau={tau}
                targetTau={targetTau}
                settledOnChoice={settledOnChoice}
                chosen={chosen}
                onDrag={(value) => setManual(value)}
                onDragStart={() => setDragging(true)}
                onDragEnd={() => setDragging(false)}
              />
            }
          />

          <label className="mt-1 flex flex-col gap-1.5">
            <MonoLabel>
              Threshold <Tau />
            </MonoLabel>
            <input
              type="range"
              min={0}
              max={4.4}
              step={0.05}
              value={targetTau}
              onChange={(event) => setManual(Number(event.target.value), true)}
              aria-valuetext={`threshold ${fmt(targetTau)}; FP ${counts.fp}, FN ${counts.fn}`}
              className="pal-range"
            />
          </label>
          {tie && (
            <p className="mt-2 font-mono text-[0.7rem] text-zinc-500">
              Both examples at q = {TIE} land on the same side of every threshold: either both are flagged or neither is.
            </p>
          )}
        </div>

        <div className="grid gap-4 border-t border-zinc-800/50 p-4 @xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <MonoLabel>Confusion matrix</MonoLabel>
            <table className="mt-2 w-full border-collapse font-mono text-[0.72rem]">
              <thead>
                <tr className="text-zinc-600">
                  <th className="pb-1 text-left font-normal" scope="col">
                    <span className="sr-only">Actual class</span>
                  </th>
                  <th className="pb-1 font-normal" scope="col">
                    pred. nominal
                  </th>
                  <th className="pb-1 font-normal" scope="col">
                    pred. anomaly
                  </th>
                </tr>
              </thead>
              <tbody className="text-center text-zinc-300">
                <tr>
                  <th scope="row" className="py-1 text-left font-normal text-zinc-600">
                    nominal
                  </th>
                  <td className="rounded-sm border border-zinc-800 py-1">TN {counts.tn}</td>
                  <td className={cn("rounded-sm border py-1", counts.fp ? "pal-cell-error" : "border-zinc-800")}>FP {counts.fp}</td>
                </tr>
                <tr>
                  <th scope="row" className="py-1 text-left font-normal text-zinc-600">
                    anomaly
                  </th>
                  <td className={cn("rounded-sm border py-1", counts.fn ? "pal-cell-error" : "border-zinc-800")}>FN {counts.fn}</td>
                  <td className="rounded-sm border border-zinc-800 py-1">TP {counts.tp}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 font-mono text-[0.72rem] text-zinc-400">
              FP/FN <span className="text-zinc-200">{formatRatio(counts)}</span>
            </p>
          </div>

          <div>
            <MonoLabel>Candidate partitions</MonoLabel>
            <ol className="mt-2 gap-x-3 font-mono text-[0.68rem] @md:columns-2 [&>li]:mb-0.5 [&>li]:break-inside-avoid">
              {candidates.map((candidate, index) => {
                const isChosen = settledOnChoice && candidate === chosen;
                return (
                  <li
                    key={`${candidate.lo}-${candidate.hi}`}
                    className={cn(
                      "flex justify-between gap-2 rounded px-1.5 py-0.5 transition-colors duration-150",
                      isChosen ? "pal-row-chosen" : index === visitedIndex ? "bg-white/10 text-zinc-200" : "text-zinc-500",
                    )}
                  >
                    <span>{interval(candidate.lo, candidate.hi)}</span>
                    <span>
                      {candidate.counts.fp}/{candidate.counts.fn} · {formatRatio(candidate.counts)}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-1.5 text-[0.68rem] text-zinc-600">Interval · FP/FN counts · ratio</p>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}
