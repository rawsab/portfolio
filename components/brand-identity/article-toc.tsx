"use client";

import Link from "next/link";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  text: string;
}

const ACTIVE_OFFSET = 120;

export function scrollToSection(id: string, collapseOffset = 0) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.history.replaceState(window.history.state, "", `#${id}`);
  const scrollMargin = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - scrollMargin - collapseOffset);
  window.scrollTo({ top, behavior: reduced ? "instant" : "smooth" });
  target.focus({ preventScroll: true });
}

function useActiveSection(items: TocItem[]) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const element = document.getElementById(item.id);
        if (element && element.getBoundingClientRect().top <= ACTIVE_OFFSET) current = item.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = items[items.length - 1]?.id ?? current;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [items]);

  return active;
}

function TocLinks({ items, active, onNavigate }: { items: TocItem[]; active: string; onNavigate: (event: MouseEvent<HTMLAnchorElement>, id: string) => void }) {
  return (
    <ol className="space-y-0.5">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(event) => onNavigate(event, item.id)}
            aria-current={active === item.id ? "location" : undefined}
            className="bi-toc-link bi-focusable group flex items-start gap-2.5 rounded-sm py-1 text-[0.8rem] leading-snug text-zinc-500 transition-colors duration-200 hover:text-zinc-300"
          >
            <span aria-hidden className="bi-toc-tick mt-[0.55rem] h-px w-1.5 shrink-0 bg-zinc-700 transition-all duration-200 group-hover:bg-zinc-400" />
            <span>{item.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export function ArticleToc({ items }: { items: TocItem[] }) {
  const active = useActiveSection(items);
  const activeItem = items.find((item) => item.id === active) ?? items[0];
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      setStuck(entry.boundingClientRect.top < 0);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [stuck]);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflowAnchor;
    root.style.overflowAnchor = "none";
    const timer = window.setTimeout(() => {
      root.style.overflowAnchor = previous;
    }, 360);
    return () => {
      window.clearTimeout(timer);
      root.style.overflowAnchor = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        mobileRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!mobileRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const panel = document.getElementById("bi-toc-mobile-list");
    const collapseOffset = !stuck && panel?.getClientRects().length ? panel.getBoundingClientRect().height : 0;
    setOpen(false);
    scrollToSection(id, collapseOffset);
  };

  return (
    <>
      <nav
        aria-label="On this page"
        className="fixed top-24 left-[max(1.5rem,calc(50vw-26rem-13rem))] z-30 hidden max-h-[calc(100vh-8rem)] w-44 overflow-y-auto pb-6 xl:block"
      >
        <Link
          href="/"
          className="bi-focusable mb-6 inline-flex items-center gap-1.5 rounded-sm font-mono text-xs text-zinc-500 transition-colors duration-300 hover:text-zinc-300"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          HOME
        </Link>
        <p className="mb-3 font-mono text-xs font-medium uppercase text-[#686868]">On this page</p>
        <TocLinks items={items} active={active} onNavigate={navigate} />
      </nav>

      <div ref={sentinelRef} aria-hidden className="pointer-events-none h-px xl:hidden" />
      <div ref={mobileRef} className="bi-toc-sticky sticky top-0 z-30 -mt-px mb-2 xl:hidden">
          <nav aria-label="On this page" className="bi-toc-sticky-pad relative border-b border-white/10 bg-black/80 backdrop-blur-md [-webkit-backdrop-filter:blur(12px)]">
            <button
              type="button"
              aria-expanded={open}
              aria-controls="bi-toc-mobile-list"
              onClick={() => setOpen((value) => !value)}
              className="bi-focusable flex h-11 w-full cursor-pointer items-center justify-between gap-3 text-left"
            >
              <span className="relative h-full min-w-0 flex-1">
                <span
                  aria-hidden={stuck}
                  className={cn(
                    "absolute inset-0 flex items-center transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    stuck ? "pointer-events-none -translate-y-1 opacity-0" : "translate-y-0 opacity-100",
                  )}
                >
                  <span className="w-full truncate font-mono text-xs font-medium uppercase text-[#686868]">On this page</span>
                </span>
                <span
                  aria-hidden={!stuck}
                  className={cn(
                    "absolute inset-0 flex items-center transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    stuck ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
                  )}
                >
                  <span className="w-full truncate text-sm text-zinc-300">{activeItem?.text}</span>
                </span>
              </span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300", open && "rotate-180")} aria-hidden />
            </button>
            <div
              id="bi-toc-mobile-list"
              data-open={open}
              inert={!open}
              aria-hidden={!open}
              className={cn(
                "bi-toc-disclosure",
                stuck && "bi-toc-sticky-pad absolute inset-x-0 top-full bg-black",
                stuck && open && "border-b border-white/10",
              )}
            >
              <div className="bi-toc-disclosure-clip">
                <div className={cn("max-h-[min(70vh,28rem)] overflow-y-auto pt-3 pb-4", !stuck && "border-t border-white/10")}>
                  <TocLinks items={items} active={active} onNavigate={navigate} />
                </div>
              </div>
            </div>
          </nav>
      </div>
    </>
  );
}
