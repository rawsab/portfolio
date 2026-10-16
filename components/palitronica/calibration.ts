/**
 * Illustrative threshold calibration over synthetic squared distances.
 * Classification follows NND's strict rule: a sample is an anomaly only when q > τ.
 */

export interface Counts {
  fp: number;
  fn: number;
  tp: number;
  tn: number;
}

export const isAnomaly = (q: number, tau: number) => q > tau;

export function countErrors(nominal: number[], anomaly: number[], tau: number): Counts {
  const fp = nominal.filter((q) => isAnomaly(q, tau)).length;
  const fn = anomaly.filter((q) => !isAnomaly(q, tau)).length;
  return { fp, fn, tp: anomaly.length - fn, tn: nominal.length - fp };
}

/** FP/FN, with Infinity when only false positives remain and null when there are no errors. */
export function errorRatio({ fp, fn }: Pick<Counts, "fp" | "fn">): number | null {
  if (fn === 0) return fp === 0 ? null : Infinity;
  return fp / fn;
}

export function formatRatio(counts: Pick<Counts, "fp" | "fn">) {
  const ratio = errorRatio(counts);
  if (ratio === null) return "undefined; zero errors";
  if (ratio === Infinity) return "∞";
  return ratio.toFixed(2).replace(/\.?0+$/, "") || "0";
}

export interface Candidate {
  /** Interval [lo, hi) of thresholds that produce the same partition; null marks an open end. */
  lo: number | null;
  hi: number | null;
  tau: number;
  counts: Counts;
}

/** One representative threshold per distinct partition, placed strictly inside its interval. */
export function candidates(nominal: number[], anomaly: number[]): Candidate[] {
  const values = Array.from(new Set([...nominal, ...anomaly])).sort((a, b) => a - b);
  if (values.length === 0) return [];
  const spans: [number | null, number | null][] = [[null, values[0]]];
  for (let i = 0; i < values.length; i++) spans.push([values[i], values[i + 1] ?? null]);
  return spans.map(([lo, hi]) => {
    const tau = lo === null ? hi! / 2 : hi === null ? lo + 0.4 : (lo + hi) / 2;
    return { lo, hi, tau, counts: countErrors(nominal, anomaly, tau) };
  });
}

export type Objective = { kind: "min-fp" } | { kind: "min-fn" } | { kind: "ratio"; target: number };

/**
 * Selection key: the objective, then total errors, then the lower threshold.
 * The final tie-break is a choice made for this widget.
 */
function rank(candidate: Candidate, objective: Objective): number[] {
  const { fp, fn } = candidate.counts;
  const total = fp + fn;
  if (objective.kind === "min-fp") return [fp, total, candidate.tau];
  if (objective.kind === "min-fn") return [fn, total, candidate.tau];
  const ratio = errorRatio(candidate.counts);
  const distance = ratio === null ? 0 : ratio === Infinity ? Number.MAX_VALUE : Math.abs(ratio - objective.target);
  return [distance, total, candidate.tau];
}

export function choose(list: Candidate[], objective: Objective): Candidate {
  return list.reduce((best, candidate) => {
    const a = rank(candidate, objective);
    const b = rank(best, objective);
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return a[i] < b[i] ? candidate : best;
    }
    return best;
  });
}

export const separates = (nominal: number[], anomaly: number[]) => Math.max(...nominal) < Math.min(...anomaly);

/** τ = max(N) + g · (min(A) − max(N)), defined when the observed classes separate. */
export function gapThreshold(nominal: number[], anomaly: number[], g: number) {
  const low = Math.max(...nominal);
  const high = Math.min(...anomaly);
  return low + g * (high - low);
}

/** Clean separation uses the gap at g; overlap falls back to the objective. */
export function calibrate(nominal: number[], anomaly: number[], objective: Objective, g = 0.5) {
  if (separates(nominal, anomaly)) {
    const tau = gapThreshold(nominal, anomaly, g);
    return { tau, counts: countErrors(nominal, anomaly, tau), clean: true };
  }
  const best = choose(candidates(nominal, anomaly), objective);
  return { tau: best.tau, counts: best.counts, clean: false, candidate: best };
}
