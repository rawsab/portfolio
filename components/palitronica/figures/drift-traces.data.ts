export type PathId = "A" | "C";
export type Region = "low" | "mid" | "high";

export const F = 48;
export const F_MIN = 1;
export const F_MAX = 6;
export const freqs = Array.from({ length: F }, (_, i) => F_MIN + ((F_MAX - F_MIN) * i) / (F - 1));

const bump = (f: number, center: number, width: number) => Math.exp(-(((f - center) / width) ** 2));

export const paths: Record<
  PathId,
  {
    label: string;
    mean: (f: number) => number;
    spread: (f: number) => number;
    domain: [number, number];
  }
> = {
  A: {
    label: "Path A · reflection P1",
    mean: (f) => -14 - 5 * Math.sin(1.35 * f + 0.4) - 9 * bump(f, 2.35, 0.3) - 6 * bump(f, 4.95, 0.35),
    spread: (f) => 0.9 + 0.45 * Math.sin(2.3 * f) ** 2 + 0.8 * bump(f, 2.35, 0.3),
    domain: [-34, -2],
  },
  C: {
    label: "Path C · transmission P1→P2",
    mean: (f) => -3 - 2.4 * f + 2.2 * Math.sin(2.2 * f + 0.8) - 7 * bump(f, 3.25, 0.4),
    spread: (f) => 0.7 + 0.35 * Math.cos(1.7 * f) ** 2 + 0.6 * bump(f, 3.25, 0.4),
    domain: [-26, 2],
  },
};

export const regions: Record<Region, { label: string; center: number }> = {
  low: { label: "1.5–2.5 GHz", center: 2 },
  mid: { label: "3–4 GHz", center: 3.5 },
  high: { label: "4.5–5.5 GHz", center: 5 },
};

export interface DriftState {
  path: PathId;
  region: Region;
  /** Centroid displacement of the current group, in dB, at the region's center. */
  shift: number;
  /** Multiplier applied to both groups' spreads. */
  spread: number;
  /** Current-group spread relative to the baseline, used by the equal-centroid preset. */
  ratio: number;
}

export function compute(state: DriftState) {
  const path = paths[state.path];
  const center = regions[state.region].center;
  const rows = freqs.map((f) => {
    const muX = path.mean(f);
    const muY = muX + state.shift * bump(f, center, 0.42);
    const sigmaX = path.spread(f) * state.spread;
    const sigmaY = sigmaX * state.ratio;
    return { f, muX, muY, sigmaX, sigmaY };
  });
  const separation =
    rows.reduce((sum, row) => sum + Math.abs(row.muX - row.muY) / ((row.sigmaX + row.sigmaY) / 2), 0) / F;
  const drift = Math.round(separation * 100) / 100;
  return { rows, drift };
}

export const presets: {
  id: string;
  label: string;
  state: Pick<DriftState, "shift" | "spread" | "ratio">;
}[] = [
  {
    id: "shift",
    label: "Localized shift",
    state: { shift: 4, spread: 1, ratio: 1 },
  },
  {
    id: "wide",
    label: "Same shift, wider spread",
    state: { shift: 4, spread: 1.8, ratio: 1 },
  },
  {
    id: "equal",
    label: "Equal centroids",
    state: { shift: 0, spread: 1, ratio: 1.8 },
  },
];

export const caption =
  "Baseline and current mean traces, with bands showing the variation within each group. The drift readout grows when those averages separate relative to the spread. All traces are synthetic.";
