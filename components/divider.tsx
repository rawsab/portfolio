import { cn } from "@/lib/utils";

type DividerProps = {
  label?: string;
  className?: string;
};

export function Divider({ label, className }: DividerProps) {
  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      {label ? (
        <span className="text-xs font-medium font-mono text-[#686868] uppercase">{label}</span>
      ) : null}
      <div aria-hidden="true" className="h-px flex-1 bg-white/10" />
    </div>
  );
}
