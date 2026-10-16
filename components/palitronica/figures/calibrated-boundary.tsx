"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FigureFrame, MonoLabel, SequenceControls } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { useSequence } from "@/components/brand-identity/use-sequence";
import { cn } from "@/lib/utils";
import { countErrors, formatRatio } from "../calibration";
import { AxisBottom, Marker, Tau, fmt, linePath, linear, ResponsiveDiagram } from "../plot";
import { useTween } from "../use-tween";
import * as data from "./calibrated-boundary.data";

type Frame = {
  w: number;
  h: number;
  x0: number;
  x1: number;
  amp: number;
  ruleTop: number;
  feature: { curveBase: number; fit: number; validation: number; axis: number };
  dist: { top: number; fit: number; validation: number; axis: number };
  cardY: number;
  cardW: number;
  cardH: number;
  cardLines: string[];
  tauLabelY: number;
  rows: { top: number; height: number };
  compact: boolean;
  insideNote: string;
  noteGap: number;
};

const WIDE: Frame = {
  w: 640,
  h: 528,
  x0: 34,
  x1: 606,
  amp: 190,
  ruleTop: 30,
  feature: { curveBase: 112, fit: 112, validation: 134, axis: 150 },
  dist: { top: 212, fit: 272, validation: 294, axis: 312 },
  cardY: 214,
  cardW: 278,
  cardH: 20,
  cardLines: ["nominal model + statistical threshold"],
  tauLabelY: 256,
  rows: { top: 392, height: 46 },
  compact: false,
  insideNote: "accepted by the statistical threshold",
  noteGap: 12,
};

const NARROW: Frame = {
  w: 360,
  h: 516,
  x0: 22,
  x1: 338,
  amp: 78,
  ruleTop: 42,
  feature: { curveBase: 116, fit: 116, validation: 134, axis: 150 },
  dist: { top: 230, fit: 290, validation: 308, axis: 326 },
  cardY: 232,
  cardW: 200,
  cardH: 28,
  cardLines: ["nominal model", "+ statistical threshold"],
  tauLabelY: 276,
  rows: { top: 402, height: 36 },
  compact: true,
  insideNote: "inside the threshold",
  noteGap: 28,
};

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Walks the candidate partitions, then eases back to the chosen threshold. */
function playbackTau(candidates: { tau: number }[], progress: number, chosen: number) {
  if (candidates.length === 0) return chosen;
  const sweepUntil = 0.84;
  const at = (t: number) => {
    const scaled = Math.min(1, Math.max(0, t)) * (candidates.length - 1);
    const index = Math.floor(scaled);
    const next = Math.min(candidates.length - 1, index + 1);
    const frac = scaled - index;
    return candidates[index].tau + (candidates[next].tau - candidates[index].tau) * frac;
  };
  if (progress < sweepUntil) return at(progress / sweepUntil);
  const end = at(1);
  return end + (chosen - end) * smoothstep((progress - sweepUntil) / (1 - sweepUntil));
}

const pdf = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);

function BoundaryChart({
  frame,
  id,
  variant,
  preset,
  splits,
  finalTau,
  shownTau,
  showValidation,
  showCandidate,
  showRows,
  rowBlend,
  playingSweep,
  local,
}: {
  frame: Frame;
  id: string;
  variant: "wide" | "narrow";
  preset: data.Preset;
  splits: ReturnType<typeof data.splits>;
  finalTau: number;
  shownTau: number;
  showValidation: boolean;
  showCandidate: boolean;
  showRows: boolean;
  rowBlend: number;
  playingSweep: boolean;
  local: number;
}) {
  const fx = useMemo(() => linear([-4, 4], [frame.x0, frame.x1]), [frame.x0, frame.x1]);
  const qx = useMemo(() => linear([0, 16], [frame.x0, frame.x1]), [frame.x0, frame.x1]);
  const curve = linePath(
    Array.from({ length: 121 }, (_, i) => {
      const z = -4 + (8 * i) / 120;
      return [fx(z), frame.feature.curveBase - pdf(z) * frame.amp] as [number, number];
    }),
  );
  const val = data.validation[preset];
  const tauX = qx(shownTau);
  const tauLabelRight = tauX < frame.x0 + 108;
  const { feature, dist, rows } = frame;
  const linkMaskId = `${id}-${variant}-link-fade`;

  return (
    <svg className="bi-diagram" viewBox={`0 0 ${frame.w} ${frame.h}`} role="img" aria-labelledby={`${id}-${variant}-title ${id}-${variant}-desc`}>
      <title id={`${id}-${variant}-title`}>From a nominal model to a calibrated boundary</title>
      <desc id={`${id}-${variant}-desc`}>
        {`Top: a fitted normal curve over one illustrative feature with nominal fit samples. Middle: the same samples on a squared-distance axis with a dashed statistical threshold at ${data.STATISTICAL_TAU}. Labeled validation samples are added; the calibrated threshold for split A is ${fmt(finalTau)}. Bottom: three RF splits each receive their own calibrated threshold.`}
      </desc>

      {frame.compact ? (
        <>
          <text x={frame.x0} y={14} className="bi-boundary-label">
            FEATURE VIEW
          </text>
          <text x={frame.x0} y={28} className="bi-note">
            signed illustrative feature, fitted normal
          </text>
        </>
      ) : (
        <>
          <text x={frame.x0} y={16} className="bi-boundary-label">
            FEATURE VIEW
          </text>
          <text x={frame.x0 + 96} y={16} className="bi-note">
            signed illustrative feature, fitted normal
          </text>
        </>
      )}
      <defs>
        <linearGradient id={linkMaskId} gradientUnits="userSpaceOnUse" x1="0" y1={feature.fit + 4} x2="0" y2={dist.validation - 4}>
          <stop offset="0" stopColor="white" />
          <stop offset="0.28" stopColor="white" />
          <stop offset="0.44" stopColor="#404040" />
          <stop offset="0.56" stopColor="#404040" />
          <stop offset="0.72" stopColor="white" />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <mask id={`${linkMaskId}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={frame.w} height={frame.h}>
          <rect width={frame.w} height={frame.h} fill={`url(#${linkMaskId})`} />
        </mask>
      </defs>
      <path d={curve} className="pal-curve" />
      {[data.STATISTICAL_TAU, ...(showCandidate ? [shownTau] : [])].map((tau, index) =>
        [-1, 1].map((sign) => (
          <line
            key={`${index}-${sign}`}
            x1={fx(sign * Math.sqrt(tau))}
            x2={fx(sign * Math.sqrt(tau))}
            y1={frame.ruleTop}
            y2={feature.axis}
            className={index === 0 ? "pal-threshold-stat" : "pal-threshold-cal"}
            data-faint
          />
        )),
      )}
      <AxisBottom scale={fx} values={[-4, -2, 0, 2, 4]} at={feature.axis} />

      <g aria-hidden mask={`url(#${linkMaskId}-mask)`}>
        {data.fitFeatures.map((z, i) => (
          <line key={`f${i}`} x1={fx(z)} y1={feature.fit + 4} x2={qx(data.toQ(z))} y2={dist.fit - 4} className="pal-link" />
        ))}
        {showValidation &&
          [...val.nominal.map((z) => ["n", z] as const), ...val.anomaly.map((z) => ["a", z] as const)].map(([kind, z], i) => (
            <line
              key={`v${kind}${i}`}
              x1={fx(z)}
              y1={feature.validation + 4}
              x2={qx(data.toQ(z))}
              y2={dist.validation - 4}
              className="pal-link"
              data-kind={kind}
            />
          ))}
      </g>

      {data.fitFeatures.map((z, i) => (
        <Marker key={`fp${i}`} kind="nominal" x={fx(z)} y={feature.fit} filled />
      ))}
      {showValidation && (
        <g className="pal-fade-in">
          {val.nominal.map((z, i) => (
            <Marker key={`vn${i}`} kind="nominal" x={fx(z)} y={feature.validation} />
          ))}
          {val.anomaly.map((z, i) => (
            <Marker key={`va${i}`} kind="anomaly" x={fx(z)} y={feature.validation} />
          ))}
        </g>
      )}

      {frame.compact ? (
        <>
          <text x={frame.x0} y={dist.top - 32} className="bi-boundary-label">
            DISTANCE VIEW
          </text>
          <text x={frame.x0} y={dist.top - 16} className="bi-note">
            q = squared Mahalanobis distance, q ≥ 0
          </text>
        </>
      ) : (
        <>
          <text x={frame.x0} y={dist.top - 8} className="bi-boundary-label">
            DISTANCE VIEW
          </text>
          <text x={frame.x0 + 104} y={dist.top - 8} className="bi-note">
            q = squared Mahalanobis distance, q ≥ 0
          </text>
        </>
      )}
      <AxisBottom scale={qx} values={[0, 2, 4, 6, 8, 10, 12, 14, 16]} at={dist.axis} label="q" />
      {data.fitFeatures.map((z, i) => (
        <Marker key={`dq${i}`} kind="nominal" x={qx(data.toQ(z))} y={dist.fit} filled />
      ))}
      {showValidation && (
        <g className="pal-fade-in">
          {splits[0].nominal.map((q, i) => (
            <Marker key={`dn${i}`} kind="nominal" x={qx(q)} y={dist.validation} />
          ))}
          {splits[0].anomaly.map((q, i) => (
            <Marker
              key={`da${i}`}
              kind="anomaly"
              x={qx(q)}
              y={dist.validation}
              className={!showCandidate && q <= data.STATISTICAL_TAU ? "pal-missed" : undefined}
            />
          ))}
        </g>
      )}

      <line x1={qx(data.STATISTICAL_TAU)} x2={qx(data.STATISTICAL_TAU)} y1={dist.top} y2={dist.axis} className="pal-threshold-stat" />
      <g transform={`translate(${Math.min(qx(data.STATISTICAL_TAU) + 10, frame.x1 - frame.cardW)} ${frame.cardY})`}>
        <rect width={frame.cardW} height={frame.cardH} rx={4} className="pal-label-card" />
        {frame.cardLines.map((line, index) => (
          <text key={line} x={10} y={frame.cardLines.length === 1 ? 14 : 12 + index * 12} className="bi-note">
            {line}
          </text>
        ))}
      </g>
      {showCandidate && (
        <g opacity={playingSweep ? Math.min(1, local / 0.05) : 1}>
          <line x1={tauX} x2={tauX} y1={frame.cardY + frame.cardH + 4} y2={dist.axis} className="pal-threshold-cal" />
          <text
            x={tauX}
            y={frame.tauLabelY}
            dx={tauLabelRight ? 8 : -8}
            textAnchor={tauLabelRight ? "start" : "end"}
            className="bi-note"
            data-tone="user"
          >
            <Tau svg /> = {fmt(shownTau)}
          </text>
        </g>
      )}
      {showValidation && !showCandidate && (
        <text x={qx(data.STATISTICAL_TAU) - frame.noteGap} y={dist.top + 16} textAnchor="end" className="bi-note" data-tone="error">
          {frame.insideNote}
        </text>
      )}

      <g opacity={showRows ? 1 : 0.35}>
        <text x={frame.x0} y={rows.top - 30} className="bi-boundary-label">
          PER-SPLIT THRESHOLDS
        </text>
        {!showRows && (
          <text x={frame.x0 + 168} y={rows.top - 30} className="bi-note">
            expands at step 4
          </text>
        )}
        {splits.map((split, row) => {
          const y = rows.top + row * rows.height;
          const tau = data.STATISTICAL_TAU + (split.calibrated.tau - data.STATISTICAL_TAU) * rowBlend;
          return (
            <g key={split.id}>
              <line x1={frame.x0} x2={frame.x1} y1={y + 14} y2={y + 14} className="pal-lane" />
              <text x={frame.x0} y={y} className="bi-note">
                {split.label}
              </text>
              {showRows && split.nominal.map((q, i) => <Marker key={`rn${i}`} kind="nominal" x={qx(q)} y={y + 14} size={3.8} />)}
              {showRows && split.anomaly.map((q, i) => <Marker key={`ra${i}`} kind="anomaly" x={qx(q)} y={y + 14} size={3.8} />)}
              <line x1={qx(data.STATISTICAL_TAU)} x2={qx(data.STATISTICAL_TAU)} y1={y + 2} y2={y + 26} className="pal-threshold-stat" />
              {showRows && rowBlend > 0 && (
                <>
                  <line x1={qx(tau)} x2={qx(tau)} y1={y + 2} y2={y + 26} className="pal-threshold-cal" />
                  <text x={frame.x1} y={y} textAnchor="end" className="bi-note" data-tone="user">
                    <Tau svg />
                    {split.id} = {fmt(tau)}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function CalibratedBoundary({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({
    length: data.steps.length,
    stepMs: [2200, 2400, 4200, 3000],
    rootRef: ref,
    threshold: 0.4,
  });
  const [preset, setPreset] = useState<data.Preset>("clean");
  const [progress, setProgress] = useState(1);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => sequence.subscribe((_, value) => setProgress(value)), [sequence]);

  const step = Math.max(sequence.step, 0);
  const settled = sequence.status !== "playing" && sequence.status !== "paused";
  const local = settled ? 1 : progress;

  const splits = useMemo(() => data.splits(preset), [preset]);
  const candidates = useMemo(() => data.sweep(preset), [preset]);
  const a = splits[0];
  const finalTau = a.calibrated.tau;

  // Step 3 glides through each candidate partition, then eases onto the selected interval.
  const playingSweep = step === 2 && !settled;
  const playback = playbackTau(candidates, local, finalTau);
  const restingTau = step >= 2 ? finalTau : data.STATISTICAL_TAU;
  const easedTau = useTween(restingTau, 520);
  const shownTau = playingSweep ? playback : easedTau;
  const counts = countErrors(a.nominal, a.anomaly, shownTau);
  const showValidation = step >= 1;
  const showCandidate = step >= 2;
  const showRows = step >= 3;
  const rowBlend = step === 3 ? Math.min(1, local / 0.7) : step > 3 ? 1 : 0;

  const thresholdTone = showCandidate ? "user" : undefined;
  const chartProps = {
    id,
    preset,
    splits,
    finalTau,
    shownTau,
    showValidation,
    showCandidate,
    showRows,
    rowBlend,
    playingSweep,
    local,
  };

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
        <SequenceControls
          sequence={sequence}
          steps={data.steps}
          name="the calibration walkthrough"
          onStep={(index) => setAnnouncement(`Step ${index + 1}: ${data.steps[index].label}. ${data.steps[index].summary}`)}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800/50 px-4 py-3">
        <span className="text-xs text-zinc-600">Validation set</span>
        <SegmentedControl
          label="Validation set"
          value={preset}
          onChange={(value) => {
            setPreset(value);
            setAnnouncement(value === "clean" ? "Clean-separation validation set loaded." : "Overlapping validation set loaded.");
          }}
          options={[
            { value: "clean", label: "Clean separation" },
            { value: "overlap", label: "Overlap" },
          ]}
        />
        <span className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-zinc-500" aria-hidden>
          <span className="inline-flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="-5 -5 10 10">
              <Marker kind="nominal" x={0} y={0} size={3.5} filled />
            </svg>
            fit (nominal)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="-5 -5 10 10">
              <Marker kind="nominal" x={0} y={0} size={3.5} />
            </svg>
            validation nominal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="-5 -5 10 10">
              <Marker kind="anomaly" x={0} y={0} size={3.5} />
            </svg>
            validation anomaly
          </span>
        </span>
      </div>

      <div className="p-4">
        <ResponsiveDiagram
          wide={<BoundaryChart frame={WIDE} variant="wide" {...chartProps} />}
          narrow={<BoundaryChart frame={NARROW} variant="narrow" {...chartProps} />}
        />

        <div className="mt-3 grid gap-3 border-t border-zinc-800/50 pt-3 @xl:grid-cols-[auto_minmax(0,1fr)] @xl:items-start">
          <dl className="pal-card flex w-fit max-w-full flex-wrap gap-x-4 gap-y-2 rounded-md border px-3 py-2.5 font-mono text-[0.72rem]">
            {(
              [
                [<Tau key="tau" />, showCandidate ? fmt(shownTau) : `${data.STATISTICAL_TAU} stat.`],
                ["FP", showValidation ? counts.fp : "—"],
                ["FN", showValidation ? counts.fn : "—"],
                ["total", showValidation ? counts.fp + counts.fn : "—"],
                ["FP/FN", showValidation ? formatRatio(counts) : "—"],
              ] as const
            ).map(([label, value], index) => (
              <div key={index}>
                <dt className="text-zinc-600">{label}</dt>
                <dd className={cn("mt-0.5 text-zinc-300", index === 0 && showCandidate && "bi-tone-text")} data-tone={index === 0 ? thresholdTone : undefined}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="text-sm leading-relaxed text-[#8F8F8F]">
            <p>
              <span className="text-zinc-200">{data.steps[step].label}.</span> {data.steps[step].summary}
            </p>
            {showValidation && (
              <p className="mt-1.5 font-mono text-[0.7rem] text-zinc-500">
                Labeled validation examples now participate in boundary selection
                {showCandidate ? ` · target ${data.objectiveLabel}${a.calibrated.clean ? " · clean gap, g = 0.5" : ""}` : ""}
              </p>
            )}
            <MonoLabel className="mt-1.5 block normal-case">
              Rule: anomaly when q &gt; <Tau />
            </MonoLabel>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}
