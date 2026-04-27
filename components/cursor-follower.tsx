"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export function CursorFollower() {
  const [isMobile, setIsMobile] = useState(true); // Keep initial SSR/CSR output identical
  const circleRef = useRef<HTMLDivElement>(null);
  const pillBgRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const caseStudyIconRef = useRef<HTMLSpanElement>(null);
  const readMoreIconRef = useRef<HTMLSpanElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const isPointerRef = useRef(false);
  const isHoveringPfpRef = useRef(false);
  const isHoveringCaseStudyRef = useRef(false);
  const isHoveringReadMoreRef = useRef(false);
  const pillWidthRef = useRef<number | null>(null);
  const pillWidthCaseStudyRef = useRef<number | null>(null);
  const pillWidthReadMoreRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const timeOutsideRadiusRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  // Check if device is mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      // Check for touch capability and screen width
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      return hasTouch && isSmallScreen;
    };

    const updateMobile = () => {
      setIsMobile(checkMobile());
    };

    // Defer initial client-only check until after first paint to avoid hydration mismatch
    const rafId = window.requestAnimationFrame(updateMobile);

    // Also check on resize
    const handleResize = () => {
      updateMobile();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Pre-measure pill widths on mount to avoid snap on first hover
  useEffect(() => {
    if (isMobile) return;
    const circle = circleRef.current;
    const text = textRef.current;
    const dot = dotRef.current;
    const contentWrapper = contentWrapperRef.current;
    const caseStudyIcon = caseStudyIconRef.current;
    const readMoreIcon = readMoreIconRef.current;
    if (!circle || !text || pillWidthRef.current !== null) return;

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (!circle || !text || pillWidthRef.current !== null) return;

      const originalWidth = circle.style.width;
      const originalHeight = circle.style.height;
      const originalPadding = circle.style.paddingLeft;
      const originalPaddingRight = circle.style.paddingRight;
      const originalBorderRadius = circle.style.borderRadius;
      const originalVisibility = circle.style.visibility;

      const measurePill = () => {
        circle.style.width = "auto";
        circle.style.height = "25px";
        circle.style.borderRadius = "9999px";
        circle.style.paddingLeft = "10px";
        circle.style.paddingRight = "10px";
        circle.style.visibility = "hidden";
        return circle.offsetWidth;
      };

      // Measure "AVAILABLE FOR WORK" pill (with dot)
      pillWidthRef.current = measurePill();

      // Measure "CASE STUDY" pill (with icon)
      const originalText = text.textContent;
      text.textContent = "CASE STUDY";
      if (dot) {
        dot.style.width = "0";
        dot.style.minWidth = "0";
        dot.style.overflow = "hidden";
        dot.style.marginRight = "0";
      }
      if (caseStudyIcon) {
        caseStudyIcon.style.opacity = "1";
        caseStudyIcon.style.width = "";
        caseStudyIcon.style.marginLeft = "6px";
      }
      if (readMoreIcon) {
        readMoreIcon.style.opacity = "0";
        readMoreIcon.style.width = "0";
        readMoreIcon.style.marginLeft = "0";
      }
      if (contentWrapper) contentWrapper.style.gap = "0";
      pillWidthCaseStudyRef.current = measurePill();

      // Measure "READ MORE" pill (with icon)
      text.textContent = "READ MORE";
      if (caseStudyIcon) {
        caseStudyIcon.style.opacity = "0";
        caseStudyIcon.style.width = "0";
        caseStudyIcon.style.marginLeft = "0";
      }
      if (readMoreIcon) {
        readMoreIcon.style.opacity = "1";
        readMoreIcon.style.width = "";
        readMoreIcon.style.marginLeft = "6px";
      }
      pillWidthReadMoreRef.current = measurePill();

      text.textContent = originalText;
      if (dot) {
        dot.style.width = "";
        dot.style.minWidth = "";
        dot.style.overflow = "";
        dot.style.marginRight = "";
      }
      if (contentWrapper) contentWrapper.style.gap = "";
      if (caseStudyIcon) {
        caseStudyIcon.style.opacity = "0";
        caseStudyIcon.style.width = "0";
        caseStudyIcon.style.marginLeft = "0";
      }
      if (readMoreIcon) {
        readMoreIcon.style.opacity = "0";
        readMoreIcon.style.width = "0";
        readMoreIcon.style.marginLeft = "0";
      }

      // Reset circle styles
      circle.style.width = originalWidth;
      circle.style.height = originalHeight;
      circle.style.borderRadius = originalBorderRadius;
      circle.style.paddingLeft = originalPadding;
      circle.style.paddingRight = originalPaddingRight;
      circle.style.visibility = originalVisibility;
    });
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const circle = circleRef.current;
    if (!circle) return;

    const RADIUS_THRESHOLD = 2; // pixels - circle accelerates when outside this radius
    const BASE_SPEED = 0.2; // Base speed when within radius
    const MAX_SPEED = 0.4; // Maximum speed when far away
    const ACCELERATION_RATE = 0.002; // How fast speed increases per ms outside radius

    const animate = (currentTime: number) => {
      const current = positionRef.current;
      const target = targetPositionRef.current;
      
      // Calculate distance to target
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const deltaTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;
      
      // Track time spent outside radius
      if (distance > RADIUS_THRESHOLD) {
        timeOutsideRadiusRef.current += deltaTime;
      } else {
        timeOutsideRadiusRef.current = 0; // Reset when within radius
      }
      
      // Calculate dynamic speed based on time outside radius
      // Speed increases the longer it's been away
      const speedMultiplier = Math.min(
        BASE_SPEED + (timeOutsideRadiusRef.current * ACCELERATION_RATE),
        MAX_SPEED
      );
      
      // Smoothly interpolate towards target with dynamic speed
      positionRef.current = {
        x: current.x + dx * speedMultiplier,
        y: current.y + dy * speedMultiplier,
      };

      circle.style.left = `${positionRef.current.x}px`;
      circle.style.top = `${positionRef.current.y}px`;

      // Update blur based on pointer state (only when circle — pill stays sharp)
      const showPillForBlur =
        isHoveringPfpRef.current || isHoveringCaseStudyRef.current || isHoveringReadMoreRef.current;
      circle.style.filter = !showPillForBlur && isPointerRef.current ? "blur(8px)" : "blur(0px)";

      // Update pill state - only measure on state change
      const dot = dotRef.current;
      const text = textRef.current;
      const caseStudyIcon = caseStudyIconRef.current;
      const readMoreIcon = readMoreIconRef.current;
      const isHoveringPfp = isHoveringPfpRef.current;
      const isHoveringCaseStudy = isHoveringCaseStudyRef.current;
      const isHoveringReadMore = isHoveringReadMoreRef.current;
      const showPill = isHoveringPfp || isHoveringCaseStudy || isHoveringReadMore;

      // Width fallback if pre-measurement didn't run
      if (
        showPill &&
        text &&
        (pillWidthRef.current === null ||
          pillWidthCaseStudyRef.current === null ||
          pillWidthReadMoreRef.current === null)
      ) {
        const originalWidth = circle.style.width;
        const originalHeight = circle.style.height;
        const originalPadding = circle.style.paddingLeft;
        const originalBorderRadius = circle.style.borderRadius;
        const originalVisibility = circle.style.visibility;
        const originalText = text.textContent;

        circle.style.width = "auto";
        circle.style.height = "25px";
        circle.style.borderRadius = "9999px";
        circle.style.paddingLeft = "14px";
        circle.style.paddingRight = "14px";
        circle.style.visibility = "hidden";
        if (pillWidthRef.current === null) {
          text.textContent = "AVAILABLE FOR WORK";
          pillWidthRef.current = circle.offsetWidth;
        }
        if (pillWidthCaseStudyRef.current === null) {
          text.textContent = "CASE STUDY";
          if (dot) {
            dot.style.width = "0";
            dot.style.minWidth = "0";
            dot.style.overflow = "hidden";
            dot.style.marginRight = "0";
          }
          if (caseStudyIcon) {
            caseStudyIcon.style.opacity = "1";
            caseStudyIcon.style.width = "";
            caseStudyIcon.style.marginLeft = "6px";
          }
          if (readMoreIcon) {
            readMoreIcon.style.opacity = "0";
            readMoreIcon.style.width = "0";
            readMoreIcon.style.marginLeft = "0";
          }
          if (contentWrapperRef.current) contentWrapperRef.current.style.gap = "0";
          pillWidthCaseStudyRef.current = circle.offsetWidth;
          text.textContent = originalText;
          if (dot) {
            dot.style.width = "";
            dot.style.minWidth = "";
            dot.style.overflow = "";
            dot.style.marginRight = "";
          }
          if (contentWrapperRef.current) contentWrapperRef.current.style.gap = "";
        }
        if (pillWidthReadMoreRef.current === null) {
          text.textContent = "READ MORE";
          if (dot) {
            dot.style.width = "0";
            dot.style.minWidth = "0";
            dot.style.overflow = "hidden";
            dot.style.marginRight = "0";
          }
          if (caseStudyIcon) {
            caseStudyIcon.style.opacity = "0";
            caseStudyIcon.style.width = "0";
            caseStudyIcon.style.marginLeft = "0";
          }
          if (readMoreIcon) {
            readMoreIcon.style.opacity = "1";
            readMoreIcon.style.width = "";
            readMoreIcon.style.marginLeft = "6px";
          }
          if (contentWrapperRef.current) contentWrapperRef.current.style.gap = "0";
          pillWidthReadMoreRef.current = circle.offsetWidth;
          text.textContent = originalText;
          if (dot) {
            dot.style.width = "";
            dot.style.minWidth = "";
            dot.style.overflow = "";
            dot.style.marginRight = "";
          }
          if (contentWrapperRef.current) contentWrapperRef.current.style.gap = "";
        }

        circle.style.width = originalWidth;
        circle.style.height = originalHeight;
        circle.style.borderRadius = originalBorderRadius;
        circle.style.paddingLeft = originalPadding;
        circle.style.visibility = originalVisibility;
      }

      const pillBg = pillBgRef.current;
      if (showPill) {
        // Transform to pill: size/position on circle, background on separate layer so text stays on top
        const isReadMore = isHoveringReadMore;
        const isCaseStudy = isHoveringCaseStudy && !isReadMore;
        const pillWidth = isReadMore
          ? (pillWidthReadMoreRef.current !== null ? pillWidthReadMoreRef.current + 16 : undefined)
          : isCaseStudy
          ? (pillWidthCaseStudyRef.current !== null ? pillWidthCaseStudyRef.current + 16 : undefined)
          : (pillWidthRef.current !== null ? pillWidthRef.current + 16 : undefined);
        circle.style.width = pillWidth !== undefined ? `${pillWidth}px` : "auto";
        circle.style.height = "25px";
        circle.style.borderRadius = "9999px";
        circle.style.paddingLeft = "14px";
        circle.style.paddingRight = "14px";
        circle.style.mixBlendMode = "normal";
        circle.style.backgroundColor = "rgba(60, 60, 60, 0.8)";
        circle.style.backdropFilter = "blur(10px)";
        circle.style.setProperty("-webkit-backdrop-filter", "blur(10px)");
        circle.style.overflow = "visible";
        if (pillBg) pillBg.style.display = "none";
        if (text) {
          text.textContent = isReadMore
            ? "READ MORE"
            : isCaseStudy
            ? "CASE STUDY"
            : "AVAILABLE FOR WORK";
          text.style.opacity = "1";
          text.style.visibility = "visible";
          text.style.color = "white";
        }
        const contentWrapper = contentWrapperRef.current;
        if (dot) {
          if (isCaseStudy || isReadMore) {
            dot.style.opacity = "0";
            dot.style.width = "0";
            dot.style.minWidth = "0";
            dot.style.overflow = "hidden";
            dot.style.marginRight = "0";
          } else {
            dot.style.opacity = "1";
            dot.style.width = "";
            dot.style.minWidth = "";
            dot.style.overflow = "";
            dot.style.marginRight = "8px";
          }
        }
        if (contentWrapper) contentWrapper.style.gap = isCaseStudy || isReadMore ? "0" : "";
        if (caseStudyIcon) {
          caseStudyIcon.style.opacity = isCaseStudy ? "1" : "0";
          caseStudyIcon.style.width = isCaseStudy ? "" : "0";
          caseStudyIcon.style.marginLeft = isCaseStudy ? "6px" : "0";
        }
        if (readMoreIcon) {
          readMoreIcon.style.opacity = isReadMore ? "1" : "0";
          readMoreIcon.style.width = isReadMore ? "" : "0";
          readMoreIcon.style.marginLeft = isReadMore ? "6px" : "0";
        }
      } else {
        // Transform back to circle
        circle.style.width = "16px";
        circle.style.height = "16px";
        circle.style.borderRadius = "50%";
        circle.style.paddingLeft = "0px";
        circle.style.paddingRight = "0px";
        circle.style.mixBlendMode = "difference";
        circle.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        circle.style.backdropFilter = "none";
        circle.style.setProperty("-webkit-backdrop-filter", "none");
        circle.style.boxShadow = "none";
        circle.style.overflow = "hidden";
        if (pillBg) pillBg.style.display = "none";
        if (dot) {
          dot.style.opacity = "0";
          dot.style.width = "";
          dot.style.minWidth = "";
          dot.style.overflow = "";
          dot.style.marginRight = "";
        }
        if (contentWrapperRef.current) contentWrapperRef.current.style.gap = "";
        if (text) {
          text.textContent = "AVAILABLE FOR WORK";
          text.style.opacity = "0";
        }
        if (caseStudyIcon) {
          caseStudyIcon.style.opacity = "0";
          caseStudyIcon.style.width = "0";
          caseStudyIcon.style.marginLeft = "0";
        }
        if (readMoreIcon) {
          readMoreIcon.style.opacity = "0";
          readMoreIcon.style.width = "0";
          readMoreIcon.style.marginLeft = "0";
        }
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetPositionRef.current = { x: e.clientX, y: e.clientY };
      
      // Check cursor type and profile picture hover
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element) {
        const computedStyle = window.getComputedStyle(element);
        const cursor = computedStyle.cursor;
        isPointerRef.current = cursor === "pointer" || cursor === "grab" || cursor === "grabbing";
        
        // Check if hovering over profile picture
        const pfpElement = element.closest('[data-cursor-pfp="true"]');
        isHoveringPfpRef.current = !!pfpElement;
        // Check if hovering over case study link
        const caseStudyElement = element.closest('[data-cursor-case-study="true"]');
        isHoveringCaseStudyRef.current = !!caseStudyElement;
        // Check if hovering over testimonial/recommendation preview card
        const readMoreElement = element.closest('[data-cursor-read-more="true"]');
        isHoveringReadMoreRef.current = !!readMoreElement;
      } else {
        isPointerRef.current = false;
        isHoveringPfpRef.current = false;
        isHoveringCaseStudyRef.current = false;
        isHoveringReadMoreRef.current = false;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Start animation
    lastFrameTimeRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isMobile]);

  // Don't render on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <div
      ref={circleRef}
      className="fixed pointer-events-none z-9999 flex items-center justify-center gap-2"
      style={{
        left: "0px",
        top: "0px",
        transform: "translate(-50%, -50%)",
        width: "16px",
        height: "16px",
        borderRadius: "50%",
        paddingLeft: "0px",
        paddingRight: "0px",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        mixBlendMode: "difference",
        transition: "width 0.2s ease-out, height 0.2s ease-out, border-radius 0.2s ease-out, padding-left 0.2s ease-out, padding-right 0.2s ease-out, filter 0.2s ease-out, mix-blend-mode 0.2s ease-out, background-color 0.2s ease-out, box-shadow 0.2s ease-out, backdrop-filter 0.2s ease-out, -webkit-backdrop-filter 0.2s ease-out",
        willChange: "transform, width, height",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {/* Pill background layer (behind text when expanded) */}
      <div
        ref={pillBgRef}
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{
          display: "none",
          borderRadius: "inherit",
        }}
        aria-hidden
      />
      <div
        ref={contentWrapperRef}
        className="relative z-10 flex items-center justify-center gap-0"
      >
        {/* Green dot */}
        <div
          ref={dotRef}
          className="w-2 h-2 rounded-full bg-[#18BF5F] shrink-0"
          style={{
            opacity: 0,
            transition: "opacity 0.2s ease-out",
            marginRight: "0",
          }}
        />
        {/* Text */}
        <span
          ref={textRef}
          className="relative z-10 text-xs font-medium font-mono text-white"
          style={{
            opacity: 0,
            transition: "opacity 0.2s ease-out",
          }}
        >
          AVAILABLE FOR WORK
        </span>
        <span
          ref={readMoreIconRef}
          className="inline-flex items-center justify-center text-white shrink-0"
          style={{
            opacity: 0,
            width: "0",
            marginLeft: "0",
            overflow: "hidden",
            transition: "opacity 0.2s ease-out, width 0.2s ease-out, margin-left 0.2s ease-out",
          }}
          aria-hidden
        >
          <ArrowRight className="w-3 h-3" />
        </span>
        <span
          ref={caseStudyIconRef}
          className="inline-flex items-center justify-center text-white shrink-0"
          style={{
            opacity: 0,
            width: "0",
            marginLeft: "0",
            overflow: "hidden",
            transition: "opacity 0.2s ease-out, width 0.2s ease-out, margin-left 0.2s ease-out",
          }}
          aria-hidden
        >
          <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

