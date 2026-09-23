"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { cn } from "@/lib/utils";
import { Divider } from "./divider";

export function TestimonialsSection() {
  const MODAL_EXIT_MS = 50;
  const MODAL_RESIZE_MS = 250;
  const MODAL_ENTER_MS = 200;
  const MODAL_FADE_MS = 300;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [selectedTestimonialIndex, setSelectedTestimonialIndex] = useState<number | null>(null);
  const [isModalContentVisible, setIsModalContentVisible] = useState(true);
  const [isModalTransitioning, setIsModalTransitioning] = useState(false);
  const [modalContentHeight, setModalContentHeight] = useState<number | "auto">("auto");
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const modalTimeoutsRef = useRef<number[]>([]);

  const goToNext = useCallback(() => {
    setDirection("forward");
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goToPrevious = useCallback(() => {
    setDirection("backward");
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex((prev) => {
      setDirection(index > prev ? "forward" : "backward");
      return index;
    });
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
    setIsModalVisible(false);
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
        setActiveTestimonialIndex(nextIndex);
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

  const openTestimonial = (index: number) => {
    setActiveTestimonialIndex(index);
    setSelectedTestimonialIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];
  const modalTestimonial =
    activeTestimonialIndex !== null ? testimonials[activeTestimonialIndex] : null;
  const isModalMounted = modalTestimonial !== null && modalTestimonial !== undefined;

  useEffect(() => {
    if (selectedTestimonialIndex !== null) {
      const frame = window.requestAnimationFrame(() => {
        setIsModalVisible(true);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const unmountTimeout = window.setTimeout(() => {
      setActiveTestimonialIndex(null);
    }, MODAL_FADE_MS);

    return () => window.clearTimeout(unmountTimeout);
  }, [MODAL_FADE_MS, selectedTestimonialIndex]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    if (isModalMounted) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const previousBodyOverflow = document.body.style.overflow;
      const previousBodyPaddingRight = document.body.style.paddingRight;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.body.style.overflow = previousBodyOverflow;
        document.body.style.paddingRight = previousBodyPaddingRight;
        document.removeEventListener("keydown", handleEscape);
      };
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeModal, isModalMounted]);

  useEffect(() => {
    return () => {
      clearModalTimeouts();
    };
  }, [clearModalTimeouts]);

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section id="recommendations" className="scroll-mt-24 pt-0 pb-10">
      <div className="max-w-site mx-auto w-full px-8 space-y-6">
      <Divider label="recommendations" className="mb-8" />

        <div
          className="relative"
          onMouseLeave={() => setHoveredSide(null)}
        >
          <div
            className="relative z-10 min-h-[120px] space-y-4 overflow-hidden rounded-lg border border-white/8 bg-zinc-800/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_0_24px_rgba(255,255,255,0.05)] [backdrop-filter:blur(8px)_saturate(1.5)] [-webkit-backdrop-filter:blur(8px)_saturate(1.5)] transition-colors duration-200 hover:bg-[#3c3c3f]/30"
            onMouseLeave={() => setHoveredSide(null)}
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
                onClick={() => openTestimonial(currentIndex)}
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
                          className="h-5 w-5 rounded-md border-2 border-white/15"
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

      {isModalMounted && modalTestimonial && (
        <div className="fixed inset-0 z-50">
          <div
            className={cn(
              "absolute inset-0 bg-black/65 transition-opacity duration-300 ease-out",
              isModalVisible ? "opacity-100" : "opacity-0",
            )}
            onClick={closeModal}
          />
          <div className="pointer-events-none relative flex h-full items-center justify-center px-4">
            <div
              className={cn(
                "pointer-events-auto relative w-full max-w-2xl rounded-xl border p-6 md:p-7 transition-[background-color,border-color,box-shadow,backdrop-filter,-webkit-backdrop-filter] duration-300 ease-out",
                isModalVisible
                  ? "border-white/8 bg-zinc-800/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_0_24px_rgba(255,255,255,0.05),0_24px_50px_-20px_rgba(0,0,0,0.65)] [backdrop-filter:blur(8px)_saturate(1.5)] [-webkit-backdrop-filter:blur(8px)_saturate(1.5)]"
                  : "border-white/0 bg-zinc-800/0 shadow-[inset_0_1px_0_rgba(255,255,255,0),inset_0_0_24px_rgba(255,255,255,0),0_24px_50px_-20px_rgba(0,0,0,0)] [backdrop-filter:blur(0px)_saturate(1)] [-webkit-backdrop-filter:blur(0px)_saturate(1)]",
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={goToPreviousInModal}
                className={cn(
                  "absolute -left-10 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 transition-opacity duration-300 ease-out hover:text-zinc-300 md:-left-12",
                  isModalVisible ? "opacity-100" : "opacity-0",
                )}
                aria-label="Previous recommendation"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={goToNextInModal}
                className={cn(
                  "absolute -right-10 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 transition-opacity duration-300 ease-out hover:text-zinc-300 md:-right-12",
                  isModalVisible ? "opacity-100" : "opacity-0",
                )}
                aria-label="Next recommendation"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <button
                onClick={closeModal}
                className={cn(
                  "absolute right-4 top-4 text-zinc-500 transition-opacity duration-300 ease-out hover:text-zinc-200 hover:cursor-pointer",
                  isModalVisible ? "opacity-100" : "opacity-0",
                )}
                aria-label="Close testimonial modal"
              >
                <X className="h-5 w-5" />
              </button>

              <motion.div
                initial={false}
                animate={{ height: modalContentHeight }}
                transition={{ height: { duration: MODAL_RESIZE_MS / 1000, ease: "easeInOut" } }}
                className={cn(
                  "overflow-hidden transition-opacity duration-300 ease-out",
                  isModalVisible ? "opacity-100" : "opacity-0",
                )}
              >
                <motion.div
                  key={activeTestimonialIndex}
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
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Image
                          src={modalTestimonial.author.profileImage}
                          alt={modalTestimonial.author.name}
                          width={48}
                          height={48}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        {modalTestimonial.author.companyIcon && (
                          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1">
                            <Image
                              src={modalTestimonial.author.companyIcon}
                              alt={modalTestimonial.author.company}
                              width={18}
                              height={18}
                              className="h-5 w-5 rounded-md border-2 border-white/15"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        {modalTestimonial.author.linkedin ? (
                          <a
                            href={modalTestimonial.author.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-1 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                            aria-label={`${modalTestimonial.author.name} LinkedIn profile`}
                          >
                            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-position-[0_100%] bg-size-[0%_1px] transition-[background-size] duration-250 ease-out group-hover:bg-size-[100%_1px]">
                              {modalTestimonial.author.name}
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </a>
                        ) : (
                          <div className="text-sm font-medium text-zinc-300">
                            {modalTestimonial.author.name}
                          </div>
                        )}
                        <div className="text-sm text-zinc-500">
                          {modalTestimonial.author.title} at{" "}
                          <span className="text-zinc-500">{modalTestimonial.author.company}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="max-h-[45vh] overflow-y-auto pr-2 md:max-h-[50vh] [scrollbar-color:#52525b_transparent] [&::-webkit-scrollbar-track]:bg-transparent"
                  >
                    <p className="pr-6 text-[0.95rem] leading-relaxed whitespace-pre-line text-zinc-400">
                      {modalTestimonial.quote}
                    </p>
                  </div>
              </motion.div>
            </motion.div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
