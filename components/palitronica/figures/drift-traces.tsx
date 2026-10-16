"use client";

import { PointerEvent, useMemo, useRef, useState } from "react";
import { ControlButton, FigureFrame, MonoLabel } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { AxisBottom, AxisLeft, bandPath, clamp, fmt, linePath, linear, svgPoint, ResponsiveDiagram } from "../plot";
import * as data from "./drift-traces.data";

const WIDE = { w: 640, h: 248, x0: 52, x1: 620, traceTop: 28, traceBottom: 196 };
const NARROW = { w: 360, h: 236, x0: 42, x1: 346, traceTop: 36, traceBottom: 180 };

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  valueText,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  valueText: string;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-2">
        <MonoLabel>{label}</MonoLabel>
        <span className="font-mono text-[0.7rem] text-zinc-400">{valueText}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={valueText}
        className="pal-range"
      />
    </label>
  );
}

function TracesChart({
  frame,
  rows,
  path,
  bin,
  drift,
  onBin,
}: {
  frame: typeof WIDE;
  rows: ReturnType<typeof data.compute>["rows"];
  path: (typeof data.paths)[data.PathId];
  bin: number;
  drift: number;
  onBin: (index: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const x = useMemo(() => linear([data.F_MIN, data.F_MAX], [frame.x0, frame.x1]), [frame.x0, frame.x1]);
  const y = useMemo(() => linear(path.domain, [frame.traceBottom, frame.traceTop]), [path, frame.traceBottom, frame.traceTop]);
  const row = rows[bin];
  const band = (mean: "muX" | "muY", sd: "sigmaX" | "sigmaY") =>
    bandPath(
      rows.map((sample) => [x(sample.f), y(sample[mean] + sample[sd])] as [number, number]),
      rows.map((sample) => [x(sample.f), y(sample[mean] - sample[sd])] as [number, number]),
    );

  const onPointer = (event: PointerEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const { x: px } = svgPoint(svg, event);
    const f = x.invert(clamp(px, frame.x0, frame.x1));
    onBin(Math.round(((f - data.F_MIN) / (data.F_MAX - data.F_MIN)) * (data.F - 1)));
  };

  return (
    <svg
      ref={svgRef}
      className="bi-diagram"
      viewBox={`0 0 ${frame.w} ${frame.h}`}
      role="img"
      aria-label={`${path.label}. Baseline and current mean traces with variation bands. Path drift ${drift.toFixed(2)}.`}
    >
      <AxisLeft scale={y} values={ticksFor(path.domain)} at={frame.x0} grid={frame.x1 - frame.x0} label="mean |response| (dB)" />
      <path d={band("muX", "sigmaX")} className="pal-band" data-tone="model" />
      <path d={band("muY", "sigmaY")} className="pal-band" data-tone="code" />
      <path d={linePath(rows.map((sample) => [x(sample.f), y(sample.muX)]))} className="pal-trace" data-tone="model" />
      <path d={linePath(rows.map((sample) => [x(sample.f), y(sample.muY)]))} className="pal-trace pal-trace-dashed" data-tone="code" />

      <text x={frame.x0 + 8} y={frame.traceTop + 4} className="bi-note" data-tone="model">
        — baseline X
      </text>
      <text x={frame.x0 + 96} y={frame.traceTop + 4} className="bi-note" data-tone="code">
        - - current Y
      </text>
      <AxisBottom scale={x} values={[1, 2, 3, 4, 5, 6]} at={frame.traceBottom} label="frequency (GHz)" />

      <line x1={x(row.f)} x2={x(row.f)} y1={frame.traceTop - 6} y2={frame.traceBottom} className="pal-inspect" />
      <rect
        x={frame.x0}
        y={frame.traceTop - 6}
        width={frame.x1 - frame.x0}
        height={frame.traceBottom - frame.traceTop + 6}
        fill="transparent"
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        style={{ touchAction: "pan-y" }}
      />
    </svg>
  );
}

export function DriftTraces({ id, number, title }: { id: string; number: number; title: string }) {
  const [state, setState] = useState<data.DriftState>({
    path: "A",
    region: "mid",
    ...data.presets[0].state,
  });
  const [bin, setBin] = useState(24);
  const [announcement, setAnnouncement] = useState("");

  const { rows, drift } = useMemo(() => data.compute(state), [state]);
  const path = data.paths[state.path];

  const update = (patch: Partial<data.DriftState>, message?: string) => {
    const next = { ...state, ...patch };
    setState(next);
    if (message) setAnnouncement(`${message} Drift ${data.compute(next).drift.toFixed(2)}.`);
  };

  const row = rows[bin];

  return (
    <FigureFrame
      id={id}
      number={number}
      title={title}
      badge="Synthetic"
      caption={data.caption}
      announcement={announcement}
      controls={
        <SegmentedControl
          label="RF path"
          value={state.path}
          onChange={(value) => update({ path: value }, `${data.paths[value].label} selected.`)}
          options={[
            { value: "A", label: "Path A" },
            { value: "C", label: "Path C" },
          ]}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-800/50 px-4 py-3">
        <span className="mr-1.5 text-xs text-zinc-600">Presets</span>
        {data.presets.map((preset) => {
          const active = preset.state.shift === state.shift && preset.state.spread === state.spread && preset.state.ratio === state.ratio;
          return (
            <ControlButton key={preset.id} pressed={active} onClick={() => update(preset.state, `${preset.label}.`)}>
              {preset.label}
            </ControlButton>
          );
        })}
      </div>

      <div className="p-4">
        <ResponsiveDiagram
          wide={<TracesChart frame={WIDE} rows={rows} path={path} bin={bin} drift={drift} onBin={setBin} />}
          narrow={<TracesChart frame={NARROW} rows={rows} path={path} bin={bin} drift={drift} onBin={setBin} />}
        />

        <div className="mt-3 grid gap-4 border-t border-zinc-800/50 pt-3 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_13rem]">
          <div className="space-y-3">
            <Slider
              label="Centroid displacement"
              value={state.shift}
              min={-6}
              max={6}
              step={0.25}
              onChange={(value) => update({ shift: value })}
              valueText={`${state.shift > 0 ? "+" : ""}${fmt(state.shift)} dB`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.7rem] whitespace-nowrap text-zinc-600">Region, GHz</span>
              <SegmentedControl
                label="Displacement region"
                value={state.region}
                onChange={(value) => update({ region: value }, `Displacement centered at ${data.regions[value].label}.`)}
                options={(Object.keys(data.regions) as data.Region[]).map((key) => ({
                  value: key,
                  label: data.regions[key].label.replace(" GHz", ""),
                }))}
              />
            </div>
          </div>
          <div className="space-y-3">
            <Slider
              label="Spread, both groups"
              value={state.spread}
              min={0.5}
              max={2.5}
              step={0.05}
              onChange={(value) => update({ spread: value })}
              valueText={`× ${fmt(state.spread)}`}
            />
            <Slider label="Inspect frequency" value={bin} min={0} max={data.F - 1} step={1} onChange={setBin} valueText={`${fmt(row.f)} GHz`} />
          </div>
          <div>
            <MonoLabel>Path drift</MonoLabel>
            <p className="mt-1 font-mono text-2xl leading-tight text-white">{drift.toFixed(2)}</p>
            <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 font-mono text-[0.68rem] text-zinc-400">
              <dt className="text-zinc-600">f</dt>
              <dd>{fmt(row.f)} GHz</dd>
              <dt className="text-zinc-600">baseline</dt>
              <dd>{fmt(row.muX, 1)} dB</dd>
              <dt className="text-zinc-600">current</dt>
              <dd>{fmt(row.muY, 1)} dB</dd>
            </dl>
            {state.shift === 0 && state.ratio !== 1 && (
              <p className="mt-2 text-[0.7rem] leading-snug text-zinc-500">The spreads differ, but the average traces match, so this drift stays at zero.</p>
            )}
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}

function ticksFor([min, max]: [number, number]) {
  const out: number[] = [];
  for (let v = Math.ceil(min / 8) * 8; v <= max; v += 8) out.push(v);
  return out;
}
