"use client";

import { useMemo, useState } from "react";
import { ControlButton, FigureFrame, MonoLabel } from "@/components/brand-identity/figure-frame";
import { countErrors, gapThreshold, isAnomaly } from "../calibration";
import { AxisBottom, Marker, Tau, fmt, linear, ResponsiveDiagram } from "../plot";
import { useTween } from "../use-tween";

const NOMINAL = [0.8, 1.1, 1.5, 2.0];
const ANOMALY = [3.0, 3.6, 4.2];
const LOW = Math.max(...NOMINAL);
const HIGH = Math.min(...ANOMALY);
const WIDE = { w: 640, h: 150, x0: 40, x1: 620, lane: 64, axis: 122 };
const NARROW = { w: 360, h: 186, x0: 28, x1: 344, lane: 72, axis: 140 };

function GapChart({
  x0,
  x1,
  w,
  h,
  lane,
  axis,
  shownTau,
  tau,
}: {
  x0: number;
  x1: number;
  w: number;
  h: number;
  lane: number;
  axis: number;
  shownTau: number;
  tau: number;
}) {
  const x = useMemo(() => linear([0.5, 4.5], [x0, x1]), [x0, x1]);
  return (
    <svg
      className="bi-diagram"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`Nominal distances ${NOMINAL.join(", ")} and anomaly distances ${ANOMALY.join(", ")}. The zero-error interval runs from ${LOW}, included, to ${HIGH}, excluded. Threshold ${fmt(tau)}.`}
    >
      <rect x={x(LOW)} y={lane - 30} width={x(HIGH) - x(LOW)} height={60} className="pal-gap" />
      <text x={(x(LOW) + x(HIGH)) / 2} y={lane - 38} textAnchor="middle" className="bi-note">
        zero-error interval [{fmt(LOW, 1)}, {fmt(HIGH, 1)})
      </text>
      <line x1={x0} x2={x1} y1={lane} y2={lane} className="pal-lane" />
      {NOMINAL.map((q) => (
        <Marker key={q} kind="nominal" x={x(q)} y={lane} />
      ))}
      {ANOMALY.map((q) => (
        <Marker key={q} kind="anomaly" x={x(q)} y={lane} className={!isAnomaly(q, tau) ? "pal-missed" : undefined} />
      ))}
      {[...NOMINAL, ...ANOMALY].map((q) => (
        <text key={`l${q}`} x={x(q)} y={lane - 12} textAnchor="middle" className="bi-note">
          {fmt(q, 1)}
        </text>
      ))}
      <circle cx={x(LOW)} cy={lane + 30} r={4} className="pal-endpoint" data-closed />
      <circle cx={x(HIGH)} cy={lane + 30} r={4} className="pal-endpoint" />
      <line x1={x(shownTau)} x2={x(shownTau)} y1={lane - 26} y2={lane + 26} className="pal-threshold-cal" />
      <text x={x(shownTau)} y={lane + 44} textAnchor="middle" className="bi-note" data-tone="user">
        <Tau svg /> = {fmt(shownTau)}
      </text>
      <AxisBottom scale={x} values={[1, 2, 3, 4]} at={axis} label="q" />
    </svg>
  );
}

const caption =
  "A clean gap provides several valid thresholds, with endpoint behavior determined by the classifier’s comparison rule. The nominal endpoint is closed and the anomaly endpoint is open because NND flags a sample only when q > τ.";

export function CleanGap({ id, number, title }: { id: string; number: number; title: string }) {
  const [g, setG] = useState(0.5);
  const [announcement, setAnnouncement] = useState("");
  const shownG = useTween(g, 350);

  const tau = gapThreshold(NOMINAL, ANOMALY, g);
  const shownTau = gapThreshold(NOMINAL, ANOMALY, shownG);
  const counts = countErrors(NOMINAL, ANOMALY, tau);
  const boundary = ANOMALY.find((q) => q === tau);

  const set = (value: number) => {
    const next = Math.round(value * 100) / 100;
    setG(next);
    const c = countErrors(NOMINAL, ANOMALY, gapThreshold(NOMINAL, ANOMALY, next));
    setAnnouncement(`g = ${fmt(next)}, threshold ${fmt(gapThreshold(NOMINAL, ANOMALY, next))}. FP ${c.fp}, FN ${c.fn}.`);
  };

  return (
    <FigureFrame
      id={id}
      number={number}
      title={title}
      width="column"
      badge="Synthetic"
      caption={caption}
      announcement={announcement}
      controls={
        <>
          {[0, 0.5, 1].map((value) => (
            <ControlButton key={value} pressed={g === value} onClick={() => set(value)} className="font-mono">
              g = {value}
            </ControlButton>
          ))}
        </>
      }
    >
      <div className="p-4">
        <ResponsiveDiagram
          wide={<GapChart {...WIDE} shownTau={shownTau} tau={tau} />}
          narrow={<GapChart {...NARROW} shownTau={shownTau} tau={tau} />}
        />

        <div className="mt-2 grid gap-3 border-t border-zinc-800/50 pt-3 @lg:grid-cols-[minmax(0,1fr)_auto] @lg:items-end">
          <label className="flex flex-col gap-1.5">
            <MonoLabel>Interpolation g</MonoLabel>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={g}
              onChange={(event) => set(Number(event.target.value))}
              aria-valuetext={`g ${fmt(g)}, threshold ${fmt(tau)}`}
              className="pal-range"
            />
          </label>
          <dl className="grid grid-cols-4 gap-x-4 font-mono text-[0.72rem]">
            {(
              [
                ["g", fmt(g)],
                [<Tau key="tau" />, fmt(tau)],
                ["FP", counts.fp],
                ["FN", counts.fn],
              ] as const
            ).map(([label, value], index) => (
              <div key={index}>
                <dt className="text-zinc-600">{label}</dt>
                <dd className="mt-0.5 text-zinc-300">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="mt-3 font-mono text-[0.72rem] text-zinc-500" aria-live="off">
          <Tau /> = max(N) + g · (min(A) − max(N)) = {fmt(LOW, 1)} + {fmt(g)} · {fmt(HIGH - LOW, 1)} = {fmt(tau)}
        </p>
        <p className="mt-1 min-h-[1.25rem] font-mono text-[0.72rem]">
          {boundary !== undefined ? (
            <span className="bi-tone-text" data-tone="error">
              {fmt(boundary, 1)} &gt; {fmt(tau, 1)} → false · the nearest anomaly is accepted
            </span>
          ) : (
            <span className="text-zinc-600">{counts.fn === 0 ? "every observed example is separated" : `${counts.fn} anomaly accepted`}</span>
          )}
        </p>
      </div>
    </FigureFrame>
  );
}
