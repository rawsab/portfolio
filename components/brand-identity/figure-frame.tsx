"use client";

import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sequence } from "./use-sequence";

interface FigureFrameProps {
  id: string;
  number: number;
  title: string;
  caption: ReactNode;
  badge?: string;
  width?: "wide" | "column";
  controls?: ReactNode;
  announcement?: string;
  children: ReactNode;
  className?: string;
}

export const FigureFrame = forwardRef<HTMLElement, FigureFrameProps>(function FigureFrame(
  { id, number, title, caption, badge = "Illustrative", width = "wide", controls, announcement, children, className },
  ref,
) {
  return (
    <figure ref={ref} id={id} className={cn("bi-figure scroll-mt-24", className)} data-width={width} aria-labelledby={`${id}-caption`}>
      <div className="bi-figure-frame rounded-lg border border-zinc-800/50 bg-zinc-900/30">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-zinc-800/50 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-medium uppercase text-[#686868]">Fig. {number}</span>
            <span className="inline-flex items-center rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-[0.7rem] tracking-tight text-zinc-400">
              {badge}
            </span>
          </div>
          {controls && <div className="flex flex-wrap items-center gap-1.5">{controls}</div>}
        </div>
        <div className="bi-figure-canvas">{children}</div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      <figcaption id={`${id}-caption`} className="mx-auto mt-4 max-w-[38rem] px-4 text-center text-sm leading-normal text-zinc-500">
        <span className="font-mono text-zinc-400">Figure {number}.</span> <span className="text-zinc-300">{title}.</span>{" "}
        {caption}
      </figcaption>
    </figure>
  );
});

type ControlButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { pressed?: boolean; icon?: boolean };

export const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(function ControlButton(
  { pressed, icon, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      className={cn(
        "bi-control inline-flex h-7 min-w-7 cursor-pointer items-center justify-center gap-1.5 rounded-md border text-xs tracking-tight transition-colors duration-200 disabled:cursor-default disabled:opacity-40",
        icon ? "px-1.5" : "px-2.5",
        pressed
          ? "border-zinc-600 bg-white/10 text-white"
          : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

interface SequenceControlsProps {
  sequence: Sequence;
  steps: { label: string }[];
  name: string;
  onStep?: (index: number) => void;
  showSteps?: boolean;
}

export function SequenceControls({ sequence, steps, name, onStep, showSteps = true }: SequenceControlsProps) {
  const playing = sequence.status === "playing";
  return (
    <>
      <ControlButton
        icon
        onClick={sequence.toggle}
        aria-label={playing ? `Pause ${name}` : sequence.status === "done" ? `Replay ${name}` : `Play ${name}`}
      >
        {playing ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
      </ControlButton>
      {showSteps &&
        steps.map((step, index) => (
          <ControlButton
            key={step.label}
            pressed={sequence.step === index && sequence.status !== "ready"}
            onClick={() => {
              sequence.goTo(index);
              onStep?.(index);
            }}
            aria-label={`Step ${index + 1}: ${step.label}`}
            className="font-mono"
          >
            {index + 1}
          </ControlButton>
        ))}
      <ControlButton icon onClick={sequence.replay} aria-label={`Replay ${name} from the beginning`}>
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
      </ControlButton>
    </>
  );
}

export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[0.7rem] font-medium uppercase tracking-tight text-[#686868]", className)}>{children}</span>;
}
