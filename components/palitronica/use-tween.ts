"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/brand-identity/use-reduced-motion";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Eases a number toward `target`; follows it immediately when `ms` is 0 or reduced motion is preferred. */
export function useTween(target: number, ms = 600) {
  const reduced = usePrefersReducedMotion();
  const instant = reduced || ms <= 0;
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);

  useEffect(() => {
    if (instant) {
      valueRef.current = target;
      const frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }
    const from = valueRef.current;
    if (from === target) return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const next = from + (target - from) * ease(t);
      valueRef.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [instant, ms, target]);

  return instant ? target : value;
}
