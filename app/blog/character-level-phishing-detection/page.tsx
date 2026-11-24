import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

import { type FigureMap, renderBlock } from "@/components/article/article-blocks";
import { BottomBlurOverlay } from "@/components/bottom-blur-overlay";
import { ArticleToc, type TocItem } from "@/components/brand-identity/article-toc";
import { FadeInSection } from "@/components/fade-in-section";
import { Footer } from "@/components/footer";
import { CharacterModelWalkthrough } from "@/components/phishing-detection/character-model-walkthrough";
import { FlaskPredictionPath, GroupedEvaluationPlan } from "@/components/phishing-detection/evaluation-and-flask";
import { ScoreSeparation, UrlLengthCutoff } from "@/components/phishing-detection/histograms";
import { HostOverlapInspector } from "@/components/phishing-detection/host-overlap-inspector";
import { TestRoc } from "@/components/phishing-detection/test-roc";
import { ThresholdExplorer } from "@/components/phishing-detection/threshold-explorer";
import { TrainingProgress } from "@/components/phishing-detection/training-progress";
import { readArticle } from "@/lib/article-markdown";

import "../brand-identity-mcp/article.css";
import "../palitronica-rf-anomaly-detection/article.css";
import "./article.css";

const PATH = "/blog/character-level-phishing-detection";
const TITLE = "Training an NLP Model to Detect Phishing URLs";
const DESCRIPTION =
  "I revisited my character-level URL classifier to see what its original test scores and training-set host overlap could establish.";

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

const figures: FigureMap = {
  "figure-1": UrlLengthCutoff,
  "figure-2": CharacterModelWalkthrough,
  "figure-3": TrainingProgress,
  "figure-4": ScoreSeparation,
  "figure-5": ThresholdExplorer,
  "figure-6": TestRoc,
  "figure-7": HostOverlapInspector,
  "figure-8": GroupedEvaluationPlan,
  "figure-9": FlaskPredictionPath,
};

export default function PhishingDetectionArticle() {
  const article = readArticle("character-level-phishing-detection.md");
  const minutes = Math.max(1, Math.round(article.wordCount / 230));
  const toc: TocItem[] = [
    { id: "overview", text: "Overview" },
    ...article.blocks.flatMap((block) => block.type === "heading" && block.level === 2
      ? [{ id: block.id, text: block.text }]
      : []),
  ];

  return (
    <div id="top" tabIndex={-1} className="bi-article pd-article flex min-h-screen flex-col text-zinc-300 outline-none">
      <main className="mx-auto w-full max-w-site flex-1 px-8 pt-8 pb-12">
        <header className="mb-4">
          <FadeInSection delay={0.05} className="pd-entrance">
            <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 font-mono text-xs text-zinc-500 md:justify-start">
              <Link href="/" className="bi-focusable rounded-sm transition-colors hover:text-zinc-300">HOME</Link>
              <span aria-hidden>›</span>
              <Link href="/#writing" className="bi-focusable rounded-sm transition-colors hover:text-zinc-300">BLOG</Link>
              <span aria-hidden>›</span>
              <span aria-current="page">PHISHING DETECTION</span>
            </nav>
          </FadeInSection>

          <FadeInSection delay={0.1} className="pd-entrance">
            <h1 className="text-center text-2xl font-semibold tracking-tight text-balance text-white">{article.title}</h1>
            <p className="mt-2 mb-8 text-center font-mono text-[0.95rem] tracking-tighter text-zinc-500">
              <time dateTime="2024-01">JANUARY 2024</time> · {minutes} MIN READ
            </p>
          </FadeInSection>

          <FadeInSection delay={0.12} className="pd-entrance">
            <div className="mb-8 overflow-hidden rounded-md border border-zinc-800/50 bg-zinc-900/30">
              <video
                className="aspect-video w-full"
                src="/video/nlp_phishing_detector.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="PhishTank NLP Phishing Detector title animation"
              />
            </div>
          </FadeInSection>
        </header>

        <ArticleToc items={toc} />

        <FadeInSection delay={0.2} className="pd-entrance">
          <article id="overview" tabIndex={-1} className="scroll-mt-20 pt-4 outline-none">
            {article.blocks.map((block, index) => renderBlock(block, index, figures))}
          </article>
        </FadeInSection>

        <div className="mt-16 flex justify-center text-sm">
          <a href="#top" className="bi-focusable inline-flex items-center gap-1.5 rounded-sm text-zinc-500 transition-colors hover:text-white">
            Back to top <ArrowUp className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </main>

      <FadeInSection delay={0.25} className="pd-entrance">
        <Footer />
      </FadeInSection>
      <BottomBlurOverlay />
    </div>
  );
}
