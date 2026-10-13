"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ControlButton, FigureFrame, MonoLabel } from "../figure-frame";
import { SegmentedControl } from "../segmented-control";
import { ReviewDemoState, currentDocumentText, editableSegments, segmentValue, useReviewDemo } from "../review-demo-state";
import {
  ReviewSegment,
  caption,
  documentBlocks,
  feedbackOptions,
  feedbackTrace,
  reviewScore,
  reviewSummary,
  reviewTrace,
} from "./brand-voice-review.data";

type EditableSegment = Exclude<ReviewSegment, { type: "UNCHANGED" }>;

export function regionStatus(segment: EditableSegment, state: ReviewDemoState) {
  if (state.revising?.id === segment.id) return "revising";
  if (state.revising) return "preserved";
  const decision = state.decisions[segment.id];
  if (decision?.kind === "rejected") return segment.type === "REMOVED" ? "restored" : "rejected";
  if (decision?.kind === "feedback") return "revised again";
  return segment.type === "REMOVED" ? "removed" : "proposed";
}

export function RegionStrip({ state, className }: { state: ReviewDemoState; className?: string }) {
  return (
    <ol aria-label="Document regions" className={cn("flex flex-wrap gap-1.5", className)}>
      {editableSegments.map((segment) => {
        const status = regionStatus(segment, state);
        return (
          <li
            key={segment.id}
            data-tone={status === "revising" ? "user" : status === "preserved" ? "code" : undefined}
            className={cn(
              "bi-chip inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] tracking-tight",
              status === "revising" ? "bi-revising text-zinc-100" : "border-zinc-800 text-zinc-400",
            )}
          >
            <span className="text-zinc-500">{segment.label}</span>
            <span className={status === "revising" || status === "preserved" ? "bi-tone-text" : undefined}>{status}</span>
          </li>
        );
      })}
    </ol>
  );
}

function TraceList({ steps, activeStep, complete, skipped }: { steps: string[]; activeStep: number; complete: boolean; skipped?: number }) {
  return (
    <ol className="space-y-1.5">
      {steps.map((step, index) => {
        const done = complete || index < activeStep;
        const active = !complete && index === activeStep;
        const isSkipped = skipped === index && (done || active);
        return (
          <li key={step} className="flex items-center gap-2.5 text-xs">
            <span
              aria-hidden
              className={cn(
                "bi-progress-dot h-2 w-2 shrink-0 rounded-full border",
                isSkipped ? "border-zinc-600 bg-transparent" : done ? "border-zinc-300 bg-zinc-300" : active ? "border-zinc-300 bg-transparent" : "border-zinc-700",
              )}
            />
            <span className={done || active ? "text-zinc-300" : "text-zinc-600"}>{isSkipped ? "Explanations unavailable" : step}</span>
            <span className="sr-only">{isSkipped ? "skipped" : done ? "complete" : active ? "in progress" : "pending"}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function BrandVoiceReviewDemo({ id, number, title }: { id: string; number: number; title: string }) {
  const { state, dispatch } = useReviewDemo();
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const figureRef = useRef<HTMLElement>(null);
  const requestRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<number | undefined>(undefined);

  const reviewed = state.phase === "reviewed";
  const selected = editableSegments.find((segment) => segment.id === state.selectedId) ?? null;
  const changeCount = editableSegments.length;

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  useEffect(() => {
    if (state.focusRequest === 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestRef.current?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "center" });
    requestRef.current?.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus({ preventScroll: true });
  }, [state.focusRequest]);

  const liveText =
    state.phase === "reviewing"
      ? "Running the simulated review."
      : state.revising
        ? `Revising ${editableSegments.find((segment) => segment.id === state.revising?.id)?.label}. Other regions preserved.`
        : message;

  const select = (segment: EditableSegment) => {
    dispatch({ type: "select", id: segment.id });
    setMessage(`Selected ${segment.label}, ${regionStatus(segment, state)}. Guideline: ${segment.guideline}.`);
  };

  const copy = async () => {
    const text = currentDocumentText(state);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setMessage("Copied the current revised text, without removed content or review annotations.");
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Copying is unavailable in this browser. The preview below shows the text that would be copied.");
    }
  };

  const renderSegment = (segment: ReviewSegment) => {
    const value = segmentValue(segment, state);
    if (segment.type === "UNCHANGED") return <Fragment key={segment.id}>{segment.text === "# " ? null : segment.text}</Fragment>;
    if (!reviewed) return <Fragment key={segment.id}>{value}</Fragment>;

    const status = regionStatus(segment, state);
    const isRemoved = segment.type === "REMOVED" && status === "removed";
    if (isRemoved && !state.showRemoved) return null;

    const kind =
      status === "revising" ? "revising" : isRemoved ? "removed" : status === "rejected" || status === "restored" ? "rejected" : "modified";
    const text = isRemoved ? segment.original : value;

    return (
      <button
        key={segment.id}
        type="button"
        onClick={() => select(segment)}
        aria-pressed={state.selectedId === segment.id}
        aria-label={`${segment.label}: ${text.trim()}. ${status}.`}
        data-kind={kind}
        data-selected={state.selectedId === segment.id}
        className={cn("bi-mark bi-mark-button", kind === "revising" && "bi-revising")}
      >
        {text}
      </button>
    );
  };

  const selectedDecision = selected ? state.decisions[selected.id] : undefined;
  const requestDisabled = !reviewed || !selected || selected.type !== "MODIFIED" || Boolean(state.revising);

  return (
    <FigureFrame
      ref={figureRef}
      id={id}
      number={number}
      title={title}
      badge="Illustrative prototype · simulated review"
      caption={caption}
      announcement={liveText}
      controls={
        <>
          <SegmentedControl
            label="Explanations"
            value={state.explanations ? "on" : "off"}
            onChange={(value) => {
              dispatch({ type: "set-explanations", value: value === "on" });
              setMessage(value === "on" ? "Explanations available." : "Explanations unavailable. Revised text and segments remain.");
            }}
            options={[
              { value: "on", label: "Full review" },
              { value: "off", label: "Explanations unavailable" },
            ]}
          />
          <ControlButton
            icon
            aria-label="Reset the review demo"
            onClick={() => {
              dispatch({ type: "reset" });
              setMessage("Review reset to the original draft.");
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </ControlButton>
        </>
      }
    >
      <div className="grid gap-px bg-zinc-800/50 @2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section aria-label="Document" className="flex flex-col bg-[#0d0d0f] p-5 @2xl:min-h-[22rem]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <MonoLabel>{reviewed ? "Revised document" : "Draft"}</MonoLabel>
            {reviewed && (
              <label className="group inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-500 transition-colors duration-200 hover:text-zinc-400">
                <span className="relative inline-flex h-3.5 w-3.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={state.showRemoved}
                    onChange={() => dispatch({ type: "toggle-removed" })}
                    className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none flex h-full w-full items-center justify-center rounded-[3px] border border-zinc-700 bg-zinc-900/80 transition-colors duration-200 peer-checked:border-zinc-300 peer-checked:bg-zinc-200 peer-focus-visible:ring-1 peer-focus-visible:ring-zinc-400 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-[#0d0d0f] peer-checked:[&_svg]:opacity-100"
                  >
                    <Check className="h-2.5 w-2.5 text-zinc-950 opacity-0 transition-opacity duration-150" strokeWidth={3} />
                  </span>
                </span>
                Show removed text
              </label>
            )}
          </div>

          <div className="flex-1 space-y-3 text-[0.95rem] leading-relaxed text-[#8F8F8F]">
            {documentBlocks.map((block) =>
              block.kind === "heading" ? (
                <p key={block.id} className="text-base font-semibold tracking-tight text-zinc-100">
                  {block.segments.map(renderSegment)}
                </p>
              ) : (
                <p key={block.id}>{block.segments.map(renderSegment)}</p>
              ),
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-800/50 pt-4">
            {!reviewed ? (
              <ControlButton
                onClick={() => {
                  dispatch({ type: "start" });
                  setMessage(`Review complete. ${changeCount} changes are ready to inspect.`);
                }}
                disabled={state.phase === "reviewing"}
                className="border-zinc-600 text-zinc-200"
              >
                {state.phase === "reviewing" ? "Reviewing…" : "Review brand voice"}
              </ControlButton>
            ) : (
              <>
                <ControlButton onClick={copy}>
                  {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                  {copied ? "Copied" : "Copy revised text"}
                </ControlButton>
                <span className="text-xs text-zinc-600">Copy uses the underlying text, not the highlights.</span>
              </>
            )}
          </div>
        </section>

        <section aria-label="Review inspector" className="flex flex-col gap-5 bg-[#0d0d0f] p-5 @2xl:min-h-[22rem]">
          <div>
            <MonoLabel>Review trace</MonoLabel>
            <div className="mt-2.5">
              <TraceList
                steps={reviewTrace}
                activeStep={state.traceStep}
                complete={reviewed}
                skipped={state.explanations ? undefined : 3}
              />
            </div>
          </div>

          {!reviewed ? (
            <p className="text-sm text-zinc-600">Run the review to inspect each change.</p>
          ) : selected ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <MonoLabel>Selected · {selected.label}</MonoLabel>
                <span className="rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-[0.7rem] text-zinc-400">{selected.guideline}</span>
              </div>
              <div>
                <p className="mb-1 text-xs text-zinc-600">Original</p>
                <p className="text-sm text-zinc-400">{selected.original.trim()}</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-zinc-600">Why this changed</p>
                {state.explanations ? (
                  <p className="text-sm text-[#8F8F8F]">{selected.explanation}</p>
                ) : (
                  <p className="rounded-md border border-dashed border-zinc-800 px-3 py-2 text-sm text-zinc-500">
                    Explanation unavailable. The revised text and its segment are still here to inspect.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <ControlButton
                  disabled={Boolean(state.revising)}
                  onClick={() => {
                    dispatch({ type: "toggle-reject", id: selected.id });
                    setMessage(
                      selectedDecision?.kind === "rejected"
                        ? `${selected.label}: revision restored.`
                        : `${selected.label}: change rejected. The original wording is back in the document.`,
                    );
                  }}
                >
                  {selectedDecision?.kind === "rejected" ? "Restore revision" : "Reject change"}
                </ControlButton>
              </div>
              <div ref={requestRef} id={`${id}-request`} role="group" aria-label="Request changes to the selected region" className="scroll-mt-24 pt-1">
                <p className="mb-1.5 text-xs text-zinc-600">Request changes</p>
                <div className="flex flex-wrap gap-1.5">
                  {feedbackOptions.map((option) => (
                    <ControlButton
                      key={option.value}
                      disabled={requestDisabled}
                      onClick={() => {
                        dispatch({ type: "request", id: selected.id, option: option.value });
                        setMessage(`${selected.label} updated: ${option.label.toLowerCase()}. Other regions were preserved.`);
                      }}
                    >
                      {option.label}
                    </ControlButton>
                  ))}
                </div>
                {selected.type === "REMOVED" && <p className="mt-1.5 text-xs text-zinc-600">Removed text can be restored with Reject change.</p>}
              </div>
            </div>
          ) : null}

          {reviewed && (state.revising || Object.values(state.decisions).some((decision) => decision.kind === "feedback")) && (
            <div className="space-y-2.5">
              <MonoLabel>Targeted feedback</MonoLabel>
              <TraceList steps={feedbackTrace} activeStep={state.revising?.step ?? feedbackTrace.length} complete={!state.revising} />
              <RegionStrip state={state} />
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-px border-t border-zinc-800/50 bg-zinc-800/50 @xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className="bg-[#0d0d0f] px-5 py-4">
          <MonoLabel>Summary</MonoLabel>
          <p className="mt-1.5 min-h-[2.75rem] text-sm text-[#8F8F8F]">
            {!reviewed ? "Appears after the review." : state.explanations ? reviewSummary : "Summary unavailable for this review."}
          </p>
        </div>
        <div className="bg-[#0d0d0f] px-5 py-4 @xl:min-w-[13rem]">
          <MonoLabel>Model-estimated alignment</MonoLabel>
          <p className="mt-1.5 text-sm">
            {reviewed && state.explanations ? (
              <>
                <span className="font-mono text-zinc-100">{reviewScore}</span>
                <span className="font-mono text-zinc-500"> / 100</span>
                <span className="ml-2 text-xs text-zinc-600">illustrative</span>
              </>
            ) : (
              <span className="text-zinc-600">{reviewed ? "Not available" : "—"}</span>
            )}
          </p>
        </div>
      </div>

      {reviewed && (
        <details className="group border-t border-zinc-800/50 px-5 py-3">
          <summary className="bi-focusable cursor-pointer rounded-sm text-xs text-zinc-500 transition-colors hover:text-zinc-300">
            Preview the text Copy would produce
          </summary>
          <pre className="bi-payload mt-3 rounded-md border border-zinc-800/50 bg-black/40 p-3">{currentDocumentText(state)}</pre>
        </details>
      )}
    </FigureFrame>
  );
}
