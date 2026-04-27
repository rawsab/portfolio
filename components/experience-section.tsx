"use client";

import Image from "next/image";
import { experiences } from "@/data/experience";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Divider } from "./divider";

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function ExperienceSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isArrowHovered, setIsArrowHovered] = useState(false);
  const [highlightPos, setHighlightPos] = useState<HighlightPosition | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const visibleCount = 3;
  const remainingCount = experiences.length - visibleCount;

  const updateHighlightPosition = (index: number) => {
    const element = itemRefs.current[index];
    const container = containerRef.current;
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      setHighlightPos({
        top: elementRect.top - containerRect.top - 8,
        left: elementRect.left - containerRect.left - 12,
        width: elementRect.width + 24,
        height: elementRect.height + 12,
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
      const syncHighlight = () => {
        requestAnimationFrame(() => {
          updateHighlightPosition(hoveredIndex);
        });
      };

      syncHighlight();
      const timeouts = [60, 140, 220].map((delay) =>
        setTimeout(syncHighlight, delay)
      );

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [hoveredIndex, isExpanded]);

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => {
      if (prev && hoveredIndex !== null && hoveredIndex >= visibleCount) {
        setHoveredIndex(null);
        setHighlightPos(null);
      }
      return !prev;
    });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setHighlightPos(null);
  };

  return (
    <section className="pt-6 pb-0">
      <div className="max-w-site mx-auto w-full px-8 space-y-6">
      <Divider label="experience" className="mb-8" />
        <div className="space-y-2">
          <p className="text-base text-[#8F8F8F] leading-normal">
            Throughout my past internships, I&apos;ve worked on secure backend systems, real-time data flows, and AI-integrated features. Here&apos;s a brief overview:
          </p>
        </div>

        <div ref={containerRef} className="relative space-y-2 overflow-visible">
          {experiences.slice(0, visibleCount).map((exp, index) => (
            <div
              key={`${exp.period}-${exp.company}-${index}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              className="flex flex-col gap-4 sm:flex-row sm:gap-8 relative z-10"
            >
              <div className="text-sm font-mono tracking-tight text-zinc-600 sm:w-28 shrink-0 mt-1 -mb-2">
                {exp.period}
              </div>
              <div className="flex-1 space-y-2 mb-2">
                <div className="text-base text-zinc-300">
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
                <AnimatePresence>
                  {hoveredIndex === index && exp.technologies.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2 pt-1">
                        {exp.technologies.map((tech) => (
                          <span
                            key={`${exp.company}-${tech}`}
                            className="inline-flex items-center rounded-full border border-zinc-700/70 bg-zinc-800/60 px-2.5 py-1 text-xs font-mono text-zinc-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden space-y-2"
              >
                {experiences.slice(visibleCount).map((exp, index) => {
                  const actualIndex = index + visibleCount;
                  return (
                    <div
                      key={`${exp.period}-${exp.company}-${actualIndex}`}
                      ref={(el) => {
                        itemRefs.current[actualIndex] = el;
                      }}
                      onMouseEnter={() => handleMouseEnter(actualIndex)}
                      onMouseLeave={handleMouseLeave}
                      className="flex flex-col gap-4 sm:flex-row sm:gap-8 relative z-10"
                    >
                      <div className="text-sm font-mono tracking-tight text-zinc-600 sm:w-28 shrink-0 mt-1 -mb-2">
                        {exp.period}
                      </div>
                      <div className="flex-1 space-y-2 mb-2">
                        <div className="text-base text-zinc-300">
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
                        <AnimatePresence>
                          {hoveredIndex === actualIndex && exp.technologies.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-2 pt-1">
                                {exp.technologies.map((tech) => (
                                  <span
                                    key={`${exp.company}-${tech}`}
                                    className="inline-flex items-center rounded-full border border-zinc-700/70 bg-zinc-800/60 px-2.5 py-1 text-xs font-mono text-zinc-300"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {experiences.length > visibleCount && (
            <div className="relative py-2">
              <button
                onClick={handleToggleExpanded}
                onMouseEnter={() => setIsArrowHovered(true)}
                onMouseLeave={() => setIsArrowHovered(false)}
                className="flex items-center justify-center w-full group cursor-pointer"
              >
                <div className="relative flex flex-col items-center">
                  {isExpanded ? (
                    <ChevronUp
                      className={`w-5 h-5 transition-colors ${
                        isArrowHovered ? "text-white" : "text-zinc-500"
                      }`}
                    />
                  ) : (
                    <ChevronDown
                      className={`w-5 h-5 transition-colors ${
                        isArrowHovered ? "text-white" : "text-zinc-500"
                      }`}
                    />
                  )}
                  <AnimatePresence>
                    {isArrowHovered && (
                      <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-6 text-xs text-zinc-500 whitespace-nowrap shadow-xl shadow-black/90 pointer-events-none"
                      >
                        {isExpanded ? (
                          "Show less"
                        ) : (
                          <>
                            Show <span className="text-zinc-300">{remainingCount}</span> more
                          </>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none hidden sm:block">
            <AnimatePresence>
              {hoveredIndex !== null && highlightPos && (
                <motion.div
                  key={hoveredIndex}
                  className="absolute rounded-lg bg-zinc-800/30 z-0"
                  initial={{
                    opacity: 0,
                    top: highlightPos.top,
                    left: highlightPos.left,
                    width: highlightPos.width,
                    height: highlightPos.height,
                  }}
                  animate={{
                    opacity: 1,
                    top: highlightPos.top,
                    left: highlightPos.left,
                    width: highlightPos.width,
                    height: highlightPos.height,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    opacity: {
                      duration: 0.2,
                      ease: "easeInOut",
                    },
                    top: {
                      duration: 0,
                    },
                    left: {
                      duration: 0,
                    },
                    width: {
                      duration: 0,
                    },
                    height: {
                      duration: 0,
                    },
                  }}
                  style={{
                    willChange: "opacity",
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

