"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Box, Wrench, ChartSpline, ChevronRight } from "lucide-react";
import { languages, frameworks, tools, libraries } from "@/data/technologies";

function TechnologyGrid({
  technologies,
  hoveredLogo,
  setHoveredLogo,
}: {
  technologies: typeof languages;
  hoveredLogo: string | null;
  setHoveredLogo: (name: string | null) => void;
}) {
  return (
    <div className={`grid grid-cols-6 sm:grid-cols-12 md:grid-cols-12 gap-3 transition-all duration-200 ${hoveredLogo ? "pb-6" : "pb-2"}`}>
      {technologies.map((tech) => (
        <div
          key={tech.name}
          className="relative flex items-center justify-center cursor-pointer"
          onMouseEnter={() => setHoveredLogo(tech.name)}
          onMouseLeave={() => setHoveredLogo(null)}
        >
          <div className="flex items-center justify-center w-8 h-8 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
            <img
              src={tech.src}
              alt={tech.alt}
              width={32}
              height={32}
              className="object-contain w-full h-full"
              style={
                tech.name === "Flask" || tech.name === "Scikit-learn" || tech.name === "AWS" || tech.name === "MLFlow"
                  ? {
                      filter: "brightness(0) invert(1)",
                    }
                  : tech.name === "Django" || tech.name === "Bash"
                  ? {
                      filter: "brightness(1.5)",
                    }
                  : tech.name === "Pandas"
                  ? {
                      filter: "brightness(2.5) contrast(0.7)",
                    }
                  : undefined
              }
              loading="lazy"
            />
          </div>
          <AnimatePresence>
            {hoveredLogo === tech.name && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs text-[#8F8F8F] text-center whitespace-nowrap"
              >
                {tech.name}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function TechnologiesSection() {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [clickedSection, setClickedSection] = useState<string | null>(null);
  const [hoveredLogo, setHoveredLogo] = useState<string | null>(null);

  // Check if device supports touch (only check once on mount)
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - some browsers have this
      navigator.msMaxTouchPoints > 0);

  const sections = [
    { id: "languages", label: "Programming Languages", technologies: languages, icon: Code },
    { id: "frameworks", label: "Software Frameworks", technologies: frameworks, icon: Box },
    { id: "tools", label: "Development Tools", technologies: tools, icon: Wrench },
    { id: "libraries", label: "Machine Learning Libraries", technologies: libraries, icon: ChartSpline },
  ];

  const handleSectionClick = (sectionId: string) => {
    // Only handle clicks on touch devices
    if (!isTouchDevice) {
      return;
    }

    if (clickedSection === sectionId) {
      // If clicking the same section, close it
      setClickedSection(null);
    } else {
      // Otherwise, open the clicked section
      setClickedSection(sectionId);
    }
  };

  // On mobile/tablet, use clickedSection; on desktop, use hoveredSection
  const activeSection = isTouchDevice ? (clickedSection || hoveredSection) : hoveredSection;

  return (
    <section className="pt-0 pb-6">
      <div className="max-w-2xl mx-auto w-full px-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xs font-medium font-mono text-[#686868] uppercase tracking-wider pb-1">
            TECHNOLOGIES
          </h2>
          <p className="text-base text-[#8F8F8F] leading-normal -mb-2">
          I&apos;ve worked across a modern and versatile tech stack, using these technologies to build scalable, production-ready systems and personal projects:
          </p>
        </div>
        <div className="space-y-2">
          {sections.map((section) => (
            <div key={section.id}>
              <div
                className={`flex items-center justify-between gap-4 text-md cursor-pointer transition-colors duration-200 py-1 ${
                  activeSection === section.id ? "text-white" : "text-zinc-300 hover:text-white"
                }`}
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
                onClick={() => handleSectionClick(section.id)}
              >
                <div className="flex items-center gap-2">
                  <section.icon className="w-4 h-4 text-zinc-500" />
                  <div className="flex items-center gap-1.5">
                    {section.label}
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeSection === section.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded bg-zinc-800 text-xs font-mono transition-colors duration-200 ${
                    activeSection === section.id ? "text-white" : "text-[#a5a5a5]"
                  }`}
                >
                  {section.technologies.length}
                </span>
              </div>
              <AnimatePresence>
                {activeSection === section.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                    onMouseEnter={() => setHoveredSection(section.id)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <div className="pt-3">
                      <TechnologyGrid
                        technologies={section.technologies}
                        hoveredLogo={hoveredLogo}
                        setHoveredLogo={setHoveredLogo}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
