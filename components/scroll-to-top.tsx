"use client";

import { useEffect } from "react";

export function ScrollToTop() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Disable scroll restoration so returning to the homepage starts at the top,
    // unless the URL asks for a specific section (for example /#writing).
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const id = window.location.hash.replace(/^#/, "");
    if (!id) {
      window.scrollTo(0, 0);
      return;
    }

    const scrollToHash = () => {
      const target = document.getElementById(decodeURIComponent(id));
      if (!target) return false;
      target.scrollIntoView();
      return true;
    };

    if (scrollToHash()) return;

    const frame = requestAnimationFrame(() => {
      if (!scrollToHash()) window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return null;
}
