"use client";

import { useEffect, useRef, useState } from "react";

export function CursorFollower() {
  const [isMobile, setIsMobile] = useState(true); // Start as true to avoid flash on mobile
  const circleRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const isPointerRef = useRef(false);
  const isHoveringPfpRef = useRef(false);
  const wasHoveringPfpRef = useRef(false);
  const pillWidthRef = useRef<number | null>(null);
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

  // Pre-measure pill width on mount to avoid snap on first hover
  useEffect(() => {
    if (isMobile) return;
    const circle = circleRef.current;
    const text = textRef.current;
    if (!circle || !text || pillWidthRef.current !== null) return;

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (!circle || !text || pillWidthRef.current !== null) return;
      
      // Measure pill width once on mount
      const originalWidth = circle.style.width;
      const originalHeight = circle.style.height;
      const originalPadding = circle.style.paddingLeft;
      const originalPaddingRight = circle.style.paddingRight;
      const originalBorderRadius = circle.style.borderRadius;
      const originalVisibility = circle.style.visibility;
      
      circle.style.width = "auto";
      circle.style.height = "25px";
      circle.style.borderRadius = "9999px";
      circle.style.paddingLeft = "12px";
      circle.style.paddingRight = "12px";
      circle.style.visibility = "hidden";
      
      pillWidthRef.current = circle.offsetWidth;
      
      // Reset styles
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

      // Update blur based on pointer state
      circle.style.filter = isPointerRef.current ? "blur(8px)" : "blur(0px)";

      // Update pill state - only measure on state change
      const dot = dotRef.current;
      const text = textRef.current;
      const isHovering = isHoveringPfpRef.current;
      const wasHovering = wasHoveringPfpRef.current;
      
      // Width should already be measured on mount, but fallback if needed
      if (isHovering && !wasHovering && text && pillWidthRef.current === null) {
        // Fallback measurement if pre-measurement didn't work
        const originalWidth = circle.style.width;
        const originalHeight = circle.style.height;
        const originalPadding = circle.style.paddingLeft;
        const originalBorderRadius = circle.style.borderRadius;
        const originalVisibility = circle.style.visibility;
        
        circle.style.width = "auto";
        circle.style.height = "25px";
        circle.style.borderRadius = "9999px";
        circle.style.paddingLeft = "12px";
        circle.style.paddingRight = "12px";
        circle.style.visibility = "hidden";
        pillWidthRef.current = circle.offsetWidth;
        
        // Reset for smooth transition
        circle.style.width = originalWidth;
        circle.style.height = originalHeight;
        circle.style.borderRadius = originalBorderRadius;
        circle.style.paddingLeft = originalPadding;
        circle.style.visibility = originalVisibility;
      }
      
      if (isHovering) {
        // Transform to pill
        circle.style.width = pillWidthRef.current !== null ? `${pillWidthRef.current + 16}px` : "auto";
        circle.style.height = "25px";
        circle.style.borderRadius = "9999px";
        circle.style.paddingLeft = "12px";
        circle.style.paddingRight = "12px";
        circle.style.mixBlendMode = "normal"; // Remove blend mode for pill
        circle.style.backgroundColor = "rgba(60, 60, 60, 0.8)"; // Dark background for text visibility
        circle.style.backdropFilter = "blur(10px)"; // Add backdrop blur
        circle.style.setProperty("-webkit-backdrop-filter", "blur(10px)"); // Safari support
        if (dot) dot.style.opacity = "1";
        if (text) text.style.opacity = "1";
      } else {
        // Transform back to circle
        circle.style.width = "16px";
        circle.style.height = "16px";
        circle.style.borderRadius = "50%";
        circle.style.paddingLeft = "0px";
        circle.style.paddingRight = "0px";
        circle.style.mixBlendMode = "difference"; // Restore blend mode for circle
        circle.style.backgroundColor = "rgba(255, 255, 255, 0.2)"; // Restore original background
        circle.style.backdropFilter = "none"; // Remove backdrop blur
        circle.style.setProperty("-webkit-backdrop-filter", "none"); // Remove Safari backdrop blur
        circle.style.boxShadow = "none"; // Remove shadow
        if (dot) dot.style.opacity = "0";
        if (text) text.style.opacity = "0";
      }
      
      wasHoveringPfpRef.current = isHovering;

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
      } else {
        isPointerRef.current = false;
        isHoveringPfpRef.current = false;
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
        className="text-xs font-medium font-mono text-white"
        style={{
          opacity: 0,
          transition: "opacity 0.2s ease-out",
        }}
      >
        AVAILABLE FOR WORK
      </span>
    </div>
  );
}

