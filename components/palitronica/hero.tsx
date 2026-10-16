import Image from "next/image";
import { CSSProperties } from "react";
import { linePath, linear } from "./plot";
import * as rf from "./figures/rf-fingerprint.data";

const W = 640;
const H = 360;
const SWEEP_MS = 8000;
const SPECTRUM = { left: 24, right: 616, top: 266, bottom: 338 };
const CHIP = { x: 262, y: 142, w: 116, h: 76 };

type Point = [number, number];

const path = (points: Point[]) => points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

const NN_LAYERS: Point[][] = [
  [135, 165, 195, 225].map((y) => [500, y] as Point),
  [120, 150, 180, 210, 240].map((y) => [550, y] as Point),
  [165, 195].map((y) => [600, y] as Point),
];
const NN_EDGES: [Point, Point][] = NN_LAYERS.slice(1).flatMap((layer, l) => NN_LAYERS[l].flatMap((from) => layer.map((to) => [from, to] as [Point, Point])));

/** Traces run in signal order: RF port into the chip, chip out to the model, plus board stubs. */
const TRACES: { points: Point[]; tone?: "model" | "code" | "user"; delay: number }[] = [
  { points: [[74, 180], [140, 180], [152, 170], [262, 170]], tone: "model", delay: 0 },
  { points: [[74, 180], [140, 180], [152, 190], [262, 190]], tone: "model", delay: 1.1 },
  { points: [[130, 132], [196, 132], [216, 152], [262, 152]], delay: 0.6 },
  { points: [[124, 226], [190, 226], [210, 206], [262, 206]], delay: 1.8 },
  ...NN_LAYERS[0].map(([, ny], i): { points: Point[]; tone: "code"; delay: number } => {
    const py = 152 + i * 18;
    return { points: [[378, py], [436, py], [436 + Math.abs(ny - py), ny], [494, ny]], tone: "code", delay: 1.4 + i * 0.35 };
  }),
  { points: [[290, 142], [290, 118], [272, 100], [212, 100]], delay: 0.3 },
  { points: [[320, 142], [320, 92]], delay: 1.5 },
  { points: [[350, 142], [350, 118], [368, 100], [428, 100]], delay: 2.4 },
  { points: [[290, 218], [290, 244]], delay: 0.9 },
  { points: [[320, 218], [320, 236], [338, 254], [420, 254]], delay: 2.1 },
  { points: [[350, 218], [350, 244]], delay: 2.7 },
];

function wave(period: number, amplitude: number, cy: number) {
  const points: Point[] = [];
  for (let x = -period; x <= W + period; x += 4) {
    points.push([x, cy + amplitude * Math.sin((2 * Math.PI * x) / period)]);
  }
  return linePath(points);
}

const delay = (seconds: number) => ({ animationDelay: `${seconds}s` }) as CSSProperties;

/** Looping 16:9 banner: an RF-probed board feeding a learned model, under the Palitronica mark. */
export function RfHero() {
  const x = linear([rf.F_MIN, rf.F_MAX], [SPECTRUM.left, SPECTRUM.right]);
  const y = linear([-34, 0], [SPECTRUM.bottom, SPECTRUM.top]);
  const spectrum = (values: number[]) => linePath(values.map((v, i) => [x(rf.frequencies[i]), y(v)] as Point));
  const anomaly = rf.departure.reflection.center;
  const anomalyX = x(anomaly);
  const anomalyY = y(Math.max(...rf.modified.reflection.filter((_, i) => Math.abs(rf.frequencies[i] - anomaly) < 0.3)));
  const revealAt = ((anomalyX - SPECTRUM.left) / (SPECTRUM.right - SPECTRUM.left)) * 0.45 * SWEEP_MS;

  return (
    <div
      className="pal-hero relative aspect-video w-full overflow-hidden"
      role="img"
      aria-label="Palitronica. Animated illustration of an electronic board probed with RF signals, swept frequency responses revealing an anomaly, and a neural network evaluating the measurements."
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id="pal-hero-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="0.8" fill="#d4d4d8" />
          </pattern>
          <linearGradient id="pal-hero-fade" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.15" stopColor="#fff" />
            <stop offset="0.85" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="pal-hero-edges">
            <rect width={W} height={H} fill="url(#pal-hero-fade)" />
          </mask>
        </defs>

        <rect width={W} height={H} fill="url(#pal-hero-dots)" />

        <g mask="url(#pal-hero-edges)">
          <path d={wave(96, 14, 54)} className="pal-hero-wave" data-tone="model" style={{ "--shift": "96px", animationDuration: "4s" } as CSSProperties} />
          <path d={wave(64, 8, 54)} className="pal-hero-wave" data-tone="code" style={{ "--shift": "64px", animationDuration: "3.2s" } as CSSProperties} />
        </g>

        {TRACES.map((trace, i) => (
          <g key={i}>
            <path d={path(trace.points)} className="pal-hero-trace" />
            <circle cx={trace.points.at(-1)![0]} cy={trace.points.at(-1)![1]} r={2.6} className="pal-hero-via" />
            <path d={path(trace.points)} pathLength={100} className="pal-hero-pulse" data-tone={trace.tone ?? "code"} style={delay(trace.delay)} />
          </g>
        ))}

        <g>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={64} cy={180} r={26} className="pal-hero-ping" style={delay(i)} />
          ))}
          <circle cx={64} cy={180} r={11} className="pal-hero-port" />
          <circle cx={64} cy={180} r={4} className="pal-hero-port-pin" />
        </g>

        <g>
          <rect x={CHIP.x} y={CHIP.y} width={CHIP.w} height={CHIP.h} rx={4} className="pal-hero-chip" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={CHIP.x + 14 + i * 20} y={CHIP.y - 5} width={6} height={5} className="pal-hero-pin" />
              <rect x={CHIP.x + 14 + i * 20} y={CHIP.y + CHIP.h} width={6} height={5} className="pal-hero-pin" />
            </g>
          ))}
        </g>

        <g>
          {NN_EDGES.map(([[x1, y1], [x2, y2]], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="pal-hero-edge" />
          ))}
          {NN_EDGES.filter((_, i) => i % 4 === 1).map(([[x1, y1], [x2, y2]], i) => (
            <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} pathLength={100} className="pal-hero-pulse pal-hero-pulse-fast" data-tone="code" style={delay(i * 0.27)} />
          ))}
          {NN_LAYERS.flatMap((layer, l) =>
            layer.map(([cx, cy], n) => <circle key={`${l}-${n}`} cx={cx} cy={cy} r={5} className="pal-hero-node" data-tone={l === 2 ? "user" : "code"} style={delay(l * 0.5 + n * 0.08)} />),
          )}
        </g>

        <g>
          {rf.captures.reflection.map((capture, i) => (
            <path key={i} d={spectrum(capture)} className="pal-hero-spectrum" />
          ))}
          <path d={spectrum(rf.modified.reflection)} pathLength={1} className="pal-hero-draw" data-tone="error" />
          <circle cx={anomalyX} cy={anomalyY} r={7} className="pal-hero-flag" data-tone="error" style={{ animationDelay: `${revealAt}ms` }} />
          <line x1={SPECTRUM.left} x2={SPECTRUM.left} y1={SPECTRUM.top - 10} y2={SPECTRUM.bottom + 6} className="pal-hero-scan" style={{ "--shift": `${SPECTRUM.right - SPECTRUM.left}px` } as CSSProperties} />
        </g>
      </svg>

      <div className="pal-hero-overlay absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src="/icons/palitronica-logo-and-text.svg"
          alt=""
          width={956}
          height={159}
          priority
          draggable={false}
          className="pal-hero-logo h-auto w-[46%]"
        />
      </div>
    </div>
  );
}
