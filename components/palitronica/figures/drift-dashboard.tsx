"use client";

import { PointerEvent, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { scrollToSection } from "@/components/brand-identity/article-toc";
import { ControlButton, FigureFrame, MonoLabel } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { cn } from "@/lib/utils";
import { AxisBottom, AxisLeft, clamp, fmt, linear, svgPoint, ResponsiveDiagram } from "../plot";

type Scenario = "gradual" | "sudden";
type Range = "14" | "7";

const DAYS = Array.from({ length: 14 }, (_, i) => i + 1);
const MISSING_DAY = 9;
const REFERENCE_CHANGE_DAY = 11;
const ALERT = 0.5;

const SERIES: Record<
  Scenario,
  {
    reflection: (number | null)[];
    transmission: (number | null)[];
    reflectionPath: string[];
  }
> = {
  gradual: {
    reflection: [0.21, 0.23, 0.22, 0.26, 0.27, 0.29, 0.31, 0.33, null, 0.36, 0.19, 0.21, 0.22, 0.24],
    transmission: [0.15, 0.15, 0.16, 0.17, 0.17, 0.18, 0.19, 0.2, null, 0.22, 0.14, 0.15, 0.15, 0.16],
    reflectionPath: Array(14).fill("A"),
  },
  sudden: {
    reflection: [0.21, 0.22, 0.21, 0.23, 0.22, 0.22, 0.61, 0.64, null, 0.63, 0.41, 0.43, 0.42, 0.44],
    transmission: [0.15, 0.15, 0.16, 0.15, 0.16, 0.16, 0.19, 0.2, null, 0.2, 0.15, 0.16, 0.15, 0.16],
    reflectionPath: ["A", "A", "A", "A", "A", "A", "B", "B", "B", "B", "B", "B", "B", "B"],
  },
};

const CURRENT_COUNTS = [36, 41, 33, 38, 40, 29, 35, 37, 0, 42, 31, 39, 34, 30];
const reference = (day: number) =>
  day >= REFERENCE_CHANGE_DAY
    ? { label: "different reference", captures: 64 }
    : { label: "reference dataset", captures: 120 };

const WIDE = { w: 640, h: 260, x0: 48, x1: 620, y0: 216, y1: 24, compact: false };
const NARROW = { w: 360, h: 268, x0: 36, x1: 346, y0: 188, y1: 28, compact: true };

const caption =
  "A drift history supplies temporal context, with source details available for investigating changes. Missing evaluations are gaps, never zeros, and the panel has no universal pass/fail threshold. All values are synthetic.";

function segments(values: (number | null)[], days: number[], x: (d: number) => number, y: (v: number) => number) {
  const out: string[] = [];
  let current = "";
  days.forEach((day) => {
    const value = values[day - 1];
    const breaks = value === null || day === REFERENCE_CHANGE_DAY;
    if (breaks && current) {
      out.push(current);
      current = "";
    }
    if (value !== null) current += `${current ? "L" : "M"}${x(day).toFixed(1)},${y(value).toFixed(1)}`;
  });
  if (current) out.push(current);
  return out;
}

function DashboardChart({
  frame,
  days,
  scenario,
  alert,
  shownDay,
  onDay,
}: {
  frame: typeof WIDE;
  days: number[];
  scenario: Scenario;
  alert: boolean;
  shownDay: number;
  onDay: (day: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const x = useMemo(() => linear([days[0] - 0.5, days[days.length - 1] + 0.5], [frame.x0, frame.x1]), [days, frame.x0, frame.x1]);
  const y = useMemo(() => linear([0, 0.8], [frame.y0, frame.y1]), [frame.y0, frame.y1]);
  const series = SERIES[scenario];
  const pitch = x(1) - x(0);
  const refX = x(REFERENCE_CHANGE_DAY) - 0.5 * pitch;
  const referenceOnTop = refX + 118 <= frame.x1;

  const onPointer = (event: PointerEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const { x: px } = svgPoint(svg, event);
    onDay(clamp(Math.round(x.invert(px)), days[0], days[days.length - 1]));
  };

  return (
    <svg
      ref={svgRef}
      className="bi-diagram"
      viewBox={`0 0 ${frame.w} ${frame.h}`}
      role="img"
      aria-label={`Daily maximum reflection and transmission drift for days ${days[0]} to ${days[days.length - 1]}, ${scenario} scenario. Day ${MISSING_DAY} was not evaluated. The reference changed on day ${REFERENCE_CHANGE_DAY}.`}
    >
      <AxisLeft
        scale={y}
        values={[0, 0.2, 0.4, 0.6, 0.8]}
        at={frame.x0}
        grid={frame.x1 - frame.x0}
        format={(v) => v.toFixed(1)}
        label="spread-normalized drift"
      />
      <AxisBottom scale={x} values={days} at={frame.y0} format={(v) => `D${v}`} />

      {days.includes(MISSING_DAY) && (
        <g>
          <rect x={x(MISSING_DAY) - 14} y={frame.y1} width={28} height={frame.y0 - frame.y1} className="pal-missing" />
          <text x={x(MISSING_DAY)} y={frame.y1 + 12} textAnchor="middle" className="bi-note">
            not evaluated
          </text>
        </g>
      )}
      {days.includes(REFERENCE_CHANGE_DAY) && (
        <g>
          <line x1={refX} x2={refX} y1={frame.y1} y2={frame.y0} className="pal-annotation" />
          <text
            x={referenceOnTop ? refX + 5 : refX}
            y={referenceOnTop ? frame.y1 + 12 : frame.y0 + 36}
            textAnchor={referenceOnTop ? "start" : "middle"}
            className="bi-note"
            data-tone="user"
          >
            reference changed
          </text>
        </g>
      )}
      {alert && (
        <g>
          <line x1={frame.x0} x2={frame.x1} y1={y(ALERT)} y2={y(ALERT)} className="pal-alert" />
          <text x={frame.x1} y={y(ALERT) - 5} textAnchor="end" className="bi-note">
            {frame.compact ? `alert · ${ALERT}` : `illustrative alert configuration · ${ALERT}`}
          </text>
        </g>
      )}

      {segments(series.transmission, days, x, y).map((d) => (
        <path key={`t${d}`} d={d} className="pal-series" data-series="transmission" />
      ))}
      {segments(series.reflection, days, x, y).map((d) => (
        <path key={`r${d}`} d={d} className="pal-series" data-series="reflection" />
      ))}
      {days.map((d) => {
        const r = series.reflection[d - 1];
        const t = series.transmission[d - 1];
        return (
          <g key={d}>
            {t !== null && <rect x={x(d) - 2.6} y={y(t) - 2.6} width={5.2} height={5.2} className="pal-series-marker" data-series="transmission" />}
            {r !== null && <circle cx={x(d)} cy={y(r)} r={3} className="pal-series-marker" data-series="reflection" />}
          </g>
        );
      })}

      <line x1={x(shownDay)} x2={x(shownDay)} y1={frame.y1} y2={frame.y0} className="pal-inspect" />
      <rect
        x={frame.x0}
        y={frame.y1}
        width={frame.x1 - frame.x0}
        height={frame.y0 - frame.y1}
        fill="transparent"
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        style={{ touchAction: "pan-y" }}
      />
    </svg>
  );
}

export function DriftDashboard({ id, number, title }: { id: string; number: number; title: string }) {
  const [scenario, setScenario] = useState<Scenario>("gradual");
  const [range, setRange] = useState<Range>("14");
  const [alert, setAlert] = useState(false);
  const [day, setDay] = useState(REFERENCE_CHANGE_DAY);
  const [announcement, setAnnouncement] = useState("");

  const days = range === "14" ? DAYS : DAYS.slice(7);
  const series = SERIES[scenario];
  const shownDay = clamp(day, days[0], days[days.length - 1]);
  const refl = series.reflection[shownDay - 1];
  const trans = series.transmission[shownDay - 1];
  const ref = reference(shownDay);
  const missing = refl === null;

  return (
    <FigureFrame
      id={id}
      number={number}
      title={title}
      badge="Synthetic data"
      caption={caption}
      announcement={announcement}
      controls={
        <>
          <SegmentedControl
            label="Scenario"
            value={scenario}
            onChange={(value) => {
              setScenario(value);
              setAnnouncement(value === "gradual" ? "Gradual movement scenario." : "Sudden change on day 7.");
            }}
            options={[
              { value: "gradual", label: "Gradual" },
              { value: "sudden", label: "Sudden" },
            ]}
          />
          <SegmentedControl
            label="Time range"
            value={range}
            onChange={(value) => {
              setRange(value);
              setAnnouncement(value === "14" ? "Showing days 1 to 14." : "Showing days 8 to 14.");
            }}
            options={[
              { value: "14", label: "14 d" },
              { value: "7", label: "7 d" },
            ]}
          />
          <ControlButton pressed={alert} onClick={() => setAlert((value) => !value)}>
            Alert line
          </ControlButton>
        </>
      }
    >
      <div className="pal-dashboard m-3 rounded-md border border-zinc-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 px-3 py-2">
          <span className="text-[0.8rem] text-zinc-300">RF drift · device family A / fixture 1</span>
          <span className="flex items-center gap-1.5">
            <span className="rounded border border-zinc-700/80 px-1.5 py-px font-mono text-[0.62rem] text-zinc-400">Prometheus</span>
            <span className="rounded border border-zinc-700/80 px-1.5 py-px font-mono text-[0.62rem] text-zinc-400">synthetic data</span>
          </span>
        </div>
        <div className="px-2 pt-2">
          <ResponsiveDiagram
            bleed="tight"
            wide={<DashboardChart frame={WIDE} days={days} scenario={scenario} alert={alert} shownDay={shownDay} onDay={setDay} />}
            narrow={<DashboardChart frame={NARROW} days={days} scenario={scenario} alert={alert} shownDay={shownDay} onDay={setDay} />}
          />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-2.5 text-[0.7rem] text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <svg width="20" height="8" aria-hidden>
              <line x1="0" x2="20" y1="4" y2="4" className="pal-series" data-series="reflection" />
              <circle cx="10" cy="4" r="2.5" className="pal-series-marker" data-series="reflection" />
            </svg>
            max reflection drift
          </span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="20" height="8" aria-hidden>
              <line x1="0" x2="20" y1="4" y2="4" className="pal-series" data-series="transmission" />
              <rect x="8" y="2" width="4" height="4" className="pal-series-marker" data-series="transmission" />
            </svg>
            max transmission drift
          </span>
        </div>
      </div>

      <div className="grid gap-4 border-t border-zinc-800/50 p-4 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="flex flex-col gap-1.5">
          <label className="flex flex-col gap-1.5">
            <span className="flex items-baseline justify-between">
              <MonoLabel>Inspect day</MonoLabel>
              <span className="font-mono text-[0.7rem] text-zinc-400">Day {shownDay}</span>
            </span>
            <input
              type="range"
              min={days[0]}
              max={days[days.length - 1]}
              value={shownDay}
              onChange={(event) => setDay(Number(event.target.value))}
              aria-valuetext={`Day ${shownDay}${missing ? ", not evaluated" : `, reflection ${fmt(refl ?? 0, 2)}, transmission ${fmt(trans ?? 0, 2)}`}`}
              className="pal-range"
            />
          </label>
          <ControlButton className="mt-2 self-start" onClick={() => scrollToSection("figure-8")}>
            Open trace comparison (Figure 8)
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </ControlButton>
        </div>

        <dl className={cn("pal-manifest", missing && "opacity-80")}>
          <dt>window</dt>
          <dd>
            Day {shownDay} 00:00 → Day {shownDay + 1} 00:00
          </dd>
          <dt>{missing ? "status" : "max refl."}</dt>
          <dd className={cn(missing && "bi-tone-text")} data-tone={missing ? "user" : undefined}>
            {missing ? "not evaluated" : `${fmt(refl!, 3)} · path ${series.reflectionPath[shownDay - 1]}`}
          </dd>
          <dt aria-hidden={missing || undefined} className={cn(missing && "invisible")}>
            max trans.
          </dt>
          <dd className={cn(missing && "bi-tone-text")} data-tone={missing ? "user" : undefined}>
            {missing ? "no collection in window" : `${fmt(trans!, 3)} · path C`}
          </dd>
          <dt>current</dt>
          <dd>n = {CURRENT_COUNTS[shownDay - 1]}</dd>
          <dt>reference</dt>
          <dd>
            {ref.label} · n = {ref.captures}
          </dd>
        </dl>
      </div>
    </FigureFrame>
  );
}
