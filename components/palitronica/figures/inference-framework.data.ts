export type ModelId = "nnd" | "other";

export const models: { id: ModelId; name: string; short: string }[] = [
  { id: "nnd", name: "NND", short: "Normal-distribution novelty detector" },
  { id: "other", name: "Other detectors", short: "Additional models in the framework" },
];

export const steps = [
  {
    label: "Feature representation",
    summary: "One synthetic capture is extracted into a feature array indexed by capture, RF path, signal representation, and frequency bin.",
  },
  {
    label: "Detector selection",
    summary: "The inference configuration names one detector. The capture is scored by that model only, not by every model or an ensemble.",
  },
  {
    label: "NND expansion",
    summary: "NND splits the features by RF path. Each split has its own fitted nominal mean and covariance and produces its own squared Mahalanobis distance.",
  },
];

export const featureAxes = [
  { name: "captures", size: "n" },
  { name: "RF paths", size: "3" },
  { name: "representations", size: "2" },
  { name: "frequencies", size: "161" },
];

export const splits = [
  { id: "A", label: "Split A", path: "reflection · P1", q: 3.1, seed: 0.62 },
  { id: "B", label: "Split B", path: "reflection · P2", q: 6.8, seed: 0.9 },
  {
    id: "C",
    label: "Split C",
    path: "transmission · P1 → P2",
    q: 5.6,
    seed: 0.38,
  },
];

export const caption =
  "Anvil’s inference framework supported multiple anomaly-detection models; this calibration project focused on NND. The other card stands in for additional detectors and is not a model inventory.";
