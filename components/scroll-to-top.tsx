"use client";

import { useEffect } from "react";

export function ScrollToTop() {
  useEffect(() => {
    // Scroll to top immediately on mount (synchronous)
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      
      // Disable scroll restoration
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    }
  }, []);

  return null;
}
