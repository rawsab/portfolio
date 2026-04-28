"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { Divider } from "./divider";

export function TestimonialsSection() {
  const MODAL_EXIT_MS = 50;
  const MODAL_RESIZE_MS = 250;
  const MODAL_ENTER_MS = 200;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [selectedTestimonialIndex, setSelectedTestimonialIndex] = useState<number | null>(null);
  const [isModalContentVisible, setIsModalContentVisible] = useState(true);
  const [isModalTransitioning, setIsModalTransitioning] = useState(false);
  const [modalContentHeight, setModalContentHeight] = useState<number | "auto">("auto");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const modalTimeoutsRef = useRef<number[]>([]);

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

  const clearModalTimeouts = useCallback(() => {
    modalTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    modalTimeoutsRef.current = [];
  }, []);

  const closeModal = useCallback(() => {
    clearModalTimeouts();
    setIsModalTransitioning(false);
    setIsModalContentVisible(true);
    setModalContentHeight("auto");
    setSelectedTestimonialIndex(null);
  }, [clearModalTimeouts]);

  const transitionModalToIndex = useCallback(
    (nextIndex: number, nextDirection: "forward" | "backward") => {
      if (selectedTestimonialIndex === null || isModalTransitioning) {
        return;
      }

      setDirection(nextDirection);
      setCurrentIndex(nextIndex);
      setIsModalTransitioning(true);

      const currentHeight = modalContentRef.current?.offsetHeight;
      setModalContentHeight(typeof currentHeight === "number" ? currentHeight : "auto");
      setIsModalContentVisible(false);
      clearModalTimeouts();

      const switchTimeout = window.setTimeout(() => {
        setSelectedTestimonialIndex(nextIndex);

        requestAnimationFrame(() => {
          const nextHeight = modalContentRef.current?.offsetHeight;
          setModalContentHeight(typeof nextHeight === "number" ? nextHeight : "auto");
        });
      }, MODAL_EXIT_MS);

      const revealTimeout = window.setTimeout(() => {
        setIsModalContentVisible(true);
      }, MODAL_EXIT_MS + MODAL_RESIZE_MS);

      const completeTimeout = window.setTimeout(() => {
        setModalContentHeight("auto");
        setIsModalTransitioning(false);
      }, MODAL_EXIT_MS + MODAL_RESIZE_MS + MODAL_ENTER_MS);

      modalTimeoutsRef.current.push(switchTimeout, revealTimeout, completeTimeout);
    },
    [
      MODAL_ENTER_MS,
      MODAL_EXIT_MS,
      MODAL_RESIZE_MS,
      clearModalTimeouts,
      isModalTransitioning,
      selectedTestimonialIndex,
    ],
  );

  const goToNextInModal = useCallback(() => {
    if (selectedTestimonialIndex === null) {
      return;
    }

    const nextIndex = (selectedTestimonialIndex + 1) % testimonials.length;
    transitionModalToIndex(nextIndex, "forward");
  }, [selectedTestimonialIndex, transitionModalToIndex]);

  const goToPreviousInModal = useCallback(() => {
    if (selectedTestimonialIndex === null) {
      return;
    }

    const previousIndex = (selectedTestimonialIndex - 1 + testimonials.length) % testimonials.length;
    transitionModalToIndex(previousIndex, "backward");
  }, [selectedTestimonialIndex, transitionModalToIndex]);

  const currentTestimonial = testimonials[currentIndex];
  const selectedTestimonial =
    selectedTestimonialIndex !== null ? testimonials[selectedTestimonialIndex] : null;
  const isModalOpen = selectedTestimonial !== null;

  useEffect(() => {
    if (!isHovered && !isModalOpen && testimonials.length > 0) {
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
  }, [isHovered, isModalOpen, goToNext]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeModal, isModalOpen]);

  useEffect(() => {
    return () => {
      clearModalTimeouts();
    };
  }, [clearModalTimeouts]);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section id="recommendations" className="scroll-mt-24 pt-6 pb-10">
      <div className="max-w-site mx-auto w-full px-8 space-y-6">
      <Divider label="recommendations" className="mb-8" />

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
                className="space-y-4 px-6 cursor-pointer"
                data-cursor-read-more="true"
                onClick={() => setSelectedTestimonialIndex(currentIndex)}
              >
                      <p className="text-[0.95rem] text-zinc-400 leading-relaxed mt-0 line-clamp-5 md:line-clamp-3">
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
      </div>

      <AnimatePresence>
        {isModalOpen && selectedTestimonial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              layout
              layoutDependency={selectedTestimonialIndex}
              className="relative w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 p-6 md:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={goToPreviousInModal}
                className="absolute -left-10 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-300 md:-left-12"
                aria-label="Previous recommendation"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={goToNextInModal}
                className="absolute -right-10 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 transition-colors hover:text-zinc-300 md:-right-12"
                aria-label="Next recommendation"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <button
                onClick={closeModal}
                className="absolute right-4 top-4 text-zinc-400 transition-colors hover:text-zinc-200 hover:cursor-pointer"
                aria-label="Close testimonial modal"
              >
                <X className="h-5 w-5" />
              </button>

              <motion.div
                animate={{ height: modalContentHeight }}
                transition={{ height: { duration: MODAL_RESIZE_MS / 1000, ease: "easeInOut" } }}
                className="overflow-hidden"
              >
                <motion.div
                  key={selectedTestimonialIndex}
                  ref={modalContentRef}
                  custom={direction}
                  initial={false}
                  animate={{
                    opacity: isModalContentVisible ? 1 : 0,
                  }}
                  transition={{
                    opacity: { duration: MODAL_ENTER_MS / 1000, ease: "easeOut" },
                  }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Image
                          src={selectedTestimonial.author.profileImage}
                          alt={selectedTestimonial.author.name}
                          width={48}
                          height={48}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        {selectedTestimonial.author.companyIcon && (
                          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1">
                            <Image
                              src={selectedTestimonial.author.companyIcon}
                              alt={selectedTestimonial.author.company}
                              width={18}
                              height={18}
                              className="h-5 w-5 rounded-md border-2 border-zinc-900"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        {selectedTestimonial.author.linkedin ? (
                          <a
                            href={selectedTestimonial.author.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                            aria-label={`${selectedTestimonial.author.name} LinkedIn profile`}
                          >
                            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-position-[0_100%] bg-size-[0%_1px] transition-[background-size] duration-250 ease-out group-hover:bg-size-[100%_1px]">
                              {selectedTestimonial.author.name}
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </a>
                        ) : (
                          <div className="text-sm font-medium text-zinc-300">
                            {selectedTestimonial.author.name}
                          </div>
                        )}
                        <div className="text-sm text-zinc-500">
                          {selectedTestimonial.author.title} at{" "}
                          <span className="text-zinc-500">{selectedTestimonial.author.company}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[45vh] overflow-y-auto pr-2 md:max-h-[50vh]">
                    <p className="pr-6 text-[0.95rem] leading-relaxed whitespace-pre-line text-zinc-400">
                      {selectedTestimonial.quote}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
