"use client";

import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSvgId } from "@/components/brand-identity/diagram";
import { ControlButton, FigureFrame, MonoLabel, SequenceControls } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { useSequence } from "@/components/brand-identity/use-sequence";
import { AxisBottom, AxisLeft, clamp, fmt, linePath, linear, svgPoint, PlotScroll } from "../plot";
import * as data from "./rf-fingerprint.data";

const WIDE = { w: 640, h: 410, plot: { left: 56, right: 620, top: 218, bottom: 372 } };
/** Phone layout: source, board, and receiver stack, and the plot uses the full width. */
const NARROW = { w: 360, h: 512, plot: { left: 46, right: 346, top: 368, bottom: 468 } };

function Board({ path, running }: { path: data.Path; running: boolean }) {
  const reflection = path === "reflection";
  return (
    <g aria-hidden>
      <g className="bi-node">
        <rect x={6} y={58} width={108} height={64} rx={6} />
        <text x={60} y={84} textAnchor="middle" className="bi-node-title">
          RF source
        </text>
        <text x={60} y={102} textAnchor="middle" className="bi-node-line">
          + receiver
        </text>
      </g>
      <g className="bi-node">
        <rect x={526} y={58} width={108} height={64} rx={6} />
        <text x={580} y={84} textAnchor="middle" className="bi-node-title">
          Receiver
        </text>
        <text x={580} y={102} textAnchor="middle" className="bi-node-line">
          port 2
        </text>
      </g>

      <rect x={196} y={22} width={248} height={136} rx={8} className="pal-board" />
      <text x={208} y={40} className="bi-boundary-label">
        DEVICE UNDER TEST · SCHEMATIC
      </text>
      {[
        [232, 62, 46, 30],
        [300, 104, 58, 36],
        [378, 56, 40, 28],
        [236, 116, 30, 22],
      ].map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={3} className="pal-chip" />
      ))}
      <path className="pal-board-trace" d="M202,90H232M278,77H300V104M358,122H392V84M418,70H428V90H438M266,127H300" />
      <rect x={190} y={72} width={12} height={36} rx={2} className="pal-connector" />
      <rect x={438} y={72} width={12} height={36} rx={2} className="pal-connector" />
      <text x={196} y={176} textAnchor="middle" className="bi-note">
        P1
      </text>
      <text x={444} y={176} textAnchor="middle" className="bi-note">
        P2
      </text>

      <g className="pal-path" data-active={!reflection || undefined} data-tone="code">
        <path
          d="M114,90H190M202,90H232M278,77H300V104M358,122H392V84M418,70H428V90H438M450,90H526"
          className="pal-flow"
          data-running={(running && !reflection) || undefined}
        />
        <text x={488} y={108} textAnchor="middle" className="bi-edge-label pal-path-label">
          transmitted
        </text>
      </g>
      <g className="pal-path" data-active={reflection || undefined} data-tone="model">
        <path d="M114,78H190M202,78H232" className="pal-flow" data-running={(running && reflection) || undefined} />
        <path d="M232,86H214V102H202M190,102H114" className="pal-flow" data-running={(running && reflection) || undefined} />
        <text x={152} y={66} textAnchor="middle" className="bi-edge-label pal-path-label">
          incident
        </text>
        <text x={152} y={120} textAnchor="middle" className="bi-edge-label pal-path-label">
          reflected
        </text>
      </g>
    </g>
  );
}

/** Source, device, and port-2 receiver stacked so the figure fits a phone without sideways scrolling. */
function NarrowBoard({ path, running }: { path: data.Path; running: boolean }) {
  const reflection = path === "reflection";
  return (
    <g aria-hidden>
      <g className="bi-node">
        <rect x={128} y={6} width={136} height={44} rx={6} />
        <text x={196} y={18.5} textAnchor="middle" dominantBaseline="central" className="bi-node-title">
          RF source
        </text>
        <text x={196} y={37.5} textAnchor="middle" dominantBaseline="central" className="bi-node-line">
          + receiver
        </text>
      </g>
      <g className="bi-node">
        <rect x={128} y={286} width={136} height={44} rx={6} />
        <text x={196} y={298.5} textAnchor="middle" dominantBaseline="central" className="bi-node-title">
          Receiver
        </text>
        <text x={196} y={317.5} textAnchor="middle" dominantBaseline="central" className="bi-node-line">
          port 2
        </text>
      </g>

      <rect x={16} y={96} width={328} height={148} rx={8} className="pal-board" />
      <text x={28} y={116} className="bi-boundary-label">
        DEVICE UNDER TEST
      </text>
      <text x={28} y={130} className="bi-boundary-label">
        SCHEMATIC
      </text>
      {[
        [172, 142, 48, 26],
        [40, 178, 58, 30],
        [250, 174, 68, 32],
        [174, 214, 44, 18],
      ].map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={3} className="pal-chip" />
      ))}
      <path
        className="pal-board-trace"
        d="M196,110V142M172,155H69V178M220,155H284V174M69,208V222H174M318,206V222H218M196,232V244"
      />
      <rect x={166} y={90} width={60} height={14} rx={2} className="pal-connector" />
      <rect x={172} y={238} width={48} height={14} rx={2} className="pal-connector" />
      <text x={158} y={102} textAnchor="end" className="bi-note">
        P1
      </text>
      <text x={228} y={250} textAnchor="start" className="bi-note">
        P2
      </text>

      <g className="pal-path" data-active={!reflection || undefined} data-tone="code">
        <path
          d="M196,50V142M220,155H250V190M284,206V230H196V286"
          className="pal-flow"
          data-running={(running && !reflection) || undefined}
        />
        <text x={204} y={274} textAnchor="start" className="bi-edge-label pal-path-label">
          transmitted
        </text>
      </g>
      <g className="pal-path" data-active={reflection || undefined} data-tone="model">
        <path d="M182,50V142" className="pal-flow" data-running={(running && reflection) || undefined} />
        <path d="M210,142V50" className="pal-flow" data-running={(running && reflection) || undefined} />
        <text x={174} y={76} textAnchor="end" className="bi-edge-label pal-path-label">
          incident
        </text>
        <text x={218} y={76} textAnchor="start" className="bi-edge-label pal-path-label">
          reflected
        </text>
      </g>
    </g>
  );
}

function FingerprintDiagram({
  id,
  variant,
  width,
  height,
  plot,
  path,
  running,
  nominalSweep,
  modifiedSweep,
  cursorSweep,
  drawModified,
  showModified,
  animating,
  inspect,
  onInspect,
}: {
  id: string;
  variant: "wide" | "narrow";
  width: number;
  height: number;
  plot: { left: number; right: number; top: number; bottom: number };
  path: data.Path;
  running: boolean;
  nominalSweep: number;
  modifiedSweep: number;
  cursorSweep: number;
  drawModified: boolean;
  showModified: boolean;
  animating: boolean;
  inspect: number;
  onInspect: (index: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const clipId = useSvgId(`pal-sweep-${variant}`);
  const xScale = useMemo(() => linear([data.F_MIN, data.F_MAX], [plot.left, plot.right]), [plot.left, plot.right]);
  const yScale = useMemo(() => linear(data.yDomain[path], [plot.bottom, plot.top]), [path, plot.bottom, plot.top]);
  const toPoints = (values: number[]) => values.map((value, index) => [xScale(data.frequencies[index]), yScale(value)] as [number, number]);

  const sweepX = xScale(data.F_MIN + (data.F_MAX - data.F_MIN) * cursorSweep);
  const f = data.frequencies[inspect];
  const mean = data.nominalMean[path][inspect];
  const mod = data.modified[path][inspect];
  const info = data.pathInfo[path];

  const onPointer = (event: PointerEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const { x: px } = svgPoint(svg, event);
    const frequency = xScale.invert(clamp(px, plot.left, plot.right));
    onInspect(Math.round(((frequency - data.F_MIN) / (data.F_MAX - data.F_MIN)) * (data.BINS - 1)));
  };

  return (
    <svg ref={svgRef} className="bi-diagram" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${id}-${variant}-title ${id}-${variant}-desc`}>
      <title id={`${id}-${variant}-title`}>Measuring an RF fingerprint</title>
      <desc id={`${id}-${variant}-desc`}>
        {`A schematic board connected to an RF source and receiver. The ${info.label.toLowerCase()} path is highlighted. Below, seven synthetic nominal captures overlap closely across 1 to 6 GHz, and a modified-device trace departs from them near ${data.departure[path].center} GHz.`}
      </desc>
      <defs>
        <clipPath id={`${clipId}-nominal`}>
          <rect x={0} y={0} width={xScale(data.F_MIN + (data.F_MAX - data.F_MIN) * nominalSweep)} height={height} />
        </clipPath>
        <clipPath id={`${clipId}-modified`}>
          <rect x={0} y={0} width={xScale(data.F_MIN + (data.F_MAX - data.F_MIN) * modifiedSweep)} height={height} />
        </clipPath>
      </defs>

      {variant === "narrow" ? <NarrowBoard path={path} running={running} /> : <Board path={path} running={running} />}

      <AxisLeft
        scale={yScale}
        values={path === "reflection" ? [-30, -20, -10, 0] : [-24, -16, -8, 0]}
        at={plot.left}
        label="|response| (dB)"
        grid={plot.right - plot.left}
      />
      <AxisBottom scale={xScale} values={[1, 2, 3, 4, 5, 6]} at={plot.bottom} label="frequency (GHz)" />

      <g clipPath={`url(#${clipId}-nominal)`}>
        {data.captures[path].map((capture, index) => (
          <path key={index} d={linePath(toPoints(capture))} className="pal-trace pal-trace-capture" data-tone="model" />
        ))}
        <path d={linePath(toPoints(data.nominalMean[path]))} className="pal-trace" data-tone="model" />
      </g>
      {drawModified && (
        <g clipPath={`url(#${clipId}-modified)`}>
          <path d={linePath(toPoints(data.modified[path]))} className="pal-trace pal-trace-dashed" data-tone="error" />
        </g>
      )}

      {animating && <line className="pal-cursor" x1={sweepX} x2={sweepX} y1={plot.top - 6} y2={plot.bottom} />}

      {!animating && (
        <g aria-hidden>
          <line className="pal-inspect" x1={xScale(f)} x2={xScale(f)} y1={plot.top - 6} y2={plot.bottom} />
          <circle cx={xScale(f)} cy={yScale(mean)} r={3.5} className="pal-dot" data-tone="model" />
          {showModified && <circle cx={xScale(f)} cy={yScale(mod)} r={3.5} className="pal-dot" data-tone="error" />}
        </g>
      )}

      <rect
        x={plot.left}
        y={plot.top - 6}
        width={plot.right - plot.left}
        height={plot.bottom - plot.top + 6}
        fill="transparent"
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        style={{ touchAction: "pan-y" }}
      />
    </svg>
  );
}

export function RfFingerprint({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const sequence = useSequence({
    length: 2,
    stepMs: [3000, 2200],
    rootRef: ref,
    threshold: 0.5,
  });
  const [path, setPath] = useState<data.Path>("reflection");
  const [showModified, setShowModified] = useState(true);
  const [inspect, setInspect] = useState(Math.round(data.BINS * 0.56));
  const [progress, setProgress] = useState(1);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => sequence.subscribe((_, value) => setProgress(value)), [sequence]);

  const animating = sequence.status === "playing" || sequence.status === "paused";
  const nominalSweep = animating && sequence.step === 0 ? progress : 1;
  const modifiedSweep = animating ? (sequence.step === 0 ? 0 : progress) : 1;
  const drawModified = showModified && modifiedSweep > 0;
  const cursorSweep = sequence.step === 0 ? nominalSweep : modifiedSweep;

  const f = data.frequencies[inspect];
  const values = data.captures[path].map((capture) => capture[inspect]);
  const mean = data.nominalMean[path][inspect];
  const mod = data.modified[path][inspect];
  const info = data.pathInfo[path];
  const diagramProps = {
    id,
    path,
    running: sequence.running,
    nominalSweep,
    modifiedSweep,
    cursorSweep,
    drawModified,
    showModified,
    animating,
    inspect,
    onInspect: setInspect,
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
        <>
          <SegmentedControl
            label="Measurement path"
            value={path}
            onChange={(value) => {
              setPath(value);
              setAnnouncement(`${data.pathInfo[value].label} path selected. ${data.pathInfo[value].description}`);
            }}
            options={[
              { value: "reflection", label: "Reflection" },
              { value: "transmission", label: "Transmission" },
            ]}
          />
          <ControlButton
            pressed={showModified}
            onClick={() => {
              setShowModified((value) => !value);
              setAnnouncement(showModified ? "Modified-device trace hidden." : "Modified-device trace shown.");
            }}
          >
            Modified device
          </ControlButton>
          <SequenceControls
            sequence={sequence}
            steps={[{ label: "Sweep nominal captures" }, { label: "Sweep modified device" }]}
            name="the frequency sweep"
            showSteps={false}
          />
        </>
      }
    >
      <div className="pal-hub-type p-4">
        <div className="bi-diagram-wrap" data-responsive="true">
          <div className="bi-layout-wide">
            <PlotScroll>
              <FingerprintDiagram variant="wide" width={WIDE.w} height={WIDE.h} plot={WIDE.plot} {...diagramProps} />
            </PlotScroll>
          </div>
          <div className="bi-layout-narrow -mx-4">
            <FingerprintDiagram variant="narrow" width={NARROW.w} height={NARROW.h} plot={NARROW.plot} {...diagramProps} />
          </div>
        </div>

        <div className="mt-3 grid gap-3 border-t border-zinc-800/50 pt-3 @xl:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex min-w-0 flex-col gap-1.5">
            <MonoLabel>Inspect frequency</MonoLabel>
            <input
              type="range"
              min={0}
              max={data.BINS - 1}
              value={inspect}
              onChange={(event) => setInspect(Number(event.target.value))}
              aria-valuetext={`${fmt(f)} GHz`}
              className="pal-range"
            />
          </label>
          <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 font-mono text-[0.72rem] text-zinc-400 @xl:grid-cols-[repeat(4,auto)]">
            <dt className="text-zinc-600">freq</dt>
            <dd>{fmt(f)} GHz</dd>
            <dt className="text-zinc-600">{info.label.toLowerCase()}</dt>
            <dd>{info.ports}</dd>
            <dt className="text-zinc-600">
              <span className="bi-swatch mr-1.5" data-tone="model" />
              nominal
            </dt>
            <dd>
              {fmt(Math.min(...values), 1)} to {fmt(Math.max(...values), 1)} dB
            </dd>
            <dt className="text-zinc-600">
              <span className="bi-swatch mr-1.5" data-tone="error" />
              modified
            </dt>
            <dd>{showModified ? `${fmt(mod, 1)} dB (Δ ${fmt(mod - mean, 1)})` : "hidden"}</dd>
          </dl>
        </div>
      </div>
    </FigureFrame>
  );
}
