import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

import { FigureMap, renderBlock } from "@/components/article/article-blocks";
import { BottomBlurOverlay } from "@/components/bottom-blur-overlay";
import { FadeInSection } from "@/components/fade-in-section";
import { Footer } from "@/components/footer";
import { ArticleToc, TocItem } from "@/components/brand-identity/article-toc";
import { ScreenshotPipeline } from "@/components/structured-retrieval/figures/screenshot-pipeline";
import { PreprocessingCompare } from "@/components/structured-retrieval/figures/preprocessing-compare";
import { WrongScope } from "@/components/structured-retrieval/figures/wrong-scope";
import { FiveStrategies } from "@/components/structured-retrieval/figures/five-strategies";
import { RetrievalNeighborhood } from "@/components/structured-retrieval/figures/retrieval-neighborhood";
import { BenchmarkResults } from "@/components/structured-retrieval/figures/benchmark-results";
import { RetrievalArchitecture } from "@/components/structured-retrieval/figures/retrieval-architecture";
import { GroundedAnswer } from "@/components/structured-retrieval/figures/grounded-answer";
import { experiences } from "@/data/experience";
import { readArticle } from "@/lib/article-markdown";
import "../brand-identity-mcp/article.css";
import "../palitronica-rf-anomaly-detection/article.css";
import "./article.css";

const ARTICLE_FILE = "designing-retrieval-for-structured-analytics.md";
const PATH = "/blog/structured-analytics-retrieval";
const TITLE = "Rethinking Retrieval for Structured Analytics";
const DESCRIPTION =
  "How the representation of structured creator analytics changes RAG retrieval, from isolated row embeddings to multi-tier hierarchical embeddings, measured on a controlled synthetic benchmark.";

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
  "figure-1": ScreenshotPipeline,
  "figure-2": PreprocessingCompare,
  "figure-3": WrongScope,
  "figure-4": FiveStrategies,
  "figure-5": RetrievalNeighborhood,
  "figure-6": BenchmarkResults,
  "figure-7": RetrievalArchitecture,
  "figure-8": GroundedAnswer,
};

export default function StructuredAnalyticsRetrievalArticle() {
  const article = readArticle(ARTICLE_FILE);
  const node = experiences.find((experience) => experience.company === "Node App");
  const minutes = Math.max(1, Math.round(article.wordCount / 230));
  const toc: TocItem[] = [
    { id: "overview", text: "Overview" },
    ...article.blocks.flatMap((block) => (block.type === "heading" && block.level === 2 ? [{ id: block.id, text: block.text }] : [])),
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
              <span aria-current="page">STRUCTURED RETRIEVAL</span>
            </nav>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <h1 className="text-center text-2xl font-semibold tracking-tight text-balance text-white">{article.title}</h1>
            <p className="mt-2 mb-8 text-center font-mono text-[0.95rem] tracking-tighter text-zinc-500">
              SUMMER 2025 · {minutes} MIN READ
            </p>
          </FadeInSection>

          <FadeInSection delay={0.12}>
            <div className="mb-8 overflow-hidden rounded-md border border-zinc-800/50 bg-zinc-900/30">
              <video
                className="aspect-video w-full"
                src="/video/node_app.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Node logo animation"
              />
            </div>
          </FadeInSection>

          <FadeInSection delay={0.15}>
            <dl className="grid gap-6 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-10">
              {node && (
                <div>
                  <dt className="mb-2 font-mono text-xs font-semibold tracking-tight text-zinc-500 uppercase">Role</dt>
                  <dd className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm leading-snug text-zinc-300">
                    {node.role}
                    <span className="text-zinc-400">at</span>
                    <a
                      href={node.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bi-focusable group inline-flex items-center gap-1.5 rounded-sm"
                    >
                      <Image src={node.icon} alt="" width={14} height={14} className="h-3.5 w-3.5 rounded-[3px]" />
                      <span className="text-zinc-200 bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-position-[0_100%] bg-size-[0%_1px] transition-[background-size] duration-250 ease-out group-hover:bg-size-[100%_1px]">
                        {node.company}
                      </span>
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="mb-2 font-mono text-xs font-semibold tracking-tight text-zinc-500 uppercase">Overview</dt>
                <dd className="text-sm leading-relaxed text-zinc-300">
                  I spent the summer at Node App building a RAG system over structured creator analytics, then ran a controlled benchmark comparing how five embedding strategies preserve the context that retrieval depends on.
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
