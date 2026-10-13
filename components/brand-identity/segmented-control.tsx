"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}

/** A labelled group of toggle buttons; exactly one option is pressed. */
export function SegmentedControl<T extends string>({ label, value, options, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex rounded-md border border-zinc-800 bg-zinc-900/50 p-0.5", className)}>
      {options.map((option) => {
        const pressed = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(option.value)}
            className={cn(
              "bi-control h-6 cursor-pointer rounded-[0.3rem] px-2.5 text-xs tracking-tight transition-colors duration-200",
              pressed ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-200",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
