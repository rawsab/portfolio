import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

import { FigureMap, renderBlock } from "@/components/article/article-blocks";
import { BottomBlurOverlay } from "@/components/bottom-blur-overlay";
import { FadeInSection } from "@/components/fade-in-section";
import { Footer } from "@/components/footer";
import { ArticleToc, TocItem } from "@/components/brand-identity/article-toc";
import { ReviewDemoProvider } from "@/components/brand-identity/review-demo-state";
import { McpContextFlow } from "@/components/brand-identity/figures/mcp-context-flow";
import { ToolSelectionDemo } from "@/components/brand-identity/figures/tool-selection-demo";
import { ReviewPipeline } from "@/components/brand-identity/figures/review-pipeline";
import { SegmentDebugger } from "@/components/brand-identity/figures/segment-debugger";
import { ReviewDependencies } from "@/components/brand-identity/figures/review-dependencies";
import { BrandVoiceReviewDemo } from "@/components/brand-identity/figures/brand-voice-review-demo";
import { TargetedFeedbackAnchor } from "@/components/brand-identity/figures/targeted-feedback-anchor";
import { DiscoverySemantics } from "@/components/brand-identity/figures/discovery-semantics";
import { experiences } from "@/data/experience";
import { readArticle } from "@/lib/article-markdown";
import "./article.css";

const ARTICLE_FILE = "brand-identity-mcp.md";
const PATH = "/blog/brand-identity-mcp";
const DESCRIPTION =
  "My work explored the Brand Identity side of that connection, from helping a model retrieve relevant context to building an interactive content-review prototype.";

export const metadata: Metadata = {
  title: "Bringing HubSpot Brand Context into AI Tools",
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Bringing HubSpot Brand Context into AI Tools | Rawsab Said",
    description: DESCRIPTION,
    type: "article",
    url: `https://rawsab.com${PATH}`,
    images: ["/og_image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bringing HubSpot Brand Context into AI Tools | Rawsab Said",
    description: DESCRIPTION,
    images: ["/og_image.png"],
  },
};

const FIGURES: FigureMap = {
  "figure-1": McpContextFlow,
  "figure-2": ToolSelectionDemo,
  "figure-3": ReviewPipeline,
  "figure-4": SegmentDebugger,
  "figure-5": ReviewDependencies,
  "figure-6": BrandVoiceReviewDemo,
  "figure-6-continuation": TargetedFeedbackAnchor,
  "figure-7": DiscoverySemantics,
};

export default function BrandIdentityMcpArticle() {
  const article = readArticle(ARTICLE_FILE);
  const hubspot = experiences.find((experience) => experience.company === "HubSpot");
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
              <span aria-current="page">BRAND IDENTITY &amp; MCP</span>
            </nav>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <h1 className="text-center text-2xl font-semibold tracking-tight text-balance text-white">{article.title}</h1>
            <p className="mt-2 mb-8 text-center font-mono text-[0.95rem] tracking-tighter text-zinc-500">
              SUMMER 2026 · {minutes} MIN READ
            </p>
          </FadeInSection>

          <FadeInSection delay={0.12}>
            <div className="mb-8 overflow-hidden rounded-md border border-zinc-800/50 bg-zinc-900/30">
              <video
                className="aspect-video w-full"
                src="/video/hubspot_mcp.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Demo of HubSpot brand context flowing into an AI tool over MCP"
              />
            </div>
          </FadeInSection>

          <FadeInSection delay={0.15}>
            <dl className="grid gap-6 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-10">
              {hubspot && (
                <div>
                  <dt className="mb-2 font-mono text-xs font-semibold tracking-tight text-zinc-500 uppercase">Role</dt>
                  <dd className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm leading-snug text-zinc-300">
                    {hubspot.role}
                    <span className="text-zinc-400">at</span>
                    <a
                      href={hubspot.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bi-focusable group inline-flex items-center gap-1.5 rounded-sm"
                    >
                      <Image src={hubspot.icon} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                      <span className="text-zinc-200 bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-position-[0_100%] bg-size-[0%_1px] transition-[background-size] duration-250 ease-out group-hover:bg-size-[100%_1px]">
                        {hubspot.company}
                      </span>
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="mb-2 font-mono text-xs font-semibold tracking-tight text-zinc-500 uppercase">Overview</dt>
                <dd className="text-sm leading-relaxed text-zinc-300">
                I spent this summer at HubSpot working on MCP tools that bring brand context into AI assistants and exploring problems around tool invocation, interactive review, and combining model reasoning with deterministic code.
                </dd>
              </div>
            </dl>
          </FadeInSection>
        </header>

        <ArticleToc items={toc} />

        <FadeInSection delay={0.2}>
          <ReviewDemoProvider>
            <article id="overview" tabIndex={-1} className="scroll-mt-20 pt-4 outline-none">
              {article.blocks.map((block, index) => renderBlock(block, index, FIGURES))}
            </article>
          </ReviewDemoProvider>
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
