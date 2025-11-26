"use client";

import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

export function HeroSection() {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        navigator.clipboard.writeText("rsaid@uwaterloo.ca");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 2000);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <section className="text-zinc-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-zinc-800/50 max-w-2xl mx-auto w-full">
        <div className="text-sm text-zinc-500 font-mono">@rawsab</div>
        <div className="flex items-center gap-3">
          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/rawsabsaid/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="LinkedIn"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 32 32"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M28.778 1.004h-25.56c-0.008-0-0.017-0-0.027-0-1.199 0-2.172 0.964-2.186 2.159v25.672c0.014 1.196 0.987 2.161 2.186 2.161 0.010 0 0.019-0 0.029-0h25.555c0.008 0 0.018 0 0.028 0 1.2 0 2.175-0.963 2.194-2.159l0-0.002v-25.67c-0.019-1.197-0.994-2.161-2.195-2.161-0.010 0-0.019 0-0.029 0h0.001zM9.9 26.562h-4.454v-14.311h4.454zM7.674 10.293c-1.425 0-2.579-1.155-2.579-2.579s1.155-2.579 2.579-2.579c1.424 0 2.579 1.154 2.579 2.578v0c0 0.001 0 0.002 0 0.004 0 1.423-1.154 2.577-2.577 2.577-0.001 0-0.002 0-0.003 0h0zM26.556 26.562h-4.441v-6.959c0-1.66-0.034-3.795-2.314-3.795-2.316 0-2.669 1.806-2.669 3.673v7.082h-4.441v-14.311h4.266v1.951h0.058c0.828-1.395 2.326-2.315 4.039-2.315 0.061 0 0.121 0.001 0.181 0.003l-0.009-0c4.5 0 5.332 2.962 5.332 6.817v7.855z" />
            </svg>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/rawsab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="GitHub"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10,0 C4.477,0 0,4.484 0,10.017 C0,14.425 2.865,18.18 6.839,19.49 C7.339,19.581 7.521,19.272 7.521,19.006 C7.521,18.722 7.512,17.988 7.507,17.192 C4.726,17.69 4.139,15.97 4.139,15.97 C3.685,14.83 3.029,14.5 3.029,14.5 C2.121,13.88 3.097,13.895 3.097,13.895 C4.101,13.965 4.629,14.93 4.629,14.93 C5.521,16.367 6.97,15.937 7.539,15.737 C7.631,15.134 7.889,14.771 8.175,14.577 C5.954,14.329 3.62,13.448 3.62,9.582 C3.62,8.469 4.01,7.577 4.649,6.894 C4.546,6.602 4.203,5.567 4.747,4.18 C4.747,4.18 5.586,3.905 7.496,5.207 C8.295,4.98 9.15,4.866 10,4.862 C10.85,4.866 11.705,4.98 12.504,5.207 C14.414,3.905 15.253,4.18 15.253,4.18 C15.797,5.567 15.454,6.602 15.351,6.894 C15.99,7.577 16.38,8.469 16.38,9.582 C16.38,13.455 14.041,14.33 11.817,14.576 C12.172,14.833 12.482,15.397 12.482,16.279 C12.482,17.559 12.469,18.524 12.469,19.006 C12.469,19.27 12.649,19.577 13.155,19.481 C17.135,18.175 20,14.421 20,10.017 C20,4.484 15.522,0 10,0" />
            </svg>
          </a>

          {/* Dribbble */}
          <a
            href="https://dribbble.com/rawsab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Dribbble"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.91"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10.5" />
              <path d="M8.12,2.24A32.47,32.47,0,0,1,12.8,9.13a33.23,33.23,0,0,1,1.58,3.56,36.16,36.16,0,0,1,2.15,8.79" />
              <path d="M19.67,4.82A18.16,18.16,0,0,1,12.8,9.13,28,28,0,0,1,1.55,11" />
              <path d="M22.42,13.21a16.66,16.66,0,0,0-8-.52A13,13,0,0,0,5.09,19.9" />
            </svg>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-10 max-w-2xl mx-auto w-full">
        <div className="w-full flex flex-col space-y-6">
          {/* Profile Picture Container */}
          <div className="relative inline-block mb-2">
            <div className="w-15.5 h-15.5 rounded-xl overflow-visible relative">
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
            {" "} and {" "}
            <a
              href="https://dandelionnet.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline cursor-pointer group"
            >
              <Image
                src="/icons/ddln_icon.png"
                alt="University of Waterloo"
                width={16}
                height={16}
                className="inline h-4.5 w-4.5 translate-y-0.5 ml-1 mr-1.5 align-baseline"
              />
              <span className="text-white group-hover:underline">dandelion</span>
              .
            </a>
          </p>

          {/* Email Copy Section */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-zinc-500">Press</span>
            <kbd className="px-2 py-1 text-xs font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 rounded">
              C
            </kbd>
            <span className="text-sm text-zinc-500">to copy my email</span>
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

