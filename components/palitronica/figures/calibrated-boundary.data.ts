import { Objective, calibrate, candidates, countErrors } from "../calibration";

export type Preset = "clean" | "overlap";

/** Signed values on one illustrative feature axis, with a fitted nominal mean of 0 and unit spread. */
export const fitFeatures = [-1.6, -1.1, -0.8, -0.5, -0.3, -0.1, 0.15, 0.4, 0.6, 0.9, 1.25, 1.7];

export const validation: Record<Preset, { nominal: number[]; anomaly: number[] }> = {
  clean: {
    nominal: [-1.9, -1.2, 0.7, 1.4, 1.95],
    anomaly: [-2.35, 2.9, -3.3, 3.7],
  },
  overlap: {
    nominal: [-1.9, -1.2, 0.7, 1.4, 2.45],
    anomaly: [-2.2, 2.9, -3.3, 3.7],
  },
};

/** In one dimension with unit variance, the squared Mahalanobis distance is z². */
export const toQ = (z: number) => z * z;

/** Illustrative shared threshold from the nominal model, before per-path calibration. */
export const STATISTICAL_TAU = 7;

export const objective: Objective = { kind: "ratio", target: 1 };
export const objectiveLabel = "FP/FN ≈ 1";

export function splitA(preset: Preset) {
  const nominal = validation[preset].nominal.map(toQ);
  const anomaly = validation[preset].anomaly.map(toQ);
  return { nominal, anomaly };
}

export const otherSplits = [
  {
    id: "B",
    label: "Split B · reflection P2",
    nominal: [0.8, 2.2, 4.1, 5.3],
    anomaly: [7.9, 9.6, 12.4],
  },
  {
    id: "C",
    label: "Split C · transmission P1→P2",
    nominal: [0.3, 1.1, 2.0, 2.7],
    anomaly: [3.4, 6.2, 11.0],
  },
];

export function splits(preset: Preset) {
  return [{ id: "A", label: "Split A · reflection P1", ...splitA(preset) }, ...otherSplits].map((split) => ({
    ...split,
    calibrated: calibrate(split.nominal, split.anomaly, objective),
    statistical: countErrors(split.nominal, split.anomaly, STATISTICAL_TAU),
  }));
}

export function sweep(preset: Preset) {
  const { nominal, anomaly } = splitA(preset);
  return candidates(nominal, anomaly);
}

export const steps = [
  {
    label: "Nominal model",
    summary: "The fitted nominal distribution and its statistically derived threshold, shown in feature space and in squared-distance space.",
  },
  {
    label: "Labeled validation",
    summary: "Validation examples labeled Nominal and Anomaly appear. One anomaly falls inside the statistical threshold.",
  },
  {
    label: "Candidate thresholds",
    summary: "A candidate threshold visits each partition of the labeled distances, updating the false-positive and false-negative counts.",
  },
  {
    label: "Per-split thresholds",
    summary: "Three RF splits replace the single shared threshold with their own calibrated thresholds.",
  },
];

export const caption =
  "Calibration uses labeled validation distances to choose a boundary for each RF path. Squared distances are not normally distributed, so the two views use separate axes. All values are synthetic.";
