"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";
import { Link2 } from "lucide-react";
import { scrollToSection } from "./article-toc";

export function SectionHeading({ id, children }: { id: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    scrollToSection(id);
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#${id}`);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // The hash is still updated, so the address bar holds a shareable link.
    }
  };

  return (
    <h2 id={id} tabIndex={-1} className="group mt-16 mb-4 scroll-mt-20 text-xl font-semibold tracking-tight text-white outline-none">
      {children}
      <a
        href={`#${id}`}
        onClick={onClick}
        aria-label={`Copy link to section: ${children}`}
        className="bi-focusable ml-2 inline-flex translate-y-0.5 items-center rounded-sm text-zinc-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:text-zinc-300 focus-visible:opacity-100 [@media(hover:none)]:opacity-60"
      >
        <Link2 className="h-4 w-4" aria-hidden />
      </a>
      <span role="status" className="ml-2 align-middle font-mono text-xs font-normal text-zinc-500">
        {copied ? "Link copied" : ""}
      </span>
    </h2>
  );
}
