import type { Platform } from "../fixture";

/** Platform is always encoded by shape (TikTok circle, Instagram square), campaign by hue. */
export function PlatformMark({ platform, tone, size = 10 }: { platform: Platform; tone: "model" | "user"; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className="shrink-0" aria-label={platform} role="img">
      {platform === "TikTok" ? <circle cx={5} cy={5} r={3.6} className="sr-mark" data-tone={tone} /> : <rect x={1.6} y={1.6} width={6.8} height={6.8} rx={1} className="sr-mark" data-tone={tone} />}
    </svg>
  );
}

export function SvgPlatformMark({ platform, x, y, r = 5, className }: { platform: Platform; x: number; y: number; r?: number; className?: string }) {
  return platform === "TikTok" ? (
    <circle cx={x} cy={y} r={r} className={className} />
  ) : (
    <rect x={x - r * 0.88} y={y - r * 0.88} width={r * 1.76} height={r * 1.76} rx={1.2} className={className} />
  );
}
