"use client";

import { Dispatch, ReactNode, createContext, useContext, useEffect, useMemo, useReducer } from "react";
import {
  FeedbackOption,
  ReviewSegment,
  documentBlocks,
  feedbackTrace,
  reviewTrace,
} from "./figures/brand-voice-review.data";
import { usePrefersReducedMotion } from "./use-reduced-motion";

export type RegionDecision =
  | { kind: "proposed" }
  | { kind: "rejected" }
  | { kind: "feedback"; option: FeedbackOption };

export interface ReviewDemoState {
  phase: "draft" | "reviewing" | "reviewed";
  traceStep: number;
  explanations: boolean;
  selectedId: string | null;
  decisions: Record<string, RegionDecision>;
  revising: { id: string; option: FeedbackOption; step: number } | null;
  showRemoved: boolean;
  /** Increments when another part of the article asks to focus the feedback controls. */
  focusRequest: number;
}

export type ReviewDemoAction =
  | { type: "start" }
  | { type: "advance-trace" }
  | { type: "complete-review" }
  | { type: "select"; id: string | null }
  | { type: "toggle-reject"; id: string }
  | { type: "request"; id: string; option: FeedbackOption }
  | { type: "advance-feedback" }
  | { type: "toggle-removed" }
  | { type: "set-explanations"; value: boolean }
  | { type: "focus-feedback" }
  | { type: "reset" };

export const editableSegments = documentBlocks.flatMap((block) => block.segments.filter((segment) => segment.type !== "UNCHANGED"));
const firstModified = editableSegments.find((segment) => segment.type === "MODIFIED")?.id ?? null;
const feedbackDefault = editableSegments.filter((segment) => segment.type === "MODIFIED")[1]?.id ?? firstModified;

const initialState: ReviewDemoState = {
  phase: "draft",
  traceStep: -1,
  explanations: true,
  selectedId: null,
  decisions: {},
  revising: null,
  showRemoved: false,
  focusRequest: 0,
};

function reducer(state: ReviewDemoState, action: ReviewDemoAction): ReviewDemoState {
  switch (action.type) {
    case "start":
      return { ...initialState, explanations: state.explanations, phase: "reviewing", traceStep: 0, focusRequest: state.focusRequest };
    case "advance-trace":
      return state.traceStep >= reviewTrace.length - 1 ? reducer(state, { type: "complete-review" }) : { ...state, traceStep: state.traceStep + 1 };
    case "complete-review":
      return { ...state, phase: "reviewed", traceStep: reviewTrace.length - 1, selectedId: state.selectedId ?? firstModified };
    case "select":
      return { ...state, selectedId: action.id };
    case "toggle-reject": {
      const current = state.decisions[action.id];
      const next: RegionDecision = current?.kind === "rejected" ? { kind: "proposed" } : { kind: "rejected" };
      return { ...state, decisions: { ...state.decisions, [action.id]: next } };
    }
    case "request":
      return { ...state, selectedId: action.id, revising: { id: action.id, option: action.option, step: 0 } };
    case "advance-feedback": {
      if (!state.revising) return state;
      if (state.revising.step < feedbackTrace.length - 1) {
        return { ...state, revising: { ...state.revising, step: state.revising.step + 1 } };
      }
      return {
        ...state,
        decisions: { ...state.decisions, [state.revising.id]: { kind: "feedback", option: state.revising.option } },
        revising: null,
      };
    }
    case "toggle-removed":
      return { ...state, showRemoved: !state.showRemoved };
    case "set-explanations":
      return { ...state, explanations: action.value };
    case "focus-feedback": {
      const reviewed = state.phase === "reviewed" ? state : reducer(state, { type: "complete-review" });
      const selected = editableSegments.find((segment) => segment.id === reviewed.selectedId);
      return {
        ...reviewed,
        selectedId: selected?.type === "MODIFIED" ? selected.id : feedbackDefault,
        focusRequest: state.focusRequest + 1,
      };
    }
    case "reset":
      return { ...initialState, focusRequest: state.focusRequest };
  }
}

/** The text a segment contributes to the current document. */
export function segmentValue(segment: ReviewSegment, state: Pick<ReviewDemoState, "phase" | "decisions">) {
  if (segment.type === "UNCHANGED") return segment.text;
  if (state.phase !== "reviewed") return segment.original;
  const decision = state.decisions[segment.id];
  if (segment.type === "REMOVED") return decision?.kind === "rejected" ? segment.original : "";
  if (decision?.kind === "rejected") return segment.original;
  if (decision?.kind === "feedback") return segment.feedback[decision.option];
  return segment.revised;
}

export function currentDocumentText(state: Pick<ReviewDemoState, "phase" | "decisions">) {
  return documentBlocks.map((block) => block.segments.map((segment) => segmentValue(segment, state)).join("")).join("\n\n") + "\n";
}

interface ReviewDemoContextValue {
  state: ReviewDemoState;
  dispatch: Dispatch<ReviewDemoAction>;
}

const ReviewDemoContext = createContext<ReviewDemoContextValue | null>(null);

const TRACE_MS = 520;
const FEEDBACK_MS = 700;

export function ReviewDemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const reducedMotion = usePrefersReducedMotion();

  // Presentation timing for the simulated trace; not a latency measurement.
  useEffect(() => {
    if (state.phase !== "reviewing") return;
    const timer = window.setTimeout(
      () => dispatch(reducedMotion ? { type: "complete-review" } : { type: "advance-trace" }),
      reducedMotion ? 0 : TRACE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [reducedMotion, state.phase, state.traceStep]);

  useEffect(() => {
    if (!state.revising) return;
    const timer = window.setTimeout(() => dispatch({ type: "advance-feedback" }), reducedMotion ? 0 : FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, state.revising]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <ReviewDemoContext.Provider value={value}>{children}</ReviewDemoContext.Provider>;
}

export function useReviewDemo() {
  const context = useContext(ReviewDemoContext);
  if (!context) throw new Error("useReviewDemo must be used inside ReviewDemoProvider");
  return context;
}
