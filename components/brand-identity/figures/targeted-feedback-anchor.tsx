"use client";

import { ArrowUpRight } from "lucide-react";
import { ControlButton, MonoLabel } from "../figure-frame";
import { useReviewDemo } from "../review-demo-state";
import { RegionStrip } from "./brand-voice-review-demo";

export function TargetedFeedbackAnchor({ id, number, title }: { id: string; number: number; title: string }) {
  const { state, dispatch } = useReviewDemo();

  return (
    <aside id={id} aria-labelledby={`${id}-title`} className="my-10 scroll-mt-24 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <MonoLabel>Fig. {number}, continued</MonoLabel>
          <p id={`${id}-title`} className="mt-1 text-sm text-zinc-200">
            {title}
          </p>
        </div>
        <ControlButton onClick={() => dispatch({ type: "focus-feedback" })}>
          Focus targeted feedback
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </ControlButton>
      </div>
      <p className="mt-3 text-sm leading-normal text-zinc-500">
        This uses the same state as the review demo in Figure {number}. Choose “Make this more technical” for one revision. The selected
        region goes through another simulated pass, and the other regions stay fixed. The preservation is scripted, so it shows the
        intended interaction, not a guarantee from the model.
      </p>
      {state.phase === "reviewed" ? (
        <RegionStrip state={state} className="mt-3" />
      ) : (
        <p className="mt-3 text-xs text-zinc-600">Region status appears once the review in Figure {number} has run.</p>
      )}
    </aside>
  );
}
