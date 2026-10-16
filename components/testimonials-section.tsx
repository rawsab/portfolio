"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback, type RefObject } from "react";
import Image from "next/image";
import { animate, motion, AnimatePresence, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { testimonials, type Testimonial } from "@/data/testimonials";
import { cn } from "@/lib/utils";
import { Divider } from "./divider";

const CARD_GAP = 16;
const SWIPE_QUERY = "(max-width: 767px), (hover: none) and (pointer: coarse)";
const TOUCH_MODAL_QUERY = "(hover: none) and (pointer: coarse)";

function SwipeRecommendationCard({
  testimonial,
  isVisible,
  onClose,
  cardRef,
}: {
  testimonial: Testimonial;
  isVisible: boolean;
  onClose: () => void;
  cardRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={cardRef}
      className={cn(
        "relative w-full rounded-xl border p-6 transition-[background-color,border-color,box-shadow,backdrop-filter,-webkit-backdrop-filter] duration-300 ease-out",
        isVisible
          ? "border-white/8 bg-zinc-800/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_0_24px_rgba(255,255,255,0.05),0_24px_50px_-20px_rgba(0,0,0,0.65)] [backdrop-filter:blur(8px)_saturate(1.5)] [-webkit-backdrop-filter:blur(8px)_saturate(1.5)]"
          : "border-white/0 bg-zinc-800/0 shadow-[inset_0_1px_0_rgba(255,255,255,0),inset_0_0_24px_rgba(255,255,255,0),0_24px_50px_-20px_rgba(0,0,0,0)] [backdrop-filter:blur(0px)_saturate(1)] [-webkit-backdrop-filter:blur(0px)_saturate(1)]",
      )}
    >
      <button
        onClick={onClose}
        className={cn(
          "absolute right-4 top-4 text-zinc-500 transition-opacity duration-300 ease-out hover:text-zinc-200 hover:cursor-pointer",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        aria-label="Close testimonial modal"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className={cn(
          "space-y-5 transition-opacity duration-300 ease-out",
          isVisible ? "opacity-100" : "opacity-0",
        )}
      >
        <RecommendationModalBody testimonial={testimonial} />
      </div>
    </div>
  );
}

function RecommendationModalBody({ testimonial }: { testimonial: Testimonial }) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={testimonial.author.profileImage}
              alt={testimonial.author.name}
              width={48}
              height={48}
              className="h-10 w-10 rounded-full object-cover"
            />
            {testimonial.author.companyIcon && (
              <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1">
                <Image
                  src={testimonial.author.companyIcon}
                  alt={testimonial.author.company}
                  width={18}
                  height={18}
                  className="h-5 w-5 rounded-md border-2 border-white/15"
                />
              </div>
            )}
          </div>

          <div>
            {testimonial.author.linkedin ? (
              <a
                href={testimonial.author.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                aria-label={`${testimonial.author.name} LinkedIn profile`}
              >
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-position-[0_100%] bg-size-[0%_1px] transition-[background-size] duration-250 ease-out group-hover:bg-size-[100%_1px]">
                  {testimonial.author.name}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ) : (
              <div className="text-sm font-medium text-zinc-300">
                {testimonial.author.name}
              </div>
            )}
            <div className="text-sm text-zinc-500">
              {testimonial.author.title} at{" "}
              <span className="text-zinc-500">{testimonial.author.company}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-h-[45vh] overflow-y-auto pr-2 md:max-h-[50vh] [scrollbar-color:#52525b_transparent] [&::-webkit-scrollbar-track]:bg-transparent">
        <p className="pr-6 text-[0.95rem] leading-relaxed whitespace-pre-line text-zinc-400">
          {testimonial.quote}
        </p>
      </div>
    </>
  );
}

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
  const [isSwipeModal, setIsSwipeModal] = useState(false);
  const [showModalArrows, setShowModalArrows] = useState(true);
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const modalTimeoutsRef = useRef<number[]>([]);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const currentCardRef = useRef<HTMLDivElement | null>(null);
  const prevCardRef = useRef<HTMLDivElement | null>(null);
  const nextCardRef = useRef<HTMLDivElement | null>(null);
  const heightsRef = useRef({ prev: 0, current: 0, next: 0 });
  const widthRef = useRef(0);
  const swipeX = useMotionValue(0);
  const shellHeight = useMotionValue(0);
  const swipeAnimationRef = useRef<AnimationPlaybackControls | null>(null);
  const swipeTokenRef = useRef(0);
  const activeIndexRef = useRef<number | null>(null);
  const isModalTransitioningRef = useRef(false);

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
    swipeTokenRef.current += 1;
    swipeAnimationRef.current?.stop();
    swipeAnimationRef.current = null;
    swipeX.set(0);
    setIsModalTransitioning(false);
    setIsModalContentVisible(true);
    setModalContentHeight("auto");
    setIsModalVisible(false);
    setSelectedTestimonialIndex(null);
  }, [clearModalTimeouts, swipeX]);

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

  const modalSwipeRef = useRef<{
    x: number;
    y: number;
    originX: number;
    lastX: number;
    lastTime: number;
    velocity: number;
    ignore: boolean;
    axis: "horizontal" | "vertical" | null;
  } | null>(null);

  activeIndexRef.current = activeTestimonialIndex;
  isModalTransitioningRef.current = isModalTransitioning;

  const syncShellHeight = useCallback(
    (x: number) => {
      const currentH = heightsRef.current.current;
      if (!currentH) return;

      const travel = widthRef.current + CARD_GAP;
      const nextH = heightsRef.current.next || currentH;
      const prevH = heightsRef.current.prev || currentH;
      const progress = travel > 0 ? Math.max(-1, Math.min(1, x / travel)) : 0;
      const height =
        progress < 0
          ? currentH + (nextH - currentH) * -progress
          : currentH + (prevH - currentH) * progress;
      shellHeight.set(height);
    },
    [shellHeight],
  );

  const measureSwipeCards = useCallback(() => {
    const measure = (node: HTMLDivElement | null) => node?.offsetHeight ?? 0;
    heightsRef.current = {
      prev: measure(prevCardRef.current),
      current: measure(currentCardRef.current),
      next: measure(nextCardRef.current),
    };
    widthRef.current = shellRef.current?.clientWidth ?? widthRef.current;
  }, []);

  const springSwipeHome = useCallback(() => {
    swipeTokenRef.current += 1;
    const token = swipeTokenRef.current;
    swipeAnimationRef.current?.stop();
    const controls = animate(swipeX, 0, {
      type: "spring",
      stiffness: 520,
      damping: 42,
      mass: 0.85,
    });
    swipeAnimationRef.current = controls;
    controls.then(() => {
      if (swipeTokenRef.current !== token) return;
      swipeAnimationRef.current = null;
    });
  }, [swipeX]);

  const finishSwipe = useCallback(
    (target: number, step: 1 | -1) => {
      const current = activeIndexRef.current;
      if (current === null || isModalTransitioningRef.current) return;

      swipeTokenRef.current += 1;
      const token = swipeTokenRef.current;
      swipeAnimationRef.current?.stop();

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const controls = animate(swipeX, target, reducedMotion
        ? { duration: 0 }
        : { duration: 0.32, ease: [0.22, 1, 0.36, 1] });
      swipeAnimationRef.current = controls;

      controls.then(() => {
        if (swipeTokenRef.current !== token) return;
        swipeAnimationRef.current = null;

        const nextIndex =
          step > 0
            ? (current + 1) % testimonials.length
            : (current - 1 + testimonials.length) % testimonials.length;
        setDirection(step > 0 ? "forward" : "backward");
        setCurrentIndex(nextIndex);
        setActiveTestimonialIndex(nextIndex);
        setSelectedTestimonialIndex(nextIndex);
      });
    },
    [swipeX],
  );

  const slideModalBy = useCallback(
    (step: 1 | -1) => {
      if (swipeAnimationRef.current || activeIndexRef.current === null) return;
      const width = widthRef.current || shellRef.current?.clientWidth || 0;
      if (!width) return;
      widthRef.current = width;
      finishSwipe(step > 0 ? -(width + CARD_GAP) : width + CARD_GAP, step);
    },
    [finishSwipe],
  );

  const settleSwipe = useCallback(
    (x: number, velocity: number) => {
      const width = widthRef.current || shellRef.current?.clientWidth || 0;
      if (!width) {
        swipeX.set(0);
        return;
      }

      widthRef.current = width;
      const travel = width + CARD_GAP;
      const threshold = Math.min(80, travel * 0.22);
      const fling = 0.45;
      const commitNext = x <= -threshold || (velocity <= -fling && x < -12);
      const commitPrev = x >= threshold || (velocity >= fling && x > 12);

      if (commitNext && (!commitPrev || velocity < 0)) {
        finishSwipe(-travel, 1);
        return;
      }

      if (commitPrev) {
        finishSwipe(travel, -1);
        return;
      }

      if (Math.abs(x) < 0.5) {
        swipeX.set(0);
        return;
      }

      springSwipeHome();
    },
    [finishSwipe, springSwipeHome, swipeX],
  );

  const handleModalTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!isSwipeModal || event.touches.length !== 1 || isModalTransitioningRef.current) {
        modalSwipeRef.current = null;
        return;
      }

      const touch = event.touches[0];
      const target = event.target;
      const ignore = target instanceof Element && Boolean(target.closest("button, a"));
      if (ignore) {
        modalSwipeRef.current = null;
        return;
      }

      swipeTokenRef.current += 1;
      swipeAnimationRef.current?.stop();
      swipeAnimationRef.current = null;
      measureSwipeCards();

      modalSwipeRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        originX: swipeX.get(),
        lastX: touch.clientX,
        lastTime: performance.now(),
        velocity: 0,
        ignore: false,
        axis: null,
      };
    },
    [isSwipeModal, measureSwipeCards, swipeX],
  );

  const handleModalTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const start = modalSwipeRef.current;
      if (!start || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;

      if (!start.axis) {
        if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
        start.axis = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
        if (start.axis === "horizontal" && shellRef.current) {
          shellRef.current.style.touchAction = "none";
        }
      }

      if (start.axis !== "horizontal") return;

      const now = performance.now();
      const dt = now - start.lastTime;
      if (dt > 0 && dt < 64) {
        start.velocity = (touch.clientX - start.lastX) / dt;
      }
      start.lastX = touch.clientX;
      start.lastTime = now;

      const width = widthRef.current || shellRef.current?.clientWidth || 0;
      if (!width) return;
      widthRef.current = width;

      const travel = width + CARD_GAP;
      const raw = start.originX + deltaX;
      const abs = Math.abs(raw);
      const dragged = abs <= travel ? raw : Math.sign(raw) * Math.min(travel + 36, travel + (abs - travel) * 0.18);
      swipeX.set(dragged);
    },
    [swipeX],
  );

  const handleModalTouchEnd = useCallback(() => {
    const start = modalSwipeRef.current;
    modalSwipeRef.current = null;
    if (shellRef.current) shellRef.current.style.touchAction = "";

    if (!start) return;
    if (start.axis === "vertical") {
      if (Math.abs(swipeX.get()) > 0.5) springSwipeHome();
      return;
    }

    settleSwipe(swipeX.get(), start.axis === "horizontal" ? start.velocity : 0);
  }, [settleSwipe, springSwipeHome, swipeX]);

  const handleModalTouchCancel = useCallback(() => {
    modalSwipeRef.current = null;
    if (shellRef.current) shellRef.current.style.touchAction = "";
    if (Math.abs(swipeX.get()) > 0.5) springSwipeHome();
  }, [springSwipeHome, swipeX]);

  const openTestimonial = (index: number) => {
    setActiveTestimonialIndex(index);
    setSelectedTestimonialIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];
  const modalTestimonial =
    activeTestimonialIndex !== null ? testimonials[activeTestimonialIndex] : null;
  const isModalMounted = modalTestimonial !== null && modalTestimonial !== undefined;
  const modalIndex = activeTestimonialIndex ?? 0;
  const previousModalTestimonial =
    testimonials[(modalIndex - 1 + testimonials.length) % testimonials.length];
  const nextModalTestimonial = testimonials[(modalIndex + 1) % testimonials.length];

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

  useEffect(() => {
    const swipeMedia = window.matchMedia(SWIPE_QUERY);
    const touchMedia = window.matchMedia(TOUCH_MODAL_QUERY);
    const update = () => {
      setIsSwipeModal(swipeMedia.matches);
      setShowModalArrows(!touchMedia.matches);
    };

    update();
    swipeMedia.addEventListener("change", update);
    touchMedia.addEventListener("change", update);
    return () => {
      swipeMedia.removeEventListener("change", update);
      touchMedia.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    return swipeX.on("change", syncShellHeight);
  }, [swipeX, syncShellHeight]);

  useLayoutEffect(() => {
    if (!isSwipeModal || activeTestimonialIndex === null) return;
    measureSwipeCards();
    swipeX.set(0);
    if (heightsRef.current.current) shellHeight.set(heightsRef.current.current);
  }, [activeTestimonialIndex, isSwipeModal, measureSwipeCards, shellHeight, swipeX]);

  useEffect(() => {
    if (!isSwipeModal || activeTestimonialIndex === null) return;

    const observer = new ResizeObserver(() => {
      measureSwipeCards();
      syncShellHeight(swipeX.get());
    });

    [prevCardRef.current, currentCardRef.current, nextCardRef.current].forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [activeTestimonialIndex, isSwipeModal, measureSwipeCards, syncShellHeight, swipeX]);

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
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 bg-black/65 transition-opacity duration-300 ease-out",
              isModalVisible ? "opacity-100" : "opacity-0",
            )}
            onClick={closeModal}
          />
          <div className="pointer-events-none relative flex h-full items-center justify-center px-4">
            {isSwipeModal ? (
            <div className="pointer-events-auto relative w-full max-w-2xl">
              {showModalArrows && (
                <>
                  <button
                    onClick={() => slideModalBy(-1)}
                    className={cn(
                      "absolute -left-10 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-zinc-400 transition-opacity duration-300 ease-out hover:text-zinc-300 md:-left-12",
                      isModalVisible ? "opacity-100" : "opacity-0",
                    )}
                    aria-label="Previous recommendation"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => slideModalBy(1)}
                    className={cn(
                      "absolute -right-10 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-zinc-400 transition-opacity duration-300 ease-out hover:text-zinc-300 md:-right-12",
                      isModalVisible ? "opacity-100" : "opacity-0",
                    )}
                    aria-label="Next recommendation"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <motion.div
                ref={shellRef}
                className="relative w-full touch-pan-y"
                style={{ height: shellHeight }}
                onClick={(event) => event.stopPropagation()}
                onTouchStart={handleModalTouchStart}
                onTouchMove={handleModalTouchMove}
                onTouchEnd={handleModalTouchEnd}
                onTouchCancel={handleModalTouchCancel}
              >
                <motion.div
                  aria-hidden
                  inert
                  className="pointer-events-none absolute w-full"
                  style={{ x: swipeX, y: "-50%", top: "50%", left: `calc(-100% - ${CARD_GAP}px)` }}
                >
                  <SwipeRecommendationCard
                    testimonial={previousModalTestimonial}
                    isVisible={isModalVisible}
                    onClose={closeModal}
                    cardRef={prevCardRef}
                  />
                </motion.div>
                <motion.div
                  aria-hidden
                  inert
                  className="pointer-events-none absolute w-full"
                  style={{ x: swipeX, y: "-50%", top: "50%", left: `calc(100% + ${CARD_GAP}px)` }}
                >
                  <SwipeRecommendationCard
                    testimonial={nextModalTestimonial}
                    isVisible={isModalVisible}
                    onClose={closeModal}
                    cardRef={nextCardRef}
                  />
                </motion.div>
                <motion.div
                  className="absolute left-0 w-full"
                  style={{ x: swipeX, y: "-50%", top: "50%" }}
                >
                  <SwipeRecommendationCard
                    testimonial={modalTestimonial}
                    isVisible={isModalVisible}
                    onClose={closeModal}
                    cardRef={currentCardRef}
                  />
                </motion.div>
              </motion.div>
            </div>
            ) : (
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
                  <RecommendationModalBody testimonial={modalTestimonial} />
              </motion.div>
            </motion.div>
            </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
