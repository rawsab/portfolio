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

export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.history.replaceState(window.history.state, "", `#${id}`);
  target.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
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
  const [open, setOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const activeItem = items.find((item) => item.id === active) ?? items[0];

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
    setOpen(false);
    scrollToSection(id);
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

      <div ref={mobileRef} className="sticky top-0 z-30 -mx-8 mb-2 xl:hidden">
        <nav aria-label="On this page" className="relative border-b border-white/10 bg-black/80 px-8 backdrop-blur-md [-webkit-backdrop-filter:blur(12px)]">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="bi-toc-mobile-list"
            onClick={() => setOpen((value) => !value)}
            className="bi-focusable flex h-11 w-full cursor-pointer items-center gap-3 text-left"
          >
            <span className="shrink-0 font-mono text-xs font-medium uppercase text-[#686868]">On this page</span>
            <span className="min-w-0 flex-1 truncate text-sm text-zinc-300">{activeItem?.text}</span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200", open && "rotate-180")} aria-hidden />
          </button>
          <div
            id="bi-toc-mobile-list"
            hidden={!open}
            className="absolute inset-x-0 top-full max-h-[min(70vh,28rem)] overflow-y-auto border-b border-white/10 bg-black/95 px-8 pt-2 pb-4 backdrop-blur-md"
          >
            <TocLinks items={items} active={active} onNavigate={navigate} />
            <Link
              href="/"
              className="bi-focusable mt-3 inline-flex items-center gap-1.5 rounded-sm font-mono text-xs text-zinc-500 transition-colors duration-300 hover:text-zinc-300"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden />
              HOME
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
