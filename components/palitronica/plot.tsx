import { PointerEvent as ReactPointerEvent, ReactNode } from "react";

export type Scale = ((value: number) => number) & {
  invert: (pixel: number) => number;
  domain: [number, number];
  range: [number, number];
};

export function linear(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const scale = ((value: number) => r0 + ((value - d0) / (d1 - d0)) * (r1 - r0)) as Scale;
  scale.invert = (pixel: number) => d0 + ((pixel - r0) / (r1 - r0)) * (d1 - d0);
  scale.domain = domain;
  scale.range = range;
  return scale;
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function linePath(points: [number, number][]) {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
}

/** Closed band between an upper and a lower trace sharing x coordinates. */
export function bandPath(upper: [number, number][], lower: [number, number][]) {
  return `${linePath(upper)}${lower
    .slice()
    .reverse()
    .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
    .join("")}Z`;
}

/** Deterministic PRNG so every synthetic dataset renders identically on server and client. */
export function seeded(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const normal = () => {
    const u = Math.max(next(), 1e-9);
    const v = next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  return { next, normal };
}

export const fmt = (value: number, digits = 2) => (Number.isFinite(value) ? value.toFixed(digits) : "∞");

export function ticks([start, end]: [number, number], count: number) {
  const step = (end - start) / count;
  return Array.from({ length: count + 1 }, (_, i) => start + i * step);
}

/** Converts a pointer position into the SVG's viewBox coordinates. */
export function svgPoint(svg: SVGSVGElement, event: ReactPointerEvent | PointerEvent) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

/** Drag handlers that report viewBox coordinates while a pointer is pressed. */
export function svgDragHandlers(onMove: (x: number, y: number) => void) {
  const handle = (event: ReactPointerEvent<SVGElement>) => {
    const svg = (event.currentTarget as Element).closest("svg");
    if (!svg) return;
    const { x, y } = svgPoint(svg, event);
    onMove(x, y);
  };
  return {
    onPointerDown: (event: ReactPointerEvent<SVGElement>) => {
      (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
      handle(event);
    },
    onPointerMove: (event: ReactPointerEvent<SVGElement>) => {
      if (event.buttons === 0) return;
      handle(event);
    },
  };
}

interface AxisProps {
  scale: Scale;
  values: number[];
  at: number;
  label?: string;
  format?: (value: number) => string;
  /** Length of the gridline drawn across the plot, if any. */
  grid?: number;
}

export function AxisBottom({ scale, values, at, label, format = (v) => String(v), grid }: AxisProps) {
  const [r0, r1] = scale.range;
  return (
    <g className="pal-axis" aria-hidden>
      {grid !== undefined && values.map((value) => <line key={`g${value}`} className="pal-grid" x1={scale(value)} x2={scale(value)} y1={at} y2={at - grid} />)}
      <line x1={r0} x2={r1} y1={at} y2={at} />
      {values.map((value) => (
        <g key={value} transform={`translate(${scale(value)} ${at})`}>
          <line y2={4} />
          <text y={16} textAnchor="middle">
            {format(value)}
          </text>
        </g>
      ))}
      {label && (
        <text className="pal-axis-label" x={r1} y={at + 32} textAnchor="end">
          {label}
        </text>
      )}
    </g>
  );
}

export function AxisLeft({ scale, values, at, label, format = (v) => String(v), grid }: AxisProps) {
  const [r0, r1] = scale.range;
  return (
    <g className="pal-axis" aria-hidden>
      {grid !== undefined && values.map((value) => <line key={`g${value}`} className="pal-grid" x1={at} x2={at + grid} y1={scale(value)} y2={scale(value)} />)}
      <line x1={at} x2={at} y1={r0} y2={r1} />
      {values.map((value) => (
        <g key={value} transform={`translate(${at} ${scale(value)})`}>
          <line x2={-4} />
          <text x={-8} dy="0.32em" textAnchor="end">
            {format(value)}
          </text>
        </g>
      ))}
      {label && (
        <text className="pal-axis-label" x={at} y={Math.min(r0, r1) - 10} textAnchor="start">
          {label}
        </text>
      )}
    </g>
  );
}

/** τ set in math italic; in the monospace UI font it is nearly indistinguishable from T. */
export function Tau({ svg }: { svg?: boolean }) {
  return svg ? <tspan className="pal-greek">τ</tspan> : <span className="pal-greek">τ</span>;
}

/** Nominal samples are circles and anomalies are crosses, so class never depends on color alone. */
/** Keeps wide plots legible on phones by scrolling horizontally instead of shrinking the text. */
export function PlotScroll({ children }: { children: ReactNode }) {
  return (
    <div className="pal-plot-scroll -mx-4 overflow-x-auto px-4">
      <div className="min-w-[34rem]">{children}</div>
    </div>
  );
}

/**
 * Wide diagrams keep their scrolling canvas. Below the figure's 560px container
 * breakpoint, the narrow diagram is shown instead and sized to the figure.
 */
export function ResponsiveDiagram({
  wide,
  narrow,
  bleed = "pad",
}: {
  wide: ReactNode;
  narrow: ReactNode;
  /** How far the phone diagram reaches into the parent's horizontal padding. */
  bleed?: "pad" | "tight";
}) {
  return (
    <div className="bi-diagram-wrap" data-responsive="true">
      <div className="bi-layout-wide">
        <PlotScroll>{wide}</PlotScroll>
      </div>
      <div className={bleed === "tight" ? "bi-layout-narrow -mx-2" : "bi-layout-narrow -mx-4"}>{narrow}</div>
    </div>
  );
}

export function Marker({
  kind,
  x,
  y,
  filled,
  size = 4.5,
  className,
}: {
  kind: "nominal" | "anomaly";
  x: number;
  y: number;
  filled?: boolean;
  size?: number;
  className?: string;
}) {
  if (kind === "nominal") {
    return <circle className={`pal-nominal ${className ?? ""}`} data-filled={filled || undefined} cx={x} cy={y} r={size} />;
  }
  const s = size * 0.95;
  return <path className={`pal-anomaly ${className ?? ""}`} d={`M${x - s},${y - s}L${x + s},${y + s}M${x - s},${y + s}L${x + s},${y - s}`} />;
}
