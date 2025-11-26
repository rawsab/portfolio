"use client";

import Image from "next/image";
import { experiences } from "@/data/experience";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function ExperienceSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [highlightPos, setHighlightPos] = useState<HighlightPosition | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateHighlightPosition = (index: number) => {
    const element = itemRefs.current[index];
    const container = containerRef.current;
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      setHighlightPos({
        top: elementRect.top - containerRect.top - 12,
        left: elementRect.left - containerRect.left - 12,
        width: elementRect.width + 24,
        height: elementRect.height + 24,
      });
    }
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      updateHighlightPosition(index);
    });
  };

  // Update position when hoveredIndex changes
  useEffect(() => {
    if (hoveredIndex !== null) {
      requestAnimationFrame(() => {
        updateHighlightPosition(hoveredIndex);
      });
    }
  }, [hoveredIndex]);

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setHighlightPos(null);
  };

  return (
    <section className="py-6">
      <div className="max-w-2xl mx-auto w-full px-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xs font-medium font-mono text-[#686868] uppercase tracking-wider pb-1">
            EXPERIENCE
          </h2>
          <p className="text-base text-[#8F8F8F] leading-normal">
            Throughout my past internships, I&apos;ve worked on secure backend systems, real-time data flows, and AI-integrated features. Here&apos;s a brief overview:
          </p>
        </div>

        <div ref={containerRef} className="relative space-y-2 overflow-visible">
          {experiences.map((exp, index) => (
            <div
              key={`${exp.period}-${exp.company}-${index}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              className="flex flex-col gap-4 sm:flex-row sm:gap-8 relative z-10"
            >
              <div className="text-sm font-mono tracking-tight text-zinc-500 sm:w-32 shrink-0 mt-1">
                {exp.period}
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-base text-white">
                  {exp.role} at{" "}
                  <a
                    href={exp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 translate-y-1 cursor-pointer group"
                  >
                    <Image
                      src={exp.icon}
                      alt={exp.iconAlt}
                      width={16}
                      height={16}
                      className="inline h-4.5 w-4.5 -translate-y-0.5 ml-1"
                    />
                    <span className="text-white group-hover:underline">
                      {exp.company}
                    </span>
                  </a>
                </div>
                <p className="text-sm text-zinc-500 leading-normal">
                  {exp.description}
                </p>
              </div>
            </div>
          ))}

          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {hoveredIndex !== null && highlightPos && (
                <motion.div
                  key={hoveredIndex}
                  className="absolute rounded-lg bg-zinc-800/20 z-0"
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{
                    opacity: 1,
                    scaleY: 1,
                    top: highlightPos.top,
                    left: highlightPos.left,
                    width: highlightPos.width,
                    height: highlightPos.height,
                  }}
                  exit={{
                    opacity: 0,
                    scaleY: 0,
                    transition: {
                      duration: 0.2,
                      ease: "easeInOut",
                    },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  style={{
                    transformOrigin: "center",
                    willChange: "transform, opacity",
                  }}
                  layout={false}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

