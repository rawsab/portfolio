"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { testimonials } from "@/data/testimonials";

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goToNext = useCallback(() => {
    setDirection("forward");
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    // Reset auto-advance timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const goToPrevious = useCallback(() => {
    setDirection("backward");
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    // Reset auto-advance timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex((prev) => {
      setDirection(index > prev ? "forward" : "backward");
      return index;
    });
    // Reset auto-advance timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isHovered && testimonials.length > 0) {
      intervalRef.current = setInterval(() => {
        goToNext();
      }, 5000); // Auto-advance every 5 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, goToNext]);

  const currentTestimonial = testimonials[currentIndex];

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="pt-6 pb-10">
      <div className="max-w-2xl mx-auto w-full px-8 space-y-6">
        <div>
          <h2 className="text-xs font-medium font-mono text-[#686868] uppercase tracking-wider pb-0 -mb-2 -mt-2">
            RECOMMENDATIONS
          </h2>
        </div>

        <div className="relative">
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4 relative overflow-hidden min-h-[120px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              setHoveredSide(null);
            }}
          >
            {/* Left Clickable Area */}
            <button
              onClick={goToPrevious}
              onMouseEnter={() => setHoveredSide("left")}
              onMouseLeave={() => setHoveredSide(null)}
              className="absolute left-0 top-0 bottom-0 w-12 z-10 cursor-pointer"
              aria-label="Previous testimonial"
            />

            {/* Right Clickable Area */}
            <button
              onClick={goToNext}
              onMouseEnter={() => setHoveredSide("right")}
              onMouseLeave={() => setHoveredSide(null)}
              className="absolute right-0 top-0 bottom-0 w-12 z-10 cursor-pointer"
              aria-label="Next testimonial"
            />

            {/* Left Arrow */}
            <button
              onClick={goToPrevious}
              className={`absolute left-1 top-1/2 -translate-y-1/2 z-20 cursor-pointer transition-colors ${
                hoveredSide === "left" ? "text-zinc-300" : "text-zinc-400"
              }`}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={goToNext}
              className={`absolute right-1 top-1/2 -translate-y-1/2 z-20 cursor-pointer transition-colors ${
                hoveredSide === "right" ? "text-zinc-300" : "text-zinc-400"
              }`}
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={({
                  opacity: 0,
                  x: direction === "forward" ? 32 : -32,
                })}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: 0,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="space-y-4 px-6"
              >
                <p className="text-[0.95rem] text-zinc-400 leading-relaxed mt-0">
                  {currentTestimonial.quote}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="relative">
                    <Image
                      src={currentTestimonial.author.profileImage}
                      alt={currentTestimonial.author.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {currentTestimonial.author.companyIcon && (
                      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1">
                        <Image
                          src={currentTestimonial.author.companyIcon}
                          alt={currentTestimonial.author.company}
                          width={16}
                          height={16}
                          className="h-5 w-5 rounded-md border-3 border-zinc-900"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 ml-1 mt-0.5">
                    <div className="text-sm text-zinc-300 font-medium">
                      {currentTestimonial.author.name}
                    </div>
                    <div className="mt-1">
                      <div className="text-sm text-zinc-500 leading-tight">
                        {currentTestimonial.author.title} at{" "}
                        <span className="text-zinc-500">{currentTestimonial.author.company}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 -mt-1">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`cursor-pointer transition-all ${
                index === currentIndex
                  ? "w-4 bg-zinc-400"
                  : "w-1.5 bg-zinc-700 hover:bg-zinc-600"
              } h-1.5 rounded-full`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Archived Portfolio Link */}
        <div className="pt-6 flex justify-center text-center px-4">
          <a
            href="http://archive.rawsab.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline text-sm text-zinc-500 hover:text-white hover:underline transition-all duration-200"
          >
            View my archived portfolio (with case studies + project details).
            <ArrowUpRight className="w-4 h-4 inline-block ml-1.5 translate-y-[3px] align-baseline transition-transform duration-200 group-hover:-translate-y-[1px] group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
