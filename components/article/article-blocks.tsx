import katex from "katex";
import { ComponentType, Fragment, ReactNode } from "react";

import { SectionHeading } from "@/components/brand-identity/section-heading";
import type { ArticleBlock, InlineNode } from "@/lib/article-markdown";
import "katex/dist/katex.min.css";
import "./article-math.css";

export type FigureProps = { id: string; number: number; title: string };
export type FigureMap = Record<string, ComponentType<FigureProps>>;

function renderMath(tex: string, displayMode: boolean) {
  return katex.renderToString(tex, { displayMode, throwOnError: false, output: "htmlAndMathml" });
}

export function renderInline(nodes: InlineNode[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case "text":
        return <Fragment key={index}>{node.value}</Fragment>;
      case "code":
        return (
          <code key={index} className="rounded border border-zinc-800/50 bg-zinc-900/50 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-300">
            {node.value}
          </code>
        );
      case "math":
        return <span key={index} className="article-math-inline" dangerouslySetInnerHTML={{ __html: renderMath(node.value, false) }} />;
      case "strong":
        return (
          <strong key={index} className="font-normal text-zinc-200">
            {renderInline(node.children)}
          </strong>
        );
      case "link":
        return (
          <a
            key={index}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 underline decoration-zinc-600 underline-offset-4 transition-colors duration-200 hover:text-white hover:decoration-zinc-300"
          >
            {renderInline(node.children)}
          </a>
        );
    }
  });
}

export function renderBlock(block: ArticleBlock, index: number, figures: FigureMap) {
  switch (block.type) {
    case "heading":
      return (
        <SectionHeading key={block.id} id={block.id}>
          {block.text}
        </SectionHeading>
      );
    case "paragraph":
      return (
        <p key={index} className="mb-5 text-base leading-relaxed text-[#8F8F8F]">
          {renderInline(block.children)}
        </p>
      );
    case "list":
      return (
        <ul key={index} className="mb-5 list-disc space-y-1.5 pl-5 text-base leading-relaxed text-[#8F8F8F] marker:text-zinc-700">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "math": {
      const parts = block.tex
        .split(/\s*\\qquad\s*/)
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length === 2) {
        return (
          <div key={index} className="article-math-block article-math-pair mb-5 overflow-x-auto overflow-y-hidden py-1 text-zinc-300">
            <div className="article-math-pair-wide" dangerouslySetInnerHTML={{ __html: renderMath(block.tex, true) }} />
            <div className="article-math-pair-narrow">
              {parts.map((part, partIndex) => (
                <div key={partIndex} dangerouslySetInnerHTML={{ __html: renderMath(part, true) }} />
              ))}
            </div>
          </div>
        );
      }
      return (
        <div
          key={index}
          className="article-math-block mb-5 overflow-x-auto overflow-y-hidden py-1 text-zinc-300"
          dangerouslySetInnerHTML={{ __html: renderMath(block.tex, true) }}
        />
      );
    }
    case "code":
      return (
        <pre
          key={index}
          className="mb-6 overflow-x-auto rounded-sm border border-zinc-800/50 bg-zinc-900/50 p-4 font-mono text-[0.85rem] leading-relaxed text-[#8F8F8F]"
        >
          <code>{block.code}</code>
        </pre>
      );
    case "quote":
      return (
        <blockquote key={index} className="mb-5 border-l-2 border-zinc-800 pl-4 text-base text-[#8F8F8F]">
          {block.children.map((paragraph, i) => (
            <p key={i}>{renderInline(paragraph)}</p>
          ))}
        </blockquote>
      );
    case "figure": {
      const Figure = figures[block.key];
      if (!Figure) {
        return (
          <aside key={block.key} className="my-10 rounded-lg border border-dashed border-zinc-700 p-4 text-sm text-zinc-500">
            Editorial placeholder: Figure {block.number}, {block.title}.
          </aside>
        );
      }
      return <Figure key={block.key} id={block.key} number={block.number} title={block.title} />;
    }
  }
}
