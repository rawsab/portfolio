"use client";

import { projects } from "@/data/projects";
import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Star, ChevronDown, ChevronUp } from "lucide-react";

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function ProjectsSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isArrowHovered, setIsArrowHovered] = useState(false);
  const [highlightPos, setHighlightPos] = useState<HighlightPosition | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sort projects: featured first, then by date (most recent first)
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      // Featured projects come first (default to false if undefined)
      const aFeatured = a.featured ?? false;
      const bFeatured = b.featured ?? false;
      if (aFeatured && !bFeatured) return -1;
      if (!aFeatured && bFeatured) return 1;
      
      // If both have same featured status, sort by date
      // Parse date strings (format: "MON YYYY")
      const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date(0);
        const months: { [key: string]: number } = {
          JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
          JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
        };
        const [month, year] = dateStr.split(' ');
        return new Date(parseInt(year), months[month] || 0);
      };
      
      const dateA = parseDate(a.date || '');
      const dateB = parseDate(b.date || '');
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }, []);

  const remainingCount = sortedProjects.length - 5;

  const updateHighlightPosition = (index: number) => {
    const element = itemRefs.current[index];
    const container = containerRef.current;
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      // Get the full height including description if expanded
      const fullHeight = element.scrollHeight;
      setHighlightPos({
        top: elementRect.top - containerRect.top - 4,
        left: elementRect.left - containerRect.left - 12,
        width: elementRect.width + 24,
        height: fullHeight + 4,
      });
    }
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    requestAnimationFrame(() => {
      updateHighlightPosition(index);
    });
  };

  useEffect(() => {
    if (hoveredIndex !== null) {
      // Update immediately
      requestAnimationFrame(() => {
        updateHighlightPosition(hoveredIndex);
      });

      // Update during description expansion (animation is 200ms)
      const updates = [50, 100, 150, 220]; // Multiple updates during expansion
      const timeouts = updates.map((delay) =>
        setTimeout(() => {
          requestAnimationFrame(() => {
            updateHighlightPosition(hoveredIndex);
          });
        }, delay)
      );

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [hoveredIndex, isExpanded]);

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setHighlightPos(null);
  };

  return (
    <section className="py-6">
      <div className="max-w-2xl mx-auto w-full px-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xs font-medium font-mono text-[#686868] uppercase tracking-wider pb-2 -mb-6">
            PROJECTS
          </h2>
          {/* <p className="text-base text-[#8F8F8F] leading-normal">
            Here are some of the personal projects I&apos;ve worked on. Hover over a project to see more details, and click to view the source code.
          </p> */}
        </div>

        <div ref={containerRef} className="space-y-0 relative overflow-visible">
          {/* Always visible projects (first 5) */}
          {sortedProjects.slice(0, 5).map((project, index) => (
            <div
              key={`${project.name}-${index}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="relative z-10"
            >
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                className="block"
              >
                <div className="flex items-center justify-between py-2 cursor-pointer group gap-4">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {(project.featured ?? false) && (
                      <Star className="w-4 h-4 text-zinc-600 fill-zinc-600 shrink-0" />
                    )}
                    <span
                      className={`text-base text-white transition-all ${
                        hoveredIndex === index ? "underline" : ""
                      }`}
                    >
                      {project.name.includes(" - ") ? (
                        <>
                          {project.name.split(" - ")[0]}
                          <span className="text-zinc-500 hidden sm:inline"> - {project.name.split(" - ").slice(1).join(" - ")}</span>
                        </>
                      ) : (
                        project.name
                      )}
                    </span>
                  </div>
                  {project.date && (
                    <div className="flex items-center gap-1.5 text-sm text-zinc-500 font-mono shrink-0 whitespace-nowrap">
                      <Calendar className="w-4 h-4" />
                      <span>{project.date}</span>
                    </div>
                  )}
                </div>
              </a>

              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-3 pt-1">
                      <p className="text-sm text-zinc-500 leading-normal">
                        {project.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Additional projects that expand/collapse */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                {sortedProjects.slice(5).map((project, index) => {
                  const actualIndex = index + 5;
                  return (
                    <div
                      key={`${project.name}-${actualIndex}`}
                      ref={(el) => {
                        itemRefs.current[actualIndex] = el;
                      }}
                      className="relative z-10"
                    >
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={() => handleMouseEnter(actualIndex)}
                        onMouseLeave={handleMouseLeave}
                        className="block"
                      >
                        <div className="flex items-center justify-between py-2 cursor-pointer group gap-4">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {(project.featured ?? false) && (
                              <Star className="w-4 h-4 text-zinc-600 fill-zinc-600 shrink-0" />
                            )}
                            <span
                              className={`text-base text-white transition-all ${
                                hoveredIndex === actualIndex ? "underline" : ""
                              }`}
                            >
                              {project.name.includes(" - ") ? (
                                <>
                                  {project.name.split(" - ")[0]}
                                  <span className="text-zinc-500 hidden sm:inline"> - {project.name.split(" - ").slice(1).join(" - ")}</span>
                                </>
                              ) : (
                                project.name
                              )}
                            </span>
                          </div>
                          {project.date && (
                            <div className="flex items-center gap-1.5 text-sm text-zinc-500 font-mono shrink-0 whitespace-nowrap">
                              <Calendar className="w-4 h-4" />
                              <span>{project.date}</span>
                            </div>
                          )}
                        </div>
                      </a>

                      <AnimatePresence>
                        {hoveredIndex === actualIndex && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pb-3 pt-1">
                              <p className="text-sm text-zinc-500 leading-normal">
                                {project.description}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expand/Collapse Arrow */}
          {sortedProjects.length > 5 && (
            <div className="relative py-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
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
                        className="absolute top-6 text-xs text-zinc-500 whitespace-nowrap pointer-events-none"
                      >
                        {isExpanded ? (
                          "Show less"
                        ) : (
                          <>
                            Show <span className="text-white">{remainingCount}</span> more
                          </>
                        )}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </div>
          )}

          {/* Highlight overlay */}
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

