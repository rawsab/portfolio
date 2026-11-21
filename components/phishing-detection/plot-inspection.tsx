"use client";

import type { KeyboardEvent } from "react";

/** One tab stop for a series of adjacent SVG inspection targets. */
export function PlotInspection({
  bins,
  active,
  select,
  top,
  height,
}: {
  bins: readonly { left: number; width: number; label: string }[];
  active: number;
  select: (index: number) => void;
  top: number;
  height: number;
}) {
  function navigate(event: KeyboardEvent<SVGRectElement>, index: number) {
    const last = bins.length - 1;
    const destinations: Record<string, number> = {
      ArrowLeft: Math.max(0, index - 1),
      ArrowRight: Math.min(last, index + 1),
      Home: 0,
      End: last,
      Enter: index,
      " ": index,
    };
    const next = destinations[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
    event.currentTarget.parentElement?.querySelector<SVGRectElement>(`[data-point="${next}"]`)?.focus();
  }

  return (
    <g>
      {bins.map(({ left, width, label }, index) => (
        <rect
          key={index}
          data-point={index}
          className="pd-plot-target"
          role="button"
          aria-label={label}
          aria-pressed={index === active}
          tabIndex={index === active ? 0 : -1}
          x={left}
          y={top}
          width={width}
          height={height}
          onFocus={() => select(index)}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") select(index);
          }}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => select(index)}
          onKeyDown={(event) => navigate(event, index)}
        />
      ))}
    </g>
  );
}
