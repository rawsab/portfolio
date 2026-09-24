"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const bannerFrameClass =
  "absolute left-0 w-full max-w-none top-[calc(var(--banner-y)*100cqw/1280px)]";

export function HeroSection() {
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = bannerRef.current?.querySelector("img");
    if (img?.complete && img.naturalWidth > 0) {
      setBannerLoaded(true);
    }
  }, []);

  return (
    <section className="text-zinc-300">
      <motion.div
        ref={bannerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="@container relative w-full overflow-hidden h-40 [--banner-y:-160px]"
      >
        <div
          aria-hidden
          className={`${bannerFrameClass} aspect-[2560/1794]`}
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #2C343A 0%, #394756 8%, #45637B 18%, #111D22 30%, #403B31 38%, #897253 45%, #46594F 55%, #202327 72%, #2E3932 87%, #455537 100%)",
          }}
        />
        <Image
          src="/background.webp"
          alt=""
          width={2560}
          height={1794}
          priority
          sizes="100vw"
          onLoad={() => setBannerLoaded(true)}
          className={`${bannerFrameClass} h-auto transition-opacity duration-700 ease-out ${bannerLoaded ? "opacity-100" : "opacity-0"}`}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage: "linear-gradient(to top, #000 0px, rgb(0 0 0 / 0.9) 20px, rgb(0 0 0 / 0.8) 40px, rgb(0 0 0 / 0.75) 60px, rgb(0 0 0 / 0.7) 80px, rgb(0 0 0 / 0.6) 100px, rgb(0 0 0 / 0.5) 120px, rgb(0 0 0 / 0.2))",
          }}
          // 0 - 20 - 40 - 60 - 80 - 120 - 160
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-20 px-8 -mt-6 pb-6 max-w-site mx-auto w-full"
      >
        <div className="w-full flex flex-col space-y-4">
          <h1 className="text-left text-base font-medium tracking-tight text-[white]">
            Hi, I&apos;m <a
              href="https://www.linkedin.com/in/rawsabsaid/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline cursor-pointer group"
            >
              <span className="text-white bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-position-[0_100%] bg-size-[0%_1px] transition-[background-size] duration-250 ease-out group-hover:bg-size-[100%_1px]">
                Rawsab Said
              </span>
            </a>
            .
          </h1>
          <p className="text-base text-[#8F8F8F] max-w-xl leading-normal">
            I&apos;m a Software Engineering student at the{" "}
            <a
              href="https://uwaterloo.ca/future-students/programs/software-engineering"
              target="_blank"
              rel="noopener noreferrer"
              className="inline whitespace-nowrap cursor-pointer group"
            >
              <Image
                src="/icons/uw_icon.webp"
                alt="University of Waterloo"
                width={16}
                height={16}
                className="inline h-4.5 w-4.5 translate-y-0.5 ml-1 mr-1.5 align-baseline"
              />
              <span className="text-white bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-position-[0_100%] bg-size-[0%_1px] transition-[background-size] duration-250 ease-out group-hover:bg-size-[100%_1px]">
                University of Waterloo
              </span>
            </a>
            . I&apos;ve worked across enterprise products and early-stage startups, most recently at{" "}
            <a
              href="https://www.hubspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline whitespace-nowrap cursor-pointer group"
            >
              <Image
                src="/icons/hubspot_icon.webp"
                alt="HubSpot"
                width={16}
                height={16}
                className="inline h-4.5 w-4.5 translate-y-0.5 ml-1 mr-1.5 align-baseline"
              />
              <span className="text-white bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-position-[0_100%] bg-size-[0%_1px] transition-[background-size] duration-250 ease-out group-hover:bg-size-[100%_1px]">
                HubSpot
              </span>
            </a>
            {" and "}
            <a
              href="https://www.palitronica.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline whitespace-nowrap cursor-pointer group"
            >
              <Image
                src="/icons/pal_icon.webp"
                alt="Palitronica"
                width={16}
                height={16}
                className="inline h-4.5 w-4.5 translate-y-0.5 ml-1 mr-1.5 align-baseline"
              />
              <span className="text-white bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-position-[0_100%] bg-size-[0%_1px] transition-[background-size] duration-250 ease-out group-hover:bg-size-[100%_1px]">
                Palitronica (YC W22)
              </span>
            </a>
            .
          </p>
        </div>
      </motion.div>
    </section>
  );
}
