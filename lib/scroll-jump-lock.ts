/** While true, section hover UIs should ignore pointer enter (smooth scroll passes through). */
let lockedUntil = 0;

export const SCROLL_JUMP_HOVER_LOCK_MS = 600;

export function lockScrollJumpHover(durationMs: number = SCROLL_JUMP_HOVER_LOCK_MS): void {
  lockedUntil = Math.max(lockedUntil, Date.now() + durationMs);
}

export function isScrollJumpHoverLocked(): boolean {
  return Date.now() < lockedUntil;
}
