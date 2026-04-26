"use client";

import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

export function HeroSection() {
  const [showToast, setShowToast] = useState(false);

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

  return (
    <section className="text-zinc-300">
      {/* Main Content */}
      <div className="px-8 pt-10 pb-0 max-w-site mx-auto w-full">
        <div className="w-full flex flex-col space-y-6">
          {/* Profile Picture Container */}
          <div className="relative inline-block mb-2">
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
          <div className="flex flex-col mt-4">
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

          {/* Bio */}
          <p className="text-base text-[#8F8F8F] max-w-xl leading-normal">
            Hey! I&apos;m Rawsab, a Software Engineering student at the{" "}
            <a
              href="https://uwaterloo.ca/future-students/programs/software-engineering"
              target="_blank"
              rel="noopener noreferrer"
              className="inline cursor-pointer group"
            >
              {/* <Image
                src="/icons/uw_icon.png"
                alt="University of Waterloo"
                width={16}
                height={16}
                className="inline h-4.5 w-4.5 translate-y-0.5 ml-1 mr-1.5 align-baseline"
              /> */}
              <span className="text-white group-hover:underline">University of Waterloo</span>
            </a>
            . I&apos;ve worked across early-stage startups and scaling products, most recently at{" "}
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
            {" and "}
            <a
              href="https://node-app.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline cursor-pointer group"
            >
              <Image
                src="/icons/node_icon.png"
                alt="Node App"
                width={16}
                height={16}
                className="inline h-4.5 w-4.5 translate-y-0.5 ml-1 mr-1.5 align-baseline"
              />
              <span className="text-white group-hover:underline">Node App</span>
            </a>
            .
            <br />
            <br />
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
            .
          </p>

          {/* Email Copy Section */}
          <div 
            className="flex items-center gap-2 mt-2 mb-6 cursor-pointer group"
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

