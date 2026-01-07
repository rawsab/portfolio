"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue } from "framer-motion";

interface Logo {
  name: string;
  src: string;
  alt: string;
}

interface LogoLoopProps {
  logos: Logo[];
  speed?: number;
}

export function LogoLoop({ logos, speed = 10 }: LogoLoopProps) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Duplicate logos multiple times to create seamless loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  // Calculate the width of one set of logos (approximate)
  const logoWidth = 64; // 40px width + 24px gap
  const totalWidth = logos.length * logoWidth;

  // Calculate pixels per second based on speed (duration in seconds)
  const pixelsPerSecond = useMemo(() => totalWidth / speed, [totalWidth, speed]);
  const currentSpeedRef = useRef<number>(pixelsPerSecond);

  // Update current speed when pixelsPerSecond changes
  useEffect(() => {
    currentSpeedRef.current = pixelsPerSecond;
  }, [pixelsPerSecond]);

  useEffect(() => {
    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = currentTime;

      // Smoothly transition speed towards target
      const targetSpeed = isHovered ? 0 : pixelsPerSecond;
      const speedDiff = targetSpeed - currentSpeedRef.current;
      currentSpeedRef.current += speedDiff * 0.08; // Smooth interpolation factor (slower acceleration/deceleration)

      // Update position based on current speed
      const currentX = x.get();
      const newX = currentX - (currentSpeedRef.current * deltaTime);
      
      // Loop back when we've moved one set width
      if (newX <= -totalWidth) {
        x.set(newX + totalWidth);
      } else {
        x.set(newX);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered, pixelsPerSecond, totalWidth, x]);

  return (
    <div
      className="relative w-full overflow-hidden py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left gradient fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, #0D0D0D 0%, rgba(13, 13, 13, 0) 100%)",
        }}
      />
      {/* Right gradient fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to left, #0D0D0D 0%, rgba(13, 13, 13, 0) 100%)",
        }}
      />
      <motion.div
        className="flex gap-6 items-center"
        style={{ x }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="shrink-0 flex items-center justify-center w-10 h-10 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              width={48}
              height={48}
              className="object-contain w-full h-full"
              style={
                logo.name === "Flask"
                  ? {
                      filter: "brightness(0) invert(1)",
                    }
                  : logo.name === "Django"
                  ? {
                      filter: "brightness(1.5)",
                    }
                  : undefined
              }
              loading="lazy"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

