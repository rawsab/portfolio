"use client";

import { KeyboardEvent, useMemo, useRef, useState } from "react";
import { FigureFrame, MonoLabel, SequenceControls } from "@/components/brand-identity/figure-frame";
import { SegmentedControl } from "@/components/brand-identity/segmented-control";
import { useSequence } from "@/components/brand-identity/use-sequence";
import { cn } from "@/lib/utils";
import { AxisBottom, AxisLeft, clamp, fmt, linePath, linear, svgDragHandlers } from "../plot";
import { useTween } from "../use-tween";
import * as data from "./covariance-distance.data";

type Vec = data.Vec;
const SIZE = 400;
const PAD = { left: 40, right: 12, top: 26, bottom: 44 };
const DOMAIN: [number, number] = [-4, 4];

/** Short decimals keep SVG geometry identical across server and client Math implementations. */
const coord = (value: number) => value.toFixed(2);

export function CovarianceDistance({ id, number, title }: { id: string; number: number; title: string }) {
  const ref = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const sequence = useSequence({
    length: 2,
    stepMs: 2200,
    rootRef: ref,
    threshold: 0.55,
  });
  const [contours, setContours] = useState<"mahalanobis" | "euclidean">("mahalanobis");
  const [view, setView] = useState<"feature" | "whitened">("feature");
  const [custom, setCustom] = useState<Vec | null>(null);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const t = useTween(view === "whitened" ? 1 : 0, 700);
  const preset = data.presets[Math.max(sequence.step, 0)];
  const point = custom ?? preset.point;
  const px = useTween(point[0], dragging ? 0 : 500);
  const py = useTween(point[1], dragging ? 0 : 500);

  const sx = useMemo(() => linear(DOMAIN, [PAD.left, SIZE - PAD.right]), []);
  const sy = useMemo(() => linear(DOMAIN, [SIZE - PAD.bottom, PAD.top]), []);

  const project = (x: Vec): [number, number] => {
    const w = data.whiten(x);
    return [sx(x[0] + (w[0] - x[0]) * t), sy(x[1] + (w[1] - x[1]) * t)];
  };

  const q = data.squaredMahalanobis(point);
  const euclid = data.euclidean(point);
  const [dx, dy] = project([px, py]);
  const [mx, my] = project(data.mean);

  const moveTo = (next: Vec, announce = false) => {
    const bounded: Vec = [clamp(next[0], -3.8, 3.8), clamp(next[1], -3.8, 3.8)];
    setCustom(bounded);
    if (sequence.status === "playing") sequence.pause();
    if (announce)
      setAnnouncement(`Test point at (${fmt(bounded[0])}, ${fmt(bounded[1])}). Squared Mahalanobis distance ${fmt(data.squaredMahalanobis(bounded))}.`);
  };

  const drag = svgDragHandlers((x, y) => {
    const local: Vec = [sx.invert(x), sy.invert(y)];
    moveTo(view === "whitened" ? data.unwhiten(local) : local);
  });

  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    const delta = event.shiftKey ? 0.5 : 0.1;
    const moves: Record<string, Vec> = {
      ArrowLeft: [-delta, 0],
      ArrowRight: [delta, 0],
      ArrowUp: [0, delta],
      ArrowDown: [0, -delta],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    moveTo([point[0] + move[0], point[1] + move[1]], true);
  };

  const comparisons = data.presets.map((item) => ({
    ...item,
    q: data.squaredMahalanobis(item.point),
    e: data.euclidean(item.point),
  }));
  const plot = { x: PAD.left, y: PAD.top, w: SIZE - PAD.left - PAD.right, h: SIZE - PAD.top - PAD.bottom };
  const labelInside = (x: number, y: number) => x > plot.x + 28 && x < plot.x + plot.w - 8 && y > plot.y + 12 && y < plot.y + plot.h - 8;

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
          steps={data.presets}
          name="the axis comparison"
          onStep={(index) => {
            setCustom(null);
            setAnnouncement(
              `${data.presets[index].label}: squared Mahalanobis distance ${fmt(comparisons[index].q)} at Euclidean distance ${fmt(comparisons[index].e)}.`,
            );
          }}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800/50 px-4 py-3">
        <SegmentedControl
          label="Contours"
          value={contours}
          onChange={(value) => {
            setContours(value);
            setAnnouncement(value === "mahalanobis" ? "Showing contours of constant squared Mahalanobis distance." : "Showing Euclidean circles.");
          }}
          options={[
            { value: "mahalanobis", label: "Mahalanobis contours" },
            { value: "euclidean", label: "Euclidean circles" },
          ]}
        />
        <SegmentedControl
          label="Coordinates"
          value={view}
          onChange={(value) => {
            setView(value);
            setAnnouncement(
              value === "whitened"
                ? "Whitened view: the nominal ellipse becomes a circle, and Euclidean distance equals the Mahalanobis distance."
                : "Original feature space.",
            );
          }}
          options={[
            { value: "feature", label: "Feature space" },
            { value: "whitened", label: "Whitened" },
          ]}
        />
      </div>

      <div className="grid @2xl:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="p-4">
          <svg
            ref={svgRef}
            className="bi-diagram mx-auto max-w-[26rem]"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="group"
            aria-label="Synthetic nominal samples with a draggable test point"
            onPointerDown={(event) => {
              setDragging(true);
              drag.onPointerDown(event);
            }}
            onPointerMove={drag.onPointerMove}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
          >
            <AxisLeft
              scale={sy}
              values={[-4, -2, 0, 2, 4]}
              at={PAD.left}
              grid={SIZE - PAD.left - PAD.right}
              label={view === "whitened" ? "whitened 2" : "illustrative feature 2"}
            />
            <AxisBottom scale={sx} values={[-4, -2, 0, 2, 4]} at={SIZE - PAD.bottom} label={view === "whitened" ? "whitened 1" : "illustrative feature 1"} />

            <defs>
              <clipPath id={`${id}-plot`}>
                <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${id}-plot)`}>
            {data.samples.map((sample, index) => {
              const [x, y] = project(sample);
              return <circle key={index} cx={coord(x)} cy={coord(y)} r={2.6} className="pal-nominal" data-filled data-faint />;
            })}

            {contours === "mahalanobis"
              ? data.contourLevels.map((c) => (
                  <g key={c}>
                    <path d={`${linePath(data.mahalanobisContour(c).map(project))}Z`} className="pal-contour" data-tone="model" />
                    {(() => {
                      const [lx, ly] = project(data.unwhiten([-Math.sqrt(c) * 0.6, Math.sqrt(c) * 0.8]));
                      if (!labelInside(lx, ly)) return null;
                      return (
                        <text x={coord(lx - 4)} y={coord(ly - 4)} textAnchor="end" className="bi-note" data-tone="model">
                          q = {c}
                        </text>
                      );
                    })()}
                  </g>
                ))
              : data.circleRadii.map((r) => (
                  <g key={r}>
                    <path d={`${linePath(data.euclideanCircle(r).map(project))}Z`} className="pal-contour" data-dashed />
                    {(() => {
                      const [lx, ly] = project([r * 0.71, -r * 0.71]);
                      if (!labelInside(lx, ly)) return null;
                      return (
                        <text x={coord(lx + 4)} y={coord(ly + 12)} className="bi-note">
                          ‖d‖ = {r}
                        </text>
                      );
                    })()}
                  </g>
                ))}

            <line x1={coord(mx)} y1={coord(my)} x2={coord(dx)} y2={coord(dy)} className="pal-displacement" />
            <circle cx={coord(mx)} cy={coord(my)} r={3.5} className="pal-mean" />
            <text x={coord(mx - 8)} y={coord(my + 16)} className="bi-note" textAnchor="end">
              μ
            </text>

            <g
              role="button"
              tabIndex={0}
              aria-label={`Test point at (${fmt(point[0])}, ${fmt(point[1])}). Euclidean distance ${fmt(euclid)}, squared Mahalanobis distance ${fmt(q)}. Use arrow keys to move; hold Shift for larger steps.`}
              onKeyDown={onKeyDown}
              className="pal-handle cursor-grab"
              style={{ touchAction: "none" }}
            >
              <circle cx={coord(dx)} cy={coord(dy)} r={14} fill="transparent" />
              <circle cx={coord(dx)} cy={coord(dy)} r={6} className="pal-test-point" />
            </g>
            </g>
          </svg>
          <p className="mt-1 text-center text-[0.7rem] text-zinc-600">Drag the test point, or focus it and use the arrow keys.</p>
        </div>

        <div className="space-y-4 border-t border-zinc-800/50 p-4 @2xl:border-t-0 @2xl:border-l">
          <div>
            <MonoLabel>Test point</MonoLabel>
            <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 font-mono text-[0.75rem] text-zinc-400">
              <dt className="text-zinc-600">‖x − μ‖</dt>
              <dd>{fmt(euclid)}</dd>
              <dt className="text-zinc-600">q</dt>
              <dd className="text-lg leading-tight text-white">{fmt(q)}</dd>
              <dt className="text-zinc-600">√q</dt>
              <dd>{fmt(Math.sqrt(q))}</dd>
            </dl>
          </div>
          <div>
            <MonoLabel>Equal step, ‖d‖ = {fmt(data.STEP)}</MonoLabel>
            <ul className="mt-2 space-y-1.5">
              {comparisons.map((item, index) => (
                <li
                  key={item.label}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 font-mono text-[0.7rem] transition-colors duration-200",
                    !custom && sequence.step === index ? "border-zinc-600 bg-white/5 text-zinc-200" : "border-zinc-800/60 text-zinc-500",
                  )}
                >
                  <span className="flex justify-between gap-2">
                    <span>{item.label.toLowerCase()}</span>
                    <span>q = {fmt(item.q)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <MonoLabel>Synthetic Σ</MonoLabel>
            <pre className="bi-payload mt-2 text-[0.72rem]">
              {`[ ${fmt(data.covariance[0][0])}  ${fmt(data.covariance[0][1])} ]\n[ ${fmt(data.covariance[1][0])}  ${fmt(data.covariance[1][1])} ]`}
            </pre>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}
