import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

import { FigureMap, renderBlock } from "@/components/article/article-blocks";
import { BottomBlurOverlay } from "@/components/bottom-blur-overlay";
import { FadeInSection } from "@/components/fade-in-section";
import { Footer } from "@/components/footer";
import { ArticleToc, TocItem } from "@/components/brand-identity/article-toc";
import { RfHero } from "@/components/palitronica/hero";
import { RfFingerprint } from "@/components/palitronica/figures/rf-fingerprint";
import { InferenceFramework } from "@/components/palitronica/figures/inference-framework";
import { CovarianceDistance } from "@/components/palitronica/figures/covariance-distance";
import { CalibratedBoundary } from "@/components/palitronica/figures/calibrated-boundary";
import { CleanGap } from "@/components/palitronica/figures/clean-gap";
import { OverlapInspector } from "@/components/palitronica/figures/overlap-inspector";
import { PerSplitThresholds } from "@/components/palitronica/figures/per-split-thresholds";
import { DriftTraces } from "@/components/palitronica/figures/drift-traces";
import { DriftTracker } from "@/components/palitronica/figures/drift-tracker";
import { DriftDashboard } from "@/components/palitronica/figures/drift-dashboard";
import { experiences } from "@/data/experience";
import { readArticle } from "@/lib/article-markdown";
import "../brand-identity-mcp/article.css";
import "./article.css";

const ARTICLE_FILE = "palitronica-calibrating-and-monitoring-rf-anomaly-detection.md";
const PATH = "/blog/palitronica-rf-anomaly-detection";
const TITLE = "Building Reliable RF Anomaly Detection at Palitronica";
const DESCRIPTION =
  "Calibrating a one-class RF anomaly detector with labeled validation data, and building reproducible drift tracking around Palitronica’s electronics assurance pipeline.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: `${TITLE} | Rawsab Said`,
    description: DESCRIPTION,
    type: "article",
    url: `https://rawsab.com${PATH}`,
    images: ["/og_image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Rawsab Said`,
    description: DESCRIPTION,
    images: ["/og_image.png"],
  },
};

const FIGURES: FigureMap = {
  "figure-1": RfFingerprint,
  "figure-2": InferenceFramework,
  "figure-3": CovarianceDistance,
  "figure-4": CalibratedBoundary,
  "figure-5": CleanGap,
  "figure-6": OverlapInspector,
  "figure-7": PerSplitThresholds,
  "figure-8": DriftTraces,
  "figure-9": DriftTracker,
  "figure-10": DriftDashboard,
};

export default function PalitronicaRfArticle() {
  const article = readArticle(ARTICLE_FILE);
  const palitronica = experiences.find((experience) => experience.company === "Palitronica Inc.");
  const minutes = Math.max(1, Math.round(article.wordCount / 230));
  const toc: TocItem[] = [
    { id: "overview", text: "Overview" },
    ...article.blocks.flatMap((block) => (block.type === "heading" ? [{ id: block.id, text: block.text }] : [])),
  ];

  return (
    <div id="top" tabIndex={-1} className="bi-article flex min-h-screen flex-col text-zinc-300 outline-none">
      <main className="mx-auto w-full max-w-site flex-1 px-8 pt-8 pb-12">
        <header className="mb-4">
          <FadeInSection delay={0.05}>
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 font-mono text-xs text-zinc-500 md:justify-start">
              <Link href="/" className="bi-focusable rounded-sm transition-all duration-300 hover:text-zinc-300">
                HOME
              </Link>
              <span aria-hidden>&nbsp;›&nbsp;</span>
              <Link href="/#writing" className="bi-focusable rounded-sm transition-all duration-300 hover:text-zinc-300">
                BLOG
              </Link>
              <span aria-hidden>&nbsp;›&nbsp;</span>
              <span aria-current="page">RF ANOMALY DETECTION</span>
            </nav>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <h1 className="text-center text-2xl font-semibold tracking-tight text-balance text-white">{article.title}</h1>
            <p className="mt-2 mb-8 text-center font-mono text-[0.95rem] tracking-tighter text-zinc-500">
              WINTER 2026 · {minutes} MIN READ
            </p>
          </FadeInSection>

          <FadeInSection delay={0.12}>
            <div className="mb-8 overflow-hidden rounded-md border border-zinc-800/50 bg-zinc-900/30">
              <RfHero />
            </div>
          </FadeInSection>

          <FadeInSection delay={0.15}>
            <dl className="grid gap-6 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-10">
              {palitronica && (
                <div>
                  <dt className="mb-2 font-mono text-xs font-semibold tracking-tight text-zinc-500 uppercase">Role</dt>
                  <dd className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm leading-snug text-zinc-300">
                    {palitronica.role}
                    <span className="text-zinc-400">at</span>
                    <a
                      href={palitronica.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bi-focusable group inline-flex items-center gap-1.5 rounded-sm"
                    >
                      <Image src={palitronica.icon} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                      <span className="text-zinc-200 bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-position-[0_100%] bg-size-[0%_1px] transition-[background-size] duration-250 ease-out group-hover:bg-size-[100%_1px]">
                        Palitronica
                      </span>
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="mb-2 font-mono text-xs font-semibold tracking-tight text-zinc-500 uppercase">Overview</dt>
                <dd className="text-sm leading-relaxed text-zinc-300">
                I spent the winter at Palitronica working on Anvil's RF-based inference engine, calibrating anomaly-detection thresholds and building a monitoring system to track how RF data drifted over time.
                </dd>
              </div>
            </dl>
          </FadeInSection>
        </header>

        <ArticleToc items={toc} />

        <FadeInSection delay={0.2}>
          <article id="overview" tabIndex={-1} className="scroll-mt-20 pt-4 outline-none">
            {article.blocks.map((block, index) => renderBlock(block, index, FIGURES))}
          </article>
        </FadeInSection>

        <div className="mt-16 flex justify-center text-sm">
          <a href="#top" className="bi-focusable inline-flex items-center gap-1.5 rounded-sm text-zinc-500 transition-colors duration-300 hover:text-white">
            Back to top
            <ArrowUp className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </main>

      <FadeInSection delay={0.25}>
        <Footer />
      </FadeInSection>
      <BottomBlurOverlay />
    </div>
  );
}
