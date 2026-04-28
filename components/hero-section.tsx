"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import { AnimatePresence, motion } from "framer-motion";

import Silk from "@/components/Silk";
import { lockScrollJumpHover } from "@/lib/scroll-jump-lock";

const JUMP_SECTIONS = [
  { id: "experience", label: "EXPERIENCE" },
  { id: "projects", label: "PROJECTS" },
  { id: "technologies", label: "TECHNOLOGIES" },
  { id: "recommendations", label: "RECOMMENDATIONS" },
] as const;

export function HeroSection() {
  const [showToast, setShowToast] = useState(false);
  const [jumpToOpen, setJumpToOpen] = useState(false);
  const jumpToRef = useRef<HTMLDivElement>(null);

  const copyEmail = () => {
    navigator.clipboard.writeText("rsaid@uwaterloo.ca");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        copyEmail();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    if (!jumpToOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (jumpToRef.current && !jumpToRef.current.contains(e.target as Node)) {
        setJumpToOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [jumpToOpen]);

  useEffect(() => {
    if (!jumpToOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setJumpToOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jumpToOpen]);

  return (
    <section className="text-zinc-300">
      {/* Main Content */}
      <div className="px-8 pt-6 pb-6 max-w-site mx-auto w-full">
        <div className="w-full flex flex-col space-y-6">
          <div
            className="relative inline-flex flex-col gap-4 mb-8 -mx-2 rounded-2xl p-4 border border-[#1A1A1A] overflow-hidden hover:border-[#2A2A2A] hover:scale-102 transition-all duration-300"
            onMouseLeave={() => setJumpToOpen(false)}
          >
            <div className="absolute inset-0 z-0 [&>canvas]:size-full">
              <Silk
                speed={5}
                scale={1}
                color="#1e1e1e"
                noiseIntensity={1.5}
                rotation={0}
              />
            </div>
            {/* <div className="absolute inset-0 z-1 bg-black/60 pointer-events-none" /> */}
            <div className="absolute top-4 right-4 z-20 pointer-events-auto flex items-center gap-3">
              {/* X (Twitter) */}
              <a
                href="https://x.com/r4wsab"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center cursor-pointer"
                aria-label="X (Twitter)"
              >
                <Image
                  src="/icons/x-twitter.svg"
                  alt="X (Twitter)"
                  width={18}
                  height={18}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                />
              </a>
              {/* Dribbble */}
              <a
                href="https://dribbble.com/rawsab"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center cursor-pointer"
                aria-label="Dribbble"
              >
                <Image
                  src="/icons/dribbble.svg"
                  alt="Dribbble"
                  width={18}
                  height={18}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                />
              </a>
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/rawsabsaid/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center cursor-pointer"
                aria-label="LinkedIn"
              >
                <Image
                  src="/icons/linkedin.svg"
                  alt="LinkedIn"
                  width={18}
                  height={18}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                />
              </a>
            </div>

            {/* Profile Picture Container */}
            <div className="relative inline-block z-10">
              <div className="w-15.5 h-15.5 rounded-xl overflow-visible relative" data-cursor-pfp="true">
                <Image
                  src="/pfp1.jpeg"
                  alt="Profile picture"
                  width={64}
                  height={64}
                  className="w-full h-full rounded-lg object-cover"
                />
                {/* Online Status Dot */}
                <div className="absolute bottom-1.5 right-0 w-5 h-5 bg-[#18BF5F] rounded-full border-3 border-[#0D0D0D] translate-x-1/2 translate-y-1/2"></div>
              </div>
            </div>

            {/* Name with Verified Badge */}
            <div className="flex flex-col z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-white">Rawsab Said</h1>
                {/* Verification Badge */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0"
                >
                  <path
                    d="M21.6,9.84A4.57,4.57,0,0,1,21.18,9,4,4,0,0,1,21,8.07a4.21,4.21,0,0,0-.64-2.16,4.25,4.25,0,0,0-1.87-1.28,4.77,4.77,0,0,1-.85-.43A5.11,5.11,0,0,1,17,3.54a4.2,4.2,0,0,0-1.8-1.4A4.22,4.22,0,0,0,13,2.21a4.24,4.24,0,0,1-1.94,0,4.22,4.22,0,0,0-2.24-.07A4.2,4.2,0,0,0,7,3.54a5.11,5.11,0,0,1-.66.66,4.77,4.77,0,0,1-.85.43A4.25,4.25,0,0,0,3.61,5.91,4.21,4.21,0,0,0,3,8.07,4,4,0,0,1,2.82,9a4.57,4.57,0,0,1-.42.82A4.3,4.3,0,0,0,1.63,12a4.3,4.3,0,0,0,.77,2.16,4,4,0,0,1,.42.82,4.11,4.11,0,0,1,.15.95,4.19,4.19,0,0,0,.64,2.16,4.25,4.25,0,0,0,1.87,1.28,4.77,4.77,0,0,1,.85.43,5.11,5.11,0,0,1,.66.66,4.12,4.12,0,0,0,1.8,1.4,3,3,0,0,0,.87.13A6.66,6.66,0,0,0,11,21.81a4,4,0,0,1,1.94,0,4.33,4.33,0,0,0,2.24.06,4.12,4.12,0,0,0,1.8-1.4,5.11,5.11,0,0,1,.66-.66,4.77,4.77,0,0,1,.85-.43,4.25,4.25,0,0,0,1.87-1.28A4.19,4.19,0,0,0,21,15.94a4.11,4.11,0,0,1,.15-.95,4.57,4.57,0,0,1,.42-.82A4.3,4.3,0,0,0,22.37,12,4.3,4.3,0,0,0,21.6,9.84Zm-4.89.87-5,5a1,1,0,0,1-1.42,0l-3-3a1,1,0,1,1,1.42-1.42L11,13.59l4.29-4.3a1,1,0,0,1,1.42,1.42Z"
                    fill="#1EB8F9"
                  />
                  {/* tick icon svg */}
                </svg>
              </div>
              {/* Title */}
              <p className="text-base text-[#8F8F8F]">Software Engineer</p>
            </div>

            <div ref={jumpToRef} className="absolute bottom-3 right-4 z-20 hidden sm:block">
              <button
                type="button"
                aria-expanded={jumpToOpen}
                aria-haspopup="menu"
                aria-controls="hero-jump-to-menu"
                id="hero-jump-to-trigger"
                onClick={() => setJumpToOpen((o) => !o)}
                className="flex cursor-pointer items-center gap-1 text-xs font-mono font-medium text-[#686868] transition-colors hover:text-white"
              >
                <span>JUMP TO</span>
                <ChevronDown
                  className={`size-3.5 shrink-0 transition-transform duration-200 ${jumpToOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              <AnimatePresence>
                {jumpToOpen ? (
                  <motion.ul
                    id="hero-jump-to-menu"
                    role="menu"
                    aria-labelledby="hero-jump-to-trigger"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-full right-0 mb-1 min-w-44 origin-bottom-right rounded-lg border border-zinc-800 bg-zinc-950/95 py-1 shadow-[0_12px_40px_-4px_rgba(0,0,0,0.75),0_4px_16px_-2px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                  >
                    {JUMP_SECTIONS.map(({ id, label }) => (
                      <li key={id} role="none">
                        <button
                          type="button"
                          role="menuitem"
                          className="w-full cursor-pointer px-3 py-1.5 text-left text-xs font-medium font-mono text-[#686868] transition-colors hover:bg-zinc-800/80 hover:text-white"
                          onClick={() => {
                            lockScrollJumpHover();
                            document.getElementById(id)?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                            setJumpToOpen(false);
                          }}
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Bio */}
          <p className="text-base text-[#8F8F8F] max-w-xl leading-normal">
            Hey! I&apos;m Rawsab, a Software Engineering student at the{" "}
            <a
              href="https://uwaterloo.ca/future-students/programs/software-engineering"
              target="_blank"
              rel="noopener noreferrer"
              className="inline cursor-pointer group"
            >
              <Image
                src="/icons/uw_icon.png"
                alt="University of Waterloo"
                width={16}
                height={16}
                className="inline h-4.5 w-4.5 translate-y-0.5 ml-1 mr-1.5 align-baseline"
              />
              <span className="text-white group-hover:underline">University of Waterloo</span>
            </a>
            . I&apos;ve worked across early-stage startups and scaling products, most recently at{" "}
            <a
              href="https://www.hubspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline cursor-pointer group"
            >
              <Image
                src="/icons/hubspot_icon.png"
                alt="HubSpot"
                width={16}
                height={16}
                className="inline h-4.5 w-4.5 translate-y-0.5 ml-1 mr-1.5 align-baseline"
              />
              <span className="text-white group-hover:underline">HubSpot</span>
            </a>
            {" and "}
            <a
              href="https://www.palitronica.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline cursor-pointer group"
            >
              <Image
                src="/icons/pal_icon.png"
                alt="Palitronica"
                width={16}
                height={16}
                className="inline h-4.5 w-4.5 translate-y-0.5 ml-1 mr-1.5 align-baseline"
              />
              <span className="text-white group-hover:underline">Palitronica (YC W22)</span>
            </a>
            .
            <br />
            {/* <br />
            Currently working on{" "}
            <a
              href="https://linkedin.com/company/keystoneapp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline cursor-pointer group"
            >
              <Image
                src="/icons/ks_icon.png"
                alt="Keystone App"
                width={16}
                height={16}
                className="inline h-4.5 w-4.5 translate-y-0.5 ml-1 mr-1.5 align-baseline"
              />
              <span className="text-white group-hover:underline">Keystone</span>
            </a>
            . */}
          </p>

          {/* Email Copy Section */}
          <div 
            className="flex items-center gap-2 mt-2 mb-2 cursor-pointer group"
            onClick={copyEmail}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                copyEmail();
              }
            }}
            aria-label="Copy email to clipboard"
          >
            {/* Mobile/Tablet version */}
            <span className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors md:hidden">
              Click here or press{" "}
              <kbd className="px-2 py-1 mx-1 text-xs font-normal font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 rounded group-hover:bg-zinc-800 group-hover:border-zinc-700 transition-colors">
                C
              </kbd>
              {" "}to copy my email
            </span>
            
            {/* Desktop version */}
            <span className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors hidden md:inline">Press</span>
            <kbd className="hidden md:inline px-2 py-1 text-xs font-normal font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 rounded group-hover:bg-zinc-800 group-hover:border-zinc-700 transition-colors">
              C
            </kbd>
            <span className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors hidden md:inline">to copy my email</span>
          </div>
        </div>
    </div>

      {/* Toast Notification */}
      <div
        className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          showToast
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg shadow-black/50">
          <Check className="w-4 h-4 text-zinc-300" />
          <span className="text-xs font-mono text-zinc-300">COPIED EMAIL</span>
        </div>
      </div>
    </section>
  );
}

