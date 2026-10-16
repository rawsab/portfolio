import { seeded } from "../plot";

export type Path = "reflection" | "transmission";

export const F_MIN = 1;
export const F_MAX = 6;
export const BINS = 161;

export const frequencies = Array.from({ length: BINS }, (_, i) => F_MIN + ((F_MAX - F_MIN) * i) / (BINS - 1));

const bump = (f: number, center: number, width: number) => Math.exp(-(((f - center) / width) ** 2));

/** Synthetic responses in dB. Shapes are chosen for legibility, not derived from any device. */
const base: Record<Path, (f: number) => number> = {
  reflection: (f) => -13 - 5 * Math.sin(1.35 * f + 0.4) - 11 * bump(f, 2.35, 0.22) - 8 * bump(f, 4.95, 0.3) + 1.5 * Math.sin(4.2 * f),
  transmission: (f) => -2.5 - 2.6 * f + 2.4 * Math.sin(2.2 * f + 0.8) - 9 * bump(f, 3.25, 0.32) - 4 * bump(f, 5.4, 0.18),
};

export const departure: Record<Path, { center: number; width: number; delta: number }> = {
  reflection: { center: 3.8, width: 0.13, delta: 7.5 },
  transmission: { center: 4.55, width: 0.16, delta: -8 },
};

function nominalCaptures(path: Path, count: number, seed: number) {
  const rng = seeded(seed);
  return Array.from({ length: count }, () => {
    const gain = rng.normal() * 0.7;
    const phase = rng.next() * Math.PI * 2;
    const ripple = 0.5 + rng.next() * 0.5;
    return frequencies.map((f) => base[path](f) + gain + ripple * Math.sin(3.1 * f + phase));
  });
}

export const captures: Record<Path, number[][]> = {
  reflection: nominalCaptures("reflection", 7, 11),
  transmission: nominalCaptures("transmission", 7, 23),
};

export const nominalMean: Record<Path, number[]> = {
  reflection: frequencies.map((_, i) => captures.reflection.reduce((sum, c) => sum + c[i], 0) / captures.reflection.length),
  transmission: frequencies.map((_, i) => captures.transmission.reduce((sum, c) => sum + c[i], 0) / captures.transmission.length),
};

export const modified: Record<Path, number[]> = {
  reflection: nominalMean.reflection.map(
    (v, i) => v + 0.4 + departure.reflection.delta * bump(frequencies[i], departure.reflection.center, departure.reflection.width),
  ),
  transmission: nominalMean.transmission.map(
    (v, i) => v - 0.3 + departure.transmission.delta * bump(frequencies[i], departure.transmission.center, departure.transmission.width),
  ),
};

export const yDomain: Record<Path, [number, number]> = {
  reflection: [-36, 0],
  transmission: [-28, 4],
};

export const pathInfo: Record<Path, { label: string; ports: string; description: string }> = {
  reflection: {
    label: "Reflection",
    ports: "Port 1 → Port 1",
    description: "Energy injected at port 1 and measured returning to the same port.",
  },
  transmission: {
    label: "Transmission",
    ports: "Port 1 → Port 2",
    description: "Energy injected at port 1 and measured arriving at port 2.",
  },
};

export const caption =
  "RF responses provide a measurable fingerprint of the electronics, with variation across both devices and measurement paths. The board, traces, and magnitudes are schematic and synthetic.";
