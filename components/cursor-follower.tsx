"use client";

import { useEffect, useRef, useState } from "react";

export function CursorFollower() {
  const [isMobile, setIsMobile] = useState(true); // Start as true to avoid flash on mobile
  const circleRef = useRef<HTMLDivElement>(null);
  const pillBgRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const isPointerRef = useRef(false);
  const isHoveringPfpRef = useRef(false);
  const wasHoveringPfpRef = useRef(false);
  const isHoveringCaseStudyRef = useRef(false);
  const wasHoveringCaseStudyRef = useRef(false);
  const pillWidthRef = useRef<number | null>(null);
  const pillWidthCaseStudyRef = useRef<number | null>(null);
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

    setIsMobile(checkMobile());

    // Also check on resize
    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pre-measure pill widths on mount to avoid snap on first hover
  useEffect(() => {
    if (isMobile) return;
    const circle = circleRef.current;
    const text = textRef.current;
    const dot = dotRef.current;
    const contentWrapper = contentWrapperRef.current;
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
        circle.style.paddingLeft = "12px";
        circle.style.paddingRight = "12px";
        circle.style.visibility = "hidden";
        return circle.offsetWidth;
      };

      // Measure "AVAILABLE FOR WORK" pill (with dot)
      pillWidthRef.current = measurePill();

      // Measure "CASE STUDY" pill
      const originalText = text.textContent;
      text.textContent = "CASE STUDY";
      if (dot) {
        dot.style.width = "0";
        dot.style.minWidth = "0";
        dot.style.overflow = "hidden";
      }
      if (contentWrapper) contentWrapper.style.gap = "0";
      pillWidthCaseStudyRef.current = measurePill();
      text.textContent = originalText;
      if (dot) {
        dot.style.width = "";
        dot.style.minWidth = "";
        dot.style.overflow = "";
      }
      if (contentWrapper) contentWrapper.style.gap = "";

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
      const showPillForBlur = isHoveringPfpRef.current || isHoveringCaseStudyRef.current;
      circle.style.filter = !showPillForBlur && isPointerRef.current ? "blur(8px)" : "blur(0px)";

      // Update pill state - only measure on state change
      const dot = dotRef.current;
      const text = textRef.current;
      const isHoveringPfp = isHoveringPfpRef.current;
      const wasHoveringPfp = wasHoveringPfpRef.current;
      const isHoveringCaseStudy = isHoveringCaseStudyRef.current;
      const wasHoveringCaseStudy = wasHoveringCaseStudyRef.current;
      const showPill = isHoveringPfp || isHoveringCaseStudy;

      // Width fallback if pre-measurement didn't run
      if (showPill && text && (pillWidthRef.current === null || pillWidthCaseStudyRef.current === null)) {
        const originalWidth = circle.style.width;
        const originalHeight = circle.style.height;
        const originalPadding = circle.style.paddingLeft;
        const originalBorderRadius = circle.style.borderRadius;
        const originalVisibility = circle.style.visibility;
        const originalText = text.textContent;

        circle.style.width = "auto";
        circle.style.height = "25px";
        circle.style.borderRadius = "9999px";
        circle.style.paddingLeft = "12px";
        circle.style.paddingRight = "12px";
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
          }
          if (contentWrapperRef.current) contentWrapperRef.current.style.gap = "0";
          pillWidthCaseStudyRef.current = circle.offsetWidth;
          text.textContent = originalText;
          if (dot) {
            dot.style.width = "";
            dot.style.minWidth = "";
            dot.style.overflow = "";
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
        const isCaseStudy = isHoveringCaseStudy;
        const pillWidth = isCaseStudy
          ? (pillWidthCaseStudyRef.current !== null ? pillWidthCaseStudyRef.current + 16 : undefined)
          : (pillWidthRef.current !== null ? pillWidthRef.current + 16 : undefined);
        circle.style.width = pillWidth !== undefined ? `${pillWidth}px` : "auto";
        circle.style.height = "25px";
        circle.style.borderRadius = "9999px";
        circle.style.paddingLeft = "12px";
        circle.style.paddingRight = "12px";
        circle.style.mixBlendMode = "normal";
        circle.style.backgroundColor = "rgba(60, 60, 60, 0.8)";
        circle.style.backdropFilter = "blur(10px)";
        circle.style.setProperty("-webkit-backdrop-filter", "blur(10px)");
        circle.style.overflow = "visible";
        if (pillBg) pillBg.style.display = "none";
        if (text) {
          text.textContent = isCaseStudy ? "CASE STUDY" : "AVAILABLE FOR WORK";
          text.style.opacity = "1";
          text.style.visibility = "visible";
          text.style.color = "white";
        }
        const contentWrapper = contentWrapperRef.current;
        if (dot) {
          if (isCaseStudy) {
            dot.style.opacity = "0";
            dot.style.width = "0";
            dot.style.minWidth = "0";
            dot.style.overflow = "hidden";
          } else {
            dot.style.opacity = "1";
            dot.style.width = "";
            dot.style.minWidth = "";
            dot.style.overflow = "";
          }
        }
        if (contentWrapper) contentWrapper.style.gap = isCaseStudy ? "0" : "";
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
        }
        if (contentWrapperRef.current) contentWrapperRef.current.style.gap = "";
        if (text) {
          text.textContent = "AVAILABLE FOR WORK";
          text.style.opacity = "0";
        }
      }

      wasHoveringPfpRef.current = isHoveringPfp;
      wasHoveringCaseStudyRef.current = isHoveringCaseStudy;

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
        // Check if hovering over case study link (Patchly, Deenboard, Questporter, Revett)
        const caseStudyElement = element.closest('[data-cursor-case-study="true"]');
        isHoveringCaseStudyRef.current = !!caseStudyElement;
      } else {
        isPointerRef.current = false;
        isHoveringPfpRef.current = false;
        isHoveringCaseStudyRef.current = false;
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
      className="fixed pointer-events-none z-[9999] flex items-center justify-center gap-2"
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
        className="relative z-10 flex items-center justify-center gap-2"
      >
        {/* Green dot */}
        <div
          ref={dotRef}
          className="w-2 h-2 rounded-full bg-[#18BF5F] shrink-0"
          style={{
            opacity: 0,
            transition: "opacity 0.2s ease-out",
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
      </div>
    </div>
  );
}

