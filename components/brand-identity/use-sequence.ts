"use client";

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

export type SequenceStatus = "ready" | "playing" | "paused" | "done";
export type FrameListener = (step: number, progress: number) => void;

interface SequenceOptions {
  /** Number of steps in the explanatory sequence. */
  length: number;
  /** Presentation time per step, in milliseconds. Not a measure of processing time. */
  stepMs: number | number[];
  rootRef: RefObject<HTMLElement | null>;
  /** Play once when the figure first becomes sufficiently visible. */
  autoplay?: boolean;
  threshold?: number;
}

export interface Sequence {
  /** -1 before the sequence has started. */
  step: number;
  status: SequenceStatus;
  reducedMotion: boolean;
  /** True only while the clock is advancing (playing, onscreen, and the tab is visible). */
  running: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  replay: () => void;
  goTo: (step: number) => void;
  reset: () => void;
  subscribe: (listener: FrameListener) => () => void;
}

/**
 * A small step controller with one requestAnimationFrame clock per figure.
 * Frame listeners (moving packets) read progress directly so the figure only
 * re-renders when the step or status changes.
 */
export function useSequence({ length, stepMs, rootRef, autoplay = true, threshold = 0.45 }: SequenceOptions): Sequence {
  const reducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(-1);
  const [status, setStatus] = useState<SequenceStatus>("ready");
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  const stepRef = useRef(-1);
  const progressRef = useRef(0);
  const listeners = useRef(new Set<FrameListener>());
  const interacted = useRef(false);
  const autoplayed = useRef(false);
  const reducedRef = useRef(reducedMotion);

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  const durationFor = useCallback(
    (index: number) => (Array.isArray(stepMs) ? stepMs[Math.min(index, stepMs.length - 1)] : stepMs),
    [stepMs],
  );

  const emit = useCallback(() => {
    listeners.current.forEach((listener) => listener(stepRef.current, progressRef.current));
  }, []);

  const apply = useCallback(
    (nextStep: number, nextProgress: number, nextStatus: SequenceStatus) => {
      stepRef.current = nextStep;
      progressRef.current = nextProgress;
      setStep(nextStep);
      setStatus(nextStatus);
      emit();
    },
    [emit],
  );

  const start = useCallback(() => apply(0, 0, "playing"), [apply]);

  const play = useCallback(() => {
    interacted.current = true;
    if (status === "done" || stepRef.current < 0) {
      start();
    } else {
      setStatus("playing");
    }
  }, [start, status]);

  const pause = useCallback(() => {
    interacted.current = true;
    setStatus((current) => (current === "playing" ? "paused" : current));
  }, []);

  const toggle = useCallback(() => {
    if (status === "playing") pause();
    else play();
  }, [pause, play, status]);

  const replay = useCallback(() => {
    interacted.current = true;
    start();
  }, [start]);

  const goTo = useCallback(
    (index: number) => {
      interacted.current = true;
      apply(index, 1, index === length - 1 ? "done" : "paused");
    },
    [apply, length],
  );

  const reset = useCallback(() => {
    interacted.current = true;
    apply(-1, 0, "ready");
  }, [apply]);

  const subscribe = useCallback((listener: FrameListener) => {
    listeners.current.add(listener);
    listener(stepRef.current, progressRef.current);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  // Track visibility for autoplay and for suspending the clock offscreen.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        const visible = entry.isIntersecting && entry.intersectionRatio >= threshold;
        setInView(entry.isIntersecting);
        if (visible && autoplay && !autoplayed.current && !interacted.current && !reducedRef.current) {
          autoplayed.current = true;
          stepRef.current = 0;
          progressRef.current = 0;
          setStep(0);
          setStatus("playing");
        }
      },
      { threshold: [0, threshold] },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [autoplay, rootRef, threshold]);

  useEffect(() => {
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const running = status === "playing" && inView && pageVisible;

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = Math.min(now - last, 250);
      last = now;
      let nextProgress = progressRef.current + delta / durationFor(Math.max(stepRef.current, 0));

      if (nextProgress >= 1) {
        if (stepRef.current < length - 1) {
          stepRef.current += 1;
          nextProgress = 0;
          setStep(stepRef.current);
        } else {
          progressRef.current = 1;
          emit();
          setStatus("done");
          return;
        }
      }

      progressRef.current = nextProgress;
      emit();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationFor, emit, length, running]);

  const showStatic = reducedMotion && status === "ready";

  return useMemo(
    () => ({
      step: showStatic ? length - 1 : step,
      status: showStatic ? "done" : status,
      reducedMotion,
      running,
      play,
      pause,
      toggle,
      replay,
      goTo,
      reset,
      subscribe,
    }),
    [goTo, length, pause, play, reducedMotion, replay, reset, running, showStatic, status, step, subscribe, toggle],
  );
}
