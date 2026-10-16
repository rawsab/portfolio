import { seeded } from "../plot";

export type Vec = [number, number];

const theta = (33 * Math.PI) / 180;
export const sigmaLong = 1.5;
export const sigmaShort = 0.42;
export const uLong: Vec = [Math.cos(theta), Math.sin(theta)];
export const uShort: Vec = [-Math.sin(theta), Math.cos(theta)];
export const mean: Vec = [0, 0];

/** Σ = R · diag(σ_long², σ_short²) · Rᵀ, written out for the readout. */
export const covariance = [
  [sigmaLong ** 2 * uLong[0] ** 2 + sigmaShort ** 2 * uShort[0] ** 2, sigmaLong ** 2 * uLong[0] * uLong[1] + sigmaShort ** 2 * uShort[0] * uShort[1]],
  [sigmaLong ** 2 * uLong[0] * uLong[1] + sigmaShort ** 2 * uShort[0] * uShort[1], sigmaLong ** 2 * uLong[1] ** 2 + sigmaShort ** 2 * uShort[1] ** 2],
];

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1];

/** Coordinates in the whitened frame, where nominal covariance becomes the identity. */
export function whiten(x: Vec): Vec {
  const d: Vec = [x[0] - mean[0], x[1] - mean[1]];
  return [dot(d, uLong) / sigmaLong, dot(d, uShort) / sigmaShort];
}

export function unwhiten(w: Vec): Vec {
  return [mean[0] + sigmaLong * w[0] * uLong[0] + sigmaShort * w[1] * uShort[0], mean[1] + sigmaLong * w[0] * uLong[1] + sigmaShort * w[1] * uShort[1]];
}

export function squaredMahalanobis(x: Vec) {
  const [a, b] = whiten(x);
  return a * a + b * b;
}

export const euclidean = (x: Vec) => Math.hypot(x[0] - mean[0], x[1] - mean[1]);

export const samples: Vec[] = (() => {
  const rng = seeded(7);
  return Array.from({ length: 110 }, () => unwhiten([rng.normal(), rng.normal()]));
})();

export const STEP = 1.5;
export const presets = [
  {
    label: "Long axis",
    point: [mean[0] + STEP * uLong[0], mean[1] + STEP * uLong[1]] as Vec,
  },
  {
    label: "Short axis",
    point: [mean[0] + STEP * uShort[0], mean[1] + STEP * uShort[1]] as Vec,
  },
];

export const contourLevels = [1, 4, 9];
export const circleRadii = [1, 2, 3];

const ring = (count = 72) => Array.from({ length: count + 1 }, (_, i) => (i / count) * Math.PI * 2);

export const mahalanobisContour = (c: number): Vec[] => ring().map((phi) => unwhiten([Math.sqrt(c) * Math.cos(phi), Math.sqrt(c) * Math.sin(phi)]));
export const euclideanCircle = (r: number): Vec[] => ring().map((phi) => [mean[0] + r * Math.cos(phi), mean[1] + r * Math.sin(phi)]);

export const caption =
  "The same numerical displacement can have different significance depending on the nominal covariance structure. Axes are an illustrative two-feature slice; every contour and readout is computed from one synthetic covariance matrix.";
